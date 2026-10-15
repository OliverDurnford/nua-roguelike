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

// Push obj out of every solid its feet overlap, along one axis only, back
// the way it came (`dir`, the sign of the move on that axis). Called once
// per axis right after moving on that axis (see moveBy), so it slides
// along edges. Two things keep it on the right side of a wall (Ollie, 15
// Oct 2026: Propaganda's way out put you outside the room):
//   - feet that only touch a face, give or take rounding, are not inside:
//     a hair over a locked door's side, then a step down, used to push
//     the feet out through the door's far side
//   - the push is back the way it came, never the shorter way out, which
//     through anything thinner than the step is the far side. Only feet
//     that were inside before this step (deeper than `step`) take the
//     shorter way: that is a start point on a wall, not a walk into one.
COLLIDE.EPS = 1e-6;
COLLIDE.resolve = (obj, axis, dir, step = 0) => {
  const f = COLLIDE.feetOf(obj);
  const E = COLLIDE.EPS;
  for (const s of COLLIDE.solids) {
    if (s.open && s.open()) continue;
    if (f.x2 <= s.x1 + E || f.x1 >= s.x2 - E || f.y2 <= s.y1 + E || f.y1 >= s.y2 - E) continue;
    const left = f.x2 - s.x1, right = s.x2 - f.x1, up = f.y2 - s.y1, down = s.y2 - f.y1;
    const [lo, hi, other] = axis === "x" ? [left, right, Math.min(up, down)] : [up, down, Math.min(left, right)];
    const came = dir > 0 ? lo : dir < 0 ? hi : Infinity;
    let d;
    if (came <= step + E) d = dir > 0 ? -lo : hi;           // walked in this step: back out
    else if (Math.min(lo, hi) <= other) d = lo < hi ? -lo : hi;   // inside already: the short way
    else continue;                                         // ...which is the other axis
    if (axis === "x") { obj.pos.x += d; f.x1 += d; f.x2 += d; }
    else { obj.pos.y += d; f.y1 += d; f.y2 += d; }
  }
};

// How far obj would get along unit vector `dir` (up to `dist`) before the
// walls stop it, sliding included but only progress along `dir` counted.
// Nothing moves: a stand-in with the same feet takes the walk.
COLLIDE.travel = (obj, dir, dist) => {
  COLLIDE.feetOf(obj);   // works the feet out once, if they never were
  const probe = { pos: { x: obj.pos.x, y: obj.pos.y }, feet: obj.feet };
  COLLIDE.moveBy(probe, { x: dir.x * dist, y: dir.y * dist });
  return (probe.pos.x - obj.pos.x) * dir.x + (probe.pos.y - obj.pos.y) * dir.y;
};

// Does a box of half-size r centred on (x, y) overlap a wall? Thrown things
// test their shadow on the floor with this (PLAYER.fire, ENEMIES.shootAt),
// the way people's feet are stopped: an item flies at hand height, so the
// picture of it sits well above the floor it is crossing.
COLLIDE.hits = (x, y, r) => {
  for (const s of COLLIDE.solids) {
    if (s.open && s.open()) continue;
    if (x + r > s.x1 && x - r < s.x2 && y + r > s.y1 && y - r < s.y2) return true;
  }
  return false;
};

// Move by a world-pixel vector, x then y, resolving after each. A long move
// goes in pieces of at most STEP px: the engine does not cap a frame's
// time, so a stall on a phone could carry the feet clean over a thin wall
// in one jump. A ghost (obj.ghost, the finale's walk-off out of the park)
// is not stopped at all.
COLLIDE.STEP = 8;
COLLIDE.moveBy = (obj, v) => {
  if (obj.ghost) { obj.pos.x += v.x; obj.pos.y += v.y; return; }
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(v.x), Math.abs(v.y)) / COLLIDE.STEP));
  const sx = v.x / n, sy = v.y / n;
  for (let i = 0; i < n; i++) {
    if (sx) { obj.pos.x += sx; COLLIDE.resolve(obj, "x", Math.sign(sx), Math.abs(sx)); }
    if (sy) { obj.pos.y += sy; COLLIDE.resolve(obj, "y", Math.sign(sy), Math.abs(sy)); }
  }
};
