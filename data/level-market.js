// ============================================================
// NORWICH MARKET — Chapter 2, Area 1.
//
// Plate area, FIRST PASS geometry with a known caveat: the art's
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

  solid: [
    // ---- city wall and the steps band along the top ----
    [0,    0,   12.6, 2.6],
    [15.0, 0,   34,   2.6],

    // ---- side buildings ----
    [0,    2.6, 1.5,  18],     // left shopfronts
    [32.5, 2.6, 34,   18],     // right shopfronts

    // ---- stall rows, slim hearts only (counters and posts) ----
    [2.2,  3.8, 12.3, 5.9],  [15.3, 3.8, 23.4, 5.9],  [27.4, 3.8, 32.5, 5.9],
    [2.2,  7.8, 12.3, 9.9],  [15.3, 7.8, 23.4, 9.9],  [27.4, 7.8, 32.5, 9.9],
    [2.2, 12.1, 12.3, 14.3], [15.3, 12.1, 23.4, 14.3], [27.4, 12.1, 32.5, 14.3],

    // ---- bottom shopfronts, entrance gap in the middle ----
    [1.5,  15.6, 14.9, 18],
    [19.1, 15.6, 34,   18],
    [14.9, 17.6, 19.1, 18],    // edge strip across the entrance mouth
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
