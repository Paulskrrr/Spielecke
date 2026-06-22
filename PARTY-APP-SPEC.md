# Party Game App — Build Spec

A self-owned, group-specific party-game collection. Splash-like aggregator, but every
game is filled with our own terms, rules, references, and design. Lives permanently on a
GitHub Pages link, gets new games added over time. Built to outlast any single event.

This document is the brief for Claude Code. **Build order: the shell + game shelf first
(this doc, Part 1), then games one at a time (The Bomb spec'd here in Part 2).**

---

## Part 0 — Principles & Constraints

- **Pure static.** No backend, no external service, no signup, no realtime sync. Works
  opened from a `file://` path, from GitHub Pages, on a MacBook, and on any phone via the
  published link. Each person can also just open the link independently.
- **One device at a time / shared screen.** Games are designed for a MacBook on the table
  or a phone passed around. No cross-device networking. (This was a deliberate decision —
  the "everyone connected on their own screen" magic requires a broker/backend, which we
  ruled out.)
- **Scales to ~10, flexible.** Player count should never be load-bearing. Games work from
  ~3 up to ~12 without special-casing.
- **Every game has a clean win/loss or drink outcome** so any of them doubles as a drinking
  game. This is a hard requirement, not a nice-to-have.
- **Content carries the theme, not code.** Group jokes, MMA, World Cup, our topics — all
  live in editable data (word pools, question banks), never hardcoded into game logic.
  This is what makes new content cheap to add.
- **Language: English for UI and shell now.** Individual games may later carry an English
  *or* German word pool (or both, switchable). Build content structures so a game can hold
  multiple language pools without code changes.
- **Vanilla JS / HTML / CSS.** No framework required. Light bundling is fine. Mobile-first
  responsive — must look right on a phone and on a laptop.
- **Persistence via localStorage only** (player list, stats, last-used settings). No other
  storage. Degrade gracefully if localStorage is unavailable.

---

## Part 1 — The Shell (build this first)

The shell is the app skeleton: a home screen, a shared player roster, a game registry, and
the contract that every game module implements. Ship the shell with **zero games wired in
beyond a placeholder**, confirm navigation + roster + persistence work, then add The Bomb.

### 1.1 Screens

1. **Home / Game Shelf**
   - Title/brand for the app (placeholder name `[APP NAME TBD]` — Paul to decide).
   - A grid of game cards. Each card: icon/emoji, game name, one-line tagline, player-count
     hint, and a "drinking-game ✓" marker.
   - Tapping a card → that game's setup or directly into the game.
   - Persistent header element showing the current roster size with an "Edit players" button.

2. **Players / Roster (app-level, shared by all games)**
   - Add / remove / reorder players (names only).
   - Roster persists in localStorage and is reused by every game — entered once, used
     everywhere. This is the single most important shared piece.
   - Minimum sensible count enforced softly (warn, don't block).

3. **Game screens** — owned by each game module (see contract below).

4. **(Optional, later) Settings** — language pool toggle, reset stats, etc. Stub only for now.

### 1.2 Game Registry

A single array/object the shell reads to render the shelf. Adding a game = adding one entry
+ dropping in its module. Example shape (illustrative, refine as needed):

```js
const GAMES = [
  {
    id: "bomb",
    name: "The Bomb",
    tagline: "Name it fast, pass it faster. Don't be holding it when it blows.",
    icon: "💣",
    minPlayers: 3,
    isDrinkingGame: true,
    module: BombGame,   // implements the Game Module Contract
  },
  // future games appended here
];
```

### 1.3 Game Module Contract

Every game is a self-contained module the shell can mount and unmount. Define a clear,
minimal interface so game #2..#10 are pure drop-ins. At minimum each module exposes:

- `mount(container, context)` — render into the given DOM node. `context` provides the
  shared roster, a persistence helper scoped to the game's `id`, and a `goHome()` callback.
- `unmount()` — tear down, clear timers/listeners. Critical for the reflex/timer games.
- `meta` — the registry fields above (or the registry references them).

`context` shape (illustrative):

```js
{
  players: [{ id, name }, ...],   // current shared roster, read-only copy
  store: {                         // localStorage namespaced to this game's id
    get(key, fallback), set(key, value)
  },
  goHome(),                        // return to the shelf
}
```

Rules for modules:
- A game **must not** reach into global state except through `context`.
- A game **must** clean up all timers/intervals/audio on `unmount()`.
- A game **owns its own content data** (word pools / banks) in a clearly separated,
  easily-editable structure — ideally a separate data file or a top-of-module constant,
  so non-coders (future Paul, half-drunk) can edit content without touching logic.

### 1.4 Shell Acceptance Criteria

- Loads from `file://` and from a GitHub Pages subpath without broken asset paths
  (use relative paths throughout).
- Roster survives refresh.
- Navigating into the placeholder game and back to the shelf works cleanly, no leaked
  timers or stale DOM.
- Looks correct on iPhone-width and on a laptop.

---

## Part 2 — Game #1: The Bomb

### 2.1 Concept

A hot-potato word game. A **category** appears on screen ("Footballers who've played for
Barça"). The device is the bomb. The active player says one valid answer out loud, taps
**Pass**, and hands the device to the next player. A hidden, randomised fuse is counting
down. Whoever is holding the device when the fuse runs out **loses the round and drinks.**

Viciously simple, scales to any number, and every drop of theme lives in the category list.

### 2.2 Flow

1. From the shelf → The Bomb. Roster is already known from the shell.
2. **Round setup:** pick a category — random by default, with an option to pick manually
   or to draw from a chosen pool (e.g. "Football", "MMA", "Inside Jokes", "General").
3. **Arm the bomb:** big "Start" button. On start:
   - A fuse timer begins, **length randomised within a configurable range** (e.g. 15–45s)
     and **hidden from players** — tension comes from not knowing.
   - The current category is displayed large and legible across the table.
   - Optional: a ticking sound that subtly accelerates (respect an audio on/off toggle;
     must be silenceable; clean up on unmount).
4. **Play:** active player says an answer, taps a large **Pass** button → device passed
   physically to next player. The app does not validate answers (humans police that out
   loud — keep it social). Optionally track whose turn via the roster for the loser
   callout, or keep it purely physical — see open question.
5. **Detonation:** when the fuse hits zero → loud/visual explosion. The holder loses.
   - If turn-tracking is on, name the loser ("🔥 [Name] drinks!").
   - Offer **Next round** (new random category, new random fuse) and **Back to shelf**.

### 2.3 Content Structure

Categories grouped into pools so theme is editable and language-switchable later:

```js
const BOMB_CATEGORIES = {
  football: [
    "Footballers who've played for Barça",
    "World Cup winning nations",
    "Bundesliga clubs",
    // ...
  ],
  mma: [
    "Ways to win a fight by stoppage",
    "UFC weight classes",
    "McGregor opponents",
    // ...
  ],
  insideJokes: [
    "[Paul fills these in — the gold lives here]",
  ],
  general: [
    "Pizza toppings",
    "Things in this room",
    // ...
  ],
};
```

Leave the inside-jokes and themed pools mostly empty with clear placeholders — Paul fills
them. The build just needs ~5 real entries per pool to be testable.

### 2.4 Configurables (sensible defaults, easy to change)

- Fuse range min/max (default 15–45s).
- Whether fuse acceleration / sound is on (default on, toggleable).
- Category pool selection (default: all pools mixed, random draw).
- Turn/loser tracking on or off (see open question).

### 2.5 The Bomb — Acceptance Criteria

- Fuse length genuinely random each round and not visible to players.
- Pass button is large, thumb-friendly, hard to misfire.
- Explosion is unmistakable (visual + optional sound).
- A full loop — start → pass several times → detonate → next round — works with no leaked
  timers, and `unmount()` kills the fuse and any audio immediately.
- Works one-handed on a phone passed around the table.

---

## Open Questions for Paul (resolve before/while building each part)

1. **App name + visual identity.** What's the brand? Any aesthetic direction (the blackjack
   game had a 1950s jazz-lounge look — same universe, or distinct)?
2. **The Bomb — turn tracking on or off?** Pure physical pass (app doesn't know who holds
   it) is simpler and more social; turn-tracking lets the app name the loser and could feed
   a stats/leaderboard. Which do you want for v1?
3. **Stats/leaderboard across games** — in scope eventually? If yes, the persistence helper
   in the contract should be designed for it now even if unused.
4. **Next 3–4 games to slot in** after The Bomb. Current shortlist (each a distinct
   mechanic so the night doesn't feel samey):
   - **Liar's Numbers** — all-number bluff (dodges the bilingual "tell" problem). Real stat
     question, everyone says a fake number aloud, closest wins, furthest drinks.
   - **Higher or Lower** — themed fact chain, group votes by shouting, wrong = drink.
   - **Countdown Roulette** — random player picker assigns a themed task or drink.
   - **Odd-One-Out** — reflex flash-grid filler for between fight rounds.
   Confirm/reorder/replace.
