// ============================================================
// PLAYER — movement, aiming, auto-attack, getting hurt.
// Combat rules per CHARACTER_ROSTER.md:
//   - WASD / joystick to move
//   - fires toward the mouse on desktop, auto-aims on mobile
//   - auto-attack runs whenever enemies are alive in the area
// ============================================================

const PLAYER = {};

PLAYER.make = (spawnPos) => {
  const c = G.playerChar();
  G.run.hp = Math.min(G.run.hp, G.stats().maxHp);

  const p = add([
    ...ART.charComps(c.id, 42),
    pos(spawnPos),
    area({ scale: 0.6 }),
    body(),
    opacity(1),
    z(50),
    "player",
    { iframes: 0, fireCd: 0, bobT: 0 },
  ]);
  G.playerObj = p;   // so companions can find the player on the field

  p.onUpdate(() => {
    if (G.paused) return;
    const s = G.stats();

    // --- movement ---
    let dir = vec2(0, 0);
    if (isKeyDown("a") || isKeyDown("left")) dir.x -= 1;
    if (isKeyDown("d") || isKeyDown("right")) dir.x += 1;
    if (isKeyDown("w") || isKeyDown("up")) dir.y -= 1;
    if (isKeyDown("s") || isKeyDown("down")) dir.y += 1;
    dir = dir.add(G.joy);
    if (dir.len() > 1) dir = dir.unit();
    p.move(dir.scale(s.moveSpeed));

    // little walk bob so movement reads even with a static sprite
    if (dir.len() > 0.1) {
      p.bobT += dt() * 14;
      p.angle = Math.sin(p.bobT) * 4;
    } else {
      p.angle = 0;
    }

    // --- timers ---
    p.iframes = Math.max(0, p.iframes - dt());
    G.run.shield = Math.max(0, G.run.shield - dt());
    p.opacity = p.iframes > 0 ? 0.5 + Math.sin(time() * 30) * 0.3 : 1;

    // --- special meter trickle ---
    G.run.meter = Math.min(1, G.run.meter + 0.012 * s.chargeRate * dt());

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

// Desktop: aim at the mouse. Mobile: auto-aim at the nearest enemy.
PLAYER.aimDir = (p, targets) => {
  if (isTouchscreen()) {
    let best = null, bd = Infinity;
    for (const t of targets) {
      const d = t.pos.dist(p.pos);
      if (d < bd) { bd = d; best = t; }
    }
    return best ? best.pos.sub(p.pos).unit() : null;
  }
  const m = toWorld(mousePos());
  const d = m.sub(p.pos);
  return d.len() < 4 ? vec2(1, 0) : d.unit();
};

// Fire one projectile. Each character "throws" their signature weapon -
// for now that's a coloured shape in their weapon colour.
PLAYER.fire = (p, dir, s) => {
  const c = G.playerChar();
  SFX.play("shoot");
  add([
    rect(11, 11, { radius: 3 }),
    color(c.weapon.color[0], c.weapon.color[1], c.weapon.color[2]),
    outline(1, rgb(20, 20, 25)),
    pos(p.pos.add(dir.scale(26))),
    anchor("center"),
    rotate(rand(0, 360)),
    area(),
    opacity(1),
    move(dir, 440),
    lifespan(s.range / 440, { fade: 0.08 }),
    z(40),
    "pbullet",
    { dmg: s.damage, crit: s.crit },
  ]);
};

// Wire up all combat collisions. Called once per gameplay scene.
PLAYER.wireCombat = (onDeath) => {
  onCollide("pbullet", "solid", (b) => destroy(b));
  onCollide("ebullet", "solid", (b) => destroy(b));
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
  });
};

PLAYER.hurt = (p, dmg, onDeath) => {
  if (G.paused || G.godMode) return;
  if (p.iframes > 0 || G.run.shield > 0) return;
  const s = G.stats();
  if (rand(0, 1) < s.dodge) { UI.floatText(p.pos, "dodged!", [140, 220, 140]); SFX.play("tick"); return; }
  if (rand(0, 1) < s.block) { UI.floatText(p.pos, "blocked!", [140, 180, 230]); SFX.play("tick"); return; }

  G.run.hp -= dmg;
  p.iframes = 1.0;
  shake(8);
  UI.flash([220, 50, 50], 0.12);
  SFX.play("hurt");

  if (G.run.hp <= 0 && onDeath) onDeath();
};
