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

**Shipped (on `main`):**

- ✅ The shell — home/game shelf, shared roster, registry, game module contract, persistence
- ✅ **The Bomb** — hot-potato word game
- ✅ **Who Am I?** — Heads-Up / forehead guessing
- ✅ **Imposter** — hidden-role secret word
- ✅ **Wavelength** — spectrum/dial guessing
- ✅ Shared term database for single-term games
- ✅ Full "Spielecke" playground/toy-box visual identity

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
- **Every game has a clean win/loss or drink outcome** so any of them doubles as a drinking
  game. Hard requirement. (See each game's "Drink outcome" below.)
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
    terms.js               SHARED single-term DB (Who Am I?, Imposter)
    bomb-prompts.js        The Bomb's category prompts
    wavelength.js          Wavelength's opposite pairs
  games/                   one module per game (logic)
    bomb.js  whoami.js  imposter.js  wavelength.js
```

**Adding a game** = drop a module in `js/games/`, add any content file in `js/content/`,
add the two `<script>` tags to `index.html`, and append one entry in `registry.js`.

### 1.3 Game Module Contract

Each game is a self-contained object on `window.Spielecke.Games.<id>` exposing:

- `meta` — `{ id, name, tagline, icon, minPlayers, isDrinkingGame }`. The registry builds
  its entry straight from this so the two never drift.
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
  names/words/things that work both as something you describe *and* something you hint at.
  Used by **Who Am I?** and **Imposter** so terms are managed in one place. Pools: `party`,
  `famous`, `nsfw`, `insideJokes`; each `{ label, terms: [...] }`. "Mixed" draws across all.
- **Per-game content** when the shape differs:
  - The Bomb → category *prompts* (`bomb-prompts.js`, `{ label, prompts }`).
  - Wavelength → *opposite pairs* (`wavelength.js`, `{ label, pairs:[{left,right}] }`).

Inside-jokes and the spiciest NSFW entries are left as clearly-marked `[placeholders]` for
Paul to fill.

---

## Part 3 — Games

### 3.1 The Bomb 💣 (`bomb`, 3+ players)

Hot-potato. A category prompt shows; the device is the bomb. Holder says an answer out
loud, taps the big **Pass**, hands the phone on. A hidden fuse counts down.

- **Pass model:** PURE PHYSICAL PASS (decided). The app runs the fuse only; it does **not**
  track whose turn it is, so it can't name the loser — humans handle the handoff.
- **Fuse:** always random between **20s and 120s** (decided — no longer configurable),
  hidden from everyone. A cosmetic tick accelerates as it burns; detonation is driven by a
  precise timer.
- **Config:** category pool (default Mixed) and sound on/off. Persisted.
- **Detonation:** big visual + Web Audio explosion + haptics → "🔥 Whoever's holding it
  drinks!" → Next round / Change settings / Back to shelf.
- **Drink outcome:** holder at detonation drinks.

### 3.2 Who Am I? 🙈 (`whoami`, 2+ players)

Heads-Up style. Phone on your forehead (you can't see it); the table shouts clues. Tap
**GOT IT** or **SKIP** against a visible countdown.

- **Config:** category pool (shared Terms, default Mixed), round length (30/60/90s), sound.
- **Drink outcome:** score fewer than **3** correct in your turn → you drink.
- Web Audio blips/buzzer (toggleable); timer + audio torn down on unmount.

### 3.3 Imposter 🕵️ (`imposter`, 3+ players)

Hidden roles on one device. Everyone gets the same secret word except one random
**imposter**, who only sees the category. Pass the phone so each player reveals their role
privately (uses the shared roster for the pass order + names), then discuss, vote, unmask.

- **Config:** word pool (shared Terms, default Mixed). Persisted.
- **Flow:** Deal → per-player "Pass to [Name]" → reveal role → hide → … → discussion →
  reveal imposter → outcome.
- **Drink outcome:** imposter caught → imposter drinks; imposter fooled the table →
  everyone else drinks.

### 3.4 Wavelength 📡 (`wavelength`, 3+ players)

A spectrum between two opposites (e.g. Cold ↔ Hot). One **clue-giver** secretly sees a
hidden target band on the dial and gives a one-line clue; the rest move a slider to guess.

- **Config:** spectrum pool (`wavelength.js`, default Mixed). Persisted.
- **Flow:** handover ("clue-giver only, everyone look away") → see target band → give clue
  → hide → table slides the dial → lock in → reveal target vs guess → outcome.
- **Drink outcome:** bullseye (within ±10) → clue-giver's a legend, everyone else drinks;
  way off (beyond ±30) → the guessers drink; in between → no drinks.

---

## Resolved decisions

1. **App name + identity** → **Spielecke**, playground/toy-box look, NSFW content (see
   Part 0 visual identity).
2. **The Bomb pass model** → pure physical pass (no turn tracking).
3. **The Bomb fuse** → always random 20–120s, not configurable.
4. **Mobile vs desktop** → single responsive build, no separate files.
5. **Module loading** → ordered classic `<script>` tags (no ES modules) for `file://`.
6. **Content management** → shared single-term DB for games that fit; per-game files for
   different shapes (prompts, pairs).
7. **Stats/leaderboard** → not built, but `store.gameStore(id)` is namespaced so it can be
   added later without redesign.

---

## Roadmap — candidate next games

Each a distinct mechanic so the night doesn't feel samey. Confirm / reorder / replace:

- **Liar's Numbers** — all-number bluff (dodges the bilingual "tell" problem). Real stat
  question, everyone says a fake number aloud, closest wins, furthest drinks.
- **Higher or Lower** — themed fact chain, group votes by shouting, wrong = drink.
- **Countdown Roulette** — random player picker assigns a themed task or drink.
- **Odd-One-Out** — reflex flash-grid filler.

### Open content TODO (Paul)

- `content/terms.js` → fill `nsfw` and `insideJokes` pools.
- `content/bomb-prompts.js` → fill `insideJokes`.
- `content/wavelength.js` → fill `spicy` and `insideJokes` pairs.
