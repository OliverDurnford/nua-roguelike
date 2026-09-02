// ============================================================
// CHARACTERS: all ten friends.
// Source of truth: CHARACTER_ROSTER.md. Numbers are placeholder balance.
// colors drive the placeholder sprites until real art lands.
// Height order (tallest first): Cal > Ollie > Sam > Ethan = Adam > Josh > girls.
// ============================================================

const CHARACTERS = [
  {
    id: "ollie", name: "Ollie", height: 43, real: true,
    colors: { hair: [106, 68, 38], skin: [235, 195, 160], top: [120, 160, 210], bottom: [40, 45, 70] },
    weapon: { name: "Camera", color: [225, 225, 235] },
    flavour: "Loud, impulsive, a bit of a liability.",
    passive: {
      name: "ADHD", desc: "+35% attack speed",
      apply: (s) => { s.attackSpeed *= 1.35; },
    },
    recruitLine: "No need to panic, I'm here",
    special: {
      name: "The Flirt", type: "stun", shape: "aoe", power: 3.5,
      line: "A chat-up attempt so bad it stuns everyone in the room.",
    },
  },
  {
    id: "lucy", name: "Lucy", height: 34, real: true,
    colors: { hair: [70, 45, 30], skin: [240, 205, 175], top: [200, 80, 90], bottom: [60, 60, 80] },
    weapon: { name: "Pasta", color: [240, 215, 130] },
    flavour: "The matriarch. Has everyone eaten? Is anyone cold?",
    passive: {
      name: "Mother Hen", desc: "+2 max HP",
      apply: (s) => { s.maxHp += 2; },
    },
    recruitLine: "Has everyone eaten? Is anyone cold?",
    special: {
      name: "The Blanket Wrap", type: "heal", shape: "aoe", power: 4,
      line: "PUT A COAT ON! Full heal and a cosy shield.",
    },
  },
  {
    id: "cal", name: "Cal", height: 46,
    colors: { hair: [55, 40, 30], skin: [230, 190, 155], top: [70, 110, 80], bottom: [35, 35, 45] },
    weapon: { name: "Bike handlebars", color: [180, 185, 195] },
    flavour: "6ft 4\". Loves bikes. Will not agree with you.",
    passive: {
      name: "I Love Bikes", desc: "+25% movement speed",
      apply: (s) => { s.moveSpeed *= 1.25; },
    },
    recruitLine: "I cycled here, obviously.",
    special: {
      name: "All Play", type: "damage", shape: "aoe", power: 8,
      line: "The Trivial Pursuit board goes flying. Everyone suffers.",
    },
  },
  {
    id: "josh", name: "Josh", height: 36, real: true,
    colors: { hair: [40, 35, 30], skin: [225, 185, 150], top: [90, 90, 100], bottom: [50, 50, 60] },
    weapon: { name: "Chicken", color: [235, 200, 150] },
    flavour: "Keeps to himself. Says the weirdest stuff. Beloved.",
    passive: {
      name: "Seriously You Shouldn't Have Those Muscles", desc: "+40% damage",
      apply: (s) => { s.damage *= 1.4; },
    },
    recruitLine: "If it's more than a 3min walk, I'm getting an Uber",
    special: {
      name: "The Gout Stomp", type: "damage", shape: "radius", power: 12,
      line: "The lights flicker. The foot comes down.",
    },
  },
  {
    id: "annie", name: "Annie", height: 34, real: true,
    colors: { hair: [130, 40, 60], skin: [240, 205, 175], top: [40, 40, 45], bottom: [40, 40, 45] },
    weapon: { name: "Microphone", color: [220, 220, 230] },
    flavour: "Adorable. Will make anything into a mic.",
    passive: {
      name: "Good Vibes", desc: "small boost to everything",
      apply: (s) => {
        s.damage *= 1.1; s.attackSpeed *= 1.1; s.moveSpeed *= 1.1; s.maxHp += 1;
      },
    },
    recruitLine: "Hiii! Meow!",
    special: {
      name: "Main Character Moment", type: "stun", shape: "aoe", power: 4,
      line: "Spotlight. Mic. A performance nobody can move during.",
    },
  },
  {
    id: "sam", name: "Sam", height: 41,
    colors: { hair: [200, 110, 50], skin: [240, 200, 165], top: [90, 140, 95], bottom: [55, 55, 70] },
    weapon: { name: "Plant", color: [110, 170, 90] },
    flavour: "Ginger, smiley, surprisingly aerodynamic.",
    passive: {
      name: "Plant Parent", desc: "20% chance to block a hit",
      apply: (s) => { s.block += 0.2; },
    },
    recruitLine: "(laughs like SpongeBob)",
    special: {
      name: "The Arse Slam", type: "damage", shape: "radius", power: 10,
      line: "Airborne. Arse-first. Devastating.",
    },
  },
  {
    id: "ana", name: "Ana", height: 34, real: true,
    colors: { hair: [40, 30, 25], skin: [225, 180, 145], top: [210, 60, 60], bottom: [45, 45, 60] },
    weapon: { name: "Sea shell", color: [240, 220, 200] },
    flavour: "Spanish passion. Matador energy.",
    passive: {
      name: "Spanish Passion", desc: "+50% special charge rate",
      apply: (s) => { s.chargeRate *= 1.5; },
    },
    recruitLine: "¡Vamos, chicos!",  // PLACEHOLDER - Ana's real Spanish line TBD
    special: {
      name: "The Wave", type: "damage", shape: "directional", power: 10,
      line: "Red flag out. The wave follows.",
    },
  },
  {
    id: "jess", name: "Jess", height: 34,
    colors: { hair: [180, 140, 80], skin: [240, 205, 175], top: [80, 120, 160], bottom: [50, 50, 65] },
    weapon: { name: "Passport", color: [120, 60, 80] },
    flavour: "Brutally honest. Has an army in Bali.",
    passive: {
      name: "Brutally Honest", desc: "+20% crit chance",
      apply: (s) => { s.crit += 0.2; },
    },
    recruitLine: "Right, let's get on with it.",
    special: {
      name: "Bali Stampede", type: "damage", shape: "directional", power: 10,
      line: "Cats, dogs, monkeys. All of them. Charging.",
    },
  },
  {
    id: "adam", name: "Adam", height: 39,
    colors: { hair: [60, 45, 35], skin: [235, 195, 160], top: [200, 50, 50], bottom: [40, 40, 55] },
    weapon: { name: "Football", color: [230, 230, 230] },
    flavour: "Ka-chow.",
    passive: {
      name: "Smell Ya Later!", desc: "+30% attack range",
      apply: (s) => { s.range *= 1.3; },
    },
    recruitLine: "Watch this.",
    special: {
      name: "Ka-Chow!", type: "damage", shape: "aoe", power: 7,
      line: "Lightning McQueen pose. Finger guns. Carnage.",
    },
  },
  {
    id: "ethan", name: "Ethan", height: 39,
    colors: { hair: [50, 40, 35], skin: [230, 190, 155], top: [60, 60, 70], bottom: [35, 35, 45] },
    weapon: { name: "Shoes", color: [200, 170, 140] },
    flavour: "Understated. Until Tara arrives.",
    passive: {
      name: "Silence", desc: "+15% dodge chance",
      apply: (s) => { s.dodge += 0.15; },
    },
    recruitLine: "...hey.",
    special: {
      name: "Tara's Entrance", type: "stun", shape: "aoe", power: 4,
      line: "Tara has entered the chat.",
    },
  },
];

