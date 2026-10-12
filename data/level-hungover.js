// ============================================================
// THE HUNGOVER WALK: Chapter 2, Area 4. The quiet area.
//
// Plate area: painted background (core/plates-real.js) with a
// hand-measured collision layer. The street runs along the foot
// of the castle mound: keep and mound at the top (sealed), the
// flint wall and railings, then the pavement and the road, both
// walkable. You come in from the left and leave off the right.
// The friend is found next to the sick on the pavement.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/Hungover Walk/Hungover Walk - game
// plate.jpg" cut into 32 columns and 18 rows. Unit 0,0 is the
// top left corner. Press F2 in game to see the blocks.
// ============================================================

const HUNGOVER_PLATE = {
  sprite: "plate-hungover",
  cols: 32,
  rows: 18,
  unit: 48,

  // A wide open street: people stand 79px, a touch under Gonzo's.
  charScale: 1.1,

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "castle keep", foot: [11.8, 0, 21, 6.55] },
    { name: "fence left run", foot: [0, 8.85, 18.15, 10.55], over: [[0, 8.4], [17.85, 8.4], [17.85, 8.05], [18, 8.05], [18, 9.15], [0, 9.15]], see: true },
    { name: "fence left run brick", over: [[0, 9.15], [17.85, 9.15], [17.85, 8.9], [18.17, 8.9], [18.17, 10.55], [0, 10.55]] },
    { name: "fence right run", foot: [21.03, 8.85, 32, 10.55], over: [[21.4, 8.4], [32, 8.4], [32, 9.15], [21.03, 9.15], [21.03, 8.9], [21.4, 8.9]], see: true },
    { name: "fence right run brick", over: [[21.03, 9.15], [32, 9.15], [32, 10.55], [21.03, 10.55]] },
    { name: "lamp post", foot: [5.5, 12.3, 6, 12.8], over: [[5.73, 8.92], [5.61, 8.99], [5.5, 9.12], [5.48, 9.25], [5.47, 9.41], [5.52, 9.76], [5.68, 9.82], [5.67, 10.08], [5.35, 10.1], [5.35, 10.19], [5.67, 10.21], [5.67, 11.73], [5.56, 11.84], [5.56, 12.45], [5.49, 12.56], [5.49, 12.71], [5.57, 12.77], [5.96, 12.77], [5.99, 12.71], [5.99, 12.56], [5.92, 12.45], [5.92, 11.84], [5.82, 11.73], [5.82, 10.21], [6.12, 10.19], [6.12, 10.1], [5.82, 10.08], [5.82, 9.82], [5.99, 9.76], [6.02, 9.41], [6.02, 9.25], [5.98, 9.12], [5.86, 8.99], [5.78, 8.92]] },
    { name: "bollard, left", foot: [12.15, 12.4, 12.6, 12.8], over: [[12.3, 11.8], [12.46, 11.8], [12.55, 11.9], [12.57, 12.2], [12.56, 12.45], [12.6, 12.55], [12.61, 12.75], [12.57, 12.8], [12.2, 12.8], [12.16, 12.75], [12.17, 12.55], [12.21, 12.45], [12.2, 12.2], [12.21, 11.9]] },
    { name: "bollard, right", foot: [13.4, 12.4, 13.9, 12.8], over: [[13.57, 11.8], [13.73, 11.8], [13.82, 11.9], [13.84, 12.2], [13.83, 12.45], [13.87, 12.55], [13.88, 12.75], [13.84, 12.8], [13.47, 12.8], [13.43, 12.75], [13.44, 12.55], [13.48, 12.45], [13.47, 12.2], [13.48, 11.9]] },
    { name: "overflowing bin", foot: [17.55, 12.35, 18.35, 12.8], over: [[17.69, 11.6], [18.12, 11.6], [18.17, 11.67], [18.27, 11.67], [18.35, 11.77], [18.35, 12.12], [18.31, 12.15], [18.31, 12.23], [18.27, 12.25], [18.27, 12.67], [18.25, 12.77], [18.17, 12.85], [17.6, 12.85], [17.52, 12.79], [17.56, 12.25], [17.5, 12.21], [17.48, 11.73], [17.54, 11.67], [17.6, 11.71], [17.6, 11.67]] },
    { name: "bus shelter roof", over: [[25, 9.3], [28.1, 9.3], [28.1, 9.95], [25, 9.95]], base: 11.8 },
    { name: "bus shelter left post", foot: [25.03, 11.4, 25.25, 11.8], over: [[25.03, 10], [25.25, 10], [25.25, 11.8], [25.03, 11.8]] },
    { name: "bus shelter right post", foot: [27.9, 11.4, 28.1, 11.8], over: [[27.9, 10], [28.1, 10], [28.1, 11.8], [27.9, 11.8]] },
    { name: "traffic cone", foot: [7.15, 13.8, 7.8, 14.08], over: [[7.45, 13.27], [7.38, 13.31], [7.3, 13.55], [7.27, 13.65], [7.22, 13.73], [7.16, 13.76], [7.14, 13.99], [7.19, 14.07], [7.74, 14.07], [7.79, 13.99], [7.78, 13.76], [7.69, 13.73], [7.64, 13.65], [7.61, 13.55], [7.54, 13.31], [7.5, 13.27]] },
    { name: "red hatchback", foot: [1.95, 16.75, 5.1, 17.6], over: [[2.98, 15.54], [3.1, 15.62], [3.25, 15.56], [4.62, 15.56], [4.88, 15.67], [5.1, 15.88], [5.23, 16.23], [5.23, 17.15], [5.17, 17.62], [5.04, 17.75], [2.12, 17.75], [1.96, 17.6], [1.98, 17.4], [1.88, 17.08], [1.92, 16.17], [2.12, 15.92], [2.29, 15.83], [2.85, 15.75], [2.9, 15.6]] },
    { name: "white van", foot: [21.15, 16.7, 25.65, 17.6], over: [[22.37, 15.22], [25.36, 15.23], [25.51, 15.43], [25.63, 15.98], [25.63, 17.09], [25.6, 17.4], [25.5, 17.59], [21.3, 17.59], [21.16, 17.47], [21.14, 17.09], [21.14, 16.43], [21.18, 16.08], [21.37, 15.84], [21.78, 15.7], [21.96, 15.46], [22.17, 15.32]] },
    { name: "bench by the keep, left", foot: [13.15, 7.5, 14.33, 7.95], over: [[13.19, 7.15], [13.33, 7.15], [13.35, 7.19], [14.08, 7.19], [14.1, 7.15], [14.25, 7.15], [14.38, 7.25], [14.35, 7.88], [14.23, 8], [14.15, 7.96], [13.27, 7.96], [13.19, 8], [13.1, 7.92], [13.12, 7.88], [13.08, 7.83], [13.06, 7.71], [13.1, 7.52], [13.08, 7.23]] },
    { name: "bench by the keep, right", foot: [14.64, 7.5, 15.82, 7.95], over: [[14.65, 7.15], [14.79, 7.15], [14.85, 7.19], [15.6, 7.19], [15.62, 7.15], [15.71, 7.15], [15.73, 7.19], [15.81, 7.19], [15.85, 7.23], [15.83, 7.52], [15.88, 7.69], [15.83, 7.92], [15.69, 8], [15.56, 7.92], [15.6, 7.85], [15.56, 7.85], [15.54, 7.9], [15.35, 7.85], [14.92, 7.85], [14.81, 7.96], [14.67, 7.98], [14.6, 7.92], [14.62, 7.83], [14.56, 7.75], [14.56, 7.52], [14.6, 7.5], [14.56, 7.46], [14.56, 7.23]] },
    { name: "bench on the path", foot: [6.75, 4.6, 7.95, 5.05], over: [[7.6, 3.81], [7.69, 3.81], [7.79, 3.92], [7.77, 4.15], [7.9, 4.21], [8, 4.33], [7.98, 4.58], [7.65, 4.77], [7.56, 4.75], [7.5, 4.85], [7.42, 4.85], [7.29, 4.98], [7.02, 5.1], [6.94, 5.04], [6.94, 4.98], [6.81, 4.98], [6.73, 4.9], [6.75, 4.79], [6.71, 4.77], [6.73, 4.67], [6.69, 4.65], [6.71, 4.33], [6.81, 4.25], [6.92, 4.25], [7.15, 4.15]] },
    { name: "top edge", foot: [0, 0, 32, 0.2] },
    { name: "left edge", foot: [0, 0.2, 0.2, 17.6] },
    { name: "bottom edge", foot: [0, 17.6, 32, 18] },
    { name: "right edge above the way out", foot: [31.8, 0.2, 32, 10.55] },
    { name: "right edge below the way out", foot: [31.8, 13.4, 32, 17.6] },
  ],

  // On the pavement, just in from the left edge.
  playerSpawn: [1.3, 12.4],

  // The friend, being sick on the pavement (the orange puddle).
  companionSpawn: [21.6, 11.3],

  // No enemies here (enemyBudget 0), kept so the schema stays uniform.
  enemySpawns: [
    [9, 15.2], [16, 15.2], [29, 12.6],
  ],

  // Way out: the street carries on off the right edge.
  exit: [31.55, 10.6, 31.95, 13.4],
};
