// ============================================================
// ENEMIES: three basic behaviours plus bosses.
// Behaviours are PLACEHOLDER until the Enemy Design session:
//   chaser  - walks at you
//   runner  - fast, fragile, walks at you
//   brute   - slow, tanky, walks at you
//   shooter - keeps its distance, fires at you
// Chapters reskin these with names and colours (data/chapters.js).
// ============================================================

const ENEMIES = {};

const ENEMY_BASE = {
  chaser:  { hp: 3, speed: 95 },
  runner:  { hp: 2, speed: 150 },
  brute:   { hp: 8, speed: 52 },
  shooter: { hp: 3, speed: 60, shoots: true, interval: 1.7, bulletSpeed: 175 },
};

// Components that draw an enemy or boss. Real art (core/enemies-real.js)
// is a padded strip whose base figure must fit the def's size box, so it
// is scaled by the figure's larger dimension and given a hitbox the size
// of the figure (never wider than the placeholder square the level
// reachability checks were run with). Placeholder art is a square bitmap
// drawn at base size, so it only needs the room's scale.
ENEMIES.comps = (def, sprName) => {
  const real = def.real;
  if (!real) return [sprite(sprName), anchor("center"), scale(G.areaScale), area({ scale: 0.8 })];
  const k = (def.size / Math.max(real.figW, real.figH)) * G.areaScale;
  return [
    sprite(sprName, { anim: "idle" }),
    anchor("center"),
    scale(k),
    // Kaboom centres a Rect shape by the anchor itself, so it starts at 0,0.
    area({ shape: new Rect(vec2(0, 0), real.figW * 0.8, real.figH * 0.8) }),
  ];
};

// Per-frame motion for real enemy art. Sheets with a "move" anim (walking
// people, flapping birds, the scurrying rat) play it while moving; objects
// squash and stretch as they hop; the virus pulses; anything else bobs.
ENEMIES.animate = (e, moving, dir) => {
  const real = e.real;
  if (!real) return;
  e.animT += dt();
  if (dir && Math.abs(dir.x) > 0.1) e.flipX = dir.x < 0;
  const m = real.motion;
  if (real.anims && real.anims.move) {
    const want = moving ? "move" : "idle";
    if (e.curAnim() !== want) e.play(want);
  } else if (m === "hop") {
    const s = moving ? Math.sin(e.animT * 13) : 0;
    e.scale = vec2(e.baseScale * (1 + 0.08 * s), e.baseScale * (1 - 0.08 * s));
  } else if (m === "pulse") {
    const s = Math.sin(e.animT * 5);
    e.scale = vec2(e.baseScale * (1 + 0.05 * s), e.baseScale * (1 + 0.05 * s));
    e.angle = Math.sin(e.animT * 2.5) * 6;
  } else if (moving) {
    e.angle = Math.sin(e.animT * 14) * 4;
  } else {
    e.angle = 0;
  }
};

ENEMIES.spawn = (def, p) => {
  const base = ENEMY_BASE[def.type];
  const comps = ENEMIES.comps(def, def.spr);
  const e = add([
    ...comps,
    pos(p),
    body(),
    color(255, 255, 255),
    opacity(1),
    z(45),
    "enemy",
    {
      hp: base.hp, etype: def.type, ename: def.name,
      speed: base.speed, stun: 0, flashT: 0, shootT: rand(0.6, 2),
      real: def.real || null, animT: rand(0, 6), baseScale: 1,
    },
  ]);
  e.baseScale = e.scale.x;

  e.onUpdate(() => {
    if (G.paused) return;

    if (e.flashT > 0) {
      e.flashT -= dt();
      e.color = rgb(255, 120, 120);
    } else {
      e.color = rgb(255, 255, 255);
    }

    if (e.stun > 0) {
      e.stun -= dt();
      e.angle = Math.sin(time() * 18) * 12;   // wobble while stunned
      return;
    }
    e.angle = 0;

    const pl = get("player")[0];
    if (!pl) return;
    const toP = pl.pos.sub(e.pos);
    const d = toP.len();

    let vel = null;
    if (base.shoots) {
      if (d > 330) vel = toP.unit().scale(e.speed);
      else if (d < 220) vel = toP.unit().scale(-e.speed);
      e.shootT -= dt();
      if (e.shootT <= 0) {
        e.shootT = base.interval;
        ENEMIES.shootAt(e.pos, pl.pos, base.bulletSpeed);
      }
    } else {
      vel = toP.unit().scale(e.speed);
    }
    if (vel) e.move(vel);
    ENEMIES.animate(e, !!vel, vel);
  });

  return e;
};

ENEMIES.shootAt = (from, to, speed) => {
  const dir = to.sub(from).unit();
  SFX.play("eshoot");
  add([
    circle(G.charH(0.14)),
    color(255, 120, 90),
    outline(2, rgb(120, 40, 30)),
    pos(from.add(dir.scale(G.charH(0.48)))),
    anchor("center"),
    area({ scale: 0.8 }),
    opacity(1),
    move(dir, speed),
    lifespan(4, { fade: 0.1 }),
    z(40),
    "ebullet",
  ]);
};

