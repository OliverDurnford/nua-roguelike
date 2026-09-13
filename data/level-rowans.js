// ============================================================
// ROWANS: Chapter 5, Area 2. A fight area, 10 enemies.
//
// Plate area: one painted top-down background (core/plates-real.js)
// with a hand-measured collision layer drawn on top of it, same
// approach as Gonzo's (see level-gonzos.js).
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/Rowans/Rowans - game plate.jpg" cut
// into 32 columns and 18 rows. Unit 0,0 is the top left corner.
//
// TUNING NOTE: the painting puts barely half a unit of carpet
// between the three arcade rows, well under the 1.6 unit (77px)
// the brute needs to pass. The row rectangles below are measured
// off the art then held back from each other (not from their own
// aisle-facing edge) so the gap is a clean 1.65 everywhere; a
// sliver of painted cabinet at the back of each row is therefore
// walkable. Stools, the ball rack's neighbouring chairs and loose
// carpet are all deliberately left out of solid: only fixed
// furniture blocks you, same rule as Gonzo's.
// ============================================================

const ROWANS_PLATE = {
  sprite: "plate-rowans",
  cols: 32,
  rows: 18,
  unit: 48,

  charScale: 1.1,

  solid: [
    // ---- outer edge, so nobody walks off the picture ----
    [0, 0, 32, 0.4],
    [0, 17.6, 32, 18],
    [0, 0, 0.4, 18],
    [31.6, 0, 32, 18],

    // ---- the eight lanes, top left ----
    [1.0, 0, 18.6, 2.1],      // red and gold scalloped pediment + black header wall
    [1.0, 1.7, 18.6, 7.9],    // the lanes and pins, down to the foul line

    // ---- the approach: ball returns and seat clusters, one per lane ----
    // (end seat, return, cluster, return, cluster, return, cluster, return, end seat)
    [1.0, 8.2, 2.55, 10.15],   // end seat, lane 1
    [3.05, 8.1, 4.0, 10.05],   // ball return machine 1
    [4.6, 8.2, 6.6, 10.15],    // seat cluster 1
    [7.1, 8.1, 8.05, 10.05],   // ball return machine 2
    [8.65, 8.2, 10.65, 10.15], // seat cluster 2
    [11.1, 8.1, 12.1, 10.05],  // ball return machine 3
    [12.65, 8.2, 14.65, 10.15],// seat cluster 3
    [15.1, 8.1, 16.1, 10.05],  // ball return machine 4
    [16.65, 8.2, 18.2, 10.15], // end seat, lane 8
    [0.5, 10.15, 2.9, 11.3],   // rack of bowling balls, left of the approach

    // ---- the bar, bottom left (L shaped, like Gonzo's) ----
    [0.55, 11.4, 7.7, 15.5],   // long counter run + mirrored back bar (stools walkable)
    [7.7, 12.7, 8.6, 15.5],    // the return, short end of the L

    // ---- pool room, bottom middle ----
    // Pool table 3 is held back well short of its true painted bottom edge
    // (16.65): the room reads as two halves, split down the middle by the
    // pool tables, and the only crossing on the ground floor is this one
    // strip between table 3 and the cue rack. Table 3 at its full height
    // left under a unit of clearance there once the cue rack's own margin
    // is added in, not enough for the brute - the same fix as the arcade
    // rows above, just a bigger cut because two solids stack in this gap.
    [11.0, 10.85, 14.65, 13.35], // pool table 1
    // Pool table 2 is ALSO held back, on its top edge rather than its
    // front: it sits directly under the one gap between the lanes and the
    // arcade, and at full height it sealed that gap's only way down to
    // the floor, cutting the arcade off entirely. The front edge (where a
    // player would stand to play) is the one kept intact.
    [16.7, 12.0, 20.4, 13.35],   // pool table 2 (held back from the lane/arcade gap above)
    [13.9, 14.05, 17.6, 15.2],   // pool table 3 (held back from the cue rack)
    [14.1, 17.05, 17.25, 17.55], // cue rack, bottom wall

    // ---- the arcade, top right: three rows, cabinets back to back ----
    // Both the row-to-row gaps and the lane/arcade gap (18.6 to the row's
    // left edge) are held back a bit further than the bare 1.6 unit rule:
    // reach.py's flood fill quantizes to 4px cells, and a corridor only a
    // few px over the brute's own width reads as blocked at that
    // resolution. 1.8-2.0 units gives it real margin.
    //
    // The rows' right edge is ALSO held back from the painted 27.85-27.9,
    // and the staircase block's left edge held back from the rope post at
    // 28.3: without this the arcade is sealed on all four sides for the
    // brute (lanes/wall/pool table 2 below, rows themselves, and this
    // edge), which split the room in two. The rope and the last sliver of
    // the end cabinets in each row are the visible cost.
    [18.6, 0, 20.2, 0.95],      // wall strip: black header over the lanes/arcade gap
    [20.2, 0, 27.2, 2.75],      // arcade row 1: driving cabinets + standup cabinets
    [20.2, 4.6, 27.2, 5.7],     // arcade row 2: cabinets, air hockey, claw machines (held back for the aisle)
    [20.2, 7.55, 27.2, 9.75],   // arcade row 3: cabinets + the prize machine (held back for the aisle)

    // ---- staircase and the motorcycle, right edge, roped off ----
    [29.0, 0, 32, 9.4],

    // ---- karaoke booths, bottom right ----
    // Held back from the painted bottom edge (16.2) same as pool table 3:
    // clearance to the bottom wall (17.6) has to be the GAP minus twice the
    // brute's half-height, not the raw gap itself (16.2 gave 1.4 raw but
    // only 0.1 once inflation on both sides is subtracted). 15.6 gives a
    // real ~0.5 unit corridor.
    [22.3, 11.2, 31.6, 15.6],
  ],

  // No doorway is painted in the left wall, and the rule of thumb ("left
  // edge, mid height") turns out to sit inside the lane 1 end seat: the
  // lanes, the approach furniture, the ball rack and the bar run almost
  // solid down the whole left side with no gap wide enough for a body to
  // stand in. This is the nearest clear patch of that same left wall,
  // below the bar and above the bottom edge.
  playerSpawn: [1.2, 16.6],

  // Spread across the approach, both arcade gaps and the open carpet by
  // the pool tables and karaoke booths. All at least 5 units from the
  // start and clear of every solid above (checked against the brute's
  // box, which is wider than the gap between several pieces of
  // furniture even where the player would fit).
  enemySpawns: [
    [10.0, 11.2], [19.4, 5.0],
    [22.0, 3.75], [25.3, 3.75], [22.0, 6.7], [25.3, 6.7],
    [21.0, 10.8], [13.0, 16.3], [21.2, 13.0], [19.0, 16.3],
  ],

  // Right wall, between the arcade/stairs and the karaoke booths. No door
  // painted there, so this is the right edge at 54% down, shifted clear
  // of the staircase rope above and the booths below.
  exit: [31.55, 9.7, 31.95, 10.9],
};
