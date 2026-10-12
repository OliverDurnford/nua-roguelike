// ============================================================
// SEETHROUGH: railings you can see through.
//
// A thing's outline redraws its patch of the painting over anyone standing
// behind it. For a railing that patch includes the floor painted between
// the bars, so the gaps hid you too. A thing marked `see: true` is drawn
// through a cut-out instead: the painting's own pixels decide, once, which
// part of the outline is the railing and which is floor showing through.
//
// How: what shows between the bars is whatever lies just behind the railing,
// and that is what the band of painting above its outline shows too. So a
// colour belongs to the railing when it is much commoner inside the outline
// than in that band (1.6 times or more, counting near colours together),
// and is cleared otherwise. The bars' dark cores and lighter edges are both
// kept, and pale paving or a bench behind is cleared, whichever is darker.
// At the top edge of the map, with nothing above, the bigger of two colour
// groups inside the outline is taken as the floor.
// A solid base under a railing (the brick wall the Beehive's fence stands
// on) is traced as its own, ordinary thing: a bench behind the railing can
// be the very same brown as the brick, and colour alone cannot tell them.
// ============================================================

const SEETHROUGH = {};

// Which pixels of a w x h patch have their centre inside the outline
// (pts in patch pixels, even-odd). Uint8Array, 1 inside.
SEETHROUGH.polyMask = (pts, w, h) => {
  const m = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const cy = y + 0.5, xs = [];
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], b = pts[j];
      if ((a.y > cy) !== (b.y > cy)) xs.push(a.x + ((cy - a.y) * (b.x - a.x)) / (b.y - a.y));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k] - 0.5)), x1 = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
      for (let x = x0; x <= x1; x++) m[y * w + x] = 1;
    }
  }
  return m;
};

// k colour groups by k-means, seeded from mutually distant colours:
// [{ c: [r, g, b], share }]. A stray pixel can take a seed; its group
// stays tiny, and callers ignore small groups.
SEETHROUGH.groups = (cols, k) => {
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  const mean = [0, 0, 0];
  for (const c of cols) { mean[0] += c[0]; mean[1] += c[1]; mean[2] += c[2]; }
  for (let j = 0; j < 3; j++) mean[j] /= cols.length;
  let cs = [], ref = [mean];
  while (cs.length < k) {
    let best = null, far = -1;
    for (const c of cols) {
      const d = Math.min(...ref.map((r) => d2(c, r)));
      if (d > far) { far = d; best = c; }
    }
    if (far <= 0) break;
    cs.push(best.slice()); ref = cs;
  }
  if (!cs.length) return [{ c: mean, share: 1 }];
  let count = [];
  for (let it = 0; it < 10; it++) {
    const s = cs.map(() => [0, 0, 0, 0]);
    for (const c of cols) {
      let j = 0, near = Infinity;
      cs.forEach((m, q) => { const d = d2(c, m); if (d < near) { near = d; j = q; } });
      s[j][0] += c[0]; s[j][1] += c[1]; s[j][2] += c[2]; s[j][3]++;
    }
    cs = cs.map((m, q) => (s[q][3] ? [s[q][0] / s[q][3], s[q][1] / s[q][3], s[q][2] / s[q][3]] : m));
    count = s.map((v) => v[3]);
  }
  return cs.map((c, q) => ({ c, share: count[q] / cols.length }));
};

