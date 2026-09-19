// ============================================================
// DEPTH: who draws in front of whom on the field.
//
// Everyone standing on the floor gets a z from where their feet are:
// further down the picture draws on top. Painted outlines (the top of a
// lamppost, a table) take the z of their base line, so an actor whose
// feet are above the base is drawn under it and stands "behind" it.
// The band is 40 to 60; floor markers sit under it, effects and UI above.
// ============================================================

const DEPTH = {};

DEPTH.z = (y) => 40 + 20 * Math.max(0, Math.min(1, y / (G.worldH || 1)));

// Keep obj.z following its feet every frame. `footDy` overrides where the
// feet are (bullets pass 0: their own y); otherwise COLLIDE.feetOf decides.
DEPTH.track = (obj, footDy) => {
  const footY = () => (typeof footDy === "number") ? obj.pos.y + footDy : COLLIDE.feetOf(obj).y2;
  obj.z = DEPTH.z(footY());
  obj.onUpdate(() => { obj.z = DEPTH.z(footY()); });
};
