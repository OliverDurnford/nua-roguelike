// ============================================================
// TITLE VIDEO - the six second push in on the record sleeve.
//
// It is a plain <video> element sitting BEHIND the game canvas,
// not a Kaboom sprite. Two reasons, both the same trap the music
// hit (see core/soundtrack.js):
//   - drawing a file:// video into a WebGL texture taints the
//     context and throws, so double-clicking index.html would
//     break;
//   - decoding 192 frames of 1280x720 into sprites would cost
//     more memory than the rest of the game put together.
//
// The canvas is cleared with alpha 0 (see core/boot.js) so the
// video shows through it, and everything Kaboom draws in the
// title scene lands on top of the room. The page body is the
// same near-black as the old opaque clear colour, so every other
// scene looks exactly as it did.
//
// The element is created at load so a 3.5MB file is buffering
// while the player is still reading "press any key".
// ============================================================

const TITLEVIDEO = {};

// ?v=2: relabelled BT.601 on 15 Oct 2026 so it matches its stills; the
// query makes a phone that kept the old file fetch the new one
TITLEVIDEO.SRC = "video/title-move.mp4?v=2";
// Its first and last frames as stills, in an <img> laid exactly over the
// video. An iPhone shows nothing of a video that has not played yet (the room
// was black behind "tap to start"), shows a gap between a poster and the
// first real frame (a flash as the sequence began), and goes back to the
// poster on a video that has been hidden and shown again (the room's first
// frame behind the finished cover). So the game shows its own still until the
// video has genuinely drawn a frame, and the last frame whenever it holds on
// the parked framing (Ollie, 13 Oct 2026). Rebuilt alongside the video by
// tools/titlesequence/build_title_assets.py.
TITLEVIDEO.POSTER = "video/title-poster.jpg";
TITLEVIDEO.END_STILL = "video/title-end.jpg";
TITLEVIDEO.seen = false;   // true once the sequence has run, so coming back to
                           // the title from a game does not replay it

// The whole video comes down into memory while the game loads, and the title
// only offers "tap to start" once it is in. An iPhone on mobile data never
// fetches a video ahead of time, whatever `preload` asks, so off WiFi the
// tap started the song while the room sat on its still with nothing coming
// (Ollie, 15 Oct 2026). A blob plays the moment it is asked to, so the song
// and the picture start together again. From file://, where fetch is
// refused, or if the download fails or takes over WAIT seconds, the element
// streams the file as it used to and the title goes ahead.
TITLEVIDEO.ready = false;
TITLEVIDEO._url = null;
TITLEVIDEO.WAIT = 25;
TITLEVIDEO._fallback = () => {
  if (TITLEVIDEO.ready) return;
  TITLEVIDEO.ready = true;
  if (TITLEVIDEO._el && !TITLEVIDEO._el.getAttribute("src")) TITLEVIDEO._el.src = TITLEVIDEO.SRC;
};
TITLEVIDEO.preload = () => {
  if (location.protocol === "file:" || typeof fetch !== "function" || !window.URL || !URL.createObjectURL) {
    TITLEVIDEO._fallback();
    return;
  }
  const giveUp = setTimeout(TITLEVIDEO._fallback, TITLEVIDEO.WAIT * 1000);
  fetch(TITLEVIDEO.SRC)
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("HTTP " + r.status))))
    .then((b) => {
      clearTimeout(giveUp);
      if (TITLEVIDEO.ready) return;   // already streaming instead; keep that
      TITLEVIDEO._url = URL.createObjectURL(b);
      TITLEVIDEO.ready = true;
      if (TITLEVIDEO._el) TITLEVIDEO._el.src = TITLEVIDEO._url;
    })
    .catch(() => { clearTimeout(giveUp); TITLEVIDEO._fallback(); });
};

TITLEVIDEO._el = null;
TITLEVIDEO._still = null;
TITLEVIDEO._stillToken = 0;   // bumps whenever a still is put up, so a late
                              // "the video is showing now" cannot take down a newer one
TITLEVIDEO._box = "";      // last layout applied, so we only touch style on change

TITLEVIDEO.showStill = (src) => {
  const s = TITLEVIDEO._still;
  if (!s) return;
  TITLEVIDEO._stillToken++;
  if (s.getAttribute("src") !== src) s.src = src;
  s.style.visibility = "visible";
};
TITLEVIDEO.hideStill = () => {
  if (TITLEVIDEO._still) TITLEVIDEO._still.style.visibility = "hidden";
};

