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
// things: one entry per painted thing (footprint and outline); see below.
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

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "top wall: forest mural, lighting truss, spotlights", foot: [0, 0, 26, 3.55] },
    { name: "left wall", foot: [0, 0, 0.6, 24] },
    { name: "right wall", foot: [25.5, 0, 26, 24] },
    { name: "bottom edge, so nobody walks off the picture", foot: [0, 23.8, 26, 24] },
    { name: "the stage and everything on it", foot: [8.3, 3.55, 17.6, 6.55] },
    { name: "bowl-top railing, left of the stage", foot: [6.35, 3.5, 8.25, 5.65] },
    { name: "bowl-top railing, right of the stage", foot: [17.65, 3.4, 19.55, 5.6] },
    { name: "upper west rail, beside the top-left stairs", foot: [4.25, 4.95, 4.75, 7.3] },
    { name: "west rail, starting to curve", foot: [4.55, 7.3, 5.05, 8.05] },
    { name: "curve down to the lower-left stair head", foot: [5.95, 9.5, 6.55, 10.3] },
    { name: "rail between the lower-left stairs and the arc", foot: [8.2, 11.1, 9.45, 11.95] },
    { name: "arc, sinking towards the middle", foot: [9.4, 11.75, 10.9, 12.45] },
    { name: "arc, the lowest run under the bowl", foot: [10.9, 12.2, 15.1, 12.9] },
    { name: "arc, rising again", foot: [15.1, 11.7, 16.7, 12.4] },
    { name: "rail between the arc and the lower-right stairs", foot: [16.6, 11.2, 17.85, 11.95] },
    { name: "curve up from the lower-right stair head", foot: [19.55, 9.5, 20.2, 10.15] },
    { name: "east rail, straightening out", foot: [20.9, 7.3, 21.5, 8.05] },
    { name: "upper east rail, beside the top-right stairs", foot: [21.3, 4.95, 21.8, 7.3] },
    { name: "dancing cage corner", foot: [0.3, 8.35, 3.2, 15.1] },
    { name: "seating: all three booths, tables and lamps", foot: [7, 13.7, 19.2, 17.3] },
    { name: "wall run flanking the left steps down", foot: [3.25, 12.5, 3.95, 15.1] },
    { name: "wall run flanking the right steps down", foot: [21.7, 16.9, 22.55, 17.65] },
    { name: "wall 24", foot: [4.5, 20.25, 22.1, 23.8] },
    { name: "curve", foot: [19.95, 8.9, 20.55, 9.5] },
    { name: "curve", foot: [20.4, 8.15, 21.1, 8.85] },
    { name: "Pillar 1", foot: [3.95, 16.95, 4.65, 17.6] },
    { name: "Pillar 2", foot: [21.85, 9.45, 22.5, 10] },
    { name: "Pillar 4", foot: [3.5, 9.35, 4.25, 10.05] },
    { name: "wall 3", foot: [21.35, 14.55, 21.95, 15.25] },
    { name: "Curve 4", foot: [4.8, 8.05, 5.35, 8.6] },
    { name: "Curve 5", foot: [5.2, 8.65, 5.75, 9.1] },
    { name: "Pilaar 1.1", foot: [5.55, 9.1, 6.1, 9.55], over: [[4.05, 13.7], [4.5, 13.7], [4.5, 16.95], [4.05, 16.95]] },
    { name: "Pillar 4.3", over: [[3.6, 6.5], [3.6, 9.3], [4.1, 9.35], [4.1, 6.5]] },
    { name: "Pillar 2.2", over: [[21.9, 13.65], [22.35, 13.65], [22.35, 16.95], [21.9, 16.95]] },
    { name: "Pillar 5", over: [[21.9, 6.45], [22.4, 6.45], [22.45, 9.4], [21.9, 9.4]] },
    { name: "thing 36", over: [[21.7, 4.05], [21.5, 4], [21.5, 4.95], [21.7, 4.95]] },
    { name: "thing 37", over: [[4.25, 4.1], [4.45, 4.1], [4.45, 4.95], [4.25, 4.95]] },
    { name: "thing 38", over: [[24.35, 10.75], [25.25, 11.7], [23.95, 11.75]] },
    { name: "thing 39", over: [[23.7, 10.15], [22.7, 10.15], [22.7, 10.9]] },
    { name: "thing 40", over: [[23.85, 10.35], [22.7, 11.8], [22.7, 13.1]] },
    { name: "thing 41", over: [[23.55, 11.7], [23.05, 13.2], [24, 13.25]] },
    { name: "thing 42", over: [[25.2, 11.9], [23.9, 12], [24.6, 13.75]] },
    { name: "thing 43", over: [[25.3, 12.25], [24.75, 14.4], [25.45, 14.35]] },
    { name: "thing 44", over: [[24.4, 10.15], [25.5, 10.05], [25.5, 11.65]] },
    { name: "thing 45", foot: [6.3, 5.65, 6.5, 7.1], over: [[22.65, 13.45], [22.65, 14.3], [24.45, 14.3], [24.15, 13.8], [23.55, 13.7], [23.55, 13.55]] },
    { name: "thing 46", foot: [19.5, 4.05, 19.65, 6.95] },
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
