// ============================================================
// COMPANIONS — recruitment, passives, the shared special meter,
// and special attacks ("single cutscene frame -> gameplay effect"
// per the design docs; the frame is a placeholder banner for now).
// ============================================================

const COMPANIONS = {};

// ---------- on-field followers ----------
// Recruited friends physically trail behind the player in a chain:
// each follower chases the one in front (the first chases the player).
// Purely cosmetic - no collisions, they can't be hurt and don't block.

COMPANIONS.spawnFollowers = (player) => {
  G.followers = [];
  for (const id of G.run.companions) {
    COMPANIONS.addFollower(player, id);
  }

  // soft gold marker under whichever companion is selected
  const marker = add([
    sprite("glow"), anchor("center"), scale(0.62),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]),
    pos(-999, -999), opacity(0), z(46),
  ]);
  marker.onUpdate(() => {
    const f = G.followers[G.run.selected];
    if (f && f.exists()) {
      marker.pos = f.pos.add(0, 12);
      marker.opacity = 0.22 + Math.sin(time() * 3) * 0.07;
    } else {
      marker.opacity = 0;
    }
  });
};

COMPANIONS.addFollower = (player, id, spawnAt) => {
  const i = G.followers.length;
  const start = spawnAt || player.pos.add(-(i + 1) * G.charH(0.76), G.charH(0.38));
  const f = add([
    ...ART.charComps(id, G.charH(0.86)),   // a touch smaller than you, so you read as the lead
    pos(start),
    opacity(1),
    z(48),
    "follower",
    { charId: id, idx: i, bobT: rand(0, 6) },
  ]);

  f.onUpdate(() => {
    if (G.paused) return;
    const lead = f.idx === 0 ? player : G.followers[f.idx - 1];
    if (!lead || !lead.exists()) return;
    const d = lead.pos.sub(f.pos);
    const gap = 38;
    if (d.len() > gap) {
      // proportional chase: snappy when far behind, settles when close
      const sp = Math.min(d.len() * 4, 460);
      f.pos = f.pos.add(d.unit().scale(sp * dt()));
      if (ART.hasAnims(f.charId)) {
        if (f.curAnim() !== "walk") f.play("walk");
      } else {
        f.bobT += dt() * 12;
        f.angle = Math.sin(f.bobT) * 4;
      }
    } else if (ART.hasAnims(f.charId)) {
      if (f.curAnim() !== "idle") f.play("idle");
    } else {
      f.angle = 0;
    }
  });

  G.followers.push(f);
  return f;
};

// Find a character's on-field sprite (player or follower), if present.
COMPANIONS.fieldSprite = (id) => {
  if (G.run && G.run.charId === id) return G.playerObj;
  return (G.followers || []).find((f) => f.charId === id);
};

// A character speaks: bubble above THEIR sprite, outlined in their
// colour. Falls back to a named subtitle if they're not on the field.
COMPANIONS.say = (id, str) => {
  const c = G.char(id);
  const ent = COMPANIONS.fieldSprite(id);
  if (ent && ent.exists()) {
    UI.speech(ent, str, c ? c.colors.top : [255, 255, 255]);
  } else {
    UI.subtitleSeq([(c ? c.name : "???") + ": “" + str + "”"]);
  }
};

// A small wordless moment between two field sprites: hearts pop between
// them. Used for the roster's kiss/hug pair interactions.
COMPANIONS.heartsBetween = (idA, idB) => {
  const a = COMPANIONS.fieldSprite(idA);
  const b = COMPANIONS.fieldSprite(idB);
  if (!a || !b || !a.exists() || !b.exists()) return;
  const mid = a.pos.add(b.pos).scale(0.5).add(0, -28);
  for (let i = 0; i < 3; i++) {
    add([
      sprite("heart"), pos(mid.add(rand(-10, 10), rand(-6, 6))), anchor("center"),
      scale(rand(1.2, 1.8)), opacity(1),
      move(vec2(0, -1), rand(24, 44)), lifespan(1.4, { fade: 0.7 }), z(120),
    ]);
  }
};

