// ============================================================
// UI: HUD, touch controls, and the visual-polish helpers.
//
// Design language: the Pixel Polaroids kit (Ollie, 17 Sep 2026,
// docs/design/2026-09-17-pixel-polaroids-ui-kit). The ephemera of
// the ten years redrawn in the game's own pixel language: paper
// cards with a 2px ink outline and notched corners, a lanyard card
// for the hearts and the meter, polaroids for the companions, a
// ticket stub for the song, a taped-down label for the room, sticky
// notes for speech, and bitmap type throughout (Press Start 2P for
// labels and headings, VT323 for notes and prompts). Everything is
// code-drawn; the two fonts travel embedded in core/fonts-real.js.
//
// The kit was drawn at 960 x 540, the game's own resolution, so the
// positions and sizes in here are the kit's own numbers.
// ============================================================

const UI = {};

// ---------- palette: the kit's hex values ----------
UI.INK = [9, 10, 16];              // #090a10  every outline and shadow
UI.TEXT = [26, 26, 26];            // #1a1a1a  type on paper
UI.PAPER = [244, 239, 228];        // #f4efe4  the lanyard card, the ticket, the stick
UI.PAPER_SHADE = [201, 194, 178];  // #c9c2b2  the 2px inset shadow on paper
UI.PAPER_DIM = [233, 228, 216];    // #e9e4d8  an empty polaroid, an empty heart
UI.CHIP = [232, 223, 200];         // #e8dfc8  prompt chips
UI.WHITE = [255, 255, 255];
UI.RED = [230, 57, 70];            // #e63946  hearts, the lanyard, the GO chip, the knob
UI.RED_DARK = [181, 42, 54];       // #b52a36
UI.PINK = [255, 154, 162];         // #ff9aa2  the heart's highlight
UI.NAVY = [27, 22, 54];            // #1b1636  the title card
UI.PALE = [201, 205, 217];         // #c9cdd9  the title card's rule and subtitle
UI.GREY = [154, 147, 132];         // #9a9384  an empty heart's outline
UI.SLOT = [58, 53, 48];            // #3a3530  an empty polaroid's photo
UI.SLOT_TEXT = [138, 132, 122];    // #8a847a
UI.PHOTO = [36, 20, 18];           // #241412  behind a portrait
UI.STICK_RING = [216, 207, 187];   // #d8cfbb  the joystick's inner ring
// The accent family is the title lettering's own chrome (Ollie, 18 Sep 2026:
// keep the UI within the silver and blue of the title, no yellow anywhere).
// The meter, the tape on the chosen polaroid, the number block, the stick,
// the SP button, the GO chip, the toast and the pause menu all draw from it.
UI.SILVER = [231, 236, 255];       // #e7ecff
UI.STEEL = [185, 196, 232];        // #b9c4e8
UI.BLUE = [138, 151, 201];         // #8a97c9
UI.BLUE_DEEP = [90, 106, 168];     // #5a6aa8
UI.ACCENT = UI.STEEL;
UI.GOLD = UI.ACCENT;               // older call sites (glows, sparks, hairlines) take the accent
// the chrome of the room's name on the title card, top band to bottom band
UI.CHROME = [[255, 255, 255], UI.STEEL, UI.BLUE_DEEP, UI.SILVER, UI.STEEL, UI.BLUE];

// ---------- type ----------
// Press Start 2P is an 8px grid: keep its sizes to multiples of 8 and it
// stays pixel-perfect (its atlas is rasterised at 8, see ART.init). VT323
// is rasterised at 16, so 16 and 32 are its clean sizes.
UI.PX = "pixel";
UI.VT = "vt";

// ---------- drawing primitives (used inside onDraw) ----------

UI.rgb = (c) => rgb(c[0], c[1], c[2]);

UI.R = (x, y, w, h, c, op = 1) => {
  if (w <= 0 || h <= 0) return;
  drawRect({ pos: vec2(x, y), width: w, height: h, color: UI.rgb(c), opacity: op });
};

UI.measure = (str, font, size, extra = {}) => formatText(Object.assign({ text: str, font, size }, extra));

// Paper card: a 2px ink outline whose corners are notched (the bars stop
// two pixels short and nothing is drawn in the corner), a flat fill, and a
// 2px inset shadow along the bottom and right (the kit's #c9c2b2).
// Options: fill, shade (null for none), highlight (a 2px light edge top and
// left, the lanyard card), opacity, center (p is the centre rather than the
// top-left), notch (false for square corners, the chips), drop (a hard ink
// drop shadow, in px).
UI.card = (p, w, h, o = {}) => {
  const op = o.opacity === undefined ? 1 : o.opacity;
  const fill = o.fill || UI.PAPER;
  const shade = o.shade === undefined ? UI.PAPER_SHADE : o.shade;
  const n = o.notch === false ? 0 : 2;
  const x = Math.round(o.center ? p.x - w / 2 : p.x);
  const y = Math.round(o.center ? p.y - h / 2 : p.y);
  if (o.drop) UI.R(x + o.drop, y + o.drop, w, h, UI.INK, op);
  UI.R(x + n, y, w - n * 2, 2, UI.INK, op);
  UI.R(x + n, y + h - 2, w - n * 2, 2, UI.INK, op);
  UI.R(x, y + n, 2, h - n * 2, UI.INK, op);
  UI.R(x + w - 2, y + n, 2, h - n * 2, UI.INK, op);
  UI.R(x + 2, y + 2, w - 4, h - 4, fill, op);
  if (o.highlight) {
    UI.R(x + 2, y + 2, w - 4, 2, o.highlight, op);
    UI.R(x + 2, y + 2, 2, h - 4, o.highlight, op);
  }
  if (shade) {
    UI.R(x + 2, y + h - 4, w - 4, 2, shade, op);
    UI.R(x + w - 4, y + 2, 2, h - 4, shade, op);
  }
};

