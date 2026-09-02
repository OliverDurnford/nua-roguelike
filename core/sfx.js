// ============================================================
// SFX: code-generated retro sound effects via WebAudio.
// No audio files: every sound is a little synth recipe below.
// The real 8-bit soundtrack is a separate session - this is
// just the bleeps and bloops that make combat feel alive.
//
// Press N in-game to mute/unmute (remembered between visits).
// ============================================================

const SFX = {};

SFX._ctx = null;
SFX._master = null;
SFX.muted = false;
try { SFX.muted = localStorage.getItem("tenyears-sfx") === "off"; } catch (e) {}

SFX.toggle = () => {
  SFX.muted = !SFX.muted;
  try { localStorage.setItem("tenyears-sfx", SFX.muted ? "off" : "on"); } catch (e) {}
  return !SFX.muted;
};

// Browsers only allow audio after the player has interacted with the
// page. We create the context lazily and keep nudging it awake -
// the first click / key / tap unlocks it.
SFX.ctx = () => {
  if (!SFX._ctx) {
    try {
      SFX._ctx = new (window.AudioContext || window.webkitAudioContext)();
      SFX._master = SFX._ctx.createGain();
      SFX._master.gain.value = 0.22;   // master volume
      SFX._master.connect(SFX._ctx.destination);
    } catch (e) { return null; }
  }
  if (SFX._ctx.state === "suspended") SFX._ctx.resume();
  return SFX._ctx;
};

// one pitched beep: oscillator with a frequency slide + fade-out
SFX.tone = ({ type = "square", from = 440, to = null, dur = 0.1, vol = 1, delay = 0 }) => {
  const ctx = SFX.ctx();
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(20, from), t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to === null ? from : to), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g);
  g.connect(SFX._master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
};

// one burst of filtered noise: impacts, explosions, rumbles
SFX.noise = ({ dur = 0.1, vol = 1, freq = 800, q = 1, delay = 0 }) => {
  const ctx = SFX.ctx();
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(f); f.connect(g); g.connect(SFX._master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
};

// ---------- the sound library ----------
SFX.LIB = {
  // combat
  shoot:   () => SFX.tone({ type: "square", from: rand(540, 640), to: 190, dur: 0.07, vol: 0.4 }),
  eshoot:  () => SFX.tone({ type: "triangle", from: 300, to: 150, dur: 0.09, vol: 0.25 }),
  hit:     () => { SFX.noise({ dur: 0.05, vol: 0.5, freq: 1400 }); SFX.tone({ type: "square", from: 260, to: 150, dur: 0.05, vol: 0.3 }); },
  kill:    () => { SFX.tone({ type: "triangle", from: 330, to: 55, dur: 0.18, vol: 0.7 }); SFX.noise({ dur: 0.12, vol: 0.45, freq: 500 }); },
  hurt:    () => { SFX.tone({ type: "sawtooth", from: 200, to: 65, dur: 0.24, vol: 0.85 }); SFX.noise({ dur: 0.14, vol: 0.5, freq: 280 }); },
  tick:    () => SFX.tone({ type: "sine", from: 900, dur: 0.04, vol: 0.4 }),
  pickup:  () => { SFX.tone({ type: "sine", from: 660, dur: 0.07, vol: 0.5 }); SFX.tone({ type: "sine", from: 880, dur: 0.09, vol: 0.5, delay: 0.07 }); },

  // special meter & specials
  ready:   () => { SFX.tone({ type: "sine", from: 1175, dur: 0.22, vol: 0.55 }); SFX.tone({ type: "sine", from: 1760, dur: 0.26, vol: 0.35, delay: 0.06 }); },
  riser:   () => SFX.tone({ type: "sawtooth", from: 120, to: 880, dur: 0.5, vol: 0.45 }),
  boom:    () => { SFX.tone({ type: "sine", from: 105, to: 34, dur: 0.5, vol: 0.95 }); SFX.noise({ dur: 0.3, vol: 0.8, freq: 220, q: 0.6 }); },
  sparkle: () => [1568, 1318, 1046].forEach((f, i) => SFX.tone({ type: "triangle", from: f, dur: 0.09, vol: 0.45, delay: i * 0.07 })),
  warm:    () => [392, 494, 587].forEach((f) => SFX.tone({ type: "sine", from: f, dur: 0.5, vol: 0.3 })),
  // Sam's Arse Slam, as specified in CHARACTER_ROSTER.md
  fart:    () => { SFX.tone({ type: "sawtooth", from: 100, to: 48, dur: 0.32, vol: 0.8 }); SFX.tone({ type: "sawtooth", from: 75, to: 42, dur: 0.26, vol: 0.6, delay: 0.06 }); },

  // events
  recruit: () => [523, 659, 784, 1047].forEach((f, i) => SFX.tone({ type: "square", from: f, dur: 0.1, vol: 0.45, delay: i * 0.08 })),
  door:    () => { SFX.tone({ type: "square", from: 150, dur: 0.07, vol: 0.5 }); SFX.tone({ type: "square", from: 110, dur: 0.09, vol: 0.5, delay: 0.09 }); },
  roar:    () => { SFX.tone({ type: "sawtooth", from: 85, to: 48, dur: 0.7, vol: 0.85 }); SFX.noise({ dur: 0.5, vol: 0.5, freq: 160, q: 0.5 }); },
  bossdie: () => {
    SFX.tone({ type: "sine", from: 220, to: 28, dur: 0.9, vol: 0.95 });
    for (let i = 0; i < 3; i++) SFX.noise({ dur: 0.22, vol: 0.6, freq: 320 - i * 70, delay: i * 0.16 });
  },

  // tutorial beats
  thwack:  () => { SFX.noise({ dur: 0.06, vol: 0.8, freq: 950 }); SFX.tone({ type: "square", from: 185, dur: 0.06, vol: 0.5 }); },
  honk:    () => { SFX.tone({ type: "square", from: 470, dur: 0.16, vol: 0.6 }); SFX.tone({ type: "square", from: 350, dur: 0.22, vol: 0.6, delay: 0.18 }); },
  rumble:  () => SFX.noise({ dur: 0.55, vol: 0.9, freq: 110, q: 0.4 }),

  // menus
  uitick:    () => SFX.tone({ type: "sine", from: 800, dur: 0.04, vol: 0.35 }),
  uiconfirm: () => SFX.tone({ type: "square", from: 440, to: 880, dur: 0.12, vol: 0.5 }),
};

SFX.play = (name) => {
  if (SFX.muted) return;
  const fn = SFX.LIB[name];
  if (!fn) return;
  try { fn(); } catch (e) { /* audio is decoration - never crash the game over it */ }
};
