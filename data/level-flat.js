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

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "outer edge, top", foot: [0, 0, 32, 0.3] },
    { name: "outer edge, bottom", foot: [0, 17.7, 32, 18] },
    { name: "outer edge, left", foot: [0, 0, 0.3, 18] },
    { name: "outer edge, right, upper", foot: [31.6, 0, 32, 13.6] },
    { name: "outer edge, right, lower", foot: [31.6, 15.9, 32, 18] },
    { name: "coat hooks and shoe rack", foot: [0.25, 0, 3.75, 4.65] },
    { name: "front door, shut", foot: [3.7, 0, 5.75, 4.2] },
    { name: "wall, hallway to kitchen column, upper", foot: [5.8, 0, 6.4, 8.35] },
    { name: "wall, hallway to kitchen column, lower", foot: [5.8, 10.3, 6.4, 17.7] },
    { name: "kitchen counters, sink and hob", foot: [6.4, 0, 14.5, 3.9] },
    { name: "cooker unit", foot: [10.9, 0, 13.2, 4.9] },
    { name: "fridge", foot: [14.5, 0, 16.6, 5.7] },
    { name: "tall floor cabinet", foot: [6.4, 3.9, 7.85, 8.2] },
    { name: "kitchen table", foot: [10.15, 6.15, 13.15, 6.8], over: [[10.15, 4.9], [13.15, 4.9], [13.15, 6.8], [10.15, 6.8]] },
    { name: "kitchen bottom wall, west of the doorway", foot: [6.4, 8.2, 8.6, 8.35] },
    { name: "kitchen bottom wall, east of the doorway", foot: [12.15, 8.2, 16.6, 8.35] },
    { name: "wall, kitchen column to living room, upper", foot: [16.55, 0, 17.05, 8.35] },
    { name: "wall, kitchen column to living room, lower", foot: [16.55, 10.3, 17.05, 17.7] },
    { name: "bathroom, door shut", foot: [6.4, 10.3, 16.6, 17.7] },
    { name: "bicycle against the hallway wall", foot: [0.5, 10.7, 2.25, 15.8] },
    { name: "living room back wall: prints, fairy lights, bunting", foot: [17.05, 0, 31.3, 3.85] },
    { name: "sofa, main run", foot: [17.6, 6.45, 25.3, 7.3], over: [[17.6, 3.85], [25.3, 3.85], [25.3, 7.3], [17.6, 7.3]] },
    { name: "sofa, chaise", foot: [19, 10.05, 21.5, 11], over: [[19, 7.3], [21.5, 7.3], [21.5, 11], [19, 11]] },
    { name: "record player and stacked game boxes", foot: [25.5, 3.6, 28.35, 8.75] },
    { name: "potted plant, record player corner", foot: [29.85, 4.85, 31.1, 6.35] },
    { name: "television and its wall unit", foot: [29.95, 6.3, 31.3, 11.4] },
    { name: "TV console, low unit in front", foot: [27.9, 8.3, 30, 10.3] },
    { name: "coffee table", foot: [21.6, 8.05, 26.6, 10.35] },
    { name: "floor lamp, sofa corner", foot: [17.1, 1.5, 17.8, 5.65] },
    { name: "floor lamp, bookshelf corner", foot: [16.7, 12.5, 17.4, 17.5] },
    { name: "bookshelf along the bottom wall", foot: [17.5, 16.9, 24.2, 17.6], over: [[17.5, 15.55], [24.2, 15.55], [24.2, 17.6], [17.5, 17.6]] },
    { name: "beanbag, orange", foot: [24.05, 14.2, 26.95, 17.5] },
    { name: "beanbag, second, and the second plant", foot: [27.3, 13.4, 30.5, 17.4] },
    { name: "potted plant, bottom right corner", foot: [29.75, 13, 30.5, 17.4] },
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
