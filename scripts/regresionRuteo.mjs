// Test de regresión del ruteador.
//
// Congela la salida de src/lib/ruteo.js CON LOS PARÁMETROS POR DEFECTO y la
// verifica en cada corrida. Es la red que permite meter el balanceo por horas
// sin romper lo que ya opera: todo lo nuevo se activa por parámetros, así que
// con los defaults la salida tiene que ser idéntica punto por punto.
//
// Uso:
//   node scripts/regresionRuteo.mjs            → verifica contra el snapshot
//   node scripts/regresionRuteo.mjs --freeze   → regenera el snapshot
//
// El --freeze SÓLO debe correrse contra un árbol limpio y verificado. Si se
// regenera para "arreglar" un test que falla, el test deja de servir de algo.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cargarRuteo } from "./cargarRuteo.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SNAP = join(AQUI, "fixtures", "regresion-ruteo.json");
const FREEZE = process.argv.includes("--freeze");

const R = await cargarRuteo();
const DEPOT = { lat: 19.3989, lng: -99.1168 };   // el mismo depósito de la app
const filas = JSON.parse(readFileSync(join(AQUI, "fixtures", "guias-2263.json"), "utf8"));
const PTS = filas.map(f => ({ lat: f.Latitud, lng: f.Longitud }));

const sha = (x) => createHash("sha256").update(x).digest("hex").slice(0, 16);
const r6 = (x) => (typeof x === "number" && isFinite(x) ? +x.toFixed(6) : x);

// ---------------- Casos ----------------
// Cada caso es una llamada completa a rutear() con una forma de parámetros que
// alguien usa HOY en la app. El caso `pronostico` replica literalmente la
// llamada de la simulación de flota (B2), que pasa `si` y no `s0`: si el alias
// se rompe, la calibración del tiempo de servicio se iría en silencio al valor
// por defecto y la simulación saldría optimista sin avisar.
const casos = [
  { nom: "default-k50",     pts: PTS,                k: 50, params: {} },
  { nom: "default-k12",     pts: PTS.slice(0, 600),  k: 12, params: {} },
  { nom: "k1-una-ruta",     pts: PTS.slice(0, 120),  k: 1,  params: {} },
  { nom: "k-mayor-que-n",   pts: PTS.slice(0, 8),    k: 40, params: {} },
  { nom: "vacio",           pts: [],                 k: 10, params: {} },
  {
    nom: "pronostico-si0",
    pts: PTS.slice(0, 800), k: 16,
    params: { ...R.PARAMS_DEFAULT, si: 0, Tmax: 24, m: 20, M: 70 },
  },
  {
    nom: "pronostico-calibrado",
    pts: PTS.slice(0, 800), k: 16,
    params: { ...R.PARAMS_DEFAULT, si: 7 / 60, Tmax: 8.5, m: 20, M: 70 },
  },
];

const huella = {};
for (const c of casos) {
  const t0 = process.hrtime.bigint();
  const out = R.rutear(c.pts, c.k, DEPOT, c.params);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const m = out.metricas;
  huella[c.nom] = {
    n: c.pts.length,
    // Hash de las dos series que consume la app. Cualquier punto que cambie de
    // ruta o de posición mueve el hash.
    assigns: sha((out.assigns || []).join(",")),
    seqOrder: sha((out.seqOrder || []).join(",")),
    // Muestras legibles: cuando el hash falla, esto dice DÓNDE mirar.
    assigns0_12: (out.assigns || []).slice(0, 12).join(","),
    seq0_12: (out.seqOrder || []).slice(0, 12).join(","),
    metricas: m ? {
      D: r6(m.D), CV: r6(m.CV), SLA: r6(m.SLA), durMax: r6(m.durMax),
      fueraRango: m.fueraRango, minN: m.minN, maxN: m.maxN, rutas: m.rutas,
      durSum: r6((m.duraciones || []).reduce((s, d) => s + d, 0)),
    } : null,
    diagnostico: out.diagnostico ? {
      iteracionesPD: out.diagnostico.iteracionesPD,
      fueraRango: out.diagnostico.fueraRango,
      k: out.diagnostico.k,
      tamaños: sha((out.diagnostico.tamaños || []).join(",")),
    } : null,
    ms: Math.round(ms),
  };
}