// ---------- recruitment ----------
COMPANIONS.recruit = (id) => {
  const c = G.char(id);
  G.run.companions.push(id);
  G.run.selected = G.run.companions.length - 1;
  SAVE.write("area");   // re-checkpoint on the spot: a found friend is never lost
  STORY.foundCompanion(id);   // and remember them across runs, forever

  G.paused = true;
  SFX.play("recruit");

  // dim + vignette fade in
  const dim = add([rect(G.W, G.H), color(0, 0, 0), opacity(0), fixed(), z(200), "banner"]);
  UI.fadeObj(dim, 0.72, 0.25);
  const vin = add([sprite("vignette"), pos(0, 0), scale(G.W / 480, G.H / 270), opacity(0), fixed(), z(200), "banner"]);
  UI.fadeObj(vin, 0.8, 0.25);

  // glow + portrait slide in from the left
  const glow = add([
    sprite("glow"), pos(G.W * 0.28, G.H * 0.46), anchor("center"), scale(4.4),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0), fixed(), z(201), "banner",
  ]);
  UI.fadeObj(glow, 0.3, 0.4, 0.1);
  const por = add([...ART.charComps(c.id, 170), pos(0, 0), fixed(), z(202), opacity(1), "banner"]);
  UI.slideIn(por, vec2(G.W * 0.16, G.H * 0.46), vec2(G.W * 0.28, G.H * 0.46), 0.45, 0.05);

  // gold hairlines sweeping out
  for (const dy of [-72, 112]) {
    const line = add([rect(0, 2), pos(G.W * 0.42, G.H * 0.46 + dy), color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0.85), fixed(), z(201), "banner"]);
    let lt = -0.15;
    line.onUpdate(() => { lt += dt(); if (lt > 0) line.width = 430 * UI.ease(lt / 0.5); });
  }

  // staggered text
  const t1 = add([text(c.name + " has joined the party!", { size: 25 }), pos(G.W * 0.44, G.H * 0.33), fixed(), z(202), opacity(0), "banner"]);
  const t2 = add([
    text(c.passive.name + "\n" + c.passive.desc, { size: 15, width: 420 }),
    pos(G.W * 0.44, G.H * 0.43), color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), fixed(), z(202), opacity(0), "banner",
  ]);
  const t3 = add([
    text("“" + c.recruitLine + "”", { size: 15, width: 420 }),
    pos(G.W * 0.44, G.H * 0.57), color(178, 198, 228), fixed(), z(202), opacity(0), "banner",
  ]);
  UI.fadeObj(t1, 1, 0.35, 0.2);
  UI.fadeObj(t2, 1, 0.35, 0.38);
  UI.fadeObj(t3, 1, 0.35, 0.56);

  // a few gold sparks rising
  for (let i = 0; i < 8; i++) {
    add([
      circle(rand(1.5, 3)), pos(rand(G.W * 0.18, G.W * 0.85), G.H * rand(0.65, 0.8)),
      color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(rand(0.3, 0.7)),
      move(vec2(0, -1), rand(20, 50)), lifespan(2.4, { fade: 1.2 }),
      fixed(), z(201), "banner",
    ]);
  }

  wait(2.6, () => {
    destroyAll("banner");
    G.paused = false;
    COMPANIONS.checkPairs();
  });
};

// ---------- companion pair interactions (CHARACTER_ROSTER.md) ----------
COMPANIONS.checkPairs = () => {
  if (!G.run.pairsShown) G.run.pairsShown = [];
  const present = G.run.companions.concat([G.run.charId]);
  const boys = ["ollie", "cal", "josh", "sam", "adam", "ethan"];

  for (let i = 0; i < PAIR_LINES.length; i++) {
    if (G.run.pairsShown.includes(i)) continue;
    const pair = PAIR_LINES[i];
    if (!pair.needs.every((id) => present.includes(id))) continue;
    // "Silly boys!" only fires with more than one boy in the party
    if (pair.needs.includes("annie") && pair.needs.includes("ana")) {
      if (present.filter((id) => boys.includes(id)).length < 2) continue;
    }
    G.run.pairsShown.push(i);
    // play the script as speech bubbles above the actual speakers
    pair.script.forEach((ln, j) => {
      wait(0.4 + j * 2.0, () => {
        const speakers = Array.isArray(ln.who) ? ln.who : [ln.who];
        speakers.forEach((id) => COMPANIONS.say(id, ln.text));
      });
    });
    break;
  }

  // Ollie + Lucy: sprites hug briefly when the second one joins
  if (!G.run.pairsShown.includes("hug") && present.includes("ollie") && present.includes("lucy")) {
    G.run.pairsShown.push("hug");
    wait(0.5, () => COMPANIONS.heartsBetween("ollie", "lucy"));
  }
};

