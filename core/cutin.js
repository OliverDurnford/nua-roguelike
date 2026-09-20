// ============================================================
// CUTIN: the parallax collection screens. Four layers of art
// rush in from alternating sides, decelerate into a slow cruise
// that never quite stops, then accelerate away again.
//
// The motion is a velocity curve, not a position curve. Velocity
// starts high, decays as a cubic into the cruise, holds, then
// ramps back up as a cubic. Position is the closed-form integral
// of that, taken straight off the scene clock, so the drift is
// identical at 30fps and at 144fps and nothing can stall.
//
// Design: docs/superpowers/specs/2026-09-20-collection-screens-design.md
// ============================================================

const CUTIN = {};

// Index 0 is the foreground (the friend), 3 is the far layer. Depth drives
// all three of: how far a layer travels in, how fast it cruises, and how
// late it arrives. dir is +1 for a layer moving rightwards (so it entered
// from the left), -1 for leftwards.
CUTIN.LAYERS = [
  { travel: 1100, cruise: 26, dir: 1 },
  { travel: 520, cruise: 17, dir: -1 },
  { travel: 320, cruise: 11, dir: 1 },
  { travel: 180, cruise: 5, dir: -1 },
];

CUTIN.ENTER_DUR = 0.44;   // how long a layer takes to come in
CUTIN.EXIT_DUR = 0.45;    // how long its acceleration away lasts
CUTIN.STAGGER = 0.06;     // gap between consecutive layers
CUTIN.EXIT_MULT = 1.6;    // exit travel, as a multiple of entry travel
CUTIN.TOTAL = 3.0;        // the whole screen, in seconds

// The far layer leads on the way in and trails on the way out, so the
// friend arrives last and clears first.
CUTIN._lag = (i) => CUTIN.STAGGER * (3 - i);
CUTIN.enterAt = (i) => CUTIN._lag(i);
CUTIN.parkedAt = (i) => CUTIN._lag(i) + CUTIN.ENTER_DUR;
CUTIN.exitAt = (i) => CUTIN.TOTAL - CUTIN.EXIT_DUR - CUTIN._lag(i);

// Entry velocity that covers `dist` in `dur` while decaying to `cruise`.
// Solved from the integral of cruise + (v0 - cruise)(1 - k)^3.
CUTIN._v0 = (dist, dur, cruise) => 4 * dist / dur - 3 * cruise;

// x offset from this layer's park position, in pixels, at scene time t.
CUTIN.offsetAt = (i, t) => {
  const L = CUTIN.LAYERS[i];
  const vc = L.cruise, s = L.dir, D = L.travel;
  const t0 = CUTIN.enterAt(i), t1 = CUTIN.parkedAt(i), t2 = CUTIN.exitAt(i);
  const inD = CUTIN.ENTER_DUR, R = CUTIN.EXIT_DUR, E = D * CUTIN.EXIT_MULT;

  if (t <= t0) return -s * D;

  if (t < t1) {
    const k = (t - t0) / inD;
    const v0 = CUTIN._v0(D, inD, vc);
    const x = vc * (t - t0) + (v0 - vc) * inD * (1 - Math.pow(1 - k, 4)) / 4;
    return s * (x - D);
  }

  if (t < t2) return s * vc * (t - t1);

  const base = s * vc * (t2 - t1);
  const u = t - t2;
  const vX = CUTIN._v0(E, R, vc);
  if (u < R) return base + s * (vc * u + (vX - vc) * Math.pow(u, 4) / (4 * R * R * R));
  return base + s * (E + vX * (u - R));
};
