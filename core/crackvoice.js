// ============================================================
// CRACKVOICE: the voice in the cracks (data/crackvoice.js).
//
// After some rooms the ground splits and somebody talks to you out
// of the crack: Busy You, never named until the finale (Ollie, 13
// Oct 2026). The room freezes (G.paused and G.cutscene, so you,
// your friends and the HUD all stand still), black bars come in,
// the crack glows and the words type out in a dark note above it.
// A press or a tap hurries the words along.
//
// The top half is plain JavaScript, tested in node
// (tools/tests/crackvoice.test.js). The Kaboom glue is below it.
// ============================================================

const CRACKVOICE = {};

CRACKVOICE.CPS = 40;     // letters a second as the voice types
CRACKVOICE.WRAP = 330;   // the note's widest line, px
CRACKVOICE.BAR = 40;     // the black bars, px tall

// ---------- the beats ----------
CRACKVOICE.key = (chapter, area) => chapter + "-" + area;

// This room's beat, or null: none here, or already heard this run.
CRACKVOICE.beat = (chapter, area, said) => {
  const k = CRACKVOICE.key(chapter, area);
  if (!CRACK_VOICE[k] || (said || []).includes(k)) return null;
  return CRACK_VOICE[k];
};

CRACKVOICE.fill = (str, name) => String(str).split("[name]").join(name);

// The steps that can play with this party (whoever you are playing included).
CRACKVOICE.steps = (beat, party) =>
  beat.filter((s) => !s.needs || s.needs.every((id) => party.includes(id)));

// ---------- the clock ----------
// A laugh comes out twice as fast as words.
CRACKVOICE.speed = (s) => (s.laugh ? 2 : 1);
CRACKVOICE.typeTime = (str, speed = 1) => str.length / (CRACKVOICE.CPS * speed);
CRACKVOICE.shown = (str, t, speed = 1) =>
  Math.max(0, Math.min(str.length, Math.floor(t * CRACKVOICE.CPS * speed + 1e-6)));

// How long a step stays once all its words are out: long enough to read,
// never a wait. A cut-off line barely stays at all.
CRACKVOICE.hold = (s) => {
  if (s.cut) return 0.25;
  if (s.ring) return 1.5;
  if (s.laugh) return 2.1;   // the last HA! has floated off before the note goes
  if (s.fade) return 0.5;
  return 0.9 + (s.say || "").length * 0.024;
};

// ---------- sounds ----------
// Kept here, not in core/sfx.js: a low murmur under the typing, a lighter
// one under an aside, the laugh's "ha" and a phone's trill.
if (typeof SFX !== "undefined") {
  Object.assign(SFX.LIB, {
    voice: () => SFX.tone({ type: "triangle", from: rand(92, 118), to: rand(70, 84), dur: 0.07, vol: 0.5 }),
    voiceSmall: () => SFX.tone({ type: "triangle", from: rand(150, 180), to: 120, dur: 0.05, vol: 0.25 }),
    ha: () => { SFX.tone({ type: "sawtooth", from: rand(190, 230), to: 120, dur: 0.14, vol: 0.45 }); SFX.noise({ dur: 0.08, vol: 0.2, freq: 700 }); },
    ring: () => { for (let i = 0; i < 8; i++) SFX.tone({ type: "square", from: i % 2 ? 1320 : 1660, dur: 0.05, vol: 0.16, delay: i * 0.06 }); },
  });
}

// ---------- on the field ----------

// Freeze the room and play its beat, if it has one not yet heard this run.
// at() says where the crack opened (null: the middle of the view); delay
// gives the cracks time to come out first. Returns false when there is no
// beat, so the room's own "cleared" quip can go ahead instead.
CRACKVOICE.run = ({ chapter, area, at, delay = 1 }) => {
  if (!G.run) return false;
  const beat = CRACKVOICE.beat(chapter, area, G.run.voiceSaid);
  if (!beat) return false;
  if (!G.run.voiceSaid) G.run.voiceSaid = [];
  G.run.voiceSaid.push(CRACKVOICE.key(chapter, area));
  const steps = CRACKVOICE.steps(beat, G.run.companions.concat([G.run.charId]));

  const hold = CRACKVOICE.freeze();
  const bars = CRACKVOICE.bars();
  const look = CRACKVOICE.look(at && at());
  wait(delay, () => {
    CRACKVOICE.play(steps, (at && at()) || camPos(), () => {
      bars.out();
      look.back(hold.release);   // back to you, then hand back
    });
  });
  return true;
};

