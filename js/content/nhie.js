/*
 * content/nhie.js — content for Never Have I Ever (NSFW, adults only)
 *
 * EDIT ME. Pure content. Each entry completes "Never have I ever ___" — write
 * just the predicate (lowercase verb phrase), the game adds the prefix. Keep
 * them confession-worthy. The 🔞 and inside-joke pools are where it bites.
 */
(function (global) {
  "use strict";

  var NHIE = {
    general: {
      label: "🎲 General",
      prompts: [
        "fallen asleep at a party",
        "ghosted someone",
        "lied about my age",
        "broken a bone",
        "sung karaoke sober",
        "cried at a film in the cinema",
      ],
    },
    party: {
      label: "🎉 Party",
      prompts: [
        "thrown up from drinking",
        "blacked out and forgotten a night",
        "texted an ex while drunk",
        "lost my phone on a night out",
        "done a walk of shame",
        "been kicked out of a bar",
      ],
    },
    nsfw: {
      label: "🔞 Filth",
      prompts: [
        "had a one-night stand",
        "sent a nude",
        "hooked up with someone in this room",
        "faked it",
        "joined the mile-high club",
        "[Paul fills these in — go nasty]",
        "[Spicy group confession]",
      ],
    },
    insideJokes: {
      label: "😎 Inside Jokes",
      prompts: [
        "[Inside-joke confession #1]",
        "[That thing only the group knows]",
        "[The incident]",
        "[Running-gag admission]",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.NHIE = NHIE;
})(window);
