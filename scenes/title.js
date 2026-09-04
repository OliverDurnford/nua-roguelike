// ============================================================
// TITLE: the first thing the friends see.
//
// The camera pushes in through a first year bedroom and lands on
// a record sleeve on the carpet. The album cover is baked into
// the video, so it is in the room from the very first frame
// rather than appearing later. Then the title drops onto it and
// the ten of them come up off the bottom of the sleeve, both on
// the beat.
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
  // ---- the beat map. Ollie's marks, off the timeline. ----
  PARK: 5.500,        // the camera stops moving. Frame 132
  TITLE_AT: 6.458,    // 01:00:06:11 - the title LANDS. The hit is the beat
  CAST_AT: 6.958,     // 01:00:06:23 - the ten land, one beat later
  END: 8.000,         // last frame; the video holds here for good
  DROP: 0.14,         // how long the title takes to fall in, ending on TITLE_AT
  RISE: 0.16,         // how long the ten take to come up, ending on CAST_AT

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

  if (replay) TITLEVIDEO.toEnd(TSEQ.END);   // settled below, once the pieces exist

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

  const titleW = SL.w * TSEQ.TITLE_W;
  const titleH = titleW * REAL_TITLE_SIZE.h / REAL_TITLE_SIZE.w;
  const titleRest = SL.h * TSEQ.TITLE_TOP;
  const titleCard = card.add([
    sprite("title-card"),
    pos(SL.w / 2, titleRest - titleH - 12),
    anchor("top"),
    scale(titleW / REAL_TITLE_SIZE.w),
    opacity(0),
    z(2),
  ]);

  // The bottom of the cover darkens under them. The sunburst is bright and
  // busy right where ten people have to read, and a compilation cover would
  // do exactly this anyway.
  const fadeTop = SL.h * TSEQ.FADE_TOP;
  const castFade = card.add([
    sprite("grad-fade"),
    pos(0, fadeTop),
    scale(SL.w / 8, (SL.h - fadeTop) / 256),
    opacity(0),
    z(0),
  ]);

  // The ten of them, shoulder to shoulder across the bottom of the cover.
  // They overlap on purpose: ten people across 478 pixels is a crowd on a
  // compilation sleeve, not a line-up. Whoever is nearest the middle stands in
  // front, the way a group actually arranges itself for a photograph.
  const ORDER = ["cal", "ollie", "sam", "ethan", "adam", "josh", "lucy", "annie", "ana", "jess"];
  const castH = SL.h * TSEQ.CAST_H;
  const feet = SL.h * TSEQ.CAST_FEET;
  // charComps centres a character on its pos either way (a still sprite on the
  // image, an animated one on the body), so a standing figure's feet are half
  // its height below pos.
  const cast = ORDER.map((id, i) => {
    const off = i - (ORDER.length - 1) / 2;
    const front = 1 - Math.abs(off) / ((ORDER.length - 1) / 2);   // 1 in the middle, 0 at the ends
    const h = castH * (0.9 + 0.1 * front);
    return card.add([
      ...ART.charComps(id, h),
      pos(SL.w * (0.5 + off * TSEQ.CAST_STEP), feet),
      opacity(0),
      z(1 + 0.9 * front),                                          // stays under the title at z 2
      // lag: the ends land a frame or two after the middle, so the row
      // ripples outward from the beat rather than arriving as one slab
      { restY: feet - h * 0.5, bob: i * 0.61, lag: Math.abs(off) * 0.008 },
    ]);
  });
  const castLag = Math.max(...cast.map((c) => c.lag));

  // Nothing else goes on the cover. It is a record sleeve, so it gets to be
  // one: the prompt and the save chip sit on the carpet underneath, on a soft
  // fade up off the bottom of the frame that also keeps them legible.
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
  const startLabel = saved
    ? "carry on as " + G.char(saved.run.charId).name +
      (saved.scene === "tutorial" ? "  ·  victoria park" : "  ·  chapter " + saved.run.chapter)
    : "PRESS START";
  const startText = add([
    text(startLabel, { size: saved ? 16 : 24, letterSpacing: saved ? 0 : 5 }),
    pos(G.W / 2, saved ? G.H - 33 : G.H - 25), anchor("center"),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0), z(21),
  ]);
  startText.onUpdate(() => {
    if (phase !== "ready") return;
    startText.opacity = 0.8 + Math.sin(time() * 3.4) * 0.2;
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
  // Both arrivals are placed straight off the clock rather than run on their
  // own timers, so the landing frame is the beat frame whatever the frame rate
  // is doing. They accelerate in and stop dead: a card dropped into a sleeve,
  // not a fade, and nothing bounces afterwards. The hit is the beat.
  const easeIn = (k) => { k = Math.min(1, Math.max(0, k)); return k * k; };
  const dropFrom = titleRest - titleH - 12;     // fully above the sleeve's top edge
  const riseBy = castH * 1.25;                  // fully below its bottom edge
  let titleLanded = false;
  let castLanded = false;

  // k runs 0 (still out of sight) to 1 (landed) across TSEQ.DROP seconds.
  const placeTitle = (k, silent) => {
    titleCard.opacity = k > 0 ? 1 : 0;
    titleCard.pos.y = dropFrom + (titleRest - dropFrom) * easeIn(k);
    if (k >= 1 && !titleLanded) {
      titleLanded = true;
      if (!silent) SFX.play("thwack");
    }
  };

  // k is measured for the middle pair; the others trail by their lag.
  const castDone = 1 + castLag / TSEQ.RISE;
  const placeCast = (k, silent) => {
    cast.forEach((c) => {
      const kk = easeIn(k - c.lag / TSEQ.RISE);
      c.opacity = kk > 0 ? 1 : 0;
      c.pos.y = c.restY + riseBy * (1 - kk);
    });
    castFade.opacity = 0.78 * easeIn(k);
    if (k >= castDone && !castLanded) {
      castLanded = true;
      if (!silent) SFX.play("thwack");
      // and then they breathe
      cast.forEach((c) => c.onUpdate(() => {
        c.pos.y = c.restY + Math.sin(time() * 2 + c.bob) * 2;
      }));
      UI.fadeObj(floorFade, 0.85, 0.35, 0.15);
      if (newChip) {
        UI.fadeObj(newChip, 0.55, 0.3, 0.55);
        UI.fadeObj(newText, 0.9, 0.3, 0.55);
      }
      phase = "ready";
    }
  };

  // Everything already up, for a replay or a skip.
  const settle = () => {
    placeTitle(1, true);
    placeCast(castDone, true);
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

    placeTitle((clock - (TSEQ.TITLE_AT - TSEQ.DROP)) / TSEQ.DROP);
    placeCast((clock - (TSEQ.CAST_AT - TSEQ.RISE)) / TSEQ.RISE);
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
