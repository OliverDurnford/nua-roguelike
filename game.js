// THE ROGUELIKE — Victoria Park tutorial (vertical slice)
// Step 2 of the production plan: prove the pipeline end-to-end.
// Engine: Kaplay (Kaboom.js successor). API is the same.

// ----- ENGINE SETUP -----
kaplay({
  background: [110, 165, 85],   // park grass
  width: 800,
  height: 600,
  letterbox: true,
  pixelDensity: window.devicePixelRatio || 1,
  global: true,
});

// ----- ASSETS -----
loadSprite("ollie", "sprites/ollie.png");
loadSprite("annie", "sprites/annie.png");

// ----- HELPERS -----
const isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
const PLAYER_SPEED = 220;
const BALL_SPEED = 520;

// ----- TUTORIAL SCENE -----
scene("park", () => {

  // -- Soft path through the park (a beige strip cutting diagonally) --
  add([
    rect(width(), 90),
    pos(0, height() * 0.55),
    rotate(-6),
    color(220, 200, 160),
    z(-5),
  ]);

  // -- The batter position (home plate) --
  const batterPos = vec2(width() * 0.78, height() * 0.32);
  add([
    rect(40, 40),
    pos(batterPos.sub(20, 20)),
    color(240, 240, 240),
    z(-1),
    "homeplate",
  ]);

  // -- The other friends scattered around the park --
  // Annie has a real sprite; the other 7 are coloured placeholders for now.
  const friends = [];

  // Annie — real sprite
  friends.push(add([
    sprite("annie"),
    pos(width() * 0.25, height() * 0.45),
    scale(0.18),
    anchor("center"),
    area({ scale: 0.5 }),
    "friend",
    { name: "Annie" },
  ]));

  // Placeholder friends — colour + label per character
  const placeholders = [
    { name: "Lucy",  c: [180, 110, 200], x: 0.15, y: 0.28 },
    { name: "Cal",   c: [90, 130, 220],  x: 0.42, y: 0.20 },
    { name: "Josh",  c: [130, 90, 60],   x: 0.55, y: 0.72 },
    { name: "Sam",   c: [230, 130, 70],  x: 0.32, y: 0.78 },
    { name: "Ana",   c: [210, 60, 60],   x: 0.65, y: 0.50 },
    { name: "Jess",  c: [110, 200, 110], x: 0.20, y: 0.62 },
    { name: "Adam",  c: [70, 70, 80],    x: 0.45, y: 0.55 },
    { name: "Ethan", c: [220, 220, 220], x: 0.85, y: 0.70 },
  ];

  // The batter (one of the friends, standing at home plate)
  friends.push(add([
    rect(40, 60),
    pos(batterPos.sub(20, 30)),
    color(160, 90, 50),
    anchor("topleft"),
    area(),
    "friend",
    "batter",
    { name: "Batter" },
  ]));

  // Bat — a brown bar next to the batter
  add([
    rect(36, 6),
    pos(batterPos.add(18, -8)),
    color(120, 70, 30),
    rotate(-20),
    "bat",
  ]);

  for (const p of placeholders) {
    friends.push(add([
      rect(28, 44),
      pos(width() * p.x, height() * p.y),
      color(p.c),
      anchor("center"),
      area(),
      "friend",
      { name: p.name },
    ]));
  }

  // Tiny label above each friend so Ollie can see who's who while testing
  for (const f of friends) {
    f.add([
      text(f.name, { size: 10 }),
      pos(0, -28),
      anchor("center"),
      color(20, 20, 20),
    ]);
  }

  // -- The player (Ollie) --
  const player = add([
    sprite("ollie"),
    pos(center()),
    scale(0.18),
    anchor("center"),
    area({ scale: 0.5 }),
    "player",
  ]);

  // -- Instruction banner --
  const instruction = add([
    text("Hold mouse / tap and hold to throw the ball at the batter", { size: 18, width: width() - 40, align: "center" }),
    pos(width() / 2, 30),
    anchor("center"),
    color(255, 255, 255),
    outline(3, rgb(0, 0, 0)),
    "instruction",
  ]);

  // ===== PHASE STATE =====
  // play -> oi -> cracks -> fade -> end
  let phase = "play";
  let hitsLanded = 0;
  const HITS_TO_TRIGGER = 1;

  // ----- DESKTOP CONTROLS (WASD / arrows) -----
  onUpdate(() => {
    if (phase !== "play") return;
    const dir = vec2(0, 0);
    if (isKeyDown("a") || isKeyDown("left"))  dir.x -= 1;
    if (isKeyDown("d") || isKeyDown("right")) dir.x += 1;
    if (isKeyDown("w") || isKeyDown("up"))    dir.y -= 1;
    if (isKeyDown("s") || isKeyDown("down"))  dir.y += 1;
    if (dir.x !== 0 || dir.y !== 0) {
      player.move(dir.unit().scale(PLAYER_SPEED));
      // Flip the sprite so it faces the way it's walking horizontally
      if (dir.x !== 0) player.flipX = dir.x < 0;
    }
    // Clamp inside the screen
    player.pos.x = Math.max(20, Math.min(width()  - 20, player.pos.x));
    player.pos.y = Math.max(40, Math.min(height() - 20, player.pos.y));
  });

  // ----- AIM + FIRE -----
  let aimFrom = null;
  let firing = false;
  let lastFiredAt = 0;
  const FIRE_COOLDOWN = 0.35;

  function fireBallTowards(target) {
    if (phase !== "play") return;
    const now = time();
    if (now - lastFiredAt < FIRE_COOLDOWN) return;
    lastFiredAt = now;

    const dir = target.sub(player.pos).unit();
    add([
      circle(6),
      pos(player.pos.add(dir.scale(20))),
      color(255, 255, 255),
      outline(2, rgb(40, 40, 40)),
      area(),
      move(dir, BALL_SPEED),
      offscreen({ destroy: true }),
      "ball",
    ]);
  }

  // Desktop: hold mouse to fire
  onMouseDown(() => { if (!isTouch) firing = true; });
  onMouseRelease(() => { firing = false; });
  onUpdate(() => {
    if (firing && phase === "play") fireBallTowards(mousePos());
  });

  // Mobile: tap and hold (anywhere) to aim and fire toward the touch point
  if (isTouch) {
    onTouchStart((tpos) => { aimFrom = tpos; firing = true; });
    onTouchMove((tpos)  => { aimFrom = tpos; });
    onTouchEnd(()       => { firing = false; aimFrom = null; });
    onUpdate(() => {
      if (firing && aimFrom && phase === "play") fireBallTowards(aimFrom);
    });
  }

  // ----- BATTER HIT DETECTION -----
  onCollide("ball", "batter", (ball, batter) => {
    destroy(ball);

    // Batter swings — quick bat tween via shake
    shake(2);
    hitsLanded += 1;

    if (hitsLanded >= HITS_TO_TRIGGER && phase === "play") {
      triggerOiMoment();
    }
  });

  // ----- PHASE: "Oi!" MOMENT -----
  function triggerOiMoment() {
    phase = "oi";
    instruction.text = "";

    // The hit ball flying off-screen to the right
    add([
      circle(6),
      pos(batterPos.x, batterPos.y),
      color(255, 255, 255),
      outline(2, rgb(40, 40, 40)),
      move(vec2(1, -0.2).unit(), BALL_SPEED * 1.4),
      offscreen({ destroy: true }),
    ]);

    wait(0.6, () => {
      // "Oi!" text from off-screen direction
      add([
        text("Oi!", { size: 48 }),
        pos(width() - 60, batterPos.y - 60),
        anchor("right"),
        color(255, 240, 80),
        outline(4, rgb(0, 0, 0)),
        opacity(1),
        lifespan(1.6, { fade: 0.4 }),
      ]);
      wait(1.8, triggerCracks);
    });
  }

  // ----- PHASE: CRACKS APPEAR -----
  function triggerCracks() {
    phase = "cracks";

    // Spawn dark crack shapes growing on the ground
    const crackPositions = friends.map(f => f.pos.clone());
    crackPositions.push(player.pos.clone());

    for (const cp of crackPositions) {
      const crack = add([
        rect(2, 2),
        pos(cp),
        color(20, 15, 25),
        anchor("center"),
        rotate(rand(0, 360)),
        z(-2),
      ]);
      // Grow the crack
      tween(2, 80, 0.9, (v) => { crack.width = v; }, easings.easeOutQuad);
      tween(2, 18, 0.9, (v) => { crack.height = v; }, easings.easeOutQuad);
    }

    // After cracks open, friends fall in one by one
    wait(1.0, () => {
      friends.forEach((f, i) => {
        wait(i * 0.18, () => {
          tween(f.scale.x, 0,    0.5, (v) => f.scale = vec2(v, v),                easings.easeInQuad);
          tween(f.pos.y,   f.pos.y + 30, 0.5, (v) => f.pos.y = v,                  easings.easeInQuad);
          wait(0.55, () => destroy(f));
        });
      });

      // Then the player falls in last
      wait(friends.length * 0.18 + 0.4, () => {
        tween(player.scale.x, 0,    0.6, (v) => player.scale = vec2(v, v),         easings.easeInQuad);
        tween(player.pos.y,   player.pos.y + 30, 0.6, (v) => player.pos.y = v,    easings.easeInQuad);
        wait(0.7, triggerFadeToChapterOne);
      });
    });
  }

  // ----- PHASE: FADE TO BLACK + CHAPTER 1 CARD -----
  function triggerFadeToChapterOne() {
    phase = "fade";

    const veil = add([
      rect(width(), height()),
      pos(0, 0),
      color(0, 0, 0),
      opacity(0),
      z(100),
      fixed(),
    ]);
    tween(0, 1, 1.0, (v) => veil.opacity = v, easings.linear);

    wait(1.2, () => {
      add([
        text("CHAPTER 1", { size: 28 }),
        pos(40, 40),
        color(255, 255, 255),
        z(101),
        fixed(),
        opacity(0),
        "chapcard",
      ]);
      // Fade in the chapter card
      const card = get("chapcard")[0];
      tween(0, 1, 0.5, (v) => card.opacity = v, easings.linear);

      wait(2.0, () => {
        add([
          text("End of the vertical slice.\nChapter 1 coming next.\n\n(tap / click to replay)", {
            size: 22, width: width() - 80, align: "center",
          }),
          pos(width() / 2, height() / 2),
          anchor("center"),
          color(255, 255, 255),
          z(101),
          fixed(),
        ]);
        phase = "end";
      });
    });
  }

  // ----- REPLAY -----
  onClick(() => { if (phase === "end") go("park"); });
  if (isTouch) onTouchEnd(() => { if (phase === "end") go("park"); });
});

go("park");
