// ============================================================
// SPEECH: who says what, and when.
//
// The lines live in data/speech.js, which is written by the
// speech board (tools/speech/board.html) and never by hand.
// This file is the engine that chooses between them.
//
// It knows nothing about how a bubble is drawn. It picks a line
// and hands it to COMPANIONS.say, which owns the sticky note.
//
// The shape of the thing:
//   the game raises a MOMENT   ->  SPEECH.fire("cleared")
//   the engine gathers every line whose `on` matches and whose
//   `when` clauses all pass, drops anything on cooldown or
//   already retired, weights what is left by the line's
//   frequency times the speaker's talkativeness, and picks one.
//
// Everything that stops it becoming a wall of noise is in the
// PACING block below and is meant to be tuned by ear.
// ============================================================

const SPEECH = {};

// ---------- pacing ----------
SPEECH.QUIET      = 4;     // s: no ambient line within this of any other line
SPEECH.CHAR_CD    = 12;    // s: one person cannot speak twice inside this
SPEECH.LINE_CD    = 90;    // s: the same line cannot come back inside this
SPEECH.SPOT_CD    = 45;    // s: walking past the bar again does not retrigger
SPEECH.TICK       = 3;     // s: how often the ambient roll happens
SPEECH.AMBIENT    = 0.14;  // base chance per tick, scaled by the party's talkativeness (0.28 until 16 Oct)
SPEECH.REPLY_GAP  = 1.5;   // s between a line and its reply
SPEECH.QUICK_GAP  = 0.6;   // s before a reply marked quick ("It's okay, Lucy, I fell off the kerb")
SPEECH.COPY_GAP   = 0.8;   // s between one copier and the next ("Ffffffffft")
SPEECH.IDLE_AFTER = 6;     // s of standing still before the idle moment
SPEECH.SPOT_RANGE = 1.6;   // grid units from a thing's footprint
SPEECH.SPOT_WAIT = 4;      // s: spots stay quiet this long after play starts
SPEECH.ENTER_WAIT = 4.5;   // s: chatter holds off this long for the room's "entering" line (raised 3.5 s in)

// Scripted beats ignore the global gag and always get through. The finale's
// two cutscene beats are among them (docs/superpowers/specs/2026-10-12-
// busy-boss-design.md).
SPEECH.SCRIPTED = ["join", "death", "bossStart", "enter", "special", "specialStart", "meet", "pubInvite", "fromPile"];

SPEECH.WEIGHT = { often: 3, sometimes: 1.5, rare: 0.5, run: 1.5, ever: 1.5 };

// Standing still in the foam pit with four friends, someone spoke every 12
// seconds and every once-a-run joke was gone in the first five minutes
// (Ollie, 16 Oct 2026: "far too much"). So chatter rolls far less often,
// and a room plays at most ONE of the once-a-run jokes that could happen
// anywhere, so they spread across the whole run. A room's own jokes (a line
// with a room clause) are not counted, and go first when they can.

// A joke that could come up in any room, once a run: the ones to ration.
SPEECH.isJoke = (l) => l.on === "wander" && (l.freq === "run" || l.freq === "ever") &&
  !(l.when && Array.isArray(l.when.room) && l.when.room.length);
// This room's own once-a-run line, which gets the first chance at it.
SPEECH.isRoomJoke = (l) => l.on === "wander" && (l.freq === "run" || l.freq === "ever") &&
  !!(l.when && Array.isArray(l.when.room) && l.when.room.length);

// Who speaks in the voice in the cracks' dark note rather than a white one.
SPEECH.VOICE = ["boss:oldage"];

// ---------- state ----------
// Reset per area by SPEECH.beginArea; cooldown clocks run off time(),
// which is continuous across scenes, so a line said in the last room
// is still cooling down in this one.
SPEECH.ctx = null;        // { roomId, chapter, area, tags, things, unit }
SPEECH.lastAny = -999;    // when anyone last spoke
SPEECH.lastBy = {};       // speaker -> when they last spoke
SPEECH.lastLine = {};     // line id -> when it last played
SPEECH.lastSpot = {};     // thing name -> when it last fired
SPEECH.bags = {};         // "who|moment" -> line ids not yet used this cycle

