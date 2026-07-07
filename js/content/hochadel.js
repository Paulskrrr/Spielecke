/*
 * content/hochadel.js — content & deck for „Hochadel" (cards tagged per edition)
 *
 * EDIT ME. Pure data. The Hochadel engine (js/games/hochadel.js) reads this and
 * drives all behaviour from each card's `type`. Keeping the deck as data means an
 * edition = a card set: add cards, tag them with the editions they belong to, and
 * the same engine plays a different game.
 *
 * Bilingual: the whole content payload is a { de:<content>, en:<content> } bundle,
 * and the engine selects the current language's subtree via Spielecke.L(...). Both
 * languages keep the SAME structure (same ids, same array lengths, same keys);
 * only the human-facing strings differ.
 *
 * Card shape:
 *   { id, type, title, text, editions:[...], mini?, copies? }
 *     type     "sofort" | "regel" | "aktiv" | "minispiel"  (drives colour + mechanic)
 *     editions which editions include the card, e.g. ["koenige","rapunzel"]
 *     mini     only for type "minispiel": "fingerschlacht" | "reim" | "trommelfeuer"
 *     power    only for type "aktiv": optional engine hook (e.g. "sanduhr")
 *     copies   how many times the card is seeded into the deck (default 1). Set 2
 *              on evergreen basics / mini-games so they can come up twice a night.
 *
 * The in-game word for "drink" is always **dienen** (DE) / **serve** (EN) —
 * never "trinken" / "drink".
 */
