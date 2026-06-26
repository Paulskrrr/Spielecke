/*
 * games/pferderennen.js — „Das Pferderennen" (Horse Race, betting drinking game)
 *
 * The digital showpiece. The four Aces are the horses (♠♥♦♣); the remaining 48
 * cards are the draw pile, with six face-down "hurdle" cards laid sideways. The
 * app flips draw cards one at a time — the matching-suit horse advances. When
 * every horse has cleared a hurdle's level the next hurdle flips and sends its
 * suit's horse back one step (the rubber-band). First horse past the final
 * hurdle wins; players who bet it verteilen sips, the rest trinken.
 *
 * Reuses the shared deck/card-face (Spielecke.Cards) and the shell contract
 * (roster for bets, namespaced store for config). The paced animation runs on a
 * single setTimeout chain that is always cleared on unmount.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  var Cards = global.Spielecke.Cards;

  // ── Config block (spec: hurdle count, flip speed, loss formula) ───────────
  var DEFAULTS = {
    hurdleCount: 6,
    flipMs: 850,            // delay per flip (paced like a race call)
    lossFormula: "flat",    // "flat" | "lengths"
    flatLossSips: 3,
  };
  var SPEEDS = { slow: 1300, normal: 850, fast: 450 };

  var SUITS = Cards.SUIT_ORDER; // S H D C
  var HORSE_EMOJI = "🐎"; // all four lanes share the same horse; suit tells them apart

  var els = null, ctx = null, settings = null;
  var bets = {};            // playerId -> suit  (keyed by id so duplicate names never collide)
  var draw = [], discard = [], hurdles = [];
  var pos = { S: 0, H: 0, D: 0, C: 0 };
  var flippedHurdles = 0, finishPos = 7, winner = null, leader = null, leadChanged = false;
  var raceTimer = null, running = false;

  var module = {
    meta: {
      id: "pferderennen",
      name: "Horse Race",
      tagline: "Bet on a suit. Cheer your horse. The losers drink.",
      icon: "🐎",
      minPlayers: 1,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      var savedSpeed = context.store.get("flipMs", DEFAULTS.flipMs);
      settings = {
        hurdleCount: DEFAULTS.hurdleCount,
        flipMs: num(savedSpeed, DEFAULTS.flipMs),
        lossFormula: context.store.get("lossFormula", DEFAULTS.lossFormula) === "lengths" ? "lengths" : "flat",
        flatLossSips: DEFAULTS.flatLossSips,
      };
      bets = context.store.get("bets", {}) || {};
      renderSetup();
    },
    unmount: function () {
      stopRace();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; bets = {}; winner = null;
    },
  };

  function stopRace() {
    running = false;
    if (raceTimer !== null) { global.clearTimeout(raceTimer); raceTimer = null; }
  }
  function num(v, d) { var n = parseInt(v, 10); return isNaN(n) ? d : n; }
  function roster() {
    return (ctx.players || []).filter(function (p) { return p && p.name; });
  }

  // ── Setup / betting ────────────────────────────────────────────────────────
  function renderSetup() {
    stopRace();
    var ros = roster();
    var speedKey = settings.flipMs >= SPEEDS.slow ? "slow" : settings.flipMs <= SPEEDS.fast ? "fast" : "normal";

    var betRows = ros.length
      ? ros.map(function (p) {
          return (
            '<div class="hr-betrow" data-player="' + attr(p.id) + '">' +
            '  <span class="hr-betname">' + esc(p.name) + "</span>" +
            '  <span class="hr-betsuits">' +
            SUITS.map(function (s) {
              var on = bets[p.id] === s ? " hr-suit--on" : "";
              return '<button class="hr-suit hr-suit--' + Cards.SUITS[s].colour + on + '" data-suit="' + s + '">' + Cards.SUITS[s].symbol + "</button>";
            }).join("") +
            "  </span>" +
            "</div>"
          );
        }).join("")
      : '<p class="muted small">' + t("No players — add some from the header (👥) to place bets, or just watch the race.") + "</p>";

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🐎 ' + t("Horse Race") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <div class="hr-horses">' +
      SUITS.map(function (s) {
        return '<span class="hr-horsechip hr-suit--' + Cards.SUITS[s].colour + '">' + HORSE_EMOJI + " " + Cards.SUITS[s].symbol + "</span>";
      }).join("") +
      "  </div>" +
      '  <h3 class="sub">' + t("Place your bets") + "</h3>" +
      '  <div class="hr-bets" id="hr-bets">' + betRows + "</div>" +
      '  <h3 class="sub">' + t("Race speed") + "</h3>" +
      '  <div class="chip-row" id="hr-speed">' +
      '    <button class="chip" data-s="slow">🐢 ' + t("Slow") + "</button>" +
      '    <button class="chip" data-s="normal">🏇 ' + t("Normal") + "</button>" +
      '    <button class="chip" data-s="fast">⚡ ' + t("Fast") + "</button>" +
      "  </div>" +
      '  <h3 class="sub">' + t("Loss penalty") + "</h3>" +
      '  <div class="chip-row" id="hr-loss">' +
      '    <button class="chip" data-l="flat">' + t("Flat") + " " + settings.flatLossSips + " " + t("sips") + "</button>" +
      '    <button class="chip" data-l="lengths">' + t("Lengths behind") + "</button>" +
      "  </div>" +
      '  <button id="hr-start" class="btn btn-primary btn-block btn-xl">' + t("To the start line 🏁") + "</button>" +
      "</section>";

    els.querySelectorAll("#hr-bets .hr-suit").forEach(function (b) {
      b.addEventListener("click", function () {
        var rowEl = b.closest(".hr-betrow");
        var player = rowEl.getAttribute("data-player");
        var suit = b.getAttribute("data-suit");
        bets[player] = suit;
        ctx.store.set("bets", bets);
        rowEl.querySelectorAll(".hr-suit").forEach(function (x) {
          x.classList.toggle("hr-suit--on", x.getAttribute("data-suit") === suit);
        });
      });
    });
    highlight("#hr-speed", speedKey, "data-s");
    els.querySelectorAll("#hr-speed .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        var key = c.getAttribute("data-s");
        settings.flipMs = SPEEDS[key] || SPEEDS.normal;
        ctx.store.set("flipMs", settings.flipMs);
        highlight("#hr-speed", key, "data-s");
      });
    });
    highlight("#hr-loss", settings.lossFormula, "data-l");
    els.querySelectorAll("#hr-loss .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.lossFormula = c.getAttribute("data-l");
        ctx.store.set("lossFormula", settings.lossFormula);
        highlight("#hr-loss", settings.lossFormula, "data-l");
      });
    });
    els.querySelector("#hr-start").addEventListener("click", setupRace);
  }

  // ── Race build ─────────────────────────────────────────────────────────────
  function setupRace() {
    // Pull the four Aces as horses; shuffle the other 48.
    var rest = Cards.shuffle(Cards.newDeck().filter(function (c) { return c.rank !== "A"; }));
    hurdles = rest.slice(0, settings.hurdleCount).map(function (c) { return { card: c, flipped: false }; });
    draw = rest.slice(settings.hurdleCount);
    discard = [];
    pos = { S: 0, H: 0, D: 0, C: 0 };
    flippedHurdles = 0;
    finishPos = settings.hurdleCount + 1;
    winner = null;
    leader = null;
    renderTrack(t("They're at the gate… 🏁"));
    // Kick off the paced animation straight away — no extra GO tap needed.
    startRace();
  }

  function renderTrack(commentary) {
    var lanes = SUITS.map(function (s) {
      var leftPct = (pos[s] / finishPos) * 100;
      return (
        '<div class="hr-lane hr-suit--' + Cards.SUITS[s].colour + '">' +
        '  <span class="hr-lanetag">' + Cards.SUITS[s].symbol + "</span>" +
        '  <div class="hr-track">' +
        hurdleMarkers() +
        '    <span class="hr-finish">🏁</span>' +
        '    <span class="hr-horse" style="left:' + leftPct.toFixed(2) + '%">' + HORSE_EMOJI + "</span>" +
        "  </div>" +
        "</div>"
      );
    }).join("");

    var topCardHtml = discard.length
      ? '<div class="hr-topcard">' + Cards.faceHtml(discard[discard.length - 1], { small: true }) + "</div>"
      : '<div class="hr-topcard">' + Cards.backHtml({ small: true }) + "</div>";

    els.innerHTML =
      '<section class="screen hr-screen">' +
      '  <div class="hr-board">' + lanes + "</div>" +
      '  <div class="hr-info">' +
      "    " + topCardHtml +
      '    <div class="hr-commentary" id="hr-commentary">' + esc(commentary || "") + "</div>" +
      '    <div class="hr-deckcount">' + draw.length + " " + t("cards in the pile") + "</div>" +
      "  </div>" +
      '  <div class="hr-controls" id="hr-controls"></div>' +
      "</section>";
    renderControls();
  }

  function renderControls() {
    var c = els.querySelector("#hr-controls");
    if (!c) return;
    if (winner) {
      c.innerHTML = "";
      return; // results screen handles its own buttons
    }
    if (running) {
      c.innerHTML =
        '<button id="hr-pause" class="btn btn-block">⏸ ' + t("Pause") + "</button>" +
        '<button id="hr-skip" class="btn btn-ghost btn-block">⏭ ' + t("Skip to finish") + "</button>";
      c.querySelector("#hr-pause").addEventListener("click", pauseRace);
      c.querySelector("#hr-skip").addEventListener("click", skipToFinish);
    } else {
      c.innerHTML =
        '<button id="hr-go" class="btn btn-primary btn-block btn-xl">' +
        (pos.S + pos.H + pos.D + pos.C === 0 ? t("And… they're off! 🏇") : t("Resume ▶️")) + "</button>";
      c.querySelector("#hr-go").addEventListener("click", startRace);
    }
  }

  function hurdleMarkers() {
    var out = "";
    for (var i = 0; i < hurdles.length; i++) {
      var level = i + 1;
      var leftPct = (level / finishPos) * 100;
      var h = hurdles[i];
      var face = h.flipped
        ? '<span class="hr-hurdle-suit hr-suit--' + Cards.SUITS[h.card.suit].colour + '">' + Cards.SUITS[h.card.suit].symbol + "</span>"
        : "";
      out += '<span class="hr-hurdle' + (h.flipped ? " hr-hurdle--flipped" : "") + '" style="left:' + leftPct.toFixed(2) + '%">' + face + "</span>";
    }
    return out;
  }

  // ── Paced animation ────────────────────────────────────────────────────────
  function startRace() {
    if (running || winner) return;
    running = true;
    renderControls();
    tick();
  }
  function pauseRace() {
    stopRace();
    renderControls();
  }
  function skipToFinish() {
    stopRace();
    // Run the rest synchronously, no animation.
    while (!winner) { stepOnce(); }
    finish();
  }

  function tick() {
    if (!running) return;
    stepOnce();
    updateTrack();
    if (winner) { stopRace(); finish(); return; }
    raceTimer = global.setTimeout(tick, settings.flipMs);
  }

  // Advance the race by a single card flip. Mutates pos/hurdles/winner/leader.
  function stepOnce() {
    if (!draw.length) {
      draw = Cards.shuffle(discard);
      discard = [];
      if (!draw.length) { return; } // safety
    }
    var card = draw.shift();
    discard.push(card);
    var s = card.suit;
    if (pos[s] < finishPos) pos[s]++;

    // Winner?
    if (pos[s] >= finishPos) { winner = s; return; }

    // Hurdle: flip the next one once every horse has cleared its level, sending
    // that hurdle's suit back a step (the rubber-band).
    while (flippedHurdles < hurdles.length && minPos() >= flippedHurdles + 1) {
      var h = hurdles[flippedHurdles];
      h.flipped = true;
      flippedHurdles++;
      var bs = h.card.suit;
      if (pos[bs] > 0) pos[bs]--;
      h.justFlipped = true;
    }

    // Track lead changes for the commentator.
    var lead = currentLeader();
    if (lead && lead !== leader) { leader = lead; leadChanged = true; }
  }

  function minPos() { return Math.min(pos.S, pos.H, pos.D, pos.C); }
  function currentLeader() {
    var best = -1, who = null, tie = false;
    SUITS.forEach(function (s) {
      if (pos[s] > best) { best = pos[s]; who = s; tie = false; }
      else if (pos[s] === best) { tie = true; }
    });
    return tie ? null : who;
  }

  function updateTrack() {
    // Move horses + reflect newly flipped hurdles, plus a commentator quip.
    var board = els.querySelector(".hr-board");
    if (board) {
      SUITS.forEach(function (s, i) {
        var horse = board.querySelectorAll(".hr-horse")[i];
        if (horse) horse.style.left = ((pos[s] / finishPos) * 100).toFixed(2) + "%";
      });
      // Re-render hurdle markers cheaply by toggling classes.
      var laneTracks = board.querySelectorAll(".hr-track");
      laneTracks.forEach(function (track) {
        var marks = track.querySelectorAll(".hr-hurdle");
        for (var i = 0; i < marks.length; i++) {
          if (hurdles[i] && hurdles[i].flipped && !marks[i].classList.contains("hr-hurdle--flipped")) {
            marks[i].classList.add("hr-hurdle--flipped");
            marks[i].innerHTML = '<span class="hr-hurdle-suit hr-suit--' + Cards.SUITS[hurdles[i].card.suit].colour + '">' + Cards.SUITS[hurdles[i].card.suit].symbol + "</span>";
          }
        }
      });
    }
    var topWrap = els.querySelector(".hr-topcard");
    if (topWrap && discard.length) topWrap.innerHTML = Cards.faceHtml(discard[discard.length - 1], { small: true });
    var deckEl = els.querySelector(".hr-deckcount");
    if (deckEl) deckEl.textContent = draw.length + " " + t("cards in the pile");
    var comEl = els.querySelector("#hr-commentary");
    if (comEl) comEl.textContent = commentate();
  }

  function commentate() {
    var justFlipped = hurdles.filter(function (h) { return h.justFlipped; })[0];
    if (justFlipped) {
      justFlipped.justFlipped = false;
      return t("Hurdle! {s} stumbles and drops back!").replace("{s}", Cards.SUITS[justFlipped.card.suit].label);
    }
    if (leadChanged && leader) {
      leadChanged = false;
      return t("{s} takes the lead!").replace("{s}", Cards.SUITS[leader].label);
    }
    var maxP = Math.max(pos.S, pos.H, pos.D, pos.C);
    if (maxP >= finishPos - 1) return t("Down the home stretch!");
    return t("And they're racing…");
  }

  // ── Finish & payouts ───────────────────────────────────────────────────────
  function finish() {
    stopRace();
    var winSuit = winner;
    var winColour = Cards.SUITS[winSuit].colour;
    var winLabel = Cards.SUITS[winSuit].label;

    // Build payout rows from the CURRENT roster (keyed by id), so each player's
    // name shows correctly and bets from players who have since left are dropped.
    var entries = roster().filter(function (p) { return bets[p.id]; }).map(function (p) {
      var s = bets[p.id];
      var won = s === winSuit;
      var behind = finishPos - pos[s];
      var sips = settings.lossFormula === "lengths" ? Math.max(1, behind) : settings.flatLossSips;
      return { player: p.name, suit: s, won: won, behind: behind, sips: sips };
    });

    var winners = entries.filter(function (e) { return e.won; });
    var losers = entries.filter(function (e) { return !e.won; });

    var resultList = entries.length
      ? '<ul class="hr-payouts">' +
        winners.map(function (e) {
          return '<li class="hr-pay hr-pay--win"><b>' + esc(e.player) + "</b> " + Cards.SUITS[e.suit].symbol +
            " — " + t("verteilt Schlücke! 🎉") + "</li>";
        }).join("") +
        losers.map(function (e) {
          return '<li class="hr-pay hr-pay--lose"><b>' + esc(e.player) + "</b> " + Cards.SUITS[e.suit].symbol +
            " — " + t("trinkt") + " <span class=\"bf-sips\">" + e.sips + " " + t(e.sips === 1 ? "sip" : "sips") + "</span></li>";
        }).join("") +
        "</ul>"
      : '<p class="muted">' + t("No bets this race — just glory.") + "</p>";

    els.innerHTML =
      '<section class="screen hr-screen hr-result">' +
      '  <h2 class="screen-title pop hr-suit--' + winColour + '">🏆 ' + HORSE_EMOJI + " " + Cards.SUITS[winSuit].symbol + " " + esc(winLabel) + " " + t("wins!") + "</h2>" +
      "  " + resultList +
      '  <button id="hr-rematch" class="btn btn-primary btn-block btn-xl">' + t("Rematch 🔁") + "</button>" +
      '  <button id="hr-rebet" class="btn btn-block">' + t("New bets 🎲") + "</button>" +
      "</section>";

    els.querySelector("#hr-rematch").addEventListener("click", setupRace);
    els.querySelector("#hr-rebet").addEventListener("click", renderSetup);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) {
      c.classList.toggle("chip--active", c.getAttribute(an) === value);
    });
  }
  var esc = global.Spielecke.esc;
  var attr = global.Spielecke.attr;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.pferderennen = module;
})(window);
