// ============================================================
// MUSIC — the chiptune sequencer.
//
// Same idea as sfx.js: no audio files, everything is generated
// from numbers. A song is a few lines of text per channel and
// this reads them out on a precise clock.
//
// Four voices, like the NES had:
//   pulse    square wave with a duty cycle. Lead and chord stabs.
//   triangle bass.
//   noise    drums.
//
// WRITING A SONG (see data/song-*.js for a real one)
//
//   Each channel is a list of bar strings. One bar = 16 tokens,
//   one per 16th note, separated by spaces:
//
//     step  0  1  2  3   4  5  6  7   8  9 10 11  12 13 14 15
//     beat  1  e  &  a   2  e  &  a   3  e  &  a   4  e  &  a
//
//   Tokens:
//     F#4     play that note
//     -       hold the previous note for another 16th
//     .       silence
//     F#4^m   play a fast arpeggio on F#minor, which is how chip
//             music fakes a whole chord out of one voice
//     ^M major  ^m minor  ^7 dom7  ^m7 minor7  ^5 fifths
//     ^0,4,7  or spell the semitones out yourself
//
//   Drum channels use letters instead of notes:
//     K kick   S snare/clap   H hat   O open hat   R rim
// ============================================================

const MUSIC = {};

// ---------- note names to frequencies ----------

