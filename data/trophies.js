// ============================================================
// TROPHIES DATA: the list, as Ollie locked it (13 to 16 Oct 2026).
//
// Edit names and "how" lines here. The rule behind each trophy lives
// in core/trophies.js under the same id, so renaming one never
// changes what earns it. Order here is the cabinet's order.
//
// tier:   "bronze" | "silver" | "gold" (the platinum is its own)
// hidden: shows as "???" in the cabinet until it is earned
// before: what the cabinet says until it is earned, for a trophy whose
//         own "how" gives the story away (Ollie, 16 Oct 2026); once
//         earned, the real line shows
//
// Adding a trophy later: give it a line here and a rule in the
// engine. Anyone who already holds the platinum keeps it; everyone
// else needs the new one too (Ollie, 15 Oct 2026).
//
// Spec: docs/superpowers/specs/2026-10-16-trophies-design.md
// ============================================================

const TROPHY_LIST = [
  // the story
  { id: "freshers", tier: "bronze", name: "Freshers' Week", how: "Get through Victoria Park and into Gonzo's", before: "Get through the opening" },
  { id: "dj", tier: "bronze", name: "Drop the DJ", how: "Beat the Obnoxious DJ", before: "Beat the chapter 1 boss" },
  { id: "dean", tier: "bronze", name: "Big Dean Energy", how: "Beat Big Dick Dean", before: "Beat the chapter 2 boss" },
  { id: "grad", tier: "silver", name: "First Class Honours", how: "Beat the Dean's Graduation Form", before: "Beat the chapter 3 boss" },
  { id: "covid", tier: "silver", name: "You're On Mute", how: "Beat COVID", before: "Beat the chapter 4 boss" },
  { id: "pub", tier: "gold", name: "See You at the Pub", how: "Beat Busy You and finish the game", before: "Finish the game" },

  // the friends
  { id: "plusone", tier: "bronze", name: "Plus One", how: "A friend joins you" },
  { id: "squad", tier: "bronze", name: "Squad Goals", how: "Four friends behind you at once" },
  { id: "reunion", tier: "silver", name: "Reunion", how: "Meet all ten friends across your runs" },
  { id: "wholegroup", tier: "gold", name: "The Whole Group", how: "Finish the game as all ten friends" },
  { id: "special", tier: "bronze", name: "Special Delivery", how: "Use a special for the first time" },
  { id: "repertoire", tier: "silver", name: "Full Repertoire", how: "Use all ten friends' specials" },
  { id: "overkill", tier: "silver", name: "Overkill", how: "Take out 8 enemies with one special" },

  // things you saw
  { id: "title", tier: "bronze", name: "Worth the Wait", how: "Watch the whole title sequence without skipping" },
  { id: "voice", tier: "bronze", hidden: true, name: "Who Said That?", how: "Hear the voice in the cracks" },
  { id: "hug", tier: "silver", hidden: true, name: "Hug It Out", how: "Be there when Ollie and Lucy hug" },
  { id: "kiss", tier: "silver", hidden: true, name: "Get a Room", how: "Catch Josh and Sam's kiss" },
  { id: "fidgets", tier: "silver", hidden: true, name: "People Watching", how: "Stand still long enough to see every friend's fidget" },

  // skill
  { id: "flu", tier: "bronze", name: "Freshers' Flu", how: "Get knocked out in the very first room" },
  { id: "seagulls", tier: "bronze", name: "Chips Are Safe", how: "Take down 50 seagulls" },
  { id: "deadlines", tier: "bronze", name: "Extension Granted", how: "Take down 50 Deadlines" },
  { id: "lastorders", tier: "silver", name: "Last Orders", how: "Beat a boss on your last heart (Medium or Hard)" },
  { id: "cleansheet", tier: "gold", name: "Clean Sheet", how: "Beat a boss without taking a single hit (Medium or Hard)" },
  { id: "chapter", tier: "gold", name: "Didn't Spill a Drop", how: "Finish a whole chapter without dying (Medium or Hard)" },
  { id: "noregrets", tier: "gold", name: "No Regrets", how: "Finish the whole game without dying once (Medium or Hard)" },
  { id: "distinction", tier: "gold", name: "With Distinction", how: "Finish the game on Hard, all the way through" },
  { id: "billy", tier: "gold", name: "Billy No Mates", how: "Beat Busy You without anyone joining you all run (Medium or Hard)",
    before: "Finish the game without anyone joining you all run (Medium or Hard)" },

  // the new secrets
  { id: "foam", tier: "silver", hidden: true, name: "Foam Party", how: "Stand still in the Foam Pit for 20 seconds" },
  { id: "canal", tier: "gold", hidden: true, name: "Not Ready to Go", how: "On Regent's Canal, after the rush of cracks, walk all the way back to where you started" },

  // the collectables
  { id: "hatsoff", tier: "bronze", name: "Hats Off", how: "Find a MilpooL cap" },
  { id: "fullset", tier: "gold", name: "The Full Set", how: "Find all five MilpooL caps" },
  { id: "everyone", tier: "gold", name: "Everyone's Here", how: "Find all eight bonus characters" },
  { id: "music", tier: "silver", name: "Now That's What I Call Music", how: "Hear every song in the game" },
];

const TROPHY_PLATINUM = {
  id: "platinum", tier: "platinum", name: "Now That's What I Call Ten Years", how: "Earn every other trophy",
};

// The platinum screen. PLACEHOLDER: Ollie writes the real note.
const PLATINUM_NOTE = [
  "PLACEHOLDER: Ollie's note goes here.",
  "A few lines to whoever got every single trophy.",
];
const PLATINUM_ASK = "Screenshot this and send it to Ollie.";
