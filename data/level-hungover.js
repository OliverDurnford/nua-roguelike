// ============================================================
// THE HUNGOVER WALK: Chapter 2, Area 4. The quiet area.
//
// Plate area: painted background (core/plates-real.js) with a
// hand-measured collision layer. The street runs along the foot
// of the castle mound: keep and mound at the top (sealed), the
// flint wall and railings, then the pavement and the road, both
// walkable. You come in from the left and leave off the right.
// The friend is found next to the sick on the pavement.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/Hungover Walk/Hungover Walk - game
// plate.jpg" cut into 32 columns and 18 rows. Unit 0,0 is the
// top left corner. Press F2 in game to see the blocks.
// ============================================================

const HUNGOVER_PLATE = {
  sprite: "plate-hungover",
  cols: 32,
  rows: 18,
  unit: 48,

  // A wide open street: people stand 79px, a touch under Gonzo's.
  charScale: 1.1,

  solid: [
    // ---- castle, mound, flint wall and railings: all sealed ----
    [0,     0,     32,    10.55],

    // ---- street furniture on the pavement ----
    [5.35,  10.55, 5.95,  12.8],   // lamp post
    [12.1,  11.55, 12.7,  12.8],   // bollard, left
    [13.3,  11.55, 13.9,  12.8],   // bollard, right
    [17.4,  11.55, 18.4,  12.8],   // the overflowing bin
    [25.0,  10.55, 28.2,  11.8],   // bus shelter

    // ---- on the road ----
    [7.1,   13.3,  7.8,   14.0],   // traffic cone
    [1.9,   15.5,  5.1,   17.6],   // red hatchback
    [21.1,  15.2,  25.7,  17.6],   // white van

    // ---- outer edge, so nobody walks off the picture ----
    [0,     17.6,  32,    18],
    [0,     10.55, 0.2,   18],
  ],

  // On the pavement, just in from the left edge.
  playerSpawn: [1.3, 12.4],

  // The friend, being sick on the pavement (the orange puddle).
  companionSpawn: [21.6, 11.3],

  // No enemies here (enemyBudget 0), kept so the schema stays uniform.
  enemySpawns: [
    [9, 15.2], [16, 15.2], [29, 12.6],
  ],

  // Way out: the street carries on off the right edge.
  exit: [31.55, 10.6, 31.95, 13.4],
};
