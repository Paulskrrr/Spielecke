/*
 * shelf.js — Home / Game Shelf screen (spec §1.1)
 *
 * Renders a responsive grid of game cards from the registry. Each card shows
 * icon, name, tagline, a player-count hint, and a drinking-game marker. Tapping
 * a card asks the shell to mount that game.
 */
(function (global) {
  "use strict";

  function t(k) { return global.Spielecke.t(k); }

  // Shuffled once per page load, then stable: every visit lands a fresh layout,
  // but returning to the shelf mid-session doesn't re-scatter the tiles under
  // your thumb. (Re-shuffles defensively if the registry count ever changes.)
  var sessionOrder = null;

  function render(container, ctx) {
    // The "Coming soon" tile is appended after these cards below, so it always
    // stays dead last.
    var all = global.Spielecke.GAMES || [];
    if (!sessionOrder || sessionOrder.length !== all.length) {
      sessionOrder = global.Spielecke.shuffle(all);
    }
    var games = sessionOrder;

    var cards = games
      .map(function (game, i) {
        var drinkBadge = game.supportsDrinking
          ? '<span class="badge badge-drink">' + t("🍻 drink mode") + "</span>"
          : "";
        var betaBadge = game.beta
          ? '<span class="badge badge-beta">' + t("BETA") + "</span>"
          : "";
        // --i drives the CSS entrance stagger (cards cascade in grid order).
        // Colour + tilt are assigned by grid POSITION: a 9-colour and 7-tilt
        // sequence (coprime, so combos don't realign for 63 cards). Because 9 is
        // coprime with any 2–4 column count, no two neighbours ever share a
        // colour — keying off the game id instead clustered same hues together
        // (27 games into 9 colours stacked three pinks in a row).
        var look = " gc-" + (i % 9) + " gt-" + (i % 7);
        return (
          '<button class="game-card' + (game.beta ? " game-card--beta" : "") + look + '" style="--i:' + i + '" data-id="' + escapeAttr(game.id) + '">' +
          '  <span class="game-card__icon">' + escapeHtml(game.icon || "🎲") + "</span>" +
          '  <span class="game-card__name">' + escapeHtml(t(game.name) || game.name) + "</span>" +
          '  <span class="game-card__tagline">' + escapeHtml(t(game.tagline || "") || game.tagline || "") + "</span>" +
          '  <span class="game-card__meta">' +
          '    <span class="badge">👥 ' + escapeHtml(playerHint(game)) + "</span>" +
          drinkBadge +
          betaBadge +
          "  </span>" +
          "</button>"
        );
      })
      .join("");

    // A teaser tile that fills the last grid slot. It has the same tactile
    // press feel as a real card but carries no data-id, so the click handler
    // below treats it as a no-op — it reacts, but goes nowhere.
    // Deliberately bare: just the icon box and a "Coming soon" title (kept in
    // English in both languages), nothing else.
    var soonTile =
      '<button class="game-card game-card--soon gt-' + (games.length % 7) + '" type="button" style="--i:' + games.length + '" aria-label="Coming soon">' +
      '  <span class="game-card__icon">✨</span>' +
      '  <span class="game-card__name">Coming Soon...</span>' +
      "</button>";

    // If the registry came up empty, none of the game scripts loaded — surface
    // that (with a reload) rather than silently showing just the Coming Soon
    // tile, which reads as "there's only one game" instead of "something broke".
    var loadWarn = games.length === 0
      ? '<div class="shelf-warn">' +
        '  <p>' + t("Games didn't load — this is usually a hiccup fetching the page. Reload to try again.") + "</p>" +
        '  <button id="shelf-reload" class="btn btn-primary">' + t("Reload 🔄") + "</button>" +
        "</div>"
      : "";

    container.innerHTML =
      '<section class="screen shelf-screen">' +
      loadWarn +
      '  <div class="game-grid">' + cards + soonTile + "</div>" +
      "</section>";

    var reload = container.querySelector("#shelf-reload");
    if (reload) reload.addEventListener("click", function () { global.location.reload(); });

    container.querySelectorAll(".game-card").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-id");
        var game = games.filter(function (g) { return g.id === id; })[0];
        if (game) ctx.mountGame(game);
      });
    });
  }

  function playerHint(game) {
    var min = game.minPlayers || 1;
    return min + "+";
  }

  var escapeHtml = global.Spielecke.esc;
  var escapeAttr = global.Spielecke.attr;

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Shelf = { render: render };
})(window);