// kept for older call sites: a plain paper card
UI.dPanel = (p, w, h) => UI.card(p, w, h);

// VT323 notes: plain type, anchored top-left unless told otherwise.
UI.text = (str, x, y, o = {}) => {
  drawText({
    text: str, font: o.font || UI.VT, size: o.size || 16,
    pos: vec2(x, y), anchor: o.anchor || "topleft", align: o.align, width: o.width,
    letterSpacing: o.letterSpacing, color: UI.rgb(o.color || UI.TEXT),
    opacity: o.opacity === undefined ? 1 : o.opacity,
  });
};

// Press Start 2P labels, with the kit's hard 2px ink shadow unless o.shadow is false.
UI.label = (str, x, y, o = {}) => {
  const base = Object.assign({ font: UI.PX, size: 8, color: UI.WHITE }, o);
  if (o.shadow !== false) {
    const d = o.shadowOff || 2;
    UI.text(str, x + d, y + d, Object.assign({}, base, { color: UI.INK }));
  }
  UI.text(str, x, y, base);
};

// The room's name in chrome: the kit's five-stop gradient, as horizontal
// bands shown through the letters (a stencil mask), over a 2px ink shadow.
UI.chromeText = (str, x, y, size, op = 1) => {
  const tw = Math.ceil(UI.measure(str, UI.PX, size).width);
  UI.text(str, x + 2, y + 2, { font: UI.PX, size, color: UI.INK, opacity: op });
  const stops = [0, 5, 7, 8, 10, 13, 16];
  drawMasked(() => {
    for (let i = 0; i < UI.CHROME.length; i++) {
      const a = stops[i] * size / 16, b = stops[i + 1] * size / 16;
      UI.R(x, y + a, tw, b - a, UI.CHROME[i], op);
    }
  }, () => {
    UI.text(str, x, y, { font: UI.PX, size, color: UI.WHITE });
  });
};

// A chip drawn on the spot: text on a small square-cornered card.
// Anchored top-left, or "topright" (x is the right edge) or "center".
UI.chip = (str, x, y, o = {}) => {
  const font = o.font || UI.VT, size = o.size || 16;
  const padX = o.padX === undefined ? 10 : o.padX, padY = o.padY === undefined ? 4 : o.padY;
  const w = Math.ceil(UI.measure(str, font, size).width) + padX * 2 + 4;
  const h = size + padY * 2 + 4;
  let cx = x, cy = y;
  if (o.anchor === "topright") cx = x - w;
  else if (o.anchor === "center") { cx = x - w / 2; cy = y - h / 2; }
  const op = o.opacity === undefined ? 1 : o.opacity;
  UI.card(vec2(cx, cy), w, h, {
    fill: o.fill || UI.CHIP, shade: o.shade === undefined ? null : o.shade, notch: false, opacity: op,
  });
  UI.text(str, cx + w / 2, cy + h / 2 + 1, { font, size, anchor: "center", color: o.color || UI.TEXT, opacity: op });
  return { w, h };
};

// ---------- entity builders (for scenes that fade and move things) ----------

// The chip as an entity centred on (x, y). root.set(str) reworks the text
// and the size; an empty string hides it. Children follow the root's
// opacity every frame, so UI.fadeObj and UI.slideIn work on the root.
UI.chipObj = (str, x, y, o = {}) => {
  const font = o.font || UI.VT, size = o.size || 16;
  const padX = o.padX === undefined ? 10 : o.padX, padY = o.padY === undefined ? 4 : o.padY;
  const comps = [pos(x, y), opacity(o.opacity === undefined ? 1 : o.opacity), z(o.z || 190), { w: 0, h: 0, label: str }];
  if (o.fixed !== false) comps.push(fixed());
  const root = add(comps);
  const txt = root.add([text(str, { font, size }), pos(0, 1), anchor("center"), color(UI.rgb(o.color || UI.TEXT)), opacity(1)]);
  root.set = (s) => {
    root.label = s;
    txt.text = s;
    root.w = Math.ceil(UI.measure(s, font, size).width) + padX * 2 + 4;
    root.h = size + padY * 2 + 4;
    if (o.area) {   // a tappable chip: its hit box follows the text
      if (root.c("area")) root.unuse("area");
      root.use(area({ shape: new Rect(vec2(-root.w / 2, -root.h / 2), root.w, root.h) }));
    }
  };
  root.set(str);
  root.onDraw(() => {
    if (root.label === "") return;
    UI.card(vec2(0, 0), root.w, root.h, {
      center: true, fill: o.fill || UI.CHIP, shade: o.shade === undefined ? null : o.shade, notch: false, opacity: root.opacity,
    });
  });
  root.onUpdate(() => { txt.opacity = root.opacity; txt.hidden = root.label === ""; });
  return root;
};

// A Press Start 2P heading as an entity, ink shadow and all.
UI.labelObj = (str, x, y, o = {}) => {
  const font = o.font || UI.PX, size = o.size || 16;
  const comps = [pos(x, y), opacity(o.opacity === undefined ? 1 : o.opacity), z(o.z || 190), { label: str }];
  if (o.fixed !== false) comps.push(fixed());
  const root = add(comps);
  const topt = { font, size, width: o.width, align: o.align, letterSpacing: o.letterSpacing };
  const anc = o.anchor || "topleft";
  const d = o.shadow === false ? 0 : (o.shadowOff || 2);
  const sh = d ? root.add([text(str, topt), pos(d, d), anchor(anc), color(UI.rgb(UI.INK)), opacity(1)]) : null;
  const tx = root.add([text(str, topt), pos(0, 0), anchor(anc), color(UI.rgb(o.color || UI.WHITE)), opacity(1)]);
  root.set = (s) => { root.label = s; tx.text = s; if (sh) sh.text = s; };
  root.onUpdate(() => { tx.opacity = root.opacity; if (sh) sh.opacity = root.opacity * 0.9; });
  return root;
};

