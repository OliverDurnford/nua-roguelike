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
// EXCEPT on an iPhone, which ignores an element's volume outright: no
// fade up on the title, and the loudness levelling between tracks did
// nothing (13 Oct 2026). There, and only there, the element is routed
// through a Web Audio gain instead. That is safe because an iPhone is
// always on the website, never on file://, so nothing taints.
//
// One element, reused. Track changes dip the volume down, swap
// the source and bring it back up.
// ============================================================

const SOUNDTRACK = {};

SOUNDTRACK.volume = 0.42;    // sits under the sound effects
SOUNDTRACK.FADE = 0.7;       // seconds, volume ramp on change
// Between rooms the song fades out with the picture as you leave and the
// next one fades up as the new room is revealed (Ollie, 13 Oct 2026).
SOUNDTRACK.LEAVE = 0.7;      // seconds: the fade out through the exit (G.leave)
SOUNDTRACK.AREA_IN = 1.6;    // seconds: the next room's song coming up
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
SOUNDTRACK._out = false;     // faded out by fadeOut(), still loaded and playing

// The element's volume for a track at full level: the music volume times
// the track's own gain, which make_registry.py works out from its measured
// loudness so every song plays equally loud (13 Oct 2026: Busy Earnin' was
// 7 dB under the rest). An element cannot go past 1.
SOUNDTRACK.full = (track) => Math.min(1, SOUNDTRACK.volume * ((track && track.gain) || 1));

SOUNDTRACK._el = null;
SOUNDTRACK._fade = null;
SOUNDTRACK._gain = null;          // the Web Audio gain, on iPhones only
SOUNDTRACK._mute = null;          // and the sound-off switch after it
SOUNDTRACK._v = 0;                // the volume last asked for, 0 to 1

// True on a browser that ignores an audio element's volume: every iPhone
// and iPad browser, since they are all Safari underneath. Asking the element
// is not enough: newer iOS accepts a volume and reads it back while still
// playing at full, which is how the first version of this fix stayed off
// on Ollie's phone (13 Oct 2026). So iOS is recognised by name, and an
// element that visibly refuses a volume counts too.
SOUNDTRACK.volumeIgnored = (() => {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;   // an iPad asking for the desktop site
  try { const t = document.createElement("audio"); t.volume = 0.5; return t.volume !== 0.5; }
  catch (e) { return false; }
})();

// The volume, through whichever route this browser actually listens to.
// The gain glides over 20ms rather than stepping, so a fade has no zipper.
SOUNDTRACK._setVol = (v) => {
  SOUNDTRACK._v = v;
  const g = SOUNDTRACK._src ? SOUNDTRACK._src.gain : SOUNDTRACK._gain;
  if (g) g.gain.setTargetAtTime(v, g.context.currentTime, 0.02);
  else SOUNDTRACK._audio().volume = v;
};
SOUNDTRACK._retryWired = false;   // true while a one-shot retry pair is attached

SOUNDTRACK._audio = () => {
  if (!SOUNDTRACK._el) {
    const a = new Audio();
    a.loop = true;           // a quiet area can outlast a three minute song
    a.preload = "none";
    a.volume = 0;
    SOUNDTRACK._el = a;
    if (SOUNDTRACK.volumeIgnored && location.protocol !== "file:") {
      const ctx = typeof SFX !== "undefined" && SFX.ctx();
      if (ctx) {
        try {
          const g = ctx.createGain(), m = ctx.createGain();
          g.gain.value = 0;
          ctx.createMediaElementSource(a).connect(g);
          g.connect(m);
          m.connect(ctx.destination);
          SOUNDTRACK._gain = g;
          // An iPhone ignores the element's `muted` once its sound goes
          // through Web Audio, so "sound off" left the room's song playing
          // (Ollie, 15 Oct 2026). This gain is the switch instead.
          SOUNDTRACK._mute = m;
          a.volume = 1;   // the gain does the work now
        } catch (e) {}
      }
    }
  }
  return SOUNDTRACK._el;
};

// Ramp the element's volume. setInterval is fine here: nothing about a
// volume fade needs sample accuracy.
SOUNDTRACK._rampTo = (target, secs, done) => {
  const a = SOUNDTRACK._audio();
  if (SOUNDTRACK._fade) clearInterval(SOUNDTRACK._fade);
  const dur = Math.max(1, (secs === undefined ? SOUNDTRACK.FADE : secs) * 1000);
  const from = SOUNDTRACK._v;
  const step = 40;
  let t = 0;
  SOUNDTRACK._fade = setInterval(() => {
    t += step;
    const k = Math.min(1, t / dur);
    SOUNDTRACK._setVol(Math.max(0, Math.min(1, from + (target - from) * k)));
    if (k >= 1) {
      clearInterval(SOUNDTRACK._fade);
      SOUNDTRACK._fade = null;
      if (done) done();
    }
  }, step);
};

