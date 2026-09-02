// ============================================================
// SOUNDTRACK DATA - the real songs, and where each one plays.
//
// mood:  "general" | "quiet" | "boss"
//        Used when no area is named explicitly. Quiet areas and
//        boss arenas are flagged in data/chapters.js.
// areas: chapter-area keys like "1-3", or "title" for the title
//        screen. An explicit key always beats the mood pool.
//
// Ollie assigns these. See ../docs/soundtrack-labelling.md (one level
// above this repo's root, so it is not tracked in here).
// ============================================================

const TRACKS = [
  { id: "24k-magic-8-bit", title: "24K Magic (8-Bit)", file: "24k-magic-8-bit.m4a", mood: "general", areas: [] },
  { id: "alien-boy", title: "Alien Boy", file: "alien-boy.m4a", mood: "general", areas: [] },
  { id: "all-star-8-bit", title: "All Star (8-Bit)", file: "all-star-8-bit.m4a", mood: "general", areas: [] },
  { id: "bitch-i-m-a-cow", title: "Bitch I'm a Cow", file: "bitch-i-m-a-cow.m4a", mood: "general", areas: [] },
  { id: "blue-da-ba-dee-8-bit", title: "Blue (Da Ba Dee) (8-Bit)", file: "blue-da-ba-dee-8-bit.m4a", mood: "general", areas: [] },
  { id: "busy-earnin-8-bit", title: "Busy Earnin' (8-Bit)", file: "busy-earnin-8-bit.m4a", mood: "general", areas: [] },
  { id: "cheerleader-8-bit", title: "Cheerleader (8-Bit)", file: "cheerleader-8-bit.m4a", mood: "general", areas: [] },
  { id: "dare-8-bit", title: "Dare (8-Bit)", file: "dare-8-bit.m4a", mood: "general", areas: ["title"] },
  { id: "despacito-8-bit", title: "Despacito (8-Bit)", file: "despacito-8-bit.m4a", mood: "general", areas: [] },
  { id: "get-down-saturday-night", title: "Get Down Saturday Night", file: "get-down-saturday-night.m4a", mood: "general", areas: [] },
  { id: "harder-better-faster-stronger-8-bit", title: "Harder Better Faster Stronger (8-Bit)", file: "harder-better-faster-stronger-8-bit.m4a", mood: "general", areas: [] },
  { id: "hey-ya-8-bit", title: "Hey Ya (8-Bit)", file: "hey-ya-8-bit.m4a", mood: "general", areas: [] },
  { id: "i-bet-you-look-good-on-the-dancefloor", title: "I Bet You Look Good on the Dancefloor", file: "i-bet-you-look-good-on-the-dancefloor.m4a", mood: "general", areas: [] },
  { id: "i-love-it", title: "I Love It", file: "i-love-it.m4a", mood: "general", areas: [] },
  { id: "mas-que-nada", title: "Mas Que Nada", file: "mas-que-nada.m4a", mood: "general", areas: [] },
  { id: "mr-brightside-8-bit", title: "Mr Brightside (8-Bit)", file: "mr-brightside-8-bit.m4a", mood: "general", areas: [] },
  { id: "nothing-like-this", title: "Nothing Like This", file: "nothing-like-this.m4a", mood: "general", areas: [] },
  { id: "one-dance-8-bit", title: "One Dance (8-Bit)", file: "one-dance-8-bit.m4a", mood: "general", areas: [] },
  { id: "radioactive-8-bit", title: "Radioactive (8-Bit)", file: "radioactive-8-bit.m4a", mood: "general", areas: [] },
  { id: "scatman-8-bit", title: "Scatman (8-Bit)", file: "scatman-8-bit.m4a", mood: "general", areas: [] },
  { id: "smells-like-teen-spirit-8-bit", title: "Smells Like Teen Spirit (8-Bit)", file: "smells-like-teen-spirit-8-bit.m4a", mood: "general", areas: [] },
  { id: "somebody-that-i-used-to-know-8-bit", title: "Somebody That I Used to Know (8-Bit)", file: "somebody-that-i-used-to-know-8-bit.m4a", mood: "general", areas: [] },
  { id: "sorry-8-bit", title: "Sorry (8-Bit)", file: "sorry-8-bit.m4a", mood: "general", areas: [] },
  { id: "starboy-8-bit", title: "Starboy (8-Bit)", file: "starboy-8-bit.m4a", mood: "general", areas: [] },
  { id: "summertime-magic", title: "Summertime Magic", file: "summertime-magic.m4a", mood: "general", areas: [] },
  { id: "thriller-8-bit", title: "Thriller (8-Bit)", file: "thriller-8-bit.m4a", mood: "general", areas: [] },
  { id: "tieduprightnow-8-bit", title: "Tieduprightnow (8-Bit)", file: "tieduprightnow-8-bit.m4a", mood: "general", areas: [] },
  { id: "tieduprightnow", title: "Tieduprightnow", file: "tieduprightnow.m4a", mood: "general", areas: [] },
  { id: "uptown-funk-8-bit", title: "Uptown Funk (8-Bit)", file: "uptown-funk-8-bit.m4a", mood: "general", areas: [] },
  { id: "viva-la-vida-8-bit", title: "Viva La Vida (8-Bit)", file: "viva-la-vida-8-bit.m4a", mood: "general", areas: [] },
  { id: "welcome-to-the-jungle-8-bit", title: "Welcome to the Jungle (8-Bit)", file: "welcome-to-the-jungle-8-bit.m4a", mood: "general", areas: [] },
  { id: "where-are-u-now-8-bit", title: "Where Are U Now (8-Bit)", file: "where-are-u-now-8-bit.m4a", mood: "general", areas: [] },
  { id: "white-noise", title: "White Noise", file: "white-noise.m4a", mood: "boss", areas: [] },
  { id: "ispy", title: "iSpy", file: "ispy.m4a", mood: "general", areas: [] },
];
