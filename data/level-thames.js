// ============================================================
// THE THAMES WALK: Chapter 4, Area 2. A fight area, six enemies,
// played left to right at night.
//
// Plate area: painted background (core/plates-real.js, two tiles
// stitched) with a hand-measured collision layer. The South Bank
// at night: along the top, the Royal Festival Hall, steps down to
// an underpass alcove, the National Theatre, the OXO Tower wharf
// running into Tate Modern (its chimney base stands on the
// walkway), a road bridge's underpass (open, the walkway passes
// under it), then the round Globe theatre. Below that the
// walkway itself: hire bikes, two tarpaulin market tables, four
// benches, four plane trees in grates, five dolphin lamp posts.
// Along the bottom, the granite river wall and everything below
// it (the river, the moored boat, the far bank's lights).
//
// Grid: 48 x 18 units, one unit is 48 world px (2304 x 864 px).
// Source: "Level Design/Thames Walk/Thames Walk - game plate.jpg"
// cut into 48 columns and 18 rows. Unit 0,0 is the top left
// corner. Press F2 in game to see the blocks.
// ============================================================

const THAMES_PLATE = {
  // Two tiles side by side: Kaboom caps textures at 2048 px wide.
  tiles: [
    { sprite: "plate-thames_0", x: 0 },
    { sprite: "plate-thames_1", x: 24 },
  ],
  cols: 48,
  rows: 18,
  unit: 48,

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
    { name: "top edge", foot: [0, 0, 48, 0.4] },
    { name: "bottom edge", foot: [0, 17.6, 48, 18] },
    { name: "left edge", foot: [0, 0, 0.4, 18] },
    { name: "right edge", foot: [47.6, 0, 48, 18] },
    { name: "festival hall wall", foot: [0.4, 0.4, 9.6, 6.85] },
    { name: "left kiosk", foot: [0.4, 6.85, 2.3, 7.4] },
    { name: "right kiosk", foot: [7.2, 6.85, 9.3, 7.45] },
    { name: "stairs and underpass wall", foot: [9.6, 0.4, 16.5, 6.85] },
    { name: "stair post", foot: [13.6, 7.25, 13.85, 7.6], over: [[13.6, 6.85], [13.85, 6.85], [13.85, 7.6], [13.6, 7.6]] },
    { name: "stair flight upper", foot: [14.6, 6.85, 15.55, 7.3], over: [[14.15, 6.85], [15.2, 6.85], [15.55, 7.3], [14.6, 7.3]] },
    { name: "stair flight lower", foot: [15, 7.3, 15.55, 7.72], over: [[14.6, 7.3], [15.55, 7.3], [15.55, 7.72], [15, 7.72]] },
    { name: "national theatre wall", foot: [16.5, 0.4, 24.4, 7.4] },
    { name: "theatre pillar 1", foot: [17.04, 7.75, 17.27, 8.1], over: [[17.04, 7.4], [17.27, 7.4], [17.27, 8.1], [17.04, 8.1]] },
    { name: "theatre pillar 2", foot: [19.21, 7.75, 19.44, 8.1], over: [[19.21, 7.4], [19.44, 7.4], [19.44, 8.1], [19.21, 8.1]] },
    { name: "theatre pillar 3", foot: [21.5, 7.75, 21.73, 8.1], over: [[21.5, 7.4], [21.73, 7.4], [21.73, 8.1], [21.5, 8.1]] },
    { name: "theatre pillar 4", foot: [23.85, 7.75, 24.08, 8.1], over: [[23.85, 7.4], [24.08, 7.4], [24.08, 8.1], [23.85, 8.1]] },
    { name: "alley wall", foot: [24.4, 0.4, 26.4, 6.85] },
    { name: "oxo and tate wall", foot: [26.4, 0.4, 38.15, 7.68] },
    { name: "oxo tower lip", foot: [28.45, 7.6, 30.3, 7.8] },
    { name: "chimney tower", foot: [35.8, 7.68, 37.65, 8.2], over: [[35.8, 8.2], [36, 8.2], [36, 7.1], [37.5, 7.1], [37.5, 8.2]] },
    { name: "chimney tower base", foot: [35.8, 8.2, 37.65, 8.7], over: [[35.8, 8], [37.65, 8], [37.65, 8.7], [35.8, 8.7]] },
    { name: "arch top", foot: [38.15, 0.4, 42.2, 6.1] },
    { name: "arch shutter left", foot: [38.15, 6.1, 39, 7.68] },
    { name: "arch shutter right", foot: [41.14, 6.1, 42.2, 7.68] },
    { name: "arch right wall", foot: [42.2, 0.4, 42.95, 7.68] },
    { name: "payphone", foot: [42.3, 7.8, 42.7, 8.15], over: [[42.3, 7.05], [42.7, 7.05], [42.7, 8.15], [42.3, 8.15]] },
    { name: "globe wall 1", foot: [42.95, 0.4, 43.7, 8] },
    { name: "globe wall 2", foot: [43.7, 0.4, 44.4, 8.65] },
    { name: "globe wall 3", foot: [44.4, 0.4, 45.1, 9.1] },
    { name: "globe wall 4", foot: [45.1, 0.4, 45.8, 9.5] },
    { name: "globe wall 5", foot: [45.8, 0.4, 46.6, 9.7] },
    { name: "globe wall 6", foot: [46.6, 0.4, 47.6, 9.88] },
    { name: "river wall and river", foot: [0.4, 12.65, 47.6, 17.6] },
    { name: "hire bike rack", foot: [0.5, 8.6, 4.7, 9.15], over: [[0.5, 7.8], [4.7, 7.8], [4.7, 9.15], [0.5, 9.15]] },
    { name: "tarpaulin table left", foot: [7.35, 8.7, 9.35, 9.3], over: [[7.35, 8.12], [9.32, 8.12], [9.32, 9.04], [9.27, 9.04], [9.27, 9.3], [8.9, 9.3], [8.9, 9.04], [7.82, 9.04], [7.82, 9.3], [7.45, 9.3], [7.45, 9.04], [7.35, 9.04]] },
    { name: "tarpaulin table right", foot: [9.85, 8.7, 11.85, 9.3], over: [[9.85, 8.12], [11.82, 8.12], [11.82, 9.04], [11.77, 9.04], [11.77, 9.3], [11.4, 9.3], [11.4, 9.04], [10.32, 9.04], [10.32, 9.3], [9.95, 9.3], [9.95, 9.04], [9.85, 9.04]] },
    { name: "plane tree 1", foot: [5.15, 11.75, 5.75, 12.1], over: [[5.5, 8.6], [6.02, 8.63], [6.33, 8.86], [6.54, 9.23], [6.73, 9.65], [6.75, 10.17], [6.54, 10.58], [6.33, 10.84], [5.92, 11], [5.71, 11.05], [5.71, 12], [5.2, 12], [5.2, 11.05], [4.98, 11.05], [4.61, 10.9], [4.35, 10.58], [4.17, 10.27], [4.25, 9.75], [4.27, 9.28], [4.51, 8.92], [4.98, 8.71]] },
    { name: "plane tree 2", foot: [13.45, 11.75, 14.05, 12.1], over: [[13.8, 8.6], [14.32, 8.63], [14.63, 8.86], [14.84, 9.23], [15.03, 9.65], [15.05, 10.17], [14.84, 10.58], [14.63, 10.84], [14.22, 11], [14.01, 11.05], [14.01, 12], [13.5, 12], [13.5, 11.05], [13.28, 11.05], [12.91, 10.9], [12.65, 10.58], [12.47, 10.27], [12.55, 9.75], [12.57, 9.28], [12.81, 8.92], [13.28, 8.71]] },
    { name: "plane tree 3", foot: [21.75, 11.75, 22.35, 12.1], over: [[22.1, 8.6], [22.62, 8.63], [22.93, 8.86], [23.14, 9.23], [23.33, 9.65], [23.35, 10.17], [23.14, 10.58], [22.93, 10.84], [22.52, 11], [22.31, 11.05], [22.31, 12], [21.8, 12], [21.8, 11.05], [21.58, 11.05], [21.21, 10.9], [20.95, 10.58], [20.77, 10.27], [20.85, 9.75], [20.87, 9.28], [21.11, 8.92], [21.58, 8.71]] },
    { name: "plane tree 4", foot: [33.6, 11.75, 34.2, 12.1], over: [[33.95, 8.6], [34.47, 8.63], [34.78, 8.86], [34.99, 9.23], [35.18, 9.65], [35.2, 10.17], [34.99, 10.58], [34.78, 10.84], [34.37, 11], [34.16, 11.05], [34.16, 12], [33.65, 12], [33.65, 11.05], [33.43, 11.05], [33.06, 10.9], [32.8, 10.58], [32.62, 10.27], [32.7, 9.75], [32.72, 9.28], [32.96, 8.92], [33.43, 8.71]] },
    { name: "lamp post 1", foot: [1.89, 12.3, 2.59, 12.65], over: [[2, 11], [2.48, 11], [2.48, 11.55], [2.3, 11.7], [2.35, 12.1], [2.5, 12.5], [2.66, 12.5], [2.66, 13], [1.82, 13], [1.82, 12.5], [1.98, 12.5], [2, 12.1], [1.98, 11.7], [1.96, 11.55]] },
    { name: "lamp post 2", foot: [11.35, 12.3, 12.05, 12.65], over: [[11.46, 11], [11.94, 11], [11.94, 11.55], [11.76, 11.7], [11.81, 12.1], [11.96, 12.5], [12.12, 12.5], [12.12, 13], [11.28, 13], [11.28, 12.5], [11.44, 12.5], [11.46, 12.1], [11.44, 11.7], [11.42, 11.55]] },
    { name: "lamp post 3", foot: [19.25, 12.3, 19.95, 12.65], over: [[19.36, 11], [19.84, 11], [19.84, 11.55], [19.66, 11.7], [19.71, 12.1], [19.86, 12.5], [20.02, 12.5], [20.02, 13], [19.18, 13], [19.18, 12.5], [19.34, 12.5], [19.36, 12.1], [19.34, 11.7], [19.32, 11.55]] },
    { name: "lamp post 4", foot: [29.88, 12.3, 30.58, 12.65], over: [[29.99, 11], [30.47, 11], [30.47, 11.55], [30.29, 11.7], [30.34, 12.1], [30.49, 12.5], [30.65, 12.5], [30.65, 13], [29.81, 13], [29.81, 12.5], [29.97, 12.5], [29.99, 12.1], [29.97, 11.7], [29.95, 11.55]] },
    { name: "lamp post 5", foot: [44.38, 12.3, 45.08, 12.65], over: [[44.49, 11], [44.97, 11], [44.97, 11.55], [44.79, 11.7], [44.84, 12.1], [44.99, 12.5], [45.15, 12.5], [45.15, 13], [44.31, 13], [44.31, 12.5], [44.47, 12.5], [44.49, 12.1], [44.47, 11.7], [44.45, 11.55]] },
    { name: "bench 1", foot: [16, 11.3, 18.56, 11.7], over: [[16, 10.8], [18.56, 10.8], [18.56, 11.52], [18.49, 11.52], [18.49, 11.7], [18.39, 11.7], [18.39, 11.52], [16.17, 11.52], [16.17, 11.7], [16.07, 11.7], [16.07, 11.52], [16, 11.52]] },
    { name: "bench 2", foot: [26.9, 11.3, 29.46, 11.7], over: [[26.9, 10.83], [29.46, 10.83], [29.46, 11.52], [29.39, 11.52], [29.39, 11.7], [29.29, 11.7], [29.29, 11.52], [27.07, 11.52], [27.07, 11.7], [26.97, 11.7], [26.97, 11.52], [26.9, 11.52]] },
    { name: "bench 3", foot: [37.15, 11.79, 39.7, 12.19], over: [[37.15, 11.28], [39.7, 11.28], [39.7, 12.01], [39.63, 12.01], [39.63, 12.19], [39.53, 12.19], [39.53, 12.01], [37.32, 12.01], [37.32, 12.19], [37.22, 12.19], [37.22, 12.01], [37.15, 12.01]] },
    { name: "bench 4", foot: [41.1, 11.3, 43.66, 11.7], over: [[41.1, 10.81], [43.66, 10.81], [43.66, 11.52], [43.59, 11.52], [43.59, 11.7], [43.49, 11.7], [43.49, 11.52], [41.27, 11.52], [41.27, 11.7], [41.17, 11.7], [41.17, 11.52], [41.1, 11.52]] },
  ],

  // Left edge, on the walkway, clear of the bike rack above it (also clear
  // for the wider brute body, which reach.py checks from this same spot).
  playerSpawn: [1.44, 10.0],

  // Spread along the walkway, all clear of the furniture and all more
  // than 6 units from the start.
  enemySpawns: [
    [9.0, 10.3], [17.5, 9.6], [26.0, 9.6], [30.5, 9.6], [36.3, 9.6], [43.4, 9.6],
  ],

  // Right edge, across the walkway, past the last lamp post.
  exit: [47.55, 8.82, 47.95, 10.62],
};
