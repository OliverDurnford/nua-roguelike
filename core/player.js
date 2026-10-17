// ============================================================
// PLAYER: movement, aiming, auto-attack, getting hurt.
// Combat rules per CHARACTER_ROSTER.md:
//   - WASD / joystick to move
//   - fires toward the mouse on desktop, the right stick on mobile
//   - auto-attack runs whenever enemies are alive in the area (on mobile,
//     only while the right stick is held)
// ============================================================

const PLAYER = {};

PLAYER.make = (spawnPos) => {
  const c = G.playerChar();
  G.run.hp = Math.min(G.run.hp, G.stats().maxHp);

  const p = add([
    ...ART.charComps(c.id, G.charH()),
    pos(spawnPos),
    area({ scale: 0.6 }),   // the body: what bullets, enemies and pickups touch
    opacity(1),
    z(50),
    "player",
    { iframes: 0, fireCd: 0, bobT: 0, actionT: 0, faceAimT: 0, autoWalk: null, feet: ART.feetBox(G.charH()),
      charId: c.id, standing: false },
  ]);
  G.playerObj = p;   // so companions can find the player on the field
  DEPTH.track(p);

  p.onUpdate(() => {
    if (G.paused) return;
    const s = G.stats();

    // --- movement ---
    let dir = vec2(0, 0);
    if (p.autoWalk) {
      // a cutscene is walking you (the finale's walk-off): the keys do nothing
      const to = p.autoWalk.sub(p.pos);
      if (to.len() > 8) dir = to.unit().scale(0.55);
    } else {
      if (isKeyDown("a") || isKeyDown("left")) dir.x -= 1;
      if (isKeyDown("d") || isKeyDown("right")) dir.x += 1;
      if (isKeyDown("w") || isKeyDown("up")) dir.y -= 1;
      if (isKeyDown("s") || isKeyDown("down")) dir.y += 1;
      dir = dir.add(G.joy);
    }
    if (dir.len() > 1) dir = dir.unit();
    // walls stop the feet box, x then y, so you slide along edges
    COLLIDE.moveBy(p, dir.scale(s.moveSpeed * dt()));

    // real animation sheet: swap between the walk cycle and standing
    // (core/fidget.js breathes and blinks). actionT holds an attack /
    // hurt pose for a beat first, and faceAimT keeps him facing his
    // shot while he strafes between shots.
    // Characters still on placeholder art keep the old rotation bob.
    if (ART.hasAnims(c.id)) {
      p.actionT = Math.max(0, p.actionT - dt());
      p.faceAimT = Math.max(0, p.faceAimT - dt());
      if (p.faceAimT <= 0 && Math.abs(dir.x) > 0.1) p.flipX = dir.x < 0;
      p.standing = dir.len() <= 0.1 && p.actionT <= 0 && !p.autoWalk;
      if (p.actionT <= 0) {
        if (dir.len() > 0.1) { if (p.curAnim() !== "walk") p.play("walk"); }
        else FIDGET.idle(p, c.id);   // the breathe and the blink (core/fidget.js)
      }
    } else if (dir.len() > 0.1) {
      p.bobT += dt() * 14;
      p.angle = Math.sin(p.bobT) * 4;
    } else {
      p.angle = 0;
    }

    // --- timers ---
    p.iframes = Math.max(0, p.iframes - dt());
    G.specialSafe = Math.max(0, (G.specialSafe || 0) - dt());
    G.run.shield = Math.max(0, G.run.shield - dt());
    p.opacity = p.iframes > 0 ? 0.5 + Math.sin(time() * 30) * 0.3 : 1;

    // --- special meter trickle ---
    // Only once a friend has joined: until then there is nobody to do a
    // special, so the bar stays empty (Ollie, 13 Oct 2026).
    if (G.run.companions.length > 0) G.run.meter = Math.min(1, G.run.meter + 0.012 * s.chargeRate * dt());

    // ding once when the special meter fills
    if (G.run.meter >= 1 && !p.meterWasFull && G.run.companions.length > 0) SFX.play("ready");
    p.meterWasFull = G.run.meter >= 1;

    // --- auto-attack ---
    p.fireCd -= dt();
    const targets = get("enemy").concat(get("boss"));
    if (targets.length > 0 && p.fireCd <= 0) {
      const aim = PLAYER.aimDir(p, targets);
      if (aim) {
        p.fireCd = 1 / s.attackSpeed;
        PLAYER.fire(p, aim, s);
      }
    }
  });

  return p;
};

