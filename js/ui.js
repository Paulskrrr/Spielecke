/*
 * ui.js — tiny shared UI helpers
 *
 * tappable(el, handler): turn a design element (a card, a wheel, a prompt) into
 * the action trigger itself, instead of a separate button below it. Adds the
 * .tappable class (cursor + haptic press feedback in CSS), wires click, and
 * keeps it keyboard-accessible (Enter/Space) with button semantics.
 *
 * esc(s) / attr(s): the shared HTML escapers used by every screen and game that
 * builds innerHTML. esc() neutralises text for element content; attr() also
 * escapes ' for values inside single-quoted attributes. Loads before all
 * games/screens (see index.html) so modules can alias them at definition time.
 *
 * shuffle(arr): a pure Fisher-Yates that returns a NEW array, leaving the input
 * untouched. Turn-order games (Doodle, Quiz, Wavelength, …) call this when a
 * round starts so the roster order isn't identical every round — the entered
 * roster stays the canonical list; only that round's play order is randomised.
 */
(function (global) {
  "use strict";

  var S = (global.Spielecke = global.Spielecke || {});

  function tappable(el, handler) {
    if (!el || typeof handler !== "function") return el;
    el.classList.add("tappable");
    if (!el.hasAttribute("role")) el.setAttribute("role", "button");
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    el.addEventListener("click", handler);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handler(e);
      }
    });
    return el;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function attr(s) {
    return esc(s).replace(/'/g, "&#39;");
  }

  function shuffle(arr) {
    var a = Array.isArray(arr) ? arr.slice() : [];
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  S.tappable = tappable;
  S.esc = esc;
  S.attr = attr;
  S.shuffle = shuffle;
})(window);
