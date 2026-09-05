// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * content/perfectshape.js — the shape catalogue for Perfect Shape
 *
 * EDIT ME. Pure content, no maths. Three pools: `easy` are the shapes everybody
 * has drawn a thousand times, `hard` are the ones where the hand starts lying to
 * you, and `creative` swaps geometry for THINGS — a house, a key, a smiley —
 * several of which need more than one stroke. Everyone in a round draws the SAME
 * shape, so the ranking stays fair — the pools only decide what can come up.
 *
 * Each entry:
 *   key   internal id, must be unique across BOTH pools (used to avoid repeats)
 *   name  what players see ("Kreis" / "Circle")
 *   hint  one short line under the name — the rules of that shape
 *   gen   which outline generator the game builds the ideal shape from
 *         (implemented in js/games/perfectshape.js — see GENERATORS there)
 *   n / turns / waves  generator parameters, where the generator takes one
 *   level "easy" | "hard" — only for the badge on the drawing screen
 *
 * Bilingual: exports { de: <German>, en: <English> }. Same pool keys, same
 * shape keys, and every `gen`/`n`/`turns`/`waves`/`level` value is IDENTICAL
 * between de and en — only `name`, `hint` and the pool `label` differ. Module
 * reads via Spielecke.L(...).
 */
(function (global) {
  "use strict";

  var DE = {
    easy: {
      label: "🟢 Leicht",
      shapes: [
        { key: "circle",     name: "Kreis",       hint: "Ein Zug, sauber zurück zum Start.",        gen: "circle",   level: "easy" },
        { key: "square",     name: "Quadrat",     hint: "Vier gleiche Seiten, scharfe Ecken.",      gen: "square",   level: "easy" },
        { key: "triangle",   name: "Dreieck",     hint: "Gleichseitig, Spitze nach oben.",          gen: "polygon", n: 3, level: "easy" },
        { key: "line",       name: "Gerade",      hint: "Nur ein Strich — die Richtung ist egal.",  gen: "line",     level: "easy" },
        { key: "rect",       name: "Rechteck",    hint: "Doppelt so breit wie hoch.",               gen: "rect",     level: "easy" },
        { key: "oval",       name: "Oval",        hint: "Liegend, doppelt so breit wie hoch.",      gen: "oval",     level: "easy" },
        { key: "diamond",    name: "Raute",       hint: "Ein Quadrat auf der Spitze.",              gen: "diamond",  level: "easy" },
        { key: "cross",      name: "Kreuz",       hint: "Zwei gleich lange Striche, mittig gekreuzt.", gen: "cross", level: "easy" },
        { key: "heart",      name: "Herz",        hint: "Zwei Bögen oben, eine Spitze unten.",      gen: "heart",    level: "easy" },
        { key: "semicircle", name: "Halbkreis",   hint: "Halber Kreis auf gerader Kante.",          gen: "semicircle", level: "easy" }
      ]
    },
    hard: {
      label: "🔴 Schwer",
      shapes: [
        { key: "pentagon", name: "Fünfeck",   hint: "Fünf gleiche Seiten, Spitze nach oben.",   gen: "polygon", n: 5, level: "hard" },
        { key: "hexagon",  name: "Sechseck",  hint: "Sechs gleiche Seiten, Spitze nach oben.",  gen: "polygon", n: 6, level: "hard" },
        { key: "octagon",  name: "Achteck",   hint: "Acht gleiche Seiten — das Stoppschild.",   gen: "polygon", n: 8, level: "hard" },
        { key: "star",     name: "Stern",     hint: "Fünf Zacken, gleich lang.",                gen: "star",   n: 5, level: "hard" },
        { key: "spiral",   name: "Spirale",   hint: "Drei Umdrehungen, gleichmäßiger Abstand.", gen: "spiral", turns: 3, level: "hard" },
        { key: "infinity", name: "Unendlich", hint: "Liegende Acht, beide Schlaufen gleich.",   gen: "infinity", level: "hard" },
        { key: "wave",     name: "Welle",     hint: "Zwei volle Wellen, gleiche Höhe.",         gen: "wave",   waves: 2, level: "hard" },
        { key: "zigzag",   name: "Zickzack",  hint: "Fünf Striche im Zickzack, gleich hoch.",                 gen: "zigzag", n: 5, level: "hard" },
        { key: "arrow",    name: "Pfeil",     hint: "Umriss eines Pfeils nach rechts.",         gen: "arrow",  level: "hard" },
        { key: "crescent", name: "Mondsichel", hint: "Sichel, Öffnung nach rechts.",            gen: "crescent", level: "hard" }
      ]
    },
    creative: {
      label: "🎨 Kreativ",
      shapes: [
        { key: "house",    name: "Haus",         hint: "Vier Wände, ein Spitzdach — ein Zug.",        gen: "house",    level: "creative" },
        { key: "tree",     name: "Tannenbaum",   hint: "Drei Etagen, unten der Stamm.",               gen: "tree",     level: "creative" },
        { key: "cloud",    name: "Wolke",        hint: "Vier Buckel auf gerader Unterkante.",         gen: "cloud",    level: "creative" },
        { key: "sun",      name: "Sonne",        hint: "Kreis plus acht Strahlen — neun Striche.",    gen: "sun",      level: "creative" },
        { key: "bolt",     name: "Blitz",        hint: "Zickzack, oben und unten spitz.",             gen: "bolt",     level: "creative" },
        { key: "cocktail", name: "Cocktailglas", hint: "V-Kelch, dünner Stiel, breiter Fuß.",         gen: "cocktail", level: "creative" },
        { key: "key",      name: "Schlüssel",    hint: "Runder Kopf, langer Schaft, zwei Zacken.",    gen: "key",      level: "creative" },
        { key: "fish",     name: "Fisch",        hint: "Runder Körper, Schwanzflosse hinten links.",  gen: "fish",     level: "creative" },
        { key: "smiley",   name: "Smiley",       hint: "Kreis, zwei Augen, ein Lächeln — vier Striche.", gen: "smiley", level: "creative" },
        { key: "crown",    name: "Krone",        hint: "Drei Zacken auf gerader Basis.",              gen: "crown",    level: "creative" },
        { key: "flower",   name: "Blume",        hint: "Sechs gleich große Blütenblätter.",           gen: "flower",   level: "creative" },
        { key: "gem",      name: "Diamant",      hint: "Tafel oben, Spitze unten, Linie quer.",       gen: "gem",      level: "creative" }
      ]
    }
  };

  var EN = {
    easy: {
      label: "🟢 Easy",
      shapes: [
        { key: "circle",     name: "Circle",      hint: "One stroke, back to where you started.",   gen: "circle",   level: "easy" },
        { key: "square",     name: "Square",      hint: "Four equal sides, sharp corners.",         gen: "square",   level: "easy" },
        { key: "triangle",   name: "Triangle",    hint: "Equilateral, tip pointing up.",            gen: "polygon", n: 3, level: "easy" },
        { key: "line",       name: "Straight line", hint: "Just one line — any direction goes.",    gen: "line",     level: "easy" },
        { key: "rect",       name: "Rectangle",   hint: "Twice as wide as it is tall.",             gen: "rect",     level: "easy" },
        { key: "oval",       name: "Oval",        hint: "Lying down, twice as wide as tall.",       gen: "oval",     level: "easy" },
        { key: "diamond",    name: "Diamond",     hint: "A square standing on its point.",          gen: "diamond",  level: "easy" },
        { key: "cross",      name: "Plus sign",   hint: "Two equal strokes crossing in the middle.", gen: "cross",   level: "easy" },
        { key: "heart",      name: "Heart",       hint: "Two arcs on top, one point below.",        gen: "heart",    level: "easy" },
        { key: "semicircle", name: "Half circle", hint: "Half a circle on a flat edge.",            gen: "semicircle", level: "easy" }
      ]
    },
    hard: {
      label: "🔴 Hard",
      shapes: [
        { key: "pentagon", name: "Pentagon",  hint: "Five equal sides, point up.",              gen: "polygon", n: 5, level: "hard" },
        { key: "hexagon",  name: "Hexagon",   hint: "Six equal sides, point up.",               gen: "polygon", n: 6, level: "hard" },
        { key: "octagon",  name: "Octagon",   hint: "Eight equal sides — the stop sign.",       gen: "polygon", n: 8, level: "hard" },
        { key: "star",     name: "Star",      hint: "Five points, all the same length.",        gen: "star",   n: 5, level: "hard" },
        { key: "spiral",   name: "Spiral",    hint: "Three turns, evenly spaced.",              gen: "spiral", turns: 3, level: "hard" },
        { key: "infinity", name: "Infinity",  hint: "A lying eight, both loops equal.",         gen: "infinity", level: "hard" },
        { key: "wave",     name: "Wave",      hint: "Two full waves, same height.",             gen: "wave",   waves: 2, level: "hard" },
        { key: "zigzag",   name: "Zigzag",    hint: "Five strokes zigzagging, all the same height.",        gen: "zigzag", n: 5, level: "hard" },
        { key: "arrow",    name: "Arrow",     hint: "The outline of an arrow pointing right.",  gen: "arrow",  level: "hard" },
        { key: "crescent", name: "Crescent",  hint: "A crescent moon opening to the right.",    gen: "crescent", level: "hard" }
      ]
    },
    creative: {
      label: "🎨 Creative",
      shapes: [
        { key: "house",    name: "House",         hint: "Four walls and a gable roof — one stroke.",     gen: "house",    level: "creative" },
        { key: "tree",     name: "Fir tree",      hint: "Three tiers, trunk at the bottom.",             gen: "tree",     level: "creative" },
        { key: "cloud",    name: "Cloud",         hint: "Four bumps on a flat bottom edge.",             gen: "cloud",    level: "creative" },
        { key: "sun",      name: "Sun",           hint: "A disc plus eight rays — nine strokes.",        gen: "sun",      level: "creative" },
        { key: "bolt",     name: "Lightning bolt", hint: "Zigzag, pointed top and bottom.",              gen: "bolt",     level: "creative" },
        { key: "cocktail", name: "Cocktail glass", hint: "V-shaped bowl, thin stem, wide foot.",         gen: "cocktail", level: "creative" },
        { key: "key",      name: "Key",           hint: "Round bow, long shaft, two teeth.",             gen: "key",      level: "creative" },
        { key: "fish",     name: "Fish",          hint: "Round body, tail fin at the back left.",        gen: "fish",     level: "creative" },
        { key: "smiley",   name: "Smiley",        hint: "Circle, two eyes, one smile — four strokes.",   gen: "smiley",   level: "creative" },
        { key: "crown",    name: "Crown",         hint: "Three spikes on a straight base.",              gen: "crown",    level: "creative" },
        { key: "flower",   name: "Flower",        hint: "Six petals, all the same size.",                gen: "flower",   level: "creative" },
        { key: "gem",      name: "Gem",           hint: "Flat table on top, point below, line across.",  gen: "gem",      level: "creative" }
      ]
    }
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.PerfectShapes = { de: DE, en: EN };
})(window);
