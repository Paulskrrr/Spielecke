/*
 * games/mostlikely.js — Most Likely To
 *
 * A pointing deck. Each card shows "Most likely to ___". On 3-2-1 everyone
 * points at a player. Default (plain): most fingers takes the crown 👑.
 * Drinking mode: most fingers drinks. (The app shows the prompt + call — the
 * pointing/counting is physical.)
 *
 * Content: content/most-likely.js (Spielecke.MostLikely). Drinking-capable.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function poolsOf() { return global.Spielecke.L(global.Spielecke.MostLikely) || {}; }
  function Pools() { return global.Spielecke.Pools; }

  var els = null, ctx = null, settings = null, queue = [];

  var module = {
    meta: {
      id: "mostlikely",
      name: "Most Likely To",
      tagline: "Point on three. No takebacks.",
      icon: "🫵",
      minPlayers: 3,
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
      '  <h2 class="screen-title pop">🫵 ' + t("Most Likely To") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <h3 class="sub">' + t("Category") + "</h3>" +
      '  <div class="chip-row" id="ml-pools">' + chips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="ml-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="ml-start" class="btn btn-primary btn-block btn-xl">' + t("Start ▶️") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#ml-pools"), poolsOf(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); },
      function () { queue = []; });
    els.querySelector("#ml-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    els.querySelector("#ml-start").addEventListener("click", function () {
      queue = buildQueue(); renderCard();
    });
  }

  function renderCard() {
    var line = nextPrompt();
    els.innerHTML =
      '<section class="screen deck-card">' +
      '  <div class="deck-kicker">' + t("Most likely to…") + "</div>" +
      '  <div class="deck-tapwrap">' +
      '    <div id="ml-card" class="deck-prompt">' + esc(line) + "</div>" +
      "  </div>" +
      '  <p class="deck-rule">' + t("3… 2… 1… POINT! 🫵") + "<br/>" +
      (settings.drinking ? t("Most fingers drinks 🍺") : t("Most fingers takes the crown 👑")) +
      "</p>" +
      '  <div class="tap-hint">' + t("👆 Tap for the next") + "</div>" +
      "</section>";
    global.Spielecke.tappable(els.querySelector("#ml-card"), renderCard);
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
  global.Spielecke.Games.mostlikely = module;
})(window);