// A boss room's way-on crack with nothing to say (no line in this room, or
// heard already this run) that opened out of view: the same glide over to
// it while it grows and back, so you see where the way on is (Ollie, 13 Oct
// 2026). Nothing happens when it is in view. True if it looked.
CRACKVOICE.showCrack = (p, dur) => {
  const look = CRACKVOICE.look(p);
  if (!look.to) { destroy(look); return false; }
  const hold = CRACKVOICE.freeze();
  wait(dur, () => look.back(hold.release));
  return true;
};

// Freeze the room for a story beat (G.paused and G.cutscene), with everyone
// stood breathing rather than stopped dead mid-step or mid-throw; a throw or
// a victory pose plays out first. release() hands back once the bars are
// nearly gone, and never from under the pause menu, which puts back
// whatever it found when it closes.
CRACKVOICE.freeze = () => {
  FIDGET.stop();
  UI.releaseSticks();
  G.paused = true;
  G.cutscene = true;
  onSceneLeave(() => { G.cutscene = false; G.camTo = null; });   // quitting mid-beat must not leave it on
  const still = add([]);
  still.onUpdate(() => {
    if (UI.pauseOpen) return;
    for (const o of get("player").concat(G.followers || [])) {
      if (!o.exists() || !ART.hasAnims(o.charId)) continue;
      if (o.actionT > 0) { o.actionT = Math.max(0, o.actionT - dt()); continue; }
      FIDGET.idle(o, o.charId);
    }
  });
  const release = () => {
    const back = add([{ t: 0 }]);
    back.onUpdate(() => {
      back.t += dt();
      if (back.t < 0.35 || UI.pauseOpen) return;
      G.paused = false;
      G.cutscene = false;
      destroy(still);
      destroy(back);
    });
  };
  return { release };
};

// A crack that opened out of view (a boss can fall a long way from where
// you stand, and a big crack only fits where the floor is open): the
// camera glides over to it, which shows you the way on, and back to you
// after (back()). G.camTo overrides the room's own follow while it
// is set, and G.camFollow is where that follow would be (scenes/area.js).
CRACKVOICE.look = (p) => {
  const c = camPos(), M = 110;
  const away = p && (Math.abs(p.x - c.x) > G.W / 2 - M || Math.abs(p.y - c.y) > G.H / 2 - M);
  const ease = (k) => k * k * (3 - 2 * k);
  const o = add([{ t: 0, from: c.clone(), to: away ? p.add(0, -G.charH(0.6)) : null, dur: 0.9, then: null }]);
  o.onUpdate(() => {
    if (!o.to || UI.pauseOpen) return;
    o.t += dt();
    const k = Math.min(1, o.t / o.dur);
    const to = o.then ? (G.camFollow || o.to) : o.to;
    G.camTo = o.from.lerp(to, ease(k));
    if (k >= 1 && o.then) { G.camTo = null; destroy(o); o.then(); }
  });
  o.back = (then) => {
    if (!o.to) { destroy(o); then(); return; }
    o.from = (G.camTo || camPos()).clone();
    o.t = 0;
    o.dur = 0.8;
    o.then = then;
  };
  return o;
};

// The black bars, top and bottom, easing in and back out.
CRACKVOICE.bars = () => {
  const o = add([fixed(), z(172), { k: 0, want: 1 }]);
  o.onUpdate(() => {
    o.k += (o.want - o.k) * Math.min(1, dt() * 9);
    if (o.want === 0 && o.k < 0.01) destroy(o);
  });
  o.onDraw(() => {
    const h = Math.round(CRACKVOICE.BAR * o.k);
    if (h <= 0) return;
    UI.R(0, 0, G.W, h, UI.INK);
    UI.R(0, G.H - h, G.W, h, UI.INK);
  });
  o.out = () => { o.want = 0; };
  return o;
};

