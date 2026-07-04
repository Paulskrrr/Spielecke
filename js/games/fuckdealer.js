/*
 * games/fuckdealer.js — „Fuck the Dealer" (classic, amounts & dealer rotation)
 *
 * A dealer holds the virtual deck; the table guesses the rank of the next card.
 *   - First guess wrong  -> dealer gives a höher/tiefer hint, second guess.
 *   - Second guess wrong -> guesser trinkt (rank-gap sips, or flat — the
 *                           setup screen's chips pick the formula).
 *   - Guessed right       -> the dealer trinkt a fixed amount.
 * The card is revealed & discarded; play passes to the next guesser. The
 * dealer passes left after the deck has been reshuffled twice.
 *
 * Reuses the shared deck/card-face (Spielecke.Cards) and the shell contract
 * (roster for dealer + guessers, namespaced store for the wrong-formula
 * setting).
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  var Cards = global.Spielecke.Cards;

  // ── Config block (spec: editable amounts & triggers) ──────────────────────
  var DEFAULTS = {
    dealerHitSips: 2,        // guesser right -> dealer drinks this many
    wrongFormula: "gap",     // "gap" (rank distance) | "flat"
    flatWrongSips: 2,        // used when wrongFormula === "flat"
    rotateAfterExhausts: 2,  // dealer passes left after the deck empties N times
  };

  var els = null, ctx = null, settings = null;
  var deck = [], discard = [];
  var dealerIdx = 0, guesserIdx = 0, exhausts = 0;
  var current = null;        // the live top card
  var firstGuess = null;     // rank string of the first (wrong) guess
  var phase = "first";       // "first" | "second"
  var busy = false;

  var module = {
    meta: {
      id: "fuckdealer",
      name: "Fuck the Dealer",
      tagline: "Guess the card. Miss twice and you drink — nail it and the dealer does.",
      icon: "🃏",
      minPlayers: 2,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        // No setup control adjusts these two — they're fixed, unlike
        // wrongFormula (which the #fd-formula chips below do control).
        dealerHitSips: DEFAULTS.dealerHitSips,
        flatWrongSips: DEFAULTS.flatWrongSips,
        wrongFormula: context.store.get("wrongFormula", DEFAULTS.wrongFormula) === "flat" ? "flat" : "gap",
      };
      dealerIdx = 0;
      renderSetup();
    },
    unmount: function () {
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; deck = []; discard = []; current = null; busy = false;
    },
  };

  function names() {
    return (ctx.players || []).filter(function (p) { return p && p.name; }).map(function (p) { return p.name; });
  }
  function dealerName() { var ns = names(); return ns.length ? ns[dealerIdx % ns.length] : t("the dealer"); }
  function guesserName() { var ns = names(); return ns.length ? ns[guesserIdx % ns.length] : t("the guesser"); }

  // ── Setup ────────────────────────────────────────────────────────────────
  function renderSetup() {
    var ns = names();
    if (ns.length < 2) {
      els.innerHTML =
        '<section class="screen game-setup">' +
        '  <h2 class="screen-title pop">🃏 ' + t("Fuck the Dealer") + "</h2>" +
        '  <div class="roster-warn" style="display:block">' + t("⚠ Add at least 2 players from the header (👥): one dealer, the rest guess.") + "</div>" +
        "</section>";
      return;
    }

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🃏 ' + t("Fuck the Dealer") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <h3 class="sub">' + t("Dealer") + "</h3>" +
      '  <div class="chip-row" id="fd-dealer">' +
      ns.map(function (n, i) { return '<button class="chip" data-i="' + i + '">' + esc(n) + "</button>"; }).join("") +
      "  </div>" +
      '  <h3 class="sub">' + t("Punishment for a double miss") + "</h3>" +
      '  <div class="chip-row" id="fd-formula">' +
      '    <button class="chip" data-f="gap">' + t("Rank gap = sips") + "</button>" +
      '    <button class="chip" data-f="flat">' + t("Flat") + " " + settings.flatWrongSips + " " + t("sips") + "</button>" +
      "  </div>" +
      '  <p class="muted small">' + t("Right guess → dealer trinkt {n} sips.").replace("{n}", settings.dealerHitSips) +
      " " + t("Dealer passes left after the deck empties twice.") + "</p>" +
      '  <button id="fd-start" class="btn btn-primary btn-block btn-xl">' + t("Deal 🃏") + "</button>" +
      "</section>";

    highlight("#fd-dealer", String(dealerIdx), "data-i");
    els.querySelectorAll("#fd-dealer .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        dealerIdx = parseInt(c.getAttribute("data-i"), 10) || 0;
        highlight("#fd-dealer", String(dealerIdx), "data-i");
      });
    });
    highlight("#fd-formula", settings.wrongFormula, "data-f");
    els.querySelectorAll("#fd-formula .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.wrongFormula = c.getAttribute("data-f");
        ctx.store.set("wrongFormula", settings.wrongFormula);
        highlight("#fd-formula", settings.wrongFormula, "data-f");
      });
    });
    els.querySelector("#fd-start").addEventListener("click", startGame);
  }

  function startGame() {
    deck = Cards.shuffle(Cards.newDeck());
    discard = [];
    exhausts = 0;
    // First guesser is the player to the dealer's left.
    guesserIdx = (dealerIdx + 1) % names().length;
    nextCard();
  }

  function nextCard() {
    if (!deck.length) {
      deck = Cards.shuffle(discard);
      discard = [];
      exhausts++;
      if (exhausts >= DEFAULTS.rotateAfterExhausts) {
        exhausts = 0;
        var n = names().length;
        dealerIdx = (dealerIdx + 1) % n;
        renderDealerPass();
        return;
      }
    }
    current = deck.shift();
    firstGuess = null;
    phase = "first";
    busy = false;
    renderRound();
  }

  function renderDealerPass() {
    els.innerHTML =
      '<section class="screen fd-screen">' +
      '  <h2 class="screen-title pop">🔄 ' + t("Deck emptied twice!") + "</h2>" +
      '  <p class="bf-q">' + t("The deck passes left. New dealer:") + " <b>" + esc(dealerName()) + "</b></p>" +
      '  <button id="fd-go" class="btn btn-primary btn-block btn-xl">' + t("Deal 🃏") + "</button>" +
      "</section>";
    els.querySelector("#fd-go").addEventListener("click", function () {
      guesserIdx = (dealerIdx + 1) % names().length;
      current = deck.shift();
      firstGuess = null; phase = "first"; busy = false;
      renderRound();
    });
  }

  // ── Round screen ──────────────────────────────────────────────────────────
  function renderRound() {
    var hint = "";
    if (phase === "second" && firstGuess) {
      var dir = Cards.value(current) > rankValue(firstGuess) ? t("⬆️ Höher!") : t("⬇️ Tiefer!");
      hint = '<div class="fd-hint">' + t("Dealer says:") + " <b>" + dir + "</b> " +
        t("than {r}").replace("{r}", firstGuess) + "</div>";
    }

    els.innerHTML =
      '<section class="screen fd-screen">' +
      '  <div class="fd-head">' +
      '    <span class="fd-dealer">🃏 ' + t("Dealer") + ": <b>" + esc(dealerName()) + "</b></span>" +
      '    <span class="fd-deck">' + deck.length + " " + t("left") + "</span>" +
      "  </div>" +
      '  <div class="fd-cardwrap">' + Cards.flipHtml(current, { id: "fd-flip" }) + "</div>" +
      '  <p class="fd-turn">' + t("Guesser:") + " <b>" + esc(guesserName()) + "</b> — " +
      (phase === "first" ? t("call a rank") : t("second guess!")) + "</p>" +
      "  " + hint +
      '  <div class="fd-ranks" id="fd-ranks">' +
      Cards.RANKS.map(function (r) { return '<button class="btn btn-rank" data-r="' + r + '">' + r + "</button>"; }).join("") +
      "  </div>" +
      '  <div class="fd-result" id="fd-result">&nbsp;</div>' +
      "  " + historyHtml() +
      "</section>";

    els.querySelectorAll("#fd-ranks .btn-rank").forEach(function (b) {
      b.addEventListener("click", function () { callRank(b.getAttribute("data-r")); });
    });
  }

  // The scrollable strip of every card drawn since the last shuffle, so the
  // table can glance at what's already out (counting help). Sorted by rank
  // (2 → A, left to right) — not chronological — so gaps/open ranks jump out at
  // a glance; on desktop a dozen show at once, on mobile you swipe the strip.
  var SUIT_RANK = { S: 0, H: 1, D: 2, C: 3 };
  function sortedDiscard() {
    return discard.slice().sort(function (a, b) {
      return Cards.value(a) - Cards.value(b) || (SUIT_RANK[a.suit] - SUIT_RANK[b.suit]);
    });
  }
  function histCardHtml(c, isNew) {
    return '<div class="fd-histcard' + (isNew ? " fd-histcard--new" : "") + '">' + Cards.faceHtml(c, { small: true }) + "</div>";
  }
  function historyHtml() {
    var inner = discard.length
      ? sortedDiscard().map(function (c) { return histCardHtml(c, false); }).join("")
      : '<div class="fd-history-empty">' + t("No cards drawn yet — the pile builds up here.") + "</div>";
    return (
      '<div class="fd-history-wrap">' +
      '  <div class="fd-history-head">' + t("Cards drawn") +
      '    <span class="fd-history-count" id="fd-history-count">' + discard.length + "</span></div>" +
      '  <div class="fd-history" id="fd-history">' + inner + "</div>" +
      "</div>"
    );
  }

  function rankValue(rank) { return Cards.RANKS.indexOf(rank) + 2; }

  function callRank(rank) {
    if (busy) return;
    var actual = current.rank;
    if (rank === actual) { busy = true; resolveHit(rank); return; }

    if (phase === "first") {
      firstGuess = rank;
      phase = "second";
      renderRound();
    } else {
      busy = true;
      resolveMiss(rank);
    }
  }

  function resolveHit(rank) {
    els.querySelectorAll("#fd-ranks .btn-rank").forEach(function (b) { b.disabled = true; });
    Cards.reveal(els.querySelector("#fd-flip"));
    var resEl = els.querySelector("#fd-result");
    resEl.innerHTML =
      '<div class="fd-win">✅ ' + t("Spot on!") + " " + Cards.suitSymbol(current) + current.rank + "<br/>" +
      "<b>" + esc(dealerName()) + "</b> " + t("trinkt") + " " +
      '<span class="bf-sips">' + settings.dealerHitSips + " " + t(settings.dealerHitSips === 1 ? "sip" : "sips") + "</span></div>";
    advanceAfter();
  }

  function resolveMiss(secondRank) {
    els.querySelectorAll("#fd-ranks .btn-rank").forEach(function (b) { b.disabled = true; });
    Cards.reveal(els.querySelector("#fd-flip"));
    var actualV = Cards.value(current);
    var sips;
    if (settings.wrongFormula === "flat") {
      sips = settings.flatWrongSips;
    } else {
      var d1 = Math.abs(rankValue(firstGuess) - actualV);
      var d2 = Math.abs(rankValue(secondRank) - actualV);
      sips = Math.min(d1, d2); // closest guess's gap
    }
    var resEl = els.querySelector("#fd-result");
    resEl.innerHTML =
      '<div class="fd-lose">❌ ' + t("It was") + " " + Cards.suitSymbol(current) + current.rank + ".<br/>" +
      "<b>" + esc(guesserName()) + "</b> " + t("trinkt") + " " +
      '<span class="bf-sips">' + sips + " " + t(sips === 1 ? "sip" : "sips") + "</span></div>";
    advanceAfter();
  }

  function advanceAfter() {
    discard.push(current);
    // Rebuild the history strip live, re-sorted by rank, so the just-revealed
    // card drops into its right place (it would also be rebuilt by the next
    // renderRound; this just shows it landing immediately).
    var hist = els.querySelector("#fd-history");
    if (hist) {
      hist.innerHTML = sortedDiscard().map(function (c) {
        return histCardHtml(c, c === current); // identity match flags the new card
      }).join("");
      var cnt = els.querySelector("#fd-history-count");
      if (cnt) cnt.textContent = discard.length;
      var fresh = hist.querySelector(".fd-histcard--new");
      if (fresh && fresh.scrollIntoView) {
        try { fresh.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }
        catch (e) { /* older browsers: leave scroll as-is */ }
      }
    }
    // Tap the just-revealed card itself to move on — no separate button.
    function goNext() {
      guesserIdx = (guesserIdx + 1) % names().length;
      if (guesserIdx === dealerIdx) guesserIdx = (guesserIdx + 1) % names().length; // dealer doesn't guess
      nextCard();
    }
    global.Spielecke.tappable(els.querySelector("#fd-flip"), goNext);
    var resEl = els.querySelector("#fd-result");
    if (resEl) {
      var hint = document.createElement("div");
      hint.className = "tap-hint";
      hint.textContent = t("👆 Tap the card to continue");
      resEl.appendChild(hint);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) {
      c.classList.toggle("chip--active", c.getAttribute(an) === value);
    });
  }
  var esc = global.Spielecke.esc;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.fuckdealer = module;
})(window);
