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

// ============================================================
// The sync itself. Off until a device has a word, and always quiet:
// the game never waits on the cloud except the title's press, and only
// with a word set, for at most SETTLE_MS. Every failure is silent and
// tried again later; each device's own save always stays in charge of
// itself, so a cloud that is slow, gone or broken changes nothing.
// ============================================================

CLOUD.KEY = "tenyears-cloud";   // this device's word, version and time stamps
CLOUD.KEYS = { story: "tenyears-story", trophies: "tenyears-trophies", run: "tenyears-run", difficulty: "tenyears-difficulty" };
CLOUD.LIVE = "";                // the Worker's address once deployed (tools/cloud/README.md)
CLOUD.URL = CLOUD.LIVE;
CLOUD.PUSH_WAIT = 3000;         // ms after the first change before it goes up
CLOUD.SETTLE_MS = 4000;         // the longest the title waits for the first pull
CLOUD.RETRY_MS = 30000;         // a failed push tries again this much later
CLOUD.CALL_MS = 15000;          // a request that takes longer than this has failed
CLOUD.force = false;            // tests: on whatever the address
CLOUD.overridden = false;       // ?cloud=<address> on localhost: a local test Worker
CLOUD.applying = false;         // writing a combined save: the hooks keep out of it
CLOUD.dirty = false;            // something changed that the cloud has not had yet
CLOUD.last = null;              // "synced" | "offline": how the last call went
CLOUD.onApplied = null;         // (changedRun) => {}: the title refreshes itself
CLOUD.fetch = (u, o) => fetch(u, o);
CLOUD.now = () => Date.now();
CLOUD.timer = (fn, ms) => setTimeout(fn, ms);
CLOUD.untimer = (t) => clearTimeout(t);

