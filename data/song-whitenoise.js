// ============================================================
// "White Noise", chiptune arrangement (TEST TRACK)
//
// Disclosure ft. AlunaGeorge, 2013.
//
// SECOND PASS. The first was written from memory and was wrong in
// every foundation. This one is transcribed from the audio itself,
// analysed with numpy. What the measurements said:
//
//   tempo   120.05 bpm          (I had guessed 122)
//   key     F minor             (I had guessed F# minor: a semitone
//                                sharp across the whole track)
//   beat    four-to-the-floor   (I had guessed a 2-step garage beat.
//                                Kick energy folded onto one bar
//                                peaks hard on 0/4/8/12.)
//   hats    offbeat 8ths, 2/6/10/14
//   clap    beats 2 and 4
//   loop    2 bars, chords Bbm - Eb / Fm - Cm - Ab
//   bass    Bb, walk up Db-Eb, then F, C, Ab
//
// Still the least certain part: the lead. It is the strongest note
// in the C4-E6 band per 8th, which on a track this dense may be
// tracking the synth rather than the vocal. Groove and harmony are
// measured and solid; the tune on top is the bit to judge.
//
// If this ships it gets an in-joke title, not this one.
// ============================================================

const SONG_WHITENOISE = {
  name: "White Noise",
  bpm: 120,
  swing: 0.06,        // house is near straight. 0 is dead straight, 0.3 lurches
  channels: [
    {
      id: "lead",
      voice: "pulse", duty: 0.25, vol: 0.40, gate: 0.9, decay: 0.05, sustain: 0.8,
      bars: [
        //  1   e   &   a   2   e   &   a   3   e   &   a   4   e   &   a
        "  F5   -   -   .  F5   -  A#5  -   .   .  G5   -  A#5  -  C6   -  ",
        "  C5   -   -   .  G5   -   -   .  G5   -  D#5  -  A#4  -   -   .  ",
        "  F5   -   -   .  F5   -  A#5  -   .   .  G5   -  A#5  -  C6   -  ",
        "  C5   -   -   .  G5   -   -   .  G5   -  D#5  -  D#6  -   -   .  ",
        "  F5   -   -   .  F5   -  A#5  -   .   .  G5   -  A#5  -  C6   -  ",
        "  C5   -   -   .  G5   -   -   .  G5   -  D#5  -  A#4  -   -   .  ",
        "  F5   -   -   .  F5   -  A#5  -   .   .  G5   -  A#5  -  C6   -  ",
        "  C5   -   -   .  G5   -   -   .  D#6  -   -   .  A#5  -   -   .  ",
      ],
    },
    {
      id: "stabs",
      voice: "pulse", duty: 0.5, vol: 0.28, gate: 0.35, decay: 0.03, sustain: 0.35,
      bars: [
        // house stabs sit on the offbeat 8ths, pushing against the kick
        "   .   . A#4^m  .   .   . A#4^m  .   .   . A#4^m  .   .   . D#4^M  .  ",
        "   .   .  F4^m  .   .   .  C5^m  .   .   . G#4^M  .   .   . G#4^M  .  ",
        "   .   . A#4^m  .   .   . A#4^m  .   .   . A#4^m  .   .   . D#4^M  .  ",
        "   .   .  F4^m  .   .   .  C5^m  .   .   . G#4^M  .   .   . G#4^M  .  ",
        "   .   . A#4^m  .   .   . A#4^m  .   .   . A#4^m  .   .   . D#4^M  .  ",
        "   .   .  F4^m  .   .   .  C5^m  .   .   . G#4^M  .   .   . G#4^M  .  ",
        "   .   . A#4^m  .   .   . A#4^m  .   .   . A#4^m  .   .   . D#4^M  .  ",
        "   .   .  F4^m  .   .   .  C5^m  .   .   . G#4^M  .   .   . G#4^M  .  ",
      ],
    },
    {
      id: "bass",
      voice: "triangle", vol: 0.60, gate: 0.9, decay: 0.05, sustain: 0.8,
      bars: [
        " A#2  -   -   .  A#2  -   -   .  A#2  -   -   .  C#3  -  D#3  -  ",
        "  F2  -   -   .   F2  -   C3  -   C3  -  G#2  -   -   -   -   -  ",
        " A#2  -   -   .  A#2  -   -   .  A#2  -   -   .  C#3  -  D#3  -  ",
        "  F2  -   -   .   F2  -   C3  -   C3  -  G#2  -   -   -   -   -  ",
        " A#2  -   -   .  A#2  -   -   .  A#2  -   -   .  C#3  -  D#3  -  ",
        "  F2  -   -   .   F2  -   C3  -   C3  -  G#2  -   -   -   -   -  ",
        " A#2  -   -   .  A#2  -   -   .  A#2  -   -   .  C#3  -  D#3  -  ",
        "  F2  -   -   .   F2  -   C3  -   C3  -  G#2  -  G#2  -  A#2  -  ",
      ],
    },
    {
      id: "kick",
      voice: "noise", vol: 1.0,
      bars: [
        "   K   .   .   .   K   .   .   .   K   .   .   .   K   .   .   .  ",
        "   K   .   .   .   K   .   .   .   K   .   .   .   K   .   .   .  ",
        "   K   .   .   .   K   .   .   .   K   .   .   .   K   .   .   .  ",
        "   K   .   .   .   K   .   .   .   K   .   .   .   K   .   .   .  ",
        "   K   .   .   .   K   .   .   .   K   .   .   .   K   .   .   .  ",
        "   K   .   .   .   K   .   .   .   K   .   .   .   K   .   .   .  ",
        "   K   .   .   .   K   .   .   .   K   .   .   .   K   .   .   .  ",
        "   K   .   .   .   K   .   .   .   K   .   .   .   K   .   K   .  ",
      ],
    },
    {
      id: "perc",
      voice: "noise", vol: 0.70,
      bars: [
        // clap on 2 and 4, hats on the offbeats
        "   .   .   H   .   S   .   H   .   .   .   H   .   S   .   H   .  ",
        "   .   .   H   .   S   .   H   .   .   .   H   .   S   .   H   .  ",
        "   .   .   H   .   S   .   H   .   .   .   H   .   S   .   H   .  ",
        "   .   .   H   .   S   .   H   .   .   .   H   .   S   .   H   O  ",
        "   .   .   H   .   S   .   H   .   .   .   H   .   S   .   H   .  ",
        "   .   .   H   .   S   .   H   .   .   .   H   .   S   .   H   .  ",
        "   .   .   H   .   S   .   H   .   .   .   H   .   S   .   H   .  ",
        "   .   .   H   .   S   .   H   .   .   .   H   .   S   .   H   O  ",
      ],
    },
  ],
};
