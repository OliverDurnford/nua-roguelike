// ============================================================
// THE VOICE IN THE CRACKS (Ollie, 13 Oct 2026)
//
// After some rooms, as the ground splits, somebody talks to you
// out of the crack. It is Busy You, but nothing says so until the
// finale: never named, never seen, just "???" in a dark note. The
// finale's Busy You speaks in the same note, which is the reveal.
//
// Keyed by "chapter-area". Each beat plays once a run, so a chapter
// replayed after dying does not hear it twice. [name] is whoever
// you are playing. Played by core/crackvoice.js.
//
// A step is one of:
//   { say }                     the voice, typed out in its note
//   { say, small: true }        an aside, in the small pixel type
//   { say, small, fade: true }  ...and fading away as it goes
//   { say, cut: true }          cut off: the next step barges in,
//                               under it in the same note
//   { say, keep: true }         the next step goes under it in the
//                               same note, after the usual pause
//   { say, laugh: true }        shaking, with HA!s off the crack
//   { ring: "..." }             a phone goes off, the words wobbling
//   { by: "you", say }          you answer, in your own note
//   { by: [ids], say }          friends, in unison
//   { kiss: true }              Sam and Josh's kiss
// `needs` lists friends who must all be here (you or the party),
// or the step is skipped.
// ============================================================

const CRACK_VOICE = {
  // Gonzo's, the first room: it has half the group (Ollie)
  "1-1": [
    { say: "I've caught half of your friends, [name], and the rest are nearly in my grasp." },
    { say: "You'll never reach them in time!" },
    { say: "HAHAHAHAHA!", laugh: true },
  ],
  // Mercy Stage, the DJ beaten (Ollie's line)
  "1-5": [
    { say: "Mercy? Your friends will be begging me for mercy!", cut: true },
    { say: "HAHAHAHAHA!", laugh: true, keep: true },
    { say: "Hope that's not taken in a sexual way...", small: true },
  ],
  // The Lecture Theatre: two friends in by now
  "2-5": [
    { say: "Oh, I see you've got through some memories." },
    { say: "And you've picked up some little friends. How quaint." },
    { say: "It's not going to help...", cut: true },
    { say: "Nothing ever does.", small: true },
  ],
  // The Library
  "3-2": [
    { say: "Oh, poor [name]. Are your memories getting hazy?" },
    { say: "Gaps appearing, are they? Well, maybe it's time to grow up." },
  ],
  // The Cathedral, graduation day
  "3-5": [
    { say: "Really? You think this is an achievement? Because it's not, I...", cut: true },
    { ring: "♪ ZOOM CALL ♪" },
    { say: "Oh, hang on, I've got to take this..." },
    { say: "Just give up or whatever." },
    { say: "Yes, hi Mike... no, Q3 isn't quite what we'd...", small: true, fade: true },
  ],
  // The Beehive, London and the first jobs
  "4-3": [
    { say: "Don't you have better things to be doing than hanging out with your friends?" },
    { say: "Think of all the work you could be getting on with if you just forgot about all this!" },
  ],
  // Parliament Square, COVID beaten (Ollie's pick)
  "4-5": [
    { say: "You beat the pandemic, [name]. Adorable." },
    { say: "Now try a Monday morning with 46 unread emails." },
  ],
  // Games Night at the Flat, the last fight before the end
  "5-3": [
    { say: "Tsk tsk tsk, [name]. When are you just gonna give up?" },
    { say: "I am INEVITABLE." },
    { by: "you", say: "Was that a line from the Avengers?" },
    { by: ["josh", "sam"], say: "Gay.", needs: ["josh", "sam"] },
    { kiss: true, needs: ["josh", "sam"] },
  ],
};
