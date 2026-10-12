// ============================================================
// NUA CLASSROOM. Chapter 2, Area 2.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 33 units wide by 18 units tall, and one unit is 48 world px,
// so the finished room is 1584 x 864 px (about 1.65 screens
// wide and 1.6 screens tall).
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/NUA Classroom/NUA Classroom Level Design.jpg",
// imagine it cut into 33 columns and 18 rows, and read off the
// column and row.
//
// things: one entry per painted thing (footprint and outline); see below.
//
// TUNING NOTE: the school chairs are deliberately NOT solid, the
// same call as Gonzo's. They sit tucked around every table and you
// walk straight over them, which keeps thirty chairs of clutter on
// screen without thirty hitboxes on the floor. Only the tables,
// the boards, the fixed kit and the walls block you. The two
// display boards stand at an angle in the art, so the fashion
// board is covered by two stepped rectangles rather than one box.
// ============================================================

const CLASSROOM_PLATE = {
  sprite: "plate-classroom",
  cols: 33,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> room is 1584 x 864

  // Everyone stands 20% taller in here than the game's default.
  // Judged against the art: the storage room door is about 2.2 units
  // wide and a chair seat about 1.1, and at 1.2 a person (86px) is
  // one seat wide and two thirds of that doorway, which is how the
  // same furniture reads in Gonzo's at 1.3. This room is painted a
  // touch smaller than Gonzo's, so it gets a touch less.
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
    { name: "storage room and its door", foot: [0, 0, 6.5, 8.65] },
    { name: "top wall", foot: [6.5, 0, 31.6, 4.95] },
    { name: "left wall", foot: [0, 0, 0.95, 18] },
    { name: "right wall", foot: [31.6, 0, 33, 18] },
    { name: "bottom wall left of the doorway", foot: [0, 17, 2.45, 18] },
    { name: "bottom wall right of the doorway", foot: [4.45, 17, 33, 18] },
    { name: "edge seal at the doorway", foot: [2.3, 17.75, 4.6, 18] },
    { name: "easel boards and paper roll", foot: [1.05, 8.65, 2.4, 9.6], over: [[1.09, 6.93], [1.29, 6.81], [1.41, 6.83], [1.63, 7.71], [1.74, 7.95], [1.84, 7.88], [2.1, 7.88], [2.2, 8.13], [2.36, 9.06], [2.36, 9.27], [2.05, 9.4], [1.93, 9.35], [1.94, 9.6], [1.25, 9.6], [1.19, 9.27], [1.03, 8.28], [1, 7.87], [1.03, 7.42]] },
    { name: "easel boards, feet", foot: [1.2, 9.6, 2, 10.65], over: [[1.25, 9.6], [1.94, 9.6], [1.94, 9.95], [1.92, 10.6], [1.48, 10.62], [1.37, 10.37]] },
    { name: "radiator 1", foot: [0.95, 12, 1.7, 13], over: [[1, 12.05], [1.66, 12.05], [1.66, 13], [1, 13]] },
    { name: "radiator 2", foot: [0.95, 13, 1.7, 14], over: [[1, 13], [1.66, 13], [1.66, 14], [1, 14]] },
    { name: "radiator 3", foot: [0.95, 14, 1.7, 15], over: [[1, 14], [1.66, 14], [1.66, 15], [1, 15]] },
    { name: "radiator 4", foot: [0.95, 15, 1.7, 15.9], over: [[1, 15], [1.66, 15], [1.66, 15.7], [1.5, 15.7], [1.5, 15.9], [1.1, 15.9], [1.1, 15.7], [1, 15.7]] },
    { name: "fashion board left", foot: [7.7, 8.75, 8.9, 9.15], over: [[7.71, 5.55], [8.9, 5.26], [8.9, 8.42], [8.06, 8.64], [8.2, 9.1], [8.1, 9.15], [7.9, 8.95], [7.72, 8.7]] },
    { name: "fashion board left middle", foot: [8.9, 8.4, 10.1, 8.8], over: [[8.9, 5.26], [10.1, 4.97], [10.1, 8.12], [8.9, 8.42]] },
    { name: "fashion board right middle", foot: [10.1, 8.1, 11.3, 8.5], over: [[10.1, 4.97], [11.3, 4.68], [11.3, 7.81], [10.1, 8.12]] },
    { name: "fashion board right", foot: [11.3, 7.85, 12.5, 8.2], over: [[11.3, 4.68], [12.41, 4.41], [12.5, 4.46], [12.5, 7.75], [12.5, 7.95], [12.3, 8.05], [12, 7.95], [11.95, 7.64], [11.3, 7.81]] },
    { name: "film studies board top", foot: [19.95, 7, 20.6, 7.45], over: [[20.23, 3.27], [20.45, 3.3], [21.83, 5.6], [21.84, 7.45], [20.58, 7.45], [20.45, 7.2], [20.45, 7.25], [20.1, 7.35], [19.95, 7.2], [19.97, 7.03], [20.23, 6.98]] },
    { name: "film studies board upper middle", foot: [20.2, 7.45, 20.9, 8.1], over: [[21.84, 7.45], [21.84, 8.1], [20.92, 8.1], [20.58, 7.45]] },
    { name: "film studies board lower middle", foot: [20.6, 8.1, 21.25, 8.8], over: [[21.84, 8.1], [21.84, 8.8], [21.28, 8.8], [20.92, 8.1]] },
    { name: "film studies board bottom", foot: [21.1, 8.8, 22, 9.52], over: [[21.84, 8.8], [21.84, 9.05], [21.97, 9.1], [22, 9.3], [21.9, 9.5], [21.45, 9.52], [21.17, 9.45], [21.17, 9.3], [21.45, 9.12], [21.28, 8.8]] },
    { name: "wooden chest", foot: [25, 4.95, 27.1, 5.46], over: [[25.02, 4.1], [25.08, 4.04], [27.04, 4.04], [27.1, 4.1], [27.1, 5.38], [27.06, 5.46], [26.88, 5.46], [26.85, 5.4], [25.3, 5.4], [25.27, 5.46], [25.07, 5.46], [25.02, 5.4]] },
    { name: "sink and wash counter", foot: [27.3, 4.95, 30.9, 5.4], over: [[27.3, 3.43], [27.93, 3.43], [27.95, 3.32], [28.1, 3.3], [28.13, 3], [28.27, 3], [28.3, 3.3], [28.45, 3.32], [28.55, 3.43], [29.14, 3.43], [29.15, 3.1], [29.3, 3.04], [29.45, 3.1], [29.52, 3.43], [30.9, 3.43], [30.9, 4.3], [30.79, 4.3], [30.79, 5.4], [30.67, 5.4], [30.67, 4.35], [27.5, 4.35], [27.5, 5.4], [27.38, 5.4], [27.38, 4.3], [27.3, 4.3]] },
    { name: "spare chairs 1", foot: [30.1, 5.4, 31.45, 6], over: [[30.98, 4.9], [31.05, 4.83], [31.22, 4.83], [31.27, 5.2], [31.33, 6], [30.12, 6], [30.15, 5.5], [30.28, 5.45], [30.9, 5.45], [30.93, 5.2]] },
    { name: "spare chairs 2", foot: [30.1, 6, 31.45, 7.1], over: [[31.33, 6], [31.4, 6.9], [31.36, 7.1], [30.1, 7.1], [30.12, 6.1], [30.12, 6]] },
    { name: "spare chairs 3", foot: [30.1, 7.1, 31.45, 8.35], over: [[31.36, 7.1], [31.35, 7.15], [31.28, 8.3], [31.15, 8.33], [30.2, 8.3], [30.12, 7.9], [30.1, 7.2], [30.1, 7.1]] },
    { name: "metal bin", foot: [30.4, 9.1, 31.35, 9.82], over: [[30.45, 8.5], [30.6, 8.42], [30.95, 8.38], [31.25, 8.42], [31.4, 8.55], [31.42, 8.75], [31.4, 9], [31.3, 9.4], [31.25, 9.7], [31.1, 9.82], [30.85, 9.86], [30.6, 9.82], [30.48, 9.7], [30.42, 9.4], [30.3, 9], [30.27, 8.75], [30.32, 8.62]] },
    { name: "table by the arched window", foot: [14.05, 9.3, 19.02, 10.9], over: [[14.03, 7.58], [19.04, 7.58], [19.04, 9.82], [18.97, 9.82], [18.97, 10.9], [18.77, 10.9], [18.77, 9.86], [14.3, 9.86], [14.3, 10.9], [14.1, 10.9], [14.1, 9.82], [14.03, 9.82]] },
    { name: "table top right", foot: [23.18, 8.45, 27.85, 10.04], over: [[23.15, 6.75], [27.92, 6.75], [27.92, 8.97], [27.8, 8.97], [27.8, 10.04], [27.66, 10.04], [27.66, 9.01], [23.37, 9.01], [23.37, 10.04], [23.23, 10.04], [23.23, 8.97], [23.15, 8.97]] },
    { name: "table bottom left", foot: [7.51, 13.8, 12.57, 15.4], over: [[7.45, 12.14], [12.61, 12.14], [12.61, 14.36], [12.52, 14.36], [12.52, 15.4], [12.35, 15.4], [12.35, 14.4], [7.72, 14.4], [7.72, 15.4], [7.56, 15.4], [7.56, 14.36], [7.45, 14.36]] },
    { name: "table bottom middle", foot: [14.81, 13.8, 18.28, 15.41], over: [[14.78, 13.04], [18.33, 13.04], [18.33, 14.41], [18.23, 14.41], [18.23, 15.41], [18.09, 15.41], [18.09, 14.45], [15.02, 14.45], [15.02, 15.41], [14.86, 15.41], [14.86, 14.41], [14.78, 14.41]] },
    { name: "table bottom right", foot: [21.56, 13.8, 26.62, 15.4], over: [[21.52, 12.16], [26.68, 12.16], [26.68, 14.36], [26.57, 14.36], [26.57, 15.4], [26.42, 15.4], [26.42, 14.4], [21.78, 14.4], [21.78, 15.4], [21.61, 15.4], [21.61, 14.36], [21.52, 14.36]] },
  ],

  // Just inside the bottom left doorway, on open floor, with a clear
  // run up the left side of the room.
  playerSpawn: [3.4, 15.8],

  // The art gives this room exactly one doorway, the one the player
  // arrives by, so the waves read as already in the building.
  // Left four: burst out of the storage room door.
  // Right four: from the far end of the studio, by the sink corner.
  //
  // These are held clear of the walls by more than half the width of
  // the widest enemy (the brute), so nothing ever arrives inside the
  // scenery. If G.CHAR_H goes up, check them again.
  enemySpawns: [
    [3.6, 10.2], [4.6, 10.6], [5.7, 10.2], [3.0, 11.3],
    [29.0, 10.8], [29.9, 11.6], [28.6, 12.6], [30.2, 13.4],
  ],

  // Way out is the way you came in, bottom left. The floor plan asked
  // for a second door in the right wall but the plate never painted
  // one, so the exit sits flush in the only doorway and unlocks when
  // the room is clear. If a v2 plate adds that right hand door, move
  // this to sit flush against it instead.
  exit: [2.5, 17.25, 4.35, 17.75],
};
