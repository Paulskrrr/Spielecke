# Spielecke — Game Spec: Kartenklassiker-Erweiterung

Three new card-based drinking games for Spielecke, adapted from analog classics that are
*better* on a shared MacBook screen (the app handles dealing, randomness, and tracking).
All three use **public information** (everyone looks at the same revealed card), which is
why they fit the single-shared-screen, zero-service model.

Each is a new game module plugging into the **existing Spielecke shell** (Game Module
Contract from `PARTY-APP-SPEC.md`): shared roster, namespaced store, `goHome()`. Don't
rebuild shell infrastructure.

**Shared verb note:** these are standalone games, not Hochadel. Use neutral „trinken" here
*unless* Paul later wants to unify wording. (Open question §5.)

> **Bullshit / Lügen — deliberately excluded.** It relies on hidden per-player hands. A
> single shared screen exposes everyone's cards (kills the bluff); the only fix is
> per-device private views with sync, which needs a server/broker — ruled out by the
> zero-service constraint. Revisit only if a PeerJS-style broker is ever accepted.

---

## A virtual 52-card deck (shared helper)

All three games need a standard 52-card deck with honest shuffling. Build one small reusable
deck utility (ranks 2–10, J, Q, K, A; four suits ♠♥♦♣; red/black). Provide: shuffle, draw,
reset, and helpers for rank-value comparison and colour/suit lookup. Card rendering (a clean
face with rank + suit, red/black) should be a shared component all three reuse. This avoids
three separate card implementations.

---

## Game 1 — „Die Busfahrt" (Ride the Bus, final phase only)

Only the guessing gauntlet — not the earlier dealing rounds. One player is the **Busfahrer**;
the app deals a row of face-down cards and the driver guesses each in an escalating 4-step
sequence. Any wrong guess sends them back to the start of the row; they drink for the level
reached. Clear the whole row to escape.

### The four steps (escalating difficulty)

The driver faces a row of (up to) four positions. Each step is a harder guess about the
**next** card revealed:

1. **Farbe** — Rot oder Schwarz?
2. **Höher oder Tiefer** — vs. the previous revealed card. (Tie = drink / re-deal that step,
   configurable; default: tie counts as wrong.)
3. **Innerhalb oder Außerhalb** — will the next card's value fall *between* the two already
   revealed, or outside them? (Needs two prior cards, so this is step 3.)
4. **Suit** — name the exact suit (♠♥♦♣). The hardest, 1-in-4.

### Flow

- App designates a Busfahrer (pick from roster / pass the role each round).
- Reveal proceeds step by step. App shows the question, big YES/NO or option buttons, then
  flips the next card with a reveal animation and judges automatically.
- **Wrong guess:** back to step 1, the row reshuffles/redeals, and the driver **trinkt** a
  number of sips equal to the step they failed at (fail step 1 = 1, step 4 = 4). Default
  rule; make configurable.
- **Clear all four:** the driver escapes — no drinks; optionally they hand out the
  accumulated sips. Configurable.
- The escalating "back to start" loop is the whole tension; the app must track the current
  step and the revealed cards clearly on screen.

### Acceptance
- Four-step ladder works, judges each guess automatically, resets to step 1 on failure.
- Sip count scales with the failed step.
- Reveal animation makes each flip a moment.
- Role of Busfahrer can rotate via the roster.

---

## Game 2 — „Fuck the Dealer" (classic, with amounts & dealer rotation)

A dealer holds the virtual deck; the others try to guess the next card. Classic scoring and
dealer-rotation rules.

### Flow & rules (classic)

- One player is **Dealer** (app holds the deck for them). Play goes round the table.
- The active guesser calls a **rank** (2–A) for the top card.
  - **First guess wrong:** the dealer gives a hint — **höher oder tiefer** than the called
    rank. The guesser gets a **second guess**.
  - **Second guess also wrong:** the guesser **trinkt** sips = the value distance between
    their (closest) guess and the actual card. (Classic: difference in rank. Make the exact
    formula configurable — common variants: fixed 2 sips, or the numeric gap.)
  - **Guessed right (either attempt):** the **dealer trinkt** (classic: 2 sips for a
    first-try hit, more punishing if exact). Configurable amounts.
