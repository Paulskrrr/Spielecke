/*
 * pools.js — shared category-pool selection (multi-select) + draw-time guard
 *
 * Every content game (Never Have I Ever, Most Likely To, Imposter, Who Am I?,
 * Doodle, Wavelength, Liar's Numbers, Truth, Princess, Rank It, The Bomb) lets
 * you pick which category pools are in play. This used to be single-select with
 * a "Mixed" chip; now pools toggle on/off so several can be active at once.
 *
 * Selection model: an array of pool keys. An EMPTY array means "Alle/Mixed"
 * (draw from every available pool). The "🎯 Mixed" chip is the empty state.
 *
 * Correctness gate: `resolve()` is called at draw time with the pools FRESHLY
 * fetched for the current language. It drops any selected key the current
 * content no longer has (e.g. after a language switch or a scoped pool change)
 * and, if nothing valid remains, falls back to ALL keys — so a round can never
 * start with a stale/empty selection and run dry.
 */
(function (global) {
  "use strict";

  var S = (global.Spielecke = global.Spielecke || {});
  var ALL = "__all__"; // sentinel data-pool value for the Mixed/All chip

  function has(available, k) {
    return !!available && Object.prototype.hasOwnProperty.call(available, k);
  }
  var esc = global.Spielecke.esc;
  var attr = global.Spielecke.attr;

  // Resolve a stored selection into valid, currently-available keys.
  // Empty/invalid selection → ALL keys. This is the draw-time correctness gate.
  function resolve(selected, available) {
    var keys = available ? Object.keys(available) : [];
    if (!Array.isArray(selected) || !selected.length) return keys;
    var sel = selected.filter(function (k) { return has(available, k); });
    return sel.length ? sel : keys;
  }

  // Concatenate a `field` (e.g. "prompts", "pairs", "questions", "items",
  // "terms", "sets") across the resolved pools. Always a fresh array.
  function gather(selected, available, field) {
    return resolve(selected, available).reduce(function (acc, k) {
      var arr = available[k] && available[k][field];
      return Array.isArray(arr) ? acc.concat(arr) : acc;
    }, []);
  }

  // Migrate a legacy single value ("mixed"/key) to the new array model.
  function migrate(legacy, available) {
    if (!legacy || legacy === "mixed") return []; // [] = all
    return has(available, legacy) ? [legacy] : [];
  }

  // Load the persisted selection (new "pools" array, else migrate old "pool").
  function load(store, available) {
    var saved = store.get("pools", null);
    if (Array.isArray(saved)) {
      return saved.filter(function (k) { return has(available, k); });
    }
    return migrate(store.get("pool", "mixed"), available);
  }
  function save(store, selected) { store.set("pools", selected); }

  // The chip row: a Mixed/All chip first, then one toggle per pool.
  function chipsHtml(available, t) {
    var label = typeof t === "function" ? t("🎯 Mixed") : "🎯 Mixed";
    var out = '<button class="chip" data-pool="' + ALL + '">' + label + "</button>";
    out += Object.keys(available).map(function (k) {
      return '<button class="chip" data-pool="' + attr(k) + '">' + esc(available[k].label || k) + "</button>";
    }).join("");
    return out;
  }

  // Wire a chip row for multi-select. `get`/`set` read & write the selection
  // array; `onChange` (optional) fires after every toggle (reset cached queues).
  function bind(container, available, get, set, onChange) {
    if (!container) return;
    function paint() {
      var sel = get();
      var allOn = !sel.length;
      container.querySelectorAll(".chip").forEach(function (c) {
        var key = c.getAttribute("data-pool");
        var on = key === ALL ? allOn : (!allOn && sel.indexOf(key) !== -1);
        c.classList.toggle("chip--active", on);
      });
    }
    container.querySelectorAll(".chip").forEach(function (c) {
      c.addEventListener("click", function () {
        var key = c.getAttribute("data-pool");
        var sel = get().slice();
        if (key === ALL) {
          sel = []; // back to all
        } else if (!sel.length) {
          sel = [key]; // from all → focus just this pool
        } else {
          var i = sel.indexOf(key);
          if (i === -1) sel.push(key);
          else sel.splice(i, 1); // may empty → all
        }
        set(sel);
        paint();
        if (onChange) onChange();
      });
    });
    paint();
  }

  S.Pools = {
    ALL: ALL,
    resolve: resolve,
    gather: gather,
    migrate: migrate,
    load: load,
    save: save,
    chipsHtml: chipsHtml,
    bind: bind,
  };
})(window);
