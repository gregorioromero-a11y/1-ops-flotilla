// Motor de costo real (rutas × asistencia × tarifas de carriers), extraído del
// módulo de Registro Diario para reutilizarlo en Kpis. Función pura: no depende
// de estado de React. buildCostEngine(asistencia, carriers) devuelve helpers con
// índices precalculados (O(1) por ruta).
//
// Una "ruta" para el motor espera: { tipoRuta, salida, operador, entregados,
// recolecciones, carrier, penalizacion }.

const norm = (s) =>
  String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

const TARIFAS_FIJAS = { "PETCO Monterrey": 50, "Foráneo Monterrey": 55, "Foráneo GDL": 55 };
const TIPOS_PERMISIBLES = new Set([
  "Foráneo Puebla", "Foráneo Monterrey", "Foráneo GDL", "PETCO", "PETCO Monterrey", "HalfMile",
]);
// Tipos donde un operador repetido el mismo día cobra una sola vez.
export const DEDUP_TIPOS = new Set(["PETCO", "Foráneo Puebla"]);

export const isCrossdock = (r) => {
  const t = (r.tipoRuta || "").toLowerCase();
  return t.includes("half") || t.includes("cross");
};
const esPermisible = (r) => TIPOS_PERMISIBLES.has(r.tipoRuta);

// Evaluador de fórmula de penalización (soporta + - * / () y la variable `costo`)
export const evalFormula = (expr, costo) => {
  if (!expr || !String(expr).trim()) return 0;
  const s = String(expr).replace(/costo/gi, "(" + (parseFloat(costo) || 0) + ")");
  if (!/^[\d+\-*/().\s]*$/.test(s)) return NaN;
  try {
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + s + ")")();
    return typeof result === "number" && isFinite(result) ? result : NaN;
  } catch {
    return NaN;
  }
};

export function buildCostEngine(asistencia, carriers) {
  const asis = [...(asistencia || [])].sort(
    (a, b) => (b.fecha || "").localeCompare(a.fecha || "") || (b.id || 0) - (a.id || 0)
  );
  const byDayOp = new Map(); // `${fecha}|${op}` -> asistencia (mismo día)
  const byOp = new Map(); // `${op}` -> asistencia más reciente
  for (const a of asis) {
    if (!a.nombre_operador || a.nombre_operador === "Registro manual") continue;
    const op = norm(a.nombre_operador);
    const f = (a.fecha || "").substring(0, 10);
    const k = f + "|" + op;
    if (!byDayOp.has(k)) byDayOp.set(k, a);
    if (!byOp.has(op)) byOp.set(op, a);
  }
  const cars = carriers || [];
  const carrierCost = (prov, tu) => {
    const c = cars.find((c) => c.proveedor === prov && c.tipo_unidad === tu);
    return parseFloat(c?.costo_unidad) || 0;
  };

  // Fallback: estima con la tarifa de última milla del carrier de la ruta.
  const carrierFallback = (r) => {
    if (!r.carrier || r.carrier === "—") return 0;
    const cn = norm(r.carrier);
    const cand = cars.filter(
      (c) =>
        norm(c.proveedor) === cn &&
        c.tipo_unidad && c.tipo_unidad !== "---" && c.tipo_unidad !== "—" &&
        (c.operacion || "").toLowerCase().includes("ltima")
    );
    if (!cand.length) return 0;
    const sedan = cand.find((c) => c.tipo_unidad === "Sedan");
    const chosen = sedan || cand.slice().sort((a, b) => (parseFloat(a.costo_unidad) || 0) - (parseFloat(b.costo_unidad) || 0))[0];
    return parseFloat(chosen.costo_unidad) || 0;
  };

  const baseCost = (r) => {
    const rateFija = TARIFAS_FIJAS[r.tipoRuta];
    if (rateFija != null) {
      const paq = (parseInt(r.entregados) || 0) + (isCrossdock(r) ? (parseInt(r.recolecciones) || 0) : 0);
      return rateFija * paq;
    }
    const f = (r.salida || "").substring(0, 10);
    const op = r.operador ? norm(r.operador) : null;
    if (f && op) {
      const sd = byDayOp.get(f + "|" + op);
      if (sd) return carrierCost(sd.proveedor, sd.tipo_unidad);
      if (esPermisible(r)) {
        const fb = byOp.get(op);
        if (fb) return carrierCost(fb.proveedor, fb.tipo_unidad);
      }
    }
    // Sin asistencia (p. ej. marzo): estima con la tarifa del carrier.
    return carrierFallback(r);
  };

  const costoNuevo = (r) => {
    const base = baseCost(r);
    const expr = (r.penalizacion || "").trim();
    if (!expr) return base;
    const ev = evalFormula(expr, base);
    if (isNaN(ev)) return base;
    // Guarda anti-typo: una penalización que dispara el costo a más de 10× la
    // base (p. ej. "1900*82" en vez de "1900*.82" → $155,800) es claramente un
    // error de captura; se ignora y se usa la base.
    if (base > 0 && ev > base * 10) return base;
    return ev;
  };

  return { baseCost, costoNuevo };
}
