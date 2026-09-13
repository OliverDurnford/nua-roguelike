// ============================================================
// GAMES NIGHT AT THE FLAT: Chapter 5, Area 3.
//
// Plate area: painted background plus hand-measured collision
// rectangles, in the style of level-gonzos.js. A fight area, no
// boss or companion, 12 enemies over three rooms.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/The Flat/The Flat - game plate.jpg" cut
// into 32 columns and 18 rows. Unit 0,0 is the top left corner.
//
// Layout, left to right: the hallway (front door top, coat hooks
// and shoe rack, bike), then a shared column with the kitchen on
// top and the sealed bathroom below it, then the living room. The
// hallway and living room are each one open room top to bottom;
// the only way between them is the short corridor between kitchen
// and bathroom.
// ============================================================

const FLAT_PLATE = {
  sprite: "plate-flat",
  cols: 32,
  rows: 18,
  unit: 48,

  charScale: 1.3,

  solid: [
    // ---- outer edge, so nobody walks off the picture ----
    // Right edge is split so it doesn't cover the exit doorway, and
    // drawn a little thinner (from 31.6, painted wall runs from
    // 31.3): otherwise its own reach past the beanbag and plant
    // beside it seals the approach to the exit just below.
    [0, 0, 32, 0.3],
    [0, 17.7, 32, 18],
    [0, 0, 0.3, 18],
    [31.6, 0, 32, 13.6],
    [31.6, 15.9, 32, 18],

    // ---- hallway ----
    // Coat hooks, hanging coats and the shoe rack against the entry
    // wall: painted as one tall wall-mounted band, like Gonzo's own
    // wall-decor blocks. Loose shoes on the floor below stay walkable.
    [0.25, 0, 3.75, 4.65],
    // The front door itself, shut: painted top-left of the hallway,
    // not at the bottom (the venue brief's percentages don't match
    // the finished plate here; this follows the paint, not the brief).
    [3.7, 0, 5.75, 4.2],

    // Wall between the hallway and the kitchen/bathroom column.
    // No doorway here in the paint: hallway only meets that column
    // via the corridor gap in the middle (8.35 to 10.3).
    [5.8, 0, 6.4, 8.35],
    [5.8, 10.3, 6.4, 17.7],

    // ---- kitchen ----
    // Cabinets, counters, sink and hob along the top wall.
    [6.4, 0, 14.5, 3.9],
    // The cooker/oven unit sits proud of the counter line, with a
    // chair tucked against it (chair stays walkable).
    [10.9, 0, 13.2, 4.9],
    [14.5, 0, 16.6, 5.7],
    // Tall floor cabinet in the near corner, below the counter run.
    [6.4, 3.9, 7.85, 8.2],
    // Kitchen table: smaller than the four chairs around it suggest,
    // the tabletop itself is the part between them. Chairs stay
    // walkable, which leaves clear floor either side of the table
    // (past the west and east chairs) connecting the doorway below
    // up to the counters, wide enough for the brute to pass.
    [10.15, 4.9, 13.15, 6.8],
    // Kitchen's bottom wall, either side of its doorway down into the
    // corridor. Drawn thinner than the painted band, and the left
    // segment cut back further still (true wall runs to 9.5): the
    // full dark band on this wall and the bathroom's wall below leave
    // only ~1.4 units clear, less than the brute's 1.78 unit hitbox,
    // and the table sits close enough behind its own doorway that the
    // brute needs the extra width beside it to get past (reach.py).
    // Sitting each collision line at the inner edge of its band keeps
    // the corridor crossable; the wall-coloured outer part, and this
    // extra sliver by the cabinet, stay walkable.
    [6.4, 8.2, 8.6, 8.35],
    [12.15, 8.2, 16.6, 8.35],

    // Wall between the kitchen/bathroom column and the living room.
    [16.55, 0, 17.05, 8.35],
    [16.55, 10.3, 17.05, 17.7],

    // Sealed bathroom, door shut: one block, per Gonzo's rule for
    // sealed rooms. Top edge raised for the same corridor-clearance
    // reason as the kitchen's bottom wall above.
    [6.4, 10.3, 16.6, 17.7],

    // Bicycle against the hallway wall.
    [0.5, 10.7, 2.25, 15.8],

    // ---- living room ----
    // Back wall: framed prints, fairy lights, polaroids and bunting,
    // the full width of the room (same convention as the hallway's
    // coat wall and Gonzo's own top-wall block).
    [17.05, 0, 31.3, 3.85],
    // L-shaped grey sofa: the long run along the back wall, plus the
    // deeper chaise on the left that reaches further into the room.
    // The chaise is painted from 18.5, but is pulled back further
    // still, to 19.0: the wall gap the corridor arrives through sits
    // at exactly this height (7.3 to 11.0 covers it entirely), and
    // with the second floor lamp also in the way (below), 18.5 left
    // only a sliver beside the lamp, too narrow for the brute. Pulling
    // the chaise back, and the lamp in a little (below), opens enough
    // width for it to get through; the true sofa edge closer to the
    // wall stays visually a little short of its red block here.
    [17.6, 3.85, 25.3, 7.3],
    [19.0, 7.3, 21.5, 11.0],
    // Record player and the stacked game boxes beside it.
    [25.5, 3.6, 28.35, 8.75],
    // Potted plant by the record player/TV corner.
    [29.85, 4.85, 31.1, 6.35],
    // Television (thin, flush against the wall) and its low unit
    // sitting proud of it, cable tangle and controllers on the floor
    // in front stay walkable clutter.
    [29.95, 6.3, 31.3, 11.4],
    [27.9, 8.3, 30.0, 10.3],
    // Coffee table, piled with games; the rug under it is walkable.
    [21.6, 8.05, 26.6, 10.35],
    // The two floor lamps, in the corners either side of the sofa.
    // Second one nudged toward the wall from its painted spot (17.1
    // to 17.8), for the same reason as the chaise above.
    [17.1, 1.5, 17.8, 5.65],
    [16.7, 12.5, 17.4, 17.5],
    // Bookshelf along the bottom wall.
    [17.5, 15.55, 24.2, 17.6],
    // Two beanbags and the second plant, bottom right. The orange
    // beanbag and the plant both pulled in short of where they're
    // actually painted (30.6 and 31.2 respectively): flush against
    // the wall between them they seal off the exit doorway just
    // above, which needs the width to stay reachable.
    [24.05, 14.2, 26.95, 17.5], [27.3, 13.4, 30.5, 17.4],
    [29.75, 13.0, 30.5, 17.4],
  ],

  // Hallway, just inside the front door (which is top-left, not
  // bottom-left: see the note on the door block above).
  playerSpawn: [4.7, 5.9],

  // Twelve, spread hallway / kitchen / living room, all more than
  // 4 units from the start and clear of every solid above. The two
  // kitchen spawns sit in the pocket beside the cabinet, the only
  // part of the counter side the corridor doorway actually reaches
  // once the table and chairs are accounted for.
  enemySpawns: [
    [2.6, 9.6], [3.0, 15.5],
    [8.9, 5.0], [9.0, 6.8],
    [19.5, 12.0], [22.5, 11.8], [25.5, 11.4], [28.3, 11.7],
    [20.5, 14.5], [26.5, 12.3], [27.2, 11.6], [23.0, 13.0],
  ],

  // Door in the living room's right wall through to the bedrooms:
  // not clearly painted as an open doorway (see the wall-thinning
  // note above), so this uses the brief's fallback position, 76 to
  // 88 percent down.
  exit: [31.3, 13.68, 31.95, 15.84],
};
