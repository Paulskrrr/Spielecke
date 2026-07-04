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
 *
 * drawBag(build): the shared "draw without repeats until exhausted, then
 * reshuffle" queue every content-pool game wants. `build` is called with no
 * args and must return a fresh array each time (so it can react to a changed
 * pool selection) — the bag shuffles lazily on first use and whenever it runs
 * dry. next(fallback) pops one item, returning fallback if build() is empty.
 * reset() drops the current queue so the next draw rebuilds from `build()`
 * (call this when the active pools change). Also guards the one seam a naive
 * version gets wrong: since a reshuffle is independent of what was just
 * drawn, the freshly-shuffled queue could otherwise put the same item right
 * back on top — next() swaps that away when there's more than one item.
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

  function drawBag(build) {
    var queue = [];
    var last; // the previously-drawn item, so a reshuffle can't repeat it immediately

    function refill() {
      queue = shuffle(build());
      if (queue.length > 1 && queue[queue.length - 1] === last) {
        var swapWith = Math.floor(Math.random() * (queue.length - 1));
        var tmp = queue[queue.length - 1];
        queue[queue.length - 1] = queue[swapWith];
        queue[swapWith] = tmp;
      }
    }

    return {
      next: function (fallback) {
        if (!queue.length) refill();
        if (!queue.length) return fallback;
        last = queue.pop();
        return last;
      },
      reset: function () {
        queue = [];
        last = undefined;
      },
    };
  }

  S.tappable = tappable;
  S.esc = esc;
  S.attr = attr;
  S.shuffle = shuffle;
  S.drawBag = drawBag;
})(window);
