// ============================================================
// THE BEEHIVE: Chapter 4, Area 3. Estate pub (fight, 8 enemies).
//
// Plate area. Measured off "The Beehive - game plate.jpg": an estate
// pub on the left (0 to about 62%) and its front patio on the right,
// split by a dividing wall with one doorway. Same format as Gonzo's:
// loose stools are walkable, tables and fixed furniture are solid.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/The Beehive/The Beehive - game plate.jpg" cut
// into 32 columns and 18 rows. Unit 0,0 is the top left corner.
// ============================================================

const BEEHIVE_PLATE = {
  sprite: "plate-beehive",
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
    { name: "top wall: scarves, pictures, TV, panelling above the carpet", foot: [0, 0, 19.85, 3.9] },
    { name: "left wall", foot: [0, 0, 0.4, 18] },
    { name: "bottom wall, west of the front door", foot: [0.4, 17, 8.6, 17.6] },
    { name: "bottom wall, east of the front door", foot: [10.95, 17, 19.85, 17.6] },
    { name: "back bar and counter, stools walkable", foot: [6, 0.85, 14.2, 5.3] },
    { name: "the counter's rounded corner, swinging out past the last stool", foot: [14.2, 0.85, 15.15, 5.9] },
    { name: "fruit machine", foot: [17.15, 1.4, 18.6, 4.5] },
    { name: "booth 1 (top), left wall", foot: [0.4, 5.55, 3.65, 9] },
    { name: "booth 2 (middle), left wall", foot: [0.4, 9, 3.55, 12.55] },
    { name: "booth 3 (bottom), left wall", foot: [0.4, 12.55, 3.65, 16.15] },
    { name: "booth 4, bottom right, against the dividing wall", foot: [16, 12.6, 19.05, 16.2] },
    { name: "table by the bar", foot: [5.65, 8.15, 7.55, 9.05], over: [[6.6, 7.55], [7.16, 7.64], [7.5, 7.87], [7.5, 8.16], [7.16, 8.39], [6.6, 8.48], [6.04, 8.39], [5.7, 8.16], [5.7, 7.87], [6.04, 7.64], [6.45, 8.45], [6.2, 9.05], [7, 9.05], [6.75, 8.45]] },
    { name: "table, mid left", foot: [5.65, 13.95, 7.55, 14.85], over: [[6.6, 13.35], [7.16, 13.44], [7.5, 13.67], [7.5, 13.96], [7.16, 14.19], [6.6, 14.28], [6.04, 14.19], [5.7, 13.96], [5.7, 13.67], [6.04, 13.44], [6.45, 14.25], [6.2, 14.85], [7, 14.85], [6.75, 14.25]] },
    { name: "table, mid bottom, by the front door", foot: [10.3, 13.67, 12.85, 14.6], over: [[11.57, 13.05], [12.32, 13.14], [12.79, 13.38], [12.79, 13.68], [12.32, 13.92], [11.57, 14.01], [10.83, 13.92], [10.36, 13.68], [10.36, 13.38], [10.83, 13.14], [11.37, 13.98], [11.04, 14.6], [12.11, 14.6], [11.78, 13.98]] },
    { name: "pool table", foot: [11, 7.6, 15.75, 10.35] },
    { name: "cue rack, mounted on the wall beside it", foot: [15.95, 7.9, 16.55, 9.95] },
    { name: "dividing wall, top of doorway", foot: [18.65, 0, 19.85, 6.5] },
    { name: "dividing wall, bottom of doorway", foot: [18.65, 10, 19.85, 18] },
    { name: "pub frontage: green woodwork, windows, hanging baskets", foot: [19.85, 0, 31.3, 4.7] },
    { name: "right wall, above the gate", foot: [31.3, 0, 32, 6.9] },
    { name: "right wall, below the gate", foot: [31.3, 9.7, 32, 18] },
    { name: "brick wall, railings and flowerbed along the bottom", foot: [19.85, 14.35, 29.5, 17.6] },
    { name: "same, the corner by the gate post", foot: [29.5, 14, 31.3, 18] },
    { name: "picnic bench 1, top left, folded umbrella", foot: [20.3, 6.18, 24.3, 7.4], over: [[22.3, 3.8], [24.3, 4.95], [24.3, 6.18], [20.3, 6.18], [20.3, 4.95]] },
    { name: "picnic bench 2, top right, folded umbrella", foot: [26.7, 6.16, 29.8, 7.4], over: [[28.25, 3.75], [29.8, 4.92], [29.8, 6.16], [26.7, 6.16], [26.7, 4.92]] },
    { name: "picnic bench 3, bottom left, folded umbrella", foot: [20.1, 12.31, 23.9, 13.65], over: [[22, 9.7], [23.9, 10.96], [23.9, 12.31], [20.1, 12.31], [20.1, 10.96]] },
    { name: "picnic bench 4, bottom right, folded umbrella", foot: [27, 12.31, 29.9, 13.65], over: [[28.45, 9.7], [29.9, 10.96], [29.9, 12.31], [27, 12.31], [27, 10.96]] },
  ],

  // Just inside the front door in the bottom wall.
  playerSpawn: [9.75, 16.4],

  // Four in the pub, four on the patio (down the open lane between the two
  // columns of benches, clear of both), all more than 5 units from the start.
  enemySpawns: [
    [10.5,  6.3],  [4.6,   8.0],  [17.6,  9.0],  [4.5,   11.2],
    [25.3,  6.0],  [26.0,  8.5],  [25.2, 11.0],  [26.2,  13.0],
  ],

  // The open gate in the right wall of the patio.
  exit: [31.3, 7.3, 31.85, 9.3],
};
