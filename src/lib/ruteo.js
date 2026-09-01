// ============================================================
// RUTEADOR HÍBRIDO — cluster-first, route-second
//
// Implementa el modelo formal de la tesis "Ruteador dinámico para la logística
// de última milla en la CDMX mediante clusterización dinámica y optimización de
// rutas dependiente del tiempo" (Romero Romero, UNAM, ago 2026). Las referencias
// (n) apuntan a las ecuaciones de ese documento.
//
//   Módulo 1 — Power Diagram capacitado (§6.5): ecs. (14)(15)(16)(17)
//   Módulo 2 — TD-VRP con 2-opt guiado (§6.4, §7.3): ecs. (3)(7)(10)(11)(13)
//   Métricas (§6.7): ecs. (18)(19)(20)(21)
//
// Este archivo es la ÚNICA fuente del algoritmo: lo usan tanto el Web Worker
// como el camino inline de ModuleRuteo, para que no puedan divergir.
// ============================================================

// ---------------- Parámetros por defecto (§6.1) ----------------
// Perfil de velocidad v_h por franja horaria de 1 h, en km/h, índice = hora.
// Base: §5.2 de la tesis — pico 5–15 km/h en corredores principales, valle 30–45.
// SUPUESTO A CALIBRAR con datos de tráfico del operador; es el parámetro con
// mayor incertidumbre del modelo.
export const V_CDMX = [
  38, 40, 42, 42, 40, 34, 24, 15, 11, 12, 16, 19, // 00–11
  20, 19, 18, 16, 13, 10,  9, 11, 17, 24, 31, 35, // 12–23
];

export const PARAMS_DEFAULT = {
  b0: 8.0,        // hora de salida del depósito
  Tmax: 9.0,      // duración máxima de jornada (h)
  si: 3 / 60,     // tiempo de servicio por entrega (h)
  m: 25,          // paradas mínimas por sector
  M: 60,          // paradas máximas por sector
  V: V_CDMX,
};

