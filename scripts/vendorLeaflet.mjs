// Descarga Leaflet y lo deja empotrado en src/lib/leafletInline.js.
//
//   node scripts/vendorLeaflet.mjs
//
// POR QUÉ: el mapa que exporta ModuleRuteo se manda por correo a los
// proveedores y se abre con doble clic desde Descargas. Si la librería viene de
// unpkg.com, basta una VPN corporativa, un firewall o estar sin señal para que
// el archivo abra en blanco — que es justo lo que pasaba. Empotrada, el HTML
// funciona sin internet, hoy y dentro de dos años.
//
// El archivo generado se versiona en git a propósito: así el build no depende
// de que el CDN siga vivo, y el contenido queda fijo y auditable.
import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const VERSION = "1.9.4";
const BASE = `https://unpkg.com/leaflet@${VERSION}/dist/`;

const bajar = async (archivo) => {
  const url = BASE + archivo;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} respondió ${r.status}`);
  const txt = await r.text();
  const sha = createHash("sha256").update(txt).digest("base64");
  console.log(`  ${archivo.padEnd(14)} ${(txt.length / 1024).toFixed(0).padStart(4)} KB  sha256-${sha.slice(0, 24)}…`);
  return { txt, sha };
};

console.log(`Descargando Leaflet ${VERSION}…`);
const css = await bajar("leaflet.css");
const js = await bajar("leaflet.js");

// Las imágenes que la hoja pide por ruta relativa (images/*.png) se empotran
// como data: URI. Reemplazarlas por `none`, que fue el primer intento, deja sin
// icono al control de capas —se vuelve un cuadro blanco invisible— y rompe
// cualquier marcador por omisión. Son ~13 KB en total: sale más barato
// empotrarlas que andar evitando las partes de Leaflet que las usan.
const IMAGENES = ["layers.png", "layers-2x.png", "marker-icon.png", "marker-icon-2x.png", "marker-shadow.png"];
const dataUris = {};
for (const img of IMAGENES) {
  const r = await fetch(BASE + "images/" + img);
  if (!r.ok) throw new Error(`${BASE}images/${img} respondió ${r.status}`);
  const b64 = Buffer.from(await r.arrayBuffer()).toString("base64");
  dataUris[img] = `data:image/png;base64,${b64}`;
  console.log(`  images/${img.padEnd(20)} ${(b64.length / 1024).toFixed(0).padStart(3)} KB en base64`);
}
const sinImagenes = css.txt.replace(/url\((['"]?)images\/([^)'"]+)\1\)/g, (m, q, archivo) =>
  dataUris[archivo] ? `url(${dataUris[archivo]})` : "none");

const salida = `// ARCHIVO GENERADO — no editar a mano.
// Lo produce  node scripts/vendorLeaflet.mjs  a partir de Leaflet ${VERSION}.
//
// Leaflet empotrado como texto, para que el mapa exportado por ModuleRuteo no
// dependa de ningún CDN: se abre sin internet, detrás de una VPN corporativa o
// desde una carpeta de Descargas dentro de dos años. Antes venía de unpkg.com y
// un firewall bastaba para que el archivo abriera en blanco.
//
// Se importa de forma DIFERIDA (import() dentro del handler de exportar), así
// que estos ~${Math.round((css.txt.length + js.txt.length) / 1024)} KB no entran al bundle de quien nunca descarga un mapa.
//
// Integridad de lo descargado:
//   leaflet.css  sha256-${css.sha}
//   leaflet.js   sha256-${js.sha}

export const LEAFLET_VERSION = ${JSON.stringify(VERSION)};
export const LEAFLET_CSS = ${JSON.stringify(sinImagenes)};
export const LEAFLET_JS = ${JSON.stringify(js.txt)};
`;

const destino = join(AQUI, "..", "src", "lib", "leafletInline.js");
writeFileSync(destino, salida);
console.log(`\n✓ ${destino}`);
console.log(`  ${(salida.length / 1024).toFixed(0)} KB · se importa diferido, no pesa en el bundle principal`);