// One run of words in the note, measured whole so the note never grows as
// they type. Asides and rings are in the small pixel type, a laugh is big.
CRACKVOICE.seg = (s, name) => {
  const text = s.ring || CRACKVOICE.fill(s.say, name);
  const small = !!(s.small || s.ring);
  const font = small ? UI.PX : UI.VT;
  const size = s.laugh ? 32 : small ? 8 : 16;
  const one = UI.measure(text, font, size);
  const wrap = one.width > CRACKVOICE.WRAP ? CRACKVOICE.WRAP : undefined;
  const f = wrap ? UI.measure(text, font, size, { width: wrap, align: "center" }) : one;
  const speed = CRACKVOICE.speed(s);
  return {
    s, text, font, size, wrap, w: Math.ceil(f.width), h: Math.ceil(f.height),
    shown: s.ring ? text.length : 0, blip: 0, op: 1,
    shake: s.laugh ? 2 : s.ring ? 1 : 0,
    color: s.ring ? UI.VOICE_GLOW : UI.VOICE_TEXT,
    speed, type: s.ring ? 0 : CRACKVOICE.typeTime(text, speed),
  };
};

// The dark note: "???" over the words, a tail down to the crack, kept in
// view and clear of the bars. A cut-off line keeps its place above
// whatever barges in under it.
CRACKVOICE.note = (from) => {
  // op eases in and out; k is a fade laid over it (Mike's line)
  const n = add([pos(from), z(150), { segs: [], op: 0, want: 0, k: 1, w: 0, h: 0 }]);
  const TOP = 8 + 8 + 6, BOT = 11, GAP = 6;
  n.set = (segs) => {
    n.segs = segs;
    n.k = 1;
    let w = 0, h = 0;
    for (const s of segs) { w = Math.max(w, s.w); h += s.h; }
    n.w = Math.max(w, 40) + 34;
    n.h = TOP + h + (segs.length - 1) * GAP + BOT;
    n.want = 1;
  };
  n.onUpdate(() => {
    n.op += (n.want - n.op) * Math.min(1, dt() * 14);
    const c = camPos(), B = CRACKVOICE.BAR;
    n.pos = vec2(
      G.clamp(from.x, c.x - G.W / 2 + n.w / 2 + 12, c.x + G.W / 2 - n.w / 2 - 12),
      G.clamp(from.y - G.charH(0.5) - n.h / 2, c.y - G.H / 2 + B + n.h / 2 + 8, c.y + G.H / 2 - B - n.h / 2 - 16),
    );
  });
  n.onDraw(() => {
    const op = n.op * n.k;
    if (op < 0.01 || !n.segs.length) return;
    UI.card(vec2(0, 0), n.w, n.h, { center: true, fill: UI.VOICE_FILL, shade: UI.VOICE_RULE, drop: 3, opacity: op });
    // the tail points at the crack, wherever the note had to sit
    const tx = G.clamp(from.x - n.pos.x, -n.w / 2 + 16, n.w / 2 - 16), ty = n.h / 2 + 1, d = 6.4;
    drawRect({ pos: vec2(tx, ty), width: 9, height: 9, anchor: "center", angle: 45, color: UI.rgb(UI.VOICE_FILL), opacity: op });
    drawLines({ pts: [vec2(tx - d, ty), vec2(tx, ty + d), vec2(tx + d, ty)], width: 2, color: UI.rgb(UI.INK), opacity: op });
    UI.label("???", -n.w / 2 + 11, -n.h / 2 + 8, { size: 8, color: UI.VOICE_GLOW, shadow: false, opacity: op });
    let y = -n.h / 2 + TOP;
    for (const s of n.segs) {
      drawText({
        text: s.text, font: s.font, size: s.size, width: s.wrap, align: "center",
        pos: vec2(0, y), anchor: "top", color: UI.rgb(s.color), opacity: op * s.op,
        // letters not typed yet are there but unseen (0 would be ignored)
        transform: (i) => ({
          opacity: i < s.shown ? 1 : 1e-4,
          pos: s.shake ? vec2(rand(-s.shake, s.shake), rand(-s.shake, s.shake)) : null,
        }),
      });
      y += s.h + GAP;
    }
  });
  return n;
};

