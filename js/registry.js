/*
 * registry.js — the game registry (spec §1.2)
 *
 * The single list the shelf reads to render game cards. Adding a game is:
 *   1. drop in its module file (js/games/<id>.js) + a <script> tag in index.html
 *   2. add a `{ id, color }` row to LAYOUT below (position = tile order)
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

  // Shelf LAYOUT — the single source of truth for the home screen (spec §1.1).
  // The array order IS the tile order (fixed, no shuffle), and each game carries
  // its own fixed `color`. This is the one place to tweak both.
  //
  // ORDERING: the shelf is one continuous grid — no visible section headers —
  // but games are grouped by vibe so related ones sit together as you scroll:
  //   quick social icebreakers → party guessing/deduction → longer sit-down &
  //   team games → simple card & luck drinking games → fast-twitch reflex → co-op.
  //
  // COLOUR: hand-assigned per game (see the palette in styles/main.css). Two
  // anchors are fixed by preference — Hochadel = yellow, Doodle Drama = blue —
  // and the rest are laid out so no two neighbours (horizontal OR the 2-column
  // vertical) ever share a hue. When you re-order a game, glance at its new
  // neighbours' colours and pick one none of them use.
  // Colours available: yellow blue red teal purple orange green indigo pink.
  var LAYOUT = [
    // — quick social icebreakers —
    { id: "nhie",          color: "pink"   },
    { id: "mostlikely",    color: "purple" },
    { id: "hotpotato",     color: "orange" },
    { id: "whoami",        color: "teal"   },
    { id: "truth",         color: "red"    },
    { id: "princess",      color: "indigo" },
    // — party guessing & deduction —
    { id: "imposter",      color: "green"  },
    { id: "wavelength",    color: "blue"   },
    { id: "mindmeld",      color: "orange" },
    { id: "geheimauftrag", color: "indigo" },
    { id: "liars",         color: "teal"   },
    { id: "rankit",        color: "yellow" },
    // — longer sit-down & team games —
    { id: "activity",      color: "pink"   },
    { id: "quiz",          color: "purple" },
    { id: "doodle",        color: "blue"   },  // anchor
    { id: "geschmacklos",  color: "red"    },
    { id: "hochadel",      color: "yellow" },  // anchor
    // — simple card & luck drinking games —
    { id: "maxchen",       color: "indigo" },
    { id: "pferderennen",  color: "green"  },
    { id: "chooser",       color: "pink"   },
    { id: "fuckdealer",    color: "red"    },
    { id: "busfahrt",      color: "orange" },
    { id: "wettbuero",     color: "purple" },
    // — fast-twitch reflex —
    { id: "reaction",      color: "yellow" },
    { id: "simon",         color: "blue"   },
    { id: "ballon",        color: "pink"   },
    // — co-op —
    { id: "zeitzunder",    color: "red"    },
  ];

  // Build a registry entry straight from a module's meta so they never drift.
  // `color` comes from the LAYOUT row (shelf presentation, not intrinsic meta).
  function entry(module, color) {
    return {
      id: module.meta.id,
      name: module.meta.name,
      tagline: module.meta.tagline,
      icon: module.meta.icon,
      minPlayers: module.meta.minPlayers,
      supportsDrinking: !!module.meta.supportsDrinking,
      beta: !!module.meta.beta,
      color: color,
      module: module,
    };
  }

  function isValid(module) {
    return !!(module && module.meta && module.meta.id);
  }

  var GAMES = [];
  var missing = [];
  LAYOUT.forEach(function (row) {
    var module = Games[row.id];
    if (isValid(module)) GAMES.push(entry(module, row.color));
    else missing.push(row.id);
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
