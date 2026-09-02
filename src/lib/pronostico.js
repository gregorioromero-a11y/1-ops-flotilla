// ============================================================
// MOTOR DE PRONÓSTICO DE CARGA Y DIMENSIONAMIENTO DE FLOTA
//
// Implementa el documento "Forecast de carga y dimensionamiento de flota —
// T1 Envíos" (FCING Q4 2026, v4). Las referencias (§n) apuntan a sus secciones.
//
//   Etapa A — Carga a entregar     §4: A0 backlog · A1 maduración+inbound ·
//                                      A2 reintentos · A3 distribución espacial
//   Etapa B — Carga a unidades     §4: B1 capacidad efectiva · B3 asignación entera
//   Etapa C — Compromiso en D−2    §4: quantil objetivo por costos
//   Backtest rolling-origin        §7
//
// La identidad que se pronostica (§1):
//   carga(d) = backlog + inbound(d−1) + inbound(d) − salidas(d−1) + reintentos(d)
//
// Al comprometer en D−2 el backlog ya está CONTADO (son paquetes en un anaquel,
// error cero). Lo único incierto son dos días de inbound y los reintentos. Este
// archivo mantiene esa separación explícita: cada término reporta su media Y su
// varianza por separado, para que la UI pueda mostrar de dónde viene la
// incertidumbre y no la mezcle con la parte observada.
//
// Todo es función pura: no toca React, ni Supabase, ni el DOM.
// ============================================================

// Única dependencia: la distancia del ruteador. Se importa en vez de copiarse
// para que la dispersión que mide el dataset y la que optimiza el ruteador
// sean literalmente la misma fórmula.
import { haversine } from "./ruteo.js";

// ============================================================
// 1. UTILIDADES
// ============================================================

