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
    { name: "top wall carriage one", foot: [0.4, 0.4, 31.5, 5.45] },
    { name: "gangway top bellows", foot: [31.5, 0.4, 33.7, 7.05] },
    { name: "top wall carriage two", foot: [33.7, 0.4, 66.6, 5.45] },
    { name: "bottom wall carriage one", foot: [0.4, 11.6, 31.5, 17.6] },
    { name: "gangway bottom bellows", foot: [31.5, 10, 33.7, 17.6] },
    { name: "bottom wall carriage two", foot: [33.7, 11.6, 66.6, 17.6] },
    { name: "left end wall upper", foot: [0.4, 5.45, 1, 6.4] },
    { name: "left end wall lower", foot: [0.4, 9.2, 1, 11.6] },
    { name: "right end wall upper", foot: [66.25, 5.45, 66.6, 7.4] },
    { name: "right end wall lower", foot: [66.25, 9.6, 66.6, 11.6] },
    { name: "table one top row", foot: [3.1, 5.7, 4.87, 6.9], over: [[3.18, 4.7], [4.79, 4.7], [4.87, 4.78], [4.87, 6.82], [4.79, 6.9], [3.18, 6.9], [3.1, 6.82], [3.1, 4.78]] },
    { name: "table two top row", foot: [21.04, 5.75, 22.8, 6.95], over: [[21.12, 4.8], [22.72, 4.8], [22.8, 4.88], [22.8, 6.87], [22.72, 6.95], [21.12, 6.95], [21.04, 6.87], [21.04, 4.88]] },
    { name: "table three top row", foot: [35.9, 5.9, 37.75, 7.1], over: [[35.98, 4.89], [37.67, 4.89], [37.75, 4.97], [37.75, 7.02], [37.67, 7.1], [35.98, 7.1], [35.9, 7.02], [35.9, 4.97]] },
    { name: "table four top row", foot: [54.5, 5.95, 56.3, 7.15], over: [[54.58, 4.89], [56.22, 4.89], [56.3, 4.97], [56.3, 7.07], [56.22, 7.15], [54.58, 7.15], [54.5, 7.07], [54.5, 4.97]] },
    { name: "table one bottom row", foot: [3.1, 10.5, 4.87, 11.6], over: [[3.18, 9.8], [4.79, 9.8], [4.87, 9.88], [4.87, 11.52], [4.79, 11.6], [3.18, 11.6], [3.1, 11.52], [3.1, 9.88]] },
    { name: "table two bottom row", foot: [21.04, 10.5, 22.8, 11.6], over: [[21.12, 9.8], [22.72, 9.8], [22.8, 9.88], [22.8, 11.52], [22.72, 11.6], [21.12, 11.6], [21.04, 11.52], [21.04, 9.88]] },
    { name: "table three bottom row", foot: [35.9, 10.5, 37.75, 11.6], over: [[35.98, 9.56], [37.67, 9.56], [37.75, 9.64], [37.75, 11.52], [37.67, 11.6], [35.98, 11.6], [35.9, 11.52], [35.9, 9.64]] },
    { name: "table four bottom row", foot: [54.64, 10.5, 56.45, 11.6], over: [[54.72, 9.65], [56.37, 9.65], [56.45, 9.73], [56.45, 11.52], [56.37, 11.6], [54.72, 11.6], [54.64, 11.52], [54.64, 9.73]] },
    { name: "bike one upper", foot: [14.2, 5.3, 14.7, 6.5], over: [[14.15, 4.95], [14.97, 4.95], [14.97, 5.15], [14.66, 5.15], [14.68, 6.5], [14.22, 6.5], [14.25, 5.15], [14.15, 5.15]] },
    { name: "bike one lower", foot: [14.2, 6.5, 14.75, 7.7], over: [[14.22, 6.5], [14.68, 6.5], [14.8, 7], [14.72, 7.7], [14.25, 7.7], [14.18, 7]] },
    { name: "bike two upper", foot: [47.5, 5.4, 47.95, 6.5], over: [[47.35, 5.05], [48, 5.05], [48, 5.3], [47.8, 5.3], [47.82, 6.5], [47.55, 6.5], [47.55, 5.3], [47.35, 5.3]] },
    { name: "bike two lower", foot: [47.5, 6.5, 47.95, 7.95], over: [[47.55, 6.5], [47.85, 6.5], [47.95, 7], [47.9, 7.95], [47.55, 7.95], [47.48, 7]] },
    { name: "bin one top row", foot: [17.9, 7, 18.6, 7.75], over: [[17.95, 6.3], [18.55, 6.3], [18.6, 6.35], [18.6, 7.7], [18.55, 7.75], [17.95, 7.75], [17.9, 7.7], [17.9, 6.35]] },
    { name: "bin two top row", foot: [51.25, 7.2, 51.95, 7.95], over: [[51.3, 6.52], [51.9, 6.52], [51.95, 6.57], [51.95, 7.9], [51.9, 7.95], [51.3, 7.95], [51.25, 7.9], [51.25, 6.57]] },
    { name: "bike one bottom row", foot: [14.4, 10.9, 14.8, 11.6], over: [[14.55, 10.2], [14.66, 10.2], [14.66, 10.55], [15.08, 10.55], [15.08, 10.7], [14.66, 10.7], [14.66, 11.05], [14.78, 11.15], [14.78, 11.6], [14.4, 11.6], [14.4, 11.15], [14.55, 11.05], [14.55, 10.7], [14.1, 10.7], [14.1, 10.55], [14.55, 10.55]] },
    { name: "bike two bottom row", foot: [47.55, 10.9, 47.95, 11.6], over: [[47.72, 10.05], [47.85, 10.05], [47.85, 10.4], [48.2, 10.4], [48.2, 10.58], [47.85, 10.58], [47.85, 11], [47.95, 11.1], [47.95, 11.6], [47.6, 11.6], [47.6, 11.1], [47.72, 11], [47.72, 10.58], [47.3, 10.58], [47.3, 10.4], [47.72, 10.4]] },
    { name: "bin one bottom row", foot: [17.95, 10.9, 18.6, 11.6], over: [[17.95, 10.33], [18.55, 10.33], [18.6, 10.38], [18.6, 11.55], [18.55, 11.6], [17.95, 11.6], [17.9, 11.55], [17.9, 10.38]] },
    { name: "bin two bottom row", foot: [51.25, 10.9, 51.95, 11.6], over: [[51.28, 10.17], [51.91, 10.17], [51.96, 10.22], [51.96, 11.55], [51.91, 11.6], [51.28, 11.6], [51.23, 11.55], [51.23, 10.22]] },
    { name: "cafe counter arm top", foot: [56.75, 4.4, 58.3, 5.6], over: [[56.75, 4.4], [57.04, 4.4], [57.04, 3.65], [58.1, 3.65], [58.1, 4.4], [58.4, 4.4], [58.4, 5.6], [56.78, 5.6]] },
    { name: "cafe counter arm upper", foot: [56.78, 5.6, 58.3, 6.6], over: [[56.78, 5.6], [58.4, 5.6], [58.4, 6.6], [56.94, 6.6]] },
    { name: "cafe counter arm lower", foot: [56.95, 6.6, 58.3, 7.1], over: [[56.94, 6.6], [58.4, 6.6], [58.4, 7.1], [57.2, 7.1]] },
    { name: "cafe counter arm bend", foot: [57.3, 7.1, 58.3, 7.6], over: [[57.2, 7.1], [58.4, 7.1], [58.4, 7.6], [57.65, 7.6], [57.4, 7.35]] },
    { name: "cafe counter corner", foot: [57.65, 7.6, 58.3, 8], over: [[57.65, 7.6], [58.4, 7.6], [58.4, 8], [58.1, 8], [57.8, 7.8]] },
    { name: "cafe counter back", foot: [58.3, 5.5, 62.9, 6.6], over: [[58.3, 5.85], [60.35, 5.85], [60.35, 5.8], [61.2, 5.8], [61.2, 5.75], [61.4, 5.75], [61.4, 5.6], [61.7, 5.6], [61.7, 5.8], [62.9, 5.85], [62.9, 6.6], [58.3, 6.6]] },
    { name: "cafe counter front", foot: [58.3, 6.6, 62.9, 8], over: [[58.3, 6.6], [62.9, 6.6], [62.88, 7.2], [62.77, 7.75], [62.35, 8], [58.3, 8]] },
    { name: "luggage rack", foot: [64.4, 5.45, 66.2, 8], over: [[64.45, 3.6], [66.2, 3.6], [66.2, 8], [64.4, 8]] },
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
  exit: [66.2, 7.6, 66.95, 9.2],
};
