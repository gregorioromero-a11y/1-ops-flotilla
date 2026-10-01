// Genera el archivo de prueba del ruteador: 2,263 guías sobre 2,010 direcciones
// distintas en la ZMVM.
//
// SUSTITUTO SINTÉTICO del archivo real de operación. Las cifras de aceptación
// (2,263 guías → 2,010 paradas) se reproducen exactamente porque la duplicación
// de direcciones se construye a propósito: 1,810 direcciones con una guía, 168
// con dos, 24 con tres y 8 con cinco — 2,010 paradas y 2,263 guías.
//
// Es determinista (LCG con semilla fija), así que el test de regresión congela
// una salida reproducible en cualquier máquina. No hay datos de clientes.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));

// Centros de demanda aproximados de la ZMVM, con el peso relativo con que se
// reparten las paradas. Sirven para que la geometría no sea uniforme —un
// ruteador se comporta distinto sobre puntos uniformes que sobre clusters— y
// para que el balanceo por horas tenga algo real que corregir: los polígonos
// lejanos al depósito consumen mucho más traslado por parada.
const ZONAS = [
  { nom: "Centro",            lat: 19.4326, lng: -99.1332, sd: 0.018, peso: 12 },
  { nom: "Roma-Condesa",      lat: 19.4110, lng: -99.1710, sd: 0.014, peso: 9 },
  { nom: "Polanco",           lat: 19.4330, lng: -99.1930, sd: 0.013, peso: 7 },
  { nom: "Santa Fe",          lat: 19.3600, lng: -99.2600, sd: 0.022, peso: 6 },
  { nom: "Coyoacán",          lat: 19.3500, lng: -99.1620, sd: 0.019, peso: 8 },
  { nom: "Del Valle",         lat: 19.3780, lng: -99.1680, sd: 0.016, peso: 8 },
  { nom: "Iztapalapa",        lat: 19.3570, lng: -99.0680, sd: 0.028, peso: 11 },
  { nom: "GAM",               lat: 19.4870, lng: -99.1100, sd: 0.026, peso: 10 },
  { nom: "Azcapotzalco",      lat: 19.4850, lng: -99.1840, sd: 0.020, peso: 6 },
  { nom: "Tlalpan",           lat: 19.2900, lng: -99.1650, sd: 0.030, peso: 6 },
  { nom: "Xochimilco",        lat: 19.2570, lng: -99.1030, sd: 0.026, peso: 4 },
  { nom: "Naucalpan",         lat: 19.4780, lng: -99.2390, sd: 0.024, peso: 5 },
  { nom: "Ecatepec",          lat: 19.6010, lng: -99.0500, sd: 0.032, peso: 5 },
  { nom: "Nezahualcóyotl",    lat: 19.4000, lng: -98.9900, sd: 0.028, peso: 6 },
  { nom: "Tláhuac",           lat: 19.2870, lng: -99.0000, sd: 0.024, peso: 3 },
];

const N_PARADAS = 2010;
const N_GUIAS = 2263;

// LCG idéntico al del ruteador, para no introducir otra fuente de aleatoriedad.
let s = 987654321 >>> 0;
const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
// Box-Muller: las paradas alrededor de un centro se ven gaussianas, no cuadradas.
const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-12))) * Math.cos(2 * Math.PI * rnd());

const acumPeso = [];
{
  let acc = 0;
  for (const z of ZONAS) { acc += z.peso; acumPeso.push({ z, hasta: acc }); }
  for (const a of acumPeso) a.hasta /= acc;
}
const zonaAlAzar = () => { const u = rnd(); return (acumPeso.find(a => u <= a.hasta) || acumPeso[acumPeso.length - 1]).z; };

// Direcciones únicas. Se redondea a 5 decimales (~1.1 m) porque así llegan las
// geocodificaciones del operador y es lo que hace que la agrupación por
// coordenada exacta tenga sentido: dos guías al mismo domicilio comparten el
// string, no un valor "casi igual". El Set garantiza que sean 2,010 distintas.
const vistas = new Set();
const paradas = [];
while (paradas.length < N_PARADAS) {
  const z = zonaAlAzar();
  const lat = +(z.lat + gauss() * z.sd).toFixed(5);
  const lng = +(z.lng + gauss() * z.sd).toFixed(5);
  if (lat < 19.10 || lat > 19.75 || lng < -99.40 || lng > -98.85) continue;
  const key = lat + "," + lng;
  if (vistas.has(key)) continue;
  vistas.add(key);
  paradas.push({ lat, lng, zona: z.nom });
}

// Reparto de guías por dirección: 8 direcciones con 5 guías, 24 con 3, 168 con 2
// y el resto con 1. Total = 8·5 + 24·3 + 168·2 + 1810 = 40 + 72 + 336 + 1810 = 2258.
// Faltan 5, que se agregan a 5 direcciones más con 2 guías.
const multiplicidad = new Array(N_PARADAS).fill(1);
const asignarMult = (cuantas, q, desde) => { for (let i = 0; i < cuantas; i++) multiplicidad[desde + i * 7] = q; };
asignarMult(8, 5, 3);
asignarMult(24, 3, 61);
asignarMult(173, 2, 240);
const totalGuias = multiplicidad.reduce((a, b) => a + b, 0);
if (totalGuias !== N_GUIAS) {
  throw new Error(`El reparto da ${totalGuias} guías y se esperaban ${N_GUIAS}. Ajusta asignarMult.`);
}

const filas = [];
let folio = 40000000;
paradas.forEach((p, i) => {
  for (let g = 0; g < multiplicidad[i]; g++) {
    filas.push({
      "Tracking Number": "T1" + (folio++),
      Latitud: p.lat,
      Longitud: p.lng,
      Alcaldia: p.zona,
      Piezas: 1 + (folio % 3),
    });
  }
});

// Se barajan las filas: en el archivo real las guías de un mismo domicilio NO
// llegan contiguas, y que el agrupamiento no dependa del orden es justo lo que
// hay que probar.
for (let i = filas.length - 1; i > 0; i--) {
  const j = Math.floor(rnd() * (i + 1));
  [filas[i], filas[j]] = [filas[j], filas[i]];
}

const destino = join(AQUI, "fixtures", "guias-2263.json");
writeFileSync(destino, JSON.stringify(filas, null, 0));
const unicas = new Set(filas.map(f => f.Latitud + "," + f.Longitud)).size;
console.log(`✓ ${destino}`);
console.log(`  ${filas.length} guías · ${unicas} direcciones únicas`);
