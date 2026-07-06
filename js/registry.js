/*
 * registry.js — the game registry (spec §1.2)
 *
 * The single list the shelf reads to render game cards. Adding a game is:
 *   1. drop in its module file (js/games/<id>.js) + a <script> tag in index.html
 *   2. append its id to ORDER below
 *
 * `supportsDrinking` (from each module's meta) means the game has an optional
 * drinking mode you toggle in its setup — NOT that it's always a drinking game.
 *
 * RESILIENCE: the shelf must survive one game failing to load. Classic <script>
 * tags run in order and each module registers itself on Spielecke.Games — but a
 * single tag that 404s (stale cache after a rename), hits a flaky network, or
 * trips a syntax feature the browser rejects leaves that one module undefined.
 * We therefore build the list defensively: any id whose module is missing or
 * malformed is SKIPPED (and logged), so the other games still show. Building the
 * array eagerly used to throw on the first missing module and wipe out the whole
 * shelf — leaving only the "Coming soon" tile.
 */
(function (global) {
  "use strict";

  var Games = (global.Spielecke && global.Spielecke.Games) || {};

  // Shelf order. Every id here must have a matching <script> in index.html.
  var ORDER = [
    "hotpotato", "mostlikely", "nhie", "whoami", "imposter", "wavelength",
    "liars", "princess", "doodle", "activity", "quiz", "truth", "chooser",
    "reaction", "rankit", "hochadel", "maxchen", "busfahrt", "fuckdealer",
    "pferderennen", "zeitzunder",
    "ballon", "wettbuero", "mindmeld", "geheimauftrag", "simon", "geschmacklos",
  ];

  // Build a registry entry straight from a module's meta so they never drift.
  function entry(module) {
    return {
      id: module.meta.id,
      name: module.meta.name,
      tagline: module.meta.tagline,
      icon: module.meta.icon,
      minPlayers: module.meta.minPlayers,
      supportsDrinking: !!module.meta.supportsDrinking,
      beta: !!module.meta.beta,
      module: module,
    };
  }

  function isValid(module) {
    return !!(module && module.meta && module.meta.id);
  }

  var GAMES = [];
  var missing = [];
  ORDER.forEach(function (id) {
    var module = Games[id];
    if (isValid(module)) GAMES.push(entry(module));
    else missing.push(id);
  });

  if (missing.length && global.console && global.console.warn) {
    global.console.warn(
      "[Spielecke] " + missing.length + " game module(s) failed to load and were skipped: " +
      missing.join(", ") + ". Check the <script> tags and network/cache for these files."
    );
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.GAMES = GAMES;
})(window);
