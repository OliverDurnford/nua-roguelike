// ============================================================
// MERCY, FIRST ROOM: Chapter 1, Area 3.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 32 units wide by 18 units tall, and one unit is 48 world px,
// so the finished room is 1536 x 864 px (about 1.6 screens wide
// and 1.6 screens tall), the same footprint as Gonzo's.
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Mercy First Room/Mercy first room Level
// Design.jpeg", imagine it cut into 32 columns and 18 rows, and
// read off the column and row.
//
// things: one entry per painted thing (footprint and outline); see below.
//
// TUNING NOTE: this is the busiest fight of the chapter, nine
// enemies, so the middle of the floor stays one big open channel.
// The dropped cups, tokens and lost shoes on the floor are all
// walkable clutter. Only the bar, the benches, the tables, the
// DJ booth, the two piers and the walls block you.
// ============================================================

const MERCY_PLATE = {
  sprite: "plate-mercy",
  cols: 32,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> room is 1536 x 864

  // Everyone stands 15% taller in here than the game's default.
  // Measured off the furniture: the round pedestal tables paint at
  // 84 world px across against Gonzo's 91 px, where people are 94 px,
  // so straight parity with Gonzo's would say about 1.2. This room is
  // meant to play roomier than Gonzo's though, it is the warm-up box
  // before the main room and it takes the chapter's biggest wave, so
  // it sits just under parity. A person is 83 px on this floor and
  // the central channel reads about 13 people wide.
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
    { name: "whole bar corner, shelves to rail posts", foot: [0, 0, 9.75, 8.6] },
    { name: "wall run: exit sign, framed board, cigarette machine", foot: [9.75, 0, 14.65, 4] },
    { name: "the two archway thresholds, next room's floor beyond", foot: [14.65, 0, 18.45, 2.7] },
    { name: "archway frame, walk under", over: [[14.51, 0.42], [18.56, 0.42], [18.56, 3.93], [18.42, 3.93], [18.42, 0.5], [14.64, 0.5], [14.64, 3.93], [14.51, 3.93]], base: 3.95 },
    { name: "archway lintel face, left of the pier, walk under", over: [[14.64, 0.5], [15.99, 0.5], [15.99, 2.6], [14.64, 2.6]], base: 3.95 },
    { name: "archway lintel face, right of the pier, walk under", over: [[17.19, 0.5], [18.42, 0.5], [18.42, 2.6], [17.19, 2.6]], base: 3.95 },
    { name: "upper pier, top", foot: [15.85, 0, 17.3, 2.7], over: [[15.99, 0.47], [17.19, 0.47], [17.19, 2.7], [15.99, 2.7]] },
    { name: "upper pier, middle", foot: [15.85, 2.7, 17.3, 3.75], over: [[15.99, 2.7], [17.19, 2.7], [17.19, 3.75], [15.99, 3.75]] },
    { name: "upper pier, footing", foot: [15.85, 3.75, 17.3, 4.7], over: [[15.99, 3.75], [17.19, 3.75], [17.19, 4.4], [17.28, 4.4], [17.28, 4.77], [15.89, 4.77], [15.89, 4.4], [15.99, 4.4]] },
    { name: "wall run right: drinks poster, down to the floor", foot: [18.45, 0, 24.3, 3.95] },
    { name: "left speaker on its tripod stand", foot: [24.3, 0, 25.6, 5], over: [[24.44, 1.15], [24.89, 0.8], [25.5, 1.04], [25.5, 2.4], [25, 2.58], [25, 4.17], [25.47, 4.46], [25.46, 4.57], [25.07, 4.44], [25, 4.97], [24.92, 4.97], [24.86, 4.44], [24.44, 4.57], [24.42, 4.48], [24.92, 4.17], [24.92, 2.58], [24.44, 2.36]], base: 4.97 },
    { name: "booth counter, first slice of the diagonal front", foot: [25.6, 0, 26.15, 5.6], over: [[25.6, 3.57], [26.15, 3.07], [26.15, 5.66], [25.6, 5.3]] },
    { name: "booth counter, second slice of the diagonal front", foot: [26.15, 0, 26.7, 5.95], over: [[26.15, 3.07], [26.42, 2.83], [26.7, 3.01], [26.7, 6.03], [26.15, 5.66]] },
    { name: "booth counter, third slice of the diagonal front", foot: [26.7, 0, 27.25, 6.4], over: [[26.7, 3.01], [27.25, 3.34], [27.25, 6.39], [26.7, 6.03]] },
    { name: "booth counter, fourth slice of the diagonal front", foot: [27.25, 0, 27.8, 6.7], over: [[27.25, 3.34], [27.8, 3.67], [27.8, 6.75], [27.25, 6.39]] },
    { name: "booth counter, fifth slice of the diagonal front", foot: [27.8, 0, 28.35, 7.05], over: [[27.8, 3.67], [28.35, 4.01], [28.35, 7.12], [27.8, 6.75]] },
    { name: "booth counter, sixth slice of the diagonal front", foot: [28.35, 0, 28.9, 7.35], over: [[28.35, 4.01], [28.67, 4.2], [28.9, 4.34], [28.9, 7.33], [28.67, 7.33], [28.35, 7.12]] },
    { name: "booth right end: effects rack, laptop, right speaker", foot: [28.9, 0, 31.3, 7.5], over: [[28.9, 4.34], [28.9, 4.34], [28.9, 3.06], [29.14, 2.97], [29.51, 2.21], [30.15, 2.44], [30.08, 3.04], [30.74, 3.18], [30.76, 4.79], [31.3, 4.86], [31.3, 7.33], [28.9, 7.33]] },
    { name: "right speaker's tripod feet, poking out below", foot: [30.3, 7.5, 31.3, 8.15], over: [[30.29, 4.31], [30.79, 3.96], [31.31, 4.2], [31.31, 5.49], [30.85, 5.68], [30.85, 7.22], [31.35, 7.57], [31.35, 7.67], [30.96, 7.57], [30.85, 8.09], [30.75, 8.09], [30.65, 7.57], [30.24, 7.67], [30.22, 7.57], [30.75, 7.22], [30.75, 5.68], [30.31, 5.56]] },
    { name: "right wall and its LED strip", foot: [31.3, 0, 32, 18] },
    { name: "left wall below the bar, LED strip included", foot: [0, 8.6, 0.8, 18] },
    { name: "bench arm down the left wall, 1", foot: [0.8, 9.6, 2.6, 10.63], over: [[0.8, 9.6], [1.56, 9.6], [1.56, 9.75], [2.68, 9.75], [2.68, 10.63], [0.8, 10.63]] },
    { name: "bench arm down the left wall, corner", foot: [0.8, 8.9, 1.6, 9.6], over: [[0.8, 8.95], [1.3, 8.86], [1.55, 9.35], [1.56, 9.6], [0.8, 9.6]] },
    { name: "bench arm down the left wall, 2", foot: [0.8, 10.63, 2.6, 11.67], over: [[0.8, 10.63], [2.68, 10.63], [2.68, 11.67], [0.8, 11.67]] },
    { name: "bench arm down the left wall, 3", foot: [0.8, 11.67, 2.6, 12.7], over: [[0.8, 11.67], [2.68, 11.67], [2.68, 12.7], [0.8, 12.7]] },
    { name: "bench arm down the left wall, 4", foot: [0.8, 12.7, 2.6, 13.73], over: [[0.8, 12.7], [2.68, 12.7], [2.68, 13.73], [0.8, 13.73]] },
    { name: "bench arm down the left wall, 5", foot: [0.8, 13.73, 2.6, 14.77], over: [[0.8, 13.73], [2.68, 13.73], [2.68, 14.77], [0.8, 14.77]] },
    { name: "bench arm down the left wall, 6", foot: [0.8, 14.77, 2.6, 15.8], over: [[0.8, 14.77], [2.68, 14.77], [2.68, 15.8], [0.8, 15.8]] },
    { name: "bench arm along the bottom, ends short of the entrance", foot: [0.8, 15.7, 8.4, 17.45], over: [[0.83, 17.46], [0.83, 16.9], [1.6, 16.7], [2.65, 15.85], [8.2, 15.85], [8.35, 16], [8.4, 16.7], [8.4, 17.46]] },
    { name: "round table 1, left, candle jar and pedestal", foot: [3.7, 11.3, 4.55, 11.6], over: [[4.16, 11.11], [4.45, 11.05], [4.69, 10.93], [4.86, 10.76], [4.95, 10.55], [4.94, 10.33], [4.83, 10.13], [4.63, 9.97], [4.37, 9.87], [4.08, 9.83], [3.8, 9.87], [3.54, 9.97], [3.34, 10.13], [3.23, 10.33], [3.22, 10.55], [3.31, 10.76], [3.48, 10.93], [3.72, 11.05], [4.01, 11.11], [3.97, 11.29], [3.78, 11.37], [3.71, 11.48], [3.76, 11.58], [3.9, 11.65], [4.08, 11.68], [4.27, 11.65], [4.41, 11.58], [4.46, 11.48], [4.39, 11.37], [4.2, 11.29]] },
    { name: "round table 2, left", foot: [3.7, 13.45, 4.55, 13.75], over: [[4.16, 13.05], [4.45, 13], [4.69, 12.88], [4.86, 12.7], [4.95, 12.5], [4.94, 12.28], [4.83, 12.08], [4.63, 11.92], [4.37, 11.81], [4.08, 11.78], [3.8, 11.81], [3.54, 11.92], [3.34, 12.08], [3.23, 12.28], [3.22, 12.5], [3.31, 12.7], [3.48, 12.88], [3.72, 13], [4.01, 13.05], [3.97, 13.23], [3.78, 13.31], [3.71, 13.43], [3.76, 13.53], [3.9, 13.6], [4.08, 13.62], [4.27, 13.6], [4.41, 13.53], [4.46, 13.43], [4.39, 13.31], [4.2, 13.23]] },
    { name: "round table 3, left", foot: [3.7, 15.25, 4.55, 15.55], over: [[4.16, 15], [4.45, 14.94], [4.69, 14.82], [4.86, 14.65], [4.95, 14.44], [4.94, 14.22], [4.83, 14.02], [4.63, 13.86], [4.37, 13.76], [4.08, 13.72], [3.8, 13.76], [3.54, 13.86], [3.34, 14.02], [3.23, 14.22], [3.22, 14.44], [3.31, 14.65], [3.48, 14.82], [3.72, 14.94], [4.01, 15], [3.97, 15.18], [3.78, 15.26], [3.71, 15.37], [3.76, 15.47], [3.9, 15.54], [4.08, 15.57], [4.27, 15.54], [4.41, 15.47], [4.46, 15.37], [4.39, 15.26], [4.2, 15.18]] },
    { name: "bench arm down the right wall, 1", foot: [29.3, 9.65, 31.3, 10.64], over: [[29.32, 9.75], [30.42, 9.75], [30.42, 9.65], [31.25, 9.65], [31.25, 10.64], [29.32, 10.64]] },
    { name: "bench arm down the right wall, corner", foot: [30.4, 8.87, 31.3, 9.65], over: [[30.45, 9.3], [30.83, 8.87], [31.25, 8.87], [31.25, 9.65], [30.42, 9.65]] },
    { name: "bench arm down the right wall, 2", foot: [29.3, 10.64, 31.3, 11.63], over: [[29.32, 10.64], [31.25, 10.64], [31.25, 11.63], [29.32, 11.63]] },
    { name: "bench arm down the right wall, 3", foot: [29.3, 11.63, 31.3, 12.62], over: [[29.32, 11.63], [31.25, 11.63], [31.25, 12.62], [29.32, 12.62]] },
    { name: "bench arm down the right wall, 4", foot: [29.3, 12.62, 31.3, 13.62], over: [[29.32, 12.62], [31.25, 12.62], [31.25, 13.62], [29.32, 13.62]] },
    { name: "bench arm down the right wall, 5", foot: [29.3, 13.62, 31.3, 14.61], over: [[29.32, 13.62], [31.25, 13.62], [31.25, 14.61], [29.32, 14.61]] },
    { name: "bench arm down the right wall, 6", foot: [29.3, 14.61, 31.3, 15.6], over: [[29.32, 14.61], [31.25, 14.61], [31.25, 15.6], [29.32, 15.6]] },
    { name: "bench arm along the bottom right", foot: [23.9, 15.6, 31.3, 17.45], over: [[23.86, 17.46], [23.86, 16], [24, 15.85], [29.3, 15.85], [30.4, 16.7], [31.2, 16.75], [31.3, 17.46]] },
    { name: "round table 1, right, candle jar and pedestal", foot: [27.55, 11.3, 28.4, 11.6], over: [[28, 11.11], [28.29, 11.05], [28.53, 10.93], [28.7, 10.76], [28.79, 10.55], [28.78, 10.33], [28.67, 10.13], [28.47, 9.97], [28.21, 9.87], [27.93, 9.83], [27.64, 9.87], [27.38, 9.97], [27.18, 10.13], [27.07, 10.33], [27.06, 10.55], [27.15, 10.76], [27.32, 10.93], [27.56, 11.05], [27.85, 11.11], [27.81, 11.29], [27.62, 11.37], [27.55, 11.48], [27.6, 11.58], [27.74, 11.65], [27.93, 11.68], [28.11, 11.65], [28.25, 11.58], [28.3, 11.48], [28.23, 11.37], [28.04, 11.29]] },
    { name: "round table 2, right", foot: [27.55, 13.45, 28.4, 13.75], over: [[28, 13.05], [28.29, 13], [28.53, 12.88], [28.7, 12.7], [28.79, 12.5], [28.78, 12.28], [28.67, 12.08], [28.47, 11.92], [28.21, 11.81], [27.93, 11.78], [27.64, 11.81], [27.38, 11.92], [27.18, 12.08], [27.07, 12.28], [27.06, 12.5], [27.15, 12.7], [27.32, 12.88], [27.56, 13], [27.85, 13.05], [27.81, 13.23], [27.62, 13.31], [27.55, 13.43], [27.6, 13.53], [27.74, 13.6], [27.93, 13.62], [28.11, 13.6], [28.25, 13.53], [28.3, 13.43], [28.23, 13.31], [28.04, 13.23]] },
    { name: "round table 3, right", foot: [27.55, 15.25, 28.4, 15.55], over: [[28, 15], [28.29, 14.94], [28.53, 14.82], [28.7, 14.65], [28.79, 14.44], [28.78, 14.22], [28.67, 14.02], [28.47, 13.86], [28.21, 13.76], [27.93, 13.72], [27.64, 13.76], [27.38, 13.86], [27.18, 14.02], [27.07, 14.22], [27.06, 14.44], [27.15, 14.65], [27.32, 14.82], [27.56, 14.94], [27.85, 15], [27.81, 15.18], [27.62, 15.26], [27.55, 15.37], [27.6, 15.47], [27.74, 15.54], [27.93, 15.57], [28.11, 15.54], [28.25, 15.47], [28.3, 15.37], [28.23, 15.26], [28.04, 15.18]] },
    { name: "lower pier, 1", foot: [15.9, 13.3, 17.45, 14.4], over: [[15.96, 13.33], [17.36, 13.33], [17.36, 14.4], [15.96, 14.4]] },
    { name: "lower pier, 2", foot: [15.9, 14.4, 17.45, 15.5], over: [[15.96, 14.4], [17.36, 14.4], [17.36, 15.2], [17.49, 15.2], [17.49, 15.5], [15.83, 15.5], [15.83, 15.2], [15.96, 15.2]] },
    { name: "lower pier, 3", foot: [15.9, 15.5, 17.45, 16.6], over: [[15.83, 15.5], [17.49, 15.5], [17.49, 16.6], [15.83, 16.6]] },
    { name: "lower pier, 4", foot: [15.9, 16.6, 17.45, 17.45], over: [[15.83, 16.6], [17.49, 16.6], [17.49, 17.45], [15.83, 17.45]] },
    { name: "bottom edge of the picture", foot: [0, 17.4, 32, 18] },
  ],

  // On the rubber entrance mat, just in from the street door,
  // with the lower pier for cover immediately to the right.
  playerSpawn: [12.0, 16.2],

  // Three ways in. Four each at the two archways from the main room,
  // where the noise is coming from, and two behind you at the street
  // door, because this room does not fight fair.
  //
  // These are held clear of every solid by more than half the width of
  // the widest enemy (the brute), 1.2 units or better, checked point by
  // point. If G.CHAR_H or charScale goes up, check them again.
  enemySpawns: [
    [13.9, 5.6], [13.2, 6.4], [15.1, 6.2], [14.6, 7.0],   // left archway
    [17.9, 5.9], [19.2, 5.2], [18.6, 6.9], [19.9, 6.3],   // right archway
    [10.6, 15.0], [13.6, 15.0],                            // street door, behind the player
  ],

  // Way out, through either archway in the back wall towards the main
  // room. One band across both doorway mouths; the upper pier's solid
  // sits over the middle of it, so only the two openings and the
  // threshold strip in front actually trigger. Locked until the room
  // is clear.
  exit: [14.75, 2.75, 15.75, 3.85],
};
