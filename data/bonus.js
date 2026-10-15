// ============================================================
// BONUS CHARACTERS (14 Oct 2026, docs/superpowers/specs/
// 2026-10-14-bonus-characters-design.md). Seven people hidden one per
// room; find one and they are playable for good on that device, from
// the BONUS page on character select. Kept apart from CHARACTERS so
// every loop over the ten (recruits, cages, the tutorial line-up, the
// ending) stays the ten. G.char finds both.
//
// room: [chapter, area]. spot: the level file key they stand on
// (bonusSpawn, moved on the level board; Megan keeps her npcSpawn).
// passive is empty and special is borrowed: as a player neither is
// ever used (both only come from friends you pick up), but code that
// reads a character expects them.
// lines.unlock is the unlock card's line, lines.notYet the bubble when
// this run's allowance is used up. Both PLACEHOLDER for Ollie, as are
// the flavour lines. colors are sampled from each approved sprite (hair,
// skin, then a clothes colour for top, which tints their speech bubble).
// ============================================================

const BONUS_NOT_YET = "Maybe I can join you next playthrough. Just not this one.";   // PLACEHOLDER
const bonusSpecial = (id) => Object.assign({}, CHARACTERS.find((c) => c.id === id).special);
const BONUS_NO_PASSIVE = { name: "", desc: "", apply: null };

const BONUS_CHARACTERS = [
  {
    id: "olliew", name: "Ollie W", bonus: true, real: true, height: 40,
    colors: { hair: [178, 130, 46], skin: [245, 189, 154], top: [180, 170, 215], bottom: [60, 62, 74] },
    weapon: { name: "DVD case", color: [30, 30, 36] },
    flavour: "PLACEHOLDER: a line about Ollie W.",
    passive: BONUS_NO_PASSIVE, special: bonusSpecial("josh"), recruitLine: "",
    room: [1, 3], spot: "bonusSpawn",
    lines: { unlock: "Pick Ollie W on the BONUS page.", notYet: BONUS_NOT_YET },
  },
  {
    id: "megan", name: "Megan", bonus: true, real: true, height: 38,
    colors: { hair: [196, 140, 116], skin: [242, 194, 174], top: [62, 112, 78], bottom: [196, 168, 124] },
    weapon: { name: "Mickey Mouse ears", color: [20, 20, 24] },
    flavour: "PLACEHOLDER: a line about Megan.",
    passive: BONUS_NO_PASSIVE, special: bonusSpecial("annie"), recruitLine: "",
    room: [1, 2], spot: "npcSpawn",
    lines: { unlock: "Pick Megan on the BONUS page.", notYet: BONUS_NOT_YET },
  },
  {
    id: "joep", name: "Joe P", bonus: true, real: true, height: 41,
    colors: { hair: [68, 60, 60], skin: [218, 146, 98], top: [68, 100, 148], bottom: [20, 20, 20] },
    weapon: { name: "Writer's quill", color: [240, 240, 235] },
    flavour: "PLACEHOLDER: a line about Joe P.",
    passive: BONUS_NO_PASSIVE, special: bonusSpecial("cal"), recruitLine: "",
    room: [2, 3], spot: "bonusSpawn",
    lines: { unlock: "Pick Joe P on the BONUS page.", notYet: BONUS_NOT_YET },
  },
  {
    id: "joec", name: "Joe C", bonus: true, real: true, height: 42,
    colors: { hair: [156, 140, 124], skin: [238, 198, 162], top: [100, 116, 68], bottom: [20, 20, 20] },
    weapon: { name: "Toy car", color: [200, 40, 40] },
    flavour: "PLACEHOLDER: a line about Joe C.",
    passive: BONUS_NO_PASSIVE, special: bonusSpecial("adam"), recruitLine: "",
    room: [2, 4], spot: "bonusSpawn",
    lines: { unlock: "Pick Joe C on the BONUS page.", notYet: BONUS_NOT_YET },
  },
  {
    id: "max", name: "Max", bonus: true, real: true, height: 43,
    colors: { hair: [164, 132, 92], skin: [238, 174, 130], top: [44, 44, 52], bottom: [20, 20, 28] },
    weapon: { name: "Gun", color: [30, 30, 30] },
    flavour: "PLACEHOLDER: a line about Max.",
    passive: BONUS_NO_PASSIVE, special: bonusSpecial("lucy"), recruitLine: "",
    room: [5, 2], spot: "bonusSpawn",
    lines: { unlock: "Pick Max on the BONUS page.", notYet: BONUS_NOT_YET },
  },
  {
    id: "dion", name: "Dion", bonus: true, real: true, height: 43,
    colors: { hair: [30, 24, 20], skin: [150, 100, 70], top: [20, 20, 24], bottom: [20, 20, 24] },
    weapon: { name: "Espresso martini", color: [70, 40, 25] },
    flavour: "PLACEHOLDER: a line about Dion.",
    passive: BONUS_NO_PASSIVE, special: bonusSpecial("ana"), recruitLine: "",
    room: [5, 3], spot: "bonusSpawn",
    lines: { unlock: "Pick Dion on the BONUS page.", notYet: BONUS_NOT_YET },
  },
  {
    id: "jack", name: "Jack", bonus: true, real: true, height: 41,
    colors: { hair: [60, 52, 60], skin: [242, 170, 126], top: [74, 122, 190], bottom: [30, 30, 36] },
    weapon: { name: "Newspaper", color: [220, 215, 200] },
    flavour: "PLACEHOLDER: a line about Jack.",
    passive: BONUS_NO_PASSIVE, special: bonusSpecial("ethan"), recruitLine: "",
    room: [5, 4], spot: "bonusSpawn",
    lines: { unlock: "Pick Jack on the BONUS page.", notYet: BONUS_NOT_YET },
  },
];