// Desktop: aim at the mouse. Mobile: wherever the right stick points, and
// nothing at all while it is let go. It used to auto-aim at the nearest
// enemy, which played itself (Ollie, 13 Oct 2026).
PLAYER.aimDir = (p, targets) => {
  if (isTouchscreen()) return G.aim.len() > 0.3 ? G.aim.unit() : null;
  const m = toWorld(mousePos());
  const d = m.sub(p.pos);
  return d.len() < 4 ? vec2(1, 0) : d.unit();
};

// Which way a pointed special goes (Ana's wave, Jess's stampede): where you
// are aiming right now (the mouse, or the aim stick while it is held), else
// the way you last threw, else the way you face. On a phone the aim stick
// is let go to tap SP, so it always went right (Ollie, 15 Oct 2026).
PLAYER.specialDir = (p) => {
  const now = PLAYER.aimDir(p, []);
  if (now) return now;
  if (p.lastAim) return p.lastAim;
  return vec2(p.flipX ? -1 : 1, 0);
};

// Phones only: a very slight pull of your shots towards enemies (Ollie, 13
// Oct 2026). A thumb on a stick is never as exact as a mouse, so a shot
// that would just miss bends in at the end; one aimed clear of everybody
// flies straight. It only turns towards an enemy within `reach` (character
// heights) and `cone` degrees either side of where it is going, and at most
// `turn` degrees a second: under 20px of bend by the time it arrives.
PLAYER.MAGNET = { turn: 35, cone: 25, reach: 2.2 };
PLAYER.magnet = (dir, speed) => ({
  id: "magnet",
  require: ["pos"],
  flyDir: dir.unit(),
  update() {
    if (!G.paused) {
      const M = PLAYER.MAGNET, reach = G.charH(M.reach);
      let best = null, bestOff = M.cone;
      for (const t of get("enemy").concat(get("boss"))) {
        const to = t.pos.sub(this.pos);
        const d = to.len();
        if (d < 1 || d > reach) continue;
        const off = Math.abs(this.flyDir.angleBetween(to));
        if (off < bestOff) { bestOff = off; best = to; }
      }
      if (best) {
        const want = this.flyDir.angleBetween(best);   // degrees, signed
        const step = Math.sign(want) * Math.min(Math.abs(want), M.turn * dt());
        this.flyDir = Vec2.fromAngle(this.flyDir.angle() + step);
      }
    }
    this.move(this.flyDir.scale(speed));
  },
});

// Fire one projectile. Each character "throws" their signature weapon -
// for now that's a coloured shape in their weapon colour.
PLAYER.fire = (p, dir, s) => {
  const c = G.playerChar();
  p.lastAim = dir.unit();   // for a pointed special (PLAYER.specialDir)
  SFX.play("shoot");
  // The throw pair, at the attack's pace. Everyone's sheet has the two the
  // same, bar Ollie's, whose "attack" is still his old camera-up-and-flash
  // pair: he throws his camera like everyone else now (Ollie, 15 Oct 2026).
  // Never stomps a longer pose still playing (hurt flinch, victory).
  if (ART.hasAnims(c.id)) {
    if (Math.abs(dir.x) > 0.05) { p.flipX = dir.x < 0; p.faceAimT = 0.5; }
    const an = G.SPR["ch-" + c.id].anims;
    const throwAnim = an.throw ? "throw" : an.attack ? "attack" : null;
    if (p.actionT <= 0.25 && throwAnim) {
      p.play(throwAnim, { speed: (an.attack || an.throw).speed });
      p.actionT = 0.22;
    }
  }
  // The real item sprite when the character has one (core/weapons-real.js),
  // sized so its larger side is about a third of a person; else the old
  // coloured square in the weapon colour.
  const wp = (typeof REAL_WEAPONS !== "undefined") && REAL_WEAPONS[c.id];
  const look = wp
    ? [sprite("wp-" + c.id), scale(G.charH(0.36) / Math.max(wp.w, wp.h))]
    : [rect(G.charH(0.26), G.charH(0.26), { radius: 3 }),
       color(c.weapon.color[0], c.weapon.color[1], c.weapon.color[2]),
       outline(1, rgb(20, 20, 25))];
  const b = add([
    ...look,
    pos(p.pos.add(dir.scale(G.charH(0.62)))),   // leaves the hand, not the chest
    anchor("center"),
    rotate(rand(0, 360)),
    area(),
    opacity(1),
    isTouchscreen() ? PLAYER.magnet(dir, 440) : move(dir, 440),
    lifespan(s.range / 440, { fade: 0.08 }),
    z(40),
    "pbullet",
    { dmg: s.damage, crit: s.crit },
  ]);
  // It flies at hand height, `lift` above its shadow on the floor. Walls
  // stop the shadow and it takes its depth from it, as people do from their
  // feet. Tested and sorted by the picture of it instead, anything thrown
  // along a gap between stalls was already over the row behind: it hit
  // their bases or went under their roofs (Ollie, 15 Oct 2026: Josh's
  // chicken down the alleys of Norwich Market).
  // An enemy stood on you sits inside the first 0.62 h of the throw, which
  // the item (it appears out at the hand) never touches, so a room could not
  // be cleared without stepping away first: hit it now instead.
  const reach = G.charH(0.62);
  const onYou = get("enemy").concat(get("boss")).find((e) =>
    [0, 0.33, 0.66].some((k) => e.hasPoint(p.pos.add(dir.scale(reach * k)))));
  if (onYou) { ENEMIES.hit(onYou, b.dmg, b.crit); destroy(b); return; }
  const lift = p.feet ? p.feet.dy + p.feet.h / 2 : 0;
  PLAYER.flyLow(b, lift);
  // It leaves the hand in FRONT of the thrower. Sorted by its own height
  // alone, anything thrown sideways or upwards sits higher up the screen
  // than his feet and so came out from behind his head (Ollie, 7 Oct
  // 2026). Once it has cleared him it sorts against the room as before.
  const inFront = () => {
    if (p.exists() && b.pos.dist(p.pos) < G.charH(0.9)) b.z = Math.max(b.z, p.z + 0.01);
  };
  inFront();            // it may be drawn once before its first update
  b.onUpdate(inFront);
};