const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// "F#4" -> 369.99. A4 is 440, MIDI note 69.
MUSIC.freq = (name) => {
  const m = /^([A-G])([#b]?)(-?\d+)$/.exec(name);
  if (!m) return 0;
  const midi = SEMI[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
};

// chord shapes, as semitones above the written note
MUSIC.CHORDS = {
  M: [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10],
  M7: [0, 4, 7, 11], sus4: [0, 5, 7], dim: [0, 3, 6], 5: [0, 7], oct: [0, 12],
};

// ---------- audio plumbing ----------

MUSIC._bus = null;
MUSIC._waves = {};     // duty cycle -> PeriodicWave, built once and reused
MUSIC.volume = 0.30;   // music sits under the sound effects

// Share one AudioContext with sfx.js when it's loaded, so the browser's
// "audio needs a click first" unlock covers both. Standalone otherwise,
// which is what lets music-test.html run without the rest of the game.
MUSIC.ctx = () => {
  if (typeof SFX !== "undefined" && SFX.ctx) return SFX.ctx();
  if (!MUSIC._ownCtx) {
    try { MUSIC._ownCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  if (MUSIC._ownCtx.state === "suspended") MUSIC._ownCtx.resume();
  return MUSIC._ownCtx;
};

MUSIC.bus = () => {
  const ctx = MUSIC.ctx();
  if (!ctx) return null;
  if (!MUSIC._bus) {
    MUSIC._bus = ctx.createGain();
    MUSIC._bus.gain.value = MUSIC.volume;
    MUSIC._bus.connect(ctx.destination);
  }
  return MUSIC._bus;
};

// A square wave is only one duty cycle out of four. Web Audio gives us
// the 50% one; the rest we build from their Fourier series, which is
// what gives chip music its thin, nasal 12.5% lead sound.
MUSIC.pulseWave = (ctx, duty) => {
  const key = duty.toFixed(3);
  if (MUSIC._waves[key]) return MUSIC._waves[key];
  const N = 24;
  const real = new Float32Array(N + 1);
  const imag = new Float32Array(N + 1);
  for (let n = 1; n <= N; n++) {
    real[n] = (2 / (n * Math.PI)) * Math.sin(2 * Math.PI * n * duty);
    imag[n] = (2 / (n * Math.PI)) * (1 - Math.cos(2 * Math.PI * n * duty));
  }
  MUSIC._waves[key] = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  return MUSIC._waves[key];
};

// ---------- voices ----------

// One pitched note. `arp` cycles the pitch inside the note at chip speed
// (50 times a second) so a single oscillator reads as a chord.
MUSIC.playNote = (ch, freq, t0, dur, arp) => {
  const ctx = MUSIC.ctx();
  const bus = MUSIC.bus();
  if (!ctx || !bus || freq <= 0) return;

  const osc = ctx.createOscillator();
  if (ch.voice === "triangle") osc.type = "triangle";
  else if (ch.voice === "saw") osc.type = "sawtooth";
  else if (ch.voice === "sine") osc.type = "sine";
  else osc.setPeriodicWave(MUSIC.pulseWave(ctx, ch.duty === undefined ? 0.5 : ch.duty));

  osc.frequency.setValueAtTime(freq, t0);
  if (arp && arp.length > 1) {
    const rate = 1 / 50;
    const steps = Math.min(400, Math.floor(dur / rate));
    for (let i = 1; i < steps; i++) {
      osc.frequency.setValueAtTime(freq * Math.pow(2, arp[i % arp.length] / 12), t0 + i * rate);
    }
  }

  // instant attack, short decay to a sustain level, quick release.
  // Nothing ever ramps to exactly 0: exponentialRamp refuses zero.
  const vol = ch.vol === undefined ? 0.5 : ch.vol;
  const atk = 0.004;
  const dec = ch.decay === undefined ? 0.06 : ch.decay;
  const sus = ch.sustain === undefined ? 0.65 : ch.sustain;
  const rel = Math.min(0.05, dur * 0.4);
  const end = t0 + dur;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + atk);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * sus), t0 + Math.min(atk + dec, dur));
  g.gain.setValueAtTime(Math.max(0.0001, vol * sus), Math.max(t0 + atk, end - rel));
  g.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(g);
  g.connect(bus);
  osc.start(t0);
  osc.stop(end + 0.02);
};

// Drum hits. Kick is a pitch drop, everything else is filtered noise.
MUSIC.DRUMS = {
  K: { pitch: [160, 42], dur: 0.15, vol: 1.0 },
  S: { noise: 1900, q: 0.9, dur: 0.11, vol: 0.6, clap: true },
  H: { noise: 8000, q: 0.7, dur: 0.028, vol: 0.30, hp: true },
  O: { noise: 7000, q: 0.6, dur: 0.16, vol: 0.26, hp: true },
  R: { noise: 2600, q: 3.0, dur: 0.05, vol: 0.40 },
};

MUSIC.playDrum = (ch, key, t0) => {
  const ctx = MUSIC.ctx();
  const bus = MUSIC.bus();
  const d = MUSIC.DRUMS[key];
  if (!ctx || !bus || !d) return;
  const vol = (ch.vol === undefined ? 0.5 : ch.vol) * d.vol;

  if (d.pitch) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(d.pitch[0], t0);
    osc.frequency.exponentialRampToValueAtTime(d.pitch[1], t0 + d.dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d.dur);
    osc.connect(g); g.connect(bus);
    osc.start(t0); osc.stop(t0 + d.dur + 0.02);
    return;
  }

  // a clap is two noise bursts a hair apart, which is what gives it the slap
  const bursts = d.clap ? [0, 0.011] : [0];
  bursts.forEach((off, i) => {
    const len = Math.max(1, Math.floor(ctx.sampleRate * d.dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let s = 0; s < len; s++) data[s] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = d.hp ? "highpass" : "bandpass";
    f.frequency.value = d.noise;
    f.Q.value = d.q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol * (i ? 0.75 : 1), t0 + off);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + off + d.dur);
    src.connect(f); f.connect(g); g.connect(bus);
    src.start(t0 + off); src.stop(t0 + off + d.dur + 0.02);
  });
};

// ---------- reading the song text ----------

