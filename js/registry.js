/*
 * registry.js — the game registry (spec §1.2)
 *
 * The single list the shelf reads to render game cards. Adding a game is:
 *   1. drop in its module file (js/games/<id>.js) + a <script> tag in index.html
 *   2. append one entry here via entry(Games.<id>)
 *
 * `supportsDrinking` (from each module's meta) means the game has an optional
 * drinking mode you toggle in its setup — NOT that it's always a drinking game.
 */
(function (global) {
  "use strict";

  var Games = (global.Spielecke && global.Spielecke.Games) || {};

  // Build a registry entry straight from a module's meta so they never drift.
  function entry(module) {
    return {
      id: module.meta.id,
      name: module.meta.name,
      tagline: module.meta.tagline,
      icon: module.meta.icon,
      minPlayers: module.meta.minPlayers,
      supportsDrinking: !!module.meta.supportsDrinking,
      module: module,
    };
  }

  var GAMES = [
    entry(Games.hotpotato),
    entry(Games.mostlikely),
    entry(Games.nhie),
    entry(Games.whoami),
    entry(Games.imposter),
    entry(Games.wavelength),
    entry(Games.liars),
    entry(Games.princess),
    entry(Games.doodle),
    entry(Games.activity),
    entry(Games.quiz),
    entry(Games.truth),
    entry(Games.chooser),
    entry(Games.reaction),
    entry(Games.rankit),
    entry(Games.hochadel),
    entry(Games.maxchen),
    entry(Games.busfahrt),
    entry(Games.fuckdealer),
    entry(Games.pferderennen),
  ];

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.GAMES = GAMES;
})(window);
