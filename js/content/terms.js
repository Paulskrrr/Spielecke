/*
 * content/terms.js — SHARED term database (NSFW, adults only)
 *
 * EDIT ME. One place for single-term content so it's easy to manage. Games that
 * need a "name / word / thing" pull from here:
 *   - Who Am I?  (the identity on your forehead)
 *   - Imposter   (the secret word everyone but the faker knows)
 *
 * Each entry must work BOTH as something you can describe to others AND as a
 * word you can hint at without saying. Keep them short and shoutable. Pools are
 * themed; "mixed" in-game draws across all of them. Add a pool here and it
 * shows up in both games automatically.
 *
 * (The Bomb and Wavelength use different content shapes — prompts and opposite
 * pairs — so they keep their own files.)
 */
(function (global) {
  "use strict";

  var TERMS = {
    party: {
      label: "🎉 Party",
      terms: [
        "Beer pong", "Hangover", "Tequila shot", "Nightclub", "Karaoke",
        "Designated driver", "Kebab at 4am", "Pre-game", "Shots", "Group chat",
      ],
    },
    famous: {
      label: "🌟 Famous",
      terms: [
        "Beyoncé", "The Rock", "Shrek", "Harry Potter", "Donald Trump",
        "Lady Gaga", "Conor McGregor", "Darth Vader", "Taylor Swift", "James Bond",
      ],
    },
    nsfw: {
      label: "🔞 Filth",
      terms: [
        "One-night stand", "Strip club", "Sexting", "Walk of shame",
        "Booty call", "Friends with benefits", "Skinny dipping",
        "Your ex's new partner", "A drunk text you regret",
        "[Paul fills these in — go nasty]", "[Spicy local legend]",
      ],
    },
    insideJokes: {
      label: "😎 Inside Jokes",
      terms: [
        "[Inside joke #1]", "[That thing someone did]", "[Running gag]",
        "[The nickname]", "[Most likely to ...]", "[Legendary night]",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Terms = TERMS;
})(window);
