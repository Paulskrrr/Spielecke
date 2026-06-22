/*
 * shelf.js — Home / Game Shelf screen (spec §1.1)
 *
 * Renders a responsive grid of game cards from the registry. Each card shows
 * icon, name, tagline, a player-count hint, and a drinking-game marker. Tapping
 * a card asks the shell to mount that game.
 */
(function (global) {
  "use strict";

  function render(container, ctx) {
    var games = global.Spielecke.GAMES || [];

    var cards = games
      .map(function (game) {
        var drinkBadge = game.supportsDrinking
          ? '<span class="badge badge-drink">🍻 drink mode</span>'
          : "";
        return (
          '<button class="game-card" data-id="' + escapeAttr(game.id) + '">' +
          '  <span class="game-card__icon">' + escapeHtml(game.icon || "🎲") + "</span>" +
          '  <span class="game-card__name">' + escapeHtml(game.name) + "</span>" +
          '  <span class="game-card__tagline">' + escapeHtml(game.tagline || "") + "</span>" +
          '  <span class="game-card__meta">' +
          '    <span class="badge">👥 ' + escapeHtml(playerHint(game)) + "</span>" +
          drinkBadge +
          "  </span>" +
          "</button>"
        );
      })
      .join("");

    container.innerHTML =
      '<section class="screen shelf-screen">' +
      '  <div class="game-grid">' + cards + "</div>" +
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Shelf = { render: render };
})(window);
