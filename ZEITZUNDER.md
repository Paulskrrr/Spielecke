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
cube** to reach them: drag to grab-and-turn, or arrow keys, with a 3D flip animation. There is
**no face menu / shortcut nav** — that would orient you, and you're meant to be lost.

- **Random arrangement every game.** The six logical faces are dealt to the six physical sides
  of the cube at random, so "wires is on the right" is never learnable.
- **Six faces:** `core` (serial, three firing sigils, three progress lamps), `wires`,
  `keypad`, `dials`, `guts` (batteries + indicators), `decoder` (a letter + colour-priority).
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

Three **action stages** — `WIRES`, `KEYPAD`, `DIALS` — must be **committed in an order the
bomb hides** in its three firing sigils (Core face), *reversed* when the serial's last digit
is even. Acting out of order is a strike, so you can't brute-force left-to-right.

Each stage reads values off **other** faces, forcing constant flipping:

| Stage  | Reads from | Rule (summary) |
|--------|-----------|----------------|
| Dials  | serial (Core), VNT (Guts) | A = digit-sum mod 10; B = first letter via Letter Bank; VNT swaps |
| Wires  | the live Dials, colour priority (Decoder) | cut wire numbered (A+B); else highest-priority colour; ties → leftmost |
| Keypad | letter (Decoder), SIG + batteries (Guts) | press the letter's glyph row; reverse on SIG; +centre glyph if 3+ batteries |
| Order  | sigils (Core), serial parity | decode sigils → stages; reverse if last digit even |

`CLR` is a **decoy** indicator — no rule reads it (the manual says so; the defuser doesn't
know that). The wire-cut reads the dials **live**, so the dials must be set correctly even when
Wires comes first — a deliberate "set it before you can use it" coupling.

**Fail:** 3 strikes (wrong action or out-of-order; each also burns 15s) or the clock → 💥.
**Win:** all three lamps green → defused. Fuse length is the difficulty (Rookie/Standard/Lethal).

## 5. Rule tables = single source of truth

`SYMBOL_TABLE`, `FIRING_SIGILS`, `LETTER_BANK`, the colour priority, etc. are module-level
constants. **Both** the host generator/solver **and** the expert manual render from them, so the
page the expert reads and the answer the bomb expects can never drift. This is the core
maintenance discipline; honour it when adding modules.

## 6. The manual (expert's phone)

Static reference (same every game), chaptered, with a jump-nav. Real chapters (How to defuse,
Firing order, Dials, Wires, Keypad, Reading the bomb) are **interleaved with deadpan spam** the
expert must skip past:

- **Ch. 2 — Data Protection (GDPR):** mock legal boilerplate ("the Controller processes…
  fingerprints, ambient panic levels, and last words").
- **Ch. 6 — Warranty & Liability:** "Warranty void if device is … defused, or detonated."

Spam pages are styled the same as real ones (dashed accent only) so they genuinely distract.
More can be added freely — they're pure content.

## 7. Current scope & verification

- **Scope:** a single bomb, one shared manual, minimum 2 players (1 defuser + 1 expert). With
  one expert the manual isn't split yet.
- **Verified:** rule engine audited over 20k generated bombs (0 unsolvable, all 6 firing orders,
  modifiers fire); cube front-detection calibrated against real rendering (0 mismatches once
  settled, all 6 faces reachable across random arrangements); full happy- and lose-paths driven
  through the real UI headlessly with zero console errors. The pure engine is exposed under
  `module._test` for the Node audit + browser tests.

## 8. Roadmap / parking lot

- **Multi-expert:** deal the manual's pages across several experts so chains force
  *expert-to-expert* talk (e.g. one holds the Letter Bank, another the wire rules). The manual
  is already chaptered for this.
- **More faces / modules:** a maze (defuser reads coordinates, expert has the walls), a
  Simon-style sequence, needy modules that periodically demand attention.
- **Seeded per-game manuals:** shuffle the manual's tables per game (QR/seed handoff) so
  regulars can't memorise — a v2 once the static version is loved.
- **More decoration:** non-functional wires/lights/vents that complement the real elements;
  ambient casing wear; richer flip sound.
- **Drag polish:** momentum / multi-step swipes; haptics on mobile.
