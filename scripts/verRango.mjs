// Reproduce el reporte "al filtrar por rango aparece dos veces cada proveedor".
//
//   node scripts/verRango.mjs
//
// Entra a Registrar Envíos, activa el modo RANGO, y vuelca lo que realmente
// contienen los menús y las tablas, además de fotografiar la pantalla. Así se
// distingue si el duplicado está en el menú de filtro, en las tablas de costo o
// en los datos.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "capturas");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PUERTO = 9335;
mkdirSync(SALIDA, { recursive: true });
const perfil = mkdtempSync(join(tmpdir(), "chrome-rango-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PUERTO}`,
  "--window-size=1600,1200", `--user-data-dir=${perfil}`, "--no-first-run",
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
const cmd = (m, p = {}) => new Promise((ok, mal) => { const i = ++id; pend.set(i, { ok, mal }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
await cmd("Page.enable"); await cmd("Runtime.enable");
const js = async e => (await cmd("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true })).result?.value;
const foto = async n => { const r = await cmd("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(SALIDA, n + ".png"), Buffer.from(r.data, "base64")); console.log("  📸 " + n + ".png"); };

await cmd("Page.navigate", { url: "http://localhost:3111" }); await esperar(3000);
await js(`(() => { const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;
  const c=[...document.querySelectorAll("input")],u=c.find(i=>i.type!=="password"),p=c.find(i=>i.type==="password");
  const w=(el,v)=>{set.call(el,v);el.dispatchEvent(new Event("input",{bubbles:true}))};
  w(u,"almacen"); w(p,"almacen2026*"); return 1; })()`);
await esperar(400);
await js(`document.querySelector("form")?.requestSubmit?.()`); await esperar(3500);
await js(`[...document.querySelectorAll("aside button")].find(b=>/registrar env/i.test(b.textContent))?.click()`);
await esperar(3000);

const volcar = async (etapa) => {
  const r = await js(`(() => {
    // Cada bloque con su título y los proveedores que lista, para contar en
    // cuántos bloques distintos aparece el mismo nombre.
    const bloques = [];
    for (const tabla of [...document.querySelectorAll("table")].filter(t => t.offsetParent)) {
      const caja = tabla.closest("div[style*='border']") || tabla.parentElement;
      const titulo = (caja?.querySelector("div")?.textContent || "").slice(0, 60).trim();
      const primeras = [...tabla.querySelectorAll("tbody tr")]
        .map(tr => tr.querySelector("td")?.textContent.trim()).filter(Boolean);
      bloques.push({ titulo, filas: primeras });
    }
    const filtro = [...document.querySelectorAll("select")]
      .find(s => [...s.options].some(o => /todos/i.test(o.textContent)));
    return { bloques, opcionesFiltro: filtro ? [...filtro.options].map(o => o.textContent.trim()) : [] };
  })()`);
  console.log(`\n══════ ${etapa} ══════`);
  const of = r.opcionesFiltro;
  const dupF = of.filter((o, i) => of.indexOf(o) !== i);
  console.log(`  menú de proveedor: ${of.length} opciones${dupF.length ? `  ⚠ REPETIDAS: ${[...new Set(dupF)].join(", ")}` : "  — sin repetidos"}`);
  console.log(`  bloques con tabla: ${r.bloques.length}`);
  const cuenta = {};
  for (const b of r.bloques) {
    const nom = b.titulo.replace(/\s+/g, " ").slice(0, 46);
    console.log(`    · ${nom}  (${b.filas.length} filas)`);
    for (const f of new Set(b.filas)) cuenta[f] = (cuenta[f] || 0) + 1;
  }
  const repes = Object.entries(cuenta).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
  if (repes.length) {
    console.log(`\n  ⚠ PROVEEDORES QUE APARECEN EN VARIOS BLOQUES:`);
    for (const [nom, n] of repes.slice(0, 8)) console.log(`      ${nom.padEnd(30)} ${n} veces`);
  }
  return r;
};

await volcar("MODO DÍA");
await foto("rango-01-dia");

// Activar RANGO.
const ok = await js(`(() => {
  const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="Rango");
  if(!b) return false; b.click(); return true; })()`);
console.log("\n  botón «Rango»:", ok ? "pulsado" : "NO ENCONTRADO");
await esperar(1200);

// Abrir un rango amplio para que entren varias fechas.
await js(`(() => {
  const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;
  const f=[...document.querySelectorAll('input[type="date"]')];
  const w=(el,v)=>{set.call(el,v);el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))};
  const vis=f.filter(x=>x.offsetParent); if(vis[0]) w(vis[0],"2026-10-01"); if(vis[1]) w(vis[1],"2026-10-20");
  return f.length; })()`);
await esperar(9000);
await volcar("MODO RANGO (20 sep – 20 oct)");
await foto("rango-02-rango");

// Bajar a las tablas de costo: no caben en el primer pantallazo.
for (const [ancla, nombre] of [["Half mile — costo del servicio", "rango-03-halfmile"],
                               ["Entrega final por proveedor", "rango-04-final"],
                               ["todo incluido", "rango-05-graficas"]]) {
  const ok = await js(`(() => {
    const d = [...document.querySelectorAll("div")].find(x => x.children.length === 0 &&
      x.textContent.trim().startsWith(${JSON.stringify(ancla)}));
    if (!d) return false;
    d.scrollIntoView({ block: "start" }); window.scrollBy(0, -90); return true; })()`);
  if (!ok) { console.log(`  ⚠ no encontré «${ancla}»`); continue; }
  await esperar(900);
  await foto(nombre);
}

ws.close(); chrome.kill();
try { rmSync(perfil, { recursive: true, force: true }); } catch {}
