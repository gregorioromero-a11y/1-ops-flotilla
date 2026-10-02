// Verifica los dos modos del interruptor v1/v2 de la UI y los compara.
//
//   node scripts/modosRuteo.mjs [k]
//
// Lo que comprueba, y por qué importa:
//
//  1. El preset v1 tiene que producir EXACTAMENTE los parámetros por defecto del
//     ruteador. Los presets viven en el JSX y los defaults en ruteo.js: son dos
//     lugares distintos que pueden separarse con cualquier cambio, y si se
//     separan el botón que dice "v1 · modelo de la tesis" estaría corriendo otra
//     cosa. Este test lo ata.
//
//  2. Corre los dos modos sobre el archivo de prueba y mide la diferencia, que
//     es la respuesta concreta a "¿qué cambia el botón?".
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cargarRuteo } from "./cargarRuteo.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const R = await cargarRuteo();
const DEPOT = { lat: 19.3989, lng: -99.1168 };
const K = parseInt(process.argv[2]) || 50;

// ---- Extraer los presets del JSX ----
// Se leen del archivo real en vez de duplicarlos aquí: una copia en el test no
// probaría nada, se desincronizaría junto con la otra.
const jsx = readFileSync(join(AQUI, "..", "src", "components", "T1OpsFlotilla.jsx"), "utf8");
const leerPreset = (clave) => {
  const i = jsx.indexOf(`    ${clave}: {`);
  if (i < 0) throw new Error(`No encontré el preset "${clave}" en T1OpsFlotilla.jsx`);
  const ini = jsx.indexOf("vals: {", i);
  const fin = jsx.indexOf("},", ini);
  if (ini < 0 || fin < 0) throw new Error(`El preset "${clave}" no tiene un bloque vals: {...}`);
  const cuerpo = jsx.slice(ini + "vals: {".length, fin);
  const vals = {};
  for (const m of cuerpo.matchAll(/(\w+)\s*:\s*("(?:[^"]*)"|true|false)/g)) {
    vals[m[1]] = m[2] === "true" ? true : m[2] === "false" ? false : m[2].slice(1, -1);
  }
  return vals;
};

// ---- Replicar la conversión que hace paramsRuteo en la UI ----
// Si esta función y la de la UI se separan, el punto 1 deja de probar lo que
// dice. Es el riesgo que queda: se mitiga manteniéndolas idénticas y cortas.
const aParams = (v) => {
  const num = (txt, def) => { const x = parseFloat(txt); return Number.isFinite(x) ? x : def; };
  const kmaxTxt = String(v.pKmax ?? "").trim();
  const kmax = kmaxTxt === "" ? Infinity : parseFloat(kmaxTxt);
  const vConst = parseFloat(v.pVconst);
  return {
    b0: num(v.pB0, 8), Tmax: num(v.pTmax, 9),
    s0: num(v.pSi, 3) / 60, s1: num(v.pS1, 0) / 60,
    m: parseInt(v.pM) || 25, M: parseInt(v.pMM) || 60,
    gamma: num(v.pGamma, 1), rho: num(v.pRho, 1),
    Kmax: Number.isFinite(kmax) && kmax > 0 ? kmax : Infinity,
    alpha: num(v.pAlpha, 0), eps: num(v.pEps, 0.6),
    Rmax: Math.max(1, parseInt(v.pRmax) || 1), delta: num(v.pDelta, 0.05),
    inicios: Math.max(1, parseInt(v.pInicios) || 1),
    orOpt: !!v.pOrOpt, agrupar: !!v.pAgrupar,
    ...(Number.isFinite(vConst) && vConst > 0 ? { V: new Array(24).fill(vConst) } : {}),
  };
};

const P1 = aParams(leerPreset("v1"));
const P2 = aParams(leerPreset("v2"));

// ---- 1. v1 ≡ PARAMS_DEFAULT ----
const D = R.PARAMS_DEFAULT;
const difs = [];
for (const campo of Object.keys(P1)) {
  if (campo === "V") { if (P1.V !== D.V) difs.push(`V: el preset lo sobreescribe`); continue; }
  const a = P1[campo], b = D[campo];
  // La igualdad estricta va primero: Infinity − Infinity es NaN, así que la
  // comparación por tolerancia sola reprobaría Kmax sin tope contra sí mismo.
  const iguales = typeof a === "boolean" ? a === !!b : (a === b || Math.abs(a - b) < 1e-12);
  if (!iguales) difs.push(`${campo}: preset v1 = ${a} · PARAMS_DEFAULT = ${b}`);
}
// El preset no debe traer V propio: v1 usa el perfil horario de la tesis.
if ("V" in P1) difs.push("V: el preset v1 no debe fijar velocidad constante");

if (difs.length) {
  console.error("✗ El preset v1 de la UI NO coincide con PARAMS_DEFAULT:\n");
  for (const d of difs) console.error("  " + d);
  console.error("\nEl botón 'v1 · modelo de la tesis' estaría corriendo otra configuración.");
  process.exit(1);
}
console.log("✓ el preset v1 de la UI ≡ PARAMS_DEFAULT (el botón no miente)\n");

// ---- 2. Comparar los dos modos sobre el archivo de prueba ----
const filas = JSON.parse(readFileSync(join(AQUI, "fixtures", "guias-2263.json"), "utf8"));
const PTS = filas.map(f => ({ lat: f.Latitud, lng: f.Longitud }));

console.log(`Archivo de prueba · ${filas.length} guías · k=${K}\n`);
const fila = (nom, o, ms) => {
  const m = o.metricas, d = o.diagnostico;
  const dur = m.duraciones;
  console.log(`${nom}`);
  console.log(`   paradas       : ${d.paradas}${d.paradas !== d.guias ? ` (de ${d.guias} guías)` : ""}`);
  console.log(`   jornadas      : ${Math.min(...dur).toFixed(2)} – ${Math.max(...dur).toFixed(2)} h   (dispersión ${(Math.max(...dur) - Math.min(...dur)).toFixed(2)} h)`);
  console.log(`   CV_T          : ${m.CV_T.toFixed(4)}`);
  console.log(`   CV de paradas : ${m.CV.toFixed(4)}   (${m.minN}–${m.maxN})`);
  console.log(`   D total       : ${m.D.toFixed(0)} km · ruta más larga ${m.kmMax.toFixed(0)} km`);
  console.log(`   SLA           : ${m.SLA.toFixed(1)} %`);
  console.log(`   rondas        : ${d.rondas}${d.rondas > 1 ? ` (se usó la ${d.rondaElegida})` : ""} · ${ms} ms\n`);
};
for (const [nom, P] of [["v1 · modelo de la tesis", P1], ["v2 · balanceo por horas", P2]]) {
  const t = Date.now();
  fila(nom, R.rutear(PTS, K, DEPOT, P), Date.now() - t);
}
