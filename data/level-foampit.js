// ============================================================
// THE FOAM PIT: Chapter 1, Area 4.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 28 units wide by 16 units tall, and one unit is 48 world px,
// so the finished room is 1344 x 768 px (about 1.4 screens wide
// and 1.4 screens tall). The smallest room in the chapter, on
// purpose: it is the breather between Mercy's two rooms.
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Foam pit/Phone pit level design.jpeg" (yes,
// the filename says Phone, it is the foam pit), imagine it cut
// into 28 columns and 16 rows, and read off the column and row.
//
// One warning before you trust the prompt doc: the tile map table
// in "Foam pit - image gen prompt.md" was written for a 21:9 plan
// that never got generated. The finished plate came back 16:9 and
// deeper, and its drainage gully runs top to bottom, not along the
// room. Everything here is measured from the actual image.
//
// things: one entry per painted thing (footprint and outline); see below.
//
// TUNING NOTE: only the deep banked drifts are solid. They read as
// chest deep, so blocking them is honest, and it stops the player
// hugging the walls to skip the room. The torn-off clumps, melted
// rings and wet streaks scattered across the middle are all floor
// detail: you walk straight over them, so the room stays foamy to
// look at but clean to move through.
// ============================================================

const FOAMPIT_PLATE = {
  sprite: "plate-foampit",
  cols: 28,
  rows: 16,
  unit: 48,          // world pixels per grid unit -> room is 1344 x 768

  // Everyone stands 15% taller in here than the game's default. The
  // waterproof cladding is painted to head height and its band measures
  // about 1.6 units, which is one person exactly at this scale, and the
  // foam cannon sits right against an 83px figure. Chunkier than the
  // placeholder levels, but under Gonzo's 1.3: this art is painted a
  // touch looser than Gonzo's furniture.
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
    { name: "back wall + main drift, full width", foot: [0, 0, 28, 5.6] },
    { name: "crest sagging lower, left of centre", foot: [3.5, 5.6, 7.9, 6.2], over: [[3.21, 5], [8.21, 5], [8.21, 5.65], [7.98, 5.69], [7.85, 5.4], [7.65, 5.69], [7.71, 5.73], [7.65, 5.83], [7.42, 5.73], [7.33, 5.6], [7.06, 5.83], [6.75, 5.83], [6.65, 5.71], [6.46, 5.75], [6.23, 5.52], [5.73, 5.69], [5.56, 5.48], [5.31, 5.73], [4.98, 5.71], [4.85, 5.58], [4.75, 5.79], [4.52, 5.94], [4.02, 5.92], [3.85, 5.79], [3.75, 6.19], [3.38, 6.23], [3.21, 6.15]] },
    { name: "the wide shelf either side of the cannon", foot: [7.9, 5.6, 16.7, 6.8], over: [[7.6, 5], [17, 5], [16.98, 6.38], [16.85, 6.52], [16.4, 6.54], [16.67, 6.81], [16.6, 7.04], [9.6, 7.04], [9.44, 6.94], [9.5, 6.6], [9.04, 6.52], [9.08, 6.83], [8.88, 6.73], [8.5, 6.79], [8.56, 6.56], [8.77, 6.42], [8.58, 6.1], [8.1, 5.94], [7.9, 5.4], [7.6, 5.83]] },
    { name: "deep central lobe, upper step", foot: [10.1, 6.8, 16, 7.4], over: [[9.79, 6.21], [16.29, 6.21], [16.29, 7.1], [16.12, 7.31], [15.81, 7.31], [15.69, 7.21], [15.54, 7.31], [15.29, 7.27], [15.19, 7.52], [15.06, 7.6], [14.85, 7.58], [14.85, 7.65], [11.25, 7.6], [11.06, 7.4], [11.06, 7.27], [10.92, 7.27], [10.85, 7.19], [10.65, 7.17], [10.56, 7.25], [10.31, 7.27], [10, 7.06], [9.79, 7.1]] },
    { name: "deep central lobe, lower step", foot: [11.6, 7.4, 15.7, 7.95], over: [[11.29, 6.79], [16, 6.79], [16, 7.31], [15.69, 7.21], [15.54, 7.31], [15.29, 7.27], [15.19, 7.52], [14.85, 7.58], [14.71, 7.83], [14.33, 7.77], [14.15, 7.6], [13.96, 7.88], [13.77, 7.85], [13.71, 8.21], [12.94, 8.21], [12.88, 8], [12.96, 7.9], [12.79, 7.81], [11.94, 7.98], [11.67, 7.56], [11.29, 7.6]] },
    { name: "its toe, spilling onto the grille head", foot: [12.9, 7.95, 13.8, 8.25], over: [[12.6, 7.35], [15.25, 7.35], [15.25, 7.46], [15.06, 7.6], [14.85, 7.58], [14.71, 7.83], [14.33, 7.77], [14.15, 7.6], [13.96, 7.88], [13.77, 7.85], [13.77, 8.08], [13.67, 8.25], [13.4, 8.27], [13.33, 8.15], [13.19, 8.25], [12.98, 8.25], [12.88, 8.17], [12.88, 8], [12.96, 7.9], [12.79, 7.81], [12.6, 7.9]] },
    { name: "shoulder right of the cannon", foot: [16.7, 5.6, 19, 6.7], over: [[16.4, 5], [19.29, 5], [19.29, 6.15], [19.19, 6.19], [19.08, 6.4], [18.9, 6.4], [18.83, 6.46], [18.73, 6.35], [18.73, 6.48], [18.48, 6.73], [18.25, 6.73], [18.06, 6.54], [17.83, 6.48], [17.69, 6.33], [17.52, 6.4], [17.38, 6.38], [17.35, 6.33], [17.08, 6.29], [17, 6.23], [17, 6.17], [16.98, 6.38], [16.85, 6.52], [16.42, 6.56]] },
    { name: "foam bank, right of the shoulder", foot: [19, 5.6, 23.8, 6.1] },
    { name: "bank piled into the top right corner", foot: [23.8, 5.6, 26.7, 6.6], over: [[23.5, 5], [26.9, 5], [26.79, 5.31], [26.65, 5.35], [26.88, 5.58], [26.79, 6.12], [26.9, 6.21], [26.9, 6.85], [26.27, 6.85], [26.21, 6.58], [25.83, 6.67], [25.69, 6.52], [25.73, 6.29], [25.6, 6.15], [25.33, 6.33], [25.06, 6.33], [24.98, 6.19], [24.48, 6.27], [24.33, 5.81], [24.15, 5.96], [23.69, 5.96], [23.5, 6.1]] },
    { name: "same bank, sagging down the corner LED", foot: [25.2, 6.6, 26.7, 7.1], over: [[24.9, 6], [26.81, 6], [26.79, 6.12], [26.9, 6.21], [26.83, 6.54], [26.88, 6.58], [26.94, 7.35], [26.77, 7.35], [26.73, 6.81], [26.5, 6.81], [26.46, 6.92], [26.38, 6.92], [26.21, 6.77], [26.27, 6.6], [26.17, 6.58], [26.1, 6.67], [25.83, 6.67], [25.73, 6.58], [25.69, 6.52], [25.69, 6.35], [25.73, 6.29], [25.6, 6.15], [25.33, 6.33], [25.06, 6.33], [24.98, 6.25], [24.98, 6.19], [24.9, 6.23]] },
    { name: "left upper stub: angled face + LED strip", foot: [0, 5.6, 1.3, 7.9] },
    { name: "foam clinging to that stub", foot: [1.3, 5.6, 3.3, 6.5], over: [[1.27, 5], [3.6, 5], [3.6, 6.23], [3.38, 6.23], [3.21, 6.15], [3.12, 6.29], [2.85, 6.29], [2.58, 6.1], [2.46, 6.25], [2.5, 6.46], [2.38, 6.6], [2.08, 6.62], [1.98, 6.52], [1.9, 6.58], [1.96, 6.62], [1.94, 6.75], [1.35, 6.75], [1.35, 6.65], [1.31, 6.62], [1.35, 6.44], [1.29, 6.38], [1.27, 6.17], [1.38, 6.06], [1.38, 5.88], [1.31, 5.85], [1.29, 5.56], [1.48, 5.33], [1.31, 5.17]] },
    { name: "left lower stub, down into the front drift", foot: [0, 10.3, 1.3, 16] },
    { name: "thin seal across the open mouth itself", foot: [0, 7.9, 0.3, 10.3] },
    { name: "right upper stub: angled face + LED strip", foot: [26.7, 0, 28, 7.9] },
    { name: "right lower stub, down into the front drift", foot: [26.8, 11.7, 28, 16] },
    { name: "thin seal across the exit mouth", foot: [27.85, 7.9, 28, 11.7] },
    { name: "left bank, piled into the corner", foot: [0, 13.1, 3.2, 14.4], over: [[1.23, 12.21], [1.4, 12.21], [1.4, 13.33], [1.46, 13.33], [1.67, 13.6], [1.77, 13.6], [1.88, 13.58], [1.88, 13.42], [2.08, 13.21], [2.21, 13.23], [2.31, 13.12], [2.58, 13.15], [2.75, 13.31], [2.81, 13.52], [3.5, 13.79], [3.5, 14.65], [0.4, 14.65], [0.4, 13.46], [0.56, 13.31], [0.69, 13.31], [0.69, 13.21], [0.81, 13.1], [1.02, 13.1], [1.12, 13.21], [1.15, 13.33], [1.23, 13.33]] },
    { name: "left-mid run", foot: [3.2, 13.3, 6, 14.4], over: [[2.9, 13.52], [3.21, 13.71], [3.58, 13.81], [3.69, 13.96], [3.75, 13.96], [3.88, 13.79], [4.1, 13.73], [4.4, 13.73], [4.6, 13.81], [4.65, 13.9], [5, 13.52], [5.15, 13.52], [5.25, 13.73], [5.4, 13.75], [5.5, 13.88], [5.69, 13.73], [5.88, 13.73], [6, 13.77], [6.29, 14.12], [6.29, 14.65], [2.9, 14.65]] },
    { name: "left-mid run, tailing off", foot: [6.9, 13.6, 8.3, 14.4], over: [[7.62, 13.35], [7.94, 13.35], [8.06, 13.46], [8.06, 13.52], [8.12, 13.56], [8.1, 13.73], [8.29, 13.88], [8.29, 14.23], [7.98, 14.27], [7.79, 14.15], [7.65, 14.27], [7.29, 14.23], [7.27, 14.06], [7.19, 14.06], [7.12, 13.98], [6.96, 14], [6.94, 13.92], [6.81, 13.85], [6.83, 13.79], [6.9, 13.81], [6.92, 13.73], [6.88, 13.67], [7.04, 13.52], [7.27, 13.52], [7.29, 13.56], [7.42, 13.58], [7.44, 13.5]] },
    { name: "nub of foam where the gully drains in", foot: [13.8, 13.5, 14.55, 13.9], over: [[14.25, 12.88], [14.42, 12.88], [14.52, 12.96], [14.52, 13.12], [14.44, 13.17], [14.4, 13.33], [14.44, 13.35], [14.44, 13.46], [14.54, 13.52], [14.5, 13.75], [14.54, 13.77], [14.58, 13.96], [13.69, 13.96], [13.69, 13.9], [13.81, 13.83], [13.79, 13.67], [13.83, 13.5], [13.94, 13.42], [13.96, 13.35], [14.04, 13.35], [14.08, 13.31], [14.06, 13.23], [14.15, 13.17], [14.15, 13.04], [14.23, 12.98]] },
    { name: "tongue of foam around the gully foot", foot: [13, 13.9, 14.7, 14.4], over: [[14.15, 13.1], [14.52, 13.1], [14.44, 13.17], [14.4, 13.33], [14.44, 13.46], [14.54, 13.52], [14.5, 13.65], [14.54, 13.88], [14.71, 14.02], [14.71, 14.21], [14.62, 14.21], [14.62, 14.27], [14.52, 14.33], [14.62, 14.54], [14.9, 14.52], [15, 14.65], [13, 14.65], [13.04, 14.52], [13.1, 14.5], [13.1, 14.33], [13.23, 14.23], [13.4, 14.25], [13.48, 14.08], [13.81, 13.83], [13.81, 13.54], [13.96, 13.35], [14.08, 13.31], [14.06, 13.23]] },
    { name: "right-mid run", foot: [21, 13.9, 24, 14.4], over: [[24.25, 13.62], [24.29, 13.62], [24.29, 14.65], [21, 14.65], [21, 13.92], [21.15, 13.92], [21.19, 14], [21.31, 13.9], [21.58, 13.9], [21.83, 14.1], [22.12, 14.08], [22.21, 14.12], [22.38, 14.25], [22.44, 14.38], [22.62, 14.19], [22.73, 14.19], [22.88, 14.1], [23.1, 14.1], [23.12, 14.17], [23.29, 14.23], [23.42, 14.08], [23.62, 14.04], [23.65, 13.94], [23.77, 13.83], [24.06, 13.85], [24.23, 13.71]] },
    { name: "right bank, piled into the corner", foot: [24, 13.4, 26.8, 14.4], over: [[26.83, 12.29], [27, 12.29], [27, 13.33], [27.1, 13.33], [27.1, 14.65], [23.71, 14.65], [23.71, 13.9], [23.77, 13.83], [24.06, 13.85], [24.25, 13.62], [24.48, 13.62], [24.54, 13.73], [24.6, 13.73], [25.08, 13.44], [25.29, 13.44], [25.35, 13.52], [25.54, 13.54], [25.69, 13.71], [25.98, 13.42], [26.17, 13.42], [26.27, 13.54], [26.27, 13.67], [26.31, 13.6], [26.58, 13.62], [26.6, 13.52], [26.85, 13.33]] },
    { name: "front wall + drift base, full width", foot: [0, 14.4, 28, 16] },
  ],

  // Just inside the left-hand mouth, on the open wet floor where the
  // blue light from the entrance spills in.
  playerSpawn: [2.3, 9.2],

  // Quiet area. No enemies, ever: the budget is zero and the room is
  // the breather before Mercy's main room. The array stays so the
  // builder has something to read.
  enemySpawns: [],

  // Dead centre of the room, beside the half-clogged drain under the
  // foam cannon, standing on a clump that has drifted onto the grille.
  // Off the straight entrance-to-exit line by design: you have to
  // notice them through the foam and step out of the channel.
  companionSpawn: [14.0, 9.5],

  // Way out, the wide mouth in the right-hand wall. Sits flush against
  // the edge seal so it reads as a threshold.
  exit: [27.4, 8.1, 27.8, 11.5],
};
