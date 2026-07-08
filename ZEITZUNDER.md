# Zeitzünder — design spec

A living design doc for the **asymmetric co-op bomb-defusal** game (`js/games/zeitzunder.js`).
This captures the *vision and decisions* that don't survive in code form. The shared-app rules
still apply (pure static, no backend, bilingual DE-default, vanilla JS — see `PARTY-APP-SPEC.md`).

> Status: **MVP shipped** — one bomb, one shared manual, tuned for 1 defuser + 1 expert.
> The frame is built to grow into multi-expert and multi-module.

---

## 1. The pitch

A new genre for Spielecke, *Keep Talking and Nobody Explodes* in miniature. **One screen is
the bomb** (a MacBook on the table); **the others are experts** holding the manual on their
phones. The two devices never talk to each other — **the people in the room are the only
network.** The defuser describes what they see; the experts read back what to do; the clock
runs. No backend, no sync — the *asymmetry* does the work a network otherwise would.

This is the answer to the old "everyone on their own screen needs a broker" problem
(`PARTY-APP-SPEC.md` Part 0): we don't sync anything. The bomb is one self-validating static
instance; the manual is fixed reference; the humans bridge them by voice.

## 2. Pillars (do not violate)

1. **The defuser is lost.** No map, no labels, no titles, no guidance, almost no text on the
   bomb at all. They hold an unfamiliar object and can only describe raw shapes ("a letter G,
   some coloured bars, three lit dots"). All meaning lives in the expert's manual.
2. **The expert is buried.** The manual has the real rules *and* useless bureaucratic spam to
   dig through under time pressure (GDPR notices, warranty boilerplate). Finding the right
   page is part of the game.
3. **The room is the interface.** Every cross-device step is verbal. Design *around* that, not
   against it — never require the bomb to "know" what the experts said.
4. **One interlocking puzzle, never a linear checklist.** Faces feed each other; the order is
   hidden. You must move all over the device to solve any one thing.
5. **Machine does secrets + randomness; humans do everything else.** The bomb validates the
   final action; it never needs to read the manual.

## 3. The bomb (defuser's screen)

A **real 3D cube of grey industrial panels** — screws in the corners, bevelled metal, a black
digital readout for the timer/strikes. Six faces, one job each. You **physically flip the
cube** to reach them: drag to grab-and-turn, arrow keys, or four sleek directional arrows laid
out around the cube (browser-friendly), with a 3D flip animation. A top-left **↻ roll button**
(also the **Spacebar**) turns the whole cube 90° clockwise about the viewing axis, for when it's
handed over sideways or upside down. On the expert's side, **← / →** page through the manual. There is **no face menu / shortcut nav** — none of these name a face, so they don't
orient you; you're still meant to be lost.

- **Random arrangement every game.** The six logical faces are dealt to the six physical sides
  of the cube at random, so "wires is on the right" is never learnable.
- **Six faces:** `core` (serial, three firing sigils, three progress lamps), `wires`,
  `keypad`, `dials`, `guts` (batteries + indicators + the decoder letter + colour-priority),
  and `maze` (a 6×6 grid with walls the defuser can't see). The old standalone `decoder` face
  was folded into `guts` to make room for the Maze.
- **Casing is grey**, deliberately industrial against the playful cream chrome. Decorative
  detailing (screws, bolts, bevels) frames the functional elements so it reads as a device.

### Cube implementation notes

- Faces are positioned with `translateZ` on a `preserve-3d` cube; the cube is pushed back by
  half its size (`cubeTransform`) so the **front-facing side sits at z=0** — exact size, no
  perspective scaling, no overflow onto the HUD, and reliably clickable.
- Orientation is tracked as an **integer 3×3 rotation matrix** `M` (90° steps), fed straight
  to CSS via `matrix3d`. The front side is the slot whose normal maps to `+z`. This is exact
  and gimbal-free. Only the front face gets `pointer-events` (so side faces never intercept).
- *History:* a first attempt let perspective scale the faces and they became un-clickable
  (verified: 0 hittable pixels). The z=0 anchoring + front-only pointer-events fixed it; an
  isolated cube test and a full headless solve confirm clicks land.

## 4. The puzzle

Four **action stages** — `WIRES`, `KEYPAD`, `DIALS`, `MAZE` — must be **committed in an order
the bomb hides** in its firing sigils (Core face), *reversed* when the serial's last digit
is even. Acting out of order is a strike, so you can't brute-force left-to-right.

Each stage reads values off **other** faces, forcing constant flipping:

| Stage  | Reads from | Rule (summary) |
|--------|-----------|----------------|
| Dials  | serial (Core), VNT (Guts) | A = digit-sum mod 10; B = first letter via Letter Bank; VNT swaps |
| Wires  | the live Dials, colour priority (Guts) | cut wire numbered (A+B); else highest-priority colour; ties → leftmost |
| Keypad | letter (Guts), SIG (Guts), serial last digit (Core) | press the letter's glyph row; reverse on SIG; then append ONE glyph by grid position, keyed on the serial's last digit (`KEYPAD_SUFFIX`) |
| Maze   | two marker cells (Maze face) | expert IDs the maze from the two rings, then guides the lit cell to the red target around invisible walls; a wall bump is a strike |
| Order  | sigils (Core), serial parity | decode sigils → stages; reverse if last digit even |

Six faces: **Core** (firing sigils + progress LEDs + serial + the **arming control**), **Guts**
(reference hub: decoder letter, colour priority, indicators, batteries), and four interactive
modules **Wires / Keypad / Dials / Maze**. The old standalone Decoder face was folded into Guts to
make room for the Maze. Mazes are a fixed hard-coded set (`MAZES`) so the expert's manual and the
bomb always agree.

**Multi-face commit.** The Keypad and Dials do **not** take on their own faces — you set them, then
flip to the Core and **hold the arming control, releasing as the timer's last digit hits the arming
digit** (`armDigit = (lit indicators + batteries) mod 10`, so the batteries finally matter). Wrong
timing just misfires (retry, no strike); a wrong value still strikes. Wires and Maze commit on their
own face. So a single solving step spans faces: read on one → set on another → arm on the Core.

`CLR` (indicator) and the **batteries** are **decoys** — no rule reads them (the manual says so;
the defuser doesn't know that). The serial is deliberately hot: its digits/last-digit feed the
Dials, the Firing order **and** the Keypad, so the defuser keeps having to read it out — exactly
the "ask → relay the serial → read back the step" loop the room runs on. The wire-cut reads the
dials **live**, so the dials must be set correctly even when Wires comes first.

**Fail:** 3 strikes (wrong action or out-of-order) or the clock → 💥. Strikes cost no time — the
running clock is pressure enough, and a time penalty on top just punished the losing team twice.
**Win:** all three lamps green → defused. Fuse length is the difficulty — two tiers only,
**Normal 10:00** (the default) and **Lethal 5:00**. Tuned from playtesting: even a solo player
holding both screens barely cleared the first module inside the old ~6 min, so a separated team
needs far more air.

## 5. Rule tables = single source of truth

`SYMBOL_TABLE`, `FIRING_SIGILS`, `LETTER_BANK`, the colour priority, etc. are module-level
constants. **Both** the host generator/solver **and** the expert manual render from them, so the
page the expert reads and the answer the bomb expects can never drift. This is the core
maintenance discipline; honour it when adding modules.

## 6. The manual (expert's phone)

A **physical booklet you flip through one page at a time** — not a scroll. A cover, then
chapters; flip with ◀ ▶, arrow keys, or a horizontal swipe, with a page-turn animation and a
page counter. The same content every game (only the bomb is random).

- **Cover.** Secret-dossier look (striped cover, "TOP SECRET" stamp, 🧨📖, gold title). States
  **which expert you are** ("Expert 1") and **"Do not open until the timer starts."** The cover
  is the **multi-expert variation point**: `buildBook(expertId, expertCount)` already takes the
  expert — later, different experts get disjoint chapter sets and the cover names them.
- **Real chapters** (numbered Ch. 1–8): How to defuse, Firing order, Dials, Keypad, Reading the
  bomb, Wires (full procedure, shelved at the back), Wiring Maze, and Arming the detonator. Each
  is padded with believable boilerplate *filler* (factory
  notes, calibration disclaimers, read-only warnings) around the operative rule, so the real
  instruction is buried in officialese — but the rule lines themselves are never touched.
- **Spam to dig through** — ten deadpan **annexes** (I–X) interleaved between the chapters:
  Foreword & Legal Notice, Safety Instructions, Data Protection (GDPR), Maintenance & Care,
  Warranty & Liability, Troubleshooting, Disposal/Conformity/Index, End-User Licence Agreement,
  Frequently Asked Questions, and a Customer Satisfaction Survey. ~19 leaves total (cover + 8
  chapters + 10 annexes); dashed accent, otherwise styled like real pages so they genuinely
  distract.
- **Coffee-stain misdirection.** The "Wire-Cutting Reference Card" reads as a believable, serious
  quick-reference, but a near-opaque coffee splatter (an SVG turbulence/displacement stain — no
  asset) genuinely buries the lower steps, while the real, complete procedure is at the **back**
  (Ch. 6 — Wires). A surviving footer cross-references it ("Full procedure: Chapter 6"). No meta
  jokes on the page — the humour is environmental, the page itself stays in-fiction.
- **Post-it decoy.** A sticky note on the GDPR annex reads "Today's code: 4 7 2 9 — do not share."
  A pure red herring (nothing reads it), like `CLR`. The design element is the point.

More pages (spam, decoys, props) are cheap to add — they're pure content in `buildBook`.

## 7. Current scope & verification

- **Scope:** a single bomb, one shared manual, minimum 2 players (1 defuser + 1 expert). With
  one expert the manual isn't split yet.
- **Verified:** rule engine audited over thousands of generated bombs (0 unsolvable, every
  firing order exercised, modifiers fire); cube front-detection calibrated against real
  rendering (0 mismatches once
  settled, all 6 faces reachable across random arrangements); full happy- and lose-paths driven
  through the real UI headlessly with zero console errors. The pure engine is exposed under
  `module._test` for the Node audit + browser tests.

## 8. Roadmap / parking lot

- **Multi-expert:** deal the manual's pages across several experts so chains force
  *expert-to-expert* talk (e.g. one holds the Letter Bank, another the wire rules). The manual
  is already chaptered for this.
- **More faces / modules:** the Maze shipped (defuser walks a lit cell, expert reads the
  invisible walls); next could be a Simon-style sequence and needy modules that periodically
  demand attention.
- **Seeded per-game manuals:** shuffle the manual's tables per game (QR/seed handoff) so
  regulars can't memorise — a v2 once the static version is loved.
- **More decoration:** non-functional wires/lights/vents that complement the real elements;
  ambient casing wear; richer flip sound.
- **Drag polish:** momentum / multi-step swipes; haptics on mobile.
