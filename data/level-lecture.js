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
    { name: "left desk row 1", foot: [4.62, 3.84, 14.8, 4.95], over: [[4.62, 3.64], [14.8, 3.64], [14.8, 4.14], [14.72, 4.16], [14.72, 4.98], [4.7, 4.98], [4.7, 4.16], [4.62, 4.14]] },
    { name: "left desk row 2", foot: [4.5, 5.62, 14.8, 6.73], over: [[4.5, 5.42], [14.8, 5.42], [14.8, 5.92], [14.72, 5.94], [14.72, 6.76], [4.58, 6.76], [4.58, 5.94], [4.5, 5.92]] },
    { name: "left desk row 3", foot: [4.3, 7.4, 14.8, 8.51], over: [[4.3, 7.2], [14.8, 7.2], [14.8, 7.7], [14.72, 7.72], [14.72, 8.54], [4.38, 8.54], [4.38, 7.72], [4.3, 7.7]] },
    { name: "left desk row 4", foot: [4.1, 9.17, 14.8, 10.28], over: [[4.1, 8.97], [14.8, 8.97], [14.8, 9.47], [14.72, 9.49], [14.72, 10.31], [4.18, 10.31], [4.18, 9.49], [4.1, 9.47]] },
    { name: "left desk row 5, top half", foot: [3.78, 10.96, 14.8, 11.5], over: [[3.78, 10.76], [14.8, 10.76], [14.8, 11.26], [14.76, 11.28], [14.76, 11.5], [3.82, 11.5], [3.82, 11.28], [3.78, 11.26]] },
    { name: "left desk row 5, front half", foot: [3.78, 11.5, 14.8, 12.05], over: [[3.82, 11.5], [14.76, 11.5], [14.76, 12.05], [3.82, 12.05]] },
    { name: "right desk row 1", foot: [17.5, 3.84, 27.55, 4.95], over: [[17.5, 3.64], [27.55, 3.64], [27.55, 4.14], [27.47, 4.16], [27.47, 4.98], [17.58, 4.98], [17.58, 4.16], [17.5, 4.14]] },
    { name: "right desk row 2", foot: [17.46, 5.62, 27.7, 6.73], over: [[17.46, 5.42], [27.7, 5.42], [27.7, 5.92], [27.62, 5.94], [27.62, 6.76], [17.54, 6.76], [17.54, 5.94], [17.46, 5.92]] },
    { name: "right desk row 3", foot: [17.46, 7.4, 27.88, 8.51], over: [[17.46, 7.2], [27.88, 7.2], [27.88, 7.7], [27.8, 7.72], [27.8, 8.54], [17.54, 8.54], [17.54, 7.72], [17.46, 7.7]] },
    { name: "right desk row 4", foot: [17.46, 9.17, 28.03, 10.28], over: [[17.46, 8.97], [28.03, 8.97], [28.03, 9.47], [27.95, 9.49], [27.95, 10.31], [17.54, 10.31], [17.54, 9.49], [17.46, 9.47]] },
    { name: "right desk row 5, top half", foot: [17.46, 10.96, 28.3, 11.5], over: [[17.46, 10.76], [28.3, 10.76], [28.3, 11.26], [28.26, 11.28], [28.26, 11.5], [17.5, 11.5], [17.5, 11.28], [17.46, 11.26]] },
    { name: "right desk row 5, front half", foot: [17.46, 11.5, 28.3, 12.05], over: [[17.5, 11.5], [28.26, 11.5], [28.26, 12.05], [17.5, 12.05]] },
    { name: "left outer rail, row 1", foot: [4.35, 4.33, 4.59, 4.69], over: [[4.39, 4.33], [4.59, 4.33], [4.55, 4.69], [4.35, 4.69]], see: true },
    { name: "left outer rail, row 2", foot: [4.16, 5.62, 4.45, 6.47], over: [[4.25, 5.62], [4.45, 5.62], [4.36, 6.47], [4.16, 6.47]], see: true },
    { name: "left outer rail, row 3", foot: [3.96, 7.4, 4.26, 8.25], over: [[4.06, 7.4], [4.26, 7.4], [4.16, 8.25], [3.96, 8.25]], see: true },
    { name: "left outer rail, row 4", foot: [3.76, 9.17, 4.06, 10.02], over: [[3.86, 9.17], [4.06, 9.17], [3.96, 10.02], [3.76, 10.02]], see: true },
    { name: "right outer rail, row 1", foot: [27.54, 4.33, 27.78, 4.69], over: [[27.54, 4.33], [27.74, 4.33], [27.78, 4.69], [27.58, 4.69]], see: true },
    { name: "right outer rail, row 2", foot: [27.67, 5.62, 27.96, 6.47], over: [[27.67, 5.62], [27.87, 5.62], [27.96, 6.47], [27.76, 6.47]], see: true },
    { name: "right outer rail, row 3", foot: [27.85, 7.4, 28.14, 8.25], over: [[27.85, 7.4], [28.05, 7.4], [28.14, 8.25], [27.95, 8.25]], see: true },
    { name: "right outer rail, row 4", foot: [28.04, 9.17, 28.33, 10.02], over: [[28.04, 9.17], [28.24, 9.17], [28.33, 10.02], [28.13, 10.02]], see: true },
    { name: "left aisle rail, row 1", foot: [14.93, 4.35, 15.01, 4.69], over: [[14.9, 4.35], [15.04, 4.35], [15.04, 4.69], [14.9, 4.69]], see: true },
    { name: "left aisle rail, row 2", foot: [14.93, 5.62, 15.01, 6.47], over: [[14.9, 5.62], [15.04, 5.62], [15.04, 6.47], [14.9, 6.47]], see: true },
    { name: "left aisle rail, row 3", foot: [14.93, 7.4, 15.01, 8.25], over: [[14.9, 7.4], [15.04, 7.4], [15.04, 8.25], [14.9, 8.25]], see: true },
    { name: "left aisle rail, row 4", foot: [14.93, 9.17, 15.01, 10.02], over: [[14.9, 9.17], [15.04, 9.17], [15.04, 10.02], [14.9, 10.02]], see: true },
    { name: "left aisle rail, row 5", foot: [14.93, 10.96, 15.01, 11.7], over: [[14.9, 10.96], [15.04, 10.96], [15.04, 11.7], [14.9, 11.7]], see: true },
    { name: "left aisle rail, row 6", foot: [14.93, 11.7, 15.01, 12.46], over: [[14.9, 11.7], [15.04, 11.7], [15.04, 12.46], [14.9, 12.46]], see: true },
    { name: "right aisle rail, row 1", foot: [17.24, 4.35, 17.32, 4.69], over: [[17.21, 4.35], [17.35, 4.35], [17.35, 4.69], [17.21, 4.69]], see: true },
    { name: "right aisle rail, row 2", foot: [17.24, 5.62, 17.32, 6.47], over: [[17.21, 5.62], [17.35, 5.62], [17.35, 6.47], [17.21, 6.47]], see: true },
    { name: "right aisle rail, row 3", foot: [17.24, 7.4, 17.32, 8.25], over: [[17.21, 7.4], [17.35, 7.4], [17.35, 8.25], [17.21, 8.25]], see: true },
    { name: "right aisle rail, row 4", foot: [17.24, 9.17, 17.32, 10.02], over: [[17.21, 9.17], [17.35, 9.17], [17.35, 10.02], [17.21, 10.02]], see: true },
    { name: "right aisle rail, row 5", foot: [17.24, 10.96, 17.32, 11.7], over: [[17.21, 10.96], [17.35, 10.96], [17.35, 11.7], [17.21, 11.7]], see: true },
    { name: "right aisle rail, row 6", foot: [17.24, 11.7, 17.32, 12.46], over: [[17.21, 11.7], [17.35, 11.7], [17.35, 12.46], [17.21, 12.46]], see: true },
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
