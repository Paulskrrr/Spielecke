// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
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

  // --- Seeded RNG (deterministic, cross-device) ---------------------------
  // No network/sync: instead every device derives the SAME shuffle from a short
  // shared code. hashStr → 32-bit seed, mulberry32 → PRNG, seededShuffle → a
  // pure Fisher-Yates driven by it. Same (arr, seedStr) → identical output on
  // every phone, so disjoint per-player deals need no broker (see Geschmacklos).
  function hashStr(s) {
    var h = 2166136261 >>> 0;              // FNV-1a
    s = String(s);
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seededShuffle(arr, seedStr) {
    var a = Array.isArray(arr) ? arr.slice() : [];
    var rand = mulberry32(hashStr(seedStr));
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // --- Haptics -------------------------------------------------------------
  // One light tick the moment a finger lands on any interactive element, in
  // sync with the CSS press-down — so every button feels like a physical key.
  // Delegated once here instead of wired per game; navigator.vibrate is a
  // no-op where unsupported (iOS Safari), so this degrades silently. Games
  // with their own stronger patterns (pop, boom) just layer on top.
  function haptic(pattern) {
    try {
      if (global.navigator && typeof global.navigator.vibrate === "function") {
        global.navigator.vibrate(pattern || 10);
      }
    } catch (e) { /* ignore */ }
  }
  global.document.addEventListener(
    "pointerdown",
    function (e) {
      if (e.pointerType === "mouse") return; // touch/pen only
      var t = e.target;
      var el = t && t.closest ? t.closest("button, .tappable, .toggle") : null;
      if (el && !el.disabled) haptic(8);
    },
    { passive: true }
  );

  S.tappable = tappable;
  S.esc = esc;
  S.attr = attr;
  S.shuffle = shuffle;
  S.seededShuffle = seededShuffle;
  S.haptic = haptic;
})(window);
