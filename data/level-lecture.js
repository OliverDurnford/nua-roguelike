// ============================================================
// THE LECTURE THEATRE: Chapter 2, Area 5. The boss arena.
//
// Plate area: painted background (core/plates-real.js) with a
// hand-measured collision layer. You come in through the double
// doors at the back (top), walk down one of three aisles past
// five tiers of desks, and Big Dick Dean waits on the open floor
// at the front, between the lecturer's desk and the screen.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS. The plate is 32 units wide
// by 18 tall, one unit is 48 world px, so the room is 1536 x 864.
// Unit 0,0 is the top left of the picture. Source: "Level Design/
// Lecture Theatre/Lecture Theatre - game plate.jpg" cut into 32
// columns and 18 rows. Press F2 in game to see the blocks.
//
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTE: the seating is painted as a trapezoid, wider at the
// front than at the back, so each tier gets its own rectangle and
// the five of them step outwards. They touch top to bottom on
// purpose: there is no walkable gap between a desk and the seats
// of the row below it, it is all one bank of furniture.
//
// TUNING NOTE: the four handrails (one down each side of the
// centre aisle, one down the inside edge of each side aisle) are
// four pixels wide. Blocking them would steal a quarter of the
// centre aisle for a pole you can barely see, so the rectangles
// stop at the desks and the rails stay walkable. The centre aisle
// is 2.73 units (131 px) clear as a result, which the boss needs:
// his body box is 91 px wide.
//
// TUNING NOTE: the lecturer's desk is held back to 13.7, about a
// quarter of a unit below where its top edge is painted, and the
// monitors standing on it are not solid at all. Painted exactly,
// the desk left a 64 px slot between itself and the front row and
// sealed the right hand aisle off: nothing wider than the player
// could get round it. Held back, the lane above it is 1.62 units
// (78 px) and the brute fits. Feet clip the back edge of the desk.
//
// The strip along the back wall, between the wall and the top row
// of seats, is only 55 px deep, so the player can walk it but the
// brute cannot. That is how it is painted and it costs nothing:
// every aisle still meets the open floor at the front.
// ============================================================

const LECTURE_PLATE = {
  sprite: "plate-lecture",
  cols: 32,
  rows: 18,
  unit: 48,

  charScale: 1.1,

  solid: [
    // ---- back wall, doors included (you start just below them) ----
    [0,     0,     32,    2.06],   // back wall: panels, clock, the doorway
    [12.62, 2.06,  13.45, 2.72],   // wall speaker, left of the doors
    [18.82, 2.06,  19.65, 2.72],   // wall speaker, right of the doors

    // ---- side walls ----
    [0,     2.06,  0.32,  18],     // left wall
    [31.90, 2.06,  32,    18],     // right wall

    // ---- left block: five tiers, each one desk plus the seats behind it ----
    [4.67,  3.20,  14.77, 4.75],   // left tier 1 (back row, nearest the doors)
    [4.50,  4.75,  14.77, 6.50],   // left tier 2
    [4.31,  6.50,  14.77, 8.25],   // left tier 3
    [4.15,  8.25,  14.77, 10.02],  // left tier 4
    [3.83,  10.02, 14.77, 12.08],  // left tier 5 (front row, deeper front panel)

    // ---- right block: the same five tiers, stepping the other way ----
    [17.50, 3.20,  27.48, 4.75],   // right tier 1
    [17.50, 4.75,  27.65, 6.50],   // right tier 2
    [17.50, 6.50,  27.81, 8.25],   // right tier 3
    [17.50, 8.25,  28.00, 10.02],  // right tier 4
    [17.50, 10.02, 28.31, 12.08],  // right tier 5

    // ---- the front of the room ----
    [22.58, 13.70, 29.05, 15.60],  // lecturer's desk: white slab and its legs
    [25.65, 14.40, 27.40, 16.20],  // his office chair, pulled out in front of it
    [6.75,  16.55, 25.55, 17.80],  // the projection screen and its frame
    [0,     17.77, 32,    18],     // front wall, so nobody walks off the picture
  ],

  // Just inside the double doors, at the mouth of the centre aisle.
  playerSpawn: [16.05, 3.15],

  // The Dean, front and centre on the open carpet. Held 2.2 units off
  // the screen and well clear of the desk, so he has the whole floor.
  bossSpawn: [16.0, 14.3],

  // Two down each side aisle, one in the centre aisle, three across the
  // front floor. All of them clear the widest enemy (the brute) by more
  // than half its box, so nothing ever arrives inside the furniture.
  enemySpawns: [
    [2.1, 5.4], [2.0, 9.6], [16.1, 7.6],
    [29.8, 5.4], [29.8, 9.6],
    [5.5, 14.6], [11.5, 15.2], [20.5, 14.6],
  ],

  // Way out: back through the doors you came in by. Sits on the
  // threshold, half on the wall, half on the floor. Locked until the
  // Dean is down.
  exit: [14.30, 1.90, 17.20, 2.30],
};
