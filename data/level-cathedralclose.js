// ============================================================
// OUTSIDE THE CATHEDRAL: Chapter 3, Area 4.
//
// A plate area, like Gonzo's: one painted top-down background
// (core/plates-real.js) with a hand-measured collision layer on
// top of it. This one is QUIET, so there is nothing to fight.
// You come in under the gatehouse at the bottom, cross the close
// to pick up the friend on the bench, and go in through the
// cathedral's west door.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 32 units wide by 18 units tall, and one unit is 48 world px,
// so the close is 1536 x 864 px.
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Cathedral Close/Cathedral Close - game plate.jpg",
// imagine it cut into 32 columns and 18 rows, and read off the
// column and row.
//
// things: one entry per painted thing (footprint and outline); see below.
//
// TUNING NOTE: the chain posts down both sides of the path and the
// chain fence above the paved band are deliberately NOT solid. They
// are a few pixels wide and catching on them would feel broken. The
// flat ledger stones lying in the grass are walked over for the same
// reason; only the standing gravestones block you.
// ============================================================

const CATHEDRALCLOSE_PLATE = {
  sprite: "plate-cathedralclose",
  cols: 32,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> close is 1536 x 864

  // A shade taller than the game's default, to sit right against
  // buildings painted at this scale. Multiplies G.CHAR_H, so a
  // person is 79px out here.
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
    { name: "left close house: roof, front wall, roses", foot: [0, 0, 7.71, 5.4] },
    { name: "low flint wall and the churchyard behind it", foot: [7.71, 0, 10.2, 5.4] },
    { name: "cathedral: north west tower and its plinth", foot: [10.2, 0, 11.6, 6.5] },
    { name: "cathedral: west front, left bay", foot: [11.6, 0, 13.35, 6.2] },
    { name: "cathedral: buttress left of the porch", foot: [13.35, 0, 14.1, 6.5] },
    { name: "cathedral: porch jamb, left of the door", foot: [14.1, 0, 15.4, 6.28] },
    { name: "cathedral: porch jamb, right of the door", foot: [16.9, 0, 18.2, 6.28] },
    { name: "cathedral: buttress right of the porch", foot: [18.2, 0, 18.95, 6.5] },
    { name: "cathedral: west front, right bay", foot: [18.95, 0, 20.7, 6.2] },
    { name: "cathedral: north east tower and its plinth", foot: [20.7, 0, 22.1, 6.5] },
    { name: "low flint wall with the wooden gate in it", foot: [22.1, 0, 24.45, 5.3] },
    { name: "right close house: roof, front wall, roses", foot: [24.45, 0, 32, 5.4] },
    { name: "headstone, far left", foot: [0.64, 6.45, 1.65, 7.9], over: [[0.9, 5.88], [1.31, 5.88], [1.52, 5.98], [1.6, 6.1], [1.64, 7.84], [1.58, 7.94], [1.04, 7.96], [0.66, 7.92], [0.6, 7.85], [0.62, 6.08]] },
    { name: "headstone, left", foot: [2, 6.45, 2.97, 6.88], over: [[2.27, 5.71], [2.65, 5.71], [2.92, 5.96], [2.97, 6.1], [2.97, 6.88], [2.9, 6.93], [2.52, 6.9], [2.05, 6.93], [2, 6.88], [2, 5.98]] },
    { name: "headstone under the left flint wall", foot: [8.2, 6.3, 9, 6.7], over: [[8.44, 5.69], [8.77, 5.69], [8.81, 5.75], [8.94, 5.79], [9.04, 5.92], [9.04, 6.7], [9, 6.73], [8.21, 6.71], [8.15, 6.65], [8.12, 5.92], [8.33, 5.73]] },
    { name: "headstone with the carved cross", foot: [25.19, 6.4, 25.9, 6.84], over: [[25.42, 5.79], [25.67, 5.81], [25.92, 6.04], [25.96, 6.12], [25.96, 6.85], [25.9, 6.9], [25.21, 6.9], [25.12, 6.83], [25.08, 6.15], [25.12, 6.02]] },
    { name: "headstone, far right", foot: [29.44, 6.4, 30.29, 6.84], over: [[29.73, 5.88], [30.06, 5.9], [30.29, 6.12], [30.3, 6.85], [30.27, 6.88], [29.54, 6.9], [29.4, 6.83], [29.42, 6.12], [29.58, 5.94], [29.62, 5.96]] },
    { name: "left lime", foot: [5.1, 11.6, 6.28, 12.06], over: [[4.88, 7.26], [5.43, 7.11], [5.78, 7.16], [6.61, 7.32], [6.96, 7.63], [7.24, 7.94], [7.51, 8.25], [7.79, 8.64], [7.92, 9.19], [7.99, 9.68], [7.97, 10.09], [7.79, 10.58], [7.51, 10.89], [7.24, 11.14], [6.89, 11.34], [6.33, 11.5], [6.32, 11.76], [6.06, 12.05], [5.71, 12.12], [5.36, 12], [5.08, 11.82], [5.05, 11.54], [4.67, 11.41], [4.32, 11.24], [3.97, 11.07], [3.63, 10.93], [3.42, 10.68], [3.24, 10.3], [3.19, 10.03], [3.28, 9.54], [3.22, 9.19], [3.38, 8.7], [3.69, 8.22], [3.76, 7.91], [4.04, 7.63], [4.32, 7.42], [4.6, 7.32]] },
    { name: "right lime", foot: [26.75, 11.9, 27.93, 12.36], over: [[26.53, 7.56], [27.08, 7.41], [27.43, 7.46], [28.26, 7.62], [28.61, 7.93], [28.89, 8.24], [29.16, 8.55], [29.44, 8.94], [29.57, 9.49], [29.64, 9.98], [29.62, 10.39], [29.44, 10.88], [29.16, 11.19], [28.89, 11.44], [28.54, 11.64], [27.98, 11.8], [27.97, 12.06], [27.71, 12.35], [27.36, 12.42], [27.01, 12.3], [26.73, 12.12], [26.7, 11.84], [26.32, 11.71], [25.97, 11.54], [25.62, 11.37], [25.28, 11.23], [25.07, 10.98], [24.89, 10.6], [24.84, 10.33], [24.93, 9.84], [24.87, 9.49], [25.03, 9], [25.34, 8.52], [25.41, 8.21], [25.69, 7.93], [25.97, 7.72], [26.25, 7.62]] },
    { name: "notice board", foot: [12.9, 7.3, 14.12, 7.82], over: [[12.85, 6.62], [12.9, 6.58], [14.12, 6.58], [14.18, 6.64], [14.18, 7.52], [14.1, 7.58], [14.03, 7.58], [14.03, 7.8], [13.97, 7.84], [13.88, 7.84], [13.86, 7.6], [13.17, 7.6], [13.17, 7.82], [13.12, 7.84], [13.03, 7.84], [13, 7.6], [12.92, 7.58], [12.85, 7.52]] },
    { name: "left bench", foot: [9.62, 13.2, 12.18, 13.76], over: [[9.65, 12.5], [9.88, 12.58], [11.96, 12.58], [12.02, 12.52], [12.12, 12.52], [12.2, 12.58], [12.21, 13.72], [12.15, 13.78], [9.9, 13.77], [9.65, 13.8], [9.57, 13.73], [9.57, 12.62]] },
    { name: "right bench", foot: [19.85, 13.2, 22.4, 13.76], over: [[19.9, 12.52], [20.08, 12.58], [22.17, 12.58], [22.25, 12.52], [22.38, 12.56], [22.4, 12.64], [22.4, 13.72], [22.29, 13.8], [20.04, 13.77], [19.88, 13.8], [19.8, 13.73], [19.8, 12.65]] },
    { name: "litter bin", foot: [17.95, 15.05, 18.66, 15.5], over: [[17.97, 14.4], [18.58, 14.4], [18.65, 14.47], [18.66, 15.42], [18.58, 15.5], [17.99, 15.5], [17.92, 15.42], [17.92, 14.47]] },
    { name: "gatehouse: west half, down to the frame", foot: [14.05, 12.85, 15.1, 18] },
    { name: "gatehouse: east half, down to the frame", foot: [16.8, 12.85, 17.9, 18] },
    { name: "outer flint wall and verge, left", foot: [0, 16.1, 14.05, 18] },
    { name: "outer flint wall and verge, right", foot: [17.9, 16.1, 32, 18] },
    { name: "wall 36", foot: [0, 0, 0.4, 18] },
    { name: "wall 37", foot: [31.6, 0, 32, 18] },
    { name: "gatehouse and its arch, walk under", over: [[14.05, 12.85], [17.45, 12.85], [17.45, 18], [16.75, 18], [16.75, 16.2], [16.65, 15.8], [16.4, 15.5], [15.9, 15.25], [15.4, 15.5], [15.15, 15.8], [15.05, 16.2], [15.05, 18], [14.05, 18]], base: 18 },
  ],

  // On the paving inside the gate arch, where you arrive from the
  // street. Dead centre of the passage.
  playerSpawn: [16.05, 17.05],

  // The friend waiting here (quiet area): sat on the grass at the
  // left hand end of the left bench, a third of the way up the lawn.
  companionSpawn: [8.8, 12.95],

  // Nothing ever spawns here, but the schema wants points. All five
  // are open lawn, clear of the trees, the benches and the path
  // furniture by more than half the width of the widest enemy.
  enemySpawns: [
    [10.5, 8.6], [21.5, 8.6], [9.8, 11.8], [22.2, 11.8], [16.1, 10.5],
  ],

  // The west door, standing open. A thin threshold across the mouth
  // of the porch: the next area is inside the cathedral. Locked until
  // the friend has been collected.
  exit: [15.4, 5.8, 16.9, 6.25],
};
