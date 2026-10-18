// ============================================================
// TIPS: the explainer cards (18 Oct 2026). Friends were missing how the
// game works, flicking the aim stick instead of holding it (Ollie, the
// morning after launch). A tip is a paper card, like the special-move
// card, that pauses play: a heading in the title's chrome, a moving demo
// where one helps, the words (data/tips.js), and "tap to carry on" or two
// buttons.
//
// Each tip shows once ever per player. What has been seen is a list in the
// story save (`tips`), so it travels with the save word and a later run
// never repeats it. The controls are two tips, one for touch and one for
// keys: someone who only played on a laptop still gets the touch card on
// their iPad. The pause menu's "how to play" row shows them again.
//
// While a card is up nothing underneath takes input: the sticks ignore
// touches (TIPS.busy, core/ui.js), the park's throw waits for G.paused.
// It times itself off the clock, never by adding up dt(), so it works
// under the pause menu too, and draws a layer at a time.
// Tests: node tools/tests/tips.test.js
// ============================================================

const TIPS = { open: false, closedAt: -1 };

// The card's buttons as they stand, in game pixels, for driving it from a
// test as a finger would (the same idea as CLOUDUI.targets).
TIPS.targets = () => [];

// ---------- which have been seen ----------
TIPS.list = () => {
  const s = STORY.get();
  return Array.isArray(s.tips) ? s.tips : [];
};
TIPS.seen = (id) => TIPS.list().includes(id);
TIPS.mark = (id) => {
  const s = STORY.get();
  if (!Array.isArray(s.tips)) s.tips = [];
  if (s.tips.includes(id)) return;
  s.tips.push(id);
  STORY.set(s);
};

TIPS.touch = () => typeof isTouchscreen === "function" && !!isTouchscreen();
TIPS.controlsId = () => (TIPS.touch() ? "controls-touch" : "controls-keys");

// The words for this device: a tip's own, with its touch or keys ones on top.
TIPS.copy = (id) => {
  const c = TIPS_COPY[id];
  if (!c) return null;
  return Object.assign({}, c, c[TIPS.touch() ? "touch" : "keys"] || {});
};

// Worth showing: not seen, and for the save word, only with the cloud on and
// no word yet (a device that has one has nothing to learn from it).
TIPS.wanted = (id) => {
  if (!TIPS_COPY[id] || TIPS.seen(id)) return false;
  if (id === "saveword") {
    if (typeof CLOUD === "undefined" || typeof CLOUDUI === "undefined" || !CLOUD.enabled()) return false;
    if (CLOUD.meta().word) { TIPS.mark(id); return false; }
  }
  return true;
};

// true while a card is up, and for a moment after, so the tap that closes
// it never also lands on the sticks or a button underneath. Only while the
// card really exists: a room change mid-close throws it away, and a stuck
// "open" would have kept the phone's sticks off for good.
TIPS.root = null;
TIPS.busy = () => (TIPS.open && !!TIPS.root && TIPS.root.exists())
  || (typeof time === "function" && time() - TIPS.closedAt < 0.3);

