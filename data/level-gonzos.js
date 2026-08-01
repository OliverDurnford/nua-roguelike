// ============================================================
// GONZO'S — Chapter 1, Area 1.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 32 units wide by 18 units tall, and one unit is 48 world px,
// so the finished room is 1536 x 864 px (about 1.6 screens wide
// and 1.6 screens tall).
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Gonzos/Gonzos_Level.jpg", imagine it cut into
// 32 columns and 18 rows, and read off the column and row.
//
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTE: loose chairs are deliberately NOT solid. You walk
// straight over them. Only tables, benches, the bar and the walls
// block you, which keeps the room cluttered to look at but clean
// to move through. Add a chair here if it should get in the way.
// ============================================================

const GONZOS_PLATE = {
  sprite: "plate-gonzos",
  cols: 32,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> room is 1536 x 864

  solid: [
    // ---- sealed back of house (you can see it, you can't reach it) ----
    [0,     0,     9.55,  7.65],   // commercial kitchen
    [0,     7.65,  6.5,   18],     // both toilet blocks
    [6.5,   7.65,  9.55,  10.85],  // corridor wall: fairy lights, pictures, extinguisher
    [9.55,  0,     18.95, 8.4],    // stairwell + back bar (shelves, GONZO'S sign)

    // ---- the L shaped bar ----
    [9.55,  8.4,   18.0,  10.6],   // long counter run
    [18.0,  6.5,   19.0,  10.6],   // the return, going up under the glass rack

    // ---- main room shell ----
    [18.95, 0,     29.4,  2.9],    // top wall: pictures, taxidermy, string lights
    [19.3,  2.9,   21.0,  4.45],   // grandfather clock
    [29.4,  0,     32,    18],     // right wall + the big gilt frame

    // ---- banquette ----
    // Only the top run needs its own block. The bench down the right
    // hand side already falls inside the right wall block above.
    [21.2,  2.9,   29.4,  4.6],    // bench along the top

    // ---- furniture ----
    [21.4,  4.45,  23.3,  6.1],    // banquette table 1
    [24.1,  4.45,  25.95, 6.1],    // banquette table 2
    [26.9,  4.45,  28.7,  6.1],    // banquette table 3
    [27.5,  8.9,   29.05, 10.8],   // side table with the candle
    [25.2,  14.4,  29.3,  16.9],   // DJ decks
    [24.7,  14.75, 25.5,  15.95],  // DJ speaker, left
    [28.0,  13.25, 28.8,  14.6],   // DJ speaker, right
    [21.15, 13.9,  22.9,  15.3],   // round table at the foot of the rug
    [16.1,  12.6,  17.6,  14.0],   // round table, middle of the floor
    [16.85, 15.8,  18.3,  17.45],  // square table, bottom of the floor

    // ---- outer edge, so nobody walks off the picture ----
    [0,     17.8,  32,    18],
  ],

  // Dead centre of the Persian rug, under the mirrorball.
  // (The rug runs 21.26 to 26.38 across, 8.79 to 15.92 down.)
  playerSpawn: [23.8, 12.35],

  // Two ways in, both marked on Ollie's annotated screenshot.
  // Top four: the doorway beside the bar, where the stairs come down.
  // Bottom four: the corridor mouth at the bottom of the room.
  enemySpawns: [
    [19.5, 4.9], [19.5, 5.9], [20.4, 5.3], [20.4, 6.4],
    [10.6, 17.2], [11.5, 17.2], [12.4, 17.2], [13.2, 17.2],
  ],

  // Way out, bottom left, past the toilets. Sits flush with the bottom
  // edge so it reads as a threshold. Locked until the room is clear.
  exit: [7.0, 17.4, 8.7, 17.84],
};
