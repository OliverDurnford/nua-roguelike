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
    { name: "court building, forecourt and the whole row of trees", foot: [0, 5, 2.8, 15] },
    { name: "court forecourt and trees, east of the crossing", foot: [2.8, 5.4, 4.32, 15] },
    { name: "statue 1, top of the rim, hands folded", foot: [8.22, 6.2, 9.23, 7.35], over: [[8.66, 4.93], [8.82, 4.97], [8.9, 5.12], [8.98, 5.35], [9.15, 5.46], [9.19, 5.62], [9.15, 5.85], [9.08, 5.97], [9.09, 6.1], [9.2, 6.2], [9.2, 7.3], [9.12, 7.36], [8.28, 7.36], [8.2, 7.3], [8.2, 6.2], [8.33, 6.1], [8.42, 5.97], [8.33, 5.85], [8.3, 5.5], [8.4, 5.4], [8.5, 5.15], [8.55, 4.97]] },
    { name: "statue 2, left rim, the hunched one", foot: [6.8, 9.95, 7.79, 10.77], over: [[7.04, 8.42], [7.42, 8.52], [7.65, 8.75], [7.66, 9.3], [7.62, 9.78], [7.85, 9.98], [7.87, 10.8], [6.86, 10.8], [6.78, 10.72], [6.8, 10.06], [6.84, 9.7], [6.73, 8.88]] },
    { name: "statue 3, bottom left, arms flung out", foot: [7.82, 12.72, 9.15, 13.76], over: [[8.43, 11.48], [8.57, 11.55], [8.6, 11.69], [8.85, 11.68], [9.02, 11.55], [9.12, 11.44], [9.2, 11.41], [9.29, 11.45], [9.3, 11.54], [9.2, 11.58], [9.02, 11.72], [8.85, 11.87], [8.76, 11.99], [8.79, 12.24], [8.81, 12.53], [8.85, 12.78], [9.12, 12.8], [9.15, 13.7], [9.07, 13.76], [7.9, 13.76], [7.83, 13.7], [7.85, 12.8], [8.1, 12.8], [8.2, 12.58], [8.22, 12.26], [8.27, 12.03], [8.08, 11.87], [7.89, 11.68], [7.75, 11.58], [7.68, 11.49], [7.73, 11.43], [7.8, 11.42], [7.86, 11.49], [8.06, 11.64], [8.27, 11.72], [8.31, 11.6], [8.35, 11.51]] },
    { name: "statue 4, top right, the one waving", foot: [22.1, 6.5, 23.1, 7.32], over: [[22.13, 4.74], [22.26, 4.82], [22.26, 4.95], [22.4, 4.86], [22.55, 4.79], [22.68, 4.82], [22.72, 4.95], [22.81, 5.16], [22.92, 5.26], [22.96, 5.52], [22.89, 5.78], [22.86, 5.99], [22.99, 6.2], [22.99, 6.62], [23.1, 6.65], [23.1, 7.3], [22.11, 7.3], [22.11, 6.65], [22.24, 6.62], [22.24, 6.2], [22.32, 6.02], [22.29, 5.86], [22.34, 5.65], [22.34, 5.4], [22.3, 5.28], [22.1, 5.12], [22.05, 4.98], [22.07, 4.85]] },
    { name: "statue 5, right rim", foot: [24.17, 9.95, 25.1, 10.75], over: [[24.5, 8.33], [24.68, 8.34], [24.77, 8.45], [24.94, 8.6], [25, 8.77], [25.02, 9.12], [24.94, 9.19], [24.94, 9.6], [25.08, 9.73], [25.08, 10.06], [25.15, 10.1], [25.17, 10.6], [25.08, 10.81], [24.35, 10.81], [24.12, 10.75], [24.12, 10.1], [24.19, 10.06], [24.19, 9.71], [24.35, 9.62], [24.31, 9.21], [24.19, 9.08], [24.19, 8.88], [24.25, 8.62], [24.38, 8.5], [24.44, 8.4]] },
    { name: "statue 6, bottom right, painted with no plinth: the skirt of its coat and its boots", foot: [21.68, 12.9, 22.28, 13.48], over: [[22.01, 11.95], [22.1, 11.97], [22.18, 12.06], [22.2, 12.22], [22.22, 12.5], [22.27, 12.62], [22.26, 12.85], [22.2, 12.98], [22.2, 13.2], [22.23, 13.27], [22.22, 13.35], [22.1, 13.37], [22.05, 13.35], [21.98, 13.37], [21.97, 13.47], [21.87, 13.48], [21.78, 13.39], [21.78, 13.27], [21.72, 13.2], [21.68, 12.98], [21.64, 12.85], [21.66, 12.62], [21.72, 12.43], [21.87, 12.31], [21.83, 12.18], [21.85, 12.06]] },
    { name: "lamp, top left corner of the rim", foot: [7.21, 8.05, 7.59, 8.33], over: [[7.4, 6.2], [7.45, 6.24], [7.46, 6.32], [7.52, 6.36], [7.56, 6.41], [7.61, 6.46], [7.59, 6.52], [7.54, 6.55], [7.53, 6.66], [7.52, 6.78], [7.5, 6.85], [7.46, 6.88], [7.46, 6.99], [7.46, 7.63], [7.5, 7.66], [7.51, 7.77], [7.54, 7.84], [7.53, 8.03], [7.58, 8.1], [7.58, 8.22], [7.53, 8.29], [7.28, 8.29], [7.22, 8.22], [7.22, 8.11], [7.28, 8.05], [7.28, 7.82], [7.31, 7.77], [7.32, 7.68], [7.34, 7.63], [7.34, 6.99], [7.33, 6.88], [7.26, 6.85], [7.25, 6.76], [7.26, 6.66], [7.25, 6.55], [7.2, 6.51], [7.2, 6.45], [7.26, 6.41], [7.33, 6.36], [7.35, 6.32], [7.36, 6.24]] },
    { name: "lamp, bottom left corner", foot: [7.18, 13.21, 7.55, 13.48], over: [[7.37, 11.35], [7.42, 11.39], [7.43, 11.47], [7.49, 11.51], [7.53, 11.56], [7.58, 11.61], [7.56, 11.67], [7.51, 11.7], [7.5, 11.81], [7.49, 11.93], [7.47, 12], [7.43, 12.03], [7.43, 12.14], [7.43, 12.78], [7.47, 12.81], [7.48, 12.92], [7.51, 12.99], [7.5, 13.18], [7.55, 13.25], [7.55, 13.37], [7.5, 13.44], [7.25, 13.44], [7.19, 13.37], [7.19, 13.26], [7.25, 13.2], [7.25, 12.97], [7.28, 12.92], [7.29, 12.83], [7.31, 12.78], [7.31, 12.14], [7.3, 12.03], [7.23, 12], [7.22, 11.91], [7.23, 11.81], [7.22, 11.7], [7.17, 11.66], [7.17, 11.6], [7.23, 11.56], [7.3, 11.51], [7.32, 11.47], [7.33, 11.39]] },
    { name: "lamp, top right corner", foot: [24.2, 8.06, 24.6, 8.33], over: [[24.39, 6.2], [24.44, 6.24], [24.45, 6.32], [24.51, 6.36], [24.55, 6.41], [24.6, 6.46], [24.58, 6.52], [24.53, 6.55], [24.52, 6.66], [24.51, 6.78], [24.49, 6.85], [24.45, 6.88], [24.45, 6.99], [24.45, 7.63], [24.49, 7.66], [24.5, 7.77], [24.53, 7.84], [24.52, 8.03], [24.57, 8.1], [24.57, 8.22], [24.52, 8.29], [24.27, 8.29], [24.21, 8.22], [24.21, 8.11], [24.27, 8.05], [24.27, 7.82], [24.3, 7.77], [24.31, 7.68], [24.33, 7.63], [24.33, 6.99], [24.32, 6.88], [24.25, 6.85], [24.24, 6.76], [24.25, 6.66], [24.24, 6.55], [24.19, 6.51], [24.19, 6.45], [24.25, 6.41], [24.32, 6.36], [24.34, 6.32], [24.35, 6.24]] },
    { name: "lamp, bottom right corner", foot: [24.18, 13.2, 24.56, 13.49], over: [[24.37, 11.35], [24.42, 11.39], [24.43, 11.47], [24.49, 11.51], [24.53, 11.56], [24.58, 11.61], [24.56, 11.67], [24.51, 11.7], [24.5, 11.81], [24.49, 11.93], [24.47, 12], [24.43, 12.03], [24.43, 12.14], [24.43, 12.78], [24.47, 12.81], [24.48, 12.92], [24.51, 12.99], [24.5, 13.18], [24.55, 13.25], [24.55, 13.37], [24.5, 13.44], [24.25, 13.44], [24.19, 13.37], [24.19, 13.26], [24.25, 13.2], [24.25, 12.97], [24.28, 12.92], [24.29, 12.83], [24.31, 12.78], [24.31, 12.14], [24.3, 12.03], [24.23, 12], [24.22, 11.91], [24.23, 11.81], [24.22, 11.7], [24.17, 11.66], [24.17, 11.6], [24.23, 11.56], [24.3, 11.51], [24.32, 11.47], [24.33, 11.39]] },
    { name: "abbey flank, west of the door", foot: [0, 15, 15.3, 18] },
    { name: "abbey flank, east of the door", foot: [16.7, 15, 32, 18] },
    { name: "paving in front of the tower", foot: [25.12, 0, 32, 0.45] },
    { name: "the west end of the Westminster road", foot: [0, 3.05, 0.4, 5] },
    { name: "the paving and ring road down the east side", foot: [31.6, 0.45, 32, 15] },
    { name: "abbey door arch, walk under", over: [[15.03, 18], [15.03, 16.4], [15.08, 16.05], [15.18, 15.84], [15.4, 15.55], [15.65, 15.3], [15.85, 15.17], [16, 15.13], [16.15, 15.17], [16.35, 15.3], [16.6, 15.55], [16.82, 15.84], [16.92, 16.05], [16.97, 16.4], [16.97, 18], [16.6, 18], [16.6, 16.3], [16.55, 16], [16.47, 15.84], [16.31, 15.63], [16.15, 15.5], [16, 15.45], [15.85, 15.5], [15.7, 15.63], [15.53, 15.84], [15.45, 16], [15.43, 16.3], [15.43, 18]], base: 18 },
    { name: "abbey spire, left of the door", over: [[14.32, 15], [14.37, 14.74], [14.46, 14.39], [14.54, 14.04], [14.6, 13.69], [14.65, 13.69], [14.69, 14.04], [14.78, 14.39], [14.85, 14.74], [14.92, 15]], base: 15 },
    { name: "abbey spire, right of the door", over: [[17.68, 15], [17.63, 14.74], [17.54, 14.39], [17.46, 14.04], [17.4, 13.69], [17.35, 13.69], [17.31, 14.04], [17.22, 14.39], [17.15, 14.74], [17.08, 15]], base: 15 },
    { name: "abbey door gable", over: [[16, 14.04], [16.35, 14.39], [16.59, 14.74], [16.73, 15], [15.27, 15], [15.41, 14.74], [15.65, 14.39]], base: 15 },
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
