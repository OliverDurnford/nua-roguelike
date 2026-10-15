// ============================================================
// CAPS: the MilpooL caps (Ollie, 15 Oct 2026). At uni Ollie lost his
// cap; one drunk night someone was wearing one, and since it was surely
// one of a kind, it was stolen "back" for him. Turns out you can buy
// them. So there are five: one hidden in each chapter, tucked behind
// something in a room so only a sliver shows, found once for good on a
// device. The rules first, pure and tested in node (tools/tests/
// caps.test.js); the drawing (the cap on the floor, the card) below
// only runs in the browser.
//
// Ollie places them on the level board (its Spawns tool, "Hide the cap
// here"): a level file's `capSpawn` is where the cap rests on the floor,
// in grid units. One per chapter, in whichever room he likes.
// ============================================================

const CAPS = {};

CAPS.TOTAL = 5;

// The card. MilpooL with a capital L, for the long tail the embroidered L
// has on the real cap (Ollie). The line goes by how many you have found,
// in any order: the first is Ollie's own joke.
CAPS.HEAD = "THE* MilpooL CAP";
CAPS.FOOT = "*one of five";
CAPS.LINES = [
  "You found THE* MilpooL cap! Turns out there's 4 more of them... who knew? *cough*",
  "Another one?! THE* MilpooL cap, again. 3 more out there, apparently.",
  "That's three. Is this... a shop item? 2 to go.",
  "Four. Somebody check the MilpooL website. One left.",
  "All five. Somewhere in Norwich, a stranger is still looking for theirs.",
];

CAPS.key = (chapter, area) => chapter + "-" + area;

// Found this session as well as the story's list: if the browser refuses
// storage, a cap you found stays found until the page closes.
CAPS.session = [];
CAPS.found = () => {
  const keys = STORY.capsFound();
  for (const k of CAPS.session) if (!keys.includes(k)) keys.push(k);
  return keys;
};
CAPS.count = () => CAPS.found().length;

// Is there a cap waiting in this room? A spot in its level file, not found yet.
CAPS.due = (plate, chapter, area) => !!(plate && plate.capSpawn) && !CAPS.found().includes(CAPS.key(chapter, area));

// Saved to the story at once. Returns how many you have now, or 0 if this
// one was already found.
CAPS.collect = (key) => {
  if (CAPS.found().includes(key)) return 0;
  CAPS.session.push(key);
  STORY.findCap(key);
  return CAPS.count();
};

CAPS.line = (n) => CAPS.LINES[Math.max(1, Math.min(CAPS.TOTAL, n)) - 1];

// ---------- in the room (browser only) ----------

CAPS.W = () => G.charH(0.45);       // about a head wide: a cap lying on the floor
CAPS.REACH = () => G.charH(0.5);    // your feet this close and you pick it up

// The cap on its spot, if this room has one waiting. It is always drawn;
// what hides it is the scenery: it takes its depth from where it rests,
// so a cap just behind a gravestone is drawn under the gravestone.
CAPS.place = (a, chapter, areaNum) => {
  if (!CAPS.due(a.plate, chapter, areaNum) || typeof REAL_CAP === "undefined") return;
  const key = CAPS.key(chapter, areaNum);
  const spot = a.plate.capSpawn, U = a.plate.unit;
  const s = CAPS.W() / REAL_CAP.w;
  const cap = add([
    sprite("milpool-cap"), pos(spot[0] * U, spot[1] * U), anchor("bot"), scale(s), z(44),
    "milpoolCap", { gone: false },
  ]);
  DEPTH.track(cap, 0);
  cap.onUpdate(() => {
    const pl = G.playerObj;
    if (cap.gone || G.paused || !pl || !pl.exists()) return;
    const f = COLLIDE.feetOf(pl);
    const fx = (f.x1 + f.x2) / 2, fy = (f.y1 + f.y2) / 2;
    if (Math.hypot(fx - cap.pos.x, fy - cap.pos.y) > CAPS.REACH()) return;
    cap.gone = true;
    const n = CAPS.collect(key);
    SFX.play("recruit");
    BONUS.sparkle(cap.pos.add(0, -REAL_CAP.h * s / 2));
    destroy(cap);
    if (n) CAPS.card(n);
  });
};

// The card: small, in the middle, the room paused behind it. The cap on the
// left; THE* MilpooL CAP in the title's silver chrome; the line; five little
// caps along the foot, the ones you have in colour; the footnote beside them.
// Any key or tap, or six seconds, carries on.
CAPS.card = (n, onDone) => {
  const W = 440, H = 168, CX = G.W / 2, CY = G.H / 2;
  const X0 = CX - W / 2, TX = X0 + 156, TW = W - 172;
  const big = 124 / REAL_CAP.w, tiny = 26 / REAL_CAP.w;
  const wasPaused = G.paused;
  G.paused = true;
  let t = 0, leaving = -1;
  const root = add([fixed(), z(220), pos(0, 0)]);
  const finish = () => {
    root.destroy();
    for (const hd of handlers) hd.cancel();
    // a cutscene that began under the card keeps the room paused (BONUS.card)
    if (!G.cutscene) G.paused = wasPaused;
    if (onDone) onDone();
  };
  root.onUpdate(() => {
    t += dt();
    if (leaving < 0 && t > 6) leaving = t;
    if (leaving >= 0 && t - leaving > 0.2) finish();
  });
  root.onDraw(() => {
    const inK = UI.ease(Math.min(1, t / 0.25));
    const op = leaving >= 0 ? Math.max(0, 1 - (t - leaving) / 0.2) : inK;
    UI.R(0, 0, G.W, G.H, UI.INK, 0.45 * op);
    const y0 = CY - H / 2 + Math.round((1 - inK) * 16);
    UI.card(vec2(X0, y0), W, H, { drop: 4, opacity: op });
    // the cap, with a little bob as it lands on the card
    const bob = Math.round(Math.sin(Math.min(1, t / 0.5) * Math.PI) * -6);
    drawSprite({ sprite: "milpool-cap", pos: vec2(X0 + 78, y0 + H / 2 + 4 + bob), anchor: "center",
      scale: vec2(big, big), opacity: op });
    // a 1px ink ring, or silver chrome vanishes into the paper (Ollie, 15 Oct)
    UI.chromeText(CAPS.HEAD, TX, y0 + 20, 16, op, UI.CHROME, 1);
    UI.text(CAPS.line(n), TX, y0 + 46, { font: UI.VT, size: 16, width: TW, color: UI.TEXT, opacity: op });
    // the tally: one little cap per cap there is, the found ones in colour
    for (let i = 0; i < CAPS.TOTAL; i++) {
      const got = i < n;
      drawSprite({ sprite: "milpool-cap", pos: vec2(TX + i * 30, y0 + H - 16), anchor: "botleft",
        scale: vec2(tiny, tiny), color: got ? rgb(255, 255, 255) : UI.rgb(UI.INK), opacity: op * (got ? 1 : 0.22) });
    }
    UI.text(CAPS.FOOT, X0 + W - 14, y0 + H - 30, { font: UI.VT, size: 16, color: UI.SLOT_TEXT, opacity: op, anchor: "topright" });
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
