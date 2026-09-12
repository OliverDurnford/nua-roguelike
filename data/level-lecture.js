// ============================================================
// THE LECTURE THEATRE: Chapter 2, Area 5. The boss arena.
//
// Plate area: painted background (core/plates-real.js) with a
// hand-measured collision layer. You come in through the double
// doors at the back (top), the four curved tiers of seats funnel
// you down the aisles, and Big Dick Dean waits on the lit floor
// at the front.
//
// TUNING NOTE: the long desk across the front is deliberately NOT
// solid, the same call as the loose chairs at Gonzo's. With it
// solid the boss only had two pockets either side of it to move
// in; walkable, the whole lit floor is the arena. The lectern,
// the whiteboard, the chair stack and the speakers do block.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/Lecture Theatre/Lecture Theatre - game
// plate.jpg" cut into 32 columns and 18 rows. Press F2 in game
// to see the blocks.
// ============================================================

const LECTURE_PLATE = {
  sprite: "plate-lecture",
  cols: 32,
  rows: 18,
  unit: 48,

  charScale: 1.1,

  solid: [
    // ---- back wall, doors included (you start just below them) ----
    [0,     0,     32,    3.9],

    // ---- the seat tiers, two blocks split by the centre aisle ----
    // Each block is cut in three so the rectangles follow the curve
    // of the rows: higher at the centre, lower at the walls.
    [3.1,   4.9,   6.0,   12.1],   // left block, outer third
    [6.0,   4.5,   10.0,  11.9],   // left block, middle third
    [10.0,  4.2,   14.7,  11.6],   // left block, inner third
    [17.4,  4.2,   22.0,  11.6],   // right block, inner third
    [22.0,  4.5,   26.4,  11.9],   // right block, middle third
    [26.4,  4.9,   29.3,  12.1],   // right block, outer third

    // ---- the side walls and their handrails ----
    [0,     3.9,   0.7,   12.2],
    [31.3,  3.9,   32,    12.2],

    // ---- the front of the room ----
    // The whiteboard and the chair stack are held down a little from
    // where they are painted, so the side aisles open onto the floor
    // with room for the widest enemy (feet brush their top edges).
    [1.0,   13.7,  4.6,   17.0],   // rolling whiteboard
    // (the lectern at 15.3, 14.0 to 16.9, 16.2 is walkable too: the
    // Dean stands at it, and a solid there split the front floor)
    [30.4,  13.8,  31.9,  17.2],   // stacked spare chairs
    [9.3,   16.4,  10.3,  18],     // speaker, left
    [22.0,  16.4,  23.0,  18],     // speaker, right
    [10.5,  16.5,  21.6,  18],     // the projection screen

    // ---- outer edge ----
    [0,     17.6,  32,    18],
    [0,     12.2,  0.4,   18],
    [31.6,  12.2,  32,    18],
  ],

  // Just inside the double doors, top of the centre aisle.
  playerSpawn: [16.05, 4.9],

  // The Dean, front and centre, at his lectern.
  bossSpawn: [16, 14.6],

  // The aisles and the front corners, for the boss's summons.
  enemySpawns: [
    [1.9, 6], [1.9, 10], [16, 8], [30.1, 6], [30.1, 10],
    [6.5, 15.6], [25.5, 15.6], [16, 6.2],
  ],

  // Way out: back through the doors you came in by.
  exit: [14.6, 3.5, 17.6, 3.95],
};
