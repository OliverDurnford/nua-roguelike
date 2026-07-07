// ============================================================
// GAME — load the placeholder art, then start at the title.
// Dev helper: window.dev lets you jump anywhere from the browser
// console, e.g.  dev.area(3, 5)  jumps to the Chapter 3 boss.
// ============================================================

ART.init();

window.dev = {
  area: (chapter, area, charId) => {
    if (!G.run) G.newRun(charId || "ollie");
    go("area", { chapter, area });
  },
  tutorial: (charId) => { G.newRun(charId || "ollie"); go("tutorial"); },
  ending: (charId) => {
    if (!G.run) G.newRun(charId || "ollie");
    go("ending");
  },
  god: () => { G.godMode = !G.godMode; },
};

go("title");
