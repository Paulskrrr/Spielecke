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
  var secretHint = "";
  var revealIdx = 0;
  var roleShown = false;

  // Timer-mode state. In Timer mode there is no secret word: everyone but the
  // imposter(s) is shown a flat target of 1–15 seconds, then each player buzzes
  // when they think that many seconds have passed (no clock is ever shown).
  var targetTime = 0;     // the hidden target in whole seconds (1..15)
  var buzzes = [];        // [{ name, seconds, isImposter }] locked in per player
  var buzzIdx = 0;        // whose turn it is in the buzzer pass (phase 2)
  var revealTimer = null; // pending reveal-drip timeout
  function clearRevealTimer() { if (revealTimer) { clearTimeout(revealTimer); revealTimer = null; } }

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
        hints: context.store.get("imposterHints", false) === true,
        mode: context.store.get("imposterMode", "classic") === "timer" ? "timer" : "classic",
      };
      renderSetup();
    },

    unmount: function () {
      clearRevealTimer();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; players = []; imposterSet = {}; secretWord = ""; secretCategory = ""; secretHint = "";
      targetTime = 0; buzzes = []; buzzIdx = 0;
    },
  };

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    clearRevealTimer();
    var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
    var timer = settings.mode === "timer";
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

    // The buzzer is just another category chip in the same row as the word pools
    // (not a separate mode). Picking it runs the seconds-guessing variant.
    var categorySection =
      '<h3 class="sub">' + t("Category") + "</h3>" +
      '<div class="chip-row">' +
      '  <span id="im-pools" class="pools-contents">' + chips + "</span>" +
      '  <button class="chip im-buzzer' + (timer ? " chip--active" : "") + '" id="im-buzzer">' + t("🔔 Buzzer") + "</button>" +
      "</div>";

    // Below the chips: Buzzer explains its round; word-hunt offers the hint.
    var belowSection = timer
      ? '<p class="muted small tz-explain">' +
          t("No clock is ever shown. Everyone but the imposter secretly sees a target of 1–15 seconds, then each player buzzes when they think that long has passed. Closest wins — the imposter is just guessing.") + "</p>"
      : '<label class="toggle im-hints-toggle"><input type="checkbox" id="im-hints"' +
        (settings.hints ? " checked" : "") + ' /><span>' + t("Give imposters a hint") + "</span></label>" +
        '<p class="muted small">' + t("Imposters secretly get a distant, cryptic clue — enough to bluff, not enough to know.") + "</p>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🕵️ ' + t("Imposter") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      rosterNote +
      countSection +
      categorySection +
      belowSection +
      '  <button id="im-deal" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") +
      ">" + (timer ? t("Deal & buzz 🔔") : t("Deal roles 🂴")) + "</button>" +
      "</section>";

    // Word pools are always bound; picking one switches out of Buzzer mode.
    Pools().bind(els.querySelector("#im-pools"), poolsFor(),
      function () { return settings.pools; },
      function (v) {
        settings.pools = v; Pools().save(ctx.store, v);
        if (settings.mode === "timer") { settings.mode = "classic"; ctx.store.set("imposterMode", "classic"); renderSetup(); }
      });
    // While Buzzer is active the word pools read as inactive — but stay tappable,
    // so tapping one switches straight back to the word hunt.
    var poolsSpan = els.querySelector("#im-pools");
    if (timer && poolsSpan) {
      poolsSpan.classList.add("im-pools--off");
      poolsSpan.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("chip--active"); });
    }
    var buzzerChip = els.querySelector("#im-buzzer");
    if (buzzerChip) buzzerChip.addEventListener("click", function () {
      settings.mode = settings.mode === "timer" ? "classic" : "timer";
      ctx.store.set("imposterMode", settings.mode);
      renderSetup();
    });
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
    var hintsToggle = els.querySelector("#im-hints");
    if (hintsToggle) hintsToggle.addEventListener("change", function () {
      settings.hints = hintsToggle.checked;
      ctx.store.set("imposterHints", settings.hints);
    });

    var deal = els.querySelector("#im-deal");
    if (enough) deal.addEventListener("click", function () { dealRoles(roster); });
  }

  // --- Deal & reveal phase -------------------------------------------------
  function dealRoles(roster) {
    // Randomise the reveal/pass order each deal so the phone doesn't always go
    // round in the same sequence (imposters are already drawn at random below).
    players = shuffle(roster).map(function (p) { return p.name; });
    var count = resolveImposterCount(players.length);
    imposterSet = {};
    var idxs = players.map(function (_, i) { return i; });
    for (var i = idxs.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = idxs[i]; idxs[i] = idxs[j]; idxs[j] = tmp; }
    idxs.slice(0, count).forEach(function (i) { imposterSet[i] = true; });

    revealIdx = 0;
    if (settings.mode === "timer") {
      // Flat target: a whole number of seconds, 1..15.
      targetTime = 1 + Math.floor(Math.random() * 15);
      buzzes = [];
      renderPassTo();
      return;
    }

    var picked = pickWord();
    secretWord = picked.word;
    secretCategory = picked.category;
    secretHint = picked.hint || "";
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
    if (settings.mode === "timer") return showTimerRole();
    var isImposter = !!imposterSet[revealIdx];
    var last = revealIdx === players.length - 1;
    var total = imposterTotal();
    var allyNote = total > 1
      ? t("You're 1 of {n} imposters — but who else?").replace("{n}", total)
      : t("Blend in. Don't get caught.");
    var clueLine = (settings.hints && secretHint)
      ? '  <div class="role-hint role-hint--clue">🧭 ' + t("Your hint") + ": <strong>" + esc(secretHint) + "</strong></div>"
      : "";
    var body = isImposter
      ? '<div class="role-card role-card--imposter">' +
        '  <div class="role-label">' + t("You are the") + "</div>" +
        '  <div class="role-big">' + t("IMPOSTER 🤫") + "</div>" +
        '  <div class="role-hint">' + t("Category") + ": <strong>" + esc(secretCategory) + "</strong></div>" +
        clueLine +
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

  // --- Buzzer category: all roles first, then the buzzer goes round --------
  // Phase 1 — reveal each player's role in a pass-around (exactly like the word
  // hunt). Non-imposters see the flat target in seconds; the imposter only learns
  // they're in the dark. Nobody buzzes until everyone has looked.
  function showTimerRole() {
    var isImposter = !!imposterSet[revealIdx];
    var total = imposterTotal();
    var allyNote = total > 1
      ? t("You're 1 of {n} imposters — but who else?").replace("{n}", total)
      : t("Blend in. Don't get caught.");
    var word = targetTime === 1 ? t("second") : t("seconds");
    var body = isImposter
      ? '<div class="role-card role-card--imposter">' +
        '  <div class="role-label">' + t("You are the") + "</div>" +
        '  <div class="role-big">' + t("IMPOSTER 🤫") + "</div>" +
        '  <div class="role-hint">' + t("You don\'t know the time — buzz on instinct.") + "</div>" +
        '  <div class="role-note">' + allyNote + "</div>" +
        "</div>"
      : '<div class="role-card">' +
        '  <div class="role-label">' + t("Count exactly") + "</div>" +
        '  <div class="role-big">' + targetTime + '<span class="tz-unit">' + word + "</span></div>" +
        '  <div class="role-note">' + t("No clock will show — count it in your head.") + "</div>" +
        "</div>";

    var last = revealIdx === players.length - 1;
    els.innerHTML =
      '<section class="screen imposter-role">' + body +
      '  <button id="im-hide" class="btn btn-block btn-xl" data-primary>' +
      (last ? t("Everyone's ready — buzz! 🔔") : t("Hide & pass on ➡️")) + "</button>" +
      "</section>";
    els.querySelector("#im-hide").addEventListener("click", function () {
      if (last) startBuzzPhase();
      else { revealIdx++; renderPassTo(); }
    });
  }

  // Phase 2 begins only once every role has been seen: an intro, then the buzzer
  // travels round the table one player at a time.
  function startBuzzPhase() {
    buzzIdx = 0;
    buzzes = [];
    els.innerHTML =
      '<section class="screen imposter-talk tz-intro">' +
      '  <div class="pass-emoji">🔔</div>' +
      '  <h2 class="screen-title pop">' + t("🔔 Buzzer time") + "</h2>" +
      '  <p>' + t("Everyone has seen their role. Now the buzzer goes round the table — hit the seconds you were given (the imposter just has to guess).") + "</p>" +
      '  <button id="tz-go" class="btn btn-primary btn-block btn-xl">' + t("Start the buzzer 🔔") + "</button>" +
      "</section>";
    els.querySelector("#tz-go").addEventListener("click", renderBuzzHandover);
  }

  // Hand the phone to the next buzzer.
  function renderBuzzHandover() {
    var name = players[buzzIdx];
    els.innerHTML =
      '<section class="screen imposter-pass">' +
      '  <div class="pass-step">' + t("Player {i} of {n}").replace("{i}", buzzIdx + 1).replace("{n}", players.length) + "</div>" +
      '  <div class="pass-emoji">🔔</div>' +
      '  <h2 class="pass-name pop">' + t("Pass to {name}").replace("{name}", esc(name)) + "</h2>" +
      '  <p class="muted">' + t("Buzz when you think the time is up — no clock will show.") + "</p>" +
      '  <button id="tz-take" class="btn btn-primary btn-block btn-xl">' + t("I'm {name} — go").replace("{name}", esc(name)) + "</button>" +
      "</section>";
    els.querySelector("#tz-take").addEventListener("click", renderBuzz);
  }

  // The buzzer: tap once to start (silently), tap again the instant it feels like
  // the target has elapsed. No timer is ever displayed. We store the real elapsed
  // time so the reveal can rank everyone against the hidden target.
  function renderBuzz() {
    var name = players[buzzIdx];
    var last = buzzIdx === players.length - 1;
    var startAt = null;

    els.innerHTML =
      '<section class="screen tz-buzz">' +
      '  <div class="pass-step">' + t("Player {i} of {n}").replace("{i}", buzzIdx + 1).replace("{n}", players.length) + "</div>" +
      '  <h2 class="pass-name pop">' + esc(name) + "</h2>" +
      '  <p class="muted">' + t("Tap to start, then hit the buzzer when the time feels up.") + "</p>" +
      '  <button id="tz-buzzer" class="tz-buzzer" data-state="idle">' + t("START ⏱️") + "</button>" +
      '  <div id="tz-hint" class="tz-buzz-hint">&nbsp;</div>' +
      "</section>";

    var btn = els.querySelector("#tz-buzzer");
    btn.addEventListener("click", function () {
      if (btn.getAttribute("data-state") === "idle") {
        startAt = Date.now();
        btn.setAttribute("data-state", "live");
        btn.classList.add("is-live");
        btn.textContent = t("BUZZ! 🔔");
        var hint = els.querySelector("#tz-hint");
        if (hint) hint.textContent = t("Counting… no peeking at a clock!");
        vibrate(12);
      } else if (btn.getAttribute("data-state") === "live") {
        btn.setAttribute("data-state", "done");
        var elapsed = (Date.now() - startAt) / 1000;
        buzzes.push({ name: name, seconds: elapsed, isImposter: !!imposterSet[buzzIdx] });
        vibrate([20, 40, 20]);
        if (last) renderTimerDiscussion();
        else { buzzIdx++; renderBuzzHandover(); }
      }
    });
  }

  function renderTimerDiscussion() {
    els.innerHTML =
      '<section class="screen imposter-talk">' +
      '  <h2 class="screen-title pop">' + t("🔔 Everyone buzzed") + "</h2>" +
      '  <p>' + t("Who looked like they had no idea how long to wait? Talk it out and pick your imposter — then reveal how close everyone landed.") + "</p>" +
      '  <button id="tz-reveal" class="btn btn-primary btn-block btn-xl">' + t("Reveal the ranking 🎯") + "</button>" +
      "</section>";
    els.querySelector("#tz-reveal").addEventListener("click", renderTimerReveal);
  }

  // Reveal: a timeline with the target marked, every buzz pinned along it, and a
  // leaderboard that drips in furthest-off → closest (the winner lands last).
  function renderTimerReveal() {
    clearRevealTimer();
    var target = targetTime;
    var results = buzzes.map(function (b) {
      return { name: b.name, seconds: b.seconds, isImposter: b.isImposter, d: Math.abs(b.seconds - target) };
    });

    // Scale keeps the target off the far edge and still fits the biggest overshoot.
    var maxSec = target;
    results.forEach(function (r) { if (r.seconds > maxSec) maxSec = r.seconds; });
    var scaleMax = Math.max(target * 1.4, maxSec * 1.05, target + 2);
    function pos(s) { return Math.max(0, Math.min(100, (s / scaleMax) * 100)); }

    var ranked = results.slice().sort(function (a, b) { return a.d - b.d || a.name.localeCompare(b.name); });
    ranked.forEach(function (r, i) { r.rank = i; });
    var winner = ranked[0];
    var order = ranked.slice().reverse(); // reveal furthest first

    var pins = results.map(function (r) {
      var cls = "tz-pin" + (r === winner ? " tz-pin--win" : "") + (r.isImposter ? " tz-pin--imp" : "");
      return '<div class="' + cls + '" data-r="' + r.rank + '" style="--pos:' + pos(r.seconds).toFixed(2) + '%"></div>';
    }).join("");

    var rows = ranked.map(function (r) {
      var medal = r.rank === 0 ? "🥇" : r.rank === 1 ? "🥈" : r.rank === 2 ? "🥉" : (r.rank + 1) + ".";
      var mask = r.isImposter ? ' <span class="tz-mask">🤫</span>' : "";
      return (
        '<li class="tz-row' + (r === winner ? " tz-row--win" : "") + (r.isImposter ? " tz-row--imp" : "") + '" data-r="' + r.rank + '">' +
        '  <span class="tz-medal">' + medal + "</span>" +
        '  <span class="tz-name">' + esc(r.name) + mask + "</span>" +
        '  <span class="tz-time">' + fmt(r.seconds) + "s</span>" +
        '  <span class="tz-diff">±' + fmt(r.d) + "s</span>" +
        "</li>"
      );
    }).join("");

    var impNames = results.filter(function (r) { return r.isImposter; }).map(function (r) { return r.name; });
    var impLine = impNames.length > 1
      ? impNames.map(esc).join(" & ") + t(" were the imposters!")
      : (impNames.length ? esc(impNames[0]) + t(" was the imposter!") : "");

    els.innerHTML =
      '<section class="screen imposter-reveal tz-reveal">' +
      '  <h2 class="result-title pop tz-target-title">⏱️ ' + target + '<span class="tz-unit">s</span></h2>' +
      '  <p class="result-sub">' + t("The time was {n}s").replace("{n}", target) + "</p>" +
      '  <div class="tz-track" id="tz-track">' +
      '    <div class="tz-target" style="--pos:' + pos(target).toFixed(2) + '%"><span class="tz-target-flag">🎯</span></div>' +
           pins +
      '    <div class="tz-scale"><span>0s</span><span>' + fmt(scaleMax) + "s</span></div>" +
      "  </div>" +
      '  <ol class="tz-board">' + rows + "</ol>" +
      '  <div class="stack tz-actions" id="tz-actions">' +
      '    <p class="result-sub tz-winline">👑 <strong>' + esc(winner.name) + "</strong> " + t("landed closest!") + "</p>" +
      (impLine ? '    <p class="muted tz-impline">🤫 ' + impLine + "</p>" : "") +
      '    <button id="tz-again" class="btn btn-primary btn-block btn-xl">' + t("New round 🔁") + "</button>" +
      '    <button id="tz-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelector("#tz-again").addEventListener("click", function () {
      var roster = (ctx.players || []).filter(function (p) { return p && p.name; });
      if (roster.length >= MIN_PLAYERS) dealRoles(roster); else renderSetup();
    });
    els.querySelector("#tz-settings").addEventListener("click", renderSetup);

    var track = els.querySelector("#tz-track");
    var board = els.querySelector(".tz-board");
    var actions = els.querySelector("#tz-actions");
    function revealOne(rank) {
      if (board) { var li = board.querySelector('.tz-row[data-r="' + rank + '"]'); if (li) li.classList.add("is-in"); }
      if (track) { var pin = track.querySelector('.tz-pin[data-r="' + rank + '"]'); if (pin) pin.classList.add("is-in"); }
    }
    var k = 0;
    function step() {
      if (!els) return;
      if (k < order.length) { revealOne(order[k].rank); k++; revealTimer = setTimeout(step, 650); }
      else { if (actions) actions.classList.add("is-in"); revealTimer = null; }
    }
    if (track) track.addEventListener("click", function () {
      clearRevealTimer();
      order.forEach(function (r) { revealOne(r.rank); });
      if (actions) actions.classList.add("is-in");
    });
    revealTimer = setTimeout(step, 450);
  }

  // Whole number when it's whole, else one decimal (buzz times are fractional).
  function fmt(x) { return String(Math.round(x * 10) / 10); }
  function vibrate(pattern) {
    try { if (global.navigator && typeof global.navigator.vibrate === "function") global.navigator.vibrate(pattern); }
    catch (e) { /* ignore */ }
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
    return { word: word, category: category, hint: hintFor(key, word) };
  }

  // Look up the distant decoy hint for this secret (current language). Missing
  // entries just yield "" so the game never breaks if a word has no hint yet.
  function hintFor(poolKey, word) {
    var lang = global.Spielecke.getLang ? global.Spielecke.getLang() : "en";
    var hints = global.Spielecke.ImposterHints;
    var byLang = hints && (hints[lang] || hints.en);
    var pool = byLang && byLang[poolKey];
    return (pool && pool[word]) || "";
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
  var shuffle = global.Spielecke.shuffle;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.imposter = module;
})(window);
