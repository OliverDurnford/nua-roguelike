// ============================================================
// CHAPTERS — every chapter, area map, enemy set and boss.
// Source of truth: LEVEL_DESIGN.md.
//
// MAP LEGEND (each character is one 48px tile):
//   =  wall (blocks movement and bullets)
//   o  obstacle (table / stall / crate - blocks movement)
//   .  floor
//   P  player spawn
//   E  possible enemy spawn point (randomised each run)
//   C  companion pickup (quiet areas, chapters 1-4)
//   X  exit door (locked until the area is cleared)
//   B  boss spawn
//
// All layouts are PLACEHOLDER SHAPES that follow the spatial
// brief in LEVEL_DESIGN.md. Redraw freely - it's just text.
// ============================================================

// ---------- VICTORIA PARK (tutorial + finale arena) ----------
const PARK_MAP = [
  "====================================",
  "=........o.................o.......=",
  "=..o............................o..=",
  "=..................................=",
  "=................B.................=",
  "=..................................=",
  "=......o....................o......=",
  "=..................................=",
  "=..................................=",
  "=..................................=",
  "=..o............................o..=",
  "=..................................=",
  "=................P.................=",
  "=..................................=",
  "=......o..................o........=",
  "=..................................=",
  "====================================",
];

const PARK_PALETTE = { floor: [86, 125, 70], wall: [44, 72, 40], accent: [120, 160, 100] };
const PARK_RUINED  = { floor: [78, 74, 70], wall: [40, 38, 36], accent: [120, 110, 100] };

