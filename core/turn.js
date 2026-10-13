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
//
// Even then, for a moment after the turn the phone shows the page laid
// out for the old shape before it catches up, and the game visibly
// jumped into place (Ollie, same day). So a plain dark cover (#settle)
// goes up the instant a turn starts and comes down, with a short fade,
// once the size has held still and the game has been redrawn to it.
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

  // ---------- the cover while a turn settles ----------
  // The first version lifted too early (Ollie, 13 Oct 2026, "the rotation
  // still pops"): mid-turn an iPhone goes on reporting the OLD size, and an
  // old size that holds still looked settled. So the cover now waits for a
  // size that matches the way the phone says it is facing, which it says
  // the moment the turn starts.
  const cover = document.getElementById("settle");
  const wide = () => window.innerWidth > window.innerHeight;
  const phone = () => matchMedia("(pointer: coarse)").matches;
  const facingWide = () => {
    if (!phone()) return wide();
    if (typeof window.orientation === "number") return Math.abs(window.orientation) === 90;
    if (screen.orientation && screen.orientation.type) return screen.orientation.type.indexOf("landscape") === 0;
    return wide();
  };
  let wasWide = wide();
  let settling = null, lifting = null;
  const settle = () => {
    clearTimeout(lifting);
    cover.style.display = "block";
    cover.style.opacity = "1";
    const started = Date.now();
    let prev = "", same = 0;
    clearInterval(settling);
    settling = setInterval(() => {
      fit();
      hold();
      const key = window.innerWidth + "x" + window.innerHeight;
      same = key === prev ? same + 1 : 0;
      prev = key;
      const c = document.querySelector("canvas");
      const ready =
        wide() === facingWide() &&                       // the NEW size has arrived
        same >= 5 &&                                     // and held for a quarter second
        (!c || (Math.abs(c.clientWidth - window.innerWidth) <= 2 &&
                Math.abs(c.clientHeight - window.innerHeight) <= 2)) &&   // the page has taken it
        (!phone() || upright.matches === !wide()) &&     // the upright card agrees
        Date.now() - started > 450;                      // and the phone's own turn has played out
      if (ready || Date.now() - started > 3000) {
        clearInterval(settling);
        settling = null;
        wasWide = wide();
        // a few frames for the engine to redraw at the new size, then fade
        lifting = setTimeout(() => {
          cover.style.opacity = "0";
          lifting = setTimeout(() => { cover.style.display = "none"; }, 200);
        }, 120);
      }
    }, 50);
  };

  addEventListener("resize", () => { if (wide() !== wasWide) settle(); refit(); });
  addEventListener("orientationchange", () => { settle(); refit(); });
  if (screen.orientation && screen.orientation.addEventListener) {
    screen.orientation.addEventListener("change", () => { settle(); refit(); });
  }
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
