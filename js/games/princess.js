/*
 * games/princess.js — Princess Treatment
 *
 * A debate deck. Each round shows something a partner does; the table decides:
 * Princess Treatment 👑 (above and beyond) or Bare Minimum 😐? The target
 * alternates every round between Princess (aimed at the women) and King (aimed
 * at the men), pulling gender-specific prompts, grouped by category.
 *
 * Not a drinking game — it's a hot-takes generator. No winner, no drinks.
 * Content: content/princess.js (Spielecke.Princess).
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function pools() { return global.Spielecke.L(global.Spielecke.Princess) || {}; }
  function Pools() { return global.Spielecke.Pools; }

  var els = null, ctx = null, settings = null;
  var isPrincess = true;
  var qPrincess = [], qKing = [];

  var module = {
    meta: {
      id: "princess",
      name: "Princess Treatment",
      tagline: "Going above and beyond, or just the bare minimum? Discuss.",
      icon: "👑",
      minPlayers: 1,
      supportsDrinking: false,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = { pools: Pools().load(context.store, pools()) };
      isPrincess = Math.random() < 0.5;
      renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; qPrincess = []; qKing = [];
    },
  };

  function renderSetup() {
    var chips = Pools().chipsHtml(pools(), t);

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">👑 ' + t("Princess Treatment") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <p class="muted small">' + t("Each round flips between 👑 Princess (for the girls) and 🤴 King (for the guys). Read the prompt, then the table calls it.") + "</p>" +
      '  <h3 class="sub">' + t("Category") + "</h3>" +
      '  <div class="chip-row" id="pr-pools">' + chips + "</div>" +
      '  <button id="pr-start" class="btn btn-primary btn-block btn-xl">' + t("Start ▶️") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#pr-pools"), pools(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); },
      function () { qPrincess = []; qKing = []; });
    els.querySelector("#pr-start").addEventListener("click", renderCard);
  }

  function renderCard() {
    var who = isPrincess
      ? { tag: t("👑 PRINCESS"), cls: "pt-princess", note: t("For the girls") }
      : { tag: t("🤴 KING"), cls: "pt-king", note: t("For the guys") };
    var prompt = nextPrompt(isPrincess);
    var treatLabel = isPrincess ? t("👑 Princess treatment") : t("🤴 King treatment");
    var treatWord = isPrincess
      ? t("Princess treatment, or bare minimum?")
      : t("King treatment, or bare minimum?");

    els.innerHTML =
      '<section class="screen pt-card ' + who.cls + '">' +
      '  <div class="pt-banner">' + who.tag + '<span class="pt-note">' + esc(who.note) + "</span></div>" +
      '  <div class="deck-prompt">' + esc(prompt) + "</div>" +
      '  <p class="deck-rule">' + treatWord + "</p>" +
      '  <div class="pt-actions">' +
      '    <button id="pr-yes" class="btn btn-got">' + treatLabel + "</button>" +
      '    <button id="pr-no" class="btn btn-skip">' + t("😐 Bare minimum") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelector("#pr-yes").addEventListener("click", nextRound);
    els.querySelector("#pr-no").addEventListener("click", nextRound);
  }

  function nextRound() {
    isPrincess = !isPrincess;
    renderCard();
  }

  function buildQueue(gender) {
    var field = gender ? "princess" : "king";
    return shuffle(Pools().gather(settings.pools, pools(), field).slice());
  }
  function nextPrompt(gender) {
    var q = gender ? qPrincess : qKing;
    if (!q.length) {
      q = buildQueue(gender);
      if (gender) qPrincess = q; else qKing = q;
    }
    return q.length ? q.pop() : t("Make one up!");
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
    return a;
  }
  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.princess = module;
})(window);
