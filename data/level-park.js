// ============================================================
// VICTORIA PARK: the tutorial, Chapter 0.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 32 units wide by 26 units tall, and one unit is 48 world px,
// so the park is 1536 x 1248 px (1.6 screens wide, 2.3 tall).
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Victoria Park/Victoria Park - game plate.jpg",
// imagine it cut into 32 columns and 26 rows, and read off the
// column and row. Press F2 in game to see the blocks.
//
// things: one entry per painted thing (footprint and outline); see below.
//
// TUNING NOTE: the four base mats, the pile of bags by home plate
// and the mown grass are all deliberately walkable. Only the
// treeline, the fountain, the bin, the bench, the car park fence,
// the three parked cars and the corner bushes block you, so the
// field itself stays completely open for the cutscene.
//
// No exit: the tutorial ends on the cracks opening, not a door.
// ============================================================

const PARK_PLATE = {
  sprite: "plate-park",
  cols: 32,
  rows: 26,
  unit: 48,          // world pixels per grid unit -> park is 1536 x 1248

  // Slightly bigger than the 72px default so a person reads against
  // painted trees this size, but nowhere near Gonzo's 1.3: the park
  // has to feel open. A person is 83px on this grass.
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
    { name: "treeline and hedge along the top", foot: [0, 0, 32, 2.2] },
    { name: "the deeper hedge in the top left corner", foot: [0, 2.2, 1.05, 3.85] },
    { name: "big trees, top left corner", foot: [3.2, 7, 5.8, 7.85], over: [[3.9, 0.75], [4.29, 0.75], [4.71, 1.06], [5.04, 0.96], [5.19, 1.1], [5.46, 0.98], [5.75, 1.33], [5.96, 1.31], [6.4, 1.71], [6.35, 1.88], [6.67, 2.12], [6.62, 2.23], [6.9, 2.38], [6.79, 2.62], [6.98, 2.77], [7.21, 3.67], [7.23, 5.56], [7.12, 5.79], [7, 5.92], [6.83, 5.85], [6.62, 6.19], [6.5, 6.12], [6.52, 6.33], [6.33, 6.62], [6.02, 6.58], [5.81, 6.77], [5.6, 6.77], [5.6, 7.48], [4.77, 7.6], [4.56, 7.98], [4.31, 8.02], [4.08, 7.88], [3.94, 7.54], [3.19, 7.42], [3.25, 6.94], [3.12, 6.71], [2.79, 6.69], [2.67, 6.81], [2.5, 6.58], [2.23, 6.71], [2.04, 6.38], [1.77, 6.44], [1.62, 6.17], [1.21, 5.94], [1.38, 5.71], [0.85, 5.19], [0.85, 5], [1.08, 4.75], [0.83, 4.54], [1.08, 4.08], [0.88, 3.73], [1.06, 3.58], [1, 3.44], [1.17, 3.31], [1.21, 2.79], [1.5, 2.48], [1.69, 1.83], [2.25, 1.54], [2.54, 1.15], [2.9, 1.17], [3.25, 0.92], [3.65, 1]] },
    { name: "big tree beside it", foot: [8.15, 5.95, 9.5, 6.4], over: [[8.48, 0.21], [9.65, 0.31], [10, 0.56], [10.19, 0.44], [10.4, 0.73], [10.88, 0.9], [11.19, 1.38], [11.19, 1.58], [11.5, 1.88], [11.5, 2.29], [11.81, 2.65], [11.67, 2.98], [11.88, 3.31], [11.69, 3.58], [11.9, 3.94], [11.46, 4.42], [11.58, 4.62], [11.1, 5.1], [10.9, 5.06], [10.62, 5.29], [10.4, 5.21], [10.46, 5.38], [10.31, 5.5], [10.19, 5.42], [10.04, 5.54], [9.96, 5.46], [9.65, 5.73], [9.38, 5.62], [9, 5.9], [8.69, 5.73], [8.25, 5.75], [8.08, 5.62], [7.52, 5.69], [7.35, 5.52], [7.4, 5.15], [7.54, 4.92], [7.38, 4.6], [7.52, 4.4], [7.52, 4.17], [7.27, 3.77], [7.35, 3.48], [7.15, 3.25], [7.23, 2.96], [6.94, 2.71], [6.9, 2.38], [6.58, 1.88], [6.56, 1.52], [6.73, 1.31], [6.69, 1.1], [7.06, 0.73], [7.27, 0.73], [7.56, 0.4], [7.79, 0.46], [7.9, 0.33], [8.06, 0.33], [8.19, 0.42]] },
    { name: "the fountain", foot: [14.6, 3.45, 17.4, 4.5], over: [[15.99, 0.78], [16.1, 1.2], [16.36, 1.6], [16.5, 2], [16.78, 2.12], [16.78, 2.95], [17.45, 3.45], [17.45, 4.45], [16.68, 5.2], [15.35, 5.2], [14.57, 4.45], [14.57, 3.45], [15.24, 2.95], [15.24, 2.12], [15.5, 2], [15.63, 1.6], [15.86, 1.2]] },
    { name: "the fountain, front of the base", foot: [15.35, 4.5, 16.68, 5.1] },
    { name: "the bin, left of the fountain", foot: [12.8, 3, 13.5, 3.5], over: [[12.8, 2.05], [13.52, 2.05], [13.62, 2.2], [13.62, 3.45], [13.56, 3.62], [12.76, 3.62], [12.7, 3.45], [12.7, 2.2]] },
    { name: "the bench, right of the big tree", foot: [25.55, 2.95, 27.72, 3.68], over: [[25.69, 2.25], [25.88, 2.29], [25.94, 2.4], [27.33, 2.4], [27.4, 2.29], [27.71, 2.4], [27.77, 2.85], [27.67, 2.96], [27.75, 3], [27.75, 3.48], [27.62, 3.52], [27.62, 3.71], [27.44, 3.75], [27.4, 3.52], [25.83, 3.52], [25.83, 3.71], [25.65, 3.75], [25.48, 3.27], [25.48, 3], [25.62, 2.94], [25.48, 2.83], [25.5, 2.44], [25.67, 2.4]] },
    { name: "big tree, centre right", foot: [21.25, 5.5, 22.75, 5.95], over: [[20.56, 0], [23.5, 0], [23.88, 0.12], [24.23, 0.5], [24.27, 0.83], [24.62, 1.1], [24.54, 1.33], [24.96, 1.65], [24.85, 2], [25.04, 2.27], [24.92, 2.4], [25.19, 2.92], [24.98, 3.12], [25.17, 3.35], [24.96, 3.6], [25.04, 3.9], [24.69, 4.33], [24.5, 4.27], [24.35, 4.56], [24.17, 4.5], [24.31, 4.69], [24.1, 4.75], [24.08, 4.92], [23.85, 4.85], [23.62, 5.08], [23.35, 5.02], [21.96, 5.38], [21.69, 5.12], [21.46, 5.27], [21.29, 5.21], [21.1, 4.92], [21, 5.06], [20.88, 4.92], [20.71, 5], [20.56, 4.85], [20.62, 4.75], [20.31, 4.9], [20.25, 4.71], [20.08, 4.58], [19.88, 4.62], [19.77, 4.4], [19.4, 4.15], [19.56, 3.96], [19.08, 3.46], [19.31, 3.08], [19.12, 2.79], [19.35, 2.46], [19.15, 2.17], [19.48, 1.79], [19.46, 1.31], [19.77, 1.04], [19.73, 0.77], [19.98, 0.58], [19.92, 0.44]] },
    { name: "tree, top right corner", foot: [30.2, 4.4, 32, 4.85], over: [[28.88, 0], [32, 0], [32, 4.67], [31.71, 4.67], [31.48, 4.85], [31.33, 5.08], [31.12, 5.06], [30.85, 4.58], [30.52, 4.56], [30.29, 4.21], [30.38, 4.15], [30.21, 4], [30.21, 3.9], [30.06, 4.04], [29.96, 3.96], [29.98, 3.92], [29.83, 4], [29.67, 3.83], [29.73, 3.71], [29.44, 3.88], [29.23, 3.56], [28.98, 3.6], [28.85, 3.44], [28.88, 3.35], [28.69, 3.29], [28.5, 3.08], [28.58, 2.96], [28.67, 2.94], [28.54, 2.85], [28.5, 2.71], [28.31, 2.6], [28.31, 2.52], [28.19, 2.4], [28.44, 2.04], [28.23, 1.88], [28.46, 1.42], [28.27, 1.23], [28.29, 1.1], [28.48, 1], [28.42, 0.85], [28.52, 0.75], [28.6, 0.75], [28.52, 0.67], [28.52, 0.54], [28.62, 0.48], [28.58, 0.29]] },
    { name: "top run, left of the gateway", foot: [23.85, 7.3, 29.7, 7.8], over: [[23.89, 6.05], [29.69, 6.05], [29.69, 7.8], [23.89, 7.8]], see: true },
    { name: "top run, right of the gateway", foot: [31.45, 7.3, 32, 7.8], over: [[31.49, 6.05], [32, 6.05], [32, 7.8], [31.49, 7.8]], see: true },
    { name: "car park fence, side facing the field, seen edge on", foot: [23.85, 6.05, 24.25, 23.45], over: [[23.89, 6.05], [24.27, 6.05], [24.27, 23.45], [23.89, 23.45]], see: true },
    { name: "car park fence, bottom run", foot: [23.85, 23, 32, 23.45], over: [[23.89, 21.5], [32, 21.5], [32, 23.45], [23.89, 23.45]], see: true },
    { name: "red car", foot: [24.95, 9.5, 29.1, 10.7], over: [[26.44, 8.38], [26.54, 8.38], [26.75, 8.38], [28.46, 8.38], [28.69, 8.4], [29.22, 8.4], [29.22, 8.46], [29.22, 8.6], [29.04, 8.6], [29.15, 8.73], [29.19, 9.02], [29.22, 9.06], [29.22, 10.77], [29.1, 10.92], [29.06, 10.92], [27.42, 10.92], [27.46, 10.92], [26.98, 10.92], [26.85, 10.92], [25.21, 10.92], [25.1, 10.88], [25.02, 10.77], [25.02, 10.52], [24.95, 10.19], [24.95, 9.25], [25.06, 8.85], [25.35, 8.67], [25.27, 8.67], [25.21, 8.54], [25.1, 8.58], [25.06, 8.48], [25.15, 8.4], [26.25, 8.4], [26.29, 8.38]] },
    { name: "grey car, the one the ball finds", foot: [25, 13, 29.15, 14.2], over: [[26.38, 11.7], [26.46, 11.7], [26.52, 11.73], [26.56, 11.7], [26.69, 11.7], [26.73, 11.7], [28.48, 11.7], [28.94, 11.85], [29.12, 12.06], [29.12, 12.17], [29.19, 12.21], [29.19, 12.35], [29.2, 12.4], [29.2, 13.71], [29.2, 13.73], [29.2, 14.12], [29.02, 14.18], [28.6, 14.18], [25.69, 14.18], [25.21, 14.18], [25.15, 14.18], [25.02, 14.12], [25.02, 13.85], [24.98, 13.83], [24.97, 13.62], [24.97, 13.56], [24.97, 12.58], [24.97, 12.54], [24.97, 12.4], [25.02, 12.35], [25.02, 12.27], [25.1, 12.17], [25.31, 12.02], [25.38, 12.04], [25.42, 11.96], [26.15, 11.88], [26.23, 11.83], [26.25, 11.75]] },
    { name: "beige car", foot: [24.95, 19.65, 29.15, 20.85], over: [[26.38, 18.4], [26.48, 18.4], [26.56, 18.4], [26.69, 18.4], [26.71, 18.4], [28.73, 18.4], [29.19, 18.73], [29.2, 18.77], [29.2, 19.02], [29.2, 19.1], [29.2, 20.42], [29.2, 20.6], [29.2, 20.85], [29.17, 20.92], [29.04, 20.92], [25.19, 20.92], [25, 20.81], [25, 20.71], [24.95, 20.4], [24.95, 19.15], [24.95, 19.1], [24.95, 18.98], [25.08, 18.73], [25.19, 18.73], [25.23, 18.67], [25.75, 18.62], [25.77, 18.58], [26.12, 18.58], [26.17, 18.52], [26.25, 18.52], [26.27, 18.4]] },
    { name: "corner bushes 1", foot: [0, 20.9, 4.3, 26] },
    { name: "corner bushes 2", foot: [0, 21.8, 5.1, 26] },
    { name: "corner bushes 3", foot: [0, 23.2, 5.9, 26] },
    { name: "top edge of the picture", foot: [0, 0, 32, 0.4] },
    { name: "bottom edge of the picture", foot: [0, 25.6, 32, 26] },
    { name: "left edge of the picture", foot: [0, 0, 0.4, 26] },
    { name: "right edge of the picture", foot: [31.6, 0, 32, 26] },
    { name: "bag pile, upper bags, top", foot: [8.25, 20.9, 12.5, 21.4], over: [[9.67, 19.81], [9.82, 19.85], [9.98, 20.05], [10.1, 20.3], [10.26, 20.2], [10.4, 20.04], [10.6, 20.03], [10.85, 20.25], [11.1, 20.5], [11.44, 20.46], [11.75, 20.43], [11.96, 20.56], [12.12, 20.67], [12.14, 20.85], [12.15, 20.9], [8.25, 20.9], [8.25, 20.82], [8.32, 20.63], [8.42, 20.42], [8.74, 20.25], [9, 20.3], [9.2, 20.2], [9.4, 19.9]], base: 20.9 },
    { name: "bag pile, upper bags", foot: [8.25, 21.4, 12.5, 22.1], over: [[12.15, 20.9], [12.2, 21.11], [12.28, 21.21], [12.51, 21.42], [12.61, 21.6], [12.64, 21.84], [12.59, 22.05], [12.55, 22.1], [8.18, 22.1], [8.22, 21.92], [8.28, 21.6], [8.25, 21.2], [8.25, 20.9]] },
    { name: "bag pile, lower bags", foot: [8.3, 22.1, 11.5, 22.78], over: [[12.55, 22.1], [12.48, 22.1], [12.25, 22.1], [12, 22.1], [11.75, 22.1], [11.58, 22.1], [11.56, 22.57], [11.5, 22.72], [11.03, 22.67], [10.7, 22.7], [10.4, 22.78], [9.99, 22.8], [9.67, 22.8], [9.4, 22.75], [9.1, 22.75], [8.63, 22.72], [8.39, 22.54], [8.19, 22.4], [8.17, 22.16], [8.18, 22.1]] },
  ],

  // The pitcher's spot: the scuffed dirt in the middle of the diamond,
  // level with first and third base. You start the tutorial here.
  playerSpawn: [15.95, 13.1],

  // Nobody fights in the park, so there is nothing to spawn.
  enemySpawns: [
  ],

  // ---- tutorial only, read by scenes/tutorial.js ----

  // Home plate, the lowest of the four mats. The first friend stands
  // here with the bat and knocks your pitch into the car park.
  batter: [15.9, 18.15],

  // Dead centre of the middle car, the grey one. The ball ends here
  // and the bloke's "OI!!" comes off this point.
  carTarget: [27.05, 12.95],

  // Where the other eight stand: a full fielding side. You pitch from
  // the mound, the first friend bats, and these eight cover the rest of
  // the positions, so the park reads as a game already going on.
  //
  // Measured off the four painted mats, not eyeballed: first is at
  // [21.30, 13.15], second [16.01, 8.31], third [10.47, 13.24] and home
  // [15.99, 18.27]. The three basemen stand a little past their bag on
  // the outfield side, so the white mat still reads in front of their
  // feet instead of vanishing under them.
  //
  // The outfield is shallow because the park is. Straight-away centre
  // walks into the fountain and deep right into the car park fence, so
  // both are pulled in to the last clear grass.
  fielders: [
    [16.00, 19.90],   // catcher, behind home plate
    [21.55, 12.50],   // first base
    [16.90,  7.95],   // second base
    [10.20, 12.60],   // third base
    [12.90, 10.40],   // short stop, between second and third
    [ 6.80,  8.70],   // left field
    [13.90,  6.60],   // centre field, off the fountain's left shoulder
    [21.20,  9.20],   // right field
  ],

  // Where the ground splits open: the diamond and the grass just
  // around it, so every crack is a short walk from a friend.
  crackBox: [11.5, 9.0, 21.5, 16.5],
};