// ---------- the card ----------
// o.force shows it even if seen (the pause menu's "how to play"). o.onDone
// (choice) runs as it goes, with the button picked (0 when there are none).
TIPS.show = (id, o = {}) => {
  const done = (choice) => { if (o.onDone) o.onDone(choice); };
  if (!o.force && !TIPS.wanted(id)) return done(-1);
  const c = TIPS.copy(id);
  if (!c || TIPS.open) return done(-1);
  TIPS.open = true;
  const touch = TIPS.touch();
  const wasPaused = !!G.paused;
  G.paused = true;
  if (typeof UI !== "undefined" && UI.releaseSticks) UI.releaseSticks();

  const W = touch ? 760 : 640, CX = G.W / 2, GAP = 16;
  const LINE = { font: UI.VT, size: 32, width: W - 72, align: "center" };
  const HINT = { font: UI.VT, size: 16, width: W - 72, align: "center" };
  const hgt = (str, f) => UI.measure(str, f.font, f.size, f).height;
  const DEMO_H = { sticks: 150, keys: 130, polaroids: 112 }[c.demo] || 0;
  const BTNS = c.buttons || null;
  const BW = touch ? 300 : 240, BH = touch ? 46 : 30, BSIZE = touch ? 32 : 16, BGAP = 16;
  const linesH = c.lines.reduce((a, ln) => a + hgt(ln, LINE) + 8, 0);
  const hintH = c.hint ? hgt(c.hint, HINT) + 10 : 0;
  const H = 26 + 24 + GAP + (DEMO_H ? DEMO_H + GAP : 0) + linesH + hintH + GAP + (BTNS ? BH : 22) + 22;
  const Y0 = Math.round(G.H / 2 - H / 2);
  const btnX = (i) => Math.round(CX - (BW * BTNS.length + BGAP * (BTNS.length - 1)) / 2 + i * (BW + BGAP));
  const btnY = Y0 + H - 22 - BH;

  // The wait before a card answers starts again whenever the pause menu has
  // been over it (blur, turning the phone): it is hidden then, and the press
  // that closes the menu must not also throw the card away unread.
  const openedAt = time();
  let shownAt = openedAt;
  const age = () => time() - openedAt;
  TIPS.targets = () => (BTNS ? BTNS.map((b, i) => ({ label: b, x: btnX(i), y: btnY, w: BW, h: BH })) : []);
  let sel = 0, leaving = -1;
  const ready = () => time() - shownAt > 0.6 && leaving < 0 && !UI.pauseOpen && UI.pauseToggledAt !== time();

  const root = add([fixed(), z(236), pos(0, 0)]);
  TIPS.root = root;
  // a room change while it is up (dying, back to the title) takes it with it
  onSceneLeave(() => { TIPS.open = false; TIPS.root = null; TIPS.targets = () => []; });
  root.onDraw(() => {
    if (UI.pauseOpen) { shownAt = time(); return; }   // the pause menu is on top: this waits, unseen
    const t = age();
    const inK = UI.ease(Math.min(1, t / 0.25));
    const op = leaving >= 0 ? Math.max(0, 1 - (t - leaving) / 0.2) : inK;
    const y0 = Y0 + Math.round((1 - inK) * 24);
    UI.R(0, 0, G.W, G.H, UI.INK, 0.55 * op);
    UI.card(vec2(CX - W / 2, y0), W, H, { drop: 4, opacity: op });
    let y = y0 + 26;
    const tw = Math.ceil(UI.measure(c.title, UI.PX, 24).width);
    UI.chromeText(c.title, CX - tw / 2, y, 24, op);
    y += 24 + GAP;
    if (DEMO_H) {
      if (op > 0.6) TIPS.DEMOS[c.demo](CX - (W - 64) / 2, y, W - 64, DEMO_H, t);
      y += DEMO_H + GAP;
    }
    const o = (f, extra) => Object.assign({}, f, { color: UI.TEXT, anchor: "top", opacity: op }, extra || {});
    for (const ln of c.lines) { UI.text(ln, CX, y, o(LINE)); y += hgt(ln, LINE) + 8; }
    if (c.hint) UI.text(c.hint, CX, y + 2, o(HINT, { color: UI.BLUE_DEEP }));
    if (BTNS) {
      // the cards, then the words: a layer at a time
      BTNS.forEach((b, i) => UI.card(vec2(btnX(i), btnY - Y0 + y0), BW, BH, {
        fill: i === sel ? UI.STEEL : UI.CHIP, shade: i === sel ? UI.BLUE : null, notch: false, opacity: op,
      }));
      BTNS.forEach((b, i) => UI.text(b, btnX(i) + BW / 2, btnY - Y0 + y0 + BH / 2 + 1, { anchor: "center", size: BSIZE, opacity: op }));
    } else if (t > 0.9 && leaving < 0) {
      UI.chip(touch ? "tap to carry on" : "press any key", CX, y0 + H - 22 - 11, {
        anchor: "center", opacity: op * (0.7 + Math.sin(time() * 3.2) * 0.3),
      });
    }
  });

  // Seen once it has been read and dismissed, not when it opened: a card
  // lost to a room change comes back next time.
  const finish = (choice) => {
    if (leaving >= 0) return;
    leaving = age();
    TIPS.mark(id);
    SFX.play("uiconfirm");
    wait(0.2, () => {
      root.destroy();
      for (const h of handlers) h.cancel();
      TIPS.open = false;
      TIPS.root = null;
      TIPS.closedAt = time();
      TIPS.targets = () => [];
      // only undo the card's own pause: a story beat that paused the room
      // under it keeps hold of it
      if (!wasPaused) G.paused = false;
      done(choice);
    });
  };
  const btnAt = (m) => (BTNS ? BTNS.findIndex((_, i) => m.x >= btnX(i) && m.x <= btnX(i) + BW && m.y >= btnY && m.y <= btnY + BH) : -1);
  const handlers = [
    onKeyPress((key) => {
      if (!ready()) return;
      if (key === "escape" || key === "p") return finish(BTNS ? BTNS.length - 1 : 0);   // the last button is always the "not now" one
      if (BTNS && ["left", "right", "up", "down", "a", "d", "w", "s", "tab"].includes(key)) {
        sel = (sel + 1) % BTNS.length;
        SFX.play("uitick");
        return;
      }
      if (!BTNS || key === "enter" || key === "space") finish(BTNS ? sel : 0);
    }),
    onMouseMove(() => {
      const i = btnAt(mousePos());
      if (i >= 0) sel = i;
    }),
    // any tap answers it (PAUSE and the admin arrows wait under a card)
    onMousePress(() => {
      if (!ready()) return;
      if (!BTNS) return finish(0);
      const i = btnAt(mousePos());
      if (i >= 0) finish(i);
    }),
  ];
  SFX.play("uitick");
};