SPEECH.data = () => (typeof SPEECH_DATA !== "undefined" && SPEECH_DATA) || { lines: [], talkativeness: {} };

// A pair is keyed and cooled down as one speaker.
SPEECH.key = (who) => (Array.isArray(who) ? who.join("+") : who);

SPEECH.talk = (who) => {
  const t = SPEECH.data().talkativeness || {};
  return t[who] == null ? 1 : t[who];
};

// ---------- retirement: once a run, and once ever ----------
SPEECH.retiredRun = () => {
  if (!G.run) return [];
  if (!G.run.saidRun) G.run.saidRun = [];
  return G.run.saidRun;
};

SPEECH.retiredEver = () => {
  const s = STORY.get();
  return Array.isArray(s.said) ? s.said : [];
};

// "At most N times", a run or the whole game (line.max = { n, per }).
// Counted per line id: in the run for "run", in the story for "game".
SPEECH.counts = (per) => {
  if (per === "game") {
    const s = STORY.get();
    return (s.saidCount && typeof s.saidCount === "object") ? s.saidCount : {};
  }
  if (!G.run) return {};
  if (!G.run.saidCount) G.run.saidCount = {};
  return G.run.saidCount;
};
SPEECH.used = (line) => (line.max ? SPEECH.counts(line.max.per)[line.id] || 0 : 0);

SPEECH.retire = (line) => {
  if (line.max) {
    if (line.max.per === "game") {
      const s = STORY.get();
      if (!s.saidCount || typeof s.saidCount !== "object") s.saidCount = {};
      s.saidCount[line.id] = (s.saidCount[line.id] || 0) + 1;
      STORY.set(s);
    } else {
      const c = SPEECH.counts("run");
      c[line.id] = (c[line.id] || 0) + 1;
    }
  }
  if (line.freq === "run") {
    const r = SPEECH.retiredRun();
    if (!r.includes(line.id)) r.push(line.id);
  } else if (line.freq === "ever") {
    const s = STORY.get();
    if (!Array.isArray(s.said)) s.said = [];
    if (!s.said.includes(line.id)) { s.said.push(line.id); STORY.set(s); }
  }
};

// ---------- who is here ----------
// A friend is present if you are playing as them or they have joined.
// A boss or NPC is present if their sprite is on the field.
SPEECH.present = (who) => {
  if (!who) return false;
  // "who" may be a pair, for the lines the girls say in unison
  if (Array.isArray(who)) return who.length > 0 && who.every((w) => SPEECH.present(w));
  if (who.startsWith("boss:")) {
    // Only the boss the line names: the Dean's lines are not the DJ's.
    // The beaten finale boss speaks from under its pile.
    const b = SPEECH.sprite(who);
    return !!(b && b.exists());
  }
  if (who.startsWith("npc:")) return !!SPEECH.npcSprite(who.slice(4));
  if (!G.run) return false;
  // friends freed in the finale walk with you without ever joining the party
  return G.run.charId === who || G.run.companions.includes(who) ||
    (G.followers || []).some((f) => f.charId === who && f.exists());
};

// Who out of a line's speakers is here to say it. A plain speaker or a
// pair ("Silly boys!", both or nothing) is all or nothing; a GROUP line
// (line.mode) is spoken by whoever of its people turned up:
//   one   any one of them says it, once between them
//   copy  one starts and every other one there copies, in turn; needs two
//   all   every one of them who is here, at once
// Returns the speakers, or null when the line cannot be said.
SPEECH.voices = (line) => {
  const who = line.who;
  if (!Array.isArray(who)) return SPEECH.present(who) ? [who] : null;
  if (!line.mode) return SPEECH.present(who) ? who.slice() : null;
  const here = who.filter((w) => SPEECH.present(w));
  const need = line.mode === "copy" ? 2 : 1;
  return here.length >= need ? here : null;
};

SPEECH.npcSprite = (name) => {
  const key = String(name).toLowerCase();
  return get("npc").find((n) => n.npcId && n.npcId.toLowerCase() === key);
};

