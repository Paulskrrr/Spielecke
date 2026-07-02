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
  function Pools() { return global.Spielecke.Pools; }

  var els = null, ctx = null, settings = null;
  var queue = [], lastId = null;

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
        pools: Pools().load(context.store, pools()),
        drinking: context.store.get("drinking", false) === true,
      };
      renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; queue = []; lastId = null;
    },
  };

  function renderSetup() {
    var chips = Pools().chipsHtml(pools(), t);

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🍸 ' + t("Truth or Drink") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <h3 class="sub">' + t("Category") + "</h3>" +
      '  <div class="chip-row" id="tr-pools">' + chips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="tr-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode (dodge by drinking)") + "</span></label>" +
      '  <button id="tr-start" class="btn btn-primary btn-block btn-xl">' + t("Start ▶️") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#tr-pools"), pools(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); },
      function () { queue = []; });
    els.querySelector("#tr-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    els.querySelector("#tr-start").addEventListener("click", function () {
      queue = buildQueue(); renderCard();
    });
  }

  function renderCard() {
    var name = pickName();
    var who = name ? "👉 " + esc(name) : "👉 " + t("Whoever drew it");

    els.innerHTML =
      '<section class="screen deck-card">' +
      '  <div class="deck-kicker">' + who + "</div>" +
      '  <div class="deck-tapwrap">' +
      '    <div id="tr-card" class="deck-prompt" role="button" data-primary>' + esc(nextPrompt()) + "</div>" +
      "  </div>" +
      '  <p class="deck-rule">' + (settings.drinking ? t("Answer honestly, or take a 🍺 drink to dodge.") : t("Answer honestly!")) + "</p>" +
      '  <div class="tap-hint">' + t("👆 Tap for the next") + "</div>" +
      "</section>";
    global.Spielecke.tappable(els.querySelector("#tr-card"), renderCard);
  }

  function pickName() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    if (!roster.length) return null;
    if (roster.length === 1) { lastId = roster[0].id; return roster[0].name; }
    // Filter by id, not name, so duplicate player names can't stall this — a
    // name-equality loop never terminates when every player shares a name.
    var candidates = roster.filter(function (p) { return p.id !== lastId; });
    if (!candidates.length) candidates = roster; // shouldn't happen, but never hang
    var p = candidates[Math.floor(Math.random() * candidates.length)];
    lastId = p.id;
    return p.name;
  }

  function buildQueue() {
    return shuffle(Pools().gather(settings.pools, pools(), "prompts").slice());
  }
  function nextPrompt() {
    if (!queue.length) queue = buildQueue();
    return queue.length ? queue.pop() : "Make one up!";
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
    return a;
  }
  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.truth = module;
})(window);
