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

  solid: [
    // ---- night outside, above and below the carriage: two big bands ----
    [0, 0, 48, 2.5],
    [0, 13.85, 48, 18],

    // ---- carriage walls: windows, overhead luggage rack, valance. One
    // band top and bottom runs the full length; thickness drifts a
    // little between the two painted halves, so these are held to the
    // shorter side and simply overlap the furniture below, which is
    // solid anyway ----
    [0, 2.5, 48, 4.9],
    [0, 11.8, 48, 13.85],

    // ---- left end wall: the front of the train, nothing before it, no
    // aisle opening here (unlike the seam and the exit) ----
    [0, 4.9, 1.0, 11.85],

    // ---- top row, carriage 1, left of the vestibule: a beech table bay
    // then two rows of paired seats, all one continuous run ----
    [1.0, 4.9, 13.0, 8.0],

    // ---- vestibule (carriage 1): shut sliding doors recessed into both
    // walls, deeper than the plain wall, either side of the aisle ----
    [13.0, 2.5, 17.4, 5.6],
    [13.0, 11.75, 17.4, 13.85],
    [13.6, 5.7, 14.6, 8.1],   // the bike, leant against the wall
    [13.1, 10.1, 14.7, 11.8], // the bin, opposite the bike

    // ---- top row, carriage 1, right of the vestibule to the carriage
    // end: paired seats then another table bay, continuous ----
    [17.4, 4.9, 29.6, 8.0],

    // ---- bottom row, carriage 1: mirrors the top, left and right of
    // the vestibule ----
    [1.0, 10.1, 13.0, 11.85],
    [17.4, 10.1, 29.6, 11.85],

    // ---- the seam: carriage 1's rounded end wall, the gap between the
    // two carriages, and carriage 2's own end wall, all together. Open
    // across the aisle: that gap is the connecting door through to the
    // next carriage ----
    [29.6, 2.5, 32.1, 8.0],
    [29.6, 10.1, 32.1, 13.85],

    // ---- top row, carriage 2: seam to the cafe bar, seats and tables,
    // continuous ----
    [32.1, 4.9, 38.7, 8.0],

    // ---- cafe bar counter: coffee machine, snacks, a fridge ----
    [38.7, 3.0, 45.1, 7.6],

    // ---- second luggage rack, bags stacked on it ----
    [44.85, 3.0, 47.7, 7.85],

    // ---- bottom row, carriage 2: seam to the toilet ----
    [32.1, 10.1, 44.75, 12.7],

    // ---- toilet cubicle, far right end: door, sink, cubicle ----
    [44.75, 10.1, 47.7, 13.0],

    // ---- right end wall, sealed either side of the exit gap ----
    [47.6, 4.9, 48.0, 8.1],
    [47.6, 9.8, 48.0, 11.8],
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