// Parser de fecha tolerante. Deliberadamente SEPARADO del parseFechaFlex de
// T1OpsFlotilla.jsx: aquel deja que `new Date("2026-08-31")` resuelva como UTC
// medianoche, lo que en CDMX (UTC−6) cae el día ANTERIOR. Aquí todo se agrupa
// por día, así que un corrimiento de un día contamina la serie completa.
export function parseFecha(v) {
  if (v == null || v === "") return null;
  if (v instanceof Date) return isNaN(v) ? null : v;
  if (typeof v === "number") {
    // Serial de Excel (días desde 1899-12-30) interpretado como hora local.
    const dias = Math.floor(v);
    const frac = v - dias;
    const base = new Date(1899, 11, 30);
    base.setDate(base.getDate() + dias);
    base.setSeconds(Math.round(frac * 86400));
    return isNaN(base) ? null : base;
  }
  const s = String(v).trim();
  if (!s) return null;
  // ISO primero, forzado a hora local (ver comentario de arriba).
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3], +(iso[4] || 0), +(iso[5] || 0), +(iso[6] || 0));
    return isNaN(d) ? null : d;
  }
  // DD-MM-YYYY / DD/MM/YYYY (formato de los reportes de Claroshop).
  const m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})(?:[ T](\d{1,2})[:.](\d{2}))?/);
  if (m) {
    let [, dd, mm, yy, hh, mi] = m;
    if (yy.length === 2) yy = "20" + yy;
    const d = new Date(+yy, +mm - 1, +dd, +(hh || 0), +(mi || 0));
    return isNaN(d) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

// Día local en ISO corto (YYYY-MM-DD). Es la llave de agregación de todo el motor.
export function diaISO(v) {
  const d = v instanceof Date ? v : parseFecha(v);
  // `v instanceof Date` no garantiza que sea válida: new Date("") también lo es
  // y devolvería "NaN-NaN-NaN" como llave de día, que luego se propaga a toda
  // la serie sin explotar en ningún lado.
  if (!d || isNaN(d)) return null;
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const MS_DIA = 86400000;
const medianoche = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };

// Diferencia en días entre dos días ISO (b − a). Normaliza a medianoche local,
// así que el horario de verano no introduce ±1.
export function diffDias(aISO, bISO) {
  if (!aISO || !bISO) return null;
  return Math.round((medianoche(bISO) - medianoche(aISO)) / MS_DIA);
}

export function sumarDias(iso, n) {
  const d = medianoche(iso);
  d.setDate(d.getDate() + n);
  return diaISO(d);
}

// 0 = domingo … 6 = sábado.
export const dowDe = (iso) => medianoche(iso).getDay();

// Día como entero (días desde la época local). Sirve para comparar y desplazar
// fechas dentro de bucles calientes sin construir Date ni formatear cadenas:
// en el estimador censurado se evalúa una vez por (cohorte, rezago) y hacerlo
// con strings duplicaba el tiempo de construcción del dataset.
export const diaNum = (iso) => Math.round(medianoche(iso).getTime() / MS_DIA);

// Rango inclusivo de días ISO.
export function rangoDias(desdeISO, hastaISO) {
  const out = [];
  if (!desdeISO || !hastaISO) return out;
  let cur = desdeISO;
  let guard = 0;
  while (cur <= hastaISO && guard++ < 4000) { out.push(cur); cur = sumarDias(cur, 1); }
  return out;
}

export const num = (v) => {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return isFinite(v) ? v : 0;
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
  return isFinite(n) ? n : 0;
};

export const norm = (s) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

// ---- Estadística descriptiva ----
export function cuantil(arr, q) {
  const a = arr.filter(x => typeof x === "number" && isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return null;
  const pos = (a.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? a[lo] : a[lo] + (a[hi] - a[lo]) * (pos - lo);
}
export const mediana = (arr) => cuantil(arr, 0.5);
export const media = (arr) => {
  const a = arr.filter(x => typeof x === "number" && isFinite(x));
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
};
export function varianzaMuestral(arr) {
  const a = arr.filter(x => typeof x === "number" && isFinite(x));
  if (a.length < 2) return null;
  const mu = a.reduce((s, x) => s + x, 0) / a.length;
  return a.reduce((s, x) => s + (x - mu) ** 2, 0) / (a.length - 1);
}

// Inversa de la normal estándar (Acklam). Convierte el quantil objetivo de §4
// Etapa C en el z que se aplica sobre media y desviación de la carga.
export function zDeCuantil(p) {
  if (!(p > 0 && p < 1)) return p <= 0 ? -8 : 8;
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pl = 0.02425, ph = 1 - pl;
  let q, r;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > ph) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  q = p - 0.5; r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
         (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

// RNG determinista (mulberry32). El muestreo espacial de A3 tiene que ser
// reproducible: dos corridas del mismo plan deben dar las mismas paradas, o el
// backtest deja de ser comparable consigo mismo.
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Horas decimales desde "7:30", "7.5", "07:30:00", "7h 30m", Date o serial Excel.
export function parseHoras(v) {
  if (v == null || v === "" || v === "—") return null;
  if (v instanceof Date) return v.getHours() + v.getMinutes() / 60 + v.getSeconds() / 3600;
  if (typeof v === "number") {
    // Serial de Excel < 1 = fracción de día; si no, se toma como horas.
    return v > 0 && v < 1 ? v * 24 : (isFinite(v) ? v : null);
  }
  const s = String(v).trim();
  if (!s) return null;
  const hm = s.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/);
  if (hm) return +hm[1] + +hm[2] / 60 + (+(hm[3] || 0)) / 3600;
  const hmTexto = s.match(/(\d{1,3})\s*h\w*\s*(?:(\d{1,2})\s*m)?/i);
  if (hmTexto) return +hmTexto[1] + (+(hmTexto[2] || 0)) / 60;
  const n = parseFloat(s.replace(",", "."));
  return isFinite(n) ? n : null;
}

// ============================================================
// 2. INGESTA — detección de columnas de los tres reportes
//
// Los headers de los reportes de Claroshop llegan sucios (acentos, truncados,
// mayúsculas variables). Cada campo se busca por lista de sinónimos en orden de
// preferencia: gana el PRIMER sinónimo que empate, no el primer header. Sin ese
// orden, "Fecha de entrega" se lleva la columna de "Fecha de entrega estimada".
// ============================================================

function buscarCol(headers, sinonimos, excluir = []) {
  const hs = headers.map(h => ({ h, n: norm(h) }));
  for (const syn of sinonimos) {
    const s = norm(syn);
    const exacto = hs.find(x => x.n === s && !excluir.some(e => x.n.includes(norm(e))));
    if (exacto) return exacto.h;
  }
  for (const syn of sinonimos) {
    const s = norm(syn);
    const parcial = hs.find(x => x.n.includes(s) && !excluir.some(e => x.n.includes(norm(e))));
    if (parcial) return parcial.h;
  }
  return null;
}

function mapear(headers, dic) {
  const col = {};
  for (const [campo, def] of Object.entries(dic)) {
    col[campo] = Array.isArray(def) ? buscarCol(headers, def) : buscarCol(headers, def.syn, def.no);
  }
  return col;
}

export const DIC_CREACION = {
  tracking:   ["tracking", "no. guia", "numero de guia", "guia", "guía"],
  orden:      { syn: ["no. orden", "numero de orden", "orden"], no: ["fecha"] },
  transportista: { syn: ["transportista", "carrier", "dsp", "proveedor"], no: ["2", "secund"] },
  estatus:    { syn: ["estatus de proceso", "estatus del proceso", "estatus proceso", "estatus"], no: ["incidencia"] },
  incidencia: ["estatus incidencia", "incidencia"],
  creacion:   ["fecha de creacion", "fecha creacion", "creacion", "creación"],
  promesa:    ["fecha promesa", "promesa", "fecha compromiso"],
  entregaIni: ["fecha inicial de entrega", "fecha inicial entrega"],
  entregaFin: ["fecha final de entrega", "fecha final entrega"],
  entrega:    { syn: ["fecha de entrega", "fecha entrega"], no: ["inicial", "final", "estimad"] },
  estado:     { syn: ["estado"], no: ["estatus"] },
  municipio:  ["municipio", "alcaldia", "delegacion"],
  cp:         ["codigo postal", "código postal", "c.p.", "cp"],
  semana:     ["semana"],
  metodo:     ["metodo de entrega", "método de entrega", "metodo entrega", "tipo de vehiculo"],
};

export const DIC_PIEZAS = {
  tracking:   ["tracking", "no. guia", "numero de guia", "guia", "guía"],
  lat:        ["latitud", "latitude", "lat"],
  lng:        ["longitud", "longitude", "lng", "lon"],
  cp:         ["codigo postal", "código postal", "c.p.", "cp"],
  municipio:  ["municipio", "alcaldia", "delegacion"],
  pesoFisico: ["peso fisico", "peso físico", "peso real", "peso"],
  pesoVol:    ["peso volumetrico", "peso volumétrico", "volumetrico"],
  creacion:   ["fecha de creacion", "fecha creacion", "creacion", "creación"],
  promesa:    ["fecha promesa", "promesa"],
  movimiento: ["fecha primer movimiento", "primer movimiento", "fecha de primer movimiento"],
  primerIntento: ["fecha primer intento", "primer intento"],
  entrega:    { syn: ["fecha de entrega", "fecha entrega"], no: ["inicial", "final", "estimad"] },
  diasMov:    ["dias creacion-movimiento", "días creacion-movimiento", "dias creacion movimiento"],
  operador:   ["nombre operador", "operador", "repartidor"],
  dsp:        { syn: ["dsp", "carrier", "transportista", "proveedor"], no: ["2", "secund"] },
  idRuta:     ["id ruta", "id de ruta", "ruta id", "no. ruta"],
  metodo:     ["metodo de entrega", "método de entrega", "metodo entrega"],
  estatus:    { syn: ["estatus"], no: ["incidencia"] },
};

export const DIC_RUTAS = {
  idRuta:     ["id ruta", "id de ruta", "ruta id", "no. ruta"],
  carrier:    { syn: ["carrier", "dsp", "transportista", "proveedor"], no: ["2", "secund"] },
  operador:   ["nombre operador", "operador", "repartidor"],
  correo:     ["correo operador", "correo", "email"],
  placa:      ["placa", "placas"],
  tipoUnidad: ["tipo de unidad", "tipo unidad", "tipo de vehiculo", "vehiculo"],
  almacen:    ["almacen", "almacén", "facility"],
  status:     ["status", "estatus de la ruta", "estatus ruta"],
  checkIn:    ["check in", "check-in", "checkin", "fecha y hora de check in"],
  salida:     ["fecha y hora de salida", "hora de salida", "salida"],
  primeraParada: ["primera parada", "fecha primera parada"],
  ultimaParada:  ["ultima parada", "última parada", "fecha ultima parada"],
  checkOut:   ["check out", "check-out", "checkout", "fecha y hora de check out"],
  total:      { syn: ["total", "piezas cargadas", "cargadas"], no: ["entregad", "porcentaje"] },
  entregados: { syn: ["entregados", "piezas entregadas"], no: ["intento", "porcentaje"] },
  recolecciones: ["recolecciones", "recolectados"],
  pct:        ["porcentaje de entrega", "% de entrega", "porcentaje entrega"],
  kmEst:      ["kilometros estimados", "kilómetros estimados", "km estimados"],
  kmRec:      ["kilometros recorridos", "kilómetros recorridos", "km recorridos"],
  tiempoEst:  ["tiempo estimado"],
  tiempoReal: ["tiempo real en ruta", "tiempo real"],
  intento2:   ["entregados en intento 2"],
  intento3:   ["entregados en intento 3"],
  intento4:   ["entregados en intento 4+", "entregados en intento 4"],
};

// Motivos de excepción del reporte de rutas (§2). `reintenta` es la tasa de
// reprogramación por defecto de A2: qué fracción de esa excepción vuelve a la
// carga del día siguiente. Son SUPUESTOS a calibrar en cuanto haya historia —
// la UI los deja editar y el backtest los evalúa.
export const MOTIVOS = [
  { cod: "311", etiqueta: "Cliente ausente",     reintenta: 0.90 },
  { cod: "312", etiqueta: "Negocio cerrado",     reintenta: 0.90 },
  { cod: "313", etiqueta: "Sin acceso",          reintenta: 0.80 },
  { cod: "314", etiqueta: "Dirección errónea",   reintenta: 0.50 },
  { cod: "315", etiqueta: "No entregado",        reintenta: 0.80 },
  { cod: "316", etiqueta: "Extraviado",          reintenta: 0.00 },
  { cod: "318", etiqueta: "Rechazo del cliente", reintenta: 0.10 },
  { cod: "305", etiqueta: "Código no proporcionado", reintenta: 0.85 },
];

// Estatus que significan "sigue en almacén, no ha salido a ruta" (§2, el 71%
// que nunca salió). Se usan como SUGERENCIA inicial: la UI lista los estatus
// realmente presentes y deja marcar cuáles cuentan como backlog, porque el
// catálogo cambia entre clientes y adivinarlo en silencio corrompe A0.
const PISTAS_BACKLOG = ["creado", "generad", "almacen", "almacén", "pendiente", "por recolectar", "recolectado", "108", "en bodega", "recibido"];

export function sugerirEstatusBacklog(valores) {
  return valores.filter(v => { const n = norm(v); return PISTAS_BACKLOG.some(p => n.includes(norm(p))); });
}

// ---- Normalizadores de fila ----

export function parsearCreacion(rows) {
  const headers = Object.keys(rows[0] || {});
  const col = mapear(headers, DIC_CREACION);
  const items = rows.map(r => ({
    tracking: String(r[col.tracking] ?? "").trim(),
    orden: col.orden ? String(r[col.orden] ?? "").trim() : "",
    transportista: col.transportista ? String(r[col.transportista] ?? "").trim() : "",
    estatus: col.estatus ? String(r[col.estatus] ?? "").trim() : "",
    incidencia: col.incidencia ? String(r[col.incidencia] ?? "").trim() : "",
    creacion: diaISO(r[col.creacion]),
    promesa: diaISO(r[col.promesa]),
    entrega: diaISO(r[col.entrega]),
    entregaIni: col.entregaIni ? diaISO(r[col.entregaIni]) : null,
    entregaFin: col.entregaFin ? diaISO(r[col.entregaFin]) : null,
    municipio: col.municipio ? String(r[col.municipio] ?? "").trim() : "",
    cp: col.cp ? String(r[col.cp] ?? "").trim() : "",
    metodo: col.metodo ? String(r[col.metodo] ?? "").trim() : "",
  })).filter(x => x.creacion);
  return { items, col, headers };
}

export function parsearPiezas(rows) {
  const headers = Object.keys(rows[0] || {});
  const col = mapear(headers, DIC_PIEZAS);
  const items = rows.map(r => {
    const lat = col.lat ? parseFloat(String(r[col.lat]).replace(",", ".")) : NaN;
    const lng = col.lng ? parseFloat(String(r[col.lng]).replace(",", ".")) : NaN;
    return {
      tracking: String(r[col.tracking] ?? "").trim(),
      lat: isFinite(lat) ? lat : null,
      lng: isFinite(lng) ? lng : null,
      cp: col.cp ? String(r[col.cp] ?? "").trim() : "",
      municipio: col.municipio ? String(r[col.municipio] ?? "").trim() : "",
      peso: col.pesoFisico ? num(r[col.pesoFisico]) : 0,
      creacion: diaISO(r[col.creacion]),
      promesa: col.promesa ? diaISO(r[col.promesa]) : null,
      movimiento: col.movimiento ? diaISO(r[col.movimiento]) : null,
      primerIntento: col.primerIntento ? diaISO(r[col.primerIntento]) : null,
      entrega: col.entrega ? diaISO(r[col.entrega]) : null,
      operador: col.operador ? String(r[col.operador] ?? "").trim() : "",
      dsp: col.dsp ? String(r[col.dsp] ?? "").trim() : "",
      idRuta: col.idRuta ? String(r[col.idRuta] ?? "").trim() : "",
      metodo: col.metodo ? String(r[col.metodo] ?? "").trim() : "",
    };
  }).filter(x => x.creacion || x.movimiento);
  return { items, col, headers };
}

export function parsearRutas(rows) {
  const headers = Object.keys(rows[0] || {});
  const col = mapear(headers, DIC_RUTAS);
  const colMotivo = {};
  for (const m of MOTIVOS) colMotivo[m.cod] = headers.find(h => h.includes(m.cod)) || null;
  const items = rows.map((r, i) => {
    const total = num(r[col.total]);
    const entregados = num(r[col.entregados]);
    const motivos = {};
    let excepciones = 0;
    for (const m of MOTIVOS) {
      const v = colMotivo[m.cod] ? num(r[colMotivo[m.cod]]) : 0;
      motivos[m.cod] = v; excepciones += v;
    }
    const salida = col.salida ? parseFecha(r[col.salida]) : null;
    const checkIn = col.checkIn ? parseFecha(r[col.checkIn]) : null;
    const checkOut = col.checkOut ? parseFecha(r[col.checkOut]) : null;
    const pP = col.primeraParada ? parseFecha(r[col.primeraParada]) : null;
    const uP = col.ultimaParada ? parseFecha(r[col.ultimaParada]) : null;
    // Horas EN RUTA: de la primera a la última parada. Es la ventana en la que
    // el minuto por entrega es un dato real; check-in→check-out incluye carga en
    // andén y regreso, y usarla infla el techo de jornada (§2: 10.4 h vs 7.5 h).
    let horasRuta = pP && uP ? (uP - pP) / 3600000 : null;
    if (horasRuta == null || horasRuta <= 0) horasRuta = parseHoras(col.tiempoReal ? r[col.tiempoReal] : null);
    if ((horasRuta == null || horasRuta <= 0) && checkIn && checkOut) horasRuta = (checkOut - checkIn) / 3600000;
    let horasCheck = checkIn && checkOut ? (checkOut - checkIn) / 3600000 : null;
    if (horasRuta != null && (horasRuta <= 0 || horasRuta > 24)) horasRuta = null;
    if (horasCheck != null && (horasCheck <= 0 || horasCheck > 24)) horasCheck = null;
    return {
      idRuta: String(r[col.idRuta] ?? `R-${i}`).trim(),
      carrier: (col.carrier ? String(r[col.carrier] ?? "").trim() : "") || "—",
      operador: (col.operador ? String(r[col.operador] ?? "").trim() : "") || "Sin nombre",
      placa: col.placa ? String(r[col.placa] ?? "").trim() : "",
      tipoUnidad: col.tipoUnidad ? String(r[col.tipoUnidad] ?? "").trim() : "",
      status: col.status ? String(r[col.status] ?? "").trim() : "",
      dia: diaISO(salida || pP || checkIn),
      salida, checkIn, checkOut,
      horasRuta, horasCheck,
      total, entregados,
      recolecciones: num(r[col.recolecciones]),
      pct: num(r[col.pct]),
      motivos, excepciones,
      // §2: piezas cargadas que no aparecen ni como entrega ni como excepción.
      // Es el hallazgo del Bloque 0 y hay que resolverlo ANTES de modelar.
      sinRegistro: Math.max(0, total - entregados - excepciones),
      intentos: {
        i2: num(r[col.intento2]), i3: num(r[col.intento3]), i4: num(r[col.intento4]),
      },
      kmEst: num(r[col.kmEst]), kmRec: num(r[col.kmRec]),
    };
  }).filter(x => x.dia);
  return { items, col, headers, colMotivo };
}

// Filas de la tabla `rutas` de Supabase → misma forma que parsearRutas().
// Permite arrancar el módulo con lo que ya está cargado, sin pedir el Excel.
export function rutasDesdeSupabase(rows) {
  return (rows || []).map((r, i) => {
    const salida = parseFecha(r.fecha_salida || r.fecha_registro);
    const total = num(r.total), entregados = num(r.entregados);
    // La tabla guarda `intentados` (suma de excepciones), no el desglose.
    const excepciones = num(r.intentados);
    const motivos = {}; for (const m of MOTIVOS) motivos[m.cod] = 0;
    return {
      idRuta: r.id_ruta || `R-${i}`, carrier: r.carrier || "—", operador: r.operador || "Sin nombre",
      placa: r.placa || "", tipoUnidad: r.tipo_unidad || "", status: r.status || "",
      dia: diaISO(salida), salida, checkIn: null, checkOut: null,
      horasRuta: parseHoras(r.tiempo_real), horasCheck: null,
      total, entregados, recolecciones: num(r.recolecciones), pct: num(r.pct_entrega),
      motivos, excepciones,
      sinRegistro: Math.max(0, total - entregados - excepciones),
      intentos: { i2: num(r.intercambios), i3: 0, i4: 0 },
      kmEst: num(r.km_estimados), kmRec: num(r.km_recorridos),
      motivosDesglosados: false,
    };
  }).filter(x => x.dia);
}

// Filas de `flotilla_ordenes` → misma forma que parsearCreacion().
export function creacionDesdeSupabase(rows) {
  return (rows || []).map(r => ({
    tracking: r.tracking || "",
    orden: r.no_orden || "",
    transportista: r.transportista || "",
    estatus: r.estatus || "",
    incidencia: r.estatus_incidencia || "",
    creacion: diaISO(r.fecha_creacion),
    promesa: diaISO(r.fecha_promesa),
    entrega: diaISO(r.fecha_entrega),
    entregaIni: null, entregaFin: null,
    municipio: r.municipio || "", cp: r.cp || "", metodo: "",
  })).filter(x => x.creacion);
}

// ============================================================
// 2b. COVARIATES CONOCIDOS A FUTURO (§5.D)
//
// Calendario mexicano, quincenas y las campañas comerciales con fecha exacta.
// Son el único insumo del modelo que se conoce con certeza para cualquier día
// futuro, así que entran como regresores duros y no como algo a estimar.
//
// Importan por dos razones distintas y opuestas:
//   · un festivo NO es un día flojo cualquiera: no hay operación, y promediarlo
//     dentro del nivel de su día de semana arrastra la línea base hacia abajo
//     para todos los martes del año;
//   · Buen Fin y Hot Sale mueven el inbound en múltiplos, no en puntos
//     porcentuales, y caen en fecha distinta cada año — un modelo que sólo mira
//     el día de semana no puede verlos venir.
// ============================================================

// Domingo de Pascua (Meeus/Jones/Butcher, calendario gregoriano). Ancla Jueves
// y Viernes Santo, que operativamente son días muertos aunque no sean feriados
// de ley.
export function pascua(anio) {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100;
  const d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return diaISO(new Date(anio, mes - 1, dia));
}

// n-ésimo `dow` del mes (n = 1 es el primero). Con n = -1 devuelve el último.
function nEsimoDow(anio, mes, dow, n) {
  if (n > 0) {
    const primero = new Date(anio, mes - 1, 1);
    const delta = (dow - primero.getDay() + 7) % 7;
    return diaISO(new Date(anio, mes - 1, 1 + delta + (n - 1) * 7));
  }
  const ultimo = new Date(anio, mes, 0);
  const delta = (ultimo.getDay() - dow + 7) % 7;
  return diaISO(new Date(anio, mes, 0 - delta));
}

// Feriados de la Ley Federal del Trabajo art. 74. Los "lunes de descanso"
// (5 feb, 21 mar, 20 nov) se corren al lunes que marca la ley, no a la fecha
// nominal: usar la nominal desalinea el efecto operativo en cuatro de cada
// cinco años.
export function feriadosLFT(anio) {
  const f = {
    [`${anio}-01-01`]: "Año Nuevo",
    [nEsimoDow(anio, 2, 1, 1)]: "Día de la Constitución",
    [nEsimoDow(anio, 3, 1, 3)]: "Natalicio de Benito Juárez",
    [`${anio}-05-01`]: "Día del Trabajo",
    [`${anio}-09-16`]: "Independencia",
    [nEsimoDow(anio, 11, 1, 3)]: "Revolución Mexicana",
    [`${anio}-12-25`]: "Navidad",
  };
  // Transmisión del Poder Ejecutivo: 1 de octubre cada seis años desde 2024.
  if ((anio - 2024) % 6 === 0 && anio >= 2024) f[`${anio}-10-01`] = "Transmisión del Poder Ejecutivo";
  const p = pascua(anio);
  f[sumarDias(p, -3)] = "Jueves Santo";
  f[sumarDias(p, -2)] = "Viernes Santo";
  return f;
}

// Campañas con fecha calculada. Las reglas de Buen Fin y Hot Sale las fija cada
// año la ANTAD/AMVO y se han movido: aquí van las reglas vigentes y el resultado
// queda EDITABLE en la UI. Es preferible una fecha calculada y corregible a una
// tabla hardcodeada que caduca en silencio.
export function eventosComerciales(anio) {
  const ev = [];
  const rango = (desde, hasta, nombre, tipo) => ev.push({ desde, hasta, nombre, tipo });
  rango(`${anio}-01-02`, `${anio}-01-06`, "Reyes", "pico");
  rango(`${anio}-02-13`, `${anio}-02-14`, "San Valentín", "pico");
  rango(`${anio}-05-05`, `${anio}-05-10`, "10 de mayo", "pico");
  // Hot Sale: arranca el último lunes de mayo y dura ~9 días.
  const hs = nEsimoDow(anio, 5, 1, -1);
  rango(hs, sumarDias(hs, 8), "Hot Sale", "campaña");
  // Buen Fin: del viernes previo al tercer lunes de noviembre hasta ese lunes.
  const revolucion = nEsimoDow(anio, 11, 1, 3);
  rango(sumarDias(revolucion, -3), revolucion, "Buen Fin", "campaña");
  // Black Friday: el viernes siguiente al cuarto jueves de noviembre.
  rango(sumarDias(nEsimoDow(anio, 11, 4, 4), 1), sumarDias(nEsimoDow(anio, 11, 4, 4), 1), "Black Friday", "campaña");
  rango(`${anio}-12-10`, `${anio}-12-24`, "Navidad", "pico");
  return ev;
}

const cacheCal = new Map();
const cacheDia = new Map();
export function calendarioMX(iso, { eventosExtra = [] } = {}) {
  if (!iso) return null;
  // Memo por día. El dataset evalúa el mismo día una vez por cada fila cuya
  // ventana lo toca —decenas de veces— y el objeto es inmutable.
  const usaCache = !eventosExtra.length;
  if (usaCache) { const hit = cacheDia.get(iso); if (hit) return hit; }
  const anio = +iso.slice(0, 4);
  if (!cacheCal.has(anio)) cacheCal.set(anio, { feriados: feriadosLFT(anio), eventos: eventosComerciales(anio) });
  const { feriados, eventos } = cacheCal.get(anio);
  const dow = dowDe(iso);
  const d = medianoche(iso);
  const ultimoDelMes = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const activos = [...eventos, ...eventosExtra].filter(e => iso >= e.desde && iso <= e.hasta).map(e => e.nombre);
  const esFeriado = !!feriados[iso];
  const res = {
    dia: iso, dow, esFeriado, feriado: feriados[iso] || null,
    esFinDeSemana: dow === 0 || dow === 6,
    // La quincena mueve el consumo y por tanto el inbound de los días siguientes.
    esQuincena: d.getDate() === 15 || d.getDate() === ultimoDelMes,
    eventos: activos,
    habil: !esFeriado && dow !== 0,
    // "Normal" = sirve para fijar el nivel base de su día de semana. Un feriado
    // o un día de campaña no lo es, y meterlo al promedio contamina el resto.
    normal: !esFeriado && activos.length === 0,
  };
  if (usaCache) cacheDia.set(iso, res);
  return res;
}

// ============================================================
// 3. DIAGNÓSTICO — Bloque 0 y §6 "Lo que rompe el modelo"
// ============================================================

// Una parada = una dirección única. §6: si se cuentan guías en vez de
// direcciones, la simulación inventa paradas y sobredimensiona. Factor medido
// en los datos actuales: 1.14 piezas por parada.
export function colapsarParadas(piezas) {
  const m = new Map();
  for (const p of piezas) {
    if (p.lat == null || p.lng == null) continue;
    const k = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
    if (!m.has(k)) m.set(k, { lat: p.lat, lng: p.lng, cp: p.cp, municipio: p.municipio, piezas: 0, dias: new Set() });
    const e = m.get(k);
    e.piezas++;
    if (p.movimiento) e.dias.add(p.movimiento);
  }
  return Array.from(m.values());
}

export function diagnosticar({ creacion = [], piezas = [], rutas = [], estatusBacklog = [] }) {
  const d = { creacion: null, piezas: null, rutas: null, bloqueantes: [] };
  const setBacklog = new Set(estatusBacklog.map(norm));

  if (creacion.length) {
    const dias = [...new Set(creacion.map(x => x.creacion))].sort();
    const enBacklog = creacion.filter(x => !x.entrega && setBacklog.has(norm(x.estatus)));
    const estatusUnicos = {};
    for (const x of creacion) { const k = x.estatus || "(vacío)"; estatusUnicos[k] = (estatusUnicos[k] || 0) + 1; }
    d.creacion = {
      ordenes: creacion.length,
      dias: dias.length, desde: dias[0], hasta: dias[dias.length - 1],
      backlog: enBacklog.length,
      pctBacklog: creacion.length ? 100 * enBacklog.length / creacion.length : 0,
      estatusUnicos: Object.entries(estatusUnicos).sort((a, b) => b[1] - a[1]),
      municipios: new Set(creacion.map(x => x.municipio).filter(Boolean)).size,
      cps: new Set(creacion.map(x => x.cp).filter(Boolean)).size,
    };
  }

  if (piezas.length) {
    const conGeo = piezas.filter(p => p.lat != null && p.lng != null);
    const paradas = colapsarParadas(piezas);
    const lags = piezas.filter(p => p.creacion && p.movimiento).map(p => diffDias(p.creacion, p.movimiento)).filter(k => k != null && k >= 0);
    const diasMov = [...new Set(piezas.map(p => p.movimiento).filter(Boolean))].sort();
    d.piezas = {
      total: piezas.length,
      conGeo: conGeo.length,
      pctGeo: piezas.length ? 100 * conGeo.length / piezas.length : 0,
      paradas: paradas.length,
      piezasPorParada: paradas.length ? conGeo.length / paradas.length : 0,
      lagMediana: mediana(lags), lagMedia: media(lags), lagMax: lags.length ? Math.max(...lags) : null,
      conMovimiento: piezas.filter(p => p.movimiento).length,
      diasMovimiento: diasMov.length, movDesde: diasMov[0], movHasta: diasMov[diasMov.length - 1],
      cps: new Set(piezas.map(p => p.cp).filter(Boolean)).size,
      municipios: new Set(piezas.map(p => p.municipio).filter(Boolean)).size,
      conIdRuta: piezas.filter(p => p.idRuta).length,
      operadores: new Set(piezas.map(p => norm(p.operador)).filter(Boolean)).size,
    };
  }

  if (rutas.length) {
    const dias = [...new Set(rutas.map(r => r.dia))].sort();
    // El minuto por entrega sólo tiene sentido donde hubo entregas Y una ventana
    // de ruta medible. Las rutas sin una u otra se excluyen del estimador, no se
    // cuentan como cero (eso sesgaría la mediana hacia abajo).
    const minPorEntrega = rutas
      .filter(r => r.entregados > 0 && r.horasRuta > 0)
      .map(r => (r.horasRuta * 60) / r.entregados);
    const horas = rutas.map(r => r.horasRuta).filter(h => h > 0);
    const horasCheck = rutas.map(r => r.horasCheck).filter(h => h > 0);
    const completadas = rutas.filter(r => /complet|final|cerrad/i.test(r.status) || r.status === "");
    const base = completadas.length ? completadas : rutas;
    const cargadas = base.reduce((s, r) => s + r.total, 0);
    const entregadas = base.reduce((s, r) => s + r.entregados, 0);
    const excepciones = base.reduce((s, r) => s + r.excepciones, 0);
    const sinRegistro = Math.max(0, cargadas - entregadas - excepciones);
    const motTot = {};
    for (const m of MOTIVOS) motTot[m.cod] = rutas.reduce((s, r) => s + (r.motivos[m.cod] || 0), 0);
    const i2 = rutas.reduce((s, r) => s + r.intentos.i2, 0);
    const i3 = rutas.reduce((s, r) => s + r.intentos.i3, 0);
    const i4 = rutas.reduce((s, r) => s + r.intentos.i4, 0);
    const medMin = mediana(minPorEntrega);
    const medHoras = mediana(horas);
    d.rutas = {
      rutas: rutas.length, dias: dias.length, desde: dias[0], hasta: dias[dias.length - 1],
      dsps: [...new Set(rutas.map(r => r.carrier))].filter(x => x && x !== "—"),
      operadores: new Set(rutas.map(r => norm(r.operador))).size,
      conTipoUnidad: rutas.filter(r => r.tipoUnidad).length,
      minPorEntrega: medMin, minP25: cuantil(minPorEntrega, 0.25), minP75: cuantil(minPorEntrega, 0.75),
      horasRuta: medHoras, horasCheck: mediana(horasCheck),
      // Techo implícito de jornada (§2): cuántas entregas caben en la ventana
      // observada al ritmo observado. Es la restricción que hoy ata, no el conteo.
      techoJornada: medMin > 0 && medHoras > 0 ? Math.floor((medHoras * 60) / medMin) : null,
      cargadasMediana: mediana(rutas.map(r => r.total)),
      entregadasMediana: mediana(rutas.map(r => r.entregados)),
      pctMediana: mediana(rutas.map(r => r.pct).filter(x => x > 0)),
      cargadas, entregadas, excepciones, sinRegistro,
      pctSinRegistro: cargadas ? 100 * sinRegistro / cargadas : 0,
      motivos: motTot,
      curvaIntentos: { i1: entregadas - i2 - i3 - i4, i2, i3, i4 },
      recolecciones: rutas.reduce((s, r) => s + r.recolecciones, 0),
      kmRecorridos: rutas.reduce((s, r) => s + r.kmRec, 0),
      kmEstimados: rutas.reduce((s, r) => s + r.kmEst, 0),
      motivosDesglosados: rutas.some(r => r.motivosDesglosados !== false),
    };
  }

  // Cobertura del puente pieza → ruta. §5.B: hoy el único join es el nombre del
  // operador en texto libre y empata 14 de 25.
  if (piezas.length && rutas.length) {
    const opsRutas = new Set(rutas.map(r => norm(r.operador)).filter(x => x && x !== "sin nombre"));
    const opsPiezas = [...new Set(piezas.map(p => norm(p.operador)).filter(Boolean))];
    const empatan = opsPiezas.filter(o => opsRutas.has(o));
    d.join = {
      porIdRuta: piezas.filter(p => p.idRuta).length,
      opsPiezas: opsPiezas.length, opsRutas: opsRutas.size, empatan: empatan.length,
      pct: opsPiezas.length ? 100 * empatan.length / opsPiezas.length : 0,
    };
  }

  // Bloqueantes de §5, evaluados contra lo que REALMENTE se cargó.
  const B = (sev, hueco, estado, impacto) => d.bloqueantes.push({ sev, hueco, estado, impacto });
  if (!creacion.length) B("P0", "Reporte de creación", "No cargado", "Sin él no hay backlog (A0) ni inbound (A1)");
  if (!piezas.length) B("P0", "Reporte de piezas operadas", "No cargado", "Sin él no hay curva de maduración ni geografía");
  if (!rutas.length) B("P0", "Reporte de rutas / cargas por operador", "No cargado", "Sin él no hay curva de capacidad (B1)");
  if (d.rutas && !d.rutas.conTipoUnidad) B("P0", "Tipo de unidad por ruta", "El campo no existe", "Es el corazón de B1: la capacidad se estima por tipo");
  if (d.rutas && d.rutas.dias < 90) B("P0", "Historia", `${d.rutas.dias} día(s) de rutas`, "Sin ~12 meses no hay estacionalidad, Buen Fin ni quincenas");
  if (d.join && d.join.porIdRuta === 0) B("P0", "Llave pieza → ruta", `Join por nombre: ${d.join.pct.toFixed(0)}% de cobertura`, "Sin ella no se une demanda con ejecución");
  if (d.rutas && d.rutas.pctSinRegistro > 2) B("P0", "Piezas cargadas sin registro", `${d.rutas.pctSinRegistro.toFixed(1)}% (${d.rutas.sinRegistro} piezas)`, "Bloque 0: ¿sobrecarga de ruta o subregistro? Decide antes de modelar");
  if (d.rutas && d.rutas.kmRecorridos === 0 && d.rutas.rutas > 0) B("P1", "Kilómetros recorridos", "0 km en todas las rutas", "Campo muerto: no se mide desviación plan vs ejecución");
  if (d.rutas && !d.rutas.motivosDesglosados) B("P1", "Motivos de excepción desglosados", "Sólo el agregado", "A2 no puede ponderar reintentos por motivo");
  return d;
}

// ============================================================
// 4. ETAPA A — CARGA A ENTREGAR
// ============================================================

// ---- A1 · Curva de maduración (creación → salida a ruta) ----
//
// Estimador de riesgo discreto tipo Kaplan-Meier. Para cada rezago k:
//   h(k) = salieron exactamente en k / seguían en almacén al llegar a k
//   S(k) = Π_{j<k} (1 − h(j))          (probabilidad de seguir sin salir)
//
// La censura importa: una orden creada ayer y que aún no sale NO es evidencia de
// que no vaya a salir; sólo aporta al denominador de los rezagos que alcanzó a
// vivir. Ignorarla (contarla como "nunca salió") es exactamente el error de
// point-in-time de §6 y hace que el modelo aprenda una caída que luego proyecta.
// Días en los que la capacidad ató: se cargó más de lo que se alcanzó a tocar.
// §6 lo llama lo primero que rompe el modelo — "el histórico sólo contiene los
// días que se pudieron operar con la flota que hubo. Si en un pico había 10
// motos, el registro dice 10 aunque se necesitaran 14".
//
// `umbralPct` es la fracción de rutas del día que tienen que venir saturadas
// para declarar el día censurado. Una sola ruta con un hueco es ruido; la mitad
// de la flota sin cerrar es racionamiento.
// `rebote` extiende el marcado a los días SIGUIENTES a uno saturado. No es un
// margen de seguridad arbitrario: lo que no salió el día racionado sale al día
// siguiente, así que ese día tiene salidas que no le corresponden. Se ve normal
// —cerró todo lo que cargó— pero su riesgo está inflado con demanda diferida.
// Medido sobre datos con racionamiento sintético: descartar sólo el día
// saturado corrige h(1) pero deja h(2) sobreestimada; descartar también el
// rebote corrige ambos. Un día es el valor por defecto porque el arrastre
// observado se absorbe en una jornada; con backlog crónico convendría subirlo.
export function diasSaturados(rutas, { umbralPct = 25, rebote = 1 } = {}) {
  const porDia = new Map();
  for (const r of rutas) {
    if (!r.dia) continue;
    if (!porDia.has(r.dia)) porDia.set(r.dia, { rutas: 0, saturadas: 0, sinRegistro: 0, cargadas: 0 });
    const e = porDia.get(r.dia);
    e.rutas++; e.cargadas += r.total; e.sinRegistro += r.sinRegistro;
    if (r.sinRegistro > 0 || (r.total > 0 && r.entregados + r.excepciones < r.total)) e.saturadas++;
  }
  const set = new Set(); const detalle = [];
  for (const [dia, e] of porDia) {
    const pct = e.rutas ? 100 * e.saturadas / e.rutas : 0;
    const sat = pct >= umbralPct;
    if (sat) set.add(dia);
    detalle.push({ dia, ...e, pctSaturadas: pct, saturado: sat });
  }
  detalle.sort((a, b) => a.dia.localeCompare(b.dia));
  const conRebote = new Set(set);
  for (const d of set) for (let i = 1; i <= rebote; i++) conRebote.add(sumarDias(d, i));
  for (const e of detalle) e.rebote = !e.saturado && conRebote.has(e.dia);
  return {
    set, conRebote, detalle, rebote,
    dias: set.size, diasConRebote: conRebote.size, total: porDia.size,
    pct: porDia.size ? 100 * set.size / porDia.size : 0,
  };
}

// `saturados` (Set de días) hace que el estimador IGNORE los días en que la
// capacidad ató, tanto en el numerador como en el denominador. La razón: en un
// día racionado, una orden que no salió no es evidencia de que no quisiera
// salir — es evidencia de que no hubo camión. Contarla como "sobrevivió" baja el
// riesgo artificialmente, y el modelo aprende que la mercancía tarda más de lo
// que tarda, justo en los días de pico donde importa.
//
// Con esto la curva estima DEMANDA (qué habría salido con flota suficiente) y no
// THROUGHPUT (qué salió con la flota que hubo). Dimensionar contra throughput es
// circular: pides la flota que ya tenías.
export function curvaMaduracion(items, corteISO, opts = {}) {
  const { kMax = 30, saturados = null, minObservacionesCensura = 200 } = opts;
  if (saturados && saturados.size) {
    const cens = curvaMaduracionCensurada(items, corteISO, kMax, saturados);
    // Guarda contra el caso degenerado, que NO es hipotético: en los reportes
    // actuales el 98% de los días viene marcado como saturado. Descartarlos
    // todos deja la curva sin una sola observación y devuelve riesgo cero, que
    // se propaga como "nada va a salir nunca" — un fallo peor que el sesgo que
    // se quería corregir. Si no sobrevive suficiente evidencia, se devuelve la
    // curva sin corregir Y se dice, para que nadie lea el número como limpio.
    const vivas = cens.enRiesgo[0] || 0;
    if (vivas >= minObservacionesCensura && cens.h.some(x => x > 0)) return cens;
    const cruda = curvaMaduracion(items, corteISO, { kMax });
    return {
      ...cruda, corregidaPorCensura: false, descartadasPorSaturacion: 0,
      censuraOmitida: {
        motivo: vivas < minObservacionesCensura
          ? `Sólo ${vivas} órdenes sobreviven al descartar los días saturados (mínimo ${minObservacionesCensura}). La curva va SIN corregir y por tanto subestima el riesgo en los días de pico.`
          : "Descartar los días saturados dejó la curva en riesgo cero; se usa la versión sin corregir.",
        diasSaturados: saturados.size, sobrevivientes: vivas,
      },
    };
  }
  // El conjunto en riesgo se acumula con un arreglo de diferencias: cada orden
  // aporta +1 al rango [0, k] con dos escrituras en vez de k. Sin esto,
  // construir el dataset de §9 —que reestima la curva una vez por día— es
  // cuadrático en el rezago y tarda minutos en 12 meses de historia.
  const delta = new Array(kMax + 2).fill(0);
  const salieron = new Array(kMax + 1).fill(0);
  let n = 0, censuradas = 0;
  for (const it of items) {
    if (!it.creacion || it.creacion > corteISO) continue;
    const kCens = diffDias(it.creacion, corteISO);
    if (kCens == null || kCens < 0) continue;
    n++;
    const kSal = it.salida ? diffDias(it.creacion, it.salida) : null;
    const salio = kSal != null && kSal >= 0 && it.salida <= corteISO;
    const k = Math.min(salio ? kSal : kCens, kMax);
    delta[0]++; delta[k + 1]--;
    if (salio) salieron[k]++; else censuradas++;
  }
  const enRiesgo = new Array(kMax + 1).fill(0);
  let acum = 0;
  for (let k = 0; k <= kMax; k++) { acum += delta[k]; enRiesgo[k] = acum; }
  const h = new Array(kMax + 1).fill(0);
  for (let k = 0; k <= kMax; k++) h[k] = enRiesgo[k] > 0 ? salieron[k] / enRiesgo[k] : 0;
  const S = new Array(kMax + 2).fill(1);
  for (let k = 0; k <= kMax; k++) S[k + 1] = S[k] * (1 - h[k]);
  // Mediana de maduración: primer k con S(k+1) ≤ 0.5.
  let medianaK = null;
  for (let k = 0; k <= kMax; k++) if (S[k + 1] <= 0.5) { medianaK = k; break; }
  return {
    h, S, kMax, n, censuradas, enRiesgo, salieron, medianaK, observaciones: n - censuradas,
    // Forma estable: quien consuma la curva no debería tener que saber si vino
    // de la rama corregida o de la cruda para leer un campo.
    corregidaPorCensura: false, descartadasPorSaturacion: 0, censuraOmitida: null,
  };
}

// Variante que descarta los días saturados. No puede usar el arreglo de
// diferencias global porque cada rezago k cae en un día distinto según la fecha
// de creación, así que se acumula por cohorte (día de creación) y sólo entonces
// se decide si ese (cohorte, rezago) cae en un día operable. Son ~120 cohortes ×
// 30 rezagos por corte: barato, y es la única forma de que el filtro sea por DÍA
// y no por rezago.
function curvaMaduracionCensurada(items, corteISO, kMax, saturados) {
  const cohortes = new Map();
  let n = 0, censuradas = 0, descartadas = 0;
  for (const it of items) {
    if (!it.creacion || it.creacion > corteISO) continue;
    const kCens = diffDias(it.creacion, corteISO);
    if (kCens == null || kCens < 0) continue;
    n++;
    const kSal = it.salida ? diffDias(it.creacion, it.salida) : null;
    const salio = kSal != null && kSal >= 0 && it.salida <= corteISO;
    const k = Math.min(salio ? kSal : kCens, kMax);
    if (!cohortes.has(it.creacion)) cohortes.set(it.creacion, { delta: new Array(kMax + 2).fill(0), sal: new Array(kMax + 1).fill(0) });
    const c = cohortes.get(it.creacion);
    c.delta[0]++; c.delta[k + 1]--;
    if (salio) c.sal[k]++; else censuradas++;
  }
  const enRiesgo = new Array(kMax + 1).fill(0);
  const salieron = new Array(kMax + 1).fill(0);
  // Los días saturados se pasan a enteros una sola vez: dentro del doble bucle
  // sólo hay sumas y lookups, sin construir fechas.
  const satNum = new Set();
  for (const d of saturados) satNum.add(diaNum(d));
  for (const [creacionDia, c] of cohortes) {
    const base = diaNum(creacionDia);
    let acum = 0;
    for (let k = 0; k <= kMax; k++) {
      acum += c.delta[k];
      // El rezago k de esta cohorte ocurre el día creacionDia + k. Si ese día
      // estuvo racionado, no aporta información de riesgo en ningún sentido.
      if (satNum.has(base + k)) { descartadas += c.sal[k]; continue; }
      enRiesgo[k] += acum;
      salieron[k] += c.sal[k];
    }
  }
  const h = new Array(kMax + 1).fill(0);
  for (let k = 0; k <= kMax; k++) h[k] = enRiesgo[k] > 0 ? salieron[k] / enRiesgo[k] : 0;
  const S = new Array(kMax + 2).fill(1);
  for (let k = 0; k <= kMax; k++) S[k + 1] = S[k] * (1 - h[k]);
  let medianaK = null;
  for (let k = 0; k <= kMax; k++) if (S[k + 1] <= 0.5) { medianaK = k; break; }
  return {
    h, S, kMax, n, censuradas, enRiesgo, salieron, medianaK,
    observaciones: n - censuradas, descartadasPorSaturacion: descartadas,
    corregidaPorCensura: true, censuraOmitida: null,
  };
}

// P(sale exactamente dentro de `t` días | creada hace `a` días y SIGUE en
// almacén al cierre del corte). Es riesgo CONDICIONAL: la orden ya sobrevivió
// los rezagos 0…a, así que el producto de supervivencia arranca en a+1.
// Incluir (1−h[a]) volvería a descontar un riesgo que ya sabemos que no ocurrió
// y subestima sistemáticamente la salida del backlog —que es el término más
// grande de la carga, así que el sesgo se va directo al plan de flota.
export function probSalidaCondicional(curva, a, t) {
  const k = a + t;
  if (t < 1 || k < 0 || k > curva.kMax) return 0;
  let p = curva.h[k];
  for (let j = a + 1; j < k; j++) p *= (1 - curva.h[j]);
  return p;
}

// P(sale exactamente en el rezago k) para una orden que TODAVÍA NO EXISTE al
// corte (el inbound de A1). Aquí no hay nada observado que condicionar, así que
// va la marginal completa: h(k)·S(k).
export function probSalidaIncondicional(curva, k) {
  if (k < 0 || k > curva.kMax) return 0;
  return curva.h[k] * curva.S[k];
}

// ---- A0 · Backlog observado al corte ----
// No se pronostica: se cuenta. Devuelve el histograma por edad, que es lo que
// A1 necesita para proyectar (una orden de 5 días no tiene el mismo riesgo que
// una de 1). §5.A: además detecta backlog añejándose.
export function backlogAlCorte(creacion, corteISO, { estatusBacklog = [], salidaConocida = null } = {}) {
  const setB = new Set(estatusBacklog.map(norm));
  const porEdad = new Map();
  let total = 0;
  for (const o of creacion) {
    if (!o.creacion || o.creacion > corteISO) continue;
    // ¿ya salió a ruta al corte? Prioridad: llave explícita (piezas) > entrega > estatus.
    const sal = salidaConocida ? salidaConocida(o) : null;
    const yaSalio = (sal && sal <= corteISO) || (o.entrega && o.entrega <= corteISO) ||
      (setB.size > 0 ? !setB.has(norm(o.estatus)) : false);
    if (yaSalio) continue;
    const a = diffDias(o.creacion, corteISO);
    if (a == null || a < 0) continue;
    porEdad.set(a, (porEdad.get(a) || 0) + 1);
    total++;
  }
  const edades = Array.from(porEdad.entries()).map(([edad, n]) => ({ edad, n })).sort((x, y) => x.edad - y.edad);
  const anejo = edades.filter(e => e.edad >= 5).reduce((s, e) => s + e.n, 0);
  return { total, porEdad: edades, anejo, pctAnejo: total ? 100 * anejo / total : 0 };
}

// ---- A1 · Inbound esperado ----
// Naive estacional por día de semana con la dispersión medida sobre los mismos
// residuales. Es deliberadamente simple: con la historia disponible hoy (§2, dos
// días) cualquier modelo más sofisticado sería ruido con más parámetros. El FVA
// del backtest es lo que debe justificar reemplazarlo por un foundation model.
export function perfilInbound(creacion, corteISO, { ventanaDias = 84, factores = {}, eventosExtra = [], porDia: porDiaPre = null } = {}) {
  // `porDiaPre` evita recorrer todas las órdenes en cada corte. El dataset lo
  // reusa entre filas: sin esto, construir 12 meses es cuadrático en el número
  // de órdenes. El recorte point-in-time se mantiene: sólo se leen días ≤ corte.
  const porDia = porDiaPre || (() => {
    const m = new Map();
    for (const o of creacion) {
      if (!o.creacion || o.creacion > corteISO) continue;
      m.set(o.creacion, (m.get(o.creacion) || 0) + 1);
    }
    return m;
  })();
  const desde = sumarDias(corteISO, -ventanaDias + 1);
  // El último día observado suele estar incompleto (§6, point-in-time): se
  // excluye del ajuste del nivel para que el modelo no aprenda una caída falsa.
  const dias = rangoDias(desde, sumarDias(corteISO, -1)).filter(d => porDia.has(d));
  const serie = dias.map(d => ({ dia: d, n: porDia.get(d), cal: calendarioMX(d, { eventosExtra }) }));

  // El nivel base se fija SÓLO con días normales. Un 25 de diciembre metido al
  // promedio de los viernes hunde todos los viernes del año; un día de Buen Fin
  // los infla. Si no quedan suficientes días normales se cae a la serie
  // completa y se marca, porque un perfil con dos observaciones no es un perfil.
  const normales = serie.filter(s => s.cal?.normal);
  const base = normales.length >= 7 ? normales : serie;
  const porDow = Array.from({ length: 7 }, () => []);
  for (const s of base) porDow[dowDe(s.dia)].push(s.n);
  const global = media(base.map(s => s.n)) || 0;
  const varGlobal = varianzaMuestral(base.map(s => s.n));
  const dow = porDow.map(arr => ({
    n: arr.length,
    media: arr.length ? media(arr) : global,
    varianza: arr.length >= 2 ? varianzaMuestral(arr) : (varGlobal != null ? varGlobal : Math.max(global, 1)),
  }));

  // Factor multiplicativo por evento, medido contra el nivel base del mismo día
  // de semana. Las campañas mueven el inbound en múltiplos, no en puntos: un
  // aditivo estimado en noviembre no sirve para mayo.
  //
  // Cada factor se mide SÓLO en días donde su evento es el único activo. Los
  // eventos se traslapan de verdad: el 16 de noviembre de 2026 es feriado de
  // Revolución Y último día del Buen Fin. Promediar ese día dentro de los dos
  // hunde el factor de la campaña (que sube el volumen) y ensucia el del
  // feriado (que lo baja), y como después se componen multiplicativamente el
  // error entra dos veces. Si un evento no tiene días limpios se estima con los
  // sucios y queda marcado `confundido` para que la UI no lo presente como dato
  // duro.
  const factoresMedidos = {};
  const limpio = new Map(), sucio = new Map();
  for (const s of serie) {
    const claves = [...(s.cal?.eventos || []), ...(s.cal?.esFeriado ? ["__feriado__"] : [])];
    if (!claves.length) continue;
    const esperado = dow[dowDe(s.dia)].media;
    if (!(esperado > 0)) continue;
    const ratio = s.n / esperado;
    for (const k of claves) {
      const dest = claves.length === 1 ? limpio : sucio;
      if (!dest.has(k)) dest.set(k, []);
      dest.get(k).push(ratio);
    }
  }
  for (const k of new Set([...limpio.keys(), ...sucio.keys()])) {
    const l = limpio.get(k) || [];
    if (l.length >= 2) { factoresMedidos[k] = { factor: media(l), n: l.length, fuente: "medido" }; continue; }
    const todo = [...l, ...(sucio.get(k) || [])];
    if (todo.length >= 2) factoresMedidos[k] = { factor: media(todo), n: todo.length, fuente: "medido", confundido: true, diasLimpios: l.length };
  }

  return {
    serie, global, dow, dias: serie.length,
    diasNormales: normales.length, usaSoloNormales: normales.length >= 7,
    factoresMedidos, factoresManuales: factores, eventosExtra,
    // Sin al menos dos observaciones por día de semana el perfil DOW es una
    // ilusión: se usa el nivel global y se marca para que la UI lo diga.
    confiable: base.length >= 14 && dow.every(d => d.n >= 2),
    ultimoDiaObservado: dias[dias.length - 1] || null,
  };
}

// Factor a aplicar al día objetivo: manual > medido > 1. Los eventos se
// componen multiplicativamente (Buen Fin en día de quincena, por ejemplo).
export function factorCalendario(perfil, diaISOTarget) {
  const cal = calendarioMX(diaISOTarget, { eventosExtra: perfil.eventosExtra || [] });
  if (!cal) return { factor: 1, cal: null, aplicados: [] };
  const aplicados = [];
  let factor = 1;
  const claves = [...cal.eventos, ...(cal.esFeriado ? ["__feriado__"] : [])];
  for (const k of claves) {
    const man = perfil.factoresManuales?.[k];
    const med = perfil.factoresMedidos?.[k];
    const f = man != null && man !== "" ? Number(man) : (med ? med.factor : null);
    if (f != null && isFinite(f) && f >= 0) {
      factor *= f;
      aplicados.push({
        evento: k === "__feriado__" ? (cal.feriado || "Feriado") : k, factor: f,
        fuente: man != null && man !== "" ? "manual" : "medido",
        confundido: !(man != null && man !== "") && med?.confundido === true,
      });
    } else if (f == null) {
      aplicados.push({ evento: k === "__feriado__" ? (cal.feriado || "Feriado") : k, factor: 1, fuente: "sin dato" });
    }
  }
  return { factor, cal, aplicados };
}

export function inboundEsperado(perfil, diaISOTarget) {
  const d = perfil.dow[dowDe(diaISOTarget)];
  const usaDow = perfil.confiable && d.n >= 2;
  const { factor, cal, aplicados } = factorCalendario(perfil, diaISOTarget);
  const mu = (usaDow ? d.media : perfil.global) * factor;
  // Sin varianza medible se asume Poisson (σ² = μ), el piso razonable para un
  // conteo. Si la varianza muestral es menor que la media, también se usa μ:
  // subdispersión con n pequeño es artefacto, no señal.
  let v = (usaDow ? d.varianza : (perfil.dow.map(x => x.varianza).find(x => x != null) ?? mu)) * factor * factor;
  if (!(v > 0) || v < mu) v = Math.max(mu, 1);
  return { media: mu, varianza: v, usaDow, factor, cal, aplicados };
}

// ---- A2 · Reintentos ----
// Las fallidas de D−1 vuelven a competir por la capacidad de D. §6: quedarse
// corto un día contamina el siguiente, así que este término NO es opcional.
export function tasaReintentoPonderada(diag, tasas = {}) {
  const mot = diag?.rutas?.motivos || {};
  let num = 0, den = 0;
  for (const m of MOTIVOS) {
    const n = mot[m.cod] || 0;
    const t = tasas[m.cod] != null ? tasas[m.cod] : m.reintenta;
    num += n * t; den += n;
  }
  return den > 0 ? num / den : 0.8;
}

// Reintentos a partir de fallidas OBSERVADAS (el día previo ya ocurrió al corte).
// Cada excepción vuelve o no vuelve con probabilidad τ_motivo: la suma es una
// Poisson-binomial, media Σnτ y varianza Σnτ(1−τ).
export function reintentosObservados(rutasDiaPrevio, tasas = {}, { incluirSinRegistro = true } = {}) {
  let esperados = 0, varianza = 0, excepciones = 0, sinRegistro = 0, desglosado = false;
  for (const r of rutasDiaPrevio) {
    if (r.motivosDesglosados === false) {
      // El reporte no trae el desglose por código: se usa el agregado con la
      // tasa media ponderada por defecto y queda marcado como estimación burda.
      if (r.excepciones > 0) {
        const t = 0.8;
        esperados += r.excepciones * t; varianza += r.excepciones * t * (1 - t); excepciones += r.excepciones;
      }
    } else {
      desglosado = true;
      for (const m of MOTIVOS) {
        const n = r.motivos[m.cod] || 0;
        if (!n) continue;
        const t = tasas[m.cod] != null ? tasas[m.cod] : m.reintenta;
        esperados += n * t; varianza += n * t * (1 - t); excepciones += n;
      }
    }
    sinRegistro += r.sinRegistro;
  }
  // El 17% sin registro (§2) es carga que probablemente ni se intentó: si nunca
  // salió del vehículo, vuelve completa. Se suma como escenario, marcado aparte,
  // porque su interpretación es justo lo que el Bloque 0 debe resolver.
  return {
    media: esperados + (incluirSinRegistro ? sinRegistro : 0),
    varianza, base: esperados, excepciones, sinRegistro, observado: true, desglosado,
  };
}

// Reintentos a partir de una carga PRONOSTICADA (el día previo todavía no ocurre
// al corte, que es el caso normal en D−2). Se compone la tasa de excepción del
// histórico con la tasa de reprogramación: τ = p_excepción × p_reintento.
// Var[τ·X] con X aleatoria = τ²Var[X] + E[X]·τ(1−τ) — el primer término es la
// incertidumbre heredada de la carga y el segundo la del reintento en sí.
export function reintentosProyectados(cargaPrevia, tasaExcepcion, tasaReintento) {
  const tau = Math.max(0, Math.min(1, (tasaExcepcion || 0) * (tasaReintento || 0)));
  const m = Math.max(0, cargaPrevia?.media || 0);
  const v = Math.max(0, cargaPrevia?.varianza || 0);
  return { media: m * tau, varianza: tau * tau * v + m * tau * (1 - tau), tau, observado: false, desglosado: false };
}

// ---- Pronóstico de carga para un día objetivo ----
//
// Descompone media y varianza por término (§1). La independencia entre términos
// es un supuesto: se declara aquí y el backtest lo audita vía la cobertura del
// intervalo p10–p90 (§8).
export function pronosticarCarga({
  creacion, curva, corteISO, objetivoISO,
  estatusBacklog = [], salidaConocida = null,
  reintentos = null, perfil = null, backlog = null,
}) {
  const t = diffDias(corteISO, objetivoISO);
  if (t == null || t < 0) return null;
  const bl = backlog || backlogAlCorte(creacion, corteISO, { estatusBacklog, salidaConocida });

  // Término 1 — backlog observado. Poisson-binomial: cada orden sale o no con su
  // propia p. Media = Σp, Varianza = Σp(1−p). El CONTEO es exacto (§1); lo único
  // aleatorio es cuál de esas órdenes sale el día D.
  let mBack = 0, vBack = 0;
  for (const e of bl.porEdad) {
    const p = probSalidaCondicional(curva, e.edad, t);
    mBack += e.n * p; vBack += e.n * p * (1 - p);
  }

  // Término 2 — inbound de los días entre el corte y el objetivo. Ley de la
  // varianza total sobre N ~ (μ, σ²) órdenes que maduran con probabilidad p:
  //   E[X] = μp        Var[X] = μ·p(1−p) + p²·σ²
  const P = perfil || perfilInbound(creacion, corteISO);
  let mIn = 0, vIn = 0;
  const detalleInbound = [];
  for (let dd = 1; dd <= t; dd++) {
    const dia = sumarDias(corteISO, dd);
    const { media: mu, varianza: s2, factor, cal, aplicados } = inboundEsperado(P, dia);
    const k = diffDias(dia, objetivoISO);
    const p = probSalidaIncondicional(curva, k);
    mIn += mu * p; vIn += mu * p * (1 - p) + p * p * s2;
    detalleInbound.push({ dia, esperado: mu, pSalida: p, aporte: mu * p, factor, cal, aplicados });
  }

  // Término 3 — reintentos generados el día anterior al objetivo. Lo arma el
  // llamador porque su origen depende de si ese día ya ocurrió al corte
  // (observado) o no (proyectado). Ver pronosticarCargaMultiDia.
  const R = reintentos || { media: 0, varianza: 0, base: 0, sinRegistro: 0, observado: true };

  const media_ = mBack + mIn + R.media;
  const varianza = vBack + vIn + R.varianza;
  return {
    corteISO, objetivoISO, horizonteDias: t,
    media: media_, varianza, desv: Math.sqrt(Math.max(varianza, 0)),
    componentes: {
      backlog: { media: mBack, varianza: vBack, ordenes: bl.total, pctVar: varianza > 0 ? 100 * vBack / varianza : 0 },
      inbound: { media: mIn, varianza: vIn, detalle: detalleInbound, pctVar: varianza > 0 ? 100 * vIn / varianza : 0 },
      reintentos: { ...R, pctVar: varianza > 0 ? 100 * R.varianza / varianza : 0 },
    },
    backlog: bl, perfil: P,
  };
}

// Simulación multi-día (§B2). Camina día por día del corte al objetivo: las
// fallidas de hoy vuelven mañana, así que subdimensionar un día contamina el
// siguiente. En D−2 el día previo al objetivo es FUTURO respecto al corte —sus
// fallidas todavía no existen— y hay que proyectarlas desde la carga del propio
// modelo. Resolverlo con las fallidas observadas sería usar información del
// futuro y haría que el backtest se vea mejor de lo que la política es.
export function pronosticarCargaMultiDia({
  creacion, curva, corteISO, objetivoISO,
  estatusBacklog = [], salidaConocida = null,
  rutas = [], tasasReintento = {}, incluirSinRegistro = true,
  tasaExcepcion = 0, tauReintento = 0.8, perfil = null, backlog = null,
  factoresCalendario = {}, eventosExtra = [],
}) {
  const t = diffDias(corteISO, objetivoISO);
  if (t == null || t < 0) return null;
  const rutasPorDia = new Map();
  for (const r of rutas) {
    if (!r.dia || r.dia > corteISO) continue;                    // point-in-time
    if (!rutasPorDia.has(r.dia)) rutasPorDia.set(r.dia, []);
    rutasPorDia.get(r.dia).push(r);
  }
  const P = perfil || perfilInbound(creacion, corteISO, { factores: factoresCalendario, eventosExtra });
  const bl = backlog || backlogAlCorte(creacion, corteISO, { estatusBacklog, salidaConocida });

  const cadena = [];
  let previo = null;
  for (const dia of rangoDias(corteISO, objetivoISO)) {
    if (dia === corteISO) continue;
    const diaPrevio = sumarDias(dia, -1);
    const R = diaPrevio <= corteISO
      ? reintentosObservados(rutasPorDia.get(diaPrevio) || [], tasasReintento, { incluirSinRegistro })
      : reintentosProyectados(previo, tasaExcepcion, tauReintento);
    const p = pronosticarCarga({
      creacion, curva, corteISO, objetivoISO: dia,
      estatusBacklog, salidaConocida, reintentos: R, perfil: P, backlog: bl,
    });
    cadena.push(p);
    previo = p;
  }
  const final = cadena[cadena.length - 1] || null;
  return final ? { ...final, cadena } : null;
}

// Cuantiles de la carga. Aproximación normal sobre la suma de los tres términos:
// cada uno es una suma de muchas variables acotadas, así que el TLC aplica bien.
// Se trunca en cero y se redondea porque son paquetes, no una cantidad continua.
export function cuantilesCarga(pron, ps = [0.1, 0.25, 0.5, 0.75, 0.9]) {
  if (!pron) return [];
  return ps.map(p => ({ p, valor: Math.max(0, Math.round(pron.media + zDeCuantil(p) * pron.desv)) }));
}
export const cargaEnCuantil = (pron, p) => pron ? Math.max(0, Math.round(pron.media + zDeCuantil(p) * pron.desv)) : 0;

// ---- A3 · Distribución espacial de paradas ----
// §3: la zona NO es un dato de entrada. El modelo entrega paradas
// georreferenciadas y el ruteador zonifica. Bootstrap sobre el histórico,
// condicionado a día de semana cuando hay suficientes observaciones.
export function muestrearParadas(piezas, nParadas, { dow = null, seed = 12345, minPorDow = 200 } = {}) {
  const conGeo = piezas.filter(p => p.lat != null && p.lng != null && p.movimiento);
  if (!conGeo.length || nParadas <= 0) return [];
  let pool = conGeo;
  if (dow != null) {
    const sub = conGeo.filter(p => dowDe(p.movimiento) === dow);
    if (sub.length >= minPorDow) pool = sub;
  }
  const paradas = colapsarParadas(pool);
  if (!paradas.length) return [];
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < nParadas; i++) {
    const base = paradas[Math.floor(r() * paradas.length)];
    // Jitter de ~50 m: sin él el muestreo repite direcciones exactas y el
    // ruteador ve paradas colineales que no existen en la realidad.
    out.push({
      lat: base.lat + (r() - 0.5) * 0.0009,
      lng: base.lng + (r() - 0.5) * 0.0009,
      cp: base.cp, municipio: base.municipio,
    });
  }
  return out;
}

// ============================================================
// 5. ETAPA B — CARGA A UNIDADES
// ============================================================

// Rangos nominales de §3. Piso = donde despachar deja de rendir; techo =
// capacidad física. Se traslapan a propósito: por eso la asignación es un
// problema entero y no una división.
export const TIPOS_UNIDAD_DEFAULT = [
  { id: "Moto",  label: "Moto",  piso: 20, techo: 30, costo: 0, disponibles: null },
  { id: "Sedan", label: "Sedán", piso: 25, techo: 40, costo: 0, disponibles: null },
  { id: "Van",   label: "Van",   piso: 35, techo: 60, costo: 0, disponibles: null },
];

// ---- B1 · Curva de capacidad efectiva ----
//
// Sustituye los rangos nominales por la capacidad que la jornada permite:
//   capacidad = ⌊ horas efectivas × 60 / minutos por entrega ⌋
//
// Matiz de censura (§6) que hay que respetar: lo censurado es la DEMANDA de los
// días saturados, no el RITMO. Una ruta que cargó 36 y entregó 23 sigue midiendo
// bien sus minutos por entrega —hizo 23 entregas en la ventana que tuvo—; lo que
// no se puede leer de ella es cuántas unidades se habrían necesitado. Por eso el
// ritmo se estima con todas las rutas y la censura se reporta aparte.
export function capacidadEfectiva(rutas, { porDSP = true, tMax = null } = {}) {
  const filas = [];
  const grupos = new Map([["__todos__", rutas.slice()]]);
  if (porDSP) {
    for (const r of rutas) {
      const k = r.carrier || "—";
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(r);
    }
  }

  for (const [clave, rs] of grupos) {
    const min = rs.filter(r => r.entregados > 0 && r.horasRuta > 0).map(r => (r.horasRuta * 60) / r.entregados);
    const hs = rs.map(r => r.horasRuta).filter(h => h > 0);
    const medMin = mediana(min), medH = mediana(hs);
    const horasPlan = tMax != null ? tMax : medH;
    const cap = medMin > 0 && horasPlan > 0 ? Math.floor((horasPlan * 60) / medMin) : null;
    // Ruta censurada: cargó más de lo que alcanzó a tocar. Su demanda real es un
    // límite inferior, así que no puede usarse como "así se ve un día normal".
    const censuradas = rs.filter(r => r.sinRegistro > 0 || (r.total > 0 && r.entregados + r.excepciones < r.total)).length;
    filas.push({
      clave: clave === "__todos__" ? "TODOS" : clave,
      rutas: rs.length,
      minPorEntrega: medMin, minP25: cuantil(min, 0.25), minP75: cuantil(min, 0.75),
      horasRuta: medH,
      capacidadJornada: cap,
      cargadasMediana: mediana(rs.map(r => r.total)),
      entregadasMediana: mediana(rs.map(r => r.entregados)),
      pctEntrega: mediana(rs.map(r => r.pct).filter(x => x > 0)),
      censuradas, pctCensuradas: rs.length ? 100 * censuradas / rs.length : 0,
      // Sobrecarga = cuánto se carga por encima de lo que la jornada permite.
      sobrecarga: cap != null ? (mediana(rs.map(r => r.total)) || 0) - cap : null,
      muestra: min.length,
    });
  }
  const todos = filas.find(f => f.clave === "TODOS");
  return { filas: filas.sort((a, b) => (a.clave === "TODOS" ? -1 : b.clave === "TODOS" ? 1 : b.rutas - a.rutas)), global: todos };
}

// Techo efectivo por tipo: el nominal acotado por lo que la jornada permite
// (§3, "ata la que se rompa primero"). Si la capacidad de jornada cae por debajo
// del piso nominal del tipo, ese tipo no es despachable ese día y se marca.
export function techosEfectivos(tipos, capacidadJornada) {
  if (!(capacidadJornada > 0)) return tipos.map(t => ({ ...t, techoEfectivo: t.techo, limitadoPorJornada: false }));
  return tipos.map(t => {
    const te = Math.min(t.techo, capacidadJornada);
    return { ...t, techoEfectivo: te, limitadoPorJornada: te < t.techo, inviable: te < t.piso };
  });
}

// ---- B2 · Simulación de ruteo ----
//
// El conteo dice cuántas unidades caben por capacidad; la geografía dice
// cuántas caben por jornada. §3: ata la que se rompa primero, y cuál se rompe
// depende de la geografía del día — 40 paquetes en tres colonias caben en un
// sedán, los mismos 40 repartidos en toda la zona no.
//
// Esta función busca el MÍNIMO k de vehículos con el que todas las rutas caben
// en la jornada. No ejecuta el ruteador: recibe `correr(k)` como parámetro para
// que la UI pueda pasar la versión con Web Worker y esto siga siendo testeable
// sin DOM.
//
// Búsqueda: k₀ = ⌈n/M⌉ es una cota inferior dura (con menos vehículos alguna
// ruta pasa del techo). Si k₀ ya es factible, es LA respuesta y no hay que
// barrer nada. Si no, se duplica hasta encontrar uno factible y se bisecciona.
// Son ~log₂ corridas en vez de una por cada k.
export async function buscarKFactible(nParadas, opts) {
  const { M, m = 0, correr, maxK = 400, maxIntentos = 10, onPaso } = opts;
  if (!(nParadas > 0) || !(M > 0)) return null;
  const k0 = Math.max(1, Math.ceil(nParadas / M));
  const intentos = [];
  let usados = 0;

  const factible = async (k) => {
    if (usados >= maxIntentos) return null;
    usados++;
    onPaso?.(k, usados);
    const r = await correr(k);
    const met = r?.metricas;
    if (!met) return null;
    // Factible = todas las rutas caben en la jornada Y ninguna pasa del techo.
    // El piso (minN ≥ m) NO entra al criterio: subir k nunca lo arregla, así que
    // meterlo haría divergir la búsqueda. Se reporta aparte.
    const ok = met.SLA >= 100 - 1e-9 && met.maxN <= M;
    intentos.push({ k, SLA: met.SLA, maxN: met.maxN, minN: met.minN, durMax: met.durMax, D: met.D, CV: met.CV, ok });
    return { ok, met, r };
  };

  let lo = k0, res = await factible(k0);
  if (!res) return null;
  if (res.ok) return { k: k0, metricas: res.met, resultado: res.r, intentos, ajustado: false, bajoPiso: res.met.minN < m };

  let hi = k0;
  while (usados < maxIntentos && hi < maxK) {
    hi = Math.min(maxK, hi * 2);
    const r = await factible(hi);
    if (!r) break;
    if (r.ok) { res = r; break; }
    lo = hi;
  }
  if (!res.ok) {
    return { k: null, intentos, ajustado: true, sinSolucion: true, mejor: intentos[intentos.length - 1] };
  }
  // Bisección entre el último infactible (lo) y el primer factible (hi).
  let mejor = { k: hi, met: res.met, r: res.r };
  while (hi - lo > 1 && usados < maxIntentos) {
    const mid = Math.floor((lo + hi) / 2);
    const r = await factible(mid);
    if (!r) break;
    if (r.ok) { hi = mid; mejor = { k: mid, met: r.met, r: r.r }; } else lo = mid;
  }
  return { k: mejor.k, metricas: mejor.met, resultado: mejor.r, intentos, ajustado: true, bajoPiso: mejor.met.minN < m };
}

// Calibra el tiempo de servicio del ruteador contra lo observado en campo.
//
// B1 mide MINUTOS POR ENTREGA de punta a punta: incluye servicio Y traslado. El
// ruteador separa las dos cosas (`si` es sólo servicio, el traslado sale del
// perfil de velocidad). Pasarle 18.1 min como `si` contaría el traslado dos
// veces y el plan pediría casi el doble de unidades.
//
// La resta correcta: si = (minutos observados totales − traslado simulado) / paradas.
// Si sale negativa, el perfil de velocidad del ruteador es más lento que la
// realidad y hay que recalibrarlo — se reporta en vez de recortar a cero en
// silencio, porque significa que la simulación no es comparable con el campo.
export function calibrarServicio(minPorEntregaObservado, trasladoSimuladoHoras, nParadas) {
  if (!(minPorEntregaObservado > 0) || !(nParadas > 0)) return { si: null, valido: false, motivo: "Sin minutos por entrega observados" };
  const observadoMin = minPorEntregaObservado * nParadas;
  const trasladoMin = (trasladoSimuladoHoras || 0) * 60;
  const servicioMin = observadoMin - trasladoMin;
  if (servicioMin <= 0) {
    return {
      si: null, valido: false, observadoMin, trasladoMin,
      motivo: "El traslado simulado ya supera el tiempo total observado: el perfil de velocidad del ruteador es más lento que la operación real. Recalíbralo antes de leer esta simulación.",
    };
  }
  return { si: servicioMin / nParadas / 60, siMin: servicioMin / nParadas, valido: true, observadoMin, trasladoMin, pctTraslado: 100 * trasladoMin / observadoMin };
}

// ---- B2b · Simulación de flota multi-día ----
//
// §4: "Multi-día porque las fallidas de hoy vuelven mañana: subdimensionar un
// día contamina el siguiente". §6 lo repite como modo de falla: "un déficit
// chico en lunes puede arrastrarse toda la semana".
//
// Dimensionar cada día por separado ignora ese lazo. La recursión es:
//     pendiente(d) = max(0, demanda(d) + pendiente(d−1) − capacidad(d))
//
// La función corre DOS políticas sobre la misma demanda para poder compararlas:
//   · "miope"    dimensiona con la demanda del día, como si empezara de cero
//   · "arrastre" dimensiona con demanda + lo que quedó pendiente ayer
//
// La diferencia de costo entre ambas ES el costo de ignorar el lazo, y es un
// número que se puede llevar a una junta.
// Cada día lleva DOS números que no pueden ser el mismo, o la simulación no
// simula nada: lo que se planea (cuantil q del pronóstico, decidido en D−2) y lo
// que ocurre (`realizado`, o el cuantil de escenario `qEscenario`). Si ambos
// salieran del mismo cuantil, la capacidad cubriría la demanda por construcción,
// nunca habría faltante y el lazo se vería inexistente — que es exactamente el
// error que §6 advierte al leer el histórico como si fuera la demanda.
export function simularFlotaMultiDia({
  cargasPorDia, tipos, q = 0.5, qEscenario = 0.9, factorParada = 1, cFaltante = 0,
} = {}) {
  if (!cargasPorDia?.length) return null;
  const techoDe = t => (t.techoEfectivo != null ? t.techoEfectivo : t.techo);

  const correr = (conArrastre) => {
    const dias = [];
    let pendiente = 0;
    for (const c of cargasPorDia) {
      const demanda = Math.round(cargaEnCuantil(c.pron, q) / (factorParada || 1));
      const realizado = c.realizado != null
        ? Math.round(c.realizado / (factorParada || 1))
        : Math.round(cargaEnCuantil(c.pron, qEscenario) / (factorParada || 1));
      // La política miope planea contra la demanda del día. La de arrastre suma
      // lo que quedó sin entregar: es carga comprometida que compite por la
      // misma capacidad, no demanda nueva.
      const aPlanear = conArrastre ? demanda + Math.round(pendiente) : demanda;
      const plan = asignarUnidades(aPlanear, tipos);
      const capacidad = plan.plan.reduce((s, t) => s + t.n * techoDe(t), 0);
      // Lo que REALMENTE hay que mover ese día siempre incluye el arrastre,
      // planeado o no: por eso la miope acumula déficit aunque no lo mire.
      const real = realizado + pendiente;
      const servido = Math.min(real, capacidad);
      const nuevoPendiente = Math.max(0, real - capacidad);
      dias.push({
        dia: c.dia, demanda, realizado, arrastreEntrada: Math.round(pendiente), aPlanear,
        plan, unidades: plan.unidades, capacidad, servido: Math.round(servido),
        sinServir: Math.round(nuevoPendiente), costoUnidades: plan.costo,
        utilizacion: capacidad > 0 ? 100 * servido / capacidad : 0,
      });
      pendiente = nuevoPendiente;
    }
    const costoUnidades = dias.reduce((s, d) => s + d.costoUnidades, 0);
    // El pendiente que queda al final del horizonte no desaparece: se cobra
    // completo, porque si no la política miope se vería gratis por diferir.
    const faltantes = dias.reduce((s, d) => s + d.sinServir, 0) + Math.round(pendiente);
    return {
      dias, costoUnidades,
      faltantes,
      pendienteFinal: Math.round(pendiente),
      costoFaltantes: faltantes * (Number(cFaltante) || 0),
      costoTotal: costoUnidades + faltantes * (Number(cFaltante) || 0),
      unidades: dias.reduce((s, d) => s + d.unidades, 0),
      utilizacion: media(dias.map(d => d.utilizacion)),
    };
  };

  const miope = correr(false);
  const arrastre = correr(true);
  return {
    miope, arrastre,
    ahorro: miope.costoTotal - arrastre.costoTotal,
    pctAhorro: miope.costoTotal > 0 ? 100 * (miope.costoTotal - arrastre.costoTotal) / miope.costoTotal : 0,
    // Si la política miope nunca acumula pendiente, el lazo no está atando en
    // este horizonte y las dos políticas coinciden. Decirlo evita vender un
    // ahorro de cero como si fuera un hallazgo.
    lazoActivo: miope.faltantes > 0,
  };
}

// ---- B3 · Asignación entera con pisos y techos ----
//
// Elegir n_t unidades de cada tipo que minimicen Σ n_t·c_t sujeto a
//     Σ n_t·piso_t  ≤  carga  ≤  Σ n_t·techo_t
//
// La condición es exacta: como cada unidad admite cualquier entero en
// [piso_t, techo_t], la suma alcanza TODOS los enteros del intervalo
// [Σpiso, Σtecho]; si la carga cae dentro, existe un reparto factible.
//
// Búsqueda: se enumeran todos los tipos menos uno y el último se resuelve en
// forma cerrada. El costo crece con n_último y la restricción de piso también se
// aprieta con él, así que el mínimo factible es óptimo — no hay que barrerlo.
// Complejidad O(N^{T−1}) con T = 3 tipos: milisegundos.
//
// NOTA sobre el ejemplo de §3 (65 paquetes): el documento descarta "van + moto"
// porque supone que la van se llena a 60 y deja 5 a la moto. Con la regla
// correcta la combinación SÍ es factible (van 45 + moto 20, pisos 55 ≤ 65 ≤ 90);
// cuál gana lo decide el costo, no la aritmética. Este motor implementa la regla
// general y por eso puede devolver planes que el ejemplo del documento no lista.
export function asignarUnidades(carga, tipos, { maxIteraciones = 4e6 } = {}) {
  const T = tipos.filter(t => t.techo > 0 && !t.inviable);
  const cargaR = Math.max(0, Math.round(carga));
  if (!T.length) return { factible: false, motivo: "Sin tipos de unidad disponibles", plan: [], unidades: 0, costo: 0, faltantes: cargaR };
  if (cargaR === 0) return { factible: true, plan: T.map(t => ({ ...t, n: 0, cargas: [] })), unidades: 0, costo: 0, faltantes: 0, ociosidad: 0, holgura: { pisoTotal: 0, techoTotal: 0 } };

  const techoDe = t => (t.techoEfectivo != null ? t.techoEfectivo : t.techo);
  const cap = t => (t.disponibles != null && t.disponibles !== "" ? Number(t.disponibles) : Infinity);
  const coberturaMax = T.reduce((s, t) => s + (isFinite(cap(t)) ? cap(t) : Math.ceil(cargaR / Math.max(1, t.piso)) + 2) * techoDe(t), 0);

  const head = T.slice(0, -1);
  const last = T[T.length - 1];
  let mejor = null, iter = 0, truncado = false;

  const evaluar = (ns, costo, sumPiso, sumTecho) => {
    const faltaTecho = cargaR - sumTecho;
    let nl = faltaTecho <= 0 ? 0 : Math.ceil(faltaTecho / techoDe(last));
    if (nl > cap(last)) return;
    if (sumPiso + nl * last.piso > cargaR) return;      // se pasaría del piso total
    const c = costo + nl * last.costo;
    const u = ns.reduce((s, x) => s + x, 0) + nl;
    if (!mejor || c < mejor.costo - 1e-9 || (Math.abs(c - mejor.costo) < 1e-9 && u < mejor.unidades)) {
      mejor = { costo: c, unidades: u, ns: ns.concat([nl]) };
    }
  };

  const rec = (i, ns, costo, sumPiso, sumTecho) => {
    if (truncado) return;
    if (i === head.length) { if (++iter > maxIteraciones) { truncado = true; return; } evaluar(ns, costo, sumPiso, sumTecho); return; }
    const t = head[i];
    const lim = Math.min(cap(t), Math.ceil(cargaR / Math.max(1, t.piso)));
    for (let n = 0; n <= lim; n++) {
      if (sumPiso + n * t.piso > cargaR) break;          // podado: el piso ya se pasó
      rec(i + 1, ns.concat([n]), costo + n * t.costo, sumPiso + n * t.piso, sumTecho + n * techoDe(t));
    }
  };
  rec(0, [], 0, 0, 0);

  if (!mejor) {
    // Dos causas posibles, y hay que distinguirlas porque la acción es distinta.
    if (cargaR > coberturaMax) {
      // No alcanza la flota disponible: se despacha todo lo que hay y el resto
      // se cae. Ese faltante es el que la etapa C valora contra la ociosidad.
      const plan = T.map(t => ({ ...t, n: isFinite(cap(t)) ? cap(t) : 0 }));
      const cobertura = plan.reduce((s, t) => s + t.n * techoDe(t), 0);
      return {
        factible: false, motivo: "La flota disponible no cubre la carga",
        plan: repartir(plan, Math.min(cargaR, cobertura)), unidades: plan.reduce((s, t) => s + t.n, 0),
        costo: plan.reduce((s, t) => s + t.n * t.costo, 0), faltantes: cargaR - cobertura, ociosidad: 0, truncado,
        holgura: { pisoTotal: plan.reduce((s, t) => s + t.n * t.piso, 0), techoTotal: cobertura },
      };
    }
    // La carga es menor que el piso de la unidad más chica: cualquier despacho
    // rompe el piso. §8 lo pide explícito, no lo esconde en el plan.
    const barata = T.slice().sort((a, b) => a.costo - b.costo || a.piso - b.piso)[0];
    const plan = T.map(t => ({ ...t, n: t.id === barata.id ? 1 : 0 }));
    return {
      factible: false, motivo: `Carga (${cargaR}) por debajo del piso mínimo (${Math.min(...T.map(t => t.piso))})`,
      bajoPiso: true, plan: repartir(plan, cargaR), unidades: 1, costo: barata.costo,
      faltantes: 0, ociosidad: barata.piso - cargaR, truncado,
      holgura: { pisoTotal: barata.piso, techoTotal: barata.techoEfectivo != null ? barata.techoEfectivo : barata.techo },
    };
  }

  const plan = T.map((t, i) => ({ ...t, n: mejor.ns[i] }));
  const sumTecho = plan.reduce((s, t) => s + t.n * techoDe(t), 0);
  return {
    factible: true, plan: repartir(plan, cargaR), unidades: mejor.unidades, costo: mejor.costo,
    faltantes: 0, ociosidad: sumTecho - cargaR, truncado,
    holgura: { pisoTotal: plan.reduce((s, t) => s + t.n * t.piso, 0), techoTotal: sumTecho },
  };
}

// Reparte la carga entre las unidades del plan: arranca en el piso de cada una y
// distribuye el remanente proporcional a su holgura. Es lo que convierte
// "2 sedanes" en "un sedán de 32 y otro de 33" (§3).
function repartir(plan, carga) {
  const unidades = [];
  for (const t of plan) for (let i = 0; i < t.n; i++) unidades.push({ tipo: t.id, piso: t.piso, techo: t.techoEfectivo != null ? t.techoEfectivo : t.techo, carga: t.piso });
  let rem = carga - unidades.reduce((s, u) => s + u.carga, 0);
  if (rem > 0) {
    const holgura = unidades.map(u => u.techo - u.piso);
    const totalH = holgura.reduce((s, x) => s + x, 0);
    if (totalH > 0) {
      unidades.forEach((u, i) => { const add = Math.floor(rem * holgura[i] / totalH); u.carga += add; });
      let sobra = carga - unidades.reduce((s, u) => s + u.carga, 0);
      for (let i = 0; i < unidades.length && sobra > 0; i++) {
        const add = Math.min(sobra, unidades[i].techo - unidades[i].carga);
        unidades[i].carga += add; sobra -= add;
      }
    }
  } else if (rem < 0) {
    // Carga por debajo del piso total (sólo ocurre en el caso bajoPiso).
    let deficit = -rem;
    for (let i = unidades.length - 1; i >= 0 && deficit > 0; i--) {
      const quita = Math.min(deficit, unidades[i].carga); unidades[i].carga -= quita; deficit -= quita;
    }
  }
  return plan.map(t => ({ ...t, cargas: unidades.filter(u => u.tipo === t.id).map(u => u.carga) }));
}

// ============================================================
// 6. ETAPA C — COMPROMISO EN D−2
// ============================================================

// Newsvendor: con costo igual entre planeado y no planeado, el trade-off es
// unidad ociosa contra entrega fallida. Como C_faltante suele superar a
// C_ocioso, q* queda arriba del p50: se planea con holgura deliberada y el
// número sale del cociente, no de una convención.
//
// CORRECCIÓN DIMENSIONAL respecto a §4. El documento escribe
//     q* = C_faltante / (C_faltante + C_ocioso)
// pero define C_ocioso como "el día completo de una unidad" y C_faltante como el
// costo de UNA entrega no realizada. Son unidades distintas —$/unidad-día contra
// $/paquete— y el cociente directo no significa nada: con $700 por van y $300
// por faltante daría q*=0.30, o sea planear POR DEBAJO de la mediana, que es lo
// contrario de lo que el propio documento concluye.
//
// El newsvendor pide ambos costos sobre el MISMO artículo. El artículo natural
// aquí es el lugar de capacidad (una parada), así que el día de unidad se
// prorratea entre las paradas que esa unidad cubre:
//     c_ocioso_parada = C_ocioso / capacidad_de_la_unidad
//     q* = C_faltante / (C_faltante + c_ocioso_parada)
// Con $700 por van de 40 paradas y $300 por faltante: 300/(300+17.5) = 0.945.
// Ese sí es el "arriba del p50" que describe §4, y coincide con el mínimo
// empírico de curvaPolitica() — que es la verificación que pide §8.
//
// capacidadUnidad = 1 reproduce el cociente literal del documento.
export const quantilObjetivo = (cFaltante, cOcioso, { capacidadUnidad = 1 } = {}) => {
  const f = Math.max(0, Number(cFaltante) || 0);
  const cap = Math.max(1e-9, Number(capacidadUnidad) || 1);
  const o = Math.max(0, Number(cOcioso) || 0) / cap;
  if (f + o <= 0) return 0.5;
  return Math.min(0.99, Math.max(0.01, f / (f + o)));
};

// Costo esperado de comprometer un plan contra la distribución de carga.
// Integra sobre los cuantiles en vez de evaluar sólo la media: el punto entero
// de la política es que la asimetría de costos importa.
//
// OJO con el doble conteo: C_ocioso ES el día de la unidad, y ese día ya está
// dentro de plan.costo (se paga por comprometerla, se use o no). Por eso el
// costo total es `plan.costo + faltantes × C_faltante` y nada más. Las unidades
// ociosas se reportan aparte como diagnóstico —cuánto de lo que ya pagaste se
// quedó parado— pero sumarlas otra vez inflaría el óptimo hacia planes cortos.
export function costoEsperadoPlan(plan, pron, { cFaltante, cOcioso, tipos = null, pasos = 21 } = {}) {
  if (!plan || !pron) return null;
  const techoDe = t => (t.techoEfectivo != null ? t.techoEfectivo : t.techo);
  const capacidad = plan.plan.reduce((s, t) => s + t.n * techoDe(t), 0);
  const comprometidas = plan.plan.reduce((s, t) => s + t.n, 0);
  const memo = new Map();
  let faltantes = 0, ociosas = 0;
  for (let i = 1; i <= pasos; i++) {
    const p = i / (pasos + 1);
    const carga = Math.max(0, Math.round(pron.media + zDeCuantil(p) * pron.desv));
    faltantes += Math.max(0, carga - capacidad);
    if (tipos) {
      // Unidades que la carga realizada habría justificado, con las mismas
      // reglas de piso/techo. La diferencia contra las comprometidas es lo que
      // se quedó parado en el patio.
      const k = Math.min(carga, capacidad);
      if (!memo.has(k)) memo.set(k, asignarUnidades(k, tipos).unidades);
      ociosas += Math.max(0, comprometidas - memo.get(k));
    }
  }
  faltantes /= pasos; ociosas /= pasos;
  return {
    capacidad, comprometidas,
    faltantesEsperados: faltantes, unidadesOciosas: ociosas,
    costoUnidades: plan.costo,
    costoFaltantes: faltantes * (Number(cFaltante) || 0),
    // Informativo, NO se suma: es la porción de plan.costo que se desperdició.
    costoOciosidadInformativo: ociosas * (Number(cOcioso) || 0),
    costoTotal: plan.costo + faltantes * (Number(cFaltante) || 0),
  };
}

// Barre el quantil de planeación y devuelve la curva de costo total esperado.
// El mínimo empírico de esta curva y el q* teórico deben coincidir; cuando no
// lo hacen es porque los pisos hacen saltar el plan de forma discreta, y eso es
// información: conviene verlo antes de comprometer.
export function curvaPolitica(pron, tipos, opts = {}) {
  const { cFaltante = 0, cOcioso = 0, ps = null, factorParada = 1 } = opts;
  const lista = ps || Array.from({ length: 19 }, (_, i) => 0.05 + i * 0.05);
  return lista.map(p => {
    const carga = cargaEnCuantil(pron, p);
    const paradas = Math.round(carga / (factorParada || 1));
    const plan = asignarUnidades(paradas, tipos);
    const costo = costoEsperadoPlan(plan, { ...pron, media: pron.media / (factorParada || 1), desv: pron.desv / (factorParada || 1) }, { cFaltante, cOcioso, tipos });
    return { p, carga, paradas, plan, costo };
  });
}

// ============================================================
// 6b. DATASET DE ENTRENAMIENTO — Bloque 2 de §9
//
// El entregable verificable de ese bloque es EL DATASET, no un modelo. Una fila
// por día objetivo, con cada feature calculada exactamente como se veía en su
// fecha de corte.
//
// La regla que hace útil (o inútil) esta tabla es una sola: ninguna columna
// puede contener información posterior al corte. §6 lo llama point-in-time
// correctness y advierte del modo de falla concreto —si las tablas se completan
// con retraso, el último día siempre se ve bajo y el modelo aprende una caída
// que después proyecta—. Por eso los features NO se calculan aquí a mano: se
// leen del mismo pronosticarCargaMultiDia() que corre en producción, con el
// mismo corte. Si el pronóstico filtrara futuro, el dataset filtraría lo mismo,
// y el backtest lo delataría; tenerlos separados permitiría que uno mienta y el
// otro no.
// ============================================================

export const DICCIONARIO_DATASET = [
  { col: "dia", etapa: "id", desc: "Día objetivo D (el que se planea)" },
  { col: "corte", etapa: "id", desc: "Fecha de compromiso. Ninguna columna usa información posterior a esta fecha" },
  { col: "lead_dias", etapa: "id", desc: "Días entre el corte y el objetivo" },
  { col: "dow", etapa: "calendario", desc: "Día de la semana de D (0 = domingo)" },
  { col: "es_feriado", etapa: "calendario", desc: "Feriado de la LFT art. 74 o Semana Santa" },
  { col: "feriado", etapa: "calendario", desc: "Nombre del feriado" },
  { col: "campanas", etapa: "calendario", desc: "Campañas activas (Buen Fin, Hot Sale, …)" },
  { col: "es_quincena", etapa: "calendario", desc: "Día 15 o último del mes" },
  { col: "es_habil", etapa: "calendario", desc: "Hábil de operación" },
  { col: "factor_calendario", etapa: "calendario", desc: "Multiplicador de inbound aplicado por calendario" },
  { col: "backlog_total", etapa: "A0", desc: "Órdenes en almacén al corte. Es un conteo, no una estimación" },
  { col: "backlog_anejo_5mas", etapa: "A0", desc: "Backlog con 5 o más días en almacén" },
  { col: "backlog_edad_0", etapa: "A0", desc: "Backlog creado el mismo día del corte" },
  { col: "backlog_edad_1", etapa: "A0", desc: "Backlog de 1 día" },
  { col: "backlog_edad_2", etapa: "A0", desc: "Backlog de 2 días" },
  { col: "backlog_edad_3", etapa: "A0", desc: "Backlog de 3 días" },
  { col: "backlog_edad_4", etapa: "A0", desc: "Backlog de 4 días" },
  { col: "backlog_edad_5a7", etapa: "A0", desc: "Backlog de 5 a 7 días" },
  { col: "backlog_edad_8mas", etapa: "A0", desc: "Backlog de 8 días o más" },
  { col: "inbound_lag_1", etapa: "A1", desc: "Órdenes creadas el día del corte" },
  { col: "inbound_lag_2", etapa: "A1", desc: "Órdenes creadas un día antes del corte" },
  { col: "inbound_lag_3", etapa: "A1", desc: "Órdenes creadas dos días antes del corte" },
  { col: "inbound_lag_7", etapa: "A1", desc: "Órdenes creadas seis días antes del corte" },
  { col: "inbound_media_28d", etapa: "A1", desc: "Media diaria de creación en los 28 días previos al corte" },
  { col: "inbound_dow_media", etapa: "A1", desc: "Nivel base del día de semana de D, sólo con días normales" },
  { col: "inbound_dow_n", etapa: "A1", desc: "Observaciones que sostienen ese nivel base" },
  { col: "h_0", etapa: "A1", desc: "Riesgo de salir a ruta el mismo día de creación" },
  { col: "h_1", etapa: "A1", desc: "Riesgo de salir al día 1" },
  { col: "h_2", etapa: "A1", desc: "Riesgo de salir al día 2" },
  { col: "h_3", etapa: "A1", desc: "Riesgo de salir al día 3" },
  { col: "mediana_maduracion", etapa: "A1", desc: "Días de creación a salida a ruta (mediana de la curva al corte)" },
  { col: "maduracion_n", etapa: "A1", desc: "Salidas observadas que sostienen la curva" },
  { col: "maduracion_censuradas", etapa: "A1", desc: "Órdenes aún sin salir al corte (censuradas, no ceros)" },
  { col: "fallidas_total", etapa: "A2", desc: "Excepciones observadas el último día antes del corte" },
  { col: "fallidas_311", etapa: "A2", desc: "Cliente ausente" },
  { col: "fallidas_314", etapa: "A2", desc: "Dirección errónea" },
  { col: "fallidas_318", etapa: "A2", desc: "Rechazo del cliente" },
  { col: "sin_registro", etapa: "A2", desc: "Piezas cargadas sin entrega ni excepción (el hueco del Bloque 0)" },
  { col: "tasa_excepcion_14d", etapa: "A2", desc: "Excepciones ÷ piezas cargadas, 14 días previos al corte" },
  { col: "rutas_14d", etapa: "B1", desc: "Rutas por día operadas en los 14 días previos" },
  { col: "min_por_entrega_14d", etapa: "B1", desc: "Minutos por entrega efectiva (mediana móvil)" },
  { col: "horas_ruta_14d", etapa: "B1", desc: "Horas de primera a última parada (mediana móvil)" },
  { col: "capacidad_jornada", etapa: "B1", desc: "Entregas que caben en la jornada al ritmo observado" },
  { col: "pct_entrega_14d", etapa: "B1", desc: "Porcentaje de entrega (mediana móvil)" },
  { col: "pct_censuradas_14d", etapa: "B1", desc: "Rutas saturadas: cargaron más de lo que alcanzaron a tocar" },
  { col: "paradas_14d", etapa: "A3", desc: "Paradas únicas por día (mediana móvil)" },
  { col: "piezas_por_parada_14d", etapa: "A3", desc: "Factor de colapso piezas → direcciones" },
  { col: "municipios_14d", etapa: "A3", desc: "Municipios distintos tocados por día" },
  { col: "hhi_municipio", etapa: "A3", desc: "Concentración geográfica (Herfindahl sobre municipios): 1 = todo en uno" },
  { col: "radio_km", etapa: "A3", desc: "Distancia media de las paradas a su centroide. Mide dispersión del día" },
  { col: "pred_media", etapa: "modelo", desc: "Carga que el modelo pronosticó con la información del corte" },
  { col: "pred_desv", etapa: "modelo", desc: "Desviación del pronóstico" },
  { col: "pred_backlog", etapa: "modelo", desc: "Aporte del backlog observado" },
  { col: "pred_inbound", etapa: "modelo", desc: "Aporte del inbound proyectado" },
  { col: "pred_reintentos", etapa: "modelo", desc: "Aporte de los reintentos" },
  { col: "y_carga", etapa: "target", desc: "TARGET · piezas que salieron a ruta el día D" },
  { col: "y_paradas", etapa: "target", desc: "TARGET · paradas únicas atendidas el día D" },
  { col: "y_rutas", etapa: "target", desc: "TARGET · rutas efectivamente operadas el día D" },
  { col: "y_censurado", etapa: "target", desc: "El día estuvo saturado: y_carga es un LÍMITE INFERIOR, no la demanda real (§6)" },
  { col: "residual", etapa: "modelo", desc: "y_carga − pred_media. Es lo que A4 debe explicar" },
];

// Índice de salida por día de creación. Permite contar el backlog de cualquier
// corte con una búsqueda binaria en vez de recorrer todas las órdenes por fila.
function indiceBacklog(creacion, { estatusBacklog = [], salidaConocida = null } = {}) {
  const setB = new Set(estatusBacklog.map(norm));
  const porCreacion = new Map();
  const SIN_SALIDA = "9999-99-99";
  for (const o of creacion) {
    if (!o.creacion) continue;
    // Esta cadena replica EXACTAMENTE la de backlogAlCorte, incluido el caso sin
    // lista de estatus (la orden se queda en backlog). No es un detalle: si las
    // dos divergen, backlog_total y backlog_edad_* del dataset dejan de sumar y
    // nadie lo nota hasta que el modelo entrenado se comporta raro.
    const sal = (salidaConocida ? salidaConocida(o) : null) || o.entrega ||
      (setB.size > 0 && !setB.has(norm(o.estatus)) ? "0000-00-00" : null);
    if (!porCreacion.has(o.creacion)) porCreacion.set(o.creacion, []);
    porCreacion.get(o.creacion).push(sal || SIN_SALIDA);
  }
  for (const arr of porCreacion.values()) arr.sort();
  return {
    // Órdenes creadas en `dia` que al cierre de `corte` seguían en almacén.
    pendientes(dia, corte) {
      const arr = porCreacion.get(dia);
      if (!arr) return 0;
      let lo = 0, hi = arr.length;                 // primer índice con salida > corte
      while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] <= corte) lo = mid + 1; else hi = mid; }
      return arr.length - lo;
    },
  };
}

