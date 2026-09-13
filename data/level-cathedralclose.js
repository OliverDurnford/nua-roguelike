// ============================================================
// OUTSIDE THE CATHEDRAL: Chapter 3, Area 4.
//
// A plate area, like Gonzo's: one painted top-down background
// (core/plates-real.js) with a hand-measured collision layer on
// top of it. This one is QUIET, so there is nothing to fight.
// You come in under the gatehouse at the bottom, cross the close
// to pick up the friend on the bench, and go in through the
// cathedral's west door.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 32 units wide by 18 units tall, and one unit is 48 world px,
// so the close is 1536 x 864 px.
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Cathedral Close/Cathedral Close - game plate.jpg",
// imagine it cut into 32 columns and 18 rows, and read off the
// column and row.
//
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTE: the chain posts down both sides of the path and the
// chain fence above the paved band are deliberately NOT solid. They
// are a few pixels wide and catching on them would feel broken. The
// flat ledger stones lying in the grass are walked over for the same
// reason; only the standing gravestones block you.
// ============================================================

const CATHEDRALCLOSE_PLATE = {
  sprite: "plate-cathedralclose",
  cols: 32,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> close is 1536 x 864

  // A shade taller than the game's default, to sit right against
  // buildings painted at this scale. Multiplies G.CHAR_H, so a
  // person is 79px out here.
  charScale: 1.1,

  solid: [
    // ---- the built edge across the top (all of it sealed) ----
    // One band from the top of the picture down to where each
    // building meets the grass, broken only at the west door.
    [0,     0,     7.71,  5.4],    // left close house: roof, front wall, roses
    [7.71,  0,     10.2,  5.3],    // low flint wall and the churchyard behind it
    [10.2,  0,     11.6,  6.5],    // cathedral: north west tower and its plinth
    [11.6,  0,     13.35, 6.2],    // cathedral: west front, left bay
    [13.35, 0,     14.1,  6.5],    // cathedral: buttress left of the porch
    [14.1,  0,     15.4,  6.28],   // cathedral: porch jamb, left of the door
    //                                the west door itself is the gap here
    [16.9,  0,     18.2,  6.28],   // cathedral: porch jamb, right of the door
    [18.2,  0,     18.95, 6.5],    // cathedral: buttress right of the porch
    [18.95, 0,     20.7,  6.2],    // cathedral: west front, right bay
    [20.7,  0,     22.1,  6.5],    // cathedral: north east tower and its plinth
    [22.1,  0,     24.45, 5.3],    // low flint wall with the wooden gate in it
    [24.45, 0,     32,    5.4],    // right close house: roof, front wall, roses

    // ---- gravestones on the two grass banks ----
    [0.64,  5.94,  1.65,  7.9],    // headstone with its tomb slab, far left
    [1.98,  5.8,   2.97,  6.88],   // headstone, left
    [8.2,   5.75,  9.0,   6.7],    // headstone under the left flint wall
    [25.19, 5.86,  25.9,  6.84],   // headstone with the carved cross, right
    [29.44, 5.94,  30.29, 6.84],   // headstone, far right

    // ---- the two lime trees ----
    // Three stacked bands each, so the round canopy does not catch
    // you on a square corner. The trunk gets its own block.
    [3.95,  7.07,  7.3,   8.2],    // left lime: top of the canopy
    [3.23,  8.2,   7.99,  10.35],  // left lime: widest part of the canopy
    [3.95,  10.35, 7.3,   11.43],  // left lime: foot of the canopy
    [5.1,   11.43, 6.28,  12.05],  // left lime: trunk
    [25.6,  7.46,  28.9,  8.6],    // right lime: top of the canopy
    [24.9,  8.6,   29.59, 10.7],   // right lime: widest part of the canopy
    [25.6,  10.7,  28.9,  11.83],  // right lime: foot of the canopy
    [26.67, 11.83, 27.92, 12.35],  // right lime: trunk

    // ---- close furniture ----
    [12.84, 6.58,  14.19, 7.6],    // notice board, left of the path
    [9.61,  12.59, 12.18, 13.76],  // left bench (the friend is sat here)
    [19.85, 12.59, 22.4,  13.75],  // right bench
    [17.96, 14.37, 18.65, 15.49],  // litter bin against the gatehouse

    // ---- the close wall across the bottom, and its paving ----
    // The band runs the full width and is broken only by the
    // gatehouse passage, which is the way in and out.
    [0,     13.95, 14.1,  15.05],  // paved walk in front of the wall, left
    [17.9,  13.95, 32,    15.05],  // paved walk in front of the wall, right
    [14.1,  12.85, 15.2,  18],     // gatehouse: west half, down to the frame
    [16.9,  12.85, 17.9,  18],     // gatehouse: east half, down to the frame
    [0,     16.1,  14.1,  18],     // outer flint wall and verge, left
    [17.9,  16.1,  32,    18],     // outer flint wall and verge, right

    // ---- outer edge, so nobody walks off the picture ----
    [0,     0,     0.4,   18],
    [31.6,  0,     32,    18],
  ],

  // On the paving inside the gate arch, where you arrive from the
  // street. Dead centre of the passage.
  playerSpawn: [16.05, 17.05],

  // The friend waiting here (quiet area): sat on the grass at the
  // left hand end of the left bench, a third of the way up the lawn.
  companionSpawn: [8.8, 12.95],

  // Nothing ever spawns here, but the schema wants points. All five
  // are open lawn, clear of the trees, the benches and the path
  // furniture by more than half the width of the widest enemy.
  enemySpawns: [
    [10.5, 8.6], [21.5, 8.6], [9.8, 11.8], [22.2, 11.8], [16.1, 10.5],
  ],

  // The west door, standing open. A thin threshold across the mouth
  // of the porch: the next area is inside the cathedral. Locked until
  // the friend has been collected.
  exit: [15.4, 5.8, 16.9, 6.25],
};
