// ============================================================
// TROPHIES: PlayStation-style trophies, kept on the device for good.
//
// The list (names, tiers, hidden or not) is data/trophies.js; every
// RULE is here, under the same id. The game reports what just
// happened with one-line calls, TROPHIES.note("bossDown", {...}),
// from the places it already happens, and this file decides what that
// earns. A note can never change play and never throws.
//
// Its own save, "tenyears-trophies", separate from the run checkpoint
// (core/save.js) and the story (core/story.js); neither ever wipes it.
// Storage refused means no trophies and nothing else changes.
//
// Earning one queues a pop-up card under PAUSE (TROPHIES.attach adds
// it to every scene, so the queue carries across room changes). The
// queue holds while the game is paused, a cut-in is up or a cutscene
// runs, so a trophy never talks over a moment.
//
// The platinum wins a real prize from Ollie, so it carries a proof
// code (TROPHIES.codeFor). Admin on, a cheat key or a console dev
// helper marks the device as tested for good, and its code reads
// TEST. The game's code is public, so this stops a Photoshopped
// screenshot, not someone who reads the source.
//
// Spec: docs/superpowers/specs/2026-10-16-trophies-design.md
// Tests: node tools/tests/trophies.test.js
// ============================================================

const TROPHIES = { KEY: "tenyears-trophies" };

// ---------- the numbers behind the rules ----------
TROPHIES.SONG_SECS = 20;      // a song counts once it has been audible this long
TROPHIES.CUE_SECS = 5;        // a short cue (The Cracks, under the tutorial's quake) sooner
TROPHIES.FOAM_SECS = 20;      // Foam Party: standing still in the Foam Pit
TROPHIES.CANAL_RUSH = 0.58;   // Not Ready to Go: past here the cracks rush in (scenes/area.js)
TROPHIES.CANAL_HOME = 60;     // px from where you came in counts as back at the start
TROPHIES.OVERKILL = 8;        // kills from one special
TROPHIES.COUNTED = {          // trophy id: [enemy id, how many]
  seagulls: ["seagull", 50],
  deadlines: ["deadline", 50],
};
TROPHIES.BOSSES = { dj: "dj", dean: "dean", dean_grad: "grad", covid_boss: "covid" };
TROPHIES.HUG_DELAY = 3;       // seconds: the trophy waits for the moment to finish
TROPHIES.KISS_DELAY = 3.5;
TROPHIES.ENDING_HOLD = 3;     // the ending's first seconds are the ending's

// ---------- the save ----------
TROPHIES.blank = () => ({ v: 1, earned: {}, counts: {}, sets: {}, tested: false, seenPlatinum: false });
TROPHIES._s = null;

TROPHIES.get = () => {
  if (TROPHIES._s) return TROPHIES._s;
  let s = null;
  try { s = JSON.parse(localStorage.getItem(TROPHIES.KEY) || "null"); } catch (e) { s = null; }
  if (!s || s.v !== 1 || typeof s.earned !== "object" || !s.earned) s = TROPHIES.blank();
  if (!s.counts) s.counts = {};
  if (!s.sets) s.sets = {};
  TROPHIES._s = s;
  return s;
};

TROPHIES.save = () => {
  try { localStorage.setItem(TROPHIES.KEY, JSON.stringify(TROPHIES.get())); } catch (e) {}
};

TROPHIES.clear = () => {
  TROPHIES._s = null;
  TROPHIES._songT = null;
  TROPHIES.queue.length = 0;
  TROPHIES.showing = null;
  try { localStorage.removeItem(TROPHIES.KEY); } catch (e) {}
};

TROPHIES.now = () => Date.now();

// ---------- the list ----------
TROPHIES.list = () => TROPHY_LIST;
TROPHIES.all = () => TROPHY_LIST.concat([TROPHY_PLATINUM]);
TROPHIES.def = (id) => TROPHIES.all().find((t) => t.id === id) || null;
TROPHIES.has = (id) => TROPHIES.get().earned[id] !== undefined;
TROPHIES.earnedCount = () => TROPHY_LIST.filter((t) => TROPHIES.has(t.id)).length;
TROPHIES.ten = () => (typeof CHARACTERS !== "undefined" ? CHARACTERS.map((c) => c.id) : []);

