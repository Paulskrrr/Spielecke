/*
 * content/numbers.js — content for Liar's Numbers
 *
 * EDIT ME. Pure content. Each entry is a question with a NUMERIC answer. Players
 * each guess a number; closest wins, furthest loses (or drinks). All-number, so
 * it dodges any language "tell". Keep answers factual; add a unit in the
 * question if helpful. `a` must be a number.
 *
 * Bilingual: exports { de: <German>, en: <English> }. Same keys/structure in
 * both; every numeric answer `a` is IDENTICAL between de and en. Module reads
 * via Spielecke.L(...).
 */
(function (global) {
  "use strict";

  var EN = {
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
  };

  var DE = {
    general: {
      label: "🎲 Allgemein",
      questions: [
        { q: "Wie viele Tasten hat ein Standard-Klavier?", a: 88 },
        { q: "Wie viele Knochen hat der erwachsene menschliche Körper?", a: 206 },
        { q: "Wie viele Länder sind in der EU (2024)?", a: 27 },
        { q: "Wie viele Minuten hat eine ganze Woche? (Tausender okay)", a: 10080 },
        { q: "Wie viele Herzen hat ein Oktopus?", a: 3 },
        { q: "In welchem Jahr kam das erste iPhone raus?", a: 2007 },
      ],
    },
    body: {
      label: "🧠 Körper & Wissenschaft",
      questions: [
        { q: "Durchschnittliche Körpertemperatur des Menschen in °C?", a: 37 },
        { q: "Wie viele Zähne hat ein Erwachsener?", a: 32 },
        { q: "Wie viele Chromosomen hat der Mensch?", a: 46 },
        { q: "Wie viele Liter Blut hat ein durchschnittlicher Erwachsener?", a: 5 },
        { q: "Wie viele Muskeln braucht man zum Lächeln? (ungefähr)", a: 12 },
      ],
    },
    world: {
      label: "🌍 Welt",
      questions: [
        { q: "Höhe des Eiffelturms in Metern?", a: 330 },
        { q: "Über wie viele Zeitzonen erstreckt sich Russland?", a: 11 },
        { q: "Anzahl der Jupitermonde (bekannt, ungefähr)?", a: 95 },
        { q: "Wie viele Spieler stehen insgesamt auf einem Fußballfeld?", a: 22 },
        { q: "In welchem Jahr fiel die Berliner Mauer?", a: 1989 },
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.NumberQuestions = { de: DE, en: EN };
})(window);