// The sprite a bubble should hang off. Friends go through COMPANIONS,
// which already falls back to a named subtitle when they are off field.
SPEECH.sprite = (who) => {
  if (who.startsWith("boss:")) {
    const id = who.slice(5);
    return get("boss").concat(get("bossPile")).find((b) => !b.bossId || b.bossId === id);
  }
  if (who.startsWith("npc:")) return SPEECH.npcSprite(who.slice(4));
  return COMPANIONS.fieldSprite(who);
};

// ---------- conditions ----------
// Every clause that is present must pass. An absent or empty clause
// is no constraint at all, so a line with an empty `when` fires
// anywhere, which is what most ambient waffle wants.
SPEECH.matches = (line, extra) => {
  const w = line.when || {};
  const c = SPEECH.ctx || {};
  const party = G.run ? G.run.companions.concat([G.run.charId]) : [];
  const some = (a) => Array.isArray(a) && a.length > 0;

  if (some(w.with) && !w.with.every((id) => party.includes(id))) return false;
  // at least one of these, or at least line.withMin of them ("You guys are
  // so silly" wants two of the boys)
  if (some(w.withAny) && w.withAny.filter((id) => party.includes(id)).length < (line.withMin || 1)) return false;
  if (some(w.without) && w.without.some((id) => party.includes(id))) return false;
  if (some(w.playing) && !(G.run && w.playing.includes(G.run.charId))) return false;
  if (some(w.room) && !w.room.includes(c.roomId)) return false;
  if (some(w.chapter) && !w.chapter.includes(c.chapter)) return false;
  if (some(w.tag) && !w.tag.some((t) => (c.tags || []).includes(t))) return false;
  if (some(w.notPlaying) && G.run && w.notPlaying.includes(G.run.charId)) return false;
  // a moment about somebody (who joined, whose special it is, who you just
  // met): only when it is one of these, so somebody else can answer them
  // ("*sniff* alright", "Mademoiselle", "Leon!")
  if (some(w.about)) {
    const subject = extra && (extra.by || extra.met);
    if (!subject || !w.about.includes(subject)) return false;
  }
  // a spot clause only means anything on a spot moment, and then it has
  // to be the thing actually being stood next to
  if (some(w.spot)) {
    if (!extra || !extra.spot) return false;
    if (!w.spot.includes(extra.spot)) return false;
  }
  return true;
};

SPEECH.eligible = (moment, extra) => {
  const now = time();
  // A scripted beat is one the game is asking for, not idle chatter, so it
  // ignores the speaker's cooldown as well as the global gag. Dying one
  // second after a quip must still get the death line out.
  const scripted = SPEECH.SCRIPTED.includes(moment);
  const ranRun = SPEECH.retiredRun();
  const ranEver = SPEECH.retiredEver();
  return SPEECH.data().lines.filter((l) => {
    if (l.on !== moment) return false;
    // Some moments have a subject: the friend whose special just fired,
    // the friend who just joined. Only they get to speak on it.
    // A line with an `about` clause is the exception: it is somebody
    // else answering the friend the moment is about.
    const answering = l.when && Array.isArray(l.when.about) && l.when.about.length;
    if (extra && extra.by && l.who !== extra.by && !answering) return false;
    if (l.freq === "run" && ranRun.includes(l.id)) return false;
    if (l.freq === "ever" && ranEver.includes(l.id)) return false;
    if (l.max && SPEECH.used(l) >= l.max.n) return false;
    if (l.runChance != null && !SPEECH.onThisRun(l)) return false;
    if (SPEECH.ctx && SPEECH.ctx.jokeDone && SPEECH.isJoke(l)) return false;
    if (now - (SPEECH.lastLine[l.id] || -999) < SPEECH.LINE_CD) return false;
    if (!scripted && now - (SPEECH.lastBy[SPEECH.key(l.who)] || -999) < SPEECH.CHAR_CD) return false;
    if (!SPEECH.voices(l)) return false;
    if (!SPEECH.matches(l, extra)) return false;
    // "1 in 3": rolled every time the moment comes round, last of all, so a
    // line that could never fire here does not use up a roll
    if (l.chance != null && rand(0, 1) >= l.chance) return false;
    return true;
  });
};

