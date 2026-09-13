// ============================================================
// THE NUA LIBRARY: Chapter 3, Area 2.
//
// Plate area, like Gonzo's: one painted top-down background
// (core/plates-real.js) with a hand-measured collision layer
// drawn on top of it. No ASCII map.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS. The plate is 32 units wide
// by 18 tall, one unit is 48 world px, so the room is 1536 x 864.
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/NUA Library/NUA Library - game plate.jpg",
// imagine it cut into 32 columns and 18 rows, and read off the
// column and row.
//
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTES
// Chairs are walkable, the same rule as Gonzo's: the blue chairs
// round the study tables, the rows down both sides of the reading
// tables and the two by the stairs are painted clutter you walk
// straight over. Tables, shelving, the issue desk and the walls
// block you.
//
// The six stacks are drawn 1.08 units wide against a painted
// 1.31, about 5px shaved off each side. That is deliberate: at
// their painted width the corridors between them come out at
// 73 to 76px, and the chapter 3 brute (the printer) needs 73px
// plus room to steer. Shaved, every corridor is at least 1.78
// units (85px) from end to end. Re-check with tools/levels/reach.py
// if G.CHAR_H or charScale ever moves.
//
// The corridors are dead ends at the top: the stacks start only
// 0.39 units below the wall, which nothing fits through. They are
// open at the bottom onto the aisle between the stacks and the
// reading tables, and that aisle is the spine of the room.
//
// The small display table beside the staircase is deliberately NOT
// solid. It is painted hard against the right wall, and the only
// floor the stairs open onto is the strip between its top edge and
// the foot of the staircase. Make it solid and the way out is
// sealed. Everything else on the right (the printers, the stairwell)
// blocks normally.
// ============================================================

const LIBRARY_PLATE = {
  sprite: "plate-library",
  cols: 32,
  rows: 18,
  unit: 48,

  // A touch bigger than the game default, so people read at the
  // right size against this room's furniture. Multiplies G.CHAR_H,
  // so a person is 83px on this floor.
  charScale: 1.15,

  solid: [
    // ---- the shell ----
    [0,     0,     32,    4.15],   // top wall: white brick, four arched windows, the staff door
    [14.33, 4.1,   16.92, 4.28],   // radiator under the second window, hangs proud of the wall
    [18.48, 4.1,   21.02, 4.28],   // radiator under the third window
    [12.69, 4.1,   13.33, 4.55],   // cast iron column, foot standing out of the wall
    [17.44, 4.1,   18.08, 4.55],   // cast iron column, the middle one
    [29.0,  4.1,   29.65, 6.25],   // cast iron column by the stairwell, this one runs 2 units into the room
    [0,     0,     0.4,   18],     // left wall. The doorway painted at 13.05 to 16.1 is the way in
    [31.6,  0,     32,    18],     // right wall
    [0,     17.66, 32,    18],     // bottom wall

    // ---- issue desk, top left ----
    [0.5,   4.1,   6.75,  6.55],   // the long curved counter: till, two monitors, book scanner
    [6.75,  4.1,   7.2,   6.3],    // the shoulder of the curve at the end of the counter
    [7.2,   4.1,   7.46,  5.95],   // the return, stepped in three so it follows the curve
    [7.78,  3.28,  9.2,   4.9],    // trolley of returned books, parked beside the desk

    // ---- study zone, left. Tables solid, chairs walkable ----
    [2.65,  7.77,  4.44,  9.08],   // round table 1
    [6.65,  7.77,  8.42,  9.08],   // round table 2
    [2.65,  11.0,  4.44,  12.28],  // round table 3, the one with the plant
    [6.65,  11.0,  8.42,  12.28],  // round table 4
    [0.5,   7.98,  1.62,  12.3],   // the three soft cubes. One block: the gaps are 7px, nobody fits

    // ---- six double sided stacks, white end panels included ----
    [10.77, 4.54,  11.85, 12.68],  // stack 1
    [13.63, 4.54,  14.71, 12.68],  // stack 2
    [16.52, 4.54,  17.6,  12.68],  // stack 3
    [19.41, 4.54,  20.49, 12.68],  // stack 4
    [22.27, 4.54,  23.35, 12.68],  // stack 5
    [25.13, 4.54,  26.21, 12.68],  // stack 6

    // ---- the bottom of the room ----
    [10.38, 14.7,  27.02, 16.46],  // the whole reading table run as one block, chairs walkable
    [29.96, 12.67, 31.42, 17.55],  // the two large format printers, stacked into one block

    // ---- stairwell, top right ----
    [29.6,  3.12,  31.6,  10.02],  // black cast iron staircase and the well it sits in
  ],

  // Just inside the doorway in the left wall. The opening is painted
  // from 13.05 to 16.1 down; this sits on its centre line, held off
  // the wall by more than half the width of the widest body in the
  // chapter (the brute floods from here too, so it has to fit).
  playerSpawn: [1.3, 14.6],

  // Five in the stack corridors, three on the open floor. Each one is
  // clear of the scenery by more than half the width of the widest
  // regular enemy (the chapter 3 brute is the printer), and all of
  // them are more than 5 units from the door the player comes in by.
  enemySpawns: [
    [9.6,   7.0],    // the aisle between the study tables and the first stack
    [12.74, 8.5],    // corridor 1
    [15.62, 6.4],    // corridor 2
    [18.5,  9.2],    // corridor 3
    [21.38, 6.4],    // corridor 4
    [24.24, 8.5],    // corridor 5
    [27.9,  7.6],    // open floor in front of the stairwell
    [28.5,  14.6],   // open floor by the printers
  ],

  // Way out, at the right wall in the strip the staircase's foot opens
  // onto, between the bottom of the ironwork and the display table.
  // Locked until the room is clear.
  exit: [31.15, 9.98, 31.6, 10.55],
};
