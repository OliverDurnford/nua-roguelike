// ============================================================
// CLOUDUI: the save word panel (18 Oct 2026). A paper card like the
// admin PIN pad, reached from a chip on the title and a row in the
// pause menu. Getting a word, typing one in, the "is this yours?"
// question, picking which run to carry on with, and forgetting a
// device all happen here; the syncing itself is core/cloud.js.
//
// The word is typed on the game's own keyboard, drawn in the kit:
// an iPhone's own keyboard only comes up for a text box focused
// inside the tap itself (Kaboom hears taps a frame late), covers half
// the screen in landscape, and would never look like the game. A
// laptop's real keys work too.
//
// Typing a word in and forgetting a device are offered on the title
// only, so a run being played is never swapped or wiped from under
// the player. All the words here are placeholder for Ollie.
// Tests: node tools/tests/cloudui.test.js
// ============================================================

const CLOUDUI = { isOpen: false, closedAt: -1, root: null };

// Every button and key on the panel as it stands, in game pixels, with what
// it says: for driving the panel from a test, as a finger would.
CLOUDUI.targets = () => [];

CLOUDUI.KEY_ROWS = ["1234567890", "QWERTYUIOP", "ASDFGHJKL-", "ZXCVBNM<"];
CLOUDUI.MAX = 24;   // the longest word there is, with room to spare

// true while the panel is up, and for a moment after, so the tap that
// closes it never also lands on whatever is underneath
CLOUDUI.busy = () => (CLOUDUI.isOpen && !!CLOUDUI.root && CLOUDUI.root.exists())
  || (typeof time === "function" && time() - CLOUDUI.closedAt < 0.3);

// ---------- the words, worked out ----------

const cloudPlural = (n, one, many) => n + " " + (n === 1 ? one : many);

CLOUDUI.runPhrase = (r) => {
  if (!r) return null;
  const c = typeof G !== "undefined" && G.char ? G.char(r.charId) : null;
  const who = c ? " as " + c.name : "";
  return "a run" + who + (r.scene === "tutorial" ? " in Victoria Park" : " in chapter " + r.chapter);
};

// What a save holds, the way a friend would say it.
CLOUDUI.describe = (s) => {
  const parts = [];
  if (s.platinum) parts.push("the platinum");
  if (s.trophies) parts.push(cloudPlural(s.trophies, "trophy", "trophies"));
  if (s.caps) parts.push(cloudPlural(s.caps, "MilpooL cap", "MilpooL caps"));
  if (s.bonus) parts.push(cloudPlural(s.bonus, "bonus friend", "bonus friends"));
  if (!parts.length && s.found) parts.push(cloudPlural(s.found, "friend found", "friends found"));
  if (s.run) parts.push(CLOUDUI.runPhrase(s.run));
  if (!parts.length) return "nothing yet";
  return parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
};

CLOUDUI.ago = (then, now) => {
  if (!then) return "never";
  const m = (now - then) / 60000;
  if (m < 1) return "just now";
  if (m < 2) return "a minute ago";
  if (m < 60) return Math.floor(m) + " minutes ago";
  const h = m / 60;
  if (h < 2) return "an hour ago";
  if (h < 24) return Math.floor(h) + " hours ago";
  if (h < 48) return "yesterday";
  return Math.floor(h / 24) + " days ago";
};

// Which of two run saves is further along: the park, then chapter, then room.
// A tie keeps this device's.
CLOUDUI.further = (local, remote) => {
  const rank = (s) => (!s || !s.run ? -1 : s.scene === "tutorial" ? 0 : s.run.chapter * 10 + s.run.area);
  return rank(remote) > rank(local) ? "remote" : "local";
};

CLOUDUI.runLabel = (s) => {
  const c = typeof G !== "undefined" && G.char ? G.char(s.run.charId) : null;
  return (c ? "as " + c.name + " · " : "") + (s.scene === "tutorial" ? "victoria park" : "chapter " + s.run.chapter);
};