// Herfindahl sobre una distribución de conteos. 1 = todo en una categoría.
function hhi(conteos) {
  const tot = conteos.reduce((s, x) => s + x, 0);
  if (!tot) return null;
  return conteos.reduce((s, x) => s + (x / tot) ** 2, 0);
}

// Radio: distancia media de las paradas a su centroide. Es la medida de
// dispersión que le importa al ruteador — 40 paquetes en tres colonias y 40
// repartidos en toda la zona tienen el mismo conteo y distinta jornada (§3).
function radioKm(pts) {
  if (pts.length < 2) return 0;
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  return pts.reduce((s, p) => s + haversine({ lat, lng }, p), 0) / pts.length;
}

export function construirDataset({
  creacion = [], piezas = [], rutas = [],
  leadDias = 2, estatusBacklog = [], tasasReintento = {}, incluirSinRegistro = true,
  tasaExcepcion = 0, tauReintento = 0.8, factoresCalendario = {}, eventosExtra = [],
  ventanaHazard = 120, ventanaMovil = 14, minHistoria = 7, onProgress = null,
  objetivos: objetivosPedidos = null, corregirCensura = true, umbralSaturacion = 25,
} = {}) {
  const { serie: cargaReal, fuente } = serieCargaReal({ piezas, rutas });
  const diasCreacion = [...new Set(creacion.map(o => o.creacion).filter(Boolean))].sort();
  const diasSalida = Array.from(cargaReal.keys()).sort();
  if (!diasCreacion.length || (!diasSalida.length && !objetivosPedidos)) {
    return { filas: [], columnas: DICCIONARIO_DATASET, motivo: "Faltan creación o salidas para construir la tabla.", fuente };
  }

  // ---- Índices ----
  const mapaSalida = new Map();
  for (const p of piezas) if (p.tracking && p.movimiento) mapaSalida.set(p.tracking, p.movimiento);
  const salidaConocida = mapaSalida.size ? (o => mapaSalida.get(o.tracking) || null) : null;
  const idxBacklog = indiceBacklog(creacion, { estatusBacklog, salidaConocida });

  const creacionPorDia = new Map();
  for (const o of creacion) if (o.creacion) creacionPorDia.set(o.creacion, (creacionPorDia.get(o.creacion) || 0) + 1);

  const piezasPorMov = new Map();
  for (const p of piezas) if (p.movimiento) { if (!piezasPorMov.has(p.movimiento)) piezasPorMov.set(p.movimiento, []); piezasPorMov.get(p.movimiento).push(p); }

  const rutasPorDia = new Map();
  for (const r of rutas) if (r.dia) { if (!rutasPorDia.has(r.dia)) rutasPorDia.set(r.dia, []); rutasPorDia.get(r.dia).push(r); }
  const satTodos = diasSaturados(rutas, { umbralPct: umbralSaturacion });

  const itemsPorCreacion = new Map();
  const fuenteCurva = piezas.some(p => p.movimiento) ? "piezas" : "creacion";
  const items = fuenteCurva === "piezas"
    ? piezas.map(p => ({ creacion: p.creacion, salida: p.movimiento }))
    : creacion.map(o => ({ creacion: o.creacion, salida: o.entrega }));
  for (const it of items) if (it.creacion) { if (!itemsPorCreacion.has(it.creacion)) itemsPorCreacion.set(it.creacion, []); itemsPorCreacion.get(it.creacion).push(it); }

  const primero = [diasCreacion[0], ...(diasSalida.length ? [diasSalida[0]] : [])].sort()[0];
  const ultimo = diasSalida[diasSalida.length - 1] || diasCreacion[diasCreacion.length - 1];
  const filas = [];
  // `objetivos` explícito sirve para dos cosas: auditar el point-in-time de una
  // fila concreta, y —lo importante en operación— construir la fila de un día
  // que TODAVÍA NO OCURRIÓ, que es la que se le pasa al modelo entrenado para
  // planear. En ese caso los campos y_* quedan nulos en vez de cero: un día sin
  // observar no es un día con cero carga, y confundirlos envenena el
  // entrenamiento con filas de target falso.
  const objetivos = objetivosPedidos && objetivosPedidos.length
    ? [...objetivosPedidos].sort()
    : rangoDias(sumarDias(primero, minHistoria + leadDias), ultimo);

  objetivos.forEach((D, i) => {
    if (onProgress && i % 20 === 0) onProgress(Math.round(100 * i / objetivos.length));
    const corte = sumarDias(D, -leadDias);
    if (corte < primero) return;

    // Todo lo que entra al modelo se recorta aquí. Es el único lugar donde se
    // decide qué es "pasado" y por eso es el único que hay que auditar.
    //
    // Los objetivos van en orden ascendente, así que el corte también: en vez
    // de refiltrar las decenas de miles de órdenes en cada fila, se avanza un
    // puntero sobre las listas ya ordenadas. El recorte es idéntico —el audit de
    // point-in-time lo verifica— pero deja de ser cuadrático.
    // No hace falta materializar el recorte: perfilInbound, backlogAlCorte y
    // pronosticarCargaMultiDia ya descartan internamente todo lo posterior al
    // corte. Copiar los arreglos en cada fila era lo que volvía cuadrática la
    // construcción. El audit de point-in-time verifica que el recorte interno
    // sea equivalente al externo.
    const creacionPIT = creacion;
    const rutasPIT = rutas;
    // Backlog e inbound salen de los índices construidos una sola vez arriba.
    let blTotal = 0, blAnejo = 0;
    const blPorEdad = [];
    for (let a = 0; a <= 30; a++) {
      const n = idxBacklog.pendientes(sumarDias(corte, -a), corte);
      if (!n) continue;
      blPorEdad.push({ edad: a, n }); blTotal += n; if (a >= 5) blAnejo += n;
    }
    const blCorte = { total: blTotal, porEdad: blPorEdad, anejo: blAnejo, pctAnejo: blTotal ? 100 * blAnejo / blTotal : 0 };
    const perfilCorte = perfilInbound(creacion, corte, { factores: factoresCalendario, eventosExtra, porDia: creacionPorDia });
    const ventanaItems = [];
    for (const d of rangoDias(sumarDias(corte, -ventanaHazard + 1), corte)) {
      const arr = itemsPorCreacion.get(d);
      if (arr) ventanaItems.push(...arr);
    }
    if (!ventanaItems.length) return;

    // Los días saturados hasta el corte se descartan del estimador de riesgo:
    // en un día racionado, no salir no significa no querer salir (§6).
    // No hace falta recortar el conjunto al corte: por construcción, el rezago
    // de cualquier orden creada antes del corte cae en un día ≤ corte, así que
    // los días saturados posteriores nunca se consultan.
    const satPIT = corregirCensura ? satTodos.conRebote : null;
    const curva = curvaMaduracion(ventanaItems, corte, { saturados: satPIT });
    const pron = pronosticarCargaMultiDia({
      creacion: creacionPIT, curva, corteISO: corte, objetivoISO: D,
      estatusBacklog,
      salidaConocida: salidaConocida ? (o => { const s = salidaConocida(o); return s && s <= corte ? s : null; }) : null,
      rutas: rutasPIT, tasasReintento, incluirSinRegistro, tasaExcepcion, tauReintento,
      factoresCalendario, eventosExtra, perfil: perfilCorte, backlog: blCorte,
    });
    if (!pron) return;

    const cal = calendarioMX(D, { eventosExtra });
    const fc = factorCalendario(pron.perfil, D);
    const porEdadMapa = new Map(blPorEdad.map(e => [e.edad, e.n]));
    const edad = (a) => porEdadMapa.get(a) || 0;
    const sumaEdades = (desde, hasta) => { let s = 0; for (let a = desde; a <= hasta; a++) s += edad(a); return s; };

    // Ventana móvil de ejecución y geografía, siempre cerrada en el corte.
    const diasMovil = rangoDias(sumarDias(corte, -ventanaMovil + 1), corte);
    const rutasMovil = diasMovil.flatMap(d => rutasPorDia.get(d) || []);
    const cargadasMovil = rutasMovil.reduce((s, r) => s + r.total, 0);
    const excepMovil = rutasMovil.reduce((s, r) => s + r.excepciones, 0);
    const minMovil = rutasMovil.filter(r => r.entregados > 0 && r.horasRuta > 0).map(r => (r.horasRuta * 60) / r.entregados);
    const horasMovil = rutasMovil.map(r => r.horasRuta).filter(h => h > 0);
    const medMin = mediana(minMovil), medHoras = mediana(horasMovil);
    const censMovil = rutasMovil.filter(r => r.sinRegistro > 0).length;

    const geoDias = diasMovil.map(d => piezasPorMov.get(d) || []).filter(a => a.length);
    const paradasPorDia = geoDias.map(arr => colapsarParadas(arr).length).filter(x => x > 0);
    const piezasGeo = geoDias.flat().filter(p => p.lat != null && p.lng != null);
    const muniConteo = {};
    for (const p of geoDias.flat()) if (p.municipio) muniConteo[p.municipio] = (muniConteo[p.municipio] || 0) + 1;
    const muniPorDia = geoDias.map(arr => new Set(arr.map(p => p.municipio).filter(Boolean)).size).filter(x => x > 0);

    // Día previo al corte para las fallidas observadas de A2.
    const prevRutas = rutasPorDia.get(corte) || rutasPorDia.get(sumarDias(corte, -1)) || [];

    // ---- Target ----
    const piezasD = piezasPorMov.get(D) || [];
    const rutasD = rutasPorDia.get(D) || [];
    // Día no observado ⇒ target nulo, NO cero. Un día del que no hay registro no
    // es un día de cero carga; meterlo como cero enseña caídas que no pasaron.
    const observado = D <= ultimo && (cargaReal.has(D) || rutasPorDia.has(D));
    const yCarga = observado ? (cargaReal.get(D) ?? 0) : null;
    const yParadas = piezasD.length ? colapsarParadas(piezasD).length : null;
    // §6: un día saturado NO es una observación de demanda, es una cota
    // inferior. Marcarlo es lo que evita que el modelo aprenda un techo falso.
    const yCensurado = rutasD.some(r => r.sinRegistro > 0 || (r.total > 0 && r.entregados + r.excepciones < r.total));

    const cp = pron.componentes;
    filas.push({
      dia: D, corte, lead_dias: leadDias,
      dow: cal.dow, es_feriado: cal.esFeriado ? 1 : 0, feriado: cal.feriado || "",
      campanas: cal.eventos.join("|"), es_quincena: cal.esQuincena ? 1 : 0, es_habil: cal.habil ? 1 : 0,
      factor_calendario: round4(fc.factor),
      backlog_total: pron.backlog.total, backlog_anejo_5mas: pron.backlog.anejo,
      backlog_edad_0: edad(0), backlog_edad_1: edad(1), backlog_edad_2: edad(2),
      backlog_edad_3: edad(3), backlog_edad_4: edad(4),
      backlog_edad_5a7: sumaEdades(5, 7), backlog_edad_8mas: sumaEdades(8, 30),
      inbound_lag_1: creacionPorDia.get(corte) ?? 0,
      inbound_lag_2: creacionPorDia.get(sumarDias(corte, -1)) ?? 0,
      inbound_lag_3: creacionPorDia.get(sumarDias(corte, -2)) ?? 0,
      inbound_lag_7: creacionPorDia.get(sumarDias(corte, -6)) ?? 0,
      inbound_media_28d: round2(media(rangoDias(sumarDias(corte, -27), corte).map(d => creacionPorDia.get(d) ?? 0))),
      inbound_dow_media: round2(pron.perfil.dow[cal.dow]?.media),
      inbound_dow_n: pron.perfil.dow[cal.dow]?.n ?? 0,
      h_0: round4(curva.h[0]), h_1: round4(curva.h[1]), h_2: round4(curva.h[2]), h_3: round4(curva.h[3]),
      mediana_maduracion: curva.medianaK, maduracion_n: curva.observaciones, maduracion_censuradas: curva.censuradas,
      fallidas_total: prevRutas.reduce((s, r) => s + r.excepciones, 0),
      fallidas_311: prevRutas.reduce((s, r) => s + (r.motivos["311"] || 0), 0),
      fallidas_314: prevRutas.reduce((s, r) => s + (r.motivos["314"] || 0), 0),
      fallidas_318: prevRutas.reduce((s, r) => s + (r.motivos["318"] || 0), 0),
      sin_registro: prevRutas.reduce((s, r) => s + r.sinRegistro, 0),
      tasa_excepcion_14d: cargadasMovil > 0 ? round4(excepMovil / cargadasMovil) : null,
      rutas_14d: round2(rutasMovil.length / Math.max(1, diasMovil.filter(d => rutasPorDia.has(d)).length)),
      min_por_entrega_14d: round2(medMin), horas_ruta_14d: round2(medHoras),
      capacidad_jornada: medMin > 0 && medHoras > 0 ? Math.floor((medHoras * 60) / medMin) : null,
      pct_entrega_14d: round2(mediana(rutasMovil.map(r => r.pct).filter(x => x > 0))),
      pct_censuradas_14d: rutasMovil.length ? round2(100 * censMovil / rutasMovil.length) : null,
      paradas_14d: round2(mediana(paradasPorDia)),
      piezas_por_parada_14d: paradasPorDia.length ? round3(piezasGeo.length / paradasPorDia.reduce((s, x) => s + x, 0)) : null,
      municipios_14d: round2(mediana(muniPorDia)),
      hhi_municipio: round4(hhi(Object.values(muniConteo))),
      radio_km: round2(piezasGeo.length ? radioKm(piezasGeo) : null),
      pred_media: round2(pron.media), pred_desv: round2(pron.desv),
      pred_backlog: round2(cp.backlog.media), pred_inbound: round2(cp.inbound.media), pred_reintentos: round2(cp.reintentos.media),
      y_carga: yCarga, y_paradas: yParadas, y_rutas: observado ? rutasD.length : null,
      y_censurado: observado ? (yCensurado ? 1 : 0) : null,
      residual: yCarga == null ? null : round2(yCarga - pron.media),
    });
  });
  onProgress?.(100);

  const censuradas = filas.filter(f => f.y_censurado).length;
  return {
    filas, columnas: DICCIONARIO_DATASET, fuente, fuenteCurva,
    meta: {
      filas: filas.length, desde: filas[0]?.dia, hasta: filas[filas.length - 1]?.dia,
      leadDias, ventanaHazard, ventanaMovil,
      censuradas, pctCensuradas: filas.length ? 100 * censuradas / filas.length : 0,
      columnasVacias: DICCIONARIO_DATASET.filter(c => filas.every(f => f[c.col] == null || f[c.col] === "")).map(c => c.col),
    },
  };
}

