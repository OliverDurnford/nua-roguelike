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
// things: one entry per painted thing (footprint and outline); see below.
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

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "back wall + main drift, full width", foot: [0, 0, 28, 5.6] },
    { name: "crest sagging lower, left of centre", foot: [3.5, 5.6, 7.9, 6.2] },
    { name: "the wide shelf either side of the cannon", foot: [7.9, 5.6, 16.7, 6.8] },
    { name: "deep central lobe, upper step", foot: [10.1, 6.8, 16, 7.4] },
    { name: "deep central lobe, lower step", foot: [11.6, 7.4, 15.7, 7.95] },
    { name: "its toe, spilling onto the grille head", foot: [12.9, 7.95, 15.2, 8.3] },
    { name: "shoulder right of the cannon", foot: [16.7, 5.6, 19, 6.7] },
    { name: "bank piled into the top right corner", foot: [23.8, 5.6, 26.7, 6.6] },
    { name: "same bank, sagging down the corner LED", foot: [25.2, 6.6, 26.7, 7.1] },
    { name: "left upper stub: angled face + LED strip", foot: [0, 5.6, 1.3, 7.9] },
    { name: "foam clinging to that stub", foot: [1.3, 5.6, 3.3, 6.5] },
    { name: "left lower stub, down into the front drift", foot: [0, 10.3, 1.3, 16] },
    { name: "thin seal across the open mouth itself", foot: [0, 7.9, 0.3, 10.3] },
    { name: "right upper stub: angled face + LED strip", foot: [26.7, 0, 28, 7.9] },
    { name: "right lower stub, down into the front drift", foot: [26.8, 11.7, 28, 16] },
    { name: "thin seal across the exit mouth", foot: [27.7, 7.9, 28, 11.7] },
    { name: "left bank, piled into the corner", foot: [0, 12.8, 3.2, 14.4] },
    { name: "left-mid run", foot: [3.2, 13.3, 6, 14.4] },
    { name: "left-mid run, tailing off", foot: [6, 13.7, 8, 14.4] },
    { name: "nub of foam where the gully drains in", foot: [13.3, 13.3, 14.7, 13.7] },
    { name: "tongue of foam around the gully foot", foot: [12.6, 13.7, 15.2, 14.4] },
    { name: "right-mid run", foot: [21.3, 13.2, 24, 14.4] },
    { name: "right bank, piled into the corner", foot: [24, 12.9, 26.8, 14.4] },
    { name: "front wall + drift base, full width", foot: [0, 14.4, 28, 16] },
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
