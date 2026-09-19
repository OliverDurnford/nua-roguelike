// ============================================================
// PROPAGANDA: Chapter 1, Area 2.
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

  // Edited on the level board (tools/levels/board.html, launch config
  // level-board). One entry per painted thing. `foot` is the floor it takes
  // up, [x1, y1, x2, y2] in grid units: you cannot walk through it and
  // bullets stop on it. `over`, when present, is its outline as [x, y]
  // points: while your feet are above its base line the game redraws that
  // patch of the painting over you, so you stand behind it. The base line is
  // the bottom edge of `foot` (the bottom of the outline when there is no
  // foot); `base` overrides it for overhangs.
  things: [
    { name: "backstage store: kegs, crates, flight cases, stacked chairs", foot: [0, 0, 8.2, 9.95] },
    { name: "dark wall between the store and the stage", foot: [8.15, 0, 10.65, 3.25] },
    { name: "the stage: drums, amps, monitors, speaker stacks", foot: [10.65, 0, 22.95, 5.95] },
    { name: "dark wall right of the stage", foot: [23, 0, 24.9, 3.2] },
    { name: "toilets and the two fire doors, sealed", foot: [24.9, 0, 32, 8.2] },
    { name: "upper left", foot: [10.7, 9.2, 12.05, 10.1], over: [[10.85, 6.6], [11.95, 6.6], [11.95, 9.25], [10.85, 9.25]] },
    { name: "upper right", foot: [21.5, 9.2, 22.8, 10.05] },
    { name: "lower left", foot: [10.75, 14.05, 12.15, 14.9] },
    { name: "lower right", foot: [21.55, 13.95, 22.8, 14.9] },
    { name: "whole bar: shelves, fridges, taps, rounded rail", foot: [0, 12.95, 8.25, 17.6] },
    { name: "left wall between store and bar", foot: [-0.05, 9.4, 0.4, 13.1] },
    { name: "crate stack", foot: [30.65, 14.6, 32, 17.6] },
    { name: "right edge", foot: [31.7, 13.7, 32, 15.35] },
    { name: "wall 14", foot: [0, 17.6, 32, 18] },
    { name: "Upper righr pillar", over: [[21.6, 6.6], [22.75, 6.6], [22.75, 9.2], [21.55, 9.2]] },
    { name: "Lower left Pillar", over: [[10.9, 11.5], [11.95, 11.5], [11.95, 14], [10.9, 14]] },
    { name: "Lower right pillar", over: [[21.6, 11.5], [22.75, 11.5], [22.75, 13.95], [21.6, 13.95]] },
    { name: "wall", foot: [25, 8.2, 25.35, 11.75] },
    { name: "wall 2", foot: [24.95, 13.6, 25.35, 18] },
    { name: "wall 3", foot: [27.95, 9.5, 32.05, 10.05] },
    { name: "wall 4", foot: [31.65, 8.2, 32.15, 9.55] },
    { name: "wall 5", foot: [25.25, 9.55, 25.9, 10] },
    { name: "wall 6", foot: [31.7, 10, 32.05, 11.9] },
    { name: "bar outline", over: [[0.4, 11.6], [6.9, 11.6], [6.9, 12.95], [0.45, 12.95]] },
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
