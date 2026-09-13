// ============================================================
// PARLIAMENT SQUARE: Chapter 4, Area 5. The chapter 4 boss arena.
// Boss: COVID, out on the open lawn.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 32 units wide by 18 units tall, and one unit is 48 world px,
// so the finished square is 1536 x 864 px (about 1.6 screens wide
// and 1.6 screens tall).
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Parliament Square/Parliament Square - game
// plate.jpg", imagine it cut into 32 columns and 18 rows, and read
// off the column and row.
//
// solid: [x1, y1, x2, y2] is a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTE: this is a boss arena, so it is deliberately almost
// empty. Four buildings box the square in, and inside that ring the
// only things you can bump into are the six statues and the four
// lamp posts. Every surface is walkable: the ring road, both zebra
// crossings, the paved rim and the lawn itself. The police tape
// across the two corners, the dropped placard, the paper and the
// litter are painted on and NOT solid; you walk straight over them.
// Covid is 2.5 units across, too wide for the rim on its own, but
// the lawn and the roads are one open floor so it can always come
// round at you.
// ============================================================

const PARLIAMENT_PLATE = {
  sprite: "plate-parliament",
  cols: 32,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> square is 1536 x 864

  // A shade taller than the game's default. The square is painted at
  // street scale: the lamp posts read about two people high and the
  // statues a little over life size, which puts a person at about 76px
  // on this pavement.
  charScale: 1.05,

  solid: [
    // ---- the Palace of Westminster, right across the top ----
    // One band: the whole front plus the black railings along its foot.
    // The pavement below the railings is open, and so is the road.
    [0,     0,     25.12, 3.12],   // palace front and railings

    // ---- the clock tower ----
    [26.7,  0,     29.6,  3.15],   // base of the tower, standing in its own paving

    // ---- the court building and its trees, down the left ----
    // One band. The plane trees are counted in: the pavement strip
    // between the building wall and the trunks is half a unit wide,
    // too thin to be honest floor.
    [0,     5.0,   4.32,  15.0],   // court building, forecourt and the whole row of trees

    // ---- the six bronze statues, each with its plinth ----
    [8.22,  6.2,   9.23,  7.35],   // statue 1, top of the rim, hands folded
    [6.8,   9.64,  7.79,  10.77],  // statue 2, left rim, the hunched one
    [7.82,  12.72, 9.15,  13.76],  // statue 3, bottom left, arms flung out
    [22.1,  6.18,  23.1,  7.32],   // statue 4, top right, the one waving
    [24.17, 9.66,  25.1,  10.75],  // statue 5, right rim
    [21.68, 12.9,  22.28, 13.48],  // statue 6, bottom right: painted with no plinth,
                                   // so this is the skirt of its coat and its boots

    // ---- lamp posts: only the foot blocks, the column is drawn leaning in ----
    [7.21,  8.05,  7.59,  8.33],   // lamp, top left corner of the rim
    [7.18,  13.21, 7.55,  13.48],  // lamp, bottom left corner
    [24.2,  8.06,  24.6,  8.33],   // lamp, top right corner
    [24.18, 13.2,  24.56, 13.49],  // lamp, bottom right corner

    // ---- the Abbey along the bottom, broken only by its doorway ----
    // The gap is the arched west door, dead centre. It is 1.4 units
    // wide: roomy for the player, far too tight for Covid, which is
    // the point of standing in it.
    [0,     15.0,  15.3,  18],     // abbey flank, west of the door
    [16.7,  15.0,  32,    18],     // abbey flank, east of the door

    // ---- outer edge, so nobody walks off the picture ----
    // Only the three strips the buildings do not already seal.
    [25.12, 0,     32,    0.45],   // paving in front of the tower
    [0,     3.05,  0.4,   5.0],    // the west end of the Westminster road
    [31.6,  0.45,  32,    15.0],   // the paving and ring road down the east side
  ],

  // Standing in the Abbey doorway, just inside the arch, looking north
  // across the square at the boss. Held at 15.55 rather than deeper in
  // the porch so Covid can still reach the threshold: it cannot follow
  // you into the doorway, but it can get close enough to make standing
  // there a bad habit.
  playerSpawn: [16.0, 15.55],

  // On the lawn, centred across it (the grass runs 8.06 to 23.90) and
  // up towards the Palace end, so the whole square is between you and
  // it when the fight starts.
  bossSpawn: [16.0, 9.2],

  // Eight points round the outside of the fight: the top of the paved
  // rim, its four corners and the ring road down both sides. Every
  // one is clear of the statues and lamps by more than half the brute's
  // box, and the nearest is 6.1 units from the Abbey door, so nothing
  // ever arrives on top of you. If charScale goes up, check them again.
  enemySpawns: [
    [11.0,  6.6],  [20.0, 6.6],    // the top rim, either side of the middle
    [7.0,   6.4],  [24.7, 6.4],    // the rim's top two corners
    [5.6,   9.8],  [26.3, 9.8],    // the ring road, west and east
    [10.2, 13.6],  [23.3, 13.6],   // the bottom rim, in the gaps between the statues
  ],

  // Way back out: the Abbey door itself, across the foot of the
  // doorway so it reads as a threshold. Boss arenas never unlock it in
  // play; it is here so the schema stays uniform, and the finale
  // chapter starts on the other side of it.
  exit: [15.4, 17.0, 16.6, 17.45],
};
