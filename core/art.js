// ============================================================
// ART — placeholder sprite generation.
// Draws every character, enemy and boss onto small canvases at
// boot and loads them as sprites. Real art replaces these later
// by dropping PNGs into sprites/ and swapping the loadSprite
// calls (see README).
// Ollie and Annie already use their real sprites (embedded in
// core/sprites-real.js so the game runs from a double-click).
// ============================================================

const ART = {};

ART.css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

// ---------- character placeholder (chibi proportions to match the real sprites) ----------
ART.genChar = (c, opts = {}) => {
  const h = c.height;                       // native pixel height (34-46)
  const w = Math.round(h * 0.72);
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const x = cv.getContext("2d");

  const skin = ART.css(c.colors.skin);
  const hair = ART.css(opts.old ? [170, 170, 175] : c.colors.hair);
  const top = ART.css(opts.old ? [120, 110, 115] : c.colors.top);
  const bottom = ART.css(c.colors.bottom);

  const headH = Math.round(h * 0.46);       // big chibi head
  const cx = w / 2;

  // legs
  x.fillStyle = bottom;
  x.fillRect(Math.round(cx - w * 0.24), Math.round(h * 0.78), Math.round(w * 0.2), Math.round(h * 0.2));
  x.fillRect(Math.round(cx + w * 0.04), Math.round(h * 0.78), Math.round(w * 0.2), Math.round(h * 0.2));
  // torso
  x.fillStyle = top;
  x.fillRect(Math.round(cx - w * 0.3), Math.round(h * 0.46), Math.round(w * 0.6), Math.round(h * 0.34));
  // arms
  x.fillStyle = skin;
  x.fillRect(Math.round(cx - w * 0.42), Math.round(h * 0.5), Math.round(w * 0.12), Math.round(h * 0.22));
  x.fillRect(Math.round(cx + w * 0.3), Math.round(h * 0.5), Math.round(w * 0.12), Math.round(h * 0.22));
  // head
  x.fillStyle = skin;
  x.beginPath();
  x.arc(cx, headH * 0.62, headH * 0.52, 0, Math.PI * 2);
  x.fill();
  // hair (top arc + slight sides)
  x.fillStyle = hair;
  x.beginPath();
  x.arc(cx, headH * 0.55, headH * 0.54, Math.PI * 0.95, Math.PI * 2.05);
  x.fill();
  // eyes
  x.fillStyle = "#26222a";
  const eyeY = Math.round(headH * 0.65);
  x.fillRect(Math.round(cx - headH * 0.26), eyeY, 2, 3);
  x.fillRect(Math.round(cx + headH * 0.26) - 2, eyeY, 2, 3);
  // smile
  x.fillRect(Math.round(cx - 2), Math.round(headH * 0.86), 4, 1);

  return cv.toDataURL();
};

// ---------- enemy placeholder ----------
ART.genEnemy = (type, color, size) => {
  const s = size;
  const cv = document.createElement("canvas");
  cv.width = s; cv.height = s;
  const x = cv.getContext("2d");
  const main = ART.css(color);
  const dark = ART.css(color.map((v) => Math.max(0, v - 60)));

  x.fillStyle = main;
  x.strokeStyle = dark;
  x.lineWidth = 2;
  if (type === "brute") {
    x.fillRect(2, 2, s - 4, s - 4);
    x.strokeRect(2, 2, s - 4, s - 4);
  } else if (type === "shooter") {
    x.beginPath();
    x.moveTo(s / 2, 2); x.lineTo(s - 2, s / 2); x.lineTo(s / 2, s - 2); x.lineTo(2, s / 2);
    x.closePath(); x.fill(); x.stroke();
  } else {
    x.beginPath();
    x.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
    x.fill(); x.stroke();
  }
  // angry eyes
  x.fillStyle = "#1a161e";
  const e = Math.max(2, Math.round(s * 0.09));
  x.fillRect(Math.round(s * 0.32), Math.round(s * 0.4), e, e);
  x.fillRect(Math.round(s * 0.68) - e, Math.round(s * 0.4), e, e);
  return cv.toDataURL();
};