// Only on Ollie's own machine can the address be swapped for a test Worker:
// a link with ?cloud= in it can never send a friend's save anywhere else.
(() => {
  try {
    if (typeof location === "undefined" || !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
    const m = /[?&]cloud=([^&]+)/.exec(location.search || "");
    const u = m && decodeURIComponent(m[1]);
    if (u && /^https?:\/\/\S+$/.test(u)) { CLOUD.URL = u.replace(/\/+$/, ""); CLOUD.overridden = true; }
  } catch (e) {}
})();

// ---------- this device's storage ----------
const cloudGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const cloudSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const cloudDel = (k) => { try { localStorage.removeItem(k); } catch (e) {} };
const cloudJSON = (k) => { try { return JSON.parse(cloudGet(k) || "null"); } catch (e) { return null; } };

CLOUD._storage = null;
CLOUD.storageOk = () => {
  if (CLOUD._storage === null) {
    try {
      localStorage.setItem("tenyears-cloud-probe", "1");
      localStorage.removeItem("tenyears-cloud-probe");
      CLOUD._storage = true;
    } catch (e) { CLOUD._storage = false; }
  }
  return CLOUD._storage;
};

// Never on Ollie's machine, under ?headless or in node, unless a test
// asks for it: Claude's own testing must never write to the real cloud.
CLOUD.enabled = () => {
  if (!CLOUD.URL || !CLOUD.storageOk()) return false;
  if (CLOUD.force || CLOUD.overridden) return true;
  if (typeof location === "undefined") return false;
  if (/[?&]headless/.test(location.search || "")) return false;
  return !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
};

CLOUD._meta = null;
CLOUD.meta = () => {
  if (!CLOUD._meta) {
    const m = cloudJSON(CLOUD.KEY);
    CLOUD._meta = Object.assign({ word: null, version: 0, runAt: 0, diffAt: 0, lastSync: 0 }, cloudIsObj(m) ? m : {});
  }
  return CLOUD._meta;
};
CLOUD.setMeta = (patch) => {
  CLOUD._meta = Object.assign({}, CLOUD.meta(), patch);
  cloudSet(CLOUD.KEY, JSON.stringify(CLOUD._meta));
};

// The four synced saves as one bundle, with the times the run and the
// difficulty last changed on this device.
CLOUD.read = () => {
  const m = CLOUD.meta();
  const level = cloudGet(CLOUD.KEYS.difficulty);
  return CLOUD.clean({
    v: 1,
    story: cloudJSON(CLOUD.KEYS.story),
    trophies: cloudJSON(CLOUD.KEYS.trophies),
    run: { at: m.runAt, save: cloudJSON(CLOUD.KEYS.run) },
    difficulty: level ? { at: m.diffAt, level } : null,
  });
};

CLOUD.playing = () => typeof G !== "undefined" && !!G.run && (G.where === "area" || G.where === "tutorial");

// Write a combined bundle back. o.keepRun leaves the run alone (it is being
// played). Afterwards anything the combination completes is earned, with
// its pop-up, exactly as if won in play; trophies that simply arrived from
// the other device arrive quietly.
CLOUD.apply = (b, o = {}) => {
  const before = CLOUD.read();
  CLOUD.applying = true;
  try {
    if (b.story) cloudSet(CLOUD.KEYS.story, JSON.stringify(b.story));
    if (b.trophies) cloudSet(CLOUD.KEYS.trophies, JSON.stringify(b.trophies));
    if (!o.keepRun) {
      if (b.run.save) cloudSet(CLOUD.KEYS.run, JSON.stringify(b.run.save));
      else cloudDel(CLOUD.KEYS.run);
    }
    CLOUD.setMeta({ runAt: b.run.at });
    if (b.difficulty) {
      CLOUD.setMeta({ diffAt: b.difficulty.at });
      const lvl = b.difficulty.level;
      if (typeof DIFFICULTY === "undefined") cloudSet(CLOUD.KEYS.difficulty, lvl);
      else if (DIFFICULTY.LEVELS[lvl] && lvl !== DIFFICULTY.level) DIFFICULTY.set(lvl);
    }
  } finally { CLOUD.applying = false; }
  if (typeof TROPHIES !== "undefined") {
    TROPHIES._s = null;
    try {
      TROPHIES.checkStory();
      TROPHIES.checkProgress(["repertoire", "fidgets", "music"].concat(Object.keys(TROPHIES.COUNTED || {})));
      if (!TROPHIES.has("platinum") && TROPHIES.list().every((t) => TROPHIES.has(t.id))) TROPHIES.earn("platinum");
    } catch (e) { /* trophies are decoration: never break the sync */ }
  }
  const changedRun = !o.keepRun && !CLOUD.same(before.run.save, b.run.save);
  if (CLOUD.onApplied) { try { CLOUD.onApplied(changedRun); } catch (e) {} }
};

// ---------- talking to the cloud ----------
CLOUD.call = async (method, word, body, o = {}) => {
  const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const t = ctl ? CLOUD.timer(() => ctl.abort(), CLOUD.CALL_MS) : null;
  try {
    const init = method === "GET"
      ? { method: "GET", cache: "no-store" }
      : { method: "POST", headers: { "content-type": "text/plain" }, body: JSON.stringify(body), keepalive: !!o.keepalive };
    if (ctl) init.signal = ctl.signal;
    const res = await CLOUD.fetch(CLOUD.URL + "/v1/save/" + encodeURIComponent(word), init);
    let json = null;
    try { json = JSON.parse(await res.text()); } catch (e) {}
    return { status: res.status, json };
  } catch (e) {
    return { status: 0, json: null };
  } finally {
    if (t !== null) CLOUD.untimer(t);
  }
};

// A reply worth believing: a v1 bundle and a whole-number version.
CLOUD.goodRemote = (j) => !!j && cloudIsObj(j.data) && j.data.v === 1 && Number.isInteger(j.version) && j.version >= 1;

// One call at a time, in order, so a pull and a push never cross.
CLOUD._chain = Promise.resolve();
CLOUD._busy = 0;
CLOUD.queue = (fn) => {
  CLOUD._busy++;
  const p = CLOUD._chain.then(fn).catch(() => "offline").finally(() => { CLOUD._busy--; });
  CLOUD._chain = p.catch(() => {});
  return p;
};

CLOUD._fail = () => {
  CLOUD.last = "offline";
  if (CLOUD.dirty && !CLOUD._retryT) {
    CLOUD._retryT = CLOUD.timer(() => { CLOUD._retryT = null; CLOUD.push(); }, CLOUD.RETRY_MS);
  }
  return "offline";
};

// Combine what the cloud has into this device. True if the cloud is
// missing something this device has.
CLOUD._take = (remote, version) => {
  const local = CLOUD.read();
  const keepRun = CLOUD.playing();
  const merged = CLOUD.merge(local, remote);
  if (keepRun) merged.run = { at: CLOUD.now(), save: local.run.save };
  if (!CLOUD.same(merged, local)) CLOUD.apply(merged, { keepRun });
  CLOUD.setMeta({ version });
  return !CLOUD.same(merged, CLOUD.clean(remote));
};

CLOUD._push = async (o = {}) => {
  for (let i = 0; i < 3; i++) {
    const m = CLOUD.meta();
    if (!CLOUD.enabled() || !m.word) return "off";
    const r = await CLOUD.call("POST", m.word, { data: CLOUD.read(), base: m.version }, o);
    if (r.status === 200 && r.json && Number.isInteger(r.json.version)) {
      CLOUD.setMeta({ version: r.json.version, lastSync: CLOUD.now() });
      CLOUD.dirty = false;
      CLOUD.last = "synced";
      return "ok";
    }
    if (r.status !== 409 || !r.json || o.keepalive) return CLOUD._fail();
    // someone else saved first: take theirs in, then try again on top
    if (CLOUD.goodRemote(r.json)) CLOUD._take(r.json.data, r.json.version);
    else if (r.json.data === null && r.json.version === 0) CLOUD.setMeta({ version: 0 });
    else return CLOUD._fail();
  }
  return CLOUD._fail();
};

CLOUD._pull = async () => {
  const m = CLOUD.meta();
  if (!CLOUD.enabled() || !m.word) return "off";
  const r = await CLOUD.call("GET", m.word);
  if (r.status === 404) {
    // the word has gone from the cloud: this device puts it back
    CLOUD.setMeta({ version: 0 });
    CLOUD.dirty = true;
    return (await CLOUD._push()) === "ok" ? "ok" : "offline";
  }
  if (r.status !== 200 || !CLOUD.goodRemote(r.json)) return CLOUD._fail();
  const needs = CLOUD._take(r.json.data, r.json.version);
  CLOUD.setMeta({ lastSync: CLOUD.now() });
  CLOUD.last = "synced";
  if (!needs) return "ok";
  CLOUD.dirty = true;
  return (await CLOUD._push()) === "ok" ? "ok" : "offline";
};

CLOUD.pull = () => CLOUD.queue(CLOUD._pull);
CLOUD.push = () => CLOUD.queue(() => CLOUD._push());

// A save changed: send it up PUSH_WAIT after the first change of a batch.
CLOUD.changed = () => {
  if (CLOUD.applying || !CLOUD.enabled() || !CLOUD.meta().word) return;
  CLOUD.dirty = true;
  if (CLOUD._pushT) return;
  CLOUD._pushT = CLOUD.timer(() => { CLOUD._pushT = null; CLOUD.push(); }, CLOUD.PUSH_WAIT);
};

// ---------- what the panel asks for ----------

// A new word for this device, made with everything it already has.
CLOUD.create = () => CLOUD.queue(async () => {
  if (!CLOUD.enabled()) return null;
  for (let i = 0; i < 5; i++) {
    const word = CLOUD.makeWord();
    const r = await CLOUD.call("POST", word, { data: CLOUD.read(), base: 0 });
    if (r.status === 200 && r.json && Number.isInteger(r.json.version)) {
      CLOUD.setMeta({ word, version: r.json.version, lastSync: CLOUD.now() });
      CLOUD.dirty = false;
      CLOUD.last = "synced";
      return word;
    }
    if (r.status !== 409) { CLOUD.last = "offline"; return null; }   // 409: that word is taken, pick another
  }
  return null;
});

// What a typed word holds: { word, bundle, version }, "missing" or "offline".
CLOUD.lookup = async (typed) => {
  const word = CLOUD.normWord(typed);
  if (!word) return "missing";
  if (!CLOUD.enabled()) return "offline";
  const r = await CLOUD.call("GET", word);
  if (r.status === 404) return "missing";
  if (r.status !== 200 || !CLOUD.goodRemote(r.json)) return "offline";
  return { word, bundle: r.json.data, version: r.json.version };
};

// Bring a looked-up word in. o.run: "local" or "remote" when the player
// picked which run to carry on with.
CLOUD.join = (word, found, o = {}) => CLOUD.queue(async () => {
  const merged = CLOUD.merge(CLOUD.read(), found.bundle, { run: o.run });
  CLOUD.apply(merged);
  CLOUD.setMeta({ word: found.word || word, version: found.version, lastSync: CLOUD.now() });
  CLOUD.last = "synced";
  if (CLOUD.same(merged, CLOUD.clean(found.bundle))) return "ok";
  CLOUD.dirty = true;
  return CLOUD._push();
});

// Everything up first; only once the cloud has it does this device forget
// its progress and its word, and start again like new.
CLOUD.forget = () => CLOUD.queue(async () => {
  if (!CLOUD.enabled() || !CLOUD.meta().word) return "off";
  CLOUD.dirty = true;
  if ((await CLOUD._push()) !== "ok") return "offline";
  for (const k of Object.values(CLOUD.KEYS).concat([CLOUD.KEY])) cloudDel(k);
  CLOUD._meta = null;
  CLOUD.dirty = false;
  if (typeof TROPHIES !== "undefined") TROPHIES._s = null;
  if (typeof location !== "undefined" && typeof location.reload === "function") location.reload();
  return "ok";
});

CLOUD._settled = true;
CLOUD._settleBy = 0;
CLOUD.settled = () => CLOUD._settled || CLOUD.now() >= CLOUD._settleBy;

CLOUD.status = () => {
  if (!CLOUD.enabled()) return { word: null, state: "off", lastSync: 0 };
  const m = CLOUD.meta();
  if (!m.word) return { word: null, state: "none", lastSync: 0 };
  const state = CLOUD._busy ? "working" : CLOUD.last === "offline" ? "offline" : "synced";
  return { word: m.word, state, lastSync: m.lastSync };
};

// ---------- listening ----------
// Every save goes through these, so wrapping them (as core/trophies.js
// wraps STORY.set) catches every change without touching their files.
// The run and the difficulty are time-stamped even with no word, so a
// later join knows how old this device's run is.
CLOUD.hook = (obj, name, after) => {
  if (!obj || typeof obj[name] !== "function") return;
  const f = obj[name];
  obj[name] = function (...a) {
    const r = f.apply(this, a);
    try { after(); } catch (e) {}
    return r;
  };
};
CLOUD.touched = (key) => {
  if (CLOUD.applying || !CLOUD.storageOk()) return;
  CLOUD.setMeta({ [key]: CLOUD.now() });
  CLOUD.changed();
};
if (typeof SAVE !== "undefined") for (const n of ["write", "patch", "clear"]) CLOUD.hook(SAVE, n, () => CLOUD.touched("runAt"));
if (typeof STORY !== "undefined") CLOUD.hook(STORY, "set", () => CLOUD.changed());
if (typeof TROPHIES !== "undefined") CLOUD.hook(TROPHIES, "save", () => CLOUD.changed());
if (typeof DIFFICULTY !== "undefined" && typeof DIFFICULTY.set === "function") {
  const set = DIFFICULTY.set;
  DIFFICULTY.set = function (...a) {
    const was = DIFFICULTY.level;
    const r = set.apply(this, a);
    if (DIFFICULTY.level !== was) CLOUD.touched("diffAt");
    return r;
  };
}

// The first pull as the game loads, another whenever it comes back on
// screen, and a last push as it goes away.
CLOUD.start = () => {
  CLOUD._settleBy = CLOUD.now() + CLOUD.SETTLE_MS;
  CLOUD._settled = !CLOUD.enabled() || !CLOUD.meta().word;
  if (CLOUD._settled) return;
  CLOUD.pull().finally(() => { CLOUD._settled = true; });
};
CLOUD.hidden = () => {
  if (!CLOUD.dirty || !CLOUD.enabled() || !CLOUD.meta().word) return;
  if (CLOUD._pushT) { CLOUD.untimer(CLOUD._pushT); CLOUD._pushT = null; }
  CLOUD._push({ keepalive: true });
};
if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") { if (CLOUD.enabled() && CLOUD.meta().word) CLOUD.pull(); }
    else CLOUD.hidden();
  });
  addEventListener("pagehide", () => CLOUD.hidden());
  CLOUD.start();
}
