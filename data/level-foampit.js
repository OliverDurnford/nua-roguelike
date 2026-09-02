// ============================================================
// THE FOAM PIT: Chapter 1, Area 4.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 28 units wide by 16 units tall, and one unit is 48 world px,
// so the finished room is 1344 x 768 px (about 1.4 screens wide
// and 1.4 screens tall). The smallest room in the chapter, on
// purpose: it is the breather between Mercy's two rooms.
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Foam pit/Phone pit level design.jpeg" (yes,
// the filename says Phone, it is the foam pit), imagine it cut
// into 28 columns and 16 rows, and read off the column and row.
//
// One warning before you trust the prompt doc: the tile map table
// in "Foam pit - image gen prompt.md" was written for a 21:9 plan
// that never got generated. The finished plate came back 16:9 and
// deeper, and its drainage gully runs top to bottom, not along the
// room. Everything here is measured from the actual image.
//
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTE: only the deep banked drifts are solid. They read as
// chest deep, so blocking them is honest, and it stops the player
// hugging the walls to skip the room. The torn-off clumps, melted
// rings and wet streaks scattered across the middle are all floor
// detail: you walk straight over them, so the room stays foamy to
// look at but clean to move through.
// ============================================================

const FOAMPIT_PLATE = {
  sprite: "plate-foampit",
  cols: 28,
  rows: 16,
  unit: 48,          // world pixels per grid unit -> room is 1344 x 768

  // Everyone stands 15% taller in here than the game's default. The
  // waterproof cladding is painted to head height and its band measures
  // about 1.6 units, which is one person exactly at this scale, and the
  // foam cannon sits right against an 83px figure. Chunkier than the
  // placeholder levels, but under Gonzo's 1.3: this art is painted a
  // touch looser than Gonzo's furniture.
  charScale: 1.15,

  solid: [
    // ---- back wall and the drift banked against it ----
    // One big run: ceiling band, panelled cladding, LED strip and the
    // crest of the foam. The ragged edge below is handled piecemeal.
    [0,    0,    28,   5.6 ],   // back wall + main drift, full width
    [3.5,  5.6,  7.9,  6.2 ],   // crest sagging lower, left of centre
    [7.9,  5.6,  16.7, 6.8 ],   // the wide shelf either side of the cannon
    [10.1, 6.8,  16.0, 7.4 ],   // deep central lobe, upper step
    [11.6, 7.4,  15.7, 7.95],   // deep central lobe, lower step
    [12.9, 7.95, 15.2, 8.3 ],   // its toe, spilling onto the grille head
    [16.7, 5.6,  19.0, 6.7 ],   // shoulder right of the cannon
    [23.8, 5.6,  26.7, 6.6 ],   // bank piled into the top right corner
    [25.2, 6.6,  26.7, 7.1 ],   // same bank, sagging down the corner LED

    // ---- left wall stubs, either side of the entrance mouth ----
    [0,    5.6,  1.3,  7.9 ],   // upper stub: angled face + LED strip
    [1.3,  5.6,  3.3,  6.5 ],   // foam clinging to that stub
    [0,    10.3, 1.3,  16  ],   // lower stub, down into the front drift
    [0,    7.9,  0.3,  10.3],   // thin seal across the open mouth itself,
                                // so nobody walks off the picture

    // ---- right wall stubs, either side of the exit mouth ----
    [26.7, 0,    28,   7.9 ],   // upper stub: angled face + LED strip
    [26.8, 11.7, 28,   16  ],   // lower stub, down into the front drift
    [27.7, 7.9,  28,   11.7],   // thin seal across the exit mouth

    // ---- front wall and the drift banked against it ----
    [0,    12.8, 3.2,  14.4],   // left bank, piled into the corner
    [3.2,  13.3, 6.0,  14.4],   // left-mid run
    [6.0,  13.7, 8.0,  14.4],   // left-mid run, tailing off
    [13.3, 13.3, 14.7, 13.7],   // nub of foam where the gully drains in
    [12.6, 13.7, 15.2, 14.4],   // tongue of foam around the gully foot
    [21.3, 13.2, 24.0, 14.4],   // right-mid run
    [24.0, 12.9, 26.8, 14.4],   // right bank, piled into the corner
    [0,    14.4, 28,   16  ],   // front wall + drift base, full width
  ],

  // Just inside the left-hand mouth, on the open wet floor where the
  // blue light from the entrance spills in.
  playerSpawn: [2.3, 9.2],

  // Quiet area. No enemies, ever: the budget is zero and the room is
  // the breather before Mercy's main room. The array stays so the
  // builder has something to read.
  enemySpawns: [],

  // Dead centre of the room, beside the half-clogged drain under the
  // foam cannon, standing on a clump that has drifted onto the grille.
  // Off the straight entrance-to-exit line by design: you have to
  // notice them through the foam and step out of the channel.
  companionSpawn: [14.0, 9.5],

  // Way out, the wide mouth in the right-hand wall. Sits flush against
  // the edge seal so it reads as a threshold.
  exit: [27.4, 8.1, 27.8, 11.5],
};
