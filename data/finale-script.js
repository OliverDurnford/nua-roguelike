// ============================================================
// THE FINALE'S SCRIPT (Ollie's picks, 13 to 14 Oct 2026; design:
// docs/superpowers/specs/2026-10-14-finale-story-design.md)
//
// Busy You was the voice in the cracks all along, and they think
// they are doing you a favour. Hand-edited, like data/crackvoice.js,
// and played by the same engine (core/crackvoice.js), so every step
// that file lists works here too. New in the finale:
//   { say, reveal: true }    after this line the note's "???"
//                            becomes the boss's name
//   { say, bonus: "..." }    said instead when you play a bonus
//                            character (Busy You is then a friend)
//   { by: "caged", say }     one of the caged friends
//   { by: "friend", say }    a friend in your group, at random,
//   { by: "friend2", say }   ...and a different one
//   { by: "all", say }       you and every friend, in unison
//   { anim: "skylaugh" }     Busy You laughs at the sky, HA!s and all
//   { say, then: "bury" }    the responsibilities start falling, so
//                            the first lands on the last word
// [name] is whoever you are playing, [busy] is Busy You's friend's
// name, [job] their line from JOBS. Played by scenes/finale.js.
// ============================================================

const FINALE_SCRIPT = {
  // close on you, up the park, then this; their name flies through after
  opening: [
    { anim: "skylaugh" },
    { say: "Recognise the voice, [name]? You should. It's yours.", reveal: true,
      bonus: "Don't recognise me, [name]? It's [busy]. Give it a few years." },
    { by: "you", say: "...Why are you whispering?" },
    { say: "The baby's asleep.", small: true },
    { say: "I've watched you all the way here. The pubs. The parties. The group chat." },
    { say: "Do you know how many hours that is? I made a spreadsheet." },
    { say: "I haven't GOT hours.", keep: true },
    { say: "[job]" },
    { say: "So I locked them up. For you, [name]. Think of the time you'll save." },
    { say: "No more birthdays. No more 'quick pint'. No more polls about a Saturday in March.", keep: true },
    { say: "March is fully booked anyway.", small: true },
    { by: "you", say: "What would I even DO with all the extra time?" },
    { say: "...Emails." },
    { by: "caged", say: "[name]! They've been reading us their Slack. Out loud!" },
    { say: "I never have time for anything, [name]. But I'll MAKE time for this." },
    { anim: "skylaugh" },
  ],

  // after a death the opening is skipped: this, as the fight restarts
  retry: "Didn't we JUST have this meeting?",

  // bubbles over Busy You while the fight goes on, once each an attempt
  twoThirds: "Let's circle back to you giving up!",
  oneThird: { ring: true, say: "Mike, I'm fighting MYSELF. Can I call you back?" },

  // Busy You down, in the hurt pose
  fall: [
    { say: "Go on then. But blink, [name], and it'll be ten years, and you'll never...", cut: true, then: "bury" },
  ],

  // the cages open, everyone round you
  pub: [
    { by: "friend", say: "Blink and it'll be ten years?" },
    { by: "friend2", say: "It's BEEN ten years." },
    { by: "you", say: "Right. Pub?" },
    { by: "all", say: "PUB!" },
  ],

  // as the group walks off. Nobody answers.
  pile: [
    { say: "Can I come too?", keep: true },
    { say: "...I could do a quick one.", small: true },
  ],

  // said straight after "I haven't GOT hours."
  JOBS: {
    ollie: "I've got a 4am call time and a director who wants it to 'feel more blue'.",
    lucy: "I've got a client choosing between nine whites. They're all the same white.",
    cal: "I've cycled forty miles to film a corporate away day.",
    josh: "I've got forty bankers wanting espresso martinis at six.",
    annie: "I've got a premiere tonight and a lead actor who won't leave his trailer.",
    sam: "I've got a shoot at seven and a client who wants it 'a bit more viral'.",
    ana: "I've got a cover shoot at eight and the talent's still in Ibiza.",
    jess: "I've got a quarterly review and a graph going the wrong way.",
    adam: "I've got a pitch at nine and the big idea is still 'something with a dog'.",
    ethan: "I've got a fashion week to plan and nothing to wear.",
  },
};
