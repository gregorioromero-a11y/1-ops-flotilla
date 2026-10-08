// ============================================================
// MAPA EXPORTABLE — genera el HTML autocontenido del plan de ruteo.
//
// Vive aquí y no dentro de ModuleRuteo por dos razones:
//
//  1. Se puede PROBAR sin montar React. El export se rompía en silencio: un
//     número de guía con una comilla dejaba el `bindPopup("…")` sin cerrar, el
//     script tronaba completo y el archivo abría en blanco — sin mapa, sin
//     error, sin pista. Ahora scripts/mapaHtmlTest.mjs lo somete a datos
//     hostiles en cada corrida.
//  2. El HTML se manda por correo a los proveedores, así que tiene que poder
//     leerse solo y fallar diciendo POR QUÉ falla.
// ============================================================

// Escapa un valor para incrustarlo como literal de string de JavaScript.
//
// JSON.stringify ya resuelve comillas, barras invertidas y saltos de línea.
// Falta `<`: sin escaparlo, un dato que contenga "</script>" cierra el bloque
// antes de tiempo y el resto del código se renderiza como texto en la página.
// Por eso NO basta con reemplazar comillas, que es lo que se hacía antes.
export const jsStr = (s) => JSON.stringify(String(s ?? "")).replace(/</g, "\\u003c");

