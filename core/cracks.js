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
//
// The colours are sampled from the painted fissures on the ruined
// park plate (data/level-parkruined.js), so the tutorial's cracks
// are the same ones you find waiting at the end.
//
// Use:  add([...CRACKS.comps(variant, { delay, dur }), pos(p), z(3)])
// The sprite's centre is the crack's epicentre, so anything pulled
// into a crack goes to its pos.
// ============================================================

const CRACKS = (() => {
  const STAGES = 12;     // growth frames per crack
  const PX = 2;          // world px per crack pixel, at area scale 1
  const HALO = 8;        // how far the glow spreads, in crack pixels

  // Sampled from the ruined park's painted fissures.
  const PAL = {
    edge: [18, 0, 26],      // the black lip
    wallTop: [44, 12, 60],  // the wall face just under the top lip
    wall: [72, 26, 98],     // the rest of that wall, glow catching it
    glow: [214, 92, 236],   // the light down in the crack
    hot: [242, 120, 244],   // brightest, where it is widest
    rim: [244, 206, 244],   // the bottom lip, lit from inside
    halo: [176, 86, 226],   // spill on the ground around it
  };

  // Six shapes, biggest first. len is each arm's length and w the
  // half-width at the epicentre, both in crack pixels.
  const VARIANTS = [
    { seed: 11, len: 56, w: 5.5 },
    { seed: 23, len: 52, w: 5.5 },
    { seed: 37, len: 46, w: 5 },
    { seed: 41, len: 42, w: 5 },
    { seed: 53, len: 36, w: 4.5 },
    { seed: 67, len: 32, w: 4 },
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

    const course = span(-0.45, 0.45);
    walk(0, 0, 0, course, v.len * span(0.85, 1), v.w, 0);
    walk(0, 0, 0, course + Math.PI, v.len * span(0.85, 1), v.w, 0);
    let dMax = 0;
    for (const l of lines) for (const p of l) dMax = Math.max(dMax, p.d);
    return { lines, dMax };
  };

  // --- one growth stage, s from 0 to 1, as RGBA pixels ---
  const stage = (sh, s, W, H, ox, oy) => {
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

    const px = new Uint8ClampedArray(W * H * 4);
    const put = (i, c, a) => { px[i * 4] = c[0]; px[i * 4 + 1] = c[1]; px[i * 4 + 2] = c[2]; px[i * 4 + 3] = a; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (inner[i]) {
        // How far to the top lip and the bottom lip, straight up and down.
        let up = 1; while (at(inner, x, y - up)) up++;
        let dn = 1; while (at(inner, x, y + dn)) dn++;
        const tall = up + dn - 1;
        let c;
        if (tall <= 2) c = up === 1 && tall === 2 ? PAL.wall : PAL.glow;   // a thin seam: just light
        else if (up === 1) c = PAL.wallTop;
        else if (up <= Math.max(1, Math.round(tall * 0.42))) c = (x * 7 + up * 3) % 5 === 0 ? PAL.wallTop : PAL.wall;
        else if (dn === 1) c = PAL.rim;
        else c = tall >= 7 && dn <= 3 ? PAL.hot : PAL.glow;
        put(i, c, 255);
      } else if (hair[i] || at(inner, x - 1, y) || at(inner, x + 1, y) || at(inner, x, y - 1) || at(inner, x, y + 1)) {
        put(i, PAL.edge, 255);
      } else {
        // Stepped, so the spill reads as pixel art rather than airbrush.
        const a = Math.round(Math.min(0.5, glow[i] * 1.5) * 12) / 12;
        if (a > 0) put(i, PAL.halo, Math.round(a * 255));
      }
    }
    return px;
  };

  // Every stage of one variant, side by side in one strip.
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
    const frames = [];
    for (let k = 0; k < STAGES; k++) frames.push(stage(sh, (k + 1) / STAGES, W, H, hw + 0.5, hh + 0.5));
    return { W, H, frames, reach: { x: mx, y: my } };
  };

  const REACH = [];   // each variant's half extent, in crack pixels
  const load = () => {
    VARIANTS.forEach((v, n) => {
      const { W, H, frames, reach } = bake(v);
      REACH[n] = reach;
      const cv = document.createElement("canvas");
      cv.width = W * STAGES; cv.height = H;
      const x = cv.getContext("2d");
      frames.forEach((f, k) => x.putImageData(new ImageData(f, W, H), k * W, 0));
      loadSprite("crack" + n, cv.toDataURL(), { sliceX: STAGES });
    });
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

  // A centre inside box [x1, y1, x2, y2] for crack `variant` to open on
  // open floor: the whole crack (not just its middle) clear of the room's
  // solids (walls, water, furniture) and of the plate's painted things
  // (a moored boat has an outline but no solid footprint), and away from
  // the cracks already in `taken`, so nine read as nine rather than one
  // knot. null when nothing fits.
  const spot = ([x1, y1, x2, y2], { variant = 0, taken = [], plate = null } = {}) => {
    const reach = REACH[variant % VARIANTS.length];
    const k = PX * G.areaScale;
    const hx = reach.x * k, hy = reach.y * k * 0.6;   // branch tips may stray a little
    const blocks = COLLIDE.solids.filter((r) => !(r.open && r.open())).slice();
    if (plate && plate.things) {
      for (const t of plate.things) {
        if (!t.over) continue;
        const xs = t.over.map((q) => q[0] * plate.unit), ys = t.over.map((q) => q[1] * plate.unit);
        blocks.push({ x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) });
      }
    }
    const onFloor = (p) => !blocks.some((r) => p.x + hx > r.x1 && p.x - hx < r.x2 && p.y + hy > r.y1 && p.y - hy < r.y2);
    const apart = (p) => !taken.some((c) => Math.abs(c.x - p.x) < 150 && Math.abs(c.y - p.y) < 70);
    for (let i = 0; i < 120; i++) {
      const p = vec2(rand(x1, x2), rand(y1, y2));
      if (onFloor(p) && apart(p)) return p;
    }
    return null;   // a narrow room just gets fewer cracks
  };

  return { STAGES, VARIANTS, bake, load, comps, spot };
})();
