// ============================================================
// THE FALTERING FULLBACK: Chapter 5, Area 1.
//
// Plate area, hand-measured against the painting. A treehouse
// beer garden: six timber decks (three across the top, three
// across the bottom) joined by narrow gangways and short flights
// of steps, buried in ivy, palms and flowers. Ivy wall along the
// top and both sides, a planted fence along the bottom, a door
// in the left wall onto the top left deck, a gate in the right
// wall off the bottom right deck.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/Faltering Fullback/Faltering Fullback - game plate.jpg"
// cut into 32 columns and 18 rows. Unit 0,0 is the top left corner.
//
// Deck layout (roughly): A top-left, B top-middle, C top-right,
// D bottom-left, E bottom-middle, F bottom-right. They connect in
// a ring: A-B and B-C across the top, A-D and C-F down the sides,
// D-E and E-F across the bottom. B and E do NOT connect directly;
// there is no path through the middle of the picture.
// ============================================================

const FULLBACK_PLATE = {
  sprite: "plate-fullback",
  cols: 32,
  rows: 18,
  unit: 48,

  charScale: 1.15,

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "top ivy wall", foot: [0, 0, 32, 1.8] },
    { name: "left ivy wall", foot: [0, 0, 1, 18] },
    { name: "door, deck A", foot: [1, 3.3, 2.05, 5.75] },
    { name: "right ivy wall, above the gate", foot: [31.3, 0, 32, 12.5] },
    { name: "right ivy wall, below the gate", foot: [31.3, 15.2, 32, 18] },
    { name: "bottom planted fence", foot: [0, 16.9, 32, 18] },
    { name: "raised bamboo bed, deck C", foot: [29.85, 1.8, 30.9, 3.15] },
    { name: "planting, A-B gap north", foot: [9.4, 1.8, 11, 3.6] },
    { name: "planting, A-B gap south", foot: [9.4, 5.5, 11, 7] },
    { name: "planting, B-C gap north", foot: [20, 1.8, 21.5, 3.7] },
    { name: "planting, B-C gap south", foot: [20, 5.7, 21.5, 7] },
    { name: "hillside, west of the A-D stairs", foot: [1, 7, 3.85, 9.6] },
    { name: "hillside, under A and B", foot: [6.9, 7, 19.6, 9.2] },
    { name: "hillside under C, west of the C-F stairs", foot: [21.3, 9, 24.9, 10] },
    { name: "hillside under C, east of the C-F stairs", foot: [27.85, 9, 31.3, 10] },
    { name: "planting, D-E gap north", foot: [8.4, 9.6, 10.1, 12.2] },
    { name: "planting, D-E gap south", foot: [8.4, 14, 10.1, 16.9] },
    { name: "planting, E-F gap north", foot: [20.1, 9.3, 21.95, 12.3] },
    { name: "planting, E-F gap south", foot: [20.1, 14, 21.95, 16.9] },
    { name: "barrel planter, deck A by the door", foot: [1.15, 2.05, 2.15, 3.5] },
    { name: "barrel planter, deck A by the A-B gap", foot: [8.05, 2, 9.05, 3.45] },
    { name: "barrel planter, deck B west", foot: [11.7, 1.9, 12.9, 3.5] },
    { name: "barrel planter, deck B east", foot: [18.5, 1.85, 19.55, 3.3] },
    { name: "barrel planter, deck D by the stairs", foot: [1.5, 9.3, 2.65, 10.5] },
    { name: "barrel planter, deck D bottom corner", foot: [1.15, 15.85, 2.15, 17] },
    { name: "barrel planter, deck E west", foot: [10.15, 9.35, 11.5, 10.85] },
    { name: "barrel planter, deck E east", foot: [18.85, 9.15, 19.85, 10.55] },
    { name: "barrel planter, deck F by the gate", foot: [29.75, 9.5, 30.85, 11.1] },
    { name: "picnic table, deck A", foot: [3.85, 3.75, 6.75, 4.85], over: [[3.85, 2.15], [6.75, 2.15], [6.75, 4.85], [3.85, 4.85]] },
    { name: "picnic table, deck B", foot: [13.7, 3.5, 16.65, 4.4], over: [[13.7, 2.15], [16.65, 2.15], [16.65, 4.4], [13.7, 4.4]] },
    { name: "picnic table, deck C by the back wall", foot: [23.9, 3.65, 27.3, 4.65], over: [[23.9, 2.15], [27.3, 2.15], [27.3, 4.65], [23.9, 4.65]] },
    { name: "picnic table, deck C under the second umbrella", foot: [28.3, 6.05, 29.15, 7.15], over: [[27.6, 1], [29.65, 1], [29.65, 3.9], [29.15, 4], [29.15, 7.15], [28.3, 7.15], [28.3, 4], [27.85, 3.9]] },
    { name: "picnic table, deck D", foot: [2.85, 13.3, 6.6, 14.35], over: [[2.85, 11.75], [6.6, 11.75], [6.6, 14.35], [2.85, 14.35]] },
    { name: "picnic table, deck E", foot: [12.75, 12.75, 16.95, 13.85], over: [[12.75, 11.15], [16.95, 11.15], [16.95, 13.85], [12.75, 13.85]] },
    { name: "picnic table, deck F", foot: [24.15, 13.35, 27.55, 14.35], over: [[24.15, 11.85], [27.55, 11.85], [27.55, 14.35], [24.15, 14.35]] },
    { name: "patio heater, deck A", foot: [7.85, 6.15, 8.55, 6.85], over: [[7.6, 3.85], [9.05, 3.85], [9.05, 4.7], [8.35, 6.15], [8.55, 6.15], [8.55, 6.85], [7.85, 6.85], [7.85, 6.15], [8.05, 6.15], [7.6, 4.7]] },
    { name: "patio heater, deck B", foot: [18.5, 5.35, 19.15, 6.05], over: [[18.15, 2.85], [19.5, 2.85], [19.5, 3.55], [18.95, 5.35], [19.15, 5.35], [19.15, 6.05], [18.5, 6.05], [18.5, 5.35], [18.7, 5.35], [18.15, 3.55]] },
    { name: "patio heater, deck F", foot: [28.75, 14.4, 29.65, 15.55], over: [[28.35, 12.15], [29.65, 12.15], [29.65, 13], [29.3, 14.4], [29.65, 14.4], [29.65, 15.55], [28.75, 15.55], [28.75, 14.4], [29, 14.4], [28.35, 13]] },
  ],

  // Top left deck, just inside the door and clear of the barrel above it.
  playerSpawn: [3.0, 4.6],

  // Eight enemies, at least one per deck, all clear of the solids above.
  // Deck A is small and tight (door, two barrels, a table and a heater
  // all in ~8x5 units), so its spawn is the closest to the start; every
  // other spawn clears 5 units.
  enemySpawns: [
    [7.0, 6.0],    // deck A, the gap between the table and the heater
    [15.0, 5.8],   // deck B
    [23.0, 3.3],   // deck C, by the back table
    [22.3, 6.5],   // deck C, open floor by the B-C gangway
    [5.5, 15.6],   // deck D
    [15.5, 15.3],  // deck E
    [25.2, 15.6],  // deck F
    [30.7, 13.7],  // deck F, by the gate
  ],

  // Thin rectangle in the gate, right wall, off the bottom right deck.
  exit: [31.0, 12.8, 31.9, 14.7],
};
