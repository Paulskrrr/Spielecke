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
  var bag = global.Spielecke.drawBag(function () { return Pools().gather(settings.pools, pools(), "questions"); });

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
      bag.reset();
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
      function (v) { settings.pools = v; Pools().save(ctx.store, v); },
      function () { bag.reset(); });
    els.querySelector("#ln-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    var start = els.querySelector("#ln-start");
    if (enough) start.addEventListener("click", function () { startRound(roster); });
  }

  function startRound(roster) {
    // Reshuffle the pass order each round so it isn't the same sequence repeatedly.
    players = shuffle(roster).map(function (p) { return p.name; });
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
    var dist = function (g) { return Math.abs(g.guess - a); };
    var minD = dist(ranked[0]);
    var maxD = dist(ranked[ranked.length - 1]);
    // minD === maxD means every guess is equally far off (identical guesses
    // included) — a wash, not a coincidental single winner/loser.
    var allTied = minD === maxD;
    var winners = ranked.filter(function (g) { return dist(g) === minD; });
    var losers = ranked.filter(function (g) { return dist(g) === maxD; });
    var namesOf = function (list) { return list.map(function (g) { return esc(g.name); }).join(" & "); };

    var rows = ranked.map(function (g) {
      var d = dist(g);
      var isWin = !allTied && d === minD;
      var isLose = !allTied && d === maxD;
      var tag = isWin ? "👑" : (isLose ? (settings.drinking ? "🍺" : "💀") : "");
      return (
        '<li class="ln-row' + (isWin ? " ln-row--win" : (isLose ? " ln-row--lose" : "")) + '">' +
        '<span class="ln-row__name">' + tag + " " + esc(g.name) + "</span>" +
        '<span class="ln-row__guess">' + fmt(g.guess) + ' <span class="muted">' + t("(off {n})").replace("{n}", fmt(d)) + "</span></span>" +
        "</li>"
      );
    }).join("");

    var verdict = allTied
      ? '<p class="result-sub">' + t("Dead heat — everyone was equally off. 🤷") + "</p>"
      : '<p class="result-sub">🏆 <strong>' + namesOf(winners) + "</strong> " + t("nailed it!") + "<br/>" +
        (settings.drinking
          ? "🍺 <strong>" + namesOf(losers) + "</strong> " + t("was furthest — drink!")
          : "💀 <strong>" + namesOf(losers) + "</strong> " + t("was furthest off.")) + "</p>";

    els.innerHTML =
      '<section class="screen ln-reveal">' +
      '  <div class="result-emoji">🔢</div>' +
      '  <h2 class="result-title pop">' + t("Answer: ") + fmt(a) + "</h2>" +
      verdict +
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
    return bag.next({ q: t("Pick a number 1–100"), a: 50 });
  }

  function fmt(n) {
    var locale = global.Spielecke.getLang() === "de" ? "de-DE" : "en-US";
    return (Math.round(n * 100) / 100).toLocaleString(locale);
  }
  var esc = global.Spielecke.esc;
  var shuffle = global.Spielecke.shuffle;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.liars = module;
})(window);
