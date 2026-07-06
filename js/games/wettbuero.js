/*
 * games/wettbuero.js — Wettbüro (bet on your friends)
 *
 * A candidate (rotates through the roster) draws a challenge; everyone else bets
 * sips on whether they'll pull it off. Timed challenges run a visible countdown.
 * The table judges success/fail; the app settles: right bettors hand out their
 * stake, wrong bettors drink it. The candidate distributes/drinks a flat amount.
 *
 * Content: js/content/wettbuero.js (Spielecke.WettbueroChallenges), category pools.
 * Contract: meta + mount + unmount(); unmount MUST clear the timer.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  function Pools() { return global.Spielecke.Pools; }

  var CANDIDATE_STAKE = 3;
  var BETS = [                      // the 6 cycle states of a bet pill
    { side: 0, amount: 1 }, { side: 0, amount: 2 }, { side: 0, amount: 3 },
    { side: 1, amount: 1 }, { side: 1, amount: 2 }, { side: 1, amount: 3 },
  ];

  var els = null, ctx = null, settings = null;
  var candidateIdx = 0;
  var candOrder = [];               // shuffled candidate order (spec §1.3), not roster order
  var challenge = null;
  var bets = {};                    // playerId -> state index (0..5), -1/undefined = unset
  var timer = null, remaining = 0;

  var module = {
    meta: {
      id: "wettbuero",
      name: "Wettbüro",
      tagline: "Set sips on your friends. Wrong call, you drink your own stake.",
      icon: "🎰",
      minPlayers: 3,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        pools: Pools().load(context.store, catalogue()),
        drinking: context.store.get("drinking", false) === true,
      };
      candidateIdx = 0;
      renderSetup();
    },
    unmount: function () {
      stopTimer();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; challenge = null; bets = {};
    },
  };

  function catalogue() { return global.Spielecke.L(global.Spielecke.WettbueroChallenges) || {}; }
  function roster() { return (ctx.players || []).filter(function (p) { return p && p.name; }); }

  // Candidate rotation follows a shuffled order, not the entered roster order, so
  // seat 1 isn't always up first. Rebuilds if the order is empty or a player left.
  function currentCandidate() {
    var r = roster();
    var stillHere = function (c) { return c && r.filter(function (p) { return p.id === c.id; }).length; };
    if (!candOrder.length || !stillHere(candOrder[candidateIdx % candOrder.length])) {
      candOrder = global.Spielecke.shuffle(r);
    }
    return candOrder.length ? candOrder[candidateIdx % candOrder.length] : r[0];
  }

  // --- Setup ---------------------------------------------------------------
  function renderSetup() {
    stopTimer();
    var r = roster();
    var enough = r.length >= module.meta.minPlayers;
    var note = enough
      ? '<p class="muted small">' + t("Players ({n}): {names}")
          .replace("{n}", r.length).replace("{names}", esc(r.map(function (p) { return p.name; }).join(", "))) + "</p>"
      : '<div class="roster-warn" style="display:block">' +
        t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", module.meta.minPlayers) + "</div>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🎰 ' + t("Wettbüro") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      note +
      '  <h3 class="sub">' + t("Challenge categories") + "</h3>" +
      '  <div class="chip-row" id="wb-pools">' + Pools().chipsHtml(catalogue(), t) + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="wb-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="wb-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Open the book 🎰") + "</button>" +
      "</section>";

    Pools().bind(els.querySelector("#wb-pools"), catalogue(),
      function () { return settings.pools; },
      function (v) { settings.pools = v; Pools().save(ctx.store, v); });
    els.querySelector("#wb-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    if (enough) els.querySelector("#wb-start").addEventListener("click", function () {
      candOrder = global.Spielecke.shuffle(roster()); candidateIdx = 0; renderCandidate();
    });
  }

  // --- Candidate -----------------------------------------------------------
  function renderCandidate() {
    stopTimer();
    var r = roster();
    if (r.length < module.meta.minPlayers) return renderSetup();
    var cand = currentCandidate();
    els.innerHTML =
      '<section class="screen wb-candidate">' +
      '  <div class="pass-emoji">🎤</div>' +
      '  <p class="muted">' + t("Up next") + "</p>" +
      '  <h2 class="pass-name pop">' + esc(cand.name) + "</h2>" +
      '  <p class="muted">' + t("Everyone else bets sips on whether they pull it off.") + "</p>" +
      '  <button id="wb-draw" class="btn btn-primary btn-block btn-xl">' + t("Draw a challenge 🎲") + "</button>" +
      "</section>";
    els.querySelector("#wb-draw").addEventListener("click", drawChallenge);
  }

  function drawChallenge() {
    var list = Pools().gather(settings.pools, catalogue(), "challenges");
    challenge = list.length ? list[Math.floor(Math.random() * list.length)] : { text: t("Make the table laugh in 15 seconds"), timer: 15 };
    bets = {};
    renderBetting();
  }

  // --- Betting -------------------------------------------------------------
  function renderBetting() {
    var r = roster();
    var cand = currentCandidate();
    var bettors = r.filter(function (p) { return p.id !== cand.id; });
    var timerNote = challenge.timer ? '<span class="wb-timerbadge">⏱ ' + challenge.timer + "s</span>" : "";

    var rows = bettors.map(function (p) {
      return '<button class="wb-bet" data-id="' + attr(p.id) + '"><span class="wb-bet-name">' + esc(p.name) + "</span>" +
        '<span class="wb-bet-pill" data-id="' + attr(p.id) + '">' + betLabel(bets[p.id]) + "</span></button>";
    }).join("");

    els.innerHTML =
      '<section class="screen wb-bet-screen">' +
      '  <div class="wb-card">' + timerNote + '<p class="wb-card-text">' + esc(challenge.text) + "</p></div>" +
      '  <p class="muted small">' + t("Tap each name to set their bet: ✅ they nail it / ❌ they flop, 1–3 sips.") + "</p>" +
      '  <div class="wb-bets">' + rows + "</div>" +
      '  <button id="wb-go" class="btn btn-primary btn-block btn-xl" disabled>' + t("Lock bets & go ▶️") + "</button>" +
      "</section>";

    els.querySelectorAll(".wb-bet").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-id");
        var cur = typeof bets[id] === "number" ? bets[id] : -1;
        bets[id] = (cur + 1) % BETS.length;
        var pill = b.querySelector(".wb-bet-pill");
        if (pill) pill.textContent = betLabel(bets[id]);
        updateGo(bettors);
      });
    });
    updateGo(bettors);
    els.querySelector("#wb-go").addEventListener("click", function () { runChallenge(); });
  }

  function betLabel(idx) {
    if (typeof idx !== "number" || idx < 0) return "❓";
    var b = BETS[idx];
    return (b.side === 0 ? "✅" : "❌") + " " + b.amount;
  }
  function updateGo(bettors) {
    var all = bettors.every(function (p) { return typeof bets[p.id] === "number" && bets[p.id] >= 0; });
    var go = els && els.querySelector("#wb-go");
    if (go) go.disabled = !all;
  }

  // --- Run + judge ---------------------------------------------------------
  function runChallenge() {
    var hasTimer = !!challenge.timer;
    els.innerHTML =
      '<section class="screen wb-run">' +
      '  <div class="wb-card"><p class="wb-card-text">' + esc(challenge.text) + "</p></div>" +
      (hasTimer ? '  <div class="hud-time" id="wb-time">' + challenge.timer + "s</div>" : "") +
      '  <p class="muted">' + t("Did they do it? The table decides.") + "</p>" +
      '  <div class="stack">' +
      '    <button id="wb-win" class="btn btn-got btn-block btn-xl">' + t("Nailed it ✅") + "</button>" +
      '    <button id="wb-lose" class="btn btn-skip btn-block btn-xl">' + t("Flopped ❌") + "</button>" +
      "  </div>" +
      "</section>";
    if (hasTimer) startCountdown(challenge.timer);
    els.querySelector("#wb-win").addEventListener("click", function () { stopTimer(); settle(true); });
    els.querySelector("#wb-lose").addEventListener("click", function () { stopTimer(); settle(false); });
  }

  function settle(success) {
    var r = roster();
    var cand = currentCandidate();
    var bettors = r.filter(function (p) { return p.id !== cand.id; });
    var unit = settings.drinking ? t("sips") : t("points");

    var winners = [], losers = [];
    bettors.forEach(function (p) {
      var b = BETS[bets[p.id]];
      var right = (b.side === 0 && success) || (b.side === 1 && !success);
      (right ? winners : losers).push({ name: p.name, amount: b.amount });
    });

    var lines = [];
    lines.push('<li class="wb-settle-cand">' + (success
      ? t("🎉 {name} nailed it — hands out {n} {unit}.").replace("{name}", esc(cand.name)).replace("{n}", CANDIDATE_STAKE).replace("{unit}", unit)
      : t("💀 {name} flopped — drinks {n} {unit}.").replace("{name}", esc(cand.name)).replace("{n}", CANDIDATE_STAKE).replace("{unit}", unit)) + "</li>");
    winners.forEach(function (w) {
      lines.push("<li>✅ <strong>" + esc(w.name) + "</strong> " + t("called it — hands out {n} {unit}.").replace("{n}", w.amount).replace("{unit}", unit) + "</li>");
    });
    losers.forEach(function (l) {
      lines.push("<li>❌ <strong>" + esc(l.name) + "</strong> " + t("was wrong — drinks {n} {unit}.").replace("{n}", l.amount).replace("{unit}", unit) + "</li>");
    });

    els.innerHTML =
      '<section class="screen wb-settle">' +
      '  <h2 class="result-title pop">' + (success ? t("✅ Made it!") : t("❌ Failed!")) + "</h2>" +
      '  <ul class="wb-settle-list">' + lines.join("") + "</ul>" +
      '  <div class="stack">' +
      '    <button id="wb-next" class="btn btn-primary btn-block btn-xl">' + t("Next candidate ▶️") + "</button>" +
      '    <button id="wb-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#wb-next").addEventListener("click", function () {
      candidateIdx = candidateIdx + 1;
      renderCandidate();
    });
    els.querySelector("#wb-settings").addEventListener("click", renderSetup);
  }

  // --- Timer (activity.js pattern, unmount-safe) ---------------------------
  function startCountdown(secs) {
    remaining = secs; stopTimer();
    timer = global.setInterval(function () {
      remaining--;
      var el = els && els.querySelector("#wb-time");
      if (el) {
        if (remaining <= 0) { el.textContent = "⏰ " + t("TIME!"); el.classList.add("hud-time--danger"); }
        else { el.textContent = remaining + "s"; if (remaining <= 5) el.classList.add("hud-time--danger"); }
      }
      if (remaining <= 0) stopTimer();
    }, 1000);
  }
  function stopTimer() { if (timer !== null) { global.clearInterval(timer); timer = null; } }

  var esc = global.Spielecke.esc;
  var attr = global.Spielecke.attr;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.wettbuero = module;
})(window);
