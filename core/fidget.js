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

FIDGET.STILL_BEFORE = 4;   // s the player stands still before the first fidget
FIDGET.GAP = 8;            // s from one fidget ending to the next starting
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
// else's fidget: they step together, Sam kisses Josh on the cheek, and Josh
// goes shy, turning away with his eyes shut and a blush (Ollie, 13 Oct
// 2026). Made from their own frames, nothing generated: the walk to meet,
// the lean from the feet, the blink for shut eyes.
FIDGET.PAIR = {
  id: "josh+sam",
  kisser: "sam",
  shy: "josh",
  // Josh's cheeks on his main sheet's cell (116 x 142), facing right; a
  // rebuilt sheet that moves his face needs these measured again
  blush: [[48, 71], [80, 71]],
};
// Seconds per beat, in order.
FIDGET.KISS = { meet: 0.45, lean: 0.3, hold: 0.6, unlean: 0.25, shy: 1.6, back: 0.4 };
FIDGET.KISS_GAP = 0.53;   // centre to centre at the kiss, in character heights
FIDGET.KISS_LEAN = [10, -4];   // degrees: the kisser leans in, the other barely

const kissEase = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));

// Where the kiss is at time t: meet (0 at their own spots, 1 together),
// lean (0 upright, 1 in), shut (eyes closed), shy (0 to 1, Josh's turn),
// walking (stepping to or from the spot) and done.
FIDGET.kissAt = (t) => {
  const K = FIDGET.KISS;
  const t0 = K.meet, t1 = t0 + K.lean, t2 = t1 + K.hold, t3 = t2 + K.unlean, t4 = t3 + K.shy, t5 = t4 + K.back;
  const meet = t < t0 ? kissEase(t / t0) : t < t4 ? 1 : kissEase(1 - (t - t4) / K.back);
  const lean = t < t0 ? 0 : t < t1 ? kissEase((t - t0) / K.lean) : t < t2 ? 1 : t < t3 ? kissEase(1 - (t - t2) / K.unlean) : 0;
  const shy = t < t3 || t >= t4 ? 0 : Math.min(1, (t - t3) / 0.15, (t4 - t) / 0.2);
  return {
    meet, lean, shy,
    shut: t >= t0 + K.lean * 0.6 && t < t2 + 0.05,
    walking: t < t0 || (t >= t4 && t < t5),
    heart: t >= t1,
    done: t >= t5,
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

// The kiss, played by two stand-ins on the main sheets while the real two
// are hidden, as FIDGET.play does for one, so neither hitbox nor feet ever
// move. Returns a cancel.
FIDGET.kiss = (kisser, shy, onDone) => {
  const P = FIDGET.PAIR;
  const regK = G.SPR["ch-" + kisser.charId], regS = G.SPR["ch-" + shy.charId];
  const hOf = (o, reg) => o.scale.y * reg.h;
  const standIn = (o, reg) => add([
    sprite(reg.name, { flipX: o.flipX, frame: reg.anims.idle.from }), anchor(vec2(0, reg.anchorY)),
    pos(o.pos), scale(o.scale), opacity(o.opacity), z(o.z), rotate(0),
  ]);
  const a = standIn(kisser, regK), b = standIn(shy, regS);
  // the blush, on the shy one's cheeks: children ride its scale and lean
  const cw = getSprite(regS.name).data.width, chh = getSprite(regS.name).data.height;
  const cheeks = P.blush.map(() => b.add([
    rect(9, 4, { radius: 2 }), anchor("center"), pos(0, 0), color(236, 86, 116), opacity(0),
  ]));
  kisser.hidden = true;
  shy.hidden = true;
  // the kisser on whichever side they already stand
  const side = kisser.pos.x <= shy.pos.x ? 1 : -1;   // 1: the kisser is on the left
  const hA = hOf(kisser, regK), hB = hOf(shy, regS);
  const feetY = (kisser.pos.y + hA / 2 + shy.pos.y + hB / 2) / 2;
  const midX = (kisser.pos.x + shy.pos.x) / 2;
  const gap = FIDGET.KISS_GAP * (hA + hB) / 2;
  const spotA = vec2(midX - side * gap / 2, feetY - hA / 2);
  const spotB = vec2(midX + side * gap / 2, feetY - hB / 2);
  let t = 0, over = false, hearted = false, shyHearts = 0;
  const end = () => {
    if (over) return;
    over = true;
    for (const o of [a, b]) if (o.exists()) destroy(o);
    if (kisser.exists()) kisser.hidden = false;
    if (shy.exists()) shy.hidden = false;
    onDone();
  };
  // stand one of them at `from` blended to `to`, leaning `deg` from the feet
  const place = (o, from, to, k, deg, h) => {
    const d = h / 2, r = deg * Math.PI / 180;
    o.pos = from.lerp(to, k).add(d * Math.sin(r), d * (1 - Math.cos(r)));
    o.angle = deg;
  };
  const heart = (p, s, up) => add([
    sprite("heart"), pos(p), anchor("center"), scale(s), opacity(1),
    move(vec2(rand(-0.25, 0.25), -1), up), lifespan(1.2, { fade: 0.6 }), z(120),
  ]);
  a.onUpdate(() => {
    if (G.paused || over) return;
    t += dt();
    if (!kisser.exists() || !shy.exists()) { end(); return; }
    const k = FIDGET.kissAt(t);
    if (k.done) { end(); return; }
    const walkF = (reg) => (Math.floor(t * 9) % 2 ? reg.anims.walk.to : reg.anims.walk.from);
    const eyes = (reg, o, shut) => (shut ? reg.anims.blink.from : reg.anims.idle.from + FIDGET.breathe(t + (o === a ? 0 : 0.5)));
    // facing: towards each other, but the shy one looks away in their moment
    a.flipX = side < 0;
    b.flipX = k.shy > 0 ? side < 0 : side > 0;
    if (k.walking && k.meet < 0.98) {
      a.frame = walkF(regK); b.frame = walkF(regS);
    } else {
      a.frame = eyes(regK, a, k.shut);
      b.frame = eyes(regS, b, k.shut || k.shy > 0);
    }
    const [lk, ls] = FIDGET.KISS_LEAN;
    const wiggle = k.shy > 0 ? Math.sin(t * 16) * 2.5 * k.shy : 0;
    place(a, kisser.pos, spotA, k.meet, side * lk * k.lean, hA);
    place(b, shy.pos, spotB, k.meet, side * ls * k.lean + wiggle, hB);
    // shoulders up while shy
    b.scale = vec2(shy.scale.x * (1 + 0.03 * k.shy), shy.scale.y * (1 - 0.03 * k.shy));
    a.scale = kisser.scale;
    // the shy one in front: the kiss lands on their cheek
    a.z = Math.max(kisser.z, shy.z);
    b.z = a.z + 0.01;
    a.opacity = kisser.opacity;
    b.opacity = shy.opacity;
    // the blush, mirrored with the face
    P.blush.forEach(([x, y], i) => {
      const lx = b.flipX ? cw / 2 - x : x - cw / 2;
      cheeks[i].pos = vec2(lx, y - (regS.anchorY + 1) / 2 * chh);
      cheeks[i].opacity = 0.75 * k.shy;
    });
    if (k.heart && !hearted) {
      hearted = true;
      const at = vec2(midX, feetY - (hA + hB) / 2 * 0.8);
      for (let i = 0; i < 3; i++) heart(at.add(rand(-8, 8), rand(-6, 6)), rand(1.1, 1.6), rand(26, 40));
    }
    if (k.shy > 0.5 && shyHearts < 2 && t > FIDGET.kissAt.shyStart() + shyHearts * 0.5) {
      shyHearts++;
      heart(b.pos.add(rand(-10, 10), -hB * 0.55), rand(0.8, 1.1), rand(20, 30));
    }
  });
  return end;
};
// when the shy beat starts, in seconds
FIDGET.kissAt.shyStart = () => {
  const K = FIDGET.KISS;
  return K.meet + K.lean + K.hold + K.unlean;
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
      && ART.hasAnims(P.kisser) && ART.hasAnims(P.shy)
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