const round2 = (v) => (v == null || !isFinite(v)) ? null : Math.round(v * 100) / 100;
const round3 = (v) => (v == null || !isFinite(v)) ? null : Math.round(v * 1000) / 1000;
const round4 = (v) => (v == null || !isFinite(v)) ? null : Math.round(v * 10000) / 10000;

// ============================================================
// 6c. A4 · MODELO DE RESIDUAL
//
// §4 pide "LightGBM sobre el residual con features de negocio". LightGBM no
// corre en el navegador, así que aquí va un GBRT propio: árboles de regresión
// poco profundos, pérdida cuadrática, shrinkage y paro temprano. Es la misma
// familia de modelo, no un sustituto conceptual.
//
// Dos decisiones que no son negociables en series de tiempo:
//   · la validación es un BLOQUE FINAL contiguo, no aleatoria. Barajar filas
//     de días consecutivos filtra el futuro por la puerta de atrás: el árbol ve
//     el martes para predecir el lunes.
//   · el paro temprano se decide en esa validación, no en entrenamiento, y si
//     el modelo nunca mejora se devuelven CERO árboles — o sea, la capa se
//     apaga sola en vez de agregar ruido con cara de sofisticación.
//
// El FVA decide si esta capa se queda. Un residual que no se puede predecir es
// un resultado legítimo y frecuente: significa que A0–A2 ya se llevaron la señal.
// ============================================================

