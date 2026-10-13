// ============================================================
// TURN: the phone held upright, and the phone being turned.
//
// The game is landscape. Held upright, a phone shows a "turn your
// phone sideways" card (#turn in index.html, shown by a CSS media query
// so it works before anything else has loaded) and the game holds still
// behind it.
//
// Turning the phone: the game sat in the wrong place after a turn
// until the phone was turned back and forth (Ollie, 13 Oct 2026). The
// page is now held to the screen by CSS alone (body is position: fixed,
// inset 0, in index.html), so the browser reshapes it in the same instant
// the phone turns, and the engine refits the game whenever the page's
// size changes. Pinning the size from here in pixels was tried first and
// was worse: the page kept the upright shape until the code heard about
// the turn, which an iPhone reports late, so the game sat where it had
// been upright and then jumped. This only scrolls the page back to the
// top, a few times over the second and a half after each turn.
//
// The dark cover over a turn lives in index.html as pure CSS (#settle):
// covers raised from here came up too late, because an iPhone freezes the
// page while it turns and code only hears of the turn afterwards.
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

  // ---------- keeping the page at the top ----------
  const fit = () => {
    if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
  };
  let timers = [];
  const refit = () => {
    fit();
    hold();
    for (const t of timers) clearTimeout(t);
    timers = [80, 250, 500, 900, 1500].map((ms) => setTimeout(() => { fit(); hold(); }, ms));
  };

  // (the cover over a turn is pure CSS now: #settle in index.html)
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