// The park: the save word, then the controls. "get my save word" makes the
// word there and then (the panel opens on it), with play held until the
// panel closes.
TIPS.park = (onDone) => {
  const controls = () => TIPS.show(TIPS.controlsId(), { onDone: () => onDone && onDone() });
  TIPS.show("saveword", {
    onDone: (choice) => {
      if (choice !== 0 || typeof CLOUDUI === "undefined") return controls();
      G.paused = true;
      CLOUDUI.open("pause", () => { G.paused = false; controls(); }, { create: true });
      if (!CLOUDUI.isOpen) { G.paused = false; controls(); }   // it could not open: carry on regardless
    },
  });
};

// ---------- the moving demos ----------
// Each draws into a box (x, y, w, h) at t seconds. Shapes first, then the
// friend's sprite, then any words, so the graphics chip changes job as few
// times a frame as it can.
TIPS.DEMOS = {};

const tipsRing = (p, r, fill, ink, op = 1) => {
  drawCircle({ pos: p, radius: r + 2, color: UI.rgb(ink), opacity: op });
  drawCircle({ pos: p, radius: r, color: UI.rgb(fill), opacity: op });
};
const tipsFigure = (id, p, hgt, flip) => {
  const reg = G.SPR && G.SPR["ch-" + id];
  if (!reg) return;
  drawSprite({ sprite: reg.name, frame: 0, pos: p, anchor: "bot", flipX: !!flip, scale: hgt / reg.h });
};
const tipsHero = () => (G.run && G.run.charId) || "ollie";
const THUMB = [236, 196, 160];