- The drawn card is revealed and discarded; next guesser.
- **Dealer rotation:** the dealer stays until the **deck is twice exhausted** OR a guesser
  nails it correctly on the first try a set number of times — classic rule is "dealer passes
  left when the deck runs out twice." Use deck-exhausted-twice as the default trigger; make
  it configurable.

### Acceptance
- Two-guess mechanic with high/low hint between guesses.
- Correct → dealer drinks; wrong twice → guesser drinks by the configured amount.
- Dealer rotates on the configured trigger.
- All amounts/triggers sit in an editable config block.

---

## Game 3 — „Das Pferderennen" (Horse Race, betting drinking game)

The digital showpiece — an animated race the app runs far better than cards on a table.

### Setup
- Pull the **four Aces** = the four horses (♠♥♦♣). Show them as a starting line on a track.
- The remaining 48 cards are the **draw pile**. Before the race, deal a **side-track** of
  face-down "hurdle" cards (classic: 6 cards laid out sideways) that horses must pass; each
  hurdle, once a horse reaches its level, flips and sends the matching-suit horse **back** one
  step. This is the rubber-band tension.

### Betting (drinking-game core)
- Before the race, each player **bets** on a horse (suit). The app records each player's pick
  (use the shared roster). Optionally a stake size in sips.
- **Race:** app flips draw-pile cards one at a time; the horse of that suit advances one step.
  When all horses reach a hurdle's level, the next hurdle flips and its suit's horse steps back.
- **Finish:** first horse past the final hurdle wins.
  - Players who bet the **winning** horse → **verteilen** sips (hand out drinks).
  - Players who bet a **losing** horse → **trinken** (classic: sips = how many lengths their
    horse finished behind, or a flat amount; configurable).

### Presentation
- Animated horses moving along a track on the MacBook — this is the wow factor. Suit icons as
  horses, smooth step animations on each flip, hurdle flips visible. Pace the reveals so it
  feels like a race call, not an instant result (small delay per flip, configurable speed).
- Optional: a "commentator" text line that quips as positions change (pure flavour).

### Acceptance
- Four-horse race driven by honest card flips; matching suit advances.
- Hurdle cards flip at the right levels and send the matching horse back.
- Betting recorded per player via roster; payouts/drinks resolved on finish.
- The race is **animated and paced**, not instant — it must play like an event.
- Configurable: hurdle count, flip speed, loss-sip formula.

---

## §5 — Open questions for Paul

1. **Wording:** keep neutral „trinken" in these three, or unify with Hochadel's „dienen"
   (and the no-curse etc. ground rules)? Could be a global app-wide drinking-word setting.
2. **Pferderennen loss formula:** flat sips or "lengths behind"? Default coded as flat,
   easy to switch.
3. **Busfahrt tie rule** (step 2 höher/tiefer on equal value): default = counts as wrong.
   OK?
4. **Fuck the Dealer amounts:** confirm the exact sip formula for right/wrong; defaults are
   placeholders.
5. Any **football/MMA/inside-joke flavour** layered on top (e.g. horses named after your
   group, commentator quips)? Content, fill later.

---

## Build notes

- Reuse the shared 52-card deck + card-face component across all three.
- Each game: own module, own config block at top, clean timer/animation teardown on
  `unmount()` (Pferderennen animation especially).
- Relative asset paths for the GitHub Pages subpath.
- Add three new entries to the game registry on the Spielecke shelf with appropriate icons
  (🚌 / 🃏 / 🐎) and the „Trinkspiel ✓" marker.
- Works on the MacBook on the table and opens on a phone via the published link.
