/*
 * shell.js — the app skeleton & router (spec §1.1, §1.3, §1.4)
 *
 * Boots last (after store, games, registry, screens). Owns:
 *   - the persistent header (brand + roster badge + edit-players button)
 *   - a tiny router between shelf / roster / game screens
 *   - mounting/unmounting game modules against the Game Module Contract
 *
 * Critical contract rule: before leaving a mounted game we call its unmount()
 * so timers/listeners/audio are torn down — no leaks (spec §1.3/§1.4).
 */
(function (global) {
  "use strict";

  var S = global.Spielecke;
  var Store = S.Store;

  var headerEl = null;
  var contentEl = null;
  var currentGame = null; // the mounted module, or null on shelf/roster

  function boot() {
    headerEl = document.getElementById("app-header");
    contentEl = document.getElementById("app");
    renderHeader();
    showShelf();
  }

  // --- Teardown helper -----------------------------------------------------

  function teardownCurrent() {
    if (currentGame && typeof currentGame.unmount === "function") {
      try {
        currentGame.unmount();
      } catch (e) {
        /* never let a faulty game break navigation */
      }
    }
    currentGame = null;
    contentEl.innerHTML = "";
  }

  // --- Screens -------------------------------------------------------------

  function showShelf() {
    teardownCurrent();
    S.Shelf.render(contentEl, { mountGame: mountGame });
    renderHeader();
  }

  function showRoster() {
    teardownCurrent();
    S.Roster.render(contentEl, {
      getRoster: function () {
        return Store.rosterGet();
      },
      setRoster: function (players) {
        Store.rosterSet(players);
      },
      goHome: showShelf,
      refreshHeader: renderHeader,
    });
    renderHeader();
  }

  function mountGame(meta) {
    teardownCurrent();
    currentGame = meta.module;

    // The context handed to every game module (spec §1.3). Roster is a
    // read-only copy; games never touch global state except through this.
    var context = {
      players: Store.rosterGet(),
      store: Store.gameStore(meta.id),
      goHome: showShelf,
    };

    try {
      currentGame.mount(contentEl, context);
    } catch (e) {
      currentGame = null;
      contentEl.innerHTML =
        '<section class="screen"><p class="muted">This game failed to load.</p>' +
        '<button id="err-back" class="btn btn-primary btn-block">← Back to shelf</button></section>';
      contentEl.querySelector("#err-back").addEventListener("click", showShelf);
    }
    renderHeader();
  }

  // --- Header --------------------------------------------------------------

  function renderHeader() {
    var count = Store.rosterGet().length;
    headerEl.innerHTML =
      '<button id="brand" class="brand" aria-label="Home">' +
      '  <span class="brand__mark">▶</span>' +
      '  <span class="brand__name neon">Spielecke</span>' +
      "</button>" +
      '<button id="edit-players" class="players-badge">' +
      '  <span class="players-badge__count">' + count + "</span>" +
      '  <span class="players-badge__label">' +
      (count === 1 ? "player" : "players") + "</span>" +
      '  <span class="players-badge__edit">Edit</span>' +
      "</button>";

    headerEl.querySelector("#brand").addEventListener("click", showShelf);
    headerEl.querySelector("#edit-players").addEventListener("click", showRoster);
  }

  // Boot once the DOM is ready.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  S.Shell = { showShelf: showShelf, showRoster: showRoster, mountGame: mountGame };
})(window);
