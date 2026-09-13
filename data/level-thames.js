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

  solid: [
    // ---- building band along the top: sealed, the walkway starts where
    // the paving begins below each one ----
    [0,     0,     9.2,   7.15],  // Royal Festival Hall + undercroft kiosks
    [9.2,   0,     16.2,  7.0],   // steps down into the underpass alcove
    [13.9,  0,     16.2,  7.8],   // the steps themselves, running deeper
    [16.2,  0,     24.2,  7.9],   // National Theatre terraces
    [24.2,  0,     26.6,  7.4],   // dark lane between the buildings
    [26.6,  0,     38.85, 7.15],  // OXO Tower wharf into Tate Modern's wall
    [35.85, 0,     37.75, 8.6],   // Tate's chimney; the base stands on the walkway
    // 38.85 to 42.3: the bridge underpass. Stays open, the walkway runs
    // straight through underneath it.
    [42.3,  0,     43.6,  7.0],   // the Globe, where the drum curves closest
    [43.6,  0,     45.5,  7.6],   // the Globe, curving out
    [45.5,  0,     48,    7.85],  // the Globe, the main drum

    // ---- walkway furniture ----
    [0.4,   7.8,   4.65,  9.1],   // hire bike rack
    [7.35,  8.05,  9.55,  9.35],  // market table, tarpaulin
    [9.95,  8.05,  12.15, 9.35],  // market table, tarpaulin
    // TUNING NOTE: a tree's leafy canopy reaches almost from the building
    // band down to the river wall, so making the whole canopy solid would
    // seal the walkway shut at that x (nothing could get past it, above or
    // below). Only the trunk + grate at its base is solid; the canopy
    // overhangs it and is walkable underneath, same idea as Gonzo's loose
    // chairs. The first two also sit under the bike rack / a market table,
    // so their top edge is nudged down clear of those, not just the grate's
    // own top, or reach.py's brute-sized check seals the gap between them.
    [4.3,   11.2,  6.55,  12.65], // plane tree, trunk + grate
    [13.1,  11.3,  15.3,  12.6],  // plane tree, trunk + grate
    [21.15, 10.7,  23.85, 12.6],  // plane tree, trunk + grate
    [32.5,  10.65, 34.5,  12.6],  // plane tree, trunk + grate
    [15.85, 10.85, 18.55, 11.95], // bench, taped across
    [25.85, 10.5,  29.05, 11.65], // bench, taped across
    [37.1,  10.85, 39.65, 11.95], // bench, taped across
    [40.85, 10.5,  43.6,  11.6],  // bench, taped across
    [1.85,  11.85, 2.65,  13.05], // dolphin lamp post
    [9.85,  11.85, 10.65, 13.05], // dolphin lamp post
    [19.6,  11.85, 20.4,  13.05], // dolphin lamp post
    [29.6,  11.85, 30.4,  13.05], // dolphin lamp post
    [44.15, 11.85, 45.0,  13.05], // dolphin lamp post

    // ---- granite river wall and everything below it: the Thames, the
    // moored boat, the far bank's lights. One band. ----
    [0,     12.85, 48,    18],

    // ---- outer edge, so nobody walks off the picture ----
    [0,     0,     48,    0.4],
    [0,     17.6,  48,    18],
    [0,     0,     0.4,   18],
    [47.6,  0,     48,    18],
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
