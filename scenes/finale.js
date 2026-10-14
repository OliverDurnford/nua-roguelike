// ============================================================
// FINALE: Victoria Park, ruined. Busy You, the final boss
// (docs/superpowers/specs/2026-10-12-busy-boss-design.md).
//
// Five friends wait in cages along the path at the top of the park,
// scared and looking round, rattling the bars now and then.
// The opening: close on you, up the park to Busy You laughing at the
// sky, the scene from data/finale-script.js (the reveal, the favour,
// the sting), out over the park as their name flies through, back in
// to you. The ending: back to Busy You for their last line, buried
// under their responsibilities, across to the cages, the pub, and
// everyone walks off while the pile asks to come too.
// ============================================================

const FINALE = {};

FINALE.ITEMS = ["calendar", "laptop", "nappy", "phone", "briefcase"];
FINALE.BOSS_H = () => G.charH(2.3);   // the finale boss's height (ENEMIES.spawnBoss)

// Where the cages stand, in grid units: the middle of each cage's front
// bottom edge. Along the path at the top of the park, in the gaps between
// the trees, the bin and the fallen column, out of the fight, one in the
// path mouth in the middle, behind Busy You (Ollie, 13 Oct 2026; the
// finale has no way out drawn there any more).
FINALE.CAGES = [[9.7, 3.2], [12.5, 3.1], [16.0, 2.8], [19.3, 3.2], [23.0, 3.3]];
FINALE.CAGED_H = () => G.charH(0.86);   // a follower's height, so the release is seamless

FINALE.LAUGH_T = 2.2;                           // seconds Busy You laughs at the sky
FINALE.PACE = 1.3;   // the scenes type and move on this much faster than a crack's (the opening ran 45 s at 1)
FINALE.HEAD = () => FINALE.BOSS_H() * 0.55;     // the boss's head, above its middle
FINALE.bossName = () => "BUSY " + G.char(G.busyId()).name.toUpperCase();

// Which mid-fight line is due with this much of the boss's health left,
// or null. said is this attempt's record of what has been said. A big hit
// past both marks says only the one-third line and spends the other.
FINALE.due = (frac, said) => {
  if (frac <= 0) return null;
  if (frac <= 1 / 3 && !said.oneThird) { said.oneThird = said.twoThirds = true; return "oneThird"; }
  if (frac <= 2 / 3 && !said.twoThirds) { said.twoThirds = true; return "twoThirds"; }
  return null;
};

// The laugh: the sky laugh once a friend's frames are in, their forward
// cackle until then, or null (a wobble) with no Busy sheet at all.
FINALE.laughAnim = (anims) => (anims && anims.skylaugh ? "skylaugh" : anims && anims.cackle ? "cackle" : null);

// Is p inside a viewW x viewH view centred on cam at this zoom, with
// margins in screen px (top clears the HUD band)? Pure, for the tests.
FINALE.inView = (p, cam, zoom, viewW, viewH, top, side, bottom) => {
  const hw = viewW / 2 / zoom, hh = viewH / 2 / zoom;
  return p.x >= cam.x - hw + side / zoom && p.x <= cam.x + hw - side / zoom &&
    p.y >= cam.y - hh + top / zoom && p.y <= cam.y + hh - bottom / zoom;
};

// Who speaks for the script's roles: you, one caged friend, two different
// friends from your group (never you), and everyone together.
FINALE.pickRoles = (you, caged, group, rnd = Math.random) => {
  const pick = (list) => (list.length ? list[Math.floor(rnd() * list.length) % list.length] : null);
  const friends = group.filter((id) => id !== you);
  const friend = pick(friends);
  const friend2 = pick(friends.filter((id) => id !== friend));
  return { you, caged: pick(caged), friend, friend2, all: [you].concat(friends) };
};