// ---------- earning ----------
TROPHIES.queue = [];      // { id, wait }: pop-ups still to show, oldest first
TROPHIES.showing = null;  // { id, t }: the one on screen
TROPHIES.holdT = 0;       // seconds every pop-up waits regardless (the ending)

// Earn one. o.silent: no pop-up (credit for the past). o.delay: seconds
// the pop-up waits once nothing is holding it. False if already held.
TROPHIES.earn = (id, o = {}) => {
  const s = TROPHIES.get();
  if (!TROPHIES.def(id) || s.earned[id] !== undefined) return false;
  s.earned[id] = TROPHIES.now();
  if (id === "platinum") s.seenPlatinum = false;
  TROPHIES.save();
  if (!o.silent) TROPHIES.queue.push({ id, wait: o.delay || 0 });
  if (id !== "platinum" && TROPHY_LIST.every((t) => TROPHIES.has(t.id))) TROPHIES.earn("platinum", o);
  return true;
};

TROPHIES.bump = (key, n = 1) => {
  const c = TROPHIES.get().counts;
  c[key] = (c[key] || 0) + n;
  TROPHIES.save();
  return c[key];
};

TROPHIES.addTo = (key, val) => {
  const sets = TROPHIES.get().sets;
  const a = sets[key] || (sets[key] = []);
  if (!a.includes(val)) { a.push(val); TROPHIES.save(); }
  return a;
};

// ---------- progress, for the counted trophies ----------
// Every song the game really plays somewhere: whatever each room deals,
// the four slots that are not rooms, and the cues played by name. Worked
// out from the soundtrack data, so a song given a room later counts by
// itself, and one with nowhere to play never does (Ollie, 15 Oct 2026).
TROPHIES.playableSongs = () => {
  if (typeof TRACKS === "undefined") return [];
  const ids = [];
  const keep = (t) => { if (t && !ids.includes(t.id)) ids.push(t.id); };
  for (const t of TRACKS) {
    if (t.mood === "cue") keep(t);
    if ((t.areas || []).some((k) => ["title", "select", "tutorial", "ending"].includes(k))) keep(t);
  }
  if (typeof CHAPTERS !== "undefined" && typeof SOUNDTRACK !== "undefined") {
    CHAPTERS.forEach((ch, ci) => ch.areas.forEach((a, ai) => keep(SOUNDTRACK.forArea(ci + 1, ai + 1, a))));
  }
  return ids;
};

TROPHIES.progress = (id) => {
  const s = TROPHIES.get(), ten = TROPHIES.ten();
  const st = typeof STORY !== "undefined" ? STORY.get() : { found: [], finished: [], bonus: [], caps: [] };
  const inTen = (arr) => ten.filter((x) => (arr || []).includes(x)).length;
  if (TROPHIES.COUNTED[id]) {
    const [key, of] = TROPHIES.COUNTED[id];
    return { n: Math.min(of, s.counts[key] || 0), of };
  }
  switch (id) {
    case "reunion": {
      const met = st.found.concat(st.finished);
      if (typeof G !== "undefined" && G.run && G.run.charId) met.push(G.run.charId);
      return { n: inTen(met), of: ten.length };
    }
    case "wholegroup": return { n: inTen(st.finished), of: ten.length };
    case "repertoire": return { n: inTen(s.sets.specials), of: ten.length };
    case "fidgets": return { n: inTen(s.sets.fidgets), of: ten.length };
    case "fullset": return { n: (st.caps || []).length, of: typeof CAPS !== "undefined" ? CAPS.TOTAL : 5 };
    case "everyone": {
      const all = typeof BONUS_CHARACTERS !== "undefined" ? BONUS_CHARACTERS.map((b) => b.id) : [];
      return { n: all.filter((x) => (st.bonus || []).includes(x)).length, of: all.length };
    }
    case "music": {
      const p = TROPHIES.playableSongs(), heard = s.sets.songs || [];
      return { n: p.filter((x) => heard.includes(x)).length, of: p.length };
    }
  }
  return null;
};

TROPHIES.checkProgress = (ids, o) => {
  for (const id of ids) {
    const p = TROPHIES.progress(id);
    if (p && p.of > 0 && p.n >= p.of) TROPHIES.earn(id, o);
  }
};

