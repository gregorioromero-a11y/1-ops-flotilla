// Prueba del HTML exportable del mapa.
//
//   node scripts/mapaHtmlTest.mjs [--guardar]
//
// El export se rompía en silencio: bastaba un número de guía con una comilla
// para dejar un bindPopup("…") sin cerrar, y entonces TODO el script tronaba y
// el archivo abría en blanco. Sin mapa, sin error, sin pista de qué pasó.
//
// Este test genera el HTML con el archivo de prueba más una tanda de valores
// hostiles, y verifica que el JavaScript resultante sea sintácticamente válido.
// Node compila el script extraído: si algo quedó sin escapar, truena aquí y no
// en la computadora de un proveedor.
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import vm from "node:vm";
import { cargarRuteo } from "./cargarRuteo.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const GUARDAR = process.argv.includes("--guardar");

// mapaHtml.js es ESM pero el package.json de la app no declara "type":"module";
// mismo truco que cargarRuteo.mjs.
const src = readFileSync(join(AQUI, "..", "src", "lib", "mapaHtml.js"), "utf8");
const dir = mkdtempSync(join(tmpdir(), "mapa-"));
writeFileSync(join(dir, "mapaHtml.mjs"), src);
const { mapaRuteoHTML } = await import(pathToFileURL(join(dir, "mapaHtml.mjs")).href);

writeFileSync(join(dir, "leafletInline.mjs"),
  readFileSync(join(AQUI, "..", "src", "lib", "leafletInline.js"), "utf8"));
const { LEAFLET_CSS, LEAFLET_JS, LEAFLET_VERSION } = await import(pathToFileURL(join(dir, "leafletInline.mjs")).href);
writeFileSync(join(dir, "geoZmvm.mjs"),
  readFileSync(join(AQUI, "..", "src", "lib", "geoZmvm.js"), "utf8"));
const { ZMVM } = await import(pathToFileURL(join(dir, "geoZmvm.mjs")).href);
console.log(`Leaflet ${LEAFLET_VERSION} + ${ZMVM.length} zonas de la ZMVM empotrados · ${((LEAFLET_CSS.length + LEAFLET_JS.length) / 1024).toFixed(0)} KB\n`);

const R = await cargarRuteo();
const DEPOT = { lat: 19.3989, lng: -99.1168 };
const RCOLORS = ['#E63B2E','#2563EB','#16A34A','#D97706','#7C3AED','#EC4899','#0891B2','#059669','#F97316','#4B5563'];

// --- Valores hostiles ---
// Cada uno rompía el export anterior o es un candidato realista a romperlo.
// El de </script> es el peor: no sólo corta el string, cierra el bloque y
// vuelca el resto del código como texto visible en la página.
const HOSTILES = [
  'T1-COMILLA"ROTA',
  "T1-APOSTROFE'ROTA",
  'T1-BARRA\\INVERSA',
  'T1-SALTO\nDE-LINEA',
  'T1-</script><script>alert(1)</script>',
  'T1-ACENTOS-ÑÁÉÍÓÚ-&-<b>negritas</b>',
  'T1-TAB\tADENTRO',
  'T1-RETORNO\r\nCRLF',
];

const filas = JSON.parse(readFileSync(join(AQUI, "fixtures", "guias-2263.json"), "utf8"));
const pts = filas.map(f => ({ lat: f.Latitud, lng: f.Longitud, guia: f["Tracking Number"] }));
// Se inyectan los hostiles en las primeras guías, conservando coordenadas.
HOSTILES.forEach((h, i) => { pts[i].guia = h; });

const P = { ...R.PARAMS_DEFAULT, agrupar: true, rho: 0, gamma: 1.3, alpha: 0.7, Rmax: 4, orOpt: true, inicios: 11 };
const out = R.rutear(pts, 20, DEPOT, P);

// posPorFila en base 1, como lo arma la UI.
const posPorFila = out.seqOrder.map(s => s + 1);

const casos = [
  {
    nom: "plan completo con guías hostiles",
    args: { puntos: pts, asignaciones: out.assigns, depot: DEPOT, colores: RCOLORS,
            rutasResumen: out.rutasResumen, posPorFila, etaPorFila: out.eta,
            guiaKey: "guia", rho: 0, leafletCss: LEAFLET_CSS, leafletJs: LEAFLET_JS, zonas: ZMVM },
  },
  {
    nom: "sin resumen ni secuencia (sesión cargada del histórico)",
    args: { puntos: pts.slice(0, 50), asignaciones: out.assigns.slice(0, 50), depot: DEPOT,
            colores: RCOLORS, guiaKey: "guia", leafletCss: LEAFLET_CSS, leafletJs: LEAFLET_JS, zonas: ZMVM },
  },
  {
    nom: "con puntos excluidos (cluster -1)",
    args: { puntos: pts.slice(0, 30), asignaciones: pts.slice(0, 30).map((_, i) => i % 5 === 0 ? -1 : 0),
            depot: DEPOT, colores: RCOLORS, guiaKey: "guia", leafletCss: LEAFLET_CSS, leafletJs: LEAFLET_JS, zonas: ZMVM },
  },
  {
    nom: "sin puntos",
    args: { puntos: [], asignaciones: [], depot: DEPOT, colores: RCOLORS, leafletCss: LEAFLET_CSS, leafletJs: LEAFLET_JS, zonas: ZMVM },
  },
  {
    nom: "rho=1 (dibuja el regreso al depósito)",
    args: { puntos: pts.slice(0, 80), asignaciones: out.assigns.slice(0, 80), depot: DEPOT,
            colores: RCOLORS, rutasResumen: out.rutasResumen, posPorFila: posPorFila.slice(0, 80),
            etaPorFila: out.eta.slice(0, 80), guiaKey: "guia", rho: 1, leafletCss: LEAFLET_CSS, leafletJs: LEAFLET_JS, zonas: ZMVM },
  },
];

