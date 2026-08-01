// ============================================================
// TUTORIAL — Victoria Park, intact and sunny.
// Teaches movement and throwing. Ball hits a bloke's car ("Oi!"),
// cracks open, friends get pulled in one by one, player falls last.
// Hard cut to Chapter 1. (Flow per LEVEL_DESIGN.md.)
// ============================================================

scene("tutorial", () => {
  G.paused = false;
  G.areaScale = 1;   // the park is an ASCII map, so nobody is rescaled here
  const m = MAPS.build(PARK_MAP, PARK_PALETTE);
  G.mapBounds = { x1: 0, y1: 0, x2: m.w, y2: m.h };

  const player = PLAYER.make(m.playerSpawn);
  const startPos = m.playerSpawn.clone();

  // --- the other nine friends, hanging out in the park ---
  const others = CHARACTERS.filter((c) => c.id !== G.run.charId);
  const batterChar = others[0];
  const batterPos = m.playerSpawn.add(240, -120);
  const friends = [];

  others.forEach((c, i) => {
    const p = i === 0
      ? batterPos
      : m.playerSpawn.add(rand(-60, 320), rand(-260, -40));
    const f = add([...ART.charComps(c.id, G.charH(0.95)), pos(p), z(44), opacity(1), "friend", { charId: c.id }]);
    friends.push(f);
  });

  // the bloke's car, parked by the right edge
  const car = add([sprite("car"), pos(m.w - 130, m.playerSpawn.y - 60), anchor("center"), scale(1.6), z(20), opacity(1)]);

  // --- prompts (text in a translucent chip) ---
  const promptChip = add([
    rect(520, 38, { radius: 19 }), pos(G.W / 2, G.H - 58), anchor("center"),
    color(UI.INK[0], UI.INK[1], UI.INK[2]), opacity(0.6), fixed(), z(194),
  ]);
  let prompt = add([
    text(isTouchscreen() ? "drag on the left side of the screen to move" : "move with WASD or the arrow keys", { size: 15 }),
    pos(G.W / 2, G.H - 58), anchor("center"), color(255, 240, 200), fixed(), z(195), opacity(1),
  ]);
  const setPrompt = (s) => {
    prompt.text = s;
    promptChip.hidden = s === "";
    promptChip.width = Math.max(200, 40 + s.length * 8.2);
  };

  let st = 0;            // 0 move, 1 throw, 2 ball in flight, 3+ cutscene
  let holdT = 0;
  let batterMark = null;

  // --- the throw ---
  const throwBall = () => {
    st = 2;
    setPrompt("");
    if (batterMark) destroy(batterMark);
    const ball = add([sprite("ball"), pos(player.pos), anchor("center"), scale(1.5), z(48), rotate(0), opacity(1), { phase: 0 }]);
    ball.onUpdate(() => {
      ball.angle += 600 * dt();
      if (ball.phase === 0) {
        const d = batterPos.sub(ball.pos);
        if (d.len() < 26) {
          ball.phase = 1;
          shake(6);
          UI.floatText(batterPos.add(0, -50), "THWACK!", [255, 220, 120]);
          SFX.play("thwack");
        } else ball.pos = ball.pos.add(d.unit().scale(380 * dt()));
      } else if (ball.phase === 1) {
        const d = car.pos.sub(ball.pos);
        if (d.len() < 30) {
          ball.phase = 2;
          destroy(ball);
          shake(12);
          UI.speech(car, "OI!!", [255, 90, 90]);   // the bloke is NOT happy
          SFX.play("honk");
          wait(1.6, quake);
        } else ball.pos = ball.pos.add(d.unit().scale(560 * dt()));
      }
    });
  };

  // --- the cracks ---
  const cracks = [];
  const quake = () => {
    st = 3;
    UI.subtitleSeq(["...that wasn't the car.", "What IS that?!"]);
    for (let i = 0; i < 9; i++) {
      wait(i * 0.18, () => {
        shake(8);
        if (i % 3 === 0) SFX.play("rumble");
        const p = m.playerSpawn.add(rand(-200, 380), rand(-320, 120));
        cracks.push(p);
        add([sprite("crack" + (i % 3)), pos(p), anchor("center"), rotate(rand(0, 360)), scale(1.3), opacity(1), z(3)]);
      });
    }
    wait(2.2, pullFriendsIn);
  };

  const pullFriendsIn = () => {
    st = 4;
    friends.forEach((f, i) => {
      wait(i * 0.42, () => {
        let target = cracks[0];
        for (const cp of cracks) if (cp.dist(f.pos) < target.dist(f.pos)) target = cp;
        f.onUpdate(() => {
          const d = target.sub(f.pos);
          f.angle = (f.angle || 0) + 720 * dt();
          if (d.len() < 12) {
            f.scale = f.scale.scale(1 - 4 * dt());
            if (f.scale.x < 0.05) destroy(f);
          } else {
            f.pos = f.pos.add(d.unit().scale(220 * dt()));
          }
        });
      });
    });
    wait(others.length * 0.42 + 1.2, pullPlayerIn);
  };

  const pullPlayerIn = () => {
    st = 5;
    G.paused = true;   // stops player control + auto-attack
    let target = cracks[0];
    for (const cp of cracks) if (cp.dist(player.pos) < target.dist(player.pos)) target = cp;
    const fall = add([fixed(), z(0)]);
    fall.onUpdate(() => {
      const d = target.sub(player.pos);
      player.angle = (player.angle || 0) + 720 * dt();
      if (d.len() < 12) {
        player.scale = player.scale.scale(1 - 4 * dt());
        if (player.scale.x < 0.05) player.hidden = true;
      } else {
        player.pos = player.pos.add(d.unit().scale(200 * dt()));
      }
    });
    wait(2.2, () => {
      const black = add([rect(G.W, G.H), color(0, 0, 0), opacity(0), fixed(), z(250)]);
      black.onUpdate(() => {
        black.opacity += dt() * 1.2;
        if (black.opacity >= 1) go("area", { chapter: 1, area: 1 });
      });
    });
  };

  // --- state machine ---
  onUpdate(() => {
    // camera
    const cx = m.w <= G.W ? m.w / 2 : G.clamp(player.pos.x, G.W / 2, m.w - G.W / 2);
    const cy = m.h <= G.H ? m.h / 2 : G.clamp(player.pos.y, G.H / 2, m.h - G.H / 2);
    camPos(cx, cy);

    if (st === 0 && player.pos.dist(startPos) > 70) {
      st = 1;
      setPrompt(isTouchscreen()
        ? "tap near the batter to throw them the ball"
        : "HOLD the mouse button to throw the ball to the batter");
      batterMark = add([text("v", { size: 24 }), pos(batterPos.add(0, -52)), anchor("center"), color(255, 220, 120), z(60), opacity(1)]);
      batterMark.onUpdate(() => { batterMark.pos.y = batterPos.y - 52 + Math.sin(time() * 4) * 6; });
    }

    if (st === 1 && !isTouchscreen()) {
      if (isMouseDown()) {
        holdT += dt();
        if (holdT > 0.35) throwBall();
      } else holdT = 0;
    }
  });

  if (isTouchscreen()) {
    onMousePress(() => {
      if (st === 1) throwBall();
    });
  }

  UI.mobileControls();
  UI.vignette(0.36);
  UI.sceneFade();
  onKeyPress("]", () => go("area", { chapter: 1, area: 1 }));

  UI.titleCard("", "VICTORIA PARK", false);
});
