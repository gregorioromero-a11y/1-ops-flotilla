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