// ---------- motion helpers ----------

// ease-out cubic, the house easing
UI.ease = (k) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);

// slide an object from -> to over dur seconds (with optional delay + fade).
// Stops driving the object once finished, so later animations can take over.
UI.slideIn = (obj, from, to, dur, delay = 0, fade = true) => {
  let t = -delay;
  let done = false;
  obj.pos = from.clone();
  if (fade && obj.opacity !== undefined) obj.opacity = 0;
  obj.onUpdate(() => {
    if (done) return;
    t += dt();
    if (t < 0) return;
    const e = UI.ease(t / dur);
    obj.pos = vec2(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e);
    if (fade && obj.opacity !== undefined) obj.opacity = e;
    if (t >= dur) done = true;
  });
};

UI.fadeObj = (obj, target, dur, delay = 0) => {
  let t = -delay;
  let done = false;
  obj.onUpdate(() => {
    if (done) return;
    t += dt();
    if (t < 0) return;
    obj.opacity = target * UI.ease(t / dur);
    if (t >= dur) done = true;
  });
};

// quick black fade-in at the start of every scene - makes cuts feel intentional.
// Every scene calls this, so it is also where a pause left behind by a scene
// change (a dev skip while the menu was up) gets cleared.
UI.sceneFade = () => {
  UI.pauseOpen = false;
  debug.paused = false;
  camScale(vec2(1));
  const f = add([rect(G.W, G.H), color(0, 0, 0), opacity(1), fixed(), z(255)]);
  f.onUpdate(() => {
    f.opacity -= dt() * 2.8;
    if (f.opacity <= 0) destroy(f);
  });
};

// soft filmic vignette over gameplay (under the HUD)
UI.vignette = (op = 0.5) => {
  add([
    sprite("vignette"), pos(0, 0),
    scale(G.W / 480, G.H / 270),
    opacity(op), fixed(), z(160),
  ]);
};

UI.dGlow = (p, size, col, op) => {
  drawSprite({ sprite: "glow", pos: p, anchor: "center", scale: size / 96, color: rgb(col[0], col[1], col[2]), opacity: op });
};

// ---------- tiny effect helpers ----------

// damage numbers and system feedback: pixel type with a one-pixel ink shadow
UI.floatText = (p, str, col, big = false) => {
  const size = big ? 16 : 8;
  const o = add([
    text(str, { size, font: UI.PX }),
    pos(p), anchor("center"),
    color(UI.rgb(UI.INK)),
    opacity(1),
    move(vec2(0, -1), 42),
    lifespan(1.2, { fade: 0.6 }),
    z(150), "fx",
  ]);
  const top = o.add([
    text(str, { size, font: UI.PX }),
    pos(-1, -1), anchor("center"),
    color(col[0], col[1], col[2]),
    opacity(1),
  ]);
  o.onUpdate(() => { top.opacity = o.opacity; });
};

// Speech: a sticky note that hangs above a character and FOLLOWS them as
// they move, with a little tail pointing down at the speaker. This is how
// all spoken dialogue is shown - floatText is for damage numbers and
// system feedback only, so speech is always clearly attributed. The
// `accent` argument (the speaker's colour) is kept for every existing call
// site; the kit's note is plain white, so it is not drawn.
UI._bubbles = [];

UI.speech = (ent, str, accent = [255, 255, 255]) => {
  if (!ent || !ent.exists()) return;
  // one bubble per character - a new line replaces the old one
  if (ent._bubble && ent._bubble.exists()) destroy(ent._bubble);
  UI._bubbles = UI._bubbles.filter((b) => b.exists());

  const wrapW = 230;
  const fmt = UI.measure(str, UI.VT, 16, { width: wrapW, align: "center" });
  const w = Math.ceil(fmt.width) + 28;
  const h = Math.ceil(fmt.height) + 17;
  const dur = 1.7 + Math.min(2, str.length * 0.035);

  // if a neighbour is already speaking, stack this note above theirs
  let lift = 0;
  for (const b of UI._bubbles) {
    if (!b.ent || !b.ent.exists()) continue;
    if (Math.abs(b.ent.pos.x - ent.pos.x) < 120 && Math.abs(b.ent.pos.y - ent.pos.y) < 90) {
      lift = Math.max(lift, b.lift + b.bh + 10);
    }
  }

  const root = add([pos(ent.pos), z(140), { t: 0, ent, bh: h, lift }]);
  ent._bubble = root;
  UI._bubbles.push(root);

  const note = root.add([pos(0, 0), opacity(0)]);
  note.onDraw(() => {
    const op = note.opacity;
    UI.card(vec2(0, 0), w, h, { center: true, fill: UI.WHITE, opacity: op });
    // the tail: a white diamond straddling the bottom edge, inked along
    // its two lower sides so the outline runs down into the point
    const ty = h / 2 + 1, d = 6.4;
    drawRect({ pos: vec2(0, ty), width: 9, height: 9, anchor: "center", angle: 45, color: UI.rgb(UI.WHITE), opacity: op });
    drawLines({ pts: [vec2(-d, ty), vec2(0, ty + d), vec2(d, ty)], width: 2, color: UI.rgb(UI.INK), opacity: op });
  });
  const txt = root.add([
    text(str, { size: 16, font: UI.VT, width: wrapW, align: "center" }),
    pos(0, 1), anchor("center"), color(UI.rgb(UI.TEXT)), opacity(0),
  ]);

  root.onUpdate(() => {
    const gone = !ent.exists();
    if (!gone) {
      root.pos = ent.pos.add(0, -50 - h / 2 - root.lift);
      // keep the note inside the map so it never clips off the edges
      if (G.mapBounds) {
        root.pos.x = G.clamp(root.pos.x, w / 2 + 10, Math.max(w / 2 + 10, G.mapBounds.x2 - w / 2 - 10));
        root.pos.y = Math.max(root.pos.y, h / 2 + 10);
      }
    }
    if (!G.paused) root.t += dt();
    if (gone) root.t = Math.max(root.t, dur - 0.25);

    let op;
    if (root.t < 0.15) op = root.t / 0.15;                                // fade in
    else if (root.t > dur - 0.3) op = Math.max(0, (dur - root.t) / 0.3);  // fade out
    else op = 1;

    note.opacity = op;
    txt.opacity = op;
    if (root.t >= dur) destroy(root);
  });
};

