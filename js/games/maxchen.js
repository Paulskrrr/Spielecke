/*
 * games/maxchen.js — „Mäxchen" (a.k.a. Mia / Lügenmax / Meiern)
 *
 * The bluffing dice classic, on one passed-around phone. Two dice live under a
 * hat (🎩 — the hero element you tap, never a button). You roll in secret, then
 * announce a value that MUST beat the value the previous player announced — tell
 * the truth or lie through your teeth. When the hat reaches you, you either
 * believe the claim and roll on, or lift the hat to call the bluff:
 *   - claim was a lie (real roll ranks below it)  -> the liar loses a life.
 *   - claim was true (real roll ranks at/above it) -> the doubter loses a life.
 * A claimed "Mäxchen" (21) can't be rolled over — the next player must lift it,
 * and the loser of a Mäxchen showdown pays double.
 *
 * Ranking (low → high): 31 32 41 42 43 51 52 53 54 61 62 63 64 65, then the
 * Päsche 11 22 33 44 55 66, then Mäxchen 21 on top. A roll of dice (a,b) reads
 * as max*10 + min, so the two pips alone tell you where you sit.
 *
 * Uses the shell contract: shared roster for the pass order, namespaced store
 * for config. Lives give the night an arc; drinking mode just adds the sips.
 * Pure setTimeout for the roll shake, always cleared on unmount.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  var tappable = global.Spielecke.tappable;

  var MIN_PLAYERS = 2;

  // Rank ladder, lowest first. Index === strength.
  var ORDER = [
    31, 32, 41, 42, 43, 51, 52, 53, 54, 61, 62, 63, 64, 65, // Zahlen
    11, 22, 33, 44, 55, 66,                                  // Päsche
    21,                                                       // Mäxchen
  ];
  var MAEX = 21;

  // 3×3 pip layout per die face (filled grid cells, 0..8 reading left→right).
  var PIPS = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  var SHAKE_MS = 700;
  var LIVES_OPTIONS = [2, 3, 5];

  var els = null, ctx = null, settings = null;
  var players = [];          // [{ name, lives }]
  var curIdx = 0;            // whose turn (index into players, always "alive")
  var currentClaim = null;   // value announced by predecessor (null = round open)
  var lastRoll = null;       // predecessor's real roll value (the secret)
  var lastRollerIdx = -1;    // who made currentClaim
  var selRank = 0;           // claim picker cursor
  var truthValue = null;     // current roller's real roll value
  var shakeTimer = null;

  var module = {
    meta: {
      id: "maxchen",
      name: "Mia",
      tagline: "Two dice under the hat. Beat the last claim — or lie. Get caught and you drink.",
      icon: "🎩",
      minPlayers: MIN_PLAYERS,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = {
        lives: clampLives(context.store.get("lives", 3)),
        drinking: context.store.get("drinking", false) === true,
      };
      renderSetup();
    },
    unmount: function () {
      clearShake();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; players = [];
      currentClaim = null; lastRoll = null; truthValue = null; lastRollerIdx = -1;
    },
  };

  function clearShake() {
    if (shakeTimer !== null) { global.clearTimeout(shakeTimer); shakeTimer = null; }
  }
  function clampLives(v) {
    var n = parseInt(v, 10);
    return LIVES_OPTIONS.indexOf(n) >= 0 ? n : 3;
  }
  function roster() {
    return (ctx.players || []).filter(function (p) { return p && p.name; });
  }

  // ── Setup ──────────────────────────────────────────────────────────────────
  function renderSetup() {
    clearShake();
    var r = roster();
    var enough = r.length >= MIN_PLAYERS;
    var note = enough
      ? '<p class="muted small">' + t("Players ({n}): {names}").replace("{n}", r.length).replace("{names}", esc(r.map(function (p) { return p.name; }).join(", "))) + "</p>"
      : '<div class="roster-warn" style="display:block">' + t("⚠ Needs at least {n} players. Add them from the header (👥).").replace("{n}", MIN_PLAYERS) + "</div>";

    var lifeChips = LIVES_OPTIONS.map(function (n) {
      return '<button class="chip" data-lives="' + n + '">' + heartString(n) + "</button>";
    }).join("");

    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🎩 ' + t("Mia") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      note +
      '  <details class="mx-rules"><summary>' + t("How does it work?") + "</summary>" +
      '    <p class="muted small">' + t("Roll the two dice in secret, then announce a value HIGHER than the player before you — truth or bluff. When the hat reaches you, believe the claim and roll on, or lift the hat to call it. Lie that gets caught, or wrong accusation: lose a life. Ranking: 31…65, then doubles, then Mäxchen (21) on top.") + "</p>" +
      "  </details>" +
      '  <h3 class="sub">' + t("Lives per player") + "</h3>" +
      '  <div class="chip-row" id="mx-lives">' + lifeChips + "</div>" +
      '  <label class="toggle"><input type="checkbox" id="mx-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="mx-start" class="btn btn-primary btn-block btn-xl"' + (enough ? "" : " disabled") + ">" + t("Start game ▶️") + "</button>" +
      "</section>";

    highlight("#mx-lives", String(settings.lives), "data-lives");
    els.querySelectorAll("#mx-lives .chip").forEach(function (c) {
      c.addEventListener("click", function () {
        settings.lives = clampLives(c.getAttribute("data-lives"));
        ctx.store.set("lives", settings.lives);
        highlight("#mx-lives", String(settings.lives), "data-lives");
      });
    });
    els.querySelector("#mx-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    var start = els.querySelector("#mx-start");
    if (enough) start.addEventListener("click", startGame);
  }

  function startGame() {
    players = roster().map(function (p) { return { name: p.name, lives: settings.lives }; });
    curIdx = 0;
    startRound(0);
  }

  // ── Round / turn flow ────────────────────────────────────────────────────────
  function startRound(starterIdx) {
    currentClaim = null;
    lastRoll = null;
    lastRollerIdx = -1;
    truthValue = null;
    curIdx = nextAlive(starterIdx, true);
    renderPass();
  }

  function aliveCount() {
    return players.filter(function (p) { return p.lives > 0; }).length;
  }
  // First alive index at/after `from` (inclusive when `incl`), wrapping around.
  function nextAlive(from, incl) {
    var n = players.length;
    for (var step = incl ? 0 : 1; step <= n; step++) {
      var i = ((from + step) % n + n) % n;
      if (players[i].lives > 0) return i;
    }
    return from; // single survivor / game over
  }

  // Hand-off screen: shields the next player's secret roll. The claim itself is
  // public (it was announced aloud), so we show what they're walking into.
  function renderPass() {
    clearShake();
    var name = players[curIdx].name;
    var facing = currentClaim
      ? '<p class="mx-facing">' + t("On the table: {claim}").replace("{claim}", claimChip(currentClaim)) + "</p>"
      : '<p class="muted">' + t("You open the round — roll freely.") + "</p>";

    els.innerHTML =
      '<section class="screen mx-pass">' +
      livesBar() +
      '  <div class="pass-step">' + t("Pass the hat") + "</div>" +
      '  <div class="pass-emoji">🎩</div>' +
      '  <h2 class="pass-name pop">' + esc(name) + "</h2>" +
      facing +
      '  <button id="mx-take" class="btn btn-primary btn-block btn-xl">' + t("I'm {name} — take the hat").replace("{name}", esc(name)) + "</button>" +
      "</section>";
    els.querySelector("#mx-take").addEventListener("click", function () {
      if (currentClaim) renderDecide(); else renderRoll();
    });
  }

  // You hold the hat with a claim on the table: believe & roll, or lift to call.
  function renderDecide() {
    clearShake();
    var name = players[curIdx].name;
    var prevName = lastRollerIdx >= 0 ? players[lastRollerIdx].name : "";
    var isMaex = currentClaim === MAEX;

    var hint = isMaex
      ? '<p class="mx-facing mx-facing--maex">' + t("{who} claims MÄXCHEN — unbeatable. You must lift the hat!").replace("{who}", esc(prevName)) + "</p>"
      : '<p class="mx-facing">' + t("{who} claims {claim}").replace("{who}", esc(prevName)).replace("{claim}", claimChip(currentClaim)) + "</p>";

    els.innerHTML =
      '<section class="screen mx-turn">' +
      livesBar() +
      hint +
      '  <div class="mx-stage">' +
      '    <div id="mx-hat" class="mx-hat" aria-label="' + attr(t("Lift the hat")) + '">🎩</div>' +
      '    <div class="mx-tap-hint">' + t("Tap the hat to lift & call the bluff") + "</div>" +
      "  </div>" +
      (isMaex
        ? ""
        : '  <button id="mx-believe" class="btn btn-ghost btn-block">' + t("Believe it — roll on 🎲") + "</button>") +
      "</section>";

    tappable(els.querySelector("#mx-hat"), doChallenge);
    if (!isMaex) {
      els.querySelector("#mx-believe").addEventListener("click", renderRoll);
    }
  }

  // Your roll: tap the hat to shake, reveal your two dice, then claim.
  function renderRoll() {
    clearShake();
    var min = currentClaim
      ? '<p class="mx-facing">' + t("Beat {claim} — or bluff.").replace("{claim}", claimChip(currentClaim)) + "</p>"
      : '<p class="muted">' + t("Open the round with any claim.") + "</p>";

    els.innerHTML =
      '<section class="screen mx-turn">' +
      livesBar() +
      min +
      '  <div class="mx-stage">' +
      '    <div id="mx-hat" class="mx-hat" aria-label="' + attr(t("Roll the dice")) + '">🎩</div>' +
      '    <div class="mx-tap-hint">' + t("Tap the hat to roll — keep the screen to yourself") + "</div>" +
      "  </div>" +
      "</section>";

    tappable(els.querySelector("#mx-hat"), rollDice);
  }

  function rollDice() {
    var hat = els.querySelector("#mx-hat");
    if (!hat || hat.classList.contains("mx-hat--shaking")) return;
    hat.classList.add("mx-hat--shaking");
    var a = 1 + Math.floor(Math.random() * 6);
    var b = 1 + Math.floor(Math.random() * 6);
    truthValue = Math.max(a, b) * 10 + Math.min(a, b);
    shakeTimer = global.setTimeout(renderClaim, SHAKE_MS);
  }

  // Reveal the real roll + a minimal stepper to pick what you announce.
  function renderClaim() {
    clearShake();
    var minRank = currentClaim ? rank(currentClaim) + 1 : 0;
    var truthRank = rank(truthValue);
    selRank = truthRank >= minRank ? truthRank : minRank; // honest if allowed, else smallest lie

    els.innerHTML =
      '<section class="screen mx-turn mx-claim">' +
      '  <p class="muted small">' + t("Your roll (secret)") + "</p>" +
      '  <div class="mx-yourroll">' + diceHtml(truthValue) + valueBadge(truthValue) + "</div>" +
      (currentClaim
        ? '  <p class="mx-facing">' + t("Must beat {claim}").replace("{claim}", claimChip(currentClaim)) + "</p>"
        : '  <p class="muted small">' + t("Opening claim — anything goes.") + "</p>") +
      '  <div class="mx-claimbox">' +
      '    <p class="muted small">' + t("Announce…") + "</p>" +
      '    <div class="mx-claimrow">' +
      '      <button id="mx-down" class="mx-step" aria-label="' + attr(t("Lower")) + '">▼</button>' +
      '      <div id="mx-claimval" class="mx-claimval"></div>' +
      '      <button id="mx-up" class="mx-step" aria-label="' + attr(t("Higher")) + '">▲</button>' +
      "    </div>" +
      '    <div id="mx-honesty" class="mx-honesty"></div>' +
      "  </div>" +
      '  <button id="mx-say" class="btn btn-primary btn-block btn-xl">' + t("Say it & pass 🎩") + "</button>" +
      "</section>";

    var down = els.querySelector("#mx-down");
    var up = els.querySelector("#mx-up");
    down.addEventListener("click", function () { if (selRank > minRank) { selRank--; paintClaim(minRank, truthRank); } });
    up.addEventListener("click", function () { if (selRank < ORDER.length - 1) { selRank++; paintClaim(minRank, truthRank); } });
    els.querySelector("#mx-say").addEventListener("click", commitClaim);
    paintClaim(minRank, truthRank);
  }

  function paintClaim(minRank, truthRank) {
    var v = ORDER[selRank];
    els.querySelector("#mx-claimval").innerHTML = diceHtml(v, { small: true }) + valueBadge(v);
    els.querySelector("#mx-honesty").innerHTML = honestyLabel(selRank, truthRank);
    els.querySelector("#mx-down").disabled = selRank <= minRank;
    els.querySelector("#mx-up").disabled = selRank >= ORDER.length - 1;
  }

  function commitClaim() {
    currentClaim = ORDER[selRank];
    lastRoll = truthValue;
    lastRollerIdx = curIdx;
    truthValue = null;
    curIdx = nextAlive(curIdx, false);
    renderPass();
  }

  // ── Challenge resolution ─────────────────────────────────────────────────────
  function doChallenge() {
    var hat = els.querySelector("#mx-hat");
    if (hat) hat.classList.add("mx-hat--lift");
    // Brief lift before the verdict for drama.
    shakeTimer = global.setTimeout(resolveChallenge, 420);
  }

  function resolveChallenge() {
    clearShake();
    var truthful = rank(lastRoll) >= rank(currentClaim); // claim held up?
    var doubterIdx = curIdx;
    var accusedIdx = lastRollerIdx;
    var loserIdx = truthful ? doubterIdx : accusedIdx;
    var maexInvolved = currentClaim === MAEX;
    var cost = maexInvolved ? 2 : 1;

    players[loserIdx].lives = Math.max(0, players[loserIdx].lives - cost);
    renderReveal(truthful, loserIdx, accusedIdx, cost, maexInvolved);
  }

  function renderReveal(truthful, loserIdx, accusedIdx, cost, maexInvolved) {
    var loser = players[loserIdx];
    var accused = players[accusedIdx];
    var verdict = truthful
      ? t("It was TRUE — {who} really had it.").replace("{who}", esc(accused.name))
      : t("BLUFF! {who} lied.").replace("{who}", esc(accused.name));

    var penalty = settings.drinking
      ? "🍺 <strong>" + esc(loser.name) + "</strong> " + (cost > 1 ? t("drinks DOUBLE — Mäxchen!") : t("drinks!"))
      : "💔 <strong>" + esc(loser.name) + "</strong> " + (cost > 1
          ? t("loses 2 lives — Mäxchen!")
          : t("loses a life."));

    var out = loser.lives <= 0
      ? '<p class="mx-out">💀 ' + t("{who} is out!").replace("{who}", esc(loser.name)) + "</p>"
      : "";

    var gameOver = aliveCount() <= 1;

    els.innerHTML =
      '<section class="screen mx-reveal">' +
      livesBar() +
      '  <div class="result-emoji">' + (maexInvolved ? "👑" : (truthful ? "✅" : "🤥")) + "</div>" +
      '  <h2 class="result-title pop">' + t("Hat lifted!") + "</h2>" +
      '  <div class="mx-revealroll">' + diceHtml(lastRoll) + valueBadge(lastRoll) + "</div>" +
      '  <p class="result-sub">' + t("Claimed {claim} — ").replace("{claim}", labelOnly(currentClaim)) + verdict + "</p>" +
      '  <p class="mx-penalty">' + penalty + "</p>" +
      out +
      '  <div class="stack">' +
      (gameOver
        ? '    <button id="mx-finish" class="btn btn-primary btn-block btn-xl">' + t("See the winner 🏆") + "</button>"
        : '    <button id="mx-next" class="btn btn-primary btn-block btn-xl">' + t("Next round 🔁") + "</button>") +
      '    <button id="mx-quit" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";

    if (gameOver) {
      els.querySelector("#mx-finish").addEventListener("click", renderGameOver);
    } else {
      // The loser of the round starts the next one (if they're still in).
      els.querySelector("#mx-next").addEventListener("click", function () {
        var starter = players[loserIdx].lives > 0 ? loserIdx : nextAlive(loserIdx, false);
        startRound(starter);
      });
    }
    els.querySelector("#mx-quit").addEventListener("click", renderSetup);
  }

  function renderGameOver() {
    clearShake();
    var winner = players.filter(function (p) { return p.lives > 0; })[0] || players[0];
    els.innerHTML =
      '<section class="screen mx-reveal">' +
      '  <div class="result-emoji">🏆</div>' +
      '  <h2 class="result-title pop">' + esc(winner.name) + "</h2>" +
      '  <p class="result-sub">' + t("last one standing — the bluff master!") + "</p>" +
      '  <div class="stack">' +
      '    <button id="mx-again" class="btn btn-primary btn-block btn-xl">' + t("Play again 🔁") + "</button>" +
      '    <button id="mx-settings" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";
    els.querySelector("#mx-again").addEventListener("click", startGame);
    els.querySelector("#mx-settings").addEventListener("click", renderSetup);
  }

  // ── Rendering helpers ────────────────────────────────────────────────────────
  function livesBar() {
    return '<div class="mx-lives">' +
      players.map(function (p, i) {
        var dead = p.lives <= 0;
        var on = i === curIdx && !dead ? " mx-life--turn" : "";
        return '<span class="mx-life' + (dead ? " mx-life--dead" : "") + on + '">' +
          '<span class="mx-life__name">' + esc(p.name) + "</span>" +
          '<span class="mx-life__hearts">' + (dead ? "💀" : heartString(p.lives)) + "</span>" +
          "</span>";
      }).join("") +
      "</div>";
  }

  function heartString(n) {
    var s = "";
    for (var i = 0; i < n; i++) s += "❤️";
    return s;
  }

  function rank(v) { return ORDER.indexOf(v); }

  function dieHtml(n) {
    var pips = PIPS[n] || [];
    var cells = "";
    for (var i = 0; i < 9; i++) {
      cells += '<span class="mx-die__cell">' + (pips.indexOf(i) >= 0 ? '<span class="mx-die__pip"></span>' : "") + "</span>";
    }
    return '<span class="mx-die" role="img" aria-label="' + n + '">' + cells + "</span>";
  }

  function diceHtml(value, opts) {
    var hi = Math.floor(value / 10), lo = value % 10;
    var sm = opts && opts.small ? " mx-dice--sm" : "";
    return '<span class="mx-dice' + sm + '">' + dieHtml(hi) + dieHtml(lo) + "</span>";
  }

  // A small badge naming the special hands; numbers carry no badge.
  function valueBadge(value) {
    if (value === MAEX) return '<span class="mx-badge mx-badge--maex">👑 ' + t("Mäxchen") + "</span>";
    if (value % 11 === 0) return '<span class="mx-badge mx-badge--pasch">' + t("Pasch") + "</span>";
    return "";
  }

  // Compact inline chip for "on the table" lines.
  function claimChip(value) {
    return '<span class="mx-claimchip">' + labelOnly(value) + "</span>";
  }
  function labelOnly(value) {
    if (value === MAEX) return "👑 " + t("Mäxchen");
    if (value % 11 === 0) return value + " (" + t("Pasch") + ")";
    return String(value);
  }

  function honestyLabel(selRank, truthRank) {
    if (selRank === truthRank) return '<span class="mx-hon mx-hon--true">✅ ' + t("the truth") + "</span>";
    if (selRank > truthRank) return '<span class="mx-hon mx-hon--lie">🤥 ' + t("a bluff (higher than your roll)") + "</span>";
    return '<span class="mx-hon mx-hon--under">🙈 ' + t("under your roll") + "</span>";
  }

  function highlight(sel, value, an) {
    els.querySelectorAll(sel + " .chip").forEach(function (c) {
      c.classList.toggle("chip--active", c.getAttribute(an) === value);
    });
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.maxchen = module;
})(window);
