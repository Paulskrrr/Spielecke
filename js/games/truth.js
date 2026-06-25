/*
 * games/truth.js — Truth or Drink
 *
 * A random player is put on the spot with a truth question. Plain mode: just
 * answer honestly. Drinking mode: answer honestly, or take a drink to dodge it.
 *
 * Picks a random player from the shared roster each round (no immediate repeat).
 * Content: content/truth.js (Spielecke.TruthQuestions). Drinking-capable.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function pools() { return global.Spielecke.L(global.Spielecke.TruthQuestions) || {}; }

  var DEFAULTS = { pool: "mixed", drinking: false };

  var els = null, ctx = null, settings = null;
  var queue = [], lastName = null;

  var module = {
    meta: {
      id: "truth",
      name: "Truth or Drink",
      tagline: "Spill it, or sip it. One of you is on the spot.",
      icon: "🍸",
      minPlayers: 2,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        pool: context.store.get("pool", DEFAULTS.pool) || DEFAULTS.pool,
        drinking: context.store.get("drinking", false) === true,
      };
      renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; queue = []; lastName = null;
    },
  };

  function renderSetup() {
    var p = pools();
    var chips = ['<button class="chip" data-pool="mixed">' + t("🎯 Mixed") + "</button>"]
      .concat(Object.keys(p).map(function (k) {
        return '<button class="chip" data-pool="' + attr(k) + '">' + esc(p[k].label || k) + "</button>";
      })).join("");

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🍸 ' + t("Truth or Drink") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <h3 class="sub">' + t("Category") + "</h3>" +
      '  <div class="chip-row" id="tr-pools">' + chips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="tr-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode (dodge by drinking)") + "</span></label>" +
      '  <button id="tr-start" class="btn btn-primary btn-block btn-xl">' + t("Start ▶️") + "</button>" +
      "</section>";

    highlight("#tr-pools", settings.pool, "data-pool");
    els.querySelectorAll("#tr-pools .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.pool = c.getAttribute("data-pool"); ctx.store.set("pool", settings.pool);
        highlight("#tr-pools", settings.pool, "data-pool");
      });
    });
    els.querySelector("#tr-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    els.querySelector("#tr-start").addEventListener("click", function () {
      queue = buildQueue(settings.pool); renderCard();
    });
  }

  function renderCard() {
    var name = pickName();
    var who = name ? "👉 " + esc(name) : "👉 " + t("Whoever drew it");

    els.innerHTML =
      '<section class="screen deck-card">' +
      '  <div class="deck-kicker">' + who + "</div>" +
      '  <div class="deck-prompt">' + esc(nextPrompt()) + "</div>" +
      '  <p class="deck-rule">' + (settings.drinking ? t("Answer honestly, or take a 🍺 drink to dodge.") : t("Answer honestly!")) + "</p>" +
      '  <button id="tr-next" class="btn btn-primary btn-block btn-xl">' + t("Next ▶️") + "</button>" +
      '  <button id="tr-home" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "</section>";
    els.querySelector("#tr-next").addEventListener("click", renderCard);
    els.querySelector("#tr-home").addEventListener("click", function () { ctx.goHome(); });
  }

  function pickName() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    if (!roster.length) return null;
    if (roster.length === 1) return roster[0].name;
    var name;
    do { name = roster[Math.floor(Math.random() * roster.length)].name; }
    while (name === lastName);
    lastName = name;
    return name;
  }

  function buildQueue(pool) {
    var p = pools();
    var keys = Object.keys(p);
    var items = (pool === "mixed" || !p[pool])
      ? keys.reduce(function (a, k) { return a.concat(p[k].prompts || []); }, [])
      : (p[pool].prompts || []).slice();
    return shuffle(items.slice());
  }
  function nextPrompt() {
    if (!queue.length) queue = buildQueue(settings.pool);
    return queue.length ? queue.pop() : "Make one up!";
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
    return a;
  }
  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) { c.classList.toggle("chip--active", c.getAttribute(an) === value); });
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.truth = module;
})(window);
