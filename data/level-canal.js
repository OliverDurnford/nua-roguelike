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
    { name: "lock cottage", foot: [26.95, 6.3, 30.75, 8] },
    { name: "garden side fence, left", foot: [25.38, 6.3, 25.56, 8.55] },
    { name: "garden bushes and barrel, right", foot: [30.6, 6.3, 32.4, 8.4] },
    { name: "garden fence, left of the gate", foot: [25.4, 8.55, 28.38, 8.95], over: [[25.4, 8.1], [28.38, 8.1], [28.38, 8.98], [25.4, 8.98]], see: true },
    { name: "garden fence, right of the gate", foot: [29.24, 8.55, 32.2, 8.95], over: [[29.24, 8.1], [32.2, 8.1], [32.2, 8.98], [29.24, 8.98]], see: true },
    { name: "road bridge", foot: [40.2, 6.3, 47.5, 8.9] },
    { name: "bridge railing", over: [[40.2, 8], [47.5, 8], [47.5, 8.9], [40.2, 8.9]], see: true },
    { name: "bench, back to the railings", foot: [9.77, 6.75, 12.15, 7.3], over: [[9.78, 6.12], [12.15, 6.12], [12.15, 7.14], [12.03, 7.14], [12.03, 7.35], [11.9, 7.35], [11.9, 7.14], [10, 7.14], [10, 7.35], [9.86, 7.35], [9.86, 7.14], [9.78, 7.14]] },
    { name: "litter bin", foot: [19.38, 6.75, 20.18, 7.25], over: [[19.42, 6.14], [20.12, 6.14], [20.18, 6.2], [20.18, 7], [20.2, 7.05], [20.2, 7.24], [20.1, 7.3], [19.46, 7.3], [19.38, 7.22], [19.38, 6.2]] },
    { name: "mooring bollard, left boat gap", foot: [8.35, 9.95, 8.85, 10.3], over: [[8.4, 10], [8.42, 9.86], [8.5, 9.78], [8.6, 9.78], [8.68, 9.86], [8.7, 10], [8.72, 10.28], [8.38, 10.28]] },
    { name: "mooring bollard, roped to a boat", foot: [14.78, 9.95, 15.35, 10.3], over: [[14.84, 9.8], [14.9, 9.68], [15.05, 9.64], [15.2, 9.68], [15.28, 9.8], [15.3, 9.95], [15.34, 10], [15.34, 10.28], [14.78, 10.28], [14.78, 10], [14.84, 9.95]] },
    { name: "lock gate, pivot post and first beam", foot: [24.2, 10.35, 25.4, 10.9], over: [[24.31, 10.25], [24.45, 10.12], [24.97, 10.27], [25.01, 10.44], [25.4, 10.58], [25.4, 10.98], [24.97, 10.77], [24.56, 10.64]] },
    { name: "lock gate, middle of the beam", foot: [25, 10.7, 26.7, 11.2], over: [[25.4, 10.58], [26.47, 10.96], [26.47, 10.56], [26.57, 10.51], [26.67, 10.56], [26.67, 11.03], [26.7, 11.04], [26.7, 11.47], [26.36, 11.45], [25.4, 10.98]] },
    { name: "lock gate, beam end and post", foot: [26.5, 10.95, 27.9, 11.5], over: [[26.7, 11.04], [27.51, 11.3], [27.51, 10.93], [27.6, 10.89], [27.65, 10.94], [27.65, 11.45], [27.54, 11.51], [26.7, 11.47]] },
    { name: "bike chained to the railings", foot: [32.9, 6.5, 34.85, 7], over: [[32.89, 6.65], [32.94, 6.48], [33.04, 6.36], [33.22, 6.32], [33.36, 6.21], [33.35, 6.02], [33.4, 5.93], [33.61, 5.91], [33.69, 5.97], [33.68, 6.08], [33.58, 6.15], [33.85, 6.17], [34.1, 6.1], [34.14, 5.99], [34.19, 5.68], [34.28, 5.66], [34.35, 5.72], [34.4, 5.85], [34.4, 6.02], [34.33, 6.12], [34.51, 6.25], [34.69, 6.32], [34.82, 6.51], [34.85, 6.7], [34.78, 6.91], [34.63, 7], [34.3, 7], [34.12, 6.92], [33.92, 6.85], [33.81, 6.85], [33.53, 6.88], [33.39, 6.95], [33.15, 6.97], [32.98, 6.88], [32.9, 6.76]] },
    { name: "second bench, under the willow", foot: [36.4, 6.55, 38.5, 7.05], over: [[36.41, 6.01], [38.51, 6.01], [38.51, 6.85], [38.45, 6.85], [38.45, 7.05], [38.32, 7.05], [38.32, 6.88], [36.62, 6.88], [36.62, 7.05], [36.49, 7.05], [36.49, 6.88], [36.41, 6.88]] },
    { name: "narrowboat, moored, red with the bike", over: [[2.7, 10.7], [2.7, 10.27], [3.88, 10.27], [3.9, 10.12], [3.98, 9.97], [4.1, 10.05], [4.2, 10.1], [4.3, 9.97], [4.42, 10], [4.6, 10.05], [4.69, 10.15], [4.69, 10.27], [5.38, 10.27], [5.55, 10.1], [5.65, 9.9], [5.91, 9.88], [6, 10], [6.17, 9.93], [6.48, 9.93], [6.55, 10.05], [6.7, 10.15], [6.72, 10.27], [6.77, 10.27], [6.77, 9.9], [7, 9.9], [7, 10.27], [7.32, 10.27], [7.32, 10.7]] },
    { name: "narrowboat, moored, green with the camp chair", over: [[10.55, 10.7], [10.55, 10.22], [11.35, 10.22], [11.38, 10.12], [11.5, 10.1], [11.65, 10.12], [11.7, 10.05], [11.77, 10], [11.88, 10.05], [11.95, 9.98], [12.05, 9.93], [12.15, 9.93], [12.3, 10], [12.32, 10.22], [13.23, 10.22], [13.25, 10.05], [13.4, 9.93], [13.55, 9.9], [13.75, 9.93], [13.9, 10.05], [14, 10.1], [14, 10.22], [14.32, 10.22], [14.32, 10.7]] },
    { name: "narrowboat, moored, blue with the coal sacks", over: [[17.4, 10.7], [17.4, 10.27], [18.3, 10.27], [18.32, 10.12], [18.4, 10.05], [18.62, 10.05], [18.72, 10.1], [18.72, 10.02], [18.8, 9.97], [18.95, 9.97], [19.04, 10.02], [19.05, 9.95], [19.12, 9.92], [19.32, 9.92], [19.4, 9.98], [19.42, 10.2], [19.6, 10.22], [19.7, 10.12], [19.9, 10.1], [20.1, 10.1], [20.3, 10.12], [20.42, 10.2], [20.55, 10.2], [20.6, 10.1], [20.7, 10.1], [20.8, 10.2], [20.94, 10.2], [20.94, 9.92], [21.2, 9.92], [21.2, 10.26], [21.46, 10.27], [21.5, 10.7]] },
    { name: "narrowboat, junction, broadside with the life ring", over: [[39.85, 10.7], [39.85, 10.2], [43.13, 10.2], [43.15, 10.08], [43.25, 10.04], [43.38, 10.08], [43.42, 10.2], [43.63, 10.2], [43.63, 10.02], [43.74, 9.98], [43.84, 10.02], [43.84, 10.2], [44.54, 10.2], [44.54, 10.7]] },
    { name: "canal, past the three boats", foot: [0, 10.2, 22, 18] },
    { name: "canal edge, starting to curve into the lock", foot: [22, 10.5, 25, 18] },
    { name: "canal edge, curving further", foot: [25, 11.5, 28, 18] },
    { name: "canal edge, widest at the lock chamber", foot: [28, 11.85, 32, 18] },
    { name: "canal edge, curving back in", foot: [32, 11.5, 34, 18] },
    { name: "canal, junction, left of the boat", foot: [34, 10.25, 40, 18] },
    { name: "canal, junction, under the boat and the bridge", foot: [40, 10.45, 47.5, 18] },
  ],

  // Left edge, on the towpath.
  playerSpawn: [1.44, 8.28],
  bonusSpawn: [43.6, 9.25],

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
