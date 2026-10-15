// ============================================================
// FIDGET: life while standing still (Ollie, 13 Oct 2026; spec
// docs/superpowers/specs/2026-10-13-idle-animations-design.md).
//   - everyone standing breathes and blinks, never in step
//   - in a calm room, one friend at a time does their fidget
//     (data/fidgets.js), then a longer pause, then a different one
// The clocks at the top are plain functions of time and state, tested
// in node (tools/tests/fidget.test.js). The Kaboom glue is below them.
// ============================================================

const FIDGET = {};

// Ollie, 15 Oct 2026: quicker, so you see them without waiting (were 4 and 8)
FIDGET.STILL_BEFORE = 1.5; // s the player stands still before the first fidget
FIDGET.GAP = 3;            // s from one fidget ending to the next starting
FIDGET.BREATHE = 0.8;      // s on each of the two breathe frames
FIDGET.BLINK = [2.5, 6];   // s between blinks, random in this range
FIDGET.BLINK_LEN = 0.11;   // s the eyes stay shut
FIDGET.DOUBLE = 0.2;       // chance a blink comes as a quick double
FIDGET.REOPEN = 0.12;      // s open between the two halves of a double

// 0 or 1: which breathe frame shows at time t
FIDGET.breathe = (t) => Math.floor(t / FIDGET.BREATHE) % 2;

// One person's blink clock. rnd() gives 0 to 1. update(dt) is true while
// the eyes are shut.
FIDGET.blinker = (rnd) => {
  const gap = () => FIDGET.BLINK[0] + rnd() * (FIDGET.BLINK[1] - FIDGET.BLINK[0]);
  let wait = gap(), shut = 0, again = false, second = false;
  return {
    update(dt) {
      if (shut > 0) {
        shut -= dt;
        if (shut > 0) return true;
        second = again;
        again = false;
        wait = second ? FIDGET.REOPEN : gap();
        return false;
      }
      wait -= dt;
      if (wait > 0) return false;
      shut = FIDGET.BLINK_LEN;
      again = !second && rnd() < FIDGET.DOUBLE;   // the second half never rolls for a third
      second = false;
      return true;
    },
  };
};

// The frame a fidget shows t seconds in, or null once it has played out.
FIDGET.at = (seq, t) => {
  for (const [frame, s] of seq) {
    if (t < s) return frame;
    t -= s;
  }
  return null;
};

// Whether the player is walking. The player's own `standing` (from the
// keys, the stick, actions and cutscene walks) decides it; distance only
// catches being pushed along. A per-frame distance alone failed on fast
// screens: at 120 or 144 Hz a full-speed walk is under 2 px a frame.
FIDGET.isMoving = (s) => !s.standing || s.dist > 30 * s.dt;

// A fidget stops at once if the player moves, the room stops being calm,
// or the friend doing it is no longer standing (hurt, walking off).
FIDGET.shouldCancel = (s) => s.moving || !s.calm || !s.standing;

