/*
 * content/bomb-prompts.js — content for The Bomb (spec §2.3)
 *
 * EDIT ME. Pure content, no game logic. These are CATEGORY PROMPTS (a different
 * shape from the shared single-term database in terms.js) — each is a topic the
 * table riffs on out loud ("name a footballer who's played for Barça"). Keep
 * them snappy. The gold is in the inside-jokes pool.
 *
 * Pools let theme stay editable and become language-switchable later. Add a key
 * and it shows up as a selectable chip automatically. `label` is what players
 * see; the key is the internal id.
 */
(function (global) {
  "use strict";

  var BOMB_CATEGORIES = {
    football: {
      label: "⚽ Football",
      prompts: [
        "Footballers who've played for Barça",
        "World Cup winning nations",
        "Bundesliga clubs",
        "Ballon d'Or winners",
        "Premier League teams",
        "Famous number 10s",
      ],
    },
    mma: {
      label: "🥊 MMA",
      prompts: [
        "Ways to win a fight by stoppage",
        "UFC weight classes",
        "McGregor opponents",
        "Submissions you can tap to",
        "UFC champions (any division)",
      ],
    },
    insideJokes: {
      label: "😎 Inside Jokes",
      prompts: [
        "[Paul fills these in — the gold lives here]",
        "[Another inside joke prompt]",
        "[Group legend / running gag]",
        "[That one night nobody forgets]",
        "[Person most likely to ...]",
      ],
    },
    general: {
      label: "🎲 General",
      prompts: [
        "Pizza toppings",
        "Things in this room",
        "Countries in Europe",
        "Car brands",
        "Things you find at a party",
        "Movies everyone has seen",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.BombCategories = BOMB_CATEGORIES;
})(window);
