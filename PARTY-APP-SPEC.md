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

**Shipped (on `main`):** the shell + **27 games**.

- ✅ The shell — home/game shelf, shared roster, registry, game module contract, persistence
- ✅ Full "Pauls Spielecke" playground/toy-box visual identity + logo
- ✅ Shared term database for single-term games + optional drinking-mode toggle
- ✅ **Hot Potato** — hot-potato word game *(drinking-capable)*
- ✅ **Most Likely To** — pointing deck *(drinking-capable)*
- ✅ **Never Have I Ever** — confession deck *(drinking-capable)*
- ✅ **Who Am I?** — Heads-Up / forehead guessing
- ✅ **Imposter** — hidden-role secret word (+ optional hints & a 🔔 Buzzer seconds-guess mode) *(drinking-capable)*
- ✅ **Wavelength** — spectrum/dial guessing
- ✅ **Ballpark** (DE: *Pi mal Daumen*) — numeric estimation; closest guess wins *(drinking-capable)*
- ✅ **Princess Treatment** — King/Princess debate deck
- ✅ **Doodle Drama** — drawing telephone (canvas)
- ✅ **Activity** — two-team board race (explain / draw / charade) *(drinking-capable)*
- ✅ **Quiz Out** — turn-based knockout quiz *(drinking-capable)*
- ✅ **Truth or Drink** — random-player truth deck *(drinking-capable)*
- ✅ **Chooser** — spinning-wheel random person picker *(drinking-capable)*
- ✅ **Reaction Duel** — two-player split-screen reflex duel *(drinking-capable)*
- ✅ **Rank It** — privately rank the same set; drift from the group's consensus loses *(drinking-capable)*
- ✅ **Hochadel** — royal-court action-card game; cards command who must *dienen* *(drinking-capable)*
- ✅ **Mia** (a.k.a. Mäxchen) — bluffing dice under a hat, passed around *(drinking-capable)*
- ✅ **Ride the Bus** — four-guess card gauntlet *(drinking-capable)*
- ✅ **Fuck the Dealer** — guess-the-rank card game with dealer rotation *(drinking-capable)*
- ✅ **Horse Race** — animated suit-betting card race *(drinking-capable)*
- ✅ **Zeitzünder** — asymmetric co-op bomb defusal: one screen is the bomb, the others hold the manual *(plain)*
- ✅ **Ballon** — push-your-luck pump-or-pass, hidden burst point scaled to the table *(drinking-capable)*
- ✅ **Wettbüro** — bet sips on a friend's challenge; the app settles the stakes *(drinking-capable)*
- ✅ **Mind Meld** — 2s (or a trio) silently converge on the same word; slowest team drinks *(drinking-capable)*
- ✅ **Geheimauftrag** — person-bound secret missions that run quietly alongside whatever you play next; dealt from a 🕶️ button on the Players screen, not a shelf tile *(drinking-capable)*
- ✅ **Simon Says** (DE: *Kommando*) *(beta)* — a speaking, accelerating Simon-Says caller; the table judges who slipped *(drinking-capable)*
- ✅ **Geschmacklos** — a Cards Against Humanity mode: host shows the prompt, every phone deals itself a disjoint hand off one shared table code *(drinking-capable)*
- ✅ **Lügen** (Cheat / Bullshit) *(beta)* — bluffing card classic: the app deals every hidden hand, you lie about the cards you lay face down, get caught and eat the pile *(drinking-capable)*

**Bilingual:** the whole UI + content runs in German (default) or English, toggled on the
Players screen.

**Next:** more games (see Roadmap), optional settings/stats screen.

---

## Part 0 — Principles & Constraints

- **Pure static.** No backend, no external service, no signup, no realtime sync. Works
  opened from a `file://` path, from GitHub Pages, on a MacBook, and on any phone via the
  published link. Each person can also just open the link independently.
