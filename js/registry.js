// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
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
  // but games are grouped by vibe so related ones sit together as you scroll.
  // The active/drinking games sit ABOVE the slower sit-down games, so a night
  // that leans boozy finds its games first:
  //   quick social icebreakers → party guessing/deduction → simple card & luck
  //   drinking games → fast-twitch reflex → longer sit-down & team games → co-op.
  // BETA games sink to the very bottom: Kommando (simon) is the last tile while
  // its speechSynthesis path is road-tested with the group.
  //
  // COLOUR: three anchors are fixed by preference — Hochadel = yellow, Doodle
  // Drama = blue, Imposter = red. The rest sweep the full 9-colour palette so no
  // hue repeats before the whole palette has appeared (no "random repeat"
  // feeling). The first tile carries no colour requirement. Within that, no two
  // neighbours (distance 1–3, i.e. horizontal + the 2/3-column verticals) share
  // a hue OR a close family (teal/green, blue/indigo, red/pink, yellow/orange).
  // Re-solve with scratch: keep each block of 9 a full permutation and you can't
  // go wrong. With 26 tiles the blocks run 9/9/8, so the final block shows 8 of
  // the 9 colours (still no repeat inside it).
  // Colours available: yellow blue red teal purple orange green indigo pink.
  //
  // NOT on the shelf: Geheimauftrag. It's an all-evening meta-layer you deal
  // once at the start of a real games night, not something you dip into for a
  // quick round — so it lives as a discreet 🕶️ button on the Players screen
  // (see roster.js) instead of taking a tile here.
  var LAYOUT = [
    // — quick social icebreakers —   (block 1: full palette sweep)
    { id: "nhie",          color: "yellow" },
    { id: "mostlikely",    color: "blue"   },
    { id: "hotpotato",     color: "pink"   },
    { id: "whoami",        color: "teal"   },
    { id: "truth",         color: "purple" },
    { id: "princess",      color: "orange" },
    // — party guessing & deduction —
    { id: "imposter",      color: "red"    },  // anchor
    { id: "wavelength",    color: "green"  },
    { id: "mindmeld",      color: "indigo" },
    // — simple card & luck drinking games —   (block 2: full palette sweep)
    { id: "liars",         color: "yellow" },
    { id: "rankit",        color: "red"    },
    { id: "maxchen",       color: "teal"   },
    { id: "pferderennen",  color: "purple" },
    { id: "chooser",       color: "blue"   },
    { id: "fuckdealer",    color: "orange" },
    { id: "busfahrt",      color: "green"  },
    { id: "wettbuero",     color: "pink"   },
    // — fast-twitch reflex —
    { id: "reaction",      color: "indigo" },
    { id: "ballon",        color: "purple" },  // block 3 starts here: 8-colour sweep
    // — longer sit-down & team games —
    { id: "activity",      color: "orange" },
    { id: "quiz",          color: "red"    },
    { id: "doodle",        color: "blue"   },  // anchor
    { id: "geschmacklos",  color: "green"  },
    { id: "hochadel",      color: "yellow" },  // anchor
    // — co-op —
    { id: "zeitzunder",    color: "pink"   },
    // — BETA sinks to the bottom —
    { id: "luegen",        color: "teal"   },
    { id: "simon",         color: "indigo" },
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
