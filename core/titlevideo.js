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

TITLEVIDEO.SRC = "video/title-move.mp4";
TITLEVIDEO.seen = false;   // true once the sequence has run, so coming back to
                           // the title from a game does not replay it

TITLEVIDEO._el = null;
TITLEVIDEO._box = "";      // last layout applied, so we only touch style on change

TITLEVIDEO.el = () => {
  if (!TITLEVIDEO._el) {
    const v = document.createElement("video");
    v.src = TITLEVIDEO.SRC;
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
  v.style.left = Math.round(left) + "px";
  v.style.top = Math.round(top) + "px";
  v.style.width = Math.round(w) + "px";
  v.style.height = Math.round(h) + "px";
};

// Show it, parked on the first frame. Returns the element.
TITLEVIDEO.mount = () => {
  const v = TITLEVIDEO.el();
  v.style.display = "block";
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
};

// Jump to the parked framing without playing. Used when the sequence is
// skipped, and when a player who has already watched it comes back.
TITLEVIDEO.toEnd = (t) => {
  const v = TITLEVIDEO.el();
  v.pause();
  const land = () => { try { v.currentTime = t; } catch (e) {} };
  if (v.readyState >= 1) land();
  else v.addEventListener("loadedmetadata", land, { once: true });
};
