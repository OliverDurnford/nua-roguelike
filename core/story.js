// ============================================================
// STORY: the device's permanent memory, across every run.
// Which friends have ever been met, which characters have
// finished the game, how many runs have been completed.
//
// This is the collect-them-all pull from the design docs: only
// four of nine friends appear per run, so "What You Missed" on
// the ending screen can now say how much of the group you have
// genuinely met across all your runs, not just this one.
//
// Separate from core/save.js on purpose: the run checkpoint is
// wiped when a run ends, this never is (short of dev.wipe()).
// Same try/catch rule: storage refused means the game simply
// plays without long-term memory.
// ============================================================

const STORY = { KEY: "tenyears-story" };

STORY.blank = () => ({ v: 1, found: [], finished: [], wins: 0 });

STORY.get = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORY.KEY) || "null");
    if (!s || s.v !== 1 || !Array.isArray(s.found) || !Array.isArray(s.finished)) {
      return STORY.blank();
    }
    return s;
  } catch (e) { return STORY.blank(); }
};

STORY.set = (s) => {
  try { localStorage.setItem(STORY.KEY, JSON.stringify(s)); } catch (e) {}
};

// A companion joined the party: remember them forever, even if
// this run is later abandoned. A found friend is never lost.
STORY.foundCompanion = (id) => {
  const s = STORY.get();
  if (!s.found.includes(id)) { s.found.push(id); STORY.set(s); }
};

// A run reached the ending. Returns what the ending screen needs:
// the updated story, and whether this character finished for the
// first time.
STORY.finishRun = (charId) => {
  const s = STORY.get();
  s.wins += 1;
  const firstAsChar = !s.finished.includes(charId);
  if (firstAsChar) s.finished.push(charId);
  STORY.set(s);
  return { story: s, firstAsChar };
};

// Everyone this device has ever met: companions found in any run,
// characters finished as, plus whoever is being played right now.
STORY.met = (charId) => {
  const s = STORY.get();
  const ids = new Set(s.found.concat(s.finished));
  if (charId) ids.add(charId);
  return CHARACTERS.filter((c) => ids.has(c.id));
};

STORY.clear = () => {
  try { localStorage.removeItem(STORY.KEY); } catch (e) {}
};
