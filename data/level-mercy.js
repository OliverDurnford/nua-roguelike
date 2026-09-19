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
    { name: "upper pier between the archways, with its footing", foot: [15.85, 0, 17.3, 4.7] },
    { name: "wall run right: drinks poster, shallower than the left half", foot: [18.45, 0, 24.3, 3.45] },
    { name: "left speaker on its tripod stand", foot: [24.3, 0, 25.6, 5.25] },
    { name: "booth counter, first step of the diagonal", foot: [25.6, 0, 26.7, 5.95] },
    { name: "booth counter, second step", foot: [26.7, 0, 27.8, 6.7] },
    { name: "booth counter, third step, turntable two", foot: [27.8, 0, 28.9, 7.35] },
    { name: "booth right end: effects rack, laptop, right speaker", foot: [28.9, 0, 31.3, 7.5] },
    { name: "right speaker's tripod feet, poking out below", foot: [30.3, 7.5, 31.3, 8.15] },
    { name: "right wall and its LED strip", foot: [31.3, 0, 32, 18] },
    { name: "left wall below the bar, LED strip included", foot: [0, 8.6, 0.8, 18] },
    { name: "bench arm down the left wall", foot: [0.8, 9.6, 2.6, 15.8] },
    { name: "bench arm along the bottom, ends short of the entrance", foot: [0.8, 15.7, 8.4, 17.45] },
    { name: "round table 1, left, candle jar and pedestal", foot: [3.7, 11.3, 4.55, 11.6], over: [[4.15, 9.7], [4.73, 9.81], [4.97, 10.35], [4.73, 10.89], [4.35, 11], [4.55, 11.3], [4.55, 11.6], [3.7, 11.6], [3.7, 11.3], [3.95, 11], [3.57, 10.89], [3.33, 10.35], [3.57, 9.81]] },
    { name: "round table 2, left", foot: [3.7, 13.45, 4.55, 13.75], over: [[4.15, 11.85], [4.73, 11.96], [4.97, 12.5], [4.73, 13.04], [4.35, 13.15], [4.55, 13.45], [4.55, 13.75], [3.7, 13.75], [3.7, 13.45], [3.95, 13.15], [3.57, 13.04], [3.33, 12.5], [3.57, 11.96]] },
    { name: "round table 3, left", foot: [3.7, 15.25, 4.55, 15.55], over: [[4.15, 13.65], [4.73, 13.76], [4.97, 14.3], [4.73, 14.84], [4.35, 14.95], [4.55, 15.25], [4.55, 15.55], [3.7, 15.55], [3.7, 15.25], [3.95, 14.95], [3.57, 14.84], [3.33, 14.3], [3.57, 13.76]] },
    { name: "bench arm down the right wall", foot: [29.3, 9.65, 31.3, 15.6] },
    { name: "bench arm along the bottom right", foot: [23.4, 15.6, 31.3, 17.45] },
    { name: "round table 1, right, candle jar and pedestal", foot: [27.55, 11.3, 28.4, 11.6], over: [[28, 9.7], [28.58, 9.81], [28.82, 10.35], [28.58, 10.89], [28.2, 11], [28.4, 11.3], [28.4, 11.6], [27.55, 11.6], [27.55, 11.3], [27.8, 11], [27.42, 10.89], [27.18, 10.35], [27.42, 9.81]] },
    { name: "round table 2, right", foot: [27.55, 13.45, 28.4, 13.75], over: [[28, 11.85], [28.58, 11.96], [28.82, 12.5], [28.58, 13.04], [28.2, 13.15], [28.4, 13.45], [28.4, 13.75], [27.55, 13.75], [27.55, 13.45], [27.8, 13.15], [27.42, 13.04], [27.18, 12.5], [27.42, 11.96]] },
    { name: "round table 3, right", foot: [27.55, 15.25, 28.4, 15.55], over: [[28, 13.65], [28.58, 13.76], [28.82, 14.3], [28.58, 14.84], [28.2, 14.95], [28.4, 15.25], [28.4, 15.55], [27.55, 15.55], [27.55, 15.25], [27.8, 14.95], [27.42, 14.84], [27.18, 14.3], [27.42, 13.76]] },
    { name: "lower pier, rises from the front wall, splits the entrance floor", foot: [15.9, 13.3, 17.45, 18] },
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
  exit: [14.65, 2.6, 18.45, 4.45],
};
