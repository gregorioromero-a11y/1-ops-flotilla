// Prueba de las tarifas por paquete entregado.
//
//   node scripts/tarifasTest.mjs
//
// Verifica que la tabla de tarifas sea UNA SOLA para los dos motores que la
// consumen —Registrar Envíos y Consultas, que antes tenían copias separadas— y
// que el costo se calcule sobre los paquetes ENTREGADOS, no sobre los asignados.
//
// Importa de lib/costEngine.js, que es donde vive la tabla; el cálculo se
// replica aquí porque el motor está dentro del componente de React y no se
// puede importar sin montarlo. Es duplicación consciente y acotada: si la
// fórmula del componente cambia, este test deja de representarla, así que la
// comprobación de que ambos motores usan la MISMA tabla se hace leyendo el JSX.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "tarifas-"));
writeFileSync(join(dir, "costEngine.mjs"),
  readFileSync(join(AQUI, "..", "src", "lib", "costEngine.js"), "utf8"));
const { TARIFAS_POR_PAQUETE, TARIFAS_POR_RUTA } = await import(pathToFileURL(join(dir, "costEngine.mjs")).href);

let fallas = 0;
const check = (nom, ok, detalle = "") => {
  console.log((ok ? "  ✓ " : "  ✗ ") + nom + (detalle ? `  ${detalle}` : ""));
  if (!ok) fallas++;
};

console.log("Tarifa por paquete entregado\n");
for (const [tipo, tarifa] of Object.entries(TARIFAS_POR_PAQUETE)) {
  console.log(`  ${tipo.padEnd(20)} $${tarifa}/paquete`);
}
console.log();

// ---- 1. Operación TIL existe y cuesta 40 ----
check("Operación TIL está en la tabla", "Operación TIL" in TARIFAS_POR_PAQUETE);
check("Operación TIL cuesta $40 por paquete", TARIFAS_POR_PAQUETE["Operación TIL"] === 40,
      `= $${TARIFAS_POR_PAQUETE["Operación TIL"]}`);

// ---- 2. No colisiona con las tarifas por RUTA ----
// Un tipo en las dos tablas se cobraría como dedicada —plano por día— porque
// esa rama se evalúa primero, y la tarifa por paquete quedaría muerta.
const colision = Object.keys(TARIFAS_POR_PAQUETE).filter(t => t in TARIFAS_POR_RUTA);
check("ningún tipo está en las dos tablas a la vez", colision.length === 0, colision.join(", "));

// ---- 3. El cálculo usa ENTREGADOS, no asignados ----
// Réplica de la rama de tarifa fija del motor: paqOperados = entregados
// (+ recolecciones sólo si el tipo es crossdock).
const esCrossdock = (tipo) => /(half|cross)/i.test(tipo || "");
const costoTIL = (ruta) => {
  const tarifa = TARIFAS_POR_PAQUETE[ruta.tipoRuta];
  if (tarifa == null) return null;
  const paqOperados = (parseInt(ruta.entregados) || 0)
    + (esCrossdock(ruta.tipoRuta) ? (parseInt(ruta.recolecciones) || 0) : 0);
  return tarifa * paqOperados;
};

const casos = [
  { nom: "ruta TIL de 50 asignados con 38 entregados", r: { tipoRuta: "Operación TIL", total: 50, entregados: 38 }, esperado: 38 * 40 },
  { nom: "ruta TIL que no entregó nada", r: { tipoRuta: "Operación TIL", total: 40, entregados: 0 }, esperado: 0 },
  { nom: "ruta TIL con entregados vacío", r: { tipoRuta: "Operación TIL", total: 40, entregados: null }, esperado: 0 },
  { nom: "TIL ignora recolecciones (no es crossdock)", r: { tipoRuta: "Operación TIL", entregados: 10, recolecciones: 99 }, esperado: 400 },
  { nom: "PETCO Monterrey sigue en $50", r: { tipoRuta: "PETCO Monterrey", entregados: 12 }, esperado: 600 },
  { nom: "Foráneo GDL sigue en $55", r: { tipoRuta: "Foráneo GDL", entregados: 20 }, esperado: 1100 },
  { nom: "Última milla NO entra por esta vía", r: { tipoRuta: "Última milla", entregados: 30 }, esperado: null },
];
console.log();
for (const c of casos) {
  const got = costoTIL(c.r);
  check(c.nom, got === c.esperado, `esperado ${c.esperado === null ? "sin tarifa fija" : "$" + c.esperado} · obtenido ${got === null ? "sin tarifa fija" : "$" + got}`);
}

// ---- 4. Los dos motores leen la MISMA tabla ----
// Se lee el JSX: lo que importa es que ninguno tenga un objeto literal propio.
const jsx = readFileSync(join(AQUI, "..", "src", "components", "T1OpsFlotilla.jsx"), "utf8");
console.log();
check("Registrar Envíos usa la tabla compartida",
      /const TARIFAS_FIJAS = TARIFAS_POR_PAQUETE;/.test(jsx));
check("Consultas usa la tabla compartida",
      /const TARIFAS_FIJAS_LOCAL = TARIFAS_POR_PAQUETE;/.test(jsx));
check("no quedó ningún literal de tarifas suelto en el componente",
      !/TARIFAS_FIJAS(_LOCAL)?\s*=\s*\{/.test(jsx));
check("Operación TIL aparece en el menú por fila",
      /<option value="Operación TIL">/.test(jsx));
check("Operación TIL aparece en la captura manual",
      /"Foráneo Xalapa",\s*"Operación TIL"\]/.test(jsx));
check("Operación TIL aparece en las operaciones canónicas",
      /"Foráneo Xalapa",\n\s*"Operación TIL",/.test(jsx));

if (fallas) { console.error(`\n✗ ${fallas} comprobación(es) fallaron`); process.exit(1); }
console.log("\n✓ todo correcto — $40 por paquete ENTREGADO, una sola tabla para ambos motores");
