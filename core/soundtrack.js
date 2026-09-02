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

SOUNDTRACK.play = (track) => {
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
    try { a.currentTime = 0; } catch (e) {}
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

// Which song plays in a given room. An explicit area key always wins;
// otherwise pick from the mood pool with a hash of the key, so replaying
// the same area hears the same song but neighbouring areas differ.
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

  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  // The keys are tiny and highly regular ("1-1", "1-2", ...), so the raw
  // accumulator's low bits march in step with the area number, and % only
  // reads the low bits. Avalanche them first or the same handful of songs
  // repeats in alphabetical order and most of the soundtrack never plays.
  h ^= h >>> 15; h = Math.imul(h, 2246822507);
  h ^= h >>> 13; h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return pool[(h >>> 0) % pool.length];
};

SOUNDTRACK.playForArea = (chapter, areaNum, a) => {
  SOUNDTRACK.play(SOUNDTRACK.forArea(chapter, areaNum, a));
};

// Named track by id, for the title screen.
SOUNDTRACK.playById = (id) => {
  if (typeof TRACKS === "undefined") return;
  const t = TRACKS.filter((x) => x.id === id)[0];
  if (t) SOUNDTRACK.play(t);
};
