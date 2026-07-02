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
  function t(k) { return S.t(k); }

  var headerEl = null;
  var contentEl = null;
  var currentGame = null; // the mounted module, or null on shelf/roster

  function boot() {
    headerEl = document.getElementById("app-header");
    contentEl = document.getElementById("app");
    renderHeader();
    showShelf();
    try { global.history.replaceState({ screen: "shelf" }, "", global.location.href); } catch (e) { /* ignore */ }
    global.addEventListener("keydown", onGlobalKeydown);
    global.addEventListener("popstate", onPopState);
    global.addEventListener("beforeunload", onBeforeUnload);
  }

  // --- History / navigation lifecycle --------------------------------------
  //
  // Every game except Hochadel keeps its round in memory only, and the shell
  // is a single-page app with no path/hash routing — so without this, the
  // phone's Back button/gesture doesn't return from a game to the shelf, it
  // leaves the site outright and the round is gone. Entering a game or the
  // roster pushes one history entry; ANY back navigation while one is live
  // routes to the shelf instead (never mind exactly how deep the stack got —
  // a stray shelf<->game bounce may cost an extra back-press, but a round is
  // never lost to a single accidental swipe). A second back-press from the
  // shelf then exits normally, same as before this existed.
  function pushNonShelfState(screen, id) {
    try { global.history.pushState({ screen: screen, id: id || null }, "", global.location.href); } catch (e) { /* ignore */ }
  }
  function onPopState() {
    showShelf();
  }

  // A refresh (or iOS reclaiming a backgrounded tab) has no in-app warning
  // otherwise — this only engages while a game is actually mounted.
  function onBeforeUnload(e) {
    if (!currentGame) return;
    e.preventDefault();
    e.returnValue = ""; // required by Chrome for the native leave-site prompt
  }

  // Spacebar = "do the going-concern action of this screen" — the one move that
  // keeps a round flowing (draw / roll / pass / next / reveal …). Only active
  // while a game is mounted, so it never fires on the shelf or roster.
  //
  // Resolution: an explicit [data-primary] wins (e.g. Hochadel's deck, Mäxchen's
  // hat — actions that aren't a .btn-primary). Otherwise we fall back to the
  // screen's primary button, which every game uses as its single forward action.
  // Binary-choice screens (got/missed, higher/lower, quiz options) deliberately
  // use other classes, so space correctly does nothing there. We never hijack
  // typing and skip disabled buttons; preventDefault stops the page scroll-jump.
  function isTypingTarget(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable === true;
  }
  function onGlobalKeydown(e) {
    if (e.code !== "Space" && e.key !== " " && e.keyCode !== 32) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!currentGame || !contentEl) return; // only during gameplay
    if (isTypingTarget(e.target)) return;
    if (e.repeat) return; // holding the key shouldn't machine-gun the action
    // A tappable element (ui.js) runs its own Space handler first and calls
    // preventDefault — if that already happened, standing down here avoids
    // firing the same [data-primary] action a second time.
    if (e.defaultPrevented) return;
    // A focused native <button> handles Space itself via the browser's
    // default action (e.g. Hochadel's "Cancel" next to its primary deck) —
    // don't hijack that and click a different button instead.
    if (e.target && e.target.tagName === "BUTTON") return;
    var btns = contentEl.querySelectorAll("[data-primary]:not([disabled])");
    if (!btns.length) {
      btns = contentEl.querySelectorAll(".btn-primary:not([disabled])");
    }
    if (btns.length) {
      e.preventDefault();
      btns[btns.length - 1].click();
    }
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

  // Jump back to the top whenever we change screens, so e.g. scrolling the
  // shelf and tapping a game doesn't land you mid-page in that game.
  function scrollTop() {
    try { global.scrollTo(0, 0); } catch (e) { /* ignore */ }
    if (contentEl) contentEl.scrollTop = 0;
  }

  function showShelf() {
    teardownCurrent();
    S.Shelf.render(contentEl, { mountGame: mountGame });
    renderHeader();
    scrollTop();
  }

  function showRoster() {
    teardownCurrent();
    pushNonShelfState("roster");
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
    scrollTop();
  }

  function mountGame(meta) {
    teardownCurrent();
    pushNonShelfState("game", meta.id);
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
        '<section class="screen"><p class="muted">' + t("This game failed to load.") + '</p>' +
        '<button id="err-back" class="btn btn-primary btn-block">' + t("← Back to shelf") + '</button></section>';
      contentEl.querySelector("#err-back").addEventListener("click", showShelf);
    }
    renderHeader();
    scrollTop();
  }

  // --- Header --------------------------------------------------------------

  function renderHeader() {
    var count = Store.rosterGet().length;
    headerEl.innerHTML =
      '<button id="brand" class="brand" aria-label="Home">' +
      '  <img class="brand__logo" src="assets/logo.png" alt="Pauls Spielecke" />' +
      "</button>" +
      '<button id="edit-players" class="players-badge" aria-label="' + t("Edit") + '">' +
      '  <span class="players-badge__count">' + count + "</span>" +
      '  <span class="players-badge__label">' + t(count === 1 ? "player" : "players") + "</span>" +
      "</button>";

    headerEl.querySelector("#brand").addEventListener("click", function () { leaveGameFirst(showShelf); });
    headerEl.querySelector("#edit-players").addEventListener("click", function () { leaveGameFirst(showRoster); });
  }

  // The header (brand + players badge) is reachable from every screen, sits
  // right where a phone is gripped when passed around, and used to tear down
  // a mounted game with zero warning on a stray tap. Only guards these two
  // header buttons — an in-game "back to shelf"/"give up" button is already
  // a deliberate choice to leave, so it isn't asked to confirm itself twice.
  // Games that persist+reconcile their own state (meta.persistsState, e.g.
  // Hochadel) survive a teardown for real, so there's nothing to warn about.
  function leaveGameFirst(action) {
    var atRisk = currentGame && !(currentGame.meta && currentGame.meta.persistsState);
    if (!atRisk || global.confirm(t("Leave this game? The round will be lost."))) {
      action();
    }
  }

  // Boot once the DOM is ready.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  S.Shell = { showShelf: showShelf, showRoster: showRoster, mountGame: mountGame };
})(window);