FINALE.setup = (m, plate) => {
  const caged = CHARACTERS
    // not you, not your recruits, and not the friend whose Busy You this is
    // (one of the ten when you play a bonus character)
    .filter((c) => c.id !== G.run.charId && c.id !== G.busyId() && !G.run.companions.includes(c.id))
    .slice(0, 5);
  caged.forEach((c, i) => {
    const [gx, gy] = FINALE.CAGES[i];
    FINALE.cage(c.id, vec2(gx * plate.unit, gy * plate.unit));
  });
};

// Anything caged moves only while play runs, or in a cutscene (the opening
// passes them); the pause menu and the collection screens freeze them.
FINALE.live = () => !G.paused || G.cutscene;

// One cage with its friend inside, standing on `at` (the front bottom edge).
// Three layers by depth: the back of the cage, the friend, the front.
FINALE.cage = (id, at) => {
  const h = FINALE.CAGED_H();
  const k = h / ART.CAGE_W;                 // canvas pixel to world
  const feetY = at.y - ART.CAGE_FLOOR * k;  // stood in the middle of the cage floor
  const back_y = at.y - ART.CAGE_DEPTH * k; // the far bottom edge
  const zf = DEPTH.z(at.y);
  const back = add([sprite("cage-back"), scale(k), anchor("bot"), pos(at.x, at.y + 2 * k), z(DEPTH.z(back_y)), "cageBars", { home: at.x }]);
  const front = add([sprite("cage-front"), scale(k), anchor("bot"), pos(at.x, at.y + 2 * k), z(zf), area(), "solid", "cageBars", { home: at.x }]);
  COLLIDE.add(at.x - ART.CAGE_W * k / 2, back_y, at.x + ART.CAGE_W * k / 2, at.y, { open: () => !front.exists() || front.freed });

  const reg = G.SPR["ch-" + id + "-scared"];
  const comps = reg
    ? [sprite(reg.name, { frame: reg.anims.lookLeft }), scale(h / reg.h), anchor(vec2(0, reg.anchorY))]
    : ART.charComps(id, h);
  const home = vec2(at.x, feetY - h * 0.5);
  const f = add([...comps, pos(home), z(zf - 0.01), "cagedFriend", { charId: id, feet: ART.feetBox(h), home, cage: [back, front] }]);
  f.speechLift = h * 0.9;   // a bubble clears the cage roof
  // until their scared frames are drawn, their hurt flinch stands in
  if (!reg && ART.hasAnims(id)) f.play("hurt");

  let t = 0, lookT = rand(0.4, 1.6), left = rand() < 0.5, panicT = rand(1.5, 6), hop = 0, rattle = 0;
  const look = (l) => {
    left = l;
    if (reg) f.frame = l ? reg.anims.lookLeft : reg.anims.lookRight;
    else f.flipX = !l;
  };
  look(left);
  f.flinch = (big) => {
    hop = Math.max(hop, big ? 0.36 : 0.18);
    rattle = Math.max(rattle, big ? 0.5 : 0.25);
  };
  f.onUpdate(() => {
    if (!FINALE.live()) return;
    const d = dt();
    t += d;
    // looking round: a glance one way, then the other, now and then a quick double take
    lookT -= d;
    if (lookT <= 0) { look(!left); lookT = rand() < 0.25 ? rand(0.18, 0.3) : rand(0.7, 1.9); }
    // every so often they panic: two hops, the cage rattles, sweat flies
    panicT -= d;
    if (panicT <= 0) {
      panicT = rand(7, 14);
      f.flinch(true);
      FINALE.sweat(f, h);
      if (FINALE.onScreen(f.pos)) SFX.play("clank");
    }
    hop = Math.max(0, hop - d);
    rattle = Math.max(0, rattle - d);
    // the hop: two quick bounces off the cage floor while it lasts
    const lift = hop > 0 ? Math.abs(Math.sin(hop * Math.PI / 0.18)) * h * 0.07 : 0;
    // a constant tremble, a game pixel either way
    const shiver = (Math.floor(t * 14) % 2 ? 1 : -1) * 0.7;
    f.pos.x = home.x + shiver;
    f.pos.y = home.y - lift;
    const shake = rattle > 0 ? Math.sin(t * 70) * 2.2 * (rattle / 0.5) : 0;
    for (const c of f.cage) if (c.exists()) c.pos.x = c.home + shake;
  });
  return f;
};