// Everything the story save already knows: friends found and finished
// as, wins, bonus finds and caps. Run once at load without pop-ups (so
// nobody loses what they did before trophies arrived), then after every
// story write.
TROPHIES.checkStory = (o = {}) => {
  if (typeof STORY === "undefined") return;
  const st = STORY.get();
  if (st.found.length || st.wins) TROPHIES.earn("freshers", o);
  if (st.found.length) TROPHIES.earn("plusone", o);
  if (st.wins) for (const id of ["dj", "dean", "grad", "covid", "pub"]) TROPHIES.earn(id, o);
  if ((st.caps || []).length) TROPHIES.earn("hatsoff", o);
  TROPHIES.checkProgress(["reunion", "wholegroup", "fullset", "everyone"], o);
};

// ---------- what the game reports ----------
TROPHIES.room = null;      // the room being played, for the rules that need it
TROPHIES._spKills = null;  // kills counted while a special lands, else null
TROPHIES._songT = null;    // track id -> seconds heard, kept in the save's counts as "song:<id>"

TROPHIES.note = (ev, d = {}) => {
  try { TROPHIES._note(ev, d); } catch (e) { /* trophies are decoration: never break the game */ }
};

TROPHIES._note = (ev, d) => {
  const r = typeof G !== "undefined" ? G.run : null;
  const earn = TROPHIES.earn;
  switch (ev) {
    case "areaEnter": {
      const a = d.a || {};
      TROPHIES.room = { chapter: d.chapter, area: d.area, foam: !!a.foam, dread: !!a.dread, foamT: 0, canal: null, fresh: true };
      if (d.chapter === 1 && d.area === 1) earn("freshers");
      if (!r) return;
      const t = r.trophy || (r.trophy = {});
      // a chapter run clean from its first room (a death anywhere but a
      // boss sends you back to that first room, which starts it again)
      if (d.area === 1 && !d.retry) { t.ch = d.chapter; t.chDeaths = r.deaths; t.chEasy = false; }
      if (a.boss) t.hits = 0;
      // the skill trophies need Medium or Hard (Ollie, 16 Oct 2026): a room,
      // chapter or run that any of was played on Easy does not count
      t.roomEasy = false;
      if (typeof DIFFICULTY !== "undefined" && DIFFICULTY.level === "easy") TROPHIES._note("easy", {});
      // With Distinction: Hard from Gonzo's to the end (Ollie, 16 Oct 2026).
      // Set once, on the run's first visit to Gonzo's; anything else, ever, loses it.
      if (d.chapter === 1 && d.area === 1 && t.allHard === undefined) t.allHard = TROPHIES.onHard();
      TROPHIES.checkHard();
      return;
    }
    case "easy": {
      if (!r) return;
      const t = r.trophy || (r.trophy = {});
      t.roomEasy = t.chEasy = t.runEasy = true;
      return;
    }
    case "hurt":
      if (r && r.trophy) r.trophy.hits = (r.trophy.hits || 0) + 1;
      return;
    case "death":
      if (d.chapter === 1 && d.area === 1) earn("flu");
      return;
    case "bossDown": {
      if (TROPHIES.BOSSES[d.id]) earn(TROPHIES.BOSSES[d.id]);
      if (!r) return;
      const t = r.trophy || {};
      if (!t.roomEasy && r.hp === 1) earn("lastorders");
      if (!t.roomEasy && t.hits === 0) earn("cleansheet");
      if (!t.chEasy && t.ch === r.chapter && t.chDeaths === r.deaths) earn("chapter");
      return;
    }
    case "finish": {
      // the ending's opening seconds belong to the ending
      TROPHIES.holdT = Math.max(TROPHIES.holdT, TROPHIES.ENDING_HOLD);
      const run = d.run || r;
      earn("pub");
      const easy = !!(run && run.trophy && run.trophy.runEasy);
      if (run && !easy && run.deaths === 0) earn("noregrets");
      if (run && !easy && !run.companions.length) earn("billy");
      if (run && run.trophy && run.trophy.allHard === true) earn("distinction");
      return;
    }
    case "recruit":
      earn("plusone");
      if (r && r.companions.length >= 4) earn("squad");
      return;
    case "special":
      earn("special");
      if (d.id) TROPHIES.addTo("specials", d.id);
      TROPHIES.checkProgress(["repertoire"]);
      return;
    case "specialStart":
      TROPHIES._spKills = 0;
      return;
    case "specialEnd":
      if (TROPHIES._spKills !== null && TROPHIES._spKills >= TROPHIES.OVERKILL) earn("overkill");
      TROPHIES._spKills = null;
      return;
    case "kill":
      if (TROPHIES._spKills !== null) TROPHIES._spKills++;
      if (d.eid) {
        TROPHIES.bump(d.eid);
        for (const id in TROPHIES.COUNTED) if (TROPHIES.COUNTED[id][0] === d.eid) TROPHIES.checkProgress([id]);
      }
      return;
    case "title": earn("title"); return;
    case "voice": earn("voice"); return;
    case "hug": earn("hug", { delay: TROPHIES.HUG_DELAY }); return;
    case "kiss": earn("kiss", { delay: TROPHIES.KISS_DELAY }); return;
    case "fidget":
      if (d.id) TROPHIES.addTo("fidgets", d.id);
      TROPHIES.checkProgress(["fidgets"]);
      return;
    case "canal": {
      const room = TROPHIES.room;
      if (!room || !room.dread || !d.w) return;
      if (!room.canal) room.canal = { start: d.x, rushed: false };
      if (d.x / d.w > TROPHIES.CANAL_RUSH) room.canal.rushed = true;
      if (room.canal.rushed && d.x <= room.canal.start + TROPHIES.CANAL_HOME) earn("canal");
      return;
    }
    case "story": TROPHIES.checkStory(); return;
  }
};

