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

// How one bonus character stands this run, or null if they are not about
// (already found, or the person you are playing as). `unlocked` is
// BONUS.unlocked(). Megan is the Propaganda cameo on run 1 ("cameo") and
// collectable from run 2. Everyone else is collectable only if this run
// picked them (run.bonusOpen, at random: Ollie, 15 Oct 2026, "it shouldn't
// be the first ones you get to"), and otherwise says they will come next
// time ("notYet"). A run saved before the pick keeps the old rule, first
// come while the allowance lasts.
BONUS.status = (id, run, unlocked) => {
  if (unlocked.includes(id) || run.charId === id) return null;
  const runNo = run.runNo || 1;
  if (id === "megan") return { id, mode: runNo <= 1 ? "cameo" : "collect" };
  if (Array.isArray(run.bonusOpen)) return { id, mode: run.bonusOpen.includes(id) ? "collect" : "notYet" };
  return { id, mode: (run.bonusGot || 0) < BONUS.allowance(runNo) ? "collect" : "notYet" };
};

// Everyone hidden in this room this run, in data order (a room can hide two:
// Joe P and Ella share the Mischief).
BONUS.inRoom = (chapter, area, run, unlocked) => BONUS_CHARACTERS
  .filter((b) => b.room[0] === chapter && b.room[1] === area)
  .map((b) => BONUS.status(b.id, run, unlocked))
  .filter(Boolean);

// The first of them, or null (Megan's cameo and the older callers).
BONUS.who = (chapter, area, run, unlocked) => BONUS.inRoom(chapter, area, run, unlocked)[0] || null;

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
  // who can be collected this run: as many as the allowance, picked at random
  // from those not found yet (never Megan, never the person you play as)
  const unlocked = BONUS.unlocked();
  const pool = BONUS_CHARACTERS.map((c) => c.id)
    .filter((id) => id !== "megan" && id !== run.charId && !unlocked.includes(id));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1)) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  run.bonusOpen = pool.slice(0, BONUS.allowance(run.runNo));
  const ten = CHARACTERS.map((c) => c.id);
  const isBonus = BONUS_CHARACTERS.some((c) => c.id === run.charId);
  run.busyId = isBonus ? ten[Math.floor(rnd() * ten.length) % ten.length] : run.charId;
  return ten.filter((id) => id !== run.charId && id !== run.busyId);
};

// ---------- in the room (browser only) ----------

BONUS.SEE = () => G.charH(2);      // closer than this and they fade in
BONUS.FADE = 0.5;                  // seconds to fade in or out

// Put this room's bonus character on their spot, hidden, if anyone is due.
// Megan is never hidden: she is always in Propaganda as the room's NPC,
// before, while and after she can be collected (Ollie, 15 Oct 2026), and
// BONUS.meet makes her collectable where she stands. Returns true when
// that NPC must stay away, which is only when you are playing as Megan.
BONUS.place = (a, chapter, areaNum) => {
  if (!G.run || !a.plate) return false;
  const hideNpc = G.run.charId === "megan";
  // everyone hidden here (the Mischief hides two), Megan aside: she stands as the NPC
  for (const w of BONUS.inRoom(chapter, areaNum, G.run, BONUS.unlocked())) {
    if (w.mode !== "cameo" && w.id !== "megan") BONUS.hide(a, w.id);
  }
  return hideNpc;
};

// One bonus character on their spot, hidden until you are close.
BONUS.hide = (a, id) => {
  const c = BONUS.entry(id);
  const spot = a.plate[c.spot];
  if (!spot) return;
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
    if (near && !b.seen) {
      b.seen = true; BONUS.sparkle(b.pos.add(0, -h * 0.4)); SFX.play("uitick");
      // the speech board's "meeting someone": Josh spotting Dion ("Leon!")
      wait(0.6, () => SPEECH.fire("meet", { met: c.id }));
    }
  });
  // Every frame you touch them, not only the first: a first touch that came
  // while they were still fading in, or with the room held for a moment,
  // used to be the only one, and you walked straight through (Ollie, 15
  // Oct 2026, Jack on the towpath)
  b.onCollideUpdate("player", () => {
    if (b.gone || b.k < 0.5 || G.paused) return;
    // read again now, not at placing: the run's own state decides
    const now = BONUS.status(c.id, G.run, BONUS.unlocked());
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
};

// A bonus character standing in a room as its NPC (Megan in Propaganda).
// Walking into them unlocks them when they are due, with the same sparkle
// and card as a hidden find, and they stay where they are.
BONUS.meet = (npc, id, chapter, areaNum) => {
  const c = BONUS.entry(id);
  npc.onCollideUpdate("player", () => {   // every frame of touching, as BONUS.hide
    if (G.paused) return;
    const now = BONUS.status(id, G.run, BONUS.unlocked());
    if (!now || now.mode !== "collect") return;
    BONUS.unlock(id, G.run);
    SAVE.patch({ bonusGot: G.run.bonusGot });
    SFX.play("recruit");
    BONUS.sparkle(npc.pos.add(0, -npc.height * npc.scale.y * 0.4));
    BONUS.card(c);
  });
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
  if (ART.hasAnim(c.id, "victory")) fig.play("victory");
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
    UI.chromeText(head, TX, y0 + 30, headSize, op, UI.CHROME, 1);   // ringed in ink to read on paper (Ollie, 15 Oct)
    UI.text(c.lines.unlock, TX, y0 + 60, { font: UI.VT, size: 16, width: TW, color: UI.TEXT, opacity: op });
  });
  const dismiss = () => {
    if (t < 0.4 || leaving >= 0 || UI.pauseOpen) return;
    leaving = t;
    UI.pauseToggledAt = time();   // the press that closes it must not also hurry a line (CRACKVOICE.canHurry)
    SFX.play("uiconfirm");
  };
  const handlers = [
    onKeyPress((key) => { if (key !== "escape" && key !== "p") dismiss(); }),
    onMousePress(() => { if (!UI.inPauseBtn(mousePos())) dismiss(); }),
  ];
};
