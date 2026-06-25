/*
 * content/quiz.js — content for Quiz Out
 *
 * EDIT ME. Pure content. An ARRAY of difficulty LEVELS (index 0 = easiest).
 * Each level holds questions; the game climbs a level after every full round,
 * so order matters — keep each level harder than the last.
 *
 * Each question: { q, options: [4 strings], answer: <index of the correct one> }.
 * The game shuffles the option order on screen, so `answer` just points at the
 * right string here. Add more questions/levels freely.
 *
 * Bilingual: { de: [ ...levels ], en: [ ...levels ] }. Keep the same number of
 * levels/questions and identical `answer` indices across de/en.
 */
(function (global) {
  "use strict";

  var QUIZ_EN = [
    // Level 0 — Warm-up
    [
      { q: "What colour is a banana?", options: ["Yellow", "Blue", "Red", "Green"], answer: 0 },
      { q: "How many legs does a spider have?", options: ["8", "6", "4", "10"], answer: 0 },
      { q: "H₂O is commonly known as?", options: ["Water", "Salt", "Gold", "Air"], answer: 0 },
      { q: "Which animal barks?", options: ["Dog", "Cat", "Cow", "Fish"], answer: 0 },
      { q: "What planet do we live on?", options: ["Earth", "Mars", "Venus", "Jupiter"], answer: 0 },
    ],
    // Level 1 — Easy
    [
      { q: "Capital of France?", options: ["Paris", "London", "Rome", "Berlin"], answer: 0 },
      { q: "How many continents are there?", options: ["7", "5", "6", "8"], answer: 0 },
      { q: "How many sides does a hexagon have?", options: ["6", "5", "7", "8"], answer: 0 },
      { q: "Which ocean is the largest?", options: ["Pacific", "Atlantic", "Indian", "Arctic"], answer: 0 },
      { q: "What gas do plants take in?", options: ["CO₂", "Oxygen", "Helium", "Nitrogen"], answer: 0 },
    ],
    // Level 2 — Medium
    [
      { q: "Who painted the Mona Lisa?", options: ["Da Vinci", "Picasso", "Van Gogh", "Monet"], answer: 0 },
      { q: "Chemical symbol for gold?", options: ["Au", "Ag", "Gd", "Go"], answer: 0 },
      { q: "How many bones in the adult human body?", options: ["206", "201", "210", "196"], answer: 0 },
      { q: "Capital of Australia?", options: ["Canberra", "Sydney", "Melbourne", "Perth"], answer: 0 },
      { q: "Most populous country (2024)?", options: ["India", "China", "USA", "Indonesia"], answer: 0 },
    ],
    // Level 3 — Hard
    [
      { q: "What year did WW2 end?", options: ["1945", "1944", "1939", "1948"], answer: 0 },
      { q: "Element with atomic number 1?", options: ["Hydrogen", "Helium", "Oxygen", "Carbon"], answer: 0 },
      { q: "Who wrote 'Romeo and Juliet'?", options: ["Shakespeare", "Dickens", "Tolstoy", "Austen"], answer: 0 },
      { q: "The smallest prime number?", options: ["2", "1", "3", "0"], answer: 0 },
      { q: "Hottest planet in the solar system?", options: ["Venus", "Mercury", "Mars", "Jupiter"], answer: 0 },
    ],
    // Level 4 — Brutal
    [
      { q: "Year the Berlin Wall fell?", options: ["1989", "1991", "1987", "1990"], answer: 0 },
      { q: "Square root of 144?", options: ["12", "14", "11", "13"], answer: 0 },
      { q: "Rarest of the main blood types?", options: ["AB−", "O−", "B−", "A−"], answer: 0 },
      { q: "Who developed general relativity?", options: ["Einstein", "Newton", "Bohr", "Hawking"], answer: 0 },
      { q: "Hardest natural material?", options: ["Diamond", "Quartz", "Steel", "Titanium"], answer: 0 },
    ],
  ];

  var QUIZ_DE = [
    // Level 0 — Aufwärmen
    [
      { q: "Welche Farbe hat eine Banane?", options: ["Gelb", "Blau", "Rot", "Grün"], answer: 0 },
      { q: "Wie viele Beine hat eine Spinne?", options: ["8", "6", "4", "10"], answer: 0 },
      { q: "H₂O kennt man besser als?", options: ["Wasser", "Salz", "Gold", "Luft"], answer: 0 },
      { q: "Welches Tier bellt?", options: ["Hund", "Katze", "Kuh", "Fisch"], answer: 0 },
      { q: "Auf welchem Planeten leben wir?", options: ["Erde", "Mars", "Venus", "Jupiter"], answer: 0 },
    ],
    // Level 1 — Leicht
    [
      { q: "Hauptstadt von Frankreich?", options: ["Paris", "London", "Rom", "Berlin"], answer: 0 },
      { q: "Wie viele Kontinente gibt es?", options: ["7", "5", "6", "8"], answer: 0 },
      { q: "Wie viele Seiten hat ein Sechseck?", options: ["6", "5", "7", "8"], answer: 0 },
      { q: "Welcher Ozean ist der größte?", options: ["Pazifik", "Atlantik", "Indischer", "Arktischer"], answer: 0 },
      { q: "Welches Gas nehmen Pflanzen auf?", options: ["CO₂", "Sauerstoff", "Helium", "Stickstoff"], answer: 0 },
    ],
    // Level 2 — Mittel
    [
      { q: "Wer hat die Mona Lisa gemalt?", options: ["Da Vinci", "Picasso", "Van Gogh", "Monet"], answer: 0 },
      { q: "Chemisches Symbol für Gold?", options: ["Au", "Ag", "Gd", "Go"], answer: 0 },
      { q: "Wie viele Knochen hat ein erwachsener Mensch?", options: ["206", "201", "210", "196"], answer: 0 },
      { q: "Hauptstadt von Australien?", options: ["Canberra", "Sydney", "Melbourne", "Perth"], answer: 0 },
      { q: "Bevölkerungsreichstes Land (2024)?", options: ["Indien", "China", "USA", "Indonesien"], answer: 0 },
    ],
    // Level 3 — Schwer
    [
      { q: "In welchem Jahr endete der Zweite Weltkrieg?", options: ["1945", "1944", "1939", "1948"], answer: 0 },
      { q: "Element mit der Ordnungszahl 1?", options: ["Wasserstoff", "Helium", "Sauerstoff", "Kohlenstoff"], answer: 0 },
      { q: "Wer schrieb 'Romeo und Julia'?", options: ["Shakespeare", "Dickens", "Tolstoi", "Austen"], answer: 0 },
      { q: "Die kleinste Primzahl?", options: ["2", "1", "3", "0"], answer: 0 },
      { q: "Heißester Planet im Sonnensystem?", options: ["Venus", "Merkur", "Mars", "Jupiter"], answer: 0 },
    ],
    // Level 4 — Brutal
    [
      { q: "In welchem Jahr fiel die Berliner Mauer?", options: ["1989", "1991", "1987", "1990"], answer: 0 },
      { q: "Quadratwurzel aus 144?", options: ["12", "14", "11", "13"], answer: 0 },
      { q: "Seltenste der gängigen Blutgruppen?", options: ["AB−", "O−", "B−", "A−"], answer: 0 },
      { q: "Wer entwickelte die allgemeine Relativitätstheorie?", options: ["Einstein", "Newton", "Bohr", "Hawking"], answer: 0 },
      { q: "Härtestes natürliches Material?", options: ["Diamant", "Quarz", "Stahl", "Titan"], answer: 0 },
    ],
  ];

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.QuizQuestions = { de: QUIZ_DE, en: QUIZ_EN };
})(window);
