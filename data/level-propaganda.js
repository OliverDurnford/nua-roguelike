// ============================================================
// PROPAGANDA — Chapter 1, Area 2.
//
// Plate area: painted background (core/plates-real.js) with a
// hand-measured collision layer. FIRST PASS geometry: the sealed
// zones and big blockers are in, fine furniture tuning to follow.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// To find a spot, open "Level Design/Propaganda/Propaganda
// level.jpg", cut it into 32 columns and 18 rows, read off
// column and row. Unit 0,0 is the top left corner.
// ============================================================

const PROPAGANDA_PLATE = {
  sprite: "plate-propaganda",
  cols: 32,
  rows: 18,
  unit: 48,

  // Doorways paint at about 1.5 units against Gonzo's 2, so people
  // stand a touch smaller here: 79px on this floor. The room is
  // meant to feel big, empty and sparse, which small figures help.
  charScale: 1.1,

  solid: [
    // ---- sealed back of house ----
    [0,    0,    8.5,  9.4],   // backstage store: kegs, crates, flight cases, stacked chairs
    [8.5,  0,   10.3,  5.7],   // dark wall between the store and the stage
    [10.3, 0,   22.1,  5.7],   // the stage: drums, amps, monitors, speaker stacks
    [22.1, 0,   24.9,  5.7],   // dark wall right of the stage
    [24.9, 0,   32,   10.3],   // toilets and the two fire doors, sealed

    // ---- the four poster pillars ----
    [10.9, 6.5, 12.15, 9.6],   // upper left
    [21.3, 6.5, 22.55, 9.6],   // upper right
    [10.9, 11.9, 12.15, 14.9], // lower left
    [21.3, 11.9, 22.55, 14.9], // lower right

    // ---- the bar corner ----
    [0,    11.4, 8.7, 17.6],   // whole bar: shelves, fridges, taps, rounded rail
    [0,    9.4,  0.4, 11.4],   // left wall between store and bar

    // ---- bottom right ----
    [30.4, 13.9, 32, 17.6],    // crate stack
    [31.6, 10.3, 32, 13.9],    // right edge

    // ---- outer edge ----
    [0,    17.6, 32, 18],
  ],

  playerSpawn: [9.8, 10.8],

  // Megan Whiteside stands mid dancefloor; the engine default spot
  // lands on the stage, so she gets her own mark.
  npcSpawn: [16, 7.6],

  enemySpawns: [
    [13, 6.9], [15.5, 6.9], [18, 6.9], [20, 6.9],
    [23.6, 10.9], [23.6, 12.9],
    [14, 16.6], [18, 16.6],
  ],

  // Way out, bottom left of the dancefloor.
  exit: [10.6, 17.35, 12.3, 17.79],
};
