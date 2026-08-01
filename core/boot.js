// ============================================================
// BOOT — starts the engine and holds shared game state.
// Everything global lives on G so it's easy to find.
// ============================================================

kaboom({
  width: 960,
  height: 540,
  letterbox: true,
  crisp: true,
  background: [12, 12, 16],
  touchToMouse: true,
});

const G = {
  W: 960,
  H: 540,
  TILE: 48,

  // The current run. null until a character is picked.
  run: null,

  // Set true while a cutscene / banner is playing. Gameplay updates check this.
  paused: false,

  // Mobile joystick vector, set by the touch controls in ui.js
  joy: vec2(0, 0),

  // Dev/testing flags (see README for cheat keys)
  godMode: false,

  // Sprite registry: id -> { name, h } (native pixel height, for consistent scaling)
  SPR: {},
};

// How tall a person stands on the field, in pixels. Set against the painted
// furniture in Gonzo's: at 72 you read as someone who could sit in one of
// those chairs. EVERYTHING that stands in a room is sized from this, so
// changing this one number rescales the whole cast together.
// (Screen furniture - portraits, character select, the title line-up - has
// its own sizes and is deliberately not affected.)
G.CHAR_H = 72;

// Field size as a multiple of a person. G.charH() is one person tall,
// G.charH(2) is a boss twice their height, G.charH(0.62) is a scrawny runner.
G.charH = (mult = 1) => Math.round(G.CHAR_H * mult);

// Base stats every character starts with. Identical across all ten,
// per the design rule: depth comes from companions, not stat trees.
// NUMBERS ARE PLACEHOLDER BALANCE — tune in playtesting.
G.BASE_STATS = {
  moveSpeed: 175,
  maxHp: 6,
  damage: 1,
  attackSpeed: 2.2,   // shots per second
  range: 300,         // pixels
  crit: 0.05,         // chance of double damage
  dodge: 0,           // chance to avoid a hit entirely
  block: 0,           // chance to shrug off a hit (Sam's defence)
  chargeRate: 1,      // special meter charge multiplier
};

// Start a fresh run with the chosen character.
// Picks which 4 of the other 9 friends appear this run, one per chapter 1-4.
G.newRun = (charId) => {
  const others = CHARACTERS.filter((c) => c.id !== charId).map((c) => c.id);
  // shuffle
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rand(0, i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  G.run = {
    charId,
    companions: [],                 // ids, in recruitment order
    plan: { 1: others[0], 2: others[1], 3: others[2], 4: others[3] },
    selected: 0,                    // index into companions[]
    meter: 0,                       // 0..1 shared special meter
    hp: G.BASE_STATS.maxHp,
    shield: 0,                      // seconds of invulnerability (Lucy's special)
    chapter: 1,
    area: 1,
    kills: 0,
    deaths: 0,
    specialsUsed: 0,
    startTime: Date.now(),
  };
};

// Current effective stats = base + every recruited companion's passive.
G.stats = () => {
  const s = Object.assign({}, G.BASE_STATS);
  if (G.run) {
    for (const id of G.run.companions) {
      const c = G.char(id);
      if (c && c.passive && c.passive.apply) c.passive.apply(s);
    }
  }
  return s;
};

G.char = (id) => CHARACTERS.find((c) => c.id === id);
G.playerChar = () => G.char(G.run.charId);

// Move to the next area / chapter. Called by area.js when the player exits.
G.advance = () => {
  const r = G.run;
  r.area += 1;
  if (r.area > 5) {
    r.area = 1;
    r.chapter += 1;
    // Full heal between chapters: friendly to non-gamers, keeps the run moving.
    r.hp = G.stats().maxHp;
  }
  if (r.chapter > 5) {
    go("ending");
  } else {
    go("area", { chapter: r.chapter, area: r.area });
  }
};

// Helper: clamp a number
G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Helper: format seconds as mm:ss
G.fmtTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return m + ":" + String(s).padStart(2, "0");
};
