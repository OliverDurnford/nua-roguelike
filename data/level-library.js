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
// things: one entry per painted thing (footprint and outline); see below.
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

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "top edge", foot: [0, 0, 32, 0.4] },
    { name: "bottom edge", foot: [0, 17.6, 32, 18] },
    { name: "left edge", foot: [0, 0, 0.4, 18] },
    { name: "right edge", foot: [31.6, 0, 32, 18] },
    { name: "top wall", foot: [0.4, 0.4, 31.6, 4.11] },
    { name: "issue desk", foot: [0.57, 4.11, 6.4, 6.45], over: [[0.57, 3.47], [1.7, 3.47], [1.7, 4.1], [6.4, 4.1], [6.4, 6.5], [0.57, 6.5]] },
    { name: "issue desk arm 1", foot: [6.4, 4.11, 7.5, 5], over: [[6.4, 3.47], [7.5, 3.47], [7.5, 5], [6.4, 5]] },
    { name: "issue desk arm 2", foot: [6.4, 5, 7.5, 5.9], over: [[6.4, 5], [7.5, 5], [7.5, 5.9], [6.4, 5.9]] },
    { name: "issue desk corner", foot: [6.4, 5.9, 7.5, 6.1], over: [[6.4, 5.9], [7.5, 5.9], [7.5, 6.1], [7.4, 6.3], [7.1, 6.44], [6.7, 6.5], [6.4, 6.5]], base: 6.45 },
    { name: "issue desk corner curve", foot: [6.4, 6.1, 7.2, 6.45] },
    { name: "book trolley", foot: [7.8, 4.11, 9.15, 4.9], over: [[7.75, 3.25], [9.2, 3.25], [9.2, 4.92], [7.75, 4.92]] },
    { name: "radiator left", foot: [14.4, 4.11, 16.9, 4.32], over: [[14.5, 3.45], [16.8, 3.45], [16.8, 3.9], [16.95, 3.9], [16.95, 4.32], [14.4, 4.32], [14.4, 3.9], [14.5, 3.9]] },
    { name: "radiator right", foot: [18.5, 4.11, 20.9, 4.32], over: [[18.6, 3.45], [20.8, 3.45], [20.8, 3.9], [20.95, 3.9], [20.95, 4.32], [18.5, 4.32], [18.5, 3.9], [18.6, 3.9]] },
    { name: "pillar left", foot: [12.74, 4.15, 13.31, 4.52], over: [[12.78, 0.4], [13.26, 0.4], [13.26, 4], [13.33, 4.15], [13.33, 4.4], [13.21, 4.55], [12.84, 4.55], [12.72, 4.4], [12.72, 4.15], [12.78, 4]] },
    { name: "pillar middle", foot: [17.51, 4.15, 18.1, 4.52], over: [[17.56, 0.4], [18.05, 0.4], [18.05, 4], [18.12, 4.15], [18.12, 4.4], [18, 4.55], [17.61, 4.55], [17.49, 4.4], [17.49, 4.15], [17.56, 4]] },
    { name: "pillar right", foot: [29.02, 5.6, 29.58, 6.22], over: [[29.08, 0.4], [29.54, 0.4], [29.54, 5.5], [29.6, 5.62], [29.6, 6.05], [29.52, 6.2], [29.4, 6.26], [29.2, 6.26], [29.08, 6.2], [29, 6.05], [29, 5.62], [29.08, 5.5]] },
    { name: "stack 1 part 1", over: [[10.64, 4.56], [11.99, 4.56], [11.99, 5.56], [10.64, 5.56]] },
    { name: "stack 1 part 2", foot: [10.75, 5.56, 11.88, 6.56], over: [[10.64, 5.56], [11.99, 5.56], [11.99, 6.56], [10.64, 6.56]] },
    { name: "stack 1 part 3", foot: [10.75, 6.56, 11.88, 7.56], over: [[10.64, 6.56], [11.99, 6.56], [11.99, 7.56], [10.64, 7.56]] },
    { name: "stack 1 part 4", foot: [10.75, 7.56, 11.88, 8.56], over: [[10.64, 7.56], [11.99, 7.56], [11.99, 8.56], [10.64, 8.56]] },
    { name: "stack 1 part 5", foot: [10.75, 8.56, 11.88, 9.56], over: [[10.64, 8.56], [11.99, 8.56], [11.99, 9.56], [10.64, 9.56]] },
    { name: "stack 1 part 6", foot: [10.75, 9.56, 11.88, 10.56], over: [[10.64, 9.56], [11.99, 9.56], [11.99, 10.56], [10.64, 10.56]] },
    { name: "stack 1 part 7", foot: [10.75, 10.56, 11.88, 11.56], over: [[10.64, 10.56], [11.99, 10.56], [11.99, 11.56], [10.64, 11.56]] },
    { name: "stack 1 part 8", foot: [10.75, 11.56, 11.88, 12.63], over: [[10.64, 11.56], [11.99, 11.56], [11.99, 12.63], [10.64, 12.63]] },
    { name: "stack 2 part 1", over: [[13.52, 4.56], [14.87, 4.56], [14.87, 5.56], [13.52, 5.56]] },
    { name: "stack 2 part 2", foot: [13.62, 5.56, 14.76, 6.56], over: [[13.52, 5.56], [14.87, 5.56], [14.87, 6.56], [13.52, 6.56]] },
    { name: "stack 2 part 3", foot: [13.62, 6.56, 14.76, 7.56], over: [[13.52, 6.56], [14.87, 6.56], [14.87, 7.56], [13.52, 7.56]] },
    { name: "stack 2 part 4", foot: [13.62, 7.56, 14.76, 8.56], over: [[13.52, 7.56], [14.87, 7.56], [14.87, 8.56], [13.52, 8.56]] },
    { name: "stack 2 part 5", foot: [13.62, 8.56, 14.76, 9.56], over: [[13.52, 8.56], [14.87, 8.56], [14.87, 9.56], [13.52, 9.56]] },
    { name: "stack 2 part 6", foot: [13.62, 9.56, 14.76, 10.56], over: [[13.52, 9.56], [14.87, 9.56], [14.87, 10.56], [13.52, 10.56]] },
    { name: "stack 2 part 7", foot: [13.62, 10.56, 14.76, 11.56], over: [[13.52, 10.56], [14.87, 10.56], [14.87, 11.56], [13.52, 11.56]] },
    { name: "stack 2 part 8", foot: [13.62, 11.56, 14.76, 12.63], over: [[13.52, 11.56], [14.87, 11.56], [14.87, 12.63], [13.52, 12.63]] },
    { name: "stack 3 part 1", over: [[16.39, 4.56], [17.74, 4.56], [17.74, 5.56], [16.39, 5.56]] },
    { name: "stack 3 part 2", foot: [16.5, 5.56, 17.63, 6.56], over: [[16.39, 5.56], [17.74, 5.56], [17.74, 6.56], [16.39, 6.56]] },
    { name: "stack 3 part 3", foot: [16.5, 6.56, 17.63, 7.56], over: [[16.39, 6.56], [17.74, 6.56], [17.74, 7.56], [16.39, 7.56]] },
    { name: "stack 3 part 4", foot: [16.5, 7.56, 17.63, 8.56], over: [[16.39, 7.56], [17.74, 7.56], [17.74, 8.56], [16.39, 8.56]] },
    { name: "stack 3 part 5", foot: [16.5, 8.56, 17.63, 9.56], over: [[16.39, 8.56], [17.74, 8.56], [17.74, 9.56], [16.39, 9.56]] },
    { name: "stack 3 part 6", foot: [16.5, 9.56, 17.63, 10.56], over: [[16.39, 9.56], [17.74, 9.56], [17.74, 10.56], [16.39, 10.56]] },
    { name: "stack 3 part 7", foot: [16.5, 10.56, 17.63, 11.56], over: [[16.39, 10.56], [17.74, 10.56], [17.74, 11.56], [16.39, 11.56]] },
    { name: "stack 3 part 8", foot: [16.5, 11.56, 17.63, 12.63], over: [[16.39, 11.56], [17.74, 11.56], [17.74, 12.63], [16.39, 12.63]] },
    { name: "stack 4 part 1", over: [[19.26, 4.56], [20.61, 4.56], [20.61, 5.56], [19.26, 5.56]] },
    { name: "stack 4 part 2", foot: [19.38, 5.56, 20.5, 6.56], over: [[19.26, 5.56], [20.61, 5.56], [20.61, 6.56], [19.26, 6.56]] },
    { name: "stack 4 part 3", foot: [19.38, 6.56, 20.5, 7.56], over: [[19.26, 6.56], [20.61, 6.56], [20.61, 7.56], [19.26, 7.56]] },
    { name: "stack 4 part 4", foot: [19.38, 7.56, 20.5, 8.56], over: [[19.26, 7.56], [20.61, 7.56], [20.61, 8.56], [19.26, 8.56]] },
    { name: "stack 4 part 5", foot: [19.38, 8.56, 20.5, 9.56], over: [[19.26, 8.56], [20.61, 8.56], [20.61, 9.56], [19.26, 9.56]] },
    { name: "stack 4 part 6", foot: [19.38, 9.56, 20.5, 10.56], over: [[19.26, 9.56], [20.61, 9.56], [20.61, 10.56], [19.26, 10.56]] },
    { name: "stack 4 part 7", foot: [19.38, 10.56, 20.5, 11.56], over: [[19.26, 10.56], [20.61, 10.56], [20.61, 11.56], [19.26, 11.56]] },
    { name: "stack 4 part 8", foot: [19.38, 11.56, 20.5, 12.63], over: [[19.26, 11.56], [20.61, 11.56], [20.61, 12.63], [19.26, 12.63]] },
    { name: "stack 5 part 1", over: [[22.14, 4.56], [23.49, 4.56], [23.49, 5.56], [22.14, 5.56]] },
    { name: "stack 5 part 2", foot: [22.25, 5.56, 23.38, 6.56], over: [[22.14, 5.56], [23.49, 5.56], [23.49, 6.56], [22.14, 6.56]] },
    { name: "stack 5 part 3", foot: [22.25, 6.56, 23.38, 7.56], over: [[22.14, 6.56], [23.49, 6.56], [23.49, 7.56], [22.14, 7.56]] },
    { name: "stack 5 part 4", foot: [22.25, 7.56, 23.38, 8.56], over: [[22.14, 7.56], [23.49, 7.56], [23.49, 8.56], [22.14, 8.56]] },
    { name: "stack 5 part 5", foot: [22.25, 8.56, 23.38, 9.56], over: [[22.14, 8.56], [23.49, 8.56], [23.49, 9.56], [22.14, 9.56]] },
    { name: "stack 5 part 6", foot: [22.25, 9.56, 23.38, 10.56], over: [[22.14, 9.56], [23.49, 9.56], [23.49, 10.56], [22.14, 10.56]] },
    { name: "stack 5 part 7", foot: [22.25, 10.56, 23.38, 11.56], over: [[22.14, 10.56], [23.49, 10.56], [23.49, 11.56], [22.14, 11.56]] },
    { name: "stack 5 part 8", foot: [22.25, 11.56, 23.38, 12.63], over: [[22.14, 11.56], [23.49, 11.56], [23.49, 12.63], [22.14, 12.63]] },
    { name: "stack 6 part 1", over: [[25.01, 4.56], [26.36, 4.56], [26.36, 5.56], [25.01, 5.56]] },
    { name: "stack 6 part 2", foot: [25.12, 5.56, 26.13, 6.56], over: [[25.01, 5.56], [26.36, 5.56], [26.36, 6.56], [25.01, 6.56]] },
    { name: "stack 6 part 3", foot: [25.12, 6.56, 26.13, 7.56], over: [[25.01, 6.56], [26.36, 6.56], [26.36, 7.56], [25.01, 7.56]] },
    { name: "stack 6 part 4", foot: [25.12, 7.56, 26.13, 8.56], over: [[25.01, 7.56], [26.36, 7.56], [26.36, 8.56], [25.01, 8.56]] },
    { name: "stack 6 part 5", foot: [25.12, 8.56, 26.13, 9.56], over: [[25.01, 8.56], [26.36, 8.56], [26.36, 9.56], [25.01, 9.56]] },
    { name: "stack 6 part 6", foot: [25.12, 9.56, 26.13, 10.56], over: [[25.01, 9.56], [26.36, 9.56], [26.36, 10.56], [25.01, 10.56]] },
    { name: "stack 6 part 7", foot: [25.12, 10.56, 26.13, 11.56], over: [[25.01, 10.56], [26.36, 10.56], [26.36, 11.56], [25.01, 11.56]] },
    { name: "stack 6 part 8", foot: [25.12, 11.56, 26.13, 12.63], over: [[25.01, 11.56], [26.36, 11.56], [26.36, 12.63], [25.01, 12.63]] },
    { name: "study table 1", foot: [3.1, 8.8, 4, 9.6], over: [[2.63, 8.4], [2.75, 8.07], [3.08, 7.83], [3.54, 7.74], [4, 7.83], [4.33, 8.07], [4.45, 8.4], [4.45, 8.4], [4.33, 8.73], [4, 8.97], [3.74, 9.04], [3.74, 9.18], [3.93, 9.38], [3.82, 9.54], [3.54, 9.61], [3.26, 9.54], [3.15, 9.38], [3.34, 9.18], [3.34, 9.04], [3.08, 8.97], [2.75, 8.73]] },
    { name: "study table 2", foot: [7.1, 8.85, 8, 9.6], over: [[6.64, 8.46], [6.76, 8.13], [7.09, 7.89], [7.55, 7.8], [8.01, 7.89], [8.34, 8.13], [8.46, 8.46], [8.46, 8.46], [8.34, 8.79], [8.01, 9.03], [7.75, 9.1], [7.75, 9.18], [7.94, 9.38], [7.83, 9.54], [7.55, 9.61], [7.27, 9.54], [7.16, 9.38], [7.35, 9.18], [7.35, 9.1], [7.09, 9.03], [6.76, 8.79]] },
    { name: "study table 3", foot: [3.1, 12, 4, 12.85], over: [[2.63, 11.63], [2.75, 11.3], [3.08, 11.06], [3.22, 10.98], [3.26, 10.85], [3.44, 10.8], [3.66, 10.8], [3.76, 10.89], [3.8, 10.98], [4, 11.06], [4.33, 11.3], [4.45, 11.63], [4.45, 11.63], [4.33, 11.96], [4, 12.2], [3.74, 12.27], [3.74, 12.42], [3.93, 12.62], [3.82, 12.78], [3.54, 12.85], [3.26, 12.78], [3.15, 12.62], [3.34, 12.42], [3.34, 12.27], [3.08, 12.2], [2.75, 11.96]] },
    { name: "study table 4", foot: [7.1, 12, 8, 12.85], over: [[6.66, 11.64], [6.78, 11.31], [7.12, 11.07], [7.57, 10.98], [8.03, 11.07], [8.36, 11.31], [8.48, 11.64], [8.48, 11.64], [8.36, 11.97], [8.03, 12.21], [7.77, 12.28], [7.77, 12.42], [7.96, 12.62], [7.85, 12.78], [7.57, 12.85], [7.29, 12.78], [7.18, 12.62], [7.38, 12.42], [7.37, 12.28], [7.12, 12.21], [6.78, 11.97]] },
    { name: "reading table", foot: [10.34, 15.75, 27.02, 17.1], over: [[10.32, 14.62], [27.04, 14.62], [27.04, 17.15], [10.32, 17.15]] },
    { name: "display table", foot: [27.7, 11, 31.5, 11.95], over: [[27.68, 10.42], [31.5, 10.42], [31.5, 11.55], [31.46, 11.55], [31.46, 12], [31.3, 12], [31.3, 11.55], [27.85, 11.55], [27.85, 12], [27.72, 12], [27.72, 11.55], [27.68, 11.55]] },
    { name: "printer 1 part 1", foot: [30.2, 12.65, 31.4, 13.28], over: [[30.25, 12.65], [31.42, 12.65], [31.42, 13.28], [30.25, 13.28]] },
    { name: "printer 1 part 2", foot: [30.2, 13.28, 31.4, 14.28], over: [[29.97, 13.28], [31.42, 13.28], [31.42, 14.28], [29.97, 14.28]] },
    { name: "printer 1 part 3", foot: [30.2, 14.28, 31.4, 15.12], over: [[30.25, 14.28], [31.42, 14.28], [31.42, 15.12], [30.25, 15.12]] },
    { name: "printer 2 part 1", foot: [30.2, 15.1, 31.4, 15.7], over: [[30.25, 15.1], [31.42, 15.1], [31.42, 15.7], [30.25, 15.7]] },
    { name: "printer 2 part 2", foot: [30.2, 15.7, 31.4, 16.65], over: [[29.97, 15.7], [31.42, 15.7], [31.42, 16.65], [29.97, 16.65]] },
    { name: "printer 2 part 3", foot: [30.2, 16.65, 31.4, 17.55], over: [[30.25, 16.65], [31.42, 16.65], [31.42, 17.55], [30.25, 17.55]] },
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
