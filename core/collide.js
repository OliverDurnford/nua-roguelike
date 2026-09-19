// ============================================================
// COLLIDE: walls stop your feet, not your body.
//
// Every wall, table and lamppost base is a rectangle registered here in
// world pixels. Actors carry a small "feet" box (obj.feet, offsets from
// obj.pos) and, after they move, are pushed out of any rectangle their
// feet overlap. Bullets, pickups and contact damage still use Kaboom's
// area() on the body, so this only changes where you can walk.
//
// Pure: no Kaboom calls, so tools/tests/collide.test.js can run it in
// node.
// ============================================================

const COLLIDE = {};

// The current room's solid rectangles: { x1, y1, x2, y2, open }.
// `open` is an optional function; while it returns true the rectangle is
// ignored (the exit door once the room is cleared).
COLLIDE.solids = [];

COLLIDE.reset = () => { COLLIDE.solids = []; };

COLLIDE.add = (x1, y1, x2, y2, opts) => {
  const s = { x1, y1, x2, y2, open: (opts && opts.open) || null };
  COLLIDE.solids.push(s);
  return s;
};

// The feet box in world pixels. Characters set obj.feet at creation
// (ART.feetBox). Anything else gets the bottom 30% of its area box at 90%
// of the width, worked out once from the sprite and kept.
COLLIDE.feetOf = (obj) => {
  if (!obj.feet) {
    const b = obj.worldArea().bbox();
    const w = b.width * 0.9, h = b.height * 0.3;
    const x1 = b.pos.x + (b.width - w) / 2, y1 = b.pos.y + b.height - h;
    obj.feet = { dx: x1 - obj.pos.x, dy: y1 - obj.pos.y, w, h };
  }
  const f = obj.feet;
  const x1 = obj.pos.x + f.dx, y1 = obj.pos.y + f.dy;
  return { x1, y1, x2: x1 + f.w, y2: y1 + f.h };
};

// Push obj out of every solid its feet overlap, along one axis only. Called
// once per axis right after moving on that axis (see moveBy), so the push
// is always back the way the actor came and it slides along edges.
COLLIDE.resolve = (obj, axis) => {
  const f = COLLIDE.feetOf(obj);
  for (const s of COLLIDE.solids) {
    if (s.open && s.open()) continue;
    if (f.x2 <= s.x1 || f.x1 >= s.x2 || f.y2 <= s.y1 || f.y1 >= s.y2) continue;
    let d;
    if (axis === "x") {
      const left = f.x2 - s.x1, right = s.x2 - f.x1;
      d = left < right ? -left : right;
      obj.pos.x += d; f.x1 += d; f.x2 += d;
    } else {
      const up = f.y2 - s.y1, down = s.y2 - f.y1;
      d = up < down ? -up : down;
      obj.pos.y += d; f.y1 += d; f.y2 += d;
    }
  }
};

// Move by a world-pixel vector, x then y, resolving after each.
COLLIDE.moveBy = (obj, v) => {
  if (v.x) { obj.pos.x += v.x; COLLIDE.resolve(obj, "x"); }
  if (v.y) { obj.pos.y += v.y; COLLIDE.resolve(obj, "y"); }
};