// ---------------- Geometría ----------------
export const haversine = (a, b) => {
  const R = 6371, toR = g => g * Math.PI / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

// Proyección local a kilómetros. Tratar lat/lng como plano euclidiano distorsiona
// las regiones: a la latitud de la CDMX (~19.4°) un grado de longitud mide ~105 km
// y uno de latitud ~111 km, así que el eje x pesa ~5 % menos de lo que debería.
// Clusterizar en km hace que los pesos w_j de (14) tengan unidades físicas y que
// η sea escalable a cualquier extensión geográfica.
export const proyectarKm = (pts) => {
  const lat0 = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const kx = 111.32 * Math.cos(lat0 * Math.PI / 180), ky = 110.57;
  return pts.map(p => ({ x: p.lng * kx, y: p.lat * ky }));
};

// ---------------- Tiempo dependiente del tiempo (§6.4) ----------------
// τ_ij(t): tiempo de viaje en horas para recorrer d km saliendo en el instante t
// (horas decimales). Consume la distancia FRANJA POR FRANJA, adoptando en cada
// tramo la velocidad de la franja vigente.
//
// Esto es lo que garantiza la propiedad FIFO (13): salir antes nunca implica
// llegar después. La forma simplificada d/v(h_salida) de la ec. (1) NO la cumple
// —viola FIFO en ~0.4 % de los pares con errores de hasta 40 min— y produce
// soluciones que premian esperar en el depósito, un artefacto sin correlato
// operativo. Cuando el trayecto no cruza ningún límite de franja ambas
// expresiones coinciden exactamente, tal como afirma §6.4.
export function tiempoViaje(t0, d, V = V_CDMX) {
  if (!(d > 0)) return 0;
  let resto = d, u = t0, T = 0, guard = 0;
  while (resto > 1e-12 && guard++ < 10000) {
    const h = ((Math.floor(u) % 24) + 24) % 24;   // franja vigente
    const vh = V[h] || 20;
    const finFranja = Math.floor(u) + 1;          // τ_h
    const dmax = vh * (finFranja - u);            // paso 1
    if (resto <= dmax) return T + resto / vh;     // paso 2: concluye en la franja
    T += finFranja - u;                           // paso 3: agota y pasa a h+1
    resto -= dmax;
    u = finFranja;
  }
  return T;
}

// ---------------- Métricas (§6.7) ----------------
// Distancia de una ruta ANCLADA AL DEPÓSITO (7): depósito → puntos → depósito.
export function distanciaRuta(seq, depot) {
  if (!seq || !seq.length) return 0;
  let d = haversine(depot, seq[0]);
  for (let i = 0; i < seq.length - 1; i++) d += haversine(seq[i], seq[i + 1]);
  return d + haversine(seq[seq.length - 1], depot);
}

// Duración con propagación temporal (10) y retorno r^k. Devuelve r^k − b_0.
export function duracionRuta(seq, depot, P = PARAMS_DEFAULT) {
  if (!seq || !seq.length) return 0;
  let t = P.b0;
  t += tiempoViaje(t, haversine(depot, seq[0]), P.V);
  for (let i = 0; i < seq.length - 1; i++) {
    t += P.si;
    t += tiempoViaje(t, haversine(seq[i], seq[i + 1]), P.V);
  }
  t += P.si;
  t += tiempoViaje(t, haversine(seq[seq.length - 1], depot), P.V);
  return t - P.b0;
}

// D (18), CV (19), SLA% (20) sobre un conjunto de rutas ya ordenadas.
export function metricas(rutas, depot, P = PARAMS_DEFAULT) {
  const activas = rutas.filter(r => r && r.length);
  if (!activas.length) return { D: 0, CV: 0, SLA: 0, durMax: 0, fueraRango: 0, minN: 0, maxN: 0 };
  const D = activas.reduce((s, r) => s + distanciaRuta(r, depot), 0);
  const n = activas.map(r => r.length);
  const mu = n.reduce((s, x) => s + x, 0) / n.length;
  const sd = Math.sqrt(n.reduce((s, x) => s + (x - mu) ** 2, 0) / n.length);
  const durs = activas.map(r => duracionRuta(r, depot, P));
  return {
    D,
    CV: mu > 0 ? sd / mu : 0,
    SLA: 100 * durs.filter(d => d <= P.Tmax).length / activas.length,
    durMax: Math.max(...durs),
    duraciones: durs,
    fueraRango: n.filter(x => x < P.m || x > P.M).length,
    minN: Math.min(...n), maxN: Math.max(...n),
    rutas: activas.length,
  };
}

// ---------------- Módulo 1: Power Diagram capacitado (§6.5) ----------------
function kmeansPP(P2, k, rnd) {
  const c = [{ ...P2[Math.floor(rnd() * P2.length)] }];
  while (c.length < k) {
    const d2 = P2.map(p => {
      let mn = Infinity;
      for (const q of c) { const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2; if (d < mn) mn = d; }
      return mn;
    });
    const tot = d2.reduce((s, v) => s + v, 0);
    let r = rnd() * tot, ch = P2[P2.length - 1];
    for (let j = 0; j < P2.length; j++) { r -= d2[j]; if (r <= 0) { ch = P2[j]; break; } }
    c.push({ x: ch.x, y: ch.y });
  }
  return c;
}

// Devuelve { asignaciones, centros, iteraciones, tamaños, fueraRango }.
//
// Diferencias respecto a la versión anterior, todas exigidas por §6.5:
//  · criterio de paro explícito m ≤ n_j ≤ M (ec. 9) en vez de un tope fijo de
//    iteraciones. Con el tope de 150 anterior el ajuste se cortaba ANTES de
//    balancear: sobre datos reales dejaba sectores de 16 y de 61 con [m,M]=[25,60].
//  · η escalado a la geometría del dataset en vez de una constante en grados².
//  · amortiguamiento de η: sin él los tamaños oscilan y no convergen.
//  · re-siembra de sectores vacíos: sin ella un sector que se queda sin puntos
//    congela su centroide y nunca vuelve, así que k deja de cumplirse en silencio.
export function powerDiagramCapacitado(pts, k, opts = {}) {
  const { m = PARAMS_DEFAULT.m, M = PARAMS_DEFAULT.M, maxIt = 300, seed = 12345, onProgress } = opts;
  const n = pts.length;
  if (!n || k < 1) return { asignaciones: [], centros: [], iteraciones: 0, tamaños: [], fueraRango: 0 };
  const P2 = proyectarKm(pts);
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

  const centros = kmeansPP(P2, k, rnd);
  let w = new Array(k).fill(0);
  const nbar = n / k;
  // η base: (área por sector) / (paradas por sector), dividido por 10. El factor
  // se fijó por barrido sobre datos reales: converge en 28–75 iteraciones para
  // k entre 20 y 50, mientras que valores mayores hacen oscilar los tamaños.
  const xs = P2.map(p => p.x), ys = P2.map(p => p.y);
  const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
  const eta0 = Math.max(1e-9, (area / k) / Math.max(nbar, 1) / 10);

  let asg = new Array(n).fill(0), it = 0, mejorFuera = Infinity, mejorAsg = null;
  for (it = 1; it <= maxIt; it++) {
    asg = P2.map(p => {                                  // (14)(15)
      let md = Infinity, nr = 0;
      for (let c = 0; c < k; c++) {
        const d = (p.x - centros[c].x) ** 2 + (p.y - centros[c].y) ** 2 - w[c];
        if (d < md) { md = d; nr = c; }
      }
      return nr;
    });
    const sz = new Array(k).fill(0);
    for (const a of asg) sz[a]++;

    for (let c = 0; c < k; c++) {                        // re-siembra de vacíos
      if (sz[c] === 0) {
        let donante = 0;
        for (let d = 1; d < k; d++) if (sz[d] > sz[donante]) donante = d;
        let lejano = null, dmax = -1;
        for (let i = 0; i < n; i++) {
          if (asg[i] !== donante) continue;
          const d = (P2[i].x - centros[donante].x) ** 2 + (P2[i].y - centros[donante].y) ** 2;
          if (d > dmax) { dmax = d; lejano = P2[i]; }
        }
        if (lejano) { centros[c] = { x: lejano.x, y: lejano.y }; w[c] = 0; }
      }
    }
    for (let c = 0; c < k; c++) {                        // paso de Lloyd
      let sx = 0, sy = 0, cnt = 0;
      for (let i = 0; i < n; i++) if (asg[i] === c) { sx += P2[i].x; sy += P2[i].y; cnt++; }
      if (cnt) centros[c] = { x: sx / cnt, y: sy / cnt };
    }

    const fuera = sz.filter(x => x < m || x > M).length;
    if (fuera < mejorFuera) { mejorFuera = fuera; mejorAsg = asg.slice(); }
    if (fuera === 0) break;                              // criterio de paro (9)
    const eta = eta0 / (1 + it / 40);                    // (17) con amortiguamiento
    for (let c = 0; c < k; c++) w[c] += eta * (nbar - sz[c]);
    if (onProgress && it % 5 === 0) onProgress("clustering", Math.min(99, Math.round((it / maxIt) * 100)));
  }

  const final = mejorAsg || asg;
  // Compactar ids a 0..N-1 sin huecos
  const usados = [...new Set(final)].sort((a, b) => a - b);
  const remap = {}; usados.forEach((c, i) => { remap[c] = i; });
  const asignaciones = final.map(a => remap[a]);
  const tamaños = new Array(usados.length).fill(0);
  for (const a of asignaciones) tamaños[a]++;
  return { asignaciones, centros, iteraciones: it, tamaños, fueraRango: mejorFuera };
}

// ---------------- Módulo 2: TD-VRP por sector (§6.4, §7.3) ----------------
// Ordena las visitas de UN sector.
//
// Objetivo = DISTANCIA PURA (3), tal como exige §6.2: la tesis argumenta que la
// distancia es invariante ante errores de estimación de v_h mientras que el
// tiempo no, así que anclar el objetivo en distancia hace que la evaluación no
// dependa de la calidad del dato de tráfico. El tiempo entra SÓLO por la región
// factible (10)(11), como penalización big-M sobre el exceso de jornada.
//
// La versión anterior minimizaba haversine·(1 + posición·τ), que no es ni la
// distancia (3) ni el tiempo: era una distancia deformada por la posición en la
// secuencia, sin correlato con la hora del día.
export function ordenarSector(sector, depot, P = PARAMS_DEFAULT, opts = {}) {
  const { maxVueltas = 40 } = opts;
  const n = sector.length;
  if (!n) return [];
  if (n <= 2) return sector.slice();

  // Matriz de distancias con el depósito en el índice n. Precalcularla convierte
  // cada evaluación de arco en un lookup y es lo que permite el delta O(1).
  const nodos = sector.concat([depot]);
  const D = new Float64Array((n + 1) * (n + 1));
  for (let a = 0; a <= n; a++) {
    for (let b = a + 1; b <= n; b++) {
      const d = haversine(nodos[a], nodos[b]);
      D[a * (n + 1) + b] = d; D[b * (n + 1) + a] = d;
    }
  }
  const dd = (a, b) => D[a * (n + 1) + b];
  const DEP = n;

  // Semilla: vecino más cercano ARRANCANDO DEL DEPÓSITO (7). Antes arrancaba en
  // el punto más cercano al centroide, lo que ignora de dónde sale el vehículo.
  const rem = new Set(); for (let i = 0; i < n; i++) rem.add(i);
  let cur = [], actual = DEP;
  while (rem.size) {
    let mejor = -1, md = Infinity;
    for (const i of rem) { const d = dd(actual, i); if (d < md) { md = d; mejor = i; } }
    cur.push(mejor); rem.delete(mejor); actual = mejor;
  }

  // 2-opt con DELTA O(1) sobre distancia (3). Invertir el segmento [i..j] sólo
  // cambia dos aristas: (prev,i) y (j,next) pasan a ser (prev,j) y (i,next).
  // Evaluar el tour completo dentro del doble bucle costaba O(n³) por pasada —
  // 3.8 s para un sector de 200 paradas; con delta baja a milisegundos.
  const antes = (t, i) => (i === 0 ? DEP : t[i - 1]);
  const despues = (t, j) => (j === t.length - 1 ? DEP : t[j + 1]);
  const dosOpt = (t) => {
    let mejoro = true, vueltas = 0;
    while (mejoro && vueltas++ < maxVueltas) {
      mejoro = false;
      for (let i = 0; i < t.length - 1; i++) {
        const pv = antes(t, i);
        for (let j = i + 1; j < t.length; j++) {
          const nx = despues(t, j);
          const delta = dd(pv, t[j]) + dd(t[i], nx) - dd(pv, t[i]) - dd(t[j], nx);
          if (delta < -1e-9) {
            for (let a = i, b = j; a < b; a++, b--) { const tmp = t[a]; t[a] = t[b]; t[b] = tmp; }
            mejoro = true;
          }
        }
      }
    }
    return t;
  };
  cur = dosOpt(cur);

  // Fase de reparación temporal (10)(11). El objetivo es distancia pura (3) —la
  // tesis lo justifica en §6.2— y el tiempo entra sólo por la región factible.
  // Si la secuencia más corta excede T_max, se intenta reordenar para entrar en
  // jornada aceptando movimientos que reduzcan la duración aunque alarguen la
  // distancia. Si aun así no cabe, el sector es infactible con este k: eso NO se
  // arregla resecuenciando, se arregla con más vehículos, y queda reportado en
  // la métrica SLA (20).
  const seqDe = t => t.map(i => sector[i]);
  const dur0 = duracionRuta(seqDe(cur), depot, P);
  // Sólo se intenta reparar cuando el exceso es recuperable. Si la ruta dura más
  // de 1.6·T_max el sector está sobrecargado para un vehículo y resecuenciar es
  // trabajo perdido —además caro: la reparación evalúa la duración completa
  // dentro de un doble bucle, O(n³)—. Se deja infactible y lo reporta el SLA.
  if (dur0 > P.Tmax && dur0 <= P.Tmax * 1.6) {
    let dur = dur0, mejoro = true, vueltas = 0;
    while (mejoro && dur > P.Tmax && vueltas++ < 8) {
      mejoro = false;
      for (let i = 0; i < cur.length - 1 && dur > P.Tmax; i++) {
        for (let j = i + 1; j < cur.length; j++) {
          const cand = cur.slice();
          for (let a = i, b = j; a < b; a++, b--) { const tmp = cand[a]; cand[a] = cand[b]; cand[b] = tmp; }
          const d2 = duracionRuta(seqDe(cand), depot, P);
          if (d2 < dur - 1e-9) { cur = cand; dur = d2; mejoro = true; break; }
        }
      }
    }
  }
  return seqDe(cur);
}

// ---------------- Pipeline completo ----------------
// Devuelve { assigns, seqOrder, metricas, diagnostico } manteniendo el contrato
// que ya consumía ModuleRuteo (assigns + seqOrder), y agregando las métricas.
export function rutear(pts, k, depot, params = {}, onProgress) {
  const P = { ...PARAMS_DEFAULT, ...params };
  const n = pts.length;
  if (!n || k < 1) return { assigns: [], seqOrder: [], metricas: null, diagnostico: null };

  const t0 = (typeof performance !== "undefined" ? performance.now() : 0);
  const pd = powerDiagramCapacitado(pts, Math.min(k, n), { m: P.m, M: P.M, onProgress });
  const assigns = pd.asignaciones;
  const nClusters = pd.tamaños.length;

  const seqOrder = new Array(n).fill(0);
  const rutas = [];
  for (let c = 0; c < nClusters; c++) {
    const idxs = [];
    for (let i = 0; i < n; i++) if (assigns[i] === c) idxs.push(i);
    const sector = idxs.map(i => ({ ...pts[i], _gi: i }));
    const ordenado = ordenarSector(sector, depot, P);
    ordenado.forEach((p, pos) => { seqOrder[p._gi] = pos; });
    rutas.push(ordenado);
    if (onProgress && c % 3 === 0) onProgress("tsp", Math.round((c / nClusters) * 100));
  }

  const t1 = (typeof performance !== "undefined" ? performance.now() : 0);
  return {
    assigns, seqOrder,
    metricas: metricas(rutas, depot, P),
    diagnostico: {
      iteracionesPD: pd.iteraciones,
      fueraRango: pd.fueraRango,
      tamaños: pd.tamaños,
      msComputo: Math.round(t1 - t0),
      k: nClusters,
    },
  };
}
