/*
 * games/meme.js — Meme Maker
 *
 * One device, passed round. A meme prompt shows (a big emoji "image" + a caption
 * challenge). Each player privately types their funniest caption and locks it in.
 * Then the table votes: all captions show anonymously, the group taps the best,
 * and its author scores a point. A running scoreboard rides along the session.
 *
 * Uses the shared roster for the pass order + names.
 * Content: content/meme.js (Spielecke.MemePrompts). Plain (no drinking).
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  var MIN_PLAYERS = 3;
  var DEFAULTS = { pool: "mixed" };

  var els = null, ctx = null, settings = null;
  var players = [], prompt = null, answers = [], idx = 0, voteOrder = [], scores = {};

  var module = {
    meta: {
      id: "meme",
      name: "Meme Maker",
      tagline: "Caption the chaos. Funniest one wins the round.",
      icon: "😹",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: false,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = { pool: context.store.get("pool", DEFAULTS.pool) || DEFAULTS.pool };
      scores = {};
      renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; players = []; prompt = null; answers = []; idx = 0; voteOrder = []; scores = {};
    },
  };

  function renderSetup() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var pools = global.Spielecke.MemePrompts || {};
    var chips = ['<button class="chip" data-pool="mixed">' + t("🎯 Mixed") + "</button>"]
      .concat(Object.keys(pools).map(function (k) {
        return '<button class="chip" data-pool="' + attr(k) + '">' + esc(pools[k].label || k) + "</button>";
      })).join("");

    var enough = roster.length >= MIN_PLAYERS;
    var note = enough
      ? '<p class="muted small">Players (' + roster.length + "): " + esc(roster.map(function (p) { return p.name; }).join(", ")) + "</p>"
      : '<div class="roster-warn" style="display:block">' + t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">😹 ' + t("Meme Maker") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      note +
      '  <h3 class="sub">' + t("Category") + "</h3>" +
      '  <div class="chip-row" id="mm-pools">' + chips + "</div>" +
      '  <button id="mm-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Start round ▶️") + "</button>" +
      "</section>";

    highlight("#mm-pools", settings.pool, "data-pool");
    els.querySelectorAll("#mm-pools .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.pool = c.getAttribute("data-pool"); ctx.store.set("pool", settings.pool);
        highlight("#mm-pools", settings.pool, "data-pool");
      });
    });
    var start = els.querySelector("#mm-start");
    if (enough) start.addEventListener("click", function () { startRound(roster); });
  }

  function startRound(roster) {
    players = roster.map(function (p) { return p.name; });
    prompt = pickPrompt(settings.pool);
    answers = [];
    idx = 0;
    renderPassTo();
  }

  function renderPassTo() {
    var name = players[idx];
    els.innerHTML =
      '<section class="screen mm-pass">' +
      '  <div class="pass-step">Player ' + (idx + 1) + " of " + players.length + "</div>" +
      '  <div class="pass-emoji">📲</div>' +
      '  <h2 class="pass-name pop">' + t("Pass to {name}").replace("{name}", esc(name)) + "</h2>" +
      '  <p class="muted">' + t("Write your caption in private — keep it secret.") + "</p>" +
      '  <button id="mm-go" class="btn btn-primary btn-block btn-xl">' + t("I\'m {name} — write").replace("{name}", esc(name)) + "</button>" +
      "</section>";
    els.querySelector("#mm-go").addEventListener("click", renderEntry);
  }

  function renderEntry() {
    var name = players[idx];
    els.innerHTML =
      '<section class="screen mm-entry">' +
      '  <h3 class="sub">' + t("{name}'s caption").replace("{name}", esc(name)) + "</h3>" +
      '  <div class="mm-image">' + esc(prompt.image) + "</div>" +
      '  <div class="mm-setup">' + esc(prompt.setup) + "</div>" +
      '  <input id="mm-input" class="text-input mm-input" type="text" maxlength="120" autocomplete="off" placeholder="' + t("Your caption…") + '" />' +
      '  <button id="mm-lock" class="btn btn-primary btn-block btn-xl">' + t("Lock it in 🔒") + "</button>" +
      "</section>";
    var input = els.querySelector("#mm-input");
    input.focus();
    function lock() {
      var text = (input.value || "").trim() || "…";
      answers.push({ name: name, text: text });
      idx++;
      if (idx >= players.length) startVote();
      else renderPassTo();
    }
    els.querySelector("#mm-lock").addEventListener("click", lock);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") lock(); });
  }

  function startVote() {
    voteOrder = shuffle(answers.map(function (_, i) { return i; }));
    renderVote();
  }

  function renderVote() {
    var cards = voteOrder.map(function (ansIdx, pos) {
      return (
        '<button class="mm-answer" data-a="' + ansIdx + '">' +
        '<span class="mm-answer__no">' + String.fromCharCode(65 + pos) + "</span>" +
        '<span class="mm-answer__text">' + esc(answers[ansIdx].text) + "</span>" +
        "</button>"
      );
    }).join("");

    els.innerHTML =
      '<section class="screen mm-vote">' +
      '  <div class="deck-kicker">' + t("Vote for the funniest 🏆") + "</div>" +
      '  <div class="mm-image mm-image--sm">' + esc(prompt.image) + "</div>" +
      '  <div class="mm-setup">' + esc(prompt.setup) + "</div>" +
      '  <p class="muted small">' + t("Tap the caption the table loves most.") + "</p>" +
      '  <div class="mm-answers">' + cards + "</div>" +
      "</section>";

    els.querySelectorAll(".mm-answer").forEach(function (b) {
      b.addEventListener("click", function () { renderResult(parseInt(b.getAttribute("data-a"), 10)); });
    });
  }

  function renderResult(winIdx) {
    var winner = answers[winIdx];
    scores[winner.name] = (scores[winner.name] || 0) + 1;

    var allCards = voteOrder.map(function (ansIdx) {
      var a = answers[ansIdx];
      var win = ansIdx === winIdx;
      return (
        '<li class="mm-result-card' + (win ? " mm-result-card--win" : "") + '">' +
        '<div class="mm-result-card__text">' + (win ? "🏆 " : "") + esc(a.text) + "</div>" +
        '<div class="mm-result-card__by">— ' + esc(a.name) + "</div>" +
        "</li>"
      );
    }).join("");

    var board = Object.keys(scores).map(function (name) {
      return { name: name, pts: scores[name] };
    }).sort(function (x, y) { return y.pts - x.pts; });
    var top = board.length ? board[0].pts : 0;
    var scoreRows = board.map(function (s) {
      return (
        '<li class="mm-score-row' + (s.pts === top && top > 0 ? " mm-score-row--lead" : "") + '">' +
        '<span class="mm-score-row__name">' + (s.pts === top && top > 0 ? "👑 " : "") + esc(s.name) + "</span>" +
        '<span class="mm-score-row__pts">' + s.pts + "</span>" +
        "</li>"
      );
    }).join("");

    els.innerHTML =
      '<section class="screen mm-reveal">' +
      '  <div class="result-emoji">😹</div>' +
      '  <h2 class="result-title pop">' + t("{name} wins the round! 🏆").replace("{name}", esc(winner.name)) + "</h2>" +
      '  <ul class="mm-result-list">' + allCards + "</ul>" +
      '  <h3 class="sub">' + t("Scoreboard") + "</h3>" +
      '  <ul class="mm-scores">' + scoreRows + "</ul>" +
      '  <div class="stack">' +
      '    <button id="mm-next" class="btn btn-primary btn-block btn-xl">' + t("Next round 🔁") + "</button>" +
      '    <button id="mm-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      '    <button id="mm-home" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelector("#mm-next").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) startRound(roster); else renderSetup();
    });
    els.querySelector("#mm-settings").addEventListener("click", renderSetup);
    els.querySelector("#mm-home").addEventListener("click", function () { ctx.goHome(); });
  }

  function pickPrompt(pool) {
    var pools = global.Spielecke.MemePrompts || {};
    var keys = Object.keys(pools);
    if (!keys.length) return { image: "🖼️", setup: "Caption this." };
    var list = (pool === "mixed" || !pools[pool])
      ? keys.reduce(function (acc, k) { return acc.concat(pools[k].prompts || []); }, [])
      : (pools[pool].prompts || []);
    if (!list.length) return { image: "🖼️", setup: "Caption this." };
    return list[Math.floor(Math.random() * list.length)];
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
  global.Spielecke.Games.meme = module;
})(window);
