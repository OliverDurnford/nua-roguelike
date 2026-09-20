// ============================================================
// ART: placeholder sprite generation.
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
// The kit's pixel heart: 16 x 13, an ink outline, red with a darker
// bottom-right half and a pink glint top-left. The empty heart is the
// same shape in grey outline over paper. Drawn as row spans lifted
// straight off the kit's SVG, so the two match to the pixel.
ART.genHeart = (full = true) => {
  const cv = document.createElement("canvas");
  cv.width = 16; cv.height = 13;
  const x = cv.getContext("2d");
  const span = (col, y, s, e) => { x.fillStyle = col; x.fillRect(s, y, e - s + 1, 1); };
  const ink = full ? "#090a10" : "#9a9384";
  const red = full ? "#e63946" : "#e9e4d8";
  const dark = full ? "#b52a36" : "#e9e4d8";
  // the outline is the whole silhouette; the fill goes over it inset by one
  const outline = [
    [[2, 5], [10, 13]], [[1, 6], [9, 14]],
    [[0, 15]], [[0, 15]], [[0, 15]], [[0, 15]],
    [[1, 14]], [[2, 13]], [[3, 12]], [[4, 11]], [[5, 10]], [[6, 9]], [[7, 8]],
  ];
  outline.forEach((spans, y) => spans.forEach(([s, e]) => span(ink, y, s, e)));
  [[2, 5], [10, 13]].forEach(([s, e]) => span(red, 1, s, e));
  for (let y = 2; y <= 5; y++) span(red, y, 1, 14);
  // from row 6 down the right half is in shadow
  const lower = [[6, 2, 7, 8, 13], [7, 3, 7, 8, 12], [8, 4, 7, 8, 11], [9, 5, 7, 8, 10], [10, 6, 7, 8, 9], [11, 7, 7, 8, 8]];
  for (const [y, s1, e1, s2, e2] of lower) { span(red, y, s1, e1); span(dark, y, s2, e2); }
  if (full) { span("#ff9aa2", 2, 2, 3); span("#ff9aa2", 3, 1, 1); }
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

// a five-pixel plus, the little stars scattered over the record cover
ART.genPixStar = () => {
  const cv = document.createElement("canvas");
  cv.width = 5; cv.height = 5;
  const x = cv.getContext("2d");
  x.fillStyle = "rgba(255,255,255,0.85)";
  x.fillRect(2, 0, 1, 5);
  x.fillRect(0, 2, 5, 1);
  x.fillStyle = "#ffffff";
  x.fillRect(2, 2, 1, 1);
  return cv.toDataURL();
};

// a wheel of soft light wedges, for sweeping slowly over the cover's sunburst
ART.genRayWheel = (spokes = 9) => {
  const s = 256;
  const cv = document.createElement("canvas");
  cv.width = s; cv.height = s;
  const x = cv.getContext("2d");
  x.translate(s / 2, s / 2);
  for (let i = 0; i < spokes; i++) {
    const a0 = (i / spokes) * Math.PI * 2;
    x.beginPath();
    x.moveTo(0, 0);
    x.arc(0, 0, s / 2, a0, a0 + (Math.PI * 2 / spokes) * 0.5);
    x.closePath();
    const rg = x.createRadialGradient(0, 0, 8, 0, 0, s / 2);
    rg.addColorStop(0, "rgba(255,255,255,0.0)");
    rg.addColorStop(0.35, "rgba(255,255,255,0.9)");
    rg.addColorStop(1, "rgba(255,255,255,0.0)");
    x.fillStyle = rg;
    x.fill();
  }
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

// ---------- collection screen placeholders ----------
// Stand-in layers so the parallax can be reviewed before the real art is
// generated. Replaced per friend by core/cutins-real.js, and never shown
// once a friend has real layers.

ART.genCutinHill = (w, h, rise, hex) => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const x = cv.getContext("2d");
  x.fillStyle = hex;
  x.beginPath();
  x.moveTo(0, h);
  for (let px = 0; px <= w; px += 4) {
    const k = px / w;
    x.lineTo(px, h - rise * Math.sin(Math.PI * k));
  }
  x.lineTo(w, h);
  x.closePath();
  x.fill();
  // the road over the middle, the one bit of detail the scenes call for
  x.fillStyle = "rgba(0,0,0,0.22)";
  x.fillRect(w / 2 - 18, h - rise * 0.98, 36, rise);
  return cv.toDataURL();
};

ART.genCutinClouds = (w, h, hex) => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const x = cv.getContext("2d");
  x.fillStyle = hex;
  const puffs = [[0.10, 0.55, 46], [0.16, 0.66, 34], [0.22, 0.58, 40],
                 [0.44, 0.40, 52], [0.51, 0.52, 38], [0.57, 0.44, 44],
                 [0.78, 0.62, 42], [0.85, 0.70, 30], [0.91, 0.60, 36]];
  for (const [fx, fy, r] of puffs) {
    x.beginPath();
    x.arc(fx * w, fy * h, r, 0, Math.PI * 2);
    x.fill();
  }
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

// ---------- the polaroid backdrop: Victoria Park, one long afternoon ----------
// Ten friends, ten snapshots, one park. This draws a single panorama and the
// select screen takes a 64px window of it per card, so every photo is a
// different bit of the same place rather than ten copies of one picture.
// A few props sit in the margins the friends do not cover, so some cards get
// a bench or a lamppost behind them. Drawn at half the size it is shown at,
// so its pixels come out the same size as the sprites'.
ART.genPolaroidPark = () => {
  const SLICE = 64, N = 10, W = SLICE * N, H = 56;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d");
  let seed = 20160917;                                   // the year they met
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  // everything lands on whole pixels: half a pixel anywhere and the canvas
  // anti-aliases it into mush at this size
  const px = (c, X, Y, w = 1, h = 1) => {
    x.fillStyle = c;
    x.fillRect(Math.round(X), Math.round(Y), Math.round(w), Math.round(h));
  };
  const blob = (c, X, Y, r) => {
    x.fillStyle = c;
    x.beginPath(); x.arc(Math.round(X), Math.round(Y), r, 0, Math.PI * 2); x.fill();
  };
  const hex = (a) => "#" + a.map((v) => {
    const n = Math.max(0, Math.min(255, Math.round(v)));
    return (n < 16 ? "0" : "") + n.toString(16);
  }).join("");
  const mix = (a, b, t) => hex([0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t));

  const HZ = 28;                                         // where the grass starts
  const SKY_TOP = [116, 163, 207], SKY_LOW = [206, 224, 232];

  // ----- sky: a hazy afternoon, banded rather than smoothly graded -----
  for (let y = 0; y < HZ; y++) px(mix(SKY_TOP, SKY_LOW, Math.floor((y / HZ) * 6) / 5), 0, y, W, 1);

  // clouds: flat-bottomed and stepped, the way they get drawn in pixel art
  for (let i = 0; i < 12; i++) {
    const cx = 6 + rnd() * (W - 12), cy = 1 + rnd() * 6, w = 12 + rnd() * 16;
    px("#e4edf5", cx - w / 2, cy + 2, w, 2);
    px("#f2f7fb", cx - w / 2 + 3, cy, w - 7, 2);
    px("#ffffff", cx - w / 2 + 4, cy, (w - 7) / 2, 1);
  }

  // ----- the far treeline: hazy, low, with sky showing between the clumps ---
  const tree = (cx, baseY, r, haze) => {
    const mid = [63, 99, 48], dk = [36, 62, 31], lt = [108, 148, 72];
    const air = (c) => mix(c, SKY_LOW, haze);            // distance washes them out
    px(air([62, 46, 33]), cx - 1, baseY - r * 0.75, 2, r * 0.75 + 3);   // trunk
    const lumps = [[0, -r * 1.08, r * 0.76], [-r * 0.74, -r * 0.6, r * 0.6],
                   [r * 0.74, -r * 0.58, r * 0.58], [-r * 0.3, -r * 0.18, r * 0.64],
                   [r * 0.36, -r * 0.14, r * 0.58]];
    for (const [dx, dy, rr] of lumps) blob(air(dk), cx + dx, baseY + dy + 1, rr);
    for (const [dx, dy, rr] of lumps) blob(air(mid), cx + dx, baseY + dy, rr);
    for (const [dx, dy, rr] of lumps) blob(air(lt), cx + dx - rr * 0.32, baseY + dy - rr * 0.36, rr * 0.48);
    for (let i = 0; i < r * 1.5; i++) {                  // leaf speckle
      const a = rnd() * Math.PI * 2, d = rnd() * r * 0.85;
      px(air(rnd() < 0.5 ? dk : lt), cx + Math.cos(a) * d, baseY - r * 0.62 + Math.sin(a) * d * 0.7, 1, 1);
    }
  };
  for (let cx = -6; cx < W + 10; cx += 17 + rnd() * 14) tree(cx, HZ - 9, 5 + rnd() * 3, 0.55);
  // the near row is planted in clumps of two or three with real gaps between
  for (let cx = -6; cx < W + 12;) {
    const clump = 1 + Math.round(rnd() * 2);
    for (let i = 0; i < clump; i++, cx += 13 + rnd() * 6) tree(cx, HZ - 1, 9 + rnd() * 4, 0.08);
    cx += 16 + rnd() * 26;                               // the gap the sky shows through
  }

  // the hedge that hides every trunk's foot, with the park railing standing
  // against it. The railing has to sit ON the hedge: posts against open sky
  // read as a bright dashed line all the way across.
  px("#22381f", 0, HZ - 7, W, 9);
  px("#33512a", 0, HZ - 7, W, 2);
  for (let X = 1; X < W; X += 4) px("#4e6a52", X, HZ - 6, 1, 5);
  px("#5d7a61", 0, HZ - 6, W, 1);
  px("#2b4523", 0, HZ - 1, W, 3);
  px("#43672f", 0, HZ - 1, W, 1);

  // ----- the grass: mown stripes running away in perspective -----
  const LIGHT = [110, 150, 70], DARK = [80, 118, 54], SHADOW = [42, 66, 33];
  let y = HZ + 2, band = 0, step = 2;
  while (y < H) {
    const h = Math.min(step, H - y);
    const near = (y - HZ) / (H - HZ);
    px(mix(band % 2 ? LIGHT : DARK, SHADOW, 0.06 + near * 0.26), 0, y, W, h);
    y += h; band++; step = Math.round(step * 1.55);
  }
  px(mix(DARK, SHADOW, 0.5), 0, HZ + 2, W, 2);           // the hedge's own shadow

  // tight clumps of blades rather than an even scatter of single pixels,
  // which at this size just reads as static
  for (let i = 0; i < 150; i++) {
    const gx = rnd() * W, gy = HZ + 4 + rnd() * (H - HZ - 5);
    const near = (gy - HZ) / (H - HZ);
    if (rnd() > 0.28 + near * 0.6) continue;             // thicker towards the camera
    const blades = 2 + Math.round(rnd() * (1 + near * 2));
    for (let b = 0; b < blades; b++) {
      const tall = 1 + Math.round(rnd() * (1 + near * 2));
      px(b % 2 ? mix([128, 168, 88], SHADOW, 0.1 + near * 0.3) : mix([56, 88, 41], SHADOW, near * 0.3),
         gx + b, gy - tall, 1, tall + 1);
    }
  }
  for (let i = 0; i < 14; i++) px("#eef2e4", 4 + rnd() * (W - 8), HZ + 8 + rnd() * (H - HZ - 10), 1, 1);

  // ----- props, placed in the margins a standing friend does not cover -----
  const bench = (X, Y) => {
    px("#2c2019", X, Y, 12, 1); px("#5a4331", X, Y + 1, 12, 1);   // seat
    px("#2c2019", X + 1, Y - 4, 10, 1); px("#5a4331", X + 1, Y - 3, 10, 1);  // back
    px("#2c2019", X + 1, Y - 3, 1, 3); px("#2c2019", X + 10, Y - 3, 1, 3);
    px("#2c2019", X + 1, Y + 2, 1, 3); px("#2c2019", X + 10, Y + 2, 1, 3);   // legs
  };
  const lamp = (X, Y) => {
    px("#20302c", X, Y - 15, 2, 16);
    px("#20302c", X - 2, Y - 18, 6, 3); px("#c9d6cd", X - 1, Y - 17, 4, 1);
  };
  const bin = (X, Y) => {
    px("#1f3a24", X, Y - 6, 6, 7); px("#2f5231", X + 1, Y - 6, 4, 6);
    px("#16281a", X - 1, Y - 7, 8, 1);
  };
  const ball = (X, Y) => {
    px("#1b2c18", X, Y, 4, 1);                            // its shadow
    px("#f2f2ea", X, Y - 3, 4, 3); px("#2a2a30", X + 1, Y - 2, 2, 1);
  };
  const kite = (X, Y) => {
    px("#3f5f96", X, Y - 4, 1, 9); px("#3f5f96", X - 4, Y, 9, 1);   // spars
    px("#e8eef8", X - 3, Y - 1, 7, 3); px("#e8eef8", X - 1, Y - 3, 3, 7);
    px("#7f9fd0", X - 2, Y, 5, 1); px("#7f9fd0", X, Y - 2, 1, 5);
    px("#c9d6e8", X + 2, Y + 5, 1, 1); px("#c9d6e8", X + 4, Y + 8, 1, 1);
    px("#c9d6e8", X + 3, Y + 11, 1, 1);                              // its tail
  };
  // one per card, in the margin that friend does not stand in
  lamp(50, HZ + 1); bench(114, HZ + 1); bin(176, HZ + 2);
  lamp(206, HZ + 1); bench(264, HZ + 1); bench(332, HZ + 1);
  kite(436, 9); bin(500, HZ + 2); ball(528, H - 13); bench(622, HZ + 1);

  // the foreground drops into shadow, which keeps the friends' feet readable
  const g = x.createLinearGradient(0, H - 14, 0, H);
  g.addColorStop(0, "rgba(20,32,16,0)");
  g.addColorStop(1, "rgba(20,32,16,0.45)");
  x.fillStyle = g; x.fillRect(0, H - 14, W, 14);

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
  // The UI kit's two pixel faces (core/fonts-real.js). Press Start 2P is
  // an 8px grid, so its atlas is rasterised at 8 and every multiple of 8
  // lands exactly on the pixels; VT323 at 16, its comfortable size.
  // Nearest filtering keeps the doubled sizes blocky rather than blurred.
  // Without the file the names fall through to a browser font.
  if (typeof REAL_FONTS !== "undefined") {
    loadFont("pixel", REAL_FONTS.pixel, { size: 8, filter: "nearest" });
    loadFont("vt", REAL_FONTS.vt, { size: 16, filter: "nearest" });
  }

  for (const c of CHARACTERS) {
    if (typeof REAL_ANIMS !== "undefined" && REAL_ANIMS[c.id]) {
      // animated sheet (core/sprites-anim.js): idle, walk, attack, hurt, ko, victory
      const ra = REAL_ANIMS[c.id];
      loadSprite("ch-" + c.id, ra.src, { sliceX: ra.sliceX, anims: ra.anims });
      G.SPR["ch-" + c.id] = { name: "ch-" + c.id, h: ra.charH, anchorY: ra.anchorY, anims: ra.anims };
    } else if (c.real && REAL_SPRITES[c.id]) {
      loadSprite("ch-" + c.id, REAL_SPRITES[c.id]);
      G.SPR["ch-" + c.id] = { name: "ch-" + c.id, h: 128 };
    } else {
      loadSprite("ch-" + c.id, ART.genChar(c));
      G.SPR["ch-" + c.id] = { name: "ch-" + c.id, h: c.height };
    }
    // old-age variant (used by the final boss): the generated elderly version
    // of the approved sprite when core/old-real.js has one, else the
    // code-drawn grey-haired placeholder
    if (typeof REAL_OLD !== "undefined" && REAL_OLD[c.id]) {
      loadSprite("ch-" + c.id + "-old", REAL_OLD[c.id]);
      G.SPR["ch-" + c.id + "-old"] = { name: "ch-" + c.id + "-old", h: 128 };
    } else {
      loadSprite("ch-" + c.id + "-old", ART.genChar(c, { old: true }));
      G.SPR["ch-" + c.id + "-old"] = { name: "ch-" + c.id + "-old", h: c.height };
    }
    // the thrown projectile (core/weapons-real.js), when drawn
    if (typeof REAL_WEAPONS !== "undefined" && REAL_WEAPONS[c.id]) {
      loadSprite("wp-" + c.id, REAL_WEAPONS[c.id].src);
    }
  }

  // Sized against a person (G.CHAR_H) so the whole room stays in proportion:
  // a runner is a scrawny thing, a brute is bigger than you are.
  const SIZES = {
    chaser:  G.charH(0.81),
    runner:  G.charH(0.62),
    brute:   G.charH(1.14),
    shooter: G.charH(0.76),
  };
  // Real enemy art (core/enemies-real.js) is keyed by the enemy's id in
  // data/chapters.js. A real entry brings its own size (a multiple of a
  // person, capping the sprite's LARGER dimension so wide things fit the
  // same box as tall ones) and its motion kind (see ENEMIES.animate).
  const realEnemy = (id) => (typeof REAL_ENEMIES !== "undefined" && id && REAL_ENEMIES[id]) || null;
  for (const ch of CHAPTERS) {
    ch.enemySet.forEach((en, i) => {
      const key = "en-" + ch.num + "-" + i;
      const real = realEnemy(en.id);
      if (real) {
        loadSprite(key, real.src, { sliceX: real.sliceX, anims: real.anims });
        en.real = real;
        en.size = G.charH(real.size);
      } else {
        loadSprite(key, ART.genEnemy(en.type, en.color, SIZES[en.type]));
        en.size = SIZES[en.type];
      }
      en.spr = key;
    });
    const bossReal = realEnemy(ch.boss.id);
    if (bossReal) {
      loadSprite("boss-" + ch.num, bossReal.src, { sliceX: bossReal.sliceX, anims: bossReal.anims });
      ch.boss.real = bossReal;
      ch.boss.size = G.charH(bossReal.size);
    } else {
      loadSprite("boss-" + ch.num, ART.genBoss(ch.boss.color, ch.boss.size));
    }
    // NPC easter eggs defined in area data (e.g. Megan Whiteside)
    ch.areas.forEach((a, ai) => {
      if (a.npc) {
        const key = "npc-" + ch.num + "-" + ai;
        loadSprite(key, ART.genChar(a.npc));
        a.npc.spr = key;
      }
    });
  }

  // What the shooters and bosses fire (core/ebullets-real.js), when drawn
  if (typeof REAL_EBULLETS !== "undefined") {
    for (const k in REAL_EBULLETS) loadSprite("eb-" + k, REAL_EBULLETS[k].src);
  }

  // Painted room backgrounds (core/plates-real.js), one per venue
  for (const k in PLATES) loadSprite("plate-" + k, PLATES[k]);

  loadSprite("heart", ART.genHeart(true));
  loadSprite("heart-empty", ART.genHeart(false));
  loadSprite("ball", ART.genBall());
  // Real prop art (core/props-real.js) when present
  if (typeof REAL_PROPS !== "undefined" && REAL_PROPS.car) {
    loadSprite("car", REAL_PROPS.car);
  } else {
    loadSprite("car", ART.genCar());
  }
  // Real Victoria Park fissures (core/cracks-real.js) when present
  if (typeof REAL_CRACKS !== "undefined") {
    REAL_CRACKS.forEach((d, i) => loadSprite("crack" + i, d));
  } else {
    for (let i = 0; i < 3; i++) loadSprite("crack" + i, ART.genCrack(i));
  }

  // Illustrated special-attack cut-ins (core/splash-real.js), when present
  if (typeof REAL_SPLASH !== "undefined") {
    for (const k in REAL_SPLASH) loadSprite("splash-" + k, REAL_SPLASH[k]);
  }

  // Collection screen placeholder layers. A friend with real layers in
  // core/cutins-real.js never sees these.
  loadSprite("cutin-ph-1", ART.genCutinHill(1400, 300, 190, "#5c7a5e"));
  loadSprite("cutin-ph-2", ART.genCutinHill(1400, 360, 300, "#415a52"));
  loadSprite("cutin-ph-3", ART.genCutinClouds(1400, 220, "#dfe7f5"));

  // The spinning vinyl that announces a new song (core/record-real.js)
  if (typeof REAL_RECORD !== "undefined") {
    loadSprite("record", REAL_RECORD);
  }

  // The title, in the two pieces that land on the sleeve (core/title-real.js)
  if (typeof REAL_TITLE !== "undefined") {
    loadSprite("title-top", REAL_TITLE.top.src);
    loadSprite("title-bottom", REAL_TITLE.bottom.src);
  }

  // UI polish set
  loadSprite("glow", ART.genGlow());
  loadSprite("vignette", ART.genVignette());
  loadSprite("pixstar", ART.genPixStar());
  loadSprite("raywheel", ART.genRayWheel());
  loadSprite("photo-park", ART.genPolaroidPark());
  loadSprite("bg-night", ART.genVGrad("#101322", "#1d1430"));
  // clear-to-dark, for settling figures onto a busy background
  loadSprite("grad-fade", ART.genVGrad("rgba(10,8,22,0)", "rgba(10,8,22,1)"));
  loadSprite("grad-gold", ART.genHGrad("#ffb13d", "#ffe27a"));
  loadSprite("grad-violet", ART.genHGrad("#5d4ae0", "#a08bff"));
  loadSprite("grad-red", ART.genHGrad("#a8202e", "#ff5a4e"));
};

// ---------- helpers used by scenes ----------

// Components to draw a character at a given on-screen height.
// Animated characters start on their idle loop and hang from the centre of
// the BODY, not the padded sheet cell (charH / anchorY, see sprites-anim.js).
ART.charComps = (id, hPx, old = false) => {
  const key = "ch-" + id + (old ? "-old" : "");
  const reg = G.SPR[key];
  return [
    sprite(reg.name, reg.anims ? { anim: "idle" } : undefined),
    scale(hPx / reg.h),
    anchor(reg.anims ? vec2(0, reg.anchorY) : "center"),
  ];
};

// True if this character has a real animation sheet loaded.
ART.hasAnims = (id) => !!(G.SPR["ch-" + id] && G.SPR["ch-" + id].anims);

// The feet box for a character drawn hPx tall through charComps: half a
// person wide, a fifth tall, sitting on the foot line (pos is the body's
// centre, so the feet end 0.5 h below it). Walls stop this box; the body's
// area() is still what bullets and pickups touch.
ART.feetBox = (hPx) => ({ dx: -0.25 * hPx, dy: 0.28 * hPx, w: 0.5 * hPx, h: 0.22 * hPx });
