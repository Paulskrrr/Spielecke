/*
 * content/activity.js — content for Activity (NSFW, adults only)
 *
 * EDIT ME. Pure content. Bilingual: the export is a { de, en } bundle and the
 * game reads the current language's subtree via Spielecke.L(...). Words are
 * grouped by POINT VALUE (difficulty), not by type — the field you land on
 * decides HOW you perform it (explain / draw / act), the points decide how hard
 * the word is and how far you move.
 *   2 = easy, 3 = medium, 4 = hard.
 * Pick words that can be drawn, explained AND mimed. Spice them up.
 *
 * Keep the DE and EN tier keys (2/3/4) and field names (label/words) in sync.
 */
(function (global) {
  "use strict";

  var ACTIVITY = {
    de: {
      2: {
        label: "Leicht",
        words: ["Bier", "Hund", "Pizza", "Selfie", "Kuss", "Klo", "Kondom", "Handy"],
      },
      3: {
        label: "Mittel",
        words: [
          "Kater", "Tinder-Date", "Walk of Shame", "Nacktbaden",
          "Netflix and Chill", "Fresskoma", "Poledance", "One-Night-Stand",
        ],
      },
      4: {
        label: "Schwer",
        words: [
          "Sinnkrise", "Mile-High-Club", "Freundschaft Plus",
          "Midlife-Crisis", "Stockholm-Syndrom", "Hochstapler-Syndrom",
          "Kamasutra", "Dirty Talk", "Rollenspiel", "Safeword", "Walk of Shame",        ],
      },
    },
    en: {
      2: {
        label: "Easy",
        words: ["Beer", "Dog", "Pizza", "Selfie", "Kiss", "Toilet", "Condom", "Phone"],
      },
      3: {
        label: "Medium",
        words: [
          "Hangover", "Tinder date", "Walk of shame", "Skinny dipping",
          "Netflix and chill", "Food coma", "Pole dancing", "One-night stand",
        ],
      },
      4: {
        label: "Hard",
        words: [
          "Existential crisis", "Mile-high club", "Friends with benefits",
          "Midlife crisis", "Stockholm syndrome", "Imposter syndrome",
          "Kama Sutra", "Dirty talk", "Roleplay", "Safe word", "Walk of shame",        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.ActivityWords = ACTIVITY;
})(window);
