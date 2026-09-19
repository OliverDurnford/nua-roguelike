// ============================================================
// AREA SCENE: runs every gameplay area in every chapter.
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
  G.worldH = H * T;
  COLLIDE.reset();

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
          area(), z(10), "solid",
        ]);
        COLLIDE.add(x * T, y * T, x2 * T, (y + 1) * T);
        x = x2;
        continue;
      }
      const cx = x * T + T / 2, cy = y * T + T / 2;
      if (ch === "o") {
        add([
          rect(T * 0.78, T * 0.78, { radius: 5 }), pos(cx, cy), anchor("center"),
          color(obsCol[0], obsCol[1], obsCol[2]), outline(2, rgb(15, 15, 18)),
          area(), z(12), "solid",
        ]);
        COLLIDE.add(cx - T * 0.39, cy - T * 0.39, cx + T * 0.39, cy + T * 0.39);
      } else if (ch === "E") out.enemySpawns.push(vec2(cx, cy));
      else if (ch === "P") out.playerSpawn = vec2(cx, cy);
      else if (ch === "C") out.companionSpawn = vec2(cx, cy);
      else if (ch === "B") out.bossSpawn = vec2(cx, cy);
      else if (ch === "X") {
        const door = add([
          rect(T, T), pos(x * T, y * T),
          color(180, 60, 60), outline(3, rgb(20, 20, 25)),
          area(), z(10),
          "door", { unlocked: false },
        ]);
        COLLIDE.add(x * T, y * T, (x + 1) * T, (y + 1) * T, { open: () => door.unlocked });
        out.exits.push(door);
      }
      x++;
    }
  }
  return out;
};

// The list of painted things in a plate. New files carry `things` (one
// entry per thing: name, footprint, optional outline); older ones still
// carry `solid`, a bare list of footprints, which is read as things with
// no outlines so nothing has to be converted by hand.
MAPS.things = (plate) => {
  if (plate.things) return plate.things;
  return (plate.solid || []).map((r, i) => ({ name: "wall " + (i + 1), foot: r }));
};

// Where a thing's base line is, in units: `base` if given, else the
// bottom of its footprint, else the lowest point of its outline.
MAPS.baseOf = (t) => {
  if (t.base != null) return t.base;
  if (t.foot) return t.foot[3];
  return Math.max(...t.over.map((p) => p[1]));
};

// An outline: the same painting redrawn over the field, clipped to the
// traced polygon, at the depth of the thing's base line. Actors whose feet
// are above the base draw under it (DEPTH), so they stand behind it. Only
// the outline's bounding box of the plate is drawn, one patch per tile it
// touches, so the cost is the patch and not the whole picture.
MAPS.addOver = (t, tiles, plate) => {
  const U = plate.unit;
  const pts = t.over.map(([x, y]) => vec2(x * U, y * U));
  const base = MAPS.baseOf(t) * U;
  const xs = t.over.map((p) => p[0]), ys = t.over.map((p) => p[1]);
  const bx1 = Math.min(...xs), bx2 = Math.max(...xs);
  const by1 = Math.min(...ys), by2 = Math.max(...ys);
  const patches = [];
  for (const tile of tiles) {
    const x1 = Math.max(bx1, tile.x0), x2 = Math.min(bx2, tile.x1);
    if (x2 <= x1) continue;
    const tw = tile.x1 - tile.x0;
    patches.push({
      sprite: tile.sprite,
      pos: vec2(x1 * U, by1 * U),
      quad: quad((x1 - tile.x0) / tw, by1 / plate.rows, (x2 - x1) / tw, (by2 - by1) / plate.rows),
    });
  }
  return add([
    pos(0, 0), z(DEPTH.z(base)), "plateOver",
    {
      thing: t,
      draw() {
        drawMasked(
          () => { for (const p of patches) drawSprite({ sprite: p.sprite, pos: p.pos, quad: p.quad }); },
          () => drawPolygon({ pts }),
        );
        if (G.showBlocks) {
          drawPolygon({ pts, color: rgb(80, 140, 255), opacity: 0.35 });
          drawLines({ pts: [vec2(bx1 * U, base), vec2(bx2 * U, base)], color: rgb(255, 255, 255), width: 2, opacity: 0.8 });
        }
      },
    },
  ]);
};

