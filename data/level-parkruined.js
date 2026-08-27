// ============================================================
// VICTORIA PARK, RUINED — Chapter 5, Area 5. The finale arena.
//
// Plate area, FIRST PASS geometry. The same park from the
// tutorial, years on and broken: dead trees, the glowing rune
// cracks, the overgrown car park on the right. The painted
// cracks are floor, not walls; the arena stays open for the
// Old Age fight.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/Victoria Park/Victoria Park Boss
// level.jpg" cut into 32 columns and 18 rows.
// ============================================================

const PARKRUINED_PLATE = {
  sprite: "plate-parkruined",
  cols: 32,
  rows: 18,
  unit: 48,

  // Same ground scale as the tutorial's park.
  charScale: 1.15,

  solid: [
    // ---- the hedge line along the top ----
    [0,    0,    32,   1.6],
    [14.6, 1.6,  15.5, 2.6],   // the bin by the path
    [26.8, 1.7,  29.4, 2.4],   // the bench
    [18.4, 1.6,  20.6, 3.4],   // dead tree, top middle

    // ---- left flank ----
    [0,    1.6,  4.4,  4.7],   // big tree and the fallen log
    [0,    4.7,  1.3,  18],    // swampy left edge
    [1.3,  12.9, 3.6,  15.5],  // fallen tree, bottom left
    [4,    15.7, 9.3,  17.7],  // bushes along the bottom

    // ---- middle clutter ----
    [11.5, 7.6,  13.4, 8.9],   // rocks by the west crack
    [18.6, 7.5,  20.3, 8.7],   // rocks by the east crack
    [10.3, 14.1, 13.8, 15.9],  // the rubbish pile: bags, bones, the football

    // ---- the overgrown car park, right ----
    [23.9, 5,    27.3, 7],     // rusted car
    [23.8, 8,    26.9, 9.9],   // mossy parked car
    [23.5, 10.7, 27.7, 13.4],  // the wrecked car and its spilt engine
    [19.4, 13.9, 23,   16.2],  // big bush, bottom centre right
    [22.9, 3.8,  23.5, 10.5],  // ivy fence, upper run
    [31.6, 1.6,  32,   18],    // right edge of the road

    // ---- outer edge ----
    [0,    17.5, 32,   18],
  ],

  playerSpawn: [15.5, 16.5],

  bossSpawn: [16, 5.5],

  enemySpawns: [
    [5, 6], [9, 3], [22, 3.2], [28, 4.5],
    [29, 8.5], [29.5, 14.5], [3.5, 10.5], [6, 13.5],
  ],

  // The path mouth at the top; the finale never unlocks it, it is
  // here so the schema stays uniform.
  exit: [15.2, 1.6, 16.8, 2.1],
};
