// ============================================================
// FINALE: Victoria Park, ruined. Busy You, the final boss
// (docs/superpowers/specs/2026-10-12-busy-boss-design.md).
//
// Five friends wait in cages in front of the boss, as obstacles.
// The opening: close on you, up the park to Busy You cackling, out
// over the park as their name flies through, back in to you. The
// ending: back to Busy You, buried under their responsibilities,
// across to the cages, "Right. Pub?", and everyone walks off while
// the pile asks to come too.
// ============================================================

const FINALE = {};

FINALE.ITEMS = ["calendar", "laptop", "nappy", "phone", "briefcase"];
FINALE.BOSS_H = () => G.charH(2.3);   // the finale boss's height (ENEMIES.spawnBoss)

FINALE.setup = (m) => {
  const caged = CHARACTERS
    .filter((c) => c.id !== G.run.charId && !G.run.companions.includes(c.id))
    .slice(0, 5);

  const base = m.bossSpawn.add(0, 110);
  caged.forEach((c, i) => {
    const p = base.add((i - 2) * 110, Math.abs(i - 2) * 26);
    const h = G.charH(0.9);
    const zc = DEPTH.z(p.y + h * 0.5);   // the friend's feet; the cage sits just over them
    add([...ART.charComps(c.id, h), pos(p), z(zc), opacity(0.55), "cagedFriend", { charId: c.id, feet: ART.feetBox(h) }]);
    // cage bars (obstacles the player has to fight around)
    const cage = add([
      rect(56, 56), pos(p), anchor("center"), color(40, 40, 48), opacity(0.35),
      outline(4, rgb(25, 25, 30)), area(), z(zc + 0.1), "solid", "cageBars",
    ]);
    COLLIDE.add(p.x - 28, p.y - 28, p.x + 28, p.y + 28, { open: () => !cage.exists() });
    for (let bx = -18; bx <= 18; bx += 12) {
      add([rect(4, 56), pos(p.add(bx, 0)), anchor("center"), color(70, 70, 80), z(zc + 0.2), "cageBars"]);
    }
  });
};

// ---------- the opening ----------

// The camera for the whole finale, in place of the usual room reveal. It
// opens on you and runs the opening; onFight is the scene's spawnEnemies.
FINALE.start = (m, player, ch, areaNum, onFight) => {
  FINALE.m = m;
  const dir = CAMSHOTS.director({ x1: 0, y1: 0, x2: m.w, y2: m.h }, G.W, G.H);
  FINALE.dir = dir;
  const fit = Math.min(G.W / m.w, G.H / m.h);
  FINALE.wide = Math.max(0.3, Math.min(1, fit) * 0.85);   // the room reveal's own pull-back
  const boss = get("boss")[0];
  boss.speechLift = FINALE.BOSS_H() * 0.55;   // bubbles clear the boss's head
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
    const p = FINALE.fall([...pile.comps, "bossPile", { speechLift: pile.h + 6, drawH: pile.h }], feet, zf + 0.3, () => {
      shake(12);
      SFX.play("bossdie");
      UI.pop(feet.add(0, -pile.h * 0.4), [200, 190, 170], 50);
      destroyAll("duty");
      if (stand.exists()) destroy(stand);
    });
    FINALE.pile = p;
  });
};

// The cages open and the five walk with you from here on. Play runs again so
// they can move, but G.cutscene keeps you standing (autoWalk) and no special.
// Everyone gathers round you in an arc for the pub beat (f.spot), then falls
// back into line for the walk-off.
FINALE.openCages = (player) => {
  destroyAll("cageBars");
  shake(10);
  player.autoWalk = player.pos.clone();
  for (const f of get("cagedFriend")) {
    COMPANIONS.addFollower(player, f.charId, f.pos);
    destroy(f);
  }
  const fs = G.followers || [];
  const rx = G.charH(0.42) * Math.max(3, fs.length), ry = G.charH(1.0);   // wider for a bigger crowd
  fs.forEach((f, i) => {
    const a = Math.PI * (1.08 + 0.84 * (fs.length > 1 ? i / (fs.length - 1) : 0.5));   // left, over the top, to the right
    f.spot = player.pos.add(Math.cos(a) * rx, Math.sin(a) * ry);
  });
  G.paused = false;
};

FINALE.fadeOut = () => {
  const w = add([rect(G.W, G.H), color(255, 255, 255), opacity(0), fixed(), z(250)]);
  w.onUpdate(() => {
    w.opacity += dt() * 0.5;
    if (w.opacity >= 1) { G.cutscene = false; go("ending"); }
  });
};
