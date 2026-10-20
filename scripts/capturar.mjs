// Toma capturas de la consola para poder REVISARLA, no sólo compilarla.
//
//   node scripts/capturar.mjs            (requiere `npx next dev -p 3111`)
//
// Maneja Chrome por el protocolo DevTools: se lanza headless con depuración
// remota, se conecta por WebSocket y se le envían comandos Runtime.evaluate y
// Page.captureScreenshot. No hace falta Playwright ni Puppeteer —serían ~300 MB
// de navegadores descargados dentro del repo de alguien más— porque Chrome ya
// está instalado y su protocolo basta para escribir en el formulario, hacer
// clic y fotografiar.
//
// El login es la puerta: la consola no muestra nada sin autenticar, así que el
// script captura PRIMERO la pantalla de login y luego entra con el usuario de
// desarrollo para recorrer los módulos.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "capturas");
const URL_APP = process.env.URL_APP || "http://localhost:3111";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PUERTO = 9333;
const ANCHO = 1600, ALTO = 1000;

rmSync(SALIDA, { recursive: true, force: true });
mkdirSync(SALIDA, { recursive: true });

// El perfil va FUERA del repo. Dentro, Turbopack intenta leer el socket de
// Unix que Chrome deja ahí (SingletonSocket) y el servidor de desarrollo muere
// con "Operation not supported on socket (os error 102)" — un pánico que
// parece un error de CSS y no lo es.
const perfil = mkdtempSync(join(tmpdir(), "chrome-captura-"));
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PUERTO}`,
  `--window-size=${ANCHO},${ALTO}`, `--user-data-dir=${perfil}`,
  "--no-first-run", "--no-default-browser-check", "--hide-scrollbars",
  "--force-device-scale-factor=2",          // capturas nítidas
  "about:blank",
], { stdio: "ignore" });

const esperar = (ms) => new Promise(r => setTimeout(r, ms));

// Chrome tarda en abrir el puerto de depuración.
let objetivo = null;
for (let i = 0; i < 40 && !objetivo; i++) {
  await esperar(250);
  try {
    const r = await fetch(`http://127.0.0.1:${PUERTO}/json/list`);
    const pestañas = await r.json();
    objetivo = pestañas.find(t => t.type === "page");
  } catch { /* todavía no levanta */ }
}
if (!objetivo) { chrome.kill(); throw new Error("Chrome no abrió el puerto de depuración"); }

// Cliente mínimo del protocolo DevTools sobre WebSocket.
const ws = new WebSocket(objetivo.webSocketDebuggerUrl);
await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
let idMsg = 0;
const pendientes = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pendientes.has(m.id)) {
    const { ok, mal } = pendientes.get(m.id);
    pendientes.delete(m.id);
    m.error ? mal(new Error(m.error.message)) : ok(m.result);
  }
};
const cmd = (method, params = {}) => new Promise((ok, mal) => {
  const id = ++idMsg;
  pendientes.set(id, { ok, mal });
  ws.send(JSON.stringify({ id, method, params }));
});

await cmd("Page.enable");
await cmd("Runtime.enable");

const ir = async (url) => {
  await cmd("Page.navigate", { url });
  await esperar(2600);               // Next compila la ruta en el primer acceso
};
const js = async (expr) => {
  const r = await cmd("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  return r.result?.value;
};
const foto = async (nombre) => {
  const r = await cmd("Page.captureScreenshot", { format: "png" });
  const f = join(SALIDA, nombre + ".png");
  writeFileSync(f, Buffer.from(r.data, "base64"));
  console.log("  📸 " + nombre + ".png");
};

console.log(`Capturando ${URL_APP} …\n`);
await ir(URL_APP);
await foto("01-login");

// Entrar con el usuario de desarrollo. Se escribe en los campos por el setter
// nativo de React: asignar .value a secas no dispara onChange y el estado del
// componente se quedaría vacío.
console.log("  → autenticando");
await js(`(() => {
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  const campos = [...document.querySelectorAll("input")];
  const usuario = campos.find(i => i.type !== "password");
  const clave = campos.find(i => i.type === "password");
  const escribir = (el, v) => { set.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true })); };
  escribir(usuario, "almacen"); escribir(clave, "almacen2026*");
  return true;
})()`);
await esperar(400);
await js(`document.querySelector("form")?.requestSubmit?.() ||
         [...document.querySelectorAll("button")].find(b => /entrar|acceder|iniciar/i.test(b.textContent))?.click()`);
await esperar(3200);
await foto("02-dashboard");

// Recorrido por los módulos: se hace clic en el texto del sidebar.
const MODULOS = [
  ["03-envios", "Registrar Envíos"],
  ["04-ruteo", "Ruteo / Clusters"],
  ["05-costos", "Carga Flotilla"],
  ["06-carriers", "Carriers"],
  ["07-operadores", "Operadores"],
];
for (const [archivo, etiqueta] of MODULOS) {
  const ok = await js(`(() => {
    const b = [...document.querySelectorAll("aside button")]
      .find(x => x.textContent.trim().toLowerCase().includes(${JSON.stringify(etiqueta.toLowerCase())}));
    if (!b) return false; b.click(); return true;
  })()`);
  if (!ok) { console.log(`  ⚠ no encontré "${etiqueta}" en el sidebar`); continue; }
  await esperar(2200);
  console.log("  → " + etiqueta);
  await foto(archivo);
}

// El tema oscuro sigue disponible: hay que verificar que no se rompió al
// cambiar el defecto a claro.
console.log("  → tema oscuro");
await js(`[...document.querySelectorAll("header button")].find(b => /tema/i.test(b.title || ""))?.click()`);
await esperar(1200);
await foto("08-tema-oscuro");

ws.close();
chrome.kill();
// Chrome sigue escribiendo su perfil un instante después de morir; si la
// limpieza falla no importa, es un temporal del sistema.
try { rmSync(perfil, { recursive: true, force: true }); } catch {}
console.log(`\n✓ capturas en ${SALIDA}`);