// Is a spot inside the camera's view? (A rattle off screen makes no sound.)
FINALE.onScreen = (p) => {
  const c = camPos(), sc = camScale().x || 1;
  return Math.abs(p.x - c.x) < G.W / 2 / sc && Math.abs(p.y - c.y) < G.H / 2 / sc;
};

// A bead or two of sweat flicks off a scared head and falls away.
FINALE.sweat = (f, h) => {
  const n = rand() < 0.5 ? 1 : 2;
  for (let i = 0; i < n; i++) {
    const side = (i === 0) === (rand() < 0.5) ? 1 : -1;
    const sk = h / 40;
    const s = add([sprite("sweat"), scale(sk), anchor("center"), pos(f.pos.add(side * h * 0.22, -h * 0.38)), opacity(1), z(f.z + 0.02),
      { v: vec2(side * rand(40, 80), -rand(70, 110)) }]);
    s.onUpdate(() => {
      if (!FINALE.live()) return;
      s.v.y += 420 * dt();
      s.pos = s.pos.add(s.v.scale(dt()));
      s.opacity -= 1.6 * dt();
      if (s.opacity <= 0) destroy(s);
    });
  }
};

// Every HA! of the boss's cackle makes the caged jump.
FINALE.cagesFlinch = () => {
  for (const f of get("cagedFriend")) if (f.flinch) f.flinch(false);
};

// ---------- the talking ----------

// Where somebody stands, for the camera: you, a follower, or a friend
// still in a cage.
FINALE.ent = (id) => COMPANIONS.fieldSprite(id) || get("cagedFriend").find((f) => f.charId === id) || null;

// A `by` line: a caged friend's bubble over their cage, in their colour as
// COMPANIONS.say does; anyone else through the speech system.
FINALE.say = (ids, text) => {
  for (const id of ids) {
    const caged = get("cagedFriend").find((f) => f.charId === id);
    if (caged) UI.speech(caged, text, G.char(id).colors.top);
    else SPEECH.speak(id, text);
  }
};

// The point a talking scene's camera shot flies to (its `to`): it eases
// after whoever is speaking, so a change of speaker is a glide, not a cut.
FINALE.cam = (start) => {
  const c = add([{ at: start.clone(), target: null }]);
  c.onUpdate(() => {
    const t = c.target && c.target();
    if (t) c.at = c.at.lerp(t, 1 - Math.exp(-dt() * 4));
  });
  return c;
};

// One of the script's scenes (data/finale-script.js) through the crack
// voice's engine, Busy You's note hanging off o.anchor (or nothing, when
// only friends talk), then done(). o.cam: the camera glides to each speaker.
FINALE.scene = (key, o, done) => {
  const busy = G.char(G.busyId());
  const steps = CRACKVOICE.prepare(FINALE_SCRIPT[key], {
    name: G.playerChar().name,
    roles: o.roles || { you: G.run.charId },
    vars: { busy: busy.name, job: FINALE_SCRIPT.JOBS[busy.id] },
    bonus: G.run.charId !== G.busyId(),
  });
  const a = o.anchor;
  let last = (a || G.playerObj).pos.clone();
  const at = () => (a && a.exists() ? (last = a.pos.clone()) : last);
  CRACKVOICE.play(steps, at, done, {
    lift: o.lift || 0,
    label: o.label || "???",
    name: FINALE.bossName(),
    glow: false,
    speak: FINALE.say,
    look: (ids) => {
      if (!o.cam) return;
      const who = ids ? (ids.length === 1 ? FINALE.ent(ids[0]) : null) : a;
      if (who) o.cam.target = () => (who.exists() ? who.pos : o.cam.at);
    },
    anim: (name, end) => FINALE.laugh(get("boss")[0], end),
    cue: o.cue,
    lead: o.lead,
    pace: FINALE.PACE,
  });
};