// Touch: both sticks held down, the left steering a slow loop, the right
// held on a target while the friend keeps throwing at it.
TIPS.DEMOS.sticks = (x, y, w, h, t) => {
  const R = 40, cy = y + h / 2 - 6;
  const L = vec2(x + 70, cy), Rt = vec2(x + w - 70, cy);
  const a = t * 1.3;
  const walk = vec2(Math.cos(a), Math.sin(a) * 0.6);
  const aimDir = vec2(1, -0.35).unit();
  const fig = vec2(x + w / 2 - 40 + walk.x * 36, y + h / 2 + 28 + walk.y * 18);
  const target = vec2(x + w / 2 + 70, y + 34);
  // the sticks, knobs pushed, thumbs held on them
  tipsRing(L, R, UI.SILVER, UI.INK, 0.9);
  tipsRing(Rt, R, UI.SILVER, UI.INK, 0.9);
  const kl = L.add(walk.scale(R * 0.55)), kr = Rt.add(aimDir.scale(R * 0.55));
  tipsRing(kl, 16, UI.BLUE, UI.INK);
  tipsRing(kr, 16, UI.BLUE, UI.INK);
  tipsRing(kl.add(4, 6), 13, THUMB, UI.INK, 0.9);
  tipsRing(kr.add(-4, 6), 13, THUMB, UI.INK, 0.9);
  // the target, and three balls always in the air towards it
  tipsRing(target, 12, UI.RED, UI.INK);
  drawCircle({ pos: target, radius: 5, color: UI.rgb(UI.WHITE) });
  const from = fig.add(0, -22);
  for (let k = 0; k < 3; k++) {
    const ph = ((t + k * 0.33) % 1) / 1;
    tipsRing(from.lerp(target, ph), 3, UI.WHITE, UI.INK);
  }
  tipsFigure(tipsHero(), fig, 44, Math.cos(a + Math.PI / 2) < 0);
  UI.label("HOLD", L.x, L.y + R + 10, { size: 8, anchor: "top", color: UI.TEXT, shadow: false });
  UI.label("HOLD", Rt.x, Rt.y + R + 10, { size: 8, anchor: "top", color: UI.TEXT, shadow: false });
  UI.text("walk", L.x, L.y + R + 22, { anchor: "top", color: UI.BLUE_DEEP });
  UI.text("aim and throw", Rt.x, Rt.y + R + 22, { anchor: "top", color: UI.BLUE_DEEP });
};

// Keys: W A S D lighting in turn as the friend walks a square, a pointer
// drifting about, the throws going wherever it points.
TIPS.DEMOS.keys = (x, y, w, h, t) => {
  const K = 40, G2 = 5;
  const kx = Math.round(x + w * 0.2 - (3 * K + 2 * G2) / 2), ky = Math.round(y + h / 2 - K - G2 / 2);
  const caps = { W: [1, 0], A: [0, 1], S: [1, 1], D: [2, 1] };
  const order = ["D", "S", "A", "W"];
  const step = Math.floor(t / 0.6) % 4, on = order[step];
  const dirs = { D: vec2(1, 0), S: vec2(0, 1), A: vec2(-1, 0), W: vec2(0, -1) };
  const local = (t % 0.6) / 0.6;
  let p = vec2(0, 0);
  for (let i = 0; i < step; i++) p = p.add(dirs[order[i]].scale(44));
  p = p.add(dirs[on].scale(44 * local));
  const fig = vec2(x + w / 2 - 30 + p.x, y + 52 + p.y * 0.8);
  const ptr = vec2(x + w * 0.8 + Math.cos(t * 0.9) * 46, y + h / 2 - 10 + Math.sin(t * 1.3) * 34);
  for (const k in caps) {
    const [cx, cy] = caps[k];
    UI.card(vec2(kx + cx * (K + G2), ky + cy * (K + G2)), K, K, { fill: k === on ? UI.STEEL : UI.CHIP, shade: k === on ? UI.BLUE : UI.PAPER_SHADE, notch: false });
  }
  const from = fig.add(0, -28);
  for (let k = 0; k < 3; k++) {
    const ph = ((t + k * 0.33) % 1) / 1;
    tipsRing(from.lerp(ptr, ph), 4, UI.WHITE, UI.INK);
  }
  // the pointer: an arrow, ink round white
  drawTriangle({ p1: ptr, p2: ptr.add(-4, 28), p3: ptr.add(17, 20), color: UI.rgb(UI.INK) });
  drawTriangle({ p1: ptr.add(1, 5), p2: ptr.add(-1, 23), p3: ptr.add(12, 17), color: UI.rgb(UI.WHITE) });
  tipsFigure(tipsHero(), fig, 56, on === "A");
  for (const k in caps) {
    const [cx, cy] = caps[k];
    UI.text(k, kx + cx * (K + G2) + K / 2, ky + cy * (K + G2) + K / 2 + 1, { anchor: "center", size: 32 });
  }
  UI.text("walk", kx + (3 * K + 2 * G2) / 2, ky + 2 * K + G2 + 8, { anchor: "top", color: UI.BLUE_DEEP });
  UI.text("point", x + w * 0.8, y + h - 18, { anchor: "top", color: UI.BLUE_DEEP });
};

