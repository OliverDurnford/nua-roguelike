// ============================================================
// AREA SCENE — runs every gameplay area in every chapter.
// Builds the map from its ASCII layout, spawns enemies at random
// spawn points, locks the exit until the area is cleared, and
// handles companion pickups, bosses, and the finale.
// ============================================================

// ---------- map builder ----------
const MAPS = {};

MAPS.shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand(0, i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

MAPS.build = (rows, pal) => {
  const T = G.TILE;
  const H = rows.length;
  const W = Math.max(...rows.map((r) => r.length));

  // one big floor + light speckle so big rooms aren't flat
  add([rect(W * T, H * T), pos(0, 0), color(pal.floor[0], pal.floor[1], pal.floor[2]), z(0)]);
  for (let i = 0; i < Math.floor((W * H) / 12); i++) {
    add([
      rect(rand(5, 14), rand(3, 8)),
      pos(rand(0, W * T), rand(0, H * T)),
      color(pal.accent[0], pal.accent[1], pal.accent[2]),
      opacity(0.13), z(1),
    ]);
  }

  const out = {
    enemySpawns: [], exits: [],
    playerSpawn: vec2((W * T) / 2, (H * T) / 2),
    companionSpawn: null, bossSpawn: null,
    w: W * T, h: H * T,
  };
  const obsCol = pal.wall.map((v) => Math.min(255, v + 35));

  for (let y = 0; y < H; y++) {
    const row = rows[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "=") {
        let x2 = x;
        while (x2 < row.length && row[x2] === "=") x2++;
        add([
          rect((x2 - x) * T, T), pos(x * T, y * T),
          color(pal.wall[0], pal.wall[1], pal.wall[2]),
          area(), body({ isStatic: true }), z(10), "solid",
        ]);
        x = x2;
        continue;
      }
      const cx = x * T + T / 2, cy = y * T + T / 2;
      if (ch === "o") {
        add([
          rect(T * 0.78, T * 0.78, { radius: 5 }), pos(cx, cy), anchor("center"),
          color(obsCol[0], obsCol[1], obsCol[2]), outline(2, rgb(15, 15, 18)),
          area(), body({ isStatic: true }), z(12), "solid",
        ]);
      } else if (ch === "E") out.enemySpawns.push(vec2(cx, cy));
      else if (ch === "P") out.playerSpawn = vec2(cx, cy);
      else if (ch === "C") out.companionSpawn = vec2(cx, cy);
      else if (ch === "B") out.bossSpawn = vec2(cx, cy);
      else if (ch === "X") {
        const door = add([
          rect(T, T), pos(x * T, y * T),
          color(180, 60, 60), outline(3, rgb(20, 20, 25)),
          area(), body({ isStatic: true }), z(10),
          "door", { unlocked: false },
        ]);
        out.exits.push(door);
      }
      x++;
    }
  }
  return out;
};