// "Maybe not even every run" (line.runChance): rolled once a run per line
// and kept, so a line that is off this run stays off.
SPEECH.onThisRun = (l) => {
  if (!G.run) return false;
  if (!G.run.lineDice) G.run.lineDice = {};
  if (G.run.lineDice[l.id] == null) G.run.lineDice[l.id] = rand(0, 1) < l.runChance;
  return G.run.lineDice[l.id];
};

// ---------- the shuffle bag ----------
// Within one speaker and moment, every line gets a turn before any
// line repeats. Without this, weighting alone lets Josh say the same
// non sequitur three times in a row and it stops being funny.
SPEECH.pick = (cands) => {
  // A line marked `last` speaks only when nobody else has anything for
  // this moment ("Thank God she's gone" waits for the rest to have none).
  const first = cands.filter((l) => !l.last);
  if (first.length) cands = first;
  if (cands.length === 0) return null;
  const key = SPEECH.key(cands[0].who) + "|" + cands[0].on;
  let bag = SPEECH.bags[key] || [];
  let pool = cands.filter((l) => bag.includes(l.id));
  if (pool.length === 0) { bag = cands.map((l) => l.id); pool = cands; }

  let total = 0;
  for (const l of pool) total += (SPEECH.WEIGHT[l.freq] || 1) * SPEECH.talk(SPEECH.key(l.who));
  let r = rand(0, total);
  let chosen = pool[pool.length - 1];
  for (const l of pool) {
    r -= (SPEECH.WEIGHT[l.freq] || 1) * SPEECH.talk(SPEECH.key(l.who));
    if (r <= 0) { chosen = l; break; }
  }
  SPEECH.bags[key] = bag.filter((id) => id !== chosen.id);
  return chosen;
};

// ---------- saying it ----------
SPEECH.speak = (who, str, quiet = false) => {
  if (Array.isArray(who)) { for (const w of who) SPEECH.speak(w, str, quiet); return; }
  const now = time();
  SPEECH.lastAny = now;
  SPEECH.lastBy[who] = now;
  if (who.startsWith("boss:") || who.startsWith("npc:")) {
    const ent = SPEECH.sprite(who);
    // Busy You talks in the dark note the voice in the cracks used all
    // game (core/crackvoice.js): that is how you find out it was them
    if (ent && ent.exists()) UI.speech(ent, str, undefined, { dark: SPEECH.VOICE.includes(who), quiet });
    return;
  }
  // said to themselves: the quiet note, on their own sprite if they are here
  const ent = quiet && COMPANIONS.fieldSprite(who);
  if (ent && ent.exists()) { UI.speech(ent, str, undefined, { quiet: true }); return; }
  COMPANIONS.say(who, str);
};

SPEECH.play = (line, cutscene = false) => {
  SPEECH.lastLine[line.id] = time();
  SPEECH.lastBy[SPEECH.key(line.who)] = time();
  SPEECH.retire(line);
  const here = SPEECH.voices(line) || [];
  let first = Array.isArray(line.who) ? here[0] : line.who;   // who opened, for "@first" replies
  if (line.mode === "one") {
    // whoever of them has not just spoken, if anyone
    const fresh = here.filter((w) => time() - (SPEECH.lastBy[w] || -999) >= SPEECH.CHAR_CD);
    const from = fresh.length ? fresh : here;
    first = from[Math.floor(rand(0, from.length)) % from.length];
    SPEECH.speak(first, line.text, !!line.quiet);
  } else if (line.mode === "copy") {
    // one starts, the rest copy one after another, in a shuffled order
    const order = here.slice();
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand(0, i + 1)) % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    first = order[0];
    SPEECH.speak(order[0], line.text, !!line.quiet);
    order.slice(1).forEach((w, i) => {
      wait(SPEECH.COPY_GAP * (i + 1), () => {
        if (G.paused && !cutscene) return;
        if (SPEECH.present(w)) SPEECH.speak(w, line.text, !!line.quiet);
      });
    });
  } else if (line.mode === "all") {
    SPEECH.speak(here, line.text, !!line.quiet);
  } else {
    SPEECH.speak(line.who, line.text, !!line.quiet);
  }
  // Replies follow a beat and a half apart. A reply can name a person, or
  // "@first" (whoever opened) or "@other" (another of the line's group,
  // not the opener): Ollie or Cal asks Jess, the other one answers her.
  // The talk stops at the first person who is not here: the opening line
  // still stands, so a two hander never breaks when the wrong four
  // friends turned up, and a laugh never follows a joke nobody made.
  const group = Array.isArray(line.who) ? line.who : [line.who];
  const whoOf = (r) => {
    // a list: any one of them who is here (and not whoever opened)
    if (Array.isArray(r.who)) {
      const here = r.who.filter((w) => w !== first && SPEECH.present(w));
      return here.length ? here[Math.floor(rand(0, here.length)) % here.length] : null;
    }
    if (r.who === "@first") return first;
    if (r.who === "@other") return group.find((w) => w !== first && SPEECH.present(w)) || null;
    return r.who;
  };
  let stopped = false, at = 0;
  (line.reply || []).forEach((r) => {
    at += r.quick ? SPEECH.QUICK_GAP : SPEECH.REPLY_GAP;
    wait(at, () => {
      if (stopped) return;
      if (G.paused && !cutscene) { stopped = true; return; }
      const w = whoOf(r);
      if (!w || !SPEECH.present(w)) { stopped = true; return; }
      SPEECH.speak(w, r.text, !!r.quiet);
    });
  });
};

