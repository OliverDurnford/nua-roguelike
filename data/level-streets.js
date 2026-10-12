// ============================================================
// NORWICH STREETS: Chapter 3, Area 3. The mad dash.
//
// Plate area: painted background (core/plates-real.js) with a
// hand-measured collision layer. A cobbled medieval lane running
// the full width, played left to right. Sealed along the top by
// the pantile roofs and the fronts of the timber framed houses,
// and along the bottom by the near side rooftops. You come in at
// the left edge and run out through the little square at the far
// right, past the church.
//
// Grid: 48 x 18 units, one unit is 48 world px (2304 x 864 px).
// Source: "Level Design/Norwich Streets/Norwich Streets - game
// plate.jpg" cut into 48 columns and 18 rows. Unit 0,0 is the top
// left corner. Press F2 in game to see the blocks.
//
// TUNING NOTE: this is a sprint, so the lane is kept wide. The
// pavement in front of the houses is walkable; only the things
// standing on it block you. The cafe chairs, the chalkboard A
// board, the wheelie bin and the drain are deliberately NOT solid,
// the same call as the loose chairs in Gonzo's. The four bollards
// are solid at their feet only: blocking the whole painted post
// leaves under a unit of daylight between them and the bikes, and
// the brute cannot get through that.
// ============================================================

