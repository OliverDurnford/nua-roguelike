// ============================================================
// TRIANGULATE: cut a traced outline into triangles, once, as indices
// for drawPolygon({ pts, indices }).
//
// Kaboom 3000's drawPolygon fills a shape as a fan from its first point
// unless it is given indices. A fan only covers a CONVEX shape: round a
// concave trace (a pedestal table's stem, a notched bar end) it spills
// over the floor beside it, and that patch of the painting is then
// redrawn over anyone standing there. Ear clipping covers exactly the
// traced shape, so the game draws what the level board shows.
// ============================================================

const TRIANGULATE = (pts) => {
  const n = pts.length;
  if (n < 3) return [];
  const fan = [];
  for (let k = 0; k + 2 < n; k++) fan.push(0, k + 1, k + 2);
  let a2 = 0;
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    a2 += p.x * q.y - q.x * p.y;
  }
  if (a2 === 0) return fan;
  // turn direction, made positive for a corner that bulges outwards
  const s = Math.sign(a2);
  const cross = (o, a, b) => ((a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)) * s;
  const same = (p, q) => p.x === q.x && p.y === q.y;
  const left = [];
  for (let i = 0; i < n; i++) left.push(i);
  const out = [];
  while (left.length > 3) {
    let cut = -1;
    for (let i = 0; i < left.length && cut < 0; i++) {
      const ia = left[(i + left.length - 1) % left.length], ib = left[i], ic = left[(i + 1) % left.length];
      const a = pts[ia], b = pts[ib], c = pts[ic];
      if (cross(a, b, c) < 0) continue;          // a dent, not an ear
      let clear = true;
      for (const j of left) {
        if (j === ia || j === ib || j === ic) continue;
        const p = pts[j];
        if (same(p, a) || same(p, b) || same(p, c)) continue;
        if (cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0) { clear = false; break; }
      }
      if (clear) { out.push(ia, ib, ic); cut = i; }
    }
    if (cut < 0) return fan;                     // a trace that crosses itself: the old fill
    left.splice(cut, 1);
  }
  out.push(left[0], left[1], left[2]);
  return out;
};
