// ============================================================
// ROWANS: Chapter 5, Area 2.
//
// Plate area, FIRST PASS geometry: outer shell and the start and
// exit only, written by tools/levels/accept.py. The furniture is
// traced on the level board (tools/levels/board.html).
//
// Grid: 33 x 22 units, one unit is 48 world px (1584 x 1056 px).
// Source: "Level Design/Rowans/Rowans - game plate.jpg" cut
// into 33 columns and 22 rows. Unit 0,0 is the top left corner.
// ============================================================

const ROWANS_PLATE = {
  sprite: "plate-rowans",
  cols: 33,
  rows: 22,
  unit: 48,

  charScale: 1.1,

  // Edited on the level board (tools/levels/board.html): one entry per
  // painted thing, a footprint and, for tall things, an outline.
  things: [
    { name: "top edge", foot: [0, 0, 33, 0.4] },
    { name: "bottom edge", foot: [0, 21.6, 33, 22] },
    { name: "left edge", foot: [0, 0, 0.4, 22] },
    { name: "right edge", foot: [32.6, 0, 33, 22] },
  ],

  playerSpawn: [1.32, 19.8],

  enemySpawns: [
  ],

  exit: [32.55, 6.03, 32.95, 7.83],
};
