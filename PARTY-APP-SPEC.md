# Spielecke — Party Game App Spec

A self-owned, group-specific party-game collection. Splash-like aggregator, but every
game is filled with our own terms, rules, references, and design. Lives permanently on a
GitHub Pages link, gets new games added over time. Built to outlast any single event.

This document started as the build brief and is now kept as **living documentation** — it
reflects what's actually been built, the decisions that were made along the way, and what's
next.

> **Adults only.** The shell/UI is playful and childlike on purpose, but the *content* is
> NSFW — this is a drinking game for grown-ups.

---

## Status

**Shipped (on `main`):** the shell + **11 games**.

- ✅ The shell — home/game shelf, shared roster, registry, game module contract, persistence
- ✅ Full "Pauls Spielecke" playground/toy-box visual identity + logo
- ✅ Shared term database for single-term games + optional drinking-mode toggle
- ✅ **The Bomb** — hot-potato word game *(drinking-capable)*
- ✅ **Most Likely To** — pointing deck *(drinking-capable)*
- ✅ **Never Have I Ever** — confession deck *(drinking-capable)*
- ✅ **Who Am I?** — Heads-Up / forehead guessing
- ✅ **Imposter** — hidden-role secret word
- ✅ **Wavelength** — spectrum/dial guessing
- ✅ **Liar's Numbers** — numeric bluff *(drinking-capable)*
- ✅ **Princess Treatment** — King/Princess debate deck
- ✅ **Doodle Drama** — drawing telephone (canvas)
- ✅ **Activity** — two-team board race (explain / draw / charade)
- ✅ **Quiz Out** — turn-based knockout quiz *(drinking-capable)*

**Next:** more games (see Roadmap), fill in NSFW + inside-joke content pools, optional
settings/stats screen.

---

## Part 0 — Principles & Constraints

- **Pure static.** No backend, no external service, no signup, no realtime sync. Works
  opened from a `file://` path, from GitHub Pages, on a MacBook, and on any phone via the
  published link. Each person can also just open the link independently.
