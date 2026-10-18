// ============================================================
// SAVE WORDS: what a save word is made of (core/cloud.js, 18 Oct 2026).
// One word from each list and a number, like DISCO-SEAGULL-42.
//
// Ollie's to edit. Rules for a word: 3 to 9 capital letters, easy to
// spell from a screenshot, and nothing that could read as a dig at
// anyone, alone or beside any word in the other list (so no DONUT,
// no RAT, nothing about bodies). A word already handed out keeps
// working if its word is taken off a list: the game and the cloud
// only ever check a word's shape, never the lists.
// ============================================================

const SAVE_WORDS = {
  first: [
    "DISCO", "GOLDEN", "SNEAKY", "FUNKY", "JOLLY", "COSMIC", "BOUNCY", "SPARKLY",
    "SILVER", "TURBO", "FIZZY", "LUCKY", "MIGHTY", "SUNNY", "BRAVE", "CHEEKY",
    "CRISPY", "DIZZY", "FLUFFY", "FROSTY", "GIDDY", "GROOVY", "HAPPY", "JAZZY",
    "MAGIC", "MELLOW", "NIFTY", "PLUCKY", "PIXEL", "ROWDY", "SHINY", "SLEEPY",
    "SNAPPY", "SPEEDY", "SPICY", "SPOOKY", "STARRY", "STICKY", "SUPER", "SWEET",
    "TOASTY", "VELVET", "WILD", "ZESTY", "NEON", "RETRO", "ELECTRIC", "FOAMY",
    "MUDDY", "RAINY", "WINDY", "COMFY", "CUDDLY", "DAZZLING", "FANCY", "FEARLESS",
    "GENTLE", "GLITTERY", "HUNGRY", "HEROIC", "JUMPY", "KINDLY", "LEGENDARY", "LOVELY",
    "MERRY", "MIDNIGHT", "NOBLE", "PERKY", "POLKA", "PRANCING", "QUIRKY", "ROYAL",
    "SNOWY", "SPARKLING", "STORMY", "SUGARY", "SWANKY", "TWINKLY", "VINTAGE", "WACKY",
    "ZIPPY", "GLOSSY", "BREEZY", "CHIRPY", "DREAMY", "FEISTY", "GLAMOROUS", "HUMBLE",
    "MINTY", "PEACHY", "SPARKY", "ATOMIC", "BRILLIANT", "CLASSIC", "CRYSTAL", "DANDY",
    "EPIC", "FABULOUS", "FESTIVE", "FLYING", "FRESH", "GALACTIC", "GRAND", "LIVELY",
    "LUNAR", "MYSTIC", "RADIANT", "SOLAR", "SONIC", "SPRINGY", "STELLAR", "SUNLIT",
    "TROPICAL", "VIVID", "WOOLLY",
  ],
  second: [
    // the game's own rooms and things
    "GONZOS", "MISCHIEF", "BEEHIVE", "ROWANS", "PLAYHOUSE", "CATHEDRAL", "MARKET", "LIBRARY",
    "CANAL", "THAMES", "TRAIN", "PARK", "STAGE", "LECTURE", "FOAM", "SEAGULL",
    "MILPOOL", "POLAROID", "CAMERA", "VINYL", "SLEEVE", "PENNANT", "TROPHY", "PIGEON",
    "DEADLINE", "BOUNCER", "TOURIST", "PINT", "KEBAB", "CHIPS", "CANARY", "MUSTARD",
    "CASTLE", "BROADS",
    // and a pile of things that are nice to be
    "PIZZA", "TOAST", "NOODLE", "WAFFLE", "PANCAKE", "BISCUIT", "TEAPOT", "KETTLE",
    "SOFA", "JUKEBOX", "MIXTAPE", "CONFETTI", "BALLOON", "ROCKET", "COMET", "PLANET",
    "MOON", "SUNBURST", "RAINBOW", "UNICORN", "DRAGON", "OTTER", "BADGER", "HEDGEHOG",
    "FERRET", "PENGUIN", "LLAMA", "FOX", "OWL", "FROG", "DUCK", "SWAN",
    "GOOSE", "PUFFIN", "WALRUS", "PANDA", "KOALA", "TIGER", "LION", "HAMSTER",
    "CORGI", "ROBIN", "MAGPIE", "HERON", "PELICAN", "LOBSTER", "OCTOPUS", "BANANA",
    "MANGO", "LEMON", "CHERRY", "PICKLE", "PRETZEL", "CROISSANT", "BAGEL", "MUFFIN",
    "SCONE", "CUSTARD", "CRUMBLE", "POPCORN", "NACHO", "TACO", "DUMPLING", "GUITAR",
    "DRUM", "TRUMPET", "BANJO", "UKULELE", "TUBA", "PIANO", "BEANBAG", "HAMMOCK",
    "LAMP", "SCOOTER", "KITE", "FRISBEE", "PINBALL", "ARCADE", "JOYSTICK",
  ],
};
