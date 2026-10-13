// ============================================================
// ADMIN: Ollie's testing controls (13 Oct 2026).
//
// A quiet "admin" chip bottom left of the title, once the cover is
// up. It asks for a PIN; the right one turns admin on, and it stays
// on, on that phone or computer, until the chip is tapped again. With
// admin on, every room has a back and a forward arrow either side of
// PAUSE, which jump straight to the previous or next room in the run
// (the park first, then chapters 1 to 5), at full health.
//
// The repo is public, so the PIN is no lock against anyone who reads
// the code: it only keeps the friends from wandering in by accident.
// ============================================================

const ADMIN = {};

ADMIN.PIN = "2105";
ADMIN.KEY = "tenyears-admin";
ADMIN.on = (() => { try { return localStorage.getItem(ADMIN.KEY) === "on"; } catch (e) { return false; } })();
ADMIN.padOpen = false;
ADMIN.closedAt = -1;
// true while the pad is up, and for a moment after, so the tap that
// closes it never also lands on whatever is underneath
ADMIN.busy = () => ADMIN.padOpen || time() - ADMIN.closedAt < 0.3;

ADMIN.set = (on) => {
  ADMIN.on = on;
  try { on ? localStorage.setItem(ADMIN.KEY, "on") : localStorage.removeItem(ADMIN.KEY); } catch (e) {}
};

// ---------- the rooms, in the order a run meets them ----------
ADMIN.stops = () => {
  const s = [{ scene: "tutorial" }];
  CHAPTERS.forEach((ch, ci) => ch.areas.forEach((_, ai) => s.push({ scene: "area", chapter: ci + 1, area: ai + 1 })));
  return s;
};

ADMIN.jump = (d) => {
  if (!G.run) return;
  const stops = ADMIN.stops();
  const i = G.where === "tutorial" ? 0
    : stops.findIndex((s) => s.chapter === G.run.chapter && s.area === G.run.area);
  const j = Math.max(0, Math.min(stops.length - 1, i + d));
  if (j === i) { UI.toast(d > 0 ? "that's the last room" : "that's the first room"); return; }
  const s = stops[j];
  SFX.play("uiconfirm");
  G.run.hp = G.stats().maxHp;
  G.paused = false;
  debug.paused = false;
  if (s.scene === "tutorial") go("tutorial");
  else go("area", { chapter: s.chapter, area: s.area });
};

// ---------- the arrows beside PAUSE ----------
// Either side of the pause chip, the same height, with a gap that a
// thumb's tap zone can sit in. Hidden (and dead) whenever PAUSE is.
ADMIN.arrowRects = () => {
  const b = UI.PAUSE_BTN, w = Math.round(b.h * 1.6), gap = 12;
  return [
    { d: -1, x: b.x - gap - w, y: b.y, w, h: b.h },
    { d: 1, x: b.x + b.w + gap, y: b.y, w, h: b.h },
  ];
};
ADMIN.arrowsLive = () => ADMIN.on && !UI.pauseOpen && !G.cutscene
  && !(typeof CUTIN !== "undefined" && CUTIN.active);
// -1, 1, or 0 when p is on neither
ADMIN.arrowAt = (p) => {
  if (!ADMIN.arrowsLive()) return 0;
  const pad = isTouchscreen() ? 10 : 0;
  for (const r of ADMIN.arrowRects()) {
    if (p.x >= r.x - pad && p.x <= r.x + r.w + pad && p.y >= r.y - pad && p.y <= r.y + r.h + pad) return r.d;
  }
  return 0;
};
ADMIN.drawArrows = () => {
  if (!ADMIN.arrowsLive()) return;
  for (const r of ADMIN.arrowRects()) {
    UI.card(vec2(r.x, r.y), r.w, r.h, { fill: UI.STEEL, shade: null, notch: false, opacity: 0.85 });
    // a solid pixel triangle, pointing the way it goes
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2, s = Math.round(r.h * 0.26);
    drawTriangle({
      p1: vec2(cx + r.d * s, cy), p2: vec2(cx - r.d * s, cy - s), p3: vec2(cx - r.d * s, cy + s),
      color: UI.rgb(UI.INK), opacity: 0.85,
    });
  }
};