// red-tinged vignette pulse on damage; warm flash for specials
UI.flash = (col, dur) => {
  const f = add([
    sprite("vignette"), pos(0, 0),
    scale(G.W / 480, G.H / 270),
    color(col[0], col[1], col[2]),
    opacity(0.65), fixed(), z(180),
  ]);
  f.onUpdate(() => {
    f.opacity -= dt() * (0.65 / dur);
    if (f.opacity <= 0) destroy(f);
  });
};

UI.pop = (p, col, r) => {
  const o = add([circle(6), pos(p), color(col[0], col[1], col[2]), opacity(0.7), z(60)]);
  o.onUpdate(() => {
    o.radius += r * 5 * dt();
    o.opacity -= 3 * dt();
    if (o.opacity <= 0) destroy(o);
  });
};

UI.ring = (p, r) => {
  const o = add([circle(r * 0.4), pos(p), color(255, 240, 180), opacity(0.5), z(60)]);
  o.onUpdate(() => {
    o.radius += r * 3 * dt();
    o.opacity -= 2.2 * dt();
    if (o.opacity <= 0) destroy(o);
  });
};

// a chip that fades in at the bottom of the screen and out again
UI._bottomChip = (str, o) => {
  const chip = UI.chipObj(str, G.W / 2, G.H - 46, Object.assign({ opacity: 0, z: 190 }, o));
  UI.fadeObj(chip, 1, 0.18);
  wait(1.65, () => {
    chip.onUpdate(() => { chip.opacity -= dt() * 5; if (chip.opacity <= 0) destroy(chip); });
  });
  return chip;
};

// subtitles and narration: paper chips, one line after another
UI.subtitleSeq = (lines) => {
  lines.forEach((ln, i) => { wait(i * 2.0, () => UI._bottomChip(ln)); });
};

// system feedback (sound OFF, god mode ON): the kit's yellow chip
UI.toast = (str) => UI._bottomChip(str, { fill: UI.STEEL, shade: UI.BLUE, padY: 5 });

// The room's title card: a taped-down label, pixel polaroid style. A
// yellow number block, then the room's name in chrome over its subtitle
// (the chapter and the year) on navy, the whole thing sitting on a hard
// ink drop shadow. Slides in from the left, holds, fades.
UI.titleCard = ({ num, name, sub }) => {
  const x0 = 14, y0 = 112;
  const NAME = 16, SUB = 8, NUM = 24;
  const nameW = Math.ceil(UI.measure(name, UI.PX, NAME).width);
  const subW = Math.ceil(UI.measure(sub, UI.PX, SUB, { letterSpacing: 1 }).width);
  const numW = Math.ceil(UI.measure(num, UI.PX, NUM).width);
  const leftW = 2 + 12 + numW + 12;               // ink on the left only: the seam is the name block's outline
  const rightW = 4 + 14 + Math.max(nameW, subW) + 16 + 4;
  const h = 4 + 8 + NAME + 6 + SUB + 8 + 4;
  const w = leftW + rightW;

  const card = add([pos(x0, y0), opacity(0), fixed(), z(194)]);
  card.onDraw(() => {
    const op = card.opacity;
    UI.R(4, 4, w, h, UI.INK, op);                              // the drop shadow
    UI.R(0, 0, leftW, h, UI.INK, op);                          // number block, in the title's chrome
    UI.R(2, 2, leftW - 2, h - 4, UI.STEEL, op);
    UI.R(2, 2, leftW - 2, 3, UI.SILVER, op);
    UI.R(2, h - 5, leftW - 2, 3, UI.BLUE_DEEP, op);
    UI.label(num, 2 + 12, h / 2, { size: NUM, anchor: "left", color: UI.NAVY, shadow: false, opacity: op });
    const rx = leftW;                                          // name block: ink, pale rule, navy
    UI.R(rx, 0, rightW, h, UI.INK, op);
    UI.R(rx + 2, 2, rightW - 4, h - 4, UI.PALE, op);
    UI.R(rx + 4, 4, rightW - 8, h - 8, UI.NAVY, op);
    const tx = rx + 4 + 14, ty = 4 + 8;
    UI.chromeText(name, tx, ty, NAME, op);
    UI.label(sub, tx, ty + NAME + 6, { size: SUB, letterSpacing: 1, color: UI.PALE, shadow: false, opacity: op });
  });
  UI.slideIn(card, vec2(x0 - 46, y0), vec2(x0, y0), 0.5);
  wait(2.8, () => {
    card.onUpdate(() => {
      card.opacity -= dt() * 1.8;
      if (card.opacity <= 0) destroy(card);
    });
  });
};

