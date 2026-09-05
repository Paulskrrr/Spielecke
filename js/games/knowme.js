// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * games/knowme.js — Kennst du mich? (Know Me)
 *
 * Reihum bekommt einer eine Frage über jemand anderen aus der Runde — und muss
 * sie so beantworten, wie diese Person selbst antworten würde. Die betreffende
 * Person löst auf: Treffer +1, daneben −1. Wer die anderen am besten kennt,
 * knackt zuerst die Zielpunktzahl.
 *
 * NOTHING IS SECRET here, so there's deliberately no "pass the phone" screen:
 * the question is read out at the table, the guess is said out loud, and the
 * phone only exists to keep score. That's one tap fewer per turn than the
 * pass-around games and keeps the group looking at each other, not the screen.
 *
 * The question screen morphs in place instead of navigating: the prompt stays
 * put and only the button row swaps from "reveal" to the two verdict buttons,
 * so nobody loses the question while the subject answers.
 *
 * Pairing is spread on purpose (see pickSubject): the subject is drawn from
 * whoever has been asked about least, so nobody sits through the whole game
 * without ever being the topic.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function Pools() { return global.Spielecke.Pools; }

  var MIN_PLAYERS = 3;              // "wen aus dieser Runde" questions need a group
  var TARGET_OPTIONS = [3, 5, 7, 10];
  var DEFAULTS = { target: 5, drinking: false };

  var els = null, ctx = null, settings = null;
  var players = [];        // [{ name, score, asked }] — `asked` = times as subject
  var queue = [];          // shuffled question queue, refilled when it runs dry
  var turn = 0;            // index into players: whose guess it is
  var current = null;      // { guesser, subject, question }
  var lastSubject = null;

  var module = {
    meta: {
      id: "knowme",
      name: "Know Me",
      tagline: "Answer as they would. Whoever knows the group best wins.",
      icon: "🪞",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        pools: Pools().load(context.store, cats()),
        target: clampTarget(context.store.get("target", DEFAULTS.target)),
        drinking: context.store.get("drinking", DEFAULTS.drinking) === true,
      };
      renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null;
      players = []; queue = []; current = null; lastSubject = null;
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var enough = roster.length >= MIN_PLAYERS;
    var note = enough ? ""
      : '<div class="roster-warn" style="display:block">' +
        t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    var targets = TARGET_OPTIONS.map(function (n) {
      return '<button class="chip" data-target="' + n + '">' + n + " 🏆</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🪞 ' + t("Know Me") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      note +
      '  <p class="muted small">' + t("A question about one of you goes to somebody else. Answer it the way they would — they decide if you nailed it.") + "</p>" +
      '  <h3 class="sub">' + t("Categories") + "</h3>" +
      '  <div class="chip-row" id="km-pools">' + Pools().chipsHtml(cats(), t) + "</div>" +
      '  <h3 class="sub">' + t("Points to win") + "</h3>" +
      '  <div class="chip-row" id="km-target">' + targets + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="km-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode (miss = you drink, hit = they drink)") + "</span></label>" +
      '  <button id="km-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Start game ▶️") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#km-pools"), cats(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); queue = []; });

    highlight("#km-target", String(settings.target), "data-target");
    els.querySelectorAll("#km-target .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.target = clampTarget(c.getAttribute("data-target"));
        ctx.store.set("target", settings.target);
        highlight("#km-target", String(settings.target), "data-target");
      });
    });
    els.querySelector("#km-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    var start = els.querySelector("#km-start");
    if (enough) start.addEventListener("click", function () { startGame(roster); });
  }

  // --- Game loop -----------------------------------------------------------
  function startGame(roster) {
    // Shuffled seating each game so the same person doesn't always open.
    players = shuffle(roster).map(function (p) { return { name: p.name, score: 0, asked: 0 }; });
    queue = []; turn = 0; lastSubject = null;
    nextTurn();
  }

  function nextTurn() {
    var guesser = players[turn % players.length];
    var subject = pickSubject(guesser);
    subject.asked++;
    lastSubject = subject.name;
    current = { guesser: guesser, subject: subject, question: pickQuestion() };
    renderQuestion(false);
  }

  // Spread the spotlight: draw from whoever has been the subject least often,
  // and avoid an immediate repeat while there's another candidate.
  function pickSubject(guesser) {
    var others = players.filter(function (p) { return p !== guesser; });
    var fresh = others.filter(function (p) { return p.name !== lastSubject; });
    var pool = fresh.length ? fresh : others;
    var min = Math.min.apply(null, pool.map(function (p) { return p.asked; }));
    var least = pool.filter(function (p) { return p.asked === min; });
    return least[Math.floor(Math.random() * least.length)];
  }

  function pickQuestion() {
    if (!queue.length) {
      queue = shuffle(Pools().gather(settings.pools, cats(), "questions"));
      if (!queue.length) queue = ["{name}?"];
    }
    return queue.pop();
  }

  // --- Question / verdict (one screen, two states) -------------------------
  function renderQuestion(revealed) {
    var q = current.question.replace(/\{name\}/g, esc(current.subject.name));
    var actions = revealed
      ? '<div class="km-verdict">' +
        '  <button id="km-hit" class="btn btn-got btn-xl" data-primary>' + t("Dead on ✅") + "</button>" +
        '  <button id="km-miss" class="btn btn-miss btn-xl">' + t("Not a chance ❌") + "</button>" +
        "</div>"
      : '<button id="km-reveal" class="btn btn-primary btn-block btn-xl">' + t("Reveal 👀") + "</button>";

    els.innerHTML =
      '<section class="screen km-ask">' +
      "  " + scoreStrip() +
      '  <div class="km-duo">' +
      '    <span class="km-guesser">' + esc(current.guesser.name) + "</span>" +
      '    <span class="km-arrow">🪞</span>' +
      '    <span class="km-subject">' + esc(current.subject.name) + "</span>" +
      "  </div>" +
      '  <div class="km-card' + (revealed ? " is-revealed" : "") + '">' +
      '    <div class="km-kicker">' + t("Question about {name}").replace("{name}", esc(current.subject.name)) + "</div>" +
      '    <p class="km-question">' + q + "</p>" +
      "  </div>" +
      '  <p class="muted small km-hint">' +
        (revealed
          ? t("{name} tells the truth — did {guesser} get it?")
              .replace("{name}", esc(current.subject.name)).replace("{guesser}", esc(current.guesser.name))
          : t("{name}, answer the way {subject} would — out loud.")
              .replace("{name}", esc(current.guesser.name)).replace("{subject}", esc(current.subject.name))) +
      "</p>" +
      actions +
      "</section>";

    if (revealed) {
      els.querySelector("#km-hit").addEventListener("click", function () { score(true); });
      els.querySelector("#km-miss").addEventListener("click", function () { score(false); });
    } else {
      els.querySelector("#km-reveal").addEventListener("click", function () { renderQuestion(true); });
    }
  }

  function score(hit) {
    current.guesser.score += hit ? 1 : -1;
    haptic(hit ? [18, 40, 18] : 40);
    if (current.guesser.score >= settings.target) renderWin(current.guesser);
    else renderResult(hit);
  }

  // --- Result --------------------------------------------------------------
  function renderResult(hit) {
    var g = esc(current.guesser.name), s = esc(current.subject.name);
    var delta = (hit ? t("+1 for {name}") : t("−1 for {name}")).replace("{name}", "<strong>" + g + "</strong>");
    var drink = !settings.drinking ? ""
      : '<p class="km-drink">' +
        (hit ? t("🍺 {name} drinks — far too predictable.").replace("{name}", s)
             : t("🍺 {name} drinks.").replace("{name}", g)) + "</p>";

    els.innerHTML =
      '<section class="screen km-result">' +
      '  <div class="result-emoji">' + (hit ? "🎯" : "💀") + "</div>" +
      '  <h2 class="result-title pop">' + (hit ? t("Dead on!") : t("Not a chance!")) + "</h2>" +
      '  <p class="result-sub">' + delta + "</p>" +
      drink +
      standingsHtml() +
      '  <button id="km-next" class="btn btn-primary btn-block btn-xl">' + t("Next ▶️") + "</button>" +
      "</section>";
    els.querySelector("#km-next").addEventListener("click", function () {
      turn++;
      nextTurn();
    });
  }

  function renderWin(winner) {
    els.innerHTML =
      '<section class="screen km-win">' +
      '  <div class="boom-flash">🏆</div>' +
      '  <h2 class="boom-title">' + esc(winner.name) + t(" wins!") + "</h2>" +
      '  <p class="result-sub">' + t("{name} knows this group better than anyone.").replace("{name}", "<strong>" + esc(winner.name) + "</strong>") + "</p>" +
      standingsHtml() +
      '  <div class="stack">' +
      '    <button id="km-again" class="btn btn-primary btn-block btn-xl">' + t("Play again 🔁") + "</button>" +
      '    <button id="km-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#km-again").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) startGame(roster); else renderSetup();
    });
    els.querySelector("#km-settings").addEventListener("click", renderSetup);
  }

  // --- Score furniture -----------------------------------------------------
  // Compact strip above the question: everyone in seating order, leader marked.
  function scoreStrip() {
    var best = Math.max.apply(null, players.map(function (p) { return p.score; }));
    return '<div class="km-strip">' + players.map(function (p) {
      var cls = "km-pill" +
        (p === current.guesser ? " km-pill--turn" : "") +
        (p.score === best && best > 0 ? " km-pill--lead" : "");
      return '<span class="' + cls + '">' + esc(p.name) + '<b>' + p.score + "</b></span>";
    }).join("") + "</div>";
  }

  // Full table, best first, with the target as the finish line.
  function standingsHtml() {
    var sorted = players.slice().sort(function (a, b) {
      return b.score - a.score || a.name.localeCompare(b.name);
    });
    var rows = sorted.map(function (p, i) {
      var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1) + ".";
      var pct = Math.max(0, Math.min(100, (p.score / settings.target) * 100));
      return '<li class="km-row' + (i === 0 ? " km-row--lead" : "") + '">' +
        '<span class="km-medal">' + medal + "</span>" +
        '<span class="km-name">' + esc(p.name) + "</span>" +
        '<span class="km-bar"><i style="width:' + pct.toFixed(0) + '%"></i></span>' +
        '<span class="km-pts">' + p.score + "</span>" +
        "</li>";
    }).join("");
    return '<div class="km-standings">' +
      '<div class="km-standings__head">' + t("Standings") + " — " + t("first to {n}").replace("{n}", settings.target) + "</div>" +
      "<ol>" + rows + "</ol></div>";
  }

  // --- Utils ---------------------------------------------------------------
  function cats() { return global.Spielecke.L(global.Spielecke.KnowMe) || {}; }
  function clampTarget(v) {
    var n = parseInt(v, 10);
    return TARGET_OPTIONS.indexOf(n) === -1 ? DEFAULTS.target : n;
  }
  function highlight(sel, value, attrName) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) {
      c.classList.toggle("chip--active", c.getAttribute(attrName) === value);
    });
  }
  function haptic(pattern) {
    if (global.Spielecke.haptic) global.Spielecke.haptic(pattern);
  }
  var esc = global.Spielecke.esc;
  var shuffle = global.Spielecke.shuffle;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.knowme = module;
})(window);