SOUNDTRACK.syncMute = () => {
  const muted = typeof SFX !== "undefined" && SFX.muted;
  const a = SOUNDTRACK._el;
  if (a) a.muted = muted;
  for (const m of [SOUNDTRACK._mute, SOUNDTRACK._src && SOUNDTRACK._src.mute]) if (m) SOUNDTRACK._switch(m, muted);
};

// A gain set to 0 or 1 at once: any glide still scheduled on it would
// otherwise win over a plain .value.
SOUNDTRACK._switch = (g, off) => {
  const v = off ? 0 : 1, t = g.context.currentTime;
  try { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(v, t); } catch (e) {}
  g.gain.value = v;
};

// ---------- iPhones: the title song played from memory ----------
// Routing an element through Web Audio (above) gives an iPhone its volume
// back, but on the way the sound picks up a delay the element's clock does
// not know about, so the title's reveals landed a touch ahead of the beat
// (Ollie, 13 Oct 2026; WebKit's media-element route has a history of sync
// trouble). So on an iPhone the title song is fetched and decoded whole
// and played as a Web Audio buffer, whose clock is the audio engine's own:
// time() then says exactly which beat is sounding. About 90MB of memory
// while it plays; it is let go as soon as another song takes over. If it
// is not decoded by the time of the tap, the element plays it as before.
// Bluetooth headphones add a delay no iPhone browser reports, so through
// them the beat can still sit a little late.
SOUNDTRACK._decoded = {};   // track id -> AudioBuffer, or "loading"
SOUNDTRACK._src = null;     // { node, gain, mute, t0, at, dur } while a decoded song plays

SOUNDTRACK.fromMemory = () => SOUNDTRACK.volumeIgnored && location.protocol !== "file:";

SOUNDTRACK.prepare = (id) => {
  if (!SOUNDTRACK.fromMemory() || SOUNDTRACK._decoded[id] || typeof TRACKS === "undefined") return;
  const track = TRACKS.filter((x) => x.id === id)[0];
  const ctx = track && typeof SFX !== "undefined" && SFX.ctx();
  if (!ctx) return;
  SOUNDTRACK._decoded[id] = "loading";
  const fail = () => { delete SOUNDTRACK._decoded[id]; };
  fetch("music/" + track.file)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
    .then((bytes) => ctx.decodeAudioData(bytes, (buf) => { SOUNDTRACK._decoded[id] = buf; }, fail))
    .catch(fail);
};

SOUNDTRACK._stopDecoded = () => {
  const s = SOUNDTRACK._src;
  if (!s) return;
  SOUNDTRACK._src = null;
  try { s.node.stop(); } catch (e) {}
  try { s.node.disconnect(); s.gain.disconnect(); s.mute.disconnect(); } catch (e) {}
};

// Starts `track` from memory if it is ready there; false if not.
SOUNDTRACK._playDecoded = (track, at) => {
  const buf = SOUNDTRACK._decoded[track.id];
  const ctx = typeof SFX !== "undefined" && SFX._ctx;
  if (!buf || buf === "loading" || !ctx) return false;
  const node = ctx.createBufferSource();
  node.buffer = buf;
  node.loop = true;          // as the element loops
  const gain = ctx.createGain(), mute = ctx.createGain();
  gain.gain.value = 0;
  node.connect(gain);
  gain.connect(mute);
  mute.connect(ctx.destination);
  const t0 = ctx.currentTime;
  node.start(t0, at % buf.duration);
  SOUNDTRACK._src = { node, gain, mute, t0, at, dur: buf.duration };
  if (SOUNDTRACK._el) SOUNDTRACK._el.pause();
  return true;
};

// `at` seeks the track before it starts, in seconds. The title sequence needs
// it: the video was cut against an export whose audio sits 148ms behind this
// m4a, so starting the song 148ms in is what puts the beat under the picture.
// `fadeIn` is how long the volume takes to come up. null leaves it silent for
// the caller to ride with SOUNDTRACK.level, which is what the title does.
SOUNDTRACK.play = (track, at = 0, fadeIn = SOUNDTRACK.FADE) => {
  if (!track) return;
  // Checks _requested, not current: see the note by _requested's
  // declaration above for why. This is what stops a second play() call
  // for a track that is mid-fade-out from being swallowed as a false
  // no-op while the wrong track finishes taking over.
  if (SOUNDTRACK._requested && SOUNDTRACK._requested.id === track.id) {
    // the same song asked for after a fade out (a room that shares it):
    // bring it back up rather than leave it silent
    if (SOUNDTRACK._out && fadeIn !== null) {
      SOUNDTRACK._out = false;
      SOUNDTRACK._rampTo(SOUNDTRACK.full(track), fadeIn);
    }
    return;
  }
  SOUNDTRACK._requested = track;
  SOUNDTRACK._out = false;
  const a = SOUNDTRACK._audio();

  const start = () => {
    SOUNDTRACK._stopDecoded();
    SOUNDTRACK.current = track;
    SOUNDTRACK.token++;
    if (SOUNDTRACK._playDecoded(track, at)) {
      SOUNDTRACK.syncMute();
      SOUNDTRACK._setVol(0);
      if (fadeIn !== null) SOUNDTRACK._rampTo(SOUNDTRACK.full(track), fadeIn);
      return;
    }
    a.src = "music/" + track.file;
    // Seeking before the source has any metadata throws, so wait for it.
    const seek = () => { try { a.currentTime = at; } catch (e) {} };
    if (at && a.readyState < 1) a.addEventListener("loadedmetadata", seek, { once: true });
    else seek();
    SOUNDTRACK.syncMute();
    SOUNDTRACK._setVol(0);
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
    if (fadeIn !== null) SOUNDTRACK._rampTo(SOUNDTRACK.full(track), fadeIn);
  };

  // already silent (faded out on the way out of the last room): no dip
  if (SOUNDTRACK.current && SOUNDTRACK._v > 0.001) SOUNDTRACK._rampTo(0, 0.35, start);
  else start();
};

