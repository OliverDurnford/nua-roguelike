// ============================================================
// VICTORIA PARK, RUINED: Chapter 5, Area 5. The finale arena.
//
// Plate area, FIRST PASS geometry. The same park from the
// tutorial, years on and broken: dead trees, the glowing rune
// cracks, the overgrown car park on the right. The painted
// cracks are floor, not walls; the arena stays open for the
// Old Age fight.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/Victoria Park/Victoria Park Boss
// level.jpg" cut into 32 columns and 18 rows.
// ============================================================

const PARKRUINED_PLATE = {
  sprite: "plate-parkruined",
  cols: 32,
  rows: 18,
  unit: 48,

  // Same ground scale as the tutorial's park.
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
    { name: "hedge line along the top", foot: [0, 0, 32, 1.6] },
    { name: "bin by the path", foot: [13.5, 1.6, 14.15, 2.5] },
    { name: "bench, top right", foot: [26.8, 1.7, 29.4, 2.4] },
    { name: "dead tree, top middle", foot: [19.85, 3.35, 21.05, 3.85], over: [[20.25, 1.6], [20.75, 1.6], [20.95, 1.9], [21.15, 1.95], [23.3, 2.05], [23.35, 2.35], [21.2, 2.5], [21.05, 2.85], [21.05, 3.85], [19.85, 3.85], [19.85, 2.9], [19.6, 2.55], [19.75, 2.15], [20.15, 2.05]] },
    { name: "dead tree, free-standing", foot: [6.85, 5.15, 7.5, 5.75], over: [[7, 1.6], [7.35, 1.6], [7.5, 2], [8.3, 2.15], [8.15, 2.7], [7.55, 2.6], [7.55, 4], [7.5, 5.15], [6.85, 5.15], [6.85, 4], [6.9, 2.7], [6.3, 2.85], [5.9, 2.3], [6.75, 2]] },
    { name: "the fountain, dry and cracked", foot: [13.8, 3.71, 15.7, 4.35], over: [[14.3, 2.75], [15.6, 2.8], [16.3, 3.15], [16.5, 3.6], [16.1, 4], [15, 4.35], [14, 4.2], [13.6, 3.85], [13.55, 3.3], [13.9, 2.9]] },
    { name: "big tree and the fallen log", foot: [0, 1.6, 4.4, 4.7] },
    { name: "swampy left edge", foot: [0, 4.7, 1.3, 18] },
    { name: "fallen tree, bottom left", foot: [1.3, 12.9, 3.6, 15.5] },
    { name: "bushes along the bottom", foot: [4, 15.7, 9.3, 17.7] },
    { name: "rocks by the west crack", foot: [11.5, 7.6, 13.4, 8.9] },
    { name: "rocks by the east crack", foot: [18.6, 7.5, 20.3, 8.7] },
    { name: "the rubbish pile: bags, bones, the football", foot: [10.3, 14.1, 13.8, 15.9] },
    { name: "rusted car", foot: [23.9, 5, 27.3, 7] },
    { name: "mossy parked car", foot: [23.8, 8, 26.9, 9.9] },
    { name: "the wrecked car and its spilt engine", foot: [23.6, 11, 27.6, 13.5], over: [[23.6, 10.9], [27.6, 10.9], [27.7, 12.3], [26.9, 13.1], [26.4, 14.4], [24.9, 14.5], [24, 13.9], [23.5, 12.5]] },
    { name: "big bush, bottom centre right", foot: [19.4, 13.9, 23, 16.2] },
    { name: "ivy fence, upper run", foot: [22.9, 3.8, 23.5, 10.5] },
    { name: "right edge of the road", foot: [31.6, 1.6, 32, 18] },
    { name: "outer edge, bottom", foot: [0, 17.5, 32, 18] },
  ],

  playerSpawn: [15.5, 16.5],

  bossSpawn: [16, 5.5],

  enemySpawns: [
    [5, 6], [9, 3], [22, 3.2], [28, 4.5],
    [29, 8.5], [29.5, 14.5], [3.5, 10.5], [6, 13.5],
  ],

  // The path mouth at the top; the finale never unlocks it, it is
  // here so the schema stays uniform.
  exit: [15.2, 1.6, 16.8, 2.1],
};
