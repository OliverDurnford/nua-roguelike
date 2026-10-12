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
    { name: "low flint wall and the churchyard behind it", foot: [7.71, 0, 10.2, 5.3] },
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
    { name: "headstone with its tomb slab, far left", foot: [0.64, 5.94, 1.65, 7.9] },
    { name: "headstone, left", foot: [1.98, 5.8, 2.97, 6.88] },
    { name: "headstone under the left flint wall", foot: [8.2, 5.75, 9, 6.7] },
    { name: "headstone with the carved cross, right", foot: [25.19, 5.86, 25.9, 6.84] },
    { name: "headstone, far right", foot: [29.44, 5.94, 30.29, 6.84] },
    { name: "left lime: top of the canopy", foot: [3.95, 7.07, 7.3, 8.2] },
    { name: "left lime: widest part of the canopy", foot: [3.23, 8.2, 7.99, 10.35] },
    { name: "left lime: foot of the canopy", foot: [3.95, 10.35, 7.3, 11.43] },
    { name: "left lime: trunk", foot: [5.1, 11.43, 6.28, 12.05] },
    { name: "right lime: top of the canopy", foot: [25.6, 7.46, 28.9, 8.6] },
    { name: "right lime: widest part of the canopy", foot: [24.9, 8.6, 29.59, 10.7] },
    { name: "right lime: foot of the canopy", foot: [25.6, 10.7, 28.9, 11.83] },
    { name: "right lime: trunk", foot: [26.67, 11.83, 27.92, 12.35] },
    { name: "notice board, left of the path", foot: [12.84, 6.58, 14.19, 7.6] },
    { name: "left bench (the friend is sat here)", foot: [9.61, 12.59, 12.18, 13.76] },
    { name: "right bench", foot: [19.85, 12.59, 22.4, 13.75] },
    { name: "litter bin against the gatehouse", foot: [17.96, 14.37, 18.65, 15.49] },
    { name: "paved walk in front of the wall, left", foot: [0, 13.95, 14.1, 15.05] },
    { name: "paved walk in front of the wall, right", foot: [17.9, 13.95, 32, 15.05] },
    { name: "gatehouse: west half, down to the frame", foot: [14.1, 12.85, 15.2, 18] },
    { name: "gatehouse: east half, down to the frame", foot: [16.9, 12.85, 17.9, 18] },
    { name: "outer flint wall and verge, left", foot: [0, 16.1, 14.1, 18] },
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
