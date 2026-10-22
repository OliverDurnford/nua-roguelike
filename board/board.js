// ============================================================
// Who's Winning (21 Oct 2026): draws the board and keeps it current.
// The numbers and the words come from board-logic.js (BOARD, tested in
// node); this file only puts them on the page.
//
// It asks the worker every BOARD.POLL_MS while the page is on screen, not
// at all while it is hidden, and at once when it comes back. A failed ask
// keeps the last board, greys the dot and says OFFLINE until the next good
// answer. Every name and number goes in as text, never as markup.
// ============================================================

(() => {
  const $ = (id) => document.getElementById(id);
  const root = $("board");
  const stateEl = $("state");
  const ticksEl = $("ticks");
  const track = $("track");
  const rowsEl = $("rows");
  const lanesEl = $("lanes");
  const note = $("note");

  const URL_BOARD = BOARD.endpoint(location.search);
  const lanes = new Map();   // player id -> that lane's elements and its last player
  let timer = 0;
  let busy = false;

  // ---------- the pixel crown (the mockup's), for the platinum ----------
  const INKS = { k: "#090a10", W: "#ffffff", L: "#e7ecff", S: "#b9c4e8", D: "#5a6aa8" };
  const CROWN = ["k...k...k", "kk.kWk.kk", "kLkLWLkLk", "kLLLDLLLk", "kSSSSSSSk", "kWWWWWWWk", "kkkkkkkkk"];
  const SVG = "http://www.w3.org/2000/svg";
  const pixels = (art, scale) => {
    const h = art.length;
    const w = art[0].length;
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "px");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", w * scale);
    svg.setAttribute("height", h * scale);
    svg.setAttribute("shape-rendering", "crispEdges");
    svg.setAttribute("aria-hidden", "true");
    art.forEach((line, y) => [...line].forEach((c, x) => {
      if (!INKS[c]) return;
      const r = document.createElementNS(SVG, "rect");
      r.setAttribute("x", x);
      r.setAttribute("y", y);
      r.setAttribute("width", 1.02);
      r.setAttribute("height", 1.02);
      r.setAttribute("fill", INKS[c]);
      svg.appendChild(r);
    }));
    return svg;
  };

  const el = (tag, cls) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  };

  const width = () => track.clientWidth;

  const setState = (s) => {
    root.dataset.state = s;
    stateEl.textContent = BOARD.WORDS[s];
  };

  // ---------- drawing ----------
  const drawTicks = () => {
    const w = width();
    ticksEl.textContent = "";
    for (const v of [0, 20, 40, 60, BOARD.MAX]) {
      const s = el("span");
      s.textContent = String(v);
      s.style.left = BOARD.trackX(v, w) + "px";
      ticksEl.appendChild(s);
    }
  };

  // Puts a lane's runner at its place and its label beside it, on whichever
  // side keeps a long name inside the lane (BOARD.tagPlace).
  const place = (l) => {
    const w = width();
    const x = BOARD.trackX(l.p.points, w);
    l.runner.style.left = x + "px";
    const at = BOARD.tagPlace(x, l.fig.offsetWidth / 2, l.tag.offsetWidth, w);
    l.tag.className = "tag " + at.side;
    l.tag.style.setProperty("--shift", at.shift + "px");
  };

  const makeLane = (p) => {
    const l = { p, sprite: null };
    l.el = el("div", "lane");
    l.el.setAttribute("role", "listitem");
    l.runner = el("div", "runner");
    l.fig = el("div", "fig");
    const crown = el("div", "crown");
    crown.appendChild(pixels(CROWN, 2));
    l.img = el("img");
    l.img.alt = "";
    l.img.decoding = "async";
    // A picture that will not load (a lane added before its sprite was made)
    // falls back to the stand-in, once.
    l.img.addEventListener("error", () => {
      const standin = BOARD.spriteURL("standin");
      if (!l.img.src.endsWith(standin)) l.img.src = standin;
    });
    l.img.addEventListener("load", () => place(l));
    l.tag = el("div", "tag");
    l.t1 = el("div", "t1");
    l.t2 = el("div", "t2");
    l.tag.append(l.t1, l.t2);
    l.fig.append(crown, l.img);
    l.runner.append(l.fig, l.tag);
    l.el.appendChild(l.runner);
    return l;
  };

  const update = (l, p, i, fresh) => {
    l.p = p;
    if (l.sprite !== p.sprite) {
      l.sprite = p.sprite;
      l.img.src = BOARD.spriteURL(p.sprite);
    }
    l.t1.textContent = BOARD.topLine(p);
    l.t2.textContent = BOARD.subLine(p);
    l.runner.classList.toggle("live", p.playing);
    l.runner.classList.toggle("plat", p.platinum);
    l.el.style.top = i * BOARD.LANE_H + "px";
    // A new lane is put in place before it joins the page, so it appears
    // where it belongs instead of gliding in from the top.
    if (fresh) lanesEl.appendChild(l.el);
    place(l);
  };

  const render = (list) => {
    if (rowsEl.children.length !== list.length) {
      rowsEl.textContent = "";
      for (let i = 0; i < list.length; i++) rowsEl.appendChild(el("div", "row"));
    }
    track.style.height = list.length * BOARD.LANE_H + "px";
    note.textContent = BOARD.WORDS.empty;
    note.hidden = list.length > 0;

    const here = new Set();
    list.forEach((p, i) => {
      here.add(p.id);
      let l = lanes.get(p.id);
      const fresh = !l;
      if (fresh) {
        l = makeLane(p);
        lanes.set(p.id, l);
      }
      update(l, p, i, fresh);
    });
    for (const [id, l] of lanes) {
      if (!here.has(id)) {
        l.el.remove();
        lanes.delete(id);
      }
    }
  };

  const placeAll = () => {
    drawTicks();
    for (const l of lanes.values()) place(l);
  };

  // ---------- keeping it current ----------
  const stop = () => {
    clearTimeout(timer);
    timer = 0;
  };

  const later = () => {
    stop();
    if (document.visibilityState === "visible") timer = setTimeout(ask, BOARD.POLL_MS);
  };

  const ask = async () => {
    if (busy) return;   // the ask in flight schedules the next one
    stop();
    busy = true;
    const ctl = typeof AbortController === "function" ? new AbortController() : null;
    const giveUp = ctl ? setTimeout(() => ctl.abort(), BOARD.CALL_MS) : 0;
    const list = await BOARD.get(URL_BOARD, (u) => fetch(u, { cache: "no-store", signal: ctl ? ctl.signal : undefined }));
    clearTimeout(giveUp);
    busy = false;
    try {
      if (list) {
        setState("live");
        render(list);
      } else {
        setState("offline");
      }
    } finally {
      later();   // whatever happened, the next ask is booked
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") ask();
    else stop();
  });

  let resizing = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizing);
    resizing = requestAnimationFrame(placeAll);
  });
  // The pixel fonts change every label's width once they arrive.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeAll);

  lanesEl.setAttribute("role", "list");
  setState("loading");
  drawTicks();
  if (document.visibilityState === "visible") ask();
})();
