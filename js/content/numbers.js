/*
 * content/numbers.js — content for Liar's Numbers
 *
 * EDIT ME. Pure content. Each entry is a question with a NUMERIC answer. Players
 * each guess a number; closest wins, furthest loses (or drinks). All-number, so
 * it dodges any language "tell". Keep answers factual; add a unit in the
 * question if helpful. `a` must be a number.
 */
(function (global) {
  "use strict";

  var NUMBERS = {
    general: {
      label: "🎲 General",
      questions: [
        { q: "How many keys on a standard piano?", a: 88 },
        { q: "How many bones in the adult human body?", a: 206 },
        { q: "How many countries are in the EU (2024)?", a: 27 },
        { q: "How many minutes in a full week? (thousands ok)", a: 10080 },
        { q: "How many hearts does an octopus have?", a: 3 },
        { q: "What year did the first iPhone launch?", a: 2007 },
      ],
    },
    body: {
      label: "🧠 Body & Science",
      questions: [
        { q: "Average human body temperature in °C?", a: 37 },
        { q: "How many teeth does an adult have?", a: 32 },
        { q: "How many chromosomes do humans have?", a: 46 },
        { q: "Litres of blood in an average adult?", a: 5 },
        { q: "How many muscles to smile? (roughly)", a: 12 },
      ],
    },
    world: {
      label: "🌍 World",
      questions: [
        { q: "Height of the Eiffel Tower in metres?", a: 330 },
        { q: "How many time zones does Russia span?", a: 11 },
        { q: "Number of moons of Jupiter (known, approx)?", a: 95 },
        { q: "How many players on a football pitch in total?", a: 22 },
        { q: "What year did the Berlin Wall fall?", a: 1989 },
      ],
    },
    insideJokes: {
      label: "😎 Inside Jokes",
      questions: [
        { q: "[Group stat question — put a real number]", a: 0 },
        { q: "[How many times has __ happened?]", a: 0 },
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.NumberQuestions = NUMBERS;
})(window);