// ---------- THE FIVE CHAPTERS ----------
const CHAPTERS = [

  // ========================= CHAPTER 1 =========================
  {
    num: 1, title: "FRESHERS", era: "First year at NUA Norwich",
    enemySet: [
      // PLACEHOLDER enemies - real enemy design happens in its own session
      { type: "runner",  name: "Seagull",            color: [225, 225, 230] },
      { type: "chaser",  name: "Aggressive Fresher", color: [235, 150, 60] },
      { type: "brute",   name: "Mercy Bouncer",      color: [50, 50, 60] },
      { type: "shooter", name: "Spilled Trebles",    color: [120, 220, 120] },
    ],
    boss: { name: "THE OBNOXIOUS DJ", hp: 90, size: G.charH(2), color: [160, 70, 220], patterns: ["radial", "aimed", "spawn"], speed: 38 },
    areas: [
      {
        // Real painted level, not an ASCII placeholder. Geometry and
        // spawn points live in data/level-gonzos.js.
        name: "Gonzo's", feel: "compact, cluttered, weird", enemyBudget: 5,
        plate: GONZOS_PLATE,
      },
      {
        // Real painted level; geometry in data/level-propaganda.js.
        name: "Propaganda", feel: "big, empty, sparse", enemyBudget: 7,
        // Megan Whiteside NPC easter egg (LEVEL_DESIGN.md). Line is PLACEHOLDER.
        npc: {
          name: "Megan Whiteside", line: "oh my GOD, hiii!",
          height: 38,
          colors: { hair: [225, 195, 120], skin: [240, 205, 175], top: [165, 80, 165], bottom: [50, 50, 65] },
        },
        plate: PROPAGANDA_PLATE,
      },
      {
        // Real painted level; geometry in data/level-mercy.js.
        name: "Mercy", feel: "dancefloor, cages, peak chaos", enemyBudget: 9,
        plate: MERCY_PLATE,
      },
      {
        // Real painted level; geometry in data/level-foampit.js.
        name: "The Foam Pit", feel: "disorienting, quiet", enemyBudget: 0, quiet: true, foam: true,
        plate: FOAMPIT_PLATE,
      },
      {
        // Real painted level; geometry in data/level-mercystage.js.
        name: "Mercy Stage", feel: "boss arena, facing the stage", boss: true,
        plate: MERCYSTAGE_PLATE,
      },
    ],
  },

  // ========================= CHAPTER 2 =========================
  {
    num: 2, title: "CROSS-COURSE COLLABORATION", era: "Film x Photography x Fashion",
    enemySet: [
      { type: "runner",  name: "Deadline",        color: [220, 60, 60] },
      { type: "shooter", name: "Overdue Book",    color: [150, 110, 70] },
      { type: "brute",   name: "Noise Complaint", color: [120, 80, 160] },
      { type: "chaser",  name: "Harsh Crit",      color: [120, 120, 130] },
    ],
    boss: { name: "BIG DICK DEAN", hp: 120, size: G.charH(2), color: [120, 30, 40], patterns: ["charge", "aimed", "spawn"], speed: 55 },
    areas: [
      {
        // Real painted level; geometry in data/level-market.js.
        name: "Norwich Market", feel: "colourful stalls, weave for cover", enemyBudget: 6,
        plate: MARKET_PLATE,
      },
      {
        // Real painted level; geometry in data/level-classroom.js.
        name: "NUA Classroom", feel: "big white studio space", enemyBudget: 7,
        plate: CLASSROOM_PLATE,
      },
      {
        // Real painted level; geometry in data/level-mischief.js.
        name: "The Mischief", feel: "old, wooden, cramped", enemyBudget: 8,
        plate: MISCHIEF_PLATE,
      },
      {
        name: "The Hungover Walk", feel: "morning streets, castle on the hill", enemyBudget: 0, quiet: true,
        palette: { floor: [150, 150, 155], wall: [90, 90, 100], accent: [200, 210, 230] },
        map: [
          "======================================",
          "=....................................=",
          "=..o.......o..............o..........=",
          "=....................................=",
          "=P..............C....................X",
          "=....................................=",
          "=......o..............o.......o.....=",
          "=....................................=",
          "======================================",
        ],
      },
      {
        name: "The Lecture Theatre", feel: "tiered seats funnel to the stage", boss: true,
        palette: { floor: [50, 55, 75], wall: [28, 30, 44], accent: [220, 200, 120] },
        map: [
          "==========================",
          "=P.......................=",
          "=..oooooooo...oooooooo...=",
          "=........................=",
          "=..oooooooo...oooooooo...=",
          "=........................=",
          "=..oooooooo...oooooooo...=",
          "=........................=",
          "=........................=",
          "=...........B............=",
          "=........................=",
          "==========================",
        ],
      },
    ],
  },

  // ========================= CHAPTER 3 =========================
  {
    num: 3, title: "GRADUATION", era: "Finals and the ceremony",
    enemySet: [
      { type: "chaser",  name: "All-Nighter",      color: [40, 45, 90] },
      { type: "brute",   name: "Printer Jam",      color: [120, 120, 125] },
      { type: "runner",  name: "Caffeine Shakes",  color: [140, 90, 50] },
      { type: "shooter", name: "Hand-In Reminder", color: [220, 80, 80] },
    ],
    boss: { name: "BIG DICK DEAN: GRADUATION FORM", hp: 150, size: G.charH(2.1), color: [90, 20, 30], patterns: ["charge", "radial", "aimed"], speed: 70 },
    areas: [
      {
        name: "Playhouse Bar", feel: "PLACEHOLDER layout - spatial details TBD", enemyBudget: 6,
        palette: { floor: [90, 60, 45], wall: [50, 32, 24], accent: [240, 160, 80] },
        map: [
          "========================",
          "=======............E...=",
          "=P.........o....o......=",
          "=......................=",
          "=...E....o....E........=",
          "=......................X",
          "=....o....o....o....E..=",
          "=...........E..........=",
          "=..E....o..............=",
          "=......................=",
          "========================",
        ],
      },
      {
        name: "The NUA Library", feel: "shelf corridors", enemyBudget: 8,
        palette: { floor: [180, 170, 150], wall: [100, 90, 75], accent: [140, 100, 60] },
        map: [
          "============================",
          "=P.........................=",
          "=..o..o..o..o..o..o..o.....=",
          "=..o..o..o..o..o..o..o..E..=",
          "=..o..E..o..o..E..o..o.....=",
          "=..o..o..o..o..o..o..o.....=",
          "=..........................X",
          "=..o..o..o..o..o..o..o.....=",
          "=..o..o..E..o..o..E..o..E..=",
          "=..o..o..o..o..o..o..o.....=",
          "=..........................=",
          "============================",
        ],
      },
      {
        name: "Norwich Streets", feel: "the mad dash - long and narrow", enemyBudget: 9, sidescroll: true,
        palette: { floor: [140, 135, 125], wall: [80, 75, 70], accent: [200, 190, 170] },
        map: [
          "============================================================",
          "=..........o...........o..............o.........o.........=",
          "=...E..............E...........E...........E..............=",
          "=P......o.....................o...................o........X",
          "=..........E...........E..............E...........E.......=",
          "=.....o..........o..............o..........o..............=",
          "============================================================",
        ],
      },
      {
        name: "Outside the Cathedral", feel: "calm before the ceremony", enemyBudget: 0, quiet: true,
        palette: { floor: [130, 150, 120], wall: [80, 95, 75], accent: [210, 210, 200] },
        map: [
          "========================",
          "=......................=",
          "=...o..............o...=",
          "=......................=",
          "=P.........C...........X",
          "=......................=",
          "=...o..............o...=",
          "=......................=",
          "========================",
        ],
      },
      {
        name: "The Cathedral", feel: "pews make lanes, aisles for flanking", boss: true,
        palette: { floor: [160, 155, 145], wall: [90, 85, 78], accent: [230, 200, 110] },
        map: [
          "==========================",
          "=...........B............=",
          "=........................=",
          "=..oooooo......oooooo....=",
          "=........................=",
          "=..oooooo......oooooo....=",
          "=........................=",
          "=..oooooo......oooooo....=",
          "=........................=",
          "=..oooooo......oooooo....=",
          "=........................=",
          "=...........P............=",
          "==========================",
        ],
      },
    ],
  },

  // ========================= CHAPTER 4 =========================
  {
    num: 4, title: "EARLY LONDON", era: "The move, lockdown, first steps",
    enemySet: [
      { type: "chaser",  name: "Covid Particle",  color: [110, 200, 90] },
      { type: "shooter", name: "Estate Agent",    color: [70, 110, 190] },
      { type: "brute",   name: "Moving Box",      color: [170, 130, 80] },
      { type: "runner",  name: "Lockdown Jogger", color: [230, 230, 70] },
    ],
    boss: { name: "THE COVID", hp: 190, size: G.charH(2.2), color: [80, 180, 70], patterns: ["spiral", "spawn", "radial"], speed: 42 },
    areas: [
      {
        name: "The Train Carriage", feel: "long, narrow, confined", enemyBudget: 7, sidescroll: true,
        palette: { floor: [90, 95, 110], wall: [50, 54, 66], accent: [200, 60, 60] },
        map: [
          "========================================================",
          "=oo..oo....oo..oo===.oo..oo===oo..oo.===oo..oo....oo..o=",
          "=P.......E..........E.......E.......E...........E......X",
          "=........................E.............E...............=",
          "=oo..oo....oo..oo===.oo..oo===oo..oo.===oo..oo....oo..o=",
          "========================================================",
        ],
      },
      {
        name: "The Thames Walk", feel: "nighttime, lockdown-empty, landmarks behind", enemyBudget: 6, sidescroll: true, water: true,
        palette: { floor: [35, 40, 60], wall: [20, 22, 36], accent: [240, 190, 90] },
        map: [
          "============================================================",
          "=..........o...............o..............o...............=",
          "=....E..............E.............E...............E.......=",
          "=P.........................................................X",
          "=......E...........E..............E...........E...........=",
          "=......o.................o.............o..................=",
          "============================================================",
        ],
      },
      {
        name: "The Beehive", feel: "rough, dingy, weird locals", enemyBudget: 8,
        palette: { floor: [60, 50, 40], wall: [34, 28, 22], accent: [200, 160, 60] },
        map: [
          "====================",
          "=P...o....o....E...=",
          "=..................=",
          "=...E...oo....E....=",
          "=..o..........o....=",
          "=......E...........X",
          "=..o....oo....o....=",
          "=....E........E....=",
          "=..................=",
          "====================",
        ],
      },
      {
        name: "Old Street Station", feel: "empty platform, waiting", enemyBudget: 0, quiet: true,
        palette: { floor: [120, 120, 125], wall: [60, 62, 70], accent: [70, 130, 200] },
        map: [
          "==============================",
          "==============================",
          "=............................=",
          "=P...........C..............X=",
          "=............................=",
          "=...o....o.........o....o....=",
          "=............................=",
          "==============================",
        ],
      },
      {
        name: "Parliament Square", feel: "open green, statues for cover", boss: true,
        palette: { floor: [80, 110, 70], wall: [45, 60, 40], accent: [190, 185, 170] },
        map: [
          "==============================",
          "=............................=",
          "=.............B..............=",
          "=...o....................o...=",
          "=............................=",
          "=........o........o..........=",
          "=............................=",
          "=............................=",
          "=........o........o..........=",
          "=............................=",
          "=...o....................o...=",
          "=.............P..............=",
          "=............................=",
          "==============================",
        ],
      },
    ],
  },

  // ========================= CHAPTER 5 =========================
  {
    num: 5, title: "LATER LONDON", era: "Present day - the group now",
    enemySet: [
      { type: "runner",  name: "Pigeon",       color: [150, 150, 160] },
      { type: "brute",   name: "Slow Tourist", color: [230, 140, 170] },
      { type: "shooter", name: "Rent Invoice", color: [240, 240, 240] },
      { type: "chaser",  name: "Tube Rat",     color: [110, 85, 60] },
    ],
    boss: { name: "OLD AGE", hp: 240, size: G.charH(2.1), color: [150, 150, 160], patterns: ["radial", "aimed", "spawn", "charge"], speed: 50 },
    areas: [
      {
        name: "The Faltering Fullback", feel: "treehouse pub - mini-arenas, narrow walkways", enemyBudget: 8,
        palette: { floor: [95, 75, 50], wall: [50, 40, 28], accent: [120, 180, 90] },
        map: [
          "==============================",
          "=P......=........=...........=",
          "=..E....=...E....=....E......=",
          "=.......=........=...........=",
          "=.......=........=...E.......=",
          "===..====...======...........=",
          "=.......=........====....=====",
          "=...E...=...E.........E......=",
          "=.......=........=...........X",
          "=.......====..====...........=",
          "=..E.............=.....E.....=",
          "=................=...........=",
          "==============================",
        ],
      },
      {
        name: "Rowans", feel: "bowling lanes, arcade, karaoke", enemyBudget: 10,
        palette: { floor: [40, 35, 60], wall: [22, 18, 34], accent: [240, 80, 160] },
        map: [
          "================================",
          "=P.............................=",
          "=..oooooooo........o..o..o.....=",
          "=...........E..................=",
          "=..oooooooo.........E.....E....=",
          "=......E...........o..o..o.....=",
          "=..oooooooo....................X",
          "=...........E.......E..........=",
          "=..oooooooo........oo..oo......=",
          "=........E.........oo..oo..E...=",
          "=..............................=",
          "================================",
        ],
      },
      {
        name: "Games Night at the Flat", feel: "kitchen, living room, hallway", enemyBudget: 12,
        palette: { floor: [180, 160, 135], wall: [100, 85, 70], accent: [200, 100, 80] },
        map: [
          "==========================",
          "=P.......=......E....E...=",
          "=...E....=...o...........=",
          "=..o.....=......o....E...=",
          "=........=...............=",
          "=...E....====..===========",
          "=........................=",
          "=====..====...o....E.....=",
          "=........=...............=",
          "=..E.....=..E...oo...E...X",
          "=...o....=...............=",
          "=........=......o........=",
          "==========================",
        ],
      },
      {
        name: "Regent's Canal", feel: "sunset, the world breaking apart", enemyBudget: 0, quiet: true, dread: true, water: true,
        palette: { floor: [120, 90, 80], wall: [60, 45, 45], accent: [240, 150, 80] },
        map: [
          "============================================",
          "=......o....................o..............=",
          "=P.........................................=",
          "=======......===========.......============",
          "=..........................................X",
          "=....=========.........========............=",
          "=...........................o..............=",
          "=......o....................................=",
          "============================================",
        ],
      },
      {
        // Real painted level; geometry in data/level-parkruined.js.
        name: "Victoria Park", feel: "the finale - same park, broken", boss: true, finale: true,
        plate: PARKRUINED_PLATE,
      },
    ],
  },
];
