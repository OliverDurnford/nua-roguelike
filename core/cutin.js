// ============================================================
// CUTIN: the parallax collection screens. Four layers of art
// rush in from alternating sides, decelerate into a slow cruise
// that never quite stops, then accelerate away again.
//
// The motion is a velocity curve, not a position curve. Velocity
// starts high, decays as a cubic into the cruise, holds, then
// ramps back up as a cubic. Position is the closed-form integral
// of that, taken straight off the scene clock, so the drift is
// identical at 30fps and at 144fps and nothing can stall.
//
// Design: docs/superpowers/specs/2026-09-20-collection-screens-design.md
// ============================================================

const CUTIN = {};

// Index 0 is the foreground (the friend), 3 is the far layer. Depth drives
// all three of: how far a layer travels in, how fast it cruises, and how
// late it arrives. dir is +1 for a layer moving rightwards (so it entered
// from the left), -1 for leftwards.
CUTIN.LAYERS = [
  { travel: 1100, cruise: 26, dir: 1 },
  { travel: 520, cruise: 17, dir: -1 },
  { travel: 320, cruise: 11, dir: 1 },
  { travel: 180, cruise: 5, dir: -1 },
];

CUTIN.ENTER_DUR = 0.44;   // how long a layer takes to come in
CUTIN.EXIT_DUR = 0.45;    // how long its acceleration away lasts
CUTIN.STAGGER = 0.06;     // gap between consecutive layers
CUTIN.EXIT_MULT = 1.6;    // exit travel, as a multiple of entry travel
CUTIN.TOTAL = 5.0;        // the whole screen, in seconds (Ollie, 20 Sep)

// True while a screen is playing. The pause chip sits at z 230, above the
// cut-in, so it reads it and stands down rather than drawing over the art.
CUTIN.active = false;

// The far layer leads on the way in and trails on the way out, so the
// friend arrives last and clears first.
CUTIN._lag = (i) => CUTIN.STAGGER * (3 - i);
CUTIN.enterAt = (i) => CUTIN._lag(i);
CUTIN.parkedAt = (i) => CUTIN._lag(i) + CUTIN.ENTER_DUR;
CUTIN.exitAt = (i) => CUTIN.TOTAL - CUTIN.EXIT_DUR - CUTIN._lag(i);

// Entry velocity that covers `dist` in `dur` while decaying to `cruise`.
// Solved from the integral of cruise + (v0 - cruise)(1 - k)^3.
CUTIN._v0 = (dist, dur, cruise) => 4 * dist / dur - 3 * cruise;

// x offset from this layer's park position, in pixels, at scene time t.
CUTIN.offsetAt = (i, t) => {
  const L = CUTIN.LAYERS[i];
  const vc = L.cruise, s = L.dir, D = L.travel;
  const t0 = CUTIN.enterAt(i), t1 = CUTIN.parkedAt(i), t2 = CUTIN.exitAt(i);
  const inD = CUTIN.ENTER_DUR, R = CUTIN.EXIT_DUR, E = D * CUTIN.EXIT_MULT;

  if (t <= t0) return -s * D;

  if (t < t1) {
    const k = (t - t0) / inD;
    const v0 = CUTIN._v0(D, inD, vc);
    const x = vc * (t - t0) + (v0 - vc) * inD * (1 - Math.pow(1 - k, 4)) / 4;
    return s * (x - D);
  }

  if (t < t2) return s * vc * (t - t1);

  const base = s * vc * (t2 - t1);
  const u = t - t2;
  const vX = CUTIN._v0(E, R, vc);
  if (u < R) return base + s * (vc * u + (vX - vc) * Math.pow(u, 4) / (4 * R * R * R));
  return base + s * (E + vX * (u - R));
};

// ---------- drawing ----------

CUTIN.Z = 200;          // the whole screen sits above everything on the field
CUTIN.FADE_IN = 0.12;
CUTIN.FADE_OUT = 0.22;

// Which sprite draws layer i for this friend. Real art when it exists,
// otherwise the placeholders, and the friend's own sprite for layer 0.
CUTIN.spriteFor = (id, i) => {
  if (typeof REAL_CUTINS !== "undefined" && REAL_CUTINS[id] && REAL_CUTINS[id][i]) {
    return "cutin-" + id + "-" + i;
  }
  if (i === 0) return null;      // caller falls back to the character sprite
  return "cutin-ph-" + i;
};

