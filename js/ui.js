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

  S.tappable = tappable;
  S.esc = esc;
  S.attr = attr;
})(window);