// Un árbol de regresión con búsqueda voraz sobre cortes binados. El binado
// (cuantiles de cada feature) evita evaluar n cortes por variable y hace el
// entrenamiento lineal en el número de bins, no en el de filas.
function construirArbol(X, grad, indices, { profundidad, minMuestras, bins }) {
  const nf = bins.length;
  const nodo = (idx, prof) => {
    const suma = idx.reduce((s, i) => s + grad[i], 0);
    const valor = idx.length ? suma / idx.length : 0;
    if (prof >= profundidad || idx.length < minMuestras * 2) return { hoja: true, valor };
    let mejor = null;
    const total = suma, n = idx.length;
    for (let f = 0; f < nf; f++) {
      const cortes = bins[f];
      if (!cortes.length) continue;
      for (const c of cortes) {
        let sIzq = 0, nIzq = 0;
        for (const i of idx) { const v = X[i][f]; if (v != null && v <= c) { sIzq += grad[i]; nIzq++; } }
        const nDer = n - nIzq;
        if (nIzq < minMuestras || nDer < minMuestras) continue;
        // Reducción de suma de cuadrados del corte (equivalente a la ganancia
        // de varianza y más barato de evaluar).
        const gan = (sIzq * sIzq) / nIzq + ((total - sIzq) ** 2) / nDer - (total * total) / n;
        if (!mejor || gan > mejor.gan) mejor = { gan, f, c, nIzq };
      }
    }
    if (!mejor || mejor.gan <= 1e-9) return { hoja: true, valor };
    const izq = [], der = [];
    for (const i of idx) { const v = X[i][mejor.f]; (v != null && v <= mejor.c ? izq : der).push(i); }
    if (!izq.length || !der.length) return { hoja: true, valor };
    return { hoja: false, f: mejor.f, c: mejor.c, izq: nodo(izq, prof + 1), der: nodo(der, prof + 1) };
  };
  return nodo(indices, 0);
}