let fallas = 0;
for (const c of casos) {
  const html = mapaRuteoHTML(c.args);
  const errores = [];

  // 1. Todo bloque <script> debe compilar. Es la prueba que habría atrapado el
  //    bug original: un string sin cerrar es un SyntaxError.
  const bloques = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (!bloques.length) errores.push("no se encontró ningún bloque <script>");
  bloques.forEach((js, n) => {
    try { new vm.Script(js); }
    catch (e) { errores.push(`bloque <script> #${n + 1} no compila: ${e.message}`); }
  });

  // 2. Ningún dato debe haber cerrado el bloque antes de tiempo. Si un hostil
  //    se coló crudo, aparecería un <script> de más. Son tres: la librería, la
  //    red de seguridad que avisa si no cargó, y el código del mapa.
  const abre = (html.match(/<script\b/g) || []).length;
  const cierra = (html.match(/<\/script>/g) || []).length;
  if (abre !== cierra) errores.push(`etiquetas <script> desbalanceadas: ${abre} abren, ${cierra} cierran`);
  if (abre !== 3) errores.push(`se esperaban 3 bloques <script> y hay ${abre} (¿un dato inyectó uno?)`);

  // 3. El payload de inyección no debe aparecer ejecutable.
  if (/<script>alert\(1\)<\/script>/.test(html)) errores.push("inyección de <script> sin escapar");

  // 4. Lo básico de la estructura.
  for (const req of ['<div id="map">', "capaZonas", "L.control.layers", "server.arcgisonline.com", "#map{height:100%;width:100%;background:"]) {
    if (!html.includes(req)) errores.push(`falta en el HTML: ${req}`);
  }

  // 5. La librería tiene que estar DENTRO del archivo, no sólo referenciada.
  if (c.args.leafletJs && !/L\.Util|leaflet/i.test(html.slice(0, 4000) + html.slice(-200))) {
    errores.push("no se encontró rastro de Leaflet empotrado");
  }
  if (c.args.leafletJs && !/\bL\.map\b/.test(html)) errores.push("Leaflet empotrado pero no se usa L.map");

  // 6. AUTOSUFICIENCIA — la prueba que de verdad importa. El archivo se manda
  //    por correo y se abre con doble clic detrás de una VPN corporativa, así
  //    que no puede pedirle NADA a un CDN: un firewall bastaba para dejarlo en
  //    blanco, que fue la falla reportada.
  //
  //    Se inspecciona el MARCADO con los <script> ya removidos, y sólo las
  //    referencias que provocan una descarga: src=, href= de <link> y url() de
  //    CSS. Escanear el documento entero da falsos positivos —el código de
  //    Leaflet trae URLs en comentarios y un 'url(#default#VML)' heredado de
  //    IE, y la nota al usuario menciona unpkg.com en prosa—; ninguno de esos
  //    descarga nada. Las teselas del fondo se verifican aparte (punto 4): ésas
  //    sí vienen de la red porque empotrar el mapa de la ciudad no es viable.
  const marcado = html.replace(/<script\b[\s\S]*?<\/script>/g, "");
  const peticiones = [
    ...[...marcado.matchAll(/\bsrc=["']([^"']+)["']/g)].map(m => m[1]),
    ...[...marcado.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["']/g)].map(m => m[1]),
    ...[...marcado.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map(m => m[1]),
  ]
    // data: va empotrado; "#…" es una referencia a fragmento del propio
    // documento —la hoja de Leaflet trae un url(#default#VML) heredado de IE—;
    // "none" es lo que deja vendorLeaflet.mjs donde iban los PNG del tema.
    // Ninguno de los tres sale a la red.
    .filter(u => u && !u.startsWith("data:") && !u.startsWith("#") && u !== "none");

  if (c.args.leafletJs && peticiones.length) {
    errores.push(`el archivo pide recursos externos: ${[...new Set(peticiones)].slice(0, 3).join(" · ")}`);
  }

  if (errores.length) {
    fallas++;
    console.error(`✗ ${c.nom}`);
    for (const e of errores) console.error(`    ${e}`);
  } else {
    console.log(`✓ ${c.nom}  ·  ${(html.length / 1024).toFixed(0)} KB`);
  }

  if (GUARDAR && c.args.puntos.length) {
    const f = join(AQUI, `mapa-${c.nom.split(" ")[0]}.html`);
    writeFileSync(f, html);
    console.log(`    guardado: ${f}`);
  }
}

if (fallas) { console.error(`\n✗ ${fallas} caso(s) con problemas`); process.exit(1); }
console.log(`\n✓ ${casos.length} casos OK — el HTML aguanta guías con comillas, saltos de línea y </script>`);
