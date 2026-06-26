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
    var games = global.Spielecke.GAMES || [];

    var cards = games
      .map(function (game) {
        var drinkBadge = game.supportsDrinking
          ? '<span class="badge badge-drink">' + t("🍻 drink mode") + "</span>"
          : "";
        return (
          '<button class="game-card" data-id="' + escapeAttr(game.id) + '">' +
          '  <span class="game-card__icon">' + escapeHtml(game.icon || "🎲") + "</span>" +
          '  <span class="game-card__name">' + escapeHtml(t(game.name) || game.name) + "</span>" +
          '  <span class="game-card__tagline">' + escapeHtml(t(game.tagline || "") || game.tagline || "") + "</span>" +
          '  <span class="game-card__meta">' +
          '    <span class="badge">👥 ' + escapeHtml(playerHint(game)) + "</span>" +
          drinkBadge +
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
      '<button class="game-card game-card--soon" type="button" aria-label="Coming soon">' +
      '  <span class="game-card__icon">✨</span>' +
      '  <span class="game-card__name">Coming soon</span>' +
      "</button>";

    container.innerHTML =
      '<section class="screen shelf-screen">' +
      '  <div class="game-grid">' + cards + soonTile + "</div>" +
      "</section>";

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
