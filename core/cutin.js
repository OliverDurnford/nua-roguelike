// ============================================================
// CUTIN: the parallax screens. Four layers of art rush in from
// alternating sides, decelerate into a slow cruise that never
// quite stops, then accelerate away again. Two screens run on it:
// the collection screen when a friend joins, and the special
// attack screen when a special fires. Each has its own timing
// profile, staging (data/cutins.js) and art.
//
// The motion is a velocity curve, not a position curve. Velocity
// starts high, decays as a cubic into the cruise, holds, then
// ramps back up as a cubic. Position is the closed-form integral
// of that, taken straight off the scene clock, so the drift is
// identical at 30fps and at 144fps and nothing can stall.
//
// Design: docs/superpowers/specs/2026-09-20-collection-screens-design.md
//         docs/superpowers/specs/2026-10-06-special-screens-design.md
// ============================================================

const CUTIN = {};

// A timing profile per screen. In LAYERS index 0 is the foreground (the
// friend) and 3 the far layer. Depth drives all three of: how far a layer
// travels in, how fast it cruises, and how late it arrives. dir is +1 for
// a layer moving rightwards (so it entered from the left), -1 for leftwards.
CUTIN.JOIN = {
  LAYERS: [
    { travel: 1100, cruise: 26, dir: 1 },
    { travel: 520, cruise: 17, dir: -1 },
    { travel: 320, cruise: 11, dir: 1 },
    { travel: 180, cruise: 5, dir: -1 },
  ],
  ENTER_DUR: 0.44,   // how long a layer takes to come in
  EXIT_DUR: 0.45,    // how long its acceleration away lasts
  STAGGER: 0.06,     // gap between consecutive layers
  EXIT_MULT: 1.6,    // exit travel, as a multiple of entry travel
  TOTAL: 5.0,        // the whole screen, in seconds (Ollie, 20 Sep)
  FADE_IN: 0.12,
  FADE_OUT: 0.22,
  LINES: 1,          // speed line speed, as a multiple of the base
};

// The special screen plays every time the meter fires, perhaps twenty
// times a run where the collection screen plays once per friend: 2.5
// seconds, every time (Ollie, 6 Oct). Everything rushes harder and cruises
// faster, and the end is a hard cut into the attack's own flash and shake
// (COMPANIONS.applyEffect) rather than a fade, so the two read as one blow.
CUTIN.SPECIAL = {
  LAYERS: [
    { travel: 1100, cruise: 40, dir: 1 },
    { travel: 520, cruise: 26, dir: -1 },
    { travel: 320, cruise: 16, dir: 1 },
    { travel: 180, cruise: 8, dir: -1 },
  ],
  ENTER_DUR: 0.30,
  EXIT_DUR: 0.30,
  STAGGER: 0.04,
  EXIT_MULT: 1.6,
  TOTAL: 2.5,
  FADE_IN: 0.08,
  FADE_OUT: 0.06,
  LINES: 2,
};

// True while a screen is playing. The pause chip sits at z 230, above the
// cut-in, so it reads it and stands down rather than drawing over the art.
CUTIN.active = false;

// The far layer leads on the way in and trails on the way out, so the
// friend arrives last and clears first. P is the timing profile; leaving
// it out means the collection screen's.
CUTIN._lag = (i, P = CUTIN.JOIN) => P.STAGGER * (3 - i);
CUTIN.enterAt = (i, P = CUTIN.JOIN) => CUTIN._lag(i, P);
CUTIN.parkedAt = (i, P = CUTIN.JOIN) => CUTIN._lag(i, P) + P.ENTER_DUR;
CUTIN.exitAt = (i, P = CUTIN.JOIN) => P.TOTAL - P.EXIT_DUR - CUTIN._lag(i, P);

// Entry velocity that covers `dist` in `dur` while decaying to `cruise`.
// Solved from the integral of cruise + (v0 - cruise)(1 - k)^3.
CUTIN._v0 = (dist, dur, cruise) => 4 * dist / dur - 3 * cruise;

