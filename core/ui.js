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
// The tape on the chosen polaroid, the number block, the stick, the toast
// and the pause menu all draw from it.
UI.SILVER = [231, 236, 255];       // #e7ecff
UI.STEEL = [185, 196, 232];        // #b9c4e8
UI.BLUE = [138, 151, 201];         // #8a97c9
UI.BLUE_DEEP = [90, 106, 168];     // #5a6aa8
UI.ACCENT = UI.STEEL;
UI.GOLD = UI.ACCENT;               // older call sites (glows, sparks, hairlines) take the accent
// the chrome of the room's name on the title card, top band to bottom band
UI.CHROME = [[255, 255, 255], UI.STEEL, UI.BLUE_DEEP, UI.SILVER, UI.STEEL, UI.BLUE];

// The special attack screens, and the meter, GO chip and SP button that
// lead to one, are where yellow comes back (Ollie, 7 Oct): a gold version
// of the same chrome, banded the same way so the gloss reads identically,
// with a yellow and a cream to go with it. Everything else in the UI stays
// silver and blue.
UI.SPECIAL_YELLOW = [255, 214, 64];
UI.SPECIAL_CREAM = [255, 243, 204];
UI.SPECIAL_CHROME = [[255, 253, 232], [255, 222, 89], [190, 112, 16], [255, 244, 170], [255, 200, 46], [212, 136, 22]];

// The voice in the cracks (core/crackvoice.js), and Busy You in the finale,
// who it was all along: a dark note with a purple cast and lilac words, the
// purple a boss room's crack glows (Ollie, 13 Oct 2026).
UI.VOICE_FILL = [24, 14, 38];
UI.VOICE_RULE = [70, 40, 104];
UI.VOICE_TEXT = [226, 210, 255];
UI.VOICE_GLOW = [200, 110, 240];

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
    letterSpacing: o.letterSpacing, lineSpacing: o.lineSpacing, color: UI.rgb(o.color || UI.TEXT),
    opacity: o.opacity === undefined ? 1 : o.opacity,
  });
};

// Press Start 2P labels, with the kit's hard 2px ink shadow unless o.shadow is false.
// o.outline (px) also rings the letters in ink, for type over busy art.
UI.label = (str, x, y, o = {}) => {
  const base = Object.assign({ font: UI.PX, size: 8, color: UI.WHITE }, o);
  if (o.outline) {
    const d = o.outline, ink = Object.assign({}, base, { color: UI.INK });
    for (const [ox, oy] of [[-d, -d], [0, -d], [d, -d], [-d, 0], [d, 0], [-d, d], [0, d], [d, d]]) {
      UI.text(str, x + ox, y + oy, ink);
    }
  }
  if (o.shadow !== false) {
    const d = o.shadowOff || 2;
    UI.text(str, x + d, y + d, Object.assign({}, base, { color: UI.INK }));
  }
  UI.text(str, x, y, base);
};

