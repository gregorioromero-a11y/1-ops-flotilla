// Vista previa estática de las gráficas por proveedor.
//
//   node scripts/previewGraficas.mjs && open scripts/preview-graficas.html
//
// El método de visualización exige mirar el resultado renderizado: el validador
// de paleta revisa color, no geometría, y las colisiones de etiqueta, los
// desbordes y las barras de ancho cero sólo se ven con los ojos.
//
// Montar el módulo de React requeriría Supabase, así que se reproduce el MISMO
// marcado del componente con datos reales de operación. Si la estructura del
// componente cambia, esta vista previa deja de representarlo: sirve para revisar
// la geometría al construirla, no como prueba de regresión.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));

// Cifras tomadas de una corrida real (26 sep – 10 oct 2026, 539 rutas).
const COSTO = [
  ["Verde Diseño Logistic", 212475, 97625],
  ["FAST INTEGRAL", 115321, 0],
  ["DATATRAFFIC INTERNACIONAL", 96010, 0],
  ["Logística en Movimiento", 90117, 0],
  ["ADET", 66700, 2300],
  ["Partrunner", 44033, 0],
  ["PIBOX", 38400, 0],
  ["KEKO", 30000, 0],
  ["PAQUETE LIT", 3975, 22800],
  ["CHAZKI - CARSO", 19284, 0],
  ["TRASPORTE BORRAYO", 2600, 2600],
  ["EXACTO LOGISTICA", 1250, 0],
];
// Casos límite a propósito: un proveedor al 100 %, otro muy bajo, y nombres largos.
const ENTREGA = [
  ["EXACTO LOGISTICA", 100.0], ["KEKO", 97.4], ["ADET", 96.1],
  ["Verde Diseño Logistic", 94.8], ["FAST INTEGRAL", 93.2],
  ["DATATRAFFIC INTERNACIONAL", 91.7], ["Logística en Movimiento", 90.3],
  ["PIBOX", 88.9], ["Partrunner", 86.4], ["CHAZKI - CARSO", 71.2],
  ["TRASPORTE BORRAYO", 58.6], ["PAQUETE LIT", 41.3],
];
const PROM = 91.4;

const TEMAS = {
  claro: { panel: "#FFFFFF", panelAlt: "#FAFBFF", bg: "#F8F9FC", border: "#E4E8F0",
           text: "#0C1425", textMuted: "#6B7591", entrega: "#16A34A", costo: "#2563EB", ref: "#7C8495" },
  oscuro: { panel: "#111A2B", panelAlt: "#16223A", bg: "#0A0F1A", border: "#22304A",
            text: "#E8EDF7", textMuted: "#8295B2", entrega: "#0F9E8E", costo: "#4C8DFF", ref: "#8295B2" },
};

const money = v => "$" + Math.round(v).toLocaleString("es-MX");
const ANCHO_ETQ = 168;

const barras = (T, filas, series, fmt, ref) => {
  const max = Math.max(...filas.map(f => f.total), ref || 0) || 1;
  const multi = series.length > 1;
  const leyenda = multi ? `<div class="leyenda">${series.map(s =>
    `<span><i style="background:${s.color}"></i>${s.label}</span>`).join("")}</div>` : "";
  const cuerpo = filas.map(f => {
    const segs = series.map((s, si) => {
      const v = f.valores[s.key] || 0;
      if (v <= 0) return "";
      const ultimo = series.slice(si + 1).every(o => !(f.valores[o.key] > 0));
      return `<div style="width:${(v / max) * 100}%;background:${s.color};border-radius:${ultimo ? "0 4px 4px 0" : "0"};margin-right:${ultimo ? 0 : 2}px;min-width:2px"></div>`;
    }).join("");
    const lineaRef = ref ? `<div class="ref" style="left:${(ref / max) * 100}%"></div>` : "";
    return `<div class="fila">
      <div class="etq" title="${f.nombre}">${f.nombre}</div>
      <div class="pista">${lineaRef}<div class="segs">${segs}</div></div>
      <div class="val">${fmt(f.total)}</div>
    </div>`;
  }).join("");
  const pie = ref ? `<div class="pieref"><span class="dash"></span>Promedio del periodo: ${ref.toFixed(1)}%</div>` : "";
  return leyenda + `<div class="cuerpo">${cuerpo}</div>` + pie;
};