// Build the screen's content from a character entry. The specials will get
// their own builder later, feeding the same shape to the same engine.
CUTIN.forJoin = (c) => ({
  id: c.id,
  name: c.name.toUpperCase(),
  headline: c.passive.name.toUpperCase(),
  stat: c.passive.desc.toUpperCase(),
  special: c.special.name.toUpperCase(),
  bubble: c.recruitLine,
});

CUTIN.play = (opts, onDone) => {
  const scene = CUTINS[opts.id] || CUTINS.cal;
  let t = 0;

  G.paused = true;
  CUTIN.active = true;

  // the clock every part of the screen reads
  const root = add([fixed(), z(CUTIN.Z), "cutin", { t: 0 }]);
  root.onUpdate(() => { t += dt(); root.t = t; });

  // how strongly the whole screen is present: up fast, down at the end
  const alpha = () => {
    if (t < CUTIN.FADE_IN) return t / CUTIN.FADE_IN;
    const left = CUTIN.TOTAL - t;
    if (left < CUTIN.FADE_OUT) return Math.max(0, left / CUTIN.FADE_OUT);
    return 1;
  };

  // ----- the sky: a vertical two-stop field drawn as bands -----
  const sky = add([fixed(), z(CUTIN.Z), "cutin"]);
  sky.onDraw(() => {
    const op = alpha();
    const a = scene.sky[0], b = scene.sky[1];
    const n = 24, bh = Math.ceil(G.H / n);
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1);
      UI.R(0, i * bh, G.W, bh + 1,
        [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k], op);
    }
  });

  // ----- speed lines: the kinetic energy under everything -----
  const LINES = [];
  for (let i = 0; i < 22; i++) {
    LINES.push({ y: rand(0, G.H), w: rand(90, 320), sp: rand(260, 620), o: rand(0.05, 0.16), x: rand(-400, G.W) });
  }
  const lines = add([fixed(), z(CUTIN.Z + 1), "cutin"]);
  lines.onDraw(() => {
    const op = alpha();
    for (const L of LINES) {
      let x = L.x + L.sp * t;
      x = ((x % (G.W + 800)) + (G.W + 800)) % (G.W + 800) - 400;
      UI.R(x, L.y, L.w, 2, UI.SILVER, L.o * op);
    }
  });

  // ----- the four art layers, far one first so z order is front to back -----
  for (let i = 3; i >= 0; i--) {
    const px = scene.park[i][0], py = scene.park[i][1];
    const name = CUTIN.spriteFor(opts.id, i);
    // Real and placeholder layers are centred. A friend drawn through
    // charComps is anchored on their body centre instead, which sits a
    // little above the image centre, so their park y is tuned by eye.
    const comps = name
      ? [sprite(name), anchor("center")]
      : ART.charComps(opts.id, 300);
    const layer = add([
      ...comps, pos(px, py), opacity(1), fixed(), z(CUTIN.Z + 2 + (3 - i)), "cutin",
    ]);
    layer.onUpdate(() => {
      layer.pos = vec2(px + CUTIN.offsetAt(i, t), py);
      layer.opacity = alpha();
    });
  }

  // ----- the type: bottom right, opposite the friend -----
  // Everything hangs off the RIGHT margin, because the lines vary wildly in
  // length: names run CAL to ANNIE, and the stat boosts run "+2 MAX HP" to
  // "SMALL BOOST TO EVERYTHING". Right-aligned, a long one grows leftwards
  // into empty sky instead of off the edge.
  // In at 0.62 with the friend's landing, out at 2.37 with them, and creeping
  // at 4px/s in between: slow enough to read, never actually still.
  const TYPE_IN = 0.62, TYPE_OUT = CUTIN.exitAt(0);
  const RX = 928, TY = 250;      // right margin, and the top of the block

  const typeX = () => {
    if (t < TYPE_IN) return 520;                                   // off to the right
    if (t < TYPE_IN + 0.18) return 520 - 520 * UI.ease((t - TYPE_IN) / 0.18);
    if (t < TYPE_OUT) return (t - TYPE_IN - 0.18) * 4;             // the slow creep
    const u = (t - TYPE_OUT) / CUTIN.EXIT_DUR;
    return (TYPE_OUT - TYPE_IN - 0.18) * 4 + 900 * u * u * u;      // and away
  };

  // The stat slab is the loud one, so it takes 24 where it fits and drops to
  // 16 where it does not. Three of the ten need the smaller size.
  const STAT_MAX = 500;
  const fit = (str) => (Math.ceil(UI.measure(str, UI.PX, 24).width) + 28 <= STAT_MAX ? 24 : 16);
  const statSize = fit(opts.stat);
  const specSize = fit(opts.special);

  const type = add([fixed(), z(CUTIN.Z + 7), "cutin"]);
  type.onDraw(() => {
    const op = alpha();
    if (t < TYPE_IN) return;
    const r = RX + typeX();

    // the name, in the title lettering's chrome
    const nw = Math.ceil(UI.measure(opts.name, UI.PX, 48).width);
    UI.chromeText(opts.name, r - nw, TY, 48, op);

    // The special move comes FIRST, straight under the name (Ollie, 20 Sep):
    // ink type on a pale notched paper card, the opposite treatment to the
    // stat's silver type on a solid blue square-cornered slab. Same weight,
    // unmistakably a different thing.
    UI.label("SPECIAL MOVE", r, TY + 62, { size: 8, color: UI.BLUE, anchor: "topright", opacity: op });
    const pw = Math.ceil(UI.measure(opts.special, UI.PX, specSize).width);
    const k2 = Math.min(1, Math.max(0, (t - (TYPE_IN + 0.08)) / 0.12));
    const sc2 = t < TYPE_IN + 0.08 ? 0 : 1.25 - 0.25 * UI.ease(k2);
    if (sc2 > 0) {
      const w2 = (pw + 28) * sc2, h2 = (specSize + 16) * sc2;
      const cx2 = r - w2 / 2, cy2 = TY + 84 + h2 / 2;
      UI.card(vec2(cx2, cy2), w2, h2,
        { center: true, fill: UI.PAPER, shade: UI.PAPER_SHADE, drop: 3, opacity: op });
      UI.label(opts.special, cx2, cy2 + 1,
        { size: specSize, color: UI.TEXT, anchor: "center", shadow: false, opacity: op });
    }

    // then their passive, wrapped: Josh's runs to forty-two characters
    UI.label(opts.headline, r, TY + 146,
      { size: 16, color: UI.SILVER, width: 420, align: "right", anchor: "topright", opacity: op });

    // and the stat boost on its slab, landing last
    const sw = Math.ceil(UI.measure(opts.stat, UI.PX, statSize).width);
    const k = Math.min(1, Math.max(0, (t - (TYPE_IN + 0.18)) / 0.12));
    const sc = t < TYPE_IN + 0.18 ? 0 : 1.25 - 0.25 * UI.ease(k);
    if (sc > 0) {
      const w = (sw + 28) * sc, h = (statSize + 16) * sc;
      const cx = r - w / 2, cy = TY + 214 + h / 2;
      UI.card(vec2(cx, cy), w, h,
        { center: true, fill: UI.BLUE_DEEP, shade: UI.INK, notch: false, opacity: op });
      UI.label(opts.stat, cx, cy + 1,
        { size: statSize, color: UI.SILVER, anchor: "center", opacity: op });
    }
  });

  // ----- the bubble: the game's own sticky note, in screen space -----
  // An invisible anchor rides the foreground layer's motion and the note
  // hangs off it, so it travels with the friend in and out.
  if (opts.bubble) {
    const bx = scene.bubble[0], by = scene.bubble[1];
    const mouth = add([pos(bx, by), fixed(), z(CUTIN.Z + 8), "cutin"]);
    mouth.onUpdate(() => { mouth.pos = vec2(bx + CUTIN.offsetAt(0, t), by); });
    wait(0.85, () => {
      if (!mouth.exists()) return;
      const c = G.char(opts.id);
      UI.speech(mouth, opts.bubble, c ? c.colors.top : UI.SILVER,
        { fixed: true, whilePaused: true, z: CUTIN.Z + 9, dur: CUTIN.TOTAL - 0.85, tag: "cutin" });
    });
  }

  wait(CUTIN.TOTAL, () => {
    destroyAll("cutin");
    CUTIN.active = false;
    G.paused = false;
    if (onDone) onDone();
  });
};
