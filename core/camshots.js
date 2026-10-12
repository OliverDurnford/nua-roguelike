// ============================================================
// CAMSHOTS: a camera that follows the player until it is handed a
// list of shots, flies them in order, then hands back. The finale's
// opening and ending are made of these (scenes/finale.js).
//
// A shot: { to, zoom, move, hold, start, arrive }
//   to      a world position, "follow" for wherever the player is, or a
//           function returning a position, asked every frame
//   zoom    camScale for the shot, 1 = normal
//   move    seconds to get there, eased; 0 = a cut
//   hold    seconds to stay once there
//   start   optional, called as the shot begins
//   arrive  optional, called once, the moment it gets there
// The view is kept inside the map at every zoom, so a shot near an
// edge never shows the void past the painting.
// ============================================================

const CAMSHOTS = {};

CAMSHOTS.ease = (k) => {
  k = Math.min(1, Math.max(0, k));
  return k * k * (3 - 2 * k);
};

// A camera centre for a viewW x viewH view at this zoom that stays inside
// bounds {x1, y1, x2, y2}. A map smaller than the view is centred instead.
CAMSHOTS.clamp = (p, zoom, viewW, viewH, b) => {
  const hw = viewW / 2 / zoom, hh = viewH / 2 / zoom;
  const cx = b.x2 - b.x1 <= hw * 2 ? (b.x1 + b.x2) / 2 : Math.min(b.x2 - hw, Math.max(b.x1 + hw, p.x));
  const cy = b.y2 - b.y1 <= hh * 2 ? (b.y1 + b.y2) / 2 : Math.min(b.y2 - hh, Math.max(b.y1 + hh, p.y));
  return vec2(cx, cy);
};

CAMSHOTS.director = (bounds, viewW, viewH) => {
  const d = { shots: [], i: -1, t: 0, arrived: false, onDone: null, pos: null, zoom: 1, fromPos: null, fromZoom: 1 };

  const begin = () => {
    d.t = 0;
    d.arrived = false;
    d.fromPos = d.pos ? d.pos.clone() : null;
    d.fromZoom = d.zoom;
    const s = d.shots[d.i];
    if (s && s.start) s.start();
  };

  d.busy = () => d.i >= 0;
  d.cut = (p, zoom = 1) => { d.pos = p.clone(); d.zoom = zoom; };
  d.run = (shots, onDone) => {
    d.shots = shots;
    d.i = 0;
    d.onDone = onDone || null;
    begin();
  };

  // called every frame by the scene with the (already clamped) follow target
  d.apply = (follow) => {
    if (d.i < 0) {
      d.pos = follow.clone();
      d.zoom = 1;
      camScale(vec2(1));
      camPos(d.pos);
      return;
    }
    const s = d.shots[d.i];
    const want = typeof s.to === "function" ? s.to() : s.to === "follow" ? follow : s.to;
    const to = CAMSHOTS.clamp(want, s.zoom, viewW, viewH, bounds);
    const from = d.fromPos || to;
    // the 1e-6 stops float drift in the summed frame times leaving a shot
    // one frame short of arriving
    const k = s.move > 0 ? CAMSHOTS.ease((d.t + 1e-6) / s.move) : 1;
    d.pos = from.lerp(to, k);
    d.zoom = d.fromZoom + (s.zoom - d.fromZoom) * k;
    camScale(vec2(d.zoom));
    camPos(d.pos);
    if (k >= 1 && !d.arrived) {
      d.arrived = true;
      if (s.arrive) s.arrive();
    }
    d.t += dt();
    if (d.t > s.move + s.hold + 1e-9) {
      d.i++;
      if (d.i >= d.shots.length) {
        d.i = -1;
        const cb = d.onDone;
        d.onDone = null;
        if (cb) cb();
      } else {
        begin();
      }
    }
  };
  return d;
};
