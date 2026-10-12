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
// things: one entry per painted thing (footprint and outline); see below.
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

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "back wall, left of the doorway", foot: [0, 0, 14.8, 2.22] },
    { name: "back wall, right of the doorway", foot: [17.5, 0, 32, 2.22] },
    { name: "wall above the doorway", foot: [14.8, 0, 17.5, 1.2] },
    { name: "left wall", foot: [0, 2.06, 0.32, 18] },
    { name: "right wall", foot: [31.9, 2.06, 32, 18] },
    { name: "front wall, so nobody walks off the picture", foot: [0, 17.77, 32, 18] },
    { name: "projection screen on the front wall", foot: [6.75, 16.55, 25.55, 17.77] },
    { name: "speaker, left of the doors", foot: [12.68, 2.4, 13.41, 2.95], over: [[12.74, 1.83], [13.35, 1.83], [13.41, 1.9], [13.41, 2.9], [13.35, 2.95], [12.74, 2.95], [12.68, 2.9], [12.68, 1.9]] },
    { name: "speaker, right of the doors", foot: [18.9, 2.4, 19.66, 2.95], over: [[18.96, 1.78], [19.6, 1.78], [19.66, 1.85], [19.66, 2.9], [19.6, 2.95], [18.96, 2.95], [18.9, 2.9], [18.9, 1.85]] },
    { name: "fire extinguisher", foot: [17.95, 2.2, 18.4, 2.48], over: [[18, 1.8], [17.9, 1.7], [17.92, 1.56], [18.1, 1.54], [18.32, 1.56], [18.42, 1.64], [18.4, 1.8], [18.35, 1.86], [18.35, 2.45], [18.3, 2.5], [18.05, 2.5], [18, 2.44], [17.98, 2.36], [17.9, 2.36]] },
    { name: "left seating bank, part 1", foot: [4.56, 3.2, 14.85, 4.2], over: [[5.04, 3.21], [5.71, 3.21], [5.85, 3.56], [6.17, 3.56], [6.29, 3.21], [6.96, 3.21], [7.08, 3.56], [7.4, 3.56], [7.52, 3.21], [8.19, 3.21], [8.31, 3.56], [8.62, 3.56], [8.75, 3.21], [9.44, 3.21], [9.56, 3.56], [9.88, 3.56], [10, 3.21], [10.67, 3.21], [10.79, 3.56], [11.1, 3.56], [11.23, 3.21], [11.9, 3.21], [12.04, 3.56], [12.35, 3.56], [12.48, 3.21], [13.17, 3.21], [13.27, 3.56], [13.56, 3.56], [13.71, 3.21], [14.42, 3.21], [14.52, 3.56], [14.85, 3.71], [14.85, 4.21], [4.56, 4.21], [4.6, 3.69], [4.94, 3.56]] },
    { name: "left seating bank, part 2", foot: [4.44, 4.2, 14.8, 5.2], over: [[4.55, 4.2], [14.8, 4.2], [14.8, 5.2], [4.44, 5.2]] },
    { name: "left seating bank, part 3", foot: [4.34, 5.2, 14.8, 6.2], over: [[4.44, 5.2], [14.8, 5.2], [14.8, 6.2], [4.34, 6.2]] },
    { name: "left seating bank, part 4", foot: [4.24, 6.2, 14.8, 7.2], over: [[4.34, 6.2], [14.8, 6.2], [14.8, 7.2], [4.24, 7.2]] },
    { name: "left seating bank, part 5", foot: [4.13, 7.2, 14.8, 8.2], over: [[4.24, 7.2], [14.8, 7.2], [14.8, 8.2], [4.13, 8.2]] },
    { name: "left seating bank, part 6", foot: [4.03, 8.2, 14.8, 9.2], over: [[4.13, 8.2], [14.8, 8.2], [14.8, 9.2], [4.03, 9.2]] },
    { name: "left seating bank, part 7", foot: [3.92, 9.2, 14.8, 10.2], over: [[4.03, 9.2], [14.8, 9.2], [14.8, 10.2], [3.92, 10.2]] },
    { name: "left seating bank, part 8", foot: [3.77, 10.2, 14.8, 11.2], over: [[3.92, 10.2], [14.8, 10.2], [14.8, 11.2], [3.77, 11.2], [3.77, 10.7], [3.87, 10.7]] },
    { name: "left seating bank, part 9", foot: [3.77, 11.2, 14.8, 12.08], over: [[3.77, 11.2], [14.8, 11.2], [14.8, 12.08], [3.77, 12.08]] },
    { name: "right seating bank, part 1", foot: [17.4, 3.2, 27.6, 4.2], over: [[17.81, 3.21], [18.52, 3.21], [18.67, 3.56], [18.92, 3.56], [19.06, 3.21], [19.75, 3.21], [19.85, 3.56], [20.19, 3.56], [20.31, 3.21], [20.98, 3.21], [21.08, 3.56], [21.42, 3.56], [21.52, 3.21], [22.21, 3.21], [22.33, 3.56], [22.62, 3.56], [22.77, 3.21], [23.44, 3.21], [23.56, 3.56], [23.85, 3.56], [24, 3.21], [24.67, 3.21], [24.79, 3.56], [25.12, 3.56], [25.25, 3.21], [25.92, 3.21], [26.04, 3.56], [26.35, 3.56], [26.48, 3.21], [27.17, 3.21], [27.27, 3.54], [27.58, 3.77], [27.6, 4.04], [27.52, 4.21], [17.52, 4.21], [17.4, 4.08], [17.4, 3.73], [17.71, 3.56]] },
    { name: "right seating bank, part 2", foot: [17.46, 4.2, 27.68, 5.2], over: [[17.46, 4.2], [27.57, 4.2], [27.68, 5.2], [17.46, 5.2]] },
    { name: "right seating bank, part 3", foot: [17.46, 5.2, 27.79, 6.2], over: [[17.46, 5.2], [27.68, 5.2], [27.79, 6.2], [17.46, 6.2]] },
    { name: "right seating bank, part 4", foot: [17.46, 6.2, 27.89, 7.2], over: [[17.46, 6.2], [27.79, 6.2], [27.89, 7.2], [17.46, 7.2]] },
    { name: "right seating bank, part 5", foot: [17.46, 7.2, 28, 8.2], over: [[17.46, 7.2], [27.89, 7.2], [28, 8.2], [17.46, 8.2]] },
    { name: "right seating bank, part 6", foot: [17.46, 8.2, 28.11, 9.2], over: [[17.46, 8.2], [28, 8.2], [28.11, 9.2], [17.46, 9.2]] },
    { name: "right seating bank, part 7", foot: [17.46, 9.2, 28.21, 10.2], over: [[17.46, 9.2], [28.11, 9.2], [28.21, 10.2], [17.46, 10.2]] },
    { name: "right seating bank, part 8", foot: [17.46, 10.2, 28.34, 11.2], over: [[17.46, 10.2], [28.21, 10.2], [28.27, 10.7], [28.34, 10.7], [28.34, 11.2], [17.46, 11.2]] },
    { name: "right seating bank, part 9", foot: [17.46, 11.2, 28.34, 12.08], over: [[17.46, 11.2], [28.34, 11.2], [28.34, 12.08], [17.46, 12.08]] },
    { name: "left outer rail, part 1", foot: [4.34, 4.33, 4.55, 5.2], over: [[4.39, 4.33], [4.59, 4.33], [4.5, 5.2], [4.3, 5.2]], see: true },
    { name: "left outer rail, part 2", foot: [4.23, 5.2, 4.46, 6.2], over: [[4.3, 5.2], [4.5, 5.2], [4.39, 6.2], [4.19, 6.2]], see: true },
    { name: "left outer rail, part 3", foot: [4.12, 6.2, 4.35, 7.2], over: [[4.19, 6.2], [4.39, 6.2], [4.28, 7.2], [4.08, 7.2]], see: true },
    { name: "left outer rail, part 4", foot: [4.01, 7.2, 4.24, 8.2], over: [[4.08, 7.2], [4.28, 7.2], [4.17, 8.2], [3.97, 8.2]], see: true },
    { name: "left outer rail, part 5", foot: [3.9, 8.2, 4.13, 9.2], over: [[3.97, 8.2], [4.17, 8.2], [4.06, 9.2], [3.86, 9.2]], see: true },
    { name: "left outer rail, part 6", foot: [3.8, 9.2, 4.02, 10.05], over: [[3.86, 9.2], [4.06, 9.2], [3.96, 10.05], [3.76, 10.05]], see: true },
    { name: "right outer rail, part 1", foot: [27.58, 4.33, 27.79, 5.2], over: [[27.54, 4.33], [27.74, 4.33], [27.83, 5.2], [27.63, 5.2]], see: true },
    { name: "right outer rail, part 2", foot: [27.67, 5.2, 27.89, 6.2], over: [[27.63, 5.2], [27.83, 5.2], [27.93, 6.2], [27.73, 6.2]], see: true },
    { name: "right outer rail, part 3", foot: [27.77, 6.2, 27.99, 7.2], over: [[27.73, 6.2], [27.93, 6.2], [28.03, 7.2], [27.83, 7.2]], see: true },
    { name: "right outer rail, part 4", foot: [27.87, 7.2, 28.1, 8.2], over: [[27.83, 7.2], [28.03, 7.2], [28.14, 8.2], [27.94, 8.2]], see: true },
    { name: "right outer rail, part 5", foot: [27.98, 8.2, 28.2, 9.2], over: [[27.94, 8.2], [28.14, 8.2], [28.24, 9.2], [28.04, 9.2]], see: true },
    { name: "right outer rail, part 6", foot: [28.08, 9.2, 28.29, 10.05], over: [[28.04, 9.2], [28.24, 9.2], [28.33, 10.05], [28.13, 10.05]], see: true },
    { name: "left aisle rail, part 1", foot: [14.91, 4.35, 15.03, 5.2], over: [[14.9, 4.35], [15.04, 4.35], [15.04, 5.2], [14.9, 5.2]], see: true },
    { name: "left aisle rail, part 2", foot: [14.91, 5.2, 15.03, 6.2], over: [[14.9, 5.2], [15.04, 5.2], [15.04, 6.2], [14.9, 6.2]], see: true },
    { name: "left aisle rail, part 3", foot: [14.91, 6.2, 15.03, 7.2], over: [[14.9, 6.2], [15.04, 6.2], [15.04, 7.2], [14.9, 7.2]], see: true },
    { name: "left aisle rail, part 4", foot: [14.91, 7.2, 15.03, 8.2], over: [[14.9, 7.2], [15.04, 7.2], [15.04, 8.2], [14.9, 8.2]], see: true },
    { name: "left aisle rail, part 5", foot: [14.91, 8.2, 15.03, 9.2], over: [[14.9, 8.2], [15.04, 8.2], [15.04, 9.2], [14.9, 9.2]], see: true },
    { name: "left aisle rail, part 6", foot: [14.91, 9.2, 15.03, 10.2], over: [[14.9, 9.2], [15.04, 9.2], [15.04, 10.2], [14.9, 10.2]], see: true },
    { name: "left aisle rail, part 7", foot: [14.91, 10.2, 15.03, 11.2], over: [[14.9, 10.2], [15.04, 10.2], [15.04, 11.2], [14.9, 11.2]], see: true },
    { name: "left aisle rail, part 8", foot: [14.91, 11.2, 15.03, 12.46], over: [[14.9, 11.2], [15.04, 11.2], [15.04, 12.46], [14.9, 12.46]], see: true },
    { name: "right aisle rail, part 1", foot: [17.22, 4.35, 17.34, 5.2], over: [[17.21, 4.35], [17.35, 4.35], [17.35, 5.2], [17.21, 5.2]], see: true },
    { name: "right aisle rail, part 2", foot: [17.22, 5.2, 17.34, 6.2], over: [[17.21, 5.2], [17.35, 5.2], [17.35, 6.2], [17.21, 6.2]], see: true },
    { name: "right aisle rail, part 3", foot: [17.22, 6.2, 17.34, 7.2], over: [[17.21, 6.2], [17.35, 6.2], [17.35, 7.2], [17.21, 7.2]], see: true },
    { name: "right aisle rail, part 4", foot: [17.22, 7.2, 17.34, 8.2], over: [[17.21, 7.2], [17.35, 7.2], [17.35, 8.2], [17.21, 8.2]], see: true },
    { name: "right aisle rail, part 5", foot: [17.22, 8.2, 17.34, 9.2], over: [[17.21, 8.2], [17.35, 8.2], [17.35, 9.2], [17.21, 9.2]], see: true },
    { name: "right aisle rail, part 6", foot: [17.22, 9.2, 17.34, 10.2], over: [[17.21, 9.2], [17.35, 9.2], [17.35, 10.2], [17.21, 10.2]], see: true },
    { name: "right aisle rail, part 7", foot: [17.22, 10.2, 17.34, 11.2], over: [[17.21, 10.2], [17.35, 10.2], [17.35, 11.2], [17.21, 11.2]], see: true },
    { name: "right aisle rail, part 8", foot: [17.22, 11.2, 17.34, 12.46], over: [[17.21, 11.2], [17.35, 11.2], [17.35, 12.46], [17.21, 12.46]], see: true },
    { name: "lecturer's desk with its monitors", foot: [22.6, 14.6, 29.05, 15.6], over: [[22.6, 13.4], [23.4, 13.4], [23.65, 12.8], [24.15, 12.8], [24.2, 13], [23.95, 13.4], [24.8, 13.4], [24.8, 12.85], [27.6, 12.85], [27.6, 13.4], [29.05, 13.4], [29.05, 15.6], [28.8, 15.6], [28.8, 14.95], [22.85, 14.95], [22.85, 15.6], [22.6, 15.6]] },
    { name: "double doors, walk under", over: [[14.8, 0], [17.5, 0], [17.5, 2.2], [17.3, 2.2], [17.3, 1.2], [15, 1.2], [15, 2.2], [14.8, 2.2]], base: 2.2 },
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
