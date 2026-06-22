/*
 * store.js — persistence layer (spec §0, §1.3)
 *
 * Wraps localStorage so the rest of the app never touches it directly. Two jobs:
 *   1. The shared player roster (entered once, used by every game).
 *   2. A per-game namespaced key/value store handed to modules via context.
 *
 * Everything degrades gracefully: if localStorage is missing or throws (private
 * mode, blocked, full), we fall back to an in-memory map so the app still runs.
 */
(function (global) {
  "use strict";

  var PREFIX = "spielecke";
  var ROSTER_KEY = PREFIX + ".roster";

  // In-memory fallback used when localStorage is unavailable.
  var memory = {};
  var backend = detectBackend();

  function detectBackend() {
    try {
      var probe = PREFIX + ".__probe__";
      global.localStorage.setItem(probe, "1");
      global.localStorage.removeItem(probe);
      return global.localStorage;
    } catch (e) {
      return null; // signal: use in-memory map
    }
  }

  function rawGet(key) {
    try {
      if (backend) return backend.getItem(key);
    } catch (e) {
      /* fall through to memory */
    }
    return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
  }

  function rawSet(key, value) {
    memory[key] = value; // always mirror to memory
    try {
      if (backend) backend.setItem(key, value);
    } catch (e) {
      /* keep the in-memory copy; ignore quota/security errors */
    }
  }

  function readJSON(key, fallback) {
    var raw = rawGet(key);
    if (raw == null) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    rawSet(key, JSON.stringify(value));
  }

  // --- Shared roster -------------------------------------------------------

  function rosterGet() {
    var players = readJSON(ROSTER_KEY, []);
    return Array.isArray(players) ? players : [];
  }

  function rosterSet(players) {
    writeJSON(ROSTER_KEY, Array.isArray(players) ? players : []);
  }

  // --- Per-game namespaced store (handed to modules via context) -----------
  // Keys land under "spielecke.game.<id>.<key>" so games never collide and a
  // future stats/leaderboard feature can read across them without redesign.

  function gameStore(gameId) {
    var base = PREFIX + ".game." + gameId + ".";
    return {
      get: function (key, fallback) {
        return readJSON(base + key, fallback);
      },
      set: function (key, value) {
        writeJSON(base + key, value);
      },
    };
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Store = {
    rosterGet: rosterGet,
    rosterSet: rosterSet,
    gameStore: gameStore,
    // true when persistence is real (not the in-memory fallback)
    isPersistent: !!backend,
  };
})(window);
