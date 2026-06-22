/*
 * whoami.content.js — content for Who Am I? (NSFW, adults only)
 *
 * EDIT ME. Pure content, no logic. Each pool is a list of "identities" the
 * holder has to guess while the rest of the table screams clues. Keep them
 * short and shoutable. The 🔞 pool and inside jokes are where the night lives —
 * fill the placeholders with your own filth.
 */
(function (global) {
  "use strict";

  var WHOAMI = {
    pop: {
      label: "🌟 Famous",
      items: [
        "Beyoncé",
        "The Rock",
        "Shrek",
        "Harry Potter",
        "Donald Trump",
        "Lady Gaga",
        "Conor McGregor",
        "Darth Vader",
        "Taylor Swift",
        "James Bond",
      ],
    },
    nsfw: {
      label: "🔞 Filth",
      items: [
        "The walk of shame",
        "A one-night stand",
        "Your ex's new partner",
        "A drunk text you regret",
        "The group's biggest flirt",
        "A Tinder date gone wrong",
        "[Paul fills these in — go nasty]",
        "[Spicy local legend]",
      ],
    },
    insideJokes: {
      label: "😎 Inside Jokes",
      items: [
        "[Inside joke identity #1]",
        "[That thing someone did]",
        "[Running gag of the group]",
        "[Most likely to ...]",
        "[Legendary night, one word]",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.WhoAmICategories = WHOAMI;
})(window);