// Fade the song down to nothing and leave it there, still loaded, for the
// next play() to take over from (or, for the same song, to bring back up).
SOUNDTRACK.fadeOut = (secs = SOUNDTRACK.LEAVE) => {
  if (!SOUNDTRACK._el && !SOUNDTRACK._src) return;
  SOUNDTRACK._out = true;
  SOUNDTRACK._rampTo(0, secs);
};

SOUNDTRACK.stop = () => {
  if (!SOUNDTRACK._el) return;
  // Cleared synchronously here, not inside the fade callback below: a
  // play() landing while this fade-out is still running must see nothing
  // requested and take over cleanly, rather than reading the just-stopped
  // track as still "requested" and wrongly no-opping once this fade
  // finishes and pauses it.
  SOUNDTRACK._requested = null;
  SOUNDTRACK._out = false;
  SOUNDTRACK._rampTo(0, 0.4, () => {
    SOUNDTRACK._el.pause();
    SOUNDTRACK._stopDecoded();
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
  // A "cue" (the tutorial's quake) is only ever played by name.
  if (!pool.length) pool = TRACKS.filter((t) => !(t.areas || []).length && t.mood !== "boss" && t.mood !== "cue");
  if (!pool.length) pool = TRACKS.filter((t) => t.mood !== "cue");

  const dealt = SOUNDTRACK._dealt(pool);
  return dealt[SOUNDTRACK._ordinal(chapter, areaNum) % dealt.length];
};

SOUNDTRACK.playForArea = (chapter, areaNum, a) => {
  SOUNDTRACK.play(SOUNDTRACK.forArea(chapter, areaNum, a), 0, SOUNDTRACK.AREA_IN);
};

// Named track by id, for the title screen.
SOUNDTRACK.playById = (id, at = 0, fadeIn = SOUNDTRACK.FADE) => {
  if (typeof TRACKS === "undefined") return;
  const t = TRACKS.filter((x) => x.id === id)[0];
  if (t) SOUNDTRACK.play(t, at, fadeIn);
};

// Set the volume as a fraction of full (0 to 1): outright, cancelling any
// ramp, or over `secs` when given.
SOUNDTRACK.level = (k, secs) => {
  const v = SOUNDTRACK.full(SOUNDTRACK._requested) * Math.max(0, Math.min(1, k));
  if (secs) return SOUNDTRACK._rampTo(v, secs);
  if (SOUNDTRACK._fade) { clearInterval(SOUNDTRACK._fade); SOUNDTRACK._fade = null; }
  SOUNDTRACK._setVol(v);
};

// The track Ollie pinned to a slot that is not a room: "select",
// "tutorial" or "ending" (assigned on tools/soundtrack/board.html, baked in
// by make_registry.py). Returns false when the slot is blank, so each scene
// keeps its old behaviour: the title song carries on, or the ending is silent.
SOUNDTRACK.playForKey = (key) => {
  if (typeof TRACKS === "undefined") return false;
  const t = TRACKS.filter((x) => x.areas && x.areas.indexOf(key) >= 0)[0];
  if (!t) return false;
  SOUNDTRACK.play(t);
  return true;
};

// Where the song has got to, in seconds, or null if nothing is sounding.
// The title sequence cues its titles off this rather than off its own clock:
// the beat is the thing the eye is being asked to feel, so the beat is the
// clock that everything else follows.
SOUNDTRACK.time = () => {
  const s = SOUNDTRACK._src;
  if (s) {
    const ctx = s.node.context;
    if (ctx.state !== "running") return null;
    // the moment being heard, not the moment being worked out: the engine
    // runs a little ahead of the speaker by its own stated latency
    const lag = (ctx.baseLatency || 0) + (ctx.outputLatency || 0);
    const t = ctx.currentTime - s.t0 - lag;
    return t > 0 ? (s.at + t) % s.dur : null;
  }
  const a = SOUNDTRACK._el;
  return a && !a.paused && a.currentTime > 0 ? a.currentTime : null;
};