// One entry point for everything taking damage from the player.
ENEMIES.hit = (e, dmg, critChance) => {
  const s = G.stats();
  const isCrit = rand(0, 1) < critChance;
  const d = Math.round(dmg * (isCrit ? 2 : 1) * 10) / 10;
  e.hp -= d;
  e.flashT = 0.08;

  UI.floatText(e.pos.add(rand(-8, 8), -14), String(d) + (isCrit ? "!" : ""), isCrit ? [255, 220, 80] : [240, 240, 240]);
  G.run.meter = Math.min(1, G.run.meter + 0.03 * s.chargeRate);
  SFX.play("hit");

  if (e.hp > 0) return;

  if (e.is("boss")) {
    UI.pop(e.pos, [255, 200, 100], 60);
    shake(18);
    SFX.play("bossdie");
    const cb = G.onBossDeath;
    destroy(e);
    if (cb) cb();
  } else {
    G.run.kills++;
    UI.pop(e.pos, [200, 200, 210], 24);
    SFX.play("kill");
    if (chance(0.08)) {
      add([sprite("heart"), pos(e.pos), anchor("center"), area(), scale(1.6), z(30), "heart"]);
    }
    destroy(e);
  }
};

// ---------- BOSSES ----------
// A generic pattern machine; each boss picks from:
//   radial - ring of bullets | aimed - spread at the player
//   spawn  - calls minions   | charge - rushes you | spiral - rotating spray

ENEMIES.spawnBoss = (chapter, p, opts = {}) => {
  const def = chapter.boss;
  SFX.play("roar");
  // charComps sizes itself (and already follows the room), a plain boss
  // sprite does not, so that one gets the room's scale bolted on.
  const comps = opts.finale
    ? [...ART.charComps(G.run.charId, G.charH(2.3), true), area({ scale: 0.8 })]   // elderly version of YOUR character
    : ENEMIES.comps(def, "boss-" + chapter.num);

  const b = add([
    ...comps,
    pos(p),
    body({ isStatic: true }),
    color(255, 255, 255),
    opacity(1),
    z(46),
    "boss",
    {
      hp: def.hp, maxHp: def.hp,
      bname: opts.name || def.name,
      stun: 0, flashT: 0,
      patI: 0, patT: 2,
      charging: null, spiral: null, spiralT: 0,
      real: opts.finale ? null : (def.real || null), animT: 0, baseScale: 1,
    },
  ]);
  b.baseScale = b.scale.x;

  b.onUpdate(() => {
    if (G.paused) return;

    if (b.flashT > 0) { b.flashT -= dt(); b.color = rgb(255, 120, 120); }
    else b.color = rgb(255, 255, 255);

    if (b.stun > 0) { b.stun -= dt(); b.angle = Math.sin(time() * 18) * 8; return; }
    b.angle = 0;

    const pl = get("player")[0];
    if (!pl) return;

    // keep the boss inside the arena
    if (G.mapBounds) {
      b.pos.x = G.clamp(b.pos.x, G.mapBounds.x1 + 60, G.mapBounds.x2 - 60);
      b.pos.y = G.clamp(b.pos.y, G.mapBounds.y1 + 60, G.mapBounds.y2 - 60);
    }

    // charging dash
    if (b.charging) {
      b.pos = b.pos.add(b.charging.dir.scale(420 * dt()));
      b.charging.t -= dt();
      ENEMIES.animate(b, true, b.charging.dir);
      if (b.charging.t <= 0) b.charging = null;
      return;
    }

    // spiral spray
    if (b.spiral) {
      b.spiral.t -= dt();
      b.spiralT -= dt();
      if (b.spiralT <= 0) {
        b.spiralT = 0.09;
        b.spiral.a += 0.55;
        const dir = vec2(Math.cos(b.spiral.a), Math.sin(b.spiral.a));
        ENEMIES.shootAt(b.pos, b.pos.add(dir.scale(100)), 160);
      }
      if (b.spiral.t <= 0) b.spiral = null;
      return;
    }

    // idle drift toward the player
    const toP = pl.pos.sub(b.pos);
    const drifting = toP.len() > 140;
    if (drifting) b.pos = b.pos.add(toP.unit().scale(def.speed * dt()));
    ENEMIES.animate(b, drifting, drifting ? toP : null);

    // next pattern
    b.patT -= dt();
    if (b.patT <= 0) {
      b.patT = 2.2;
      const pat = def.patterns[b.patI % def.patterns.length];
      b.patI++;
      ENEMIES.runPattern(pat, b, pl, chapter);
    }
  });

  return b;
};

ENEMIES.runPattern = (pat, b, pl, chapter) => {
  if (pat === "radial") {
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      ENEMIES.shootAt(b.pos, b.pos.add(Math.cos(a) * 100, Math.sin(a) * 100), 150);
    }
  } else if (pat === "aimed") {
    for (const off of [-0.28, 0, 0.28]) {
      const base = Math.atan2(pl.pos.y - b.pos.y, pl.pos.x - b.pos.x) + off;
      ENEMIES.shootAt(b.pos, b.pos.add(Math.cos(base) * 100, Math.sin(base) * 100), 200);
    }
  } else if (pat === "charge") {
    b.charging = { dir: pl.pos.sub(b.pos).unit(), t: 0.65 };
    UI.floatText(b.pos.add(0, -70), "!!", [255, 100, 100]);
  } else if (pat === "spawn") {
    if (get("enemy").length < 7) {
      for (let i = 0; i < 2; i++) {
        const def = choose(chapter.enemySet);
        const offset = vec2(rand(-140, 140), rand(-140, 140));
        ENEMIES.spawn(def, b.pos.add(offset));
      }
    }
  } else if (pat === "spiral") {
    b.spiral = { t: 1.8, a: rand(0, Math.PI * 2) };
  }
};