// A thrown thing's shadow, `lift` below the picture of it: its depth, and
// what walls it hits (a box SHADOW person-heights either side, so the item's
// own size never decides which gaps it fits down). ENEMIES.shootAt too.
PLAYER.SHADOW = 0.06;
PLAYER.flyLow = (b, lift) => {
  DEPTH.track(b, lift);
  const r = G.charH(PLAYER.SHADOW);
  const hit = () => COLLIDE.hits(b.pos.x, b.pos.y + lift, r);
  b.onUpdate(() => { if (hit()) destroy(b); });
};

// Wire up all combat collisions. Called once per gameplay scene. The room's
// walls are PLAYER.flyLow's; this is only the other solid things (the cage
// bars in the finale).
PLAYER.wireCombat = (onDeath) => {
  onCollide("pbullet", "solid", (b, s) => { if (!s.is("plateSolid")) destroy(b); });
  onCollide("ebullet", "solid", (b, s) => { if (!s.is("plateSolid")) destroy(b); });
  onCollide("pbullet", "enemy", (b, e) => { ENEMIES.hit(e, b.dmg, b.crit); destroy(b); });
  onCollide("pbullet", "boss", (b, e) => { ENEMIES.hit(e, b.dmg, b.crit); destroy(b); });
  onCollide("player", "enemy", (p, e) => PLAYER.hurt(p, 1, onDeath));
  onCollide("player", "boss", (p) => PLAYER.hurt(p, 1, onDeath));
  onCollide("player", "ebullet", (p, b) => { destroy(b); PLAYER.hurt(p, 1, onDeath); });
  onCollide("player", "heart", (p, h) => {
    destroy(h);
    G.run.hp = Math.min(G.stats().maxHp, G.run.hp + 1);
    UI.floatText(p.pos, "+1", [120, 230, 120]);
    SFX.play("pickup");
    SPEECH.fire("healed");
  });
};

// Nothing touches you while your special plays, nor for SPECIAL_SAFE
// seconds after it lands: what was already flying, or stood on you, when
// you pressed it must not kill you the moment the screen comes back
// (Ollie, 15 Oct 2026). COMPANIONS.trySpecial and applyEffect set it.
PLAYER.SPECIAL_SAFE = 1.5;

PLAYER.hurt = (p, dmg, onDeath) => {
  if (G.paused || G.godMode || G.specialSafe > 0) return;
  if (p.iframes > 0 || G.run.shield > 0) return;
  const s = G.stats();
  if (rand(0, 1) < s.dodge) { UI.floatText(p.pos, "dodged!", [140, 220, 140]); SFX.play("tick"); return; }
  if (rand(0, 1) < s.block) { UI.floatText(p.pos, "blocked!", [140, 180, 230]); SFX.play("tick"); return; }

  G.run.hp -= dmg;
  if (typeof TROPHIES !== "undefined") TROPHIES.note("hurt");
  p.iframes = 1.0;
  if (ART.hasAnim(G.run.charId, "hurt")) { p.play("hurt"); p.actionT = 0.4; }
  shake(8);
  UI.flash([220, 50, 50], 0.12);
  SFX.play("hurt");

  // On your last heart is its own moment, and it beats a general "ouch".
  if (G.run.hp === 1) SPEECH.fire("lastHeart");
  else if (G.run.hp > 0) SPEECH.fire("hurt");

  if (G.run.hp <= 0) {
    SPEECH.fire("death");
    if (onDeath) onDeath();
  }
};
