// ============================================================
// TURN: the phone held upright, and the phone being turned.
//
// The game is landscape. Held upright, a phone shows a "turn your
// phone sideways" card (#turn in index.html, shown by a CSS media query
// so it works before anything else has loaded) and the game holds still
// behind it.
//
// Turning the phone: an iPhone reports its new size late, sometimes
// only after the turn has finished, so the engine sized the game for a
// screen that no longer existed and it sat in the wrong place until the
// phone was turned back and forth again (Ollie, 13 Oct 2026). So the
// page pins itself to the window's size in pixels, and on every resize
// or turn it measures again, now and a few more times over the next
// second and a half, until the numbers settle. The engine watches the
// page's size and refits the game whenever it changes.
// ============================================================

(function () {
  const upright = matchMedia("(orientation: portrait) and (pointer: coarse)");

  // ---------- holding still while upright ----------
  let pausedByUs = false;
  const hold = () => {
    if (typeof debug === "undefined") return;
    if (upright.matches) {
      if (!debug.paused) { debug.paused = true; pausedByUs = true; }
    } else if (pausedByUs) {
      pausedByUs = false;
      // the player's own pause menu stays up if it was up
      if (!(typeof UI !== "undefined" && UI.pauseOpen)) debug.paused = false;
    }
  };

  // ---------- fitting the page to the screen ----------
  let last = "";
  const fit = () => {
    const w = window.innerWidth, h = window.innerHeight;
    const key = w + "x" + h;
    if (key !== last) {
      last = key;
      const html = document.documentElement.style, body = document.body.style;
      html.width = body.width = w + "px";
      html.height = body.height = h + "px";
    }
    if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
  };
  let timers = [];
  const refit = () => {
    fit();
    hold();
    for (const t of timers) clearTimeout(t);
    timers = [80, 250, 500, 900, 1500].map((ms) => setTimeout(() => { fit(); hold(); }, ms));
  };

  addEventListener("resize", refit);
  addEventListener("orientationchange", refit);
  if (window.visualViewport) visualViewport.addEventListener("resize", refit);
  if (upright.addEventListener) upright.addEventListener("change", refit);
  // the idle pause (core/idle.js) lets go on focus; if the phone is still
  // upright, take hold again
  addEventListener("focus", () => setTimeout(hold, 0));
  document.addEventListener("visibilitychange", () => setTimeout(hold, 0));
  fit();
  // the engine is not there yet on the first pass; hold once it is
  const wait = setInterval(() => { if (typeof debug !== "undefined") { clearInterval(wait); hold(); } }, 200);
})();