// The cut. rgba holds `band` rows of what lies behind the thing, then its
// h rows, all w wide. Returns a Uint8Array(w * h) alpha: 255 on the thing's
// own pixels inside the outline, 0 everywhere else.
SEETHROUGH.keep = (rgba, w, h, band, inside) => {
  const out = new Uint8Array(w * h);
  const px = [];
  for (let i = 0; i < w * h; i++) if (inside[i]) px.push(i);
  if (px.length < 2) return out;
  const at = (o) => [rgba[o], rgba[o + 1], rgba[o + 2]];
  const col = (i) => at((i + band * w) * 4);
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  if (band > 0) {
    // colour histograms, 16 levels a channel, of the inside and of the band
    const Q = 16, N = 16;
    const bin = (o) => (((rgba[o] / Q) | 0) * N + ((rgba[o + 1] / Q) | 0)) * N + ((rgba[o + 2] / Q) | 0);
    const hIn = new Float32Array(N * N * N), hBand = new Float32Array(N * N * N);
    for (const i of px) hIn[bin((i + band * w) * 4)] += 1 / px.length;
    for (let i = 0; i < w * band; i++) hBand[bin(i * 4)] += 1 / (w * band);
    // near colours counted together: the bin and its 26 neighbours
    const around = (hist, b) => {
      const r = Math.floor(b / (N * N)), g = Math.floor(b / N) % N, l = b % N;
      let sum = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dg = -1; dg <= 1; dg++) for (let dl = -1; dl <= 1; dl++) {
        const R = r + dr, G = g + dg, L = l + dl;
        if (R >= 0 && R < N && G >= 0 && G < N && L >= 0 && L < N) sum += hist[(R * N + G) * N + L];
      }
      return sum;
    };
    const railing = new Map();
    for (const i of px) {
      const b = bin((i + band * w) * 4);
      if (!railing.has(b)) railing.set(b, around(hIn, b) >= 1.6 * around(hBand, b));
      if (railing.get(b)) out[i] = 255;
    }
  } else {
    const [a, b] = SEETHROUGH.groups(px.map(col), 2).sort((p, q) => q.share - p.share);
    for (const i of px) if (b && d2(col(i), b.c) < d2(col(i), a.c)) out[i] = 255;
  }
  // tidy: a lone kept pixel goes, a lone hole in a bar is filled
  const tidy = out.slice();
  for (const i of px) {
    const x = i % w, y = (i - x) / w;
    const n = (x > 0 && out[i - 1] ? 1 : 0) + (x < w - 1 && out[i + 1] ? 1 : 0) +
              (y > 0 && out[i - w] ? 1 : 0) + (y < h - 1 && out[i + w] ? 1 : 0);
    if (out[i] && n === 0) tidy[i] = 0;
    else if (!out[i] && n === 4) tidy[i] = 255;
  }
  return tidy;
};

// ---------- in the game ----------
// A plate tile's pixels, decoded once from its embedded data URL (PLATES),
// so this works off file:// too (a data URL does not taint the canvas).
SEETHROUGH.tiles = {};
SEETHROUGH.tilePixels = (key) => SEETHROUGH.tiles[key] || (SEETHROUGH.tiles[key] = new Promise((done, fail) => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    done(g);
  };
  img.onerror = () => fail(new Error(`plate ${key} did not decode`));
  img.src = PLATES[key];
}));

// The cut-out for one patch: a sprite the size of the patch, opaque on the
// railing, clear on the floor between its bars. m: { key, px, py, pw, ph,
// pos } in tile pixels; pts: the outline in world px. Kept, so going back
// into a room reuses it.
SEETHROUGH.cache = {};
SEETHROUGH.maskFor = async (m, pts, U) => {
  const id = [m.key, m.px, m.py, m.pw, m.ph, pts.map((v) => v.x + "," + v.y).join(" ")].join("|");
  if (SEETHROUGH.cache[id]) return SEETHROUGH.cache[id];
  const g = await SEETHROUGH.tilePixels(m.key);
  const band = Math.min(Math.round(U * 0.75), m.py);
  const data = g.getImageData(m.px, m.py - band, m.pw, m.ph + band).data;
  const local = pts.map((v) => ({ x: v.x - m.pos.x, y: v.y - m.pos.y }));
  const keep = SEETHROUGH.keep(data, m.pw, m.ph, band, SEETHROUGH.polyMask(local, m.pw, m.ph));
  const c = document.createElement("canvas");
  c.width = m.pw; c.height = m.ph;
  const g2 = c.getContext("2d");
  const img = g2.createImageData(m.pw, m.ph);
  for (let i = 0; i < keep.length; i++) {
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = 255;
    img.data[i * 4 + 3] = keep[i];
  }
  g2.putImageData(img, 0, 0);
  return (SEETHROUGH.cache[id] = SpriteData.fromImage(c));
};