// ---------- the room reveal ----------
// Every room opens pulled back, the whole venue on screen for a moment
// (Ollie, 18 Sep 2026: appreciate the level design and recognise the
// setting before it starts), then the camera pushes in to the player.
// The scene's camera code hands its normal follow position to apply()
// every frame and this decides what the camera actually does: parked on
// the room's centre at the pulled-back scale through the hold, then
// eased in to the follow position at full scale. Gameplay stays paused
// through the hold (opts.onPush releases it) and opts.onDone fires once
// the camera has landed, which is when the enemies come in.
UI.reveal = (mapW, mapH, opts = {}) => {
  const HOLD = opts.hold === undefined ? 1.5 : opts.hold;
  const PUSH = opts.push === undefined ? 0.8 : opts.push;
  const fit = Math.min(G.W / mapW, G.H / mapH);
  const start = Math.max(0.3, Math.min(1, fit) * 0.85);   // a little air round a room that already fits
  const centre = vec2(mapW / 2, mapH / 2);
  const r = { t: 0, active: true, pushed: false };
  r.apply = (follow) => {
    if (!r.active) { camPos(follow); return; }
    r.t += dt();
    if (r.t >= HOLD && !r.pushed) { r.pushed = true; if (opts.onPush) opts.onPush(); }
    const k = UI.ease(Math.max(0, (r.t - HOLD) / PUSH));
    camScale(vec2(start + (1 - start) * k));
    camPos(centre.lerp(follow, k));
    if (r.t >= HOLD + PUSH) {
      r.active = false;
      camScale(vec2(1));
      camPos(follow);
      if (opts.onDone) opts.onDone();
    }
  };
  return r;
};

// ---------- HUD ----------

// The companions' polaroids, top right. Screen positions from the kit.
UI.PORTRAIT = { x: 712, y: 8, w: 54, h: 64, gap: 58 };

// The lanyard card, top left: hearts and the special meter
UI.LANYARD = { x: 14, y: 14, w: 250, h: 76 };

