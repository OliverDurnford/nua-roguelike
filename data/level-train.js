// ============================================================
// THE TRAIN CARRIAGE: Chapter 4, Area 1. A fight area, 7 enemies,
// played left to right.
//
// Plate area: painted background (core/plates-real.js, two tiles
// side by side) with a hand-measured collision layer. The train
// runs left to right through the middle of the frame, night above
// and below. It was painted in two passes and reads as two
// carriages end to end: the first carriage (roughly 0 to 30) has
// a vestibule with shut sliding doors, a bike and a bin halfway
// along; the two carriages meet at a seam around 30 to 32 (both
// carriages' end walls plus the gap between them); the second
// carriage (32 to 48) has a cafe bar counter and a second luggage
// rack along its top, and a toilet cubicle at its far right end.
// The burgundy aisle runs the full length and stays open through
// the seam (the connecting door) and off the right edge (the way
// out); only the left edge is a hard stop, there is nothing before
// it.
//
// The aisle's own top edge is a rock solid 8.0 the whole way along,
// but the bottom edge drifts a little between the two painted
// carriages (carriage 2's seats start a touch higher than carriage
// 1's). Every bottom-row block below is therefore held to a common
// 10.1, a bit short of carriage 2's true paint edge, so the aisle
// keeps well over the 1.6-unit (77px) minimum a brute needs to pass
// along its whole length: reach.py inflates every solid by half the
// brute's own box before flood filling, so anything closer to the
// bare minimum reads as a dead end in practice, not just in theory.
//
// Grid: 67 x 18 units, one unit is 48 world px (3216 x 864 px).
// Source: "Level Design/Train Carriage/Train Carriage - game plate.jpg" cut
// into 48 columns and 18 rows. Unit 0,0 is the top left corner.
// Press F2 in game to see the blocks.
// ============================================================

const TRAIN_PLATE = {
  // Two tiles side by side: Kaboom caps textures at 2048 px wide.
  tiles: [
    { sprite: "plate-train_0", x: 0 },
    { sprite: "plate-train_1", x: 33 },
  ],
  cols: 67,
  rows: 18,
  unit: 48,

  charScale: 1.2,

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "top edge", foot: [0, 0, 67, 0.4] },
    { name: "bottom edge", foot: [0, 17.6, 67, 18] },
    { name: "left edge", foot: [0, 0, 0.4, 18] },
    { name: "right edge", foot: [66.6, 0, 67, 18] },
  ],

  // Left end of the aisle, just inside the carriage. Held a little clear
  // of the left end wall: that wall inflated by half the brute's width
  // reaches past 1.6, and the brute's own flood fill starts from here too.
  playerSpawn: [1.8, 7.7],

  // Seven enemies spread the length of both carriages, centred in the
  // aisle at 8.9 (mid way between the 8.0 and 10.1 rails), all comfortably
  // more than 6 units from the start.
  enemySpawns: [
    [9, 7.7], [16, 7.7], [23, 7.7], [29, 7.7],
    [41, 7.7], [50, 7.7], [59, 7.7],
  ],

  // Way out: the aisle carries on off the right edge. Kept clear of the
  // toilet cubicle just below it.
  exit: [66.5, 7.6, 66.95, 9.2],
};
