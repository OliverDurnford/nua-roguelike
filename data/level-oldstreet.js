// ============================================================
// OLD STREET STATION: Chapter 4, Area 4. A QUIET area, so there
// are no enemies in it: you come up the stairs onto the platform,
// pick up the friend waiting on the bench and carry on.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 32 units wide by 18 units tall, and one unit is 48 world px,
// so the finished platform is 1536 x 864 px.
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Old Street Station/Old Street Station - game
// plate.jpg", imagine it cut into 32 columns and 18 rows, and read
// off the column and row.
//
// things: one entry per painted thing (footprint and outline); see below.
//
// THE SHAPE OF THE ROOM
// The top two fifths are one sealed band: the curved tunnel wall
// with its poster frames, the black tunnel mouth at each end, and
// the track bed. You cannot get onto the rails. The band stops at
// the platform edge, so the white nosing, the yellow line and the
// ribbed tactile strip are all walkable, which is the whole joke
// of standing on the wrong side of it.
//
// The bottom fifth is the cream tiled back wall, cut by the two
// arched exit passages. Those run right down off the picture, and
// the way out is at the foot of the right hand one.
//
// The painted distancing circles are floor markings, not objects,
// so nothing stops you walking over them.
// ============================================================

const OLDSTREET_PLATE = {
  sprite: "plate-oldstreet",
  cols: 32,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> room is 1536 x 864

  // A touch bigger than the game default, so a person reads at the
  // right size against this platform's tiles. Multiplies G.CHAR_H,
  // so a person is 83px down here.
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
    { name: "top edge", foot: [0, 0, 32, 0.4] },
    { name: "bottom edge", foot: [0, 17.6, 32, 18] },
    { name: "left edge", foot: [0, 0, 0.4, 18] },
    { name: "right edge", foot: [31.6, 0, 32, 18] },
    { name: "top wall and track bed", foot: [0, 0, 32, 5.8] },
    { name: "bottom wall left", foot: [0, 13.75, 3, 18] },
    { name: "bottom wall middle", foot: [5.55, 13.75, 26.6, 18] },
    { name: "bottom wall right", foot: [29.15, 13.75, 32, 18] },
    { name: "left bench", foot: [11.54, 11.9, 14.77, 13], over: [[11.5, 11.85], [14.81, 11.85], [14.81, 13.03], [14.62, 13.03], [14.62, 13.35], [14.46, 13.35], [14.46, 13.03], [11.85, 13.03], [11.85, 13.35], [11.7, 13.35], [11.7, 13.03], [11.5, 13.03]] },
    { name: "right bench", foot: [20.45, 11.9, 23.7, 13], over: [[20.41, 11.85], [23.74, 11.85], [23.74, 13.03], [23.54, 13.03], [23.54, 13.35], [23.38, 13.35], [23.38, 13.03], [20.76, 13.03], [20.76, 13.35], [20.61, 13.35], [20.61, 13.03], [20.41, 13.03]] },
    { name: "bin", foot: [16.7, 12.6, 17.62, 13.28], over: [[16.68, 11.9], [17.64, 11.9], [17.64, 13.3], [16.68, 13.3]] },
  ],

  // Up out of the left hand passage, at the head of it: the arch is
  // painted with a curved top, and this is the first row where the
  // passage floor is actually drawn, so you arrive standing in the mouth.
  playerSpawn: [4.27, 14.6],

  // The friend waiting here (quiet area): sat on the near end of the
  // left bench, on the front edge of the seat, so the sprite reads as
  // sitting rather than standing behind it. The benches are hard against
  // the back wall, so this end is the only side you can reach them from.
  companionSpawn: [11.7, 12.9],

  // Never used: this area spawns nothing. Kept so the file matches the
  // schema every other area uses. All four are out on the open platform.
  enemySpawns: [
    [6.5, 9.5], [11.5, 9.0], [21.0, 9.0], [26.0, 9.5],
  ],

  // Way out: across the foot of the right hand passage, flush with the
  // bottom edge so it reads as a threshold.
  exit: [26.85, 17.45, 28.9, 17.86],
};