const predecirArbol = (nodo, x) => {
  let n = nodo;
  while (!n.hoja) { const v = x[n.f]; n = (v != null && v <= n.c) ? n.izq : n.der; }
  return n.valor;
};

function binsDe(X, nBins = 24) {
  const nf = X[0]?.length || 0;
  const out = [];
  for (let f = 0; f < nf; f++) {
    const vals = X.map(r => r[f]).filter(v => v != null && isFinite(v));
    if (vals.length < 8) { out.push([]); continue; }
    const cortes = [];
    for (let b = 1; b < nBins; b++) {
      const q = cuantil(vals, b / nBins);
      if (q != null && (!cortes.length || q > cortes[cortes.length - 1] + 1e-12)) cortes.push(q);
    }
    out.push(cortes);
  }
  return out;
}

export function entrenarGBRT(X, y, {
  arboles = 200, profundidad = 3, lr = 0.05, minMuestras = 8, pctValidacion = 0.25, paciencia = 20, nBins = 24,
} = {}) {
  const n = X.length;
  if (n < 30) return { arboles: [], base: media(y) || 0, lr, motivo: `Sólo ${n} filas: por debajo del mínimo para entrenar sin sobreajustar.`, entrenado: false };
  // Bloque final contiguo como validación: es la única partición honesta en una
  // serie temporal. Las filas ya vienen en orden cronológico.
  const nVal = Math.max(10, Math.round(n * pctValidacion));
  const nTr = n - nVal;
  if (nTr < 20) return { arboles: [], base: media(y) || 0, lr, motivo: "No quedan suficientes filas de entrenamiento tras apartar la validación.", entrenado: false };
  const idxTr = Array.from({ length: nTr }, (_, i) => i);
  const bins = binsDe(X.slice(0, nTr), nBins);
  const base = media(y.slice(0, nTr)) || 0;

  const predTr = new Array(n).fill(base);
  const modelo = [];
  let mejorRmse = Infinity, mejorN = 0, sinMejorar = 0;
  const rmseVal = () => {
    let s = 0;
    for (let i = nTr; i < n; i++) s += (y[i] - predTr[i]) ** 2;
    return Math.sqrt(s / nVal);
  };
  mejorRmse = rmseVal();

  for (let t = 0; t < arboles; t++) {
    const grad = new Array(n).fill(0);
    for (let i = 0; i < nTr; i++) grad[i] = y[i] - predTr[i];
    const arbol = construirArbol(X, grad, idxTr, { profundidad, minMuestras, bins });
    for (let i = 0; i < n; i++) predTr[i] += lr * predecirArbol(arbol, X[i]);
    modelo.push(arbol);
    const r = rmseVal();
    if (r < mejorRmse - 1e-9) { mejorRmse = r; mejorN = modelo.length; sinMejorar = 0; }
    else if (++sinMejorar >= paciencia) break;
  }
  // Se recorta al mejor número de árboles visto en validación. Si nunca mejoró,
  // mejorN es 0 y el modelo queda vacío: predice la base y nada más.
  return {
    arboles: modelo.slice(0, mejorN), base, lr, entrenado: mejorN > 0,
    rmseValidacion: mejorRmse, nEntrenamiento: nTr, nValidacion: nVal,
    motivo: mejorN > 0 ? null : "Ningún árbol mejoró la validación: el residual no es predecible con estas features.",
  };
}

