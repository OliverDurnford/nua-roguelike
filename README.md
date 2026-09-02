# NUA: The Roguelike — playable build

**Status:** Tech proof DONE, plus a UI polish pass (June 2026). The full
game skeleton runs end to end: title → character select → Victoria Park
tutorial → 5 chapters × 5 areas → Old Age finale → ending message screen.

**The UI look:** translucent rounded panels, gold accent colour, soft
glows, smooth animated bars, cinematic vignette, slide/fade motion on
everything. All drawn in code (core/ui.js + core/art.js) - no image
files, so it survives the real art pass untouched.

Everything visual is a placeholder except the Ollie and Annie sprites.
Everything written (jokes, lines, the ending message) is placeholder text
flagged for your review.

---

## 1. HOW TO PLAY IT RIGHT NOW

Two options:

1. **Double-click `index.html`** — opens in your browser. Needs internet
   (the game engine loads from a CDN). That's it.
2. When you're ready for phone testing: put this folder in your GitHub repo
   and turn on GitHub Pages (steps in `TECH_STACK.md` section 4).

Best on desktop in a normal browser window. On a phone, turn it sideways
(landscape) — portrait works but everything is small.

**Saving:** the game checkpoints itself at the door of every area, and
again the moment a friend joins you. Close the tab whenever; the title
screen offers "carry on" next visit, with "start a new game" underneath.
Quit mid-fight and you restart that room as you walked into it.
Finishing the game clears the save.

**Long-term memory:** separately, the game permanently remembers every
friend ever met and every character finished with, across all runs. The
ending's "What You Missed" uses it: "you've met 7 of the group's 10 so
far", "first run finished as Jess", and when the set is complete,
"you've met all ten. the whole group, back together." This is the
collect-them-all replay pull from the design docs (only four of nine
friends appear per run).

---

## 2. CONTROLS

**Desktop**
- Move: WASD or arrow keys
- Aim: mouse (your character fires automatically when enemies are alive)
- Companion special: SPACE (when the yellow meter is full)
- Swap companion: 1 / 2 / 3 / 4, or Q / E to cycle, or click their portrait

**Phone**
- Move: touch and drag on the left half of the screen
- Aim: automatic (locks to the nearest enemy)
- Special: tap the SP button, bottom right
- Swap companion: tap their portrait, top right

---

## 3. TESTING CHEATS (for you, not the friends)

