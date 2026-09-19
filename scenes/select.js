// ============================================================
// CHARACTER SELECT: all ten, selectable from the start.
// Ten pixel polaroids (the kit's HUD portraits, bigger): a white
// card, the friend standing in the dark photo, their name written
// underneath. Cards slide in staggered, hover to lift, the chosen
// one is taped down and a gold glow glides between them. Details
// on a paper card along the bottom.
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

    // the polaroid itself is drawn, so it gets the kit's notched corners
    // and inset shadow; the friend and the caption are children on top
    const card = add([
      pos(p), area({ shape: new Rect(vec2(-CW / 2, -CH / 2), CW, CH) }), z(5), opacity(1),
      { idx: i, home: p.clone(), lift: 0, born: time() + delay },
    ]);
    card.onDraw(() => {
      const op = card.opacity;
      UI.card(vec2(0, 0), CW, CH, { center: true, fill: UI.WHITE, opacity: op });
      UI.R(-PW / 2, photoY - PH / 2, PW, PH, UI.INK, op);
      UI.R(-PW / 2 + 1, photoY - PH / 2 + 1, PW - 2, PH - 2, UI.PHOTO, op);
      // each card takes its own window of the one park panorama, so the ten
      // snapshots are the same afternoon in the same place
      drawSprite({
        sprite: "photo-park",
        quad: new Quad(i / 10, 0, 1 / 10, 1),
        pos: vec2(-PW / 2 + 1, photoY - PH / 2 + 1),
        width: PW - 2, height: PH - 2, opacity: op,
      });
      // a soft shadow puts the friend on the grass rather than in front of it
      drawEllipse({
        pos: vec2(0, feetY - 1), radiusX: 20, radiusY: 5,
        color: rgb(30, 48, 24), opacity: op * 0.45,
      });
    });
    const figure = card.add([...ART.charComps(c.id, 84), pos(0, feetY - 42), opacity(1)]);
    const name = card.add([
      text(c.name.toLowerCase(), { size: 32, font: UI.VT }), pos(0, CH / 2 - 21), anchor("center"),
      color(UI.rgb(UI.TEXT)), opacity(1),
    ]);
    // a strip of silver tape holds the chosen one down
    const tapeInk = card.add([rect(40, 14), pos(0, -CH / 2), anchor("center"), color(UI.rgb(UI.INK)), opacity(1)]);
    const tape = card.add([rect(36, 10), pos(0, -CH / 2), anchor("center"), color(UI.rgb(UI.STEEL)), opacity(1)]);
    const kids = [figure, name, tapeInk, tape];

    // staggered entrance
    UI.slideIn(card, p.add(0, 36), p, 0.45, delay);

    card.onUpdate(() => {
      // hover lift + selected bob, once the entrance has landed
      const want = (card.isHovering() || selected === i) ? 1 : 0;
      card.lift += (want - card.lift) * Math.min(1, dt() * 10);
      if (time() > card.born + 0.5) card.pos.y = card.home.y - 6 * card.lift;
      figure.pos.y = feetY - 42 + (selected === i ? Math.sin(time() * 3 + 1) * 2.5 : 0);
      for (const k of kids) k.opacity = card.opacity;
      tapeInk.hidden = tape.hidden = selected !== i;
    });

    card.onClick(() => {
      if (selected === i) confirm();
      else { selected = i; SFX.play("uitick"); }
    });
    cards.push(card);
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
    text("click once to look, again to pick   ·   arrows + ENTER", { size: 16, font: UI.VT }),
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
