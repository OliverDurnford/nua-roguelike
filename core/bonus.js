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

// ---------- in the room (browser only) ----------

BONUS.SEE = () => G.charH(2);      // closer than this and they fade in
BONUS.FADE = 0.5;                  // seconds to fade in or out

// Put this room's bonus character on their spot, hidden, if anyone is due.
// Returns true when the room's NPC must stay away: Megan hidden on the
// cameo's own spot (run 2 on, until found), or you are playing as Megan.
// Once she is found the cameo comes back as it always was.
BONUS.place = (a, chapter, areaNum) => {
  if (!G.run || !a.plate) return false;
  const w = BONUS.who(chapter, areaNum, G.run, BONUS.unlocked());
  const hideNpc = G.run.charId === "megan" || !!(w && w.id === "megan" && w.mode !== "cameo");
  if (!w || w.mode === "cameo") return hideNpc;
  const c = BONUS.entry(w.id);
  const spot = a.plate[c.spot];
  if (!spot) return hideNpc;
  const at = vec2(spot[0] * a.plate.unit, spot[1] * a.plate.unit);
  const h = G.charH(0.95);
  const b = add([
    ...ART.charComps(c.id, h), pos(at), area({ scale: 0.9 }), z(44), opacity(0),
    "bonusPickup", { k: 0, seen: false, said: false, gone: false },
  ]);
  b.feet = ART.feetBox(h);
  DEPTH.track(b);
  if (ART.hasAnims(c.id)) b.play("idle");
  b.onUpdate(() => {
    const pl = G.playerObj;
    if (!pl || !pl.exists() || b.gone) return;
    const near = pl.pos.dist(b.pos) < BONUS.SEE();
    b.k = Math.max(0, Math.min(1, b.k + (near ? 1 : -1) * dt() / BONUS.FADE));
    b.opacity = b.k;
    if (near && !b.seen) { b.seen = true; BONUS.sparkle(b.pos.add(0, -h * 0.4)); SFX.play("uitick"); }
  });
  b.onCollide("player", () => {
    if (b.gone || b.k < 0.5 || G.paused) return;
    // the allowance is read again now, not at placing: a run can fill up in between
    const now = BONUS.who(chapter, areaNum, G.run, BONUS.unlocked());
    if (!now || now.mode !== "collect") {
      // once per visit to the room (the spec), however often you walk back
      if (!b.said) { b.said = true; UI.speech(b, c.lines.notYet, c.colors.top); }
      return;
    }
    b.gone = true;
    BONUS.unlock(c.id, G.run);
    SAVE.patch({ bonusGot: G.run.bonusGot });   // the count only: the door checkpoint stays the door's
    SFX.play("recruit");
    BONUS.sparkle(b.pos.add(0, -h * 0.4));
    destroy(b);
    BONUS.card(c);
  });
  return hideNpc;
};

// A few silver specks that rise and fade: the moment someone is noticed.
BONUS.sparkle = (p) => {
  for (let i = 0; i < 10; i++) {
    const s = add([
      rect(3, 3), pos(p.add(rand(-18, 18), rand(-24, 12))), anchor("center"),
      color(UI.rgb(i % 2 ? UI.SILVER : UI.STEEL)), opacity(1), z(61),
      { vy: rand(-60, -25), life: rand(0.5, 0.9) },
    ]);
    s.onUpdate(() => {
      s.pos.y += s.vy * dt();
      s.life -= dt();
      s.opacity = Math.max(0, s.life / 0.9);
      if (s.life <= 0) destroy(s);
    });
  }
};

// The unlock card: small, in the middle, the room paused behind it. Their
// figure on the left, "<NAME> UNLOCKED" in the title's silver chrome, one
// line under it. Any key or tap, or four seconds, carries on.
BONUS.card = (c, onDone) => {
  const W = 400, H = 120, CX = G.W / 2, CY = G.H / 2;   // "OLLIE W UNLOCKED" fits at 16
  const head = c.name.toUpperCase() + " UNLOCKED";
  const TX = CX - W / 2 + 104, TW = W - 120;
  const headSize = UI.measure(head, UI.PX, 16).width <= TW ? 16 : 8;
  const wasPaused = G.paused;
  G.paused = true;
  let t = 0, leaving = -1;
  const root = add([fixed(), z(220), pos(0, 0)]);
  const fig = add([...ART.charComps(c.id, 88), pos(CX - W / 2 + 54, CY + 4), fixed(), z(221), opacity(0)]);
  if (ART.hasAnims(c.id)) fig.play("victory");
  const finish = () => {
    root.destroy(); fig.destroy();
    for (const hd of handlers) hd.cancel();
    // a cutscene that began under the card (a crack voice when a stray throw
    // clears the room) keeps the room paused; otherwise back as it was
    if (!G.cutscene) G.paused = wasPaused;
    if (onDone) onDone();
  };
  root.onUpdate(() => {
    t += dt();
    if (leaving < 0 && t > 4) leaving = t;
    if (leaving >= 0 && t - leaving > 0.2) finish();
  });
  root.onDraw(() => {
    const inK = UI.ease(Math.min(1, t / 0.25));
    const op = leaving >= 0 ? Math.max(0, 1 - (t - leaving) / 0.2) : inK;
    fig.opacity = op;
    UI.R(0, 0, G.W, G.H, UI.INK, 0.45 * op);
    const y0 = CY - H / 2 + Math.round((1 - inK) * 16);
    UI.card(vec2(CX - W / 2, y0), W, H, { drop: 4, opacity: op });
    UI.chromeText(head, TX, y0 + 30, headSize, op);
    UI.text(c.lines.unlock, TX, y0 + 60, { font: UI.VT, size: 16, width: TW, color: UI.TEXT, opacity: op });
  });
  const dismiss = () => {
    if (t < 0.4 || leaving >= 0 || UI.pauseOpen) return;
    leaving = t;
    SFX.play("uiconfirm");
  };
  const handlers = [
    onKeyPress((key) => { if (key !== "escape" && key !== "p") dismiss(); }),
    onMousePress(() => { if (!UI.inPauseBtn(mousePos())) dismiss(); }),
  ];
};
