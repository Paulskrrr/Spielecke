/*
 * content/wavelength.js — content for Wavelength (NSFW, adults only)
 *
 * EDIT ME. Pure content, no logic. Each entry is a SPECTRUM: two opposite ends.
 * The clue-giver gets a hidden target somewhere between them and has to give a
 * clue that lands the rest of the table on the right spot. (Different shape from
 * the shared term database — these are opposite pairs — so they live here.)
 *
 * `left` is the 0 end, `right` is the 100 end. Add pairs freely.
 */
(function (global) {
  "use strict";

  var WAVELENGTH = {
    de: {
      general: {
        label: "🎲 Allgemein",
        pairs: [
          { left: "Kalt", right: "Heiß" },
          { left: "Unterschätzt", right: "Überschätzt" },
          { left: "Nutzlos", right: "Nützlich" },
          { left: "Billig", right: "Teuer" },
          { left: "Rund", right: "Spitz" },
          { left: "Schlechte Superkraft", right: "Gute Superkraft" },
          { left: "Leise", right: "Laut" },
          { left: "Leger", right: "Förmlich" },
          { left: "Gewöhnlich", right: "Selten" },
          { left: "Vergessenswert", right: "Ikonisch" },
        ],
      },
      spicy: {
        label: "🔞 Versaut",
        pairs: [
          { left: "Unschuldig", right: "Versaut" },
          { left: "Abturner", right: "Anturner" },
          { left: "Vanilla", right: "Kinky" },
          { left: "Mieses Date", right: "Geiles Date" },
          { left: "Ekelig", right: "Heiß" },
          { left: "Niemals", right: "Auf jeden Fall" },
          { left: "Prüde", right: "Totale Sau" },
          { left: "Zärtlich & sinnlich", right: "Hart & schmutzig" },
          { left: "Süßer One-Night-Stand", right: "Versauter One-Night-Stand" },
          { left: "Green Flag", right: "Red Flag im Bett" },
        ],
      },
    },
    en: {
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
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.WavelengthSpectrums = WAVELENGTH;
})(window);
