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
SPEECH.AMBIENT    = 0.28;  // base chance per tick, scaled by the party's talkativeness
SPEECH.REPLY_GAP  = 1.5;   // s between a line and its reply
SPEECH.IDLE_AFTER = 6;     // s of standing still before the idle moment
SPEECH.SPOT_RANGE = 1.6;   // grid units from a thing's footprint

// Scripted beats ignore the global gag and always get through.
SPEECH.SCRIPTED = ["join", "death", "bossStart", "special"];

SPEECH.WEIGHT = { often: 3, sometimes: 1.5, rare: 0.5, run: 1.5, ever: 1.5 };

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

SPEECH.retire = (line) => {
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
    const b = get("boss")[0];
    return !!(b && b.exists());
  }
  if (who.startsWith("npc:")) return !!SPEECH.npcSprite(who.slice(4));
  if (!G.run) return false;
  return G.run.charId === who || G.run.companions.includes(who);
};

SPEECH.npcSprite = (name) => {
  const key = String(name).toLowerCase();
  return get("npc").find((n) => n.npcId && n.npcId.toLowerCase() === key);
};

// The sprite a bubble should hang off. Friends go through COMPANIONS,
// which already falls back to a named subtitle when they are off field.
SPEECH.sprite = (who) => {
  if (who.startsWith("boss:")) return get("boss")[0];
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
  if (some(w.without) && w.without.some((id) => party.includes(id))) return false;
  if (some(w.playing) && !(G.run && w.playing.includes(G.run.charId))) return false;
  if (some(w.room) && !w.room.includes(c.roomId)) return false;
  if (some(w.chapter) && !w.chapter.includes(c.chapter)) return false;
  if (some(w.tag) && !w.tag.some((t) => (c.tags || []).includes(t))) return false;
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
    if (extra && extra.by && l.who !== extra.by) return false;
    if (l.freq === "run" && ranRun.includes(l.id)) return false;
    if (l.freq === "ever" && ranEver.includes(l.id)) return false;
    if (now - (SPEECH.lastLine[l.id] || -999) < SPEECH.LINE_CD) return false;
    if (!scripted && now - (SPEECH.lastBy[SPEECH.key(l.who)] || -999) < SPEECH.CHAR_CD) return false;
    if (!SPEECH.present(l.who)) return false;
    return SPEECH.matches(l, extra);
  });
};

// ---------- the shuffle bag ----------
// Within one speaker and moment, every line gets a turn before any
// line repeats. Without this, weighting alone lets Josh say the same
// non sequitur three times in a row and it stops being funny.
SPEECH.pick = (cands) => {
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
SPEECH.speak = (who, str) => {
  if (Array.isArray(who)) { for (const w of who) SPEECH.speak(w, str); return; }
  const now = time();
  SPEECH.lastAny = now;
  SPEECH.lastBy[who] = now;
  if (who.startsWith("boss:") || who.startsWith("npc:")) {
    const ent = SPEECH.sprite(who);
    if (ent && ent.exists()) UI.speech(ent, str);
    return;
  }
  COMPANIONS.say(who, str);
};

SPEECH.play = (line) => {
  SPEECH.lastLine[line.id] = time();
  SPEECH.retire(line);
  SPEECH.speak(line.who, line.text);
  // Replies follow a beat and a half apart. A reply whose speaker is
  // not here is simply skipped: the opening line still stands, so a
  // two hander never breaks when the wrong four friends turned up.
  (line.reply || []).forEach((r, i) => {
    wait(SPEECH.REPLY_GAP * (i + 1), () => {
      if (G.paused) return;
      if (!SPEECH.present(r.who)) return;
      SPEECH.speak(r.who, r.text);
    });
  });
};

// The way the rest of the game talks to this file.
SPEECH.fire = (moment, extra) => {
  if (!G.run || G.paused || !SPEECH.ctx) return false;
  const scripted = SPEECH.SCRIPTED.includes(moment);
  if (!scripted && time() - SPEECH.lastAny < SPEECH.QUIET) return false;
  const line = SPEECH.pick(SPEECH.eligible(moment, extra));
  if (!line) return false;
  SPEECH.play(line);
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
    things: opts.things || [],
    unit: opts.unit || G.TILE,
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
  let spotT = 0, nearest = null;
  onUpdate(() => {
    if (!G.run || G.paused) return;
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

// Leaving the field entirely (title, select, ending): stop testing
// conditions against a room that is no longer loaded.
SPEECH.endArea = () => { SPEECH.ctx = null; };