UI.hud = () => {
  const hud = add([fixed(), z(170), pos(0, 0), {
    meterDisp: 0,
    lastSel: -1,
    selPop: 0,
    lastHp: null,
    hurtPulse: 0,
  }]);

  hud.onDraw(() => {
    if (!G.run) return;
    const s = G.stats();
    const r = G.run;

    // smooth values
    hud.meterDisp += (r.meter - hud.meterDisp) * Math.min(1, dt() * 9);
    if (hud.lastSel !== r.selected) { hud.lastSel = r.selected; hud.selPop = 1; }
    hud.selPop = Math.max(0, hud.selPop - dt() * 3.5);
    if (hud.lastHp === null) hud.lastHp = r.hp;
    if (r.hp < hud.lastHp) hud.hurtPulse = 1;
    hud.lastHp = r.hp;
    hud.hurtPulse = Math.max(0, hud.hurtPulse - dt() * 2.5);

    // ===== top-left: the lanyard card =====
    // Hearts are the kit's 16 x 13 pixel heart at 2x, two pixels apart.
    // The card is the kit's 250 wide unless the party's max HP needs more.
    const L = UI.LANYARD;
    const HEART_W = 32, HEART_H = 26, HEART_STEP = 34;
    const heartsW = s.maxHp * HEART_STEP - 2;
    const cw = Math.max(L.w, heartsW + 20);
    // the strap hangs in from the top edge and clips onto the card
    UI.R(132, 0, 14, 20, UI.BLUE_DEEP);
    UI.R(132, 0, 2, 20, UI.INK);
    UI.R(144, 0, 2, 20, UI.INK);
    UI.R(132, 18, 14, 2, UI.INK);
    UI.card(vec2(L.x, L.y), cw, L.h, { highlight: UI.WHITE });
    UI.R(126, 20, 26, 6, UI.INK);   // the clip's slot
    const ch = CHAPTERS[r.chapter - 1];
    UI.label(ch.lanyard || ch.title, 26, 22, { color: UI.BLUE_DEEP, shadow: false });

    // whose go it is, top right of the card; the GO chip once the meter is full
    const rightX = L.x + cw - 10;
    if (r.companions.length > 0) {
      const sel = G.char(r.companions[r.selected]);
      if (r.meter >= 1) {
        const go = isTouchscreen() ? "GO ON THEN · SP" : "GO ON THEN · SPACE";
        UI.chip(go, rightX, 16, {
          anchor: "topright", font: UI.PX, size: 8, padX: 6, padY: 3,
          fill: UI.BLUE_DEEP, color: UI.SILVER, opacity: 0.8 + Math.sin(time() * 5) * 0.2,
        });
      } else {
        UI.label(sel.name.toUpperCase() + "'S GO", rightX, 22, { anchor: "topright", color: UI.NAVY, shadow: false });
      }
    }

    const lowHp = r.hp <= 2;
    for (let i = 0; i < s.maxHp; i++) {
      const filled = i < r.hp;
      const hx = 24 + i * HEART_STEP + HEART_W / 2, hy = 36 + HEART_H / 2;
      let sc = 2;
      if (filled && lowHp) sc = 2 + Math.sin(time() * 7 + i) * 0.22;          // low-health pulse
      if (hud.hurtPulse > 0 && i === r.hp) sc = 2 + hud.hurtPulse * 0.8;       // the heart you just lost pops
      drawSprite({ sprite: filled ? "heart" : "heart-empty", pos: vec2(hx, hy), anchor: "center", scale: sc });
    }

    // the wristband meter: white track in a 2px ink border, filled with
    // 8px blocks a pixel apart, each in the title's chrome (silver over
    // steel over blue)
    const mx = 24, my = 68, mw = cw - 20, mh = 13;
    UI.R(mx - 2, my - 2, mw + 4, mh + 4, UI.INK);
    UI.R(mx, my, mw, mh, UI.WHITE);
    const fw = Math.round((mw - 2) * hud.meterDisp);
    for (let off = 0; off < fw; off += 9) {
      const bw = Math.min(8, fw - off), bx = mx + 1 + off;
      UI.R(bx, my + 1, bw, 3, UI.SILVER);
      UI.R(bx, my + 4, bw, 4, UI.STEEL);
      UI.R(bx, my + 8, bw, 4, UI.BLUE_DEEP);
    }
    if (r.shield > 0) {
      UI.label("cosy shield " + r.shield.toFixed(1) + "s", 26, L.y + L.h + 6, { color: [140, 185, 235] });
    }

    // ===== top-right: the companions' polaroids =====
    const P = UI.PORTRAIT;
    for (let i = 0; i < 4; i++) {
      const x = P.x + i * P.gap, y = P.y;
      const has = i < r.companions.length;
      const isSel = has && i === r.selected;
      const px = x + 5, py = y + 5, pw = 44, ph = 38;   // the photo
      if (has) {
        UI.card(vec2(x, y), P.w, P.h, { fill: UI.WHITE });
        UI.R(px, py, pw, ph, UI.INK);
        UI.R(px + 1, py + 1, pw - 2, ph - 2, UI.PHOTO);
        const c = G.char(r.companions[i]);
        const reg = G.SPR["ch-" + c.id];
        const popSc = isSel ? 1 + hud.selPop * 0.18 : 1;
        // the figure stands 32px tall on the photo's bottom edge, clipped to
        // the photo (a sheet's cell is padded past the body)
        drawMasked(() => {
          drawSprite({
            sprite: reg.name, frame: 0,
            pos: vec2(px + pw / 2, py + ph - 2 - 16 * popSc),
            anchor: "center",
            scale: (32 / reg.h) * popSc,
          });
        }, () => {
          UI.R(px + 1, py + 1, pw - 2, ph - 2, UI.WHITE);
        });
        UI.text(c.name.toLowerCase(), x + P.w / 2, py + ph + 2, { anchor: "top" });
        if (isSel) {
          // a strip of silver tape holds the chosen one down
          UI.R(x + 16, y - 6, 26, 10, UI.INK);
          UI.R(x + 18, y - 4, 22, 6, UI.STEEL);
        }
      } else {
        UI.card(vec2(x, y), P.w, P.h, { fill: UI.PAPER_DIM, shade: null, opacity: 0.6 });
        UI.R(px, py, pw, ph, UI.SLOT, 0.6);
        UI.label(String(i + 1), px + pw / 2, py + ph / 2, { anchor: "center", color: UI.SLOT_TEXT, shadow: false, opacity: 0.6 });
      }
    }

    // ===== the ticket: announces each new song =====
    // Timer and token both live on SOUNDTRACK, not this hud object: hud
    // is rebuilt fresh on every scene change, but SOUNDTRACK persists, so
    // a track that legitimately CONTINUES across an area boundary (play()
    // correctly no-ops when asked to start the track already playing)
    // does not get its reveal timer reset by the mere fact of a new area
    // loading. Reset is keyed off SOUNDTRACK.token rather than the audio
    // element's currentTime, so a looping track does not re-trigger the
    // reveal and a paused tab does not drift.
    if (typeof SOUNDTRACK !== "undefined" && SOUNDTRACK.current) {
      if (SOUNDTRACK.hudToken !== SOUNDTRACK.token) {
        SOUNDTRACK.hudToken = SOUNDTRACK.token;
        SOUNDTRACK.hudT = 0;
      }
      SOUNDTRACK.hudT += dt();

      const T = SOUNDTRACK.hudT;
      const REVEAL = SOUNDTRACK.REVEAL_AT;   // 10s
      const OUT_AT = REVEAL + 4;             // linger 4s on the title
      const IN_DUR = 0.45, OUT_DUR = 0.5;

      if (T < OUT_AT + OUT_DUR) {
        const inK = UI.ease(Math.min(1, T / IN_DUR));
        const outK = UI.ease(Math.max(0, Math.min(1, (T - OUT_AT) / OUT_DUR)));
        // slides in from off the right edge, and back out the same way
        const slide = (1 - inK) * 110 + outK * 110;
        const alpha = Math.min(inK, 1 - outK);

        // "???" until the reveal, then the title, with a little jump
        const revealed = T >= REVEAL;
        const pop = revealed ? Math.max(0, 1 - (T - REVEAL) / 0.35) : 0;
        const title = revealed ? SOUNDTRACK.current.title : "???";
        const tw = Math.ceil(UI.measure(title, UI.VT, 16).width);
        const w = 4 + 10 + 8 + 6 + tw + 10, h = 30;
        const x = G.W - 14 - w + slide, y = 92 - Math.round(pop * 4);
        // a ticket stub: paper in ink, perforated down its left edge
        UI.R(x, y, w, h, UI.INK, alpha);
        UI.R(x + 2, y + 2, w - 4, h - 4, UI.PAPER, alpha);
        for (let dy = 5; dy < h - 4; dy += 6) UI.R(x, y + dy, 2, 3, UI.PAPER, alpha);
        UI.label("♪", x + 12, y + 11, { color: UI.TEXT, shadow: false, opacity: alpha });
        UI.text(title, x + 26, y + 8, { color: revealed ? UI.TEXT : UI.GREY, opacity: alpha });
        // and the record itself, spinning beside it
        drawSprite({
          sprite: "record", pos: vec2(x - 17, y + h / 2), anchor: "center",
          angle: time() * 150, width: 26, height: 26, opacity: alpha,
        });
      }
    }

    // ===== mobile special button =====
    if (isTouchscreen()) {
      const bp = vec2(G.W - 72, G.H - 72);
      const ready = r.meter >= 1;
      const op = ready ? 0.85 + Math.sin(time() * 5) * 0.15 : 0.35;
      drawCircle({ pos: bp, radius: 46, color: UI.rgb(UI.WHITE), opacity: op });
      drawCircle({ pos: bp, radius: 45, fill: false, outline: { width: 2, color: UI.rgb(UI.INK) }, opacity: op });
      drawCircle({ pos: bp, radius: 41.5, fill: false, outline: { width: 5, color: UI.rgb(UI.BLUE_DEEP) }, opacity: op });
      UI.label("SP", bp.x, bp.y + 1, { size: 16, anchor: "center", color: UI.NAVY, shadow: false, opacity: op });
    }

    // ===== desktop crosshair: ring + dot =====
    if (!isTouchscreen()) {
      const m = mousePos();
      drawCircle({ pos: m, radius: 7, fill: false, outline: { width: 1.5, color: rgb(255, 255, 255) }, opacity: 0.75 });
      drawCircle({ pos: m, radius: 1.6, color: rgb(255, 255, 255), opacity: 0.9 });
    }
  });

  return hud;
};