const panel = (T, titulo, sub, contenido) => `
<div class="panel">
  <div class="cab"><div class="t">${titulo}</div><div class="s">${sub}</div></div>
  ${contenido}
</div>`;

const vista = (nombre, T) => {
  const costo = COSTO.map(([n, um, mm]) => ({ nombre: n, valores: { um, mm }, total: um + mm }))
    .filter(d => d.total > 0).sort((a, b) => b.total - a.total);
  const entrega = ENTREGA.map(([n, p]) => ({ nombre: n, valores: { pct: p }, total: p }))
    .sort((a, b) => b.total - a.total);
  return `
<section class="tema" style="
  --panel:${T.panel}; --panelAlt:${T.panelAlt}; --bg:${T.bg}; --border:${T.border};
  --text:${T.text}; --muted:${T.textMuted}; --ref:${T.ref};">
  <h2>${nombre}</h2>
  <div class="grid">
    ${panel(T, "Costo por proveedor", "Última milla y media milla, ordenado por costo total",
      barras(T, costo, [{ key: "um", label: "Última milla", color: T.entrega },
                        { key: "mm", label: "Media milla", color: T.costo }], money, null))}
    ${panel(T, "Porcentaje de entrega por proveedor", "Entregas finales ÷ asignados. Excluye media milla",
      barras(T, entrega, [{ key: "pct", label: "% de entrega", color: T.entrega }],
             v => v.toFixed(1) + "%", PROM))}
  </div>
</section>`;
};

const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/>
<title>Vista previa — gráficas por proveedor</title>
<style>
body{margin:0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#2a2f3a}
h2{color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:0 0 12px;opacity:.75}
.tema{padding:26px 30px;background:var(--bg)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:16px}
.panel{background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.cab{padding:14px 18px 12px}
.cab .t{font-size:13px;font-weight:700;color:var(--text)}
.cab .s{font-size:11px;color:var(--muted);margin-top:2px}
.leyenda{display:flex;gap:16px;padding:0 18px 12px;flex-wrap:wrap}
.leyenda span{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--muted)}
.leyenda i{width:10px;height:10px;border-radius:2px;flex:none}
.cuerpo{padding:0 18px 14px}
.fila{position:relative;display:flex;align-items:center;gap:10px;min-height:30px;border-radius:6px}
.fila:hover{background:var(--panelAlt)}
.etq{width:${ANCHO_ETQ}px;flex:none;font-size:11.5px;font-weight:600;color:var(--text);text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pista{flex:1;position:relative;height:22px}
.segs{display:flex;height:100%;align-items:stretch}
.ref{position:absolute;top:-3px;bottom:-3px;width:1px;background:var(--ref);opacity:.9;z-index:2}
.val{width:74px;flex:none;font-size:11.5px;font-weight:700;color:var(--text);font-variant-numeric:tabular-nums;text-align:right;padding-right:4px}
.pieref{padding:0 18px 12px;margin-left:${ANCHO_ETQ + 10}px;font-size:10.5px;color:var(--muted);display:flex;align-items:center;gap:6px}
.pieref .dash{width:11px;height:1px;background:var(--ref)}
</style></head><body>
${vista("Tema claro — superficie #FFFFFF", TEMAS.claro)}
${vista("Tema oscuro — superficie #111A2B", TEMAS.oscuro)}
</body></html>`;

const destino = join(AQUI, "preview-graficas.html");
writeFileSync(destino, html);
console.log("✓ " + destino);
console.log("  12 proveedores · nombres largos · un 100 % y un 41 % · dos temas");
