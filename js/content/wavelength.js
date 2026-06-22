/*
 * content/wavelength.js — content for Wavelength (NSFW, adults only)
 *
 * EDIT ME. Pure content, no logic. Each entry is a SPECTRUM: two opposite ends.
 * The clue-giver gets a hidden target somewhere between them and has to give a
 * clue that lands the rest of the table on the right spot. (Different shape from
 * the shared term database — these are opposite pairs — so they live here.)
 *
 * `left` is the 0 end, `right` is the 100 end. Add pairs freely; the spicy and
 * inside-joke pools are yours to fill.
 */
(function (global) {
  "use strict";

  var WAVELENGTH = {
    general: {
      label: "🎲 General",
      pairs: [
        { left: "Cold", right: "Hot" },
        { left: "Underrated", right: "Overrated" },
        { left: "Useless", right: "Useful" },
        { left: "Cheap", right: "Expensive" },
        { left: "Round", right: "Pointy" },
        { left: "Bad superpower", right: "Good superpower" },
        { left: "Quiet", right: "Loud" },
        { left: "Casual", right: "Formal" },
        { left: "Common", right: "Rare" },
        { left: "Forgettable", right: "Iconic" },
      ],
    },
    spicy: {
      label: "🔞 Spicy",
      pairs: [
        { left: "Innocent", right: "Filthy" },
        { left: "Turn-off", right: "Turn-on" },
        { left: "Vanilla", right: "Kinky" },
        { left: "Bad date", right: "Great date" },
        { left: "Ick", right: "Hot" },
        { left: "Would never", right: "Absolutely would" },
        { left: "Prude", right: "Total freak" },
        { left: "Soft & sensual", right: "Rough & nasty" },
        { left: "Cute hookup", right: "Filthy hookup" },
        { left: "Green flag", right: "Red flag in bed" },
      ],
    },
    insideJokes: {
      label: "😎 Inside Jokes",
      pairs: [
        { left: "[Mild in-group thing]", right: "[Extreme in-group thing]" },
        { left: "[Least __ friend]", right: "[Most __ friend]" },
        { left: "[Tame memory]", right: "[Unhinged memory]" },
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.WavelengthSpectrums = WAVELENGTH;
})(window);