(function (global) {
  "use strict";

  // ===========================================================================
  // DEUTSCH
  // ===========================================================================

  // Editions. Only „Diener & Könige" is playable; Rapunzel is a locked stub so
  // the start screen + deck structure are ready for a future swappable card set.
  var EDITIONS_DE = [
    { id: "koenige", name: "Diener & Könige", subtitle: "Männer-Edition", icon: "👑", locked: false },
    { id: "rapunzel", name: "Rapunzel-Edition", subtitle: "bald verfügbar", icon: "👸", locked: true },
  ];

  // The three standing ground rules — always on, independent of the deck (§3).
  var GROUND_RULES_DE = [
    {
      title: "Adelsnamen",
      text: "Am Hofe spricht man sich nur mit Nachnamen an. Wer einen Vornamen ausspricht, muss einen Dienst erweisen.",
    },
    {
      title: "Der rechte Ruf",
      text: "Es heißt nicht „trinken“, es heißt dienen. Wer sich verspricht, muss einen Dienst erweisen.",
    },
    {
      title: "Höfische Zunge",
      text: "Am Hofe wird nicht geflucht. Wer flucht, dient.",
    },
  ];

  // Starter Versvorrat for „Reim oder Schmach". Each is an opening line the next
  // player must rhyme onto within five seconds. Freely editable / extendable.
  var VERSES_DE = [
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
  var DECK_DE = [
    // --- 5.1 Sofort-Aktionen (Karmesin) ----------------------------------
    { id: "s_maenner", type: "sofort", title: "Mannen des Reichs",
      text: "Alle Männer dienen.", editions: ["koenige", "rapunzel"] },
    { id: "s_damen", type: "sofort", title: "Die Damen des Hofes",
      text: "Alle Frauen dienen.", editions: ["rapunzel"] },
    { id: "s_fingerzeig", type: "sofort", title: "Fingerzeig des Königs",
      text: "Bestimme einen Untertan. Er dient doppelt.", editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "s_links", type: "sofort", title: "Der linke Nachbar",
      text: "Dein Nachbar zur Linken dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_rechts", type: "sofort", title: "Der rechte Nachbar",
      text: "Dein Nachbar zur Rechten dient.", editions: ["koenige", "rapunzel"] },
    { id: "s_schmach", type: "sofort", title: "Eigene Schmach",
      text: "Du selbst dienst. Wie unköniglich.", editions: ["koenige", "rapunzel"], copies: 2 },
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
      editions: ["koenige", "rapunzel"], copies: 2 },
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
      text: "Stell heimlich einen Handy-Timer. Läuft er ab, dient, wer gerade spricht.",
      editions: ["koenige", "rapunzel"] },
    { id: "a_spiegel", type: "aktiv", title: "Der Spiegel",
      text: "Einmal im Spiel lenkst du den nächsten Dienst, der dich träfe, auf den Absender zurück.",
      editions: ["koenige", "rapunzel"] },

    // --- 5.4 Minispiele (Purpur) — laufen bis zum Verlierer --------------
    { id: "m_finger", type: "minispiel", mini: "fingerschlacht", title: "Die Fingerschlacht",
      text: "Alle legen die Faust zur Tafel und strecken heimlich den Daumen aus oder nicht. Reihum nennt einer eine Zahl; trifft sie die Anzahl gehobener Daumen, scheidet der Sprecher aus. Es geht weiter, bis nur noch zwei übrig sind — die letzten zwei dienen.",
      editions: ["koenige", "rapunzel"], copies: 2 },
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
    { id: "s_gottesurteil", type: "sofort", title: "Das Gottesurteil",
      text: "Fordere einen Mitspieler zum Gottesurteil: Schere, Stein, Papier auf drei. Der Verlierer dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_zauberspiegel", type: "sofort", title: "Der Zauberspiegel",
      text: "Wer seinen Zauberspiegel (das Handy) griffbereit auf der Tafel liegen hat, dient.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_gleichgesinnte", type: "sofort", title: "Die Gleichgesinnten",
      text: "Alle, die dasselbe Getränk trinken wie du, dienen mit dir.",
      editions: ["koenige", "rapunzel"] },

    // --- Passiv / Regeln (Saphir) — gelten bis Spielende ---------------
    { id: "r_augen", type: "regel", title: "Der gesenkte Blick",
      text: "Niemand darf {P} mehr in die Augen sehen. Die ersten drei, die es doch tun, dienen. Ein neuer Zug löst den alten ab.",
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "r_spitzname", type: "regel", title: "Der Spitzname",
      text: "Der rechte Nachbar gibt {P} einen Spitznamen. Fortan gilt nur noch dieser Name — er übertrumpft sogar die Grundgesetze. Verstoß = dienen. Ein neuer Zug löst den alten ab.",
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "r_knabe", type: "regel", title: "Der Knabe",
      text: "Die jüngste Person ist fortan der Knabe und wird nur noch „Knabe“ gerufen. Verstoß = dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_dreiwort", type: "regel", title: "Wortkarg bei Hofe",
      text: "{P} spricht zwei Runden lang nur in Drei-Wort-Sätzen. Verstoß = dienen.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_echo_wort", type: "regel", title: "Das Echo",
      text: "{P} wiederholt fortan das letzte Wort jedes Satzes. Vergessen = dienen. Ein neuer Zug löst den alten ab.",
      editions: ["koenige", "rapunzel"], copies: 2 },
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
    { id: "r_inquisitor", type: "regel", title: "Der Inquisitor",
      text: "{P} ist fortan der Inquisitor. Wer eine seiner Fragen beantwortet, dient. Ein neuer Inquisitor löst den alten ab.",
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "r_schwachehand", type: "regel", title: "Die schwache Hand",
      text: "Fortan wird nur mit der schwachen Hand gedient. Verstoß = dienen.",
      editions: ["koenige", "rapunzel"] },

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
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "m_369", type: "minispiel", title: "Drei-Sechs-Neun",
      text: "Zählt reihum. Bei jeder 3, 6 oder 9 wird statt der Zahl geklatscht — bei 33 oder 63 zweimal. Wer patzt, dient.",
      editions: ["koenige", "rapunzel"] },
  ];

  // ===========================================================================
  // ENGLISH
  // ===========================================================================

  var EDITIONS_EN = [
    { id: "koenige", name: "Servants & Kings", subtitle: "Men's Edition", icon: "👑", locked: false },
    { id: "rapunzel", name: "Rapunzel Edition", subtitle: "coming soon", icon: "👸", locked: true },
  ];

  var GROUND_RULES_EN = [
    {
      title: "Noble Names",
      text: "At court one addresses one another by surname alone. Whoever utters a given name must render a service.",
    },
    {
      title: "The Proper Word",
      text: "It is not called „drinking“, it is called serving. Whoever misspeaks must render a service.",
    },
    {
      title: "A Courtly Tongue",
      text: "At court there is no cursing. Whoever curses, serves.",
    },
  ];

  var VERSES_EN = [
    "The king sits high upon his throne,",
    "At court one drinks with measured grace,",
    "There rode a knight across the land,",
    "The crown gleams bright in candlelight,",
    "Each servant knows his solemn duty,",
    "At the great feast the wine was poured,",
    "The court jester dances in motley dress,",
    "Within the keep the rooster crows,",
    "The lady waves from her high tower,",
    "The foe draws near with sword and spear,",
    "The cupbearer fills the goblets full,",
    "At the tourney the lance is splintered,",
    "The chancellor whispers soft and low,",
    "A herald brings the joyful news,",
    "The table groans beneath the feast,",
    "The throne room echoes with a roaring call,",
    "The nobleman bows down full low,",
    "At the carouse the hour grows late,",
  ];

  var DECK_EN = [
    // --- 5.1 Instant Actions (Crimson) -----------------------------------
    { id: "s_maenner", type: "sofort", title: "Men of the Realm",
      text: "All men serve.", editions: ["koenige", "rapunzel"] },
    { id: "s_damen", type: "sofort", title: "The Ladies of the Court",
      text: "All women serve.", editions: ["rapunzel"] },
    { id: "s_fingerzeig", type: "sofort", title: "The King's Pointing Finger",
      text: "Name a subject. He serves twice over.", editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "s_links", type: "sofort", title: "The Left-Hand Neighbour",
      text: "Your neighbour to the left serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_rechts", type: "sofort", title: "The Right-Hand Neighbour",
      text: "Your neighbour to the right serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_schmach", type: "sofort", title: "One's Own Disgrace",
      text: "You yourself serve. How unkingly.", editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "s_juengste", type: "sofort", title: "The Youngest in the Realm",
      text: "The youngest at court serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_greis", type: "sofort", title: "The Greybeard",
      text: "The eldest at court serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_affaeren", type: "sofort", title: "Courtly Affairs",
      text: "Whoever has already kissed someone at this table serves.", editions: ["rapunzel"] },
    { id: "s_glied", type: "sofort", title: "The Weakest Link",
      text: "Choose the weakest link at the table — whoever can hold the least and must serve the most. They serve.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_wasserfall", type: "sofort", title: "The Waterfall",
      text: "You begin to serve; around the table none may stop before the one ahead of them stops. (The king opens, the people follow.)",
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "s_gunst", type: "sofort", title: "The King's Favour",
      text: "Hand out two services freely among those present.", editions: ["koenige", "rapunzel"] },

    // --- 5.2 Passive / Rules (Sapphire) — last until game's end -----------
    // (The „Noble Names“ rule is now a fixed ground rule, hence no card.)
    { id: "r_trinkspruch", type: "regel", title: "The Toast",
      text: "Before each service one speaks: „To your health, worthy lords and ladies.“ Forgetting = serve.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_ja", type: "regel", title: "Forbidden Assent",
      text: "The word „yes“ is hereby banished. Breach = serve.", editions: ["koenige", "rapunzel"] },
    { id: "r_anrede", type: "regel", title: "Courtly Address",
      text: "From now on the whole court addresses one another formally. Breach = serve.", editions: ["koenige", "rapunzel"] },
    { id: "r_bund", type: "regel", title: "A Bond for Life",
      text: "Choose an ally. When one serves, the other serves too. Until game's end.",
      editions: ["koenige", "rapunzel"] },

    // --- 5.3 Active Cards (Gold) — face-up, self-triggered ----------------
    { id: "a_uboot", type: "aktiv", title: "The Submarine",
      text: "Raise your thumb and all must follow. The last one serves. Any time, once only.",
      editions: ["koenige", "rapunzel"] },
    { id: "a_schild", type: "aktiv", title: "The Shield",
      text: "Once per game you ward off a service entirely.", editions: ["koenige", "rapunzel"] },
    { id: "a_sanduhr", type: "aktiv", title: "The Hourglass", power: "sanduhr",
      text: "Secretly set a timer on your phone. When it runs out, whoever is speaking serves.",
      editions: ["koenige", "rapunzel"] },
    { id: "a_spiegel", type: "aktiv", title: "The Mirror",
      text: "Once per game you turn the next service that would strike you back upon its sender.",
      editions: ["koenige", "rapunzel"] },

    // --- 5.4 Mini-games (Purple) — run until there's a loser --------------
    { id: "m_finger", type: "minispiel", mini: "fingerschlacht", title: "The Battle of Thumbs",
      text: "Everyone sets a fist on the table and secretly extends a thumb or not. In turn each names a number; if it matches the count of raised thumbs, that speaker is out. It goes on until only two remain — the last two serve.",
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "m_reim", type: "minispiel", title: "Rhyme or Shame",
      text: "The verse runs: „{VERS}“ — In turn each composes a rhyming line within five seconds. Whoever falters, serves.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_trommel", type: "minispiel", mini: "trommelfeuer", title: "Drumfire",
      text: "The drawer calls out a category. In turn, one term each, keeping the beat. Whoever stumbles or repeats, serves.",
      editions: ["koenige", "rapunzel"] },

    // === Expansion — cards dictated by Paul =============================
    // „{P}" is replaced on drawing with the drawer's name.

    // --- Instant Actions (Crimson) -------------------------------------
    { id: "s_beziehung", type: "sofort", title: "The Longest Love",
      text: "The player in the longest relationship serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_exen", type: "sofort", title: "Down It, Majesty!",
      text: "You drain your whole glass in service.", editions: ["koenige", "rapunzel"] },
    { id: "s_haende", type: "sofort", title: "Courtly Bonds",
      text: "Two players hold hands for the next round — or both serve twice.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_dreizehn", type: "sofort", title: "The Unlucky Number",
      text: "Count off clockwise around the table. The thirteenth serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_gabe", type: "sofort", title: "A Generous Gift",
      text: "Pour a sip from your glass into the glass of any player you choose.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_nase", type: "sofort", title: "The Fine Nose",
      text: "Over the next round, touch your nose inconspicuously. All must follow — the slowest serves.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_schnipsen", type: "sofort", title: "The Snapper",
      text: "Over the next round, start snapping your fingers inconspicuously. All must follow — the slowest serves.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_schnaufen", type: "sofort", title: "The Heavy Breather",
      text: "Over the next round, start breathing heavily inconspicuously. All must follow — the slowest serves.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_betrunken", type: "sofort", title: "The Drunkard",
      text: "The most inebriated person at court serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_elternhaus", type: "sofort", title: "Hotel Mama",
      text: "All who still live with their parents serve.", editions: ["koenige", "rapunzel"] },
    { id: "s_kanzler", type: "sofort", title: "The Gallery of Ancestors",
      text: "Name all the German chancellors. For each correct one you may hand out a service.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_ex_immun", type: "sofort", title: "Courage to the Cup",
      text: "You may down your glass now. If you do, you are safe from serving for the next three cards.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_toilette", type: "sofort", title: "The Privy",
      text: "The last one to visit the privy serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_kontinent", type: "sofort", title: "Wanderlust",
      text: "All who have ever set foot on another continent serve.", editions: ["koenige", "rapunzel"] },
    { id: "s_lacht", type: "sofort", title: "Who Laughs Last",
      text: "The next player to laugh serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_wurf", type: "sofort", title: "The Toss",
      text: "Throw this card to a fellow player. If they catch it, the two of you hand out two services. If it falls, you both serve.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_doppeldienst", type: "sofort", title: "Double Service",
      text: "All who served last time serve again.", editions: ["koenige", "rapunzel"] },
    { id: "s_bargeld", type: "sofort", title: "The Rich One",
      text: "Whoever is carrying the most cash serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_single", type: "sofort", title: "Lonely Hearts",
      text: "All singles serve.", editions: ["koenige", "rapunzel"] },
    { id: "s_vollesglas", type: "sofort", title: "The Fullest Glass",
      text: "The player with the fullest glass serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_auto", type: "sofort", title: "The Old Carriage",
      text: "The player with the oldest car serves.", editions: ["koenige", "rapunzel"] },
    { id: "s_fuehrerschein", type: "sofort", title: "Without a Licence",
      text: "All without a driving licence serve.", editions: ["koenige", "rapunzel"] },
    { id: "s_besitzer", type: "sofort", title: "The True King",
      text: "The owner of this game is the king and hands out two services.", editions: ["koenige", "rapunzel"] },
    { id: "s_narrenfreiheit", type: "sofort", title: "A Fool's Licence",
      text: "For the next round no rules apply to you.", editions: ["koenige", "rapunzel"] },
    { id: "s_wiederkehr", type: "sofort", title: "From the Chronicles",
      text: "Choose a card already played — it is carried out at once, once more.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_echo_letzte", type: "sofort", title: "Echo",
      text: "The card played last is carried out once more.", editions: ["koenige", "rapunzel"] },
    { id: "s_obolus", type: "sofort", title: "The Obol",
      text: "Whoever first lays a one-euro coin on the table hands out three services.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_dreifachzug", type: "sofort", title: "Threefold Turn",
      text: "Draw three more cards at once — you remain at turn.", editions: ["koenige", "rapunzel"] },
    { id: "s_richtung", type: "sofort", title: "Shift of the Winds", effect: "reverse",
      text: "The direction of play reverses — from now on drawing goes the other way.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_gottesurteil", type: "sofort", title: "Trial by Ordeal",
      text: "Challenge a fellow player to a trial by ordeal: rock, paper, scissors on three. The loser serves.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_zauberspiegel", type: "sofort", title: "The Magic Mirror",
      text: "Whoever has their magic mirror (their phone) lying within reach on the table serves.",
      editions: ["koenige", "rapunzel"] },
    { id: "s_gleichgesinnte", type: "sofort", title: "The Like-Minded",
      text: "All who drink the same drink as you serve alongside you.",
      editions: ["koenige", "rapunzel"] },

    // --- Passive / Rules (Sapphire) — last until game's end ------------
    { id: "r_augen", type: "regel", title: "The Lowered Gaze",
      text: "No one may look {P} in the eyes any longer. The first three who do anyway serve. A new draw supersedes the old.",
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "r_spitzname", type: "regel", title: "The Nickname",
      text: "The right-hand neighbour gives {P} a nickname. Henceforth only this name applies — it trumps even the ground laws. Breach = serve. A new draw supersedes the old.",
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "r_knabe", type: "regel", title: "The Boy",
      text: "The youngest person is henceforth the Boy and is called nothing but „Boy“. Breach = serve.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_dreiwort", type: "regel", title: "Sparing of Words at Court",
      text: "{P} speaks for two rounds only in three-word sentences. Breach = serve.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_echo_wort", type: "regel", title: "The Echo",
      text: "{P} henceforth repeats the last word of every sentence. Forgetting = serve. A new draw supersedes the old.",
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "r_hose", type: "regel", title: "In My Trousers",
      text: "{P} ends every sentence for two rounds with „… in my trousers“. Forgetting = serve.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_artikel", type: "regel", title: "Forbidden Articles",
      text: "The words „the“, „a“ and „an“ are hereby banished. Breach = serve.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_plappermaul", type: "regel", title: "The Chatterbox",
      text: "{P} may not stay silent for four seconds until their own next turn. Otherwise serve.",
      editions: ["koenige", "rapunzel"] },
    { id: "r_zeitlupe", type: "regel", title: "In Slow Motion",
      text: "{P} serves the next three times in slow motion.", editions: ["koenige", "rapunzel"] },
    { id: "r_inquisitor", type: "regel", title: "The Inquisitor",
      text: "{P} is henceforth the Inquisitor. Whoever answers one of their questions serves. A new Inquisitor relieves the old.",
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "r_schwachehand", type: "regel", title: "The Weak Hand",
      text: "Henceforth one serves only with the weak hand. Breach = serve.",
      editions: ["koenige", "rapunzel"] },

    // --- Active Cards (Gold) — face-up, self-triggered -----------------
    { id: "a_dieb", type: "aktiv", title: "The Thief",
      text: "Any time, once only: steal a fellow player's freshly drawn card.",
      editions: ["koenige", "rapunzel"] },

    // --- Mini-games (Purple) — played out at the table -----------------
    { id: "m_imitation", type: "minispiel", title: "The Shadow Play",
      text: "Imitate a well-known person or character. Whoever guesses it first may force a fellow player to serve.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_sprachen", type: "minispiel", title: "Foreign Tongues",
      text: "In turn each says a word in a foreign language. Whoever stumbles or repeats, serves.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_szene", type: "minispiel", title: "The Performance",
      text: "Act out a scene from a film or series. Whoever guesses it first may make all the others serve — if no one guesses, you serve.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_zahlen", type: "minispiel", title: "The Oracle of Numbers",
      text: "After a countdown each names a number from 1 to 5. Whoever names the same number as another, serves.",
      editions: ["koenige", "rapunzel"] },
    { id: "m_fingergericht", type: "minispiel", title: "The Finger Verdict",
      text: "After a countdown each points at a fellow player. Whoever draws the most fingers upon themselves serves.",
      editions: ["koenige", "rapunzel"], copies: 2 },
    { id: "m_369", type: "minispiel", title: "Three-Six-Nine",
      text: "Count off in turn. At every 3, 6 or 9 you clap instead of saying the number — at 33 or 63, clap twice. Whoever stumbles, serves.",
      editions: ["koenige", "rapunzel"] },
  ];

  // ===========================================================================

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Hochadel = {
    de: {
      editions: EDITIONS_DE,
      groundRules: GROUND_RULES_DE,
      verses: VERSES_DE,
      deck: DECK_DE,
    },
    en: {
      editions: EDITIONS_EN,
      groundRules: GROUND_RULES_EN,
      verses: VERSES_EN,
      deck: DECK_EN,
    },
  };
})(window);