// ---------- specials ----------
COMPANIONS.trySpecial = () => {
  if (!G.run || G.paused) return;
  if (G.run.meter < 1 || G.run.companions.length === 0) return;
  const c = G.char(G.run.companions[G.run.selected]);

  // Adam announces himself before the cutscene (CHARACTER_ROSTER.md)
  if (c.id === "adam") COMPANIONS.say("adam", "Watch this.");

  G.run.meter = 0;
  G.run.specialsUsed++;
  G.paused = true;
  SFX.play("riser");

  // PLACEHOLDER cutscene frame - real illustrated frames come later.
  // Fast cinematic: letterbox bars snap in, portrait + name slam across.
  const dim = add([rect(G.W, G.H), color(0, 0, 0), opacity(0), fixed(), z(200), "banner"]);
  UI.fadeObj(dim, 0.82, 0.12);

  // letterbox bars sliding in from top and bottom
  const barH = G.H * 0.16;
  const barTop = add([rect(G.W, barH), pos(0, 0), color(4, 4, 8), fixed(), z(203), "banner"]);
  const barBot = add([rect(G.W, barH), pos(0, G.H), color(4, 4, 8), fixed(), z(203), "banner"]);
  UI.slideIn(barTop, vec2(0, -barH), vec2(0, 0), 0.22, 0, false);
  UI.slideIn(barBot, vec2(0, G.H), vec2(0, G.H - barH), 0.22, 0, false);
  for (const y of [barH, G.H - barH]) {
    const line = add([rect(0, 2.5), pos(0, y), color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0.9), fixed(), z(204), "banner"]);
    let lt = -0.08;
    line.onUpdate(() => { lt += dt(); if (lt > 0) line.width = G.W * UI.ease(lt / 0.35); });
  }

  // glow + portrait from the left, name from the right
  const glow = add([
    sprite("glow"), pos(G.W * 0.28, G.H * 0.49), anchor("center"), scale(5),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0), fixed(), z(201), "banner",
  ]);
  UI.fadeObj(glow, 0.38, 0.25, 0.05);
  const por = add([...ART.charComps(c.id, 200), pos(0, 0), fixed(), z(202), opacity(1), "banner"]);
  UI.slideIn(por, vec2(G.W * 0.12, G.H * 0.49), vec2(G.W * 0.28, G.H * 0.49), 0.3);

  const nameT = add([
    text(c.name.toUpperCase(), { size: 24 }), pos(0, 0),
    color(178, 186, 208), fixed(), z(202), opacity(1), "banner",
  ]);
  UI.slideIn(nameT, vec2(G.W * 0.58, G.H * 0.33), vec2(G.W * 0.44, G.H * 0.33), 0.3, 0.05);
  const specT = add([
    text(c.special.name.toUpperCase(), { size: 36 }), pos(0, 0),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), fixed(), z(202), opacity(1), "banner",
  ]);
  UI.slideIn(specT, vec2(G.W * 0.6, G.H * 0.41), vec2(G.W * 0.44, G.H * 0.41), 0.32, 0.1);
  const lineT = add([
    text(c.special.line, { size: 15, width: 430 }), pos(0, 0),
    color(200, 202, 222), fixed(), z(202), opacity(1), "banner",
  ]);
  UI.slideIn(lineT, vec2(G.W * 0.5, G.H * 0.56), vec2(G.W * 0.44, G.H * 0.56), 0.3, 0.16);

  wait(1.4, () => {
    destroyAll("banner");
    G.paused = false;
    COMPANIONS.applyEffect(c);
  });
};

