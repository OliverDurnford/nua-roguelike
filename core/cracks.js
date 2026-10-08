// ============================================================
// CRACKS: the fissures that open in Victoria Park and follow you
// to the end (the tutorial, the canal's dread, the finale).
//
// Drawn in code, not generated, for three reasons Ollie raised
// (8 Oct 2026):
//   1. Which way is up. The light is worked out on screen (the
//      shadowed wall under the top lip, the glow catching the
//      bottom lip), so a crack can run in any direction and still
//      read right. The old art was rotated at random, so its
//      lighting came out upside down and sideways.
//   2. No grass. Nothing around the fissure but a faint purple
//      glow, so it sits on any ground: park grass, canal paving,
//      the ruined park.
//   3. They grow. Each crack is baked as STAGES frames, from a
//      hairline at its centre to fully open, and plays through
//      them: the line races out first, then the middle splits and
//      starts to glow. Every frame is the same crack, so it grows
//      rather than swapping pictures.
// And (8 Oct, second pass): like the finale's painted fissures, the
// wide parts are dark inside with glowing lips and pale glyphs down
// the middle, and no crack is ever placed over another one, painted
// or not (CRACKS.spot).
//
// The colours are sampled from the painted fissures on the ruined
// park plate (data/level-parkruined.js), so the tutorial's cracks
// are the same ones you find waiting at the end.
//
// Use:  const at = CRACKS.spot(box, { variant, placed, plate });
//       if (at) { placed.push(at); add([...CRACKS.comps(at.variant, { flip: at.flip, delay }), pos(at.pos), z(3)]); }
// The sprite's centre is the crack's epicentre, so anything pulled
// into a crack goes to its pos.
// ============================================================

