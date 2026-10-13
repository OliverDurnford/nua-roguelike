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

  // ---------- the cover while a turn settles ----------
  // The first version lifted too early (Ollie, 13 Oct 2026, "the rotation
  // still pops"): mid-turn an iPhone goes on reporting the OLD size, and an
  // old size that holds still looked settled. So the cover now waits for a
  // size that matches the way the phone says it is facing, which it says
  // the moment the turn starts.
  const cover = document.getElementById("settle");
  const wide = () => window.innerWidth > window.innerHeight;
  const phone = () => matchMedia("(pointer: coarse)").matches;
  // If the facing signal ever disagrees with a settled page for good (a
  // tablet whose 0 degrees is landscape, say), stop listening to it.
  let distrust = false;
  const facingWide = () => {
    if (!phone() || distrust) return wide();
    if (screen.orientation && screen.orientation.type) return screen.orientation.type.indexOf("landscape") === 0;
    if (typeof window.orientation === "number") return Math.abs(window.orientation) === 90;
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
        if (!ready && wide() !== facingWide()) distrust = true;
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
  // Whatever order the phone's events come in, the moment the way it is
  // facing and the page's shape disagree, the cover goes up.
  setInterval(() => {
    if (!settling && phone() && facingWide() !== wide()) settle();
  }, 100);
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
