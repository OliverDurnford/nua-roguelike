// ============================================================
// MERCY STAGE: Chapter 1, Area 5. The chapter 1 boss arena.
// Boss: THE OBNOXIOUS DJ. Feel: boss arena, facing the stage.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 26 units wide by 24 units tall, and one unit is 48 world px,
// so the finished room is 1248 x 1152 px (about 1.3 screens wide
// and 2.1 screens tall). 26 by 24 matches the source picture's
// shape to within about one per cent.
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Mercy boss room/Mercy boss room level
// design.jpeg", imagine it cut into 26 columns and 24 rows, and
// read off the column and row.
//
// solid: [x1, y1, x2, y2] is a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// TUNING NOTE: glow sticks, confetti, the broken glass by the ball
// pit and the coats dumped on the booths are deliberately NOT solid.
// You walk straight over them. The room is one big sunken bowl with
// a raised ring round it: the bowl is the arena, the railing round
// it keeps the fight in there, and the stair openings are the ways
// in and out. The two staircases beside the stage are painted
// narrower than the widest enemy, so they are player-only bolt
// holes: you can nip up onto the top ring to catch your breath, big
// enemies have to wait for you at the bottom. No spawn point sits up
// there, so nothing ever gets stranded.
// ============================================================

const MERCYSTAGE_PLATE = {
  sprite: "plate-mercystage",
  cols: 26,
  rows: 24,
  unit: 48,          // world pixels per grid unit -> room is 1248 x 1152

  // Everyone stands a touch shorter here than at Gonzo's, because this
  // room's furniture is painted smaller against the floor. Measured from
  // the art: the staircases into the bowl are about two units wide and
  // read as roomy club stairs, the bar counter is two units deep against
  // Gonzo's 2.2 at charScale 1.3, and the speaker stacks read about a
  // head taller than a person. That all lands around 0.9, which also
  // suits the fight: this is the biggest floor in the chapter and the
  // boss needs the space to fill.
  charScale: 0.9,

  solid: [
    // ---- room shell ----
    [0,     0,     26,    3.9],    // top wall: forest mural, lighting truss, spotlights
    [0,     0,     0.6,   24],     // left wall
    [25.5,  0,     26,    24],     // right wall
    [0,     23.8,  26,    24],     // bottom edge, so nobody walks off the picture

    // ---- the stage ----
    // One slab: deck, DJ booth, laptop stand and both speaker stacks.
    // The Obnoxious DJ goes in as a sprite, never baked into the plate.
    [8.3,   3.55,  17.95, 6.55],   // the stage and everything on it
    [6.0,   5.7,   8.4,   6.45],   // bowl-top railing, left of the stage
    [17.7,  5.7,   20.05, 6.45],   // bowl-top railing, right of the stage

    // ---- railing round the bowl, west side ----
    // Segments follow the curve of the lamp dots. Broken at the
    // top-left stairs (player-only) and the lower-left stairs.
    [4.25,  4.95,  4.75,  7.3],    // upper west rail, beside the top-left stairs
    [4.45,  7.3,   5.05,  9.3],    // west rail, starting to curve
    [4.95,  9.3,   5.75,  10.75],  // curve down to the lower-left stair head

    // ---- railing round the bowl, bottom arc ----
    // The two lower staircases pass through the gaps either side.
    [8.15,  11.25, 9.4,   12.1],   // rail between the lower-left stairs and the arc
    [9.4,   11.9,  10.9,  12.6],   // arc, sinking towards the middle
    [10.9,  12.4,  15.1,  13.1],   // arc, the lowest run under the bowl
    [15.1,  11.9,  16.7,  12.6],   // arc, rising again
    [16.7,  11.4,  17.95, 12.15],  // rail between the arc and the lower-right stairs

    // ---- railing round the bowl, east side ----
    [20.3,  9.3,   21.1,  10.75],  // curve up from the lower-right stair head
    [21.0,  7.3,   21.6,  9.3],    // east rail, straightening out
    [21.3,  4.95,  21.8,  7.3],    // upper east rail, beside the top-right stairs

    // ---- sealed corners (you can see them, you can't reach them) ----
    // The dancing cage, its podium, the open door and the rail below
    // it, all one block. The alley between the cage and the bowl rail
    // pinches to about one unit in the art, too tight to be honest
    // floor, so the whole corner is sealed.
    [0.3,   8.25,  4.4,   14.35],  // dancing cage corner
    [22.25, 9.55,  25.75, 15.0],   // ball pit, padded sides included

    // ---- mid floor ----
    [7.0,   13.9,  19.2,  17.35],  // seating: all three booths, tables and lamps
    [4.0,   13.6,  4.55,  17.6],   // wall run flanking the left steps down
    [21.95, 14.4,  22.55, 17.65],  // wall run flanking the right steps down

    // ---- the bar ----
    // Counter, working area and the back shelves, one slab. The floor
    // either side of it is how you round the bottom of the room.
    [4.5,   20.25, 22.1,  23.8],
  ],

  // Centre of the bar-end floor, facing the stage across the whole
  // room. Directly opposite the boss, which is the point.
  playerSpawn: [13.0, 18.9],

  // In the bowl, square in front of his own decks. Deliberately NOT on
  // the stage slab, so he is not born inside the collision. If the boss
  // script wants him behind the decks instead, use [13.0, 4.9] and skip
  // collision until he steps down.
  bossSpawn: [13.0, 8.6],

  // Eight points round the edges of the fight, grouped at the natural
  // ways in: the foot of each top staircase inside the bowl, the two
  // lower stair mouths, the side channels past the seating, and the
  // bar floor either side of where the player walks in.
  //
  // All held more than 1.2 units clear of every solid, and every one
  // is reachable from the player spawn down routes at least 2.4 units
  // wide, so the brute always fits. If charScale goes up, check them
  // again.
  enemySpawns: [
    [6.6,  8.2],  [19.4, 8.2],    // in the bowl, below the top staircases
    [8.6,  9.9],  [17.4, 9.9],    // in the bowl, at the lower stair mouths
    [5.78, 16.6], [20.6, 16.6],   // the side channels past the seating
    [8.0,  19.0], [18.0, 19.0],   // the bar floor, flanking the player
  ],

  // Way out, bottom left, down the gap past the end of the bar. Sits
  // flush with the bottom edge so it reads as a threshold. Boss arenas
  // never unlock it in play; it is here so the schema stays uniform.
  exit: [1.7, 23.35, 3.3, 23.84],
};