// Whose turn it is. update(dt, s) takes the room's state:
//   s.calm   - a quiet room, or a fight room once cleared, no cutscene
//   s.moving - the player moved this frame
//   s.ready  - ids of everyone standing who has a fidget, player included
// and returns the id that should start a fidget now, or null. After a
// start it waits for done(): the gap only counts once the fidget is over.
// A shuffle bag, as the speech system uses: everyone has a turn before
// anyone repeats, and nobody goes twice running unless they are alone.
FIDGET.turns = (rnd) => {
  let still = 0, gapT = 0, playing = false, after = false, bag = [], last = null;
  const shuffle = (ids) => {
    const b = ids.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
  return {
    update(dt, s) {
      if (s.moving || !s.calm) { still = 0; gapT = 0; after = false; playing = false; return null; }
      if (playing) return null;
      if (!after) { still += dt; if (still < FIDGET.STILL_BEFORE) return null; }
      else { gapT += dt; if (gapT < FIDGET.GAP) return null; }
      const ok = (id) => s.ready.includes(id) && (id !== last || s.ready.length === 1);
      let pick = bag.find(ok);
      if (!pick) { bag = shuffle(s.ready); pick = bag.find(ok); }
      if (!pick) return null;
      bag.splice(bag.indexOf(pick), 1);
      last = pick;
      playing = true;
      return pick;
    },
    done() { playing = false; after = true; gapT = 0; },
  };
};

// ---------- Sam and Josh ----------
// With both of them in the party, the two of them take a turn like anyone
// else's fidget: they step together, share a peck on the lips, and Josh goes
// shy, hands to his blushing cheeks while Sam grins at him (Ollie, 13 Oct
// 2026). The two moments are one drawing of them both (core/sprites-pair.js,
// tools/animation/build_pair_sheet.py); the steps in and out are their own
// walks, so the drawing takes over with each of them already where it has
// them standing.
FIDGET.PAIR = { id: "josh+sam", kisser: "sam", shy: "josh" };
// Seconds per beat, in order.
FIDGET.KISS = { meet: 0.5, kiss: 1.1, shy: 1.8, back: 0.45 };

const kissEase = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));

// Where the kiss is at time t: meet (0 at their own spots, 1 in the
// drawing's places), frame (the drawing showing: "kiss", "shy" or null),
// walking (stepping to or from the spot) and done.
FIDGET.kissAt = (t) => {
  const K = FIDGET.KISS;
  const t0 = K.meet, t1 = t0 + K.kiss, t2 = t1 + K.shy, t3 = t2 + K.back;
  return {
    meet: t < t0 ? kissEase(t / t0) : t < t2 ? 1 : kissEase(1 - (t - t2) / K.back),
    frame: t < t0 || t >= t2 ? null : t < t1 ? "kiss" : "shy",
    walking: t < t0 || (t >= t2 && t < t3),
    done: t >= t3,
  };
};

// ---------- on the field ----------

// Someone standing still: their breathe and blink, set by hand each frame
// (the "idle" anim is stopped so the engine's own loop cannot fight it).
// Each person keeps their own clocks on obj.idleLife, started at a random
// point, so no two breathe or blink in step.
FIDGET.idle = (obj, id) => {
  const an = G.SPR["ch-" + id].anims;
  if (!obj.idleLife) obj.idleLife = { t: rand(0, 2 * FIDGET.BREATHE), blink: FIDGET.blinker(() => rand(0, 1)) };
  const life = obj.idleLife;
  if (obj.curAnim()) obj.stop();
  life.t += dt();
  const k = FIDGET.breathe(life.t);
  const shut = life.blink.update(dt());
  obj.frame = (shut && an.blink ? an.blink.from : an.idle.from) + k;
};

// A friend's fidget sheet, or null. STAND_IN borrows the select pose's two
// cells instead, to judge the timing before the fidget art exists.
FIDGET.STAND_IN = false;
FIDGET.sheet = (id) =>
  G.SPR["ch-" + id + "-fidget"] || (FIDGET.STAND_IN && G.SPR["ch-" + id + "-pose"]) || null;

// Play one fidget. A stand-in on the fidget sheet takes the friend's place
// (same spot, size, depth, facing and flicker) while their own sprite is
// hidden, so their hitbox and feet never change. Returns a cancel.
FIDGET.play = (obj, id, onDone) => {
  const reg = FIDGET.sheet(id);
  const a = reg.anims.fidget || reg.anims.pose;
  const seq = FIDGETS[id];
  // born facing, flickering and framed like the friend: it is drawn once
  // before its own onUpdate first runs, and a left-facing friend flashed
  // the wrong way for that frame
  const sub = add([
    sprite(reg.name, { flipX: obj.flipX, frame: a.from }), anchor(vec2(0, reg.anchorY)),
    pos(obj.pos), scale(obj.scale), opacity(obj.opacity), z(obj.z),
  ]);
  obj.hidden = true;
  let t = 0, over = false;
  const end = () => {
    if (over) return;
    over = true;
    if (sub.exists()) destroy(sub);
    if (obj.exists()) obj.hidden = false;
    onDone();
  };
  sub.onUpdate(() => {
    if (G.paused) return;
    t += dt();
    const f = obj.exists() ? FIDGET.at(seq, t) : null;
    if (!f) { end(); return; }
    sub.frame = f === "I1" ? a.from : a.to;
    sub.pos = obj.pos;
    sub.scale = obj.scale;
    sub.flipX = obj.flipX;
    sub.z = obj.z;
    sub.opacity = obj.opacity;
  });
  return end;
};