TITLEVIDEO.el = () => {
  if (!TITLEVIDEO._el) {
    const v = document.createElement("video");
    // the file in memory once it is (TITLEVIDEO.preload sets it on arrival)
    if (TITLEVIDEO._url) v.src = TITLEVIDEO._url;
    else if (TITLEVIDEO.ready) v.src = TITLEVIDEO.SRC;
    v.muted = true;              // the soundtrack carries the audio
    v.playsInline = true;        // iOS refuses to inline an unflagged video
    v.preload = "auto";
    v.setAttribute("aria-hidden", "true");
    v.style.cssText = [
      "position: fixed",
      "left: 0", "top: 0", "width: 0", "height: 0",
      "z-index: 0",
      "pointer-events: none",
      "display: none",
      "object-fit: fill",
      "image-rendering: pixelated",
      "image-rendering: crisp-edges",
    ].join(";");
    document.body.insertBefore(v, document.body.firstChild);
    // the still sits straight after it, so it paints over it
    const s = document.createElement("img");
    s.alt = "";
    s.setAttribute("aria-hidden", "true");
    s.style.cssText = v.style.cssText;
    s.style.visibility = "hidden";
    v.after(s);
    TITLEVIDEO._still = s;
    // Take the still down only once the video has actually PRESENTED a
    // frame of its own: "playing" fires before an iPhone has one to show.
    v.addEventListener("playing", () => {
      const token = TITLEVIDEO._stillToken;
      const down = () => { if (token === TITLEVIDEO._stillToken && !v.paused) TITLEVIDEO.hideStill(); };
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(down);
      else {
        const tick = () => {
          if (token !== TITLEVIDEO._stillToken || v.paused) return;
          if (v.currentTime > 0.08) down();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    // Kaboom leaves its canvas statically positioned, and a positioned element
    // paints over a static one whatever the DOM order says. Lift the canvas
    // into its own layer so the video really does end up behind it.
    const c = document.querySelector("canvas");
    if (c) {
      c.style.position = "relative";
      c.style.zIndex = "1";
    }
    TITLEVIDEO._el = v;
  }
  return TITLEVIDEO._el;
};

// Sit exactly on the letterboxed play area.
//
// Kaboom sizes the canvas element to the whole window and letterboxes INSIDE
// it, so the canvas rect is not the picture. This repeats the engine's own
// viewport sum (fit 960x540 into the canvas, centre it) rather than guessing.
TITLEVIDEO.layout = () => {
  const v = TITLEVIDEO._el;
  if (!v) return;
  const c = document.querySelector("canvas");
  if (!c) return;
  const r = c.getBoundingClientRect();
  const aspect = G.W / G.H;
  let w = r.width;
  let h = r.width / aspect;
  if (r.width / r.height > aspect) {
    h = r.height;
    w = r.height * aspect;
  }
  const left = r.left + (r.width - w) / 2;
  const top = r.top + (r.height - h) / 2;
  const box = [left, top, w, h].map(Math.round).join(",");
  if (box === TITLEVIDEO._box) return;
  TITLEVIDEO._box = box;
  for (const el of [v, TITLEVIDEO._still]) {
    if (!el) continue;
    el.style.left = Math.round(left) + "px";
    el.style.top = Math.round(top) + "px";
    el.style.width = Math.round(w) + "px";
    el.style.height = Math.round(h) + "px";
  }
};

// Show it, parked on the first frame. Returns the element.
TITLEVIDEO.mount = () => {
  const v = TITLEVIDEO.el();
  v.style.display = "block";
  TITLEVIDEO._still.style.display = "block";
  TITLEVIDEO.showStill(TITLEVIDEO.POSTER);
  TITLEVIDEO._box = "";
  TITLEVIDEO.layout();
  return v;
};

// Hide it again on the way out of the title. Anything but the title scene
// expects an opaque background, and a paused video underneath a transparent
// canvas would still be visible.
TITLEVIDEO.unmount = () => {
  const v = TITLEVIDEO._el;
  if (!v) return;
  v.pause();
  v.style.display = "none";
  if (TITLEVIDEO._still) TITLEVIDEO._still.style.display = "none";
};

// Jump to the parked framing without playing. Used when the sequence is
// skipped, and when a player who has already watched it comes back.
TITLEVIDEO.toEnd = (t) => {
  const v = TITLEVIDEO.el();
  v.pause();
  TITLEVIDEO.showStill(TITLEVIDEO.END_STILL);
  const land = () => { try { v.currentTime = t; } catch (e) {} };
  if (v.readyState >= 1) land();
  else v.addEventListener("loadedmetadata", land, { once: true });
};

// start the download as soon as this file runs, under the loading screen
TITLEVIDEO.preload();
