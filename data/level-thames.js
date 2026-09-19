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
    { name: "Royal Festival Hall and undercroft kiosks", foot: [0, 0, 9.2, 7.15] },
    { name: "steps down into the underpass alcove", foot: [9.2, 0, 16.2, 7] },
    { name: "the steps themselves, running deeper", foot: [13.9, 0, 16.2, 7.8] },
    { name: "National Theatre terraces", foot: [16.2, 0, 24.2, 7.9] },
    { name: "dark lane between the buildings", foot: [24.2, 0, 26.6, 7.4] },
    { name: "OXO Tower wharf into Tate Modern's wall", foot: [26.6, 0, 38.85, 7.15] },
    { name: "Tate's chimney, base stands on the walkway", foot: [35.85, 0, 37.75, 8.6] },
    { name: "the Globe, where the drum curves closest", foot: [42.3, 0, 43.6, 7] },
    { name: "the Globe, curving out", foot: [43.6, 0, 45.5, 7.6] },
    { name: "the Globe, the main drum", foot: [45.5, 0, 48, 7.85] },
    { name: "hire bike rack", foot: [0.4, 8.75, 4.65, 9.05], over: [[0.4, 7.85], [4.65, 7.85], [4.65, 9.05], [0.4, 9.05]] },
    { name: "market table, tarpaulin", foot: [7.4, 9, 9.5, 9.35], over: [[7.35, 8.05], [9.55, 8.05], [9.55, 9.35], [7.35, 9.35]] },
    { name: "market table, tarpaulin", foot: [10, 9, 12.1, 9.35], over: [[9.95, 8.05], [12.15, 8.05], [12.15, 9.35], [9.95, 9.35]] },
    { name: "plane tree, trunk + grate", foot: [4.3, 11.2, 6.55, 12.65], over: [[5.42, 9.35], [6.16, 9.48], [6.69, 9.83], [6.89, 10.3], [6.69, 10.78], [6.16, 11.12], [5.42, 11.25], [4.69, 11.12], [4.16, 10.78], [3.96, 10.3], [4.16, 9.83], [4.69, 9.48]] },
    { name: "plane tree, trunk + grate", foot: [13.1, 11.3, 15.3, 12.6], over: [[14.2, 9.45], [14.91, 9.58], [15.44, 9.93], [15.63, 10.4], [15.44, 10.88], [14.92, 11.22], [14.2, 11.35], [13.48, 11.22], [12.96, 10.88], [12.77, 10.4], [12.96, 9.93], [13.48, 9.58]] },
    { name: "plane tree, trunk + grate", foot: [21.15, 10.7, 23.85, 12.6], over: [[22.5, 8.85], [23.38, 8.98], [24.02, 9.33], [24.26, 9.8], [24.02, 10.28], [23.38, 10.62], [22.5, 10.75], [21.62, 10.62], [20.98, 10.28], [20.74, 9.8], [20.98, 9.33], [21.62, 8.98]] },
    { name: "plane tree, trunk + grate", foot: [32.5, 10.65, 34.5, 12.6], over: [[33.5, 8.8], [34.15, 8.93], [34.63, 9.28], [34.8, 9.75], [34.63, 10.22], [34.15, 10.57], [33.5, 10.7], [32.85, 10.57], [32.37, 10.22], [32.2, 9.75], [32.37, 9.28], [32.85, 8.93]] },
    { name: "bench, taped across", foot: [15.85, 11.2, 18.55, 11.95], over: [[15.85, 10.85], [18.55, 10.85], [18.55, 11.2], [15.85, 11.2]] },
    { name: "bench, taped across", foot: [25.85, 10.87, 29.05, 11.65], over: [[25.85, 10.5], [29.05, 10.5], [29.05, 10.87], [25.85, 10.87]] },
    { name: "bench, taped across", foot: [37.1, 11.2, 39.65, 11.95], over: [[37.1, 10.85], [39.65, 10.85], [39.65, 11.2], [37.1, 11.2]] },
    { name: "bench, taped across", foot: [40.85, 10.85, 43.6, 11.6], over: [[40.85, 10.5], [43.6, 10.5], [43.6, 10.85], [40.85, 10.85]] },
    { name: "dolphin lamp post", foot: [1.85, 12.3, 2.65, 13.05], over: [[1.85, 12.3], [1.85, 11.7], [2.1, 11.3], [2.13, 10.65], [2.03, 10.4], [2.03, 10.2], [2.47, 10.2], [2.47, 10.4], [2.37, 10.65], [2.4, 11.3], [2.65, 11.7], [2.65, 12.3]] },
    { name: "dolphin lamp post", foot: [9.85, 12.3, 10.65, 13.05], over: [[9.85, 12.3], [9.85, 11.7], [10.1, 11.3], [10.13, 10.65], [10.03, 10.4], [10.03, 10.2], [10.47, 10.2], [10.47, 10.4], [10.37, 10.65], [10.4, 11.3], [10.65, 11.7], [10.65, 12.3]] },
    { name: "dolphin lamp post", foot: [19.6, 12.3, 20.4, 13.05], over: [[19.6, 12.3], [19.6, 11.7], [19.85, 11.3], [19.88, 10.65], [19.78, 10.4], [19.78, 10.2], [20.22, 10.2], [20.22, 10.4], [20.12, 10.65], [20.15, 11.3], [20.4, 11.7], [20.4, 12.3]] },
    { name: "dolphin lamp post", foot: [29.6, 12.3, 30.4, 13.05], over: [[29.6, 12.3], [29.6, 11.7], [29.85, 11.3], [29.88, 10.65], [29.78, 10.4], [29.78, 10.2], [30.22, 10.2], [30.22, 10.4], [30.12, 10.65], [30.15, 11.3], [30.4, 11.7], [30.4, 12.3]] },
    { name: "dolphin lamp post", foot: [44.15, 12.3, 45, 13.05], over: [[44.18, 12.3], [44.18, 11.7], [44.43, 11.3], [44.46, 10.65], [44.36, 10.4], [44.36, 10.2], [44.8, 10.2], [44.8, 10.4], [44.7, 10.65], [44.73, 11.3], [44.98, 11.7], [44.98, 12.3]] },
    { name: "river wall, the Thames, the moored boat and the far bank", foot: [0, 12.85, 48, 18] },
    { name: "outer edge, top", foot: [0, 0, 48, 0.4] },
    { name: "outer edge, bottom", foot: [0, 17.6, 48, 18] },
    { name: "outer edge, left", foot: [0, 0, 0.4, 18] },
    { name: "outer edge, right", foot: [47.6, 0, 48, 18] },
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