// The kiss. Stand-ins on their own sheets walk the two of them into the
// drawing's places, the drawing plays, and they walk back, all while the
// real two are hidden, as FIDGET.play does for one, so neither hitbox nor
// feet ever move. The drawing has Sam on the left; with Sam on the right it
// is mirrored. Returns a cancel. { whilePaused } plays it with the room
// frozen, for the voice in the cracks' cutscene (core/crackvoice.js), and
// on top of everyone on the floor, so nobody stood in front hides it.
FIDGET.kiss = (kisser, shy, onDone, opt = {}) => {
  const top = opt.whilePaused ? 60 : null;   // the top of the floor band (core/depth.js)
  const regK = G.SPR["ch-" + kisser.charId], regS = G.SPR["ch-" + shy.charId];
  const pair = G.SPR["pair-" + FIDGET.PAIR.id];
  const hOf = (o, reg) => o.scale.y * reg.h;
  const standIn = (o, reg) => add([
    sprite(reg.name, { flipX: o.flipX, frame: reg.anims.idle.from }), anchor(vec2(0, reg.anchorY)),
    pos(o.pos), scale(o.scale), opacity(o.opacity), z(top === null ? o.z : top),
  ]);
  const a = standIn(kisser, regK), b = standIn(shy, regS);
  const hA = hOf(kisser, regK), hB = hOf(shy, regS);
  const k = (hA + hB) / 2 / pair.h;   // the drawing's scale: the two of them, average
  const side = kisser.pos.x <= shy.pos.x ? 1 : -1;   // 1: Sam on the left, as drawn
  const feetY = (kisser.pos.y + hA / 2 + shy.pos.y + hB / 2) / 2;
  const midX = (kisser.pos.x + shy.pos.x) / 2;
  const both = add([
    sprite(pair.name, { frame: 0, flipX: side < 0 }), anchor("bot"),
    pos(midX, feetY), scale(k), opacity(0), z(top === null ? Math.max(kisser.z, shy.z) : top),
  ]);
  // where the drawing has each of them, for the walk in and out
  const spotA = vec2(midX + side * pair.left[0] * k, feetY - hA / 2);
  const spotB = vec2(midX + side * pair.right[0] * k, feetY - hB / 2);
  kisser.hidden = true;
  shy.hidden = true;
  let t = 0, over = false;
  const end = () => {
    if (over) return;
    over = true;
    for (const o of [a, b, both]) if (o.exists()) destroy(o);
    if (kisser.exists()) kisser.hidden = false;
    if (shy.exists()) shy.hidden = false;
    onDone();
  };
  a.onUpdate(() => {
    if ((G.paused && !(opt.whilePaused && !UI.pauseOpen)) || over) return;
    t += dt();
    if (!kisser.exists() || !shy.exists()) { end(); return; }
    const s = FIDGET.kissAt(t);
    if (s.done) { end(); return; }
    // the drawing, or the two of them walking
    both.opacity = s.frame ? Math.max(kisser.opacity, shy.opacity) : 0;
    if (s.frame) both.frame = pair.anims[s.frame];
    for (const o of [a, b]) o.hidden = !!s.frame;
    // walking in they face each other; walking back, away to their spots
    const back = t > FIDGET.KISS.meet;
    a.flipX = back ? kisser.pos.x < a.pos.x : side < 0;
    b.flipX = back ? shy.pos.x < b.pos.x : side > 0;
    const walkF = (reg) => (Math.floor(t * 9) % 2 ? reg.anims.walk.to : reg.anims.walk.from);
    a.frame = s.walking && s.meet > 0.02 && s.meet < 0.98 ? walkF(regK) : regK.anims.idle.from;
    b.frame = s.walking && s.meet > 0.02 && s.meet < 0.98 ? walkF(regS) : regS.anims.idle.from;
    a.pos = kisser.pos.lerp(spotA, s.meet);
    b.pos = shy.pos.lerp(spotB, s.meet);
    a.opacity = kisser.opacity;
    b.opacity = shy.opacity;
  });
  return end;
};

