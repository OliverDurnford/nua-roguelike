// ============================================================
// DIFFICULTY: Easy, Medium and Hard (Ollie, 16 Oct 2026).
//
// Medium is the game exactly as it was tuned. Everyone starts there;
// the pause menu cycles the three, and the choice is remembered on the
// device like the sound setting. Three quick deaths on Medium offer Easy
// once a run (scenes/area.js draws the offer on the YOU DIED screen).
//
// What each level changes, all read from LEVELS:
//   hearts      the hearts you start with (companion passives add on top)
//   enemySpeed  how fast regular enemies walk (boss minions included)
//   shotGap     the wait between an enemy's shots
//   shotSpeed   how fast every enemy and boss shot flies
//   bossHp      a boss's health
//   restartRoom dying restarts the room, not the chapter
//
// The five skill trophies need Medium or Hard: core/trophies.js marks
// any stretch played on Easy (TROPHIES.note("easy")).
// Tests: node tools/tests/difficulty.test.js
// ============================================================

const DIFFICULTY = { KEY: "tenyears-difficulty" };

DIFFICULTY.LEVELS = {
  easy:   { hearts: 8, enemySpeed: 0.75, shotGap: 1.4, shotSpeed: 0.8, bossHp: 0.65, restartRoom: true },
  medium: { hearts: 6, enemySpeed: 1,    shotGap: 1,   shotSpeed: 1,   bossHp: 1,    restartRoom: false },
  hard:   { hearts: 4, enemySpeed: 1.2,  shotGap: 0.8, shotSpeed: 1,   bossHp: 1.35, restartRoom: false },
};
DIFFICULTY.ORDER = ["easy", "medium", "hard"];

// three deaths inside six minutes, on Medium, brings up the offer
DIFFICULTY.OFFER = { deaths: 3, withinMs: 6 * 60 * 1000 };

DIFFICULTY.level = (() => {
  try {
    const v = localStorage.getItem(DIFFICULTY.KEY);
    return DIFFICULTY.LEVELS[v] ? v : "medium";
  } catch (e) { return "medium"; }
})();

DIFFICULTY.get = () => DIFFICULTY.LEVELS[DIFFICULTY.level];

// Hearts above or below Medium's six, added to the stats in G.stats().
DIFFICULTY.extraHearts = () => DIFFICULTY.get().hearts - DIFFICULTY.LEVELS.medium.hearts;

// Switching mid-run keeps the hearts already lost: two of six left on
// Medium is four of eight on Easy, never fewer than one.
DIFFICULTY.set = (lvl) => {
  if (!DIFFICULTY.LEVELS[lvl] || lvl === DIFFICULTY.level) return;
  const run = typeof G !== "undefined" ? G.run : null;
  const before = run ? G.stats().maxHp : 0;
  DIFFICULTY.level = lvl;
  try { localStorage.setItem(DIFFICULTY.KEY, lvl); } catch (e) {}
  if (run) {
    const after = G.stats().maxHp;
    run.hp = Math.max(1, Math.min(after, run.hp + after - before));
  }
  DIFFICULTY.touch();
};

DIFFICULTY.cycle = () => {
  const i = DIFFICULTY.ORDER.indexOf(DIFFICULTY.level);
  DIFFICULTY.set(DIFFICULTY.ORDER[(i + 1) % DIFFICULTY.ORDER.length]);
};

// Tell the trophies whenever the run is being played on Easy: on entering
// a room (core/trophies.js checks for itself there) and on switching to it.
DIFFICULTY.touch = () => {
  if (DIFFICULTY.level === "easy" && typeof TROPHIES !== "undefined") TROPHIES.note("easy");
};

// A death goes on the run's list (the last few only); true when this one
// should bring up the Easy offer. Real time, so a run resumed days later
// never counts old deaths as quick ones.
DIFFICULTY.noteDeath = (run, now = Date.now()) => {
  const times = (run.deathTimes || []).concat(now).slice(-DIFFICULTY.OFFER.deaths);
  run.deathTimes = times;
  return DIFFICULTY.shouldOffer(run, now);
};

DIFFICULTY.shouldOffer = (run, now = Date.now()) => {
  const n = DIFFICULTY.OFFER.deaths, times = run.deathTimes || [];
  return DIFFICULTY.level === "medium" && !run.easyOffered
    && times.length >= n && now - times[times.length - n] <= DIFFICULTY.OFFER.withinMs;
};
