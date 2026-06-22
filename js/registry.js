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

  var GAMES = [
    {
      id: Games.placeholder.meta.id,
      name: Games.placeholder.meta.name,
      tagline: Games.placeholder.meta.tagline,
      icon: Games.placeholder.meta.icon,
      minPlayers: Games.placeholder.meta.minPlayers,
      isDrinkingGame: Games.placeholder.meta.isDrinkingGame,
      module: Games.placeholder,
    },
    // Future games appended here (The Bomb, Liar's Numbers, ...).
  ];

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.GAMES = GAMES;
})(window);
