// ============================================================
// THE BEEHIVE: Chapter 4, Area 3.
//
// Plate area, FIRST PASS geometry: outer shell and the start and
// exit only, written by tools/levels/accept.py. The furniture is
// traced on the level board (tools/levels/board.html).
//
// Grid: 32 x 24 units, one unit is 48 world px (1536 x 1152 px).
// Source: "Level Design/The Beehive/The Beehive - game plate.jpg" cut
// into 32 columns and 24 rows. Unit 0,0 is the top left corner.
// ============================================================

const BEEHIVE_PLATE = {
  sprite: "plate-beehive",
  cols: 32,
  rows: 24,
  unit: 48,

  charScale: 1.3,

  // Edited on the level board (tools/levels/board.html): one entry per
  // painted thing, a footprint and, for tall things, an outline.
  things: [
    { name: "top edge", foot: [0, 0, 32, 0.4] },
    { name: "bottom edge", foot: [0, 23.6, 32, 24] },
    { name: "left edge", foot: [0, 0, 0.4, 24] },
    { name: "right edge", foot: [31.6, 0, 32, 24] },
  ],

  playerSpawn: [0.96, 12.24],

  enemySpawns: [
  ],

  exit: [22.46, 23.55, 24.26, 23.95],
};
