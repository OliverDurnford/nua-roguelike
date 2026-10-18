// ============================================================
// TITLE: the first thing the friends see.
//
// The camera pushes in through a first year bedroom and lands on
// a record sleeve on the carpet. The album cover is baked into
// the video, so it is in the room from the very first frame
// rather than appearing later. Then, on three beats: the top of
// the title whips in from the right, "10 YEARS" from the left,
// and the ten of them come up off the bottom of the sleeve one
// after another in a wave that fills the third drop.
//
// The room is a <video> behind a transparent canvas (see
// core/titlevideo.js). Everything below is drawn on top of it.
//
// EVERY TIME IN HERE IS THE VIDEO'S OWN CLOCK, in seconds, so it
// matches what you see scrubbing the clip in Resolve. The song
// runs 148ms ahead of that (MUSIC_LEAD), which is measured, not
// guessed: see tools/titlesequence/build_title_assets.py.
// ============================================================

const TSEQ = {
  // ---- the beat map. Ollie's marks, off the timeline. Each is a LANDING. ----
  PARK: 5.500,        // the camera stops moving, and the song has faded up to full
  TOP_AT: 6.458,      // 01:00:06:11 - "NOW THAT'S WHAT I CALL" lands, from the right
  BOTTOM_AT: 6.958,   // 01:00:06:23 - "10 YEARS" lands, from the left, one beat later
  WAVE_FROM: 7.458,   // 01:00:07:11 - the third drop begins; the first of the ten starts to rise
  WAVE_TO: 7.833,     // 01:00:07:20 - the last of the ten lands, a sixteenth ahead of the band
                      // coming in at 07:23. Landing ON it sounded like an overshoot (Ollie, 4 Sep)
  END: 8.000,         // last frame; the video holds here for good

  SLIDE: 0.16,        // how long each title piece takes to whip in, ending on its beat
  WAVE_RISE: 0.16,    // how long each of the ten takes to come up. The gap between them
                      // is whatever fits the rest of the ten into WAVE_FROM..WAVE_TO

  MUSIC_LEAD: 0.148,  // how far ahead of the video the game's m4a sits

  // The sleeve's flat face on the parked framing, in the game's 960x540.
  // Measured off the video, not eyeballed. Re-run the build script if the
  // take ever changes and it will print this line again.
  SLEEVE: { x: 241.5, y: 44.5, w: 478, h: 450 },

  // Everything on the cover is a fraction of the sleeve, so the layout
  // survives the sleeve rect being re-measured.
  TITLE_W: 0.72,      // title width, as a fraction of the sleeve
  TITLE_TOP: 0.04,    // its resting top edge, down from the sleeve's top
  CAST_H: 0.25,       // how tall the middle of the ten stands
  CAST_FEET: 0.925,   // where their feet land
  CAST_STEP: 0.097,   // how far apart they stand
  FADE_TOP: 0.52,     // where the cover starts darkening under them

  // Where the sunburst's rays meet on the cover, as fractions of the sleeve.
  // The moving light on the cover radiates from here.
  RAY_X: 0.50,
  RAY_Y: 0.33,
};

