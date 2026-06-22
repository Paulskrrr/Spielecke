/*
 * registry.js — the game registry (spec §1.2)
 *
 * The single list the shelf reads to render game cards. Adding a game later is:
 *   1. drop in its module file (js/games/<id>.js) + a <script> tag in index.html
 *   2. append one entry here pointing module -> that module
 *
 * Each entry mirrors the module's meta plus the module reference itself.
 */
(function (global) {
  "use strict";

  var Games = (global.Spielecke && global.Spielecke.Games) || {};

  // Helper: build a registry entry straight from a module's meta so the two
  // never drift apart.
  function entry(module) {
    return {
      id: module.meta.id,
      name: module.meta.name,
      tagline: module.meta.tagline,
      icon: module.meta.icon,
      minPlayers: module.meta.minPlayers,
      isDrinkingGame: module.meta.isDrinkingGame,
      module: module,
    };
  }

  var GAMES = [
    entry(Games.bomb),
    entry(Games.whoami),
    entry(Games.imposter),
    entry(Games.wavelength),
    // Future games appended here (Liar's Numbers, Higher or Lower, ...).
  ];

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.GAMES = GAMES;
})(window);