// ---------- input wiring (called once per gameplay scene) ----------

UI.wireControls = () => {
  onKeyPress("space", () => COMPANIONS.trySpecial());

  for (let i = 1; i <= 4; i++) {
    onKeyPress(String(i), () => {
      if (G.run && G.run.companions.length >= i) G.run.selected = i - 1;
    });
  }
  const cycle = (d) => {
    if (!G.run || G.run.companions.length === 0) return;
    G.run.selected = (G.run.selected + d + G.run.companions.length) % G.run.companions.length;
  };
  onKeyPress("q", () => cycle(-1));
  onKeyPress("e", () => cycle(1));

  // taps: companion polaroids + mobile special button
  onMousePress(() => {
    if (!G.run || UI.pauseOpen) return;
    const m = mousePos();
    const P = UI.PORTRAIT;
    for (let i = 0; i < G.run.companions.length; i++) {
      const x = P.x + i * P.gap;
      if (m.x >= x && m.x <= x + P.w && m.y >= P.y - 6 && m.y <= P.y + P.h) {
        G.run.selected = i;
        return;
      }
    }
    if (isTouchscreen() && m.dist(vec2(G.W - 72, G.H - 72)) < 52) {
      COMPANIONS.trySpecial();
    }
  });

  // sound on/off, remembered between visits. The music is a plain audio
  // element outside the Web Audio graph, so it needs muting separately.
  onKeyPress("n", () => {
    const on = SFX.toggle();
    SOUNDTRACK.syncMute();
    UI.toast(on ? "sound ON" : "sound OFF");
    if (on) SFX.play("uiconfirm");
  });

  // ----- dev / testing cheats (see README) -----
  onKeyPress("k", () => { get("enemy").forEach((e) => ENEMIES.hit(e, 999, 0)); get("boss").forEach((b) => ENEMIES.hit(b, 999, 0)); });
  onKeyPress("h", () => { if (G.run) G.run.hp = G.stats().maxHp; });
  onKeyPress("m", () => { if (G.run) G.run.meter = 1; });
  onKeyPress("g", () => { G.godMode = !G.godMode; UI.toast(G.godMode ? "god mode ON" : "god mode OFF"); });
  onKeyPress("]", () => { if (G.devSkip) G.devSkip(); });
};

// ---------- pause menu ----------
// ESC, P, or the PAUSE chip at the top of the screen. Freezes the whole
// game with Kaboom's own debug.paused: updates and timers stop, drawing
// and input carry on, so the menu draws itself in onDraw and nothing
// else moves while it is up. G.paused is raised too, so the gameplay
// keys underneath (space for the special) do nothing. Installed once per
// gameplay scene; its objects die with the scene.
UI.pauseOpen = false;
UI.PAUSE_BTN = { x: G.W / 2 - 30, y: 8, w: 60, h: 20 };
UI.inPauseBtn = (p) => {
  const b = UI.PAUSE_BTN;
  return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
};

