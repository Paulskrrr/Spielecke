/*
 * games/imposter.js — Imposter (one device, pass-around hidden roles)
 *
 * Everyone secretly gets the same SECRET WORD — except the IMPOSTERS, who only
 * learn the category. The number of imposters is chosen before dealing (1 up to
 * the whole table). Pass the phone around so each player reveals their own role
 * in private. Then talk it out, vote, and unmask the faker(s).
 *
 * Uses the shared roster for the pass order and player names.
 * Content comes from the SHARED term database (content/terms.js, Spielecke.Terms).
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  var MIN_PLAYERS = 3;
  var DEFAULTS = { pool: "mixed", imposterCount: 1 };

  var els = null;
  var ctx = null;
  var settings = null;

  var players = [];
  var imposterSet = {};
  var secretWord = "";
  var secretCategory = "";
  var revealIdx = 0;
  var roleShown = false;

  var module = {
    meta: {
      id: "imposter",
      name: "Imposter",
      tagline: "Everyone knows the word. One faker doesn't. Sniff them out.",
      icon: "🕵️",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: true,
    },

    mount: function (container, context) {
      els = container;
      ctx = context;
      settings = {
        pool: context.store.get("pool", DEFAULTS.pool) || DEFAULTS.pool,
        imposterCount: parseInt(context.store.get("imposterCount", DEFAULTS.imposterCount), 10) || 1,
      };
      renderSetup();
    },

    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; players = []; imposterSet = {}; secretWord = ""; secretCategory = "";
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var pools = poolsFor();

    var chips = ['<button class="chip" data-pool="mixed">' + t("🎯 Mixed") + "</button>"]
      .concat(Object.keys(pools).map(function (k) {
        return '<button class="chip" data-pool="' + attr(k) + '">' + esc(pools[k].label || k) + "</button>";
      })).join("");

    var enough = roster.length >= MIN_PLAYERS;
    var rosterNote = enough
      ? '<p class="muted small">' + t("Players ({n}): {names}")
          .replace("{n}", roster.length)
          .replace("{names}", esc(roster.map(function (p) { return p.name; }).join(", "))) + "</p>"
      : '<div class="roster-warn" style="display:block">' +
        t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    var countSection = "";
    if (enough) {
      if (settings.imposterCount > roster.length) settings.imposterCount = roster.length;
      if (settings.imposterCount < 1) settings.imposterCount = 1;
      var countChips = [];
      for (var n = 1; n <= roster.length; n++) {
        countChips.push('<button class="chip" data-count="' + n + '">' + n + "</button>");
      }
      countSection =
        '<h3 class="sub">' + t("How many imposters?") + "</h3>" +
        '<div class="chip-row" id="im-count">' + countChips.join("") + "</div>";
    }

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🕵️ ' + t("Imposter") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      rosterNote +
      '  <h3 class="sub">' + t("Word pool") + "</h3>" +
      '  <div class="chip-row" id="im-pools">' + chips + "</div>" +
      countSection +
      '  <button id="im-deal" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") +
      ">" + t("Deal roles 🂴") + "</button>" +
      "</section>";

    highlight("#im-pools", settings.pool, "data-pool");
    els.querySelectorAll("#im-pools .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.pool = c.getAttribute("data-pool");
        ctx.store.set("pool", settings.pool);
        highlight("#im-pools", settings.pool, "data-pool");
      });
    });
    if (enough) {
      highlight("#im-count", String(settings.imposterCount), "data-count");
      els.querySelectorAll("#im-count .chip").forEach(function (c) {
        c.addEventListener("click", function () {
          settings.imposterCount = parseInt(c.getAttribute("data-count"), 10);
          ctx.store.set("imposterCount", settings.imposterCount);
          highlight("#im-count", String(settings.imposterCount), "data-count");
        });
      });
    }
    var deal = els.querySelector("#im-deal");
    if (enough) deal.addEventListener("click", function () { dealRoles(roster); });
  }

  // --- Deal & reveal phase -------------------------------------------------
  function dealRoles(roster) {
    players = roster.map(function (p) { return p.name; });
    var count = Math.max(1, Math.min(settings.imposterCount, players.length));
    imposterSet = {};
    var idxs = players.map(function (_, i) { return i; });
    for (var i = idxs.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = idxs[i]; idxs[i] = idxs[j]; idxs[j] = tmp; }
    idxs.slice(0, count).forEach(function (i) { imposterSet[i] = true; });

    var picked = pickWord(settings.pool);
    secretWord = picked.word;
    secretCategory = picked.category;
    revealIdx = 0;
    renderPassTo();
  }

  function imposterNames() {
    return players.filter(function (_, i) { return imposterSet[i]; });
  }
  function imposterTotal() {
    var n = 0; for (var k in imposterSet) if (imposterSet[k]) n++; return n;
  }

  function renderPassTo() {
    roleShown = false;
    var name = players[revealIdx];
    els.innerHTML =
      '<section class="screen imposter-pass">' +
      '  <div class="pass-step">' + t("Player {i} of {n}").replace("{i}", revealIdx + 1).replace("{n}", players.length) + "</div>" +
      '  <div class="pass-emoji">📲</div>' +
      '  <h2 class="pass-name pop">' + t("Pass to {name}").replace("{name}", esc(name)) + "</h2>" +
      '  <p class="muted">' + t("Only {name} should look. Everyone else: no peeking.").replace("{name}", esc(name)) + "</p>" +
      '  <button id="im-reveal" class="btn btn-primary btn-block btn-xl">' + t("I\'m {name} — reveal").replace("{name}", esc(name)) + "</button>" +
      "</section>";
    els.querySelector("#im-reveal").addEventListener("click", showRole);
  }

  function showRole() {
    roleShown = true;
    var isImposter = !!imposterSet[revealIdx];
    var last = revealIdx === players.length - 1;
    var total = imposterTotal();
    var allyNote = total > 1
      ? t("You're 1 of {n} imposters — but who else?").replace("{n}", total)
      : t("Blend in. Don't get caught.");
    var body = isImposter
      ? '<div class="role-card role-card--imposter">' +
        '  <div class="role-label">' + t("You are the") + "</div>" +
        '  <div class="role-big">' + t("IMPOSTER 🤫") + "</div>" +
        '  <div class="role-hint">' + t("Category") + ": <strong>" + esc(secretCategory) + "</strong></div>" +
        '  <div class="role-note">' + allyNote + "</div>" +
        "</div>"
      : '<div class="role-card">' +
        '  <div class="role-label">' + t("The secret word is") + "</div>" +
        '  <div class="role-big">' + esc(secretWord) + "</div>" +
        '  <div class="role-hint">' + t("Category") + ": " + esc(secretCategory) + "</div>" +
        '  <div class="role-note">' + t("Hint at it — never say it.") + "</div>" +
        "</div>";

    els.innerHTML =
      '<section class="screen imposter-role">' + body +
      '  <button id="im-hide" class="btn btn-block btn-xl">' +
      (last ? t("Hide & start talking 🗣️") : t("Hide & pass on ➡️")) + "</button>" +
      "</section>";
    els.querySelector("#im-hide").addEventListener("click", function () {
      if (last) renderDiscussion();
      else { revealIdx++; renderPassTo(); }
    });
  }

  // --- Discussion & reveal -------------------------------------------------
  function renderDiscussion() {
    els.innerHTML =
      '<section class="screen imposter-talk">' +
      '  <h2 class="screen-title pop">' + t("🗣️ Talk it out") + "</h2>" +
      '  <p>' + t("Go round the table. Each person says <strong>one word</strong> hinting at the secret. The imposter is faking it. After a round or two, <strong>vote</strong> on who the faker is.") + "</p>" +
      '  <button id="im-reveal2" class="btn btn-primary btn-block btn-xl">' + t("Reveal the imposter 🔦") + "</button>" +
      '  <button id="im-home" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "</section>";
    els.querySelector("#im-reveal2").addEventListener("click", renderReveal);
    els.querySelector("#im-home").addEventListener("click", function () { ctx.goHome(); });
  }

  function renderReveal() {
    var names = imposterNames();
    var plural = names.length > 1;
    var joined = names.map(esc).join(" & ");
    var title = plural
      ? joined + t(" were the imposters!")
      : joined + t(" was the imposter!");

    els.innerHTML =
      '<section class="screen imposter-reveal">' +
      '  <div class="reveal-emoji">🕵️</div>' +
      '  <h2 class="result-title pop">' + title + "</h2>" +
      '  <p class="result-sub">' + t("The word was: ") + "<strong>" + esc(secretWord) + "</strong></p>" +
      '  <p class="muted">' + (plural ? t("Did the table catch them all?") : t("Did the table catch them?")) + "</p>" +
      '  <div class="stack">' +
      '    <button id="im-caught" class="btn btn-got btn-block btn-xl">' + t("We caught {pronoun} 🎯").replace("{pronoun}", plural ? t("them all") : t("them")) + "</button>" +
      '    <button id="im-fooled" class="btn btn-skip btn-block btn-xl">' + t("They fooled us 🤡") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#im-caught").addEventListener("click", function () {
      renderOutcome(t("🎯 Caught!"), t("The table wins — ") + joined + " " + t("got busted!"));
    });
    els.querySelector("#im-fooled").addEventListener("click", function () {
      renderOutcome(t("🤡 Fooled!"), joined + " " + t(plural ? "got away with it — imposters win!" : "got away with it — imposter wins!"));
    });
  }

  function renderOutcome(title, line) {
    els.innerHTML =
      '<section class="screen imposter-outcome">' +
      '  <h2 class="result-title pop">' + title + "</h2>" +
      '  <p class="result-sub">' + line + "</p>" +
      '  <div class="stack">' +
      '    <button id="im-again" class="btn btn-primary btn-block btn-xl">' + t("New round 🔁") + "</button>" +
      '    <button id="im-settings" class="btn btn-block">' + t("Change pool") + "</button>" +
      '    <button id="im-home2" class="btn btn-ghost btn-block">' + t("Back to shelf") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#im-again").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) dealRoles(roster); else renderSetup();
    });
    els.querySelector("#im-settings").addEventListener("click", renderSetup);
    els.querySelector("#im-home2").addEventListener("click", function () { ctx.goHome(); });
  }

  // --- Word picking --------------------------------------------------------
  function pickWord(pool) {
    var pools = poolsFor();
    var keys = Object.keys(pools);
    if (!keys.length) return { word: "Beer", category: "Party" };

    var key;
    if (pool === "mixed" || !pools[pool]) {
      key = keys[Math.floor(Math.random() * keys.length)];
    } else {
      key = pool;
    }
    var words = pools[key].terms || [];
    var word = words.length ? words[Math.floor(Math.random() * words.length)] : "Beer";
    var category = (pools[key].label || key).replace(/^[^\w]+\s*/, "");
    return { word: word, category: category };
  }

  // --- Utils ---------------------------------------------------------------
  // Shared term pools this game should offer (excludes drawing-only pools).
  function poolsFor() {
    return global.Spielecke.termPoolsFor
      ? global.Spielecke.termPoolsFor("imposter")
      : (global.Spielecke.Terms || {});
  }
  function highlight(sel, value, attrName) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) {
      c.classList.toggle("chip--active", c.getAttribute(attrName) === value);
    });
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.imposter = module;
})(window);
