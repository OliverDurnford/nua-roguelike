// ============================================================
// UI: HUD, touch controls, and the visual-polish helpers.
// Design language: chunky pixel-art panels (ink outline, warm
// wood-toned bevel, notched square corners) over the painted
// venues, gold accents, segmented meter bars, cinematic vignette.
// Everything is code-drawn - no asset files needed.
// ============================================================

const UI = {};

UI.GOLD = [255, 214, 92];
UI.INK = [9, 10, 16];
// panel palette sampled from the Gonzo's plate, 26 Aug 2026 art pass
UI.PANEL_FILL = [36, 20, 18];    // #241412 warm near-black fill
UI.PANEL_BEVEL = [90, 58, 40];   // #5a3a28 muted warm wood - top/left highlight
UI.PANEL_SHADOW = [21, 10, 9];   // #150a09 deep inner shadow - bottom/right

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

// quick black fade-in at the start of every scene - makes cuts feel intentional
UI.sceneFade = () => {
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

// ---------- drawing helpers (used inside onDraw) ----------

// Chunky pixel-art frame: 2px ink outline, a 1px bevel just inside it
// (light on top/left, shadow on bottom/right), a flat fill, and a
// notched corner pixel (the fill peeks through the ink's very corner)
// so square panels chamfer like pixel art instead of reading as a
// rounded web box. `p` is top-left unless opts.center is set.
// Shared by every panel-ish drawer below - dPanel, portrait boxes,
// the speech chip and the title banner all call this one helper.
UI._frame = (p, w, h, opts = {}) => {
  const outlineW = 2, bevelW = 1, notch = 2;
  const op = opts.opacity !== undefined ? opts.opacity : 1;
  const fillOp = (opts.fillOpacity !== undefined ? opts.fillOpacity : 0.94) * op;
  const fillCol = opts.fill || UI.PANEL_FILL;
  const light = opts.light || UI.PANEL_BEVEL;
  const shadow = opts.shadow || UI.PANEL_SHADOW;
  const tl = opts.center ? vec2(p.x - w / 2, p.y - h / 2) : p;

  // ink base - its edges double as the outline once the fill covers the middle
  drawRect({ pos: tl, width: w, height: h, color: rgb(UI.INK[0], UI.INK[1], UI.INK[2]), opacity: op });

  const fx = tl.x + outlineW, fy = tl.y + outlineW, fw = w - outlineW * 2, fh = h - outlineW * 2;
  if (fw > 0 && fh > 0) {
    drawRect({ pos: vec2(fx, fy), width: fw, height: fh, color: rgb(fillCol[0], fillCol[1], fillCol[2]), opacity: fillOp });
    // bevel: light top/left, shadow bottom/right, laid right on the fill's inner edge
    drawRect({ pos: vec2(fx, fy), width: fw, height: bevelW, color: rgb(light[0], light[1], light[2]), opacity: fillOp });
    drawRect({ pos: vec2(fx, fy), width: bevelW, height: fh, color: rgb(light[0], light[1], light[2]), opacity: fillOp });
    drawRect({ pos: vec2(fx, fy + fh - bevelW), width: fw, height: bevelW, color: rgb(shadow[0], shadow[1], shadow[2]), opacity: fillOp });
    drawRect({ pos: vec2(fx + fw - bevelW, fy), width: bevelW, height: fh, color: rgb(shadow[0], shadow[1], shadow[2]), opacity: fillOp });
  }

  // notch: skip the ink's very corner pixel by letting the fill colour
  // show through instead, so each corner chamfers by one pixel
  const corners = [
    vec2(tl.x, tl.y), vec2(tl.x + w - notch, tl.y),
    vec2(tl.x, tl.y + h - notch), vec2(tl.x + w - notch, tl.y + h - notch),
  ];
  corners.forEach((c) => {
    drawRect({ pos: c, width: notch, height: notch, color: rgb(fillCol[0], fillCol[1], fillCol[2]), opacity: fillOp });
  });

  // optional short gold L-brackets at the four corners (titleCard banner)
  if (opts.goldCorners) {
    const armW = Math.min(14, Math.floor(Math.min(w, h) / 3)), armT = 2;
    const g = UI.GOLD;
    const drawL = (cornerX, cornerY, signX, signY) => {
      const xThick = signX > 0 ? cornerX : cornerX - armW;
      const yThin = signY > 0 ? cornerY : cornerY - armT;
      const xThin = signX > 0 ? cornerX : cornerX - armT;
      const yThick = signY > 0 ? cornerY : cornerY - armW;
      drawRect({ pos: vec2(xThick, yThin), width: armW, height: armT, color: rgb(g[0], g[1], g[2]), opacity: op });
      drawRect({ pos: vec2(xThin, yThick), width: armT, height: armW, color: rgb(g[0], g[1], g[2]), opacity: op });
    };
    drawL(tl.x, tl.y, 1, 1);
    drawL(tl.x + w, tl.y, -1, 1);
    drawL(tl.x, tl.y + h, 1, -1);
    drawL(tl.x + w, tl.y + h, -1, -1);
  }
};

// chunky pixel panel (was: translucent rounded panel with a hairline
// edge). `r` is kept in the signature so every existing call site
// still works, but corners are square pixel-art now, so it's ignored.
UI.dPanel = (p, w, h, r = 12) => {
  UI._frame(p, w, h);
};

UI.dGlow = (p, size, col, op) => {
  drawSprite({ sprite: "glow", pos: p, anchor: "center", scale: size / 96, color: rgb(col[0], col[1], col[2]), opacity: op });
};

// ---------- tiny effect helpers ----------

UI.floatText = (p, str, col, big = false) => {
  // dark copy underneath + bright copy on top = readable on any floor
  const o = add([
    text(str, { size: big ? 18 : 14 }),
    pos(p), anchor("center"),
    color(10, 10, 14),
    opacity(1),
    move(vec2(0, -1), 42),
    lifespan(1.2, { fade: 0.6 }),
    z(150), "fx",
  ]);
  const top = o.add([
    text(str, { size: big ? 18 : 14 }),
    pos(-1, -2), anchor("center"),
    color(col[0], col[1], col[2]),
    opacity(1),
  ]);
  o.onUpdate(() => { top.opacity = o.opacity; });
};

// Speech bubble: a chip with a tail that hangs above a character and
// FOLLOWS them as they move, outlined in the speaker's colour. This is
// how all spoken dialogue is shown - floatText is for damage numbers
// and system feedback only, so speech is always clearly attributed.
UI._bubbles = [];

UI.speech = (ent, str, accent = [255, 255, 255]) => {
  if (!ent || !ent.exists()) return;
  // one bubble per character - a new line replaces the old one
  if (ent._bubble && ent._bubble.exists()) destroy(ent._bubble);
  UI._bubbles = UI._bubbles.filter((b) => b.exists());

  const wrapW = 230;
  const textW = str.length * 7.4;
  const w = Math.min(wrapW, textW) + 24;
  const lineCount = Math.max(1, Math.ceil(textW / wrapW));
  const h = lineCount * 15 + 15;
  const dur = 1.7 + Math.min(2, str.length * 0.035);

  // if a neighbour is already speaking, stack this bubble above theirs
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

  // pixel frame chip: same helper as dPanel, with the speaker's accent
  // colour standing in for the bevel's light edge so each character's
  // lines still read as clearly attributed
  const chip = root.add([pos(0, 0), opacity(0)]);
  chip.onDraw(() => {
    UI._frame(vec2(0, 0), w, h, { center: true, opacity: chip.opacity, light: accent });
  });
  const tail = root.add([
    rect(9, 9), pos(0, h / 2 + 1), anchor("center"), rotate(45),
    color(UI.INK[0], UI.INK[1], UI.INK[2]), opacity(0),
  ]);
  const txt = root.add([
    text(str, { size: 13, width: w - 16, align: "center" }),
    anchor("center"), color(255, 245, 225), opacity(0),
  ]);

  root.onUpdate(() => {
    const gone = !ent.exists();
    if (!gone) {
      root.pos = ent.pos.add(0, -50 - h / 2 - root.lift);
      // keep the bubble inside the map so it never clips off the edges
      if (G.mapBounds) {
        root.pos.x = G.clamp(root.pos.x, w / 2 + 10, Math.max(w / 2 + 10, G.mapBounds.x2 - w / 2 - 10));
        root.pos.y = Math.max(root.pos.y, h / 2 + 10);
      }
    }
    if (!G.paused) root.t += dt();
    if (gone) root.t = Math.max(root.t, dur - 0.25);

    let op;
    if (root.t < 0.15) op = root.t / 0.15;                       // fade in
    else if (root.t > dur - 0.3) op = Math.max(0, (dur - root.t) / 0.3);  // fade out
    else op = 1;

    chip.opacity = op * 0.88;
    tail.opacity = op * 0.88;
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

// subtitles in a sleek bottom chip
UI.subtitleSeq = (lines) => {
  lines.forEach((ln, i) => {
    wait(i * 2.0, () => {
      const chip = add([
        rect(24 + ln.length * 8.4, 34, { radius: 17 }),
        pos(G.W / 2, G.H - 46), anchor("center"),
        color(UI.INK[0], UI.INK[1], UI.INK[2]), opacity(0), fixed(), z(190),
      ]);
      const t = add([
        text(ln, { size: 15 }), pos(G.W / 2, G.H - 46), anchor("center"),
        color(255, 240, 200), fixed(), z(191), opacity(0),
      ]);
      UI.fadeObj(chip, 0.7, 0.18);
      UI.fadeObj(t, 1, 0.18);
      wait(1.65, () => {
        chip.onUpdate(() => { chip.opacity -= dt() * 5; if (chip.opacity <= 0) destroy(chip); });
        t.onUpdate(() => { t.opacity -= dt() * 5; if (t.opacity <= 0) destroy(t); });
      });
    });
  });
};

// chapter / area title card - slides in with a gold underline sweep
UI.titleCard = (chapterTitle, areaName, big) => {
  const items = [];
  const baseX = 28, baseY = 96;   // below the HUD panel so they never overlap

  if (big) {
    const t1 = add([text(chapterTitle, { size: 30 }), pos(baseX, baseY), fixed(), z(195), opacity(1)]);
    const t2 = add([text(areaName, { size: 17 }), pos(baseX, baseY + 40), color(195, 200, 215), fixed(), z(195), opacity(1)]);
    UI.slideIn(t1, vec2(baseX - 46, baseY), vec2(baseX, baseY), 0.5);
    UI.slideIn(t2, vec2(baseX - 46, baseY + 40), vec2(baseX, baseY + 40), 0.5, 0.12);
    // underline sweep
    const line = add([rect(0, 3), pos(baseX, baseY + 36), color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), fixed(), z(195), opacity(1)]);
    let lt = 0;
    const lineW = Math.min(330, chapterTitle.length * 16);
    line.onUpdate(() => { lt += dt(); line.width = lineW * UI.ease(lt / 0.6); });

    // solid pixel banner behind the text (was a soft glow) - gold corner
    // brackets, same slide-in as the title, same fade-out below since
    // it rides along in `items`
    const bx0 = baseX - 18, by0 = baseY - 14, bw = lineW + 56, bh = 84;
    const banner = add([pos(bx0, by0), opacity(0), fixed(), z(194)]);
    banner.onDraw(() => { UI._frame(vec2(0, 0), bw, bh, { opacity: banner.opacity, goldCorners: true }); });
    UI.slideIn(banner, vec2(bx0 - 46, by0), vec2(bx0, by0), 0.5);

    items.push(t1, t2, line, banner);
  } else {
    const t = add([text(areaName, { size: 19 }), pos(baseX, baseY), fixed(), z(195), opacity(1)]);
    const line = add([rect(0, 3), pos(baseX, baseY + 26), color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), fixed(), z(195), opacity(1)]);
    UI.slideIn(t, vec2(baseX - 36, baseY), vec2(baseX, baseY), 0.45);
    let lt = 0;
    const lineW = Math.min(260, areaName.length * 11);
    line.onUpdate(() => { lt += dt(); line.width = lineW * UI.ease(lt / 0.5); });

    const bx0 = baseX - 16, by0 = baseY - 12, bw = lineW + 48, bh = 48;
    const banner = add([pos(bx0, by0), opacity(0), fixed(), z(194)]);
    banner.onDraw(() => { UI._frame(vec2(0, 0), bw, bh, { opacity: banner.opacity, goldCorners: true }); });
    UI.slideIn(banner, vec2(bx0 - 36, by0), vec2(bx0, by0), 0.45);

    items.push(t, line, banner);
  }

  wait(2.8, () => {
    items.forEach((it) => {
      it.onUpdate(() => {
        it.opacity -= dt() * 1.8;
        if (it.opacity <= 0) destroy(it);
      });
    });
  });
};

// ---------- HUD ----------

UI.PORTRAIT = { x: () => G.W - 4 * 54 - 22, y: 14, w: 46, gap: 54 };

UI.hud = () => {
  const hud = add([fixed(), z(170), pos(0, 0), {
    meterDisp: 0,
    lastSel: -1,
    selPop: 0,
    lastHp: null,
    hurtPulse: 0,
    trackToken: -1,   // last SOUNDTRACK.token seen
    trackT: 0,        // seconds since this track started
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

    // ===== top-left: hearts + special meter panel =====
    const heartsW = s.maxHp * 28;
    const mw = 200;
    const panelW = Math.max(heartsW, mw) + 30;
    UI.dPanel(vec2(14, 12), panelW, 66);

    const lowHp = r.hp <= 2;
    for (let i = 0; i < s.maxHp; i++) {
      const filled = i < r.hp;
      const hx = 32 + i * 28;
      let sc = 2;
      if (filled && lowHp) sc = 2 + Math.sin(time() * 7 + i) * 0.22;          // low-health pulse
      if (hud.hurtPulse > 0 && i === r.hp) sc = 2 + hud.hurtPulse * 0.8;       // the heart you just lost pops
      drawSprite({ sprite: filled ? "heart" : "heart-empty", pos: vec2(hx, 34), anchor: "center", scale: sc });
    }

    // special meter - square pixel track, segmented block fill, shimmer when ready
    const bx = 26, by = 52, mh = 11;
    drawRect({ pos: vec2(bx, by), width: mw, height: mh, color: rgb(30, 31, 42) });
    const fw = mw * hud.meterDisp;
    if (fw > 4) {
      // blocky fill: an 8px block every 9px (1px gap between), each block
      // stamped with the full gradient sprite - simplest way to keep the
      // segmented pixel-art read without slicing the gradient texture
      const blockW = 8, period = 9, innerH = mh - 2;
      const gradSpr = r.meter >= 1 ? "grad-gold" : "grad-violet";
      for (let off = 0; off < fw; off += period) {
        const w = Math.min(blockW, fw - off);
        if (w <= 0) break;
        drawSprite({
          sprite: gradSpr,
          pos: vec2(bx + 1 + off, by + 1),
          scale: vec2(w / 64, innerH / 8),
        });
      }
    }
    if (r.meter >= 1) {
      // glow + travelling shimmer
      UI.dGlow(vec2(bx + mw / 2, by + mh / 2), mw * 1.25, UI.GOLD, 0.16 + Math.sin(time() * 5) * 0.06);
      const sx = bx + ((time() * 130) % mw);
      drawRect({ pos: vec2(Math.min(sx, bx + mw - 14), by + 1), width: 14, height: mh - 2, radius: 5, color: rgb(255, 255, 255), opacity: 0.4 });
    }
    if (r.companions.length > 0) {
      const sel = G.char(r.companions[r.selected]);
      const ready = r.meter >= 1;
      const label = ready
        ? sel.special.name.toUpperCase() + "  -  SPACE"
        : sel.name + "'s special";
      drawText({
        text: label, size: 11,
        pos: vec2(bx + mw + 10, by + 1),
        color: ready ? rgb(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]) : rgb(150, 152, 168),
        opacity: ready ? 0.75 + Math.sin(time() * 5) * 0.25 : 1,
      });
    }
    if (r.shield > 0) {
      drawText({ text: "cosy shield " + r.shield.toFixed(1) + "s", size: 11, pos: vec2(26, 84), color: rgb(140, 185, 235) });
    }

    // ===== top-right: companion portraits =====
    const P = UI.PORTRAIT;
    UI.dPanel(vec2(P.x() - 10, 8), 4 * P.gap + 16, 62);
    for (let i = 0; i < 4; i++) {
      const x = P.x() + i * P.gap;
      const cx2 = x + P.w / 2, cy2 = P.y + P.w / 2;
      const isSel = i === r.selected && i < r.companions.length;

      if (isSel) {
        UI.dGlow(vec2(cx2, cy2), 110 + hud.selPop * 30, UI.GOLD, 0.3);
      }
      // same pixel frame as dPanel - selection reads through the glow
      // above plus a gold bevel edge here instead of a whole-outline colour swap
      UI._frame(vec2(x, P.y), P.w, P.w, {
        opacity: i < r.companions.length ? 0.95 : 0.45,
        light: isSel ? UI.GOLD : UI.PANEL_BEVEL,
      });

      if (i < r.companions.length) {
        const c = G.char(r.companions[i]);
        const reg = G.SPR["ch-" + c.id];
        const popSc = isSel ? 1 + hud.selPop * 0.18 : 1;
        drawSprite({
          sprite: reg.name,
          pos: vec2(cx2, cy2 + 3),
          anchor: "center",
          scale: ((P.w - 12) / reg.h) * popSc,
        });
        drawText({ text: String(i + 1), size: 9, pos: vec2(x + 5, P.y + 4), color: rgb(150, 152, 168) });
      } else {
        drawText({ text: "·", size: 18, pos: vec2(cx2, cy2), anchor: "center", color: rgb(110, 112, 130), opacity: 0.5 });
      }
    }

    // ===== the record: announces each new song =====
    // Its own timer, reset by SOUNDTRACK.token rather than the audio
    // element's currentTime, so a looping track does not re-trigger the
    // reveal and a paused tab does not drift.
    if (typeof SOUNDTRACK !== "undefined" && SOUNDTRACK.current) {
      if (hud.trackToken !== SOUNDTRACK.token) {
        hud.trackToken = SOUNDTRACK.token;
        hud.trackT = 0;
      }
      hud.trackT += dt();

      const T = hud.trackT;
      const REVEAL = SOUNDTRACK.REVEAL_AT;   // 10s
      const OUT_AT = REVEAL + 4;             // linger 4s on the title
      const IN_DUR = 0.45, OUT_DUR = 0.5;

      if (T < OUT_AT + OUT_DUR) {
        const ease = (x) => 1 - Math.pow(1 - x, 3);
        const inK = ease(Math.min(1, T / IN_DUR));
        const outK = ease(Math.max(0, Math.min(1, (T - OUT_AT) / OUT_DUR)));
        // slides in from off the right edge, and back out the same way
        const slide = (1 - inK) * 110 + outK * 110;
        const alpha = Math.min(inK, 1 - outK);

        const cx = 920 + slide, cy = 112;
        drawSprite({
          sprite: "record",
          pos: vec2(cx, cy),
          anchor: "center",
          angle: time() * 150,      // about 0.4 turns a second
          width: 44, height: 44,
          opacity: alpha,
        });

        // "???" until the reveal, then the title, with a brief pop
        const revealed = T >= REVEAL;
        const pop = revealed ? Math.max(0, 1 - (T - REVEAL) / 0.35) : 0;
        drawText({
          text: revealed ? SOUNDTRACK.current.title : "???",
          size: 12 + pop * 4,
          pos: vec2(cx - 34, cy),
          anchor: "right",
          color: revealed
            ? rgb(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2])
            : rgb(150, 152, 168),
          opacity: alpha,
        });
      }
    }

    // ===== mobile special button =====
    if (isTouchscreen()) {
      const bp = vec2(G.W - 72, G.H - 72);
      const ready = r.meter >= 1;
      if (ready) UI.dGlow(bp, 200 + Math.sin(time() * 5) * 24, UI.GOLD, 0.4);
      drawCircle({ pos: bp, radius: 46, color: rgb(20, 21, 30), opacity: 0.78 });
      drawCircle({
        pos: bp, radius: 46, fill: false,
        outline: { width: 2.5, color: ready ? rgb(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]) : rgb(255, 255, 255) },
        opacity: ready ? 0.95 : 0.18,
      });
      drawText({ text: "SP", size: 21, pos: bp, anchor: "center", color: ready ? rgb(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]) : rgb(120, 122, 140) });
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

  // taps: companion portraits + mobile special button
  onMousePress(() => {
    if (!G.run) return;
    const m = mousePos();
    const P = UI.PORTRAIT;
    for (let i = 0; i < G.run.companions.length; i++) {
      const x = P.x() + i * P.gap;
      if (m.x >= x && m.x <= x + P.w && m.y >= P.y && m.y <= P.y + P.w) {
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
    UI.subtitleSeq([on ? "sound ON" : "sound OFF"]);
    if (on) SFX.play("uiconfirm");
  });

  // ----- dev / testing cheats (see README) -----
  onKeyPress("k", () => { get("enemy").forEach((e) => ENEMIES.hit(e, 999, 0)); get("boss").forEach((b) => ENEMIES.hit(b, 999, 0)); });
  onKeyPress("h", () => { if (G.run) G.run.hp = G.stats().maxHp; });
  onKeyPress("m", () => { if (G.run) G.run.meter = 1; });
  onKeyPress("g", () => { G.godMode = !G.godMode; UI.subtitleSeq([G.godMode ? "god mode ON" : "god mode OFF"]); });
  onKeyPress("]", () => { if (G.devSkip) G.devSkip(); });
};

// ---------- mobile virtual joystick ----------

UI.mobileControls = () => {
  if (!isTouchscreen()) return;

  let stickId = null;
  let anchorPos = null;
  // pixel-frame touch stick: warm bevel-tone ring with an ink outline,
  // gold knob so it reads with the same ink+accent language as the
  // rest of the reskin - positions, radii and hit areas unchanged
  const base = add([
    circle(54), pos(-999, -999),
    color(UI.PANEL_BEVEL[0], UI.PANEL_BEVEL[1], UI.PANEL_BEVEL[2]), opacity(0.22),
    outline(2, rgb(UI.INK[0], UI.INK[1], UI.INK[2])),
    fixed(), z(185),
  ]);
  const baseRing = add([circle(54), pos(-999, -999), color(255, 255, 255), opacity(0), fixed(), z(185)]);
  const knob = add([
    circle(24), pos(-999, -999),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0.55),
    outline(2, rgb(UI.INK[0], UI.INK[1], UI.INK[2])),
    fixed(), z(186),
  ]);

  const hide = () => {
    base.pos = vec2(-999, -999);
    baseRing.pos = vec2(-999, -999);
    knob.pos = vec2(-999, -999);
    G.joy = vec2(0, 0);
    stickId = null;
  };

  onTouchStart((p, t) => {
    if (p.x < G.W * 0.5 && stickId === null) {
      stickId = t ? t.identifier : 0;
      anchorPos = p;
      base.pos = p;
      baseRing.pos = p;
      knob.pos = p;
    }
  });
  onTouchMove((p, t) => {
    if (stickId === null || (t && t.identifier !== stickId)) return;
    let d = p.sub(anchorPos);
    if (d.len() > 54) d = d.unit().scale(54);
    knob.pos = anchorPos.add(d);
    G.joy = d.scale(1 / 54);
  });
  onTouchEnd((p, t) => {
    if (stickId === null || (t && t.identifier !== stickId)) return;
    hide();
  });
};
