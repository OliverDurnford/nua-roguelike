// ============================================================
// CHARACTER SELECT: all ten, selectable from the start. Once a bonus
// character has been found a BONUS tab flips to a second page of them
// (core/bonus.js, 14 Oct 2026): the ones found so far, the rest "?".
// Ten pixel polaroids (the kit's HUD portraits, bigger): a white
// card, the friend standing in the dark photo, their name written
// underneath. Cards slide in staggered, hover to lift, the chosen
// one is taped down and a gold glow glides between them. Details
// on a paper card along the bottom.
//
// The cards are drawn a LAYER at a time across all ten (every
// paper, then every photo, the friends, every name, the tape),
// not card by card. Each switch between the paper, the park photo,
// a friend's sheet and the lettering is a separate trip to the
// graphics chip; card by card that was some sixty a frame and the
// screen lagged on a phone (Ollie, 13 Oct 2026: 46 fps against 60
// in a room). The cards never overlap, so it looks the same.
// ============================================================

scene("select", (opts = {}) => {
  SPEECH.endArea();   // no room loaded: nothing to test a line against
  G.paused = false;
  SOUNDTRACK.playForKey("select");   // blank slot: the title song carries on

  add([sprite("bg-night"), pos(0, 0), scale(G.W / 8, G.H / 256), z(0)]);
  add([sprite("vignette"), pos(0, 0), scale(G.W / 480, G.H / 270), opacity(0.5), z(40)]);

  // which page: the ten, or the bonus page once anyone has been found (an
  // admin sees the bonus page from the start, every card open, to test)
  const unlocked = BONUS.unlocked();
  const showTab = unlocked.length > 0 || ADMIN.on;
  const page = showTab && opts.page === "bonus" ? "bonus" : "friends";
  const BONUS_PAGE = page === "bonus";
  const LIST = BONUS_PAGE ? BONUS_CHARACTERS : CHARACTERS;
  const N = LIST.length;
  const open = (c) => !BONUS_PAGE || ADMIN.on || unlocked.includes(c.id);

  const heading = UI.labelObj(BONUS_PAGE ? "BONUS CHARACTERS" : "WHO ARE YOU, THEN?", G.W / 2, 40, { size: 16, anchor: "center", z: 5, fixed: false });
  UI.slideIn(heading, vec2(G.W / 2, 18), vec2(G.W / 2, 40), 0.5);
  const headRule = add([rect(0, 2), pos(G.W / 2, 60), anchor("center"), color(UI.rgb(UI.STEEL)), z(5), opacity(0.9)]);
  let hr = 0;
  headRule.onUpdate(() => { hr += dt(); headRule.width = 320 * UI.ease(hr / 0.7); });

  // the bonus page opens on the first person found, not on a question mark
  let selected = BONUS_PAGE ? Math.max(0, LIST.findIndex(open)) : 0;
  const cards = [];

  const CW = 140, CH = 164, GX = 168, GY = 172;
  const PW = 128, PH = 112;                       // the photo
  const y0 = 156;
  // five and five for the ten; the bonus page splits however many there
  // are, the longer row on top (four over three for seven, four and four
  // since Ella made eight), each row centred (the friends' rows come out
  // exactly where they always were)
  const PER_ROW = BONUS_PAGE ? [Math.ceil(LIST.length / 2), Math.floor(LIST.length / 2)] : [5, 5];
  const cell = (i) => {
    const row = i < PER_ROW[0] ? 0 : 1, col = row ? i - PER_ROW[0] : i;
    return vec2(G.W / 2 + (col - (PER_ROW[row] - 1) / 2) * GX, y0 + row * GY);
  };
  const photoY = -CH / 2 + 6 + PH / 2;            // photo centre, relative to the card
  const feetY = photoY + PH / 2 - 4;              // where the friend stands

  // one glow that glides between cards instead of popping
  const glow = add([
    sprite("glow"), pos(cell(0)), anchor("center"), scale(2.6),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0.35), z(4),
  ]);

  LIST.forEach((c, i) => {
    const p = cell(i);
    const row = i < PER_ROW[0] ? 0 : 1, col = row ? i - PER_ROW[0] : i;
    const delay = 0.05 * (col + row * 2);
    const locked = !open(c);

    // The card itself only holds the place, the hover box and the fade; the
    // layers below draw it. The friend stays a child, above the photo.
    const card = add([
      pos(p), area({ shape: new Rect(vec2(-CW / 2, -CH / 2), CW, CH) }), z(5.3), opacity(1),
      { idx: i, home: p.clone(), lift: 0, born: time() + delay, name: locked ? "?" : c.name.toLowerCase(), locked },
    ]);
    // a bonus character not found yet: a dark photo and a question mark
    if (locked) {
      UI.slideIn(card, p.add(0, 36), p, 0.45, delay);
      card.onUpdate(() => {
        const want = (card.isHovering() || selected === i) ? 1 : 0;
        card.lift += (want - card.lift) * Math.min(1, dt() * 10);
        if (time() > card.born + 0.5) card.pos.y = card.home.y - 6 * card.lift;
      });
      card.onClick(() => { selected = i; SFX.play("uitick"); });
      cards.push(card);
      return;
    }
    const figure = card.add([...ART.charComps(c.id, 84), pos(0, feetY - 42), opacity(1)]);
    // At rest everyone poses for the photo, in a way that is theirs (Ollie,
    // 8 Oct). A pose sheet of their own, so each breathe starts at its own
    // moment and the ten never move in step.
    const poser = ART.hasPose(c.id)
      ? card.add([...ART.poseComps(c.id, 84), pos(0, feetY - 42), opacity(1)])
      : null;
    if (poser) wait((i * 0.37) % 1.05, () => poser.play("pose"));
    const kids = [figure].concat(poser ? [poser] : []);

    // The chosen one strikes the first frame of their throw, item up and
    // ready to go (Ollie, 7 Oct); everyone else holds their pose.
    const throwFrame = ART.hasAnim(c.id, "throw") ? G.SPR["ch-" + c.id].anims.throw.from : null;
    let posed = false;

    // staggered entrance
    UI.slideIn(card, p.add(0, 36), p, 0.45, delay);

    card.onUpdate(() => {
      const sel = selected === i;
      if (throwFrame !== null && posed !== sel) {
        posed = sel;
        if (posed) { figure.stop(); figure.frame = throwFrame; }
        else if (!poser) figure.play("idle");
      }
      if (poser) {
        poser.hidden = sel && throwFrame !== null;
        figure.hidden = !poser.hidden;
      }
      // hover lift + selected bob, once the entrance has landed
      const want = (card.isHovering() || selected === i) ? 1 : 0;
      card.lift += (want - card.lift) * Math.min(1, dt() * 10);
      if (time() > card.born + 0.5) card.pos.y = card.home.y - 6 * card.lift;
      figure.pos.y = feetY - 42 + (selected === i ? Math.sin(time() * 3 + 1) * 2.5 : 0);
      for (const k of kids) k.opacity = card.opacity;
    });

    card.onClick(() => {
      if (selected === i) confirm();
      else { selected = i; SFX.play("uitick"); }
    });
    cards.push(card);
  });

  // ----- the layers, each across all ten cards -----
  const layer = (zz, drawOne) => add([z(zz), {
    draw() {
      for (const card of cards) {
        pushTransform();
        pushTranslate(card.pos);
        drawOne(card, card.opacity);
        popTransform();
      }
    },
  }]);
  // the polaroid: the kit's notched paper card and the dark photo window
  layer(5, (card, op) => {
    UI.card(vec2(0, 0), CW, CH, { center: true, fill: UI.WHITE, opacity: op });
    UI.R(-PW / 2, photoY - PH / 2, PW, PH, UI.INK, op);
    UI.R(-PW / 2 + 1, photoY - PH / 2 + 1, PW - 2, PH - 2, UI.PHOTO, op);
  });
  // each card takes its own window of the one park panorama, so the ten
  // snapshots are the same afternoon in the same place
  // (the bonus ones take their windows from further along the same
  // afternoon, spaced so the last still ends inside the picture: past its
  // edge the window shows whatever image sits next to it in memory, which
  // is what Ella's photo did as the eighth; a locked card's photo is
  // barely there)
  const BONUS_STEP = Math.min(0.14, 0.9 / Math.max(1, LIST.length - 1));
  layer(5.1, (card, op) => drawSprite({
    sprite: "photo-park",
    quad: BONUS_PAGE ? new Quad(card.idx * BONUS_STEP, 0, 0.1, 1) : new Quad(card.idx / 10, 0, 1 / 10, 1),
    pos: vec2(-PW / 2 + 1, photoY - PH / 2 + 1),
    width: PW - 2, height: PH - 2, opacity: card.locked ? op * 0.2 : op,
  }));
  // a soft shadow puts the friend on the grass rather than in front of it
  layer(5.2, (card, op) => !card.locked && drawEllipse({
    pos: vec2(0, feetY - 1), radiusX: 20, radiusY: 5,
    color: rgb(30, 48, 24), opacity: op * 0.45,
  }));
  // (the friends are the cards' own children, at 5.3)
  // a big question mark where a bonus character not found yet would stand
  if (BONUS_PAGE) layer(5.35, (card, op) => {
    if (!card.locked) return;
    UI.label("?", 0, photoY, { font: UI.PX, size: 32, anchor: "center", color: UI.STEEL, opacity: op });
  });
  // their names written underneath
  layer(5.4, (card, op) => drawText({
    text: card.name, size: 32, font: UI.VT, pos: vec2(0, CH / 2 - 21), anchor: "center",
    color: UI.rgb(UI.TEXT), opacity: op,
  }));
  // a strip of silver tape holds the chosen one down
  layer(5.5, (card, op) => {
    if (selected !== card.idx) return;
    drawRect({ pos: vec2(0, -CH / 2), width: 40, height: 14, anchor: "center", color: UI.rgb(UI.INK), opacity: op });
    drawRect({ pos: vec2(0, -CH / 2), width: 36, height: 10, anchor: "center", color: UI.rgb(UI.STEEL), opacity: op });
  });

  glow.onUpdate(() => {
    const target = cards[selected].pos;
    glow.pos = glow.pos.lerp(target, Math.min(1, dt() * 12));
    glow.opacity = 0.3 + Math.sin(time() * 2.5) * 0.08;
  });

  // ----- detail panel: a paper card -----
  const panelY = G.H - 64;
  const panel = add([pos(G.W / 2, panelY), opacity(0), z(8)]);
  panel.onDraw(() => UI.card(vec2(0, 0), G.W - 120, 78, { center: true, opacity: panel.opacity }));
  UI.fadeObj(panel, 1, 0.5, 0.35);
  const dName = add([text("", { size: 16, font: UI.PX }), pos(80, panelY - 24), anchor("left"), color(UI.rgb(UI.TEXT)), z(9)]);
  const dFlavour = add([text("", { size: 16, font: UI.VT }), pos(80, panelY - 1), anchor("left"), color(UI.rgb(UI.TEXT)), z(9)]);
  const dInfo = add([text("", { size: 16, font: UI.VT }), pos(80, panelY + 18), anchor("left"), color(UI.rgb(UI.BLUE_DEEP)), z(9)]);

  onUpdate(() => {
    const c = LIST[selected];
    if (!BONUS_PAGE) {
      dName.text = c.name.toUpperCase();
      dFlavour.text = c.flavour;
      dInfo.text = "throws: " + c.weapon.name + "    ·    as a companion: " + c.passive.name + " (" + c.passive.desc + ")";
    } else if (open(c)) {
      dName.text = c.name.toUpperCase();
      dFlavour.text = c.flavour;
      dInfo.text = "throws: " + c.weapon.name + "    ·    bonus character";
    } else {
      dName.text = "???";
      dFlavour.text = "Still hiding somewhere. Keep your eyes peeled.";
      dInfo.text = "";
    }
  });

  const hintTxt = add([
    text(isTouchscreen() ? "tap once to look, again to pick"
      : "click once to look, again to pick   ·   arrows + ENTER" + (showTab ? "   ·   TAB: " + (BONUS_PAGE ? "friends" : "bonus") : ""),
      { size: 16, font: UI.VT }),
    pos(G.W / 2, G.H - 12), anchor("center"), color(170, 175, 190), z(9), opacity(0),
  ]);
  UI.fadeObj(hintTxt, 1, 0.6, 0.8);

  let confirming = false;
  const confirm = () => {
    if (confirming || cards[selected].locked) return;
    confirming = true;
    const c = LIST[selected];
    UI.flash([255, 245, 220], 0.3);
    SFX.play("uiconfirm");
    wait(0.18, () => {
      G.newRun(c.id);
      go("tutorial");
    });
  };

  // up and down swap rows; on the bonus page the short row's ends land on
  // the nearest card above or below
  const otherRow = (i) => (BONUS_PAGE
    ? (i < PER_ROW[0] ? Math.min(PER_ROW[0] + i, N - 1) : i - PER_ROW[0])
    : (i + 5) % 10);
  onKeyPress("left", () => { selected = (selected + N - 1) % N; });
  onKeyPress("right", () => { selected = (selected + 1) % N; });
  onKeyPress("up", () => { selected = otherRow(selected); });
  onKeyPress("down", () => { selected = otherRow(selected); });
  onKeyPress("enter", confirm);
  onKeyPress("space", confirm);

  // the tab to the other page, top right, in the title's silver
  if (showTab) {
    const flip = () => { SFX.play("uitick"); go("select", { page: BONUS_PAGE ? "friends" : "bonus" }); };
    // phone-sized on a touchscreen, like the pause chip: the only way in there
    const touch = isTouchscreen();
    const tab = UI.chipObj(BONUS_PAGE ? "< FRIENDS" : "BONUS >", G.W - (touch ? 110 : 90), 40,
      { font: UI.PX, size: touch ? 16 : 8, z: 9, fixed: false, area: true, fill: UI.SILVER,
        padX: touch ? 16 : 12, padY: touch ? 12 : 8, opacity: 0 });
    UI.fadeObj(tab, 1, 0.5, 0.4);
    tab.onClick(flip);
    onKeyPress("tab", flip);
  }

  UI.sceneFade();
});
