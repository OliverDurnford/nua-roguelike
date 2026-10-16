// ============================================================
// IDLE: go quiet when nobody is looking at the game.
// ============================================================
//
// The engine already goes quiet in a hidden BACKGROUND TAB, and that
// case was never the problem. The one that hurts is the game sitting in
// a window or a preview pane BESIDE something you are typing in. The
// page is still "visible", so the engine never idles: it keeps drawing a
// 1920x1080 canvas sixty times a second and playing music while your
// attention is somewhere else entirely. The browser composites the
// game's frames and the window you are typing in through the same GPU
// process, so that other window goes sluggish and keystrokes land late.
//
// Focus is the honest signal for "is anyone actually looking at this".
// On blur we do two things:
//
//   debug.paused   stops updates and timers. Drawing carries on, which
//                  is what the pause menu already relies on, so the
//                  picture never blanks - it just stops moving.
//   frame throttle stops the drawing from happening sixty times a
//                  second. This is the part that frees the GPU.
//
// Both are needed. Pausing alone still redraws a static scene at full
// rate; throttling alone lets the world drift on in big time steps.
//
// ?headless is left completely alone. That flag exists to keep the loop
// running off-screen for automated testing and patches these very same
// things itself, so this whole file steps aside when it is present.

(function () {
  if (location.search.includes("headless")) return;

  // How often to redraw while unfocused. Low enough to cost nothing,
  // often enough that the picture is never stale if something does move.
  const IDLE_FRAME_MS = 200;

  let looking = true;
  let pausedByUs = false;
  let musicWasPlaying = false;

  // A phone with a 120Hz screen asks for 120 frames a second, twice the
  // work of the 60 the game is made for, and the battery and the heat pay
  // for it (16 Oct 2026). On a touch screen, frames come no closer than
  // this: a 120Hz phone takes every other one (60), a 90Hz one keeps all
  // of them. Desktop screens are left alone.
  const PHONE_FRAME_MS = window.matchMedia && matchMedia("(pointer: coarse)").matches ? 9 : 0;

  // ---------- frame throttle ----------
  // Kaboom asks for the next frame from inside its own callback, so when
  // we decline to call it we have to keep the chain alive ourselves.
  const raf = window.requestAnimationFrame.bind(window);
  let lastRun = 0;
  window.requestAnimationFrame = function (cb) {
    return raf(function (t) {
      if (t - lastRun >= (looking ? PHONE_FRAME_MS : IDLE_FRAME_MS)) {
        lastRun = t;
        cb(t);
      } else {
        window.requestAnimationFrame(cb);
      }
    });
  };

  // ---------- pause / resume ----------
  function sleep() {
    if (!looking) return;
    looking = false;

    // In a room, the game's own pause menu goes up, so they come back to
    // it rather than straight into the fight (Ollie, 15 Oct 2026). Never
    // fight that menu: if it is up, it stays up when they come back.
    if (typeof UI !== "undefined" && UI.pauseNow) UI.pauseNow();
    if (typeof debug !== "undefined" && !debug.paused) {
      debug.paused = true;
      pausedByUs = true;
    }

    const el = typeof SOUNDTRACK !== "undefined" && SOUNDTRACK._el;
    musicWasPlaying = !!(el && !el.paused);
    if (musicWasPlaying) el.pause();

    for (const v of document.querySelectorAll("video")) {
      if (!v.paused) { v.pause(); v.dataset.idlePaused = "1"; }
    }
  }

  function wake() {
    if (looking) return;
    looking = true;

    if (pausedByUs && typeof debug !== "undefined") {
      debug.paused = false;
      pausedByUs = false;
    }

    const el = typeof SOUNDTRACK !== "undefined" && SOUNDTRACK._el;
    if (musicWasPlaying && el) el.play().catch(() => {});
    musicWasPlaying = false;

    for (const v of document.querySelectorAll("video")) {
      if (v.dataset.idlePaused) {
        delete v.dataset.idlePaused;
        v.play().catch(() => {});
      }
    }
  }

  addEventListener("blur", sleep);
  addEventListener("focus", wake);

  // A pane can be scrolled out of sight without the window ever blurring.
  document.addEventListener("visibilitychange", function () {
    document.visibilityState === "visible" ? wake() : sleep();
  });
})();