const CRACKS = (() => {
  const STAGES = 12;     // growth frames per crack
  const PX = 2;          // world px per crack pixel, at area scale 1
  const HALO = 8;        // how far the glow spreads, in crack pixels

  // Sampled from the ruined park's painted fissures.
  const PAL = {
    edge: [18, 0, 26],       // the black lip
    seam: [214, 92, 236],    // a thin crack: all light
    hot: [248, 156, 252],    // the very edge of that lip
    lip: [232, 112, 244],    // the top lip of a wide one, glowing
    lipFade: [150, 58, 182], // just under it
    lipLow: [170, 64, 204],  // the bottom lip
    mid: [112, 44, 142],     // a crack too narrow to be dark inside
    body: [40, 18, 56],      // the dark inside of a wide one
    deep: [28, 10, 40],      // streaks down that dark face
    lift: [56, 26, 76],
    glyph: [250, 214, 255],  // the glyphs, pale and lit
    glyphGlow: [138, 60, 178],
    halo: [176, 86, 226],    // spill on the ground around it
  };

  // The glyphs, 5 x 7, in the spirit of the runes painted down the
  // finale's cracks. Invented, so a mirrored one is still a glyph.
  const GLYPHS = [
    ["#####", "..#..", ".###.", "#.#.#", ".###.", "..#..", "#####"],
    ["#.#.#", "#.#.#", ".###.", "..#..", "..#..", "..#..", "..#.."],
    ["###..", "#..#.", "#..#.", "###..", "#.#..", "#..#.", "#...#"],
    [".##..", "#..#.", "#..#.", ".####", "...#.", "..#..", ".#..."],
    ["#...#", "##.##", "#.#.#", "#.#.#", "#.#.#", "##.##", "#...#"],
    ["#####", "#...#", ".#.#.", ".#.#.", "..#..", ".....", "..#.."],
    ["#....", "#.##.", "##..#", "#...#", "#..#.", "#.#..", "##..."],
    ["..#..", ".#.#.", "#...#", ".#.#.", "..#..", "..#..", ".###."],
  ];

  // Six shapes, biggest first. len is each arm's length and w the
  // half-width at the epicentre, both in crack pixels.
  const VARIANTS = [
    { seed: 11, len: 58, w: 8 },
    { seed: 23, len: 54, w: 7.5 },
    { seed: 37, len: 48, w: 7 },
    { seed: 41, len: 44, w: 6.5 },
    { seed: 53, len: 38, w: 6 },
    { seed: 67, len: 32, w: 5 },
  ];

  // A small seeded generator, so every crack is the same every run.
  const rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // --- the shape: a jagged trunk out both ways, plus branches ---
  // Every point carries d, its distance along the crack from the
  // epicentre, which is what the growth runs on.
  const shape = (v) => {
    const r = rng(v.seed);
    const span = (a, b) => a + r() * (b - a);
    const lines = [];

    // A zig-zag: every step kinks off the line's course, and the course
    // itself drifts a little, which is what makes it read as torn ground
    // rather than a drawn curve.
    const walk = (x, y, d, heading, len, w0, depth) => {
      const pts = [{ x, y, d, w: w0 }];
      let course = heading, run = 0;
      while (run < len) {
        const step = span(4, 8);
        course += span(-0.22, 0.22);
        course += (heading - course) * 0.3;
        const dir = course + span(-0.95, 0.95);
        x += Math.cos(dir) * step;
        y += Math.sin(dir) * step;
        run += step;
        const k = Math.min(1, run / len);
        pts.push({ x, y, d: d + run, w: w0 * Math.pow(1 - k, 0.4) * span(0.6, 1.1) });
      }
      pts.trunk = depth === 0;
      lines.push(pts);
      if (depth >= 2) return;
      // Branches off the trunk, and hairline twigs off the branches.
      const n = depth === 0 ? 2 + Math.floor(r() * 2) : Math.floor(r() * 2.2);
      for (let i = 0; i < n; i++) {
        const at = pts[Math.floor(span(0.2, 0.85) * (pts.length - 1))];
        const side = r() < 0.5 ? -1 : 1;
        const bw = depth === 0 ? at.w * span(0.3, 0.5) : 0;
        walk(at.x, at.y, at.d, heading + side * span(0.5, 1.2), len * span(0.25, 0.45), bw, depth + 1);
      }
    };

    const course = span(-0.75, 0.75);
    walk(0, 0, 0, course, v.len * span(0.85, 1), v.w, 0);
    walk(0, 0, 0, course + Math.PI, v.len * span(0.85, 1), v.w, 0);
    let dMax = 0;
    for (const l of lines) for (const p of l) dMax = Math.max(dMax, p.d);
    return { lines, dMax, pick: (n) => Math.floor(r() * n) };
  };

  // --- one growth stage, s from 0 to 1, as RGBA pixels ---
  const stage = (sh, s, W, H, ox, oy, glyphs) => {
    const inner = new Uint8Array(W * H);
    const hair = new Uint8Array(W * H);
    const front = sh.dMax * Math.min(1, 0.06 + s / 0.55);   // the line races out first
    // ...and the crack opens behind it, centre first.
    const open = (d) => {
      const k = Math.max(0, Math.min(1, (s - 0.12 - 0.5 * d / sh.dMax) / 0.45));
      return k * k * (3 - 2 * k);
    };

    for (const l of sh.lines) {
      for (let i = 0; i + 1 < l.length; i++) {
        const a = l[i];
        let b = l[i + 1];
        if (a.d > front) break;
        if (b.d > front) {
          const t = (front - a.d) / (b.d - a.d);
          b = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, d: front, w: a.w + (b.w - a.w) * t };
        }
        const ra = a.w * open(a.d), rb = b.w * open(b.d);
        const pad = Math.max(ra, rb) + 1;
        const x0 = Math.floor(Math.min(a.x, b.x) - pad + ox), x1 = Math.ceil(Math.max(a.x, b.x) + pad + ox);
        const y0 = Math.floor(Math.min(a.y, b.y) - pad + oy), y1 = Math.ceil(Math.max(a.y, b.y) + pad + oy);
        const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
        for (let py = Math.max(0, y0); py <= Math.min(H - 1, y1); py++) {
          for (let px = Math.max(0, x0); px <= Math.min(W - 1, x1); px++) {
            const qx = px - ox, qy = py - oy;
            const t = Math.max(0, Math.min(1, ((qx - a.x) * dx + (qy - a.y) * dy) / L2));
            const ex = a.x + dx * t - qx, ey = a.y + dy * t - qy;
            const dist = Math.sqrt(ex * ex + ey * ey);
            const rr = ra + (rb - ra) * t;
            if (rr >= 0.8 && dist <= rr) inner[py * W + px] = 1;
            if (dist <= 0.55) hair[py * W + px] = 1;
          }
        }
      }
    }

    const at = (m, x, y) => (x >= 0 && y >= 0 && x < W && y < H ? m[y * W + x] : 0);

    // The glow: a soft blur of the open crack, spilt on the ground.
    let glow = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) glow[i] = inner[i] ? 1 : hair[i] ? 0.25 : 0;
    for (let pass = 0; pass < 2; pass++) {
      const R = HALO >> 1;
      const tmp = new Float32Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let sum = 0;
        for (let k = -R; k <= R; k++) sum += glow[y * W + Math.max(0, Math.min(W - 1, x + k))];
        tmp[y * W + x] = sum / (2 * R + 1);
      }
      const out = new Float32Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let sum = 0;
        for (let k = -R; k <= R; k++) sum += tmp[Math.max(0, Math.min(H - 1, y + k)) * W + x];
        out[y * W + x] = sum / (2 * R + 1);
      }
      glow = out;
    }

    // What each open pixel is: 0 outside, 1 a lip or a thin crack,
    // 2 the dark inside of a wide one (where glyphs can go).
    const kind = new Uint8Array(W * H);
    const col = new Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!inner[i]) continue;
      // How far to the top lip and the bottom lip, straight up and down.
      let up = 1; while (at(inner, x, y - up)) up++;
      let dn = 1; while (at(inner, x, y + dn)) dn++;
      const tall = up + dn - 1;
      let c, k = 1;
      if (tall <= 3) c = up === 1 && tall === 3 ? PAL.lip : PAL.seam;
      else if (tall <= 6) c = up === 1 ? PAL.lip : dn === 1 ? PAL.lipLow : PAL.mid;
      else if (up === 1) c = PAL.hot;
      else if (up === 2) c = PAL.lip;
      else if (up === 3) c = PAL.lipFade;
      else if (dn === 1) c = PAL.lipLow;
      else if (dn === 2 && tall >= 11) c = PAL.lipFade;
      else {
        // Streaks down the dark face, like the painted ones.
        const h = (Math.imul(x + 101, 2654435761) >>> 24) % 13;
        c = h === 0 || (h === 1 && dn > 2) ? PAL.deep : h === 7 && up > 3 ? PAL.lift : PAL.body;
        k = 2;
      }
      col[i] = c;
      kind[i] = k;
    }

    // Glyphs, each only once the crack has opened wide enough round it.
    for (const g of glyphs) {
      let fits = true;
      for (let y = -1; y <= 7 && fits; y++) for (let x = -1; x <= 5 && fits; x++) {
        const k = at(kind, g.x + x, g.y + y);
        if (y >= 0 && y < 7 && x >= 0 && x < 5 ? k !== 2 : k === 0) fits = false;
      }
      if (!fits) continue;
      const rows = GLYPHS[g.n];
      const on = (x, y) => y >= 0 && y < 7 && x >= 0 && x < 5 && rows[y][x] === "#";
      for (let y = -1; y <= 7; y++) for (let x = -1; x <= 5; x++) {
        const i = (g.y + y) * W + g.x + x;
        if (on(x, y)) col[i] = PAL.glyph;
        else if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) col[i] = PAL.glyphGlow;
      }
    }

    const px = new Uint8ClampedArray(W * H * 4);
    const put = (i, c, a) => { px[i * 4] = c[0]; px[i * 4 + 1] = c[1]; px[i * 4 + 2] = c[2]; px[i * 4 + 3] = a; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (inner[i]) put(i, col[i], 255);
      else if (hair[i] || at(inner, x - 1, y) || at(inner, x + 1, y) || at(inner, x, y - 1) || at(inner, x, y + 1)) {
        put(i, PAL.edge, 255);
      } else {
        // Stepped, so the spill reads as pixel art rather than airbrush.
        const a = Math.round(Math.min(0.58, glow[i] * 1.8) * 12) / 12;
        if (a > 0) put(i, PAL.halo, Math.round(a * 255));
      }
    }
    return { px, kind };
  };

  // Every stage of one variant, side by side in one strip, plus where
  // the crack itself lies (for keeping cracks apart).
  const MARGIN = 6;   // crack pixels kept clear between two cracks
  const bake = (v) => {
    const sh = shape(v);
    let mx = 0, my = 0;
    for (const l of sh.lines) for (const p of l) {
      mx = Math.max(mx, Math.abs(p.x) + p.w);
      my = Math.max(my, Math.abs(p.y) + p.w);
    }
    // Centred on the epicentre, so anchor("center") puts it at pos.
    const hw = Math.ceil(mx) + HALO + 2, hh = Math.ceil(my) + HALO + 2;
    const W = hw * 2 + 1, H = hh * 2 + 1;
    const ox = hw + 0.5, oy = hh + 0.5;

    // Glyph slots: down the trunk from the middle out, wherever the
    // fully open crack is dark inside, at least a glyph apart.
    const open = stage(sh, 1, W, H, ox, oy, []);
    const glyphs = [];
    const fitsAt = (gx, gy) => {
      for (let y = -1; y <= 7; y++) for (let x = -1; x <= 5; x++) {
        const xx = gx + x, yy = gy + y;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) return false;
        const k = open.kind[yy * W + xx];
        if (y >= 0 && y < 7 && x >= 0 && x < 5 ? k !== 2 : k === 0) return false;
      }
      return true;
    };
    for (const l of sh.lines) {
      if (!l.trunk) continue;
      for (const p of l) {
        let best = null;
        for (let dy = -2; dy <= 2 && !best; dy++) for (let dx = -1; dx <= 1 && !best; dx++) {
          const gx = Math.round(p.x + ox) - 2 + dx, gy = Math.round(p.y + oy) - 3 + dy;
          if (fitsAt(gx, gy)) best = { x: gx, y: gy };
        }
        if (best && glyphs.every((g) => Math.abs(g.x - best.x) > 9 || Math.abs(g.y - best.y) > 10)) {
          glyphs.push({ ...best, n: sh.pick(GLYPHS.length) });
        }
      }
    }

    const frames = [];
    for (let k = 0; k < STAGES; k++) frames.push(stage(sh, (k + 1) / STAGES, W, H, ox, oy, glyphs).px);

    // Where the open crack lies: one of its pixels from every 2 x 2 block
    // it touches (so a one pixel hairline is never skipped), and a grid
    // of all of them grown by MARGIN, both from the epicentre.
    const last = frames[STAGES - 1];
    const pts = [];
    const seen = new Set();
    const near = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (last[(y * W + x) * 4 + 3] !== 255) continue;
      const block = (y >> 1) * W + (x >> 1);
      if (!seen.has(block)) { seen.add(block); pts.push([x - hw, y - hh]); }
      for (let yy = Math.max(0, y - MARGIN); yy <= Math.min(H - 1, y + MARGIN); yy++) {
        for (let xx = Math.max(0, x - MARGIN); xx <= Math.min(W - 1, x + MARGIN); xx++) near[yy * W + xx] = 1;
      }
    }
    return { W, H, frames, glyphs: glyphs.length, occ: { hw, hh, W, H, pts, near } };
  };

  const OCC = [];   // per variant: where its crack lies
  const PAINTED = {};   // per plate: where cracks are already painted

  // The finale's plate has fissures painted in, glowing magenta. Mark
  // where, so a growing crack never lands across one. The image is a
  // data URL, so reading it back is allowed even from file://.
  const markPainted = (key) => {
    if (typeof PLATES === "undefined" || !PLATES[key]) return;
    const img = new Image();
    img.onload = () => {
      const C = 4;   // image pixels per cell
      const cols = Math.ceil(img.width / C), rows = Math.ceil(img.height / C);
      const cv = document.createElement("canvas");
      cv.width = cols; cv.height = rows;
      const x = cv.getContext("2d");
      x.drawImage(img, 0, 0, cols, rows);
      const d = x.getImageData(0, 0, cols, rows).data;
      const hot = new Uint8Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
        hot[i] = r > 150 && b > 165 && g < 150 && r - g > 45 ? 1 : 0;
      }
      const grid = new Uint8Array(cols * rows);
      const R = 4;   // and a little room round them
      for (let y = 0; y < rows; y++) for (let x2 = 0; x2 < cols; x2++) {
        if (!hot[y * cols + x2]) continue;
        for (let yy = Math.max(0, y - R); yy <= Math.min(rows - 1, y + R); yy++) {
          for (let xx = Math.max(0, x2 - R); xx <= Math.min(cols - 1, x2 + R); xx++) grid[yy * cols + xx] = 1;
        }
      }
      PAINTED[key] = { cols, rows, imgW: img.width, grid };
    };
    img.src = PLATES[key];
  };

  const load = () => {
    VARIANTS.forEach((v, n) => {
      const { W, H, frames, occ } = bake(v);
      OCC[n] = occ;
      const cv = document.createElement("canvas");
      cv.width = W * STAGES; cv.height = H;
      const x = cv.getContext("2d");
      frames.forEach((f, k) => x.putImageData(new ImageData(f, W, H), k * W, 0));
      loadSprite("crack" + n, cv.toDataURL(), { sliceX: STAGES });
    });
    markPainted("parkruined");
  };

  // Plays a crack open: hidden for `delay` seconds, then grows over
  // `dur` and holds fully open.
  // The light is baked top to bottom, so a mirror left to right is
  // free variety; a rotation is not (that was the old upside-down bug).
  const grow = (delay, dur, flip) => ({
    id: "crackGrow",
    require: ["sprite"],
    growT: -delay,
    add() { this.frame = 0; this.hidden = delay > 0; this.flipX = flip; },
    update() {
      this.growT += dt();
      this.hidden = this.growT < 0;
      const k = Math.max(0, Math.min(1, this.growT / dur));
      this.frame = Math.round((1 - (1 - k) * (1 - k)) * (STAGES - 1));
    },
  });

  const comps = (variant, opts = {}) => [
    sprite("crack" + (variant % VARIANTS.length)),
    anchor("center"),
    scale(PX * G.areaScale),
    grow(opts.delay || 0, opts.dur || 1.1, opts.flip !== undefined ? opts.flip : Math.random() < 0.5),
  ];

  // Where crack `variant` can open with its centre inside box
  // [x1, y1, x2, y2]: every part of it on open floor, clear of the
  // room's solids (walls, water, furniture), of the plate's painted
  // things (a moored boat has an outline but no solid footprint), of
  // any crack painted into the plate, and of every crack in `placed`,
  // so no two ever cross. If the shape asked for will not fit, the
  // smaller ones are tried. Returns { pos, variant, flip }, or null
  // when nothing fits (a tight room just gets fewer cracks).
  const spot = ([x1, y1, x2, y2], { variant = 0, placed = [], plate = null } = {}) => {
    const k = PX * G.areaScale;
    const blocks = COLLIDE.solids.filter((r) => !(r.open && r.open())).slice();
    if (plate && plate.things) {
      for (const t of plate.things) {
        if (!t.over) continue;
        const xs = t.over.map((q) => q[0] * plate.unit), ys = t.over.map((q) => q[1] * plate.unit);
        blocks.push({ x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) });
      }
    }
    const key = plate && plate.sprite && plate.sprite.replace(/^plate-/, "");
    const painted = key && PAINTED[key];
    const worldW = plate ? plate.cols * plate.unit : 1;

    // Does crack c ({ pos, variant, flip }) touch any of the above?
    const clashes = (c) => {
      const o = OCC[c.variant];
      for (const [dx, dy] of o.pts) {
        const wx = c.pos.x + (c.flip ? -dx : dx) * k, wy = c.pos.y + dy * k;
        for (const r of blocks) if (wx > r.x1 - 4 && wx < r.x2 + 4 && wy > r.y1 - 4 && wy < r.y2 + 4) return true;
        if (painted) {
          const s = painted.imgW / worldW / 4;
          const cx = Math.floor(wx * s), cy = Math.floor(wy * s);
          if (cx >= 0 && cy >= 0 && cx < painted.cols && cy < painted.rows && painted.grid[cy * painted.cols + cx]) return true;
        }
        for (const q of placed) {
          const qo = OCC[q.variant];
          let lx = Math.round((wx - q.pos.x) / k), ly = Math.round((wy - q.pos.y) / k);
          if (q.flip) lx = -lx;
          lx += qo.hw; ly += qo.hh;
          if (lx >= 0 && ly >= 0 && lx < qo.W && ly < qo.H && qo.near[ly * qo.W + lx]) return true;
        }
      }
      return false;
    };

    for (let v = variant % VARIANTS.length; v < VARIANTS.length; v++) {
      for (let i = 0; i < 70; i++) {
        const c = { pos: vec2(rand(x1, x2), rand(y1, y2)), variant: v, flip: Math.random() < 0.5 };
        if (!clashes(c)) return c;
      }
    }
    return null;
  };

  return { STAGES, VARIANTS, bake, load, comps, spot };
})();