export const predecirGBRT = (modelo, x) =>
  modelo.base + modelo.arboles.reduce((s, a) => s + modelo.lr * predecirArbol(a, x), 0);

// Features de negocio del dataset que A4 puede usar. Se excluyen a propósito
// pred_* y los y_*: meter el propio pronóstico como feature deja que el árbol
// reconstruya el target por otro camino, y los targets son futuro.
export const FEATURES_RESIDUAL = [
  "dow", "es_feriado", "es_quincena", "es_habil", "factor_calendario",
  "backlog_total", "backlog_anejo_5mas", "backlog_edad_0", "backlog_edad_1", "backlog_edad_2",
  "inbound_lag_1", "inbound_lag_2", "inbound_lag_3", "inbound_lag_7", "inbound_media_28d",
  "inbound_dow_media", "h_0", "h_1", "h_2", "mediana_maduracion",
  "fallidas_total", "sin_registro", "tasa_excepcion_14d",
  "rutas_14d", "min_por_entrega_14d", "capacidad_jornada", "pct_entrega_14d", "pct_censuradas_14d",
  "paradas_14d", "piezas_por_parada_14d", "municipios_14d", "hhi_municipio", "radio_km",
];

// Entrena A4 sobre el dataset y mide su FVA en el bloque de validación.
//
// Los días censurados se EXCLUYEN del entrenamiento: su residual mide falta de
// camiones, no error del modelo, y aprender a predecirlo enseñaría a pronosticar
// la escasez de flota en vez de la demanda (§6).
export function modeloResidual(dataset, opts = {}) {
  const { features = FEATURES_RESIDUAL, excluirCensurados = true, ...gbrt } = opts;
  const filas = (dataset?.filas || [])
    .filter(f => f.residual != null && f.y_carga != null)
    .filter(f => !excluirCensurados || !f.y_censurado);
  const usables = features.filter(f => filas.some(r => r[f] != null));
  if (filas.length < 30) {
    return {
      entrenado: false, motivo: `Sólo ${filas.length} filas utilizables (se necesitan ≥30 no censuradas con target).`,
      filas: filas.length, features: usables, modelo: { arboles: [], base: 0, lr: 0, entrenado: false },
      nEntrenamiento: 0, nValidacion: 0, evalua: [],
      maeSin: null, maeCon: null, sesgoSin: null, sesgoCon: null, mejoraPct: null, pasa: false, importancia: [],
    };
  }
  const X = filas.map(r => usables.map(f => (typeof r[f] === "number" && isFinite(r[f]) ? r[f] : null)));
  const y = filas.map(r => r.residual);
  const modelo = entrenarGBRT(X, y, gbrt);

  const nVal = modelo.nValidacion || 0;
  const desde = filas.length - nVal;
  const evalua = [];
  for (let i = desde; i < filas.length; i++) {
    const corr = modelo.entrenado ? predecirGBRT(modelo, X[i]) : 0;
    evalua.push({
      dia: filas[i].dia, real: filas[i].y_carga,
      sinA4: filas[i].pred_media, conA4: filas[i].pred_media + corr, correccion: corr,
    });
  }
  const maeSin = media(evalua.map(e => Math.abs(e.real - e.sinA4)));
  const maeCon = media(evalua.map(e => Math.abs(e.real - e.conA4)));
  const sesgoSin = media(evalua.map(e => e.sinA4 - e.real));
  const sesgoCon = media(evalua.map(e => e.conA4 - e.real));
  const mejora = maeSin > 0 ? 100 * (maeSin - maeCon) / maeSin : 0;

  // Importancia por reducción de error acumulada, para poder decir QUÉ está
  // explicando el residual y no sólo cuánto.
  const importancia = new Array(usables.length).fill(0);
  const recorrer = (nodo) => { if (nodo.hoja) return; importancia[nodo.f]++; recorrer(nodo.izq); recorrer(nodo.der); };
  for (const a of modelo.arboles) recorrer(a);
  const totalImp = importancia.reduce((s, x) => s + x, 0);

  return {
    entrenado: modelo.entrenado, motivo: modelo.motivo, modelo, features: usables,
    filas: filas.length, nEntrenamiento: modelo.nEntrenamiento, nValidacion: nVal,
    evalua, maeSin, maeCon, sesgoSin, sesgoCon, mejoraPct: mejora,
    // §8: la capa entra sólo si mejora ≥5% y no empeora el sesgo en valor absoluto.
    pasa: modelo.entrenado && mejora >= 5 && Math.abs(sesgoCon) <= Math.abs(sesgoSin) + 1e-9,
    importancia: usables.map((f, i) => ({ feature: f, cortes: importancia[i], pct: totalImp ? 100 * importancia[i] / totalImp : 0 }))
      .filter(x => x.cortes > 0).sort((a, b) => b.cortes - a.cortes),
  };
}