// ---------- the PIN pad ----------
// A paper card with four boxes and a keypad. Digits by tap or key;
// four digits checks it. Wrong shakes and clears; X or ESC closes.
ADMIN.pinPad = (onRight) => {
  if (ADMIN.padOpen) return;
  ADMIN.padOpen = true;
  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "X", "0", "<"];
  const KW = 72, KH = 48, KG = 10;
  const W = 3 * KW + 2 * KG + 48, H = 24 + 16 + 18 + 40 + 20 + 4 * KH + 3 * KG + 24;
  const x0 = Math.round(G.W / 2 - W / 2), y0 = Math.round(G.H / 2 - H / 2);
  const slotsY = y0 + 24 + 16 + 18;
  const keysY = slotsY + 40 + 20;
  const keyRect = (i) => ({
    x: G.W / 2 - (3 * KW + 2 * KG) / 2 + (i % 3) * (KW + KG),
    y: keysY + Math.floor(i / 3) * (KH + KG), w: KW, h: KH,
  });
  let entry = "", wrongT = 0, t = 0;

  const close = () => {
    root.destroy();
    for (const h of handlers) h.cancel();
    ADMIN.padOpen = false;
    ADMIN.closedAt = time();
  };
  const press = (k) => {
    if (wrongT > 0) return;
    if (k === "X") { SFX.play("uitick"); close(); return; }
    if (k === "<") { entry = entry.slice(0, -1); SFX.play("uitick"); return; }
    if (entry.length >= 4) return;
    entry += k;
    SFX.play("uitick");
    if (entry.length === 4) {
      if (entry === ADMIN.PIN) { SFX.play("uiconfirm"); close(); onRight(); }
      else wrongT = 0.45;
    }
  };

  const root = add([fixed(), z(240), pos(0, 0)]);
  root.onUpdate(() => {
    t += dt();
    if (wrongT > 0) { wrongT -= dt(); if (wrongT <= 0) { wrongT = 0; entry = ""; } }
  });
  root.onDraw(() => {
    UI.R(0, 0, G.W, G.H, UI.INK, 0.6);
    UI.card(vec2(x0, y0), W, H, { drop: 4 });
    UI.label("ADMIN", G.W / 2, y0 + 24, { size: 16, anchor: "top", color: UI.TEXT, shadow: false });
    // the four boxes, shaking when it was wrong
    const shake = wrongT > 0 ? Math.sin(t * 60) * 5 : 0;
    for (let i = 0; i < 4; i++) {
      const sx = G.W / 2 - 2 * 44 + 4 + i * 44 + shake;
      UI.R(sx, slotsY, 36, 40, UI.INK);
      UI.R(sx + 2, slotsY + 2, 32, 36, wrongT > 0 ? UI.PINK : UI.WHITE);
      if (i < entry.length) UI.R(sx + 12, slotsY + 14, 12, 12, UI.INK);
    }
    KEYS.forEach((k, i) => {
      const r = keyRect(i);
      UI.card(vec2(r.x, r.y), r.w, r.h, { fill: k === "X" || k === "<" ? UI.PAPER_DIM : UI.CHIP, shade: UI.PAPER_SHADE, notch: false });
      UI.text(k, r.x + r.w / 2, r.y + r.h / 2 + 1, { anchor: "center", size: 32 });
    });
  });
  const handlers = [
    onMousePress(() => {
      if (t < 0.15) return;   // the tap that opened it
      const m = mousePos();
      KEYS.forEach((k, i) => {
        const r = keyRect(i);
        if (m.x >= r.x && m.x <= r.x + r.w && m.y >= r.y && m.y <= r.y + r.h) press(k);
      });
    }),
    onKeyPress((key) => {
      if (/^[0-9]$/.test(key)) press(key);
      else if (key === "backspace") press("<");
      else if (key === "escape") press("X");
    }),
  ];
  SFX.play("uitick");
};
