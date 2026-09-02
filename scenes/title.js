// ============================================================
// TITLE — the first thing the friends see, so it gets the
// cinematic treatment: gradient night sky, drifting dust,
// glowing title, the whole group bobbing on the grass.
// Game name is a WORKING TITLE - Ollie picks the real one.
// ============================================================

scene("title", () => {
  SOUNDTRACK.playById("dare-8-bit");
  G.paused = false;
  G.run = null;

  // night-sky gradient + vignette
  add([sprite("bg-night"), pos(0, 0), scale(G.W / 8, G.H / 256), z(0)]);
  add([sprite("vignette"), pos(0, 0), scale(G.W / 480, G.H / 270), opacity(0.55), z(40)]);

  // drifting dust motes
  for (let i = 0; i < 26; i++) {
    const mote = add([
      circle(rand(1, 2.6)),
      pos(rand(0, G.W), rand(0, G.H)),
      color(255, 230, 180),
      opacity(rand(0.06, 0.3)),
      z(2),
      { vy: rand(6, 22), sway: rand(0, 6.28) },
    ]);
    mote.onUpdate(() => {
      mote.pos.y -= mote.vy * dt();
      mote.pos.x += Math.sin(time() * 0.7 + mote.sway) * 6 * dt();
      if (mote.pos.y < -4) { mote.pos.y = G.H + 4; mote.pos.x = rand(0, G.W); }
    });
  }

  // grass strip with a soft top edge
  add([rect(G.W, 116), pos(0, G.H - 116), color(52, 76, 44), z(5)]);
  add([rect(G.W, 4), pos(0, G.H - 116), color(86, 122, 70), z(5)]);

  // glow behind the title (slow breathing)
  const glow = add([
    sprite("glow"), pos(G.W / 2, G.H * 0.27), anchor("center"),
    scale(7), color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0.22), z(3),
  ]);
  glow.onUpdate(() => { glow.opacity = 0.18 + Math.sin(time() * 1.6) * 0.07; });

  // title: shadow layer + main layer
  const shadow = add([
    text("TEN YEARS", { size: 64 }), pos(G.W / 2 + 3, G.H * 0.27 + 5), anchor("center"),
    color(0, 0, 0), opacity(0), z(9),
  ]);
  const title = add([
    text("TEN YEARS", { size: 64 }), pos(G.W / 2, G.H * 0.27), anchor("center"),
    color(255, 242, 205), opacity(0), z(10),
  ]);
  UI.fadeObj(shadow, 0.55, 0.9, 0.25);
  UI.fadeObj(title, 1, 0.9, 0.25);

  // gold rules either side of the subtitle
  const sub = add([
    text("a roguelike about (and for) the NUA lot", { size: 17 }),
    pos(G.W / 2, G.H * 0.41), anchor("center"), color(178, 186, 208), opacity(0), z(10),
  ]);
  UI.fadeObj(sub, 1, 0.8, 0.7);
  for (const side of [-1, 1]) {
    const rule = add([
      rect(64, 2), pos(G.W / 2 + side * 248, G.H * 0.41), anchor("center"),
      color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0), z(10),
    ]);
    UI.fadeObj(rule, 0.7, 0.8, 0.85);
  }

  const note = add([
    text("working title  ·  placeholder art  ·  fully playable", { size: 11 }),
    pos(G.W / 2, G.H * 0.475), anchor("center"), color(105, 110, 130), opacity(0), z(10),
  ]);
  UI.fadeObj(note, 1, 0.8, 1.05);

  // the whole group on the grass, gently bobbing, with soft shadows
  const order = ["cal", "ollie", "sam", "ethan", "adam", "josh", "lucy", "annie", "ana", "jess"];
  order.forEach((id, i) => {
    const c = G.char(id);
    const baseX = G.W / 2 + (i - 4.5) * 78;
    const baseY = G.H - 92;
    add([
      rect(34, 9, { radius: 4.5 }), pos(baseX, G.H - 64), anchor("center"),
      color(0, 0, 0), opacity(0.28), z(6),
    ]);
    const ch = add([
      ...ART.charComps(id, c.height * 1.5),
      pos(baseX, baseY), z(7), opacity(0),
      { phase: i * 0.7, baseY },
    ]);
    UI.fadeObj(ch, 1, 0.5, 0.4 + i * 0.07);
    ch.onUpdate(() => {
      ch.pos.y = ch.baseY + Math.sin(time() * 2 + ch.phase) * 3;
    });
  });

  // ----- start / carry on -----
  // With a saved run waiting, the chip offers to carry it on and a
  // quieter chip underneath starts over. No save: one chip, any key
  // or tap starts, as before.
  const saved = SAVE.read();
  const chipY = G.H * 0.585;
  const contLabel = saved
    ? "carry on as " + G.char(saved.run.charId).name +
      (saved.scene === "tutorial" ? "  ·  victoria park" : "  ·  chapter " + saved.run.chapter)
    : "press any key  /  tap to start";

  const chipW = saved ? 340 : 300;
  const chip = add([
    rect(chipW, 40, { radius: 20 }), pos(G.W / 2, chipY), anchor("center"),
    color(UI.INK[0], UI.INK[1], UI.INK[2]), opacity(0), z(10),
  ]);
  const hint = add([
    text(contLabel, { size: 16 }),
    pos(G.W / 2, chipY), anchor("center"),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0), z(11),
  ]);
  let ht = -1.3;
  hint.onUpdate(() => {
    ht += dt();
    if (ht < 0) return;
    const base = Math.min(1, ht / 0.5);
    hint.opacity = base * (0.6 + Math.sin(time() * 3.4) * 0.4);
    chip.opacity = base * 0.55;
  });

  // the quieter option underneath, only when there is a run to set aside
  let newChip = null;
  if (saved) {
    newChip = add([
      rect(200, 30, { radius: 15 }), pos(G.W / 2, chipY + 48), anchor("center"),
      color(UI.INK[0], UI.INK[1], UI.INK[2]), opacity(0), z(10), area(), "newgame",
    ]);
    const newTxt = add([
      text("start a new game", { size: 12 }),
      pos(G.W / 2, chipY + 48), anchor("center"),
      color(178, 186, 208), opacity(0), z(11),
    ]);
    UI.fadeObj(newChip, 0.4, 0.8, 1.15);
    UI.fadeObj(newTxt, 0.85, 0.8, 1.15);
  }

  UI.sceneFade();
  let going = false;
  const begin = (fn) => {
    if (going) return;
    going = true;
    SFX.play("uiconfirm");
    fn();
  };
  const start = () => begin(() => (saved ? SAVE.resume(saved) : go("select")));
  const fresh = () => begin(() => go("select"));

  if (saved) {
    // a tap counts as "start a new game" only if it lands on that chip
    // (isHovering, which understands the letterboxed canvas); anywhere
    // else on the screen carries the run on
    onKeyPress((key) => { if (key === "n") fresh(); else start(); });
    onMousePress(() => { if (newChip.isHovering()) fresh(); else start(); });
  } else {
    onKeyPress(start);
    onMousePress(start);
  }
});
