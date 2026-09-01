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
