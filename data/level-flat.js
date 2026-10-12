// ============================================================
// GAMES NIGHT AT THE FLAT: Chapter 5, Area 3.
//
// Remade 12 Oct 2026 from Ollie's own floor plan of the real flat
// and his photos (tools/levels/venues.py has the design). The plate
// is 21:9 and one texture; its source is Gemini's v7 with the
// bathroom and front door corridor stitched in from v2
// ("Level Design/The Flat/build/composite.py").
//
// Plate area, FIRST PASS geometry: outer shell and the start and
// exit only. Collision and enemy spawns are Ollie's, traced on the
// level board (tools/levels/board.html). The geometry of the old
// generic flat is kept in tools/levels/history/flat/.
//
// Grid: 42 x 18 units, one unit is 48 world px (2016 x 864 px).
// Source: "Level Design/The Flat/The Flat - game plate.jpg" cut
// into 42 columns and 18 rows. Unit 0,0 is the top left corner.
// ============================================================

const FLAT_PLATE = {
  sprite: "plate-flat",
  cols: 42,
  rows: 18,
  unit: 48,

  charScale: 1.3,

  // Edited on the level board (tools/levels/board.html): one entry per
  // painted thing, a footprint and, for tall things, an outline.
  things: [
    { name: "top edge", foot: [0, 0, 42, 0.4] },
    { name: "bottom edge", foot: [0, 17.6, 42, 18] },
    { name: "left edge", foot: [0, 0, 0.4, 18] },
    { name: "right edge", foot: [41.6, 0, 42, 18] },
  ],

  playerSpawn: [28.77, 15.84],

  enemySpawns: [
  ],

  // In at the front door (bottom of the corridor by the bathroom), out
  // over the balcony rail towards the canal, the next area.
  exit: [0.6, 2.6, 1.3, 6.2],
};
