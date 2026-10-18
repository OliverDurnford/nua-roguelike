// ============================================================
// NUDGE: pointing the way on (18 Oct 2026). Friends wandered a beaten
// boss's room without jumping in the crack, and missed the door going green
// in a cleared one (Ollie, the morning after launch). Once the way on has
// been open a while, a bobbing arrow points at it (from the screen's edge
// if it is out of view) and a chip says what to do; for the crack, the
// camera can go and show it again later. Time only counts while play is
// running: never paused, never a cutscene (the voice in the cracks).
// Tests: node tools/tests/tips.test.js
// ============================================================

const NUDGE = {};
NUDGE.CRACK_AFTER = 10;   // s after a boss's crack is open before the nudge
NUDGE.CRACK_GLIDE = 25;   // s before the camera goes to show it, if out of view
NUDGE.DOOR_AFTER = 20;    // s after a fight room is cleared
NUDGE.MARGIN = 40;        // px in from the screen's edge for an arrow

// What to show t seconds in: o.after, and o.glideAfter if given.
NUDGE.phase = (t, o) => ({ show: t >= o.after, glide: !!o.glideAfter && t >= o.glideAfter });

// Where the arrow goes for a point p on the screen (it may be off it): over
// the point if it is in view, else on the edge along the line from the
// middle, pointing at it (angle in radians, 0 = right, y down).
NUDGE.edge = (p, view, margin) => {
  const inView = p.x >= margin && p.x <= view.w - margin && p.y >= margin && p.y <= view.h - margin;
  if (inView) return { inView: true, x: p.x, y: p.y, angle: Math.PI / 2 };
  const cx = view.w / 2, cy = view.h / 2, dx = p.x - cx, dy = p.y - cy;
  const s = Math.min((view.w / 2 - margin) / Math.max(Math.abs(dx), 1e-9), (view.h / 2 - margin) / Math.max(Math.abs(dy), 1e-9));
  return { inView: false, x: cx + dx * s, y: cy + dy * s, angle: Math.atan2(dy, dx) };
};

// Watch for one way on in this scene. o.at() is its place in the room,
// o.ready() true once it can be taken, o.done() true once it has been, o.say
// the chip's words, o.colour the arrow's, o.lift px the arrow sits above it
// when in view, o.glide(at) shows it (once, at o.glideAfter, if out of view).
NUDGE.watch = (o) => {
  let t = 0, glided = false, chip = null;
  const lift = o.lift || 60;
  const obj = add([fixed(), z(186), pos(0, 0)]);
  const stop = () => {
    if (chip) chip.destroy();
    chip = null;
    obj.destroy();
  };
  obj.onUpdate(() => {
    if (o.done()) return stop();
    if (G.paused || G.cutscene || (o.ready && !o.ready())) return;
    t += dt();
    const ph = NUDGE.phase(t, o);
    if (ph.show && !chip) {
      chip = UI.chipObj(o.say, G.W / 2, G.H - 58, { z: 194, fill: UI.STEEL, shade: UI.BLUE, opacity: 0 });
      UI.fadeObj(chip, 1, 0.3);
    }
    if (ph.glide && !glided) {
      glided = true;
      const e = NUDGE.edge(toScreen(o.at()), { w: G.W, h: G.H }, NUDGE.MARGIN);
      if (!e.inView && o.glide) o.glide(o.at());
    }
  });
  obj.onDraw(() => {
    if (!chip || G.paused || G.cutscene) return;
    const sp = toScreen(o.at());
    const e = NUDGE.edge(sp, { w: G.W, h: G.H }, NUDGE.MARGIN);
    const bob = Math.sin(time() * 5) * 5;
    // in view: over it, pointing down; out of view: on the edge, pointing out
    const out = vec2(Math.cos(e.angle), Math.sin(e.angle));
    const tip = e.inView ? vec2(e.x, e.y - lift + bob) : vec2(e.x, e.y).add(out.scale(bob));
    const dir = e.inView ? vec2(0, 1) : out;
    const side = vec2(-dir.y, dir.x);
    const back = tip.sub(dir.scale(22));
    drawTriangle({ p1: tip.add(dir.scale(4)), p2: back.add(side.scale(17)), p3: back.sub(side.scale(17)), color: UI.rgb(UI.INK) });
    drawTriangle({ p1: tip, p2: back.add(side.scale(13)).add(dir.scale(2)), p3: back.sub(side.scale(13)).add(dir.scale(2)), color: rgb(o.colour[0], o.colour[1], o.colour[2]) });
  });
  return { stop };
};