// x offset from this layer's park position, in pixels, at scene time t.
CUTIN.offsetAt = (i, t, P = CUTIN.JOIN) => {
  const L = P.LAYERS[i];
  const vc = L.cruise, s = L.dir, D = L.travel;
  const t0 = CUTIN.enterAt(i, P), t1 = CUTIN.parkedAt(i, P), t2 = CUTIN.exitAt(i, P);
  const inD = P.ENTER_DUR, R = P.EXIT_DUR, E = D * P.EXIT_MULT;

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

// The special screen's move name: 48px chrome where it fits on two lines,
// 32px where 48 would need three (MAIN CHARACTER MOMENT). Press Start 2P is
// monospaced, every glyph exactly `size` wide, so fitting is a character
// count and needs no font. MOVE_W keeps the block clear of the friend.
CUTIN.MOVE_W = 560;
CUTIN._wrap = (str, max) => {
  const lines = [];
  let cur = "";
  for (const w of str.split(" ")) {
    const next = cur ? cur + " " + w : w;
    if (cur && next.length > max) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
};
CUTIN.fitMove = (str) => {
  const big = CUTIN._wrap(str, Math.floor(CUTIN.MOVE_W / 48));
  if (big.length <= 2) return { size: 48, lines: big };
  return { size: 32, lines: CUTIN._wrap(str, Math.floor(CUTIN.MOVE_W / 32)) };
};

// ---------- drawing ----------

CUTIN.Z = 200;          // the whole screen sits above everything on the field

// Which sprite draws layer i of this friend's screen. Real art when it
// exists, otherwise the shared placeholder hills, and for layer 0 a null,
// which means "draw the friend's own sprite". Until a friend's special art
// is wired, their old chibi cut-in (core/splash-real.js) stands in for them.
CUTIN.spriteFor = (id, i, kind = "join") => {
  const special = kind === "special";
  const real = special
    ? (typeof REAL_SPECIALS !== "undefined" ? REAL_SPECIALS : null)
    : (typeof REAL_CUTINS !== "undefined" ? REAL_CUTINS : null);
  if (real && real[id] && real[id][i]) return (special ? "special-" : "cutin-") + id + "-" + i;
  if (i > 0) return "cutin-ph-" + i;
  if (special && typeof REAL_SPLASH !== "undefined" && REAL_SPLASH[id]) return "splash-" + id;
  return null;
};

// Each screen's content, built from a character entry.
CUTIN.forJoin = (c) => ({
  kind: "join",
  id: c.id,
  name: c.name.toUpperCase(),
  headline: c.passive.name.toUpperCase(),
  stat: c.passive.desc.toUpperCase(),
  special: c.special.name.toUpperCase(),
  bubble: c.recruitLine,
});

CUTIN.forSpecial = (c) => ({
  kind: "special",
  id: c.id,
  name: c.name.toUpperCase(),
  move: c.special.name.toUpperCase(),
});

// A scrim under the type, the way a lower third works. Without it the
// chrome name vanishes on a light background: ANA disappeared into her
// own sun and ADAM was barely there against a floodlit fence. It has to
// fall off on ALL FOUR sides or it reads as a panel laid over the art
// (a first pass with a hard top and bottom edge did exactly that). So
// it is a coarse grid with a smooth 2D weight: strongest at the right
// edge behind the name, gone by a third of the way across and gone
// above and below the block. Drawn rather than a sprite so it costs
// nothing and stays in the kit's flat language.
CUTIN._scrim = (sy, sh, dx, op) => {
  const SC_X0 = 300, SC_MAX = 0.58;
  const nx = 24, ny = 10;
  const cw = (G.W - SC_X0) / nx, ch = sh / ny;
  for (let ix = 0; ix < nx; ix++) {
    const kx = (ix + 0.5) / nx;                    // 0 at the left, 1 at the right
    const wx = kx * kx;                            // hugs the right edge
    for (let iy = 0; iy < ny; iy++) {
      const ky = (iy + 0.5) / ny;
      const wy = Math.sin(Math.PI * ky);           // nothing at the top or bottom
      const w = wx * wy * SC_MAX * op;
      if (w < 0.004) continue;
      UI.R(SC_X0 + ix * cw + dx, sy + iy * ch, cw + 1, ch + 1, UI.INK, w);
    }
  }
};

// ----- the collection screen's type: bottom right, opposite the friend -----
// Everything hangs off the RIGHT margin, because the lines vary wildly in
// length: names run CAL to ANNIE, and the stat boosts run "+2 MAX HP" to
// "SMALL BOOST TO EVERYTHING". Right-aligned, a long one grows leftwards
// into empty sky instead of off the edge.
// In with the friend's landing, out with them, and creeping at 4px/s in
// between: slow enough to read, never actually still.
CUTIN._joinType = (opts, P, clock, alpha) => {
  const TYPE_IN = CUTIN.parkedAt(0, P), TYPE_OUT = CUTIN.exitAt(0, P);
  const RX = 928, TY = 250;      // right margin, and the top of the block

  const typeX = (t) => {
    if (t < TYPE_IN) return 520;                                   // off to the right
    if (t < TYPE_IN + 0.18) return 520 - 520 * UI.ease((t - TYPE_IN) / 0.18);
    if (t < TYPE_OUT) return (t - TYPE_IN - 0.18) * 4;             // the slow creep
    const u = (t - TYPE_OUT) / P.EXIT_DUR;
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
    const t = clock(), op = alpha();
    if (t < TYPE_IN) return;
    const r = RX + typeX(t);

    CUTIN._scrim(TY - 40, 320, typeX(t), op);

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
};

// ----- the special screen's type: who, then the move, big -----
// The friend's name small in silver, the move's name in the title's chrome
// under it (Ollie, 6 Oct), bottom right over the same scrim. Each row slides
// in from the right a beat after the one above as the friend lands, creeps
// like everything else, and leaves with them.
CUTIN._specialType = (opts, P, clock, alpha) => {
  const RX = 928, BOTTOM = 474, GAP = 8;
  const fit = CUTIN.fitMove(opts.move);
  const moveTop = BOTTOM - fit.lines.length * (fit.size + GAP) + GAP;
  const nameY = moveTop - 28;
  const IN = CUTIN.parkedAt(0, P), OUT = CUTIN.exitAt(0, P);

  const slideX = (t, d) => {
    const t0 = IN + d;
    if (t < t0) return 700;
    if (t < t0 + 0.12) return 700 * (1 - UI.ease((t - t0) / 0.12));
    const creep = (Math.min(t, OUT) - t0 - 0.12) * 6;
    if (t < OUT) return creep;
    const u = (t - OUT) / P.EXIT_DUR;
    return creep + 900 * u * u * u;
  };

  const type = add([fixed(), z(CUTIN.Z + 7), "cutin"]);
  type.onDraw(() => {
    const t = clock(), op = alpha();
    if (t < IN) return;
    CUTIN._scrim(nameY - 40, BOTTOM - nameY + 80, slideX(t, 0), op);
    UI.label(opts.name, RX + slideX(t, 0), nameY,
      { size: 16, color: UI.SILVER, anchor: "topright", opacity: op });
    fit.lines.forEach((line, k) => {
      const w = Math.ceil(UI.measure(line, UI.PX, fit.size).width);
      UI.chromeText(line, RX + slideX(t, 0.05 * (k + 1)) - w, moveTop + k * (fit.size + GAP), fit.size, op);
    });
  });
};

// ----- the bubble: the game's own sticky note, in screen space -----
// An invisible anchor rides the foreground layer's motion and the note
// hangs off it, so it travels with the friend in and out.
CUTIN._bubble = (opts, scene, P, clock) => {
  const bx = scene.bubble[0], by = scene.bubble[1];
  const mouth = add([pos(bx, by), fixed(), z(CUTIN.Z + 8), "cutin"]);
  mouth.onUpdate(() => { mouth.pos = vec2(bx + CUTIN.offsetAt(0, clock(), P), by); });
  wait(0.85, () => {
    if (!mouth.exists()) return;
    const c = G.char(opts.id);
    UI.speech(mouth, opts.bubble, c ? c.colors.top : UI.SILVER,
      { fixed: true, whilePaused: true, z: CUTIN.Z + 9, dur: P.TOTAL - 0.85, tag: "cutin" });
  });
};

CUTIN.play = (opts, onDone) => {
  const special = opts.kind === "special";
  const P = special ? CUTIN.SPECIAL : CUTIN.JOIN;
  const scenes = special ? SPECIAL_CUTINS : CUTINS;
  const scene = scenes[opts.id] || scenes.cal;
  let t = 0;
  const clock = () => t;

  G.paused = true;
  CUTIN.active = true;

  // the clock every part of the screen reads
  const root = add([fixed(), z(CUTIN.Z), "cutin", { t: 0 }]);
  root.onUpdate(() => { t += dt(); root.t = t; });

  // how strongly the whole screen is present: up fast, down at the end
  const alpha = () => {
    if (t < P.FADE_IN) return t / P.FADE_IN;
    const left = P.TOTAL - t;
    if (left < P.FADE_OUT) return Math.max(0, left / P.FADE_OUT);
    return 1;
  };

  // ----- the sky: a vertical two-stop field drawn as bands -----
  // For an indoor scene it is the room's wall instead.
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
      let x = L.x + L.sp * P.LINES * t;
      x = ((x % (G.W + 800)) + (G.W + 800)) % (G.W + 800) - 400;
      UI.R(x, L.y, L.w, 2, UI.SILVER, L.o * op);
    }
  });

  // ----- the four art layers, far one first so z order is front to back -----
  for (let i = 3; i >= 0; i--) {
    const px = scene.park[i][0], py = scene.park[i][1];
    const name = CUTIN.spriteFor(opts.id, i, opts.kind);
    // Real and placeholder layers are centred. A friend drawn through
    // charComps is anchored on their body centre instead, which sits a
    // little above the image centre, so their park y is tuned by eye. The
    // old chibi splash is drawn 512 tall, so it comes down to the real
    // figures' 360.
    let comps;
    if (!name) comps = ART.charComps(opts.id, 300);
    else if (name.startsWith("splash-")) comps = [sprite(name), anchor("center"), scale(360 / 512)];
    else comps = [sprite(name), anchor("center")];
    const layer = add([
      ...comps, pos(px, py), opacity(1), fixed(), z(CUTIN.Z + 2 + (3 - i)), "cutin",
    ]);
    layer.onUpdate(() => {
      layer.pos = vec2(px + CUTIN.offsetAt(i, t, P), py);
      layer.opacity = alpha();
    });
  }

  if (special) CUTIN._specialType(opts, P, clock, alpha);
  else CUTIN._joinType(opts, P, clock, alpha);
  if (opts.bubble) CUTIN._bubble(opts, scene, P, clock);

  wait(P.TOTAL, () => {
    destroyAll("cutin");
    CUTIN.active = false;
    G.paused = false;
    if (onDone) onDone();
  });
};
