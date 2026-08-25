// ============================================================
// GAME — load the placeholder art, then start at the title.
// Dev helper: window.dev lets you jump anywhere from the browser
// console, e.g.  dev.area(3, 5)  jumps to the Chapter 3 boss.
// ============================================================

ART.init();

// Jumping straight in from the console can land in the same frame as the
// startup go("title"), and the title screen clears G.run on the way past,
// which would blow up the scene we just asked for. Waiting a tick lets the
// title scene finish first, so the run we set up is the one that survives.
const devJump = (fn) => setTimeout(fn, 60);

window.dev = {
  area: (chapter, area, charId) => devJump(() => {
    if (!G.run) G.newRun(charId || "ollie");
    go("area", { chapter, area });
  }),
  tutorial: (charId) => devJump(() => { G.newRun(charId || "ollie"); go("tutorial"); }),
  ending: (charId) => devJump(() => {
    if (!G.run) G.newRun(charId || "ollie");
    go("ending");
  }),
  god: () => { G.godMode = !G.godMode; },
  wipe: () => { SAVE.clear(); STORY.clear(); location.reload(); },
};

go("title");