// ---------------- Unidades ----------------
// Las funciones que la tesis fija y que NO deben moverse: tiempoViaje (FIFO),
// la distancia y la duración ancladas al depósito, y el balanceo de tamaños.
const seqFija = PTS.slice(0, 40);
huella._unidades = {
  haversine: r6(R.haversine({ lat: 19.4326, lng: -99.1332 }, DEPOT)),
  // Un trayecto que cruza tres franjas horarias: es el caso donde la forma
  // simplificada d/v(h) se separa de la integración franja por franja.
  tiempoViaje_cruza: r6(R.tiempoViaje(7.8, 60)),
  tiempoViaje_dentro: r6(R.tiempoViaje(3.1, 5)),
  tiempoViaje_cero: r6(R.tiempoViaje(8, 0)),
  distanciaRuta: r6(R.distanciaRuta(seqFija, DEPOT)),
  duracionRuta: r6(R.duracionRuta(seqFija, DEPOT)),
  ordenarSector: sha(R.ordenarSector(seqFija, DEPOT).map(p => p.lat + "," + p.lng).join(";")),
  pd_tamaños: (() => {
    const pd = R.powerDiagramCapacitado(PTS.slice(0, 900), 20, { m: 25, M: 60 });
    return { tam: sha(pd.tamaños.join(",")), it: pd.iteraciones, fuera: pd.fueraRango };
  })(),
};

// ---------------- Verificación ----------------
if (FREEZE || !existsSync(SNAP)) {
  writeFileSync(SNAP, JSON.stringify(huella, null, 2));
  console.log(`${existsSync(SNAP) && !FREEZE ? "✓ snapshot creado" : "✓ snapshot congelado"}: ${SNAP}`);
  for (const [k, v] of Object.entries(huella)) {
    if (k === "_unidades") continue;
    console.log(`  ${k.padEnd(22)} ${String(v.n).padStart(5)} pts · ${v.metricas ? `D=${v.metricas.D.toFixed(1)} km · CV=${v.metricas.CV.toFixed(3)} · SLA=${v.metricas.SLA.toFixed(1)}%` : "sin métricas"} · ${v.ms} ms`);
  }
  process.exit(0);
}

const esperado = JSON.parse(readFileSync(SNAP, "utf8"));
const fallas = [];
// Comparación recursiva: el tiempo de cómputo (ms) se ignora a propósito, es lo
// único del snapshot que depende de la máquina.
const comparar = (ruta, a, b) => {
  if (ruta.endsWith(".ms")) return;
  if (a === b) return;
  const ambosObj = a && b && typeof a === "object" && typeof b === "object";
  if (!ambosObj) { fallas.push(`${ruta}: esperado ${JSON.stringify(a)} · obtenido ${JSON.stringify(b)}`); return; }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) comparar(`${ruta}.${k}`, a[k], b[k]);
};
comparar("", esperado, huella);

if (fallas.length) {
  console.error(`✗ REGRESIÓN: ${fallas.length} diferencia(s) con los parámetros por defecto\n`);
  for (const f of fallas.slice(0, 40)) console.error("  " + f);
  if (fallas.length > 40) console.error(`  … y ${fallas.length - 40} más`);
  console.error("\nCon los defaults la salida debe ser idéntica a la de hoy. Si el cambio");
  console.error("es intencional, hay que justificarlo y recongelar con --freeze a mano.");
  process.exit(1);
}
const ms = Object.values(huella).reduce((s, v) => s + (v.ms || 0), 0);
console.log(`✓ regresión OK — ${casos.length} casos + unidades idénticos al snapshot (${ms} ms de cómputo)`);
