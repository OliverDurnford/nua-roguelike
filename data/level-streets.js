// ============================================================
// NORWICH STREETS: Chapter 3, Area 3. The mad dash.
//
// Plate area: painted background (core/plates-real.js) with a
// hand-measured collision layer. A cobbled medieval lane running
// the full width, played left to right. Sealed along the top by
// the pantile roofs and the fronts of the timber framed houses,
// and along the bottom by the near side rooftops. You come in at
// the left edge and run out through the little square at the far
// right, past the church.
//
// Grid: 48 x 18 units, one unit is 48 world px (2304 x 864 px).
// Source: "Level Design/Norwich Streets/Norwich Streets - game
// plate.jpg" cut into 48 columns and 18 rows. Unit 0,0 is the top
// left corner. Press F2 in game to see the blocks.
//
// TUNING NOTE: this is a sprint, so the lane is kept wide. The
// pavement in front of the houses is walkable; only the things
// standing on it block you. The cafe chairs, the chalkboard A
// board, the wheelie bin and the drain are deliberately NOT solid,
// the same call as the loose chairs in Gonzo's. The four bollards
// are solid at their feet only: blocking the whole painted post
// leaves under a unit of daylight between them and the bikes, and
// the brute cannot get through that.
// ============================================================

const STREETS_PLATE = {
  // Two tiles side by side: Kaboom caps textures at 2048 px wide.
  tiles: [
    { sprite: "plate-streets_0", x: 0 },
    { sprite: "plate-streets_1", x: 24 },
  ],
  cols: 48,
  rows: 18,
  unit: 48,

  // A wide open street, a touch smaller than the Hungover Walk.
  charScale: 1.15,

  solid: [
    // ---- the far side, all sealed ----
    // The house fronts all sit their stone plinths on the same line,
    // give or take a few pixels, so the whole terrace is one block.
    [0,     0,     41.75, 9.0],    // pantile roofs and house fronts, down to the pavement
    [41.75, 0,     48,    8.45],   // flint church, churchyard, and its railed wall

    // ---- standing on the pavement, along the house fronts ----
    [8.55,  8.35,  9.78,  9.8],    // the red phone box
    [11.6,  9.5,   12.1,  10.25],  // lamp post, its base only
    [16.5,  9.05,  17.4,  9.75],   // the cafe table (chairs and A board stay walkable)
    [21.6,  8.6,   27.45, 9.65],   // the three bicycles leaning on the wall

    // ---- out on the cobbles ----
    [24.45, 11.3,  24.9,  11.6],   // bollard foot, back left
    [25.12, 11.3,  25.58, 11.6],   // bollard foot, back right
    [24.45, 13.42, 24.9,  13.78],  // bollard foot, front left
    [25.12, 13.42, 25.58, 13.78],  // bollard foot, front right
    [32.6,  13.45, 33.05, 14.05],  // the second lamp post, its base only

    // ---- the square ----
    [42.15, 8.45,  43.7,  9.35],   // the bench under the churchyard wall
    // The plane tree, stacked rectangles so the round thing reads round:
    // four bands down the canopy, then five down the cobbled kerb it grows from.
    [43.85, 8.45,  48,    9.1],    // canopy, top
    [43.5,  9.1,   48,    9.6],    // canopy
    [43.05, 9.6,   48,    10.4],   // canopy, widest
    [43.45, 10.4,  48,    10.8],   // canopy, foot
    [45.25, 10.8,  46.9,  11.5],   // the trunk, between canopy and kerb
    [45.05, 11.5,  46.95, 11.9],   // kerb ring
    [44.5,  11.9,  47.5,  12.5],   // kerb ring
    [44.45, 12.5,  47.55, 13.1],   // kerb ring, widest
    [44.7,  13.1,  47.3,  13.6],   // kerb ring
    [45.2,  13.6,  46.8,  13.95],  // kerb ring

    // ---- the near side: rooftops along the bottom ----
    // One long band, plus the gables that poke up into the lane.
    [0,     14.0,  36.4,  18],     // the near rooftops
    [5.0,   12.95, 6.95,  14.0],   // gable
    [10.85, 12.9,  12.75, 14.0],   // gable
    [16.8,  13.45, 18.85, 14.0],   // gable
    [20.65, 13.35, 22.6,  14.0],   // gable
    [22.75, 13.35, 23.15, 14.0],   // chimney stack
    [27.95, 13.1,  29.9,  14.0],   // gable
    [34.1,  13.85, 35.15, 14.0],   // gable
    [36.4,  16.87, 48,    18],     // the square's low flint wall

    // ---- outer edge, so nobody walks off the picture ----
    [0,     9.0,   0.4,   14.0],
    [47.6,  8.45,  48,    14.15],  // right edge above the way out
  ],

  // On the cobbles at the left edge, facing the length of the lane.
  playerSpawn: [1.4, 12.0],

  // Nine, strung out along the whole run and on into the square, so the
  // fight comes at you in waves as you sprint rather than all at once.
  // All are clear of the start by more than six units, and clear of the
  // scenery by more than half the brute's width.
  enemySpawns: [
    [9.6,  11.6], [14.2, 12.9], [19.4, 11.4],
    [23.3, 11.9], [27.3, 11.3], [31.1, 12.8],
    [35.6, 11.6], [39.6, 14.8], [45.0, 15.6],
  ],

  // Way out: the square carries on off the right edge, under the tree.
  exit: [47.55, 14.15, 47.95, 16.87],
};
