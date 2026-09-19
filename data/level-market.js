// ============================================================
// NORWICH MARKET: Chapter 2, Area 1.
//
// Plate area, geometry re-surveyed 12 Sep 2026 (aisles opened for
// the brute) but the known caveat stands: the art's
// aisles between stall rows painted narrower than a character, so
// the solid blocks cover only the slim heart of each stall row and
// people are scaled slightly small. Feet will brush tent edges.
// The proper fix is stretching the art taller (the Mischief grow
// method) and re-measuring; flagged for Ollie's call.
//
// Grid: 34 x 18 units, one unit is 48 world px (1632 x 864 px).
// Source: "Level Design/Norwich Market/Norwich Market Level
// Design.jpg" cut into 34 columns and 18 rows.
// ============================================================

const MARKET_PLATE = {
  sprite: "plate-market",
  cols: 34,
  rows: 18,
  unit: 48,

  // Deliberately small (68px) so the painted aisles stay walkable.
  charScale: 0.95,

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "wall 1", foot: [0, 0, 12.6, 2.4] },
    { name: "wall 2", foot: [15, 0, 34, 2.4] },
    { name: "left shopfronts", foot: [0, 2.6, 1.5, 18] },
    { name: "right shopfronts", foot: [32.5, 2.6, 34, 18] },
    { name: "wall 5", foot: [2.2, 4, 12.3, 5.9] },
    { name: "wall 6", foot: [15.3, 4, 23.4, 5.9] },
    { name: "wall 7", foot: [27.4, 4, 32.5, 5.9] },
    { name: "wall 8", foot: [2.2, 7.8, 12.3, 9.9] },
    { name: "wall 9", foot: [15.3, 7.8, 23.4, 9.9] },
    { name: "wall 10", foot: [27.4, 7.8, 32.5, 9.9] },
    { name: "wall 11", foot: [2.2, 12.1, 12.3, 14.1] },
    { name: "wall 12", foot: [15.3, 12.1, 23.4, 14.1] },
    { name: "wall 13", foot: [27.4, 12.1, 32.5, 14.1] },
    { name: "wall 14", foot: [1.5, 16, 14.9, 18] },
    { name: "wall 15", foot: [19.1, 16, 34, 18] },
    { name: "edge strip across the entrance mouth", foot: [14.9, 17.6, 19.1, 18] },
  ],

  playerSpawn: [17, 16.5],

  enemySpawns: [
    [13.8, 3.2], [25.4, 3.2],
    [13.8, 6.9], [25.4, 6.9],
    [13.8, 11],  [25.4, 11],
    [6, 6.9],    [29.9, 11],
  ],

  // Way out, up the steps at the top of the market.
  exit: [12.7, 2.1, 14.95, 2.55],
};
