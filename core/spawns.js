// ============================================================
// SPAWNS: where an enemy may come in (Ollie, 13 Oct 2026).
//   - never on top of you: every enemy's spot is chosen the moment it
//     arrives, at least AWAY from wherever you are standing right then,
//     so the no-spawn zone walks with you
//   - a fight room with no spawn points of its own (the Beehive, the
//     flat, the Mischief, the Playhouse and Rowans were redrawn with
//     blank level files) still gets its enemies: they come in on open
//     floor you can reach, worked out from the room's own walls
// Spawn points placed on the level board always come first.
//
// Pure: points are plain {x, y} and nothing here calls Kaboom, so
// tools/tests/spawns.test.js runs it in node.
// ============================================================

const SPAWNS = {};

// Does box b ({x1, y1, x2, y2}) touch any solid? An `open` solid (a door
// once its room is cleared) is ignored.
SPAWNS.hits = (b, solids) => {
  for (const s of solids) {
    if (s.open && s.open()) continue;
    if (b.x2 > s.x1 && b.x1 < s.x2 && b.y2 > s.y1 && b.y1 < s.y2) return true;
  }
  return false;
};

// box ({dx, dy, w, h}, offsets from a point) placed at p
SPAWNS.at = (p, box) => ({ x1: p.x + box.dx, y1: p.y + box.dy, x2: p.x + box.dx + box.w, y2: p.y + box.dy + box.h });

// Even-odd point in polygon, pts as [{x, y}].
SPAWNS.inside = (p, pts) => {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) ins = !ins;
  }
  return ins;
};

// The open floor: grid points `step` apart that you can walk to from
// `start` (your feet box, `walk`, flooded four ways) and where an enemy's
// feet (`fit`, the biggest of them) are clear too. A point inside one of
// `hidden` (the outlines you walk behind) is reachable but left out, so
// nothing arrives where you cannot see it come in.
SPAWNS.floor = ({ solids, bounds, start, walk, fit, step, hidden = [] }) => {
  const cols = Math.floor((bounds.x2 - bounds.x1) / step);
  const rows = Math.floor((bounds.y2 - bounds.y1) / step);
  const pt = (c, r) => ({ x: bounds.x1 + (c + 0.5) * step, y: bounds.y1 + (r + 0.5) * step });
  const inRoom = (b) => b.x1 >= bounds.x1 && b.y1 >= bounds.y1 && b.x2 <= bounds.x2 && b.y2 <= bounds.y2;
  const ok = new Int8Array(cols * rows).fill(-1);   // -1 untested, 0 blocked, 1 walkable
  const walkable = (c, r) => {
    const i = r * cols + c;
    if (ok[i] < 0) { const b = SPAWNS.at(pt(c, r), walk); ok[i] = inRoom(b) && !SPAWNS.hits(b, solids) ? 1 : 0; }
    return ok[i] === 1;
  };
  // flood from the walkable cell nearest the start
  let c0 = Math.max(0, Math.min(cols - 1, Math.floor((start.x - bounds.x1) / step)));
  let r0 = Math.max(0, Math.min(rows - 1, Math.floor((start.y - bounds.y1) / step)));
  if (!walkable(c0, r0)) {
    let best = null, bd = Infinity;
    for (let r = Math.max(0, r0 - 4); r <= Math.min(rows - 1, r0 + 4); r++) {
      for (let c = Math.max(0, c0 - 4); c <= Math.min(cols - 1, c0 + 4); c++) {
        const d = (c - c0) * (c - c0) + (r - r0) * (r - r0);
        if (d < bd && walkable(c, r)) { bd = d; best = [c, r]; }
      }
    }
    if (!best) return [];
    [c0, r0] = best;
  }
  const seen = new Uint8Array(cols * rows);
  const queue = [r0 * cols + c0];
  seen[queue[0]] = 1;
  const out = [];
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q], c = i % cols, r = (i - c) / cols;
    const p = pt(c, r);
    const b = SPAWNS.at(p, fit);
    if (inRoom(b) && !SPAWNS.hits(b, solids) && !hidden.some((h) => SPAWNS.inside(p, h))) out.push(p);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
      const j = nr * cols + nc;
      if (seen[j] || !walkable(nc, nr)) continue;
      seen[j] = 1;
      queue.push(j);
    }
  }
  return out;
};

const spawnDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// One spot from `pts`: at least `away` from `from` (you), at least `gap`
// from every spot in `used` (this wave so far), and if `within` is given,
// preferably no further than that from `around` (the boss calling its
// minions to its side). rnd() gives 0 to 1. Null when nothing is far
// enough from you: better nobody comes in than one lands on you.
SPAWNS.pick = (pts, { from, away, used = [], gap = 0, around = null, within = Infinity, rnd = Math.random }) => {
  const clear = pts.filter((p) => spawnDist(p, from) >= away && used.every((u) => spawnDist(p, u) >= gap));
  const near = around ? clear.filter((p) => spawnDist(p, around) <= within) : clear;
  const pool = near.length ? near : clear;
  return pool.length ? pool[Math.floor(rnd() * pool.length)] : null;
};

// The spot for the next enemy: the room's own spawn points first, then the
// open floor, at least `away` from you either way. Null if neither has one.
SPAWNS.choose = ({ own, floor, from, away, used, gap, rnd }) =>
  SPAWNS.pick(own, { from, away, used, gap, rnd })
  || SPAWNS.pick(floor, { from, away, used, gap, rnd });
