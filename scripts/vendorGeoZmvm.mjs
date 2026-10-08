// Extrae y simplifica los polígonos de la ZMVM para empotrarlos en el mapa
// exportable.  →  src/lib/geoZmvm.js
//
//   node scripts/vendorGeoZmvm.mjs
//
// POR QUÉ: el mapa que se manda a los proveedores no puede depender de teselas.
// OpenStreetMap bloquea las peticiones desde archivos sueltos —devuelve un 403
// CON UNA IMAGEN DENTRO que dice "Access blocked", así que el navegador la da
// por buena y ni siquiera se puede detectar como error— y CARTO responde una
// tesela vacía de 2 049 bytes sin API key. Los dos proveedores gratuitos están
// descartados para este uso.
//
// La alternativa es dibujar el fondo con geometría propia. Las fronteras de
// alcaldías y municipios son, además, la referencia que de verdad usa quien
// opera: "esta ruta cubre Iztapalapa y Tláhuac" dice más que una calle.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
// Ventana de la Zona Metropolitana del Valle de México, con holgura.
const VENTANA = { oeste: -99.45, este: -98.80, sur: 19.00, norte: 19.80 };
// Tolerancia de simplificación en grados. 0.0005° ≈ 55 m: por debajo del grosor
// con que se dibuja la línea, así que no se nota y recorta el peso a la mitad.
const TOL = 0.0005;

const fuente = JSON.parse(readFileSync(join(AQUI, "..", "public", "geo", "municipios-inegi.json"), "utf8"));

const caja = (geom) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const rec = (c) => {
    if (typeof c[0] === "number") {
      if (c[0] < x0) x0 = c[0]; if (c[0] > x1) x1 = c[0];
      if (c[1] < y0) y0 = c[1]; if (c[1] > y1) y1 = c[1];
    } else for (const h of c) rec(h);
  };
  rec(geom.coordinates);
  return { x0, y0, x1, y1 };
};

// Douglas–Peucker. Un contorno de alcaldía trae miles de vértices del trazo
// catastral; a la escala en que se ve el mapa, la mayoría cae dentro del grosor
// de la línea.
const perpendicular = (p, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
};
const simplificar = (pts, tol) => {
  if (pts.length <= 3) return pts;
  let maxD = -1, ix = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpendicular(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) { maxD = d; ix = i; }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return [...simplificar(pts.slice(0, ix + 1), tol).slice(0, -1), ...simplificar(pts.slice(ix), tol)];
};

const redondear = (pts) => pts.map(p => [+p[0].toFixed(4), +p[1].toFixed(4)]);

let vIn = 0, vOut = 0;
const zonas = [];
for (const f of fuente.features) {
  const b = caja(f.geometry);
  if (b.x1 < VENTANA.oeste || b.x0 > VENTANA.este || b.y1 < VENTANA.sur || b.y0 > VENTANA.norte) continue;

  const anillos = f.geometry.type === "Polygon" ? f.geometry.coordinates
    : f.geometry.coordinates.flat();
  const partes = [];
  for (const anillo of anillos) {
    vIn += anillo.length;
    const s = redondear(simplificar(anillo, TOL));
    // Un anillo que queda en menos de 4 vértices ya no es un polígono.
    if (s.length < 4) continue;
    vOut += s.length;
    // Leaflet espera [lat, lng]; GeoJSON guarda [lng, lat].
    partes.push(s.map(([lng, lat]) => [lat, lng]));
  }
  if (!partes.length) continue;
  zonas.push({ n: f.properties.nombre, e: f.properties.estado || "", p: partes });
}

// Las más grandes primero: así los municipios conurbados quedan debajo y las
// alcaldías chicas encima, y ninguna se pierde bajo otra.
zonas.sort((a, b) => b.p[0].length - a.p[0].length);

const salida = `// ARCHIVO GENERADO — no editar a mano.
// Lo produce  node scripts/vendorGeoZmvm.mjs  desde public/geo/municipios-inegi.json
//
// Fronteras de las ${zonas.length} alcaldías y municipios de la ZMVM, simplificadas a
// ${TOL}° (≈55 m) y redondeadas a 4 decimales. Son el FONDO del mapa que exporta
// ModuleRuteo: no se pueden usar teselas porque OpenStreetMap bloquea las
// peticiones desde un archivo suelto y CARTO exige API key, así que el fondo se
// dibuja con geometría empotrada y el archivo funciona sin internet.
//
// Vértices: ${vIn.toLocaleString()} originales → ${vOut.toLocaleString()} (${(100 - vOut / vIn * 100).toFixed(0)} % menos).
// Formato: { n: nombre, e: estado, p: [ anillo[[lat,lng], …], … ] }

export const ZMVM = ${JSON.stringify(zonas)};
`;

const destino = join(AQUI, "..", "src", "lib", "geoZmvm.js");
writeFileSync(destino, salida);
console.log(`✓ ${destino}`);
console.log(`  ${zonas.length} zonas · ${vIn.toLocaleString()} → ${vOut.toLocaleString()} vértices (${(100 - vOut / vIn * 100).toFixed(0)} % menos)`);
console.log(`  ${(salida.length / 1024).toFixed(0)} KB`);
