// ============================================================
// THE BEEHIVE: Chapter 4, Area 3. Estate pub (fight, 8 enemies).
//
// Plate area. Measured off "The Beehive - game plate.jpg": an estate
// pub on the left (0 to about 62%) and its front patio on the right,
// split by a dividing wall with one doorway. Same format as Gonzo's:
// loose stools are walkable, tables and fixed furniture are solid.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/The Beehive/The Beehive - game plate.jpg" cut
// into 32 columns and 18 rows. Unit 0,0 is the top left corner.
// ============================================================

const BEEHIVE_PLATE = {
  sprite: "plate-beehive",
  cols: 32,
  rows: 18,
  unit: 48,

  charScale: 1.3,

  solid: [
    // ---- pub shell ----
    [0,     0,     19.85, 3.9],   // top wall: scarves, pictures, TV, the panelling above the carpet
    [0,     0,     0.4,   18],    // left wall
    [0.4,   17.0,  8.6,   17.6],  // bottom wall, west of the front door
    [10.95, 17.0,  19.85, 17.6],  // bottom wall, east of the front door

    // ---- the bar ----
    [6.0,   0.85,  14.2,  5.3],   // back bar (shelves, optics, fridge) and the counter, one block; stools walkable
    [14.2,  0.85,  15.15, 5.9],   // the counter's rounded corner, swinging out past the last stool
    [17.15, 1.4,   18.6,  4.5],   // fruit machine

    // ---- booths, each with its own table ----
    [0.4,   5.55,  3.65,  9.0],   // booth 1 (top), left wall
    [0.4,   9.0,   3.55,  12.55], // booth 2 (middle), left wall
    [0.4,   12.55, 3.65,  16.15], // booth 3 (bottom), left wall
    [16.0,  12.6,  19.05, 16.2],  // booth 4, bottom right, against the dividing wall

    // ---- the three round pub tables (stools walkable) ----
    [5.65,  7.55,  7.55,  9.05],  // table by the bar
    [5.65,  13.35, 7.55,  14.85], // table, mid left
    [9.8,   13.1,  12.8,  14.5],  // table, mid bottom, by the front door

    // ---- pool ----
    [11.0,  7.6,   15.75, 10.35], // pool table
    [15.95, 7.9,   16.55, 9.95],  // cue rack, mounted on the wall beside it

    // ---- dividing wall, gap between is the painted doorway ----
    // Opened up past the door graphic itself (6.85 to 9.05): the brute's
    // box is wide enough that its half-width inflation from this gap and
    // from the picnic benches' own gap otherwise pinch to nothing right
    // where they'd need to overlap, sealing the patio off for it.
    [18.65, 0,     19.85, 6.5],
    [18.65, 10.0,  19.85, 18],

    // ---- patio shell ----
    [19.85, 0,     31.3,  4.7],   // pub frontage: green woodwork, windows, hanging baskets
    [31.3,  0,     32,    6.9],   // right wall, above the gate
    [31.3,  9.7,   32,    18],    // right wall, below the gate
    [19.85, 14.35, 29.5,  17.6],  // brick wall, railings and flowerbed along the bottom
    [29.5,  14.0,  31.3,  18],    // same, the corner by the gate post

    // ---- picnic benches, each with its folded umbrella ----
    // Trimmed back slightly from the painted edges (just the thin legs and
    // canopy fringe) on the sides that face the walking gaps between them:
    // the brute's box is wider than the gaps as painted, so reach.py can't
    // path it between the benches or round to the gate otherwise.
    [20.3,  3.8,   24.3,  7.4],   // bench 1, top left
    [26.7,  3.75,  29.8,  7.4],   // bench 2, top right
    [20.1,  9.7,   23.9,  13.65], // bench 3, bottom left
    [27.0,  9.7,   29.9,  13.65], // bench 4, bottom right
  ],

  // Just inside the front door in the bottom wall.
  playerSpawn: [9.75, 16.4],

  // Four in the pub, four on the patio (down the open lane between the two
  // columns of benches, clear of both), all more than 5 units from the start.
  enemySpawns: [
    [10.5,  6.3],  [4.6,   8.0],  [17.6,  9.0],  [4.5,   11.2],
    [25.3,  6.0],  [26.0,  8.5],  [25.2, 11.0],  [26.2,  13.0],
  ],

  // The open gate in the right wall of the patio.
  exit: [31.3, 7.3, 31.85, 9.3],
};
