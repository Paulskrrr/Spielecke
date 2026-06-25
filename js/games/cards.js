/*
 * games/cards.js — shared 52-card deck + card-face component (Kartenklassiker spec)
 *
 * One honest deck utility reused by all three Kartenklassiker games (Busfahrt,
 * Fuck the Dealer, Pferderennen) so there are never three card implementations.
 *
 * Exposes window.Spielecke.Cards:
 *   newDeck()              -> fresh ordered 52-card array
 *   shuffle(arr)           -> in-place Fisher–Yates, returns arr
 *   value(card)            -> 2..14 rank value (A high) for comparisons
 *   colour(card)           -> "red" | "black"
 *   sameSuit(a,b) / sameRank(a,b)
 *   rankLabel(card)        -> "2".."10","J","Q","K","A"
 *   suitSymbol(card)       -> ♠ ♥ ♦ ♣
 *   faceHtml(card, opts)   -> a static card face (rank + suit, red/black)
 *   backHtml(opts)         -> a face-down card back
 *   flipHtml(card, opts)   -> a flip container (starts face-down); reveal() flips it
 *   reveal(rootEl)         -> add the flipped class to a flip container
 *
 * A "card" is { rank, suit } where rank is one of RANKS and suit one of "S/H/D/C".
 * Rendering is class-based (.pkcard*) so the look lives in styles/main.css.
 */
(function (global) {
  "use strict";

  var RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  // value: A high (14). Index + 2 gives 2..10, then J=11,Q=12,K=13,A=14.
  var SUITS = {
    S: { symbol: "♠", colour: "black", label: "Pik" },
    H: { symbol: "♥", colour: "red", label: "Herz" },
    D: { symbol: "♦", colour: "red", label: "Karo" },
    C: { symbol: "♣", colour: "black", label: "Kreuz" },
  };
  var SUIT_ORDER = ["S", "H", "D", "C"];

  function newDeck() {
    var deck = [];
    for (var s = 0; s < SUIT_ORDER.length; s++) {
      for (var r = 0; r < RANKS.length; r++) {
        deck.push({ rank: RANKS[r], suit: SUIT_ORDER[s] });
      }
    }
    return deck;
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function value(card) {
    return RANKS.indexOf(card.rank) + 2; // "2"->2 ... "A"->14
  }
  function colour(card) { return SUITS[card.suit].colour; }
  function suitSymbol(card) { return SUITS[card.suit].symbol; }
  function suitLabel(suit) { return SUITS[suit].label; }
  function rankLabel(card) { return card.rank; }
  function sameSuit(a, b) { return a.suit === b.suit; }
  function sameRank(a, b) { return a.rank === b.rank; }

  // --- Rendering -----------------------------------------------------------

  function faceHtml(card, opts) {
    opts = opts || {};
    var sym = SUITS[card.suit].symbol;
    var cls = "pkcard pkcard--" + SUITS[card.suit].colour + (opts.small ? " pkcard--sm" : "") + (opts.cls ? " " + opts.cls : "");
    return (
      '<div class="' + cls + '">' +
      '  <span class="pkcard__corner pkcard__corner--tl"><b>' + card.rank + "</b><i>" + sym + "</i></span>" +
      '  <span class="pkcard__pip">' + sym + "</span>" +
      '  <span class="pkcard__corner pkcard__corner--br"><b>' + card.rank + "</b><i>" + sym + "</i></span>" +
      "</div>"
    );
  }

  function backHtml(opts) {
    opts = opts || {};
    var cls = "pkcard pkcard--back" + (opts.small ? " pkcard--sm" : "") + (opts.cls ? " " + opts.cls : "");
    return '<div class="' + cls + '"><span class="pkcard__crest">♣♦<br/>♥♠</span></div>';
  }

  // A flip container: face-down by default. Add the class "is-flipped" (or call
  // reveal()) to rotate it and show the real face. id is optional for targeting.
  function flipHtml(card, opts) {
    opts = opts || {};
    var idAttr = opts.id ? ' id="' + opts.id + '"' : "";
    var flipped = opts.revealed ? " is-flipped" : "";
    var sizeCls = opts.small ? " pkflip--sm" : "";
    return (
      '<div class="pkflip' + sizeCls + flipped + '"' + idAttr + ">" +
      '  <div class="pkflip__inner">' +
      '    <div class="pkflip__face pkflip__back">' + backHtml({ small: opts.small }) + "</div>" +
      '    <div class="pkflip__face pkflip__front">' + faceHtml(card, { small: opts.small }) + "</div>" +
      "  </div>" +
      "</div>"
    );
  }

  function reveal(rootEl) {
    if (rootEl) rootEl.classList.add("is-flipped");
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Cards = {
    RANKS: RANKS,
    SUITS: SUITS,
    SUIT_ORDER: SUIT_ORDER,
    newDeck: newDeck,
    shuffle: shuffle,
    value: value,
    colour: colour,
    suitSymbol: suitSymbol,
    suitLabel: suitLabel,
    rankLabel: rankLabel,
    sameSuit: sameSuit,
    sameRank: sameRank,
    faceHtml: faceHtml,
    backHtml: backHtml,
    flipHtml: flipHtml,
    reveal: reveal,
  };
})(window);