// Run the steps from the crack at `at`, then done().
CRACKVOICE.play = (steps, at, done) => {
  const name = G.playerChar().name;
  const note = CRACKVOICE.note(at);
  // the crack glows the purple of a boss room's way on, brighter as it talks
  const glow = add([
    sprite("glow"), anchor("center"), pos(at), scale(G.charH(3.2) / 96, G.charH(1.2) / 96),
    color(UI.rgb(UI.VOICE_GLOW)), opacity(0), z(1), { talk: 0, k: 0, want: 1 },
  ]);
  glow.onUpdate(() => {
    glow.k += (glow.want - glow.k) * Math.min(1, dt() * 4);
    glow.opacity = glow.k * (0.22 + Math.sin(time() * 3) * 0.08 + glow.talk * 0.3);
    if (glow.want === 0 && glow.k < 0.01) destroy(glow);
  });

  const run = add([{ i: -1, t: 0, end: 0, seg: null, haT: 0 }]);
  const finish = () => {
    note.want = 0;
    glow.want = 0;
    hurryKey.cancel();
    hurryTap.cancel();
    destroy(run);
    done();
  };
  const next = () => {
    run.i++;
    run.t = 0;
    run.seg = null;
    glow.talk = 0;
    const s = steps[run.i];
    if (!s) { finish(); return; }
    const prev = steps[run.i - 1];
    if (s.kiss) {
      note.want = 0;
      run.end = Infinity;
      CRACKVOICE.kiss(() => { run.t = 0; run.end = 0.5; });
      return;
    }
    if (s.by) {   // you, or friends, in their own white notes
      note.want = 0;
      const text = CRACKVOICE.fill(s.say, name);
      SPEECH.speak(s.by === "you" ? G.run.charId : s.by, text);
      run.end = CRACKVOICE.typeTime(text) + CRACKVOICE.hold(s);
      return;
    }
    const seg = CRACKVOICE.seg(s, name);
    const keep = prev && prev.cut && !prev.by && note.segs.length;
    if (!keep) note.op = 0;   // a fresh note fades up
    note.set(keep ? note.segs.concat([seg]) : [seg]);
    run.seg = seg;
    run.end = seg.type + CRACKVOICE.hold(s);
    if (s.ring) { SFX.play("ring"); wait(0.75, () => SFX.play("ring")); }
  };
  run.onUpdate(() => {
    if (UI.pauseOpen) return;
    run.t += dt();
    const seg = run.seg;
    if (seg && !seg.s.ring) {
      const n = CRACKVOICE.shown(seg.text, run.t, seg.speed);
      // a murmur every third letter as it types
      if (!seg.s.laugh && Math.floor(n / 3) > seg.blip) {
        seg.blip = Math.floor(n / 3);
        if (seg.text[n - 1] !== " ") SFX.play(seg.s.small ? "voiceSmall" : "voice");
      }
      seg.shown = n;
      glow.talk = n < seg.text.length ? 1 : 0;
      // Mike fades away as he is typed, the note with him: gone just after
      // the last word
      if (seg.s.fade) note.k = 1 - Math.max(0, Math.min(1, (run.t - seg.type * 0.3) / (seg.type * 0.7 + CRACKVOICE.hold(seg.s))));
      // the laugh: HA!s off the crack, a little shake on every one
      if (seg.s.laugh && run.t < seg.type + 0.9) {
        run.haT -= dt();
        if (run.haT <= 0) {
          run.haT = 0.28;
          glow.talk = 1;
          shake(2);
          SFX.play("ha");
          UI.floatText(at.add(rand(-70, 70), -rand(0, 40)), "HA!", [255, 255, 255]);
        }
      }
    }
    if (run.t >= run.end) next();
  });

  // a press or a tap: the words all out at once, or on to the next
  const hurry = () => {
    if (UI.pauseOpen || !run.exists() || run.t < 0.2) return;
    const s = steps[run.i];
    if (!s || s.kiss || s.ring) return;
    if (run.seg && run.t < run.seg.type) run.t = run.seg.type;
    else run.t = run.end;
  };
  const hurryKey = onKeyPress(hurry);
  const hurryTap = onMousePress(hurry);
  next();
};

// Sam and Josh's kiss, the one they take turns with in a calm room
// (core/fidget.js), run while the room is frozen. Hearts if the drawing
// is missing; nothing if one of them is not on the field.
CRACKVOICE.kiss = (done) => {
  const P = FIDGET.PAIR;
  const people = get("player").concat(G.followers || []).filter((o) => o.exists());
  const a = people.find((o) => o.charId === P.kisser), b = people.find((o) => o.charId === P.shy);
  if (a && b && ART.hasAnims(P.kisser) && ART.hasAnims(P.shy) && G.SPR["pair-" + P.id]) {
    FIDGET.kiss(a, b, done, { whilePaused: true });
    return;
  }
  if (a && b) COMPANIONS.heartsBetween(P.kisser, P.shy);
  wait(a && b ? 1.2 : 0, done);
};