// ---------- the scene ----------
// NOTE: the second argument is renamed to areaNum inside the scene -
// calling it "area" would shadow Kaboom's area() component function.
scene("area", ({ chapter, area: areaNum }) => {
  G.paused = false;
  const ch = CHAPTERS[chapter - 1];
  const a = ch.areas[areaNum - 1];
  G.run.chapter = chapter;
  G.run.area = areaNum;

  const m = MAPS.build(a.map, a.palette);
  G.mapBounds = { x1: 0, y1: 0, x2: m.w, y2: m.h };
  G.areaWater = !!a.water;   // lets Ana's ocean lines trigger near water

  const player = PLAYER.make(m.playerSpawn);
  player.iframes = 1.6;   // brief spawn protection while you get your bearings
  COMPANIONS.spawnFollowers(player);
  let dead = false;
  let exiting = false;

  // --- enemies (randomised placement each run) ---
  // never spawn right on top of the player's entrance
  if (a.enemyBudget > 0) {
    let pts = m.enemySpawns.filter((p) => p.dist(m.playerSpawn) > 260);
    if (pts.length < a.enemyBudget) pts = m.enemySpawns;
    pts = MAPS.shuffle(pts).slice(0, a.enemyBudget);
    for (const p of pts) ENEMIES.spawn(choose(ch.enemySet), p);
  }

  // --- companion pickup (quiet areas, chapters 1-4) ---
  if (m.companionSpawn && chapter <= 4) {
    const compId = G.run.plan[chapter];
    if (compId && !G.run.companions.includes(compId)) {
      const cObj = add([
        ...ART.charComps(compId, 40),
        pos(m.companionSpawn),
        area({ scale: 0.9 }), z(44), opacity(1),
        "companionPickup", { baseY: m.companionSpawn.y, t: rand(0, 5) },
      ]);
      cObj.onUpdate(() => {
        cObj.t += dt();
        cObj.pos.y = cObj.baseY + Math.sin(cObj.t * 3) * 5;
      });
      const mark = add([
        text("!", { size: 24 }), pos(m.companionSpawn.add(0, -44)), anchor("center"),
        color(255, 220, 120), z(44), opacity(1),
      ]);
      mark.onUpdate(() => { mark.pos.y = cObj.pos.y - 46; });
      onCollide("player", "companionPickup", (p, c) => {
        const joinAt = c.pos.clone();
        destroy(c); destroy(mark);
        COMPANIONS.recruit(compId);
        COMPANIONS.addFollower(player, compId, joinAt);   // they fall in behind you
      });
    }
  }

  // --- boss areas ---
  if (a.boss) {
    const finaleOpts = a.finale
      ? { finale: true, name: "OLD " + G.playerChar().name.toUpperCase() }
      : {};
    ENEMIES.spawnBoss(ch, m.bossSpawn, finaleOpts);

    // boss health bar: name plate + gradient fill + white "ghost" that
    // lags behind when the boss takes damage (classic juice)
    const bar = add([fixed(), z(175), pos(0, 0), { disp: 1, ghost: 1 }]);
    bar.onDraw(() => {
      const b = get("boss")[0];
      if (!b) return;
      const ratio = Math.max(0, b.hp / b.maxHp);
      bar.disp += (ratio - bar.disp) * Math.min(1, dt() * 14);
      bar.ghost = Math.max(bar.disp, bar.ghost - dt() * 0.22);

      const bw = 460, bh = 13;
      const bx = G.W / 2 - bw / 2, by = G.H - 36;
      UI.dPanel(vec2(bx - 16, by - 28), bw + 32, 52, 14);
      drawText({ text: b.bname, size: 12, pos: vec2(G.W / 2, by - 18), anchor: "center", color: rgb(255, 226, 200) });
      // accent diamonds either side of the name
      for (const side of [-1, 1]) {
        drawRect({
          pos: vec2(G.W / 2 + side * (b.bname.length * 4.4 + 22), by - 13), width: 7, height: 7,
          angle: 45, anchor: "center", color: rgb(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity: 0.85,
        });
      }
      drawRect({ pos: vec2(bx, by), width: bw, height: bh, radius: 6.5, color: rgb(28, 29, 40) });
      if (bar.ghost > 0.005) {
        drawRect({ pos: vec2(bx + 1, by + 1), width: (bw - 2) * bar.ghost, height: bh - 2, radius: 5.5, color: rgb(255, 255, 255), opacity: 0.45 });
      }
      if (bar.disp > 0.005) {
        drawSprite({ sprite: "grad-red", pos: vec2(bx + 1, by + 1), scale: vec2(((bw - 2) * bar.disp) / 64, (bh - 2) / 8) });
      }
    });

    if (a.finale) FINALE.setup(m);

    G.onBossDeath = () => {
      G.onBossDeath = null;
      if (a.finale) {
        FINALE.win(player);
      } else {
        COMPANIONS.onAreaExit();   // any exit line plays during the victory pause
        wait(1.6, () => { if (!exiting) { exiting = true; G.advance(); } });
      }
    };
  }

  // --- NPC easter egg (e.g. Megan Whiteside in Propaganda) ---
  if (a.npc) {
    const npcPos = vec2(m.w * 0.5, m.h * 0.3);
    const npc = add([
      sprite(a.npc.spr), anchor("center"), pos(npcPos), z(44), opacity(1),
      { t: rand(0, 5), said: false },
    ]);
    npc.onUpdate(() => {
      npc.t += dt();
      npc.pos.y = npcPos.y + Math.sin(npc.t * 2.2) * 4;
      const pl = get("player")[0];
      if (!npc.said && pl && pl.pos.dist(npc.pos) < 100) {
        npc.said = true;
        UI.speech(npc, a.npc.line, a.npc.colors.top);
        SFX.play("uitick");
      }
    });
    const tag = add([
      text(a.npc.name, { size: 11 }), anchor("center"),
      pos(npcPos.add(0, -42)), color(200, 205, 220), opacity(0.8), z(44),
    ]);
    tag.onUpdate(() => { tag.pos.y = npc.pos.y - 44; });
  }

  // --- quiet-area extras ---
  if (a.foam) {
    for (let i = 0; i < 14; i++) {
      const f = add([
        circle(rand(34, 72)), pos(rand(0, m.w), rand(0, m.h)),
        color(240, 244, 250), opacity(rand(0.25, 0.45)), z(90),
        { vel: vec2(rand(-18, 18), rand(-12, 12)) },
      ]);
      f.onUpdate(() => {
        f.pos = f.pos.add(f.vel.scale(dt()));
        if (f.pos.x < 0 || f.pos.x > m.w) f.vel.x *= -1;
        if (f.pos.y < 0 || f.pos.y > m.h) f.vel.y *= -1;
      });
    }
  }
  if (a.dread) {
    for (let i = 0; i < 6; i++) {
      add([sprite("crack" + (i % 3)), pos(rand(m.w * 0.4, m.w), rand(60, m.h - 60)), anchor("center"), rotate(rand(0, 360)), opacity(0.85), z(2)]);
    }
    UI.subtitleSeq([
      "...do you feel that?",
      "The cracks. They're coming from Victoria Park.",
      "Hurry.",
    ]);
  }
  if (a.finale) {
    for (let i = 0; i < 12; i++) {
      add([sprite("crack" + (i % 3)), pos(rand(60, m.w - 60), rand(60, m.h - 60)), anchor("center"), rotate(rand(0, 360)), opacity(0.9), z(2)]);
    }
  }

  // --- exit door logic ---
  onUpdate(() => {
    // camera follows player, leans toward the aim, clamps to the map
    let target = player.pos;
    if (!isTouchscreen()) {
      const lean = toWorld(mousePos()).sub(player.pos);
      target = player.pos.add(lean.scale(0.12).len() > 42 ? lean.unit().scale(42) : lean.scale(0.12));
    }
    const cx = m.w <= G.W ? m.w / 2 : G.clamp(target.x, G.W / 2, m.w - G.W / 2);
    const cy = m.h <= G.H ? m.h / 2 : G.clamp(target.y, G.H / 2, m.h - G.H / 2);
    camPos(cx, cy);

    const cleared = get("enemy").length === 0 && get("boss").length === 0;
    for (const d of m.exits) {
      if (cleared && !d.unlocked) {
        d.unlocked = true;
        d.color = rgb(90, 200, 110);
        d.unuse("body");
        UI.floatText(d.pos.add(24, -10), "open!", [120, 230, 140]);
        SFX.play("door");
      }
    }
  });

  onCollide("player", "door", (p, d) => {
    if (d.unlocked && !exiting) {
      exiting = true;
      // if someone has an exit line, hold the cut for a beat so it lands
      const spoke = COMPANIONS.onAreaExit();
      wait(spoke ? 0.9 : 0, () => G.advance());
    }
  });

  // --- death ---
  const onDeath = () => {
    if (dead) return;
    dead = true;
    G.paused = true;
    G.run.deaths++;

    const dim = add([rect(G.W, G.H), color(0, 0, 0), opacity(0), fixed(), z(210)]);
    UI.fadeObj(dim, 0.78, 0.6);
    const vin = add([sprite("vignette"), pos(0, 0), scale(G.W / 480, G.H / 270), color(160, 20, 25), opacity(0), fixed(), z(210)]);
    UI.fadeObj(vin, 0.85, 0.6);

    const big = add([text("YOU DIED", { size: 46 }), pos(0, 0), anchor("center"), color(225, 72, 72), fixed(), z(211), opacity(1)]);
    UI.slideIn(big, vec2(G.W / 2, G.H * 0.3), vec2(G.W / 2, G.H * 0.38), 0.55, 0.15);
    const subT = add([
      text("Chapter " + chapter + " starts again. Companions stay with you.", { size: 15, align: "center" }),
      pos(G.W / 2, G.H * 0.53), anchor("center"), color(200, 202, 214), fixed(), z(211), opacity(0),
    ]);
    UI.fadeObj(subT, 1, 0.4, 0.7);
    const hint = add([
      text("press ENTER  /  tap to retry", { size: 15 }),
      pos(G.W / 2, G.H * 0.62), anchor("center"), color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), fixed(), z(211), opacity(0),
    ]);
    let htD = -1.0;
    hint.onUpdate(() => {
      htD += dt();
      if (htD < 0) return;
      hint.opacity = Math.min(1, htD / 0.4) * (0.6 + Math.sin(time() * 3.2) * 0.4);
    });

    const retry = () => {
      if (!dead) return;
      dead = false;
      G.run.hp = G.stats().maxHp;
      go("area", { chapter, area: 1 });
    };
    onKeyPress("enter", retry);
    wait(0.6, () => onMousePress(retry));
  };

  // --- wiring ---
  PLAYER.wireCombat(onDeath);
  UI.vignette(0.42);
  UI.hud();
  UI.wireControls();
  UI.mobileControls();
  COMPANIONS.ambient();
  COMPANIONS.onAreaEnter();
  UI.titleCard("CHAPTER " + chapter + " — " + ch.title, a.name, areaNum === 1);
  UI.sceneFade();

  G.devSkip = () => {
    if (!exiting) { exiting = true; G.advance(); }
  };
});

