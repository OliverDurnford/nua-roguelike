// ============================================================
// TROPHIES: the cabinet, from the chip on the title screen, and the
// platinum screen it opens once every trophy is in.
//
// Pixel Polaroids paper on the dark: the platinum on top, the count and
// the tier totals, then every trophy as a scrolling row (cup, name, how
// to get it, then the day it was earned or how far along you are).
// Hidden ones show only their cup and "???" until earned. The cups are
// the only colour that is not silver and blue (Ollie, 16 Oct 2026).
//
// Rules and the save: core/trophies.js. The list: data/trophies.js.
// ============================================================

scene("trophies", () => {
  G.paused = false;
  G.where = "trophies";
  const touch = isTouchscreen();
  const BG = [12, 12, 16];
  const ROW_W = 760, X0 = Math.round((G.W - ROW_W) / 2);
  const ROW_H = 66, GAP = 6;
  const PLAT = { x: X0, y: 52, w: ROW_W, h: 66 };
  const LIST_TOP = 132, LIST_BOT = G.H - 40;
  const list = TROPHIES.list();
  const contentH = list.length * (ROW_H + GAP) - GAP;
  const maxScroll = Math.max(0, contentH - (LIST_BOT - LIST_TOP));
  let scroll = 0;
  add([rect(G.W, G.H), pos(0, 0), color(UI.rgb(BG)), fixed(), z(-1)]);   // its own dark, whatever was behind

  const has = (id) => TROPHIES.has(id);
  const earned = TROPHIES.earnedCount();
  const tiers = { bronze: 0, silver: 0, gold: 0 };
  for (const t of list) if (has(t.id)) tiers[t.tier]++;
  const platOn = has("platinum");

  const backLabel = touch ? "back" : "esc · back";
  const backW = Math.ceil(UI.measure(backLabel, UI.VT, 16).width) + 24;
  const BACK = { x: X0 + ROW_W - backW, y: 14, w: backW, h: 28 };
  const inBox = (p, b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;

  const bar = (x, y, w, h, k) => {
    UI.R(x, y, w, h, UI.INK);
    UI.R(x + 2, y + 2, w - 4, h - 4, UI.SLOT);
    if (k > 0) UI.R(x + 2, y + 2, Math.max(2, Math.round((w - 4) * k)), h - 4, UI.STEEL);
  };

  const row = (t, y) => {
    const got = has(t.id), secret = t.hidden && !got;
    UI.card(vec2(X0, y), ROW_W, ROW_H, { fill: got ? UI.PAPER : UI.PAPER_DIM, shade: got ? UI.PAPER_SHADE : null });
    TROPHIES.drawCup(X0 + 14, y + 19, t.tier, 2, 1, !got);
    const tx = X0 + 60, right = X0 + ROW_W - 16;
    UI.label(secret ? "???" : t.name, tx, y + 12, { size: 16, color: got ? UI.TEXT : UI.SLOT_TEXT, shadow: false });
    // a story trophy keeps its spoiler until it is earned
    UI.text(secret ? "A hidden trophy" : got || !t.before ? t.how : t.before, tx, y + 32, {
      size: 16, width: ROW_W - 60 - (got ? 110 : 150), color: got ? UI.TEXT : UI.SLOT_TEXT, lineSpacing: -2,
    });
    if (got) {
      UI.text(TROPHIES.day(TROPHIES.get().earned[t.id]), right, y + 14, { anchor: "topright", color: UI.BLUE_DEEP });
    } else if (!secret) {
      const p = TROPHIES.progress(t.id);
      if (p && p.of > 1) {
        UI.text(p.n + " of " + p.of, right, y + 14, { anchor: "topright", color: UI.SLOT_TEXT });
        bar(right - 110, y + 36, 110, 10, p.n / p.of);
      }
    }
  };

  onDraw(() => {
    scroll = Math.max(0, Math.min(maxScroll, scroll));
    // the rows, under the header and footer bands drawn after them
    list.forEach((t, i) => {
      const y = LIST_TOP + i * (ROW_H + GAP) - scroll;
      if (y > LIST_BOT || y + ROW_H < LIST_TOP - 8) return;
      row(t, y);
    });
    UI.R(0, 0, G.W, LIST_TOP - 6, BG);
    UI.R(0, LIST_BOT + 4, G.W, G.H - LIST_BOT - 4, BG);
    if (maxScroll > 0) {   // where you are in the list
      const trackH = LIST_BOT - LIST_TOP, thumbH = Math.max(24, trackH * (trackH / contentH));
      UI.R(X0 + ROW_W + 10, LIST_TOP, 4, trackH, UI.SLOT);
      UI.R(X0 + ROW_W + 10, LIST_TOP + (trackH - thumbH) * (scroll / maxScroll), 4, thumbH, UI.STEEL);
    }

    // header: the name, the count, back
    UI.chromeText("TROPHIES", X0, 16, 24);
    UI.chip(backLabel, BACK.x, BACK.y, { fill: UI.STEEL, shade: UI.BLUE });

    // the platinum
    UI.card(vec2(PLAT.x, PLAT.y), PLAT.w, PLAT.h, { fill: platOn ? UI.SILVER : UI.PAPER_DIM, drop: 3 });
    TROPHIES.drawCup(PLAT.x + 14, PLAT.y + 19, "platinum", 2, 1, !platOn);
    UI.label(TROPHY_PLATINUM.name, PLAT.x + 60, PLAT.y + 12, { size: 16, color: platOn ? UI.NAVY : UI.SLOT_TEXT, shadow: false });
    const sub = platOn ? (touch ? "Tap to open" : "Click or press ENTER to open") : TROPHY_PLATINUM.how;
    UI.text(sub, PLAT.x + 60, PLAT.y + 34, { color: platOn ? UI.BLUE_DEEP : UI.SLOT_TEXT });
    // the totals, on the right of it
    const rx = PLAT.x + PLAT.w - 16;
    UI.label(earned + " of " + list.length, rx, PLAT.y + 12, { size: 8, anchor: "topright", color: UI.TEXT, shadow: false });
    bar(rx - 150, PLAT.y + 26, 150, 10, earned / list.length);
    let cx = rx - 150;
    for (const tier of ["bronze", "silver", "gold"]) {
      TROPHIES.drawCup(cx, PLAT.y + 44, tier, 1);
      UI.text(String(tiers[tier]), cx + 20, PLAT.y + 41, { color: UI.TEXT });
      cx += 52;
    }

    // footer
    UI.text(touch ? "drag to scroll" : "scroll, or the arrow keys", G.W / 2, G.H - 22, { anchor: "center", color: UI.SLOT_TEXT });
  });

  const back = () => { SFX.play("uitick"); go("title"); };
  const openPlat = () => { if (!platOn) return; SFX.play("uiconfirm"); go("platinum"); };

  onKeyPress("escape", back);
  onKeyPress("backspace", back);
  onKeyPress("t", back);
  onKeyPress("enter", openPlat);
  onKeyDown("down", () => { scroll += 520 * dt(); });
  onKeyDown("s", () => { scroll += 520 * dt(); });
  onKeyDown("up", () => { scroll -= 520 * dt(); });
  onKeyDown("w", () => { scroll -= 520 * dt(); });
  onKeyPress("pagedown", () => { scroll += LIST_BOT - LIST_TOP - ROW_H; });
  onKeyPress("pageup", () => { scroll -= LIST_BOT - LIST_TOP - ROW_H; });
  onScroll((d) => { scroll += d.y; });

  // drag to scroll (a finger is a mouse here); a press that barely moves is a tap
  let press = null;
  onMousePress(() => { press = { at: mousePos(), scroll, moved: 0 }; });
  onMouseMove(() => {
    if (!press || !isMouseDown()) return;
    const dy = mousePos().y - press.at.y;
    press.moved = Math.max(press.moved, Math.abs(dy));
    scroll = press.scroll - dy;
  });
  onMouseRelease(() => {
    const p = press;
    press = null;
    if (!p || p.moved > 8) return;
    if (inBox(p.at, BACK)) return back();
    if (inBox(p.at, PLAT)) return openPlat();
  });

  UI.sceneFade();
});

// The platinum: the ten together, Ollie's note, when, and the proof code.
scene("platinum", () => {
  G.paused = false;
  G.where = "platinum";
  const touch = isTouchscreen();
  const s = TROPHIES.get();
  if (!s.seenPlatinum) { s.seenPlatinum = true; TROPHIES.save(); }
  const proof = TROPHIES.proof();
  add([rect(G.W, G.H), pos(0, 0), color(12, 12, 16), fixed(), z(-1)]);

  // the ten, standing in a row, breathing
  const ten = TROPHIES.ten();
  const H = 96, FEET = 236, STEP = 80, X = G.W / 2 - (STEP * (ten.length - 1)) / 2;
  ten.forEach((id, i) => {
    if (!G.SPR["ch-" + id]) return;
    add([...ART.charComps(id, H), pos(X + i * STEP, FEET - H / 2), z(10)]);
  });

  const title = TROPHY_PLATINUM.name.toUpperCase();
  const TW = Math.ceil(UI.measure(title, UI.PX, 24).width);
  const CARD = { w: 600, h: 0 };
  const lines = PLATINUM_NOTE;
  CARD.h = 24 + lines.length * 20 + 18 + 24 + 20 + 22;
  const cy = 256;

  onDraw(() => {
    TROPHIES.drawCup(G.W / 2 - 24, 18, "platinum", 3);
    UI.chromeText(title, G.W / 2 - TW / 2, 72, 24);
    const x = G.W / 2 - CARD.w / 2;
    UI.card(vec2(x, cy), CARD.w, CARD.h, { drop: 3 });
    let y = cy + 20;
    for (const ln of lines) {
      UI.text(ln, G.W / 2, y, { anchor: "top", color: UI.TEXT });
      y += 20;
    }
    y += 14;
    UI.R(x + 24, y, CARD.w - 48, 2, UI.PAPER_SHADE);
    y += 12;
    if (proof) {
      UI.text("earned " + TROPHIES.when(proof.ts), G.W / 2, y, { anchor: "top", color: UI.BLUE_DEEP });
      y += 22;
      UI.label("proof code  " + proof.code, G.W / 2, y, { size: 16, anchor: "top", color: UI.NAVY, shadow: false });
    }
    UI.label(PLATINUM_ASK, G.W / 2, cy + CARD.h + 22, { size: 8, anchor: "top", color: UI.SILVER });
    UI.chip(touch ? "back" : "esc · back", G.W / 2, G.H - 26, { anchor: "center", fill: UI.STEEL, shade: UI.BLUE });
  });

  const back = () => { SFX.play("uitick"); go("trophies"); };
  onKeyPress("escape", back);
  onKeyPress("backspace", back);
  onKeyPress("enter", back);
  onMousePress(() => { if (mousePos().y > G.H - 60) back(); });
  SFX.play("platinum");
  UI.sceneFade();
});