UI.pause = () => {
  const ITEMS = ["carry on", "sound", "back to the title"];
  const W = 360, ROW_W = 260, ROW_H = 28, ROW_GAP = 10, LINE = 18;
  const help = isTouchscreen()
    ? ["drag on the left to move, aim is automatic", "tap SP for the special, tap a polaroid to swap"]
    : ["WASD or arrows move, the mouse aims", "SPACE special, 1 to 4 or Q / E swap, N sound"];
  const H = 20 + 16 + 22 + ITEMS.length * ROW_H + (ITEMS.length - 1) * ROW_GAP + 22 + help.length * LINE + 18;
  const x0 = G.W / 2 - W / 2, y0 = Math.round(G.H / 2 - H / 2);
  const rowsY = y0 + 20 + 16 + 22;
  const rowRect = (i) => ({ x: G.W / 2 - ROW_W / 2, y: rowsY + i * (ROW_H + ROW_GAP), w: ROW_W, h: ROW_H });
  const hit = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const label = (i) => (i === 1 ? "sound: " + (SFX.muted ? "off" : "on") : ITEMS[i]);

  let sel = 0;
  let wasPaused = false;   // a cutscene may already have G.paused up

  const open = () => {
    if (UI.pauseOpen) return;
    UI.pauseOpen = true;
    wasPaused = G.paused;
    G.paused = true;
    debug.paused = true;
    sel = 0;
    SFX.play("uitick");
  };
  const close = () => {
    if (!UI.pauseOpen) return;
    UI.pauseOpen = false;
    G.paused = wasPaused;
    debug.paused = false;
    SFX.play("uiconfirm");
  };
  const activate = () => {
    if (sel === 0) {
      close();
    } else if (sel === 1) {
      SFX.toggle();
      SOUNDTRACK.syncMute();
      SFX.play("uitick");
    } else {
      // the run was checkpointed at this room's door, so the title offers to carry on
      UI.pauseOpen = false;
      G.paused = false;
      debug.paused = false;
      SFX.play("uiconfirm");
      if (typeof SOUNDTRACK !== "undefined") SOUNDTRACK.stop();
      go("title");
    }
  };
  const move = (d) => { sel = (sel + d + ITEMS.length) % ITEMS.length; SFX.play("uitick"); };
  const toggle = () => (UI.pauseOpen ? close() : open());

  const menu = add([fixed(), z(230), pos(0, 0)]);
  menu.onDraw(() => {
    const b = UI.PAUSE_BTN;
    if (!UI.pauseOpen) {
      UI.card(vec2(b.x, b.y), b.w, b.h, { fill: UI.CHIP, shade: null, notch: false, opacity: 0.85 });
      UI.label("PAUSE", b.x + b.w / 2, b.y + b.h / 2 + 1, { anchor: "center", color: UI.TEXT, shadow: false, opacity: 0.85 });
      return;
    }
    UI.R(0, 0, G.W, G.H, UI.INK, 0.6);
    UI.card(vec2(x0, y0), W, H, { drop: 4 });
    UI.label("PAUSED", G.W / 2, y0 + 20, { size: 16, anchor: "top", color: UI.TEXT, shadow: false });
    ITEMS.forEach((_, i) => {
      const r = rowRect(i), on = i === sel;
      UI.card(vec2(r.x, r.y), r.w, r.h, {
        fill: on ? UI.STEEL : UI.CHIP, shade: on ? UI.BLUE : null, notch: false,
      });
      UI.text(label(i), r.x + r.w / 2, r.y + r.h / 2 + 1, { anchor: "center" });
    });
    const fy = y0 + H - 18 - help.length * LINE;
    help.forEach((ln, i) => {
      UI.text(ln, G.W / 2, fy + i * LINE + LINE / 2, { anchor: "center", color: UI.TEXT, opacity: 0.6 });
    });
  });

  onKeyPress("escape", toggle);
  onKeyPress("p", toggle);
  for (const k of ["up", "w"]) onKeyPress(k, () => { if (UI.pauseOpen) move(-1); });
  for (const k of ["down", "s"]) onKeyPress(k, () => { if (UI.pauseOpen) move(1); });
  for (const k of ["enter", "space"]) onKeyPress(k, () => { if (UI.pauseOpen) activate(); });
  onMouseMove(() => {
    if (!UI.pauseOpen) return;
    const m = mousePos();
    ITEMS.forEach((_, i) => { if (hit(m, rowRect(i))) sel = i; });
  });
  onMousePress(() => {
    const m = mousePos();
    if (!UI.pauseOpen) { if (UI.inPauseBtn(m)) open(); return; }
    ITEMS.forEach((_, i) => { if (hit(m, rowRect(i))) { sel = i; activate(); } });
  });
};

// ---------- mobile virtual joystick ----------

// The stick lives bottom left, mirroring the SP button (Ollie, 18 Sep 2026).
UI.STICK = { x: 72, y: G.H - 72, r: 54 };

UI.mobileControls = () => {
  if (!isTouchscreen()) return;

  let stickId = null;
  let anchorPos = null;
  // A touch anywhere on the left half drives the stick: starting on the
  // stick itself steers from its centre, starting elsewhere steers from
  // where the finger landed, and either way the knob shows the direction.
  // Silver and blue like the rest of the accent; drawn as one entity so
  // the translucency never stacks where the rings meet.
  const S = UI.STICK;
  const base = add([pos(S.x, S.y), opacity(0.7), fixed(), z(185)]);
  base.onDraw(() => {
    const op = base.opacity;
    drawCircle({ pos: vec2(0, 0), radius: 45, color: UI.rgb(UI.SILVER), opacity: op });
    drawCircle({ pos: vec2(0, 0), radius: 49.5, fill: false, outline: { width: 5, color: UI.rgb(UI.STEEL) }, opacity: op });
    drawCircle({ pos: vec2(0, 0), radius: 46, fill: false, outline: { width: 2, color: UI.rgb(UI.BLUE_DEEP) }, opacity: op });
    drawCircle({ pos: vec2(0, 0), radius: 53, fill: false, outline: { width: 2, color: UI.rgb(UI.INK) }, opacity: op + 0.2 });
    const k = G.joy.scale(S.r);
    drawCircle({ pos: k, radius: 21, color: UI.rgb(UI.BLUE), opacity: op + 0.2 });
    drawCircle({ pos: k, radius: 22.5, fill: false, outline: { width: 3, color: UI.rgb(UI.BLUE_DEEP) }, opacity: op + 0.2 });
    drawCircle({ pos: k, radius: 25, fill: false, outline: { width: 2, color: UI.rgb(UI.INK) }, opacity: op + 0.2 });
  });

  onTouchStart((p, t) => {
    if (p.x < G.W * 0.5 && stickId === null && !UI.inPauseBtn(p)) {
      stickId = t ? t.identifier : 0;
      anchorPos = p.dist(vec2(S.x, S.y)) < S.r + 24 ? vec2(S.x, S.y) : p;
      base.opacity = 0.9;
    }
  });
  onTouchMove((p, t) => {
    if (stickId === null || (t && t.identifier !== stickId)) return;
    let d = p.sub(anchorPos);
    if (d.len() > S.r) d = d.unit().scale(S.r);
    G.joy = d.scale(1 / S.r);
  });
  onTouchEnd((p, t) => {
    if (stickId === null || (t && t.identifier !== stickId)) return;
    G.joy = vec2(0, 0);
    stickId = null;
    base.opacity = 0.7;
  });
};
