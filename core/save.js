// ============================================================
// SAVE: remembers the run between visits, so closing the tab
// (or a phone quietly killing the page) never loses progress.
//
// One checkpoint per area: walking into a room saves the run as
// it stood at the door. Quit mid-fight and you restart that room
// as you entered it. Recruits re-save on the spot, so a found
// friend is never lost. Finishing the game clears the save.
//
// Storage is localStorage, same as the mute setting. Every call
// is wrapped in try/catch: if the browser refuses (private
// browsing, odd setups), the game simply plays without saving,
// exactly as it did before this file existed.
// ============================================================

const SAVE = { KEY: "tenyears-run" };

// Write the current run, tagged with which scene to resume into.
SAVE.write = (sceneName) => {
  if (!G.run) return;
  try {
    localStorage.setItem(SAVE.KEY, JSON.stringify({
      v: 1,
      scene: sceneName,
      // store time PLAYED rather than when the run started, so a run
      // resumed days later doesn't claim a three-day run time
      elapsedMs: Date.now() - G.run.startTime,
      run: G.run,
    }));
  } catch (e) {}
};

// Read and sanity-check the save. Anything unexpected (old version,
// unknown character, out-of-range chapter) throws the save away
// rather than crash the game with half-loaded state.
SAVE.read = () => {
  try {
    const raw = localStorage.getItem(SAVE.KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    const r = s && s.run;
    const ok = s.v === 1 && r
      && G.char(r.charId)
      && Array.isArray(r.companions) && r.companions.every((id) => G.char(id))
      && r.chapter >= 1 && r.chapter <= 5
      && r.area >= 1 && r.area <= 5
      && r.hp > 0
      && (s.scene === "area" || s.scene === "tutorial");
    if (!ok) { SAVE.clear(); return null; }
    return s;
  } catch (e) { return null; }
};

// Put a saved run back in charge and jump to where it left off.
SAVE.resume = (s) => {
  s.run.startTime = Date.now() - (s.elapsedMs || 0);
  G.run = s.run;
  if (s.scene === "tutorial") go("tutorial");
  else go("area", { chapter: s.run.chapter, area: s.run.area });
};

SAVE.clear = () => {
  try { localStorage.removeItem(SAVE.KEY); } catch (e) {}
};