// Busy You laughs (FINALE.cackle picks the sky laugh or the cackle) for
// FINALE.LAUGH_T, then stands, then done().
FINALE.laugh = (boss, done) => {
  if (!boss) { done(); return; }
  FINALE.cackle(boss);
  wait(FINALE.LAUGH_T, () => { FINALE.stopCackle(boss); done(); });
};

// A line from Busy You during the fight, said only once their bubble
// would be seen: the boss can be off the top of the screen or under the HUD
// (a retry starts with the camera on you, the boss at the top of the park).
// Given up after `limit` seconds of play without them in view.
FINALE.sayWhenSeen = (boss, text, limit = 6) => {
  let t = 0;
  const h = boss.onUpdate(() => {
    if (G.paused || G.cutscene) return;
    t += dt();
    const top = boss.pos.sub(0, FINALE.HEAD() + 50);   // the top of a two-line bubble
    if (FINALE.inView(top, camPos(), camScale().y || 1, G.W, G.H, 70, 120, 40)) {
      SPEECH.speak("boss:oldage", text);
      h.cancel();
    } else if (t > limit) h.cancel();
  });
};

// The two mid-fight lines, once each an attempt, as the boss's health
// passes two thirds and one third. Play never stops for them.
FINALE.watch = (boss) => {
  const said = {};
  boss.onUpdate(() => {
    if (G.paused || G.cutscene) return;
    const k = FINALE.due(boss.hp / boss.maxHp, said);
    if (!k) return;
    const line = typeof FINALE_SCRIPT[k] === "string" ? { say: FINALE_SCRIPT[k] } : FINALE_SCRIPT[k];
    if (line.ring) {
      SFX.play("ring");
      wait(0.75, () => { if (boss.exists()) SFX.play("ring"); });
      wait(1.0, () => { if (boss.exists()) FINALE.sayWhenSeen(boss, line.say); });
    } else FINALE.sayWhenSeen(boss, line.say);
  });
};

// ---------- the opening ----------

// The camera for the whole finale, in place of the usual room reveal. It
// opens on you and runs the opening; onFight is the scene's spawnEnemies.
// After a death the opening is skipped and the fight starts at once
// (Ollie, 13 Oct 2026): it has been seen, and a second time is a wait.
FINALE.start = (m, player, ch, areaNum, onFight, opts = {}) => {
  FINALE.m = m;
  const dir = CAMSHOTS.director({ x1: 0, y1: 0, x2: m.w, y2: m.h }, G.W, G.H);
  FINALE.dir = dir;
  const fit = Math.min(G.W / m.w, G.H / m.h);
  FINALE.wide = Math.max(0.3, Math.min(1, fit) * 0.85);   // the room reveal's own pull-back
  const boss = get("boss")[0];
  boss.speechLift = FINALE.BOSS_H() * 0.55;   // bubbles clear the boss's head
  // quitting mid-cutscene (the opening, or the ending of any attempt, a
  // retried one too) must not leave it on into the next run
  onSceneLeave(() => { G.cutscene = false; });
  if (opts.retry) {
    dir.cut(player.pos, 1);
    G.paused = false;
    G.cutscene = false;
    onFight();
    FINALE.watch(boss);
    wait(1.0, () => { if (boss.exists()) FINALE.sayWhenSeen(boss, FINALE_SCRIPT.retry); });
    return dir;
  }
  G.paused = true;
  G.cutscene = true;
  dir.cut(player.pos, 1);
  // the camera rides FINALE.cam through the scene, gliding to each speaker
  const cam = FINALE.cam(boss.pos);
  cam.target = () => boss.pos;
  dir.run([
    { to: "follow", zoom: 1, move: 0, hold: 0.8 },
    {
      to: () => cam.at, zoom: 1.15, move: 1.4, hold: Infinity,
      arrive: () => {
        const bars = CRACKVOICE.bars();
        FINALE.scene("opening", {
          anchor: boss, lift: FINALE.HEAD(), cam,
          roles: FINALE.pickRoles(G.run.charId, get("cagedFriend").map((f) => f.charId), []),
        }, () => { bars.out(); dir.release(); });
      },
    },
    {
      to: vec2(m.w / 2, m.h / 2), zoom: FINALE.wide, move: 1.0, hold: 2.0,
      arrive: () => UI.bigTitle({
        num: String(areaNum).padStart(2, "0"),
        name: boss.bname,
        sub: ch.year ? ch.title + " · " + ch.year : ch.title,
      }),
    },
    { to: "follow", zoom: 1, move: 0.8, hold: 0 },
  ], () => {
    destroy(cam);
    G.paused = false;
    G.cutscene = false;
    onFight();
    FINALE.watch(boss);
  });
  return dir;
};

