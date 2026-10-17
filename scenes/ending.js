// ============================================================
// ENDING: fade in from white, Ollie's message on a screen of its
// own, then the run stats and the "What You Missed" replay hook
// (PROJECT_CONTEXT.md locked decisions). The message is Ollie's
// own words (17 Oct 2026): nobody else edits it.
// ============================================================

scene("ending", () => {
  SPEECH.endArea();   // no room loaded: nothing to test a line against
  // The finale is a boss area, so without this the boss track ("White
  // Noise") would keep looping under Ollie's closing message. If he has
  // pinned a song to the "ending" slot it plays here; otherwise the ending
  // plays out in silence.
  if (!SOUNDTRACK.playForKey("ending")) SOUNDTRACK.stop();
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
  // Record the completed run FIRST, so every line below (met counts,
  // first-finish flag) already includes this run.
  if (typeof TROPHIES !== "undefined") TROPHIES.note("finish", { run: r });   // before the story write, so the ending holds its pop-ups
  const win = STORY.finishRun(r.charId);
  const met = STORY.met(r.charId);
  const allMet = met.length >= CHARACTERS.length;
  const secs = (Date.now() - r.startTime) / 1000;
  const found = r.companions.map((id) => G.char(id).name);
  // the five let out of the cages in the finale (FINALE.openCages) walked
  // out with you: they are not "still out there" (Ollie, 17 Oct 2026)
  const freedIds = r.freed || [];
  const freed = freedIds.map((id) => G.char(id).name);
  const missed = CHARACTERS
    .filter((c) => c.id !== r.charId && !r.companions.includes(c.id) && !freedIds.includes(c.id))
    .map((c) => c.name);

  const W = G.W - 200;
  const show = (txt, size, font, col, y, tag, extra = {}) => {
    const t = add([
      text(txt, Object.assign({ size, font, width: W, align: "center" }, extra)),
      pos(G.W / 2, y + 8), anchor("center"),
      color(col[0], col[1], col[2]), z(55), opacity(0), tag,
    ]);
    UI.slideIn(t, vec2(G.W / 2, y + 8), vec2(G.W / 2, y), 0.8);
    return t;
  };

  // --- page 1: Ollie's message, a paragraph at a time ---
  // [em] marks the one word he stressed. Kaboom multiplies a style's colour
  // onto the text's own, so a style can only darken: the message is drawn
  // white and everything but the stressed word is dimmed (dimmed() below).
  const MESSAGE = [
    "Thanks for an unforgettable 10 years together.",
    "I'm so incredibly lucky to have so many amazing people in my life. You all mean the world to me.",
    "And although life is bound to get much busier. I hope we can always carve out a little bit of time, even if it is just a quick trip down the pub x",
    "Looking forward to the [em]next[/em] 10 years!",
    "Love you.",
    "Ollie x",
  ];
  const AT = [2.5, 5.0, 8.5, 13.5, 16.0, 17.5];   // s: when each paragraph arrives
  const HINT_AT = 19.5;
  const MSG = { size: 16, font: UI.VT, lineSpacing: 4, styles: { dim: { color: rgb(210, 215, 230) } } };
  const dimmed = (m) => "[dim]" + m.replace("[em]", "[/dim]").replace("[/em]", "[dim]") + "[/dim]";
  const GAP = 14;
  const heights = MESSAGE.map((m) => UI.measure(dimmed(m), MSG.font, MSG.size, { width: W, align: "center", lineSpacing: MSG.lineSpacing, styles: MSG.styles }).height);
  const total = heights.reduce((a, b) => a + b, 0) + GAP * (MESSAGE.length - 1);
  const top = Math.max(110, Math.round(G.H * 0.5 + 12 - total / 2));
  const ys = [];
  heights.reduce((y, h) => { ys.push(y + h / 2); return y + h + GAP; }, top);

  let clock = 0, page = 1, page2At = 0;
  const shown = MESSAGE.map(() => false);
  let hintShown = false;
  wait(1.0, () => show("Victoria Park, restored.", 16, UI.PX, [255, 240, 200], G.H * 0.16, "endHead"));
  onUpdate(() => {
    if (page !== 1) return;
    clock += dt();
    MESSAGE.forEach((m, i) => {
      if (!shown[i] && clock >= AT[i]) {
        shown[i] = true;
        show(dimmed(m), MSG.size, MSG.font, [255, 255, 255], ys[i], "page1", { lineSpacing: MSG.lineSpacing, styles: MSG.styles });
      }
    });
    if (!hintShown && clock >= HINT_AT) {
      hintShown = true;
      show("press ENTER / tap", 16, UI.VT, [150, 155, 170], G.H * 0.9, "page1");
    }
  });

  // --- page 2: the run, and the replay hook ---
  const lines = [
    {
      t: 0.4, c: [170, 180, 200], y: 0.30,
      txt: "run time " + G.fmtTime(secs) +
        "   -   annoyances flattened: " + r.kills +
        "   -   deaths: " + r.deaths +
        "   -   specials: " + r.specialsUsed,
    },
    {
      t: 1.4, c: [255, 220, 120], y: 0.48,
      txt: "WHAT YOU MISSED\nfound this run: " + (found.length ? found.join(", ") : "nobody") +
        (freed.length ? "\nfreed from the cages: " + freed.join(", ") : "") +
        (missed.length ? "\nstill out there: " + missed.join(", ") : ""),
    },
    {
      t: 2.6, c: [150, 155, 170], y: 0.70,
      // "first run finished as X" only means something from the second
      // win onward; on the very first completion it goes without saying
      txt: (win.firstAsChar && win.story.wins > 1
        ? "first run finished as " + G.char(r.charId).name + "\n" : "") +
        (allMet
          ? "across your runs you've met all ten. the whole group, back together."
          : "you've teamed up with " + met.length + " of the group's 10 so far.\na different four friends appear every run. go again?"),
    },
    { t: 3.6, c: [255, 240, 200], y: 0.9, txt: "press ENTER / tap - back to the title" },
  ];
  const toPage2 = () => {
    page = 2;
    page2At = time();
    for (const o of get("page1")) {
      o.onUpdate(() => { o.opacity = Math.max(0, o.opacity - dt() * 3); if (o.opacity <= 0) destroy(o); });
    }
    for (const ln of lines) wait(ln.t, () => show(ln.txt, 16, UI.VT, ln.c, G.H * ln.y, "page2"));
  };

  // A press on the message shows the rest of it at once; once it is all
  // there, the next press moves on. Nothing answers in the first moments,
  // so a tap still going from the finale never skips the message.
  const press = () => {
    if (page === 1) {
      if (clock < 1.5) return;
      if (!hintShown) { clock = HINT_AT; return; }
      toPage2();
    } else if (time() - page2At >= 2.5) {
      go("title");
    }
  };
  onKeyPress("enter", press);
  onMousePress(press);
});
