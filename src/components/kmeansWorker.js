// Web Worker para el clustering kMeans + TSP. Saca el cómputo pesado
// del main thread para que la UI no se congele con 15K+ puntos.
//
// Recibe: { pts: [{lat, lng}], k: number }
// Devuelve: { assigns: number[], seqOrder: number[] }

self.onmessage = (e) => {
  const { pts, k } = e.data;
  try {
    const result = computeRoute(pts, k, (phase, value) => {
      self.postMessage({ progress: { phase, value } });
    });
    self.postMessage({ result });
  } catch (err) {
    self.postMessage({ error: err.message || String(err) });
  }
};

function computeRoute(pts, k, onProgress) {
  if (!pts.length || k < 1) return { assigns: [], seqOrder: [] };
  const n = pts.length;
  const targetCap = n / k;

  // --- KMeans++ centroid seeding ---
  const centers = [{ lat: pts[Math.floor(Math.random() * n)].lat, lng: pts[Math.floor(Math.random() * n)].lng }];
  while (centers.length < k) {
    const dists = pts.map(p => Math.min(...centers.map(c => (p.lat - c.lat) ** 2 + (p.lng - c.lng) ** 2)));
    const total = dists.reduce((s, d) => s + d, 0);
    let r = Math.random() * total, chosen = pts[n - 1];
    for (let j = 0; j < n; j++) { r -= dists[j]; if (r <= 0) { chosen = pts[j]; break; } }
    centers.push({ lat: chosen.lat, lng: chosen.lng });
  }
  onProgress?.("clustering", 0);

  // --- Power Diagram + capacity-constrained Lloyd iterations ---
  let weights = new Array(k).fill(0);
  let assigns = new Array(n).fill(0);
  const powerDist = (p, c, w) => (p.lat - c.lat) ** 2 + (p.lng - c.lng) ** 2 - w;
  const lr = 5e-7;
  const MAX_IT = 150;

  for (let it = 0; it < MAX_IT; it++) {
    const na = pts.map(p => {
      let md = Infinity, nr = 0;
      for (let ci = 0; ci < k; ci++) {
        const d = powerDist(p, centers[ci], weights[ci]);
        if (d < md) { md = d; nr = ci; }
      }
      return nr;
    });
    for (let ci = 0; ci < k; ci++) {
      const cp = pts.filter((_, i) => na[i] === ci);
      if (cp.length) centers[ci] = {
        lat: cp.reduce((s, p) => s + p.lat, 0) / cp.length,
        lng: cp.reduce((s, p) => s + p.lng, 0) / cp.length,
      };
    }
    const sizes = new Array(k).fill(0);
    na.forEach(a => sizes[a]++);
    weights = weights.map((w, ci) => w + lr * (targetCap - sizes[ci]));

    if (it % 10 === 0) onProgress?.("clustering", Math.round((it / MAX_IT) * 100));
    if (na.every((a, i) => a === assigns[i])) { assigns = na; break; }
    assigns = na;
  }

  // --- Compact cluster IDs ---
  const used = [...new Set(assigns)].sort((a, b) => a - b);
  if (used.length < k) {
    const remap = {};
    used.forEach((c, i) => { remap[c] = i; });
    assigns = assigns.map(a => remap[a]);
  }

  // --- TSP per cluster con GLS+2-opt time-dependent ---
  const numClustersFinal = Math.max(...assigns) + 1;
  const tau = 0.02;
  const haver = (a, b) => {
    const R = 6371, toR = d => d * Math.PI / 180;
    const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  };
  const tdCost = (a, b, pos) => haver(a, b) * (1 + pos * tau);
  const seqOrder = new Array(n).fill(0);

  for (let ci = 0; ci < numClustersFinal; ci++) {
    const idxs = [];
    pts.forEach((_, i) => { if (assigns[i] === ci) idxs.push(i); });
    if (idxs.length <= 2) { idxs.forEach((gi, lp) => { seqOrder[gi] = lp; }); continue; }

    let startIdx = idxs[0], minD = Infinity;
    idxs.forEach(gi => {
      const d = (pts[gi].lat - centers[ci].lat) ** 2 + (pts[gi].lng - centers[ci].lng) ** 2;
      if (d < minD) { minD = d; startIdx = gi; }
    });
    const remaining = new Set(idxs);
    remaining.delete(startIdx);
    const tour = [startIdx];
    while (remaining.size) {
      const last = pts[tour[tour.length - 1]];
      let best = null, bestD = Infinity;
      remaining.forEach(gi => {
        const d = haver(last, pts[gi]);
        if (d < bestD) { bestD = d; best = gi; }
      });
      tour.push(best);
      remaining.delete(best);
    }

    const m = tour.length;
    const penalties = {};
    const lambda = 0.1;
    const tourCost = (t, pen) => {
      let s = 0;
      for (let i = 0; i < t.length - 1; i++) {
        const key = Math.min(t[i], t[i + 1]) + "-" + Math.max(t[i], t[i + 1]);
        s += tdCost(pts[t[i]], pts[t[i + 1]], i) + lambda * (pen[key] || 0);
      }
      return s;
    };

    const twoOpt = t => {
      let improved = true, best = [...t];
      while (improved) {
        improved = false;
        for (let i = 1; i < best.length - 2; i++) {
          for (let j = i + 1; j < best.length - 1; j++) {
            const cand = [...best.slice(0, i), ...best.slice(i, j + 1).reverse(), ...best.slice(j + 1)];
            if (tourCost(cand, penalties) < tourCost(best, penalties) - 1e-9) {
              best = cand; improved = true;
            }
          }
        }
      }
      return best;
    };

    let current = twoOpt(tour);
    let bestEver = [...current];
    let bestEverCost = tourCost(current, {});
    const glsIters = Math.min(10, Math.max(3, Math.floor(40 / m)));
    for (let g = 0; g < glsIters; g++) {
      let maxUtil = -1, worstKey = null;
      for (let i = 0; i < current.length - 1; i++) {
        const key = Math.min(current[i], current[i + 1]) + "-" + Math.max(current[i], current[i + 1]);
        const c = haver(pts[current[i]], pts[current[i + 1]]);
        const util = c / (1 + (penalties[key] || 0));
        if (util > maxUtil) { maxUtil = util; worstKey = key; }
      }
      if (worstKey) penalties[worstKey] = (penalties[worstKey] || 0) + 1;
      current = twoOpt(current);
      const realCost = tourCost(current, {});
      if (realCost < bestEverCost) { bestEverCost = realCost; bestEver = [...current]; }
    }
    bestEver.forEach((gi, lp) => { seqOrder[gi] = lp; });

    if (ci % 3 === 0) onProgress?.("tsp", Math.round((ci / numClustersFinal) * 100));
  }

  return { assigns, seqOrder };
}
