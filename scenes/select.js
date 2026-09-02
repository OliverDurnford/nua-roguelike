// ============================================================
// CHARACTER SELECT: all ten, selectable from the start.
// Cards slide in staggered, hover to lift, a gold glow tracks
// the selection, details in a sleek bottom panel.
// ============================================================

scene("select", () => {
  G.paused = false;

  add([sprite("bg-night"), pos(0, 0), scale(G.W / 8, G.H / 256), z(0)]);
  add([sprite("vignette"), pos(0, 0), scale(G.W / 480, G.H / 270), opacity(0.5), z(40)]);

  const heading = add([
    text("WHO ARE YOU, THEN?", { size: 28 }),
    pos(G.W / 2, 40), anchor("center"), color(255, 242, 205), z(5), opacity(1),
  ]);
  UI.slideIn(heading, vec2(G.W / 2, 18), vec2(G.W / 2, 40), 0.5);
  const headRule = add([rect(0, 2.5), pos(G.W / 2, 62), anchor("center"), color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), z(5), opacity(0.8)]);
  let hr = 0;
  headRule.onUpdate(() => { hr += dt(); headRule.width = 320 * UI.ease(hr / 0.7); });

  let selected = 0;
  const cards = [];

  const CW = 148, CH = 148, GX = 168, GY = 166;
  const x0 = G.W / 2 - 2 * GX;
  const y0 = 152;

  // one glow that glides between cards instead of popping
  const glow = add([
    sprite("glow"), pos(x0, y0), anchor("center"), scale(2.6),
    color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), opacity(0.35), z(4),
  ]);

  CHARACTERS.forEach((c, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const p = vec2(x0 + col * GX, y0 + row * GY);

    const card = add([
      rect(CW, CH, { radius: 12 }), pos(p), anchor("center"),
      color(22, 24, 34), outline(2, rgb(62, 65, 82)),
      area(), z(5), opacity(1),
      { idx: i, home: p.clone(), lift: 0 },
    ]);
    const sprObj = add([...ART.charComps(c.id, 84), pos(p.add(0, -10)), z(6), opacity(1), { t: rand(0, 5) }]);
    const nameObj = add([text(c.name, { size: 15 }), pos(p.add(0, 56)), anchor("center"), z(6), opacity(1)]);

    // staggered entrance
    UI.slideIn(card, p.add(0, 36), p, 0.45, 0.05 * (col + row * 2));
    UI.slideIn(sprObj, p.add(0, 26), p.add(0, -10), 0.45, 0.05 * (col + row * 2));
    UI.slideIn(nameObj, p.add(0, 92), p.add(0, 56), 0.45, 0.05 * (col + row * 2));

    card.onUpdate(() => {
      // hover lift + selected bob
      const want = (card.isHovering() || selected === i) ? 1 : 0;
      card.lift += (want - card.lift) * Math.min(1, dt() * 10);
      const dy = -6 * card.lift;
      card.pos.y = card.home.y + dy;
      sprObj.pos.y = card.home.y - 10 + dy + (selected === i ? Math.sin(time() * 3 + 1) * 2.5 : 0);
      nameObj.pos.y = card.home.y + 56 + dy;

      card.outline.color = selected === i ? rgb(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]) : rgb(62, 65, 82);
      card.outline.width = selected === i ? 2.5 : 2;
      card.color = card.isHovering() && selected !== i ? rgb(30, 33, 46) : rgb(22, 24, 34);
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

  // ----- detail panel -----
  const panelY = G.H - 64;
  const panel = add([
    rect(G.W - 120, 78, { radius: 16 }), pos(G.W / 2, panelY), anchor("center"),
    color(UI.INK[0], UI.INK[1], UI.INK[2]), opacity(0), z(8),
  ]);
  UI.fadeObj(panel, 0.68, 0.5, 0.35);
  const dName = add([text("", { size: 19 }), pos(80, panelY - 22), anchor("left"), color(255, 242, 205), z(9)]);
  const dFlavour = add([text("", { size: 13 }), pos(80, panelY + 2), anchor("left"), color(178, 186, 208), z(9)]);
  const dInfo = add([text("", { size: 12 }), pos(80, panelY + 24), anchor("left"), color(UI.GOLD[0], UI.GOLD[1], UI.GOLD[2]), z(9)]);

  onUpdate(() => {
    const c = CHARACTERS[selected];
    dName.text = c.name;
    dFlavour.text = c.flavour;
    dInfo.text = "throws: " + c.weapon.name + "    ·    as a companion: " + c.passive.name + " (" + c.passive.desc + ")";
  });

  const hintTxt = add([
    text("click once to look, again to pick   ·   arrows + ENTER", { size: 11 }),
    pos(G.W / 2, G.H - 14), anchor("center"), color(110, 115, 135), z(9), opacity(0),
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
