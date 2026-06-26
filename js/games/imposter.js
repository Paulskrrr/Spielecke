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

  function Pools() { return global.Spielecke.Pools; }

  var MIN_PLAYERS = 2;
  var DEFAULTS = { imposterCount: 1 };

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
      var savedCount = context.store.get("imposterCount", DEFAULTS.imposterCount);
      settings = {
        pools: Pools().load(context.store, poolsFor()),
        imposterCount: savedCount === "random" ? "random" : (parseInt(savedCount, 10) || 1),
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
    var chips = Pools().chipsHtml(poolsFor(), t);

    var enough = roster.length >= MIN_PLAYERS;
    var rosterNote = enough
      ? '<p class="muted small">' + t("Players ({n}): {names}")
          .replace("{n}", roster.length)
          .replace("{names}", esc(roster.map(function (p) { return p.name; }).join(", "))) + "</p>"
      : '<div class="roster-warn" style="display:block">' +
        t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    var countSection = "";
    if (enough) {
      if (settings.imposterCount !== "random") {
        if (settings.imposterCount > roster.length) settings.imposterCount = roster.length;
        if (settings.imposterCount < 1) settings.imposterCount = 1;
      }
      var countChips = [];
      for (var n = 1; n <= roster.length; n++) {
        countChips.push('<button class="chip" data-count="' + n + '">' + n + "</button>");
      }
      countChips.push('<button class="chip" data-count="random">🎲 ' + t("Random") + "</button>");
      countSection =
        '<h3 class="sub">' + t("How many imposters?") + "</h3>" +
        '<div class="chip-row" id="im-count">' + countChips.join("") + "</div>" +
        '<p class="muted small">' + t("🎲 Random leans toward fewer imposters — big groups stay tense.") + "</p>";
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

    Pools().bind(els.querySelector("#im-pools"), poolsFor(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); });
    if (enough) {
      highlight("#im-count", String(settings.imposterCount), "data-count");
      els.querySelectorAll("#im-count .chip").forEach(function (c) {
        c.addEventListener("click", function () {
          var v = c.getAttribute("data-count");
          settings.imposterCount = v === "random" ? "random" : parseInt(v, 10);
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
    var count = resolveImposterCount(players.length);
    imposterSet = {};
    var idxs = players.map(function (_, i) { return i; });
    for (var i = idxs.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = idxs[i]; idxs[i] = idxs[j]; idxs[j] = tmp; }
    idxs.slice(0, count).forEach(function (i) { imposterSet[i] = true; });

    var picked = pickWord();
    secretWord = picked.word;
    secretCategory = picked.category;
    revealIdx = 0;
    renderPassTo();
  }

  // Resolve the configured count for a table of n players. A fixed number is
  // just clamped; "random" draws from a distribution skewed toward FEW imposters.
  function resolveImposterCount(n) {
    if (settings.imposterCount === "random") return randomImposterCount(n);
    return Math.max(1, Math.min(settings.imposterCount, n));
  }

  // Weighted toward fewer imposters: P(k) ∝ 1/2^(k-1) for k = 1..max(1, n-1).
  // So 1 imposter is by far the likeliest, 2 next, and large counts get
  // exponentially rare (e.g. 7-of-9 ≈ 0.8%). Never makes the whole table fakers.
  function randomImposterCount(n) {
    var max = Math.max(1, n - 1);
    var weights = [], total = 0;
    for (var k = 1; k <= max; k++) {
      var w = 1 / Math.pow(2, k - 1);
      weights.push(w); total += w;
    }
    var r = Math.random() * total;
    for (var i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r < 0) return i + 1;
    }
    return 1;
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
      '  <button id="im-hide" class="btn btn-block btn-xl" data-primary>' +
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
      "</section>";
    els.querySelector("#im-reveal2").addEventListener("click", renderReveal);
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
      "  </div>" +
      "</section>";
    els.querySelector("#im-again").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) dealRoles(roster); else renderSetup();
    });
    els.querySelector("#im-settings").addEventListener("click", renderSetup);
  }

  // --- Word picking --------------------------------------------------------
  function pickWord() {
    var pools = poolsFor();
    var keys = Pools().resolve(settings.pools, pools); // valid selected pools (or all)
    if (!keys.length) return { word: "Beer", category: "Party" };

    var key = keys[Math.floor(Math.random() * keys.length)];
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
  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.imposter = module;
})(window);
