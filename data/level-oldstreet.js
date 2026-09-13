// ============================================================
// OLD STREET STATION: Chapter 4, Area 4. A QUIET area, so there
// are no enemies in it: you come up the stairs onto the platform,
// pick up the friend waiting on the bench and carry on.
//
// This area does NOT use an ASCII map. It is a "plate" area:
// one painted top-down background (core/plates-real.js) with a
// hand-measured collision layer drawn on top of it.
//
// HOW THE NUMBERS WORK
// Everything below is in GRID UNITS, not pixels. The plate is
// 32 units wide by 18 units tall, and one unit is 48 world px,
// so the finished platform is 1536 x 864 px.
//
// Unit 0,0 is the top left corner of the picture. To find a spot,
// open "Level Design/Old Street Station/Old Street Station - game
// plate.jpg", imagine it cut into 32 columns and 18 rows, and read
// off the column and row.
//
// solid: [x1, y1, x2, y2] - a rectangle you cannot walk through.
//        Bullets stop on these too.
//
// THE SHAPE OF THE ROOM
// The top two fifths are one sealed band: the curved tunnel wall
// with its poster frames, the black tunnel mouth at each end, and
// the track bed. You cannot get onto the rails. The band stops at
// the platform edge, so the white nosing, the yellow line and the
// ribbed tactile strip are all walkable, which is the whole joke
// of standing on the wrong side of it.
//
// The bottom fifth is the cream tiled back wall, cut by the two
// arched exit passages. Those run right down off the picture, and
// the way out is at the foot of the right hand one.
//
// The painted distancing circles are floor markings, not objects,
// so nothing stops you walking over them.
// ============================================================

const OLDSTREET_PLATE = {
  sprite: "plate-oldstreet",
  cols: 32,
  rows: 18,
  unit: 48,          // world pixels per grid unit -> room is 1536 x 864

  // A touch bigger than the game default, so a person reads at the
  // right size against this platform's tiles. Multiplies G.CHAR_H,
  // so a person is 83px down here.
  charScale: 1.15,

  solid: [
    // ---- the sealed half: tunnel wall, tunnel mouths, track bed ----
    // One band, top of the picture down to the platform edge. The
    // edge itself is walkable: the band stops on the dark line at the
    // foot of the coping, just above the white nosing.
    [0,     0,     32,    5.8],     // tunnel wall, tunnel mouths and track bed

    // ---- the platform's end walls, left and right ----
    // Thin, and they take in the dark panel painted on each end wall.
    [0,     5.8,   0.58,  13.75],   // end wall, left
    [31.55, 5.8,   32,    13.75],   // end wall, right

    // ---- what is standing on the platform ----
    [7.1,   10.65, 8.88,  13.3],    // vending machine
    [11.5,  11.85, 14.8,  13.33],   // bench, left (the friend is on this one)
    [16.68, 11.87, 17.63, 13.3],    // litter bin
    [20.42, 11.85, 23.72, 13.33],   // bench, right

    // ---- the tiled back wall, broken by the two arched passages ----
    // The arches are painted with a curved head, so the gaps are cut
    // at the width of the straight sides below it: everything from
    // the platform down to the bottom edge is open.
    [0,     13.75, 3.08,  18],      // wall, left of the near passage
    [5.46,  13.75, 26.69, 18],      // the long run, roundel panels and all
    [29.04, 13.75, 32,    18],      // wall, right of the far passage

    // ---- the picture's own bottom edge, so nobody walks out of frame
    // through a passage. The way out sits across this line.
    [0,     17.82, 32,    18],      // bottom edge of the picture
  ],

  // Up out of the left hand passage, at the head of it: the arch is
  // painted with a curved top, and this is the first row where the
  // passage floor is actually drawn, so you arrive standing in the mouth.
  playerSpawn: [4.27, 14.6],

  // The friend waiting here (quiet area): sat on the near end of the
  // left bench, on the front edge of the seat, so the sprite reads as
  // sitting rather than standing behind it. The benches are hard against
  // the back wall, so this end is the only side you can reach them from.
  companionSpawn: [11.7, 12.9],

  // Never used: this area spawns nothing. Kept so the file matches the
  // schema every other area uses. All four are out on the open platform.
  enemySpawns: [
    [6.5, 9.5], [11.5, 9.0], [21.0, 9.0], [26.0, 9.5],
  ],

  // Way out: across the foot of the right hand passage, flush with the
  // bottom edge so it reads as a threshold.
  exit: [26.85, 17.45, 28.9, 17.86],
};
