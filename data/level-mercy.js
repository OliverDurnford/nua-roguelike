// ============================================================
// MERCY, FIRST ROOM: Chapter 1, Area 3.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 32 units wide by 18 units tall, and one unit is 48 world px,
// so the finished room is 1536 x 864 px (about 1.6 screens wide
// and 1.6 screens tall), the same footprint as Gonzo's.
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Mercy First Room/Mercy first room Level
// Design.jpeg", imagine it cut into 32 columns and 18 rows, and
// read off the column and row.
//
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTE: this is the busiest fight of the chapter, nine
// enemies, so the middle of the floor stays one big open channel.
// The dropped cups, tokens and lost shoes on the floor are all
// walkable clutter. Only the bar, the benches, the tables, the
// DJ booth, the two piers and the walls block you.
// ============================================================

const MERCY_PLATE = {
  sprite: "plate-mercy",
  cols: 32,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> room is 1536 x 864

  // Everyone stands 15% taller in here than the game's default.
  // Measured off the furniture: the round pedestal tables paint at
  // 84 world px across against Gonzo's 91 px, where people are 94 px,
  // so straight parity with Gonzo's would say about 1.2. This room is
  // meant to play roomier than Gonzo's though, it is the warm-up box
  // before the main room and it takes the chapter's biggest wave, so
  // it sits just under parity. A person is 83 px on this floor and
  // the central channel reads about 13 people wide.
  charScale: 1.15,

  solid: [
    // ---- the bar, sealed as one block (you can see it, you can't reach it) ----
    // Amber shelves, glass washer, fridges, taps, counter, the blue LED
    // front and the chrome drink rail below it, all one zone. The rail
    // turns up at its right end and meets the wall, so nothing squeezes
    // round the side of it.
    [0,     0,     9.75,  8.6],    // whole bar corner, shelves to rail posts

    // ---- back wall ----
    [9.75,  0,     14.65, 4.0],    // wall run: exit sign, framed board, cigarette machine
    [14.65, 0,     18.45, 2.7],    // the two archway thresholds, next room's floor beyond
    [15.85, 0,     17.3,  4.7],    // upper pier between the archways, with its footing
    [18.45, 0,     24.3,  3.45],   // wall run right: drinks poster, shallower than the left half

    // ---- the DJ corner ----
    // The booth is painted on a 45 degree angle, so it gets stepped
    // rects that walk down the diagonal rather than one giant block.
    [24.3,  0,     25.6,  5.25],   // left speaker on its tripod stand
    [25.6,  0,     26.7,  5.95],   // booth counter, first step of the diagonal
    [26.7,  0,     27.8,  6.7],    // booth counter, second step
    [27.8,  0,     28.9,  7.35],   // booth counter, third step, turntable two
    [28.9,  0,     31.3,  7.5],    // booth right end: effects rack, laptop, right speaker
    [30.3,  7.5,   31.3,  8.15],   // right speaker's tripod feet, poking out below

    // ---- room shell ----
    [31.3,  0,     32,    18],     // right wall and its LED strip
    [0,     8.6,   0.8,   18],     // left wall below the bar, LED strip included

    // ---- left seating flank, an L of banquette with three tables ----
    [0.8,   9.6,   2.6,   15.8],   // bench arm down the left wall
    [0.8,   15.7,  8.4,   17.45],  // bench arm along the bottom, ends short of the entrance
    [3.2,   9.85,  4.95,  11.6],   // round table 1, candle jar and pedestal
    [3.2,   11.95, 4.95,  13.75],  // round table 2
    [3.2,   13.9,  4.95,  15.55],  // round table 3

    // ---- right seating flank, the mirror of the left ----
    [29.3,  9.65,  31.3,  15.6],   // bench arm down the right wall
    [23.4,  15.6,  31.3,  17.45],  // bench arm along the bottom right
    [27.05, 9.85,  28.8,  11.6],   // round table 1
    [27.05, 11.95, 28.8,  13.75],  // round table 2
    [27.05, 13.9,  28.8,  15.55],  // round table 3

    // ---- lower pier ----
    [15.9,  13.3,  17.45, 18],     // rises from the front wall, splits the entrance floor

    // ---- outer edge, so nobody walks off the picture ----
    // Also seals the white off-picture strip outside the street door.
    [0,     17.4,  32,    18],
  ],

  // On the rubber entrance mat, just in from the street door,
  // with the lower pier for cover immediately to the right.
  playerSpawn: [12.0, 16.2],

  // Three ways in. Four each at the two archways from the main room,
  // where the noise is coming from, and two behind you at the street
  // door, because this room does not fight fair.
  //
  // These are held clear of every solid by more than half the width of
  // the widest enemy (the brute), 1.2 units or better, checked point by
  // point. If G.CHAR_H or charScale goes up, check them again.
  enemySpawns: [
    [13.9, 5.6], [13.2, 6.4], [15.1, 6.2], [14.6, 7.0],   // left archway
    [17.9, 5.9], [19.2, 5.2], [18.6, 6.9], [19.9, 6.3],   // right archway
    [10.6, 15.0], [13.6, 15.0],                            // street door, behind the player
  ],

  // Way out, through either archway in the back wall towards the main
  // room. One band across both doorway mouths; the upper pier's solid
  // sits over the middle of it, so only the two openings and the
  // threshold strip in front actually trigger. Locked until the room
  // is clear.
  exit: [14.65, 2.6, 18.45, 4.45],
};
