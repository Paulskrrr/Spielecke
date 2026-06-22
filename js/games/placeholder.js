/*
 * games/placeholder.js — Game Module Contract proof (spec §1.3)
 *
 * Not a real game. It exists to prove the shell <-> game interface end to end
 * before The Bomb is built:
 *   - exposes meta + mount(container, context) + unmount()
 *   - reads the shared roster from context.players
 *   - reads/writes context.store to prove namespaced persistence (a visit count)
 *   - calls context.goHome() to return to the shelf
 *   - starts a demo interval in mount() and clears it in unmount() so we can
 *     confirm no timers leak when navigating away.
 *
 * A real game module follows exactly this shape. Content (here, just the demo
 * copy) lives at the top of the module, separated from logic.
 */
(function (global) {
  "use strict";

  var CONTENT = {
    title: "Placeholder Game",
    blurb:
      "This card only exists to prove the shell works — navigation, the " +
      "shared roster, saved data, and clean teardown. Real games drop in here.",
  };

  // Per-module state for the current mount. Reset on every mount().
  var tickInterval = null;
  var rootEl = null;

  var module = {
    meta: {
      id: "placeholder",
      name: CONTENT.title,
      tagline: "Proof the shell works. Swap me for a real game.",
      icon: "🧪", // 🧪
      minPlayers: 1,
      isDrinkingGame: false,
    },

    mount: function (container, context) {
      rootEl = container;

      // Prove persistence + namespacing: bump a per-game visit counter.
      var visits = (context.store.get("visits", 0) || 0) + 1;
      context.store.set("visits", visits);

      var players = context.players || [];
      var rosterLine = players.length
        ? players.map(function (p) { return p.name; }).join(", ")
        : "No players yet — add some from the header.";

      container.innerHTML =
        '<section class="screen game-screen">' +
        '  <h2 class="screen-title neon">' + escapeHtml(CONTENT.title) + "</h2>" +
        '  <p class="muted">' + escapeHtml(CONTENT.blurb) + "</p>" +
        '  <div class="card-soft">' +
        '    <p><strong>Shared roster:</strong> ' + escapeHtml(rosterLine) + "</p>" +
        '    <p><strong>Times opened (saved):</strong> ' +
        '      <span class="neon-accent">' + visits + "</span></p>" +
        '    <p><strong>Demo timer:</strong> ' +
        '      <span id="ph-tick" class="neon-accent">0</span>s ' +
        '      <span class="muted">(must stop when you leave)</span></p>' +
        "  </div>" +
        '  <button id="ph-back" class="btn btn-primary btn-block">' +
        "    ← Back to shelf</button>" +
        "</section>";

      // Demo timer: proves unmount() cleanup. If this leaks, the number keeps
      // climbing after you leave the screen.
      var seconds = 0;
      var tickEl = container.querySelector("#ph-tick");
      tickInterval = global.setInterval(function () {
        seconds += 1;
        if (tickEl) tickEl.textContent = String(seconds);
      }, 1000);

      container.querySelector("#ph-back").addEventListener("click", function () {
        context.goHome();
      });
    },

    unmount: function () {
      if (tickInterval !== null) {
        global.clearInterval(tickInterval);
        tickInterval = null;
      }
      if (rootEl) {
        rootEl.innerHTML = "";
        rootEl = null;
      }
    },
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.placeholder = module;
})(window);