- **One device at a time / shared screen.** Games are designed for a MacBook on the table
  or a phone passed around. No cross-device networking. (Deliberate — the "everyone on
  their own screen" magic needs a broker/backend, which we ruled out.)
- **Scales to ~10, flexible.** Player count is never load-bearing. Games work from ~3 up to
  ~12 without special-casing.
- **Every game has a clean win/lose/score outcome.** Games are **plain by default** — not
  everything is a drinking game. Games where it *fits* expose an optional **🍻 Drinking
  mode** toggle in their setup (off by default, persisted); turning it on swaps the
  resolution to "who drinks." Don't bolt a drink penalty onto a game where it doesn't fit.
- **Content carries the theme, not code.** Group jokes, MMA, our topics — all live in
  editable data files, never hardcoded into game logic. New content is cheap to add.
- **Language: English for UI and shell now.** Games may later carry English *or* German
  pools (or both, switchable). Content structures are plain objects so a pool can be added
  without code changes.
- **Single responsive build.** One `index.html` + shared CSS/JS, mobile-first. No separate
  mobile/desktop builds — CSS adapts to phone and laptop. Must look right on both.
- **Vanilla JS / HTML / CSS, no framework, no build step.** Loaded as **ordered classic
  `<script>` tags** (not ES modules) so the app works from `file://` without a server —
  ES module `import` is blocked by browsers under `file://`. All asset paths are relative.
- **Persistence via localStorage only** (roster, per-game settings, future stats). Degrades
  gracefully to in-memory if localStorage is unavailable.

### Visual identity (decided)

- **Name:** Spielecke ("the play corner").
- **Look:** kindergarten / playground / toy-box. Chunky crayon colours, fat rounded
  toy-block buttons with hard offset shadows, sticker-style headings (white outline),
  confetti background, bouncy/wiggle animations, big emoji.
- **Childlike design, adult content.** Flashy and loud throughout.
- **Fonts:** system rounded stack only (`Baloo 2` → `Comic Sans MS` → `Chalkboard SE` →
  `Trebuchet MS`). No external font loading (keeps it pure-static / file://-safe).
- **Logo:** "Pauls Spielecke" wordmark — chunky 3D gold "Spielecke" with a black outline
  and a red handwritten "Pauls" on top. Lives at `assets/logo.svg` (scalable, transparent
  background), used in the header, page title, and favicon. Currently an SVG recreation of
  Paul's artwork; swap in a traced/raster version later for pixel-perfect fidelity.

---

## Part 1 — The Shell

The app skeleton: home screen, shared player roster, game registry, and the contract every
game module implements.

### 1.1 Screens

1. **Home / Game Shelf** — brand header + a responsive grid of game cards (icon, name,
   tagline, player-count hint, drinking-game marker). Tap a card → that game.
2. **Players / Roster (app-level, shared by all games)** — add / remove / reorder (up/down
   buttons) players by name. Persists to localStorage, reused by every game. Soft
   minimum-count warning (warn, don't block). The single most important shared piece.
3. **Game screens** — owned by each game module (see contract).
4. **Settings** — not built yet (language toggle, reset stats). Stub later.

Persistent header shows the roster size with an "Edit players" button, on every screen.

### 1.2 File structure

```
index.html                 single entry; ordered classic <script> tags; relative paths
styles/main.css            the whole Spielecke theme (mobile-first, responsive)
js/
  store.js                 localStorage: shared roster + per-game namespaced store
  registry.js              GAMES array the shelf renders
  shell.js                 router, header, mount/unmount, builds the game context
  shelf.js                 home / game-card grid
  roster.js                players screen
  content/                 DATA ONLY (no logic) — easy to edit
    terms.js               SHARED single-term DB (Who Am I?, Imposter, Doodle Drama)
    bomb-prompts.js        The Bomb's category prompts
    wavelength.js          Wavelength's opposite pairs
    nhie.js                Never Have I Ever prompts
    most-likely.js         Most Likely To prompts
    numbers.js             Liar's Numbers question/answer bank
    princess.js            Princess Treatment prompts (by category × gender)
    activity.js            Activity words, tiered by points (2/3/4)
    quiz.js                Quiz Out questions, an array of difficulty levels
  games/                   one module per game (logic)
    bomb.js  whoami.js  imposter.js  wavelength.js
    nhie.js  mostlikely.js  liars.js  princess.js  doodle.js  activity.js  quiz.js
assets/logo.svg            the "Pauls Spielecke" wordmark
```

**Adding a game** = drop a module in `js/games/`, add any content file in `js/content/`,
add the two `<script>` tags to `index.html`, and append one entry in `registry.js`.

### 1.3 Game Module Contract

Each game is a self-contained object on `window.Spielecke.Games.<id>` exposing:

- `meta` — `{ id, name, tagline, icon, minPlayers, supportsDrinking }`. `supportsDrinking`
  means the game offers an optional drinking-mode toggle — not that it's always a drinking
  game. The registry builds its entry straight from this so the two never drift.
- `mount(container, context)` — render into the given DOM node.
- `unmount()` — tear down: clear **all** timers/intervals and close any audio. Critical.

`context` provided by the shell:

```js
{
  players: [{ id, name }, ...],   // read-only copy of the shared roster
  store: { get(key, fallback), set(key, value) },  // localStorage namespaced to game id
  goHome(),                        // return to the shelf (triggers unmount)
}
```

Rules:
- A game **must not** reach global state except through `context` (content data on
  `window.Spielecke.*` is the one allowed read — it's static data, not app state).
- A game **must** clean up all timers/audio on `unmount()` — the shell calls `unmount()`
  before every navigation.
- Content lives in `js/content/`, separated from logic, so it can be edited by a non-coder
  (future Paul, half-drunk).

### 1.4 Persistence (`store.js`)

- `Store.rosterGet()` / `Store.rosterSet(players)` — shared roster (`spielecke.roster`).
- `Store.gameStore(id)` → `{ get, set }` namespaced `spielecke.game.<id>.<key>`. Generic
  enough to hold future cross-game stats/leaderboard without redesign.
- All access try/catch-wrapped; falls back to an in-memory map if localStorage is blocked.

### 1.5 Shell Acceptance Criteria

- Loads from `file://` and a GitHub Pages subpath with no broken paths (relative throughout).
- Roster survives refresh.
- Navigating into a game and back works cleanly — no leaked timers, no stale DOM.
- Correct on iPhone-width and laptop.

---

## Part 2 — Content architecture

Two shapes of content, by what the game needs:

- **Shared single-term database** (`js/content/terms.js` → `Spielecke.Terms`): single
  names/words/things that work to describe, hint at, *and* draw. Used by **Who Am I?**,
  **Imposter**, and **Doodle Drama** so terms are managed in one place. Pools: `party`,
  `famous`, `nsfw`, `insideJokes`; each `{ label, terms: [...] }`. "Mixed" draws across all.
- **Per-game content** when the shape differs:
  - The Bomb → category *prompts* (`bomb-prompts.js`, `{ label, prompts }`).
  - Wavelength → *opposite pairs* (`wavelength.js`, `{ label, pairs:[{left,right}] }`).
  - Never Have I Ever / Most Likely To → *sentence predicates* (`nhie.js`, `most-likely.js`,
    `{ label, prompts }`) — separate because the grammar differs from each other.
  - Liar's Numbers → *numeric Q&A* (`numbers.js`, `{ label, questions:[{q,a}] }`).
  - Princess Treatment → *gendered prompts* (`princess.js`, `{ label, princess:[], king:[] }`).
  - Activity → *point-tiered words* (`activity.js`, `{ 2:{label,words}, 3:…, 4:… }`),
    type-agnostic — the field decides how you perform, the points decide difficulty.
  - Quiz Out → *levelled multiple-choice* (`quiz.js`, an array of levels; each question
    `{ q, options:[4], answer:index }`). Options are shuffled on screen.

Inside-jokes and the spiciest NSFW entries are left as clearly-marked `[placeholders]` for
Paul to fill.

---

## Part 3 — Games

Outcomes below are the **plain** (default) framing. For drinking-capable games, the
🍻 toggle swaps the resolution wording to drinks.

### 3.1 The Bomb 💣 (`bomb`, 3+) — drinking-capable

Hot-potato. A category prompt shows; the device is the bomb. Holder names an answer, taps
the big **Pass**, hands the phone on. A hidden fuse counts down.

- **Pass model:** pure physical pass — the app runs the fuse only, doesn't track turns.
- **Fuse:** always random **20–120s**, hidden. Cosmetic accelerating tick; detonation on a
  precise timer. Web Audio explosion + haptics.
- **Config:** category pool, sound on/off, 🍻 drinking mode. Persisted.
- **Outcome:** holder at detonation **loses the round** (drinking mode: drinks).

### 3.2 Most Likely To 🫵 (`mostlikely`, 3+) — drinking-capable

Pointing deck. Card shows "Most likely to ___"; on 3-2-1 everyone points.

- **Config:** category pool, 🍻 drinking mode.
- **Outcome:** most fingers takes the **crown 👑** (drinking mode: drinks). Pointing/counting
  is physical; the app shows the prompt + call.

### 3.3 Never Have I Ever 🙊 (`nhie`, 2+) — drinking-capable

Confession deck. Card shows "Never have I ever ___".

- **Config:** category pool, 🍻 drinking mode.
- **Outcome:** anyone who's done it **owns up** (drinking mode: drinks).

### 3.4 Who Am I? 🙈 (`whoami`, 2+) — plain

Heads-Up style. Phone on the forehead; the table shouts clues. **GOT IT** / **SKIP** against
a visible countdown.

- **Config:** category pool (shared Terms), round length (30/60/90s), sound.
- **Outcome:** pure score — "You got N right!" (beat 3 for a 🎉).

### 3.5 Imposter 🕵️ (`imposter`, 3+) — plain

Hidden roles on one device. Everyone gets the same secret word except one random
**imposter**, who only sees the category. Pass to reveal each role privately (shared roster
for order + names), then discuss, vote, unmask.

- **Config:** word pool (shared Terms).
- **Outcome:** caught → the table wins; fooled → the imposter wins.

### 3.6 Wavelength 📡 (`wavelength`, 3+) — plain

A spectrum between two opposites (e.g. Cold ↔ Hot). A **clue-giver** secretly sees a hidden
target band and gives a clue; the rest slide a dial to guess.

- **Config:** spectrum pool.
- **Outcome:** closeness **score** (0–100). Bullseye ±10, miss beyond ±30.

### 3.7 Liar's Numbers 🔢 (`liars`, 2+) — drinking-capable

Numeric guessing on one device. A question with a number answer shows; the phone passes
round and each player privately locks a guess; reveal sorts by distance. Uses the roster.

- **Config:** question pool, 🍻 drinking mode.
- **Outcome:** closest **wins 🏆**, furthest **loses 💀** (drinking mode: furthest drinks).

### 3.8 Princess Treatment 👑 (`princess`, 1+) — plain

Debate deck. Each round shows a thing a partner does; the table decides Princess Treatment
👑 or Bare Minimum 😐. The target **alternates every round** between Princess (for the women)
and King (for the men), with gender-specific prompts by category.

- **Config:** category pool.
- **Outcome:** none — it's a hot-takes / debate generator. No winner, no drinks.

### 3.9 Doodle Drama 🎨 (`doodle`, 2+) — plain

Drawing telephone. A secret word (shared Terms) goes to player 1, who **draws** it; player 2
**guesses** from the drawing; player 3 draws that guess; and so on down the roster. Reveal
the whole chain at the end.

- **Tech:** HTML5 `<canvas>` + Pointer Events → same code for mouse (laptop) and finger
  (mobile). Drawings kept in memory for the session (not localStorage — too big).
- **Config:** word pool.
- **Outcome:** none — reveal the carnage for laughs.

### 3.10 Activity 🗺️ (`activity`, 4+) — plain

Two teams race along a map. Each field is a type shown by **icon + colour, never words**:
💬 explain · ✏️ draw · 🎭 charade. On your turn you're on a field of one type; pick a
**2/3/4-point** word; one team member performs it that way while their team guesses, against
a fixed **60s** clock. Guess in time → move forward by the point value. First team to the
finish 🏆 wins.

- **Teams:** two, each a "figure" token (tap to change) that moves along the board. If a
  roster exists, a suggested split is shown with a 🔀 shuffle.
- **Board:** 14 typed fields + finish, randomised each game. Responsive — compact wrapping
  tiles on mobile, a roomier two-column layout (board beside controls) on desktop.
- **Config:** team figures (persisted). Words tiered by points (`activity.js`).
- **Outcome:** first team to complete the map wins. Not a drinking game.

### 3.11 Quiz Out 🧠 (`quiz`, 2+) — drinking-capable

Turn-based knockout quiz. Players take turns answering a 4-option question; a wrong answer
costs a life. After every full round (each survivor has answered once) the difficulty climbs
a level. Lose all hearts → out; last player standing wins. Uses the roster for turn order +
per-player lives.

- **Config:** hearts each (1–5, default 3), 🍻 drinking mode (wrong = drink too). Persisted.
- **Flow:** "Pass to [Name]" (lives shown) → question + 4 shuffled options → correct = safe,
  wrong = −1 heart (and drink in drinking mode) → next player; difficulty rises each round.
- **Outcome:** last survivor wins.

---

## Resolved decisions

1. **App name + identity** → **Pauls Spielecke**, playground/toy-box look + logo, NSFW
   content (see Part 0 visual identity).
2. **Not every game is a drinking game.** Games are plain by default; drinking-capable ones
   expose a 🍻 toggle (off by default) that swaps the resolution to drinks. Don't add drink
   penalties where they don't fit. Drinking-capable: Bomb, Most Likely To, Never Have I
   Ever, Liar's Numbers, Quiz Out.
3. **The Bomb pass model** → pure physical pass (no turn tracking).
4. **The Bomb fuse** → always random 20–120s, not configurable.
5. **Mobile vs desktop** → single responsive build, no separate files. Drawing (Doodle
   Drama) via canvas + Pointer Events works on both.
6. **Module loading** → ordered classic `<script>` tags (no ES modules) for `file://`.
7. **Content management** → shared single-term DB for games that fit; per-game files for
   different shapes (prompts, pairs, numbers, gendered prompts).
8. **Stats/leaderboard** → not built, but `store.gameStore(id)` is namespaced so it can be
   added later without redesign.

---

## Roadmap — candidate next games

Each a distinct mechanic so the night doesn't feel samey. Confirm / reorder / replace:

- **Higher or Lower** — themed fact chain, group votes by shouting, wrong = out (or drink).
- **Countdown Roulette** — random player picker assigns a themed task or drink.
- **Odd-One-Out** — reflex flash-grid filler.
- **Truth or Drink** — random player → a truth or take the drink.

### Open content TODO (Paul)

- `content/terms.js` → fill `nsfw` and `insideJokes` pools.
- `content/bomb-prompts.js` → fill `insideJokes`.
- `content/wavelength.js` → fill `spicy` and `insideJokes` pairs.
- `content/nhie.js`, `content/most-likely.js` → fill `nsfw` and `insideJokes`.
- `content/numbers.js` → fill `insideJokes` with real group stats.
- `content/princess.js` → fill `nsfw` (princess + king).
- `content/activity.js` → fill the hard tier `[placeholders]`.