// The laugh: the sky laugh once their frames are drawn (FINALE.laughAnim),
// the forward cackle until then, a wobble with no Busy sheet. A HA!, a small
// shake and the cages flinching on every head-back beat.
FINALE.cackle = (boss) => {
  const anims = ART.bossAnims(G.busyId());
  const name = FINALE.laughAnim(anims);
  if (name) boss.play(name);
  let last = -1, n = 0, t = 0;
  boss._cackle = boss.onUpdate(() => {
    t += dt();
    if (name) {
      if (boss.frame === anims[name].from && last !== boss.frame) FINALE.ha(boss, n++);
      last = boss.frame;
    } else {
      boss.angle = Math.sin(t * 16) * 5;
      const beat = Math.floor(t / 0.5);
      if (beat !== last) { last = beat; FINALE.ha(boss, n++); }
    }
  });
};

FINALE.ha = (boss, n) => {
  shake(3);
  SFX.play("ha");   // the crack voice's laugh (core/crackvoice.js)
  FINALE.cagesFlinch();
  UI.floatText(boss.pos.add((n % 2 ? 1 : -1) * rand(40, 70), -FINALE.BOSS_H() * 0.45), "HA!", [255, 255, 255]);
};

FINALE.stopCackle = (boss) => {
  if (boss._cackle) { boss._cackle.cancel(); boss._cackle = null; }
  if (!boss.exists()) return;
  boss.angle = 0;
  if (ART.bossAnims(G.busyId())) boss.play("idle");
};

// ---------- the ending ----------

// snap: where the boss fell and which way it faced (ENEMIES.hit).
FINALE.win = (player, snap) => {
  G.paused = true;
  G.cutscene = true;
  destroyAll("enemy");     // the fight is over, minions and all
  destroyAll("ebullet");
  const m = FINALE.m, dir = FINALE.dir;
  const stand = FINALE.standIn(snap);
  const cages = get("cagedFriend");
  const cageMid = cages.length
    ? cages.reduce((s, f) => s.add(f.pos), vec2(0, 0)).scale(1 / cages.length)
    : player.pos.clone();
  dir.run([
    {
      // the last line, cut off by the first thing landing on them; the
      // camera stays until the line is done AND the pile is down
      to: snap.pos.clone(), zoom: 1.15, move: 1.0, hold: Infinity,
      arrive: () => {
        let left = 2;
        const one = () => { if (--left === 0) wait(0.6, () => dir.release()); };
        FINALE.scene("fall", {
          anchor: stand, lift: FINALE.HEAD(), label: FINALE.bossName(),
          cue: (k) => { if (k === "bury") FINALE.bury(stand, one); },
          lead: FINALE.landIn(),
        }, one);
      },
    },
    { to: cageMid, zoom: 1, move: 1.0, hold: 2.4, arrive: () => FINALE.openCages(player) },
    {
      to: "follow", zoom: 1, move: 0.6, hold: Infinity,
      arrive: () => FINALE.scene("pub", {
        roles: FINALE.pickRoles(G.run.charId, [], [G.run.charId].concat((G.followers || []).map((f) => f.charId))),
      }, () => wait(0.4, () => dir.release())),
    },
    {
      // the pile near the top with room for its note, the group walking
      // out of the bottom; held until the fade takes over
      to: () => vec2(snap.pos.x, FINALE.pileTop(snap) - 90 + G.H / 2 / 0.8), zoom: 0.8, move: 3.5, hold: Infinity,
      // the whole group walks out of the bottom of the park, through the
      // hedge (ghost), and off the frame while the camera pulls out
      start: () => {
        player.autoWalk = vec2(player.pos.x, m.h + G.charH(4));
        player.ghost = true;
        for (const f of G.followers || []) { f.ghost = true; f.spot = null; }   // back into line
      },
      arrive: () => {
        const pile = get("bossPile")[0];
        if (!pile) { wait(1.2, FINALE.fadeOut); return; }
        FINALE.scene("pile", { anchor: pile, lift: pile.drawH + 6, label: FINALE.bossName() },
          () => wait(1.2, FINALE.fadeOut));
      },
    },
  ]);
};

