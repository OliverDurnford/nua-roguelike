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
