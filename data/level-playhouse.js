// ============================================================
// PLAYHOUSE BAR: Chapter 3, Area 1.
//
// Plate area, FIRST PASS geometry: outer shell and the start and
// exit only, written by tools/levels/accept.py. The furniture is
// traced on the level board (tools/levels/board.html).
//
// Grid: 32 x 24 units, one unit is 48 world px (1536 x 1152 px).
// Source: "Level Design/Playhouse Bar/Playhouse Bar - game plate.jpg" cut
// into 32 columns and 24 rows. Unit 0,0 is the top left corner.
// ============================================================

const PLAYHOUSE_PLATE = {
  sprite: "plate-playhouse",
  cols: 32,
  rows: 24,
  unit: 48,

  charScale: 1.15,

  // Edited on the level board (tools/levels/board.html): one entry per
  // painted thing, a footprint and, for tall things, an outline.
  things: [
    { name: "top edge", foot: [0, 0, 32, 0.4] },
    { name: "bottom edge", foot: [0, 23.6, 32, 24] },
    { name: "left edge", foot: [0, 0, 0.4, 24] },
    { name: "right edge", foot: [31.6, 0, 32, 24] },
  ],

  playerSpawn: [1.28, 19.92],

  enemySpawns: [
  ],

  exit: [31.55, 19.26, 31.95, 21.06],
};
