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
  function poolsOf() { return global.Spielecke.L(global.Spielecke.NHIE) || {}; }
  function Pools() { return global.Spielecke.Pools; }

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
        pools: Pools().load(context.store, poolsOf()),
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
    var chips = Pools().chipsHtml(poolsOf(), t);

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🙊 ' + t("Never Have I Ever") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <h3 class="sub">' + t("Category") + "</h3>" +
      '  <div class="chip-row" id="ni-pools">' + chips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="ni-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="ni-start" class="btn btn-primary btn-block btn-xl">' + t("Start ▶️") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#ni-pools"), poolsOf(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); },
      function () { queue = []; });
    els.querySelector("#ni-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    els.querySelector("#ni-start").addEventListener("click", function () {
      queue = buildQueue(); renderCard();
    });
  }

  function renderCard() {
    var line = nextPrompt();
    els.innerHTML =
      '<section class="screen deck-card">' +
      '  <div class="deck-kicker">' + t("Never have I ever…") + "</div>" +
      '  <div class="deck-tapwrap">' +
      '    <div id="ni-card" class="deck-prompt">' + esc(line) + "</div>" +
      "  </div>" +
      '  <p class="deck-rule">' +
      (settings.drinking ? t("Done it? Drink! 🍺") : t("Done it? Own up 🙋")) +
      "</p>" +
      '  <div class="tap-hint">' + t("👆 Tap for the next") + "</div>" +
      "</section>";
    global.Spielecke.tappable(els.querySelector("#ni-card"), renderCard);
  }

  function buildQueue() {
    return shuffle(Pools().gather(settings.pools, poolsOf(), "prompts").slice());
  }
  function nextPrompt() {
    if (!queue.length) queue = buildQueue();
    return queue.length ? queue.pop() : "make something up!";
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
    return a;
  }
  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.nhie = module;
})(window);
