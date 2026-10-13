// ============================================================
// CHARACTER SELECT: all ten, selectable from the start.
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

scene("select", () => {
  SPEECH.endArea();   // no room loaded: nothing to test a line against
  G.paused = false;
  SOUNDTRACK.playForKey("select");   // blank slot: the title song carries on

  add([sprite("bg-night"), pos(0, 0), scale(G.W / 8, G.H / 256), z(0)]);
  add([sprite("vignette"), pos(0, 0), scale(G.W / 480, G.H / 270), opacity(0.5), z(40)]);

  const heading = UI.labelObj("WHO ARE YOU, THEN?", G.W / 2, 40, { size: 16, anchor: "center", z: 5, fixed: false });
  UI.slideIn(heading, vec2(G.W / 2, 18), vec2(G.W / 2, 40), 0.5);
  const headRule = add([rect(0, 2), pos(G.W / 2, 60), anchor("center"), color(UI.rgb(UI.STEEL)), z(5), opacity(0.9)]);
  let hr = 0;
  headRule.onUpdate(() => { hr += dt(); headRule.width = 320 * UI.ease(hr / 0.7); });

  let selected = 0;
  const cards = [];

  const CW = 140, CH = 164, GX = 168, GY = 172;
  const PW = 128, PH = 112;                       // the photo
  const x0 = G.W / 2 - 2 * GX;
  const y0 = 156;
  const photoY = -CH / 2 + 6 + PH / 2;            // photo centre, relative to the card
  const feetY = photoY + PH / 2 - 4;              // where the friend stands

  // one glow that glides between cards instead of popping
  const glow = add([
    sprite("glow"), pos(x0, y0), anchor("center"), scale(2.6),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0.35), z(4),
  ]);

  CHARACTERS.forEach((c, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const p = vec2(x0 + col * GX, y0 + row * GY);
    const delay = 0.05 * (col + row * 2);

    // The card itself only holds the place, the hover box and the fade; the
    // layers below draw it. The friend stays a child, above the photo.
    const card = add([
      pos(p), area({ shape: new Rect(vec2(-CW / 2, -CH / 2), CW, CH) }), z(5.3), opacity(1),
      { idx: i, home: p.clone(), lift: 0, born: time() + delay, name: c.name.toLowerCase() },
    ]);
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
    const throwFrame = ART.hasAnims(c.id) ? G.SPR["ch-" + c.id].anims.throw.from : null;
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
  layer(5.1, (card, op) => drawSprite({
    sprite: "photo-park",
    quad: new Quad(card.idx / 10, 0, 1 / 10, 1),
    pos: vec2(-PW / 2 + 1, photoY - PH / 2 + 1),
    width: PW - 2, height: PH - 2, opacity: op,
  }));
  // a soft shadow puts the friend on the grass rather than in front of it
  layer(5.2, (card, op) => drawEllipse({
    pos: vec2(0, feetY - 1), radiusX: 20, radiusY: 5,
    color: rgb(30, 48, 24), opacity: op * 0.45,
  }));
  // (the friends are the cards' own children, at 5.3)
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
    const c = CHARACTERS[selected];
    dName.text = c.name.toUpperCase();
    dFlavour.text = c.flavour;
    dInfo.text = "throws: " + c.weapon.name + "    ·    as a companion: " + c.passive.name + " (" + c.passive.desc + ")";
  });

  const hintTxt = add([
    text(isTouchscreen() ? "tap once to look, again to pick" : "click once to look, again to pick   ·   arrows + ENTER",
      { size: 16, font: UI.VT }),
    pos(G.W / 2, G.H - 12), anchor("center"), color(170, 175, 190), z(9), opacity(0),
  ]);
  UI.fadeObj(hintTxt, 1, 0.6, 0.8);

  let confirming = false;
  const confirm = () => {
    if (confirming) return;
    confirming = true;
    const c = CHARACTERS[selected];
    UI.flash([255, 245, 220], 0.3);
    SFX.play("uiconfirm");
    wait(0.18, () => {
      G.newRun(c.id);
      go("tutorial");
    });
  };

  onKeyPress("left", () => { selected = (selected + 9) % 10; });
  onKeyPress("right", () => { selected = (selected + 1) % 10; });
  onKeyPress("up", () => { selected = (selected + 5) % 10; });
  onKeyPress("down", () => { selected = (selected + 5) % 10; });
  onKeyPress("enter", confirm);
  onKeyPress("space", confirm);

  UI.sceneFade();
});