// ---------- plate builder ----------
// For areas that use a painted background instead of an ASCII map
// (see data/level-gonzos.js). Returns exactly the same shape as
// MAPS.build, so everything downstream works without knowing which
// kind of area it is in.
MAPS.buildPlate = (plate) => {
  const U = plate.unit;
  const W = plate.cols * U;
  const H = plate.rows * U;
  G.worldH = H;
  COLLIDE.reset();

  // The painting. Long plates come as two tiles side by side, because
  // Kaboom refuses a texture wider than 2048 px; `x` is in grid units.
  // Each tile runs from its x to the next tile's x (the last to cols).
  const tiles = plate.tiles
    ? plate.tiles.map((t, i) => ({
        sprite: t.sprite, x0: t.x,
        x1: i + 1 < plate.tiles.length ? plate.tiles[i + 1].x : plate.cols,
      }))
    : [{ sprite: plate.sprite, x0: 0, x1: plate.cols }];
  for (const t of tiles) add([sprite(t.sprite), pos(t.x0 * U, 0), z(0)]);

  // Footprints block feet and bullets; outlines draw over you. Both are
  // invisible in play; press F2 to see them.
  for (const t of MAPS.things(plate)) {
    if (t.foot) {
      const [x1, y1, x2, y2] = t.foot;
      COLLIDE.add(x1 * U, y1 * U, x2 * U, y2 * U);
      add([
        rect((x2 - x1) * U, (y2 - y1) * U), pos(x1 * U, y1 * U),
        color(255, 60, 90), opacity(0),
        area(), z(10), "solid", "plateSolid",
      ]);
    }
    if (t.over && t.over.length >= 3) MAPS.addOver(t, tiles, plate);
  }

  const out = {
    enemySpawns: plate.enemySpawns.map(([x, y]) => vec2(x * U, y * U)),
    exits: [],
    playerSpawn: vec2(plate.playerSpawn[0] * U, plate.playerSpawn[1] * U),
    companionSpawn: plate.companionSpawn
      ? vec2(plate.companionSpawn[0] * U, plate.companionSpawn[1] * U)
      : null,
    bossSpawn: plate.bossSpawn
      ? vec2(plate.bossSpawn[0] * U, plate.bossSpawn[1] * U)
      : null,
    w: W, h: H,
  };

  if (plate.exit) {
    const [x1, y1, x2, y2] = plate.exit;
    const dw = (x2 - x1) * U, dh = (y2 - y1) * U;
    const mid = vec2((x1 + x2) / 2 * U, (y1 + y2) / 2 * U);

    // A flat coloured block would look cheap on top of painted artwork,
    // so the door is a lit threshold: soft glow, bar, label above it.
    const glow = add([
      sprite("glow"), anchor("center"), pos(mid),
      scale(dw / 62, dh / 40), color(200, 90, 80), opacity(0.3), z(9),
    ]);
    const door = add([
      rect(dw, dh, { radius: 4 }), pos(x1 * U, y1 * U),
      color(180, 60, 60), outline(3, rgb(20, 20, 25)), opacity(0.85),
      area(), z(10),
      "door", { unlocked: false },
    ]);
    // Solid until the room is cleared, then you walk through it.
    COLLIDE.add(x1 * U, y1 * U, x2 * U, y2 * U, { open: () => door.unlocked });
    const lbl = add([
      text("WAY OUT", { size: 8, font: UI.PX }), anchor("center"),
      pos(mid.x, y1 * U - 13),
      color(230, 200, 190), opacity(0.75), z(11),
    ]);
    // once it opens, the glow breathes so your eye finds it across the room
    glow.onUpdate(() => {
      if (!door.unlocked) return;
      glow.color = rgb(90, 210, 120);
      glow.opacity = 0.34 + Math.sin(time() * 3) * 0.16;
      lbl.color = rgb(150, 235, 170);
    });
    out.exits.push(door);
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
  SAVE.write("area");   // checkpoint: the run as it stood at this door

  // How big people stand in THIS room. Must be set before anything is
  // added, because every sprite reads it on the way in.
  G.areaScale = (a.plate && a.plate.charScale) || a.charScale || 1;

  // The song for this room. No-op if the same track is already playing,
  // so walking between rooms on the same track does not restart it.
  SOUNDTRACK.playForArea(chapter, areaNum, a);

  const m = a.plate ? MAPS.buildPlate(a.plate) : MAPS.build(a.map, a.palette);
  G.mapBounds = { x1: 0, y1: 0, x2: m.w, y2: m.h };
  G.areaWater = !!a.water;   // lets Ana's ocean lines trigger near water

  const player = PLAYER.make(m.playerSpawn);
  player.iframes = 1.6;   // brief spawn protection while you get your bearings
  COMPANIONS.spawnFollowers(player);
  let dead = false;
  let exiting = false;

  // --- enemies (randomised placement each run) ---
  // They come in once the room has been revealed (see the camera below),
  // one after another, never right on top of the player's entrance.
  // Until they have, the room does not count as cleared.
  let spawned = false;
  const spawnEnemies = () => {
    if (a.enemyBudget > 0) {
      let pts = m.enemySpawns.filter((p) => p.dist(m.playerSpawn) > 260);
      if (pts.length < a.enemyBudget) pts = m.enemySpawns;
      pts = MAPS.shuffle(pts).slice(0, a.enemyBudget);
      pts.forEach((p, i) => wait(i * 0.14, () => { if (!dead && !exiting) ENEMIES.spawnIn(choose(ch.enemySet), p); }));
      wait(pts.length * 0.14, () => { spawned = true; });
    } else {
      spawned = true;
    }
  };

  // --- companion pickup (quiet areas, chapters 1-4) ---
  if (m.companionSpawn && chapter <= 4) {
    const compId = G.run.plan[chapter];
    if (compId && !G.run.companions.includes(compId)) {
      const cObj = add([
        ...ART.charComps(compId, G.charH(0.95)),
        pos(m.companionSpawn),
        area({ scale: 0.9 }), z(44), opacity(1),
        "companionPickup", { baseY: m.companionSpawn.y, t: rand(0, 5) },
      ]);
      cObj.feet = ART.feetBox(G.charH(0.95));
      DEPTH.track(cObj);
      cObj.onUpdate(() => {
        cObj.t += dt();
        cObj.pos.y = cObj.baseY + Math.sin(cObj.t * 3) * 5;
      });
      const mark = add([
        text("!", { size: 16, font: UI.PX }), pos(m.companionSpawn.add(0, -44)), anchor("center"),
        color(255, 220, 120), z(44), opacity(1),
      ]);
      mark.onUpdate(() => { mark.pos.y = cObj.pos.y - 46; mark.z = cObj.z + 0.5; });
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

    // boss health bar: a paper card at the foot of the screen, the name in
    // pixel type over a wristband meter like the HUD's, in red, with a pink
    // "ghost" that lags behind when the boss takes damage (classic juice)
    const bar = add([fixed(), z(175), pos(0, 0), { disp: 1, ghost: 1 }]);
    bar.onDraw(() => {
      const b = get("boss")[0];
      if (!b) return;
      const ratio = Math.max(0, b.hp / b.maxHp);
      bar.disp += (ratio - bar.disp) * Math.min(1, dt() * 14);
      bar.ghost = Math.max(bar.disp, bar.ghost - dt() * 0.22);

      const bw = 460, bh = 13;
      const bx = G.W / 2 - bw / 2, by = G.H - 36;
      UI.card(vec2(bx - 16, by - 30), bw + 32, 56);
      UI.label(b.bname, G.W / 2, by - 18, { anchor: "center", color: UI.TEXT, shadow: false });
      UI.R(bx - 2, by - 2, bw + 4, bh + 4, UI.INK);
      UI.R(bx, by, bw, bh, UI.WHITE);
      const blocks = (k, col) => {
        const fw = Math.round((bw - 2) * k);
        for (let off = 0; off < fw; off += 9) UI.R(bx + 1 + off, by + 1, Math.min(8, fw - off), bh - 2, col);
      };
      if (bar.ghost > 0.005) blocks(bar.ghost, UI.PINK);
      if (bar.disp > 0.005) blocks(bar.disp, UI.RED);
    });

    if (a.finale) FINALE.setup(m);

    G.onBossDeath = () => {
      G.onBossDeath = null;
      if (dead) return;   // a last bullet in flight can land after you've dropped
      if (ART.hasAnims(G.run.charId)) { player.play("victory"); player.actionT = 1.6; }
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
    // Plates can pin the NPC to measured clear floor; ASCII areas keep
    // the old fixed fraction of the room.
    const npcPos = (a.plate && a.plate.npcSpawn)
      ? vec2(a.plate.npcSpawn[0] * a.plate.unit, a.plate.npcSpawn[1] * a.plate.unit)
      : vec2(m.w * 0.5, m.h * 0.3);
    const npc = add([
      sprite(a.npc.spr), anchor("center"), pos(npcPos), z(44), opacity(1),
      { t: rand(0, 5), said: false },
    ]);
    DEPTH.track(npc, npc.height / 2);
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
      text(a.npc.name, { size: 16, font: UI.VT }), anchor("center"),
      pos(npcPos.add(0, -42)), color(200, 205, 220), opacity(0.8), z(44),
    ]);
    tag.onUpdate(() => { tag.pos.y = npc.pos.y - 44; tag.z = npc.z + 0.5; });
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

  // --- the reveal: pulled back over the whole room, then in to the player ---
  // Nothing moves through the hold; control comes back as the push starts
  // and the enemies arrive once the camera has landed.
  G.paused = true;
  const reveal = UI.reveal(m.w, m.h, {
    onPush: () => { G.paused = false; },
    onDone: spawnEnemies,
  });

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
    reveal.apply(vec2(cx, cy));

    const cleared = spawned && get("enemy").length === 0 && get("boss").length === 0;
    for (const d of m.exits) {
      if (cleared && !d.unlocked) {
        d.unlocked = true;
        d.color = rgb(90, 200, 110);
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
    if (dead || exiting) return;   // can't die into the win you already earned
    dead = true;
    G.paused = true;
    G.run.deaths++;
    // stagger, then flat on his back while the screen dims
    if (ART.hasAnims(G.run.charId)) player.play("ko");

    // hold the screen for a beat first, so the KO stagger-and-flop lands
    // in full light before the dim and the big red text move in
    const koHold = ART.hasAnims(G.run.charId) ? 0.8 : 0;

    const dim = add([rect(G.W, G.H), color(0, 0, 0), opacity(0), fixed(), z(210)]);
    UI.fadeObj(dim, 0.78, 0.6, koHold);
    const vin = add([sprite("vignette"), pos(0, 0), scale(G.W / 480, G.H / 270), color(160, 20, 25), opacity(0), fixed(), z(210)]);
    UI.fadeObj(vin, 0.85, 0.6, koHold);

    const big = UI.labelObj("YOU DIED", G.W / 2, G.H * 0.38, { size: 32, anchor: "center", color: UI.RED, shadowOff: 4, z: 211 });
    UI.slideIn(big, vec2(G.W / 2, G.H * 0.3), vec2(G.W / 2, G.H * 0.38), 0.55, 0.15 + koHold);
    const subT = add([
      text("Chapter " + chapter + " starts again. Companions stay with you.", { size: 16, font: UI.VT, align: "center" }),
      pos(G.W / 2, G.H * 0.53), anchor("center"), color(200, 202, 214), fixed(), z(211), opacity(0),
    ]);
    UI.fadeObj(subT, 1, 0.4, 0.7 + koHold);
    const hint = add([
      text("press ENTER  /  tap to retry", { size: 16, font: UI.VT }),
      pos(G.W / 2, G.H * 0.62), anchor("center"), color(UI.rgb(UI.SILVER)), fixed(), z(211), opacity(0),
    ]);
    let htD = -1.0 - koHold;
    hint.onUpdate(() => {
      htD += dt();
      if (htD < 0) return;
      hint.opacity = Math.min(1, htD / 0.4) * (0.6 + Math.sin(time() * 3.2) * 0.4);
    });

    const retry = () => {
      if (!dead || UI.pauseOpen) return;
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
  UI.pause();
  COMPANIONS.ambient();
  COMPANIONS.onAreaEnter();
  // the taped-down label: track number in the chapter, the room, the chapter and its year
  UI.titleCard({
    num: String(areaNum).padStart(2, "0"),
    name: a.name.toUpperCase(),
    sub: ch.year ? ch.title + " · " + ch.year : ch.title,
  });
  UI.sceneFade();

  G.devSkip = () => {
    if (!exiting) { exiting = true; G.advance(); }
  };

  // --- F2: show the geometry over the artwork ---
  // Footprints red, outlines blue with their base lines, spawns as dots.
  // Only useful on plate areas, where all of it is invisible and measured
  // against a painting. Off by default.
  G.showBlocks = false;
  onKeyPress("f2", () => {
    G.showBlocks = !G.showBlocks;
    for (const b of get("plateSolid")) b.opacity = G.showBlocks ? 0.35 : 0;
  });
  onDraw(() => {
    if (!G.showBlocks) return;
    drawCircle({ pos: m.playerSpawn, radius: 14, color: rgb(90, 220, 255), opacity: 0.6 });
    for (const p of m.enemySpawns) {
      drawCircle({ pos: p, radius: 12, color: rgb(255, 210, 80), opacity: 0.6 });
    }
  });
});

// ============================================================
// FINALE: Victoria Park, ruined. Five caged friends in front of
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
