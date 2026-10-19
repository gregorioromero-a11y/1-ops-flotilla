// Reglas de tarifa compartidas entre los módulos que calculan costo.
//
// Este archivo nació como "motor de costo extraído de Registro Diario para
// reutilizarlo en Kpis". Al eliminarse el módulo de KPIs, buildCostEngine se
// quedó sin un solo llamador y se retiró: era una SEGUNDA implementación del
// cálculo que ya hace crearMotorCostos en Registrar Envíos, y dejarla sin uso
// garantizaba que alguien arreglara una y no la otra.
//
// Lo que queda es lo que de verdad tiene que ser compartido: las reglas de las
// unidades dedicadas, que se consultan desde tres motores distintos.

// UNIDADES DEDICADAS — costo plano por RUTA/DÍA, no por paquete.
//
// La diferencia con una tarifa por paquete no es cosmética: esa se multiplica
// por lo entregado ($55 × 30 = $1,650), mientras que aquí se contrata el
// vehículo por el día y cobra lo mismo con 5 paquetes que con 40. Tratar $1,500
// como tarifa por paquete haría que una ruta de 30 saliera en $45,000.
//
// Fuente única a propósito: el costo se recalcula en tres motores (el de
// Registrar Envíos, el del Dashboard y el de Consultas). Las tarifas por paquete
// están copiadas en los tres y por eso pueden separarse; estas se importan de
// aquí para que no puedan.
export const TARIFAS_POR_RUTA = {
  "Foráneo Veracruz": 1500,
  "Foráneo Xalapa": 1500,
};
export const TIPOS_DEDICADOS = new Set(Object.keys(TARIFAS_POR_RUTA));

// Etiqueta con la que una unidad dedicada aparece como TIPO DE UNIDAD en la
// prefactura: "Foráneo Veracruz" → "Dedicada Veracruz".
//
// Lleva la plaza en el nombre a propósito. La prefactura arma una matriz
// fecha × tipo de unidad y cobra conteo × precio, así que si Veracruz y Xalapa
// compartieran la etiqueta "Dedicada" caerían en la misma columna y el día que
// sus tarifas dejen de ser iguales una de las dos se facturaría mal, en
// silencio y sin que nada lo delate.
export const etiquetaDedicada = (tipoRuta) =>
  "Dedicada " + String(tipoRuta || "").replace(/^For[áa]neo\s+/i, "").trim();

// Tipos donde un operador repetido el mismo día cobra una sola vez. Las
// dedicadas entran por definición: se paga el día del vehículo, no el viaje.
export const DEDUP_TIPOS = new Set(["PETCO", "Foráneo Puebla", ...TIPOS_DEDICADOS]);

// TARIFA POR PAQUETE ENTREGADO — { tipo de ruta: $ por paquete }.
//
// Lo contrario de las dedicadas de arriba: aquí NO se contrata el vehículo por
// el día, se paga por paquete operado, así que el costo escala con el volumen
// de la ruta.
//
// Estaba copiada en dos motores —el de Registrar Envíos y el de Consultas— y el
// comentario de este archivo ya avisaba del riesgo: "pueden separarse". Al
// agregar Operación TIL habría que acordarse de tocar las dos, y la que se
// olvidara exportaría otro costo en silencio. Ahora es una sola.
//
// El multiplicador es `entregados` (más `recolecciones` si el tipo es
// crossdock): el conteo de paquetes que el archivo de ruta reporta como
// ENTREGADOS, no los asignados. Una ruta que sale con 50 y entrega 38 cobra 38.
//
// TODAS LAS CIFRAS VAN SIN IVA, como todo costo en el sistema: la prefactura le
// suma el 16 % al final (`subtotalNeto * 0.16`). Guardar aquí un monto con IVA
// haría que se gravara dos veces y nadie lo notaría hasta conciliar.
//
// Un tipo puede tener UNA tarifa o una lista de VIGENCIAS. La lista existe
// porque las tarifas se renegocian a mitad de un periodo: si se sustituyera el
// número, al reconsultar un rango viejo se recalcularían esas rutas al precio
// nuevo y la prefactura ya emitida dejaría de cuadrar. Con vigencias, cada ruta
// se cobra al precio que regía EL DÍA QUE SALIÓ, para siempre.
export const TARIFAS_POR_PAQUETE = {
  "PETCO Monterrey": 50,
  "Foráneo Monterrey": 55,
  "Foráneo GDL": 55,
  // Renegociada a partir del 19 de octubre de 2026.
  "Operación TIL": [
    { desde: null, monto: 45 },           // hasta el 18 de octubre de 2026
    { desde: "2026-10-19", monto: 55 },
  ],
};

export const TIPOS_POR_PAQUETE = new Set(Object.keys(TARIFAS_POR_PAQUETE));

/**
 * Tarifa por paquete de un tipo de ruta en una fecha dada (ISO "YYYY-MM-DD").
 * Devuelve null si el tipo no cobra por paquete.
 *
 * Sin fecha se aplica la vigencia MÁS ANTIGUA, no la actual. Es la opción
 * conservadora: una ruta sin fecha es casi siempre un registro viejo, y de los
 * dos errores posibles —cobrar de menos un registro nuevo o cobrar de más uno
 * histórico ya facturado— el segundo es el que rompe una conciliación.
 */
export function tarifaPorPaquete(tipoRuta, fecha) {
  const t = TARIFAS_POR_PAQUETE[tipoRuta];
  if (t == null) return null;
  if (typeof t === "number") return t;
  const dia = String(fecha || "").substring(0, 10);
  let aplicable = null;
  for (const v of t) {
    if (v.desde == null) { if (!aplicable) aplicable = v; continue; }
    if (dia && dia >= v.desde) aplicable = v;
  }
  return aplicable ? aplicable.monto : null;
}

/** Las vigencias de un tipo, para poder explicarlas en la interfaz. */
export const vigenciasDe = (tipoRuta) => {
  const t = TARIFAS_POR_PAQUETE[tipoRuta];
  if (t == null) return [];
  return typeof t === "number" ? [{ desde: null, monto: t }] : t;
};
