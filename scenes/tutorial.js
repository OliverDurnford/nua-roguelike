// ============================================================
// TUTORIAL: Victoria Park, intact and sunny.
// Teaches movement and throwing. Ball hits a bloke's car ("Oi!"),
// cracks open, friends get pulled in one by one, player falls last.
// Hard cut to Chapter 1. (Flow per LEVEL_DESIGN.md.)
// ============================================================

scene("tutorial", () => {
  SPEECH.endArea();   // no room loaded: nothing to test a line against
  G.paused = false;
  G.where = "tutorial";   // for the admin arrows (core/admin.js)
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
  // A batter and eight fielders. A bonus player leaves all ten free, so the
  // friend whose Busy You waits at the end is the one missing from the game.
  const others = CHARACTERS.filter((c) => c.id !== G.run.charId && c.id !== G.busyId()).slice(0, 9);
  const batterPos = pt(PARK_PLATE.batter);
  const friends = [];

  const spots = MAPS.shuffle(PARK_PLATE.fielders.map(pt));

  others.forEach((c, i) => {
    const p = i === 0
      ? batterPos
      : spots[(i - 1) % spots.length].add(rand(-7, 7), rand(-7, 7));
    const f = add([...ART.charComps(c.id, G.charH(0.95)), pos(p), z(44), opacity(1), "friend", { charId: c.id, feet: ART.feetBox(G.charH(0.95)), standing: true }]);
    DEPTH.track(f);
    // they breathe and blink while they wait for the pitch (core/fidget.js)
    if (ART.hasAnims(c.id)) f.onUpdate(() => { if (f.standing) FIDGET.idle(f, c.id); });
    // Everyone watches the plate. The sprites are drawn facing right,
    // so anyone stood to the right of home plate gets flipped; the
    // catcher and centre field are dead in line and stay as they are.
    if (i > 0 && Math.abs(p.x - batterPos.x) > 24) f.flipX = p.x > batterPos.x;
    friends.push(f);
  });

  // and take turns at their own fidgets, until the ground goes (Ollie, 15 Oct 2026)
  FIDGET.beginCrowd(() => friends, () => st < 3);

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
  // How far the camera pulls back once the ground goes: until the park
  // fills the screen edge to edge, and no further. Fitting ALL of it left
  // black bands down the sides, and on a phone the friends were specks
  // (Ollie, 13 Oct 2026). The park is taller than the screen's shape, so
  // a strip top and bottom stays off screen; the fielders all fit inside.
  const WIDE = Math.min(1, Math.max(G.W / m.w, G.H / m.h));
  const wideCentre = () => {
    const vw = G.W / WIDE, vh = G.H / WIDE;
    // the middle of everyone still standing, held inside the park
    const ps = friends.filter((f) => f.exists()).map((f) => f.pos).concat([player.pos]);
    const mid = ps.reduce((a, p) => a.add(p), vec2(0)).scale(1 / ps.length);
    return vec2(G.clamp(mid.x, vw / 2, m.w - vw / 2), G.clamp(mid.y, vh / 2, m.h - vh / 2));
  };
  let wideAt = null;     // fixed once, as the ground goes
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
  const cracks = [];   // where each one opened, to pull people into
  const placed = [];   // what CRACKS.spot needs to keep them apart
  const quake = () => {
    st = 3;
    // the music turns with the ground: Ollie's cue for the cracks
    SOUNDTRACK.playById("the-cracks", 0, 0.3);
    UI.subtitleSeq(["...that wasn't the car.", "What IS that?!"]);
    // The park dims as the ground goes, towards the cracks' own purple, and
    // the earth they throw up flies above it (Ollie, 13 Oct 2026). Under
    // the prompts and subtitles, over everyone on the field.
    const dim = add([rect(G.W, G.H), color(28, 10, 40), opacity(0), fixed(), z(62)]);
    dim.onUpdate(() => { dim.opacity = Math.min(0.34, dim.opacity + dt() * 0.34 / 1.5); });
    const fx = CRACKS.fx(63);
    for (let i = 0; i < 9; i++) {
      wait(i * 0.18, () => {
        shake(8);
        if (i % 3 === 0) SFX.play("rumble");
        // Never across another crack: once the diamond is full, the
        // rest of the rumbles just shake (the first always fits).
        const [cx1, cy1, cx2, cy2] = PARK_PLATE.crackBox;
        const at = CRACKS.spot([cx1 * U, cy1 * U, cx2 * U, cy2 * U], { variant: i, placed, plate: PARK_PLATE })
          || (cracks.length ? null : { pos: vec2((cx1 + cx2) / 2 * U, (cy1 + cy2) / 2 * U), variant: 0, flip: false });
        if (!at) return;
        placed.push(at);
        cracks.push(at.pos);
        add([...CRACKS.comps(at.variant, { flip: at.flip }), pos(at.pos), z(3)]);   // grows open, see core/cracks.js
        fx.burst(at);
      });
    }
    wait(2.2, pullFriendsIn);
  };

  const pullFriendsIn = () => {
    st = 4;
    friends.forEach((f, i) => {
      wait(i * 0.42, () => {
        f.standing = false;
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
      SOUNDTRACK.fadeOut(0.8);   // the cracks' cue goes with the picture
      const black = add([rect(G.W, G.H), color(0, 0, 0), opacity(0), fixed(), z(250)]);
      black.onUpdate(() => {
        black.opacity += dt() * 1.2;
        if (black.opacity >= 1) go("area", { chapter: 1, area: 1 });
      });
    });
  };

  // --- the reveal: the whole park first, then in to the player ---
  G.paused = true;
  const reveal = UI.reveal(m.w, m.h, {
    onPush: () => { if (st < 5) G.paused = false; },
    onDone: () => UI.bigTitle({ num: "00", name: "VICTORIA PARK", sub: "PRESENT DAY · 2026" }),
  });

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
      if (!wideAt) wideAt = wideCentre();
      wideK = Math.min(1, wideK + dt() / 1.4);
      const k = UI.ease(wideK);
      camScale(vec2(1 + (WIDE - 1) * k));
      camPos(cam.lerp(wideAt, k));
    }

    if (st === 0 && player.pos.dist(startPos) > 70) {
      st = 1;
      setPrompt(isTouchscreen()
        ? "push the right stick towards the batter to throw"
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
    // On a phone the throw teaches the aim stick (Ollie, 13 Oct 2026): it
    // has to point roughly at the batter, within about 70 degrees either side.
    if (st === 1 && isTouchscreen()) {
      const toBatter = batterPos.sub(player.pos).unit();
      if (G.aim.len() > 0.3 && G.aim.unit().dot(toBatter) > 0.34) {
        holdT += dt();
        if (holdT > 0.15) throwBall();
      } else holdT = 0;
    }
  });

  // Walk up to one of the nine before the ground goes and they say their
  // line, once each (Ollie, 17 Oct 2026). The words are on the speech
  // board under "walked up to in the park".
  const greeted = new Set();
  onUpdate(() => {
    if (st >= 3 || G.paused) return;
    for (const f of friends) {
      if (greeted.has(f.charId) || !f.exists()) continue;
      if (player.pos.dist(f.pos) > G.charH(1.3)) continue;
      greeted.add(f.charId);
      const line = SPEECH.greetLine(f.charId);
      if (line) UI.speech(f, line);
    }
  });

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

});
