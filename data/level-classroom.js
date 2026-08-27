// ============================================================
// NUA CLASSROOM. Chapter 2, Area 2.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 33 units wide by 18 units tall, and one unit is 48 world px,
// so the finished room is 1584 x 864 px (about 1.65 screens
// wide and 1.6 screens tall).
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/NUA Classroom/NUA Classroom Level Design.jpg",
// imagine it cut into 33 columns and 18 rows, and read off the
// column and row.
//
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTE: the school chairs are deliberately NOT solid, the
// same call as Gonzo's. They sit tucked around every table and you
// walk straight over them, which keeps thirty chairs of clutter on
// screen without thirty hitboxes on the floor. Only the tables,
// the boards, the fixed kit and the walls block you. The two
// display boards stand at an angle in the art, so the fashion
// board is covered by two stepped rectangles rather than one box.
// ============================================================

const CLASSROOM_PLATE = {
  sprite: "plate-classroom",
  cols: 33,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> room is 1584 x 864

  // Everyone stands 20% taller in here than the game's default.
  // Judged against the art: the storage room door is about 2.2 units
  // wide and a chair seat about 1.1, and at 1.2 a person (86px) is
  // one seat wide and two thirds of that doorway, which is how the
  // same furniture reads in Gonzo's at 1.3. This room is painted a
  // touch smaller than Gonzo's, so it gets a touch less.
  charScale: 1.2,

  solid: [
    // ---- sealed storage room, top left (see it, never reach it) ----
    // The racking with the paint tins, clock and globe, plus the shut
    // grey door in the wall face below it. One block seals the lot.
    [0,     0,     6.5,   8.65],

    // ---- main room shell ----
    [6.5,   0,     31.6,  5.0],    // top wall: brick piers and all three windows
    [31.6,  0,     33,    18],     // right wall, no door in it (see exit note)
    [0,     0,     0.95,  18],     // left wall, top to bottom

    // ---- bottom wall, split around the only doorway ----
    [0,     17.0,  2.45,  18],     // left of the doorway
    [4.45,  17.0,  33,    18],     // right of the doorway

    // ---- outer edge, so nobody walks off the picture ----
    [2.3,   17.75, 4.6,   18],     // thin seal across the open doorway mouth

    // ---- left wall furniture ----
    [0.7,   8.65,  2.2,   10.1],   // easel boards and paper roll, poking past the storage wall
    [0.6,   11.8,  1.65,  15.6],   // radiator and its pipe

    // ---- the two free standing display boards ----
    [7.55,  4.95,  10.2,  9.15],   // fashion board, its lower left half
    [10.2,  4.5,   12.7,  8.65],   // fashion board, its higher right half
    [20.0,  3.3,   22.0,  9.6],    // film studies board, near vertical

    // ---- fixed kit along the top right ----
    [24.9,  3.9,   27.1,  5.5],    // wooden chest
    [27.1,  3.3,   30.8,  5.4],    // sink and wash counter
    [30.5,  5.5,   31.6,  8.2],    // stacked spare chairs against the right wall
    [30.5,  8.6,   31.7,  9.9],    // metal bin

    // ---- the five work tables ----
    // Table tops only. Tucked chairs and the thin black legs stay
    // walkable. The bottom left and bottom middle tables are shaved
    // by a few world px so the gap between them holds at 2.4 units
    // for the brute; sprites clip those painted ends by a whisker.
    [14.0,  7.6,   19.0,  9.7],    // table, top middle, under the arched window
    [23.1,  6.7,   28.0,  8.9],    // table, top right
    [7.4,   12.05, 12.4,  14.5],   // table, bottom left
    [14.8,  12.55, 18.4,  14.55],  // table, bottom middle, the small one
    [21.55, 12.05, 26.65, 14.5],   // table, bottom right
  ],

  // Just inside the bottom left doorway, on open floor, with a clear
  // run up the left side of the room.
  playerSpawn: [3.4, 15.8],

  // The art gives this room exactly one doorway, the one the player
  // arrives by, so the waves read as already in the building.
  // Left four: burst out of the storage room door.
  // Right four: from the far end of the studio, by the sink corner.
  //
  // These are held clear of the walls by more than half the width of
  // the widest enemy (the brute), so nothing ever arrives inside the
  // scenery. If G.CHAR_H goes up, check them again.
  enemySpawns: [
    [3.6, 10.2], [4.6, 10.6], [5.7, 10.2], [3.0, 11.3],
    [29.0, 10.8], [29.9, 11.6], [28.6, 12.6], [30.2, 13.4],
  ],

  // Way out is the way you came in, bottom left. The floor plan asked
  // for a second door in the right wall but the plate never painted
  // one, so the exit sits flush in the only doorway and unlocks when
  // the room is clear. If a v2 plate adds that right hand door, move
  // this to sit flush against it instead.
  exit: [2.5, 17.25, 4.35, 17.75],
};