// The way the rest of the game talks to this file. A cutscene (the
// finale's opening and ending) pauses play but still wants its lines,
// so it passes { cutscene: true }.
SPEECH.fire = (moment, extra) => {
  const cutscene = !!(extra && extra.cutscene);
  if (!G.run || (G.paused && !cutscene) || !SPEECH.ctx) return false;
  if (G.cutscene && !cutscene) return false;   // the finale's own beats only
  const scripted = SPEECH.SCRIPTED.includes(moment);
  // Walking-about chatter waits for the room's "entering" line: its first
  // roll comes the moment play starts, a second before that line, and the
  // gag then swallowed it (Ethan's "Spit in my mouth", 16 Oct 2026).
  const c = SPEECH.ctx;
  if (moment === "enter") c.entering = false;
  if (moment === "wander" && c.entering) {
    if (c.entering === true) c.entering = time() + SPEECH.ENTER_WAIT;
    if (time() < c.entering) return false;
    c.entering = false;
  }
  if (!scripted && time() - SPEECH.lastAny < SPEECH.QUIET) return false;
  let cands = SPEECH.eligible(moment, extra);
  const own = cands.filter(SPEECH.isRoomJoke);
  if (own.length) cands = own;
  const line = SPEECH.pick(cands);
  if (!line) return false;
  if (SPEECH.isJoke(line) && SPEECH.ctx) SPEECH.ctx.jokeDone = true;
  SPEECH.play(line, cutscene);
  return true;
};

// The room's id, which is what a `when.room` clause names and what the
// level file is called: "plate-gonzos" -> gonzos, and a two tile plate's
// "plate-thames_0" -> thames. Keeps the board and the game on one name.
SPEECH.roomIdOf = (plate) => {
  if (!plate) return "";
  const spr = plate.sprite || (plate.tiles && plate.tiles[0] && plate.tiles[0].sprite) || "";
  return spr.replace(/^plate-/, "").replace(/_\d+$/, "");
};

