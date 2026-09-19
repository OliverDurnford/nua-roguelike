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

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "outer edge, top", foot: [0, 0, 32, 0.4] },
    { name: "outer edge, bottom", foot: [0, 17.6, 32, 18] },
    { name: "outer edge, left", foot: [0, 0, 0.4, 18] },
    { name: "outer edge, right", foot: [31.6, 0, 32, 18] },
    { name: "red and gold scalloped pediment, black header wall", foot: [1, 0, 18.6, 2.1] },
    { name: "the lanes and pins, down to the foul line", foot: [1, 1.7, 18.6, 7.9] },
    { name: "end seat, lane 1", foot: [1, 8.2, 2.55, 10.15] },
    { name: "ball return machine 1", foot: [3.05, 8.1, 4, 10.05] },
    { name: "seat cluster 1", foot: [4.6, 8.2, 6.6, 10.15] },
    { name: "ball return machine 2", foot: [7.1, 8.1, 8.05, 10.05] },
    { name: "seat cluster 2", foot: [8.65, 8.2, 10.65, 10.15] },
    { name: "ball return machine 3", foot: [11.1, 8.1, 12.1, 10.05] },
    { name: "seat cluster 3", foot: [12.65, 8.2, 14.65, 10.15] },
    { name: "ball return machine 4", foot: [15.1, 8.1, 16.1, 10.05] },
    { name: "end seat, lane 8", foot: [16.65, 8.2, 18.2, 10.15] },
    { name: "rack of bowling balls, left of the approach", foot: [0.5, 10.15, 2.9, 11.3] },
    { name: "bar counter", foot: [0.55, 11.4, 7.7, 15.5], over: [[0.55, 11.1], [7.7, 11.1], [7.7, 15.5], [0.55, 15.5]] },
    { name: "bar counter return", foot: [7.7, 12.7, 8.6, 15.5], over: [[7.7, 12.4], [8.6, 12.4], [8.6, 15.5], [7.7, 15.5]] },
    { name: "pool table 1", foot: [11, 12.45, 14.65, 13.35], over: [[11, 10.85], [14.65, 10.85], [14.65, 13.35], [11, 13.35]] },
    { name: "pool table 2", foot: [16.7, 12.45, 20.4, 13.35], over: [[16.7, 10.85], [20.4, 10.85], [20.4, 13.35], [16.7, 13.35]] },
    { name: "pool table 3", foot: [13.9, 15.8, 17.6, 16.65], over: [[13.9, 13.75], [17.6, 13.75], [17.6, 16.65], [13.9, 16.65]] },
    { name: "cue rack, bottom wall", foot: [14.1, 17.05, 17.25, 17.55] },
    { name: "wall strip: black header over the lanes/arcade gap", foot: [18.6, 0, 20.2, 0.95] },
    { name: "arcade row 1: driving cabinets and standup cabinets", foot: [20.2, 0, 27.2, 2.75] },
    { name: "arcade row 2: cabinets, air hockey, claw machines", foot: [20.2, 5.35, 27.2, 6.15], over: [[20.2, 3.85], [27.2, 3.85], [27.2, 6.15], [20.2, 6.15]] },
    { name: "arcade row 3: cabinets and the prize machine", foot: [20.2, 8.85, 27.2, 9.85], over: [[20.2, 7], [27.2, 7], [27.2, 9.85], [20.2, 9.85]] },
    { name: "staircase and the motorcycle, roped off", foot: [29, 0, 32, 9.4] },
    { name: "karaoke booths", foot: [22.3, 11.2, 31.6, 15.6] },
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
