/*
 * games/liars.js — Liar's Numbers
 *
 * A numeric-guess game on one device. A question with a number answer shows;
 * the phone passes round and each player privately locks a guess. Reveal the
 * answer and sort by distance: closest wins, furthest loses (drinking mode:
 * furthest drinks). All-number, so it dodges any language "tell".
 *
 * Uses the shared roster for the pass order + names.
 * Content: content/numbers.js (Spielecke.NumberQuestions). Drinking-capable.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function pools() { return global.Spielecke.L(global.Spielecke.NumberQuestions) || {}; }
  function Pools() { return global.Spielecke.Pools; }

  var MIN_PLAYERS = 2;

  var els = null, ctx = null, settings = null;
  var players = [], question = null, guesses = [], idx = 0;

  var module = {
    meta: {
      id: "liars",
      name: "Liar's Numbers",
      tagline: "Everyone guesses a number. Closest wins, furthest eats it.",
      icon: "🔢",
      minPlayers: MIN_PLAYERS,
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
      ctx = null; settings = null; players = []; question = null; guesses = [];
    },
  };

  function renderSetup() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var chips = Pools().chipsHtml(pools(), t);

    var enough = roster.length >= MIN_PLAYERS;
    var note = enough
      ? '<p class="muted small">' + t("Players ({n}): {names}").replace("{n}", roster.length).replace("{names}", esc(roster.map(function (p) { return p.name; }).join(", "))) + "</p>"
      : '<div class="roster-warn" style="display:block">' + t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🔢 ' + t("Liar\'s Numbers") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      note +
      '  <h3 class="sub">' + t("Question pool") + "</h3>" +
      '  <div class="chip-row" id="ln-pools">' + chips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="ln-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="ln-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Start round ▶️") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#ln-pools"), pools(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); });
    els.querySelector("#ln-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    var start = els.querySelector("#ln-start");
    if (enough) start.addEventListener("click", function () { startRound(roster); });
  }

  function startRound(roster) {
    players = roster.map(function (p) { return p.name; });
    question = pickQuestion();
    guesses = [];
    idx = 0;
    renderPassTo();
  }

  function renderPassTo() {
    var name = players[idx];
    els.innerHTML =
      '<section class="screen ln-pass">' +
      '  <div class="pass-step">' + t("Player {i} of {n}").replace("{i}", idx + 1).replace("{n}", players.length) + "</div>" +
      '  <div class="pass-emoji">📲</div>' +
      '  <h2 class="pass-name pop">' + t("Pass to {name}").replace("{name}", esc(name)) + "</h2>" +
      '  <p class="muted">' + t("Lock your guess in private — don't let the others copy.") + "</p>" +
      '  <button id="ln-go" class="btn btn-primary btn-block btn-xl">' + t("I\'m {name} — reveal").replace("{name}", esc(name)) + "</button>" +
      "</section>";
    els.querySelector("#ln-go").addEventListener("click", renderEntry);
  }

  function renderEntry() {
    var name = players[idx];
    els.innerHTML =
      '<section class="screen ln-entry">' +
      '  <h3 class="sub">' + t("{name}'s guess").replace("{name}", esc(name)) + "</h3>" +
      '  <div class="ln-question">' + esc(question.q) + "</div>" +
      '  <input id="ln-input" class="text-input ln-input" type="number" inputmode="numeric" placeholder="' + t("Your number") + '" />' +
      '  <button id="ln-lock" class="btn btn-primary btn-block btn-xl">' + t("Lock it in 🔒") + "</button>" +
      "</section>";
    var input = els.querySelector("#ln-input");
    input.focus();
    els.querySelector("#ln-lock").addEventListener("click", function () {
      var v = parseFloat(input.value);
      if (isNaN(v)) v = 0;
      guesses.push({ name: name, guess: v });
      idx++;
      if (idx >= players.length) renderReveal();
      else renderPassTo();
    });
  }

  function renderReveal() {
    var a = question.a;
    var ranked = guesses.slice().sort(function (x, y) {
      return Math.abs(x.guess - a) - Math.abs(y.guess - a);
    });
    var winner = ranked[0];
    var loser = ranked[ranked.length - 1];

    var rows = ranked.map(function (g, i) {
      var d = Math.abs(g.guess - a);
      var tag = i === 0 ? "👑" : (i === ranked.length - 1 ? (settings.drinking ? "🍺" : "💀") : "");
      return (
        '<li class="ln-row' + (i === 0 ? " ln-row--win" : (i === ranked.length - 1 ? " ln-row--lose" : "")) + '">' +
        '<span class="ln-row__name">' + tag + " " + esc(g.name) + "</span>" +
        '<span class="ln-row__guess">' + fmt(g.guess) + ' <span class="muted">' + t("(off {n})").replace("{n}", fmt(d)) + "</span></span>" +
        "</li>"
      );
    }).join("");

    var loseLine = settings.drinking
      ? "🍺 <strong>" + esc(loser.name) + "</strong> " + t("was furthest — drink!")
      : "💀 <strong>" + esc(loser.name) + "</strong> " + t("was furthest off.");

    els.innerHTML =
      '<section class="screen ln-reveal">' +
      '  <div class="result-emoji">🔢</div>' +
      '  <h2 class="result-title pop">' + t("Answer: ") + fmt(a) + "</h2>" +
      '  <p class="result-sub">🏆 <strong>' + esc(winner.name) + "</strong> " + t("nailed it!") + "<br/>" + loseLine + "</p>" +
      '  <ul class="ln-list">' + rows + "</ul>" +
      '  <div class="stack">' +
      '    <button id="ln-next" class="btn btn-primary btn-block btn-xl">' + t("Next round 🔁") + "</button>" +
      '    <button id="ln-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#ln-next").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) startRound(roster); else renderSetup();
    });
    els.querySelector("#ln-settings").addEventListener("click", renderSetup);
  }

  function pickQuestion() {
    var list = Pools().gather(settings.pools, pools(), "questions");
    if (!list.length) return { q: t("Pick a number 1–100"), a: 50 };
    return list[Math.floor(Math.random() * list.length)];
  }

  function fmt(n) {
    return (Math.round(n * 100) / 100).toLocaleString("en-US");
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.liars = module;
})(window);