// ============================================================
// 7. BACKTEST — rolling-origin con corte en D−leadDias (§7)
// ============================================================

// Serie diaria de carga real: piezas que efectivamente salieron a ruta ese día.
// Preferimos el reporte de piezas (fecha de primer movimiento) porque es a nivel
// pieza; si no está, se usa lo cargado por ruta.
export function serieCargaReal({ piezas = [], rutas = [] }) {
  const m = new Map();
  if (piezas.some(p => p.movimiento)) {
    for (const p of piezas) if (p.movimiento) m.set(p.movimiento, (m.get(p.movimiento) || 0) + 1);
    return { serie: m, fuente: "piezas (primer movimiento)" };
  }
  for (const r of rutas) if (r.dia) m.set(r.dia, (m.get(r.dia) || 0) + r.total);
  return { serie: m, fuente: "rutas (piezas cargadas)" };
}

// Pérdida de cuantil (pinball ×2). WQL = Σ QL / Σ|y|, la métrica de §7 para el
// único horizonte que decide algo.
export const perdidaCuantil = (y, yhat, q) => 2 * (q * Math.max(y - yhat, 0) + (1 - q) * Math.max(yhat - y, 0));

export function backtest({
  creacion = [], piezas = [], rutas = [],
  leadDias = 2, estatusBacklog = [], tasasReintento = {}, incluirSinRegistro = true,
  tasaExcepcion = 0, tauReintento = 0.8,
  factoresCalendario = {}, eventosExtra = [],
  corregirCensura = true, umbralSaturacion = 25,
  tipos = TIPOS_UNIDAD_DEFAULT, cFaltante = 0, cOcioso = 0, qObjetivo = null,
  capacidadUnidad = null,
  minHistoria = 14, ps = [0.1, 0.25, 0.5, 0.75, 0.9], factorParada = 1,
} = {}) {
  const { serie, fuente } = serieCargaReal({ piezas, rutas });
  const dias = Array.from(serie.keys()).sort();
  if (dias.length < 2) {
    return { folds: [], suficiente: false, motivo: `Sólo ${dias.length} día(s) con salidas. El backtest de §7 pide 12 folds; cada fold necesita ${minHistoria} días previos.`, fuente, diasDisponibles: dias.length };
  }
  const mapaSalida = new Map();
  for (const p of piezas) if (p.tracking && p.movimiento) mapaSalida.set(p.tracking, p.movimiento);

  const items = piezas.length
    ? piezas.map(p => ({ creacion: p.creacion, salida: p.movimiento }))
    : creacion.map(o => ({ creacion: o.creacion, salida: o.entrega }));
  const satBT = diasSaturados(rutas, { umbralPct: umbralSaturacion });

  // Capacidad media por unidad para prorratear el día ocioso a $/parada (ver
  // quantilObjetivo). Si no se pasa, se toma el techo medio de los tipos activos.
  const capU = capacidadUnidad != null ? capacidadUnidad
    : (media(tipos.map(t => (t.techoEfectivo != null ? t.techoEfectivo : t.techo))) || 1);
  const q = qObjetivo != null ? qObjetivo : quantilObjetivo(cFaltante, cOcioso, { capacidadUnidad: capU });
  const folds = [];
  // La historia se cuenta desde la primera CREACIÓN, no desde la primera salida:
  // es lo que alimenta la curva de maduración y el perfil de inbound.
  const primero = [...creacion.map(o => o.creacion), ...dias].filter(Boolean).sort()[0];
  for (const D of dias) {
    const corte = sumarDias(D, -leadDias);
    const historia = diffDias(primero, corte);
    if (historia == null || historia < minHistoria) continue;
    // Point-in-time (§6): TODO lo que entra al modelo se corta en `corte`.
    const curva = curvaMaduracion(items.filter(x => x.creacion && x.creacion <= corte), corte,
      { saturados: corregirCensura ? satBT.conRebote : null });
    const pron = pronosticarCargaMultiDia({
      creacion: creacion.filter(o => o.creacion <= corte), curva, corteISO: corte, objetivoISO: D,
      estatusBacklog,
      salidaConocida: mapaSalida.size ? (o => { const s = mapaSalida.get(o.tracking); return s && s <= corte ? s : null; }) : null,
      rutas, tasasReintento, incluirSinRegistro, tasaExcepcion, tauReintento,
      factoresCalendario, eventosExtra,
    });
    if (!pron) continue;
    const real = serie.get(D) || 0;
    const qs = ps.map(p => ({ p, valor: cargaEnCuantil(pron, p) }));
    const ql = qs.reduce((s, x) => s + perdidaCuantil(real, x.valor, x.p), 0) / ps.length;
    const p50 = cargaEnCuantil(pron, 0.5);
    // Naive estacional (m=7); con menos de 8 días, el del día anterior.
    const naive = serie.get(sumarDias(D, -7)) ?? serie.get(sumarDias(D, -1)) ?? p50;

    // FVA (§7): pérdida de cada capa acumulada, para saber cuánto agrega cada
    // una. Sale gratis de los componentes que pronosticarCarga ya devolvió —no
    // hay que re-correr el modelo— porque media y varianza son aditivas por
    // construcción. La capa naive es el punto de comparación obligado: una capa
    // que no le gane no merece estar en producción.
    const cp = pron.componentes;
    const capa = (m, v) => {
      const sd = Math.sqrt(Math.max(v, 0));
      const q = ps.map(p => ({ p, valor: Math.max(0, Math.round(m + zDeCuantil(p) * sd)) }));
      return {
        ql: q.reduce((s, x) => s + perdidaCuantil(real, x.valor, x.p), 0) / ps.length,
        absErr: Math.abs(real - Math.max(0, Math.round(m))),
        sesgo: Math.max(0, Math.round(m)) - real,
      };
    };
    const capas = {
      naive: { ql: perdidaCuantil(real, naive, 0.5), absErr: Math.abs(real - naive), sesgo: naive - real },
      A0: capa(cp.backlog.media, cp.backlog.varianza),
      A0_A1: capa(cp.backlog.media + cp.inbound.media, cp.backlog.varianza + cp.inbound.varianza),
      completo: { ql, absErr: Math.abs(real - p50), sesgo: p50 - real },
    };

    // Etapa B/C sobre el mismo fold: lo que se evalúa son UNIDADES, no paquetes.
    const paradasPron = Math.round(cargaEnCuantil(pron, q) / (factorParada || 1));
    const paradasReal = Math.round(real / (factorParada || 1));
    const planPron = asignarUnidades(paradasPron, tipos);
    const planReal = asignarUnidades(paradasReal, tipos);
    const capPron = planPron.plan.reduce((s, t) => s + t.n * (t.techoEfectivo != null ? t.techoEfectivo : t.techo), 0);
    folds.push({
      dia: D, corte, real, p50, naive, qs, ql, capas,
      censurado: satBT.set.has(D),
      absErr: Math.abs(real - p50), absNaive: Math.abs(real - naive),
      dentroBanda: real >= cargaEnCuantil(pron, 0.1) && real <= cargaEnCuantil(pron, 0.9),
      unidadesPron: planPron.unidades, unidadesReal: planReal.unidades,
      errorUnidades: planPron.unidades - planReal.unidades,
      // §8 pide explícito que ninguna unidad salga bajo su piso. Se marca por
      // fold en vez de dejarlo implícito dentro del plan.
      bajoPiso: planPron.bajoPiso === true,
      utilizacion: capPron > 0 ? 100 * Math.min(paradasReal, capPron) / capPron : 0,
      faltantes: Math.max(0, paradasReal - capPron),
      costoPlan: planPron.costo,
      costoTotal: planPron.costo + Math.max(0, paradasReal - capPron) * (Number(cFaltante) || 0),
      pron,
    });
  }

  if (!folds.length) {
    return {
      folds: [], suficiente: false, fuente, diasDisponibles: dias.length,
      motivo: `Con ${dias.length} día(s) de salidas y un lead de ${leadDias} días no se alcanza ni un fold (${minHistoria} días de historia mínima). §7 pide 12 folds.`,
    };
  }
  const sumaReal = folds.reduce((s, f) => s + Math.abs(f.real), 0);
  const maeNaive = media(folds.map(f => f.absNaive));

  // FVA agregado. §8 pide que cada capa mejore el WQL ≥5% sobre la anterior en
  // los mismos folds y sin empeorar el sesgo — las dos condiciones, porque una
  // capa puede bajar el WQL a costa de sesgar, y eso se paga después en flota.
  const ORDEN = [["naive", "Naive estacional (m=7)"], ["A0", "A0 · Backlog observado"], ["A0_A1", "A0 + A1 · Inbound"], ["completo", "A0 + A1 + A2 · Reintentos"]];
  const fva = [];
  let previa = null;
  for (const [k, label] of ORDEN) {
    const wql = sumaReal > 0 ? folds.reduce((s, f) => s + f.capas[k].ql, 0) / sumaReal : null;
    const mae = media(folds.map(f => f.capas[k].absErr));
    const sesgo = media(folds.map(f => f.capas[k].sesgo));
    const mejora = previa && previa.wql > 0 ? 100 * (previa.wql - wql) / previa.wql : null;
    fva.push({
      capa: k, label, wql, mae, sesgo, mejoraPct: mejora,
      // "sin empeorar el sesgo" se lee en valor absoluto: pasar de −5 a +40 es
      // empeorar aunque el número crezca.
      sesgoEmpeora: previa ? Math.abs(sesgo) > Math.abs(previa.sesgo) + 1e-9 : false,
      pasa: mejora == null ? null : (mejora >= 5 && !(previa && Math.abs(sesgo) > Math.abs(previa.sesgo))),
    });
    previa = { wql, sesgo };
  }

  return {
    folds, fva, suficiente: folds.length >= 12, fuente, diasDisponibles: dias.length,
    metricas: {
      folds: folds.length,
      WQL: sumaReal > 0 ? folds.reduce((s, f) => s + f.ql, 0) / sumaReal : null,
      MASE: maeNaive > 0 ? media(folds.map(f => f.absErr)) / maeNaive : null,
      MAE: media(folds.map(f => f.absErr)),
      sesgo: media(folds.map(f => f.p50 - f.real)),
      cobertura: 100 * folds.filter(f => f.dentroBanda).length / folds.length,
      errorUnidadesMedio: media(folds.map(f => f.errorUnidades)),
      errorUnidadesAbs: media(folds.map(f => Math.abs(f.errorUnidades))),
      dentroDeUna: 100 * folds.filter(f => Math.abs(f.errorUnidades) <= 1).length / folds.length,
      diasBajoPiso: folds.filter(f => f.bajoPiso).length,
      utilizacion: media(folds.map(f => f.utilizacion)),
      faltantes: folds.reduce((s, f) => s + f.faltantes, 0),
      costoTotal: folds.reduce((s, f) => s + f.costoTotal, 0),
      // §6: en un día saturado `real` es una COTA INFERIOR de la demanda, no la
      // demanda. Medir el sesgo mezclando ambos tipos de día hace que un modelo
      // bien calibrado se vea sobreestimando. Se reportan por separado.
      diasCensurados: folds.filter(f => f.censurado).length,
      sesgoNoCensurados: media(folds.filter(f => !f.censurado).map(f => f.p50 - f.real)),
      coberturaNoCensurados: (() => {
        const nc = folds.filter(f => !f.censurado);
        return nc.length ? 100 * nc.filter(f => f.dentroBanda).length / nc.length : null;
      })(),
    },
    q,
  };
}

// §1 y §7: cuánto valdría bajar el lead time a un día. Se corre la MISMA política
// con corte en D−1 y se compara el costo total. Si la diferencia es grande,
// negociar el lead time rinde más que cualquier mejora de modelo.
export function valorLeadTime(args) {
  const d2 = backtest({ ...args, leadDias: 2 });
  const d1 = backtest({ ...args, leadDias: 1 });
  if (!d2.metricas || !d1.metricas) return { d2, d1, disponible: false };
  return {
    d2, d1, disponible: true,
    ahorro: d2.metricas.costoTotal - d1.metricas.costoTotal,
    pctAhorro: d2.metricas.costoTotal > 0 ? 100 * (d2.metricas.costoTotal - d1.metricas.costoTotal) / d2.metricas.costoTotal : 0,
    mejoraWQL: d2.metricas.WQL != null && d1.metricas.WQL != null ? d2.metricas.WQL - d1.metricas.WQL : null,
  };
}