// Busy You as they went down: their hurt frame where the boss stood, or the
// old-age still for a friend whose Busy sheet is not built yet.
FINALE.standIn = (snap) => {
  const id = G.busyId();
  const s = add([...ART.charComps(id, FINALE.BOSS_H(), ART.bossVariant(id)), pos(snap.pos), opacity(1), z(snap.z), "busyStandIn"]);
  s.flipX = snap.flipX;
  const anims = ART.bossAnims(id);
  if (anims && anims.hurt !== undefined) s.play("hurt");
  return s;
};

// The top of the pile (where its bubble hangs from), or where it will be.
FINALE.pileTop = (snap) => {
  const p = get("bossPile")[0];
  if (p) return p.pos.y - p.drawH;
  return snap.pos.y + FINALE.BOSS_H() * 0.45 - FINALE.duty("pile", G.charH(2.6)).h;
};

// A duty drawn `size` px on its longer side: its picture, or a plain stand-in
// box until the art is in. h is how tall it actually draws.
FINALE.duty = (id, size) => {
  const d = typeof REAL_DUTIES !== "undefined" && REAL_DUTIES[id];
  if (d) {
    const k = size / Math.max(d.w, d.h);
    return { comps: [sprite("duty-" + id), scale(k)], h: d.h * k };
  }
  return { comps: [rect(size, size * 0.75), color(140, 128, 112), outline(3, rgb(30, 25, 25))], h: size * 0.75 };
};

// Something drops in from above the frame and lands at `at` (its bottom
// centre) with a thud, then stays.
FINALE.fall = (comps, at, zz, onLand) => {
  const o = add([...comps, pos(at.x, at.y - G.H), anchor("bot"), z(zz), { vy: 0, landed: false }]);
  o.onUpdate(() => {
    if (o.landed) return;
    o.vy += 2600 * dt();
    o.pos.y = Math.min(at.y, o.pos.y + o.vy * dt());
    if (o.pos.y >= at.y) { o.landed = true; if (onLand) onLand(o); }
  });
  return o;
};

// Seconds from FINALE.bury starting to its first item landing: the short
// wait, then a drop of one screen height at FINALE.fall's 2600 px/s/s.
FINALE.landIn = () => 0.15 + Math.sqrt(2 * G.H / 2600);

// Where each falling item lands, in item sizes from the boss's feet: the
// first two at the bottom of the legs, one either side, then each one after
// on top of those, so it builds up as a heap (Ollie, 13 Oct 2026: not "a
// diagonal line across them").
FINALE.STACK = [[-0.55, 0], [0.55, 0], [0, -0.7], [-0.35, -1.35], [0.3, -1.95]];

FINALE.bury = (stand, onDown) => {
  const feet = stand.pos.add(0, FINALE.BOSS_H() * 0.45);
  const zf = DEPTH.z(feet.y);
  const size = G.charH(0.6);
  FINALE.ITEMS.forEach((id, i) => wait(0.15 + i * 0.32, () => {
    const it = FINALE.duty(id, size);
    const [sx, sy] = FINALE.STACK[i];
    FINALE.fall([...it.comps, "duty"], feet.add(sx * size, sy * size), zf + 0.1 + i * 0.01,
      () => { shake(4); SFX.play("hit"); });
  }));
  wait(0.15 + 5 * 0.32 + 0.3, () => {
    const pile = FINALE.duty("pile", G.charH(2.6));
    const p = FINALE.fall([...pile.comps, "bossPile", { speechLift: pile.h + 6, drawH: pile.h, bossId: "oldage" }], feet, zf + 0.3, () => {
      shake(12);
      SFX.play("bossdie");
      UI.pop(feet.add(0, -pile.h * 0.4), [200, 190, 170], 50);
      destroyAll("duty");
      if (stand.exists()) destroy(stand);
      if (onDown) onDown();
    });
    FINALE.pile = p;
  });
};

