/*
 * games/nhie.js — Never Have I Ever
 *
 * A confession deck. Each card shows "Never have I ever ___". Default (plain):
 * anyone who HAS done it owns up. Drinking mode: they drink instead.
 *
 * Content: content/nhie.js (Spielecke.NHIE). Drinking-capable (toggle in setup).
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  var DEFAULTS = { pool: "mixed", drinking: false };

  var els = null, ctx = null, settings = null;
  var queue = [];

  var module = {
    meta: {
      id: "nhie",
      name: "Never Have I Ever",
      tagline: "Owning up is the easy part. The stories aren't.",
      icon: "🙊",
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
      ctx = null; settings = null; queue = [];
    },
  };

  function renderSetup() {
    var pools = global.Spielecke.NHIE || {};
    var chips = ['<button class="chip" data-pool="mixed">' + t("🎯 Mixed") + "</button>"]
      .concat(Object.keys(pools).map(function (k) {
        return '<button class="chip" data-pool="' + attr(k) + '">' + esc(pools[k].label || k) + "</button>";
      })).join("");

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🙊 ' + t("Never Have I Ever") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <h3 class="sub">' + t("Category") + "</h3>" +
      '  <div class="chip-row" id="ni-pools">' + chips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="ni-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="ni-start" class="btn btn-primary btn-block btn-xl">' + t("Start ▶️") + "</button>" +
      "</section>";

    highlight("#ni-pools", settings.pool, "data-pool");
    els.querySelectorAll("#ni-pools .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.pool = c.getAttribute("data-pool"); ctx.store.set("pool", settings.pool);
        highlight("#ni-pools", settings.pool, "data-pool");
      });
    });
    els.querySelector("#ni-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    els.querySelector("#ni-start").addEventListener("click", function () {
      queue = buildQueue(settings.pool); renderCard();
    });
  }

  function renderCard() {
    var line = nextPrompt();
    els.innerHTML =
      '<section class="screen deck-card">' +
      '  <div class="deck-kicker">' + t("Never have I ever…") + "</div>" +
      '  <div class="deck-prompt">' + esc(line) + "</div>" +
      '  <p class="deck-rule">' +
      (settings.drinking ? t("Done it? Drink! 🍺") : t("Done it? Own up 🙋")) +
      "</p>" +
      '  <button id="ni-next" class="btn btn-primary btn-block btn-xl">' + t("Next ▶️") + "</button>" +
      '  <button id="ni-home" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "</section>";
    els.querySelector("#ni-next").addEventListener("click", renderCard);
    els.querySelector("#ni-home").addEventListener("click", function () { ctx.goHome(); });
  }

  function buildQueue(pool) {
    var pools = global.Spielecke.NHIE || {};
    var keys = Object.keys(pools);
    var items = (pool === "mixed" || !pools[pool])
      ? keys.reduce(function (a, k) { return a.concat(pools[k].prompts || []); }, [])
      : (pools[pool].prompts || []).slice();
    return shuffle(items.slice());
  }
  function nextPrompt() {
    if (!queue.length) queue = buildQueue(settings.pool);
    return queue.length ? queue.pop() : "make something up!";
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
  global.Spielecke.Games.nhie = module;
})(window);
