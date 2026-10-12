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
// things: one entry per painted thing (footprint and outline); see below.
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

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "back wall and organ", foot: [4.15, 0, 19.85, 6.75] },
    { name: "left wall and pillars", foot: [0, 0, 2.5, 32] },
    { name: "left column by the stage", foot: [2.5, 0, 4.15, 9.15] },
    { name: "right wall and pillars", foot: [21.45, 0, 24, 32] },
    { name: "right column by the stage", foot: [19.85, 0, 21.45, 9.15] },
    { name: "west wall left", foot: [0, 30.5, 9.72, 32] },
    { name: "west wall right", foot: [14.3, 30.5, 24, 32] },
    { name: "left door jamb", foot: [9.72, 29.78, 10.35, 32] },
    { name: "right door jamb", foot: [13.65, 29.78, 14.3, 32] },
    { name: "left pier 1", foot: [2.5, 9.15, 3.5, 10.15], over: [[2.45, 9.1], [3.5, 9.1], [3.5, 10.15], [2.45, 10.15]] },
    { name: "left pier 2", foot: [2.5, 10.15, 3.5, 11.15], over: [[2.45, 10.15], [3.5, 10.15], [3.5, 11.15], [2.45, 11.15]] },
    { name: "left pier 3", foot: [2.5, 11.15, 3.5, 12.15], over: [[2.45, 11.15], [3.5, 11.15], [3.5, 12.15], [2.45, 12.15]] },
    { name: "left pier 4", foot: [2.5, 12.15, 3.5, 13.15], over: [[2.45, 12.15], [3.5, 12.15], [3.5, 13.15], [2.45, 13.15]] },
    { name: "left pier 5", foot: [2.5, 13.15, 3.5, 14.15], over: [[2.45, 13.15], [3.5, 13.15], [3.5, 14.15], [2.45, 14.15]] },
    { name: "left pier 6", foot: [2.5, 14.15, 3.5, 15.15], over: [[2.45, 14.15], [3.5, 14.15], [3.5, 15.15], [2.45, 15.15]] },
    { name: "left pier 7", foot: [2.5, 15.15, 3.5, 16.15], over: [[2.45, 15.15], [3.5, 15.15], [3.5, 16.15], [2.45, 16.15]] },
    { name: "left pier 8", foot: [2.5, 16.15, 3.5, 17.15], over: [[2.45, 16.15], [3.5, 16.15], [3.5, 16.6], [3.7, 16.8], [3.7, 17.15], [2.45, 17.15]] },
    { name: "left pier 9", foot: [2.5, 17.15, 3.5, 18.15], over: [[2.45, 17.15], [3.5, 17.15], [3.7, 17.15], [3.7, 18.15], [2.45, 18.15]] },
    { name: "left pier head", foot: [3.5, 9.15, 4.1, 10.4], over: [[3.45, 9.1], [4.1, 9.1], [4.1, 10.4], [3.45, 10.4]] },
    { name: "left pier capital", foot: [3.5, 10.4, 4.4, 11.8], over: [[3.45, 10.4], [4.05, 10.4], [4.2, 10.55], [4.4, 10.75], [4.4, 11.8], [3.45, 11.8]] },
    { name: "right pier 1", foot: [20.5, 9.15, 21.45, 10.15], over: [[20.5, 9.1], [21.45, 9.1], [21.45, 10.15], [20.5, 10.15]] },
    { name: "right pier 2", foot: [20.5, 10.15, 21.45, 11.15], over: [[20.5, 10.15], [21.45, 10.15], [21.45, 11.15], [20.5, 11.15]] },
    { name: "right pier 3", foot: [20.5, 11.15, 21.45, 12.15], over: [[20.5, 11.15], [21.45, 11.15], [21.45, 12.15], [20.5, 12.15]] },
    { name: "right pier 4", foot: [20.5, 12.15, 21.45, 13.15], over: [[20.5, 12.15], [21.45, 12.15], [21.45, 13.15], [20.5, 13.15]] },
    { name: "right pier 5", foot: [20.5, 13.15, 21.45, 14.15], over: [[20.5, 13.15], [21.45, 13.15], [21.45, 14.15], [20.5, 14.15]] },
    { name: "right pier 6", foot: [20.5, 14.15, 21.45, 15.15], over: [[20.5, 14.15], [21.45, 14.15], [21.45, 15.15], [20.5, 15.15]] },
    { name: "right pier 7", foot: [20.5, 15.15, 21.45, 16.15], over: [[20.5, 15.15], [21.45, 15.15], [21.45, 16.15], [20.5, 16.15]] },
    { name: "right pier 8", foot: [20.5, 16.15, 21.45, 17.15], over: [[20.5, 16.15], [21.45, 16.15], [21.45, 17.15], [20.3, 17.15], [20.3, 16.8], [20.5, 16.6]] },
    { name: "right pier 9", foot: [20.5, 17.15, 21.45, 18.15], over: [[20.3, 17.15], [21.45, 17.15], [21.45, 18.15], [20.3, 18.15]] },
    { name: "right pier head", foot: [19.9, 9.15, 20.5, 10.4], over: [[19.9, 9.1], [20.55, 9.1], [20.55, 10.4], [19.9, 10.4]] },
    { name: "right pier capital", foot: [19.55, 10.4, 20.5, 11.8], over: [[20.55, 10.4], [19.95, 10.4], [19.8, 10.55], [19.55, 10.75], [19.55, 11.8], [20.55, 11.8]] },
    { name: "left pews front 1", foot: [5.25, 11.5, 9.75, 13], over: [[5.25, 11.47], [9.75, 11.47], [9.75, 13], [5.25, 13]] },
    { name: "left pews front 2", foot: [5.25, 13, 9.75, 14.05], over: [[5.25, 13], [9.75, 13], [9.75, 14.05], [5.25, 14.05]] },
    { name: "left pews front 3", foot: [5.25, 14.05, 9.75, 15.1], over: [[5.25, 14.05], [9.75, 14.05], [9.75, 15.1], [5.25, 15.1]] },
    { name: "left pews front 4", foot: [5.25, 15.1, 9.75, 16.15], over: [[5.25, 15.1], [9.75, 15.1], [9.75, 16.15], [5.25, 16.15]] },
    { name: "left pews front 5", foot: [5.25, 16.15, 9.75, 17.2], over: [[5.25, 16.15], [9.75, 16.15], [9.75, 17.2], [5.25, 17.2]] },
    { name: "left pews middle 1", foot: [5.25, 18.95, 9.75, 19.95], over: [[5.25, 18.5], [9.75, 18.5], [9.75, 19.95], [5.25, 19.95]] },
    { name: "left pews middle 2", foot: [5.25, 19.95, 9.75, 20.95], over: [[5.25, 19.95], [9.75, 19.95], [9.75, 20.95], [5.25, 20.95]] },
    { name: "left pews middle 3", foot: [5.25, 20.95, 9.75, 21.95], over: [[5.25, 20.95], [9.75, 20.95], [9.75, 21.95], [5.25, 21.95]] },
    { name: "left pews middle 4", foot: [5.25, 21.95, 9.75, 23], over: [[5.25, 21.95], [9.75, 21.95], [9.75, 23], [5.25, 23]] },
    { name: "left pews back 1", foot: [5.25, 24.7, 9.75, 25.7], over: [[5.25, 24.25], [9.75, 24.25], [9.75, 25.7], [5.25, 25.7]] },
    { name: "left pews back 2", foot: [5.25, 25.7, 9.75, 26.7], over: [[5.25, 25.7], [9.75, 25.7], [9.75, 26.7], [5.25, 26.7]] },
    { name: "left pews back 3", foot: [5.25, 26.7, 9.75, 27.75], over: [[5.25, 26.7], [9.75, 26.7], [9.75, 27.75], [5.25, 27.75]] },
    { name: "left pews back 4", foot: [5.25, 27.75, 9.75, 28.8], over: [[5.25, 27.75], [9.75, 27.75], [9.75, 28.8], [5.25, 28.8]] },
    { name: "right pews front 1", foot: [14.25, 11.5, 18.75, 13], over: [[14.25, 11.47], [18.75, 11.47], [18.75, 13], [14.25, 13]] },
    { name: "right pews front 2", foot: [14.25, 13, 18.75, 14.05], over: [[14.25, 13], [18.75, 13], [18.75, 14.05], [14.25, 14.05]] },
    { name: "right pews front 3", foot: [14.25, 14.05, 18.75, 15.1], over: [[14.25, 14.05], [18.75, 14.05], [18.75, 15.1], [14.25, 15.1]] },
    { name: "right pews front 4", foot: [14.25, 15.1, 18.75, 16.15], over: [[14.25, 15.1], [18.75, 15.1], [18.75, 16.15], [14.25, 16.15]] },
    { name: "right pews front 5", foot: [14.25, 16.15, 18.75, 17.2], over: [[14.25, 16.15], [18.75, 16.15], [18.75, 17.2], [14.25, 17.2]] },
    { name: "right pews middle 1", foot: [14.25, 18.95, 18.75, 19.95], over: [[14.25, 18.5], [18.75, 18.5], [18.75, 19.95], [14.25, 19.95]] },
    { name: "right pews middle 2", foot: [14.25, 19.95, 18.75, 20.95], over: [[14.25, 19.95], [18.75, 19.95], [18.75, 20.95], [14.25, 20.95]] },
    { name: "right pews middle 3", foot: [14.25, 20.95, 18.75, 21.95], over: [[14.25, 20.95], [18.75, 20.95], [18.75, 21.95], [14.25, 21.95]] },
    { name: "right pews middle 4", foot: [14.25, 21.95, 18.75, 23], over: [[14.25, 21.95], [18.75, 21.95], [18.75, 23], [14.25, 23]] },
    { name: "right pews back 1", foot: [14.25, 24.7, 18.75, 25.7], over: [[14.25, 24.25], [18.75, 24.25], [18.75, 25.7], [14.25, 25.7]] },
    { name: "right pews back 2", foot: [14.25, 25.7, 18.75, 26.7], over: [[14.25, 25.7], [18.75, 25.7], [18.75, 26.7], [14.25, 26.7]] },
    { name: "right pews back 3", foot: [14.25, 26.7, 18.75, 27.75], over: [[14.25, 26.7], [18.75, 26.7], [18.75, 27.75], [14.25, 27.75]] },
    { name: "right pews back 4", foot: [14.25, 27.75, 18.75, 28.8], over: [[14.25, 27.75], [18.75, 27.75], [18.75, 28.8], [14.25, 28.8]] },
    { name: "left stage plinth", foot: [4.15, 6.75, 5.4, 7.5], over: [[4.1, 6.8], [4.55, 6.8], [4.8, 6.7], [5, 6.45], [5.4, 6.5], [5.45, 7.2], [5.3, 7.3], [4.95, 7.3], [4.95, 7.55], [4.1, 7.55]] },
    { name: "right stage plinth", foot: [18.6, 6.75, 19.85, 7.5], over: [[18.55, 6.5], [18.9, 6.6], [19.2, 6.65], [19.85, 6.7], [19.85, 7.55], [19.1, 7.55], [19, 7.35], [18.65, 7.35], [18.55, 7]] },
    { name: "left flower stand", foot: [5.85, 8.4, 6.7, 8.75], over: [[6.08, 5.81], [6.12, 6.1], [6.29, 5.9], [6.65, 6.02], [7.12, 6.67], [6.94, 7.06], [7.06, 7.33], [6.83, 7.31], [6.67, 7.62], [6.38, 7.56], [6.4, 8.23], [6.71, 8.75], [6.4, 8.71], [6.33, 8.92], [6.17, 8.67], [5.85, 8.77], [6.17, 8.21], [6.17, 7.54], [5.92, 7.62], [5.5, 7.33], [5.65, 7.08], [5.42, 6.77], [5.73, 6.4], [5.4, 6.44], [5.4, 6.27], [5.85, 6.21]] },
    { name: "left banner", foot: [7.55, 7.15, 8.05, 7.5], over: [[7.46, 4.79], [8.19, 4.79], [8.29, 5.02], [8.29, 5.58], [8.25, 5.6], [8.29, 6.5], [8.19, 6.62], [7.98, 6.42], [7.94, 6.46], [7.94, 7.1], [8.1, 7.21], [8.08, 7.42], [7.96, 7.44], [8.04, 7.5], [8, 7.56], [7.67, 7.56], [7.52, 7.4], [7.52, 7.29], [7.73, 7.1], [7.73, 6.54], [7.65, 6.48], [7.48, 6.6], [7.38, 6.46], [7.38, 6.06], [7.44, 6.02], [7.4, 5.5]] },
    { name: "white table", foot: [8.7, 7.35, 10.1, 7.95], over: [[8.5, 6.55], [8.9, 6.45], [8.9, 6.27], [9.42, 6.1], [9.5, 6.27], [10.04, 6.21], [10.3, 6.3], [10.5, 6.45], [10.58, 6.6], [10.62, 6.88], [10.54, 7.81], [10.4, 7.92], [8.58, 7.88], [8.46, 7.54], [8.46, 6.92]] },
    { name: "lectern", foot: [11.15, 8, 12.2, 8.7], over: [[12.23, 6.81], [12.33, 6.85], [12.62, 7.19], [12.62, 7.52], [12.46, 7.81], [12.44, 8.21], [12.44, 8.31], [12.6, 8.46], [12.6, 8.94], [12.56, 8.98], [11.44, 8.98], [11.38, 8.92], [11.4, 8.46], [11.5, 8.31], [11.56, 8.31], [11.56, 8.25], [11.54, 7.81], [11.5, 7.79], [11.5, 7.69], [11.38, 7.54], [11.38, 7.19], [11.46, 7.1], [12.21, 7.1], [12.1, 7], [12.1, 6.92]] },
    { name: "right banner", foot: [15.75, 7.1, 16.25, 7.5], over: [[15.55, 4.8], [16.8, 4.8], [16.8, 5], [16.72, 5.05], [16.72, 6.75], [16.45, 6.62], [16.28, 6.5], [16.25, 7.05], [16.45, 7.2], [16.5, 7.45], [16.3, 7.58], [15.9, 7.5], [15.82, 7.3], [16, 7.1], [16.05, 6.5], [15.85, 6.65], [15.62, 6.75], [15.62, 5.05], [15.55, 5]] },
    { name: "right flower stand", foot: [17.25, 8.4, 18.1, 8.75], over: [[18.06, 5.71], [18.19, 6.33], [18.4, 6.45], [18.44, 6.81], [18.52, 7.35], [17.85, 7.58], [17.85, 8.23], [18.17, 8.77], [17.65, 8.92], [17.62, 8.65], [17.29, 8.75], [17.62, 8.23], [17.62, 7.52], [17.38, 7.65], [17.33, 7.44], [16.96, 7.35], [17.1, 6.83], [16.9, 6.6], [17.17, 6.42], [17.02, 6.17], [17.31, 6.19], [17.6, 5.75], [17.85, 6.23]] },
    { name: "left door leaf 1", foot: [10.4, 29.2, 10.95, 30], over: [[10.95, 28.78], [10.8, 28.78], [10.35, 29.72], [10.35, 30], [10.96, 30]] },
    { name: "left door leaf 2", foot: [10.4, 30, 10.95, 31], over: [[10.35, 30], [10.35, 31], [10.96, 31], [10.96, 30]] },
    { name: "left door leaf 3", foot: [10.4, 31, 10.8, 32], over: [[10.35, 31], [10.35, 31.95], [10.55, 32], [10.7, 31.78], [10.96, 31.22], [10.96, 31]] },
    { name: "right door leaf 1", foot: [13.05, 29.2, 13.6, 30], over: [[13.65, 30], [13.65, 29.72], [13.2, 28.78], [13.05, 28.78], [13.04, 30]] },
    { name: "right door leaf 2", foot: [13.05, 30, 13.6, 31], over: [[13.65, 31], [13.65, 30], [13.04, 30], [13.04, 31]] },
    { name: "right door leaf 3", foot: [13.2, 31, 13.6, 32], over: [[13.04, 31.22], [13.3, 31.78], [13.45, 32], [13.65, 31.95], [13.65, 31], [13.04, 31]] },
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