// ============================================================
// FINALE — Victoria Park, ruined. Five caged friends in front of
// the boss. Win: cages open, friends gather, fade to white.
// ============================================================
const FINALE = {};

FINALE.setup = (m) => {
  const caged = CHARACTERS
    .filter((c) => c.id !== G.run.charId && !G.run.companions.includes(c.id))
    .slice(0, 5);

  const base = m.bossSpawn.add(0, 110);
  caged.forEach((c, i) => {
    const p = base.add((i - 2) * 110, Math.abs(i - 2) * 26);
    add([...ART.charComps(c.id, 38), pos(p), z(20), opacity(0.55), "cagedFriend", { charId: c.id }]);
    // cage bars (obstacles the player has to fight around)
    add([
      rect(56, 56), pos(p), anchor("center"), color(40, 40, 48), opacity(0.35),
      outline(4, rgb(25, 25, 30)), area(), body({ isStatic: true }), z(21), "solid", "cageBars",
    ]);
    for (let bx = -18; bx <= 18; bx += 12) {
      add([rect(4, 56), pos(p.add(bx, 0)), anchor("center"), color(70, 70, 80), z(22), "cageBars"]);
    }
  });
};

FINALE.win = (player) => {
  G.paused = true;

  wait(0.8, () => {
    // cages open
    destroyAll("cageBars");
    shake(10);
    for (const f of get("cagedFriend")) {
      f.opacity = 1;
      f.onUpdate(() => {
        const d = player.pos.sub(f.pos);
        if (d.len() > 70) f.pos = f.pos.add(d.unit().scale(90 * dt()));
      });
    }
    UI.subtitleSeq(["Everyone's free.", "The park starts to mend itself..."]);
  });

  // fade to white -> ending
  wait(3.6, () => {
    const w = add([rect(G.W, G.H), color(255, 255, 255), opacity(0), fixed(), z(250)]);
    w.onUpdate(() => {
      w.opacity += dt() * 0.5;
      if (w.opacity >= 1) go("ending");
    });
  });
};
