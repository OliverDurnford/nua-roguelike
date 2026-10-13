// ============================================================
// FIDGET: life while standing still (Ollie, 13 Oct 2026; spec
// docs/superpowers/specs/2026-10-13-idle-animations-design.md).
//   - everyone standing breathes and blinks, never in step
//   - in a calm room, one friend at a time does their fidget
//     (data/fidgets.js), then a longer pause, then a different one
// The clocks at the top are plain functions of time and state, tested
// in node (tools/tests/fidget.test.js). The Kaboom glue is below them.
// ============================================================

const FIDGET = {};

FIDGET.STILL_BEFORE = 4;   // s the player stands still before the first fidget
FIDGET.GAP = 8;            // s from one fidget ending to the next starting
FIDGET.BREATHE = 0.8;      // s on each of the two breathe frames
FIDGET.BLINK = [2.5, 6];   // s between blinks, random in this range
FIDGET.BLINK_LEN = 0.11;   // s the eyes stay shut
FIDGET.DOUBLE = 0.2;       // chance a blink comes as a quick double
FIDGET.REOPEN = 0.12;      // s open between the two halves of a double

// 0 or 1: which breathe frame shows at time t
FIDGET.breathe = (t) => Math.floor(t / FIDGET.BREATHE) % 2;

// One person's blink clock. rnd() gives 0 to 1. update(dt) is true while
// the eyes are shut.
FIDGET.blinker = (rnd) => {
  const gap = () => FIDGET.BLINK[0] + rnd() * (FIDGET.BLINK[1] - FIDGET.BLINK[0]);
  let wait = gap(), shut = 0, again = false, second = false;
  return {
    update(dt) {
      if (shut > 0) {
        shut -= dt;
        if (shut > 0) return true;
        second = again;
        again = false;
        wait = second ? FIDGET.REOPEN : gap();
        return false;
      }
      wait -= dt;
      if (wait > 0) return false;
      shut = FIDGET.BLINK_LEN;
      again = !second && rnd() < FIDGET.DOUBLE;   // the second half never rolls for a third
      second = false;
      return true;
    },
  };
};

// The frame a fidget shows t seconds in, or null once it has played out.
FIDGET.at = (seq, t) => {
  for (const [frame, s] of seq) {
    if (t < s) return frame;
    t -= s;
  }
  return null;
};

// A fidget stops at once if the player moves, the room stops being calm,
// or the friend doing it is no longer standing (hurt, walking off).
FIDGET.shouldCancel = (s) => s.moving || !s.calm || !s.standing;

// Whose turn it is. update(dt, s) takes the room's state:
//   s.calm   - a quiet room, or a fight room once cleared, no cutscene
//   s.moving - the player moved this frame
//   s.ready  - ids of everyone standing who has a fidget, player included
// and returns the id that should start a fidget now, or null. After a
// start it waits for done(): the gap only counts once the fidget is over.
// A shuffle bag, as the speech system uses: everyone has a turn before
// anyone repeats, and nobody goes twice running unless they are alone.
FIDGET.turns = (rnd) => {
  let still = 0, gapT = 0, playing = false, after = false, bag = [], last = null;
  const shuffle = (ids) => {
    const b = ids.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
  return {
    update(dt, s) {
      if (s.moving || !s.calm) { still = 0; gapT = 0; after = false; playing = false; return null; }
      if (playing) return null;
      if (!after) { still += dt; if (still < FIDGET.STILL_BEFORE) return null; }
      else { gapT += dt; if (gapT < FIDGET.GAP) return null; }
      const ok = (id) => s.ready.includes(id) && (id !== last || s.ready.length === 1);
      let pick = bag.find(ok);
      if (!pick) { bag = shuffle(s.ready); pick = bag.find(ok); }
      if (!pick) return null;
      bag.splice(bag.indexOf(pick), 1);
      last = pick;
      playing = true;
      return pick;
    },
    done() { playing = false; after = true; gapT = 0; },
  };
};