// Turn bar strings into a flat list of events with real durations,
// so the scheduler never has to look ahead through the text.
MUSIC.compile = (song) => {
  song.channels.forEach((ch, ci) => {
    const toks = [];
    ch.bars.forEach((bar, bi) => {
      const t = bar.trim().split(/\s+/).filter((x) => x.length);
      if (t.length !== 16) {
        console.warn(`[music] ${song.name}: channel ${ci} bar ${bi + 1} has ${t.length} steps, expected 16`);
      }
      for (let i = 0; i < 16; i++) toks.push(t[i] === undefined ? "." : t[i]);
    });

    ch.events = [];
    for (let i = 0; i < toks.length; i++) {
      const tok = toks[i];
      if (tok === "." || tok === "-") continue;
      let steps = 1;
      while (i + steps < toks.length && toks[i + steps] === "-") steps++;

      if (ch.voice === "noise") {
        ch.events.push({ step: i, drum: tok, steps });
        continue;
      }
      const [note, shape] = tok.split("^");
      let arp = null;
      if (shape !== undefined) {
        arp = MUSIC.CHORDS[shape] || shape.split(",").map(Number).filter((n) => !isNaN(n));
      }
      const f = MUSIC.freq(note);
      if (!f) { console.warn(`[music] ${song.name}: channel ${ci} step ${i}: cannot read "${tok}"`); continue; }
      ch.events.push({ step: i, freq: f, arp, steps });
    }
    // index events by step so the scheduler is a lookup, not a search
    ch.byStep = {};
    ch.events.forEach((e) => { ch.byStep[e.step] = e; });
  });
  song.steps = Math.max(...song.channels.map((c) => c.bars.length)) * 16;
  song.compiled = true;
  return song;
};

// ---------- the clock ----------
//
// setInterval is far too sloppy for musical timing, so it is only used
// to wake us up. Each wake-up schedules every note falling in the next
// LOOKAHEAD seconds against the audio clock, which is sample accurate.

MUSIC._LOOKAHEAD = 0.15;
MUSIC._TICK = 30;

MUSIC.song = null;
MUSIC.playing = false;
MUSIC._step = 0;
MUSIC._next = 0;
MUSIC._timer = null;
MUSIC.mutes = {};      // channel index -> true to silence it

MUSIC.play = (song, { restart = true } = {}) => {
  const ctx = MUSIC.ctx();
  if (!ctx || !song) return;
  if (!song.compiled) MUSIC.compile(song);
  if (MUSIC.song === song && MUSIC.playing && !restart) return;

  MUSIC.stop();
  MUSIC.song = song;
  MUSIC._step = 0;
  MUSIC._next = ctx.currentTime + 0.08;
  MUSIC.playing = true;
  MUSIC._timer = setInterval(MUSIC._pump, MUSIC._TICK);
  MUSIC._pump();
};

MUSIC.stop = () => {
  if (MUSIC._timer) clearInterval(MUSIC._timer);
  MUSIC._timer = null;
  MUSIC.playing = false;
};

MUSIC._pump = () => {
  const ctx = MUSIC.ctx();
  const song = MUSIC.song;
  if (!ctx || !song || !MUSIC.playing) return;
  if (typeof SFX !== "undefined" && SFX.muted) return;   // one mute key for the whole game

  const stepDur = 60 / song.bpm / 4;
  const swing = song.swing || 0;

  while (MUSIC._next < ctx.currentTime + MUSIC._LOOKAHEAD) {
    const step = MUSIC._step % song.steps;
    // swing pushes every off-16th late, which is the garage shuffle
    const t = MUSIC._next + (step % 2 ? stepDur * swing : 0);

    song.channels.forEach((ch, ci) => {
      if (MUSIC.mutes[ci]) return;
      const e = ch.byStep[step];
      if (!e) return;
      const dur = e.steps * stepDur * (ch.gate === undefined ? 0.95 : ch.gate);
      if (e.drum) MUSIC.playDrum(ch, e.drum, t);
      else MUSIC.playNote(ch, e.freq, t, dur, e.arp);
    });

    MUSIC._next += stepDur;
    MUSIC._step++;
  }
};

MUSIC.setVolume = (v) => {
  MUSIC.volume = v;
  const bus = MUSIC.bus();
  if (bus) bus.gain.value = v;
};
