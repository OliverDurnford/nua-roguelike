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
  PARK: 5.500,        // the camera stops moving
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
};

scene("title", () => {
  G.paused = false;
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
  const prompt = add([
    text("press any key", { size: 15 }),
    pos(G.W / 2, promptY), anchor("center"),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0), z(20),
  ]);
  const promptShade = add([
    rect(200, 26, { radius: 13 }), pos(G.W / 2, promptY), anchor("center"),
    color(UI.INK[0], UI.INK[1], UI.INK[2]), opacity(0), z(19),
  ]);
  if (!replay) {
    prompt.onUpdate(() => {
      if (phase !== "armed") return;
      const k = 0.55 + Math.sin(time() * 3.2) * 0.45;
      prompt.opacity = k;
      promptShade.opacity = k * 0.5;
    });
  }

  // ---------- press start / carry on ----------
  // Same deal as before the sequence existed: with a run waiting, the big
  // prompt carries it on and a quieter chip underneath sets it aside.
  //
  // It sits ON the cover, in the band between the title and the ten, in the
  // pale chrome of the lettering rather than gold: the cover is already
  // yellow, and gold on it disappeared (Ollie, 4 Sep). An ink shadow one
  // pixel-art step behind it keeps it legible over the sunburst.
  const startLabel = saved
    ? "carry on as " + G.char(saved.run.charId).name +
      (saved.scene === "tutorial" ? "  ·  victoria park" : "  ·  chapter " + saved.run.chapter)
    : "PRESS START";
  const titleFoot = titleRest + (REAL_TITLE.top.h + REAL_TITLE.bottom.h) * titleK;
  const castTop = feet - castH;                       // the middle pair are the tallest
  const startY = (titleFoot + castTop) / 2;
  const startOpts = { size: saved ? 15 : 21, letterSpacing: saved ? 0 : 4 };
  const startShadow = card.add([
    text(startLabel, startOpts), pos(SL.w / 2 + 2, startY + 2), anchor("center"),
    color(UI.INK[0], UI.INK[1], UI.INK[2]), opacity(0), z(3),
  ]);
  const startText = card.add([
    text(startLabel, startOpts), pos(SL.w / 2, startY), anchor("center"),
    color(236, 240, 255), opacity(0), z(3.1),
  ]);
  startText.onUpdate(() => {
    if (phase !== "ready") return;
    const k = 0.8 + Math.sin(time() * 3.4) * 0.2;
    startText.opacity = k;
    startShadow.opacity = k * 0.85;
  });

  let newChip = null;
  let newText = null;
  if (saved) {
    newChip = add([
      rect(170, 20, { radius: 10 }), pos(G.W / 2, G.H - 13), anchor("center"),
      color(UI.INK[0], UI.INK[1], UI.INK[2]), opacity(0), z(20), area(), "newgame",
    ]);
    newText = add([
      text("n  ·  start a new game", { size: 11 }),
      pos(G.W / 2, G.H - 13), anchor("center"),
      color(178, 186, 208), opacity(0), z(21),
    ]);
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
        UI.fadeObj(newChip, 0.55, 0.3, 0.55);
        UI.fadeObj(newText, 0.9, 0.3, 0.55);
      }
      phase = "ready";
    }
  };

  // Everything already up, for a replay or a skip.
  const settle = () => {
    placeTop(1, true);
    placeBottom(1, true);
    placeWave(waveDone, true);
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
  });

  const begin = () => {
    phase = "running";
    prompt.opacity = 0;
    promptShade.opacity = 0;
    TITLEVIDEO.seen = true;
    SOUNDTRACK.playById("dare-8-bit", TSEQ.MUSIC_LEAD);
    video.currentTime = 0;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  // Skipping. Held off for a moment after the start so the same press that
  // begins the sequence cannot also skip it.
  let sinceStart = 0;
  onUpdate(() => { if (phase === "running") sinceStart += dt(); });
  const skip = () => {
    if (sinceStart < 0.7) return;
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
  const press = (newGame) => {
    if (phase === "armed") return begin();
    if (phase === "running") return skip();
    launch(() => (saved && !newGame ? SAVE.resume(saved) : go("select")));
  };

  if (replay) settle();

  onKeyPress((key) => press(key === "n"));
  // isHovering understands the letterboxed canvas, so a tap only counts as
  // "new game" when it actually lands on that chip.
  onMousePress(() => press(!!newChip && newChip.isHovering()));
});
