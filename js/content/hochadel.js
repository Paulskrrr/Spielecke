/*
 * content/hochadel.js — content & deck for „Hochadel" (spec HOCHADEL-SPEC.md §5)
 *
 * EDIT ME. Pure data. The Hochadel engine (js/games/hochadel.js) reads this and
 * drives all behaviour from each card's `type`. Keeping the deck as data means an
 * edition = a card set: add cards, tag them with the editions they belong to, and
 * the same engine plays a different game.
 *
 * Card shape:
 *   { id, type, title, text, editions:[...], mini? }
 *     type     "sofort" | "regel" | "aktiv" | "minispiel"  (drives colour + mechanic)
 *     editions which editions include the card, e.g. ["koenige","rapunzel"]
 *     mini     only for type "minispiel": "fingerschlacht" | "reim" | "trommelfeuer"
 *     power    only for type "aktiv": optional engine hook (e.g. "sanduhr")
 *
 * The in-game word for "drink" is always **dienen** — never "trinken".
 */
(function (global) {
  "use strict";

  // Editions. Only „Diener & Könige" is playable; Rapunzel is a locked stub so
  // the start screen + deck structure are ready for a future swappable card set.
  var EDITIONS = [
    { id: "koenige", name: "Diener & Könige", subtitle: "Männer-Edition", icon: "👑", locked: false },
    { id: "rapunzel", name: "Rapunzel-Edition", subtitle: "bald verfügbar", icon: "👸", locked: true },
  ];

  // The two standing ground rules — always on, independent of the deck (§3).
  var GROUND_RULES = [
    {
      title: "Höfische Zunge",
      text: "Am Hofe wird nicht geflucht. Wer flucht, dient.",
    },
    {
      title: "Der rechte Ruf",
      text: "Es heißt nicht „trinken“, es heißt dienen. Wer sich verspricht, dient. (Anklage: „Spieker, dienen!!“)",
    },
  ];

  // Starter Versvorrat for „Reim oder Schmach". Each is an opening line the next
  // player must rhyme onto within five seconds. Freely editable / extendable.
  var VERSES = [
    "Der König sitzt auf seinem Thron,",
    "Am Hofe trinkt man mit Bedacht,",
    "Es ritt ein Ritter durch das Land,",
    "Die Krone glänzt im Kerzenschein,",
    "Ein jeder Diener kennt die Pflicht,",
    "Beim Festmahl ward der Wein gereicht,",
    "Der Hofnarr tanzt im bunten Kleid,",
    "Im Schlosshof kräht der frühe Hahn,",
    "Die Burgfrau winkt vom hohen Turm,",
    "Es naht der Feind mit Schwert und Speer,",
    "Der Mundschenk schenkt die Becher voll,",
    "Beim Turnier da bricht die Lanze,",
    "Der Kanzler flüstert leis und sacht,",
    "Ein Bote bringt die frohe Mär,",
    "Die Tafel biegt sich unterm Mahl,",
    "Im Thronsaal hallt der laute Ruf,",
    "Der Edelmann verbeugt sich tief,",
    "Beim Gelage wird es spät,",
  ];

  // The deck (Diener & Könige). Each card carries the editions it belongs to.
  // „Die Damen des Hofes“ is tagged rapunzel-only: in a men's round it is
  // gegenstandslos, so it is kept in the data but filtered out of the König deck.
  var DECK = [
    // --- 5.1 Sofort-Aktionen (Karmesin) ----------------------------------
    { id: "s_maenner", type: "sofort", title: "Mannen des Reichs",
      text: "Alle Männer dienen.", editions: ["koenige", "rapunzel"] },
    { id: "s_damen", type: "sofort", title: "Die Damen des Hofes",
      text: "Alle Frauen dienen.", editions: ["rapunzel"] },
    { id: "s_fingerzeig", type: "sofort", title: "Fingerzeig des Königs",
      text: "Bestimme einen Untertan. Er dient doppelt.", editions: ["koenige", "rapunzel"] },
    { id: "s_links", type: "sofort", title: "Der linke Nachbar",
      text: "Dein Nachbar zur Linken dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_schmach", type: "sofort", title: "Eigene Schmach",
      text: "Du selbst dienst. Wie unköniglich.", editions: ["koenige", "rapunzel"] },
    { id: "s_juengste", type: "sofort", title: "Der Jüngste im Reich",
      text: "Der Jüngste am Hofe dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_greis", type: "sofort", title: "Der Greis",
      text: "Der Älteste am Hofe dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_affaeren", type: "sofort", title: "Höfische Affären",
      text: "Wer schon einen am Tisch geküsst hat, dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_glied", type: "sofort", title: "Das schwächste Glied",
      text: "Bestimmt das schwächste Glied der Tafel. Es dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_wasserfall", type: "sofort", title: "Der Wasserfall",
      text: "Du beginnst zu dienen; reihum darf erst enden, wer vor ihm endet. (Der König eröffnet, das Volk folgt.)",
      editions: ["koenige", "rapunzel"] },
    { id: "s_gunst", type: "sofort", title: "Gunst des Königs",
      text: "Verteile zwei Dienste frei unter den Anwesenden.", editions: ["koenige", "rapunzel"] },

    // --- 5.2 Passiv / Regeln (Saphir) — gelten bis Spielende -------------
    { id: "r_adelsnamen", type: "regel", title: "Adelsnamen",
      text: "Ab jetzt nur noch Nachnamen am Hofe. Vorname = dienen.", editions: ["koenige", "rapunzel"] },
    { id: "r_trinkspruch", type: "regel", title: "Der Trinkspruch",
      text: "Vor jedem Dienst spricht man: „Zum Wohl, werte Herrschaften.“ Vergessen = dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_ja", type: "regel", title: "Verbotene Zustimmung",
      text: "Das Wort „Ja“ ist fortan verbannt. Verstoß = dienen.", editions: ["koenige", "rapunzel"] },
    { id: "r_anrede", type: "regel", title: "Höfische Anrede",
      text: "Ab jetzt siezt sich der gesamte Hof. Verstoß = dienen.", editions: ["koenige", "rapunzel"] },
    { id: "r_bund", type: "regel", title: "Bund auf Lebenszeit",
      text: "Wähle einen Verbündeten. Dient einer, dient der andere mit. Bis Spielende.",
      editions: ["koenige", "rapunzel"] },

    // --- 5.3 Aktive Karten (Gold) — face-up, self-triggered --------------
    { id: "a_uboot", type: "aktiv", title: "Das U-Boot",
      text: "Hebst du den Daumen, müssen alle folgen. Der Letzte dient. Jederzeit, einmalig.",
      editions: ["koenige", "rapunzel"] },
    { id: "a_schild", type: "aktiv", title: "Das Schutzschild",
      text: "Einmal im Spiel wehrst du einen Dienst vollständig ab.", editions: ["koenige", "rapunzel"] },
    { id: "a_sanduhr", type: "aktiv", title: "Die Sanduhr", power: "sanduhr",
      text: "Setze heimlich eine Frist. Läuft sie ab, dient, wer gerade spricht.",
      editions: ["koenige", "rapunzel"] },
    { id: "a_spiegel", type: "aktiv", title: "Der Spiegel",
      text: "Einmal im Spiel lenkst du den nächsten Dienst, der dich träfe, auf den Absender zurück.",
      editions: ["koenige", "rapunzel"] },

    // --- 5.4 Minispiele (Purpur) — laufen bis zum Verlierer --------------
    { id: "m_finger", type: "minispiel", mini: "fingerschlacht", title: "Die Fingerschlacht",
      text: "Alle legen die Faust zur Tafel und strecken heimlich den Daumen aus oder nicht. Reihum nennt einer eine Zahl; trifft sie die Anzahl gehobener Daumen, scheidet der Sprecher aus. Es geht weiter, bis nur noch zwei übrig sind — die letzten zwei dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_reim", type: "minispiel", mini: "reim", title: "Reim oder Schmach",
      text: "Die Karte nennt einen Vers. Reihum dichtet jeder in fünf Sekunden einen Reim darauf. Wer stockt oder die Frist reißt, dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_trommel", type: "minispiel", mini: "trommelfeuer", title: "Trommelfeuer",
      text: "Der Zieher ruft eine Kategorie. Reihum je ein Begriff im Takt. Wer patzt oder wiederholt, dient.",
      editions: ["koenige", "rapunzel"] },
  ];

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Hochadel = {
    editions: EDITIONS,
    groundRules: GROUND_RULES,
    verses: VERSES,
    deck: DECK,
  };
})(window);
