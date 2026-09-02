// ============================================================
// SOUNDTRACK - the real songs, streamed from music/.
//
// Deliberately NOT routed through the Web Audio graph that
// sfx.js uses. Two traps this avoids:
//   - Kaboom's loadSound() fetches, and fetch is blocked from a
//     file:// page, so double-clicking index.html would break.
//   - Web Audio's createMediaElementSource() taints against an
//     opaque file:// origin and plays silence.
// A plain audio element with .volume set directly survives both,
// and streams instead of decoding a whole 2MB track up front.
//
// One element, reused. Track changes dip the volume down, swap
// the source and bring it back up.
// ============================================================

const SOUNDTRACK = {};

SOUNDTRACK.volume = 0.42;    // sits under the sound effects
SOUNDTRACK.FADE = 0.7;       // seconds, volume ramp on change
SOUNDTRACK.REVEAL_AT = 10;   // seconds before the HUD reveals the title

SOUNDTRACK.current = null;   // the track actually audible right now
SOUNDTRACK.token = 0;        // bumps on every track change; the HUD watches it

// The record's reveal-timer state lives here, not on the per-scene hud
// object in core/ui.js, because this object survives scene changes and
// that one does not. Task 7's HUD rebuilds a fresh hud object on every
// area, so if the timer lived there, a track that legitimately CONTINUES
// across an area boundary (play() correctly no-ops when asked to start
// the track already playing) would still see its brand-new hud reset the
// clock to zero and slide the record back in showing "???" for a song
// that has been playing for minutes. Keying the reset off SOUNDTRACK.token
// instead of the hud object's own lifetime fixes that: the token only
// changes when the track genuinely changes.
SOUNDTRACK.hudT = 0;         // seconds since the record's reveal timer last reset
SOUNDTRACK.hudToken = -1;    // last SOUNDTRACK.token the HUD has accounted for

// _requested is set the instant play() is called, before any fade runs.
// current only catches up once that fade finishes and the new source is
// actually sounding, up to a second later. Keep both: if the guard below
// compared against current alone, calling play(A) while a fade from A to
// B was still in flight would see current still reading "A" and wrongly
// treat itself as a no-op, letting the in-flight switch to B win even
// though A was asked for more recently. Comparing against _requested
// always reflects the most recent ask. Task 7's HUD reads current (and
// token) on purpose: it must only ever see a track once it is truly
// playing, never one still queued up behind a fade. Do not collapse
// this back into one field.
SOUNDTRACK._requested = null;

SOUNDTRACK._el = null;
SOUNDTRACK._fade = null;
SOUNDTRACK._retryWired = false;   // true while a one-shot retry pair is attached

SOUNDTRACK._audio = () => {
  if (!SOUNDTRACK._el) {
    const a = new Audio();
    a.loop = true;           // a quiet area can outlast a three minute song
    a.preload = "none";
    a.volume = 0;
    SOUNDTRACK._el = a;
  }
  return SOUNDTRACK._el;
};

// Ramp the element's volume. setInterval is fine here: nothing about a
// volume fade needs sample accuracy.
SOUNDTRACK._rampTo = (target, secs, done) => {
  const a = SOUNDTRACK._audio();
  if (SOUNDTRACK._fade) clearInterval(SOUNDTRACK._fade);
  const dur = Math.max(1, (secs === undefined ? SOUNDTRACK.FADE : secs) * 1000);
  const from = a.volume;
  const step = 40;
  let t = 0;
  SOUNDTRACK._fade = setInterval(() => {
    t += step;
    const k = Math.min(1, t / dur);
    a.volume = Math.max(0, Math.min(1, from + (target - from) * k));
    if (k >= 1) {
      clearInterval(SOUNDTRACK._fade);
      SOUNDTRACK._fade = null;
      if (done) done();
    }
  }, step);
};

SOUNDTRACK.syncMute = () => {
  const a = SOUNDTRACK._el;
  if (a) a.muted = (typeof SFX !== "undefined" && SFX.muted);
};

