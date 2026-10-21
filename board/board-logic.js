// ============================================================
// Who's Winning (21 Oct 2026): the board page's logic, with nothing
// in it that touches the page, so node can test it
// (node tools/tests/board.test.js). board.js draws with it.
//
// The page asks the save worker's read-only GET /v1/board, which answers
// { at, players: [{ id, name, sprite, trophies, platinum, runs, playing,
// chapter }] } already ranked, best first. No save word is ever in it.
// Anything odd in an answer counts as no answer: the page then keeps the
// last board it had and says OFFLINE.
// ============================================================

const BOARD = {};

BOARD.API = "https://nua-saves.oliver-c87.workers.dev";   // the save worker (tools/cloud/README.md)
BOARD.POLL_MS = 30000;   // ask again this often while the page is on screen
BOARD.CALL_MS = 15000;   // an answer that takes longer than this has failed
BOARD.LANE_H = 62;       // one lane, in CSS pixels
BOARD.MAX = 34;          // 33 trophies and the platinum

// The words the page shows for its states. Placeholder copy: Ollie's to change.
BOARD.WORDS = {
  loading: "LOADING",
  live: "LIVE",
  offline: "OFFLINE",
  empty: "NOBODY ON THE BOARD YET",
};

// The track, in pixels across the lane: 0 trophies stand at START, 33 just
// before the chequered finish line (which is drawn centred on width - 20) and
// 34, the platinum, on top of it.
BOARD.START = 30;
BOARD.LAST = 44;         // 33 trophies stand this far in from the right edge
BOARD.FINISH = 20;       // 34 stands this far in, over the line
BOARD.GAP = 6;           // between a runner and its label
BOARD.EDGE = 2;          // a label never comes closer than this to the lane's ends

const boardIsObject = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const boardCount = (n) => (typeof n === "number" && isFinite(n) ? Math.max(0, Math.floor(n)) : 0);
const boardSprite = (s) => (typeof s === "string" && /^[a-z0-9]{1,24}$/.test(s) ? s : "standin");
const BOARD_LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/;

// Where to ask. ?cloud=<address> points it at a test worker, as in the game,
// and only on this Mac: a shared link with ?cloud= in it still shows the real
// board. `host` is the page's own (location.hostname when left out).
BOARD.endpoint = (search, host) => {
  if (host === undefined && typeof location !== "undefined") host = location.hostname;
  let base = BOARD.API;
  const m = /[?&]cloud=([^&]+)/.exec(search || "");
  if (m && (host === undefined || BOARD_LOCAL.test(host))) {
    let u = "";
    try { u = decodeURIComponent(m[1]); } catch (e) { /* a broken address is no address */ }
    if (/^https?:\/\/\S+$/.test(u)) base = u.replace(/\/+$/, "");
  }
  return base + "/v1/board";
};

// Where a runner with this many trophies stands on a track this wide.
BOARD.trackX = (trophies, width) => {
  const t = Math.min(BOARD.MAX, typeof trophies === "number" && isFinite(trophies) ? Math.max(0, trophies) : 0);
  if (t >= BOARD.MAX) return width - BOARD.FINISH;
  return Math.round(BOARD.START + (width - BOARD.LAST - BOARD.START) * t / (BOARD.MAX - 1));
};

// The label goes to the right of a runner in the left part of the track and to
// the left of one in the right part, so it is never pushed off the edge.
BOARD.labelSide = (x, width) => (x < width * 0.45 ? "r" : "l");

// For a label too long for its side (a long name on the narrowest phone): how
// far to slide it back inside the lane. `half` is half the runner's width.
BOARD.tagShift = (side, x, half, tagW, width) => {
  if (side === "r") {
    const end = x + half + BOARD.GAP + tagW;
    return end > width - BOARD.EDGE ? width - BOARD.EDGE - end : 0;
  }
  const start = x - half - BOARD.GAP - tagW;
  return start < BOARD.EDGE ? BOARD.EDGE - start : 0;
};

// Where a label goes: its usual side, unless it does not fit there and needs
// less pulling in on the other. { side: "r" | "l", shift }
BOARD.tagPlace = (x, half, tagW, width) => {
  const side = BOARD.labelSide(x, width);
  const shift = BOARD.tagShift(side, x, half, tagW, width);
  if (shift === 0) return { side, shift };
  const other = side === "r" ? "l" : "r";
  const otherShift = BOARD.tagShift(other, x, half, tagW, width);
  return Math.abs(otherShift) < Math.abs(shift) ? { side: other, shift: otherShift } : { side, shift };
};

// "JOE P 11"
BOARD.topLine = (p) => {
  const name = p && typeof p.name === "string" ? p.name : "";
  return (name.toUpperCase() + " " + Math.min(BOARD.MAX, boardCount(p && p.trophies))).trim();
};

// "playing · chapter 4", "playing · the park", "playing now" (a run whose
// chapter could not be read), or "12 runs" / "1 run".
BOARD.subLine = (p) => {
  if (p && p.playing === true) {
    if (p.chapter === 0) return "playing · the park";
    if (Number.isInteger(p.chapter) && p.chapter > 0) return "playing · chapter " + p.chapter;
    return "playing now";
  }
  const runs = boardCount(p && p.runs);
  return runs + (runs === 1 ? " run" : " runs");
};

// A runner's picture, always from the board's own folder.
BOARD.spriteURL = (sprite) => "board/sprites/" + boardSprite(sprite) + ".png";

// The worker's answer as a clean list, in its order, or null when it is not a
// board at all. Each player is rebuilt field by field, so nothing else an
// answer carries reaches the page.
BOARD.read = (body) => {
  if (!boardIsObject(body) || !Array.isArray(body.players)) return null;
  const seen = new Set();
  const out = [];
  for (const p of body.players) {
    if (!boardIsObject(p) || typeof p.id !== "string" || !p.id || seen.has(p.id)) continue;
    seen.add(p.id);
    out.push({
      id: p.id,
      name: typeof p.name === "string" ? p.name : "",
      sprite: boardSprite(p.sprite),
      trophies: Math.min(BOARD.MAX, boardCount(p.trophies)),
      platinum: p.platinum === true,
      runs: boardCount(p.runs),
      playing: p.playing === true,
      chapter: Number.isInteger(p.chapter) && p.chapter >= 0 ? p.chapter : null,
    });
  }
  return out;
};

// One ask. The board, or null for anything else: no network, a worker error
// (which may arrive without its CORS headers, so the browser sees no network),
// a page that is not JSON, or JSON that is not a board.
BOARD.get = async (url, fetchFn) => {
  try {
    const res = await fetchFn(url);
    if (!res || !res.ok) return null;
    return BOARD.read(await res.json());
  } catch (e) {
    return null;
  }
};
