// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
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
        { q: "How many cards in a deck, no jokers?", a: 52 },
        { q: "How many seconds in an hour?", a: 3600 },
        { q: "How many strings does a standard guitar have?", a: 6 },
        { q: "How many squares on a chessboard?", a: 64 },
        { q: "How many degrees in a full circle?", a: 360 },
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
        { q: "Resting heart rate in beats per minute (roughly)?", a: 70 },
        { q: "How many senses do humans traditionally have?", a: 5 },
        { q: "How many pairs of ribs does a human have?", a: 12 },
        { q: "How many planets are in our solar system?", a: 8 },
        { q: "How many weeks does a full-term pregnancy last?", a: 40 },
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
        { q: "How many continents are there?", a: 7 },
        { q: "How many countries are there in the world (approx)?", a: 195 },
        { q: "How many US states are there?", a: 50 },
        { q: "What year did the Titanic sink?", a: 1912 },
        { q: "Height of Mount Everest in metres?", a: 8849 },
      ],
    },
    money: {
      label: "💰 Money & Power",
      questions: [
        { q: "How many zeros are in one billion?", a: 9 },
        { q: "What year did euro cash enter circulation?", a: 2002 },
        { q: "How many countries use the euro? (2024)", a: 20 },
        { q: "How many member countries are in the G7?", a: 7 },
        { q: "Minimum age to become US President?", a: 35 },
        { q: "Standard VAT rate in Germany, in percent?", a: 19 },
        { q: "How many different euro banknote denominations are there?", a: 7 },
        { q: "How many member states does the UN have?", a: 193 },
      ],
    },
    sport: {
      label: "⚽ Sport",
      questions: [
        { q: "How many players from one team are on a basketball court?", a: 5 },
        { q: "How many rings are on the Olympic flag?", a: 5 },
        { q: "Length of a marathon in kilometres (rounded)?", a: 42 },
        { q: "How many tennis Grand Slam tournaments per year?", a: 4 },
        { q: "Minutes in a football match, excluding stoppage?", a: 90 },
        { q: "Maximum score in a game of ten-pin bowling?", a: 300 },
        { q: "How many holes in a full round of golf?", a: 18 },
        { q: "How many points is a touchdown, without the extra kick?", a: 6 },
      ],
    },
    chronicle: {
      label: "🏛️ History",
      questions: [
        { q: "What year did World War 1 begin?", a: 1914 },
        { q: "What year did humans first land on the Moon?", a: 1969 },
        { q: "How many wives did Henry VIII have?", a: 6 },
        { q: "What year did the French Revolution begin?", a: 1789 },
        { q: "How many US presidents have there been? (through 2024)", a: 46 },
        { q: "What year did the western Roman Empire fall?", a: 476 },
        { q: "What year did World War 2 end?", a: 1945 },
        { q: "How many years did the Berlin Wall stand?", a: 28 },
      ],
    },
    party: {
      label: "🍺 Party",
      questions: [
        { q: "Legal blood-alcohol limit for driving in Germany, in per mille?", a: 0.5 },
        { q: "How many litres of beer does the average German drink per year?", a: 88 },
        { q: "How many million litres of beer were poured at Oktoberfest 2023 (roughly)?", a: 6.5 },
        { q: "How many calories are in half a litre of beer (roughly)?", a: 210 },
        { q: "How many bottles are in a German beer crate?", a: 20 },
        { q: "How much alcohol is in Jägermeister, in percent?", a: 35 },
        { q: "What year is the German Beer Purity Law from?", a: 1516 },
        { q: "How many ingredients does the Beer Purity Law allow?", a: 4 },
        { q: "How many 2 cl shots fit in a 0.7 litre bottle?", a: 35 },
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
        { q: "Wie viele Karten hat ein Pokerdeck ohne Joker?", a: 52 },
        { q: "Wie viele Sekunden hat eine Stunde?", a: 3600 },
        { q: "Wie viele Saiten hat eine normale Gitarre?", a: 6 },
        { q: "Wie viele Felder hat ein Schachbrett?", a: 64 },
        { q: "Wie viele Grad hat ein voller Kreis?", a: 360 },
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
        { q: "Ruhepuls in Schlägen pro Minute (ungefähr)?", a: 70 },
        { q: "Wie viele Sinne hat der Mensch traditionell?", a: 5 },
        { q: "Wie viele Rippenpaare hat ein Mensch?", a: 12 },
        { q: "Wie viele Planeten hat unser Sonnensystem?", a: 8 },
        { q: "Wie viele Wochen dauert eine volle Schwangerschaft?", a: 40 },
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
        { q: "Wie viele Kontinente gibt es?", a: 7 },
        { q: "Wie viele Länder gibt es auf der Welt (ungefähr)?", a: 195 },
        { q: "Wie viele US-Bundesstaaten gibt es?", a: 50 },
        { q: "In welchem Jahr sank die Titanic?", a: 1912 },
        { q: "Höhe des Mount Everest in Metern?", a: 8849 },
      ],
    },
    money: {
      label: "💰 Geld & Macht",
      questions: [
        { q: "Wie viele Nullen hat eine Milliarde?", a: 9 },
        { q: "In welchem Jahr kam das Euro-Bargeld?", a: 2002 },
        { q: "Wie viele Länder nutzen den Euro? (2024)", a: 20 },
        { q: "Wie viele Mitgliedsländer hat die G7?", a: 7 },
        { q: "Mindestalter, um US-Präsident zu werden?", a: 35 },
        { q: "Regulärer Mehrwertsteuersatz in Deutschland, in Prozent?", a: 19 },
        { q: "Wie viele verschiedene Euro-Schein-Größen gibt es?", a: 7 },
        { q: "Wie viele Mitgliedsstaaten hat die UNO?", a: 193 },
      ],
    },
    sport: {
      label: "⚽ Sport",
      questions: [
        { q: "Wie viele Spieler eines Teams stehen beim Basketball auf dem Feld?", a: 5 },
        { q: "Wie viele Ringe hat die olympische Flagge?", a: 5 },
        { q: "Länge eines Marathons in Kilometern (gerundet)?", a: 42 },
        { q: "Wie viele Tennis-Grand-Slam-Turniere gibt es pro Jahr?", a: 4 },
        { q: "Minuten eines Fußballspiels ohne Nachspielzeit?", a: 90 },
        { q: "Höchstmögliche Punktzahl beim Bowling?", a: 300 },
        { q: "Wie viele Löcher hat eine volle Runde Golf?", a: 18 },
        { q: "Wie viele Punkte bringt ein Touchdown, ohne Zusatzkick?", a: 6 },
      ],
    },
    chronicle: {
      label: "🏛️ Geschichte",
      questions: [
        { q: "In welchem Jahr begann der Erste Weltkrieg?", a: 1914 },
        { q: "In welchem Jahr landeten Menschen zum ersten Mal auf dem Mond?", a: 1969 },
        { q: "Wie viele Ehefrauen hatte Heinrich VIII.?", a: 6 },
        { q: "In welchem Jahr begann die Französische Revolution?", a: 1789 },
        { q: "Wie viele US-Präsidenten gab es bisher? (bis 2024)", a: 46 },
        { q: "In welchem Jahr fiel das Weströmische Reich?", a: 476 },
        { q: "In welchem Jahr endete der Zweite Weltkrieg?", a: 1945 },
        { q: "Wie viele Jahre stand die Berliner Mauer?", a: 28 },
      ],
    },
    party: {
      label: "🍺 Party",
      questions: [
        { q: "Promillegrenze am Steuer in Deutschland?", a: 0.5 },
        { q: "Wie viele Liter Bier trinkt ein Deutscher im Schnitt pro Jahr?", a: 88 },
        { q: "Wie viele Millionen Liter Bier wurden auf dem Oktoberfest 2023 ausgeschenkt (ungefähr)?", a: 6.5 },
        { q: "Wie viele Kalorien hat ein halber Liter Bier (ungefähr)?", a: 210 },
        { q: "Wie viele Flaschen sind in einem Kasten Bier?", a: 20 },
        { q: "Wie viel Prozent Alkohol hat Jägermeister?", a: 35 },
        { q: "Aus welchem Jahr stammt das deutsche Reinheitsgebot?", a: 1516 },
        { q: "Wie viele Zutaten erlaubt das Reinheitsgebot?", a: 4 },
        { q: "Wie viele 2-cl-Shots passen in eine 0,7-Liter-Flasche?", a: 35 },
      ],
    },
  };

  var ES = {
    general: {
      label: "🎲 General",
      questions: [
        { q: "¿Cuántas teclas tiene un piano estándar?", a: 88 },
        { q: "¿Cuántos huesos tiene el cuerpo humano adulto?", a: 206 },
        { q: "¿Cuántos países hay en la UE (2024)?", a: 27 },
        { q: "¿Cuántos minutos tiene una semana entera? (vale en miles)", a: 10080 },
        { q: "¿Cuántos corazones tiene un pulpo?", a: 3 },
        { q: "¿En qué año salió el primer iPhone?", a: 2007 },
        { q: "¿Cuántas cartas tiene una baraja francesa, sin comodines?", a: 52 },
        { q: "¿Cuántos segundos tiene una hora?", a: 3600 },
        { q: "¿Cuántas cuerdas tiene una guitarra estándar?", a: 6 },
        { q: "¿Cuántas casillas tiene un tablero de ajedrez?", a: 64 },
        { q: "¿Cuántos grados tiene un círculo completo?", a: 360 },
      ],
    },
    body: {
      label: "🧠 Cuerpo y ciencia",
      questions: [
        { q: "¿Temperatura corporal media del ser humano en °C?", a: 37 },
        { q: "¿Cuántos dientes tiene un adulto?", a: 32 },
        { q: "¿Cuántos cromosomas tiene el ser humano?", a: 46 },
        { q: "¿Litros de sangre de un adulto medio?", a: 5 },
        { q: "¿Cuántos músculos hacen falta para sonreír? (aprox.)", a: 12 },
        { q: "¿Pulsaciones por minuto en reposo (aprox.)?", a: 70 },
        { q: "¿Cuántos sentidos tiene tradicionalmente el ser humano?", a: 5 },
        { q: "¿Cuántos pares de costillas tiene el ser humano?", a: 12 },
        { q: "¿Cuántos planetas hay en nuestro sistema solar?", a: 8 },
        { q: "¿Cuántas semanas dura un embarazo a término?", a: 40 },
      ],
    },
    world: {
      label: "🌍 Mundo",
      questions: [
        { q: "¿Altura de la Torre Eiffel en metros?", a: 330 },
        { q: "¿Cuántos husos horarios abarca Rusia?", a: 11 },
        { q: "¿Número de lunas de Júpiter (conocidas, aprox.)?", a: 95 },
        { q: "¿Cuántos jugadores hay en total en un campo de fútbol?", a: 22 },
        { q: "¿En qué año cayó el Muro de Berlín?", a: 1989 },
        { q: "¿Cuántos continentes hay?", a: 7 },
        { q: "¿Cuántos países hay en el mundo (aprox.)?", a: 195 },
        { q: "¿Cuántos estados tiene EE. UU.?", a: 50 },
        { q: "¿En qué año se hundió el Titanic?", a: 1912 },
        { q: "¿Altura del Everest en metros?", a: 8849 },
      ],
    },
    money: {
      label: "💰 Dinero y poder",
      questions: [
        { q: "¿Cuántos ceros tiene mil millones?", a: 9 },
        { q: "¿En qué año empezaron a circular los billetes y monedas de euro?", a: 2002 },
        { q: "¿Cuántos países usan el euro? (2024)", a: 20 },
        { q: "¿Cuántos países miembros tiene el G7?", a: 7 },
        { q: "¿Edad mínima para ser presidente de EE. UU.?", a: 35 },
        { q: "¿Tipo general de IVA en Alemania, en porcentaje?", a: 19 },
        { q: "¿Cuántos billetes de euro de distinto valor hay?", a: 7 },
        { q: "¿Cuántos Estados miembros tiene la ONU?", a: 193 },
      ],
    },
    sport: {
      label: "⚽ Deporte",
      questions: [
        { q: "¿Cuántos jugadores de un equipo hay en una pista de baloncesto?", a: 5 },
        { q: "¿Cuántos aros tiene la bandera olímpica?", a: 5 },
        { q: "¿Longitud de un maratón en kilómetros (redondeada)?", a: 42 },
        { q: "¿Cuántos torneos de Grand Slam de tenis hay al año?", a: 4 },
        { q: "¿Minutos de un partido de fútbol, sin el tiempo añadido?", a: 90 },
        { q: "¿Puntuación máxima en una partida de bolos?", a: 300 },
        { q: "¿Cuántos hoyos tiene un recorrido completo de golf?", a: 18 },
        { q: "¿Cuántos puntos vale un touchdown, sin la patada extra?", a: 6 },
      ],
    },
    chronicle: {
      label: "🏛️ Historia",
      questions: [
        { q: "¿En qué año empezó la Primera Guerra Mundial?", a: 1914 },
        { q: "¿En qué año llegó el ser humano a la Luna por primera vez?", a: 1969 },
        { q: "¿Cuántas esposas tuvo Enrique VIII?", a: 6 },
        { q: "¿En qué año empezó la Revolución francesa?", a: 1789 },
        { q: "¿Cuántos presidentes ha tenido EE. UU.? (hasta 2024)", a: 46 },
        { q: "¿En qué año cayó el Imperio romano de Occidente?", a: 476 },
        { q: "¿En qué año terminó la Segunda Guerra Mundial?", a: 1945 },
        { q: "¿Cuántos años estuvo en pie el Muro de Berlín?", a: 28 },
      ],
    },
    party: {
      label: "🍺 Fiesta",
      questions: [
        { q: "¿Tasa máxima de alcohol en sangre para conducir en Alemania, en gramos por litro?", a: 0.5 },
        { q: "¿Cuántos litros de cerveza bebe un alemán medio al año?", a: 88 },
        { q: "¿Cuántos millones de litros de cerveza se sirvieron en el Oktoberfest de 2023 (aprox.)?", a: 6.5 },
        { q: "¿Cuántas calorías tiene medio litro de cerveza (aprox.)?", a: 210 },
        { q: "¿Cuántas botellas tiene una caja de cerveza alemana?", a: 20 },
        { q: "¿Cuánto alcohol tiene el Jägermeister, en porcentaje?", a: 35 },
        { q: "¿De qué año es la Ley de Pureza de la cerveza alemana?", a: 1516 },
        { q: "¿Cuántos ingredientes permite la Ley de Pureza de la cerveza?", a: 4 },
        { q: "¿Cuántos chupitos de 2 cl caben en una botella de 0,7 litros?", a: 35 },
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.NumberQuestions = { de: DE, en: EN, es: ES };
})(window);
