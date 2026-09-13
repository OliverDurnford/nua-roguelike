// ============================================================
// THE TRAIN CARRIAGE: Chapter 4, Area 1.
//
// Plate area, FIRST PASS geometry: outer shell and the start and
// exit only, written by tools/levels/accept.py. The measured
// furniture follows.
//
// Grid: 48 x 18 units, one unit is 48 world px (2304 x 864 px).
// Source: "Level Design/Train Carriage/Train Carriage - game plate.jpg" cut
// into 48 columns and 18 rows. Unit 0,0 is the top left corner.
// ============================================================

const TRAIN_PLATE = {
  // Two tiles side by side: Kaboom caps textures at 2048 px wide.
  tiles: [
    { sprite: "plate-train_0", x: 0 },
    { sprite: "plate-train_1", x: 24 },
  ],
  cols: 48,
  rows: 18,
  unit: 48,

  charScale: 1.2,

  solid: [
    // ---- outer edge, so nobody walks off the picture ----
    [0, 0, 48, 0.4],
    [0, 17.6, 48, 18],
    [0, 0, 0.4, 18],
    [47.6, 0, 48, 18],
  ],

  playerSpawn: [1.44, 9.0],

  enemySpawns: [
  ],

  exit: [47.55, 8.1, 47.95, 9.9],
};
