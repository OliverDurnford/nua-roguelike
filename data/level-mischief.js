// ============================================================
// THE MISCHIEF: Chapter 2, Area 3.
//
// Plate area, FIRST PASS geometry: outer shell and the start and
// exit only, written by tools/levels/accept.py. The furniture is
// traced on the level board (tools/levels/board.html).
//
// Grid: 24 x 32 units, one unit is 48 world px (1152 x 1536 px).
// Source: "Level Design/The Mischief/The Mischief - game plate.jpg" cut
// into 24 columns and 32 rows. Unit 0,0 is the top left corner.
// ============================================================

const MISCHIEF_PLATE = {
  sprite: "plate-mischief",
  cols: 24,
  rows: 32,
  unit: 48,

  charScale: 1.15,

  // Edited on the level board (tools/levels/board.html): one entry per
  // painted thing, a footprint and, for tall things, an outline.
  things: [
    { name: "top edge", foot: [0, 0, 24, 0.4] },
    { name: "bottom edge", foot: [0, 31.6, 24, 32] },
    { name: "left edge", foot: [0, 0, 0.4, 32] },
    { name: "right edge", foot: [23.6, 0, 24, 32] },
  ],

  playerSpawn: [21.4, 30.3],

  enemySpawns: [
  ],

  exit: [9.65, 0.05, 10.95, 0.5],
};
