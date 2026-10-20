// Captura la tarjeta de un proveedor concreto en el módulo de Carriers.
//
//   node scripts/verCarriers.mjs "EXACTO LOGISTICA" "EXCLUSI DELIVERY"
//
// Sirve para resolver reportes del tipo "se ve duplicado": en vez de discutir
// sobre lo que cada quien recuerda haber visto, se fotografía la tarjeta y se
// compara contra lo que tiene la base.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "capturas");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PUERTO = 9334;
const PROVEEDORES = process.argv.slice(2);
if (!PROVEEDORES.length) { console.error("Uso: node scripts/verCarriers.mjs \"NOMBRE DEL PROVEEDOR\" …"); process.exit(1); }

mkdirSync(SALIDA, { recursive: true });
const perfil = mkdtempSync(join(tmpdir(), "chrome-carriers-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PUERTO}`,
  "--window-size=1500,1100", `--user-data-dir=${perfil}`, "--no-first-run",
  "--hide-scrollbars", "--force-device-scale-factor=2", "about:blank"], { stdio: "ignore" });

const esperar = ms => new Promise(r => setTimeout(r, ms));
let objetivo = null;
for (let i = 0; i < 40 && !objetivo; i++) {
  await esperar(250);
  try { objetivo = (await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json()).find(t => t.type === "page"); } catch {}
}
const ws = new WebSocket(objetivo.webSocketDebuggerUrl);
await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (pend.has(m.id)) { const { ok, mal } = pend.get(m.id); pend.delete(m.id); m.error ? mal(new Error(m.error.message)) : ok(m.result); } };
const cmd = (method, params = {}) => new Promise((ok, mal) => { const i = ++id; pend.set(i, { ok, mal }); ws.send(JSON.stringify({ id: i, method, params })); });
await cmd("Page.enable"); await cmd("Runtime.enable");
const js = async expr => (await cmd("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.value;

await cmd("Page.navigate", { url: "http://localhost:3111" }); await esperar(3000);
await js(`(() => {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;
  const c=[...document.querySelectorAll("input")], u=c.find(i=>i.type!=="password"), p=c.find(i=>i.type==="password");
  const w=(el,v)=>{set.call(el,v);el.dispatchEvent(new Event("input",{bubbles:true}))};
  w(u,"almacen"); w(p,"almacen2026*"); return 1; })()`);
await esperar(400);
await js(`document.querySelector("form")?.requestSubmit?.()`);
await esperar(3500);
await js(`[...document.querySelectorAll("aside button")].find(b=>/carriers/i.test(b.textContent))?.click()`);
await esperar(2800);

for (const prov of PROVEEDORES) {
  // Se usa el filtro de proveedor de la propia pantalla: así la tarjeta queda
  // sola y la captura no mezcla a los 24 del catálogo.
  const ok = await js(`(() => {
    const sel = [...document.querySelectorAll("select")].find(s => [...s.options].some(o => o.value === ${JSON.stringify(prov)}));
    if (!sel) return false;
    const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value").set;
    set.call(sel, ${JSON.stringify(prov)});
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    return true; })()`);
  if (!ok) { console.log(`  ⚠ "${prov}" no está en el filtro`); continue; }
  await esperar(1400);
  // Cuántas filas de unidad dibuja realmente la tarjeta.
  const filas = await js(`(() => {
    const t = [...document.querySelectorAll("table")].filter(x => x.offsetParent);
    return t.map(x => [...x.querySelectorAll("tbody tr")].map(tr =>
      [...tr.querySelectorAll("td")].slice(0,3).map(td => td.textContent.trim()).join(" | ")));
  })()`);
  console.log(`\n${prov} — filas que dibuja la pantalla:`);
  (filas || []).flat().forEach(f => console.log("   " + f));
  const archivo = "carriers-" + prov.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const r = await cmd("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(SALIDA, archivo + ".png"), Buffer.from(r.data, "base64"));
  console.log("   📸 " + archivo + ".png");
}

ws.close(); chrome.kill();
try { rmSync(perfil, { recursive: true, force: true }); } catch {}
