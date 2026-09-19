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
    { name: "big trees, top left corner", foot: [3.2, 7, 5.8, 7.85], over: [[1.3, 2.2], [11.55, 2.2], [11.55, 4.9], [10.4, 5.5], [9.15, 6.2], [7.75, 7], [2.05, 7], [1.55, 6.3], [1, 5.5], [0.9, 4.9], [1.3, 4.9]] },
    { name: "the fountain", foot: [14.85, 4.9, 17.15, 5.8], over: [[16, 0.4], [16.85, 1.9], [18.45, 3.65], [17.15, 4.75], [17.15, 5.8], [14.85, 5.8], [14.85, 4.75], [13.75, 3.65], [15.35, 1.9]] },
    { name: "the bin, left of the fountain", foot: [12.8, 3, 13.5, 3.5], over: [[12.72, 2.15], [13.58, 2.15], [13.58, 3.5], [12.72, 3.5]] },
    { name: "the bench, right of the big tree", foot: [25.55, 2.95, 27.72, 3.68], over: [[25.53, 2.15], [27.78, 2.15], [27.78, 3.68], [25.53, 3.68]] },
    { name: "big tree, centre right", foot: [21.25, 5.5, 22.75, 5.95], over: [[19.2, 2.2], [25, 2.2], [24.2, 3.75], [23.6, 5], [22.7, 5.5], [21.3, 5.5], [20.7, 5], [19.7, 3.75]] },
    { name: "tree, top right corner", foot: [30.2, 4.4, 32, 4.85], over: [[28.35, 2.2], [32, 2.2], [32, 4.4], [30.2, 4.4], [29.4, 3.9], [28.7, 3.3]] },
    { name: "top run, left of the gateway", foot: [23.85, 6.05, 29.3, 7.8] },
    { name: "top run, right of the gateway", foot: [31.35, 6.05, 32, 7.8] },
    { name: "car park fence, side facing the field, seen edge on", foot: [23.85, 6.05, 24.25, 23.45] },
    { name: "car park fence, bottom run", foot: [23.85, 21.5, 32, 23.45] },
    { name: "red car", foot: [24.95, 8.75, 29.1, 10.7], over: [[24.95, 8.35], [29.1, 8.35], [29.1, 10.7], [24.95, 10.7]] },
    { name: "grey car, the one the ball finds", foot: [25, 12.1, 29.15, 14.2], over: [[25, 11.7], [29.15, 11.7], [29.15, 14.2], [25, 14.2]] },
    { name: "beige car", foot: [24.95, 18.8, 29.15, 20.85], over: [[24.95, 18.4], [29.15, 18.4], [29.15, 20.85], [24.95, 20.85]] },
    { name: "corner bushes 1", foot: [0, 20.9, 4.3, 26] },
    { name: "corner bushes 2", foot: [0, 21.8, 5.1, 26] },
    { name: "corner bushes 3", foot: [0, 23.2, 5.9, 26] },
    { name: "top edge of the picture", foot: [0, 0, 32, 0.4] },
    { name: "bottom edge of the picture", foot: [0, 25.6, 32, 26] },
    { name: "left edge of the picture", foot: [0, 0, 0.4, 26] },
    { name: "right edge of the picture", foot: [31.6, 0, 32, 26] },
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
