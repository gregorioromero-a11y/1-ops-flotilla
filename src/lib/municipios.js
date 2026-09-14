// ============================================================
// MUNICIPIOS — resolución del municipio de un punto y resumen por ruta
//
// Existe para que "el municipio de la ruta" y "los municipios que conoce el
// operador" hablen del MISMO catálogo. Si el primero saliera de una columna de
// texto del Excel y el segundo de una lista escrita a mano, "Gustavo A Madero"
// y "Gustavo A. Madero" serían municipios distintos y el empate fallaría en
// silencio justo donde debería ayudar.
//
// El catálogo canónico es el GeoJSON de INEGI que ya vive en
// public/geo/municipios-inegi.json y que el mapa del Dashboard usa.
// ============================================================

const norm = (s) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\./g, " ").replace(/\s+/g, " ").trim();

// Nombres de columna donde puede venir el municipio en el archivo de ruteo.
// El archivo manda cuando lo trae: es el dato del operador logístico, y para
// una dirección en el límite entre dos municipios su criterio pesa más que un
// polígono.
const COLS_MUNICIPIO = [
  "municipio", "alcaldia", "delegacion", "municipio/alcaldia", "municipio o alcaldia",
  "ciudad", "localidad",
];

export function municipioDeFila(fila) {
  if (!fila) return null;
  for (const k of Object.keys(fila)) {
    const n = norm(k);
    if (COLS_MUNICIPIO.some(c => n === c || n.includes(c))) {
      const v = String(fila[k] ?? "").trim();
      if (v) return v;
    }
  }
  return null;
}

// ---------------- Geometría ----------------

// Ray casting sobre un anillo. Devuelve true si el punto cae dentro.
function enAnillo(lng, lat, anillo) {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const xi = anillo[i][0], yi = anillo[i][1];
    const xj = anillo[j][0], yj = anillo[j][1];
    // El punto está dentro si el rayo horizontal cruza el segmento un número
    // impar de veces. La comparación de yi/yj con lat es estricta de un lado y
    // no del otro a propósito: así un vértice exactamente a la altura del rayo
    // se cuenta una sola vez y no dos.
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

// Un polígono con huecos: dentro del anillo exterior y fuera de los interiores.
function enPoligono(lng, lat, coords) {
  if (!coords?.length || !enAnillo(lng, lat, coords[0])) return false;
  for (let i = 1; i < coords.length; i++) if (enAnillo(lng, lat, coords[i])) return false;
  return true;
}

// Precalcula la caja envolvente de cada municipio. Sin esto, ubicar un punto
// obliga a recorrer los ~500 polígonos completos; con la caja, el 99% se
// descarta con cuatro comparaciones y sólo se evalúa a fondo el puñado que
// realmente puede contenerlo.
export function indexarMunicipios(geojson) {
  const items = [];
  for (const f of geojson?.features || []) {
    const g = f.geometry;
    if (!g) continue;
    const polis = g.type === "Polygon" ? [g.coordinates]
      : g.type === "MultiPolygon" ? g.coordinates : [];
    if (!polis.length) continue;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of polis) for (const [x, y] of p[0]) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    items.push({
      nombre: f.properties?.nombre || f.properties?.NOMGEO || "(sin nombre)",
      estado: f.properties?.estado || "",
      cvegeo: f.properties?.cvegeo || "",
      polis, minX, minY, maxX, maxY,
    });
  }
  const porNombre = new Map();
  for (const it of items) porNombre.set(norm(it.nombre), it);
  return { items, porNombre, nombres: items.map(i => i.nombre).sort((a, b) => a.localeCompare(b, "es")) };
}

// Caché a nivel de módulo: el GeoJSON pesa ~1.9 MB y lo necesitan tanto
// Operadores (para el catálogo de nombres) como Asignaciones (para ubicar los
// puntos). Con esto se descarga y se indexa UNA vez por carga de página, sin
// que ninguno de los dos tenga que saber del otro.
let _indiceCache = null;
let _indicePromesa = null;
export function cargarIndiceMunicipios() {
  if (_indiceCache) return Promise.resolve(_indiceCache);
  if (_indicePromesa) return _indicePromesa;
  _indicePromesa = fetch("/geo/municipios-inegi.json")
    .then(res => {
      if (!res.ok) throw new Error("No se pudo cargar el catálogo de municipios (" + res.status + ")");
      return res.json();
    })
    .then(geo => { _indiceCache = indexarMunicipios(geo); return _indiceCache; })
    .catch(err => { _indicePromesa = null; throw err; });
  return _indicePromesa;
}

export function municipioDeCoordenada(lat, lng, indice) {
  if (!indice || !(lat && lng)) return null;
  for (const it of indice.items) {
    if (lng < it.minX || lng > it.maxX || lat < it.minY || lat > it.maxY) continue;
    for (const p of it.polis) if (enPoligono(lng, lat, p)) return it.nombre;
  }
  return null;
}

// Lleva un nombre escrito a mano al del catálogo. Devuelve null si no empata,
// en vez de inventar: un municipio mal escrito que se "corrige" a otro real es
// peor que uno que se reporta como desconocido.
export function canonizarMunicipio(nombre, indice) {
  if (!nombre || !indice) return null;
  const n = norm(nombre);
  const hit = indice.porNombre.get(n);
  if (hit) return hit.nombre;
  // "Gustavo A Madero" vs "Gustavo A. Madero" ya lo resuelve norm(); esto cubre
  // el caso de un prefijo administrativo pegado al nombre.
  const limpio = n.replace(/^(municipio|alcaldia|delegacion|mpio)\s+(de\s+)?/, "");
  const hit2 = indice.porNombre.get(limpio);
  return hit2 ? hit2.nombre : null;
}

// ---------------- Resumen por ruta ----------------

// Dado el conjunto de puntos de una ruta, devuelve el municipio dominante y el
// desglose. `resolver(punto)` decide de dónde sale el municipio de cada punto;
// se inyecta para que la ruta lenta (point-in-polygon) se pueda cachear afuera.
export function resumenMunicipios(puntos, resolver) {
  const conteo = new Map();
  let sinDato = 0;
  for (const p of puntos) {
    const m = resolver(p);
    if (!m) { sinDato++; continue; }
    conteo.set(m, (conteo.get(m) || 0) + 1);
  }
  const total = puntos.length;
  const desglose = Array.from(conteo.entries())
    .map(([municipio, n]) => ({ municipio, n, pct: total ? (100 * n) / total : 0 }))
    .sort((a, b) => b.n - a.n);
  const dom = desglose[0] || null;
  return {
    dominante: dom ? dom.municipio : null,
    pctDominante: dom ? dom.pct : 0,
    otros: Math.max(0, desglose.length - 1),
    desglose, total, sinDato,
    // Una ruta "limpia" cae casi toda en un municipio. Una repartida entre
    // varios cuesta más de operar y es señal de que el ruteo se estiró: el
    // umbral de 80% es el que separa visualmente un caso del otro.
    concentrada: !!dom && dom.pct >= 80,
  };
}

// Etiqueta corta para la columna de la tabla: "Iztapalapa 82% · +2".
export function etiquetaMunicipios(res) {
  if (!res || !res.dominante) return "—";
  const base = `${res.dominante} ${Math.round(res.pctDominante)}%`;
  return res.otros > 0 ? `${base} · +${res.otros}` : base;
}
