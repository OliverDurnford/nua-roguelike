// ============================================================
// THE CATHEDRAL: Chapter 3, Area 5. The boss arena.
//
// Plate area, like Gonzo's: one painted top-down background
// (core/plates-real.js) with a hand-measured collision layer.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 24 units wide by 32 tall, and one unit is 48 world px, so the
// nave is 1152 x 1536 px: a tall room you fight down, not across.
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Cathedral/Cathedral - game plate.jpg",
// imagine it cut into 24 columns and 32 rows, and read off the
// column and row.
//
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTE, same spirit as Gonzo's: the loose chairs standing
// about in the side aisles are NOT solid, you walk over them. The
// six blocks of seating are, each as one rectangle. The stage is
// one band across the top; the three steps down off it are open
// floor, so you can fight along the front of the stage.
// ============================================================

const CATHEDRAL_PLATE = {
  sprite: "plate-cathedral",
  cols: 24,
  rows: 32,
  unit: 48,          // world pixels per grid unit -> room is 1152 x 1536

  charScale: 1.15,

  solid: [
    // ---- the stage, one band across the whole top ----
    // Organ pipes, organ screen, the raised purple stage and everything
    // standing on it: lectern, white table, both banners, both flower
    // stands. The front edge of the stage is the line at 9.15; the three
    // steps below it (9.15 to 10.75) are walkable.
    [0,     0,     24,    9.15],

    // ---- left pillars ----
    // One band: the outer wall, the dim side aisle behind the pillars
    // (only half a unit wide, so it is sealed rather than left walkable)
    // and the round pillar itself, which runs the full height.
    [0,     9.15,  2.60,  32],
    [2.60,  9.15,  3.52,  18.15],  // arcade pier, the carved zigzag one
    [3.52,  9.15,  4.12,  10.40],  // pillar head where it crosses the steps
    [3.52,  10.40, 4.46,  11.85],  // its carved capital
    [3.52,  17.20, 3.80,  18.15],  // the pier's base moulding

    // ---- right pillars, the mirror of the left ----
    [21.40, 9.15,  24,    32],
    [20.48, 9.15,  21.40, 18.15],  // arcade pier
    [19.88, 9.15,  20.48, 10.40],  // pillar head
    [19.54, 10.40, 20.48, 11.85],  // capital
    [20.20, 17.20, 20.48, 18.15],  // base moulding

    // ---- six blocks of wooden chairs ----
    // Measured off the painting at 5.22-9.80 and 14.20-18.78 across.
    // The ends are pulled in by about a fifth of a unit from the painted
    // chair legs so each cross aisle clears 2 units (96 px): the chapter 3
    // brute is 73 x 76 px and would not fit through the 58 px the painting
    // actually leaves. You step over the last row of chair legs instead.
    [5.22,  11.50, 9.80,  16.95],  // left block, front
    [14.20, 11.50, 18.78, 16.95],  // right block, front
    [5.22,  18.95, 9.80,  22.70],  // left block, middle
    [14.20, 18.95, 18.78, 22.70],  // right block, middle
    [5.22,  24.70, 9.80,  28.80],  // left block, back
    [14.20, 24.70, 18.78, 28.80],  // right block, back

    // ---- west wall and the great west door, standing open ----
    // The wall steps forward either side of the doorway to make the reveal,
    // and the two door leaves stand open in it. The gap between them is
    // 2.06 units, wide enough to walk out, too narrow for the Dean.
    [0,     30.60, 9.75,  32],     // west wall, left of the door
    [9.75,  29.80, 10.35, 32],     // left door jamb
    [10.35, 29.00, 10.97, 32],     // left leaf, swung open
    [13.03, 29.00, 13.65, 32],     // right leaf, swung open
    [13.65, 29.80, 14.25, 32],     // right door jamb
    [14.25, 30.60, 24,    32],     // west wall, right of the door
  ],

  // In the open west door, on the last of the red carpet, facing the stage.
  playerSpawn: [12.0, 29.3],

  // The Dean walks on at the foot of the stage steps, dead centre of the
  // carpet. The central aisle between the chair blocks is 4.4 units (211 px)
  // wide all the way down, so his 97 x 139 px box has room to chase.
  bossSpawn: [12.0, 12.5],

  // Four in the two cross aisles, four in the side aisles behind the
  // chair blocks. All are clear of the walls by more than half the width
  // of the widest regular enemy, and all are more than 5 units from the
  // door so nothing lands on top of you. If G.CHAR_H goes up, check them.
  enemySpawns: [
    [7.5, 17.95], [16.5, 17.95],   // front cross aisle
    [7.5, 23.70], [16.5, 23.70],   // back cross aisle
    [3.9, 20.5],  [20.1, 20.5],    // side aisles, level with the middle blocks
    [3.9, 26.5],  [20.1, 26.5],    // side aisles, level with the back blocks
  ],

  // Back out the way you came in, across the open west door.
  // Locked until the room is clear.
  exit: [11.05, 31.20, 12.95, 31.70],
};