// The room's name in chrome: the kit's five-stop gradient, as horizontal
// bands shown through the letters (a stencil mask), over a 2px ink shadow.
// `bands` swaps the palette (the special screens pass UI.SPECIAL_CHROME).
UI.chromeText = (str, x, y, size, op = 1, bands = UI.CHROME, ring = 0) => {
  const tw = Math.ceil(UI.measure(str, UI.PX, size).width);
  // `ring` px of ink all round the letters, for chrome on pale paper (the cards)
  if (ring) for (const [ox, oy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) {
    UI.text(str, x + ox * ring, y + oy * ring, { font: UI.PX, size, color: UI.INK, opacity: op });
  }
  UI.text(str, x + 2, y + 2, { font: UI.PX, size, color: UI.INK, opacity: op });
  const stops = [0, 5, 7, 8, 10, 13, 16];
  drawMasked(() => {
    for (let i = 0; i < bands.length; i++) {
      const a = stops[i] * size / 16, b = stops[i + 1] * size / 16;
      UI.R(x, y + a, tw, b - a, bands[i], op);
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
    fill: o.fill || UI.CHIP, shade: o.shade === undefined ? null : o.shade,
    highlight: o.highlight, notch: false, opacity: op,
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
  // A chip made before its font has finished loading measures its text as
  // nothing wide, and the box came up tiny round the full-size words (the
  // title's prompt, now and then on a fresh load). Measure again until the
  // text has a real width, then stop.
  let sized = root.label === "" || root.w > padX * 2 + 4;
  root.onUpdate(() => {
    txt.opacity = root.opacity; txt.hidden = root.label === "";
    if (!sized && Math.ceil(UI.measure(root.label, font, size).width) > 0) { root.set(root.label); sized = true; }
  });
  const set = root.set;
  root.set = (s) => { set(s); sized = s === "" || root.w > padX * 2 + 4; };
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

// o (optional): { fixed } puts the note in screen space and skips the map
// clamp, for a note inside a collection screen; { z } overrides the layer;
// { dur } overrides how long it stays up; { tag } tags it for teardown;
// { whilePaused } keeps its clock running while G.paused is true;
// { dark } is the voice in the cracks' note (Busy You speaks in it).
UI.speech = (ent, str, accent = [255, 255, 255], o = {}) => {
  if (!ent || !ent.exists()) return;
  // one bubble per character - a new line replaces the old one
  if (ent._bubble && ent._bubble.exists()) destroy(ent._bubble);
  UI._bubbles = UI._bubbles.filter((b) => b.exists());

  const wrapW = 230;
  const fmt = UI.measure(str, UI.VT, 16, { width: wrapW, align: "center" });
  const w = Math.ceil(fmt.width) + 28;
  const h = Math.ceil(fmt.height) + 17;
  const dur = o.dur || (1.7 + Math.min(2, str.length * 0.035));

  // if a neighbour is already speaking, stack this note above theirs
  let lift = 0;
  for (const b of UI._bubbles) {
    if (!b.ent || !b.ent.exists()) continue;
    if (Math.abs(b.ent.pos.x - ent.pos.x) < 120 && Math.abs(b.ent.pos.y - ent.pos.y) < 90) {
      lift = Math.max(lift, b.lift + b.bh + 10);
    }
  }

  const rootComps = [pos(ent.pos), z(o.z || 140), { t: 0, ent, bh: h, lift }];
  if (o.fixed) rootComps.push(fixed());
  if (o.tag) rootComps.push(o.tag);
  const root = add(rootComps);
  ent._bubble = root;
  UI._bubbles.push(root);

  const note = root.add([pos(0, 0), opacity(0)]);
  const fill = o.dark ? UI.VOICE_FILL : UI.WHITE;
  note.onDraw(() => {
    const op = note.opacity;
    UI.card(vec2(0, 0), w, h, o.dark
      ? { center: true, fill, shade: UI.VOICE_RULE, drop: 3, opacity: op }
      : { center: true, fill, opacity: op });
    // the tail: a white diamond straddling the bottom edge, inked along
    // its two lower sides so the outline runs down into the point
    const ty = h / 2 + 1, d = 6.4;
    drawRect({ pos: vec2(0, ty), width: 9, height: 9, anchor: "center", angle: 45, color: UI.rgb(fill), opacity: op });
    drawLines({ pts: [vec2(-d, ty), vec2(0, ty + d), vec2(d, ty)], width: 2, color: UI.rgb(UI.INK), opacity: op });
  });
  const txt = root.add([
    text(str, { size: 16, font: UI.VT, width: wrapW, align: "center" }),
    pos(0, 1), anchor("center"), color(UI.rgb(o.dark ? UI.VOICE_TEXT : UI.TEXT)), opacity(0),
  ]);

  root.onUpdate(() => {
    const gone = !ent.exists();
    if (!gone) {
      // a big speaker (the finale's boss, the pile) says how far up its head is
      root.pos = ent.pos.add(0, -(ent.speechLift || 50) - h / 2 - root.lift);
      // keep the note inside the map so it never clips off the edges
      if (G.mapBounds && !o.fixed) {
        root.pos.x = G.clamp(root.pos.x, w / 2 + 10, Math.max(w / 2 + 10, G.mapBounds.x2 - w / 2 - 10));
        root.pos.y = Math.max(root.pos.y, h / 2 + 10);
      }
      // in a story beat the black bars cover the top and bottom of the view
      // (core/crackvoice.js): a caged friend's bubble went under them
      if (G.cutscene && !o.fixed && typeof CRACKVOICE !== "undefined") {
        root.pos.y = CRACKVOICE.betweenBars(root.pos.y, h / 2, camPos().y, camScale().y || 1, G.H);
      }
    }
    // A collection screen raises G.paused while it plays, so its own note
    // has to keep running or it never fades up. Field bubbles still freeze
    // behind the pause menu.
    // The finale's cutscenes pause play but speak, so their notes run too.
    if (!G.paused || o.whilePaused || G.cutscene) root.t += dt();
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

// The wave card: a taped-down label, pixel polaroid style, top left under
// the lanyard. A chrome number block, then the name in chrome over its
// subtitle on navy, the whole thing sitting on a hard ink drop shadow.
// Slides in from the left, holds, fades. It carried the room's name until
// 12 Oct 2026, when the room's name went big and central (UI.bigTitle) and
// the waves took this spot (Ollie).
UI.titleCard = ({ num, name, sub = "", hold = 3.6 }) => {
  const x0 = 14, y0 = 112;
  const NAME = 16, SUB = sub ? 8 : 0, NUM = 24;   // no sub: the card closes up round the name
  const nameW = Math.ceil(UI.measure(name, UI.PX, NAME).width);
  const subW = Math.ceil(UI.measure(sub, UI.PX, SUB, { letterSpacing: 1 }).width);
  const numW = Math.ceil(UI.measure(num, UI.PX, NUM).width);
  const leftW = 2 + 12 + numW + 12;               // ink on the left only: the seam is the name block's outline
  const rightW = 4 + 14 + Math.max(nameW, subW) + 16 + 4;
  const h = 4 + 8 + NAME + (sub ? 6 + SUB : 0) + 8 + 4;
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
    if (sub) UI.label(sub, tx, ty + NAME + 6, { size: SUB, letterSpacing: 1, color: UI.PALE, shadow: false, opacity: op });
  });
  UI.slideIn(card, vec2(x0 - 46, y0), vec2(x0, y0), 0.5);
  wait(hold, () => {
    card.onUpdate(() => {
      card.opacity -= dt() * 1.8;
      if (card.opacity <= 0) destroy(card);
    });
  });
};

// The room's name, big and central, once the camera has pushed in (Ollie,
// 12 Oct 2026). It rushes in from the right, brakes to a crawl through the
// middle where it reads, and kicks off the left, with speed lines streaking
// past. No box behind it (Ollie, 12 Oct: cleaner without): an ink ring, a
// deep hard drop shadow and a soft dark pool lift it off the room instead.
// The lines are spawned in proportion to how fast the name is moving, so
// they pour in on the entry and the exit and thin to a trickle while it
// reads. Position is a function of time: a steady DRIFT through the middle,
// plus an entry that decays as (1-k)^POW over IN seconds and an exit that
// grows as k^POW over OUT, so the speed is continuous and the ends are a
// blur. Ollie, 12 Oct: rush in and out faster, the middle as it was.
// Returns its length in seconds, so the scene can time what follows.
UI.bigTitle = ({ num, name, sub }) => {
  const IN = 0.2, MID = 2.0, OUT = 0.2;   // the rush in, the read (Ollie: a bit longer, 12 Oct), the rush out
  const DUR = IN + MID + OUT;
  const DRIFT = 12;          // px/s through the middle: it all but stops there to be read (Ollie, 13 Oct: was 90, moved too much)
  const POW = 3;             // how hard it brakes in and kicks out
  const cx = G.W / 2, cy = Math.round(G.H * 0.42);
  // Press Start 2P is an 8px grid, so any multiple of 8 stays crisp: as big
  // as fits, up to 48
  const w8 = UI.measure(name, UI.PX, 8).width;
  const SIZE = Math.max(16, Math.min(48, Math.floor(880 * 8 / w8 / 8) * 8));
  const nameW = Math.ceil(UI.measure(name, UI.PX, SIZE).width);
  const SUB = 16;
  const numW = Math.ceil(UI.measure(num, UI.PX, SUB).width) + 16;
  const subW = Math.ceil(UI.measure(sub, UI.PX, SUB).width);
  const rowW = numW + 12 + subW, rowH = SUB + 10;
  const groupW = Math.max(nameW, rowW);
  const rowY = cy - SIZE / 2 - 14 - rowH;
  const bandY = rowY - 16, bandH = (cy + SIZE / 2 + 4 + 16) - bandY;   // the lane the lines pour along
  const DROP = SIZE / 8;     // the hard shadow's offset: 6px at 48
  const RING = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  const ink = (str, x, y, size, d, op = 1) => {
    for (const [ox, oy] of RING) UI.text(str, x + ox * d, y + oy * d, { font: UI.PX, size, color: UI.INK, opacity: op });
  };
  // the rush: whatever the drift leaves of the way from just off screen
  const A = G.W / 2 + groupW / 2 + 40 - DRIFT * DUR / 2;
  const kIn = (t) => Math.max(0, 1 - t / IN), kOut = (t) => Math.max(0, (t - (DUR - OUT)) / OUT);
  const xAt = (t) => cx - DRIFT * (t - DUR / 2) + A * Math.pow(kIn(t), POW) - A * Math.pow(kOut(t), POW);
  const speedAt = (t) => DRIFT + (POW * A / IN) * Math.pow(kIn(t), POW - 1) + (POW * A / OUT) * Math.pow(kOut(t), POW - 1);
  const LINES = [UI.WHITE, UI.SILVER, UI.STEEL, UI.BLUE];

  const obj = add([fixed(), z(196), pos(0, 0), { t: 0, lines: [], owe: 0 }]);
  SFX.play("whoosh");
  wait(DUR - OUT - 0.05, () => SFX.play("whoosh"));
  obj.onUpdate(() => {
    const d = dt();
    obj.t += d;
    if (obj.t >= DUR + 0.6 && obj.lines.length === 0) { destroy(obj); return; }
    // new lines, as many as the name's speed earns, until it is gone
    if (obj.t < DUR) {
      obj.owe += speedAt(obj.t) / 22 * d;
      while (obj.owe >= 1) {
        obj.owe -= 1;
        const len = rand(60, 320), front = rand() < 0.3;
        // most across the band, the rest spilling over the room either side
        const y = rand() < 0.65 ? rand(bandY + 4, bandY + bandH - 4)
          : (rand() < 0.5 ? rand(bandY - 56, bandY - 6) : rand(bandY + bandH + 6, bandY + bandH + 56));
        obj.lines.push({
          x: G.W + rand(0, 120), len, front, y: Math.round(y / 2) * 2,
          th: front ? 2 : choose([2, 4, 4]),
          v: rand(2200, 4000), col: choose(LINES), op: front ? rand(0.35, 0.7) : rand(0.5, 0.95),
        });
      }
    }
    for (const l of obj.lines) l.x -= l.v * d;
    obj.lines = obj.lines.filter((l) => l.x + l.len > 0);
  });
  obj.onDraw(() => {
    const t = obj.t;
    // each line carries a 2px ink shadow like the type, or the pale ones vanish on a pale floor
    const line = (ln) => { UI.R(ln.x + 2, ln.y + 2, ln.len, ln.th, UI.INK, ln.op * 0.55); UI.R(ln.x, ln.y, ln.len, ln.th, ln.col, ln.op); };
    for (const ln of obj.lines) if (!ln.front) line(ln);
    if (t < DUR) {
      const x = Math.round(xAt(t));
      // the track number in a chrome block, then the chapter and its year
      const rx = x - rowW / 2;
      UI.R(rx + 3, rowY + 3, numW, rowH, UI.INK);
      UI.R(rx, rowY, numW, rowH, UI.STEEL);
      UI.R(rx, rowY, numW, 3, UI.SILVER);
      UI.R(rx, rowY + rowH - 3, numW, 3, UI.BLUE_DEEP);
      UI.label(num, rx + 8, rowY + rowH / 2, { size: SUB, anchor: "left", color: UI.NAVY, shadow: false });
      const sx = rx + numW + 12, sy = rowY + rowH / 2;
      for (const [ox, oy] of RING) UI.label(sub, sx + ox * 2, sy + oy * 2, { size: SUB, anchor: "left", color: UI.INK, shadow: false });
      UI.label(sub, sx, sy, { size: SUB, anchor: "left", color: UI.SILVER, shadowOff: 4 });
      // the name, in chrome: a soft dark pool, the hard drop, an ink ring
      const nx = x - nameW / 2, ny = cy - SIZE / 2;
      ink(name, nx + DROP, ny + DROP, SIZE, 10, 0.1);
      ink(name, nx + DROP, ny + DROP, SIZE, 5, 0.14);
      UI.text(name, nx + DROP, ny + DROP, { font: UI.PX, size: SIZE, color: UI.INK });
      ink(name, nx, ny, SIZE, 2);
      UI.chromeText(name, nx, ny, SIZE);
    }
    for (const ln of obj.lines) if (ln.front) line(ln);
  });
  return DUR;
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
  const HOLD = opts.hold === undefined ? 2.5 : opts.hold;   // Ollie, 18 Sep: 1.5 was too brief
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

// ---------- the special meter ----------
// The wristband meter: white track in a 2px ink border, filled with 8px
// blocks a pixel apart. It fills in the special screens' gold chrome, not
// the UI's silver and blue (Ollie, 7 Oct), banded the same way, with a
// glint that sweeps along whatever is filled. Full, it buzzes with
// electricity (Ollie, 13 Oct 2026). Drawn by the HUD and by the card that
// teaches the special, so the two are the same bar. 13 px tall; `k` is 0..1.
UI.specialMeter = (mx, my, mw, k, full) => {
  const mh = 13;
  // the whole bar shivers a pixel now and then while it is charged
  const step = Math.floor(time() * 16);
  const jit = full && UI._hash(step, 99) < 0.3 ? (UI._hash(step, 98) < 0.5 ? -1 : 1) : 0;
  my += jit;
  UI.R(mx - 2, my - 2, mw + 4, mh + 4, UI.INK);
  UI.R(mx, my, mw, mh, UI.WHITE);
  const fw = Math.round((mw - 2) * k);
  const SC = UI.SPECIAL_CHROME;
  for (let off = 0; off < fw; off += 9) {
    const bw = Math.min(8, fw - off), bx = mx + 1 + off;
    UI.R(bx, my + 1, bw, 1, SC[0]);
    UI.R(bx, my + 2, bw, 2, SC[3]);
    UI.R(bx, my + 4, bw, 4, SC[1]);
    UI.R(bx, my + 8, bw, 3, SC[5]);
    UI.R(bx, my + 11, bw, 1, SC[2]);
  }
  // the glint: a slanted sliver of light, quicker once the meter is full
  if (fw > 0) {
    const period = full ? 1.1 : 2.4;
    const gx = mx + 1 - 12 + ((time() % period) / period) * (fw + 24);
    for (let row = 1; row < 12; row++) {
      const sx = Math.round(gx + (12 - row) * 0.5);
      for (let off = 0; off < fw; off += 9) {
        const bx = mx + 1 + off, bw = Math.min(8, fw - off);
        const a = Math.max(sx, bx), b = Math.min(sx + 3, bx + bw);
        if (b > a) UI.R(a, my + row, b - a, 1, SC[0], 0.85);
      }
    }
  }
  if (full) UI.buzz(mx - 2, my - 2, mw + 4, mh + 4, step);
};

// A cheap repeatable random number in 0..1 from two integers, so a crackle
// holds its shape for a whole step instead of changing every frame.
UI._hash = (a, b) => {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// Electricity round a box: two or three arcs jumping off its edges and
// back, a few sparks, and a flicker over the whole thing. In 2 px squares
// so it sits with the pixel art. Each arc holds for one step (a sixteenth
// of a second) then jumps somewhere else.
UI.ZAP_CORE = [255, 253, 232];
UI.ZAP_GLOW = [255, 214, 64];
UI._zapPix = (px, py, size, c, op) => UI.R(Math.round(px / 2) * 2 - size / 2, Math.round(py / 2) * 2 - size / 2, size, size, c, op);
// A zigzag from (ax, ay) to (bx, by), bowing out by up to `amp` along
// (nx, ny).
UI._zap = (step, ax, ay, bx, by, nx, ny, amp, seed) => {
  const n = 5, pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, bow = Math.sin(t * Math.PI) * amp;
    const wob = i === 0 || i === n ? 0 : (UI._hash(step, seed + i) - 0.5) * amp;
    pts.push([ax + (bx - ax) * t + nx * (bow + wob), ay + (by - ay) * t + ny * (bow + wob)]);
  }
  // amber edge, yellow body, white core: reads on the paper card and on a dark room alike
  for (const [size, c, op] of [[6, UI.SPECIAL_CHROME[5], 0.45], [4, UI.ZAP_GLOW, 0.95], [2, UI.ZAP_CORE, 1]]) {
    for (let i = 0; i < n; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const len = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 2));
      for (let k = 0; k <= len; k++) UI._zapPix(x1 + (x2 - x1) * k / len, y1 + (y2 - y1) * k / len, size, c, op);
    }
  }
};
UI.buzz = (x, y, w, h, step) => {
  const H = (i) => UI._hash(step, i);
  const arcs = 2 + (H(1) < 0.5 ? 1 : 0);
  for (let a = 0; a < arcs; a++) {
    const top = H(10 + a) < 0.5;
    const span = 14 + H(20 + a) * Math.min(40, w * 0.3);
    const x1 = x + H(30 + a) * (w - span);
    const ey = top ? y : y + h;
    UI._zap(step, x1, ey, x1 + span, ey, 0, top ? -1 : 1, 5 + H(40 + a) * 6, 100 + a * 10);
  }
  // now and then one leaps off an end of the bar instead
  if (H(2) < 0.35) {
    const left = H(3) < 0.5, ex = left ? x : x + w, cy = y + h / 2;
    UI._zap(step, ex, cy - 3, ex, cy + 3, left ? -1 : 1, 0, 8 + H(4) * 6, 200);
  }
  // sparks thrown clear of the edges
  for (let i = 0; i < 4; i++) {
    const sx = x + H(50 + i) * w, top = H(60 + i) < 0.5;
    UI._zapPix(sx, top ? y - 4 - H(70 + i) * 8 : y + h + 4 + H(70 + i) * 8, 2, H(90 + i) < 0.5 ? UI.ZAP_GLOW : UI.SPECIAL_CHROME[5], 0.7 + H(80 + i) * 0.3);
  }
  // and the bar itself flickers brighter
  if (H(5) < 0.4) UI.R(x + 2, y + 2, w - 4, h - 4, UI.ZAP_CORE, 0.12 + H(6) * 0.18);
};
// The same round a circle (the phone's SP button).
UI.buzzRing = (cx, cy, r, step) => {
  const H = (i) => UI._hash(step, i);
  const arcs = 2 + (H(1) < 0.5 ? 1 : 0);
  for (let a = 0; a < arcs; a++) {
    const a1 = H(10 + a) * Math.PI * 2, a2 = a1 + 0.35 + H(20 + a) * 0.5, am = (a1 + a2) / 2;
    UI._zap(step, cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, cx + Math.cos(a2) * r, cy + Math.sin(a2) * r,
      Math.cos(am), Math.sin(am), 6 + H(40 + a) * 6, 100 + a * 10);
  }
  for (let i = 0; i < 4; i++) {
    const t = H(50 + i) * Math.PI * 2, d = r + 5 + H(70 + i) * 10;
    UI._zapPix(cx + Math.cos(t) * d, cy + Math.sin(t) * d, 2, H(90 + i) < 0.5 ? UI.ZAP_GLOW : UI.SPECIAL_CHROME[5], 0.7 + H(80 + i) * 0.3);
  }
};

// ---------- HUD ----------

// The companions' polaroids, top right. Screen positions from the kit.
UI.PORTRAIT = { x: 712, y: 8, w: 54, h: 64, gap: 58 };

// The lanyard card, top left: hearts and the special meter. 16px wider than
// the kit's 250 so the SPECIAL MOVE chip clears the strap's clip (8 Oct).
UI.LANYARD = { x: 14, y: 14, w: 266, h: 76 };

UI.hud = () => {
  const hud = add([fixed(), z(170), pos(0, 0), {
    meterDisp: 0,
    lastSel: -1,
    selPop: 0,
    lastHp: null,
    hurtPulse: 0,
  }]);

  hud.onDraw(() => {
    if (!G.run || G.cutscene) return;   // the finale's opening and ending own the frame
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

    // whose go it is, top right of the card; the SPECIAL MOVE chip once the
    // meter is full (Ollie, 8 Oct). It is 112 x 16, sits 2px under the card's
    // top edge and 6px right of the strap's clip, so it clears the longest
    // lanyard (12 characters) by a wide margin. There is no room
    // for the key beside it, so on a keyboard a SPACE key cap hangs under
    // the card's corner instead; phones have the SP button.
    const rightX = L.x + cw - 10;
    if (r.companions.length > 0) {
      const sel = G.char(r.companions[r.selected]);
      if (r.meter >= 1) {
        UI.chip("SPECIAL MOVE", rightX, 18, {
          anchor: "topright", font: UI.PX, size: 8, padX: 6, padY: 2,
          // solid, so the strap's clip never shows through; it pulses
          // brighter and back instead of fading
          fill: UI.SPECIAL_CHROME[1].map((v, k) => Math.round(v + (UI.SPECIAL_CHROME[3][k] - v) * (0.5 + Math.sin(time() * 5) * 0.5))),
          highlight: UI.SPECIAL_CHROME[0], shade: UI.SPECIAL_CHROME[5], color: UI.INK,
        });
        if (!isTouchscreen()) {
          UI.chip("SPACE", L.x + cw - 4, L.y + L.h + 4, {
            anchor: "topright", font: UI.PX, size: 8, padX: 6, padY: 2, shade: UI.PAPER_SHADE, color: UI.INK,
          });
        }
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

    // the wristband meter (UI.specialMeter): gold, and crackling once full
    UI.specialMeter(24, 68, cw - 20, hud.meterDisp, r.meter >= 1);
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

    // ===== mobile special button: just above the aim stick =====
    if (isTouchscreen()) {
      const B = UI.SP_BTN, bp = vec2(B.x, B.y);
      const ready = r.meter >= 1;
      const op = ready ? 0.85 + Math.sin(time() * 5) * 0.15 : 0.35;
      drawCircle({ pos: bp, radius: B.r, color: UI.rgb(UI.WHITE), opacity: op });
      drawCircle({ pos: bp, radius: B.r - 1, fill: false, outline: { width: 2, color: UI.rgb(UI.INK) }, opacity: op });
      // a gold ring: yellow, with an amber edge inside it
      drawCircle({ pos: bp, radius: B.r - 4.5, fill: false, outline: { width: 5, color: UI.rgb(UI.SPECIAL_CHROME[1]) }, opacity: op });
      drawCircle({ pos: bp, radius: B.r - 7.5, fill: false, outline: { width: 1.5, color: UI.rgb(UI.SPECIAL_CHROME[5]) }, opacity: op });
      UI.label("SP", bp.x, bp.y + 1, { size: 16, anchor: "center", color: UI.SPECIAL_CHROME[2], shadow: false, opacity: op });
      if (ready) UI.buzzRing(bp.x, bp.y, B.r, Math.floor(time() * 16));
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

// ---------- teaching the special ----------
// Straight after the first friend's collection screen, once a run: a paper
// card that explains the special (Ollie, 13 Oct 2026). Play stays paused
// until any key or a tap, accepted after a beat so a key still held from
// the fight does not throw it away unread. The meter on it is the HUD's own
// bar, filling and crackling on a loop. `c` is the friend who just joined.
UI.specialTutorial = (c, onDone) => {
  const touch = isTouchscreen();
  const W = 640, CX = G.W / 2;
  const LINE = { font: UI.VT, size: 32, width: W - 72, align: "center" };
  const lines = [
    "Hit things to fill your special meter.",
    touch
      ? "When it's full, tap SP for " + c.name + "'s special move."
      : "When it's full, press SPACE for " + c.name + "'s special move.",
  ];
  const hint = touch
    ? "With more friends, tap a polaroid to choose whose special it is."
    : "With more friends, Q / E or 1 to 4 chooses whose special it is.";
  const hgt = (str, o) => UI.measure(str, o.font, o.size, o).height;
  const HINT = { font: UI.VT, size: 16, width: W - 72, align: "center" };
  const METER_W = 300, GAP = 18;
  const H = 28 + 24 + GAP + hgt(lines[0], LINE) + GAP + 13 + GAP + hgt(lines[1], LINE) + 12 + hgt(hint, HINT) + GAP + 20 + 22;
  const Y0 = Math.round(G.H / 2 - H / 2);

  G.paused = true;
  let t = 0, leaving = -1;
  const root = add([fixed(), z(220), pos(0, 0)]);
  root.onUpdate(() => {
    t += dt();
    if (leaving >= 0 && t - leaving > 0.2) {
      root.destroy();
      for (const h of handlers) h.cancel();
      G.paused = false;
      if (onDone) onDone();
    }
  });
  root.onDraw(() => {
    const inK = UI.ease(Math.min(1, t / 0.25));
    const op = leaving >= 0 ? Math.max(0, 1 - (t - leaving) / 0.2) : inK;
    UI.R(0, 0, G.W, G.H, UI.INK, 0.55 * op);
    const y0 = Y0 + Math.round((1 - inK) * 24);
    UI.card(vec2(CX - W / 2, y0), W, H, { drop: 4, opacity: op });
    let y = y0 + 28;
    // the heading in the special screens' gold chrome
    const tw = Math.ceil(UI.measure("SPECIAL MOVES", UI.PX, 24).width);
    UI.chromeText("SPECIAL MOVES", CX - tw / 2, y, 24, op, UI.SPECIAL_CHROME);
    y += 24 + GAP;
    const o = (extra) => Object.assign({}, extra, { color: UI.TEXT, anchor: "top", opacity: op });
    UI.text(lines[0], CX, y, o(LINE));
    y += hgt(lines[0], LINE) + GAP;
    // the bar fills over 1.6s, crackles full for 1.8s, empties, again
    const cyc = t % 3.8;
    const k = cyc < 1.6 ? UI.ease(cyc / 1.6) : cyc < 3.4 ? 1 : 1 - (cyc - 3.4) / 0.4;
    const full = cyc >= 1.6 && cyc < 3.4;
    if (op > 0.6) UI.specialMeter(CX - METER_W / 2, y, METER_W, k, full);
    y += 13 + GAP;
    UI.text(lines[1], CX, y, o(LINE));
    y += hgt(lines[1], LINE) + 12;
    UI.text(hint, CX, y, Object.assign(o(HINT), { color: UI.BLUE_DEEP }));
    y += hgt(hint, HINT) + GAP;
    if (t > 0.9 && leaving < 0) {
      UI.chip(touch ? "tap to carry on" : "press any key", CX, y + 10, {
        anchor: "center", opacity: op * (0.7 + Math.sin(time() * 3.2) * 0.3),
      });
    }
  });
  const dismiss = () => {
    if (t < 0.9 || leaving >= 0 || UI.pauseOpen) return;
    leaving = t;
    SFX.play("uiconfirm");
  };
  const handlers = [
    onKeyPress((key) => { if (key !== "escape" && key !== "p") dismiss(); }),
    onMousePress(() => {
      if (UI.inPauseBtn(mousePos())) return;
      dismiss();
    }),
  ];
  SFX.play("uitick");
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
    if (isTouchscreen() && UI.inSpBtn(m)) {
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
  // Admin only since 16 Oct 2026: the platinum trophy wins a real prize.
  // Ollie: strip these before the final ship.
  const cheat = (key, fn) => onKeyPress(key, () => { if (ADMIN.on) fn(); });
  cheat("k", () => { get("enemy").forEach((e) => ENEMIES.hit(e, 999, 0)); get("boss").forEach((b) => ENEMIES.hit(b, 999, 0)); });
  cheat("h", () => { if (G.run) G.run.hp = G.stats().maxHp; });
  cheat("m", () => { if (G.run) G.run.meter = 1; });
  cheat("g", () => { G.godMode = !G.godMode; UI.toast(G.godMode ? "god mode ON" : "god mode OFF"); });
  cheat("]", () => { if (G.devSkip) G.devSkip(); });
  cheat("c", () => { if (G.run && !G.paused) CUTIN.play(CUTIN.forJoin(G.char(G.run.charId))); });
  // the selected friend's special screen, without spending the meter or attacking
  cheat("v", () => {
    if (!G.run || G.paused) return;
    const id = G.run.companions.length ? G.run.companions[G.run.selected] : G.run.charId;
    CUTIN.play(CUTIN.forSpecial(G.char(id)));
  });
};

// ---------- pause menu ----------
// ESC, P, or the PAUSE chip at the top of the screen. Freezes the whole
// game with Kaboom's own debug.paused: updates and timers stop, drawing
// and input carry on, so the menu draws itself in onDraw and nothing
// else moves while it is up. G.paused is raised too, so the gameplay
// keys underneath (space for the special) do nothing. Installed once per
// gameplay scene; its objects die with the scene.
UI.pauseOpen = false;
UI.pauseNow = () => {};   // replaced by each gameplay scene's UI.pause()
// On a phone the chip is bigger and a tap counts well outside it: at phone
// size the old 60 x 20 chip was a 43 x 14 point target (Ollie, 13 Oct 2026).
UI.PAUSE_BTN = isTouchscreen()
  ? { x: G.W / 2 - 50, y: 6, w: 100, h: 32, pad: 22, size: 16 }
  : { x: G.W / 2 - 30, y: 8, w: 60, h: 20, pad: 0, size: 8 };
UI.inPauseBtn = (p) => {
  const b = UI.PAUSE_BTN;
  if (ADMIN.arrowAt(p)) return false;   // the admin arrows either side win their own taps
  return p.x >= b.x - b.pad && p.x <= b.x + b.w + b.pad && p.y >= b.y - b.pad && p.y <= b.y + b.h + b.pad;
};
// anything along the top that a stick must not take: PAUSE and the admin arrows
UI.inTopButtons = (p) => UI.inPauseBtn(p) || ADMIN.arrowAt(p) !== 0;

UI.pause = () => {
  const touch = isTouchscreen();
  const ITEMS = ["carry on", "sound", "back to the title"];
  // phone rows are taller, wider and in bigger type, so a thumb can hit them
  const W = touch ? 420 : 360, ROW_W = touch ? 320 : 260, ROW_H = touch ? 46 : 28;
  const ROW_GAP = touch ? 12 : 10, LINE = 18, ROW_SIZE = touch ? 32 : 16;
  const help = touch
    ? ["left thumb walks, right thumb aims and throws", "tap SP for the special, tap a polaroid to swap"]
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
    UI.pauseToggledAt = time();   // that press must not also hurry a line (CRACKVOICE.canHurry)
    wasPaused = G.paused;
    G.paused = true;
    debug.paused = true;
    sel = 0;
    SFX.play("uitick");
  };
  const close = () => {
    if (!UI.pauseOpen) return;
    UI.pauseOpen = false;
    UI.pauseToggledAt = time();
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
  // Leaving the game (another app, the home screen, another window) or
  // turning the phone upright opens this menu, so you come back to it
  // paused rather than straight into the fight (Ollie, 15 Oct 2026).
  // core/idle.js and core/turn.js call it; it dies with the scene.
  UI.pauseNow = () => { if (menu.exists()) open(); };
  menu.onDraw(() => {
    // a collection screen owns the whole frame while it plays, unless it
    // was paused part way through
    if (typeof CUTIN !== "undefined" && CUTIN.active && !UI.pauseOpen) return;
    const b = UI.PAUSE_BTN;
    if (!UI.pauseOpen) {
      if (G.cutscene) return;
      UI.card(vec2(b.x, b.y), b.w, b.h, { fill: UI.CHIP, shade: null, notch: false, opacity: 0.85 });
      UI.label("PAUSE", b.x + b.w / 2, b.y + b.h / 2 + 1, { size: b.size, anchor: "center", color: UI.TEXT, shadow: false, opacity: 0.85 });
      ADMIN.drawArrows();
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
      UI.text(label(i), r.x + r.w / 2, r.y + r.h / 2 + 1, { anchor: "center", size: ROW_SIZE });
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
    if (!UI.pauseOpen) {
      const d = ADMIN.arrowAt(m);
      if (d) ADMIN.jump(d);
      else if (UI.inPauseBtn(m)) open();
      return;
    }
    ITEMS.forEach((_, i) => { if (hit(m, rowRect(i))) { sel = i; activate(); } });
  });
};

// ---------- mobile sticks ----------
// Two sticks, the twin-stick way (Ollie, 13 Oct 2026): the left one walks,
// the right one aims, and you only throw while you hold it, because
// auto-aim made it too easy. Both sit lifted off the bottom edge so there
// is room to pull down without the thumb running off the glass, and the SP
// button sits just above the aim stick.
UI.STICK = { x: 110, y: G.H - 130, r: 54 };
UI.AIM_STICK = { x: G.W - 110, y: G.H - 130, r: 54 };
UI.SP_BTN = { x: G.W - 110, y: G.H - 240, r: 40 };
UI.inSpBtn = (p) => p.dist(vec2(UI.SP_BTN.x, UI.SP_BTN.y)) < UI.SP_BTN.r + 12;

// Mobile aim, -1..1 on each axis like G.joy. Throwing needs it pushed past
// a little dead zone (PLAYER.aimDir).
G.aim = vec2(0, 0);

// Kaboom hands touch handlers the finger in window pixels, measured from
// the canvas's corner, not in game pixels. The canvas fills the window and
// the 960 x 540 picture is letterboxed inside it, so on a phone the two
// differ a lot. This repeats the engine's own letterbox sum, the same one
// TITLEVIDEO.layout uses.
UI.toGame = (p) => {
  const r = canvas.getBoundingClientRect();
  const k = Math.min(r.width / G.W, r.height / G.H);
  return vec2((p.x - (r.width - G.W * k) / 2) / k, (p.y - (r.height - G.H * k) / 2) / k);
};

// Let go of both sticks. A stick only lets go when its own finger lifts,
// and that lift can be lost: a new room loads between the press and the
// lift (the old room's handlers are gone by then), or iOS takes the touch
// for one of its own gestures. Either way the player kept walking in the
// last direction held. So every lift that leaves no finger on the glass,
// every cancel and every trip away from the page lets go of everything.
UI._sticks = [];
UI.releaseSticks = () => {
  G.joy = vec2(0, 0);
  G.aim = vec2(0, 0);
  for (const s of UI._sticks) s.release();
};
(() => {
  const allUp = (e) => { if (!e.touches || e.touches.length === 0) UI.releaseSticks(); };
  addEventListener("touchend", allUp, true);
  addEventListener("touchcancel", UI.releaseSticks, true);
  addEventListener("blur", UI.releaseSticks);
  document.addEventListener("visibilitychange", UI.releaseSticks);
})();

UI.mobileControls = () => {
  if (!isTouchscreen()) return;
  // whatever a finger was doing in the last room, this one starts at rest
  UI._sticks = [];
  UI.releaseSticks();

  // One stick. A touch that lands on it (or near it) steers from its
  // centre; one that lands anywhere else in its half steers from where the
  // finger landed, and the stick is drawn there until the finger lifts.
  // Silver and blue like the rest of the accent; drawn as one entity so
  // the translucency never stacks where the rings meet.
  const stick = (S, inZone, set) => {
    const home = vec2(S.x, S.y);
    const st = { id: null, at: home, k: vec2(0, 0) };
    const base = add([pos(home), opacity(0.7), fixed(), z(185)]);
    base.onDraw(() => {
      const op = base.opacity;
      const c = st.at.sub(home);
      drawCircle({ pos: c, radius: 45, color: UI.rgb(UI.SILVER), opacity: op });
      drawCircle({ pos: c, radius: 49.5, fill: false, outline: { width: 5, color: UI.rgb(UI.STEEL) }, opacity: op });
      drawCircle({ pos: c, radius: 46, fill: false, outline: { width: 2, color: UI.rgb(UI.BLUE_DEEP) }, opacity: op });
      drawCircle({ pos: c, radius: 53, fill: false, outline: { width: 2, color: UI.rgb(UI.INK) }, opacity: op + 0.2 });
      const k = c.add(st.k.scale(S.r));
      drawCircle({ pos: k, radius: 21, color: UI.rgb(UI.BLUE), opacity: op + 0.2 });
      drawCircle({ pos: k, radius: 22.5, fill: false, outline: { width: 3, color: UI.rgb(UI.BLUE_DEEP) }, opacity: op + 0.2 });
      drawCircle({ pos: k, radius: 25, fill: false, outline: { width: 2, color: UI.rgb(UI.INK) }, opacity: op + 0.2 });
    });
    const steer = (p) => {
      let d = p.sub(st.at);
      if (d.len() > S.r) d = d.unit().scale(S.r);
      st.k = d.scale(1 / S.r);
      set(st.k);
    };
    st.release = () => {
      st.id = null;
      st.at = home;
      st.k = vec2(0, 0);
      base.opacity = 0.7;
    };
    UI._sticks.push(st);

    onTouchStart((raw, t) => {
      if (st.id !== null || UI.pauseOpen) return;
      const p = UI.toGame(raw);
      if (!inZone(p) || UI.inTopButtons(p)) return;
      st.id = t ? t.identifier : 0;
      st.at = p.dist(home) < S.r + 40 ? home : p;
      base.opacity = 0.9;
      steer(p);
    });
    onTouchMove((raw, t) => {
      if (st.id === null || (t && t.identifier !== st.id)) return;
      steer(UI.toGame(raw));
    });
    onTouchEnd((raw, t) => {
      if (st.id === null || (t && t.identifier !== st.id)) return;
      st.release();
      set(vec2(0, 0));
    });
  };

  // left half walks
  stick(UI.STICK, (p) => p.x < G.W / 2, (v) => { G.joy = v; });
  // right half aims, except the SP button and the polaroids along the top
  stick(UI.AIM_STICK,
    (p) => p.x >= G.W / 2 && !UI.inSpBtn(p) && p.y > UI.PORTRAIT.y + UI.PORTRAIT.h + 8,
    (v) => { G.aim = v; });
};
