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

  solid: [
    // ---- park band along the top: trees, railings and the shut gate,
    // one band down to the towpath, no gap (the gate doesn't open) ----
    [0, 0, 48, 6.3],

    // ---- the lock keeper's cottage and its whole fenced garden, one
    // block (house, lawn and picket fence together) ----
    [25.0, 6.3, 32.1, 8.35],

    // ---- road bridge, far right: the willow gives way to the bridge's
    // buildings, brickwork and the water passing under its arch, all the
    // way across. Measured (not assumed): on both sides a post carries a
    // pedestrian railing at 8.0-8.7, and open pavement resumes only below
    // it. So the towpath doesn't pass through a gap in this block, it
    // passes UNDER it, at reduced headroom, 8.7 to 10.7 (2.0 units, over
    // the 1.6 minimum) the full width of the bridge. ----
    [40.2, 6.3, 48, 8.7],

    // ---- towpath furniture, left to right ----
    [9.7, 6.0, 12.15, 7.05],   // bench, back to the railings
    [19.35, 6.15, 20.15, 7.2], // litter bin
    [14.85, 9.5, 15.55, 10.35],// mooring bollard, roped to a boat
    [24.2, 10.35, 27.9, 11.5], // lock gate: pivot post + balance beams, where they swing over the towpath
    [33.25, 5.85, 35.2, 6.55], // bikes chained to the railings
    [36.4, 6.0, 38.5, 7.05],   // second bench, under the willow

    // ---- the whole canal band, water's edge down to the bottom: the
    // moored boats and the far bank's warehouses are all covered by
    // this since they sit in or beyond the water. The lock recesses the
    // bank, so the edge steps out and back rather than running straight. ----
    [0, 10.7, 22, 18],     // past the three boats, standard width
    [22, 10.85, 25, 18],   // edge starting to curve out, into the lock
    [25, 11.5, 28, 18],    // curving further
    [28, 11.85, 32, 18],   // widest, where the lock chamber recesses the bank
    [32, 11.5, 34, 18],    // curving back in
    [34, 10.7, 48, 18],    // standard width again, through the junction and under the bridge deck

    // ---- outer edge, so nobody walks off the picture ----
    [0, 0, 48, 0.4],
    [0, 17.6, 48, 18],
    [0, 0, 0.4, 18],
    [47.6, 0, 48, 8.8],    // right edge, above the exit
    [47.6, 10.6, 48, 18],  // right edge, below the exit
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