// Escapa para incrustar como TEXTO dentro del HTML (leyenda, tabla).
export const htmlEsc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const hhmm = (h) => {
  if (h == null || !isFinite(h)) return "";
  const total = Math.round(h * 60);
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

/**
 * Devuelve el HTML completo del mapa del plan.
 *
 * puntos, asignaciones, posPorFila y etaPorFila están indexados POR RENGLÓN del
 * archivo; rutasResumen va por ruta. rho decide si se dibuja el tramo de
 * regreso al depósito.
 */
export function mapaRuteoHTML({
  puntos, asignaciones, depot, colores,
  rutasResumen = [], posPorFila = null, etaPorFila = null,
  guiaKey = "", rho = 1, titulo = "Mapa Ruteo — T1 Envíos",
  leafletCss = null, leafletJs = null, zonas = null,
}) {
  const col = (cl) => colores[((cl % colores.length) + colores.length) % colores.length];

  const conteo = {};
  for (const c of asignaciones) conteo[c] = (conteo[c] || 0) + 1;

  // ---- Marcadores: uno por guía ----
  const marcadores = puntos.map((p, i) => {
    const cl = asignaciones[i] ?? 0;
    const label = guiaKey && p[guiaKey] ? String(p[guiaKey]) : "";
    const parada = posPorFila && posPorFila[i] != null ? `<br/>Parada ${posPorFila[i]}` : "";
    const eta = etaPorFila && etaPorFila[i] != null && isFinite(etaPorFila[i])
      ? ` · llega ${hhmm(etaPorFila[i])}` : "";
    const popup = `<b>${cl === -1 ? "Excluido" : "Ruta " + (cl + 1)}</b>`
      + (label ? "<br/>" + htmlEsc(label) : "")
      + parada + eta
      + `<br/>${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
    return `L.circleMarker([${p.lat},${p.lng}],{radius:7,fillColor:${jsStr(col(cl))},color:"white",weight:2,fillOpacity:0.9}).addTo(map).bindPopup(${jsStr(popup)});`;
  }).join("\n");

  // ---- Polilínea por ruta, en orden de visita y arrancando en el depósito ----
  // Los marcadores sueltos dicen qué paquetes lleva cada unidad pero no en qué
  // orden; con el trazo se ve de un golpe si una ruta cruza media ciudad para
  // volver sobre sus pasos, que es el error que hay que detectar a ojo.
  const trazos = rutasResumen.map(r => {
    const cl = r.cluster;
    if (!posPorFila) return "";
    // Una coordenada por PARADA, no por guía: varias guías del mismo domicilio
    // comparten posición y duplicarían el vértice.
    const porPos = new Map();
    puntos.forEach((p, i) => {
      if ((asignaciones[i] ?? 0) !== cl) return;
      const pos = posPorFila[i];
      if (pos != null && !porPos.has(pos)) porPos.set(pos, p);
    });
    if (!porPos.size) return "";
    const orden = [...porPos.entries()].sort((a, b) => a[0] - b[0]).map(([, p]) => p);
    const coords = [[depot.lat, depot.lng], ...orden.map(p => [p.lat, p.lng])];
    // El tramo de regreso sólo si ρ = 1: con ρ = 0 la jornada termina en la
    // última entrega y pintarlo sería mentir sobre el plan.
    if (rho === 1) coords.push([depot.lat, depot.lng]);
    const popup = [
      `<b>Ruta ${r.ruta}</b>`,
      `${r.paradas} paradas · ${r.guias} guías`,
      `${r.kmTotal.toFixed(1)} km (${r.kmZona.toFixed(1)} en zona + ${r.kmTraslado.toFixed(1)} de traslado)`,
      `${r.horas.toFixed(1)} h de jornada · última entrega ${hhmm(r.ultimaEntrega)}`,
      r.cumple ? "" : `<b style="color:#DC2626">fuera de jornada o de tope de km</b>`,
    ].filter(Boolean).join("<br/>");
    return `L.polyline(${JSON.stringify(coords)},{color:${jsStr(col(cl))},weight:3,opacity:0.75}).addTo(map).bindPopup(${jsStr(popup)});`;
  }).filter(Boolean).join("\n");

  // ---- Leyenda y tabla ----
  const porCl = new Map(rutasResumen.map(r => [r.cluster, r]));
  const leyenda = Object.keys(conteo).map(Number).sort((a, b) => a - b).map(cl => {
    const r = porCl.get(cl);
    const detalle = r
      ? `${r.paradas} par · ${r.kmTotal.toFixed(0)} km · ${r.horas.toFixed(1)} h${r.cumple ? "" : " ⚠"}`
      : `${conteo[cl]} pts`;
    const nombre = cl === -1 ? "Excluidos" : `Ruta ${cl + 1}`;
    return `<div class="fila"><div class="punto" style="background:${htmlEsc(col(cl))}"></div><span>${nombre} — <span class="gris">${htmlEsc(detalle)}</span></span></div>`;
  }).join("");

  const tabla = rutasResumen.length ? `
<div class="resumen"><h4>Resumen por ruta</h4>
<table><thead><tr><th>Ruta</th><th>Par.</th><th>Guías</th><th>Km zona</th><th>Km tras.</th><th>Km tot.</th><th>Horas</th><th>Últ. entrega</th></tr></thead><tbody>
${rutasResumen.map(r => `<tr${r.cumple ? "" : ' class="malo"'}><td>${r.ruta}</td><td>${r.paradas}</td><td>${r.guias}</td><td>${r.kmZona.toFixed(1)}</td><td>${r.kmTraslado.toFixed(1)}</td><td>${r.kmTotal.toFixed(1)}</td><td>${r.horas.toFixed(2)}</td><td>${hhmm(r.ultimaEntrega)}</td></tr>`).join("")}
</tbody></table></div>` : "";

  const totalParadas = rutasResumen.reduce((s, r) => s + r.paradas, 0) || puntos.length;
  const bounds = puntos.map(p => `[${p.lat},${p.lng}]`).join(",");
  const cierre = "<\/script>";

  // Leaflet EMPOTRADO cuando se recibe. Es lo que hace que el archivo abra sin
  // internet: se manda por correo y se abre con doble clic desde Descargas,
  // donde un firewall o una VPN corporativa bloqueando el CDN dejaba la página
  // en blanco. Un `</script>` dentro del código empotrado cerraría el bloque
  // antes de tiempo, así que se neutraliza.
  const sinCierre = (s) => String(s).replace(/<\/script/gi, "<\\/script");
  const estiloLeaflet = leafletCss
    ? `<style>${sinCierre(leafletCss)}</style>`
    : `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>`;
  const codigoLeaflet = leafletJs
    ? `<script>${sinCierre(leafletJs)}${cierre}`
    : `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">${cierre}`;

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${htmlEsc(titulo)}</title>
${estiloLeaflet}
<style>
/* El #map lleva color de fondo propio. Sin él, si las teselas no cargan la
   página queda blanca y parece que el archivo salió roto, cuando lo que falla
   es la red. Con fondo, se ve un mapa vacío y el aviso explica por qué. */
html,body{margin:0;height:100%;font-family:Arial,Helvetica,sans-serif}
#map{height:100%;width:100%;background:#E8EAED}
.legend{position:absolute;bottom:20px;left:20px;background:#fff;padding:14px 18px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.15);z-index:1000;font-size:13px;max-height:60vh;overflow-y:auto}
.legend h4{margin:0 0 8px;font-size:14px}
.legend .fila{display:flex;align-items:center;gap:6px;margin:3px 0;white-space:nowrap}
.legend .punto{width:12px;height:12px;border-radius:50%;flex:none}
.gris{color:#666}
.resumen{position:absolute;bottom:20px;right:20px;background:#fff;padding:12px 14px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.15);z-index:1000;font-size:11px;max-height:70vh;overflow:auto}
.resumen h4{margin:0 0 8px;font-size:13px}
.resumen table{border-collapse:collapse}
.resumen th,.resumen td{padding:2px 7px;text-align:right;border-bottom:1px solid #eee;white-space:nowrap}
.resumen th{color:#666;font-weight:700;text-transform:uppercase;font-size:9px}
.resumen td:first-child,.resumen th:first-child{text-align:left;font-weight:700}
.resumen tr.malo td{background:#FEF2F2;color:#B91C1C}
#aviso{display:none;position:absolute;top:0;left:0;right:0;z-index:2000;background:#FEF2F2;color:#B91C1C;border-bottom:1px solid #FECACA;padding:12px 18px;font-size:13px;line-height:1.5}
.leaflet-tooltip{font-size:11px;font-weight:700;padding:3px 7px}
</style>
</head><body>
<div id="aviso"></div>
<div id="map"></div>
<div class="legend"><h4>T1 Envíos — Ruteo</h4>
<div style="font-size:11px;color:#666;margin-bottom:8px">${puntos.length} guías · ${totalParadas} paradas · ${Object.keys(conteo).length} rutas</div>
${leyenda}</div>${tabla}
${codigoLeaflet}
<script>
// Red de seguridad para el caso en que Leaflet NO venga empotrado y el CDN esté
// bloqueado. Con la copia empotrada esto no se dispara nunca, pero el generador
// admite las dos formas y una página en blanco sin explicación es el peor final
// posible para un archivo que alguien recibió por correo.
(function(){
  if (typeof L !== "undefined") return;
  var a = document.getElementById("aviso");
  a.style.display = "block";
  a.innerHTML = "<b>No se pudo cargar la librería del mapa</b> (unpkg.com está bloqueado o no hay conexión). " +
                "Los datos del plan sí están en este archivo: la leyenda y la tabla de rutas se ven abajo. " +
                "Para ver el mapa, ábrelo con conexión a internet o sin VPN.";
})();
${cierre}
<script>
if (typeof L !== "undefined") {
var map=L.map("map",{attributionControl:false}).setView([${depot.lat},${depot.lng}],11);
L.control.attribution({prefix:false}).addAttribution("Fronteras: INEGI").addTo(map);

function avisar(msg){
  var a = document.getElementById("aviso");
  if (a && a.style.display !== "block") { a.style.display = "block"; a.innerHTML = msg; }
}

// ---- Fondo de mapa ----
//
// NO se usa tile.openstreetmap.org. Sus servidores rechazan las peticiones sin
// Referer que hace un archivo abierto con doble clic, y lo hacen de la peor
// manera: responden 403 CON UNA IMAGEN que dice "Access blocked", así que el
// navegador la da por cargada y el fallo ni siquiera se puede detectar por
// código. Se verificó pidiendo tres teselas distintas: las tres devuelven
// exactamente 6 987 bytes, la firma de un placeholder. CARTO sin API key hace
// lo mismo con 2 049 bytes, y maps.wikimedia.org responde 403 directo.
//
// Esri sí sirve teselas reales en este contexto —tamaños distintos por tesela,
// que es la prueba— y no pide llave. OSM France queda de alternativa porque es
// cartografía OSM legítima servida por un tercero que sí la permite.
var ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/";
// Ojo con el orden de los ejes: ArcGIS numera {z}/{y}/{x}, no {z}/{x}/{y}.
var calles = L.tileLayer(ESRI + "World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  {attribution:"Teselas © Esri", maxZoom:19});
var satelite = L.tileLayer(ESRI + "World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {attribution:"Teselas © Esri · Maxar, Earthstar Geographics", maxZoom:19});
var osmfr = L.tileLayer("https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
  {attribution:"© OpenStreetMap France", maxZoom:19});

// ---- Fronteras de alcaldías y municipios, EMPOTRADAS ----
//
// Van como capa encima del mapa y, además, son la red de seguridad: si la red
// bloquea las teselas el archivo sigue siendo legible, porque esta geometría no
// se descarga de ningún lado. Para quien opera dicen más que una calle —"esta
// ruta cubre Iztapalapa y Tláhuac" es la frase con la que se discute un plan—.
var ZONAS = ${zonas ? JSON.stringify(zonas) : "[]"};
var capaZonas = L.layerGroup();
for (var z = 0; z < ZONAS.length; z++) {
  var zona = ZONAS[z];
  var poly = L.polygon(zona.p, {
    color:"#1E293B", weight:1, opacity:.5, fill:true,
    fillColor:"#FFFFFF", fillOpacity:0, interactive:true
  });
  poly.bindTooltip(zona.n + (zona.e ? " · " + zona.e : ""), {sticky:true, direction:"top"});
  capaZonas.addLayer(poly);
}

// "Sin conexión" es un fondo vacío a propósito: deja sólo las fronteras, que no
// dependen de la red. Es la opción a la que cae quien abre esto detrás de un
// firewall que bloquea todo.
var sinFondo = L.layerGroup();

calles.addTo(map);
capaZonas.addTo(map);

// Si las teselas fallan de verdad (error de red, no un 403 disfrazado), se
// rellenan las zonas para que el mapa siga teniendo forma y se avisa.
var fallos = 0;
calles.on("tileerror", function(){
  if (++fallos !== 10) return;
  capaZonas.eachLayer(function(l){ l.setStyle({fillOpacity:.6}); });
  avisar("<b>No se pudo cargar el fondo de calles</b> (la red o la VPN lo bloquean). " +
         "Las rutas, los puntos y la tabla SÍ son correctos. Puedes cambiar de fondo con el " +
         "control de capas de la esquina superior derecha, o usar «Sin conexión», que no " +
         "necesita internet.");
});

// Depósito con divIcon de puro HTML, NO con L.marker: el icono por omisión
// pide images/marker-icon.png por ruta relativa, que en un archivo suelto no
// existe y sale como imagen rota. Así se dibuja con CSS y no hace falta
// empotrar ningún PNG.
L.marker([${depot.lat},${depot.lng}],{icon:L.divIcon({
  html:'<div style="background:#0C1425;color:#fff;font-size:13px;width:24px;height:24px;border-radius:5px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center">★</div>',
  className:"",iconSize:[24,24],iconAnchor:[12,12]
})}).addTo(map).bindPopup("<b>Almacén T1</b>");
${trazos}
${marcadores}
${bounds ? `map.fitBounds([${bounds}],{padding:[40,40]});` : ""}

// El control va DESPLEGADO: plegado es un iconito que nadie encuentra, y aquí
// es justo lo que hay que encontrar si la red bloquea el fondo.
L.control.layers(
  {"Calles": calles, "Satélite": satelite, "OSM France": osmfr, "Sin conexión": sinFondo},
  {"Alcaldías y municipios": capaZonas},
  {collapsed:false, position:"topright"}
).addTo(map);
}
${cierre}
</body></html>`;
}
