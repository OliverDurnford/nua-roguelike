// ============================================================
// THE FALTERING FULLBACK: Chapter 5, Area 1.
//
// Plate area, hand-measured against the painting. A treehouse
// beer garden: six timber decks (three across the top, three
// across the bottom) joined by narrow gangways and short flights
// of steps, buried in ivy, palms and flowers. Ivy wall along the
// top and both sides, a planted fence along the bottom, a door
// in the left wall onto the top left deck, a gate in the right
// wall off the bottom right deck.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/Faltering Fullback/Faltering Fullback - game plate.jpg"
// cut into 32 columns and 18 rows. Unit 0,0 is the top left corner.
//
// Deck layout (roughly): A top-left, B top-middle, C top-right,
// D bottom-left, E bottom-middle, F bottom-right. They connect in
// a ring: A-B and B-C across the top, A-D and C-F down the sides,
// D-E and E-F across the bottom. B and E do NOT connect directly;
// there is no path through the middle of the picture.
// ============================================================

const FULLBACK_PLATE = {
  sprite: "plate-fullback",
  cols: 32,
  rows: 18,
  unit: 48,

  charScale: 1.15,

  solid: [
    // ---- outer walls and fence ----
    [0, 0, 32, 1.8],        // top ivy wall
    [0, 0, 1.0, 18],        // left ivy wall (the door below is its own block)
    [31.3, 0, 32, 12.5],    // right ivy wall, above the gate
    [31.3, 15.2, 32, 18],   // right ivy wall, below the gate
    [0, 16.9, 32, 18],      // bottom planted fence

    // Door in the left wall, shut: its face is painted tipped toward the
    // viewer so it reaches further into the room than the wall itself.
    [1.0, 3.3, 2.05, 5.75],

    // Raised bamboo bed against the back wall on deck C, right of the
    // second umbrella table. Not a freestanding barrel, but it juts out
    // past the top wall band the same way.
    [29.85, 1.8, 30.9, 3.15],

    // ---- planting: top left deck (A) to top middle (B) ----
    // Painted crossing is at 20-30% down (y 3.6-5.4); held back to keep
    // the gap at least 1.6 units wide since the paint itself pinches in.
    [9.4, 1.8, 11.0, 3.6],
    [9.4, 5.5, 11.0, 7.0],

    // ---- planting: top middle (B) to top right (C) ----
    // Painted crossing 22-32% down (y 3.96-5.76). Shifted 0.4 right of the
    // paint (20.0-21.5 rather than 19.6-21.3) to give deck B's heater and
    // barrel, just west of it, enough clearance to route the brute around
    // them; still 1.5 units wide, over the brute's own 1.1 unit box.
    [20.0, 1.8, 21.5, 3.7],
    [20.0, 5.7, 21.5, 7.0],

    // ---- planting: the hillside between the top and bottom rows ----
    // A and B sit higher (south edge ~y7.0); C sits lower (~y9.0), so
    // this band is not a uniform rectangle. The two side staircases are
    // the only crossings; there is nothing through the middle (B and E
    // do not connect directly).
    [1.0, 7.0, 3.85, 9.6],    // west of the A-D stairs, under A
    [6.9, 7.0, 19.6, 9.2],    // under A/B, between the two staircases
    // Painted planting under C runs to about y10.3 on both sides of the
    // C-F stairs, but deck F's table sits right under the stairs' landing
    // (y11.85, inflated to ~11.06 for the brute); trimmed these to y10.0
    // so there is a sliver of clear deck before the table, or the brute
    // could never get from the stairs to the rest of deck F.
    [21.3, 9.0, 24.9, 10.0],  // under C, west of the C-F stairs
    [27.85, 9.0, 31.3, 10.0], // under C, east of the C-F stairs

    // ---- stairs: top left (A) down to bottom left (D) ----
    // Painted crossing 12-20% across (x 3.84-6.4); the actual steps and
    // their posts run about x3.85-6.9, comfortably over 1.6 units.
    // (flanking planting above is covered by the two rects above)

    // ---- stairs: top right (C) down to bottom right (F) ----
    // Painted crossing 78-86% across (x 24.96-27.52); measured steps
    // are x24.9-27.85, a good match.
    // (flanking planting above is covered by the two rects above)

    // ---- planting: bottom left (D) to bottom middle (E) ----
    // Painted crossing 66-76% down (y 11.88-13.68); measured gap a touch
    // narrow, held back to x8.4-10.1 (1.7 units).
    [8.4, 9.6, 10.1, 12.2],
    [8.4, 14.0, 10.1, 16.9],

    // ---- planting: bottom middle (E) to bottom right (F) ----
    // Painted crossing 70-80% down (y 12.6-14.4); held back to
    // x20.1-21.95 (1.85 units).
    [20.1, 9.3, 21.95, 12.3],
    [20.1, 14.0, 21.95, 16.9],

    // ---- picnic tables (one per deck, two on deck C) ----
    [3.85, 2.15, 6.75, 4.85],   // deck A
    [13.75, 1.85, 16.9, 4.4],   // deck B
    [24.15, 2.15, 27.05, 4.55], // deck C, table by the back wall
    [28.3, 4.1, 30.45, 7.15],   // deck C, table under the second umbrella
    [2.85, 11.75, 6.6, 14.35],  // deck D
    [12.75, 11.15, 16.95, 13.85], // deck E
    [24.15, 11.85, 27.55, 14.35], // deck F

    // ---- patio heaters: just the base. The pole is thin and the canopy
    // overhangs on struts above head height, like a lamppost's arm, so
    // neither blocks a character walking under them; only the cylindrical
    // base sits on the deck. (Tried one tall solid running canopy to base
    // first: it cut deck A off from the rest of the level for the brute,
    // wall to wall, no way round. reach.py caught it.)
    // The bases on decks A and B also sit a little off from where the art
    // draws them (A's shifted right under its barrel, B's shifted left):
    // TUNING NOTE, per tools/levels/reach.py. Each heater is deck-A- or
    // deck-B-side of a gangway, opposite a table on the other side, in a
    // gap barely wider than the brute itself: dead centre, the brute's own
    // box touches both neighbours at once, so the base has to lean toward
    // whichever side actually has room. Re-check with reach.py if either
    // table, the gangway planting, or these bases ever move.
    [8.6, 6.0, 8.9, 7.0],      // deck A
    [18.2, 5.35, 18.5, 6.15],  // deck B
    [28.75, 14.35, 29.6, 15.45], // deck F, room to spare, sits where painted

    // ---- big barrel planters (palms), the ones that stand clear on
    // the decks rather than hugging a railing ----
    [1.15, 2.05, 2.15, 3.5],  // deck A, by the door
    [8.05, 2.0, 9.05, 3.45],  // deck A, by the A-B gap
    [11.7, 1.9, 12.9, 3.5],   // deck B, west
    [18.5, 1.85, 19.55, 3.3], // deck B, east
    [1.5, 9.3, 2.65, 10.5],   // deck D, by the stairs
    [1.15, 15.85, 2.15, 17.0], // deck D, bottom corner
    [10.15, 9.35, 11.5, 10.85], // deck E, west
    [18.85, 9.15, 19.85, 10.55], // deck E, east
    [29.75, 9.5, 30.85, 11.1],   // deck F, by the gate
  ],

  // Top left deck, just inside the door and clear of the barrel above it.
  playerSpawn: [3.0, 4.6],

  // Eight enemies, at least one per deck, all clear of the solids above.
  // Deck A is small and tight (door, two barrels, a table and a heater
  // all in ~8x5 units), so its spawn is the closest to the start; every
  // other spawn clears 5 units.
  enemySpawns: [
    [7.0, 6.0],    // deck A, the gap between the table and the heater
    [15.0, 5.8],   // deck B
    [23.0, 3.3],   // deck C, by the back table
    [22.3, 6.5],   // deck C, open floor by the B-C gangway
    [5.5, 15.6],   // deck D
    [15.5, 15.3],  // deck E
    [25.2, 15.6],  // deck F
    [30.7, 13.7],  // deck F, by the gate
  ],

  // Thin rectangle in the gate, right wall, off the bottom right deck.
  exit: [31.0, 12.8, 31.9, 14.7],
};
