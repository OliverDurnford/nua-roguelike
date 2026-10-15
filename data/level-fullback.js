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
    { name: "top ivy wall", foot: [0, 0, 32, 1.85] },
    { name: "left ivy wall", foot: [0, 0, 1, 18] },
    { name: "door, deck A", foot: [1, 3.3, 2.05, 5.75] },
    { name: "right ivy wall, above the gate", foot: [31.15, 0, 32, 12.5] },
    { name: "right ivy wall, below the gate", foot: [31.05, 14.75, 32, 18] },
    { name: "bottom planted fence", foot: [0, 16.65, 32, 18] },
    { name: "raised bamboo bed, deck C", foot: [29.85, 1.8, 30.9, 3.15] },
    { name: "planting, A-B gap north", foot: [9.4, 1.8, 11.25, 3.7], over: [[9.4, 4.6], [9.65, 4.6], [9.65, 5.5], [9.35, 5.5], [9.35, 4.6]] },
    { name: "planting, A-B gap south", foot: [9.4, 5.5, 11, 7] },
    { name: "planting, B-C gap north", foot: [20, 1.8, 21.5, 3.8] },
    { name: "planting, B-C gap south", foot: [19.7, 5.7, 21.65, 7], over: [[19.7, 4.85], [20, 4.85], [20, 5.8], [19.7, 5.8]] },
    { name: "hillside, west of the A-D stairs", foot: [1, 6.7, 4.05, 10.2] },
    { name: "hillside, under A and B", foot: [6.35, 6.85, 21.55, 10.05] },
    { name: "hillside under C, west of the C-F stairs", foot: [21.3, 8.45, 25.2, 10.15] },
    { name: "hillside under C, east of the C-F stairs", foot: [27.55, 8.55, 31.3, 11.05] },
    { name: "planting, D-E gap north", foot: [8.85, 8.95, 10.55, 11.95] },
    { name: "planting, D-E gap south", foot: [8.7, 13.7, 10.6, 16.8], over: [[10.35, 13.3], [10.6, 13.3], [10.6, 13.95], [10.35, 13.95]] },
    { name: "planting, E-F gap north", foot: [20.1, 9.3, 21.95, 12.3] },
    { name: "planting, E-F gap south", foot: [20.1, 14.35, 21.95, 16.9], over: [[20.15, 13.8], [20.45, 13.8], [20.45, 14.35], [20.15, 14.35]] },
    { name: "barrel planter, deck A by the door", foot: [1.15, 2.05, 2.15, 3.5] },
    { name: "barrel planter, deck A by the A-B gap", foot: [8.1, 1.55, 9.65, 3.45] },
    { name: "barrel planter, deck B west", foot: [11.05, 1.7, 12.75, 3.45] },
    { name: "barrel planter, deck B east", foot: [18.5, 1.85, 19.55, 3.3] },
    { name: "barrel planter, deck D by the stairs", foot: [1.35, 10.3, 2.55, 11.2] },
    { name: "barrel planter, deck D bottom corner", foot: [1.15, 15.85, 2.15, 17], over: [[1, 13.85], [1.3, 13.75], [1.56, 13.68], [1.95, 13.62], [2.2, 13.73], [2.5, 14.1], [2.9, 14.42], [2.88, 14.68], [2.6, 14.62], [2.56, 15.05], [2.52, 15.45], [2.36, 15.3], [2.05, 15.3], [2.08, 15.8], [2.17, 15.85], [2.17, 17], [1.15, 17], [1.13, 15.85], [1.22, 15.8], [1.7, 15.78], [1.72, 15.4], [1.3, 15.45], [1.2, 15.55], [1.1, 15.45], [1, 14.9]] },
    { name: "barrel planter, deck E west", foot: [10.85, 9.5, 12, 10.9] },
    { name: "barrel planter, deck E east", foot: [18.95, 9.4, 20.1, 10.9] },
    { name: "barrel planter, deck F by the gate", foot: [29.8, 10.9, 30.85, 11.85] },
    { name: "picnic table, deck A", foot: [3.72, 3, 6.87, 4.02], over: [[3.75, 2.35], [6.85, 2.35], [6.95, 2.7], [6.97, 4.02], [3.62, 4.02], [3.62, 2.5]] },
    { name: "picnic table, deck B", foot: [14.1, 2.95, 17.1, 3.95], over: [[14, 4.12], [14, 2.45], [17.1, 2.45], [17.2, 2.6], [17.2, 4.12]] },
    { name: "picnic table, deck C by the back wall", foot: [24.3, 2.85, 27.48, 3.9], over: [[24.2, 2.25], [27.5, 2.25], [27.58, 2.4], [27.58, 4], [24.2, 4], [24.2, 2.35]] },
    { name: "picnic table, deck D", foot: [2.7, 13.3, 6.35, 13.62], over: [[2.65, 11.7], [6.35, 11.7], [6.45, 11.8], [6.45, 13.62], [2.6, 13.62], [2.6, 11.8]] },
    { name: "picnic table, deck E", foot: [12.95, 12.95, 16.6, 13.27], over: [[12.9, 11.3], [16.6, 11.3], [16.7, 11.4], [16.7, 13.27], [12.85, 13.27], [12.85, 11.4]] },
    { name: "picnic table, deck F", foot: [24.5, 12.75, 28.07, 13.75], over: [[24.45, 12.04], [28.05, 12.04], [28.17, 12.15], [28.17, 13.85], [24.4, 13.85], [24.4, 12.15]] },
    { name: "patio heater, deck A", foot: [7.85, 6.15, 8.55, 6.85], over: [[8.05, 3.84], [8.5, 3.84], [8.8, 3.95], [9.02, 4.1], [9.08, 4.3], [8.95, 4.45], [8.6, 4.52], [8.54, 4.62], [8.55, 4.9], [8.42, 4.98], [8.42, 6.05], [8.64, 6.1], [8.66, 6.75], [8.55, 6.82], [8, 6.82], [7.93, 6.75], [7.95, 6.1], [8.18, 6.05], [8.18, 4.98], [8, 4.9], [8, 4.62], [7.95, 4.52], [7.65, 4.42], [7.52, 4.25], [7.6, 4.08], [7.8, 3.93]] },
    { name: "patio heater, deck B", foot: [18.5, 5.35, 19.15, 6.05], over: [[18.36, 2.87], [18.86, 2.87], [19.13, 2.97], [19.29, 3.18], [19.32, 3.36], [19.14, 3.52], [18.93, 3.59], [19, 3.65], [19, 3.91], [18.82, 3.99], [18.69, 4], [18.69, 5.21], [18.93, 5.16], [19.11, 5.24], [19.15, 6], [19.06, 6.05], [18.38, 6.05], [18.28, 6], [18.25, 5.32], [18.38, 5.13], [18.52, 5.1], [18.52, 4.01], [18.41, 3.99], [18.33, 3.91], [18.33, 3.65], [18.25, 3.59], [18.07, 3.52], [17.91, 3.36], [17.93, 3.18], [18.07, 3]] },
    { name: "patio heater, deck F", foot: [28.98, 14.5, 29.78, 15.55], over: [[29.1, 12.42], [29.65, 12.42], [29.9, 12.55], [30.08, 12.75], [30.1, 12.9], [29.95, 13], [29.6, 13.06], [29.62, 13.2], [29.6, 13.45], [29.48, 13.52], [29.47, 14.5], [29.7, 14.52], [29.72, 15.3], [29.8, 15.45], [29.8, 15.55], [28.95, 15.55], [28.95, 15.45], [29.03, 15.3], [29.03, 14.52], [29.3, 14.5], [29.3, 13.52], [29.18, 13.45], [29.16, 13.2], [29.2, 13.06], [28.85, 13], [28.7, 12.9], [28.7, 12.75], [28.9, 12.55]] },
    { name: "deck B railing", foot: [11.1, 6.7, 19.7, 7], over: [[11.1, 6], [13.95, 6], [13.95, 5.8], [14.2, 5.8], [14.2, 6], [16.85, 6], [16.85, 5.8], [17.1, 5.8], [17.1, 6], [19.7, 6], [19.7, 7], [11.1, 7]], see: true },
    { name: "open umbrella, deck C back", foot: [28.95, 3.7, 29.55, 4.1], over: [[29.2, 0.65], [29.35, 0.65], [29.45, 0.8], [29.5, 1], [29.58, 1.5], [29.68, 2], [29.76, 2.6], [29.78, 3], [29.4, 3.08], [29.34, 3.15], [29.34, 3.6], [29.6, 3.68], [29.67, 3.9], [29.55, 4.1], [29.25, 4.17], [28.95, 4.1], [28.83, 3.9], [28.9, 3.68], [29.2, 3.6], [29.2, 3.15], [29.1, 3.08], [28.72, 3], [28.74, 2.6], [28.83, 2], [28.92, 1.5], [29, 1], [29.1, 0.8]] },
    { name: "end-on table, deck C, top", foot: [29.45, 4.05, 30.75, 5.05], over: [[29.45, 4], [30.75, 4], [30.75, 5.05], [29.45, 5.05]] },
    { name: "end-on table, deck C, middle", foot: [29.45, 5.05, 30.75, 6.05], over: [[29.45, 5.05], [30.75, 5.05], [30.75, 6.05], [29.45, 6.05]] },
    { name: "end-on table, deck C, bottom", foot: [29.3, 6.05, 30.95, 7.08], over: [[29.45, 6.05], [30.75, 6.05], [30.75, 6.4], [30.94, 7.05], [30.72, 7.08], [30.5, 6.78], [29.7, 6.78], [29.5, 7.08], [29.28, 7.05], [29.45, 6.4]] },
    { name: "umbrella stand, deck C table", foot: [29.75, 7.2, 30.4, 7.55], over: [[30.03, 6.75], [30.14, 6.75], [30.14, 7.2], [30.3, 7.25], [30.42, 7.4], [30.4, 7.55], [29.72, 7.55], [29.7, 7.4], [29.85, 7.25], [30.03, 7.2]] },
    { name: "deck C railing left run", foot: [21.4, 7.85, 25, 8.9], over: [[21.4, 7.55], [25, 7.55], [25, 8.9], [21.4, 8.9]], see: true },
    { name: "deck C railing right run", foot: [27.65, 7.85, 31, 8.9], over: [[27.65, 7.55], [31, 7.55], [31, 8.9], [27.65, 8.9]], see: true },
    { name: "deck D railing", foot: [2.15, 16.5, 8.8, 16.9], over: [[2.15, 15.75], [4.7, 15.75], [4.7, 15.55], [4.95, 15.55], [4.95, 15.75], [8.75, 15.75], [8.75, 16.9], [2.15, 16.9]], see: true },
    { name: "lamp post, deck D east", foot: [7.95, 11, 8.42, 11.4], over: [[8.05, 8.5], [8.35, 8.5], [8.47, 8.65], [8.47, 9], [8.4, 9.1], [8.4, 9.38], [8.32, 9.42], [8.32, 10.8], [8.42, 10.9], [8.42, 11.35], [8.3, 11.4], [8, 11.4], [7.9, 11.32], [7.9, 10.9], [8.08, 10.8], [8.08, 9.42], [8, 9.38], [7.95, 9.1], [7.9, 9], [7.9, 8.65]] },
    { name: "umbrella, deck E", foot: [14.12, 10.8, 14.8, 11.15], over: [[14.37, 7.74], [14.47, 7.74], [14.55, 7.95], [14.67, 8.3], [14.8, 8.8], [14.88, 9.04], [14.98, 9.5], [15, 9.95], [14.92, 10.08], [14.55, 10.14], [14.52, 10.65], [14.75, 10.75], [14.8, 11], [14.7, 11.15], [14.2, 11.15], [14.08, 11], [14.12, 10.78], [14.37, 10.65], [14.35, 10.14], [13.95, 10.08], [13.9, 9.95], [13.95, 9.5], [14.04, 9.04], [14.2, 8.3], [14.3, 7.95]] },
    { name: "flower box, deck E", foot: [15.05, 9.95, 16.7, 10.55], over: [[15, 9.65], [15.3, 9.5], [16.5, 9.5], [16.75, 9.65], [16.75, 10.55], [15, 10.55]] },
    { name: "lamp post, deck E", foot: [17, 10.4, 17.48, 10.7], over: [[16.9, 8.45], [17.2, 8.4], [17.3, 8.5], [17.28, 8.95], [17.2, 9.05], [17.37, 9.1], [17.38, 10.08], [17.3, 10.2], [17.45, 10.35], [17.48, 10.7], [17, 10.7], [16.99, 10.4], [17.15, 10.2], [17.15, 9.1], [16.9, 9], [16.83, 8.8], [16.85, 8.55]] },
    { name: "deck E railing", foot: [12, 15.75, 20.25, 16.9], over: [[8.75, 13.3], [9, 13.3], [9, 13.85], [8.75, 13.85]], see: true },
    { name: "lamp post, deck F", foot: [22.3, 11.15, 22.92, 11.55], over: [[22.45, 9.18], [22.65, 9.18], [22.82, 9.3], [22.84, 9.6], [22.75, 9.95], [22.7, 10.05], [22.72, 10.95], [22.9, 11.05], [22.92, 11.5], [22.8, 11.6], [22.4, 11.6], [22.3, 11.5], [22.32, 11.05], [22.48, 10.95], [22.48, 10.05], [22.38, 9.95], [22.3, 9.6], [22.32, 9.3]] },
    { name: "flower box, deck F", foot: [23, 11, 24.55, 11.55], over: [[22.97, 10.7], [23.2, 10.4], [24.3, 10.4], [24.55, 10.7], [24.55, 11.55], [22.97, 11.55]] },
    { name: "deck F railing", foot: [22, 16.45, 31, 16.9], over: [[22, 15.7], [31, 15.7], [31, 16.9], [22, 16.9]], see: true },
    { name: "palm planter, deck E bottom left", foot: [10.65, 16.2, 11.65, 16.75], over: [[10.55, 14.3], [10.62, 14.15], [10.95, 14.1], [11.25, 14.45], [11.45, 14.2], [11.85, 14.05], [12.08, 14.1], [12.15, 14.5], [12.35, 14.85], [12.3, 15], [12, 15], [12, 15.8], [11.85, 15.9], [11.67, 16], [11.67, 16.65], [11.5, 16.75], [10.8, 16.75], [10.63, 16.65], [10.63, 16], [10.35, 15.9], [10.3, 15.6], [10.4, 15.25], [10.15, 14.95], [10.1, 14.8], [10.3, 14.55]] },
    { name: "bamboo planter, deck C", foot: [21.45, 1.75, 23.3, 2.9] },
    { name: "purple pot, deck C", foot: [22.1, 3.2, 22.8, 3.55] },
    { name: "white pot, deck C", foot: [22.2, 2.75, 22.8, 3.2] },
    { name: "red pot, deck C", foot: [22.85, 2.45, 23.65, 3.05] },
    { name: "red pot, deck E", foot: [12.4, 10.2, 13.2, 10.7] },
    { name: "pink pot, deck E west", foot: [13.5, 10, 14, 10.4] },
    { name: "pink pot, deck E east", foot: [18, 10.3, 18.6, 11] },
    { name: "small purple pot, deck E", foot: [10.8, 11.15, 11.4, 11.65] },
    { name: "red pot, deck D top", foot: [2.6, 10.85, 3.5, 11.2] },
    { name: "pink pot, deck D", foot: [7.2, 10.75, 7.8, 11.1] },
    { name: "red pot, deck D bottom", foot: [7.6, 15.15, 8.3, 15.5] },
    { name: "purple pot, deck F", foot: [28.05, 11.05, 28.65, 11.5] },
    { name: "white pot, deck F", foot: [28.9, 11.15, 29.5, 11.5] },
    { name: "urn, deck F", foot: [23.5, 15.15, 23.9, 15.5] },
    { name: "red pot, deck F", foot: [22.5, 15.15, 23.2, 15.5] },
    { name: "thing 71", over: [[11.05, 4.6], [11.3, 4.6], [11.3, 6.05], [11.05, 6.05]] },
    { name: "thing 72", over: [[21.8, 13.8], [22, 13.8], [22, 14.85], [21.8, 14.85]] },
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