// ---------- boss placeholder ----------
ART.genBoss = (color, size) => {
  const s = size;
  const cv = document.createElement("canvas");
  cv.width = s; cv.height = s;
  const x = cv.getContext("2d");
  const main = ART.css(color);
  const dark = ART.css(color.map((v) => Math.max(0, v - 70)));

  // spiky blob
  x.fillStyle = dark;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const px = s / 2 + Math.cos(a) * (s / 2 - 4);
    const py = s / 2 + Math.sin(a) * (s / 2 - 4);
    x.beginPath(); x.arc(px, py, s * 0.1, 0, Math.PI * 2); x.fill();
  }
  x.fillStyle = main;
  x.beginPath(); x.arc(s / 2, s / 2, s / 2 - s * 0.12, 0, Math.PI * 2); x.fill();
  // furious eyes
  x.fillStyle = "#15121a";
  const e = Math.round(s * 0.08);
  x.save();
  x.translate(s / 2, s / 2);
  x.fillRect(-e * 2.4, -e, e * 1.4, e * 2);
  x.fillRect(e * 1.0, -e, e * 1.4, e * 2);
  x.restore();
  return cv.toDataURL();
};

// ---------- pickups & props ----------
ART.genHeart = (fill = "#e0444f", stroke = null) => {
  const cv = document.createElement("canvas");
  cv.width = 14; cv.height = 13;
  const x = cv.getContext("2d");
  const path = () => {
    x.beginPath();
    x.arc(4, 4, 3.4, 0, Math.PI * 2);
    x.arc(10, 4, 3.4, 0, Math.PI * 2);
    x.moveTo(0.8, 5.5); x.lineTo(13.2, 5.5); x.lineTo(7, 12.6); x.closePath();
  };
  x.fillStyle = fill;
  path(); x.fill();
  if (stroke) { x.strokeStyle = stroke; x.lineWidth = 1; path(); x.stroke(); }
  return cv.toDataURL();
};

// ---------- UI polish sprites: glows, gradients, vignette ----------
ART.genGlow = () => {
  const s = 96;
  const cv = document.createElement("canvas");
  cv.width = s; cv.height = s;
  const x = cv.getContext("2d");
  const g = x.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.4, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, s, s);
  return cv.toDataURL();
};

ART.genVignette = () => {
  const w = 480, h = 270;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const x = cv.getContext("2d");
  const g = x.createRadialGradient(w / 2, h / 2, h * 0.42, w / 2, h / 2, h * 0.95);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.85)");
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  return cv.toDataURL();
};

// vertical gradient (backgrounds)
ART.genVGrad = (top, bottom) => {
  const cv = document.createElement("canvas");
  cv.width = 8; cv.height = 256;
  const x = cv.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  x.fillStyle = g;
  x.fillRect(0, 0, 8, 256);
  return cv.toDataURL();
};

// horizontal gradient (meter / bar fills)
ART.genHGrad = (left, right) => {
  const cv = document.createElement("canvas");
  cv.width = 64; cv.height = 8;
  const x = cv.getContext("2d");
  const g = x.createLinearGradient(0, 0, 64, 0);
  g.addColorStop(0, left);
  g.addColorStop(1, right);
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 8);
  return cv.toDataURL();
};

ART.genBall = () => {
  const cv = document.createElement("canvas");
  cv.width = 12; cv.height = 12;
  const x = cv.getContext("2d");
  x.fillStyle = "#f2f0e8";
  x.beginPath(); x.arc(6, 6, 5.4, 0, Math.PI * 2); x.fill();
  x.strokeStyle = "#cc4444"; x.lineWidth = 1;
  x.beginPath(); x.arc(2, 6, 5, -0.8, 0.8); x.stroke();
  x.beginPath(); x.arc(10, 6, 5, Math.PI - 0.8, Math.PI + 0.8); x.stroke();
  return cv.toDataURL();
};