- **One device at a time / shared screen.** Games are designed for a MacBook on the table
  or a phone passed around. No cross-device networking. (Deliberate — the "everyone on
  their own screen" magic needs a broker/backend, which we ruled out.) **Zeitzünder** stretches
  this without breaking it: two *kinds* of screen (the bomb on the table, experts' manuals on
  their phones) that never talk to each other — each is an independent static instance, and the
  players bridge them by voice. Still no broker, still no sync; the asymmetry does the work.
  **Geschmacklos** applies the same no-broker idea to dealing cards: a short shared **table
  code** seeds an identical deterministic shuffle (`Spielecke.seededShuffle`, mulberry32 +
  FNV-1a hash) on every phone, so each seat's hand is mathematically guaranteed disjoint from
  every other seat's — no server ever hands out a card, every phone just computes the same
  answer independently.
- **Scales to ~10, flexible.** Player count is never load-bearing. Games work from ~3 up to
  ~12 without special-casing.
- **Every game has a clean win/lose/score outcome.** Games are **plain by default** — not
  everything is a drinking game. Games where it *fits* expose an optional **🍻 Drinking
  mode** toggle in their setup (off by default, persisted); turning it on swaps the
  resolution to "who drinks." Don't bolt a drink penalty onto a game where it doesn't fit.
- **Fewer elements, clean focus.** Default to one *fewer* button or line of text, never one
  more. Where it reads naturally, the design element *is* the action — tap the card, the
  wheel, the hat — instead of a separate button beneath it (`Spielecke.tappable`). Cut
  redundant labels, duplicate "back" buttons, and text that restates what's already on
  screen. Each screen should present a single, obvious next action.
- **Content carries the theme, not code.** Group jokes, MMA, our topics — all live in
  editable data files, never hardcoded into game logic. New content is cheap to add.
- **Bilingual (DE / EN), German by default.** UI strings live in `i18n.js` (`Spielecke.t`),
  toggled on the Players screen and persisted. Content files are `{ de, en }` bundles read
  through `Spielecke.L(...)`; language-neutral decks (proper-noun term pools) share one list —
  except where a pool mixes in language-dependent concept terms (e.g. football's *Offside* /
  *Abseits*), which are localised per language.
  Adding a string or a pool stays a data-only change.
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
  and a red handwritten "Pauls" on top. Lives at `assets/logo.png` (transparent
  background), used in the header, page title, and favicon. Cropped tight from Paul's
  uploaded artwork with the white background keyed out. The header logo also has a
  shapeless button-y press (the wordmark dips on tap — no box/outline).
- **Micro-interactions:** every pressable shares one springy release curve (`--spring`) —
  instant press-down, a small overshoot on release; a light `navigator.vibrate` tick fires
  on touch-down (delegated once in `ui.js`, `Spielecke.haptic`); the shelf tiles cascade in
  on a capped per-tile stagger; native checkboxes are restyled as toy switches; buttons/chips/
  cards/inputs carry focus-visible rings. The **shelf tile palette** is a 9-colour crayon set;
  each game has a **fixed colour** — three pinned by preference (Hochadel yellow, Doodle Drama
  blue, Imposter red) — set in the registry
  `LAYOUT` (`gc-<colour>` classes) and a 7-step tilt by grid position (`gt-*`, `i % 7`). The **26 shelf tiles**
  (Geheimauftrag isn't on the shelf — see §3.25) sweep the full 9-colour palette in blocks of
  **9 / 9 / 8**, each block showing every hue at most once, so no colour repeats before the
  whole palette has appeared; within that no two neighbours (distance 1–3, i.e.
  horizontal + the 2/3-column verticals) share a hue *or a close family* (teal/green,
  blue/indigo, red/pink, yellow/orange). The app caps at ~3 columns (`--maxw: 880px`). The **shelf order is fixed** too (the `LAYOUT` array order): tiles land in the
  same spot every visit. It stays **one continuous grid — no section headers** — but games are
  grouped by vibe, with the boozier/active games first so a drinking night finds them up top
  (quick social → party guessing → simple card/luck drinking → reflex → longer sit-down &
  team → co-op); **BETA games sink to the bottom** (Kommando is the last tile). The home bar is a
  solid-purple app-bar lifted with a soft drop shadow. All of the above honours
  `prefers-reduced-motion`.
- **Intro splash:** on **every** open the logo shows in a game-tile-style card on a yellow
  field, then rolls up like a blind after ~0.5 s to reveal the shelf already rendered behind it
  (`shell.runSplash`). A **CSS-only fail-safe** rolls the splash up after ~1.6 s even if boot JS
  never runs, so it can never trap the app behind it.

---

## Part 1 — The Shell

The app skeleton: home screen, shared player roster, game registry, and the contract every
game module implements.

### 1.1 Screens

1. **Home / Game Shelf** — brand header + a responsive grid of game cards (icon, name,
   tagline, player-count hint, drinking-game marker). Tap a card → that game.
2. **Players / Roster (app-level, shared by all games)** — add / remove / reorder (up/down
   buttons) players by name. Persists to localStorage, reused by every game. Soft
   minimum-count warning (warn, don't block). The single most important shared piece. Also
   hosts the DE/EN language toggle and a discreet 🕶️ launcher for **Geheimauftrag** (§3.25),
   the one game that isn't on the shelf.
3. **Game screens** — owned by each game module (see contract).
4. **Settings** — not built yet (language toggle, reset stats). Stub later.

Persistent header shows the roster size with an "Edit players" button, on every screen.

### 1.2 File structure

```
index.html                 single entry; ordered classic <script> tags; relative paths
styles/main.css            the whole Spielecke theme (mobile-first, responsive)
js/
  store.js                 localStorage: shared roster + per-game namespaced store
  i18n.js                  DE/EN strings (Spielecke.t) + content-bundle picker (Spielecke.L)
  ui.js                    shared helpers: tappable() + the HTML escapers (esc / attr)
  pools.js                 multi-select category-pool chips + draw-time guard
  registry.js              GAMES array the shelf renders
  shell.js                 router, header, mount/unmount, builds the game context
  shelf.js                 home / game-card grid
  roster.js                players screen + DE/EN language toggle
  content/                 DATA ONLY (no logic) — bilingual { de, en } bundles
    terms.js               SHARED single-term DB (Who Am I?, Imposter, Doodle Drama)
    imposter-hints.js      Imposter's optional cryptic decoy hints (per word)
    hotpotato-prompts.js   Hot Potato's category prompts
    wavelength.js          Wavelength's opposite pairs
    nhie.js / most-likely.js / truth.js   sentence-predicate decks
    numbers.js             Ballpark (Pi mal Daumen) question/answer bank
    princess.js            Princess Treatment prompts (by category × gender)
    activity.js            Activity words, tiered by points (2/3/4)
    quiz.js                Quiz Out questions, an array of difficulty levels
    rankit.js              Rank It sets ({ label, sets:[{ title, items }], people:[{ title }] })
    hochadel.js            Hochadel deck + ground rules + verses, tagged per edition
    wettbuero.js           Wettbüro challenges, by category ({ label, challenges:[{text,timer?}] })
    mindmeld.js            Mind Meld seed-word pools ({ label, words:[...] })
    geheimauftrag.js       Geheimauftrag mission templates ({ solo:[...], coop:[...] }, {target}/{partner} tokens)
    simon.js               Simon Says command pools ({ label, commands:[...] })
    geschmacklos.js        Geschmacklos deck, one fixed set ({ prompts:[...], answers:[...] })
  games/                   one module per game (logic)
    hotpotato.js  whoami.js  imposter.js  wavelength.js  nhie.js  mostlikely.js
    liars.js  princess.js  doodle.js  activity.js  quiz.js  truth.js  chooser.js
    reactionduel.js  rankit.js  hochadel.js  maxchen.js  zeitzunder.js
    ballon.js  wettbuero.js  mindmeld.js  geheimauftrag.js  simon.js  geschmacklos.js
    cards.js  busfahrt.js  fuckdealer.js  pferderennen.js   (card games; cards.js = shared deck)
    (chooser, reactionduel, maxchen, zeitzunder & ballon have no content file)
assets/logo.png            the "Pauls Spielecke" wordmark
```

**Adding a game** = drop a module in `js/games/`, add any content file in `js/content/`,
add the two `<script>` tags to `index.html`, and append one entry in `registry.js`.

### 1.3 Game Module Contract

Each game is a self-contained object on `window.Spielecke.Games.<id>` exposing:

- `meta` — `{ id, name, tagline, icon, minPlayers, supportsDrinking, beta? }`. `supportsDrinking`
  means the game offers an optional drinking-mode toggle — not that it's always a drinking
  game. `beta` is optional and puts a **BETA** badge on the shelf card (used by Simon Says,
  whose reliance on `speechSynthesis` varies by browser). The registry builds its entry
  straight from this so meta and card never drift.
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
- **Turn order:** the roster on `context.players` keeps the order players were *entered* (it's
  the canonical list). Games where play follows a fixed sequence of turns/roles down the roster
  (Doodle, Quiz, Wavelength, Ballpark, Imposter, Rank It) **must randomise that order when
  a round starts** — call `Spielecke.shuffle(arr)` (pure Fisher-Yates, returns a new array) so
  the same five players don't get the identical sequence every round. Games that already pick at
  random (Truth, Chooser, Reaction Duel) or let the host choose the seat (Busfahrt, Fuck the
  Dealer) don't need it.

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
  **Imposter**, and **Doodle Drama** so terms are managed in one place. Each pool is
  `{ label, terms: [...] }`; "Mixed" draws across all. A pool may carry an optional
  `games: [...]` allow-list scoping it to specific games — e.g. `doodle_hard` (multi-word
  scenes + abstract concepts that you can *draw* but can't put on a forehead or use as an
  Imposter word) is tagged `games: ["doodle"]` so it only shows up in Doodle Drama. Games
  read their pools via `Spielecke.termPoolsFor(id)`, which filters the chips **and** the
  "Mixed" draw so a scoped pool never leaks into a game it doesn't belong to.
- **Per-game content** when the shape differs:
  - Hot Potato → category *prompts* (`hotpotato-prompts.js`, `{ label, prompts }`).
  - Wavelength → *opposite pairs* (`wavelength.js`, `{ label, pairs:[{left,right}] }`).
  - Never Have I Ever / Most Likely To → *sentence predicates* (`nhie.js`, `most-likely.js`,
    `{ label, prompts }`) — separate because the grammar differs from each other.
  - Ballpark → *numeric Q&A* (`numbers.js`, `{ label, questions:[{q,a}] }`).
  - Princess Treatment → *gendered prompts* (`princess.js`, `{ label, princess:[], king:[] }`).
  - Activity → *point-tiered words* (`activity.js`, `{ 2:{label,words}, 3:…, 4:… }`),
    type-agnostic — the field decides how you perform, the points decide difficulty.
  - Quiz Out → *levelled multiple-choice* (`quiz.js`, an array of levels; each question
    `{ q, options:[4], answer:index }`). Options are shuffled on screen.
  - Hochadel → an editable **deck** tagged per edition + ground rules + opening verses
    (`hochadel.js`).
  - The three card games share one honest **52-card deck + card-face** component (`cards.js`),
    not a content file.
  - Wettbüro → *challenges*, optionally timed (`wettbuero.js`, `{ label, challenges:[{text, timer?}] }`);
    `timer` is present only on inherently-timed challenges.
  - Mind Meld → *seed words*, a flat list per pool (`mindmeld.js`, `{ label, words:[...] }`) —
    the game draws 2–3 distinct words per team at random.
  - Geheimauftrag → *mission templates* with `{target}`/`{partner}` tokens the game substitutes
    at deal time (`geheimauftrag.js`, `{ solo:[...], coop:[...] }`) — no category pools; every
    mission is bound to a specific other player, never a prop or a difficulty tag.
  - Simon Says → *bare imperative commands* (`simon.js`, `{ label, commands:[...] }`); the
    authority prefix ("Simon says" / German "Kommando") is added at runtime, not stored.
  - Geschmacklos → *prompts + answers*, one **fixed set, no category pools** (`geschmacklos.js`,
    `{ prompts:[...], answers:[...] }`) — a single shared deck keeps the seeded-deal math in
    §0 simple (every phone shuffles the same list).

**Bilingual content:** every content file is a `{ de, en }` bundle read via `Spielecke.L(...)`;
proper-noun term pools (Marvel, One Piece, …) keep one shared list, while pools that blend in
language-dependent concept terms (football's *Freistoß* → *Free kick*) localise those entries.
**Category pools are
multi-select** (`pools.js`) — toggle several at once, an empty selection means 🎯 Mixed (all)
— and are resolved at draw time so a stale/empty pick can never start a dry round.

The spiciest NSFW entries are left as clearly-marked `[placeholders]` for
Paul to fill.

---

## Part 3 — Games

Outcomes below are the **plain** (default) framing. For drinking-capable games, the
🍻 toggle swaps the resolution wording to drinks.

### 3.1 Hot Potato 🥔 (`hotpotato`, 2+) — drinking-capable

Hot-potato. A category prompt shows; the device is the potato. Holder names an answer, taps
the big **Pass**, hands the phone on. A hidden fuse counts down.

- **Pass model:** pure physical pass — the app runs the fuse only, doesn't track turns.
- **Fuse:** always random **15–45s**, hidden. Cosmetic accelerating tick; detonation on a
  precise timer. Web Audio explosion + haptics.
- **Config:** category pool, sound on/off, 🍻 drinking mode. Persisted.
- **Outcome:** holder at detonation **loses the round** (drinking mode: drinks).

### 3.2 Most Likely To 🫵 (`mostlikely`, 2+) — drinking-capable

Pointing deck. Card shows "Most likely to ___"; on 3-2-1 everyone points.

- **Config:** category pool, 🍻 drinking mode.
- **Outcome:** most fingers takes the **crown 👑** (drinking mode: drinks). Pointing/counting
  is physical; the app shows the prompt + call.

### 3.3 Never Have I Ever 🙊 (`nhie`, 2+) — drinking-capable

Confession deck. Card shows "Never have I ever ___".

- **Config:** category pool, 🍻 drinking mode.
- **Outcome:** anyone who's done it **owns up** (drinking mode: drinks).

### 3.4 Who Am I? 🙈 (`whoami`, 2+) — plain

Heads-Up style. Two modes (toggle in setup):
- **📚 Categories:** phone on the forehead, table shouts clues, **GOT IT** / **SKIP** against
  a visible countdown. Config: category pool (shared Terms), round length (30/60/90s), sound.
  Outcome: pure score — "You got N right!" (beat 3 for a 🎉).
- **✍️ Custom sticky:** type one character/thing and it shows as a big **sticky note** to
  hold on the forehead — a digital sticky note for when you don't have paper ones. No timer,
  no score; "New character" to go again.

### 3.5 Imposter 🕵️ (`imposter`, 2+) — drinking-capable

Hidden roles on one device. Everyone gets the same secret word except one or more random
**imposters**, who only see the category. Pass to reveal each role privately (shared roster
for order + names, randomised each deal), then discuss, vote, unmask.

- **Config:** word pool (shared Terms); **number of imposters** — 1 up to the whole table, or
  **🎲 Random**. Random scales with the table (~1 faker per 3.5 players, so 7 ≈ 2) and keeps the
  count **secret from the imposters themselves** — they never learn how many others there are.
  An optional **"give imposters a hint"** toggle hands each imposter a distant, cryptic decoy
  clue (`content/imposter-hints.js`). Persisted.
- **🔔 Buzzer mode:** a Buzzer chip sits in the category row; picking it swaps the word hunt for
  a seconds-guessing round — no secret word, no clock ever shown. Everyone but the imposter
  secretly sees a target of **1–15 seconds**, then each player buzzes when they think that long
  has passed. The reveal ranks everyone by how close they landed and pins them on a timeline.
- **Outcome:** word hunt — all imposter(s) caught → the table wins; fooled → the imposter(s)
  win. Buzzer — closest to the target takes 👑; the imposter, guessing blind, usually drifts off.
- **🍻 Drinking mode** (toggle in setup, persisted) swaps the resolution to drinks: word hunt —
  caught → the imposter(s) drink, fooled → the whole table drinks; Buzzer — the player furthest
  from the target drinks.

### 3.6 Wavelength 📡 (`wavelength`, 2+) — plain

A spectrum between two opposites (e.g. Cold ↔ Hot). A **clue-giver** secretly sees a hidden
target band and gives a clue; the rest slide a dial to guess.

- **Config:** spectrum pool.
- **Outcome:** closeness **score** (0–100). Bullseye ±10, miss beyond ±30.

### 3.7 Ballpark 🔢 (`liars`, 2+) — drinking-capable

*(DE: Pi mal Daumen. Internal id stays `liars`; the old name "Liar's Numbers" over-promised
a bluff mechanic — the game is pure closest-estimate.)*

Numeric estimation on one device. A question with a number answer shows; the phone passes
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
- **Draw timer:** each draw step is capped at **60s** (counts down from the moment the draw
  screen opens, turns red under 10s); at zero the drawing auto-submits. Cleared on every
  screen change / unmount.
- **Timelapse reveal:** every stroke — and each *Clear* — is recorded as a compact op list
  alongside the final PNG, so when a drawing is shown (to the next guesser, and again on each
  drawing beat of the chain reveal) a canvas **replays it over ~5s**, ending on the finished
  picture. Cleared false starts replay too — that's half the drama. Tap the drawing to replay;
  falls back to the still PNG when there's no recording or `prefers-reduced-motion` is set.
- **Config:** word pool.
- **Outcome:** none — reveal the carnage for laughs.

### 3.10 Activity 🗺️ (`activity`, 2+ · best with 4) — drinking-capable

Two teams race along a map. Each field is a type shown by **icon + colour, never words**:
💬 explain · ✏️ draw · 🎭 charade. On your turn you're on a field of one type; pick a
**2/3/4-point** word; one team member performs it that way while their team guesses, against
a fixed **60s** clock. Guess in time → move forward by the point value. First team to the
finish 🏆 wins.

- **Teams:** two, each a "figure" token (tap to change) that moves along the board. If a
  roster exists, a suggested split is shown with a 🔀 shuffle.
- **Board:** 14 typed fields + finish, randomised each game. Responsive — compact wrapping
  tiles on mobile, a roomier two-column layout (board beside controls) on desktop.
- **Config:** team figures (persisted), 🍻 drinking mode. Words tiered by points (`activity.js`).
- **Outcome:** first team to complete the map wins. Drinking mode — fail a round → your
  team drinks; succeed → the other team drinks.

### 3.11 Quiz Out ❓ (`quiz`, 2+) — drinking-capable

Turn-based knockout quiz. Players take turns answering a 4-option question; a wrong answer
costs a life. After every full round (each survivor has answered once) the difficulty climbs
a level. Lose all hearts → out; last player standing wins. Uses the roster for turn order +
per-player lives.

- **Config:** hearts each (1–5, default 3), 🍻 drinking mode (wrong = drink too). Persisted.
- **Flow:** "Pass to [Name]" (lives shown) → question + 4 shuffled options → correct = safe,
  wrong = −1 heart (and drink in drinking mode) → next player; difficulty rises each round.
- **Outcome:** last survivor wins.

### 3.12 Truth or Drink 🍸 (`truth`, 2+) — drinking-capable

A random player (from the roster, no immediate repeat) gets a truth question.

- **Config:** category pool, 🍻 drinking mode.
- **Outcome:** plain — answer honestly. Drinking mode — answer, or drink to dodge.

### 3.13 Chooser 🎡 (`chooser`, 2+) — drinking-capable

A spinning wheel that lands on a random person from the roster. SVG wheel (one coloured
slice + name per player), CSS-rotate spin with a fixed pointer at the top. No content file —
it just spins the roster. "Spin again" to re-roll. Handy as a picker for any other game.

- **🍻 Drinking mode** (toggle on the wheel screen, persisted): when on, the wheel lands on its
  victim and the result reads "*Name* drinks!" — otherwise it's just "who's it?".

### 3.14 Reaction Duel ⚡ (`reaction`, 2+) — drinking-capable

Two players, device flat between them; the screen splits into two tap zones (top half
rotated 180° for the player across the table). Each round is a random **type** — and not
just "tap fast":
- **GO** — wait for green, then tap; early tap = false start.
- **Bait** — fakes flash during the wait ("GO?", "✋ STOP"); tap one and you lose.
- **Colour** — tap only on green; tapping another colour loses.
- **Symbol** — tap only the 💣; tapping a decoy loses.

Every type reduces to a `live` flag: tap while live → win; tap while not live → lose. First
to the target score (3/5/7, default 5) wins. Uses the roster to name the two duelists (or
Left/Right without one). Drinking mode → loser of each round drinks. No content file, no
audio (a sound would leak a reflex cue); all timers cleared on round end + unmount.

### 3.15 Rank It 🥇 (`rankit`, 2+) — drinking-capable

One device, one shared list. A set shows with an axis to rank along (best → worst, biggest →
smallest). The phone passes round; each player privately taps the items into their own order
and locks it. Reveal builds the **group's consensus** (items sorted by average position) and
measures each player's **drift** from it (sum of per-item rank distance — the Spearman
footrule). Closest to the group is the most in sync; furthest off loses.

- **Config:** category pool, 🧑‍🤝‍🧑 **Mitspieler** (rank-the-players) mode, 🍻 drinking mode. Item
  count per set is flexible.
- **Mitspieler mode:** a toggle **below** the category chips. The ranked items become the
  **current roster** (dynamic) instead of static content; the selected pools (standard
  multi-select, Mixed = all) only set the flavour of the axis, drawn from each pool's `people` list
  (Party → "Kotzt am ehesten → am spätesten", 18+ → "Steht am ehesten → am wenigsten auf BDSM", …).
  Everyone ranks all players, themselves included.
- **Content:** `content/rankit.js` (`{ label, sets:[{ title, items:[…] }], people:[{ title }] }`).
- **Outcome:** least drift **wins 👑**, most drift **loses 💀** (drinking mode: drinks). If the
  whole table ranks identically, it's a draw — nobody wins or loses.

### 3.16 Hochadel 👑 (`hochadel`, 2+) — drinking-capable

Royal-court action-card game (Klattschen-style). Players draw cards in turn; the in-game word
for "drink" is **dienen**. Four card types, each a heraldic colour: **Sofort** (crimson —
resolve once, discard), **Regel** (sapphire — becomes a standing „Hofgesetz"), **Aktiv** (gold —
face-up with its holder, self-triggered later), **Minispiel** (violet — a table mini-game the host
completes). Two standing ground rules are always on. The deck is data, tagged per edition (active:
*Diener & Könige*; *Rapunzel* is a locked stub) and reshuffles endlessly. Game state persists; the
Sanduhr (keeps its name; its card text says "Handy-Timer" so it's clear the phone runs the secret
timer) and the space-key shortcut are torn down on unmount.

- **A few Regel cards auto-expire.** Playtesting flagged specific standing rules as genuinely
  exhausting to keep tracking on top of everything else already in play, so those carry
  `temp: true` and lapse after one lap of the table (`rounds`, default 1): *Der Spitzname*
  (nickname, 2 rounds), *Der Knabe*, *Der gesenkte Blick* (no eye contact), *Der Trinkspruch*
  (the toast), *Verbotene Zustimmung* ("yes" banned), *Verbotene Artikel* ("der/die/das" banned),
  *Der Untertan* (apologise before every sentence), plus the pre-existing *Wortkarg bei Hofe*,
  *Das Plappermaul*, *In Zeitlupe*, *Der Tafelschlag*, *Narrenfreiheit*. Everything else stays
  permanent, including cards that are naturally self-limiting (`copies: 2` + "a new draw
  supersedes the old" — Echo, In meiner Hose, Die Erhebung, Der Inquisitor) and ones explicitly
  designed to last (*Bund auf Lebenszeit*, *Das lebende Bild*, *Das Austrittsgesuch* — kept
  permanent by design). *Höfische Anrede* (must address each other formally) and *Höfische
  Etikette* (no elbows on the table) are distinct rules — one's a speech rule, one's a physical
  one — and both stay permanent.
- **`noEarlyDraw` late-only cards.** A card flagged `noEarlyDraw` (currently just *Verbotene
  Artikel* — banning „der/die/das") is barred from the deck's first third: `buildDeck()` shuffles
  normally, then swaps any such card out of the earliest ~33% of draw positions so it can't hit
  before the table has warmed up.

### 3.17 Mia (Mäxchen) 🎩 (`maxchen`, 2+) — drinking-capable

Bluffing dice on one passed-around phone. Tap the hat to roll two dice in secret, announce a
value out loud (truth or bluff, higher than the player before you), pass on; the next player
rolls again or lifts the hat to call it. The app's only job is to keep the roll secret until
someone lifts — it **doesn't** track claims or judge who lied; the table settles that.

### 3.18 Ride the Bus 🚌 (`busfahrt`, 1+) — drinking-capable

Card gauntlet (the final guessing phase). A **Busfahrer** climbs a four-step ladder about the
next card — **colour → higher/lower → inside/outside → exact suit**. A wrong guess drops them
back to step 1 and they **trinken** sips equal to the step they failed (1–4); clear all four to
escape. Tie handling and "on escape the driver hands out the sips" are configurable. The driver
rotates via the roster.

### 3.19 Fuck the Dealer 🃏 (`fuckdealer`, 2+) — drinking-capable

A dealer holds the deck; the table guesses the next card's **rank**. First miss → the dealer
gives a higher/lower hint and you get a second guess; miss twice → you **trinken** (rank gap or
a flat amount, configurable). Nail it → the dealer drinks. Each card is revealed and folded into a
per-rank "drawn" strip (counting help): one tile per rank, a small count badge once two-or-more of
that rank are out, and a face-down back once all four are gone. The dealer passes left after the
deck empties twice — or as soon as the dealer wins three rounds in a row (rotating reihum through
the roster).

### 3.20 Horse Race 🐎 (`pferderennen`, 1+) — drinking-capable

The four Aces are the horses (♠♥♦♣); the app flips the other 48 cards one at a time and the
matching-suit horse advances. Six face-down **hurdles** flip as the field clears each level,
rubber-banding that suit back a step. The hurdle cards are visible as a strip of mini face-down
card backs under the board, one per section line; each 3D-flips face-up the moment its hurdle
fires, so the rubber-band is legible at the table. Players bet a suit (roster); first horse home → backers
**verteilen** sips, the rest **trinken**. The loss penalty is configurable: **flat** with a
chosen sip count (a 1–5 chip row, default 3; the row dims out while "lengths behind" is on) or
**"lengths behind"** (sips = how far your horse finished off the pace). The race is animated
and **paced** like a race call (configurable speed) with a commentator line; the single timer
chain is cleared on unmount.

### 3.21 Zeitzünder 🧨 (`zeitzunder`, 2+) — plain (co-op)

A new genre: asymmetric co-op, *Keep Talking and Nobody Explodes* in miniature. On entry you
pick a role. **The bomb** (a MacBook on the table) shows a six-faced device you flip through —
**Core** (firing sigils + progress LEDs + serial + the red **arming control**), **Guts** (the
reference hub: decoder letter, colour priority, indicators, batteries) and four interactive
modules **Wires / Keypad / Dials / Maze** — with a live countdown and three strikes. **Experts**
open the same link on their phones and get the **Defusal Manual** (rules, tables, legends) but
never see the bomb. Neither device talks to the other: the defuser reads out what they see, the
experts read back what to do. The humans are the wire.

One interlocking puzzle, not a linear checklist. Four action stages — **Wires / Keypad / Dials /
Maze** — must be committed in an order the bomb hides in its **firing sigils** (reversed when the
serial's last digit is even). Each stage reads values off *other* faces: the dials feed the
wire-cut channel; the decoder letter + indicators drive the keypad; the serial feeds the dials;
the **Maze** hides its walls from the defuser so the expert must navigate them turn-by-turn.
Crucially the step spans faces — the **Keypad and Dials don't commit on their own face**: you set
them, flip to the Core and **hold the arming control, releasing as the timer's last digit hits the
arming digit** `(lit indicators + batteries) mod 10`, so the once-decoy batteries now matter (`CLR`
is still a pure decoy). Wires and Maze commit on their own face. Acting out of order, a wrong
action, or bumping a maze wall is a strike; three strikes (or the clock) → 💥.

**Solver ↔ manual lockstep:** the rule tables (`SYMBOL_TABLE`, `FIRING_SIGILS`, `LETTER_BANK`,
colour-priority, and the fixed `MAZES` set) are the single source of truth — the host
generator/solver and the expert manual both read them, so the page the expert reads and the answer
the bomb expects can never drift. Mazes are hard-coded (not generated) precisely so the expert's
phone and the bomb agree. The pure rule engine is exposed under `module._test` and audited (3k
generated bombs: order always four stages, every maze reachable, arming digit in range, all
solvable; the timed arming commit driven end-to-end through the real UI headlessly). Currently a
single bomb solvable by one expert; designed so the manual's pages can be *dealt out* across
several experts later (forcing expert-to-expert talk), with more modules to follow. Difficulty
sets the fuse (Normal 10:00 / Lethal 5:00). The countdown interval, Web-Audio
alarms and key handler are all torn down on unmount.

### 3.22 Ballon 🎈 (`ballon`, 2+) — drinking-capable

Push-your-luck. The phone is a balloon passed round the table. On your turn you **Pump** as
many times as you dare — every pump adds a sip to the visible **pot** and inflates the
balloon on screen — then **Pass on**. A hidden burst point pops the balloon on some pump;
whoever's pumping it then holds it when it blows.

- **Burst point:** random each balloon, gently scaled to the table — roughly
  `⌈2.5 + 0.65×players⌉` to `⌈5 + players⌉` cumulative pumps, hard-capped near 20 — so it
  averages ~7 sips at 4 players and stays sane at big tables. The pot is public; the
  threshold never is.
- **Inflation:** the on-screen balloon scales with the **pot** (not the hidden threshold),
  so it only ever grows and never appears to deflate before it pops. Up to ~7 sips it fits the
  stage; past that it deliberately bloats over the top bounds — a fat pot looks tense and
  faintly out of control. It overflows *behind* the pot badge and buttons, so you keep pumping.
- **Config:** sound on/off (rising pump pitch + a Web-Audio pop + haptics), 🍻 drinking mode.
- **Outcome:** holder at pop **drinks the pot** (plain: loses the round, pot becomes points).

### 3.23 Wettbüro 🎰 (`wettbuero`, 3+) — drinking-capable

Bet on your friends. A candidate rotates through the roster and draws a challenge card
(🧠 Kopf / 🎯 Geschick / 🎭 Mut / 🔞 18+); some run against a visible countdown. Before it
starts, everyone else sets a bet on each other name — ✅ they'll nail it or ❌ they'll flop,
1–3 sips — the candidate doesn't bet. The table judges success or failure; the app settles.

- **Config:** challenge category pools, 🍻 drinking mode (swaps the unit from points to sips).
- **Outcome:** right bettors **hand out** their stake, wrong bettors **drink** it; the
  candidate hands out 3 on success or drinks 3 on failure.

### 3.24 Mind Meld 🧠 (`mindmeld`, 4+) — drinking-capable

Convergence, not competition against the clock. The roster splits into teams of two (an odd
player joins the last team, making a trio); each teammate secretly gets their own seed word.
On "go" the team says a **new** word together, simultaneously, again and again, trying to
land on the exact same word — tap **+1** on every miss. **MELD!** locks that team's round
count; the next team takes the phone.

- **Config:** word pools (🎲 Allgemein, 🔞 18+), 🍻 drinking mode. 🔀 Reshuffle re-teams and
  redraws words; toggling a **word pool** re-deals only the seed words (the teams stay put, so
  the on-screen team cards never go stale).
- **Outcome:** fewest rounds to meld **wins**; most rounds **drinks** (drinking mode) or is
  simply named slowest (plain). A tie across all teams is a draw — nobody drinks.

### 3.25 Geheimauftrag 🕶️ (`geheimauftrag`, 4+) — drinking-capable

A meta-layer, not a stand-alone round — so it **isn't on the shelf**. You deal it from a
discreet 🕶️ button on the **Players screen** (with a one-line primer next to it); it then runs
quietly **alongside** whatever else you play that evening. Every mission is bound to a specific
other player via a `{target}` token (never a prop, never impossible) — "Bring **{target}** to
say...", "Toast three times with **{target}**...". Re-open it any time for a private "peek" or
to cash a mission in. The mission pool is deliberately hand-curated (quality over quantity)
rather than padded out.

- **No "caught" flow (by design):** there is deliberately no accuse/bust path. At the table it
  collapsed into everyone denying every accusation ("you only say that because it's *your*
  mission"), which drags — the fun is sneaking a mission past everyone, not policing it. The hub
  is just **peek** and **cash in**.
- **Persistence:** assignments live in `context.store` (survives navigating to other games —
  only the DOM is torn down on `unmount()`), so the mission is still there when you come back.
- **Co-op missions:** at 5+ players some missions pair two people on the same `{target}` —
  either told who their partner is, or left to find each other from the shared wording alone
  ("someone at the table shares this exact mission"). Cashing one in **completes both partners
  at once** — both hand out sips and both draw fresh missions.
- **Hub status:** the hub shows a running tally — "*N* in play · *M* pulled off" — so a
  quiet all-evening side-game still gives you a reason to check back on the tile.
- **Config:** none — plain by design (some missions are naturally harder, no difficulty tag).
- **Outcome:** pulled off → **hands out 2** and draws a fresh mission.

### 3.26 Simon Says 🗣️ (`simon`, 3+, beta) — drinking-capable

*German name: "Kommando" — the English "Simon says" has no natural German equivalent, so the
DE build uses a native command-giver; the game id stays `simon`.*

Voice-driven, not screen-driven. The phone is the announcer: it **reads commands aloud**
(Web Speech `speechSynthesis`, falling back to a big on-screen phrase + beep if unsupported),
randomly prefixing the authority phrase ("Simon says:" / "Kommando:") — obey only the
prefixed ones. The calling cadence **accelerates** every command, and the built-up speed
**carries across knockouts and pauses** — only a genuinely new round restarts at the slow
cadence, so the last two players are getting rapid-fire calls. The app can't see who reacted
(no sync), so the table judges: tap ❌ to knock out whoever slipped.

- **Config:** command category pools (🤸 Körper & Gesten, 🎉 Party, 🔞 18+), voice on/off,
  🍻 drinking mode.
- **Outcome:** last one standing **wins**; everyone eliminated along the way **drinks**.
- **Why beta:** `speechSynthesis` voice/availability varies by browser — kept deliberately
  small while it gets road-tested.

### 3.27 Geschmacklos 🃏 (`geschmacklos`, 3+) — drinking-capable

A Cards Against Humanity mode, asymmetric like Zeitzünder: on entry you pick **🎙️ Host** (one
screen, the table) or **🃏 Spieler** (your own hand). The two never talk to each other.

- **Host:** generates a short **table code** and shows it big, alongside the current black
  prompt, the rotating **Card Czar** (DE UI: *Kartenboss*), and a live scoreboard (tap a name to
  award the point). Prompts have **one or two blanks**; a two-blank prompt shows a **PICK 2**
  badge so the table knows to play two cards. **Next prompt** just advances the prompt +
  Czar; **New table code** turns the whole table over together — since a new code re-deals
  every player's hand, it also draws a fresh prompt and clears the scoreboard.
- **Player:** types the host's code and calls out a **free seat number** (1–12) so no two
  players claim the same seat. Every phone then runs the *same* deterministic shuffle of the
  fixed answer deck off that code (`Spielecke.seededShuffle`) and slices out its seat's
  disjoint block — a fresh table code means fresh hands, but the same code always gives the
  same deal (refresh-safe). A hand is **8 cards**; once **4** have been played the hand resets
  to a fresh 8 (window steps by 8 through the seat's block, so a card is never re-dealt).
- **Deck:** one fixed set per language (`content/geschmacklos.js`) — **~228 answer cards + 74
  prompts** (14 of them two-blank). Answers are deliberately **short (1–2 words on average**,
  longer full-phrase gags the exception) and run filthy/absurd/politically-incorrect. Dark-noun
  humour about shady/illegal things is fair game (it's CAH); the fixed, non-negotiable boundary
  is only **no slurs / hate against protected groups, no minors**.
- **Play:** tap your best card to blow it up full-screen, then read prompt + card aloud round
  the table (you can tell whose phone is whose) — no anonymity mechanic.
- **Config:** none — one fixed deck (dropping category pools keeps the seat-block math
  simple); 🍻 drinking mode implicit in the scoring flavour.
- **Outcome:** Card Czar picks the round's best line (tracked on the host); no formal
  end-of-game score cap — play until the room's done.

### 3.28 Lügen 🤥 (`luegen`, 3+, beta) — drinking-capable

The bluffing card classic (Cheat / Bullshit / Mogeln) on one passed-around phone. Deliberately
built to feel unlike Mia (which hides *one* roll and tracks nothing): Lügen keeps **persistent
hidden hands** the app deals and tallies, plus a growing face-down **pile** — bookkeeping a
shared screen does far better than the table.

- **Loop:** the whole deck is dealt round-robin. On your turn you **must claim a fixed rank** —
  the leader picks the base rank for a fresh pile, then it **climbs by one each turn** (wrapping)
  — but you lay your cards **face down**, so you can lie. You choose only *how many* (1–4) and
  *which* cards to sacrifice; since you rarely hold the forced rank, lies are forced.
- **Challenge:** any other player may call **„Lüge!"** — the table taps **who** accuses, the
  played cards **flip** (shared `pkflip`), and whoever was wrong — the liar or the accuser —
  takes the **whole pile** into their hand (drinking mode: they drink ~1 sip per 3 cards). Not a
  binary next-player believe/lift like Mia; the pickup is a punishment + comeback swing.
- **Win:** first to **empty their hand**. The last play is the most dangerous — a believed final
  bluff wins outright, but a *called* final bluff hands the pile back and you're still in.
- **Config:** deck size (🏃 short 32 / 🎴 full 52), 🍻 drinking mode. A live **hand-count HUD**
  shows every player's remaining cards so the table sees who's close. No content file (pure deck
  mechanics); mid-game state is not persisted — a fresh mount starts at setup.
- **Why beta:** new loop, road-tested with the group before it graduates off the beta shelf.

---

## Resolved decisions

1. **App name + identity** → **Pauls Spielecke**, playground/toy-box look + logo, NSFW
   content (see Part 0 visual identity).
2. **Not every game is a drinking game.** Games are plain by default; drinking-capable ones
   expose a 🍻 toggle (off by default) that swaps the resolution to drinks. Don't add drink
   penalties where they don't fit. Games with a 🍻 toggle: Hot Potato, Most Likely To, Never
   Have I Ever, Imposter, Ballpark, Quiz Out, Truth or Drink, Chooser, Activity, Reaction
   Duel, Rank It, Hochadel, Mia, Ride the Bus, Fuck the Dealer, Horse Race, Ballon, Wettbüro,
   Mind Meld, Geheimauftrag, Simon Says, Geschmacklos.
3. **Hot Potato pass model** → pure physical pass (no turn tracking).
4. **Hot Potato fuse** → always random 20–90s, not configurable.
5. **Mobile vs desktop** → single responsive build, no separate files. Drawing (Doodle
   Drama) via canvas + Pointer Events works on both.
6. **Module loading** → ordered classic `<script>` tags (no ES modules) for `file://`.
7. **Content management** → shared single-term DB for games that fit; per-game files for
   different shapes (prompts, pairs, numbers, gendered prompts).
8. **Stats/leaderboard** → not built, but `store.gameStore(id)` is namespaced so it can be
   added later without redesign.
9. **Fewer elements, clean focus** → prefer one *fewer* button/line; the card/wheel/hat is the
   tap target (`Spielecke.tappable`); redundant back-buttons and restating text are removed.
10. **Bilingual DE/EN, German default** → strings in `i18n.js` (`Spielecke.t`), content as
    `{ de, en }` bundles via `Spielecke.L`; language toggle on the Players screen, persisted.
11. **Category pools are multi-select** → toggle several at once; an empty selection = 🎯 Mixed
    (all). Resolved at draw time (`pools.js`) so a stale/empty pick never starts a dry round.
12. **Card games share one honest 52-card deck** → `cards.js` provides the deck, shuffle, and
    card-face component reused by Ride the Bus, Fuck the Dealer, and Horse Race.
13. **Seeded RNG for cross-device dealing** → `Spielecke.seededShuffle` (`ui.js`, mulberry32 +
    an FNV-1a string hash) turns a short shared code into an identical deterministic shuffle
    on every phone. Introduced for Geschmacklos (disjoint per-seat hands, no backend); reusable
    anywhere else a future game needs several devices to agree on "the same random" without
    talking to each other.
14. **Beta badge** → `meta.beta` on a game module puts a **BETA** marker on its shelf card
    (`registry.js` passes it through, `shelf.js`/`main.css` render it). For games shipped
    deliberately small while a risky browser API (e.g. Simon Says's `speechSynthesis`) gets
    road-tested with the group before it's called done.

---

## Roadmap — candidate next games

Each a distinct mechanic so the night doesn't feel samey. Confirm / reorder / replace:

- **Higher or Lower** — themed fact chain, group votes by shouting, wrong = out (or drink).
- **Odd-One-Out** — reflex flash-grid filler.
- **Saboteur-style co-op** — the table solves small joint tasks (a chaos-count, a mind-meld-
  style challenge, a rhythm pattern) while one player secretly tries to make them fail without
  getting caught. Distinct from Geheimauftrag (which is solo/pair missions, not a joint task)
  and from Zeitzünder (which has no traitor).
- **NSFW knowledge round** — Quiz Out is deliberately family-friendly trivia; there's no adult
  equivalent yet (a spicy true/false or estimate-the-number format would fit the gap without
  cannibalising Ballpark).
- **Anonymous-writing game** — considered and shelved in favour of Geschmacklos (see history:
  the earlier "Ghostwriter" pitch had no clear winner and made the after-round discussion
  pointless); if revisited, needs a sharper resolution mechanic than "guess who wrote it."
- **Password / Captcha builder** — a party-ified *Password Game*. Full design exploration
  parked below (§Design note); to be revisited.

### Design note — "Password / Captcha" party game (not built yet)

A group/drinking translation of **The Password Game** (the solo browser game where you build one
password against an ever-growing pile of absurd, self-contradicting rules). Paul's steer: it must
**not be a separate mini-thing bolted on** — the captcha/password idea should *be* the game, run
at the table. This note captures the shared understanding so we can pick it straight back up.

**What carries from the original (keep):**
- **Escalation** — rules stack, absurdity grows.
- **Rule maintenance** — new rules break old ones; the password becomes a monster you must keep
  feeding.
- **The checklist moment** — the ✓/✗ list re-cascades after every edit; that's the visible drama
  beat.
- **Attachment comedy** — "Paul the chicken 🐔" (the original's egg 🥚 you're forbidden to delete).

**What to replace (doesn't survive contact with a drunk group):**
- Knowledge rules (Wordle answer, chess move, sponsors) → swap for **group- and room-referential**
  rules the table can supply.
- Solo typing with no audience → needs **relay structure + spectator beats**.

**Core structure — "One password, everyone suffers" (relay):** one shared password; the phone
passes around the table. Each turn reveals **one new rule**; the holder must edit the password so
**all** rules are ✓ again, under a shrinking timer (~45s, less later). After the turn, a big
**checklist reveal** for the table. Timer blown or give-up → drink + lose a life (Quiz-Out-style,
last survivor wins). The hook: your predecessor hands you a wreck, and your fix inevitably
sabotages the next player.

**Building blocks (pick-list, numbered so we can reference them later):**
- **B1 — Roster rules:** the app knows the players → "must contain your left neighbour's name",
  "…everyone's initials", "…{name} backwards". Makes it *your* group's password.
- **B2 — Table rules (the table is the regex):** rules the app can't check but the table can —
  "must contain something currently on the table", "…a word the table unanimously declares filthy".
  A **"table says ✓" button**, same as Mäxchen/Kommando handing the verdict to the room. This is the
  single biggest lever that turns a regex puzzle into a *party* game.
- **B3 — Captcha speed-bumps:** before each submit, prove you're not a robot — tap all the 🍺 in a
  3×3 emoji grid, retype a distorted word, a slider puzzle. Fast, flustered, and **the others watch
  you fumble**. Captcha fail = "robot detected" = drink. This is how the captcha lives *inside* the
  game instead of being a separate screen (per Paul's ask).
- **B4 — Physical verification:** some captchas leave the screen — "Verification: make two people at
  the table laugh — the table confirms." Use sparingly (2–3), else it drifts into Activity.
- **B5 — Paul the chicken 🐔:** an emoji pet moves into the password early and **must survive** (and
  occasionally be fed: insert a 🐛 next to it). Deleting Paul = double drink. Perfect running gag for
  "Pauls Spielecke".
- **B6 — Sabotage choice:** instead of a random rule, the **previous player secretly picks** which of
  3 rule cards hits you. Malice with agency — Wettbüro energy; the table howls at the reveal.
- **B7 — Memory rules:** a rule shows for ~5s, then **hides** — it still applies and is still checked,
  but is no longer on screen. Punishes exactly the state you play this in. Drinking-game gold.
- **B8 — Fire events:** a character randomly catches 🔥 (replaced by junk every few seconds); the
  holder must put it out before doing their actual rule. Panic comedy, straight from the original.
- **B9 — Pot economy instead of lives:** softer alternative to knockout — each rule you hand over
  broken = 1 sip into the pot; whoever fully fails drinks it (Ballon mechanic). Nobody sits out.

**Round-feel sketch:** R1 "at least 5 characters" (easy, laughs still relaxed) → R4 "must contain a
prime number" → R6 🐔 Paul moves in → R8 *(table rule)* "a drink someone's currently holding" →
captcha: retype "xX_bIeRkÖn1g_Xx" distorted → R11 *(secretly chosen by grinning Ben)* → 🔥 FIRE →
timer → 💀.

**Recommended build:** relay skeleton + **B1, B2, B3, B5, B7** as the core; **B6** and **B8** as a
second stage; **B4** sparingly.

**Open design questions (Paul to decide before build):**
1. **Knockout** (lives, last standing wins) or **Pot** (B9, nobody's eliminated)?
2. How **NSFW** should the rules themselves get (e.g. "include a body part" vs. tame)?
3. Naming/theme: **bureaucratic satire** ("Amt für Passwortsicherheit" — fits the Zeitzünder GDPR
   humour) or **bouncer/club** framing?

### Open content TODO (Paul)

The NSFW / filthy / spicy pools are all written. The inside-jokes placeholder
category has been removed across all games — it never had real content.
