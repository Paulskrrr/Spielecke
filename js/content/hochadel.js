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

  // The three standing ground rules — always on, independent of the deck (§3).
  var GROUND_RULES = [
    {
      title: "Adelsnamen",
      text: "Am Hofe spricht man sich nur mit Nachnamen an. Wer einen Vornamen ausspricht, dient.",
    },
    {
      title: "Der rechte Ruf",
      text: "Es heißt nicht „trinken“, es heißt dienen. Wer sich verspricht, dient. (Anklage: „Spieker, dienen!!“)",
    },
    {
      title: "Höfische Zunge",
      text: "Am Hofe wird nicht geflucht. Wer flucht, dient.",
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
      text: "Wer schon einen am Tisch geküsst hat, dient.", editions: ["rapunzel"] },
    { id: "s_glied", type: "sofort", title: "Das schwächste Glied",
      text: "Bestimmt das schwächste Glied der Tafel — wer am wenigsten verträgt und am meisten dienen muss. Es dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_wasserfall", type: "sofort", title: "Der Wasserfall",
      text: "Du beginnst zu dienen; reihum darf erst enden, wer vor ihm endet. (Der König eröffnet, das Volk folgt.)",
      editions: ["koenige", "rapunzel"] },
    { id: "s_gunst", type: "sofort", title: "Gunst des Königs",
      text: "Verteile zwei Dienste frei unter den Anwesenden.", editions: ["koenige", "rapunzel"] },

    // --- 5.2 Passiv / Regeln (Saphir) — gelten bis Spielende -------------
    // (Die „Adelsnamen“-Regel ist jetzt eine feste Grundregel, daher keine Karte.)
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
    { id: "m_reim", type: "minispiel", title: "Reim oder Schmach",
      text: "Der Vers lautet: „{VERS}“ — Reihum dichtet jeder in fünf Sekunden eine reimende Zeile darauf. Wer stockt, dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_trommel", type: "minispiel", mini: "trommelfeuer", title: "Trommelfeuer",
      text: "Der Zieher ruft eine Kategorie. Reihum je ein Begriff im Takt. Wer patzt oder wiederholt, dient.",
      editions: ["koenige", "rapunzel"] },

    // === Erweiterung — von Paul diktierte Karten ========================
    // „{P}" wird beim Ziehen durch den Namen des Ziehers ersetzt.

    // --- Sofort-Aktionen (Karmesin) ------------------------------------
    { id: "s_beziehung", type: "sofort", title: "Die längste Liebe",
      text: "Der Spieler mit der längsten Beziehung dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_exen", type: "sofort", title: "Ex, Majestät!",
      text: "Du leerst dein ganzes Glas im Dienst.", editions: ["koenige", "rapunzel"] },
    { id: "s_haende", type: "sofort", title: "Höfische Bande",
      text: "Zwei Mitspieler halten die nächste Runde Händchen — oder dienen beide zweimal.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_dreizehn", type: "sofort", title: "Die Unglückszahl",
      text: "Zählt reihum im Uhrzeigersinn. Der Dreizehnte dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_gabe", type: "sofort", title: "Großzügige Gabe",
      text: "Kippe einen Schluck aus deinem Glas in das eines beliebigen Mitspielers.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_nase", type: "sofort", title: "Die feine Nase",
      text: "Fass dir im Laufe der nächsten Runde unauffällig an die Nase. Alle müssen folgen — der Langsamste dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_schnipsen", type: "sofort", title: "Der Schnipser",
      text: "Fang im Laufe der nächsten Runde unauffällig an zu schnipsen. Alle müssen folgen — der Langsamste dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_schnaufen", type: "sofort", title: "Der Schnaufer",
      text: "Fang im Laufe der nächsten Runde unauffällig an zu schnaufen. Alle müssen folgen — der Langsamste dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_betrunken", type: "sofort", title: "Der Trunkenbold",
      text: "Die betrunkenste Person am Hofe dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_elternhaus", type: "sofort", title: "Hotel Mama",
      text: "Alle, die noch bei ihren Eltern wohnen, dienen.", editions: ["koenige", "rapunzel"] },
    { id: "s_kanzler", type: "sofort", title: "Die Ahnengalerie",
      text: "Zähle alle Bundeskanzler auf. Für jeden richtigen darfst du einen Dienst verteilen.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_ex_immun", type: "sofort", title: "Mut zum Becher",
      text: "Du darfst jetzt dein Glas exen. Tust du es, bist du die nächsten drei Karten vor dem Dienen sicher.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_toilette", type: "sofort", title: "Stilles Örtchen",
      text: "Der Letzte, der auf der Toilette war, dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_kontinent", type: "sofort", title: "Fernweh",
      text: "Alle, die schon einmal auf einem anderen Kontinent waren, dienen.", editions: ["koenige", "rapunzel"] },
    { id: "s_lacht", type: "sofort", title: "Wer zuletzt lacht",
      text: "Der nächste Mitspieler, der lacht, dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_wurf", type: "sofort", title: "Der Wurf",
      text: "Wirf diese Karte einem Mitspieler zu. Fängt er sie, verteilt ihr zwei Dienste. Fällt sie, dient ihr beide.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_doppeldienst", type: "sofort", title: "Doppelter Dienst",
      text: "Alle, die zuletzt gedient haben, dienen erneut.", editions: ["koenige", "rapunzel"] },
    { id: "s_bargeld", type: "sofort", title: "Der Reiche",
      text: "Wer das meiste Bargeld dabei hat, dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_single", type: "sofort", title: "Einsame Herzen",
      text: "Alle Singles dienen.", editions: ["koenige", "rapunzel"] },
    { id: "s_vollesglas", type: "sofort", title: "Das volle Glas",
      text: "Der Mitspieler mit dem vollsten Glas dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_auto", type: "sofort", title: "Die alte Karosse",
      text: "Der Mitspieler mit dem ältesten Auto dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_fuehrerschein", type: "sofort", title: "Ohne Fahrerlaubnis",
      text: "Alle ohne Führerschein dienen.", editions: ["koenige", "rapunzel"] },
    { id: "s_besitzer", type: "sofort", title: "Der wahre König",
      text: "Der Besitzer dieses Spiels ist der König und verteilt zwei Dienste.", editions: ["koenige", "rapunzel"] },
    { id: "s_narrenfreiheit", type: "sofort", title: "Narrenfreiheit",
      text: "Die nächste Runde gelten für dich keine Regeln.", editions: ["koenige", "rapunzel"] },
    { id: "s_wiederkehr", type: "sofort", title: "Aus der Geschichte",
      text: "Wähle eine bereits gespielte Karte — sie wird sofort noch einmal ausgeführt.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_echo_letzte", type: "sofort", title: "Echo",
      text: "Die zuletzt gespielte Karte wird noch einmal ausgeführt.", editions: ["koenige", "rapunzel"] },
    { id: "s_obolus", type: "sofort", title: "Der Obolus",
      text: "Wer zuerst ein 1-Euro-Stück auf den Tisch legt, verteilt drei Dienste.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_dreifachzug", type: "sofort", title: "Dreifacher Zug",
      text: "Ziehe sofort drei weitere Karten — du bleibst am Zug.", editions: ["koenige", "rapunzel"] },
    { id: "s_richtung", type: "sofort", title: "Wechsel der Winde", effect: "reverse",
      text: "Die Spielrichtung kehrt sich um — ab jetzt wird andersherum gezogen.",
      editions: ["koenige", "rapunzel"] },

    // --- Passiv / Regeln (Saphir) — gelten bis Spielende ---------------
    { id: "r_augen", type: "regel", title: "Der gesenkte Blick",
      text: "Niemand darf {P} mehr in die Augen sehen. Die ersten drei, die es doch tun, dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_spitzname", type: "regel", title: "Der Spitzname",
      text: "Der rechte Nachbar gibt {P} einen Spitznamen. Fortan gilt nur noch dieser Name — er übertrumpft sogar die Grundgesetze. Verstoß = dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_knabe", type: "regel", title: "Der Knabe",
      text: "Die jüngste Person ist fortan der Knabe und wird nur noch „Knabe“ gerufen. Verstoß = dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_dreiwort", type: "regel", title: "Wortkarg bei Hofe",
      text: "{P} spricht zwei Runden lang nur in Drei-Wort-Sätzen. Verstoß = dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_echo_wort", type: "regel", title: "Das Echo",
      text: "{P} wiederholt fortan das letzte Wort jedes Satzes. Vergessen = dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_hose", type: "regel", title: "In meiner Hose",
      text: "{P} beendet zwei Runden lang jeden Satz mit „… in meiner Hose“. Vergessen = dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_artikel", type: "regel", title: "Verbotene Artikel",
      text: "Die Wörter „der“, „die“ und „das“ sind fortan verbannt. Verstoß = dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_plappermaul", type: "regel", title: "Das Plappermaul",
      text: "{P} darf bis zum nächsten eigenen Zug keine vier Sekunden schweigen. Sonst dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_zeitlupe", type: "regel", title: "In Zeitlupe",
      text: "{P} dient die nächsten drei Male in Zeitlupe.", editions: ["koenige", "rapunzel"] },

    // --- Aktive Karten (Gold) — face-up, self-triggered ----------------
    { id: "a_dieb", type: "aktiv", title: "Der Dieb",
      text: "Jederzeit einmalig: Klau einem Mitspieler seine frisch gezogene Karte.",
      editions: ["koenige", "rapunzel"] },

    // --- Minispiele (Purpur) — am Tisch ausgespielt --------------------
    { id: "m_imitation", type: "minispiel", title: "Das Schattenspiel",
      text: "Imitiere eine bekannte Person oder Figur. Wer sie zuerst errät, darf einen Mitspieler zum Dienen zwingen.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_sprachen", type: "minispiel", title: "Fremde Zungen",
      text: "Reihum sagt jeder ein Wort in einer fremden Sprache. Wer patzt oder wiederholt, dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_szene", type: "minispiel", title: "Die Aufführung",
      text: "Spiele eine Szene aus Film oder Serie nach. Wer sie zuerst errät, darf alle anderen dienen lassen — errät niemand, dienst du.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_zahlen", type: "minispiel", title: "Das Zahlenorakel",
      text: "Nach einem Countdown nennt jeder eine Zahl von 1 bis 5. Wer dieselbe Zahl wie ein anderer nennt, dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_fingergericht", type: "minispiel", title: "Das Fingergericht",
      text: "Nach einem Countdown zeigt jeder auf einen Mitspieler. Wer die meisten Finger auf sich zieht, dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_369", type: "minispiel", title: "Drei-Sechs-Neun",
      text: "Zählt reihum. Bei jeder 3, 6 oder 9 wird statt der Zahl geklatscht — bei 33 oder 63 zweimal. Wer patzt, dient.",
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
