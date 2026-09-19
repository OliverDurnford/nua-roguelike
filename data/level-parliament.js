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
// things: one entry per painted thing (footprint and outline); see below.
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

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "palace front and railings", foot: [0, 0, 25.12, 3.12] },
    { name: "base of the clock tower, standing in its own paving", foot: [26.7, 0, 29.6, 3.15] },
    { name: "court building, forecourt and the whole row of trees", foot: [0, 5, 4.32, 15] },
    { name: "statue 1, top of the rim, hands folded", foot: [8.22, 6.2, 9.23, 7.35], over: [[8.52, 4.65], [8.92, 4.65], [9.07, 5.15], [9.04, 6.2], [8.4, 6.2], [8.37, 5.15]] },
    { name: "statue 2, left rim, the hunched one", foot: [6.8, 9.64, 7.79, 10.77], over: [[6.65, 8.5], [7, 8.35], [7.55, 8.7], [7.65, 9.64], [7.1, 9.64], [6.5, 9.5], [6.45, 9.1]] },
    { name: "statue 3, bottom left, arms flung out", foot: [7.82, 12.72, 9.15, 13.76], over: [[8.3, 11.4], [8.65, 11.6], [9, 11.75], [8.95, 12.1], [8.5, 12.72], [7.95, 12.72], [7.15, 12.05], [6.75, 11.85], [6.95, 11.55], [7.55, 11.55]] },
    { name: "statue 4, top right, the one waving", foot: [22.1, 6.18, 23.1, 7.32], over: [[21.5, 4.5], [21.75, 4.65], [22.3, 4.9], [22.95, 4.85], [23, 5.3], [22.92, 6.18], [22.28, 6.18], [22.1, 5.5], [21.75, 5]] },
    { name: "statue 5, right rim", foot: [24.17, 9.66, 25.1, 10.75], over: [[25.25, 8.5], [24.9, 8.35], [24.35, 8.7], [24.25, 9.66], [24.8, 9.66], [25.4, 9.5], [25.45, 9.1]] },
    { name: "statue 6, bottom right, painted with no plinth: the skirt of its coat and its boots", foot: [21.68, 12.9, 22.28, 13.48], over: [[21.85, 12], [22.12, 12], [22.25, 12.35], [22.22, 12.9], [21.75, 12.9], [21.72, 12.35]] },
    { name: "lamp, top left corner of the rim", foot: [7.21, 8.05, 7.59, 8.33], over: [[7.28, 6.55], [7.52, 6.55], [7.56, 6.85], [7.47, 7], [7.47, 8.05], [7.33, 8.05], [7.33, 7], [7.24, 6.85]] },
    { name: "lamp, bottom left corner", foot: [7.18, 13.21, 7.55, 13.48], over: [[7.25, 11.35], [7.49, 11.35], [7.53, 11.65], [7.44, 11.8], [7.44, 13.21], [7.3, 13.21], [7.3, 11.8], [7.21, 11.65]] },
    { name: "lamp, top right corner", foot: [24.2, 8.06, 24.6, 8.33], over: [[24.28, 6.56], [24.52, 6.56], [24.56, 6.86], [24.47, 7], [24.47, 8.06], [24.33, 8.06], [24.33, 7], [24.24, 6.86]] },
    { name: "lamp, bottom right corner", foot: [24.18, 13.2, 24.56, 13.49], over: [[24.25, 11.35], [24.49, 11.35], [24.53, 11.65], [24.44, 11.8], [24.44, 13.2], [24.3, 13.2], [24.3, 11.8], [24.21, 11.65]] },
    { name: "abbey flank, west of the door", foot: [0, 15, 15.3, 18] },
    { name: "abbey flank, east of the door", foot: [16.7, 15, 32, 18] },
    { name: "paving in front of the tower", foot: [25.12, 0, 32, 0.45] },
    { name: "the west end of the Westminster road", foot: [0, 3.05, 0.4, 5] },
    { name: "the paving and ring road down the east side", foot: [31.6, 0.45, 32, 15] },
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
