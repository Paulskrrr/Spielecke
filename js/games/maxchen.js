/*
 * games/maxchen.js — „Mäxchen" (a.k.a. Mia / Lügenmax / Meiern)
 *
 * The bluffing dice classic, on one passed-around phone — deliberately dumb on
 * purpose. The app is just the hat (🎩) with two dice under it. It does NOT
 * track claims and does NOT judge who lied: that all happens out loud in the
 * room. Its only job is to keep one player's roll secret until someone lifts.
 *
 * The whole loop, three screens, the hat is the hero:
 *   1. Hut (neutral, safe to pass): tap the hat to roll — or lift it to reveal
 *      the roll hiding under it.
 *   2. Dein Wurf (private): your two dice. Announce whatever you like out loud,
 *      then pass the phone on.
 *   3. Aufgedeckt: the hidden dice are shown to everyone → the round is over →
 *      reset. Who was right or wrong is obvious to the table; the app stays out
 *      of it.
 *
 * Reads nothing but its own namespaced store (just the drinking-mode flag). The
 * single shake/lift timer is always cleared on unmount.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }
  var tappable = global.Spielecke.tappable;

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
  var LIFT_MS = 430;

  var els = null, ctx = null, settings = null;
  var underHat = null;   // {a, b} currently hidden under the hat, or null
  var timer = null;

  var module = {
    meta: {
      id: "maxchen",
      name: "Mia",
      tagline: "Two dice under the hat. Talk it up or bluff — then someone lifts.",
      icon: "🎩",
      minPlayers: 2,
      supportsDrinking: true,
    },
    mount: function (container, context) {
      els = container; ctx = context;
      settings = { drinking: context.store.get("drinking", false) === true };
      underHat = null;
      renderSetup();
    },
    unmount: function () {
      clearTimer();
      if (els) { els.innerHTML = ""; els = null; }
      ctx = null; settings = null; underHat = null;
    },
  };

  function clearTimer() {
    if (timer !== null) { global.clearTimeout(timer); timer = null; }
  }

  // ── Setup (tiny: rules + drinking toggle) ────────────────────────────────────
  function renderSetup() {
    clearTimer();
    els.innerHTML =
      '<section class="screen game-setup">' +
      '  <h2 class="screen-title pop">🎩 ' + t("Mia") + "</h2>" +
      '  <p class="muted">' + esc(t(module.meta.tagline)) + "</p>" +
      '  <details class="mx-rules"><summary>' + t("How does it work?") + "</summary>" +
      '    <p class="muted small">' + t("Tap the hat to roll the two dice in secret, then announce a value out loud — HIGHER than the player before you, truth or bluff. Pass the phone on. The next player either rolls again, or lifts the hat to call the bluff. Once it's lifted the round is over — the table sees the dice and knows who lied. Ranking: 31…65, then doubles, then Mäxchen (21) on top.") + "</p>" +
      "  </details>" +
      '  <label class="toggle"><input type="checkbox" id="mx-drink"' + (settings.drinking ? " checked" : "") + " /><span>" + t("🍻 Drinking mode") + "</span></label>" +
      '  <button id="mx-start" class="btn btn-primary btn-block btn-xl">' + t("Let's go ▶️") + "</button>" +
      "</section>";

    els.querySelector("#mx-drink").addEventListener("change", function (e) {
      settings.drinking = e.target.checked; ctx.store.set("drinking", settings.drinking);
    });
    els.querySelector("#mx-start").addEventListener("click", function () {
      underHat = null;
      renderHat();
    });
  }

  // ── The hat hub: roll (tap) or reveal (button, only if something's hidden) ────
  function renderHat() {
    clearTimer();
    els.innerHTML =
      '<section class="screen mx-turn mx-hub">' +
      '  <div class="mx-stage">' +
      '    <div id="mx-hat" class="mx-hat" aria-label="' + attr(t("Roll the dice")) + '">🎩</div>' +
      '    <div class="mx-tap-hint">' + t("Tap the hat to roll — keep the screen to yourself") + "</div>" +
      "  </div>" +
      '  <div class="mx-hub__foot">' +
      (underHat
        ? '    <button id="mx-reveal" class="btn btn-block btn-xl">' + t("Lift the hat 👀") + "</button>"
        : '    <p class="muted small">' + t("You open the round — roll the dice.") + "</p>") +
      "  </div>" +
      "</section>";

    tappable(els.querySelector("#mx-hat"), rollDice);
    var rev = els.querySelector("#mx-reveal");
    if (rev) rev.addEventListener("click", doReveal);
  }

  function rollDice() {
    var hat = els.querySelector("#mx-hat");
    if (!hat || hat.classList.contains("mx-hat--shaking")) return;
    hat.classList.add("mx-hat--shaking");
    var roll = { a: 1 + Math.floor(Math.random() * 6), b: 1 + Math.floor(Math.random() * 6) };
    timer = global.setTimeout(function () { renderRoll(roll); }, SHAKE_MS);
  }

  // Your private roll. The app doesn't care what you announce — that's spoken.
  function renderRoll(roll) {
    clearTimer();
    els.innerHTML =
      '<section class="screen mx-turn">' +
      '  <p class="muted small">' + t("Your roll (secret)") + "</p>" +
      '  <div class="mx-yourroll">' + diceHtml(roll) + valueBadge(roll) + "</div>" +
      '  <p class="muted small">' + t("Announce it out loud — then pass the hat on.") + "</p>" +
      '  <button id="mx-pass" class="btn btn-primary btn-block btn-xl">' + t("Pass it on 🎩") + "</button>" +
      "</section>";
    els.querySelector("#mx-pass").addEventListener("click", function () {
      underHat = roll;   // this is now what hides under the hat
      renderHat();
    });
  }

  function doReveal() {
    var hat = els.querySelector("#mx-hat");
    if (hat) hat.classList.add("mx-hat--lift");
    timer = global.setTimeout(renderReveal, LIFT_MS);
  }

  // Everyone sees the dice. Round over → reset. The room settles the rest.
  function renderReveal() {
    clearTimer();
    var roll = underHat || { a: 1, b: 1 };
    var sub = settings.drinking ? '<p class="result-sub">🍺 ' + t("Whoever was wrong drinks!") + "</p>" : "";

    els.innerHTML =
      '<section class="screen mx-reveal">' +
      '  <div class="result-emoji">👀</div>' +
      '  <h2 class="result-title pop">' + t("Hat lifted!") + "</h2>" +
      '  <div class="mx-revealroll">' + diceHtml(roll) + valueBadge(roll) + "</div>" +
      "  " + sub +
      '  <div class="stack">' +
      '    <button id="mx-next" class="btn btn-primary btn-block btn-xl">' + t("New round 🔁") + "</button>" +
      '    <button id="mx-quit" class="btn btn-block">' + t("Change settings") + "</button>" +
      "  </div>" +
      "</section>";

    els.querySelector("#mx-next").addEventListener("click", function () {
      underHat = null;
      renderHat();
    });
    els.querySelector("#mx-quit").addEventListener("click", renderSetup);
  }

  // ── Dice rendering ───────────────────────────────────────────────────────────
  function dieHtml(n) {
    var pips = PIPS[n] || [];
    var cells = "";
    for (var i = 0; i < 9; i++) {
      cells += '<span class="mx-die__cell">' + (pips.indexOf(i) >= 0 ? '<span class="mx-die__pip"></span>' : "") + "</span>";
    }
    return '<span class="mx-die" role="img" aria-label="' + n + '">' + cells + "</span>";
  }

  function diceHtml(roll, opts) {
    var sm = opts && opts.small ? " mx-dice--sm" : "";
    return '<span class="mx-dice' + sm + '">' + dieHtml(roll.a) + dieHtml(roll.b) + "</span>";
  }

  // A friendly badge for the special hands (purely informational, not judging).
  function valueBadge(roll) {
    var set = [roll.a, roll.b].sort().join("");
    if (set === "12") return '<span class="mx-badge mx-badge--maex">👑 ' + t("Mäxchen") + "</span>";
    if (roll.a === roll.b) return '<span class="mx-badge mx-badge--pasch">' + t("Pasch") + "</span>";
    return "";
  }

  var esc = global.Spielecke.esc;
  var attr = global.Spielecke.attr;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Games = global.Spielecke.Games || {};
  global.Spielecke.Games.maxchen = module;
})(window);