// `at` seeks the track before it starts, in seconds. The title sequence needs
// it: the video was cut against an export whose audio sits 148ms behind this
// m4a, so starting the song 148ms in is what puts the beat under the picture.
SOUNDTRACK.play = (track, at = 0) => {
  if (!track) return;
  // Checks _requested, not current: see the note by _requested's
  // declaration above for why. This is what stops a second play() call
  // for a track that is mid-fade-out from being swallowed as a false
  // no-op while the wrong track finishes taking over.
  if (SOUNDTRACK._requested && SOUNDTRACK._requested.id === track.id) return;
  SOUNDTRACK._requested = track;
  const a = SOUNDTRACK._audio();

  const start = () => {
    SOUNDTRACK.current = track;
    SOUNDTRACK.token++;
    a.src = "music/" + track.file;
    // Seeking before the source has any metadata throws, so wait for it.
    const seek = () => { try { a.currentTime = at; } catch (e) {} };
    if (at && a.readyState < 1) a.addEventListener("loadedmetadata", seek, { once: true });
    else seek();
    SOUNDTRACK.syncMute();
    a.volume = 0;
    // Browsers refuse audio before the first interaction, which is
    // exactly the state of a fresh page load: go("title") calls playById
    // before the player has clicked or pressed anything, so this rejects.
    // A rejected promise here must not throw, but swallowing it silently
    // (the old behaviour) left the title screen mute forever with nothing
    // to retry it. Instead, wait for the first interaction and try again.
    const p = a.play();
    if (p && p.catch) {
      p.catch(() => {
        // Guard so a second, still-blocked play() call (e.g. entering an
        // area before the player has interacted at all) does not attach
        // a second pair of listeners on top of this one.
        if (SOUNDTRACK._retryWired) return;
        SOUNDTRACK._retryWired = true;
        // One shared handler for both event types: whichever fires first
        // removes both listeners (itself included), so they cannot stack
        // up, then retries. A retry that fails again just no-ops, same as
        // above, rather than re-arming - by then a gesture has already
        // happened, so a further rejection would not be this timing issue.
        const retry = () => {
          window.removeEventListener("pointerdown", retry);
          window.removeEventListener("keydown", retry);
          SOUNDTRACK._retryWired = false;
          a.play().catch(() => {});
        };
        window.addEventListener("pointerdown", retry);
        window.addEventListener("keydown", retry);
      });
    }
    SOUNDTRACK._rampTo(SOUNDTRACK.volume);
  };

  if (SOUNDTRACK.current) SOUNDTRACK._rampTo(0, 0.35, start);
  else start();
};

SOUNDTRACK.stop = () => {
  if (!SOUNDTRACK._el) return;
  // Cleared synchronously here, not inside the fade callback below: a
  // play() landing while this fade-out is still running must see nothing
  // requested and take over cleanly, rather than reading the just-stopped
  // track as still "requested" and wrongly no-opping once this fade
  // finishes and pauses it.
  SOUNDTRACK._requested = null;
  SOUNDTRACK._rampTo(0, 0.4, () => {
    SOUNDTRACK._el.pause();
    SOUNDTRACK.current = null;
  });
};

// Where an area sits in the run, counting from 0. Used to deal songs out
// in order rather than picking each one independently. Reads CHAPTERS at
// call time, not load time, because data/chapters.js loads after this file.
SOUNDTRACK._ordinal = (chapter, areaNum) => {
  let n = 0;
  if (typeof CHAPTERS !== "undefined" && CHAPTERS.length) {
    for (let c = 0; c < chapter - 1 && c < CHAPTERS.length; c++) {
      n += (CHAPTERS[c].areas || []).length;
    }
  } else {
    n = (chapter - 1) * 5;
  }
  return n + (areaNum - 1);
};

// Shuffle a pool into a fixed order. Same seed every run, so replaying an
// area always hears the same song. Change the seed to reshuffle the album.
SOUNDTRACK._dealt = (pool) => {
  const arr = pool.slice();
  let s = 0x9e3779b9;
  for (let i = arr.length - 1; i > 0; i--) {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s |= 0;   // xorshift32
    const j = Math.abs(s) % (i + 1);
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
};

// Which song plays in a given room. An explicit area key always wins;
// otherwise deal from the mood pool.
//
// Songs are DEALT like a deck, not hashed per area. Hashing each area
// independently collides by the birthday paradox: 23 areas drawing from
// 32 tracks landed on only 14 distinct songs, one of them three times,
// while a third of the soundtrack never played at all. Dealing gives
// every area its own song until the pool runs out, which is rather the
// point of a hand-picked soundtrack.
SOUNDTRACK.forArea = (chapter, areaNum, a) => {
  if (typeof TRACKS === "undefined" || !TRACKS.length) return null;
  const key = chapter + "-" + areaNum;
  const explicit = TRACKS.filter((t) => t.areas && t.areas.indexOf(key) >= 0);
  if (explicit.length) return explicit[0];

  const mood = a && a.boss ? "boss" : a && a.quiet ? "quiet" : "general";
  let pool = TRACKS.filter((t) => t.mood === mood && !(t.areas || []).length);
  // No track is labelled "quiet" yet, so this fallback is what quiet
  // areas actually draw from. Excluding "boss" keeps White Noise reserved
  // for boss arenas instead of it turning up in a quiet room too.
  if (!pool.length) pool = TRACKS.filter((t) => !(t.areas || []).length && t.mood !== "boss");
  if (!pool.length) pool = TRACKS;

  const dealt = SOUNDTRACK._dealt(pool);
  return dealt[SOUNDTRACK._ordinal(chapter, areaNum) % dealt.length];
};

SOUNDTRACK.playForArea = (chapter, areaNum, a) => {
  SOUNDTRACK.play(SOUNDTRACK.forArea(chapter, areaNum, a));
};

// Named track by id, for the title screen.
SOUNDTRACK.playById = (id, at = 0) => {
  if (typeof TRACKS === "undefined") return;
  const t = TRACKS.filter((x) => x.id === id)[0];
  if (t) SOUNDTRACK.play(t, at);
};

// Where the song has got to, in seconds, or null if nothing is sounding.
// The title sequence cues its titles off this rather than off its own clock:
// the beat is the thing the eye is being asked to feel, so the beat is the
// clock that everything else follows.
SOUNDTRACK.time = () => {
  const a = SOUNDTRACK._el;
  return a && !a.paused && a.currentTime > 0 ? a.currentTime : null;
};