// With Distinction: the run stays on Hard. Checked on every room and every
// frame, so a switch down in the pause menu loses it as soon as play resumes.
TROPHIES.onHard = () => typeof DIFFICULTY !== "undefined" && DIFFICULTY.level === "hard";
TROPHIES.checkHard = () => {
  const r = typeof G !== "undefined" ? G.run : null;
  if (r && r.trophy && r.trophy.allHard && !TROPHIES.onHard()) r.trophy.allHard = false;
};

// Once a frame, from the scene (TROPHIES.attach). c: { paused, standing,
// song, audible, hold }. Returns the id of a pop-up that has just started.
TROPHIES.tick = (dt, c) => {
  const s = TROPHIES.get();
  TROPHIES.checkHard();
  // the music: heard means sounding, with the sound on, for long enough
  if (c.song && c.audible && !(s.sets.songs || []).includes(c.song.id)) {
    const id = c.song.id, T = TROPHIES.songTimes();
    T[id] = (T[id] || 0) + dt;
    const need = c.song.mood === "cue" ? TROPHIES.CUE_SECS : TROPHIES.SONG_SECS;
    if (T[id] >= need) {
      TROPHIES.addTo("songs", id);
      TROPHIES.checkProgress(["music"]);
    }
  }
  // standing still in the foam
  const room = TROPHIES.room;
  if (room && room.foam && !c.paused) {
    room.foamT = c.standing ? room.foamT + dt : 0;
    if (room.foamT >= TROPHIES.FOAM_SECS) TROPHIES.earn("foam");
  }
  return TROPHIES.tickQueue(dt, c.hold);
};

// Seconds heard so far of songs not yet counted. Kept in memory and written
// to the save at each scene change, so a song heard in short visits (the
// select screen) still adds up across days.
TROPHIES.songTimes = () => {
  if (!TROPHIES._songT) {
    TROPHIES._songT = {};
    const c = TROPHIES.get().counts;
    for (const k in c) if (k.indexOf("song:") === 0) TROPHIES._songT[k.slice(5)] = c[k];
  }
  return TROPHIES._songT;
};
TROPHIES.flushSongs = () => {
  if (!TROPHIES._songT) return;
  const c = TROPHIES.get().counts, heard = TROPHIES.get().sets.songs || [];
  for (const id in TROPHIES._songT) {
    if (heard.includes(id)) delete c["song:" + id];
    else c["song:" + id] = Math.round(TROPHIES._songT[id] * 10) / 10;
  }
  TROPHIES.save();
};

TROPHIES.POP = { IN: 0.3, HOLD: 3.0, OUT: 0.35 };

