// ============================================================
// ENDING — fade in from white, Ollie's message, run stats,
// and the "What You Missed" replay hook (PROJECT_CONTEXT.md
// locked decisions). The message text is a PLACEHOLDER:
// Ollie writes the real one, nobody else.
// ============================================================

scene("ending", () => {
  G.paused = false;
  SAVE.clear();   // the run is complete, next visit starts clean
  add([sprite("bg-night"), pos(0, 0), scale(G.W / 8, G.H / 256), z(0)]);
  add([sprite("vignette"), pos(0, 0), scale(G.W / 480, G.H / 270), opacity(0.6), fixed(), z(50)]);

  // cinematic letterbox bars
  add([rect(G.W, 44), pos(0, 0), color(4, 4, 8), fixed(), z(60)]);
  add([rect(G.W, 44), pos(0, G.H - 44), color(4, 4, 8), fixed(), z(60)]);

  // white flash that fades out (we arrived from the park restoration)
  const w = add([rect(G.W, G.H), color(255, 255, 255), opacity(1), fixed(), z(100)]);
  w.onUpdate(() => { w.opacity -= dt() * 0.4; if (w.opacity <= 0) destroy(w); });

  const r = G.run;
  const secs = (Date.now() - r.startTime) / 1000;
  const found = r.companions.map((id) => G.char(id).name);
  const missed = CHARACTERS
    .filter((c) => c.id !== r.charId && !r.companions.includes(c.id))
    .map((c) => c.name);

  const lines = [
    { t: 1.0, s: 26, c: [255, 240, 200], y: 0.16, txt: "Victoria Park, restored." },
    {
      t: 3.0, s: 16, c: [210, 215, 230], y: 0.32,
      txt: "[ PLACEHOLDER - this is where Ollie's real message goes. ]\nTen years. One group chat. Apparently unkillable.",
    },
    {
      t: 5.5, s: 14, c: [170, 180, 200], y: 0.5,
      txt: "run time " + G.fmtTime(secs) +
        "   -   annoyances flattened: " + r.kills +
        "   -   deaths: " + r.deaths +
        "   -   specials: " + r.specialsUsed,
    },
    {
      t: 7.0, s: 16, c: [255, 220, 120], y: 0.62,
      txt: "WHAT YOU MISSED\nfound this run: " + (found.length ? found.join(", ") : "nobody") +
        "\nstill out there: " + missed.join(", "),
    },
    { t: 9.0, s: 14, c: [150, 155, 170], y: 0.8, txt: "a different four friends appear every run. go again?" },
    { t: 10.0, s: 16, c: [255, 240, 200], y: 0.88, txt: "press ENTER / tap - back to the title" },
  ];

  for (const ln of lines) {
    wait(ln.t, () => {
      const t = add([
        text(ln.txt, { size: ln.s, width: G.W - 160, align: "center" }),
        pos(G.W / 2, G.H * ln.y + 8), anchor("center"),
        color(ln.c[0], ln.c[1], ln.c[2]), z(55), opacity(0),
      ]);
      UI.slideIn(t, vec2(G.W / 2, G.H * ln.y + 8), vec2(G.W / 2, G.H * ln.y), 0.8);
    });
  }

  wait(2.5, () => {
    onKeyPress("enter", () => go("title"));
    onMousePress(() => go("title"));
  });
});
