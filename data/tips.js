// ============================================================
// TIPS_COPY: the words on the tip cards (core/tips.js, 18 Oct 2026).
// Ollie's to rewrite: placeholders in the game's voice. A tip with
// `touch` and `keys` has different words for a phone or iPad and for a
// laptop; anything not given there comes from the tip itself. `demo`
// names the moving picture drawn above the words.
// ============================================================

const TIPS_COPY = {
  saveword: {
    title: "KEEP YOUR PROGRESS",
    lines: ["Get a save word to keep your progress safe in case the game crashes, and to carry on on another phone, iPad or laptop."],
    hint: "It's in the pause menu whenever you want it.",
    buttons: ["get my save word", "later"],
  },
  "controls-touch": {
    title: "HOW TO PLAY",
    demo: "sticks",
    lines: [
      "Keep both thumbs down.",
      "The left stick walks. The right stick aims, and you keep throwing for as long as you hold it.",
    ],
    hint: "A quick flick only throws once.",
  },
  "controls-keys": {
    title: "HOW TO PLAY",
    demo: "keys",
    lines: [
      "Walk with WASD or the arrow keys.",
      "Point with the mouse. You throw by yourself whenever there's something to hit.",
    ],
    hint: "SPACE fires a special move once a friend has joined.",
  },
  polaroids: {
    title: "WHOSE GO?",
    demo: "polaroids",
    touch: {
      lines: ["Tap a polaroid to choose whose special move is next."],
      hint: "Fill the meter, then tap SP.",
    },
    keys: {
      lines: ["Press 1 to 4, or Q and E, to choose whose special move is next."],
      hint: "Fill the meter, then press SPACE.",
    },
  },
  hidden: {
    title: "KEEP YOUR EYES PEELED",
    lines: [
      "Every chapter hides a MilpooL cap somewhere.",
      "A few old faces are hiding in the rooms too. Get close and they'll appear.",
    ],
  },
};

// the nudges' chips (core/nudge.js)
const NUDGE_COPY = {
  crack: "jump in the crack to carry on",
  door: "the way out is open",
};
