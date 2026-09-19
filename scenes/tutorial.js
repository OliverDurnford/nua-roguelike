// ============================================================
// TUTORIAL: Victoria Park, intact and sunny.
// Teaches movement and throwing. Ball hits a bloke's car ("Oi!"),
// cracks open, friends get pulled in one by one, player falls last.
// Hard cut to Chapter 1. (Flow per LEVEL_DESIGN.md.)
// ============================================================

scene("tutorial", () => {
  G.paused = false;
  SAVE.write("tutorial");   // checkpoint: a quit here resumes into the park
  SOUNDTRACK.playForKey("tutorial");   // blank slot: the title song carries on
  // The park is a painted plate, so everyone stands at its own ground
  // scale. This has to be set before anything is added to the scene.
  G.areaScale = PARK_PLATE.charScale;
  const U = PARK_PLATE.unit;
  const pt = ([x, y]) => vec2(x * U, y * U);   // grid units -> world pixels

  const m = MAPS.buildPlate(PARK_PLATE);
  G.mapBounds = { x1: 0, y1: 0, x2: m.w, y2: m.h };

  const player = PLAYER.make(m.playerSpawn);
  const startPos = m.playerSpawn.clone();

  // --- the other nine friends, mid game in the park ---
  // The first one picks up the bat and stands on home plate. The other
  // eight take the fielding positions measured onto the plate (the
  // three basemen on their bags, a catcher, a short stop and three in
  // the outfield), so you walk out into a game already going on rather
  // than a group standing about. Who plays where is shuffled each run,
  // and everyone is nudged a few pixels off their mark so the side is
  // not pegged out with a ruler.
  const others = CHARACTERS.filter((c) => c.id !== G.run.charId);
  const batterPos = pt(PARK_PLATE.batter);
  const friends = [];

  const spots = MAPS.shuffle(PARK_PLATE.fielders.map(pt));

  others.forEach((c, i) => {
    const p = i === 0
      ? batterPos
      : spots[(i - 1) % spots.length].add(rand(-7, 7), rand(-7, 7));
    const f = add([...ART.charComps(c.id, G.charH(0.95)), pos(p), z(44), opacity(1), "friend", { charId: c.id, feet: ART.feetBox(G.charH(0.95)) }]);
    DEPTH.track(f);
    // Everyone watches the plate. The sprites are drawn facing right,
    // so anyone stood to the right of home plate gets flipped; the
    // catcher and centre field are dead in line and stay as they are.
    if (i > 0 && Math.abs(p.x - batterPos.x) > 24) f.flipX = p.x > batterPos.x;
    friends.push(f);
  });

  // The bloke's car is painted into the plate, so this is just an
  // invisible marker sitting on the middle one: the ball flies to it and
  // UI.speech hangs the "OI!!" off it (all it needs is a position).
  const car = add([pos(pt(PARK_PLATE.carTarget)), z(20)]);

  // --- prompts (a paper chip along the bottom) ---
  const prompt = UI.chipObj(
    isTouchscreen() ? "drag on the left side of the screen to move" : "move with WASD or the arrow keys",
    G.W / 2, G.H - 58, { z: 194 },
  );
  const setPrompt = (s) => prompt.set(s);

  let st = 0;            // 0 move, 1 throw, 2 ball in flight, 3+ cutscene
  let holdT = 0;
  let batterMark = null;
  let ballFocus = null;  // where the ball is while it flies, for the camera
  let cam = null;        // the camera's smoothed position
  const WIDE = Math.min(G.W / m.w, G.H / m.h);   // zoom that fits the whole park
  let wideK = 0;         // 0 in close on the player, 1 pulled back to the park

  // --- the throw ---
  const throwBall = () => {
    st = 2;
    setPrompt("");
    if (batterMark) destroy(batterMark);
    const ball = add([sprite("ball"), pos(player.pos), anchor("center"), scale(1.5), z(61), rotate(0), opacity(1), { phase: 0 }]);
    ball.onUpdate(() => {
      ball.angle += 600 * dt();
      ballFocus = ball.pos.clone();
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
          ballFocus = null;   // the camera holds on the car for the "OI!!"
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
        const [cx1, cy1, cx2, cy2] = PARK_PLATE.crackBox;
        const p = vec2(rand(cx1, cx2) * U, rand(cy1, cy2) * U);
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

  // --- the reveal: the whole park first, then in to the player ---
  G.paused = true;
  const reveal = UI.reveal(m.w, m.h, { onPush: () => { if (st < 5) G.paused = false; } });

  // --- state machine ---
  onUpdate(() => {
    // camera: follows the player, but rides with the ball while it flies
    // and holds on the car for the "OI!!", so the joke always lands in
    // frame. The car park is a screen's width from the diamond, so
    // without this the bloke shouted from off screen.
    let focus = player.pos;
    if (st === 2) focus = ballFocus || car.pos;
    const cx = m.w <= G.W ? m.w / 2 : G.clamp(focus.x, G.W / 2, m.w - G.W / 2);
    const cy = m.h <= G.H ? m.h / 2 : G.clamp(focus.y, G.H / 2, m.h - G.H / 2);
    cam = cam ? cam.lerp(vec2(cx, cy), Math.min(1, dt() * 5)) : vec2(cx, cy);
    reveal.apply(cam);

    // Once the ground goes, pull back out to the whole park. The nine
    // are spread across a fielding side, so from in close most of them
    // would be dragged under off the edges of the frame, and the whole
    // point of the beat is watching it happen to everybody.
    if (st >= 3) {
      wideK = Math.min(1, wideK + dt() / 1.4);
      const k = UI.ease(wideK);
      camScale(vec2(1 + (WIDE - 1) * k));
      camPos(cam.lerp(vec2(m.w / 2, m.h / 2), k));
    }

    if (st === 0 && player.pos.dist(startPos) > 70) {
      st = 1;
      setPrompt(isTouchscreen()
        ? "tap near the batter to throw them the ball"
        : "HOLD the mouse button to throw the ball to the batter");
      batterMark = add([text("v", { size: 16, font: UI.PX }), pos(batterPos.add(0, -52)), anchor("center"), color(255, 220, 120), z(61), opacity(1)]);
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
      if (st === 1 && !UI.pauseOpen) throwBall();
    });
  }

  UI.mobileControls();
  UI.pause();
  UI.vignette(0.36);
  UI.sceneFade();
  onKeyPress("]", () => go("area", { chapter: 1, area: 1 }));

  // --- F2: show the geometry over the artwork ---
  // Same dev aid as the plate areas in scenes/area.js. Off by default.
  G.showBlocks = false;
  onKeyPress("f2", () => {
    G.showBlocks = !G.showBlocks;
    for (const b of get("plateSolid")) b.opacity = G.showBlocks ? 0.35 : 0;
  });

  UI.titleCard({ num: "00", name: "VICTORIA PARK", sub: "PRESENT DAY · 2026" });
});
