// ============================================================
// REGENT'S CANAL: Chapter 5, Area 4. The quiet area: no enemies,
// no friend to collect, a walk from left to right at sunset.
//
// Plate area: painted background (core/plates-real.js, two tiles
// stitched) with a hand-measured collision layer. Along the top:
// the park's trees behind black railings with a shut gate, the
// lock keeper's cottage in its picket-fence garden, more railings,
// a willow, then a brick road bridge (buildings either side, an
// arch the towpath runs under). Along the bottom: the canal, three
// moored narrowboats, Old Ford Lock with its balance beams, then
// past the seam it widens into a junction with a footbridge and a
// fourth boat, the road bridge's deck crossing the water, and the
// far bank's warehouses and flats along the very bottom edge. The
// towpath itself runs the full width between the two.
//
// Grid: 48 x 18 units, one unit is 48 world px (2304 x 864 px).
// Source: "Level Design/Regents Canal/Regents Canal - game plate.jpg" cut
// into 48 columns and 18 rows. Unit 0,0 is the top left corner.
// Press F2 in game to see the blocks.
// ============================================================

const CANAL_PLATE = {
  // Two tiles side by side: Kaboom caps textures at 2048 px wide.
  tiles: [
    { sprite: "plate-canal_0", x: 0 },
    { sprite: "plate-canal_1", x: 24 },
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
    { name: "outer edge, top", foot: [0, 0, 48, 0.4] },
    { name: "outer edge, bottom", foot: [0, 17.6, 48, 18] },
    { name: "outer edge, left", foot: [0, 0, 0.4, 18] },
    { name: "outer edge, right, above the exit", foot: [47.6, 0, 48, 8.8] },
    { name: "outer edge, right, below the exit", foot: [47.6, 10.6, 48, 18] },
    { name: "park trees, railings and the shut gate", foot: [0, 0, 48, 6.3] },
    { name: "lock cottage and its fenced garden", foot: [24.85, 6.3, 32.1, 8.8] },
    { name: "road bridge", foot: [40.2, 6.3, 48, 8.7] },
    { name: "bench, back to the railings", foot: [9.7, 6, 12.15, 7.05], over: [[9.7, 5.8], [12.15, 5.8], [12.15, 7.05], [9.7, 7.05]] },
    { name: "litter bin", foot: [19.35, 6.67, 20.15, 7.2], over: [[19.35, 6.15], [20.15, 6.15], [20.15, 7.2], [19.35, 7.2]] },
    { name: "mooring bollard, roped to a boat", foot: [14.85, 9.5, 15.55, 10.35] },
    { name: "lock gate: pivot post and balance beams", foot: [24.2, 10.35, 27.9, 11.5] },
    { name: "bikes chained to the railings", foot: [33.25, 5.85, 35.2, 6.55] },
    { name: "second bench, under the willow", foot: [36.4, 6, 38.5, 7.05], over: [[36.4, 5.8], [38.5, 5.8], [38.5, 7.05], [36.4, 7.05]] },
    { name: "narrowboat, moored, red with the bike", over: [[3, 9.6], [8.35, 9.6], [8.65, 10.3], [8.65, 11.3], [8.3, 11.55], [3.05, 11.55], [2.75, 11], [2.75, 10.3]] },
    { name: "narrowboat, moored, green with the camp chair", over: [[9.75, 9.8], [15.6, 9.8], [15.9, 10.4], [15.9, 11.3], [15.55, 11.5], [9.8, 11.5], [9.5, 11], [9.5, 10.3]] },
    { name: "narrowboat, moored, blue with the coal sacks", over: [[17.15, 9.75], [23.55, 9.75], [23.9, 10.35], [23.9, 11.3], [23.55, 11.5], [17.2, 11.5], [16.9, 11], [16.9, 10.3]] },
    { name: "narrowboat, junction, broadside with the life ring", over: [[40.2, 10.3], [41.1, 10.3], [41.35, 10], [41.55, 10.3], [46.6, 10.3], [46.8, 10.55], [46.8, 11.55], [46.5, 11.75], [40.3, 11.75], [40, 11.5], [40, 10.55]] },
    { name: "canal, past the three boats", foot: [0, 10.7, 22, 18] },
    { name: "canal edge, starting to curve into the lock", foot: [22, 10.85, 25, 18] },
    { name: "canal edge, curving further", foot: [25, 11.5, 28, 18] },
    { name: "canal edge, widest at the lock chamber", foot: [28, 11.85, 32, 18] },
    { name: "canal edge, curving back in", foot: [32, 11.5, 34, 18] },
    { name: "canal, standard width through the junction and under the bridge", foot: [34, 10.7, 48, 18] },
  ],

  // Left edge, on the towpath.
  playerSpawn: [1.44, 8.28],

  // Spread along the towpath, clear of every solid above. Not used:
  // enemyBudget is 0 for a quiet area, kept so the schema stays uniform.
  enemySpawns: [
    [5, 8.3], [17, 8.3], [29, 9.2], [38, 8.3], [43, 9.5],
  ],

  // Way out: the towpath carries on off the right edge, past the
  // road bridge. Shifted down from the entry side to sit in the
  // narrower band that passes under the bridge.
  exit: [47.55, 8.8, 47.95, 10.6],
};
