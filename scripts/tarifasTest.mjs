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
const { TARIFAS_POR_PAQUETE, TARIFAS_POR_RUTA, tarifaPorPaquete, vigenciasDe } =
  await import(pathToFileURL(join(dir, "costEngine.mjs")).href);

let fallas = 0;
const check = (nom, ok, detalle = "") => {
  console.log((ok ? "  ✓ " : "  ✗ ") + nom + (detalle ? `  ${detalle}` : ""));
  if (!ok) fallas++;
};

console.log("Tarifa por paquete entregado (SIN IVA — la prefactura suma el 16 %)\n");
for (const tipo of Object.keys(TARIFAS_POR_PAQUETE)) {
  const vs = vigenciasDe(tipo).map(v => v.desde ? `$${v.monto} desde ${v.desde}` : `$${v.monto}`);
  console.log(`  ${tipo.padEnd(20)} ${vs.join("  ·  ")}`);
}
console.log();

// ---- 1. Operación TIL y sus vigencias ----
// La tarifa se renegoció el 19 de octubre de 2026. Cada ruta debe cobrarse al
// precio que regía EL DÍA QUE SALIÓ: si se sustituyera el número, reconsultar un
// rango viejo lo recalcularía al precio nuevo y la prefactura ya emitida dejaría
// de cuadrar. Por eso los casos de frontera son el corazón de este test.
check("Operación TIL está en la tabla", "Operación TIL" in TARIFAS_POR_PAQUETE);
const TIL = (f) => tarifaPorPaquete("Operación TIL", f);
const fechas = [
  ["2026-09-30", 45, "muy antes del cambio"],
  ["2026-10-17", 45, "víspera de la víspera"],
  ["2026-10-18", 45, "ÚLTIMO día de la tarifa vieja"],
  ["2026-10-19", 55, "PRIMER día de la tarifa nueva"],
  ["2026-10-20", 55, "después del cambio"],
  ["2027-03-01", 55, "muy después"],
];
for (const [f, esperado, nota] of fechas) {
  check(`${f} → $${esperado}  (${nota})`, TIL(f) === esperado, `obtenido $${TIL(f)}`);
}
// Con marca de tiempo completa, como llega de la base.
check("acepta timestamp ISO completo", TIL("2026-10-19T06:14:22.000Z") === 55, `obtenido $${TIL("2026-10-19T06:14:22.000Z")}`);
// Sin fecha se toma la vigencia MÁS ANTIGUA: cobrar de más un registro
// histórico ya facturado rompe una conciliación; cobrar de menos uno nuevo, no.
check("sin fecha usa la vigencia más antigua ($45)", TIL("") === 45 && TIL(null) === 45 && TIL(undefined) === 45);
check("un tipo sin tarifa por paquete devuelve null", tarifaPorPaquete("Última milla", "2026-10-19") === null);

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
  const tarifa = tarifaPorPaquete(ruta.tipoRuta, ruta.fecha);
  if (tarifa == null) return null;
  const paqOperados = (parseInt(ruta.entregados) || 0)
    + (esCrossdock(ruta.tipoRuta) ? (parseInt(ruta.recolecciones) || 0) : 0);
  return tarifa * paqOperados;
};

const casos = [
  { nom: "TIL 18 oct · 50 asignados, 38 entregados → 38 × $45", r: { tipoRuta: "Operación TIL", fecha: "2026-10-18", total: 50, entregados: 38 }, esperado: 38 * 45 },
  { nom: "TIL 19 oct · misma ruta → 38 × $55", r: { tipoRuta: "Operación TIL", fecha: "2026-10-19", total: 50, entregados: 38 }, esperado: 38 * 55 },
  { nom: "TIL que no entregó nada", r: { tipoRuta: "Operación TIL", fecha: "2026-10-19", total: 40, entregados: 0 }, esperado: 0 },
  { nom: "TIL con entregados vacío", r: { tipoRuta: "Operación TIL", fecha: "2026-10-19", total: 40, entregados: null }, esperado: 0 },
  { nom: "TIL ignora recolecciones (no es crossdock)", r: { tipoRuta: "Operación TIL", fecha: "2026-10-19", entregados: 10, recolecciones: 99 }, esperado: 550 },
  { nom: "PETCO Monterrey sigue en $50 sin importar la fecha", r: { tipoRuta: "PETCO Monterrey", fecha: "2026-10-19", entregados: 12 }, esperado: 600 },
  { nom: "Foráneo GDL sigue en $55", r: { tipoRuta: "Foráneo GDL", fecha: "2026-10-19", entregados: 20 }, esperado: 1100 },
  { nom: "Última milla NO entra por esta vía", r: { tipoRuta: "Última milla", fecha: "2026-10-19", entregados: 30 }, esperado: null },
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
check("Registrar Envíos resuelve la tarifa por fecha de ruta",
      /const rateFija = tarifaPorPaquete\(r\.tipoRuta, fechaRuta\);/.test(jsx));
check("Consultas resuelve la tarifa por fecha de ruta",
      /tarifaPorPaquete\(r\.tipo_ruta, r\.fecha_salida \|\| r\.fecha_registro\)/.test(jsx));
check("no quedó ninguna tabla de tarifas suelta en el componente",
      !/TARIFAS_FIJAS/.test(jsx));
check("la fecha de registro llega al objeto de ruta (respaldo de fecha)",
      /fechaRegistro: r\.fecha_registro \|\| ""/.test(jsx));
check("Operación TIL aparece en el menú por fila",
      /<option value="Operación TIL">/.test(jsx));
check("Operación TIL aparece en la captura manual",
      /"Foráneo Xalapa",\s*"Operación TIL"\]/.test(jsx));
check("Operación TIL aparece en las operaciones canónicas",
      /"Foráneo Xalapa",\n\s*"Operación TIL",/.test(jsx));

if (fallas) { console.error(`\n✗ ${fallas} comprobación(es) fallaron`); process.exit(1); }
console.log("\n✓ todo correcto — tarifa por fecha de ruta, sin IVA, una sola fuente para ambos motores");
