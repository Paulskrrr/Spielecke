/*
 * imposter.content.js — content for Imposter (NSFW, adults only)
 *
 * EDIT ME. Pure content, no logic. Everyone but the imposter sees the secret
 * word; the imposter only knows the category and has to bluff. Pick words that
 * are easy to hint at without saying them outright. The 🔞 pool and inside
 * jokes are where it gets dangerous — fill them in.
 */
(function (global) {
  "use strict";

  var IMPOSTER = {
    party: {
      label: "🎉 Party",
      words: [
        "Beer pong", "Hangover", "Tequila shot", "Nightclub", "Karaoke",
        "Designated driver", "Kebab at 4am", "Group chat", "Pre-game", "Shots",
      ],
    },
    nsfw: {
      label: "🔞 Filth",
      words: [
        "One-night stand", "Strip club", "Sexting", "Walk of shame",
        "Booty call", "Friends with benefits", "Skinny dipping",
        "[Paul fills these in]", "[Spicy in-group word]",
      ],
    },
    insideJokes: {
      label: "😎 Inside Jokes",
      words: [
        "[Inside joke word #1]", "[A place only you lot know]",
        "[That legendary object]", "[The nickname]", "[The incident]",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.ImposterWords = IMPOSTER;
})(window);
