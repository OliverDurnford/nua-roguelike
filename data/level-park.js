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
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
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

  solid: [
    // ---- the hedge and treeline along the top ----
    // One band the full width. The hedge is at least 2.25 deep
    // everywhere (the shallowest point is the grass behind the bench),
    // so 2.2 never covers walkable ground.
    [0,     0,     32,    2.2],
    [0,     2.2,   1.05,  3.85],   // the deeper hedge in the top left corner

    // ---- the two big trees, top left ----
    // Their canopies overlap, so they are measured as one mass and
    // stepped in to follow the outline down to the trunks.
    [1.3,   2.2,   11.55, 4.9],
    [0.9,   4.9,   11.2,  5.3],
    [1.1,   5.3,   10.4,  6.0],
    [1.55,  6.0,   9.15,  6.45],
    [2.05,  6.45,  7.75,  7.0],
    [3.3,   7.0,   6.0,   7.85],   // the near tree's trunk and roots

    // ---- the Burdett-Coutts fountain and its paved circle ----
    // Three stacked rectangles so the circle's corners stay grass.
    [13.75, 3.1,   18.45, 4.5],
    [14.35, 2.4,   17.85, 5.25],
    [15.35, 1.9,   16.85, 5.75],

    // ---- the path furniture ----
    [12.7,  2.1,   13.6,  3.55],   // the bin, left of the fountain
    [25.5,  2.35,  27.75, 3.7],    // the bench, right of the big tree

    // ---- the big tree, top centre right ----
    [19.2,  2.2,   25.0,  3.4],
    [19.45, 3.4,   24.5,  4.1],
    [19.95, 4.1,   23.85, 5.0],
    [20.7,  5.0,   23.6,  5.5],
    [21.3,  5.5,   22.7,  5.9],    // trunk and roots

    // ---- the tree in the top right corner ----
    [28.35, 2.2,   32,    3.3],
    [28.7,  3.3,   32,    3.9],
    [29.4,  3.9,   32,    4.4],
    [30.2,  4.4,   32,    4.85],   // trunk and roots

    // ---- the car park fence ----
    // Chain link on three sides; the right hand side runs off the
    // picture into the outer edge block. The break at 29.3 to 31.35
    // is the painted gateway where the path comes in, left open so
    // the collision matches the artwork.
    [23.85, 6.05,  29.3,  7.8],    // top run, left of the gateway
    [31.35, 6.05,  32,    7.8],    // top run, right of the gateway
    [23.85, 6.05,  24.25, 23.45],  // the side facing the field, seen edge on
    [23.85, 21.5,  32,    23.45],  // bottom run

    // ---- the three parked cars ----
    [24.95, 8.35,  29.1,  10.7],   // red
    [25.0,  11.7,  29.15, 14.2],   // grey, the one the ball finds
    [24.95, 18.4,  29.15, 20.85],  // beige

    // ---- the bushes in the bottom left corner ----
    [0,     20.9,  4.3,   26],
    [0,     21.8,  5.1,   26],
    [0,     23.2,  5.9,   26],

    // ---- outer edge, so nobody walks off the picture ----
    [0,     0,     32,    0.4],
    [0,     25.6,  32,    26],
    [0,     0,     0.4,   26],
    [31.6,  0,     32,    26],
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
