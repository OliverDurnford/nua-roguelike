// ============================================================
// BONUS: the seven bonus characters in play (docs/superpowers/specs/
// 2026-10-14-bonus-characters-design.md). The rules first, pure and
// tested in node (tools/tests/bonus.test.js): which run this is, how
// many may be unlocked in it, and who stands in a room and how. The
// drawing (the hidden pickup, the unlock card) is below them and only
// runs in the browser.
// ============================================================

const BONUS = {};

// Run 1 lets you find three, run 2 two, every run after that one, until
// all six are found (Ollie, 14 Oct 2026). Megan is outside it.
BONUS.allowance = (runNo) => ((runNo || 1) <= 1 ? 3 : runNo === 2 ? 2 : 1);

BONUS.entry = (id) => BONUS_CHARACTERS.find((c) => c.id === id);

// Found this session, kept as well as the story's list: if the browser
// refuses storage, whoever you found stays found until the page closes.
BONUS.session = [];
BONUS.unlocked = () => {
  const ids = STORY.bonusUnlocked();
  for (const id of BONUS.session) if (!ids.includes(id)) ids.push(id);
  return ids;
};

// Who is hidden in this room for this run, or null. `unlocked` is
// BONUS.unlocked(). Megan is the Propaganda cameo on run 1 ("cameo") and
// collectable from run 2; everyone else is collectable while the run's
// allowance lasts, then only says they will come next time ("notYet").
BONUS.who = (chapter, area, run, unlocked) => {
  const c = BONUS_CHARACTERS.find((b) => b.room[0] === chapter && b.room[1] === area);
  if (!c || unlocked.includes(c.id) || run.charId === c.id) return null;
  const runNo = run.runNo || 1;
  if (c.id === "megan") return { id: c.id, mode: runNo <= 1 ? "cameo" : "collect" };
  return { id: c.id, mode: (run.bonusGot || 0) < BONUS.allowance(runNo) ? "collect" : "notYet" };
};

// Saved to the story at once (dying straight after keeps it), then
// counted against this run unless it is Megan. True if they are new.
BONUS.unlock = (id, run) => {
  if (BONUS.unlocked().includes(id)) return false;
  BONUS.session.push(id);
  STORY.unlockBonus(id);
  if (id !== "megan") run.bonusGot = (run.bonusGot || 0) + 1;
  return true;
};

// A new run: its number, nothing found yet, and whose Busy You waits at
// the end. A bonus player has no Busy art, so it is one of the ten at
// random, kept out of the recruits. Returns who may be recruited.
BONUS.startRun = (run, rnd) => {
  run.runNo = STORY.nextRun();
  run.bonusGot = 0;
  const ten = CHARACTERS.map((c) => c.id);
  const isBonus = BONUS_CHARACTERS.some((c) => c.id === run.charId);
  run.busyId = isBonus ? ten[Math.floor(rnd() * ten.length) % ten.length] : run.charId;
  return ten.filter((id) => id !== run.charId && id !== run.busyId);
};