// The cages burst open and the five cheer, then walk with you from here on.
// Play runs again once the cheer is done so they can move, but G.cutscene
// keeps you standing (autoWalk) and no special. Everyone gathers round you
// in an arc for the pub beat (f.spot), then falls back into line for the
// walk-off.
FINALE.CHEER = 0.8;   // seconds the freed friends hold their victory pose
FINALE.openCages = (player) => {
  shake(10);
  SFX.play("clank");
  wait(0.08, () => SFX.play("clank"));
  for (const c of get("cageBars")) FINALE.burst(c);
  player.autoWalk = player.pos.clone();
  const freed = [];
  for (const f of get("cagedFriend")) {
    const nf = COMPANIONS.addFollower(player, f.charId, f.home);
    if (ART.hasAnims(f.charId)) nf.play("victory");
    freed.push(nf);
    destroy(f);
  }
  // G.paused holds the followers still (their update waits on it) while
  // they cheer; the director keeps the camera running regardless
  wait(FINALE.CHEER, () => {
    const fs = G.followers || [];
    const rx = G.charH(0.42) * Math.max(3, fs.length), ry = G.charH(1.0);   // wider for a bigger crowd
    fs.forEach((f, i) => {
      const a = Math.PI * (1.08 + 0.84 * (fs.length > 1 ? i / (fs.length - 1) : 0.5));   // left, over the top, to the right
      f.spot = player.pos.add(Math.cos(a) * rx, Math.sin(a) * ry);
    });
    G.paused = false;
  });
};

// A cage layer flies apart: the front leaps up and spins away, the back
// just fades, and a few bars clatter out.
FINALE.burst = (c) => {
  const isFront = c.is("solid");
  c.freed = true;   // its floor stops being a wall (FINALE.cage)
  c.unuse("solid");
  c.unuse("cageBars");
  c.use(opacity(1));
  c.use(rotate(0));
  const v = isFront ? vec2(rand(-120, 120), -rand(380, 480)) : vec2(0, 0);
  const spin = isFront ? rand(-260, 260) : 0;
  c.onUpdate(() => {
    v.y += 1400 * dt();
    c.pos = c.pos.add(v.scale(dt()));
    c.angle += spin * dt();
    c.opacity -= (isFront ? 1.5 : 3) * dt();
    if (c.opacity <= 0) destroy(c);
  });
  if (!isFront) return;
  const k = c.scale.x;
  for (let i = 0; i < 4; i++) {
    const bar = add([rect(2 * k, 26 * k), color(125, 132, 150), outline(1, rgb(11, 12, 17)), anchor("center"),
      pos(c.pos.add(rand(-14, 14) * k, -28 * k)), rotate(rand(-30, 30)), opacity(1), z(c.z + 0.1)]);
    const bv = vec2(rand(-220, 220), -rand(220, 420)), bs = rand(-500, 500);
    bar.onUpdate(() => {
      bv.y += 1400 * dt();
      bar.pos = bar.pos.add(bv.scale(dt()));
      bar.angle += bs * dt();
      bar.opacity -= 1.4 * dt();
      if (bar.opacity <= 0) destroy(bar);
    });
  }
};

FINALE.fadeOut = () => {
  const w = add([rect(G.W, G.H), color(255, 255, 255), opacity(0), fixed(), z(250)]);
  w.onUpdate(() => {
    w.opacity += dt() * 0.5;
    if (w.opacity >= 1) { G.cutscene = false; go("ending"); }
  });
};
