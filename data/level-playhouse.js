// ============================================================
// PLAYHOUSE BAR: Chapter 3, Area 1.
//
// Plate area, like Gonzo's: one painted top-down background
// (core/plates-real.js) with a hand-measured collision layer
// drawn on top of it. Numbers are GRID UNITS, not pixels.
//
// Grid: 32 x 18 units, one unit is 48 world px (1536 x 864 px).
// Source: "Level Design/Playhouse Bar/Playhouse Bar - game plate.jpg" cut
// into 32 columns and 18 rows. Unit 0,0 is the top left corner.
//
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTES, same spirit as Gonzo's:
// - Loose chairs are walkable. The bentwood chairs round the cafe
//   tables, the piano stool and the odd chair by the bench are all
//   painted but none of them block you. Tables, benches, sofas, the
//   bar and the walls do.
// - The tree canopies are NOT solid, only their raised cobbled kerbs
//   and trunks. The canopies are overhead foliage, and they are painted
//   so wide that they meet the picnic benches: make them solid and the
//   courtyard splits into three sealed pockets with no way from the
//   doorway to the gate. The pools of shade under them stay walkable.
// - Two rectangles are deliberately 0.3 of a unit tighter than the
//   paint (picnic benches 3 and 4). That is what keeps the way out of
//   the doorway 1.75 units wide, so the chapter's brute fits through.
// ============================================================

const PLAYHOUSE_PLATE = {
  sprite: "plate-playhouse",
  cols: 32,
  rows: 18,
  unit: 48,

  // Everyone stands 15% taller in here than the game's default.
  charScale: 1.15,

  solid: [
    // ---- the bar: shell ----
    [0,     0,     0.95,  10.4],  // left wall, upper run: pictures, mirrors
    [0,     10.4,  0.5,   17.4],  // left wall, lower run, thinner behind the piano
    [0.9,   0,     17.95, 3.66],  // top wall: frames, fairy lights, the shut theatre doors
    [0,     17.3,  18,    18],    // bottom wall

    // ---- the bar: fixtures ----
    [1.73,  2.95,  3.65,  4.3],   // sideboard against the top wall
    [3.7,   2.95,  11.35, 4.35],  // back bar: bottle shelves and cupboards
    [12.55, 2.3,   13.7,  4.7],   // coffee machine on the counter's return
    [5.35,  4.62,  13.7,  6.65],  // the bar counter, black front and pewter top
    [0.5,   10.35, 2.25,  13.9],  // upright piano against the left wall

    // ---- the bar: furniture ----
    [2.73,  7.29,  6.56,  9.4],   // brown leather chesterfield
    [6.7,   7.75,  8.6,   11.7],  // red velvet sofa, facing it
    [3.45,  9.5,   5.8,   10.6],  // low coffee table between them
    [11.7,  8.4,   13.1,  10.2],  // cafe table 1 (its chairs are walkable)
    [11.7,  11.05, 13.1,  13.0],  // cafe table 2
    [5.25,  14.3,  6.7,   15.8],  // little round table, left of the bench
    [11.0,  14.3,  12.5,  15.8],  // little round table, right of the bench
    [3.28,  15.9,  17.75, 17.05], // cushioned bench along the bottom wall
    [17.0,  12.8,  17.75, 17.05], // the same bench turning up the right wall

    // ---- the wall between the bar and the courtyard ----
    // One opening, 2.15 units of it, between the two runs.
    [17.72, 0,     18.5,  9.05],  // dividing wall, above the doorway
    [17.72, 11.2,  18.5,  18],    // dividing wall, below the doorway

    // ---- the courtyard: shell ----
    [18.4,  0,     32,    2.45],  // the theatre's glazed front and its brickwork
    [31.5,  2.0,   32,    6.2],   // right wall, above the gate
    [31.5,  10.35, 32,    14.3],  // right wall, below the gate
    [18.4,  14.3,  32,    18],    // iron railing, river wall and the water

    // ---- the courtyard: furniture ----
    [20.19, 2.7,   23.72, 4.85],  // rainbow picnic bench 1
    [26.19, 2.7,   29.72, 4.95],  // rainbow picnic bench 2
    [20.25, 9.05,  23.68, 11.25], // rainbow picnic bench 3, left end pulled in 0.3
    [20.25, 11.7,  23.68, 14.0],  // rainbow picnic bench 4, the same
    [22.2,  7.6,   24.55, 9.2],   // tree 1: cobbled kerb and trunk
    [26.9,  11.5,  29.35, 13.65], // tree 2: cobbled kerb and trunk
    // The bin by the doorway and the meter cabinet on the right wall are
    // left walkable on purpose: the bin stands in the only way out of the
    // doorway and would shut it for anything bigger than the player.
  ],

  // Just inside the bar's own door in the left wall, at the foot of
  // it, past the piano. The plan put this door halfway down the left
  // wall, but the painting hung that stretch of wall with pictures and
  // parked the chesterfield in front of it: the strip behind the sofa
  // is a 0.5 unit slot that nothing, not even the player, can leave.
  // Down here the floor is open and the whole room is in front of you.
  playerSpawn: [1.8, 15.5],

  // Four in the bar, four out in the courtyard, all more than five
  // units from the start and all clear of the widest body on the
  // field (the brute). If G.CHAR_H or charScale goes up, re-run
  // tools/levels/reach.py.
  enemySpawns: [
    [9.8, 8.6], [9.5, 13.2], [15.8, 5.6], [15.5, 10.5],
    [20.5, 6.4], [24.9, 3.7], [29.0, 6.5], [25.5, 12.8],
  ],

  // The open iron gate in the right wall, down by the river.
  // Locked until the room is clear.
  exit: [31.55, 7.3, 31.95, 9.3],
};