TROPHIES.tickQueue = (dt, hold) => {
  if (TROPHIES.holdT > 0) { TROPHIES.holdT -= dt; return null; }
  const sh = TROPHIES.showing;
  if (sh) {
    sh.t += dt;
    const P = TROPHIES.POP;
    if (sh.t >= P.IN + P.HOLD + P.OUT) TROPHIES.showing = null;
    return null;
  }
  const q = TROPHIES.queue;
  if (hold || !q.length) return null;
  if (q[0].wait > 0) { q[0].wait -= dt; return null; }
  TROPHIES.showing = { id: q.shift().id, t: 0 };
  return TROPHIES.showing.id;
};

// ---------- the honest prize ----------
TROPHIES.taint = () => {
  const s = TROPHIES.get();
  if (!s.tested) { s.tested = true; TROPHIES.save(); }
};

TROPHIES.SECRET = "nua-2016:ten-years:gonzos";
TROPHIES.ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // no I, O, 0 or 1 to misread
TROPHIES.FIRST = Date.UTC(2026, 9, 15);                 // nobody had trophies before this

// cyrb53, a small well-mixed 53-bit string hash
TROPHIES.hash = (str) => {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// Eight letters from the minute the platinum was earned. Shown beside
// that time on the platinum screen; tools/trophies/check.html finds the
// minute that makes a code, or says it is not real.
TROPHIES.codeFor = (ts) => {
  let h = TROPHIES.hash(TROPHIES.SECRET + ":" + Math.floor(ts / 60000));
  let out = "";
  for (let i = 0; i < 8; i++) { out += TROPHIES.ALPHA[h % 32]; h = Math.floor(h / 32); }
  return out.slice(0, 4) + "-" + out.slice(4);
};

// The minute (ms) a code was made in, searching from FIRST to `until`, or null.
TROPHIES.verify = (code, until = Date.now() + 2 * 864e5) => {
  const want = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (want.length !== 8) return null;
  for (let m = Math.floor(TROPHIES.FIRST / 60000); m * 60000 <= until; m++) {
    if (TROPHIES.codeFor(m * 60000).replace("-", "") === want) return m * 60000;
  }
  return null;
};

TROPHIES.proof = () => {
  const s = TROPHIES.get();
  const ts = s.earned.platinum;
  if (ts === undefined) return null;
  return { ts, code: s.tested ? "TEST" : TROPHIES.codeFor(ts) };
};

TROPHIES.platinumNew = () => TROPHIES.has("platinum") && !TROPHIES.get().seenPlatinum;

// "16 Oct 2026" and "16 Oct 2026, 21:14", UK style
TROPHIES.day = (ts) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
TROPHIES.when = (ts) => TROPHIES.day(ts) + ", " + new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// ---------- drawing (Kaboom, browser only) ----------
// The cup, a 16 x 14 pixel drawing: # ink, H highlight, O body, S shade.
TROPHIES.CUP = [
  "..############..",
  "##HHHOOOOOOOOS##",
  "#.#HOOOOOOOOS#.#",
  "#.#HOOOOOOOOS#.#",
  "#..#HOOOOOOS#..#",
  ".#.#HOOOOOOS#.#.",
  "..##HOOOOOOS##..",
  "....#HOOOOS#....",
  ".....#HOOS#.....",
  "......#OS#......",
  "......#OS#......",
  ".....#HOOS#.....",
  "....#HOOOOS#....",
  "....########....",
];
// True colours for the cups only; everything round them stays silver and
// blue (Ollie, 16 Oct 2026). Gold is the special screens' own gold.
TROPHIES.TIER = {
  bronze: { O: [205, 127, 50], H: [242, 180, 116], S: [140, 80, 30] },
  silver: { O: [200, 206, 222], H: [255, 255, 255], S: [126, 134, 158] },
  gold: { O: [255, 200, 46], H: [255, 244, 170], S: [190, 112, 16] },
  platinum: { O: [190, 222, 240], H: [255, 255, 255], S: [104, 146, 190] },
};

// A cup at (x, y), `px` screen pixels to a drawing pixel. locked: grey.
TROPHIES.drawCup = (x, y, tier, px = 2, op = 1, locked = false) => {
  const pal = TROPHIES.TIER[tier] || TROPHIES.TIER.bronze;
  TROPHIES.CUP.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === ".") continue;
      const col = ch === "#" ? UI.INK : locked ? UI.GREY : pal[ch];
      UI.R(x + i * px, y + j * px, px, px, col, locked && ch !== "#" ? op * 0.7 : op);
    }
  });
};

