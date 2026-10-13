// ============================================================
// FIDGETS: what each friend's idle fidget plays (Ollie, 13 Oct 2026;
// spec docs/superpowers/specs/2026-10-13-idle-animations-design.md).
// Steps of [frame, seconds]: I1 is the move starting, I2 the moment
// itself (core/sprites-fidget.js). The friend stands before and after.
// Tune the seconds freely, nothing needs regenerating. Keep it plain
// JSON: tools/animation/idle_preview.py reads it too.
// ============================================================

const FIDGETS = {
  "ollie": [["I1", 0.3], ["I2", 0.35], ["I1", 0.2], ["I2", 0.35], ["I1", 0.2], ["I2", 0.4], ["I1", 0.3]],
  "lucy": [["I1", 0.3], ["I2", 1.2], ["I1", 0.3]],
  "cal": [["I1", 0.3], ["I2", 1.2], ["I1", 0.3]],
  "josh": [["I1", 0.3], ["I2", 0.3], ["I1", 0.25], ["I2", 0.3], ["I1", 0.25], ["I2", 0.4], ["I1", 0.3]],
  "annie": [["I1", 0.3], ["I2", 0.3], ["I1", 0.25], ["I2", 0.3], ["I1", 0.25], ["I2", 0.3], ["I1", 0.3]],
  "sam": [["I1", 0.35], ["I2", 1.2], ["I1", 0.3]],
  "ana": [["I1", 0.7], ["I2", 0.9], ["I1", 0.3]],
  "jess": [["I1", 0.4], ["I2", 0.3], ["I1", 0.3], ["I2", 0.3], ["I1", 0.4]],
  "adam": [["I1", 0.2], ["I2", 0.2], ["I1", 0.2], ["I2", 0.2], ["I1", 0.2], ["I2", 0.2], ["I1", 0.3]],
  "ethan": [["I1", 0.6], ["I2", 0.45], ["I1", 0.4]]
};
