// ============================================================
// FINALE: Victoria Park, ruined. Busy You, the final boss
// (docs/superpowers/specs/2026-10-12-busy-boss-design.md).
//
// Five friends wait in cages along the path at the top of the park,
// scared and looking round, rattling the bars now and then.
// The opening: close on you, up the park to Busy You cackling, out
// over the park as their name flies through, back in to you. The
// ending: back to Busy You, buried under their responsibilities,
// across to the cages, "Right. Pub?", and everyone walks off while
// the pile asks to come too.
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

FINALE.setup = (m, plate) => {
  const caged = CHARACTERS
    .filter((c) => c.id !== G.run.charId && !G.run.companions.includes(c.id))
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
  if (opts.retry) {
    dir.cut(player.pos, 1);
    G.paused = false;
    G.cutscene = false;
    onFight();
    return dir;
  }
  G.paused = true;
  G.cutscene = true;
  onSceneLeave(() => { G.cutscene = false; });   // quitting mid-cutscene must not leave it on
  dir.cut(player.pos, 1);
  dir.run([
    { to: "follow", zoom: 1, move: 0, hold: 0.8 },
    { to: boss.pos.clone(), zoom: 1.15, move: 1.4, hold: 3.0, arrive: () => FINALE.cackle(boss) },
    {
      to: vec2(m.w / 2, m.h / 2), zoom: FINALE.wide, move: 1.0, hold: 2.0,
      start: () => FINALE.stopCackle(boss),
      arrive: () => UI.bigTitle({
        num: String(areaNum).padStart(2, "0"),
        name: boss.bname,
        sub: ch.year ? ch.title + " · " + ch.year : ch.title,
      }),
    },
    { to: "follow", zoom: 1, move: 0.8, hold: 0 },
  ], () => {
    G.paused = false;
    G.cutscene = false;
    onFight();
  });
  return dir;
};

// The cackle: their own two cackle frames once their Busy sheet is built, a
// wobble until then. A small shake and a "HA!" on every head-back beat.
FINALE.cackle = (boss) => {
  const anims = ART.bossAnims(G.run.charId);
  const real = !!(anims && anims.cackle);
  if (real) boss.play("cackle");
  let last = -1, n = 0, t = 0;
  boss._cackle = boss.onUpdate(() => {
    t += dt();
    if (real) {
      if (boss.frame === anims.cackle.from && last !== boss.frame) FINALE.ha(boss, n++);
      last = boss.frame;
    } else {
      boss.angle = Math.sin(t * 16) * 5;
      const beat = Math.floor(t / 0.5);
      if (beat !== last) { last = beat; FINALE.ha(boss, n++); }
    }
  });
  wait(0.6, () => SPEECH.fire("bossStart", { cutscene: true }));
};

FINALE.ha = (boss, n) => {
  shake(3);
  FINALE.cagesFlinch();
  UI.floatText(boss.pos.add((n % 2 ? 1 : -1) * rand(40, 70), -FINALE.BOSS_H() * 0.45), "HA!", [255, 255, 255]);
};

FINALE.stopCackle = (boss) => {
  if (boss._cackle) { boss._cackle.cancel(); boss._cackle = null; }
  if (!boss.exists()) return;
  boss.angle = 0;
  if (ART.bossAnims(G.run.charId)) boss.play("idle");
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
    { to: snap.pos.clone(), zoom: 1.15, move: 1.0, hold: 3.0, arrive: () => FINALE.bury(stand) },
    { to: cageMid, zoom: 1, move: 1.0, hold: 2.4, arrive: () => FINALE.openCages(player) },
    { to: "follow", zoom: 1, move: 0.6, hold: 3.4, arrive: () => SPEECH.fire("pubInvite", { cutscene: true }) },
    {
      // the pile near the top with room for its bubble, the group walking
      // out of the bottom; held long enough to outlast the fade, so the
      // camera never hands back
      to: () => vec2(snap.pos.x, FINALE.pileTop(snap) - 90 + G.H / 2 / 0.8), zoom: 0.8, move: 3.5, hold: 8,
      // the whole group walks out of the bottom of the park, through the
      // hedge (ghost), and off the frame while the camera pulls out
      start: () => {
        player.autoWalk = vec2(player.pos.x, m.h + G.charH(4));
        player.ghost = true;
        for (const f of G.followers || []) { f.ghost = true; f.spot = null; }   // back into line
      },
      arrive: () => {
        SPEECH.fire("fromPile", { cutscene: true });
        wait(2.8, FINALE.fadeOut);
      },
    },
  ]);
};

// Busy You as they went down: their hurt frame where the boss stood, or the
// old-age still for a friend whose Busy sheet is not built yet.
FINALE.standIn = (snap) => {
  const id = G.run.charId;
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

// Where each falling item lands, in item sizes from the boss's feet: the
// first two at the bottom of the legs, one either side, then each one after
// on top of those, so it builds up as a heap (Ollie, 13 Oct 2026: not "a
// diagonal line across them").
FINALE.STACK = [[-0.55, 0], [0.55, 0], [0, -0.7], [-0.35, -1.35], [0.3, -1.95]];

FINALE.bury = (stand) => {
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
