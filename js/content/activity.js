/*
 * content/activity.js — content for Activity (NSFW, adults only)
 *
 * EDIT ME. Pure content. Words are grouped by POINT VALUE (difficulty), not by
 * type — the field you land on decides HOW you perform it (explain / draw /
 * act), the points decide how hard the word is and how far you move.
 *   2 = easy, 3 = medium, 4 = hard.
 * Pick words that can be drawn, explained AND mimed. Spice them up.
 */
(function (global) {
  "use strict";

  var ACTIVITY = {
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
        "Kama Sutra", "Dirty talk", "Roleplay", "Safe word", "Walk of shame",
        "[Inside joke — hard]",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.ActivityWords = ACTIVITY;
})(window);