// ------------------------------------------------------------
// Easter egg lines. All affectionate-silly, all PLACEHOLDER -
// Ollie reviews and rewrites these with real inside jokes.
// ------------------------------------------------------------

const CHAT_UP_LINES = [
  "Do you come here often?",
  "Is it hot in here or is it just the boss fight?",
  "I've got a camera, you've got a face. Think about it.",
  "You + me + the smoking area?",
];

const JOSH_NON_SEQUITURS = [
  "What's your mate Kinga up to?",
  "Is that a perfectly good leg of lamb in here?!",
  "I'd survive a bear attack. Easily.",
  "Anyone else smell crisps?",
];

// Lucy's Geordie dialect companion dialogue (CHARACTER_ROSTER.md)
const LUCY_LINES = [
  "Howay, keep up!",
  "Are ye not cold? Ye look cold.",
  "Gan canny, pet.",
  "Ye cannit fight on an empty stomach!",
];

// Jess's blunt one-liners (CHARACTER_ROSTER.md)
const JESS_LINES = [
  "That was a terrible plan.",
  "No. Next room.",
  "I've seen scarier in Burgess Hill.",
  "Just hit it harder.",
];

// Ana's ocean dialogue, triggers near water (Thames walk, Regent's Canal)
const ANA_OCEAN_LINES = [
  "¡El mar! ...well. Sort of.",
  "This is NOT Spanish water.",
  "I miss the sea...",
];

const CAL_DETOURS = [
  "Actually, I think we should go the other way.",
  "Actually, the other route's faster.",
];

// Companion pair interactions (from CHARACTER_ROSTER.md).
// Triggered when the second (or third) of the group is recruited.
// Each script line names its speaker - the line appears as a speech
// bubble above that character's sprite on the field. `who` can be an
// array for lines spoken in unison.
const PAIR_LINES = [
  {
    needs: ["cal", "sam", "lucy"],
    script: [
      { who: "cal", text: "That's one milky lady" },
      { who: "lucy", text: "SAM!" },
      { who: "sam", text: "That wasn't me!" },
    ],
  },
  { needs: ["josh", "ana"], script: [{ who: "josh", text: "What's your mate Kinga up to?" }] },
  { needs: ["josh", "annie"], script: [{ who: "josh", text: "How's Gee Underwood doin?" }] },
  { needs: ["annie", "ana"], script: [{ who: ["annie", "ana"], text: "Silly boys!" }] },
  // "haircut gone wrong" - PLACEHOLDER lines, Ollie supplies the real story
  {
    needs: ["sam", "josh"],
    script: [
      { who: "josh", text: "My hair's never recovered, Sam." },
      { who: "sam", text: "It was ONE haircut!" },
    ],
  },
];
