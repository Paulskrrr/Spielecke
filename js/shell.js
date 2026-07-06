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
    global.addEventListener("keydown", onGlobalKeydown);
    runSplash();
  }

  // Intro: the app is already rendered behind the splash overlay, so after a
  // short beat we roll the splash up like a blind to reveal it, then drop it
  // from the DOM. Runs on every load — no "already seen" gate.
  function runSplash() {
    var splash = document.getElementById("splash");
    if (!splash) return;

    var done = false;
    function finish() {
      if (done) return; done = true;
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }
    // Reduced-motion users get no roll-up (CSS kills the transition), so don't
    // make them sit through the animation timers — clear after a short beat.
    var reduced = false;
    try { reduced = global.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* ignore */ }
    if (reduced) { global.setTimeout(finish, 350); return; }
    global.setTimeout(function () {
      splash.addEventListener("transitionend", finish);
      splash.classList.add("is-up");
      // fallback: fires if the transition's event is missed, so the splash
      // never gets stuck on screen.
      global.setTimeout(finish, 900);
    }, 500);
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
