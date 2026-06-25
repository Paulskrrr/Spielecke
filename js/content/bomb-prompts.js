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
    de: {
      football: {
        label: "⚽ Fußball",
        prompts: [
          "Fußballer, die für Barça gespielt haben",
          "Länder, die Weltmeister wurden",
          "Bundesliga-Vereine",
          "Ballon-d'Or-Gewinner",
          "Premier-League-Teams",
          "Berühmte Zehner",
        ],
      },
      mma: {
        label: "🥊 MMA",
        prompts: [
          "Arten, einen Kampf vorzeitig zu gewinnen",
          "UFC-Gewichtsklassen",
          "Gegner von McGregor",
          "Aufgabegriffe, bei denen du abklopfst",
          "UFC-Champions (egal welche Division)",
        ],
      },
      insideJokes: {
        label: "😎 Insider",
        prompts: [
          "[Paul trägt die hier ein — hier liegt das Gold]",
          "[Noch ein Insider-Spruch]",
          "[Gruppen-Legende / Running Gag]",
          "[Die eine Nacht, die keiner vergisst]",
          "[Wer am ehesten ...]",
        ],
      },
      general: {
        label: "🎲 Allgemein",
        prompts: [
          "Pizzabeläge",
          "Sachen in diesem Raum",
          "Länder in Europa",
          "Automarken",
          "Dinge, die man auf einer Party findet",
          "Filme, die jeder gesehen hat",
        ],
      },
    },
    en: {
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
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.BombCategories = BOMB_CATEGORIES;
})(window);
