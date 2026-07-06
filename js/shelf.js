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

  function render(container, ctx) {
    // Randomise the card order on EVERY render (fresh Math.random each time, so it
    // never depends on cache or the registry's fixed ORDER). The "Coming soon"
    // tile is appended after these cards below, so it always stays dead last.
    var games = global.Spielecke.shuffle(global.Spielecke.GAMES || []);

    var cards = games
      .map(function (game, i) {
        var drinkBadge = game.supportsDrinking
          ? '<span class="badge badge-drink">' + t("🍻 drink mode") + "</span>"
          : "";
        var betaBadge = game.beta
          ? '<span class="badge badge-beta">' + t("BETA") + "</span>"
          : "";
        // --i drives the CSS entrance stagger (cards cascade in grid order)
        return (
          '<button class="game-card' + (game.beta ? " game-card--beta" : "") + '" style="--i:' + i + '" data-id="' + escapeAttr(game.id) + '">' +
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
      '<button class="game-card game-card--soon" type="button" style="--i:' + games.length + '" aria-label="Coming soon">' +
      '  <span class="game-card__icon">✨</span>' +
      '  <span class="game-card__name">Coming soon</span>' +
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