While playing:
- `n` — sound on/off (this one's for everyone, not just testing)
- `k` — kill everything in the room
- `h` — full heal
- `m` — fill the special meter
- `g` — god mode on/off
- `]` — skip to the next area
- `F2` — show the invisible walls on a painted level (Gonzo's). Red blocks
  are what you bump into, the yellow dots are where enemies come in, the
  blue dot is where you start. Use it if something feels wrong to walk past

From the browser console (right-click → Inspect → Console):
- `dev.area(3, 5)` — jump straight to the Chapter 3 boss
- `dev.area(5, 5)` — jump to the finale
- `dev.tutorial()` — jump to Victoria Park
- `dev.ending()` — jump to the ending screen
- `dev.wipe()` — forget the saved run AND the long-term memory, reload

---

## 4. WHAT IS PLACEHOLDER vs REAL

**Real and staying:**
- The whole game structure (all 25 areas, bosses, companions, specials)
- Ollie and Annie sprites (embedded, shrunk to game size)
- **Gonzo's (Chapter 1, Area 1) is the first finished level.** It uses the
  painted background instead of an ASCII grid: you spawn on the Persian
  rug under the mirrorball, enemies come in from the stairs door beside
  the bar and from the corridor at the bottom, and the way out is bottom
  left past the toilets
- Companion passives matching the roster (Lucy +2 HP, Cal +25% speed, etc.)
- Companions trail behind you on the field in a chain (gold glow marks
  the selected one). Cosmetic only - they can't be hurt or block shots
- All spoken dialogue appears as a speech bubble above the actual
  speaker, outlined in their colour, and follows them as they move.
  Simultaneous lines stack instead of overlapping. If a speaker isn't
  on the field, the line falls back to a named subtitle. Damage numbers
  and system text stay as plain floating text so speech stands out
- Pair interactions (Cal/Sam/Lucy "milky lady", Josh's lines, "Silly
  boys!", Ollie+Lucy hug hearts, Josh+Sam's rare easy-to-miss kiss)
- Door-locks-until-room-clear, randomised enemies and companions per run
- Saving: a checkpoint at every area door plus on recruits; carry on /
  start a new game from the title (`core/save.js`)
- Long-term memory across runs: friends ever met, characters finished,
  surfaced in the ending's "What You Missed" (`core/story.js`)

**Placeholder — needs your input or future sessions:**
- Game title: "TEN YEARS" — pick the real one
- Ending message — marked in `scenes/ending.js`, write it when ready
- All 8 other character sprites (generated colour figures for now)
- All enemy designs — named placeholders ("Seagull", "Mercy Bouncer"...)
  using 4 basic behaviours. Real enemy design is its own session
- Map layouts for 24 of the 25 areas — correct shapes and feel per
  LEVEL_DESIGN.md, but drawn as simple ASCII grids. Easy to redraw
  (see section 5). Gonzo's is the exception: it is the real painted level
- Special attack cutscene frames — currently a text banner. Real illustrated
  frames come from the art sessions
- Chat-up lines, Josh's non-sequiturs, Ana's Spanish line — all marked
  PLACEHOLDER in `data/characters.js`. Rewrite with real inside jokes
- All balance numbers (damage, HP, boss difficulty, run length). Current run
  is much shorter than the 1-hour target - pacing comes later
- Sound effects are IN (code-generated retro synth in `core/sfx.js`):
  shots, hits, hurt, pickups, recruit jingle, special riser, boss roar,
  Sam's fart, the car honk, menu blips. Press N to mute (remembered).
  The real-song soundtrack is IN too: 34 tracks in `music/`, played by
  `core/soundtrack.js`, with the spinning record in the HUD naming each
  one 10 seconds after it starts. N mutes both.
- Megan Whiteside NPC stands in Propaganda with a PLACEHOLDER greeting
- New easter egg dialogue: Lucy's Geordie lines, Jess's blunt one-liners,
  Ana's ocean lines near water, Adam's "Watch this.", the Sam+Josh
  haircut exchange - all PLACEHOLDER wording for Ollie to rewrite

---

## 5. WHICH FILE DOES WHAT

```
nua-roguelike/
├── index.html            loads everything, in order
├── game.js               starts the game + dev jump helpers
├── data/
│   ├── characters.js     ← all 10 friends: passives, specials, lines
│   ├── chapters.js       ← every chapter, area map, enemy set, boss
│   └── level-gonzos.js   ← Gonzo's: walls, spawns and exit, in plain numbers
├── core/
│   ├── boot.js           engine start, shared state, base stats
│   ├── save.js           the run checkpoint (remembered between visits)
│   ├── story.js          permanent memory across runs (friends ever met)
│   ├── sprites-real.js   Ollie + Annie sprites (embedded as data)
│   ├── plates-real.js    painted level backgrounds (embedded as data)
│   ├── art.js            generates the placeholder sprites
│   ├── player.js         movement, aiming, auto-attack, damage
│   ├── enemies.js        enemy behaviours + boss patterns
│   ├── companions.js     recruitment, specials, easter eggs
│   └── ui.js             hearts, meter, portraits, touch controls
└── scenes/
    ├── title.js          title screen
    ├── select.js         character select
    ├── tutorial.js       Victoria Park + the cracks cutscene
    ├── area.js           runs every gameplay area + the finale
    └── ending.js         message, stats, What You Missed
```

**How big everyone is** comes from two numbers.

`G.CHAR_H` at the top of `core/boot.js`, currently 72, is how tall a
person stands on the field by default. Everything else in the room is
worked out from it — companions, all four enemy types, the bosses, even
the size of what you throw — so changing that one number rescales the
whole cast together and keeps them in proportion. Portraits, character
select and the title line-up are screen furniture and are deliberately
left alone.

`charScale` on a level then nudges that for one room, because every
painted venue is drawn at its own scale. Gonzo's runs at **1.3**, so a
person stands 94px in there and 72px everywhere else. It's the second
number in `data/level-gonzos.js`. Each new painted venue gets its own.

If you push either much higher, re-check the enemy spawn points in
`data/level-gonzos.js`: they are held clear of the walls by half the width
of the widest enemy (the brute, who is the tightest fit in the room), and
a big enough cast would start arriving inside the scenery.

The maps in `data/chapters.js` are text drawings — `=` wall, `o` obstacle,
`E` enemy spawn, `P` player start, `X` exit, `C` companion, `B` boss.
Change the text, refresh the browser, the level changes.

**Painted levels work differently.** Gonzo's has no text drawing. The
picture is the level, and `data/level-gonzos.js` lists where the walls and
furniture are as a set of rectangles. Picture the artwork cut into 32
columns and 18 rows, then read off column and row: `[21.2, 2.9, 29.4, 4.6]`
is the banquette along the top. Change a number, refresh, press `F2` to see
where the block actually landed. Every other venue can be added the same
way: drop the base64 picture into `core/plates-real.js`, copy
`level-gonzos.js`, point the area at it in `chapters.js`.

---

## 6. SWAPPING IN REAL SPRITES LATER

When a new character sprite is approved (1024px PNG, transparent
background, per the workflow in PROJECT_CONTEXT.md section 6):
give it to Claude in a build session and it gets embedded the same way
as Ollie's and Annie's. Nothing else needs to change — the game scales
all sprites to the right height automatically.

---

## 7. ENTER THE GUNGEON NOTES (from research, June 2026)

- Gungeon characters are ~30px on screen; ours land at 34-46px. Close enough
- Gungeon's camera leans toward your aim cursor — already in (desktop only)
- Gungeon locks doors until the room is cleared — already in
- Gungeon's signature move is the dodge roll with invincibility frames.
  Our locked design is auto-attack with movement focus instead. If combat
  feels flat in playtesting, a dodge roll is the first thing to consider
  adding — raise it in the Core Mechanics session

---

## 8. A NOTE IN index.html

There's a tiny script at the top of `index.html` that keeps the game loop
alive when the browser tab is hidden. Players will never notice it - it
exists so automated testing can drive the game off-screen. Leave it in.

## 9. KNOWN ROUGH EDGES

- Boss fights: patterns work but bosses wander a bit aimlessly between them
- Side-scrolling areas (Norwich dash, Thames walk) use the same camera as
  open areas — they work, but don't feel "urgent" yet
- The park restoration at the finale is covered by the fade to white rather
  than shown — decide later if it deserves its own moment
- Death restarts the current chapter (companions kept). Friendly, not
  hardcore — flag if you want it harsher
- Soundtrack: every track defaults to the shared "general" pool. Assigning
  songs to specific levels is Ollie's call, see ../docs/soundtrack-labelling.md
  (one level above this repo's root, not tracked in here) and edit
  data/soundtrack.js to match
