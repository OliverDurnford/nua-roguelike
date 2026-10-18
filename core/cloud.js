// ============================================================
// CLOUD: the save word (18 Oct 2026). Some of the friends wanted to
// play on their iPads without losing what their phones had earned,
// and to swap back and forth (Ollie, launch night). A friend asks for
// a word, like DISCO-SEAGULL-42, types it on any other device once,
// and from then on every device with that word stays in step.
//
// The cloud end is a tiny Cloudflare Worker over a D1 database
// (tools/cloud/worker) that keeps one bundle per word with a version
// number and never combines anything itself. All the combining lives
// here, as plain functions with no screen and no storage, so it is
// tested once (node tools/tests/cloud.test.js).
//
// The standing rule: syncing never loses anything. Two devices'
// saves combine into one that holds everything either of them had:
// every friend found, cap, bonus person, said line and trophy, the
// EARLIER time for a trophy (the platinum's proof code is made from
// its minute), the larger of any count. The run in progress is the one
// thing that cannot be mixed, so the most recently saved wins whole.
//
// Design: docs/superpowers/specs/2026-10-18-cloud-save-design.md
// ============================================================

const CLOUD = {};

// ---------- the combining rules ----------

const cloudIsObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

// The "keep both, keep the larger" rule every save field follows unless it
// says otherwise. Both lists: everything in either, the first side's order
// then the second's new ones. Both numbers: the larger. Both yes/no: yes if
// either. Both objects: field by field, the same rule. One side missing: the
// other. Anything else (a name, a mismatch): the first side's.
CLOUD.combine = (a, b) => {
  if (a === undefined || a === null) return b === undefined ? a : b;
  if (b === undefined || b === null) return a;
  if (Array.isArray(a) && Array.isArray(b)) {
    const out = a.slice();
    for (const x of b) if (!out.includes(x)) out.push(x);
    return out;
  }
  if (typeof a === "number" && typeof b === "number") return Math.max(a, b);
  if (typeof a === "boolean" && typeof b === "boolean") return a || b;
  if (cloudIsObj(a) && cloudIsObj(b)) {
    const out = {};
    for (const k of Object.keys(a)) out[k] = CLOUD.combine(a[k], b[k]);
    for (const k of Object.keys(b)) if (!(k in out)) out[k] = b[k];
    return out;
  }
  return a;
};

CLOUD.mergeStory = (a, b) => CLOUD.combine(a, b);

// Trophies follow the rule, except the time each was earned: the EARLIER
// one is kept, so a trophy never seems to be won later than it was.
CLOUD.mergeTrophies = (a, b) => {
  const out = CLOUD.combine(a, b);
  if (out && a && b && cloudIsObj(a.earned) && cloudIsObj(b.earned)) {
    out.earned = {};
    for (const k of Object.keys(a.earned).concat(Object.keys(b.earned))) {
      const x = a.earned[k], y = b.earned[k];
      out.earned[k] = typeof x === "number" && typeof y === "number" ? Math.min(x, y) : (x === undefined ? y : x);
    }
  }
  return out;
};

// The run in progress: the later save wins whole (a finished run is a save
// of "no run", so it stays finished). A tie goes to the first side.
CLOUD.mergeRun = (a, b) => {
  if (!a) return b || { at: 0, save: null };
  if (!b) return a;
  return b.at > a.at ? b : a;
};

CLOUD.mergeDifficulty = (a, b) => {
  if (!a) return b || null;
  if (!b) return a;
  return b.at > a.at ? b : a;
};

// Anything from storage or the network, made safe to combine: a part of the
// wrong shape counts as missing, so a broken bundle can never take away.
CLOUD.clean = (b) => {
  const ok = cloudIsObj(b) && b.v === 1;
  const part = (p) => (ok && cloudIsObj(b[p]) && b[p].v === 1 ? b[p] : null);
  const run = ok && cloudIsObj(b.run) && typeof b.run.at === "number"
    && (b.run.save === null || cloudIsObj(b.run.save)) ? b.run : null;
  const diff = ok && cloudIsObj(b.difficulty) && typeof b.difficulty.at === "number"
    && typeof b.difficulty.level === "string" ? b.difficulty : null;
  return { v: 1, story: part("story"), trophies: part("trophies"), run: run || { at: 0, save: null }, difficulty: diff };
};

// Two devices' bundles in, one out. o.run is the join's picker: "local" or
// "remote" keeps that side's run whatever the times say.
CLOUD.merge = (local, remote, o = {}) => {
  const L = CLOUD.clean(local), R = CLOUD.clean(remote);
  const out = {
    v: 1,
    story: CLOUD.mergeStory(L.story, R.story),
    trophies: CLOUD.mergeTrophies(L.trophies, R.trophies),
    run: o.run === "local" ? L.run : o.run === "remote" ? R.run : CLOUD.mergeRun(L.run, R.run),
    difficulty: CLOUD.mergeDifficulty(L.difficulty, R.difficulty),
  };
  return JSON.parse(JSON.stringify(out));
};

// JSON with every object's keys in order, so two saves written in a different
// order still read as the same.
CLOUD.canon = (x) => JSON.stringify(x, (k, v) => (cloudIsObj(v)
  ? Object.keys(v).sort().reduce((o, key) => { o[key] = v[key]; return o; }, {})
  : v));
CLOUD.same = (a, b) => CLOUD.canon(a) === CLOUD.canon(b);

// What a friend will recognise, for the "is this yours?" card.
CLOUD.summary = (bundle) => {
  const b = CLOUD.clean(bundle);
  const s = b.story || {}, earned = (b.trophies && b.trophies.earned) || {};
  const r = b.run.save && b.run.save.run;
  return {
    caps: (s.caps || []).length,
    trophies: Object.keys(earned).filter((k) => k !== "platinum").length,
    platinum: earned.platinum !== undefined,
    bonus: (s.bonus || []).length,
    found: (s.found || []).length,
    run: r ? { charId: r.charId, chapter: r.chapter, area: r.area, scene: b.run.save.scene } : null,
  };
};

CLOUD.hasProgress = (bundle) => {
  const b = CLOUD.clean(bundle);
  const s = b.story || {};
  const any = (a) => Array.isArray(a) && a.length > 0;
  return !!b.run.save || any(s.found) || any(s.finished) || any(s.bonus) || any(s.caps)
    || Object.keys((b.trophies && b.trophies.earned) || {}).length > 0;
};

// ---------- the words ----------
// One from each list in data/savewords.js and a number from 10 to 99. Only
// the SHAPE is ever checked, so a word stays good if the lists change.
CLOUD.WORD_SHAPE = /^[A-Z]{2,12}-[A-Z]{2,12}-\d{2}$/;

CLOUD.makeWord = (rand = Math.random) => {
  const pick = (list) => list[Math.floor(rand() * list.length)];
  return pick(SAVE_WORDS.first) + "-" + pick(SAVE_WORDS.second) + "-" + (10 + Math.floor(rand() * 90));
};

// What a friend typed, forgiven: any case, spaces or dots for hyphens.
CLOUD.normWord = (s) => {
  if (typeof s !== "string") return null;
  const m = s.toUpperCase().match(/^\s*([A-Z]{2,12})[\s\-_.]+([A-Z]{2,12})[\s\-_.]*(\d{2})\s*$/);
  return m ? m[1] + "-" + m[2] + "-" + m[3] : null;
};