TROPHIES.popY = () => (typeof isTouchscreen === "function" && isTouchscreen() ? 46 : 36);

TROPHIES.drawPop = () => {
  const sh = TROPHIES.showing;
  if (!sh) return;
  const d = TROPHIES.def(sh.id);
  if (!d) return;
  const P = TROPHIES.POP;
  const k = sh.t < P.IN ? 1 - Math.pow(1 - sh.t / P.IN, 3)
    : sh.t > P.IN + P.HOLD ? Math.max(0, 1 - (sh.t - P.IN - P.HOLD) / P.OUT) : 1;
  // Compact (Ollie, 16 Oct: "too big, make them smaller but still able to be
  // seen on a phone"): the name in VT323 at 16, the size of the speech notes
  // everyone already reads on a phone, at half the width of the pixel face.
  const head = d.tier === "platinum" ? "PLATINUM EARNED" : "TROPHY EARNED";
  const nameW = Math.ceil(UI.measure(d.name, UI.VT, 16).width);
  const headW = Math.ceil(UI.measure(head, UI.PX, 8).width);
  const w = 8 + 32 + 8 + Math.max(nameW, headW) + 12, h = 40;
  // it fades in dropping a few pixels, so it never slides through PAUSE above it
  const x = Math.round(G.W / 2 - w / 2), y = Math.round(TROPHIES.popY() - (1 - k) * 8);
  UI.card(vec2(x, y), w, h, { drop: 2, opacity: k });
  TROPHIES.drawCup(x + 8, y + 6, d.tier, 2, k);
  UI.label(head, x + 48, y + 7, { size: 8, color: UI.BLUE_DEEP, shadow: false, opacity: k });
  UI.text(d.name, x + 48, y + 17, { size: 16, color: UI.TEXT, opacity: k });
};

// The end screen holds them for as long as it is up, so nothing covers
// Ollie's message or the run's listing (Ollie, 17 Oct 2026): they show
// once you are back on the title. scenes/ending.js raises it.
TROPHIES.endingHold = false;
TROPHIES.holding = () => !!(
  TROPHIES.endingHold
  || (typeof G !== "undefined" && (G.paused || G.cutscene || G.where === "platinum"))   // nothing over the screenshot
  || (typeof UI !== "undefined" && UI.pauseOpen)
  || (typeof CUTIN !== "undefined" && CUTIN.active)
  || (typeof LOADER !== "undefined" && !LOADER.done)
);

// Every scene gets the pop-up layer (see the scene() wrapper below).
TROPHIES.attach = () => {
  TROPHIES.flushSongs();
  // a room is only the trophies' room in the scene that announced it
  if (TROPHIES.room && TROPHIES.room.fresh) TROPHIES.room.fresh = false;
  else TROPHIES.room = null;
  const layer = add([pos(0, 0), fixed(), z(225)]);
  layer.onUpdate(() => {
    const pl = TROPHIES.room ? get("player")[0] : null;
    const song = SOUNDTRACK.current;
    const audible = !!song && !SFX.muted && !SOUNDTRACK._out && SOUNDTRACK.time() !== null;
    const started = TROPHIES.tick(dt(), {
      paused: !!G.paused, standing: !!(pl && pl.standing), song, audible, hold: TROPHIES.holding(),
    });
    if (started) SFX.play(started === "platinum" ? "platinum" : "trophy");
  });
  layer.onDraw(TROPHIES.drawPop);
};

// ---------- wiring ----------
// Every scene registered after this file gets TROPHIES.attach() once its
// own set-up has run, so the pop-up layer sits in all of them.
if (typeof scene === "function") {
  const _scene = scene;
  globalThis.scene = (name, fn) => _scene(name, (...args) => { fn(...args); TROPHIES.attach(); });
}

// Any story write may complete a trophy (friends found, finished, caps,
// bonus finds).
if (typeof STORY !== "undefined") {
  const _set = STORY.set;
  STORY.set = (s) => { _set(s); TROPHIES.note("story"); };
}

// Admin on, now or ever, marks this device as tested.
if (typeof ADMIN !== "undefined") {
  const _adminSet = ADMIN.set;
  ADMIN.set = (on) => { if (on) TROPHIES.taint(); return _adminSet(on); };
  if (ADMIN.on) TROPHIES.taint();
}

// Credit for the past, quietly.
TROPHIES.checkStory({ silent: true });
