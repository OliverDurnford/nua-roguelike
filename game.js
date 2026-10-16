// ============================================================
// GAME: load the placeholder art, then start at the title.
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
  // any friend's special screen, from inside a level: dev.special("cal")
  special: (id) => { if (G.run && !G.paused) CUTIN.play(CUTIN.forSpecial(G.char(id || G.run.charId))); },
  god: () => { G.godMode = !G.godMode; },
  wipe: () => { SAVE.clear(); STORY.clear(); TROPHIES.clear(); location.reload(); },
  // the bonus characters (core/bonus.js): dev.bonus() unlocks all seven,
  // dev.bonus("reset") forgets them and the run count
  bonus: (what) => {
    const s = STORY.get();
    if (what === "reset") { s.bonus = []; s.runs = 0; BONUS.session.length = 0; }
    else s.bonus = BONUS_CHARACTERS.map((c) => c.id);
    STORY.set(s);
    return s.bonus;
  },
  // the MilpooL caps (core/caps.js): dev.caps() lists the ones found,
  // dev.caps("reset") forgets them
  caps: (what) => {
    const s = STORY.get();
    if (what === "reset") { s.caps = []; CAPS.session.length = 0; STORY.set(s); }
    return s.caps;
  },
};

// Any of these used marks this device as tested, so its platinum's proof
// code reads TEST (core/trophies.js). Typed into a console, they are cheats.
for (const k of Object.keys(window.dev)) {
  const fn = window.dev[k];
  window.dev[k] = (...args) => { TROPHIES.taint(); return fn(...args); };
}

go("title");