scene("title", () => {
  SPEECH.endArea();   // no room loaded: nothing to test a line against
  G.paused = false;
  // quitting during a collection or special screen, or the fall into a
  // crack, left these up: the next game had no PAUSE chip and no trophy pop-ups
  G.cutscene = false;
  if (typeof CUTIN !== "undefined") CUTIN.active = false;
  G.run = null;
  G.areaScale = 1;

  const saved = SAVE.read();
  const SL = TSEQ.SLEEVE;
  const video = TITLEVIDEO.mount();

  // Replays are for people who have already sat through it once. Coming back
  // to the title from a finished run lands straight on the parked framing with
  // everything already up.
  const replay = TITLEVIDEO.seen;
  let phase = replay ? "ready" : "armed";     // armed -> running -> ready
  let clock = replay ? TSEQ.END : 0;          // video time, seconds

  if (replay) TITLEVIDEO.toEnd(TSEQ.END);
  // an iPhone plays the song from memory, so the beat is exact (core/soundtrack.js)
  else SOUNDTRACK.prepare("dare-8-bit");

  // ---------- the cover ----------
  // The title and the ten are children of an invisible sleeve-shaped card, so
  // they are clipped to the sleeve and genuinely arrive from behind its edges
  // rather than sliding across the carpet.
  const card = add([
    pos(SL.x, SL.y),
    rect(SL.w, SL.h),
    opacity(0.001),
    mask("intersect"),
    z(10),
  ]);

  // The title in its two pieces. Both are the full title width, so they share
  // one x and stack exactly as the artwork was drawn.
  const titleW = SL.w * TSEQ.TITLE_W;
  const titleK = titleW / REAL_TITLE.w;
  const titleRest = SL.h * TSEQ.TITLE_TOP;
  const topH = REAL_TITLE.top.h * titleK;
  const titleTop = card.add([
    sprite("title-top"), pos(SL.w * 1.6, titleRest), anchor("top"),
    scale(titleK), opacity(0), z(2),
  ]);
  const titleBottom = card.add([
    sprite("title-bottom"), pos(-SL.w * 0.6, titleRest + topH), anchor("top"),
    scale(titleK), opacity(0), z(2),
  ]);

  // The bottom of the cover darkens under the ten. The sunburst is bright and
  // busy right where they have to read, and a compilation cover would do
  // exactly this anyway.
  const fadeTop = SL.h * TSEQ.FADE_TOP;
  const castFade = card.add([
    sprite("grad-fade"),
    pos(0, fadeTop),
    scale(SL.w / 8, (SL.h - fadeTop) / 256),
    opacity(0),
    z(0),
  ]);

  // The ten of them across the bottom of the cover, whoever is nearest the
  // middle standing in front, the way a group arranges itself for a photo.
  const ORDER = ["cal", "ollie", "sam", "ethan", "adam", "josh", "lucy", "annie", "ana", "jess"];
  const castH = SL.h * TSEQ.CAST_H;
  const feet = SL.h * TSEQ.CAST_FEET;
  // charComps centres a character on its pos either way (a still sprite on the
  // image, an animated one on the body), so a standing figure's feet are half
  // its height below pos.
  // The wave runs left to right and fills the third drop exactly: the first
  // starts moving on WAVE_FROM, the last lands on WAVE_TO, the rest are spaced
  // evenly between.
  const waveStep = (TSEQ.WAVE_TO - TSEQ.WAVE_FROM - TSEQ.WAVE_RISE) / (ORDER.length - 1);
  const cast = ORDER.map((id, i) => {
    const off = i - (ORDER.length - 1) / 2;
    const front = 1 - Math.abs(off) / ((ORDER.length - 1) / 2);   // 1 in the middle, 0 at the ends
    const h = castH * (0.9 + 0.1 * front);
    return card.add([
      ...ART.charComps(id, h),
      pos(SL.w * (0.5 + off * TSEQ.CAST_STEP), feet),
      opacity(0),
      z(1 + 0.9 * front),                                          // stays under the title at z 2
      { restY: feet - h * 0.5, bob: i * 0.61, step: i, at: TSEQ.WAVE_FROM + TSEQ.WAVE_RISE + i * waveStep, up: false },
    ]);
  });
  const riseBy = castH * 1.25;                  // start fully below the sleeve's bottom edge
  const waveDone = TSEQ.WAVE_TO;

  // ---------- life on the cover ----------
  // Three things the artwork already has, set moving, so the cover is never
  // quite still once we have arrived on it: the sunburst breathing where its
  // rays meet, the pixel stars twinkling, and streaks of light running out
  // along the rays. All of it sits under the title and the ten, clipped to
  // the sleeve, and comes up together once the camera has parked.
  const RAY = vec2(SL.w * TSEQ.RAY_X, SL.h * TSEQ.RAY_Y);
  let lifeK = 0;                                // 0 until the park, then up to 1

  const glow = card.add([
    sprite("glow"), pos(RAY), anchor("center"), scale(5.4),
    color(255, 214, 120), opacity(0), z(0.4),
  ]);
  glow.onUpdate(() => {
    glow.opacity = lifeK * (0.24 + Math.sin(time() * 1.1) * 0.10);
    glow.scale = vec2(5.4 + Math.sin(time() * 1.1) * 0.4);
  });

  // light sweeping through the sunburst: two wheels of soft wedges turning
  // slowly against each other over the painted rays, so the rays seem to
  // shimmer without anything on the cover actually being redrawn
  for (const [dir, op, sc] of [[1, 0.13, 3.9], [-1, 0.09, 3.2]]) {
    const wheel = card.add([
      sprite("raywheel"), pos(RAY), anchor("center"), scale(sc), rotate(rand(0, 360)),
      color(255, 232, 170), opacity(0), z(0.42),
    ]);
    wheel.onUpdate(() => {
      wheel.angle += dir * 5 * dt();
      wheel.opacity = lifeK * op;
    });
  }

  // the stars: a plus each, in the cover's own colours, twinkling out of step
  // with one another and quietly moving house whenever one has faded right out
  const STAR_COLOURS = [[255, 255, 255], [255, 255, 255], [255, 240, 180], [255, 226, 120],
                        [120, 220, 205], [255, 150, 200]];
  const starHome = () => vec2(rand(SL.w * 0.04, SL.w * 0.96), rand(SL.h * 0.04, SL.h * 0.96));
  for (let i = 0; i < 28; i++) {
    const col = STAR_COLOURS[i % STAR_COLOURS.length];
    const st = card.add([
      sprite("pixstar"), pos(starHome()), anchor("center"), scale(1),
      color(col[0], col[1], col[2]), opacity(0), z(0.5),
      { phase: rand(0, 6.28), speed: rand(1.6, 3.8), size: rand(1.0, 2.0), low: false },
    ]);
    st.onUpdate(() => {
      const k = 0.5 + 0.5 * Math.sin(time() * st.speed + st.phase);   // 0..1
      st.opacity = lifeK * (0.2 + 0.8 * k * k);
      st.scale = vec2(st.size * (0.5 + 0.5 * k));
      if (k < 0.03 && !st.low) { st.low = true; if (rand() < 0.5) st.pos = starHome(); }
      if (k > 0.5) st.low = false;
    });
  }

  // the streaks: short bright dashes born near the centre, flying outward
  // along a ray and fading as they go, the way the cover's own streaks look
  // like they were caught mid-flight
  let streakT = 0;
  const spawnStreak = () => {
    const a = rand(-175, -5) * Math.PI / 180;      // the upper fan; the floor is dark
    const speed = rand(180, 380);
    const len = rand(18, 46);
    const gold = rand() < 0.6;
    const sk = card.add([
      rect(len, 2), pos(RAY.add(vec2(Math.cos(a), Math.sin(a)).scale(rand(30, 70)))),
      anchor("left"), rotate(a * 180 / Math.PI),
      color(gold ? 255 : 240, gold ? 228 : 244, gold ? 150 : 255),
      opacity(0), z(0.45),
      { a, speed, t: 0, life: rand(0.5, 0.9) },
    ]);
    sk.onUpdate(() => {
      sk.t += dt();
      const k = sk.t / sk.life;
      if (k >= 1) { destroy(sk); return; }
      sk.pos = sk.pos.add(vec2(Math.cos(sk.a), Math.sin(sk.a)).scale(sk.speed * dt()));
      sk.opacity = lifeK * 0.9 * Math.sin(k * Math.PI);
    });
  };
  onUpdate(() => {
    if (lifeK <= 0) return;
    streakT += dt();
    while (streakT > 0.09) { streakT -= 0.09; spawnStreak(); }
  });

  // With a run waiting, the "start a new game" chip sits on the carpet under
  // the sleeve, on a soft fade up off the bottom of the frame that keeps it
  // legible. Without one the carpet stays clean.
  const floorFade = add([
    sprite("grad-fade"),
    pos(0, G.H - 72),
    scale(G.W / 8, 72 / 256),
    opacity(0),
    z(15),
  ]);

  // ---------- the prompt that gets us past the browser ----------
  // Nothing can make a sound until someone has pressed something, so the room
  // holds on its first frame until they do. Starting the song and the video in
  // the same gesture is also the only way the two are guaranteed to be locked.
  const promptY = G.H - 26;
  const touch = isTouchscreen();
  // Until the video is in memory (TITLEVIDEO.preload) it says so, and a tap
  // does nothing: off WiFi the song used to start over a still room.
  const startWord = touch ? "tap to start" : "press any key";
  // With a save word, the first pull from the cloud (core/cloud.js) gets up
  // to CLOUD.SETTLE_MS to land first, so CARRY ON offers the newest run.
  const cloudWait = () => typeof CLOUD !== "undefined" && !CLOUD.settled();
  const cloudBusy = () => typeof CLOUDUI !== "undefined" && CLOUDUI.busy();
  const waitWord = () => (!TITLEVIDEO.ready ? "loading..." : cloudWait() ? "syncing..." : startWord);
  const prompt = UI.chipObj(waitWord(), G.W / 2, promptY, { opacity: 0, z: 20, fixed: false });
  if (!replay) {
    let said = waitWord() === startWord;
    prompt.onUpdate(() => {
      if (phase !== "armed") return;
      if (!said && prompt.label !== waitWord()) { prompt.set(waitWord()); said = prompt.label === startWord; }
      prompt.opacity = said ? 0.7 + Math.sin(time() * 3.2) * 0.3 : 0.45;
    });
  }

  // ---------- press start / carry on ----------
  // Same deal as before the sequence existed: with a run waiting, the big
  // prompt carries it on and a quieter chip underneath sets it aside.
  //
  // It sits ON the cover, in the band between the title and the ten, in
  // white pixel type rather than gold: the cover is already yellow, and gold
  // on it disappeared (Ollie, 4 Sep). The kit's hard ink shadow one pixel-art
  // step behind it keeps it legible over the sunburst.
  // With a run waiting the big line is CARRY ON, with who and where in
  // small type underneath: the full sentence at the kit's 16px is wider
  // than the sleeve.
  const startLabel = saved ? "CARRY ON" : "PRESS START";
  const startSub = saved
    ? ("as " + G.char(saved.run.charId).name +
      (saved.scene === "tutorial" ? " · victoria park" : " · chapter " + saved.run.chapter)).toUpperCase()
    : null;
  const titleFoot = titleRest + (REAL_TITLE.top.h + REAL_TITLE.bottom.h) * titleK;
  const castTop = feet - castH;                       // the middle pair are the tallest
  const startY = (titleFoot + castTop) / 2;
  // each line is a white pixel label over its own ink shadow
  const stamp = (str, size, y) => [
    card.add([text(str, { size, font: UI.PX }), pos(SL.w / 2 + 2, y + 2), anchor("center"),
      color(UI.INK[0], UI.INK[1], UI.INK[2]), opacity(0), z(3)]),
    card.add([text(str, { size, font: UI.PX }), pos(SL.w / 2, y), anchor("center"),
      color(255, 255, 255), opacity(0), z(3.1)]),
  ];
  const startPieces = stamp(startLabel, 16, startSub ? startY - 6 : startY);
  if (startSub) startPieces.push(...stamp(startSub, 8, startY + 14));
  const startText = startPieces[1];
  startText.onUpdate(() => {
    if (phase !== "ready") return;
    const k = 0.8 + Math.sin(time() * 3.4) * 0.2;
    startPieces.forEach((pc, i) => { pc.opacity = i % 2 === 0 ? k * 0.85 : k; });
  });

  // ---------- admin ----------
  // Ollie's testing controls (core/admin.js): a quiet chip bottom left, up
  // with the cover. A PIN turns admin on; tapped again it turns it off.
  const adminChip = UI.chipObj(ADMIN.on ? "admin on" : "admin", 62, G.H - 18,
    { opacity: 0, z: 20, fixed: false, area: true });
  const adminTap = () => {
    if (ADMIN.on) {
      ADMIN.set(false);
      adminChip.set("admin");
      UI.toast("admin off");
      SFX.play("uitick");
      return;
    }
    ADMIN.pinPad(() => {
      ADMIN.set(true);
      adminChip.set("admin on");
      UI.toast("admin on: arrows beside PAUSE skip rooms");
    });
  };

  // ---------- trophies ----------
  // The cabinet (scenes/trophies.js): a chip bottom right, mirroring admin.
  // It says "platinum!" until a new platinum has been opened.
  const trophyLabel = TROPHIES.platinumNew() ? "platinum!" : touch ? "trophies" : "t · trophies";
  const trophyChip = UI.chipObj(trophyLabel, G.W - 70, G.H - 18,
    { opacity: 0, z: 20, fixed: false, area: true });

  // ---------- the save word ----------
  // The cloud save (core/cloudui.js): a chip just left of the trophies, only
  // when the cloud is on. A device with nothing on it yet asks
  // "played before?", so someone opening the game on a new iPad finds the
  // way in.
  const cloudLabel = typeof CLOUDUI !== "undefined" ? CLOUDUI.chipLabel() : null;
  const cloudChip = cloudLabel ? UI.chipObj(cloudLabel, G.W / 2, G.H - 18, { opacity: 0, z: 20, fixed: false, area: true }) : null;
  if (cloudChip) cloudChip.onUpdate(() => { cloudChip.pos.x = G.W - 70 - trophyChip.w / 2 - 12 - cloudChip.w / 2; });
  const cloudTap = () => CLOUDUI.open("title", () => {
    const l = CLOUDUI.chipLabel();
    if (l) cloudChip.set(l);
  });
  // A pull that brings a different run in while the title is up re-enters
  // it, so CARRY ON offers that run; never mid-sequence or under the panel.
  // A platinum completed by joining two devices puts "platinum!" on its chip.
  let refresh = false;
  if (typeof CLOUD !== "undefined") {
    CLOUD.onApplied = (changedRun) => {
      if (changedRun || (TROPHIES.platinumNew() && trophyLabel !== "platinum!")) refresh = true;
    };
    // a difficulty that arrived mid-run, and why a run that moved on elsewhere
    // brought the player back here (core/cloud.js)
    CLOUD.catchUp();
    // held longer than a toast and above the prompt: the room may be waiting
    // for its first tap while the friend works out what happened
    if (CLOUD.notice) {
      const note = UI.chipObj(CLOUD.notice, G.W / 2, G.H - 72,
        { opacity: 0, z: 190, fill: UI.STEEL, shade: UI.BLUE, padY: 5, fixed: false });
      UI.fadeObj(note, 1, 0.3);
      wait(6, () => UI.fadeObj(note, 0, 0.5));
      CLOUD.notice = null;
    }
  }
  onSceneLeave(() => { if (typeof CLOUD !== "undefined") CLOUD.onApplied = null; });

  let newChip = null;
  if (saved) {
    newChip = UI.chipObj(touch ? "tap here to start a new game" : "n · start a new game", G.W / 2, G.H - 18,
      { opacity: 0, z: 20, fixed: false, area: true });
  }

  // ---------- the cues ----------
  // Everything is placed straight off the clock rather than run on its own
  // timer, so a landing frame is a beat frame whatever the frame rate is
  // doing. The two title pieces accelerate in and stop dead, no settle, no
  // bounce: the hit is the beat. The ten ease up one after another, which is
  // the gamey bit, a wave running left to right across the third drop and
  // finishing dead on the band coming in.
  const easeIn = (k) => { k = Math.min(1, Math.max(0, k)); return k * k; };
  const easeOut = (k) => { k = Math.min(1, Math.max(0, k)); return 1 - (1 - k) * (1 - k) * (1 - k); };
  const fromRight = SL.w * 1.6;                 // piece centred here is clear of the sleeve
  const fromLeft = -SL.w * 0.6;
  let topLanded = false;
  let bottomLanded = false;
  let waveLanded = false;

  // k runs 0 (still out of sight) to 1 (landed) across TSEQ.SLIDE seconds.
  const placeTop = (k, silent) => {
    titleTop.opacity = k > 0 ? 1 : 0;
    titleTop.pos.x = fromRight + (SL.w / 2 - fromRight) * easeIn(k);
    if (k >= 1 && !topLanded) {
      topLanded = true;
      if (!silent) SFX.play("thwack");
    }
  };
  const placeBottom = (k, silent) => {
    titleBottom.opacity = k > 0 ? 1 : 0;
    titleBottom.pos.x = fromLeft + (SL.w / 2 - fromLeft) * easeIn(k);
    if (k >= 1 && !bottomLanded) {
      bottomLanded = true;
      if (!silent) SFX.play("thwack");
    }
  };

  // t is the clock; each of the ten rises over WAVE_RISE to land at its own `at`.
  const placeWave = (t, silent) => {
    cast.forEach((c) => {
      const kk = easeOut((t - (c.at - TSEQ.WAVE_RISE)) / TSEQ.WAVE_RISE);
      c.opacity = kk > 0 ? 1 : 0;
      c.pos.y = c.restY + riseBy * (1 - kk);
      if (kk >= 1 && !c.up) {
        c.up = true;
        // a blip per landing, each a step higher than the last, so the ten
        // read as one rising roll into the downbeat rather than ten ticks
        if (!silent) SFX.tone({ type: "square", from: 520 + c.step * 95, dur: 0.05, vol: 0.22 });
      }
    });
    castFade.opacity = 0.78 * easeOut((t - TSEQ.WAVE_FROM) / (TSEQ.WAVE_TO - TSEQ.WAVE_FROM));
    if (t >= waveDone && !waveLanded) {
      waveLanded = true;
      // and then they breathe
      cast.forEach((c) => c.onUpdate(() => {
        c.pos.y = c.restY + Math.sin(time() * 2 + c.bob) * 2;
      }));
      if (newChip) {
        UI.fadeObj(floorFade, 0.85, 0.35, 0.15);
        UI.fadeObj(newChip, 1, 0.3, 0.55);
      }
      UI.fadeObj(adminChip, 0.45, 0.3, 0.8);
      UI.fadeObj(trophyChip, 0.85, 0.3, 0.8);
      if (cloudChip) UI.fadeObj(cloudChip, 0.85, 0.3, 0.8);
      // the whole sequence sat through, not skipped and not a replay
      if (!skipped && !replay) TROPHIES.note("title");
      phase = "ready";
    }
  };

  // Everything already up, for a replay or a skip.
  const settle = () => {
    placeTop(1, true);
    placeBottom(1, true);
    placeWave(waveDone, true);
    lifeK = 1;
  };

  // ---------- driving it ----------
  onUpdate(() => {
    TITLEVIDEO.layout();
    if (phase !== "running") return;

    // The song is the clock, because the beat is what the eye is being asked
    // to feel. If it was refused (a browser that wants more than a keypress)
    // fall back to the video so the sequence still plays out, just silent.
    const song = SOUNDTRACK.time();
    clock = song === null ? video.currentTime : song - TSEQ.MUSIC_LEAD;

    placeTop((clock - (TSEQ.TOP_AT - TSEQ.SLIDE)) / TSEQ.SLIDE);
    placeBottom((clock - (TSEQ.BOTTOM_AT - TSEQ.SLIDE)) / TSEQ.SLIDE);
    placeWave(clock);
    lifeK = Math.min(1, Math.max(lifeK, (clock - TSEQ.PARK) / 0.8));

    // The song fades up with the push-in and is at full as the camera lands
    // on the record (Ollie, 7 Oct). Squared, so the rise sounds even rather
    // than loud early and flat after. Off the song's own clock, like the rest.
    if (song !== null && !skipped) SOUNDTRACK.level(Math.pow(Math.min(1, clock / TSEQ.PARK), 2));
  });

  const begin = () => {
    phase = "running";
    prompt.opacity = 0;
    TITLEVIDEO.seen = true;
    SFX.ctx();   // wakes the sound effects inside the same tap
    SOUNDTRACK.playById("dare-8-bit", TSEQ.MUSIC_LEAD, null);
    video.currentTime = 0;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  // ---------- starting inside the tap ----------
  // Kaboom hands input to the scene a frame AFTER the browser's own event,
  // and by then an iPhone no longer counts it as the player's tap: it
  // refused the song and the video both, and the room stayed black (Ollie,
  // 13 Oct 2026). So the press that starts the sequence is caught straight
  // off the page, inside the browser's event, where every phone allows a
  // play(). touchend rather than touchstart, because iOS only counts the
  // finger lifting. The scene's own press() leaves "armed" alone.
  const GESTURES = ["keydown", "mousedown", "touchend"];
  const armedPress = () => {
    // a tap on the loading screen (core/loader.js) is not a tap on the title,
    // and nor is one before the video is in memory
    if (window.LOADER && !LOADER.done) return;
    if (!TITLEVIDEO.ready || cloudWait()) return;
    unhook();
    if (phase === "armed") begin();
  };
  const unhook = () => GESTURES.forEach((g) => removeEventListener(g, armedPress, true));
  if (!replay) GESTURES.forEach((g) => addEventListener(g, armedPress, true));
  onSceneLeave(unhook);

  // Skipping. Held off for a moment after the start so the same press that
  // begins the sequence cannot also skip it.
  let sinceStart = 0, skipped = false;
  onUpdate(() => { if (phase === "running") sinceStart += dt(); });
  const skip = () => {
    if (sinceStart < 0.7) return;
    skipped = true;
    SOUNDTRACK.level(1, 0.4);
    TITLEVIDEO.toEnd(TSEQ.END);
    settle();
  };

  // ---------- input ----------
  UI.sceneFade();
  let going = false;
  const launch = (fn) => {
    if (going) return;
    going = true;
    SFX.play("uiconfirm");
    TITLEVIDEO.unmount();
    fn();
  };
  // ---------- are you sure? ----------
  // A new game replaces the run waiting to be carried on. Nothing else: the
  // trophies, caps and everyone found are a separate save and stay. So with
  // a run waiting it asks first, and keeping the run is the answer already
  // picked (Ollie, 18 Oct 2026).
  const ASK = touch ? { W: 660, BW: 290, BH: 46, GAP: 16, SIZE: 32 } : { W: 540, BW: 210, BH: 28, GAP: 14, SIZE: 16 };
  const ASK_BTNS = ["keep my run", "start a new game"];
  let asking = null, askClosedAt = -1;   // asking: { sel, at } while the card is up
  const askBusy = () => !!asking || time() - askClosedAt < 0.3;
  const askLines = () => {
    const c = saved ? G.char(saved.run.charId) : null;
    const where = saved && saved.scene === "tutorial" ? "Victoria Park" : "chapter " + (saved ? saved.run.chapter : 1);
    const out = [
      "A new game ends your run" + (c ? " as " + c.name : "") + " in " + where + ".",
      "Your trophies, caps and everyone you've found stay.",
    ];
    if (typeof CLOUD !== "undefined" && CLOUD.meta().word) out.push("With a save word, your other devices start the new game too.");
    return out;
  };
  const askLayout = () => {
    const lines = askLines();
    const top = 20 + 16 + 18, h = top + lines.length * 20 + 14 + ASK.BH + 22;
    const y0 = Math.round(G.H / 2 - h / 2);
    return {
      lines, h, y0, top,
      x0: Math.round(G.W / 2 - ASK.W / 2),
      by: y0 + top + lines.length * 20 + 14,
      bx: (i) => Math.round(G.W / 2 - ASK.GAP / 2 - ASK.BW + i * (ASK.BW + ASK.GAP)),
    };
  };
  const askCard = add([fixed(), z(240), pos(0, 0)]);
  askCard.onDraw(() => {
    if (!asking) return;
    const L = askLayout();
    UI.R(0, 0, G.W, G.H, UI.INK, 0.6);
    UI.card(vec2(L.x0, L.y0), ASK.W, L.h, { drop: 4 });
    UI.label("NEW GAME?", G.W / 2, L.y0 + 20, { size: 16, anchor: "top", color: UI.TEXT, shadow: false });
    L.lines.forEach((ln, i) => UI.text(ln, G.W / 2, L.y0 + L.top + i * 20, { anchor: "top" }));
    // the cards, then the words: a layer at a time
    ASK_BTNS.forEach((b, i) => {
      const on = i === asking.sel;
      UI.card(vec2(L.bx(i), L.by), ASK.BW, ASK.BH, { fill: on ? UI.STEEL : UI.CHIP, shade: on ? UI.BLUE : null, notch: false });
    });
    ASK_BTNS.forEach((b, i) => UI.text(b, L.bx(i) + ASK.BW / 2, L.by + ASK.BH / 2 + 1, { anchor: "center", size: ASK.SIZE }));
  });
  const askOpen = () => { asking = { sel: 0, at: time() }; SFX.play("uitick"); };
  const askPick = (i) => {
    asking = null;
    askClosedAt = time();
    if (i === 1) launch(() => go("select"));
    else SFX.play("uitick");
  };
  const askAt = (m) => {
    const L = askLayout();
    return ASK_BTNS.findIndex((_, i) => m.x >= L.bx(i) && m.x <= L.bx(i) + ASK.BW && m.y >= L.by && m.y <= L.by + ASK.BH);
  };

  const press = (newGame) => {
    if (ADMIN.busy() || cloudBusy() || askBusy()) return;   // the PIN pad, a panel or the card has the keys and taps
    if (cloudWait()) return;
    if (phase === "armed") return;   // armedPress starts it, inside the browser's event
    if (phase === "running") return skip();
    if (newGame && saved) return askOpen();
    launch(() => (saved && !newGame ? SAVE.resume(saved) : go("select")));
  };

  if (replay) settle();

  onUpdate(() => {
    if (refresh && phase !== "running" && !going && !cloudBusy()) { refresh = false; go("title"); }
  });

  const openTrophies = () => launch(() => go("trophies"));
  onKeyPress((key) => {
    if (asking) {
      if (["left", "right", "up", "down", "a", "d", "w", "s", "tab"].includes(key)) { asking.sel = 1 - asking.sel; SFX.play("uitick"); }
      else if (key === "enter" || key === "space") askPick(asking.sel);
      else if (key === "escape") askPick(0);
      return;
    }
    if (cloudBusy()) return;
    if (key === "t" && phase === "ready" && !ADMIN.busy()) return openTrophies();
    press(key === "n");
  });
  // isHovering understands the letterboxed canvas, so a tap only counts as
  // "new game" when it actually lands on that chip.
  onMouseMove(() => {
    if (!asking) return;
    const i = askAt(mousePos());
    if (i >= 0 && i !== asking.sel) asking.sel = i;
  });
  onMousePress(() => {
    if (asking) {
      if (time() - asking.at < 0.15) return;   // the tap that opened it
      const i = askAt(mousePos());
      if (i >= 0) askPick(i);
      return;
    }
    if (askBusy()) return;
    if (cloudBusy()) return;
    if (phase === "ready" && !ADMIN.busy() && adminChip.opacity > 0.1 && adminChip.isHovering()) return adminTap();
    if (phase === "ready" && !ADMIN.busy() && trophyChip.opacity > 0.1 && trophyChip.isHovering()) return openTrophies();
    if (phase === "ready" && !ADMIN.busy() && cloudChip && cloudChip.opacity > 0.1 && cloudChip.isHovering()) return cloudTap();
    press(!!newChip && newChip.isHovering());
  });
});