// Polaroids: the party's first two, a tap landing on one and the silver
// tape moving across to it, then back.
TIPS.DEMOS.polaroids = (x, y, w, h, t) => {
  const ids = G.run && G.run.companions && G.run.companions.length >= 2
    ? G.run.companions.slice(0, 2)
    : (typeof CHARACTERS !== "undefined" ? CHARACTERS.slice(0, 2).map((c) => c.id) : []);
  const PW = 70, PH = 84, gap = 26;
  const px = (i) => x + w / 2 - PW - gap / 2 + i * (PW + gap), py = y + 8;
  const cyc = t % 3.2, chosen = cyc < 1.6 ? 1 : 0;
  const tapAt = cyc < 1.6 ? cyc : cyc - 1.6;   // a tap lands at the start of each half
  for (let i = 0; i < ids.length; i++) {
    UI.card(vec2(px(i), py), PW, PH, { fill: UI.WHITE });
    UI.R(px(i) + 6, py + 6, PW - 12, PH - 30, UI.INK);
    UI.R(px(i) + 7, py + 7, PW - 14, PH - 32, UI.PHOTO);
  }
  // the tape on the chosen one
  UI.R(px(chosen) + PW / 2 - 16, py - 7, 32, 12, UI.INK);
  UI.R(px(chosen) + PW / 2 - 14, py - 5, 28, 8, UI.STEEL);
  // the tap: a fingertip pressing, then a ring spreading from it
  const tp = vec2(px(chosen) + PW / 2 + 12, py + PH / 2 + 4);
  if (tapAt < 0.5) {
    const k = tapAt / 0.5;
    drawCircle({ pos: tp, radius: 10 + k * 26, color: UI.rgb(UI.BLUE), opacity: 0.45 * (1 - k) });
    tipsRing(tp.add(6, 10), 12, THUMB, UI.INK, 0.9);
  }
  for (let i = 0; i < ids.length; i++) {
    const reg = G.SPR && G.SPR["ch-" + ids[i]];
    if (!reg) continue;
    drawSprite({ sprite: reg.name, frame: 0, pos: vec2(px(i) + PW / 2, py + PH - 25), anchor: "bot", scale: (PH - 34) / reg.h });
  }
  for (let i = 0; i < ids.length; i++) {
    const c = G.char(ids[i]);
    UI.text(c ? c.name.toLowerCase() : "", px(i) + PW / 2, py + PH - 22, { anchor: "top" });
  }
  const who = G.char(ids[chosen]);
  if (who) UI.label(who.name.toUpperCase() + "'S GO", x + w / 2, py + PH + 8, { size: 8, anchor: "top", color: UI.BLUE_DEEP, shadow: false });
};
