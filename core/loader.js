// ============================================================
// LOADER: fetches the game with a loading bar that tells the truth.
//
// The engine used to start near the top of the page and draw its own
// bar straight away. Nothing was queued at that moment, so it read 100%,
// finished, and then the screen sat black while 25MB of art downloaded
// (Ollie, 13 Oct 2026: "the loading bar finishes, but then it's still a
// black screen"). Now this file does the loading and the bar is the
// download itself, then the art unpacking, then the title's room. It only
// gets out of the way once the title is actually on screen.
//
// The game's scripts are still listed as plain <script src> lines in
// index.html, in their old order, because the level board, the soundtrack
// board and the level tools all read that list. They sit inside a
// <template>, which the browser leaves alone, and this reads them from it.
//
// On the website each file is fetched with progress (the server says how
// big each one is, so the bar moves with the bytes), and they run strictly
// in the listed order. From a double-clicked index.html (file://) a fetch
// is refused, so each file falls back to an ordinary script tag, in order;
// from a local disk that is quick anyway.
// ============================================================

(function () {
  const LOADER = (window.LOADER = { done: false });
  const screen = document.getElementById("boot");
  const fill = document.getElementById("boot-fill");
  const srcs = [...document.getElementById("game-scripts").content.querySelectorAll("script")]
    .map((s) => s.getAttribute("src"));

  // How the bar is split: the download, then the engine unpacking the art.
  const DOWNLOAD = 0.85;
  // A file whose size the server has not said yet counts as this many bytes.
  const UNKNOWN = 30000;

  const files = srcs.map((src) => ({ src, loaded: 0, total: 0, text: null, failed: false, ran: false }));
  let next = 0;          // the next file to run
  let scriptsDone = false;
  let shown = 0;         // what the bar shows; only ever goes up

  // The room behind "tap to start", fetched alongside so it is ready the
  // moment the title is. The title's <video> uses it as its poster.
  let posterDone = false;
  const poster = new Image();
  poster.onload = poster.onerror = () => { posterDone = true; };
  poster.src = "video/title-poster.jpg";

  // The screen's lettering is the game's own pixel face, once its file has
  // run. Until then the words stay hidden rather than flash up in Courier.
  const fontFrom = () => {
    if (document.documentElement.classList.contains("fonts-ready")) return;
    const url = Function("return typeof REAL_FONTS !== 'undefined' ? REAL_FONTS.pixel : null")();
    if (!url || typeof FontFace === "undefined") return;
    const f = new FontFace("NUA Pixel", "url(" + url + ")");
    f.load().then(() => {
      document.fonts.add(f);
      document.documentElement.classList.add("fonts-ready");
    }).catch(() => {});
  };
  // whatever happens, the words show after a moment
  setTimeout(() => document.documentElement.classList.add("fonts-ready"), 2500);

  // ---------- running the files in order ----------
  const ran = (f) => {
    f.ran = true;
    next++;
    if (f.src === "core/fonts-real.js") fontFrom();
    run();
  };
  const run = () => {
    while (next < files.length) {
      const f = files[next];
      if (f.failed) {
        // the fallback: an ordinary script tag, and wait for it
        if (f.tag) return;
        f.tag = document.createElement("script");
        f.tag.src = f.src;
        f.tag.async = false;
        f.tag.onload = f.tag.onerror = () => ran(f);
        document.body.appendChild(f.tag);
        return;
      }
      if (f.text === null) return;
      const s = document.createElement("script");
      // sourceURL keeps each file's own name in error messages
      s.text = f.text + "\n//# sourceURL=" + f.src;
      f.text = "";
      document.body.appendChild(s);   // runs it, there and then
      s.remove();
      ran(f);
      return;
    }
    if (!scriptsDone) scriptsDone = true;
  };

  // ---------- fetching, all at once ----------
  for (const f of files) {
    const x = new XMLHttpRequest();
    try { x.open("GET", f.src); } catch (e) { f.failed = true; continue; }
    x.onprogress = (e) => {
      f.loaded = e.loaded;
      if (e.lengthComputable) f.total = e.total;
    };
    x.onload = () => {
      if (x.status === 200 || (x.status === 0 && x.responseText)) {
        f.text = x.responseText;
        f.loaded = f.total = f.total || f.text.length;
      } else f.failed = true;
      run();
    };
    x.onerror = () => { f.failed = true; run(); };
    try { x.send(); } catch (e) { f.failed = true; }
  }
  run();

  // ---------- the bar ----------
  const downloaded = () => {
    let have = 0, want = 0;
    for (const f of files) {
      const w = f.total || UNKNOWN;
      want += w;
      have += f.ran ? w : Math.min(f.loaded, w) * 0.97;   // fetched but not yet run is nearly there
    }
    return want ? have / want : 1;
  };
  const unpacked = () => {
    const art = typeof loadProgress === "function" ? loadProgress() : 0;
    return (art + (posterDone ? 1 : 0)) / 2;
  };

  let doneAt = 0, finishedAt = 0;
  const tick = () => {
    let target = scriptsDone ? DOWNLOAD + (1 - DOWNLOAD) * unpacked() : DOWNLOAD * downloaded();
    const ready = scriptsDone && unpacked() >= 1;
    // the art can stall; never hold the game hostage for it
    if (scriptsDone && !doneAt) doneAt = Date.now();
    const giveUp = doneAt && Date.now() - doneAt > 15000;
    if (ready || giveUp) target = 1;
    // eases towards the truth, never runs ahead of it, never goes back
    shown = Math.max(shown, shown + (target - shown) * 0.25);
    if (target > shown && target - shown < 0.004) shown = target;
    fill.style.width = (shown * 100).toFixed(1) + "%";

    if (shown >= 1) {
      // two frames for the title to draw itself under the screen
      if (!finishedAt) finishedAt = Date.now();
      if (Date.now() - finishedAt > 120) {
        clearInterval(timer);
        LOADER.done = true;
        screen.classList.add("gone");
        setTimeout(() => screen.remove(), 400);
        return;
      }
    }
  };
  const timer = setInterval(tick, 33);
})();