// ---------- per area setup ----------
// Called once from the area scene, after the map is built. Sets the
// room context every `when` clause is tested against, then starts the
// ambient roll, the idle watch and the spot watch.
SPEECH.beginArea = (opts) => {
  SPEECH.ctx = {
    roomId: opts.roomId || "",
    chapter: opts.chapter || 0,
    area: opts.area || 0,
    tags: opts.tags || [],
    // the room's own painted things, plus any talk spots the speech data
    // adds (a floor mark nobody walks behind, like the mayo patch)
    things: (opts.things || []).concat(SPEECH.talkSpots(opts.roomId)),
    unit: opts.unit || G.TILE,
    entering: true,       // until the room's "entering" moment has had its turn
    jokeDone: false,      // one of the anywhere once-a-run jokes has had this room
  };
  SPEECH.lastSpot = {};
  SPEECH.bags = {};

  // ambient waffle: a roll every few seconds, at a rate that follows how
  // talkative this particular party is, so a quiet cast is quiet everywhere
  loop(SPEECH.TICK, () => {
    if (!G.run || G.paused) return;
    const party = G.run.companions.concat([G.run.charId]);
    let sum = 0;
    for (const id of party) sum += SPEECH.talk(id);
    const rate = SPEECH.AMBIENT * (party.length ? sum / party.length : 1);
    if (chance(Math.min(0.9, rate))) SPEECH.fire("wander");
  });

  // idle: fires once when you stop, and re-arms only after you move again
  let stillFor = 0, idleSaid = false, was = null;
  onUpdate(() => {
    if (!G.run || G.paused) return;
    const pl = get("player")[0];
    if (!pl) return;
    if (was && pl.pos.dist(was) < 2) {
      stillFor += dt();
      if (stillFor > SPEECH.IDLE_AFTER && !idleSaid) { idleSaid = true; SPEECH.fire("idle"); }
    } else {
      stillFor = 0; idleSaid = false;
    }
    was = pl.pos.clone();
  });

  // spots: the named things the level board already gave every room.
  // Checked four times a second, not every frame - nothing here moves.
  // Not until the room's big title and its "entering" line have had their
  // turn (3.5 s into play): a spot by the start spoke under the title.
  let spotT = 0, nearest = null, playT = 0;
  onUpdate(() => {
    if (!G.run || G.paused) return;
    playT += dt();
    if (playT < SPEECH.SPOT_WAIT) return;
    spotT += dt();
    if (spotT < 0.25) return;
    spotT = 0;
    const pl = get("player")[0];
    if (!pl) return;
    const found = SPEECH.nearestSpot(pl.pos);
    if (found && found !== nearest) {
      const now = time();
      if (now - (SPEECH.lastSpot[found] || -999) > SPEECH.SPOT_CD) {
        if (SPEECH.fire("spot", { spot: found })) SPEECH.lastSpot[found] = now;
      }
    }
    nearest = found;
  });
};

// Talk spots: named places that exist only for speech, stored with the
// lines (SPEECH_DATA.spots, { room: [{ name, box: [x1, y1, x2, y2] }] }
// in grid units). Nothing collides with them and nothing is drawn.
SPEECH.talkSpots = (roomId) => {
  const all = SPEECH.data().spots || {};
  return (all[roomId] || []).map((s) => ({ name: s.name, foot: s.box, talk: true }));
};

// The closest named thing whose footprint the player is standing near,
// or null. Things with no footprint (outline only, like a speaker stack)
// fall back to the bounding box of their outline.
SPEECH.nearestSpot = (p) => {
  const c = SPEECH.ctx;
  if (!c) return null;
  const U = c.unit;
  const r = SPEECH.SPOT_RANGE * U;
  let best = null, bestD = r;
  for (const t of c.things) {
    const box = SPEECH.boxOf(t);
    if (!box) continue;
    const dx = Math.max(box[0] * U - p.x, 0, p.x - box[2] * U);
    const dy = Math.max(box[1] * U - p.y, 0, p.y - box[3] * U);
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < bestD) { bestD = d; best = t.name; }
  }
  return best;
};

SPEECH.boxOf = (t) => {
  if (t.foot) return t.foot;
  if (t.over && t.over.length >= 3) {
    const xs = t.over.map((q) => q[0]), ys = t.over.map((q) => q[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  return null;
};

// The tutorial park is not a room the engine runs in (nobody has joined
// yet, nobody follows you), so walking up to one of the nine fielders just
// asks for their line: the speech board's "walked up to in the park".
SPEECH.greetLine = (id) => {
  const ls = SPEECH.data().lines.filter((l) => l.on === "greet" && l.who === id);
  return ls.length ? ls[Math.floor(rand(0, ls.length)) % ls.length].text : null;
};

// Leaving the field entirely (title, select, ending): stop testing
// conditions against a room that is no longer loaded.
SPEECH.endArea = () => { SPEECH.ctx = null; };
