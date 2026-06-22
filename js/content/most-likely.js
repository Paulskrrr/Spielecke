/*
 * content/most-likely.js — content for Most Likely To (NSFW, adults only)
 *
 * EDIT ME. Pure content. Each entry completes "Most likely to ___" — write just
 * the predicate, the game adds the prefix. Aim them at the group.
 */
(function (global) {
  "use strict";

  var MOST_LIKELY = {
    general: {
      label: "🎲 General",
      prompts: [
        "become famous",
        "get arrested for something stupid",
        "cry during a wedding speech",
        "show up late to their own party",
        "win the lottery and lose it all",
        "start an argument over nothing",
      ],
    },
    party: {
      label: "🎉 Party",
      prompts: [
        "get kicked out of the club",
        "throw up first tonight",
        "still be standing at 6am",
        "lose their phone tonight",
        "start a dance-off",
        "text their ex tonight",
      ],
    },
    nsfw: {
      label: "🔞 Filth",
      prompts: [
        "hook up with a stranger tonight",
        "have the wildest search history",
        "send a risky text right now",
        "have a secret OnlyFans",
        "kiss someone in this room",
        "[Paul fills these in]",
      ],
    },
    insideJokes: {
      label: "😎 Inside Jokes",
      prompts: [
        "[Inside-joke prompt #1]",
        "[Most __ of the group]",
        "[Do that thing again]",
        "[Group-legend behaviour]",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.MostLikely = MOST_LIKELY;
})(window);