ART.genCar = () => {
  const cv = document.createElement("canvas");
  cv.width = 64; cv.height = 30;
  const x = cv.getContext("2d");
  x.fillStyle = "#b03030";
  x.fillRect(2, 10, 60, 14);
  x.fillRect(14, 3, 32, 10);
  x.fillStyle = "#9ecbe8";
  x.fillRect(17, 5, 11, 7);
  x.fillRect(32, 5, 11, 7);
  x.fillStyle = "#222";
  x.beginPath(); x.arc(14, 25, 5, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(50, 25, 5, 0, Math.PI * 2); x.fill();
  return cv.toDataURL();
};

ART.genCrack = (seed) => {
  const cv = document.createElement("canvas");
  cv.width = 90; cv.height = 36;
  const x = cv.getContext("2d");
  x.strokeStyle = "#0a0a0d";
  x.lineWidth = 5;
  x.lineCap = "round";
  x.beginPath();
  let px = 4, py = 18 + (seed % 3) * 3 - 3;
  x.moveTo(px, py);
  for (let i = 0; i < 6; i++) {
    px += 14;
    py += (i + seed) % 2 === 0 ? -8 : 8;
    x.lineTo(px, py);
  }
  x.stroke();
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(30, 18); x.lineTo(38, 4);
  x.moveTo(56, 16); x.lineTo(66, 30);
  x.stroke();
  return cv.toDataURL();
};

// ---------- load everything ----------
ART.init = () => {
  for (const c of CHARACTERS) {
    if (c.real && REAL_SPRITES[c.id]) {
      loadSprite("ch-" + c.id, REAL_SPRITES[c.id]);
      G.SPR["ch-" + c.id] = { name: "ch-" + c.id, h: 128 };
    } else {
      loadSprite("ch-" + c.id, ART.genChar(c));
      G.SPR["ch-" + c.id] = { name: "ch-" + c.id, h: c.height };
    }
    // old-age variant (used by the final boss) - always generated, even for
    // characters with real sprites, so the boss reads as "placeholder elderly you"
    loadSprite("ch-" + c.id + "-old", ART.genChar(c, { old: true }));
    G.SPR["ch-" + c.id + "-old"] = { name: "ch-" + c.id + "-old", h: c.height };
  }

  // Sized against a person (G.CHAR_H) so the whole room stays in proportion:
  // a runner is a scrawny thing, a brute is bigger than you are.
  const SIZES = {
    chaser:  G.charH(0.81),
    runner:  G.charH(0.62),
    brute:   G.charH(1.14),
    shooter: G.charH(0.76),
  };
  for (const ch of CHAPTERS) {
    ch.enemySet.forEach((en, i) => {
      const key = "en-" + ch.num + "-" + i;
      loadSprite(key, ART.genEnemy(en.type, en.color, SIZES[en.type]));
      en.spr = key;
      en.size = SIZES[en.type];
    });
    loadSprite("boss-" + ch.num, ART.genBoss(ch.boss.color, ch.boss.size));
    // NPC easter eggs defined in area data (e.g. Megan Whiteside)
    ch.areas.forEach((a, ai) => {
      if (a.npc) {
        const key = "npc-" + ch.num + "-" + ai;
        loadSprite(key, ART.genChar(a.npc));
        a.npc.spr = key;
      }
    });
  }

  // Painted room backgrounds (core/plates-real.js), one per venue
  for (const k in PLATES) loadSprite("plate-" + k, PLATES[k]);

  loadSprite("heart", ART.genHeart());
  loadSprite("heart-empty", ART.genHeart("#2c2d3a", "#565a70"));
  loadSprite("ball", ART.genBall());
  loadSprite("car", ART.genCar());
  for (let i = 0; i < 3; i++) loadSprite("crack" + i, ART.genCrack(i));

  // UI polish set
  loadSprite("glow", ART.genGlow());
  loadSprite("vignette", ART.genVignette());
  loadSprite("bg-night", ART.genVGrad("#101322", "#1d1430"));
  loadSprite("grad-gold", ART.genHGrad("#ffb13d", "#ffe27a"));
  loadSprite("grad-violet", ART.genHGrad("#5d4ae0", "#a08bff"));
  loadSprite("grad-red", ART.genHGrad("#a8202e", "#ff5a4e"));
};

// ---------- helpers used by scenes ----------

// Components to draw a character at a given on-screen height.
ART.charComps = (id, hPx, old = false) => {
  const key = "ch-" + id + (old ? "-old" : "");
  const reg = G.SPR[key];
  return [sprite(reg.name), scale(hPx / reg.h), anchor("center")];
};