const STREETS_PLATE = {
  // Two tiles side by side: Kaboom caps textures at 2048 px wide.
  tiles: [
    { sprite: "plate-streets_0", x: 0 },
    { sprite: "plate-streets_1", x: 24 },
  ],
  cols: 48,
  rows: 18,
  unit: 48,

  // A wide open street, a touch smaller than the Hungover Walk.
  charScale: 1.15,

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "pantile roofs and house fronts, down to the pavement", foot: [0, 0, 41.75, 9] },
    { name: "flint church, churchyard, and its railed wall", foot: [41.75, 0, 48, 8.45] },
    { name: "phone box", foot: [8.55, 9, 9.75, 9.8], over: [[8.6, 7], [8.7, 6.97], [9.6, 6.97], [9.7, 7.05], [9.72, 9.7], [9.6, 9.8], [8.65, 9.8], [8.56, 9.7], [8.56, 7.1]] },
    { name: "lamp post by the phone box", foot: [11.65, 9.6, 12.08, 10.25], over: [[11.85, 6.36], [11.97, 6.47], [12.1, 6.6], [12.1, 7.25], [12, 7.35], [12, 7.5], [12.27, 7.52], [12.27, 7.68], [11.97, 7.7], [11.97, 9.3], [12.04, 9.45], [12.04, 9.9], [12.11, 9.98], [12.11, 10.2], [12.05, 10.25], [11.7, 10.25], [11.62, 10.2], [11.62, 9.98], [11.7, 9.9], [11.7, 9.45], [11.77, 9.3], [11.77, 7.7], [11.46, 7.68], [11.46, 7.5], [11.75, 7.48], [11.75, 7.35], [11.62, 7.25], [11.6, 6.6], [11.73, 6.47]] },
    { name: "cafe table", foot: [16.6, 9.45, 17.3, 9.95], over: [[16.95, 9.06], [17.1, 9.07], [17.25, 9.11], [17.35, 9.2], [17.38, 9.33], [17.35, 9.46], [17.25, 9.55], [17.1, 9.6], [17.02, 9.62], [17.02, 9.74], [17.12, 9.8], [17.13, 9.97], [16.73, 9.97], [16.75, 9.8], [16.88, 9.74], [16.88, 9.62], [16.8, 9.6], [16.65, 9.55], [16.55, 9.46], [16.52, 9.33], [16.55, 9.2], [16.65, 9.11], [16.8, 9.07]] },
    { name: "bicycle left", foot: [21.7, 9.3, 23.5, 9.75], over: [[22.1, 8.39], [22.22, 8.45], [22.22, 8.62], [22.6, 8.78], [22.9, 8.83], [23.15, 8.95], [23.4, 9.05], [23.53, 9.3], [23.5, 9.6], [23.3, 9.74], [22.8, 9.76], [22.5, 9.74], [22.3, 9.78], [21.9, 9.78], [21.7, 9.62], [21.66, 9.3], [21.75, 9.08], [21.95, 8.95], [22.05, 8.7]] },
    { name: "bicycle middle", foot: [23.7, 9.3, 25.4, 9.75], over: [[24.18, 8.27], [24.33, 8.33], [24.33, 8.55], [24.5, 8.72], [24.8, 8.62], [24.85, 8.5], [25.06, 8.5], [25.1, 8.62], [25.25, 8.85], [25.44, 9.2], [25.44, 9.55], [25.3, 9.72], [24.9, 9.78], [24.55, 9.75], [24.2, 9.78], [23.8, 9.75], [23.67, 9.55], [23.67, 9.2], [23.85, 8.95], [24.1, 8.75], [24.15, 8.5]] },
    { name: "bicycle right", foot: [25.55, 9.3, 27.45, 9.75], over: [[26, 8.29], [26.17, 8.33], [26.2, 8.55], [26.5, 8.75], [26.9, 8.62], [27.15, 8.62], [27.2, 8.8], [27.35, 8.95], [27.49, 9.2], [27.49, 9.55], [27.35, 9.72], [26.9, 9.78], [26.6, 9.76], [26.3, 9.78], [25.7, 9.76], [25.51, 9.55], [25.51, 9.2], [25.7, 8.95], [25.95, 8.75], [25.98, 8.55]] },
    { name: "bollard back left", foot: [24.45, 11.3, 24.9, 11.6], over: [[24.55, 10.38], [24.7, 10.38], [24.8, 10.45], [24.82, 11.3], [24.9, 11.35], [24.9, 11.55], [24.85, 11.6], [24.48, 11.6], [24.44, 11.55], [24.44, 11.35], [24.5, 11.3], [24.52, 10.45]] },
    { name: "bollard back right", foot: [25.14, 11.3, 25.59, 11.6], over: [[25.24, 10.38], [25.39, 10.38], [25.49, 10.45], [25.51, 11.3], [25.59, 11.35], [25.59, 11.55], [25.54, 11.6], [25.17, 11.6], [25.13, 11.55], [25.13, 11.35], [25.19, 11.3], [25.21, 10.45]] },
    { name: "bollard front left", foot: [24.45, 13.48, 24.9, 13.78], over: [[24.55, 12.57], [24.7, 12.57], [24.8, 12.64], [24.82, 13.49], [24.9, 13.54], [24.9, 13.74], [24.85, 13.79], [24.48, 13.79], [24.44, 13.74], [24.44, 13.54], [24.5, 13.49], [24.52, 12.64]] },
    { name: "bollard front right", foot: [25.14, 13.48, 25.59, 13.78], over: [[25.24, 12.57], [25.39, 12.57], [25.49, 12.64], [25.51, 13.49], [25.59, 13.54], [25.59, 13.74], [25.54, 13.79], [25.17, 13.79], [25.13, 13.74], [25.13, 13.54], [25.19, 13.49], [25.21, 12.64]] },
    { name: "lamp post by the cobbles", foot: [32.65, 13.6, 33.15, 14], over: [[32.88, 11.43], [32.95, 11.5], [32.98, 11.62], [33.19, 11.67], [33.19, 11.98], [33.1, 12.02], [33.06, 12.15], [33.06, 12.45], [32.98, 12.5], [32.98, 12.6], [33.31, 12.62], [33.31, 12.77], [32.98, 12.78], [32.98, 13.9], [33.07, 14], [33.13, 14.3], [33.13, 14.62], [32.7, 14.62], [32.7, 14.3], [32.76, 14], [32.77, 12.78], [32.46, 12.77], [32.46, 12.62], [32.77, 12.6], [32.77, 12.5], [32.72, 12.45], [32.72, 12.15], [32.64, 12.02], [32.58, 11.98], [32.58, 11.67], [32.8, 11.62], [32.8, 11.5]] },
    { name: "bench", foot: [42.2, 9, 43.6, 9.35], over: [[42.15, 8.55], [42.22, 8.47], [43.6, 8.47], [43.67, 8.55], [43.67, 9.25], [43.55, 9.35], [42.27, 9.35], [42.15, 9.25]] },
    { name: "gable left shoulder", foot: [5.4, 13.55, 5.9, 14] },
    { name: "gable left peak", foot: [5.9, 13, 6.9, 14] },
    { name: "gable 2 shoulder", foot: [11.1, 13.6, 11.75, 14] },
    { name: "gable 2 peak", foot: [11.75, 12.95, 12.5, 14] },
    { name: "gable 3 shoulder", foot: [17.15, 13.75, 17.75, 14] },
    { name: "gable 3 peak", foot: [17.75, 13.4, 18.5, 14] },
    { name: "gable 4 shoulder", foot: [21.1, 13.75, 21.55, 14] },
    { name: "gable 4 peak", foot: [21.55, 13.35, 22.65, 14] },
    { name: "chimney stack", foot: [22.9, 13.4, 23.5, 14] },
    { name: "gable 5 shoulder", foot: [28.1, 13.6, 28.7, 14] },
    { name: "gable 5 peak", foot: [28.7, 13.1, 29.9, 14] },
    { name: "gable 6", foot: [34.3, 13.87, 35.1, 14] },
    { name: "the near rooftops", foot: [0, 14, 36.4, 18] },
    { name: "the square's low flint wall", foot: [36.4, 16.87, 48, 18] },
    { name: "wall 32", foot: [0, 9, 0.4, 14] },
    { name: "right edge above the way out", foot: [47.6, 8.45, 48, 14.15] },
    { name: "A board", foot: [18.65, 9.4, 19.35, 9.8], over: [[19.27, 8.62], [19.31, 8.67], [19.4, 8.65], [19.52, 8.83], [19.5, 9.15], [19.56, 9.19], [19.56, 9.52], [19.46, 9.56], [19.4, 9.5], [19.4, 9.4], [19.33, 9.38], [19.31, 9.79], [19.23, 9.85], [19.1, 9.79], [19.08, 9.54], [18.88, 9.52], [18.85, 9.48], [18.73, 9.48], [18.6, 9.42], [18.6, 9.12], [18.65, 9.1], [18.65, 8.85], [18.73, 8.67], [19.19, 8.75]] },
    { name: "wheelie bin", foot: [6.2, 9, 6.8, 9.3], over: [[6.27, 8.42], [6.73, 8.42], [6.76, 8.75], [6.8, 8.78], [6.81, 9.2], [6.75, 9.33], [6.65, 9.35], [6.35, 9.35], [6.25, 9.33], [6.19, 9.2], [6.19, 8.78], [6.24, 8.75]] },
    { name: "plane tree", over: [[45.3, 7.02], [45.45, 6.9], [45.7, 6.83], [46, 6.8], [46.3, 6.9], [46.6, 6.93], [46.68, 7.1], [46.8, 7.3], [47, 7.22], [47.25, 7.18], [47.5, 7.25], [47.62, 7.6], [47.62, 7.95], [47.8, 7.98], [48, 8], [48, 11.3], [47.6, 11.26], [47.5, 11.1], [47.3, 11.22], [47.1, 11.25], [46.95, 11.1], [46.75, 10.95], [46.62, 11], [46.58, 11.7], [46.7, 12], [46.95, 12.3], [47, 12.75], [46.9, 12.95], [46.7, 13.2], [46.4, 13.28], [46.15, 13.2], [45.9, 13.36], [45.7, 13.2], [45.35, 13], [45.1, 12.95], [45.03, 12.65], [45.3, 12.4], [45.5, 11.9], [45.45, 11.4], [45.3, 11.05], [45.05, 11.1], [44.8, 11.25], [44.45, 11.25], [44.2, 10.9], [43.98, 10.65], [43.67, 10.55], [43.45, 10.3], [43.33, 10], [43.25, 9.7], [43.2, 9.55], [43.5, 9.4], [43.75, 9.25], [43.98, 9], [43.98, 8.5], [44.15, 8], [44.25, 7.82], [44.6, 7.75], [45, 7.55], [45.3, 7.5]], base: 13.4 },
    { name: "tree trunk", foot: [45.4, 11.2, 46.6, 12.4] },
    { name: "tree pit kerb 1", foot: [45.05, 11.55, 46.95, 12] },
    { name: "tree pit kerb 2", foot: [44.6, 12, 47.4, 12.5] },
    { name: "tree pit kerb 3", foot: [44.48, 12.5, 47.52, 13] },
    { name: "tree pit kerb 4", foot: [44.6, 13, 47.4, 13.5] },
    { name: "tree pit kerb 5", foot: [45.08, 13.5, 46.92, 14] },
  ],

  // On the cobbles at the left edge, facing the length of the lane.
  playerSpawn: [1.4, 12.0],

  // Nine, strung out along the whole run and on into the square, so the
  // fight comes at you in waves as you sprint rather than all at once.
  // All are clear of the start by more than six units, and clear of the
  // scenery by more than half the brute's width.
  enemySpawns: [
    [9.6,  11.6], [14.2, 12.9], [19.4, 11.4],
    [23.3, 11.9], [27.3, 11.3], [31.1, 12.8],
    [35.6, 11.6], [39.6, 14.8], [45.0, 15.6],
  ],

  // Way out: the square carries on off the right edge, under the tree.
  exit: [47.55, 14.15, 47.95, 16.87],
};
