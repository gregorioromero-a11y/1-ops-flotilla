# Ruteador — código fuente

Código completo del ruteador, tal como está en el repositorio. Sin recortes ni
reformateo: este archivo se genera leyendo las fuentes con
`node scripts/docRuteador.mjs`.

El algoritmo vive en **un solo archivo** a propósito. Antes existía una copia
dentro del Web Worker y otra en el camino inline de la interfaz, y divergían con
cada cambio.

La versión actual balancea por **horas de jornada**, no por número de paradas:
la duración medida de cada ruta regresa a la sectorización como objetivo de
tamaño. Todo lo que agrega la extensión v2 se activa por parámetros — con
`PARAMS_DEFAULT` el resultado es idéntico al del modelo original de la tesis, y
eso lo fija `scripts/regresionRuteo.mjs`.

Para la explicación del modelo, los parámetros, las métricas y las limitaciones
conocidas, ver [RUTEADOR.md](RUTEADOR.md).

| Archivo | Líneas | Rol |
|---|---:|---|
| `src/lib/ruteo.js` | 954 | El algoritmo completo. Sin dependencias. |
| `src/components/kmeansWorker.js` | 22 | Web Worker: saca el cómputo del hilo principal. |

---

## `src/lib/ruteo.js`

```js
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
// EXTENSIÓN v2 — balanceo por HORAS DE JORNADA en vez de por número de paradas.
// La tesis balancea cardinalidad: m ≤ n_j ≤ M (9). En operación eso no reparte
// el trabajo, porque una parada de Santa Fe no cuesta lo que una del Centro: con
// 40 paradas parejas las jornadas reales salen entre 5 y 11 h. Lo que se iguala
// aquí es T^k, la duración de la ruta, retroalimentando la sectorización con el
// resultado de la secuenciación:
//
//   Módulo 1' — objetivo por sector n̄_j (22) y arranque en caliente (§6.5)
//   Módulo 2' — inicio múltiple + or-opt (§7.3)
//   Módulo 3  — bucle de rebalanceo por jornada (23)(24), métrica CV_T (25)
//
// Las ecuaciones (22)–(25) no están en la tesis: numeran la extensión siguiendo
// su convención. Todo lo nuevo se activa por parámetros — con PARAMS_DEFAULT el
// resultado es idéntico al del modelo original, y eso lo fija
// scripts/regresionRuteo.mjs.
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

// Los valores por defecto reproducen EXACTAMENTE el modelo de la tesis. Al lado
// de cada parámetro nuevo va el valor que usa la operación real, que es el que
// se captura en el panel "Parámetros del modelo".
export const PARAMS_DEFAULT = {
  b0: 8.0,        // hora de salida del depósito
  Tmax: 9.0,      // duración máxima de jornada (h)
  m: 25,          // paradas mínimas por sector
  M: 60,          // paradas máximas por sector
  V: V_CDMX,      // perfil de velocidad v_h; 24 valores iguales = velocidad constante

  // --- Servicio por parada: s_i = s0 + (q_i − 1)·s1  (h) ---
  // q_i = guías en la parada. La primera entrega paga el estacionamiento y la
  // caminata; las demás del mismo domicilio sólo el intercambio. Con s1 = 0 se
  // recupera el s_i constante de (10).
  s0: 3 / 60,     // operación: 6/60
  s1: 0,          // operación: 1/60
  // OJO: `si` (el nombre viejo de s0) NO aparece en este objeto A PROPÓSITO.
  // Los llamadores viejos hacen { ...PARAMS_DEFAULT, si: 0 }; si el spread
  // trajera un `si`, no habría forma de distinguir "el llamador lo puso" de
  // "vino del default", y un s0 explícito quedaría pisado por el alias. Al
  // faltar la llave, `P.si ?? P.s0` resuelve bien los dos casos.

  // --- Geometría y forma de la ruta ---
  gamma: 1.0,     // circuidad: distancia de red / haversine. operación: 1.3
  rho: 1,         // 1 = el vehículo regresa al depósito; 0 = termina en la última parada
  Kmax: Infinity, // tope de km por ruta, traslado incluido. operación: 120

  // --- Rebalanceo por jornada (Módulo 3) ---
  alpha: 0,       // exponente de (24): 0 = sin rebalanceo. operación: 0.7
  eps: 0.6,       // tolerancia max(T) − min(T) en horas para parar
  Rmax: 1,        // rondas máximas: 1 = una sola pasada, como hoy. operación: 10
  delta: 0.05,    // ancho de la ventana de paradas alrededor de n̄_j

  // --- Secuenciación (Módulo 2') ---
  inicios: 1,     // arranques del vecino más cercano: 1 = sólo desde el depósito. operación: 11
  orOpt: false,   // or-opt tras el 2-opt. operación: true

  // --- Entrada ---
  agrupar: false, // colapsar guías que comparten coordenada exacta en una parada
};

// Lectura tolerante de un parámetro numérico. Hace falta porque la UI y la
// simulación de flota pasan objetos PARCIALES —sólo los campos que tocan— y
// estas funciones también se llaman desde fuera del pipeline (metricas() se
// recalcula en cada edición manual del mapa). Acepta Infinity (Kmax) y rechaza
// NaN, que es lo que produce un input vacío en el panel.
const pn = (v, d) => (typeof v === "number" && !Number.isNaN(v) ? v : d);

// s0 efectivo, resolviendo el alias histórico. `si` gana cuando está presente:
// quien lo pasa es un llamador viejo que está sobreescribiendo el servicio a
// propósito (la calibración de B2 pasa si:0 para aislar el traslado puro).
const s0De = (P) => pn(P.si, pn(P.s0, PARAMS_DEFAULT.s0));
// Guías en la parada. Sin agrupación toda parada vale 1 y el término se anula.
const qDe = (p) => pn(p && p.q, 1);
// Tiempo de servicio de UNA parada (10) extendido a q guías.
const servicioDe = (p, s0, s1) => s0 + (qDe(p) - 1) * s1;

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

// ---------------- Costos de arco ----------------
// Distancia de RED: haversine × γ. γ > 1 corrige que el vehículo no vuela en
// línea recta — sigue la traza vial. Es un escalar, así que no altera el orden
// de preferencia entre secuencias (el óptimo de (3) es el mismo), pero sí las
// horas y los kilómetros reportados, que es donde se compara contra la realidad.
const arco = (a, b, g) => g * haversine(a, b);
// Arco de REGRESO última parada → depósito, multiplicado por ρ. Con ρ = 0 la
// ruta es abierta: el repartidor termina donde entregó y no paga el retorno.
// Rompe la simetría de (7): ir al depósito y venir del depósito ya no cuestan
// lo mismo, y eso cambia qué extremo de la zona conviene visitar primero.
const arcoRegreso = (p, depot, g, rho) => rho * g * haversine(p, depot);

// ---------------- Métricas (§6.7) ----------------
// Distancia de una ruta ANCLADA AL DEPÓSITO (7): depósito → puntos → depósito,
// con el retorno pesado por ρ.
export function distanciaRuta(seq, depot, P = PARAMS_DEFAULT) {
  if (!seq || !seq.length) return 0;
  const g = pn(P.gamma, 1), rho = pn(P.rho, 1);
  let d = arco(depot, seq[0], g);
  for (let i = 0; i < seq.length - 1; i++) d += arco(seq[i], seq[i + 1], g);
  return d + arcoRegreso(seq[seq.length - 1], depot, g, rho);
}

// Duración con propagación temporal (10) y retorno r^k. Devuelve r^k − b_0.
// El servicio de cada parada es s0 + (q−1)·s1: con s1 = 0 se recupera (10).
export function duracionRuta(seq, depot, P = PARAMS_DEFAULT) {
  if (!seq || !seq.length) return 0;
  const g = pn(P.gamma, 1), rho = pn(P.rho, 1), V = P.V || V_CDMX;
  const s0 = s0De(P), s1 = pn(P.s1, 0), b0 = pn(P.b0, PARAMS_DEFAULT.b0);
  let t = b0;
  t += tiempoViaje(t, arco(depot, seq[0], g), V);
  for (let i = 0; i < seq.length - 1; i++) {
    t += servicioDe(seq[i], s0, s1);
    t += tiempoViaje(t, arco(seq[i], seq[i + 1], g), V);
  }
  t += servicioDe(seq[seq.length - 1], s0, s1);
  // Con ρ = 0 el arco de regreso mide 0 km y tiempoViaje devuelve 0 h, así que
  // la jornada termina en la última entrega sin necesidad de un caso especial.
  t += tiempoViaje(t, arcoRegreso(seq[seq.length - 1], depot, g, rho), V);
  return t - b0;
}

// Hora de llegada a cada parada de la ruta, en horas decimales (26).
//
// Es la misma propagación temporal de duracionRuta (10), pero devolviendo el
// instante de llegada de cada parada en vez del total. Lo que el repartidor
// necesita es esto —"a esta dirección llego 13:40"—, no la duración de la ruta;
// y lo que el cliente pregunta es esto mismo. Una sola fuente para los dos
// números: si el ETA y la duración se calcularan por separado, se separarían.
export function etaRuta(seq, depot, P = PARAMS_DEFAULT) {
  if (!seq || !seq.length) return [];
  const g = pn(P.gamma, 1), V = P.V || V_CDMX;
  const s0 = s0De(P), s1 = pn(P.s1, 0);
  let t = pn(P.b0, PARAMS_DEFAULT.b0);
  const llegadas = new Array(seq.length);
  t += tiempoViaje(t, arco(depot, seq[0], g), V);
  llegadas[0] = t;
  for (let i = 0; i < seq.length - 1; i++) {
    t += servicioDe(seq[i], s0, s1);
    t += tiempoViaje(t, arco(seq[i], seq[i + 1], g), V);
    llegadas[i + 1] = t;
  }
  return llegadas;
}

// Resumen operativo de UNA ruta: lo que se imprime y se le entrega al proveedor.
// Separa el kilometraje de ZONA del de TRASLADO porque son dos conversaciones
// distintas: el de zona lo baja un mejor ruteo, el de traslado sólo lo baja
// mover el CEDIS o cambiar la zona asignada.
export function resumenRuta(seq, depot, P = PARAMS_DEFAULT) {
  const g = pn(P.gamma, 1), rho = pn(P.rho, 1);
  const Tmax = pn(P.Tmax, PARAMS_DEFAULT.Tmax), Kmax = pn(P.Kmax, Infinity);
  if (!seq || !seq.length) {
    return { paradas: 0, guias: 0, kmZona: 0, kmTraslado: 0, kmTotal: 0, horas: 0, ultimaEntrega: null, cumple: true };
  }
  let kmZona = 0;
  for (let i = 0; i < seq.length - 1; i++) kmZona += arco(seq[i], seq[i + 1], g);
  const kmTraslado = arco(depot, seq[0], g) + arcoRegreso(seq[seq.length - 1], depot, g, rho);
  const horas = duracionRuta(seq, depot, P);
  const llegadas = etaRuta(seq, depot, P);
  const kmTotal = kmZona + kmTraslado;
  const ultima = seq[seq.length - 1];
  return {
    paradas: seq.length,
    guias: seq.reduce((s, p) => s + qDe(p), 0),
    kmZona, kmTraslado, kmTotal,
    horas,
    // Hora en que se ENTREGA el último paquete: llegada más su servicio. No la
    // llegada a secas —el paquete no está entregado cuando el vehículo se
    // estaciona— y no el fin de jornada, que con ρ = 1 incluye el regreso al
    // CEDIS. Con ρ = 0 coincide exactamente con b₀ + horas.
    ultimaEntrega: llegadas[llegadas.length - 1] + servicioDe(ultima, s0De(P), pn(P.s1, 0)),
    cumple: horas <= Tmax && kmTotal <= Kmax,
  };
}

// D (18), CV (19), SLA% (20), CV_T (25) sobre un conjunto de rutas ya ordenadas.
export function metricas(rutas, depot, P = PARAMS_DEFAULT) {
  const activas = rutas.filter(r => r && r.length);
  if (!activas.length) {
    return { D: 0, CV: 0, CV_T: 0, SLA: 0, durMax: 0, kmMax: 0, duraciones: [], kmPorRuta: [], fueraRango: 0, minN: 0, maxN: 0, rutas: 0 };
  }
  const Tmax = pn(P.Tmax, PARAMS_DEFAULT.Tmax), Kmax = pn(P.Kmax, Infinity);
  const kmPorRuta = activas.map(r => distanciaRuta(r, depot, P));
  const D = kmPorRuta.reduce((s, x) => s + x, 0);
  const n = activas.map(r => r.length);
  const mu = n.reduce((s, x) => s + x, 0) / n.length;
  const sd = Math.sqrt(n.reduce((s, x) => s + (x - mu) ** 2, 0) / n.length);
  const durs = activas.map(r => duracionRuta(r, depot, P));
  // CV_T (25): dispersión de las JORNADAS, que es lo que el Módulo 3 minimiza.
  // CV mide reparto de paradas y CV_T reparto de trabajo; cuando difieren, el
  // que importa es CV_T — un CV de 0.02 con CV_T de 0.20 significa que todos
  // llevan los mismos paquetes y unos salen tres horas antes que otros.
  const muT = durs.reduce((s, x) => s + x, 0) / durs.length;
  const sdT = Math.sqrt(durs.reduce((s, x) => s + (x - muT) ** 2, 0) / durs.length);
  return {
    D,
    CV: mu > 0 ? sd / mu : 0,
    CV_T: muT > 0 ? sdT / muT : 0,
    // SLA (20) extendido: una ruta cumple si cabe en la jornada Y en el tope de
    // kilómetros. Con Kmax = Infinity (el default) es exactamente (20).
    SLA: 100 * durs.filter((d, i) => d <= Tmax && kmPorRuta[i] <= Kmax).length / activas.length,
    durMax: Math.max(...durs),
    kmMax: Math.max(...kmPorRuta),
    duraciones: durs,
    kmPorRuta,
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

// Devuelve { asignaciones, centros, w, iteraciones, tamaños, fueraRango, … }.
//
// Diferencias respecto a la versión anterior, todas exigidas por §6.5:
//  · criterio de paro explícito m ≤ n_j ≤ M (ec. 9) en vez de un tope fijo de
//    iteraciones. Con el tope de 150 anterior el ajuste se cortaba ANTES de
//    balancear: sobre datos reales dejaba sectores de 16 y de 61 con [m,M]=[25,60].
//  · η escalado a la geometría del dataset en vez de una constante en grados².
//  · amortiguamiento de η: sin él los tamaños oscilan y no convergen.
//  · re-siembra de sectores vacíos: sin ella un sector que se queda sin puntos
//    congela su centroide y nunca vuelve, así que k deja de cumplirse en silencio.
//
// Extensión v2 — el objetivo de tamaño deja de ser único:
//  · `nbar` es un ARREGLO de k objetivos (22) con suma n. La actualización de
//    pesos pasa de η·(n̄ − n_j) a η·(n̄_j − n_j) (17'), así que cada sector crece
//    o se encoge hacia SU objetivo. Es el canal por el que el Módulo 3 le dice a
//    la sectorización "este polígono tarda 8 h, quítale paradas".
//  · `m` y `M` también por sector. Se aceptan escalares (el rango global de la
//    tesis) o arreglos; si no se pasan se derivan como n̄_j·(1 ± delta).
//  · `centros`/`w`/`it0` permiten ARRANQUE EN CALIENTE. Sin esto cada ronda de
//    rebalanceo volvería a sembrar con k-means++ y a empezar el ajuste de pesos
//    desde cero: los sectores se reordenarían al azar entre rondas, el ruteo
//    cambiaría de forma completa cada vez y las duraciones no convergerían
//    —oscilan porque cada ronda resuelve un problema distinto—. Continuando de
//    donde quedó, cada ronda es una corrección local de la anterior.
export function powerDiagramCapacitado(pts, k, opts = {}) {
  const {
    nbar: nbarIn, m: mIn, M: MIn, centros: centrosIn, w: wIn,
    maxIt = 300, seed = 12345, it0 = 0, topeAcarreo = Infinity,
    delta = PARAMS_DEFAULT.delta, pararEnDesviacion = false, paciencia = 60,
    exigirMovimiento = false, onProgress,
  } = opts;
  const n = pts.length;
  if (!n || k < 1) return { asignaciones: [], centros: [], w: [], iteraciones: 0, itAcum: it0, tamaños: [], fueraRango: 0, usados: [], tamañosRaw: [] };
  const P2 = proyectarKm(pts);
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

  // Objetivo por sector (22). Sin `nbar` todos valen n/k: el reparto uniforme
  // de la tesis.
  const nbarProm = n / k;
  const nbar = (Array.isArray(nbarIn) && nbarIn.length === k) ? nbarIn.slice() : new Array(k).fill(nbarProm);
  // Ventana de aceptación por sector. Un escalar se expande a los k sectores
  // —así el rango global [m, M] de (9) sigue funcionando igual—; si no se pasa
  // nada, la ventana persigue al objetivo: n̄_j·(1 ± delta).
  const ventana = (v, piso) => {
    if (Array.isArray(v) && v.length === k) return v.slice();
    if (typeof v === "number" && !Number.isNaN(v)) return new Array(k).fill(v);
    return nbar.map(t => piso ? Math.floor((1 - delta) * t) : Math.ceil((1 + delta) * t));
  };
  const m = ventana(mIn, true), M = ventana(MIn, false);

  // Arranque: en frío con k-means++ (§6.5) o en caliente con los centros y los
  // pesos de la ronda anterior. Se copian para no mutar lo del llamador.
  const centros = (Array.isArray(centrosIn) && centrosIn.length === k)
    ? centrosIn.map(c => ({ x: c.x, y: c.y }))
    : kmeansPP(P2, k, rnd);
  let w = (Array.isArray(wIn) && wIn.length === k) ? wIn.slice() : new Array(k).fill(0);
  // η base: (área por sector) / (paradas por sector), dividido por 10. El factor
  // se fijó por barrido sobre datos reales: converge en 28–75 iteraciones para
  // k entre 20 y 50, mientras que valores mayores hacen oscilar los tamaños.
  // Depende sólo de la geometría del dataset, así que vale lo mismo en todas las
  // rondas y el arranque en caliente no lo altera.
  const xs = P2.map(p => p.x), ys = P2.map(p => p.y);
  const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
  const eta0 = Math.max(1e-9, (area / k) / Math.max(nbarProm, 1) / 10);

  let asg = new Array(n).fill(0), it = 0, mejorFuera = Infinity, mejorDesv = Infinity, mejorAsg = null;
  let sinMejora = 0;
  // Estado (centros, w) que PRODUJO la mejor asignación. Es lo que se devuelve
  // para el arranque en caliente, y no el estado de la última iteración: el que
  // vuelve es el que reproduce la asignación que vuelve. Devolver el último
  // dejaba el ruteo y los centros desalineados —hasta un tercio de las paradas
  // cambiaba de sector al continuar sin que nadie hubiera cambiado nada— y con
  // eso la ronda siguiente del Módulo 3 ya no corregía la que vio, corregía otra.
  let mejorCentros = null, mejorW = null;
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

    // El criterio de paro (9) sólo depende de los tamaños, así que se evalúa
    // ANTES de mover centros y pesos: así se captura el estado que generó esta
    // asignación, no el de la iteración siguiente.
    const fuera = sz.filter((x, j) => x < m[j] || x > M[j]).length;
    // Desempate por DESVIACIÓN TOTAL respecto al objetivo. El conteo de sectores
    // fuera de ventana se satura: cuando la ventana es estrecha —n̄_j·(1 ± 5 %)—
    // hay decenas de sectores fuera durante todo el ajuste y el conteo no
    // distingue "fuera pero acercándose" de "fuera y lejos". Con sólo ese
    // criterio y arranque en caliente, la iteración 1 (que reproduce la ronda
    // anterior) fijaba el récord y ninguna iteración posterior podía superarlo:
    // el Módulo 3 recibía de vuelta su propio resultado y se clavaba. La
    // desviación sí es continua, así que premia el progreso.
    let desv = 0;
    for (let j = 0; j < k; j++) desv += Math.abs(sz[j] - nbar[j]);
    // La iteración 1 de una ronda en caliente REPRODUCE la ronda anterior —es
    // justo lo que garantiza el arranque en caliente—. Si se le permite ganar
    // el récord, la ronda devuelve lo mismo que recibió y el bucle se vuelve un
    // no-op determinista: congelaba en la ronda 3 y repetía 5.18–7.09 h siete
    // veces. Excluirla obliga a la ronda a producir algo nuevo; si sale peor no
    // se pierde nada, porque rutear() se queda con la mejor ronda vista.
    const puedeGanar = !(exigirMovimiento && it === 1);
    if (puedeGanar && (fuera < mejorFuera || (fuera === mejorFuera && desv < mejorDesv - 1e-9))) {
      mejorFuera = fuera;
      mejorDesv = desv;
      mejorAsg = asg.slice();
      mejorCentros = centros.map(c => ({ x: c.x, y: c.y }));
      mejorW = w.slice();
      sinMejora = 0;
    } else {
      sinMejora++;
    }

    if (pararEnDesviacion) {
      // Criterio de paro del Módulo 3: perseguir el objetivo EXACTO, no la
      // ventana.
      //
      // La ventana no sirve para cerrar el lazo de horas. Un sector con
      // objetivo 38 y 40 paradas está dentro de ±5 %, así que (9) da por bueno
      // el reparto y rompe el bucle ANTES de tocar los pesos; (24) vuelve a
      // calcular el objetivo desde las 40 paradas medidas y sale 38 otra vez.
      // El resultado era un punto fijo con media hora de desbalance: 5.5–6.5 h
      // ronda tras ronda, con la ronda 5 saliendo en 4 iteraciones porque no
      // había nada que ajustar. Aquí el paro es la desviación: se insiste
      // mientras acercarse siga siendo posible.
      // `paciencia` tiene que darle tiempo a los pesos de VIAJAR. Con 25
      // iteraciones el ajuste se cortaba antes de poder superar al estado
      // caliente, así que cada ronda devolvía intacta la asignación de la ronda
      // 1 y el rebalanceo no existía: CV_T se quedaba en 0.205, el valor de la
      // primera pasada. Con 60 el objetivo nuevo sí se alcanza.
      if (desv <= 1e-9 || sinMejora >= paciencia) break;
    } else if (fuera === 0) {
      break;                                             // criterio de paro (9)
    }

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

    // (17') con amortiguamiento. El contador arranca en it0 para que una ronda
    // en caliente siga bajando el paso en vez de volver a dar saltos grandes.
    //
    // El acarreo está TOPADO. Sin tope, una ronda de 300 iteraciones deja it0 en
    // 300, la siguiente en 600, y para la cuarta η vale η₀/24: los pesos quedan
    // congelados, los tamaños dejan de seguir a n̄_j y el Módulo 3 se clava en un
    // punto fijo —medía 5.36–6.97 h ronda tras ronda sin poder corregir—. El tope
    // deja que cada ronda conserve memoria del ajuste anterior pero siga teniendo
    // margen para mover la frontera. Sólo afecta al arranque en caliente: con
    // it0 = 0 el amortiguamiento es exactamente el de la tesis.
    const eta = eta0 / (1 + (Math.min(it0, topeAcarreo) + it) / 40);
    for (let c = 0; c < k; c++) w[c] += eta * (nbar[c] - sz[c]);
    if (onProgress && it % 5 === 0) onProgress("clustering", Math.min(99, Math.round((it / maxIt) * 100)));
  }

  const final = mejorAsg || asg;
  // Tamaños en el índice CRUDO de centro, antes de compactar. El Módulo 3 los
  // necesita así: reparte el siguiente objetivo sobre los mismos centros que va
  // a reutilizar en caliente, y esos no se compactan.
  const tamañosRaw = new Array(k).fill(0);
  for (const a of final) tamañosRaw[a]++;
  // Compactar ids a 0..N-1 sin huecos
  const usados = [...new Set(final)].sort((a, b) => a - b);
  const remap = {}; usados.forEach((c, i) => { remap[c] = i; });
  const asignaciones = final.map(a => remap[a]);
  const tamaños = new Array(usados.length).fill(0);
  for (const a of asignaciones) tamaños[a]++;
  return {
    asignaciones, tamaños, tamañosRaw, usados,
    centros: mejorCentros || centros, w: mejorW || w,
    iteraciones: it, itAcum: it0 + it, fueraRango: mejorFuera, nbar, m, M,
  };
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
  if (n === 1) return sector.slice();
  // Con ρ = 1 un sector de dos paradas cuesta lo mismo en cualquier orden —tour
  // cerrado y simétrico— así que se devuelve tal cual, como siempre. Con ρ = 0
  // el orden SÍ importa: la ruta termina en la segunda parada y no paga el
  // regreso, así que conviene acabar en la lejana.
  if (n === 2 && pn(P.rho, 1) === 1) return sector.slice();

  // Matriz de distancias con el depósito en el índice n. Precalcularla convierte
  // cada evaluación de arco en un lookup y es lo que permite el delta O(1).
  //
  // Entre paradas la matriz es SIMÉTRICA. Los arcos con el depósito NO: la fila
  // DEP guarda la ida (γ·haversine) y la columna DEP el regreso (ρ·γ·haversine).
  // Así `dd(a,b)` sigue siendo un solo lookup y el delta del 2-opt toma el costo
  // correcto sin ramificar: cuando el sucesor es DEP lee la columna, que ya
  // trae el ρ. Con ρ = 1 la matriz vuelve a ser simétrica y todo coincide con (7).
  const g = pn(P.gamma, 1), rho = pn(P.rho, 1);
  const nodos = sector.concat([depot]);
  const D = new Float64Array((n + 1) * (n + 1));
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      const d = arco(nodos[a], nodos[b], g);
      D[a * (n + 1) + b] = d; D[b * (n + 1) + a] = d;
    }
  }
  const DEP = n;
  for (let i = 0; i < n; i++) {
    const ida = arco(depot, nodos[i], g);
    D[DEP * (n + 1) + i] = ida;                             // depósito → i
    D[i * (n + 1) + DEP] = arcoRegreso(nodos[i], depot, g, rho); // i → depósito
  }
  const dd = (a, b) => D[a * (n + 1) + b];

  // Costo de un tour completo, anclado al depósito (3)(7). Sólo se usa para
  // comparar candidatos y para cortar la alternancia; la búsqueda local trabaja
  // con deltas.
  const costo = (t) => {
    let c = dd(DEP, t[0]);
    for (let i = 0; i < t.length - 1; i++) c += dd(t[i], t[i + 1]);
    return c + dd(t[t.length - 1], DEP);
  };

  // Semilla: vecino más cercano ARRANCANDO DEL DEPÓSITO (7). Antes arrancaba en
  // el punto más cercano al centroide, lo que ignora de dónde sale el vehículo.
  const vecinoMasCercano = (primero) => {
    const rem = new Set();
    for (let i = 0; i < n; i++) if (i !== primero) rem.add(i);
    const t = primero == null ? [] : [primero];
    let actual = primero == null ? DEP : primero;
    while (rem.size) {
      let mejor = -1, md = Infinity;
      for (const i of rem) { const d = dd(actual, i); if (d < md) { md = d; mejor = i; } }
      t.push(mejor); rem.delete(mejor); actual = mejor;
    }
    return t;
  };

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

  // OR-OPT: mueve un segmento de 1, 2 o 3 paradas consecutivas a otra posición,
  // en cualquiera de los dos sentidos.
  //
  // Es el complemento del 2-opt, no un refinamiento: el 2-opt sólo INVIERTE
  // tramos, así que nunca puede sacar una parada de donde está para meterla en
  // otro lado del tour. El caso que aparece en todos los sectores reales es la
  // parada aislada que quedó entre dos manzanas densas: el 2-opt la deja ahí
  // porque cualquier inversión que la mueva alarga el tour, y el or-opt la
  // reubica con un desvío de menos de la mitad.
  //
  // Delta O(1): sacar el segmento cierra el hueco (p → q) y meterlo entre a y b
  // abre (a → seg) y (seg → b). Tres lookups por lado, igual que el 2-opt. Los
  // extremos son el depósito virtual, así que la asimetría de ρ entra sola: si
  // el segmento se inserta al final, `dd(seg, DEP)` ya trae el factor de regreso.
  const orOpt = (t) => {
    let mejoro = true, vueltas = 0;
    while (mejoro && vueltas++ < maxVueltas) {
      mejoro = false;
      for (let L = 1; L <= 3 && L < t.length && !mejoro; L++) {
        for (let i = 0; i + L <= t.length && !mejoro; i++) {
          const seg = t.slice(i, i + L);
          const p = antes(t, i), q = despues(t, i + L - 1);
          // Lo que se ahorra al quitar el segmento y cerrar el hueco.
          const ganancia = dd(p, seg[0]) + dd(seg[L - 1], q) - dd(p, q);
          const resto = t.slice(0, i).concat(t.slice(i + L));
          if (!resto.length) continue;
          let mejorDelta = -1e-9, mejorPos = -1, mejorRev = false;
          for (let j = 0; j <= resto.length; j++) {
            const a = j === 0 ? DEP : resto[j - 1];
            const b = j === resto.length ? DEP : resto[j];
            const base = dd(a, b);
            const dIda = dd(a, seg[0]) + dd(seg[L - 1], b) - base - ganancia;
            if (dIda < mejorDelta) { mejorDelta = dIda; mejorPos = j; mejorRev = false; }
            if (L > 1) {
              const dRev = dd(a, seg[L - 1]) + dd(seg[0], b) - base - ganancia;
              if (dRev < mejorDelta) { mejorDelta = dRev; mejorPos = j; mejorRev = true; }
            }
          }
          // Reinsertar donde estaba da delta 0 y no pasa el umbral, así que el
          // movimiento nulo nunca se "acepta" ni dispara otra vuelta.
          if (mejorPos >= 0) {
            resto.splice(mejorPos, 0, ...(mejorRev ? seg.slice().reverse() : seg));
            t = resto;
            mejoro = true;
          }
        }
      }
    }
    return t;
  };

  // Búsqueda local completa sobre un tour: 2-opt y, si está activado, la
  // alternancia con or-opt. Cada movimiento de or-opt abre inversiones nuevas
  // para el 2-opt y al revés, así que se repite hasta que una pasada de los dos
  // no baja el costo.
  const mejorarTour = (t) => {
    t = dosOpt(t);
    if (P.orOpt !== true) return t;
    let mejoroAlgo = true, ciclos = 0;
    while (mejoroAlgo && ciclos++ < maxVueltas) {
      const costoAntes = costo(t);
      t = dosOpt(orOpt(t));
      mejoroAlgo = costo(t) < costoAntes - 1e-9;
    }
    return t;
  };

  // INICIO MÚLTIPLE (§7.3). El vecino más cercano desde el depósito tiene un
  // defecto conocido: se come las paradas cercanas primero y deja las lejanas
  // sueltas, así que el último tramo es un regreso largo y caro. Arrancar por
  // una parada lejana —la primera arista sigue siendo depósito → esa parada—
  // produce un barrido de ida y vuelta al que el 2-opt no llega desde la semilla
  // golosa, porque ya está en un mínimo local. Se prueban las hasta 10 paradas
  // más lejanas al depósito.
  //
  // Cada candidato se OPTIMIZA COMPLETO y se compara el resultado final, no la
  // semilla. Elegir por costo de la semilla —y optimizar sólo a la ganadora—
  // empeora el total: sobre los 50 sectores del archivo de prueba daba 2,075 km
  // contra 2,071 del 2-opt a secas, porque la semilla más corta no es la que cae
  // en el mejor mínimo local. Comparando tours ya optimizados baja a 2,021 km.
  const inicios = Math.max(1, Math.round(pn(P.inicios, 1)));
  const semillas = [vecinoMasCercano(null)];
  if (inicios > 1 && n > 3) {
    const lejanas = Array.from({ length: n }, (_, i) => i)
      .sort((a, b) => (dd(DEP, b) - dd(DEP, a)) || (a - b))   // desempate por índice: determinista
      .slice(0, Math.min(inicios - 1, 10));
    for (const f of lejanas) semillas.push(vecinoMasCercano(f));
  }
  let cur = null, mejorCosto = Infinity;
  for (const s of semillas) {
    const t = mejorarTour(s);
    const c = costo(t);
    if (c < mejorCosto - 1e-9) { mejorCosto = c; cur = t; }
  }

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
  const Tmax = pn(P.Tmax, PARAMS_DEFAULT.Tmax);
  if (dur0 > Tmax && dur0 <= Tmax * 1.6) {
    let dur = dur0, mejoro = true, vueltas = 0;
    while (mejoro && dur > Tmax && vueltas++ < 8) {
      mejoro = false;
      for (let i = 0; i < cur.length - 1 && dur > Tmax; i++) {
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

// ---------------- Agrupación por dirección ----------------
// Colapsa las guías que comparten coordenada EXACTA en una sola parada con
// q = número de guías.
//
// Sin esto el ruteador cuenta 5 paradas donde el repartidor hace una sola
// bajada: paga 5 veces el estacionamiento, y el balanceo cree que ese sector
// está lleno cuando en trabajo real está vacío. En el archivo de operación
// 2,263 guías son 2,010 domicilios — 11 % de paradas fantasma.
//
// La llave es el string de los dos números tal cual. La conversión de un double
// a string en JS es la representación más corta que redondea al mismo double, o
// sea inyectiva: dos coordenadas producen la misma llave si y sólo si son el
// mismo valor de punto flotante. Nada de tolerancias — "misma dirección" aquí
// significa misma geocodificación, que es lo que garantiza que el repartidor
// hace una sola bajada.
//
// Devuelve las paradas en orden de PRIMERA APARICIÓN (Map preserva inserción),
// así el resultado no depende de cómo venga ordenado el archivo.
export function agruparParadas(pts) {
  const porLlave = new Map();
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const llave = p.lat + "|" + p.lng;
    let gr = porLlave.get(llave);
    if (!gr) { gr = { lat: p.lat, lng: p.lng, q: 0, filas: [] }; porLlave.set(llave, gr); }
    gr.q++;
    gr.filas.push(i);
  }
  return [...porLlave.values()];
}

// Reparte `total` paradas entre k sectores respetando la proporción de `pesos`,
// en enteros y sin perder ni inventar paradas.
//
// El redondeo es por RESTO MAYOR, no por sector: redondear cada objetivo por
// separado deja la suma de n̄ en n ± k/2, y entonces el ajuste de pesos (17')
// empuja a todos los sectores en la misma dirección —hacia arriba o hacia
// abajo— y el balanceo deja de converger. El piso de 1 evita que un sector
// quede con objetivo 0, que es lo mismo que borrarlo.
const repartirEnteros = (pesos, total) => {
  const k = pesos.length;
  if (!k) return [];
  const suma = pesos.reduce((a, b) => a + b, 0);
  const esc = suma > 0 ? pesos.map(p => (p * total) / suma) : new Array(k).fill(total / k);
  const ent = esc.map(x => Math.max(1, Math.floor(x)));
  let dif = total - ent.reduce((a, b) => a + b, 0);
  if (dif > 0) {                                  // sobran: a los de mayor resto
    const orden = esc.map((x, i) => ({ i, r: x - Math.floor(x) }))
      .sort((a, b) => (b.r - a.r) || (a.i - b.i));
    for (let p = 0; dif > 0; p++) { ent[orden[p % k].i]++; dif--; }
  } else if (dif < 0) {                           // faltan: a los más grandes
    const orden = ent.map((v, i) => ({ i, v })).sort((a, b) => (b.v - a.v) || (a.i - b.i));
    let p = 0, guard = 0;
    while (dif < 0 && guard++ < 100 * k + 100) {
      const i = orden[p++ % k].i;
      if (ent[i] > 1) { ent[i]--; dif++; }
    }
  }
  return ent;
};

// ---------------- Módulo 3: rebalanceo por jornada ----------------
// Devuelve { assigns, seqOrder, eta, metricas, rutasResumen, diagnostico }
// manteniendo el contrato que ya consumía ModuleRuteo (assigns + seqOrder).
//
// assigns y seqOrder están indexados por RENGLÓN DEL ARCHIVO, siempre — con y
// sin agrupación. Cuando se agrupa, todas las guías de un domicilio reciben la
// misma ruta y la misma posición: es una sola bajada del repartidor.
//
// EL BUCLE (23)(24). Sectorizar y secuenciar están acoplados: el tamaño del
// sector decide la duración, pero la duración sólo se conoce DESPUÉS de
// secuenciar. La tesis corta el ciclo fijando el tamaño como objetivo (9), que
// es equivalente a suponer que todas las paradas cuestan lo mismo. No lo hacen:
// con 40 paradas parejas, un sector de Santa Fe sale en 9 h y uno del Centro en
// 5 h, porque el traslado dentro de la zona y hasta ella no tienen nada que ver.
//
// Aquí la duración medida regresa a la sectorización como objetivo de tamaño:
//
//   n̄_j ← n_j · (T̄ / T_j)^α            (24)
//
// α = 0 apaga el lazo (n̄_j = n_j, una sola pasada: el modelo de la tesis).
// α = 1 corrige de golpe suponiendo que la duración es proporcional al número
// de paradas, lo que exagera —hay un costo fijo de traslado que no se reparte—
// y hace oscilar los tamaños. α ≈ 0.7 corrige la mayor parte sin pasarse.
// Los sectores que violan T_max o K_max reciben además un 0.85 de castigo: ahí
// no basta con acercarse al promedio, hay que bajar del tope.
export function rutear(pts, k, depot, params = {}, onProgress) {
  const P = { ...PARAMS_DEFAULT, ...params };
  const nFilas = pts.length;
  if (!nFilas || k < 1) {
    return { assigns: [], seqOrder: [], eta: [], metricas: null, rutasResumen: [], diagnostico: null };
  }

  const t0 = (typeof performance !== "undefined" ? performance.now() : 0);

  // Paradas sobre las que trabaja el algoritmo. Sin agrupación son las guías
  // tal cual (q = 1) y todo se comporta como antes.
  const grupos = P.agrupar ? agruparParadas(pts) : null;
  const paradas = grupos ? grupos.map(g => ({ lat: g.lat, lng: g.lng, q: g.q })) : pts;
  const n = paradas.length;
  const kEf = Math.min(k, n);

  const Rmax = Math.max(1, Math.round(pn(P.Rmax, 1)));
  const alpha = pn(P.alpha, 0), eps = pn(P.eps, PARAMS_DEFAULT.eps);
  const Tmax = pn(P.Tmax, PARAMS_DEFAULT.Tmax), Kmax = pn(P.Kmax, Infinity);

  let nbar = new Array(kEf).fill(n / kEf);
  let centros = null, w = null, itAcum = 0;
  const historial = [];
  // Mejor ronda vista, no la última. Con α alto los tamaños pueden pasarse y
  // rebotar; devolver la última ronda entregaría a la calle un plan peor que
  // uno que ya se había calculado. Se ordena por (rutas infactibles, dispersión
  // de jornadas): primero que quepan, luego que estén parejas.
  let mejor = null;
  let ronda = 0, rondasCorridas = 0, rondasSinMejora = 0;

  for (ronda = 0; ronda < Rmax; ronda++) {
    rondasCorridas = ronda + 1;
    if (onProgress && Rmax > 1) onProgress("rebalanceo", Math.round((ronda / Rmax) * 100));

    // Ronda 0: la ventana global [m, M] de la tesis (9) — es el reparto
    // geográfico de arranque y ahí el objetivo todavía es uniforme. De la ronda
    // 1 en adelante el objetivo ya viene de las horas, así que la ventana lo
    // persigue: n̄_j·(1 ± delta). Mantener [m, M] fijo ahí haría que el criterio
    // de paro aceptara sectores que no cumplen el objetivo nuevo.
    const pd = powerDiagramCapacitado(paradas, kEf, {
      nbar,
      m: ronda === 0 ? P.m : undefined,
      M: ronda === 0 ? P.M : undefined,
      delta: pn(P.delta, PARAMS_DEFAULT.delta),
      pararEnDesviacion: ronda > 0,
      exigirMovimiento: ronda > 0,
      centros, w, it0: itAcum,
      onProgress,
    });
    const asgParada = pd.asignaciones;
    const nClusters = pd.tamaños.length;

    const seqParada = new Array(n).fill(0);
    const rutas = [];
    for (let c = 0; c < nClusters; c++) {
      const idxs = [];
      for (let i = 0; i < n; i++) if (asgParada[i] === c) idxs.push(i);
      const sector = idxs.map(i => ({ ...paradas[i], _gi: i }));
      const ordenado = ordenarSector(sector, depot, P);
      ordenado.forEach((p, pos) => { seqParada[p._gi] = pos; });
      rutas.push(ordenado);
      if (onProgress && c % 3 === 0) onProgress("tsp", Math.round((c / nClusters) * 100));
    }

    // Lo que acaba de pasar en la calle, no lo que el modelo suponía.
    const T = rutas.map(r => duracionRuta(r, depot, P));
    const KM = rutas.map(r => distanciaRuta(r, depot, P));
    const minT = Math.min(...T), maxT = Math.max(...T), maxKm = Math.max(...KM);
    const infactibles = T.filter((t, c) => t > Tmax || KM[c] > Kmax).length;
    historial.push({
      ronda: rondasCorridas,
      minT: +minT.toFixed(3), maxT: +maxT.toFixed(3), maxKm: +maxKm.toFixed(2),
      infactibles, iteracionesPD: pd.iteraciones,
    });

    const puntaje = [infactibles, maxT - minT];
    if (!mejor || puntaje[0] < mejor.puntaje[0] ||
        (puntaje[0] === mejor.puntaje[0] && puntaje[1] < mejor.puntaje[1] - 1e-9)) {
      mejor = { puntaje, asgParada, seqParada, rutas, pd, T, KM, ronda: rondasCorridas };
      rondasSinMejora = 0;
    } else {
      rondasSinMejora++;
    }

    // Paro: jornadas parejas y todas dentro de los dos topes.
    if ((maxT - minT < eps && !infactibles) || ronda === Rmax - 1) break;
    // Paro por estancamiento, con holgura. El sistema sectorizar↔secuenciar
    // tiene óptimos locales: con la geografía fija y sectores convexos hay un
    // piso de dispersión que no se baja moviendo cuentas de paradas. Pero las
    // mesetas no siempre son el final —se midieron rondas planas que vuelven a
    // mejorar a la tercera—, así que se corta a las 3 y no a la primera.
    if (rondasSinMejora >= 3) break;

    // (24): el objetivo de cada sector se mueve en proporción a qué tan lejos
    // está su jornada del promedio.
    const Tprom = T.reduce((s, x) => s + x, 0) / T.length;
    const pesos = new Array(kEf).fill(n / kEf);
    pd.usados.forEach((raw, c) => {
      let obj = rutas[c].length * Math.pow(Tprom / Math.max(T[c], 1e-9), alpha);
      if (T[c] > Tmax || KM[c] > Kmax) obj *= 0.85;
      pesos[raw] = Math.max(1, obj);
    });
    nbar = repartirEnteros(pesos, n);
    // La ronda siguiente continúa de ESTA, no de la mejor vista. Encadenar
    // explora: el bucle recorre configuraciones distintas y a veces encuentra
    // repartos que un descenso puro no alcanza —sobre el archivo de prueba con
    // k=47 la dispersión seguía bajando hasta la ronda 10, después de dos
    // rondas planas—. Reiniciar siempre de la mejor converge más rápido pero se
    // clava antes. El riesgo de encadenar es terminar peor de donde se pasó, y
    // de eso se encarga `mejor`: se explora con todas las rondas y se entrega
    // la mejor, así que una ronda mala no cuesta nada.
    centros = pd.centros; w = pd.w; itAcum += pd.iteraciones;
  }

  const { asgParada, seqParada, rutas, pd } = mejor;

  // ETA por parada y resumen por ruta (26). Se calculan sobre las rutas de la
  // ronda elegida, con los mismos tiempos con que se evaluó la factibilidad.
  const etaParada = new Array(n).fill(null);
  const rutasResumen = rutas.map((seq, c) => {
    etaRuta(seq, depot, P).forEach((h, pos) => { etaParada[seq[pos]._gi] = h; });
    return { ruta: c + 1, cluster: c, ...resumenRuta(seq, depot, P) };
  });

  // De paradas a renglones del archivo.
  let assigns = asgParada, seqOrder = seqParada, eta = etaParada;
  if (grupos) {
    assigns = new Array(nFilas).fill(0);
    seqOrder = new Array(nFilas).fill(0);
    eta = new Array(nFilas).fill(null);
    grupos.forEach((gr, gi) => {
      for (const fila of gr.filas) {
        assigns[fila] = asgParada[gi];
        seqOrder[fila] = seqParada[gi];
        eta[fila] = etaParada[gi];
      }
    });
  }

  const t1 = (typeof performance !== "undefined" ? performance.now() : 0);
  return {
    assigns, seqOrder, eta, rutasResumen,
    metricas: metricas(rutas, depot, P),
    diagnostico: {
      iteracionesPD: pd.iteraciones,
      fueraRango: pd.fueraRango,
      tamaños: pd.tamaños,
      msComputo: Math.round(t1 - t0),
      k: rutas.length,
      guias: nFilas,
      paradas: n,
      rondas: rondasCorridas,
      rondaElegida: mejor.ronda,
      historial,
    },
  };
}
```

---

## `src/components/kmeansWorker.js`

```js
// Web Worker del ruteador. Saca el cómputo pesado del main thread para que la
// UI no se congele con 15K+ puntos.
//
// El algoritmo NO vive aquí: está en src/lib/ruteo.js y lo comparte con el
// camino inline de ModuleRuteo. Antes había dos copias del mismo código y
// divergían con cada cambio.
//
// Recibe: { pts: [{lat,lng}], k, depot: {lat,lng}, params }
// Devuelve: { assigns, seqOrder, metricas, diagnostico }
import { rutear } from "../lib/ruteo.js";

self.onmessage = (e) => {
  const { pts, k, depot, params } = e.data;
  try {
    const result = rutear(pts, k, depot, params || {}, (phase, value) => {
      self.postMessage({ progress: { phase, value } });
    });
    self.postMessage({ result });
  } catch (err) {
    self.postMessage({ error: err.message || String(err) });
  }
};
```
