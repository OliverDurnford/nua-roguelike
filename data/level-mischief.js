// ============================================================
// THE MISCHIEF: Chapter 2, Area 3.
//
// Plate area, FIRST PASS geometry. The pub is one tall image,
// three rooms stacked: games room with the pool table at the top,
// the bar room in the middle, the chequered front room at the
// bottom, stairs joining them. You come in the front door at the
// bottom and fight your way up.
//
// Grid: 14 x 26 units, one unit is 48 world px (672 x 1248 px).
// Source: "Level Design/The Mischief/The Mischief Level - game
// plate.png" cut into 14 columns and 26 rows.
// ============================================================

const MISCHIEF_PLATE = {
  sprite: "plate-mischief",
  cols: 14,
  rows: 26,
  unit: 48,

  // Old wooden pub painted cosy: doorways about 1.3 units, so
  // people stand 83px in here.
  charScale: 1.15,

  solid: [
    // ---- shell ----
    [0,    0,    14,   2.2],   // top wall and the sealed upstairs toilets
    [0,    0,    0.5,  26],    // left wall and both fireplace columns
    [13.6, 0,    14,   26],    // right wall

    // ---- games room (top) ----
    [0.5,  2.5,  3.1,  7.4],   // left seating: sofas, benches, tables
    [4.7,  3.6,  7.6,  6.3],   // the pool table
    [11.2, 2.2,  13.6, 3.5],   // shelves top right
    [11.2, 6.3,  13.6, 7.2],   // crates right of the room

    // ---- games room floor to bar room: wall with the staircase ----
    [0.5,  8.3,  5.3,  9.3],
    [8.7,  8.3,  13.6, 9.3],
    // (the stair banisters stay walkable clutter so the bar room's
    // upper corners keep brute-wide access)

    // ---- bar room (middle) ----
    [7.4,  11.4, 10.6, 15.3],  // the U bar and its back shelves
    [0.5,  10.9, 0.9,  12.2],  // fireplace
    [1.6,  12,   3.2,  13.4],  // square table, left
    [3.9,  12.1, 5.4,  13.5],  // square table, right of it, held clear of the bar lane
    [0.5,  13.8, 1.3,  16],    // bench run, left wall
    [11.5, 12.3, 12.9, 13.7],  // round table, right
    [11.6, 14.9, 13,   16.3],  // table, lower right

    // ---- bar room to front room: toilets and the lower stairs ----
    [0.5,  17.8, 7.1,  20.7],  // downstairs toilets, sealed
    [7.1,  17.8, 7.5,  20.3],  // stair rail, left
    [9.3,  17.8, 9.7,  20.3],  // stair rail, right
    [9.7,  17.8, 13.6, 19],    // wall right of the stairs

    // ---- front room (bottom) ----
    [5.4,  20.9, 7.4,  23.3],  // the white chimney breast, held left of the stair lane
    [1.4,  21.5, 3.4,  23],    // table, left
    [11.4, 20.9, 12.8, 22.3],  // round table, upper right
    [11.4, 23.4, 12.8, 24.8],  // round table, lower right

    // ---- bottom wall, front door left open ----
    [0,    25.5, 10.3, 26],
    [11.7, 25.5, 14,   26],
  ],

  playerSpawn: [8.9, 24.3],

  enemySpawns: [
    [4.6, 7.5], [9.8, 7.4], [11.9, 4.9],
    [2.2, 10.2], [4.8, 15.8], [11.9, 10.5],
    [4.7, 22.4], [9.9, 21.6],
  ],

  // Way out through the corridor between the upstairs toilets.
  exit: [8.3, 2.2, 9.5, 2.7],
};