COMPANIONS.applyEffect = (c) => {
  const pl = get("player")[0];
  if (!pl) return;
  const sp = c.special;
  const targets = get("enemy").concat(get("boss"));

  shake(14);
  UI.flash([255, 240, 200], 0.18);

  // sound by effect type, plus Sam's contractually-obligated fart
  if (c.id === "sam") SFX.play("fart");
  else if (sp.type === "heal") SFX.play("warm");
  else if (sp.type === "stun") SFX.play("sparkle");
  else SFX.play("boom");

  if (sp.type === "heal") {
    G.run.hp = G.stats().maxHp;
    G.run.shield = sp.power;
    if (c.id === "lucy") COMPANIONS.say("lucy", "PUT A COAT ON!");
    return;
  }

  let hitList = [];
  if (sp.shape === "aoe") {
    hitList = targets;
  } else if (sp.shape === "radius") {
    hitList = targets.filter((t) => t.pos.dist(pl.pos) < 250);
    UI.ring(pl.pos, 250);
  } else if (sp.shape === "directional") {
    const aim = PLAYER.aimDir(pl, targets) || vec2(1, 0);
    hitList = targets.filter((t) => {
      const d = t.pos.sub(pl.pos);
      return d.len() > 1 && aim.dot(d.unit()) > 0.7;   // ~45 degree cone
    });
    UI.ring(pl.pos.add(((PLAYER.aimDir(pl, targets) || vec2(1, 0))).scale(160)), 140);
  }

  for (const t of hitList) {
    if (sp.type === "stun") t.stun = sp.power;
    else ENEMIES.hit(t, sp.power, 0);
  }

  // character-specific flourishes
  if (c.id === "ollie") {
    // the failed chat-up lines come out of Ollie himself, one after another
    for (let i = 0; i < 3; i++) {
      wait(i * 1.1, () => COMPANIONS.say("ollie", choose(CHAT_UP_LINES)));
    }
  }
  if (c.id === "adam") COMPANIONS.say("adam", "KA-CHOW!");
  if (c.id === "ethan") UI.subtitleSeq(["Tara has entered the chat"]);
  if (c.id === "annie") {
    for (let i = 0; i < 10; i++) {
      add([
        sprite("heart"), pos(rand(0, G.W), rand(-40, 0)), anchor("center"), scale(rand(1, 2)),
        opacity(1), move(vec2(0, 1), rand(60, 140)), lifespan(3, { fade: 0.5 }), fixed(), z(190),
      ]);
    }
  }
};

// ---------- ambient easter eggs while companions are active ----------
// Called once per area scene; sets up a slow timer of small character moments.
COMPANIONS.ambient = () => {
  loop(9, () => {
    if (G.paused || !G.run) return;
    const pl = get("player")[0];
    if (!pl) return;
    const ids = G.run.companions;
    if (ids.includes("josh") && chance(0.3)) {
      COMPANIONS.say("josh", choose(JOSH_NON_SEQUITURS));
    } else if (ids.includes("annie") && chance(0.25)) {
      COMPANIONS.say("annie", "meow~");
    } else if (ids.includes("lucy") && chance(0.2)) {
      COMPANIONS.say("lucy", choose(LUCY_LINES));
    } else if (ids.includes("jess") && chance(0.2)) {
      COMPANIONS.say("jess", choose(JESS_LINES));
    } else if (ids.includes("ana") && G.areaWater && chance(0.35)) {
      COMPANIONS.say("ana", choose(ANA_OCEAN_LINES));
    }
    // Josh + Sam sneak a kiss - rare, wordless, easy to miss (per the roster)
    if (ids.includes("josh") && ids.includes("sam") && chance(0.03)) {
      COMPANIONS.heartsBetween("josh", "sam");
    }
  });
};

// Hooks for area enter / exit easter eggs
COMPANIONS.onAreaEnter = () => {
  if (!G.run) return;
  if (G.run.companions.includes("cal") && chance(0.15)) {
    wait(1.2, () => COMPANIONS.say("cal", choose(CAL_DETOURS)));
  }
};

// Returns true if someone spoke, so the area can hold the exit for a
// beat and the line is actually seen before the screen cuts.
COMPANIONS.onAreaExit = () => {
  if (!G.run) return false;
  if (G.run.companions.includes("adam") && chance(0.5)) {
    COMPANIONS.say("adam", "Smell ya later!");
    return true;
  }
  return false;
};
