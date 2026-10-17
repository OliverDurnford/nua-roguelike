// ============================================================
// ENDING: the back of the album (Ollie, 17 Oct 2026, option 1).
// The opening ends on the album's cover, so the ending stands on
// its back: the same sunburst, moving the way the cover moves
// (the glow breathing, wheels of light, twinkling stars, streaks),
// and the ten along the bottom as they stand on the front. The
// friends you played with this run are lit; everyone else, the
// friends you freed from the cages included (Ollie: they do not
// count as played with), stands as a silhouette.
// Page 1 is Ollie's message on one of the kit's paper cards, a
// paragraph at a time. The message is his own words (17 Oct 2026):
// nobody else edits it. Page 2 is the run as a track listing, and
// the replay hook.
// ============================================================

scene("ending", () => {
  SPEECH.endArea();   // no room loaded: nothing to test a line against
  // The finale is a boss area, so without this the boss track ("White
  // Noise") would keep looping under Ollie's closing message. If he has
  // pinned a song to the "ending" slot it plays here; otherwise the ending
  // plays out in silence.
  if (!SOUNDTRACK.playForKey("ending")) SOUNDTRACK.stop();
  G.paused = false;
  G.areaScale = 1;
  SAVE.clear();   // the run is complete, next visit starts clean

  const r = G.run;
  // Record the completed run FIRST, so every line below (met counts,
  // first-finish flag) already includes this run.
  if (typeof TROPHIES !== "undefined") TROPHIES.note("finish", { run: r });   // before the story write, so the ending holds its pop-ups
  const win = STORY.finishRun(r.charId);
  const met = STORY.met(r.charId);
  const allMet = met.length >= CHARACTERS.length;
  const secs = (Date.now() - r.startTime) / 1000;
  const found = r.companions.map((id) => G.char(id).name);
  // the five let out of the cages in the finale (FINALE.openCages) walked
  // out with you: they are not "still out there" (Ollie, 17 Oct 2026), but
  // nor did you play with them
  const freedIds = r.freed || [];
  const freed = freedIds.map((id) => G.char(id).name);
  const missed = CHARACTERS
    .filter((c) => c.id !== r.charId && !r.companions.includes(c.id) && !freedIds.includes(c.id))
    .map((c) => c.name);
  const playedWith = [r.charId].concat(r.companions);

  // ---------- the back of the sleeve ----------
  const ray = typeof REAL_ENDING !== "undefined" ? REAL_ENDING.ray : [480, 273];
  const RAY = vec2(ray[0], ray[1]);
  const hasCover = typeof REAL_ENDING !== "undefined";
  const cover = hasCover
    ? add([sprite("ending-cover"), pos(G.W / 2, G.H / 2), anchor("center"), scale(1), z(0)])
    : add([sprite("bg-night"), pos(0, 0), scale(G.W / 8, G.H / 256), z(0)]);
  let t = 0;
  // the slowest push in, so the sleeve is never quite still
  if (hasCover) cover.onUpdate(() => { cover.scale = vec2(1 + Math.min(1, t / 90) * 0.05); });

  // life on the sleeve, as on the front (scenes/title.js), up over 1.5 s
  const lifeK = () => Math.min(1, t / 1.5);
  const glow = add([sprite("glow"), pos(RAY), anchor("center"), scale(5.4), color(255, 214, 120), opacity(0), z(1)]);
  glow.onUpdate(() => {
    glow.opacity = lifeK() * (0.24 + Math.sin(time() * 1.1) * 0.10);
    glow.scale = vec2(5.4 + Math.sin(time() * 1.1) * 0.4);
  });
  for (const [dir, op, sc] of [[1, 0.13, 3.9], [-1, 0.09, 3.2]]) {
    const wheel = add([
      sprite("raywheel"), pos(RAY), anchor("center"), scale(sc), rotate(rand(0, 360)),
      color(255, 232, 170), opacity(0), z(1.1),
    ]);
    wheel.onUpdate(() => { wheel.angle += dir * 5 * dt(); wheel.opacity = lifeK() * op; });
  }
  const STAR_COLOURS = [[255, 255, 255], [255, 255, 255], [255, 240, 180], [255, 226, 120],
                        [120, 220, 205], [255, 150, 200]];
  const starHome = () => vec2(rand(G.W * 0.03, G.W * 0.97), rand(G.H * 0.03, G.H * 0.62));
  for (let i = 0; i < 28; i++) {
    const col = STAR_COLOURS[i % STAR_COLOURS.length];
    const st = add([
      sprite("pixstar"), pos(starHome()), anchor("center"), scale(1),
      color(col[0], col[1], col[2]), opacity(0), z(1.2),
      { phase: rand(0, 6.28), speed: rand(1.6, 3.8), size: rand(1.0, 2.0), low: false },
    ]);
    st.onUpdate(() => {
      const k = 0.5 + 0.5 * Math.sin(time() * st.speed + st.phase);
      st.opacity = lifeK() * (0.2 + 0.8 * k * k);
      st.scale = vec2(st.size * (0.5 + 0.5 * k));
      if (k < 0.03 && !st.low) { st.low = true; if (rand() < 0.5) st.pos = starHome(); }
      if (k > 0.5) st.low = false;
    });
  }
  let streakT = 0;
  onUpdate(() => {
    t += dt();
    streakT += dt();
    while (streakT > 0.12) {
      streakT -= 0.12;
      const a = rand(-175, -5) * Math.PI / 180;   // the upper fan
      const sk = add([
        rect(rand(18, 46), 2), pos(RAY.add(vec2(Math.cos(a), Math.sin(a)).scale(rand(30, 70)))),
        anchor("left"), rotate(a * 180 / Math.PI),
        color(255, 228, 150), opacity(0), z(1.3), { a, speed: rand(180, 380), k: 0, life: rand(0.5, 0.9) },
      ]);
      sk.onUpdate(() => {
        sk.k += dt() / sk.life;
        if (sk.k >= 1) { destroy(sk); return; }
        sk.pos = sk.pos.add(vec2(Math.cos(sk.a), Math.sin(sk.a)).scale(sk.speed * dt()));
        sk.opacity = lifeK() * 0.9 * Math.sin(sk.k * Math.PI);
      });
    }
  });
  // the bottom of the sleeve darkens under the ten, as the front's does
  add([sprite("grad-fade"), pos(0, G.H * 0.56), scale(G.W / 8, (G.H * 0.44) / 256), opacity(0.8), z(2)]);
  add([sprite("vignette"), pos(0, 0), scale(G.W / 480, G.H / 270), opacity(0.35), z(3)]);

  // ---------- the ten along the bottom ----------
  // As on the front cover: whoever is nearest the middle stands in front.
  // A bonus player is not one of the ten, so they join the middle of the line.
  const ORDER = ["cal", "ollie", "sam", "ethan", "adam", "josh", "lucy", "annie", "ana", "jess"];
  const line = ORDER.slice();
  if (!ORDER.includes(r.charId)) line.splice(5, 0, r.charId);
  const STEP = Math.min(84, (G.W - 120) / (line.length - 1));
  const FEET = G.H - 12, CAST_H = 104;
  line.forEach((id, i) => {
    const off = i - (line.length - 1) / 2;
    const front = 1 - Math.abs(off) / ((line.length - 1) / 2);
    const h = CAST_H * (0.9 + 0.1 * front);
    const lit = playedWith.includes(id);
    const x = G.W / 2 + off * STEP, restY = FEET - h * 0.5;
    const at = 1.2 + i * 0.12;   // they rise into place one by one, left to right
    // a silhouette is lit from behind, so it reads against the dark
    const halo = lit ? null : add([
      sprite("glow"), pos(x, restY), anchor("center"), scale(h / 30, h / 22),
      color(UI.BLUE[0], UI.BLUE[1], UI.BLUE[2]), opacity(0), z(9),
    ]);
    const f = add([
      ...ART.charComps(id, h), pos(x, restY + h * 1.3),
      ...(lit ? [] : [color(20, 16, 40)]),
      opacity(0), z(10 + front),
    ]);
    f.onUpdate(() => {
      const k = UI.ease((t - at) / 0.5);
      f.pos.y = restY + (1 - k) * h * 1.3;
      f.opacity = Math.min(1, Math.max(0, (t - at) / 0.25));
      if (halo) { halo.pos.y = f.pos.y; halo.opacity = f.opacity * 0.4; }
      if (ART.hasAnims(id)) FIDGET.idle(f, id);   // everyone breathes and blinks
    });
  });

  // white flash that fades out (we arrived from the park restoration)
  const w = add([rect(G.W, G.H), color(255, 255, 255), opacity(1), fixed(), z(100)]);
  w.onUpdate(() => { w.opacity -= dt() * 0.4; if (w.opacity <= 0) destroy(w); });

  // ---------- the cards ----------
  const CX = G.W / 2;
  // A heading in the title's chrome, ringed in ink so it reads on paper.
  const heading = (str, y, op) => {
    const tw = UI.measure(str, UI.PX, 16).width;
    UI.chromeText(str, Math.round(CX - tw / 2), y, 16, op, UI.CHROME, 1);
  };
  // the card's fade and rise in, and fade out
  const cardK = (shownAt, goneAt) => {
    if (shownAt === null || t < shownAt) return 0;
    const inK = UI.ease((t - shownAt) / 0.5);
    return goneAt === null ? inK : inK * Math.max(0, 1 - (t - goneAt) / 0.35);
  };

  // --- page 1: Ollie's message, a paragraph at a time ---
  // [em] marks the one word he stressed. Kaboom multiplies a style's colour
  // onto the text's own, so the message is drawn white and every part of it
  // is coloured by a style: ink on the paper, the stressed word in blue.
  const MESSAGE = [
    "Thanks for an unforgettable 10 years together.",
    "I'm so incredibly lucky to have so many amazing people in my life. You all mean the world to me.",
    "And although life is bound to get much busier. I hope we can always carve out a little bit of time, even if it is just a quick trip down the pub x",
    "Looking forward to the [em]next[/em] 10 years!",
    "Love you.",
    "Ollie x",
  ];
  const AT = [2.5, 5.0, 8.5, 13.5, 16.0, 17.5];   // s: when each paragraph arrives
  const HINT_AT = 19.5;
  const MW = 600;   // the message's width on the card
  const STYLES = { ink: { color: UI.rgb(UI.TEXT) }, em: { color: UI.rgb(UI.BLUE_DEEP) } };
  const inked = (m) => "[ink]" + m.replace("[em]", "[/ink][em]").replace("[/em]", "[/em][ink]") + "[/ink]";
  const MSG = { font: UI.VT, size: 16, lineSpacing: 4, width: MW, align: "center", styles: STYLES };
  const GAP = 14;
  const heights = MESSAGE.map((m) => UI.measure(inked(m), MSG.font, MSG.size, MSG).height);
  const msgH = heights.reduce((a, b) => a + b, 0) + GAP * (MESSAGE.length - 1);
  const CARD1 = { w: 680, h: 58 + msgH + 44 };
  CARD1.y = Math.max(24, Math.round((G.H - 150 - CARD1.h) / 2) + 8);
  const ys = [];
  heights.reduce((y, h) => { ys.push(y); return y + h + GAP; }, CARD1.y + 58);

  let clock = 0, page = 1, page2At = null, page1Gone = null;
  let shownAt1 = null;
  let hintShown = false;
  const paraAt = MESSAGE.map(() => null);
  onUpdate(() => {
    if (page !== 1) return;
    clock += dt();
    if (shownAt1 === null && clock >= 1.0) shownAt1 = t;
    MESSAGE.forEach((m, i) => { if (paraAt[i] === null && clock >= AT[i]) paraAt[i] = t; });
    if (!hintShown && clock >= HINT_AT) hintShown = true;
  });
  const page1 = add([pos(0, 0), z(30)]);
  page1.onDraw(() => {
    const k = cardK(shownAt1, page1Gone);
    if (k <= 0) return;
    const rise = Math.round((1 - k) * 12);
    const cx0 = CX - CARD1.w / 2, cy0 = CARD1.y + rise;
    UI.card(vec2(cx0, cy0), CARD1.w, CARD1.h, { drop: 4, opacity: k });
    heading("VICTORIA PARK, RESTORED.", cy0 + 22, k);
    MESSAGE.forEach((m, i) => {
      if (paraAt[i] === null) return;
      const pk = UI.ease((t - paraAt[i]) / 0.8);
      drawText(Object.assign({}, MSG, {
        text: inked(m), pos: vec2(CX - MW / 2, ys[i] + rise + Math.round((1 - pk) * 8)),
        anchor: "topleft", color: rgb(255, 255, 255), opacity: k * pk,
      }));
    });
    if (hintShown) {
      UI.text("press ENTER / tap", cx0 + CARD1.w - 18, cy0 + CARD1.h - 14, {
        anchor: "botright", color: UI.BLUE_DEEP, opacity: k * (0.55 + Math.sin(time() * 3) * 0.25),
      });
    }
  });

  // --- page 2: the run as a track listing, and the replay hook ---
  const TRACKS = [
    ["RUN TIME", G.fmtTime(secs)],
    ["ANNOYANCES FLATTENED", String(r.kills)],
    ["DEATHS", String(r.deaths)],
    ["SPECIALS", String(r.specialsUsed)],
    ["PLAYED WITH", found.length ? found.join(", ") : "nobody"],
  ];
  if (freed.length) TRACKS.push(["FREED FROM THE CAGES", freed.join(", ")]);
  if (missed.length) TRACKS.push(["STILL OUT THERE", missed.join(", ")]);
  // "first run finished as X" only means something from the second win
  // onward; on the very first completion it goes without saying
  const outro = (win.firstAsChar && win.story.wins > 1 ? "first run finished as " + G.char(r.charId).name + "\n" : "") +
    (allMet
      ? "across your runs you've met all ten. the whole group, back together."
      : "you've teamed up with " + met.length + " of the group's 10 so far.\na different four friends appear every run. go again?");
  const CARD2 = { w: 680, rowH: 26 };
  const LABEL_W = 210, VALUE_W = CARD2.w - 64 - 40 - LABEL_W;
  const rowHeights = TRACKS.map(([, v]) => Math.max(CARD2.rowH,
    UI.measure(v, UI.VT, 16, { width: VALUE_W, align: "right" }).height + 8));
  const outroH = UI.measure(outro, UI.VT, 16, { width: CARD2.w - 80, align: "center" }).height;
  CARD2.h = 58 + rowHeights.reduce((a, b) => a + b, 0) + 16 + outroH + 44;
  CARD2.y = Math.max(16, Math.round((G.H - 150 - CARD2.h) / 2) + 8);
  const page2 = add([pos(0, 0), z(30)]);
  page2.onDraw(() => {
    if (page2At === null) return;
    const k = cardK(page2At + 0.2, null);
    if (k <= 0) return;
    const rise = Math.round((1 - k) * 12);
    const x0 = CX - CARD2.w / 2, y0 = CARD2.y + rise;
    UI.card(vec2(x0, y0), CARD2.w, CARD2.h, { drop: 4, opacity: k });
    heading("THE RUN", y0 + 22, k);
    let y = y0 + 58;
    TRACKS.forEach(([label, value], i) => {
      // one track at a time, the way a listing is read down
      const tk = UI.ease((t - page2At - 0.6 - i * 0.22) / 0.4) * k;
      const rh = rowHeights[i];
      if (tk > 0) {
        const num = String(i + 1).padStart(2, "0");
        // the track number in a chrome block, as on the rooms' titles
        UI.R(x0 + 32, y + 2, 34, 18, UI.STEEL, tk);
        UI.R(x0 + 32, y + 2, 34, 2, UI.SILVER, tk);
        UI.R(x0 + 32, y + 18, 34, 2, UI.BLUE_DEEP, tk);
        UI.text(num, x0 + 49, y + 11, { font: UI.PX, size: 8, anchor: "center", color: UI.NAVY, opacity: tk });
        UI.text(label, x0 + 78, y + 2, { color: UI.TEXT, opacity: tk });
        // a dotted leader from the name to the value
        const lw = UI.measure(label, UI.VT, 16).width;
        const vw = Math.min(VALUE_W, UI.measure(value, UI.VT, 16).width);
        for (let dx = x0 + 78 + lw + 8; dx < x0 + CARD2.w - 32 - vw - 8; dx += 6) UI.R(dx, y + 15, 2, 2, UI.STEEL, tk);
        UI.text(value, x0 + CARD2.w - 32, y + 2, {
          anchor: "topright", align: "right", width: VALUE_W, color: UI.BLUE_DEEP, opacity: tk,
        });
      }
      y += rh;
    });
    const ok = UI.ease((t - page2At - 0.8 - TRACKS.length * 0.22) / 0.5) * k;
    if (ok > 0) {
      UI.text(outro, CX, y + 16, { anchor: "top", align: "center", width: CARD2.w - 80, color: UI.TEXT, opacity: ok });
      if (t - page2At >= 2.5) {
        UI.text("press ENTER / tap - back to the title", x0 + CARD2.w - 18, y0 + CARD2.h - 14, {
          anchor: "botright", color: UI.BLUE_DEEP, opacity: ok * (0.55 + Math.sin(time() * 3) * 0.25),
        });
      }
    }
  });

  const toPage2 = () => {
    page = 2;
    page1Gone = t;
    page2At = t + 0.35;
  };

  // A press on the message shows the rest of it at once; once it is all
  // there, the next press moves on. Nothing answers in the first moments,
  // so a tap still going from the finale never skips the message.
  const press = () => {
    if (page === 1) {
      if (clock < 1.5) return;
      if (!hintShown) { clock = HINT_AT; return; }
      toPage2();
    } else if (page2At !== null && t - page2At >= 2.5) {
      go("title");
    }
  };
  onKeyPress("enter", press);
  onMousePress(press);
});
