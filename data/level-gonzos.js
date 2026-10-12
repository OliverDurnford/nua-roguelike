// ============================================================
// GONZO'S: Chapter 1, Area 1.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 32 units wide by 18 units tall, and one unit is 48 world px,
// so the finished room is 1536 x 864 px (about 1.6 screens wide
// and 1.6 screens tall).
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Gonzos/Gonzos_Level.jpg", imagine it cut into
// 32 columns and 18 rows, and read off the column and row.
//
// things: one entry per painted thing (footprint and outline); see below.
//
// TUNING NOTE: loose chairs are deliberately NOT solid. You walk
// straight over them. Only tables, benches, the bar and the walls
// block you, which keeps the room cluttered to look at but clean
// to move through. Add a chair here if it should get in the way.
// ============================================================

const GONZOS_PLATE = {
  sprite: "plate-gonzos",
  cols: 32,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> room is 1536 x 864

  // Everyone stands 30% taller in here than the game's default, because
  // this room's furniture is painted bigger than the placeholder levels.
  // Multiplies G.CHAR_H, so a person is 94px on this floor. Each painted
  // venue gets its own number.
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
    { name: "commercial kitchen", foot: [0, 0, 9.55, 7.65] },
    { name: "both toilet blocks", foot: [0, 7.65, 6.5, 18] },
    { name: "corridor wall: fairy lights, pictures, extinguisher", foot: [6.5, 7.65, 9.55, 10.85] },
    { name: "stairwell and back bar", foot: [9.55, 0, 18.95, 8.25] },
    { name: "bar counter", foot: [9.55, 8.4, 18, 10.6] },
    { name: "bar counter return", foot: [18, 6.5, 19, 10.6] },
    { name: "top wall: pictures, taxidermy, string lights", foot: [18.95, 0, 29.4, 2.9] },
    { name: "grandfather clock", foot: [19.3, 2.9, 21, 4.45] },
    { name: "right wall and the big gilt frame", foot: [29.4, 0, 32, 18] },
    { name: "bench along the top", foot: [21.2, 2.9, 29.4, 4.6] },
    { name: "banquette table 1", foot: [21.75, 5.4, 22.75, 6.13], over: [[21.47, 5.19], [21.35, 4.93], [21.39, 4.66], [21.58, 4.42], [21.88, 4.26], [22.25, 4.2], [22.62, 4.26], [22.92, 4.42], [23.11, 4.66], [23.15, 4.93], [23.03, 5.19], [22.37, 5.52], [22.37, 5.63], [22.67, 5.71], [22.67, 6.01], [22.46, 6.13], [22.04, 6.13], [21.83, 6.01], [21.83, 5.71], [22.13, 5.63], [22.13, 5.52]] },
    { name: "banquette table 2", foot: [24.55, 5.4, 25.55, 6.08], over: [[24.27, 5.14], [24.15, 4.88], [24.19, 4.61], [24.38, 4.37], [24.68, 4.21], [25.05, 4.15], [25.42, 4.21], [25.72, 4.37], [25.91, 4.61], [25.95, 4.88], [25.83, 5.14], [25.17, 5.47], [25.17, 5.58], [25.47, 5.66], [25.47, 5.96], [25.26, 6.08], [24.84, 6.08], [24.63, 5.96], [24.63, 5.66], [24.93, 5.58], [24.93, 5.47]] },
    { name: "banquette table 3", foot: [27.3, 5.4, 28.3, 6.13], over: [[27.02, 5.19], [26.9, 4.93], [26.94, 4.66], [27.13, 4.42], [27.43, 4.26], [27.8, 4.2], [28.17, 4.26], [28.47, 4.42], [28.66, 4.66], [28.7, 4.93], [28.58, 5.19], [27.92, 5.52], [27.92, 5.63], [28.22, 5.71], [28.22, 6.01], [28.01, 6.13], [27.59, 6.13], [27.38, 6.01], [27.38, 5.71], [27.68, 5.63], [27.68, 5.52]] },
    { name: "side table with the candle", foot: [27.6, 10.2, 28.95, 10.8], over: [[27.54, 9], [28.98, 9], [28.98, 10.8], [28.79, 10.8], [28.79, 10.45], [28.6, 10.45], [28.6, 10.91], [27.86, 10.91], [27.86, 10.45], [27.75, 10.45], [27.75, 10.8], [27.54, 10.8]] },
    { name: "DJ speaker, left", over: [[24.73, 14.91], [25.2, 14.76], [25.54, 15.01], [25.54, 15.87], [25.1, 16.07], [24.74, 15.91]] },
    { name: "DJ speaker, right", foot: [27.95, 14.2, 28.7, 14.6], over: [[27.97, 13.59], [28.42, 13.38], [28.78, 13.74], [28.79, 14.45], [28.33, 14.67], [28.01, 14.5]] },
    { name: "round table at the foot of the rug", foot: [21.7, 15.4, 22.4, 16], over: [[21.27, 15], [21.15, 14.72], [21.19, 14.43], [21.38, 14.18], [21.68, 14.01], [22.05, 13.95], [22.42, 14.01], [22.72, 14.18], [22.91, 14.43], [22.95, 14.72], [22.83, 15], [22.17, 15.3], [21.93, 15.3]] },
    { name: "round table, middle of the floor", foot: [16.45, 14, 17.35, 14.75], over: [[16.25, 13.66], [16.15, 13.4], [16.19, 13.12], [16.34, 12.87], [16.59, 12.71], [16.9, 12.65], [17.21, 12.71], [17.46, 12.87], [17.61, 13.12], [17.65, 13.4], [17.55, 13.66], [17.01, 14], [17.01, 14.3], [17.35, 14.38], [17.35, 14.63], [17.13, 14.75], [16.68, 14.75], [16.45, 14.63], [16.45, 14.38], [16.79, 14.3], [16.79, 14]] },
    { name: "square table, bottom of the floor", foot: [17.15, 17.2, 17.95, 17.6], over: [[16.81, 15.81], [18.27, 15.81], [18.27, 17.2], [17.95, 17.2], [17.95, 17.6], [17.14, 17.6], [17.14, 17.2], [16.81, 17.2]] },
    { name: "bottom edge of the picture", foot: [0, 17.8, 32, 18] },
    { name: "disco ball and its cord", over: [[25.05, 6.15], [25.05, 6.98], [25.2, 7.02], [25.33, 7.08], [25.44, 7.17], [25.52, 7.28], [25.59, 7.41], [25.62, 7.55], [25.62, 7.69], [25.59, 7.83], [25.52, 7.96], [25.44, 8.07], [25.33, 8.16], [25.2, 8.22], [25.07, 8.26], [24.93, 8.26], [24.8, 8.22], [24.67, 8.16], [24.56, 8.07], [24.48, 7.96], [24.41, 7.83], [24.38, 7.69], [24.38, 7.55], [24.41, 7.41], [24.48, 7.28], [24.56, 7.17], [24.67, 7.08], [24.8, 7.02], [24.95, 6.98], [24.95, 6.15]], base: 9.75 },
    { name: "DJ decks", foot: [24.7, 16.67, 25.8, 17.49], over: [[24.73, 15.54], [24.73, 14.92], [25.2, 14.76], [25.54, 15.01], [25.54, 15.21], [25.73, 15.13], [25.8, 15.1], [25.8, 16.94], [25.77, 16.95], [25.77, 17.49], [25.57, 17.51], [25.51, 17.45], [25.51, 16.95], [24.93, 16.14], [24.93, 16.99], [24.79, 17.03], [24.7, 16.95], [24.7, 15.56]] },
    { name: "DJ decks, 2nd piece", foot: [25.8, 16.24, 27.2, 17.43], over: [[26.45, 14.83], [26.9, 14.61], [27.2, 14.51], [27.2, 16.32], [25.8, 16.94], [25.8, 15.1]] },
    { name: "DJ decks, 3rd piece", foot: [27.2, 15.79, 28.6, 16.96], over: [[27.45, 14.43], [27.96, 14.14], [27.97, 13.59], [28.42, 13.38], [28.6, 13.55], [28.6, 15.71], [27.2, 16.32], [27.2, 14.51]] },
    { name: "DJ decks, right end", foot: [28.6, 15.79, 29.25, 16.56], over: [[28.78, 13.73], [28.79, 14.46], [28.81, 14.53], [28.93, 14.58], [29.25, 14.99], [29.25, 15.43], [29.24, 15.44], [29.24, 16.3], [29.09, 16.33], [28.98, 16.26], [28.98, 15.54], [28.6, 15.71], [28.6, 13.55]] },
  ],

  // Dead centre of the Persian rug, under the mirrorball.
  // (The rug runs 21.26 to 26.38 across, 8.79 to 15.92 down.)
  playerSpawn: [23.8, 12.35],

  // Two ways in, both marked on Ollie's annotated screenshot.
  // Top four: the doorway beside the bar, where the stairs come down.
  // Bottom four: the corridor mouth at the bottom of the room.
  //
  // These are held clear of the walls by more than half the width of the
  // widest enemy (the brute), so nothing ever arrives inside the scenery.
  // If G.CHAR_H goes up, check them again.
  enemySpawns: [
    [19.95, 5.6], [20.25, 6.5], [19.95, 7.4], [20.25, 8.3],
    [10.6, 16.8], [11.5, 16.8], [12.4, 16.8], [13.2, 16.8],
  ],

  // Way out, bottom left, past the toilets. Sits flush with the bottom
  // edge so it reads as a threshold. Locked until the room is clear.
  exit: [7, 17, 8.7, 17.84],
};