// The title's chip: null with the cloud off (no chip), "played before?" on
// a device with nothing on it yet, else "save word".
CLOUDUI.chipLabel = () => {
  if (typeof CLOUD === "undefined" || !CLOUD.enabled()) return null;
  if (CLOUD.meta().word || CLOUD.hasProgress(CLOUD.read())) return "save word";
  return "played before?";
};

// ---------- the panel ----------
// where: "title" or "pause". onClose runs as it goes away.
CLOUDUI.open = (where, onClose) => {
  if (CLOUDUI.busy() || typeof CLOUD === "undefined" || !CLOUD.enabled()) return;
  CLOUDUI.isOpen = true;
  const onTitle = where === "title";
  const touch = isTouchscreen();
  const S = touch
    ? { W: 720, rowH: 46, rowW: 380, rowGap: 10, rowSize: 32, kw: 58, kh: 44, kg: 6, keySize: 32 }
    : { W: 560, rowH: 28, rowW: 300, rowGap: 8, rowSize: 16, kw: 40, kh: 30, kg: 5, keySize: 16 };
  const LINE_W = S.W - 64;

  let screen = CLOUD.meta().word ? "word" : "intro";
  let sel = 0, typed = "", note = null, found = null, local = null;
  // Timed off the clock, not by adding up dt(): the pause menu stops the
  // game's updates (debug.paused), and a panel opened over it counted
  // nothing, so it took every tap for the one that opened it.
  const openedAt = time();
  const age = () => time() - openedAt;

  const show = (s) => { screen = s; sel = 0; note = null; };
  const busyWith = (p, then) => { show("working"); p.then(then, () => show("offline")); };

  const join = (o) => busyWith(CLOUD.join(found.word, found, o), (r) => show(r === "ok" ? "joined" : "joinedOffline"));
  const check = () => {
    const w = CLOUD.normWord(typed);
    if (!w) { note = "That doesn't look like a save word: two words and a number, like DISCO-OTTER-427."; return; }
    busyWith(CLOUD.lookup(w), (r) => {
      if (r === "missing") show("missing");
      else if (r === "offline") show("offline");
      else { found = r; local = CLOUD.read(); show("found"); }
    });
  };

  // Each screen: its lines, an optional big word, the keyboard, its buttons.
  const view = () => {
    const word = CLOUD.meta().word;
    switch (screen) {
      case "intro": return {
        lines: ["A save word keeps your progress safe in case the game crashes and you lose it, and lets you carry on on another phone, iPad or laptop."]
          .concat(onTitle ? [] : ["Got a word from another device already? Type it in on the title screen."]),
        buttons: [{ label: "get my save word", act: () => busyWith(CLOUD.create(), (w) => show(typeof w === "string" && CLOUD.WORD_SHAPE.test(w) ? "word" : "offline")) }]
          .concat(onTitle ? [{ label: "I have a word", act: () => { typed = ""; show("type"); } }] : [])
          .concat([{ label: "back", act: close }]),
      };
      case "word": {
        const st = CLOUD.status();
        const how = st.state === "working" ? "syncing..."
          : st.state === "offline" ? "offline: it will catch up when it can"
          : st.lastSync ? "in step, " + CLOUDUI.ago(st.lastSync, Date.now()) : "waiting to sync";
        return {
          lines: [
            "Keep it safe in case the game crashes and you lose your progress, or if you want to carry on on another device: just type it in. It keeps up with you as you play.",
            "Screenshot it now. There's no getting it back if you lose it.",
          ],
          big: word, after: [how],
          // a friend who got a word on two devices puts them together by
          // typing the other one in here: this device's progress joins it
          buttons: [{ label: "done", act: close }].concat(onTitle ? [
            { label: "use a different word", act: () => { typed = ""; show("type"); } },
            { label: "forget this device", act: () => show("forget") },
          ] : []),
        };
      }
      case "type": return {
        lines: [note || "Type your save word."], keyboard: true, inline: true,
        buttons: [{ label: "back", act: () => show(CLOUD.meta().word ? "word" : "intro") }, { label: "OK", act: check }],
      };
      case "working": return { lines: ["Talking to the cloud..."], buttons: [] };
      case "found": {
        const mine = CLOUD.hasProgress(local);
        return {
          lines: ["Found it: " + CLOUDUI.describe(CLOUD.summary(found.bundle)) + ".",
            mine ? "This device has its own progress too. Put them together? Only do this if both are yours." : "Bring it onto this device?"],
          buttons: [
            { label: mine ? "put them together" : "bring it in", act: () => {
              const remoteRun = CLOUD.clean(found.bundle).run.save;
              if (local.run.save && remoteRun) {
                show("pick");
                sel = CLOUDUI.further(local.run.save, remoteRun) === "remote" ? 0 : 1;
              } else join({});
            } },
            { label: "not now", act: close },
          ],
        };
      }
      case "pick": {
        const remoteRun = CLOUD.clean(found.bundle).run.save;
        return {
          lines: ["Both have a run going. Which one do you want to carry on with?"],
          buttons: [
            { label: CLOUDUI.runLabel(remoteRun), tag: "FROM YOUR WORD", act: () => join({ run: "remote" }) },
            { label: CLOUDUI.runLabel(local.run.save), tag: "THIS DEVICE", act: () => join({ run: "local" }) },
          ],
        };
      }
      case "joined":
      case "joinedOffline": return {
        lines: ["Done. This device is in step with your word."]
          .concat(screen === "joinedOffline" ? ["It will finish syncing once you're back online."] : []),
        big: word, buttons: [{ label: "carry on", act: close }],
      };
      case "missing": return {
        lines: ["No save has that word. Check it against your screenshot."],
        buttons: [{ label: "try again", act: () => show("type") }, { label: "back", act: close }],
      };
      case "forget": return {
        lines: ["Forget this device? Everything goes up to the cloud first, then this device starts again like new. Your word still works anywhere."],
        buttons: [
          { label: "keep it", act: () => show("word") },   // first, so Enter keeps it
          { label: "forget it", act: () => busyWith(CLOUD.forget(), (r) => { if (r !== "ok") show("offline"); }) },
        ],
      };
      default: return {
        lines: ["Can't reach the cloud right now. Try again when you're online."],
        buttons: [{ label: "back", act: close }],
      };
    }
  };

  // ---------- layout, worked out fresh each frame from the view ----------
  const lineH = (str) => UI.measure(str, UI.VT, 16, { width: LINE_W }).height;
  const keyRects = () => {
    const out = [];
    CLOUDUI.KEY_ROWS.forEach((row, ri) => {
      const keys = row.split("");
      const wide = (k) => (k === "<" ? S.kw * 2 + S.kg : S.kw);
      const rowW = keys.reduce((a, k) => a + wide(k), 0) + (keys.length - 1) * S.kg;
      let x = G.W / 2 - rowW / 2;
      for (const k of keys) { out.push({ k, ri, x, w: wide(k) }); x += wide(k) + S.kg; }
    });
    return out;
  };
  const layout = (v) => {
    const parts = [];
    let h = 20 + 16 + 16;
    for (const ln of v.lines) { parts.push({ kind: "line", str: ln, y: h }); h += lineH(ln) + 6; }
    if (v.big) { h += 6; parts.push({ kind: "big", str: v.big, y: h }); h += 44 + 10; }
    for (const ln of v.after || []) { parts.push({ kind: "line", str: ln, y: h, dim: true }); h += lineH(ln) + 6; }
    if (v.keyboard) {
      h += 6;
      parts.push({ kind: "field", y: h });
      h += 40 + 12;
      parts.push({ kind: "keys", y: h });
      h += CLOUDUI.KEY_ROWS.length * (S.kh + S.kg) + 6;
    }
    h += 6;
    const btns = [];
    const bh = (b) => (b.tag ? S.rowH + 14 : S.rowH);
    if (v.inline && v.buttons.length) {
      const bw = Math.min(S.rowW, (S.W - 64 - S.rowGap * (v.buttons.length - 1)) / v.buttons.length);
      const total = bw * v.buttons.length + S.rowGap * (v.buttons.length - 1);
      v.buttons.forEach((b, i) => btns.push({ b, x: G.W / 2 - total / 2 + i * (bw + S.rowGap), y: h, w: bw, h: S.rowH }));
      h += S.rowH + S.rowGap;
    } else {
      for (const b of v.buttons) { btns.push({ b, x: G.W / 2 - S.rowW / 2, y: h, w: S.rowW, h: bh(b) }); h += bh(b) + S.rowGap; }
    }
    h += 14;
    const y0 = Math.round(G.H / 2 - h / 2);
    return { parts, btns, h, y0 };
  };

  const hit = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const keyAt = (m, L, v) => {
    if (!v.keyboard) return null;
    const kp = L.parts.find((p) => p.kind === "keys");
    for (const r of keyRects()) {
      const ry = L.y0 + kp.y + r.ri * (S.kh + S.kg);
      if (hit(m, { x: r.x, y: ry, w: r.w, h: S.kh })) return r.k;
    }
    return null;
  };
  const tap = (k) => {
    if (k === "<") typed = typed.slice(0, -1);
    else if (typed.length < CLOUDUI.MAX) typed += k;
    note = null;
    SFX.play("uitick");
  };

  CLOUDUI.targets = () => {
    const v = view(), L = layout(v), out = [];
    L.btns.forEach((r) => out.push({ label: r.b.label, x: r.x, y: L.y0 + r.y, w: r.w, h: r.h }));
    const kp = L.parts.find((p) => p.kind === "keys");
    if (kp) for (const r of keyRects()) out.push({ label: r.k, x: r.x, y: L.y0 + kp.y + r.ri * (S.kh + S.kg), w: r.w, h: S.kh });
    return out;
  };

  const root = add([fixed(), z(240), pos(0, 0)]);
  CLOUDUI.root = root;
  root.onDraw(() => {
    const v = view(), L = layout(v);
    const x0 = Math.round(G.W / 2 - S.W / 2), y0 = L.y0;
    UI.R(0, 0, G.W, G.H, UI.INK, 0.6);
    UI.card(vec2(x0, y0), S.W, L.h, { drop: 4 });
    UI.label("SAVE WORD", G.W / 2, y0 + 20, { size: 16, anchor: "top", color: UI.TEXT, shadow: false });
    for (const p of L.parts) {
      const y = y0 + p.y;
      if (p.kind === "line") {
        UI.text(p.str, G.W / 2, y, { anchor: "top", align: "center", width: LINE_W, opacity: p.dim ? 0.6 : 1 });
      } else if (p.kind === "big") {
        const w = Math.ceil(UI.measure(p.str, UI.PX, 16).width) + 40;
        UI.R(G.W / 2 - w / 2, y, w, 44, UI.INK);
        UI.R(G.W / 2 - w / 2 + 2, y + 2, w - 4, 40, UI.WHITE);
        UI.label(p.str, G.W / 2, y + 23, { size: 16, anchor: "center", color: UI.BLUE_DEEP, shadow: false });
      } else if (p.kind === "field") {
        const w = Math.min(S.W - 64, touch ? 560 : 440);
        UI.R(G.W / 2 - w / 2, y, w, 40, UI.INK);
        UI.R(G.W / 2 - w / 2 + 2, y + 2, w - 4, 36, UI.WHITE);
        const shown = typed + (Math.floor(time() * 2) % 2 ? "_" : " ");
        UI.label(shown, G.W / 2, y + 21, { size: 16, anchor: "center", color: UI.BLUE_DEEP, shadow: false });
      } else if (p.kind === "keys") {
        // a layer at a time, every key's card and then every letter: card,
        // letter, card, letter is a trip to the graphics chip per key, and
        // forty of those a frame built up until the page stopped answering
        const keys = keyRects();
        for (const r of keys) {
          UI.card(vec2(r.x, y + r.ri * (S.kh + S.kg)), r.w, S.kh, { fill: r.k === "<" ? UI.PAPER_DIM : UI.CHIP, shade: UI.PAPER_SHADE, notch: false });
        }
        for (const r of keys) {
          UI.text(r.k === "<" ? "delete" : r.k, r.x + r.w / 2, y + r.ri * (S.kh + S.kg) + S.kh / 2 + 1, { anchor: "center", size: r.k === "<" ? 16 : S.keySize });
        }
      }
    }
    L.btns.forEach((r, i) => {
      const on = i === sel;
      UI.card(vec2(r.x, y0 + r.y), r.w, r.h, { fill: on ? UI.STEEL : UI.CHIP, shade: on ? UI.BLUE : null, notch: false });
    });
    L.btns.forEach((r) => {
      const y = y0 + r.y;
      if (r.b.tag) {
        UI.label(r.b.tag, r.x + r.w / 2, y + 8, { size: 8, anchor: "top", color: UI.TEXT, shadow: false });
        UI.text(r.b.label, r.x + r.w / 2, y + 14 + (r.h - 14) / 2, { anchor: "center", size: S.rowSize });
      } else {
        UI.text(r.b.label, r.x + r.w / 2, y + r.h / 2 + 1, { anchor: "center", size: S.rowSize });
      }
    });
  });

  // ---------- input ----------
  const activate = () => {
    const v = view();
    const b = v.buttons[sel];
    if (!b) return;
    SFX.play("uiconfirm");
    b.act();
  };
  const move = (d) => {
    const n = view().buttons.length;
    if (!n) return;
    sel = (sel + d + n) % n;
    SFX.play("uitick");
  };
  const handlers = [
    onMouseMove(() => {
      const v = view(), L = layout(v), m = mousePos();
      L.btns.forEach((r, i) => { if (hit(m, { x: r.x, y: L.y0 + r.y, w: r.w, h: r.h })) sel = i; });
    }),
    onMousePress(() => {
      if (age() < 0.15) return;   // the tap that opened it
      const v = view(), L = layout(v), m = mousePos();
      const k = keyAt(m, L, v);
      if (k) return tap(k);
      L.btns.forEach((r, i) => { if (hit(m, { x: r.x, y: L.y0 + r.y, w: r.w, h: r.h })) { sel = i; activate(); } });
    }),
    onKeyPress((key) => {
      if (age() < 0.15) return;
      const v = view();
      if (key === "escape") {
        if (screen === "working") return;
        if (screen === "type") show(CLOUD.meta().word ? "word" : "intro");
        else close();
        SFX.play("uitick");
      } else if (key === "backspace" && v.keyboard) tap("<");
      else if (key === "enter") { if (v.keyboard) check(); else activate(); }   // Enter after typing means OK
      else if (!v.keyboard && (key === "up" || key === "left")) move(-1);
      else if (!v.keyboard && (key === "down" || key === "right")) move(1);
    }),
    onCharInput((ch) => {
      if (screen !== "type" || age() < 0.15) return;
      const c = ch === " " ? "-" : ch.toUpperCase();
      if (/^[A-Z0-9-]$/.test(c)) tap(c);
    }),
  ];

  function close() {
    root.destroy();
    for (const h of handlers) h.cancel();
    CLOUDUI.isOpen = false;
    CLOUDUI.root = null;
    CLOUDUI.targets = () => [];
    CLOUDUI.closedAt = time();
    if (onClose) { try { onClose(); } catch (e) {} }
  }
  SFX.play("uitick");
};
