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
// Grid: 48 x 18 units, one unit is 48 world px (2304 x 864 px).
// Source: "Level Design/Train Carriage/Train Carriage - game plate.jpg" cut
// into 48 columns and 18 rows. Unit 0,0 is the top left corner.
// Press F2 in game to see the blocks.
// ============================================================

const TRAIN_PLATE = {
  // Two tiles side by side: Kaboom caps textures at 2048 px wide.
  tiles: [
    { sprite: "plate-train_0", x: 0 },
    { sprite: "plate-train_1", x: 24 },
  ],
  cols: 48,
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
    { name: "night sky, top", foot: [0, 0, 48, 2.5] },
    { name: "night sky, bottom", foot: [0, 13.85, 48, 18] },
    { name: "carriage wall: windows and luggage rack, top", foot: [0, 2.5, 48, 4.9] },
    { name: "carriage wall: windows and luggage rack, bottom", foot: [0, 11.8, 48, 13.85] },
    { name: "left end wall", foot: [0, 4.9, 1, 11.85] },
    { name: "seats and table bay, carriage 1 top left", foot: [1, 4.9, 13, 8] },
    { name: "vestibule doors, top recess", foot: [13, 2.5, 17.4, 5.6] },
    { name: "vestibule doors, bottom recess", foot: [13, 11.75, 17.4, 13.85] },
    { name: "the bike, leant against the wall", foot: [13.75, 7.3, 14.45, 8], over: [[13.85, 5.9], [14.35, 5.9], [14.5, 6.5], [14.45, 7.3], [13.75, 7.3], [13.7, 6.5]] },
    { name: "the bin, opposite the bike", foot: [13.3, 11.1, 14.5, 11.65], over: [[13.3, 10.15], [14.5, 10.15], [14.6, 10.6], [14.5, 11.3], [14.3, 11.65], [13.5, 11.65], [13.2, 11.3], [13.2, 10.6]] },
    { name: "seats, carriage 1 top right", foot: [17.4, 4.9, 29.6, 8] },
    { name: "seats and table bay, carriage 1 bottom left", foot: [1, 10.1, 13, 11.85], over: [[1, 9.5], [13, 9.5], [13, 10.15], [1, 10.15]] },
    { name: "seats, carriage 1 bottom right", foot: [17.4, 10.1, 29.6, 11.85], over: [[17.4, 9.5], [29.6, 9.5], [29.6, 10.15], [17.4, 10.15]] },
    { name: "carriage seam, top", foot: [29.6, 2.5, 32.1, 8] },
    { name: "carriage seam, bottom", foot: [29.6, 10.1, 32.1, 13.85] },
    { name: "seats and table bay, carriage 2 top", foot: [32.1, 4.9, 38.7, 8] },
    { name: "cafe bar counter", foot: [38.7, 4.9, 45.05, 7.65], over: [[38.7, 4.9], [45.05, 4.9], [45.05, 6], [44.5, 7.55], [39.9, 7.65], [39, 7.55], [38.7, 6]] },
    { name: "second luggage rack", foot: [44.85, 3, 47.7, 7.85] },
    { name: "seats and table bay, carriage 2 bottom", foot: [32.1, 10.1, 44.75, 12.7], over: [[32.1, 9.5], [44.75, 9.5], [44.75, 10.15], [32.1, 10.15]] },
    { name: "toilet cubicle", foot: [44.75, 10.1, 47.7, 13] },
    { name: "right end wall, top", foot: [47.6, 4.9, 48, 8.1] },
    { name: "right end wall, bottom", foot: [47.6, 9.8, 48, 11.8] },
  ],

  // Left end of the aisle, just inside the carriage. Held a little clear
  // of the left end wall: that wall inflated by half the brute's width
  // reaches past 1.6, and the brute's own flood fill starts from here too.
  playerSpawn: [2.0, 8.9],

  // Seven enemies spread the length of both carriages, centred in the
  // aisle at 8.9 (mid way between the 8.0 and 10.1 rails), all comfortably
  // more than 6 units from the start.
  enemySpawns: [
    [8.5, 8.9], [15.5, 8.9], [21.0, 8.9], [26.5, 8.9],
    [34.0, 8.9], [40.5, 8.9], [45.5, 8.9],
  ],

  // Way out: the aisle carries on off the right edge. Kept clear of the
  // toilet cubicle just below it.
  exit: [47.55, 8.1, 47.95, 9.8],
};