// A crowd that is not following you: the tutorial's fielders (Ollie, 15
// Oct 2026). They take turns as the party does, but your walking about
// does not stop them; only the room turning (calm() false) does. people()
// gives everyone who may fidget, each with .charId and .standing.
FIDGET.beginCrowd = (people, calm) => {
  const turns = FIDGET.turns(() => rand(0, 1));
  let now = null, cancel = null;
  onUpdate(() => {
    if (G.paused) return;
    const ok = calm() && !G.cutscene;
    if (now && FIDGET.shouldCancel({ moving: false, calm: ok, standing: now.exists() && now.standing })) cancel();
    const crowd = people().filter((o) => o.exists() && o.standing && FIDGETS[o.charId] && FIDGET.sheet(o.charId));
    const pick = turns.update(dt(), { calm: ok, moving: false, ready: crowd.map((o) => o.charId) });
    if (!pick) return;
    now = crowd.find((o) => o.charId === pick);
    cancel = FIDGET.play(now, pick, () => { now = null; cancel = null; turns.done(); });
  });
};

// Stop whatever fidget is playing, at once (a cutscene taking over).
FIDGET.stop = () => { if (FIDGET._cancel) FIDGET._cancel(); };

// The turn-taking for one room, started by area.js once the player and the
// followers are in. calm() is area.js's own "is this room cleared" check.
// Sam and Josh together count as one more turn in the bag (the kiss).
FIDGET.beginArea = (player, calm) => {
  const turns = FIDGET.turns(() => rand(0, 1));
  let was = null, now = null, cancel = null;
  FIDGET._cancel = () => { if (cancel) cancel(); };
  const P = FIDGET.PAIR;
  onUpdate(() => {
    if (!G.run || G.paused) return;
    const moving = FIDGET.isMoving({ standing: player.standing, dist: was ? player.pos.dist(was) : 0, dt: dt() });
    was = player.pos.clone();
    const ok = calm() && !G.cutscene;
    const standing = now && now.every((o) => o.exists() && o.standing);
    if (now && FIDGET.shouldCancel({ moving, calm: ok, standing })) cancel();
    const people = [player].concat(G.followers || []);
    const ready = people
      .filter((o) => o.exists() && o.standing && FIDGETS[o.charId] && FIDGET.sheet(o.charId))
      .map((o) => o.charId);
    const kisser = people.find((o) => o.charId === P.kisser), shy = people.find((o) => o.charId === P.shy);
    if (kisser && shy && kisser.exists() && shy.exists() && kisser.standing && shy.standing
      && ART.hasAnims(P.kisser) && ART.hasAnims(P.shy) && G.SPR["pair-" + P.id]
      && kisser.pos.dist(shy.pos) < G.charH(2.5)) ready.push(P.id);
    const pick = turns.update(dt(), { calm: ok, moving, ready });
    if (!pick) return;
    const done = () => { now = null; cancel = null; turns.done(); };
    if (pick === P.id) {
      now = [kisser, shy];
      cancel = FIDGET.kiss(kisser, shy, done);
    } else {
      const who = people.find((o) => o.charId === pick);
      now = [who];
      cancel = FIDGET.play(who, pick, done);
    }
  });
};
