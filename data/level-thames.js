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
