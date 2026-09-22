// ============================================================
// COLLECTION SCREENS: where each friend's four layers sit.
//
// Ollie's file. The art itself is generated (core/cutins-real.js);
// this is the staging. Every number is in the game's own 960 x 540
// coordinates, measured from the top left.
//
//   sky     the two colours of the backdrop behind everything,
//           top then bottom. Taken from that friend's own palette.
//   park    where each layer rests, centre of the image, index 0
//           (the friend, from the left) to index 3 (far, from the
//           right). The friend sits left of centre so the type has
//           the right of the screen to itself.
//   bubble  where the speech bubble's tail points: their head.
//
// Nothing here sets the timing or the speed. Those are the depth
// constants in core/cutin.js, shared by everybody.
// ============================================================

const CUTINS = {
  ollie: { sky: [[54, 62, 96], [186, 150, 122]], park: [[265, 305], [470, 440], [470, 340], [470, 150]], bubble: [235, 118] },
  lucy: { sky: [[96, 74, 104], [228, 186, 156]], park: [[230, 355], [470, 560], [470, 340], [470, 130]], bubble: [215, 165] },
  cal: { sky: [[88, 132, 186], [206, 226, 240]], park: [[250, 375], [470, 450], [470, 355], [470, 150]], bubble: [235, 195] },
  josh: { sky: [[62, 60, 84], [200, 168, 132]], park: [[235, 355], [470, 455], [470, 320], [470, 130]], bubble: [205, 178] },
  annie: { sky: [[84, 44, 76], [214, 158, 176]], park: [[200, 355], [470, 452], [470, 290], [470, -30]], bubble: [195, 168] },
  sam: { sky: [[70, 98, 78], [216, 214, 184]], park: [[200, 355], [470, 520], [470, 280], [470, 60]], bubble: [200, 168] },
  ana: { sky: [[70, 132, 176], [244, 214, 158]], park: [[215, 352], [470, 440], [470, 290], [470, 105]], bubble: [218, 182] },
  jess: { sky: [[64, 120, 148], [226, 208, 158]], park: [[220, 350], [470, 505], [470, 255], [470, 115]], bubble: [210, 167] },
  adam: { sky: [[30, 34, 56], [110, 96, 120]], park: [[235, 372], [470, 470], [470, 330], [470, 145]], bubble: [232, 184] },
  ethan: { sky: [[52, 56, 72], [188, 184, 176]], park: [[215, 355], [470, 515], [470, 400], [470, 45]], bubble: [200, 170] },
};
