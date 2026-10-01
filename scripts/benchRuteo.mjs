// Corrida de aceptación del ruteador v2 sobre el archivo de prueba.
//
// Mide lo que el ruteador promete y lo imprime sin adornos: paradas, cobertura
// de guías, dispersión de jornadas antes y después del rebalanceo, topes de
// jornada y de kilómetros, y tiempo de cómputo.
//
//   node scripts/benchRuteo.mjs          → configuración de operación (k=50)
//   node scripts/benchRuteo.mjs 47       → otra k
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cargarRuteo } from "./cargarRuteo.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const R = await cargarRuteo();
const DEPOT = { lat: 19.3989, lng: -99.1168 };
const filas = JSON.parse(readFileSync(join(AQUI, "fixtures", "guias-2263.json"), "utf8"));
const PTS = filas.map(f => ({ lat: f.Latitud, lng: f.Longitud }));
const K = parseInt(process.argv[2]) || 50;

// Configuración de operación de los criterios de aceptación.
const OP = {
  agrupar: true, rho: 0, gamma: 1.3, s0: 6 / 60, s1: 1 / 60, b0: 8,
  Tmax: 11, Kmax: 120, alpha: 0.7, Rmax: 10, eps: 0.6, delta: 0.05,
  inicios: 11, orOpt: true, V: new Array(24).fill(22),
};

const est = (xs) => {
  const mu = xs.reduce((a, b) => a + b, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((s, x) => s + (x - mu) ** 2, 0) / xs.length);
  return { mu, sd, cv: mu > 0 ? sd / mu : 0, min: Math.min(...xs), max: Math.max(...xs) };
};
const ok = (b) => (b ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m");

console.log(`\n═══ Ruteador v2 · ${filas.length} guías · k=${K} ═══\n`);

// ---- Operación ----
const t0 = Date.now();
const o = R.rutear(PTS, K, DEPOT, OP);
const ms = Date.now() - t0;
const m = o.metricas, d = o.diagnostico;

// Cobertura: ninguna guía sin ruta, y toda guía de una dirección en la MISMA
// ruta y la misma posición.
const porDir = new Map();
PTS.forEach((p, i) => {
  const llave = p.lat + "|" + p.lng;
  if (!porDir.has(llave)) porDir.set(llave, []);
  porDir.get(llave).push(i);
});
const sinRuta = o.assigns.filter(a => !Number.isInteger(a) || a < 0).length;
const partidas = [...porDir.values()].filter(ix => new Set(ix.map(i => o.assigns[i])).size > 1).length;
const posDistinta = [...porDir.values()].filter(ix => new Set(ix.map(i => o.seqOrder[i])).size > 1).length;

const T = est(m.duraciones);
console.log("ENTRADA");
console.log(`  ${ok(d.paradas === 2010)} paradas tras agrupar: ${d.paradas} (de ${d.guias} guías)`);
console.log(`  ${ok(sinRuta === 0)} guías sin ruta: ${sinRuta}`);
console.log(`  ${ok(partidas === 0)} direcciones partidas entre rutas: ${partidas}`);
console.log(`  ${ok(posDistinta === 0)} direcciones con posiciones distintas: ${posDistinta}`);
console.log("\nRESULTADO");
console.log(`  ${ok(T.min >= 6.0 && T.max <= 6.8)} duraciones: ${T.min.toFixed(2)}–${T.max.toFixed(2)} h  (objetivo 6.0–6.8)`);
console.log(`  ${ok(m.CV_T < 0.03)} CV_T: ${m.CV_T.toFixed(4)}  (objetivo < 0.03)`);
console.log(`  ${ok(m.kmMax <= 120)} km de la ruta más larga: ${m.kmMax.toFixed(1)}  (tope 120)`);
console.log(`  ${ok(d.rondas <= 10)} rondas: ${d.rondas} (se usó la ${d.rondaElegida})`);
console.log(`  ${ok(ms < 90000)} cómputo: ${(ms / 1000).toFixed(1)} s  (tope 90 s)`);
console.log(`  ${ok(m.SLA === 100)} SLA (jornada y km): ${m.SLA.toFixed(1)} %`);
console.log(`      D=${m.D.toFixed(0)} km · CV de paradas=${m.CV.toFixed(4)} · ${m.minN}–${m.maxN} paradas por ruta`);
console.log("\n  por ronda:");
for (const h of d.historial) {
  console.log(`    r${String(h.ronda).padStart(2)}: ${h.minT.toFixed(2)}–${h.maxT.toFixed(2)} h (dispersión ${(h.maxT - h.minT).toFixed(2)}) · maxKm ${h.maxKm.toFixed(1)} · ${h.infactibles} infactibles · ${h.iteracionesPD} it. de balanceo`);
}

// ---- ANTES vs DESPUÉS del rebalanceo, con ρ=1, γ=1 y el perfil V_CDMX ----
// Es la comparación que aísla el efecto del Módulo 3: mismo archivo, misma k,
// mismos tiempos; lo único que cambia es si la duración medida regresa o no a
// la sectorización.
console.log("\n─── ρ=1, γ=1, perfil V_CDMX: antes y después del rebalanceo ───\n");
const BASE = { agrupar: true, s0: 6 / 60, s1: 1 / 60, b0: 8, Tmax: 11, inicios: 11, orOpt: true };
const corridas = [
  ["antes  (α=0, R=1)", { ...BASE, alpha: 0, Rmax: 1 }],
  ["después (α=0.7, R=10)", { ...BASE, alpha: 0.7, Rmax: 10, eps: 0.6, delta: 0.05 }],
];
for (const [nom, params] of corridas) {
  const t = Date.now();
  const r = R.rutear(PTS, K, DEPOT, params);
  const e = est(r.metricas.duraciones);
  console.log(`${nom}`);
  console.log(`   CV de paradas : ${r.metricas.CV.toFixed(4)}   (${r.metricas.minN}–${r.metricas.maxN} paradas)`);
  console.log(`   CV_T jornadas : ${r.metricas.CV_T.toFixed(4)}`);
  console.log(`   duraciones    : min ${e.min.toFixed(2)} h · max ${e.max.toFixed(2)} h · dispersión ${(e.max - e.min).toFixed(2)} h`);
  console.log(`   D total       : ${r.metricas.D.toFixed(0)} km · SLA ${r.metricas.SLA.toFixed(1)} % · ${((Date.now() - t) / 1000).toFixed(1)} s\n`);
}
