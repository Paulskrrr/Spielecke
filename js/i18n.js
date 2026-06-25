/*
 * i18n.js — language switcher (DE / EN)
 *
 * English strings are the keys. t(key) returns the key as-is for "en", or the
 * German translation for "de". Template placeholders like {name}, {n} are
 * resolved by the caller with .replace("{name}", value).
 *
 * Language is persisted globally via Store.appGet/appSet("spielecke.app.lang").
 * Default: "de".
 */
(function (global) {
  "use strict";

  var LANG_KEY = "spielecke.app.lang";
  var DEFAULT_LANG = "de";

  var DE = {
    // ── Shell ──────────────────────────────────────────────────────────────
    "player": "Spieler",
    "players": "Spieler",
    "Edit": "Bearbeiten",
    "This game failed to load.": "Spiel konnte nicht geladen werden.",
    "← Back to shelf": "← Zur Spielecke",

    // ── Roster ─────────────────────────────────────────────────────────────
    "Players": "Spieler",
    "Entered once, used by every game.": "Einmal eingeben, für alle Spiele.",
    "Add a player…": "Spieler hinzufügen…",
    "Add": "Hinzufügen",
    "Move up": "Nach oben",
    "Move down": "Nach unten",
    "Remove": "Entfernen",
    "No players yet.": "Noch keine Spieler.",
    "Done": "Fertig",
    "Language": "Sprache",
    "⚠ Most games are better with {n}+ players.": "⚠ Die meisten Spiele sind besser mit {n}+ Spielern.",

    // ── Shelf ──────────────────────────────────────────────────────────────
    "🍻 drink mode": "🍻 Trinkspiel",

    // ── Game names & taglines ──────────────────────────────────────────────
    "The Bomb": "Die Bombe",
    "Name it fast, pass it faster. Don't be holding it when it blows.": "Schnell benennen, schnell weitergeben. Wer sie hält, verliert.",
    "Who Am I?": "Wer bin ich?",
    "Phone on your forehead. They shout, you guess. Beat the clock.": "Handy auf die Stirn. Die anderen rufen, du rätst.",
    "Imposter": "Imposter",
    "Everyone knows the word. One faker doesn't. Sniff them out.": "Alle kennen das Wort. Einer nicht. Entlarve ihn.",
    "Wavelength": "Wavelength",
    "Read the room. One clue, one dial — how close can they land?": "Lies den Raum. Ein Tipp, ein Dial — wie nah kommen sie?",
    "Never Have I Ever": "Ich habe noch nie",
    "Owning up is the easy part. The stories aren't.": "Das Zugeben ist das Einfachste. Die Geschichten nicht.",
    "Most Likely To": "Most Likely To",
    "Point on three. No takebacks.": "Auf drei zeigen. Kein Zurück.",
    "Liar's Numbers": "Lügner-Zahlen",
    "Everyone guesses a number. Closest wins, furthest eats it.": "Alle raten eine Zahl. Wer am nächsten liegt, gewinnt.",
    "Princess Treatment": "Princess Treatment",
    "Going above and beyond, or just the bare minimum? Discuss.": "Mehr als nötig oder nur das Minimum? Diskutiert.",
    "Doodle Drama": "Doodle Drama",
    "Draw it, guess it, draw it again. Watch it fall apart.": "Zeichne, rate, zeichne. Schau wie es auseinanderfällt.",
    "Activity": "Activity",
    "Two teams. Explain, draw, act. First to the finish wins.": "Zwei Teams. Erklären, zeichnen, spielen. Wer zuerst am Ziel ist, gewinnt.",
    "Quiz Out": "Quiz Out",
    "Answer or lose a heart. Last one standing wins.": "Antworten oder ein Herz verlieren. Wer übrig bleibt, gewinnt.",
    "Truth or Drink": "Wahrheit oder Trinken",
    "Spill it, or sip it. One of you is on the spot.": "Gesteht oder trinkt. Einer steht auf dem Prüfstand.",
    "Chooser": "Glücksrad",
    "Spin the wheel. Let fate pick the victim.": "Dreh das Rad. Das Schicksal wählt.",
    "Reaction Duel": "Reaction Duel",
    "Two players, one screen. Fastest wins — unless it's a trap.": "Zwei Spieler, ein Bildschirm. Wer schneller ist, gewinnt — außer es ist eine Falle.",
    "Hochadel": "Hochadel",
    "Royal court card game — transgressors serve.": "Höfisches Kartenspiel — wer sich vergeht, dient.",
    "Rank It": "Rank It",
    "Everyone ranks the same five. Drift from the group and you lose.": "Alle ranken dieselben fünf. Wer vom Schwarm abweicht, verliert.",
    "Meme Maker": "Meme Maker",
    "Caption the chaos. Funniest one wins the round.": "Texte das Chaos. Der lustigste Spruch gewinnt.",

    // ── Common ─────────────────────────────────────────────────────────────
    "Back to shelf": "Zur Spielecke",
    "Change settings": "Einstellungen",
    "Next round 🔁": "Nächste Runde 🔁",
    "Next player ▶️": "Nächster Spieler ▶️",
    "New round 🔁": "Neue Runde 🔁",
    "Start ▶️": "Start ▶️",
    "Next ▶️": "Weiter ▶️",
    "Category": "Kategorie",
    "🎯 Mixed": "🎯 Gemischt",
    "🎯 Mixed (all)": "🎯 Gemischt",
    "Change pool": "Kategorie wechseln",
    "🍻 Drinking mode": "🍻 Trinkspiel",
    "🍻 Drinking mode (wrong = drink too)": "🍻 Trinkspiel (Falsch = trinken)",
    "Rematch 🔁": "Revanche 🔁",
    "wins!": "gewinnt!",
    " wins!": " gewinnt!",

    // ── Bomb ───────────────────────────────────────────────────────────────
    "Category pool": "Kategorien",
    "⏱️ The fuse is random — and hidden from everyone.": "⏱️ Die Zündschnur ist zufällig — für alle verborgen.",
    "🔊 Ticking & explosion sound": "🔊 Ticken & Explosion",
    "ARM & START 💥": "STARTEN 💥",
    "💣 LIVE — pass it on!": "💣 LIVE — weitergeben!",
    "PASS ➡️": "WEITER ➡️",
    "Give up · back to setup": "Aufgeben · zurück",
    "BOOM!": "BOOM!",
    "🔥 Whoever's holding it drinks!": "🔥 Wer es hält, trinkt!",
    "🔥 Whoever's holding it loses the round!": "🔥 Wer es hält, verliert die Runde!",
    "🍻 Drinking mode": "🍻 Trinkspiel",

    // ── Who Am I ───────────────────────────────────────────────────────────
    "📚 Categories": "📚 Kategorien",
    "✍️ Custom sticky": "✍️ Eigener Begriff",
    "Round length": "Rundenzeit",
    "🔊 Sounds": "🔊 Töne",
    "START TURN ▶️": "RUNDE STARTEN ▶️",
    "GOT IT ✅": "GEWUSST ✅",
    "SKIP ⏭️": "WEITER ⏭️",
    "End turn early": "Runde beenden",
    " correct!": " richtig!",
    "Nailed it — beat that, next player!": "Super — jetzt der Nächste!",
    "Beatable — under {TARGET}. Pass it on.": "Schaffbar — unter {TARGET}. Weiter!",
    "New character ✍️": "Neuer Begriff ✍️",

    // ── Imposter ───────────────────────────────────────────────────────────
    "Word pool": "Wörter-Kategorie",
    "How many imposters?": "Wie viele Imposter?",
    "Deal roles 🂴": "Rollen austeilen 🂴",
    "Player {i} of {n}": "Spieler {i} von {n}",
    "Pass to {name}": "Weiter an {name}",
    "Only {name} should look. Everyone else: no peeking.": "Nur {name} darf schauen. Alle anderen: nicht gucken.",
    "I'm {name} — reveal": "Ich bin {name} — anzeigen",
    "You are the": "Du bist der/die",
    "IMPOSTER 🤫": "IMPOSTER 🤫",
    "Blend in. Don't get caught.": "Misch dich ein. Nicht auffallen.",
    "You're 1 of {n} imposters — but who else?": "Du bist 1 von {n} Impostern — aber wer noch?",
    "The secret word is": "Das geheime Wort ist",
    "Hint at it — never say it.": "Andeuten — niemals sagen.",
    "Hide & start talking 🗣️": "Verstecken & diskutieren 🗣️",
    "Hide & pass on ➡️": "Verstecken & weitergeben ➡️",
    "🗣️ Talk it out": "🗣️ Diskutiert!",
    "Reveal the imposter 🔦": "Imposter enthüllen 🔦",
    " was the imposter!": " war der Imposter!",
    " were the imposters!": " waren die Imposter!",
    "The word was: ": "Das Wort war: ",
    "We caught {pronoun} 🎯": "Erwischt 🎯",
    "They fooled us 🤡": "Wir wurden reingelegt 🤡",
    "🎯 Caught!": "🎯 Erwischt!",
    "🤡 Fooled!": "🤡 Reingelegt!",
    "The table wins — ": "Der Tisch gewinnt — ",
    "got busted!": "wurde erwischt!",
    "got away with it — imposter wins!": "kam davon — Imposter gewinnt!",
    "got away with it — imposters win!": "kamen davon — Imposter gewinnen!",
    "Did the table catch them?": "Erwischt?",
    "Did the table catch them all?": "Alle erwischt?",
    "New round 🔁": "Neue Runde 🔁",

    // ── Wavelength ─────────────────────────────────────────────────────────
    "Spectrum pool": "Spektrum-Kategorie",
    "Start round 🎯": "Runde starten 🎯",
    "Clue-giver only": "Nur für den Tipp-Geber",
    "Show me the target 🎯": "Zeig mir das Ziel 🎯",
    "Give a clue!": "Gib einen Tipp!",
    "Hide & let them guess 🤐": "Verstecken & raten lassen 🤐",
    "Where is it?": "Wo ist es?",
    "Lock it in 🔒": "Festlegen 🔒",
    "BULLSEYE!": "VOLLTREFFER!",
    "So close!": "Fast!",
    "Way off!": "Danebengegriffen!",
    "The clue-giver's a legend — ": "Der Tipgeber ist eine Legende — ",
    "Decent reading — ": "Gute Einschätzung — ",
    "Total miss — ": "Komplett daneben — ",
    " points!": " Punkte!",
    " points.": " Punkte.",

    // ── NHIE ───────────────────────────────────────────────────────────────
    "Never have I ever…": "Ich habe noch nie…",
    "Done it? Drink! 🍺": "Getan? Trinken! 🍺",
    "Done it? Own up 🙋": "Getan? Bekennen! 🙋",

    // ── Most Likely ────────────────────────────────────────────────────────
    "Most likely to…": "Am wahrscheinlichsten…",
    "3… 2… 1… POINT! 🫵": "3… 2… 1… ZEIGEN! 🫵",
    "Most fingers drinks 🍺": "Die meisten Finger trinken 🍺",
    "Most fingers takes the crown 👑": "Die meisten Finger gewinnen die Krone 👑",

    // ── Liars Numbers ──────────────────────────────────────────────────────
    "Question pool": "Fragen-Kategorie",
    "Start round ▶️": "Runde starten ▶️",
    "Your number": "Deine Zahl",
    "Answer: ": "Antwort: ",
    "nailed it!": "perfekt getroffen!",
    "was furthest — drink!": "lag am weitesten daneben — trinken!",
    "was furthest off.": "lag am weitesten daneben.",

    // ── Princess ───────────────────────────────────────────────────────────
    "For the girls": "Für die Mädels",
    "For the guys": "Für die Jungs",
    "Princess treatment, or bare minimum?": "Prinzessinnen-Behandlung oder Minimum?",
    "King treatment, or bare minimum?": "König-Behandlung oder Minimum?",
    "👑 Princess treatment": "👑 Prinzessinnen-Behandlung",
    "🤴 King treatment": "🤴 König-Behandlung",
    "😐 Bare minimum": "😐 Minimum",

    // ── Doodle Drama ───────────────────────────────────────────────────────
    "Chain order ({n}): {names}": "Kettenreihenfolge ({n}): {names}",
    "No peeking — {name} is about to {task}.": "Nicht gucken — {name} ist dran.",
    "draw": "zeichnen",
    "guess": "raten",
    "I'm {name} — go": "Ich bin {name} — los",
    "Draw: ": "Zeichne: ",
    "Clear 🧹": "Löschen 🧹",
    "Done ✅": "Fertig ✅",
    "What is this?": "Was ist das?",
    "Your guess…": "Dein Tipp…",
    "Lock guess 🔒": "Tipp abschicken 🔒",
    "⚠ Needs at least {n} players. Add them from the header (👥).": "⚠ Mindestens {n} Spieler nötig. Oben (👥) hinzufügen.",
    "{name} drew:": "{name} zeichnete:",
    "{name} guessed:": "{name} erriet:",
    "From {a} to {b}.": "Von {a} zu {b}.",
    "🎉 The chain survived!": "🎉 Die Kette hat überlebt!",
    "The chain 🎨": "Die Kette 🎨",
    "New chain 🔁": "Neue Kette 🔁",

    // ── Activity ───────────────────────────────────────────────────────────
    "Explain": "Erklären",
    "Draw": "Zeichnen",
    "Charade": "Pantomime",
    "Explain it — no gestures, don't say the word": "Erklären — keine Gesten, nicht sagen!",
    "Draw it — no words or letters": "Zeichnen — keine Wörter oder Buchstaben",
    "Act it out — no talking, no sounds": "Nachspielen — kein Reden, keine Geräusche",
    "🍻 Drinking mode (fail → you drink, win → they drink)": "🍻 Trinkspiel",
    "Start game ▶️": "Spiel starten ▶️",
    "tap figure to change": "tippen zum Wechseln",
    "'s turn": " ist dran",
    "Pick how risky:": "Wie riskant?",
    "points": "Punkte",
    "Missed ❌": "Falsch ❌",
    "Guessed ✅": "Erraten ✅",
    "Show the word 👀": "Wort anzeigen 👀",
    "Only the drawer looks. Memorise it — then draw it for your team.": "Nur der Zeichner schaut. Merken — dann für dein Team zeichnen.",
    "One of you performs, the rest guess. Tap to see the word — don't show your team!": "Einer führt vor, die anderen raten. Tippe, um das Wort zu sehen — zeig es nicht!",
    "performer only": "führt vor",
    "moves {n} forward.": "rückt {n} vor.",
    "stays put.": "bleibt stehen.",
    "The word was {word}.": "Das Wort war {word}.",
    "drinks!": "trinkt!",
    "Start drawing 🖌️": "Zeichnen starten 🖌️",
    "Next team ▶️": "Nächstes Team ▶️",
    "completed the map first!": "hat die Karte als Erstes geschafft!",
    "Change teams": "Teams wechseln",
    "🔀 Shuffle teams": "🔀 Teams mischen",

    // ── Quiz Out ───────────────────────────────────────────────────────────
    "Hearts each": "Herzen pro Spieler",
    "Start quiz ▶️": "Quiz starten ▶️",
    "Round {n}": "Runde {n}",
    "Difficulty: {level}": "Schwierigkeit: {level}",
    " left in the game": " noch dabei",
    "Correct!": "Richtig!",
    "Wrong!": "Falsch!",
    "Safe — well played.": "Sicher — gut gespielt.",
    "Answer: {answer}. −1 heart.": "Antwort: {answer}. −1 Herz.",
    "Answer: {answer}. 💀 {name} is out!": "Antwort: {answer}. 💀 {name} ist raus!",
    " is OUT!": " ist RAUS!",
    "Last one standing — quiz champion!": "Letzter Überlebender — Quiz-Champion!",
    "Everyone's out!": "Alle sind raus!",
    "Play again 🔁": "Nochmal spielen 🔁",
    "Warm-up": "Warm-Up",
    "Easy": "Leicht",
    "Medium": "Mittel",
    "Hard": "Schwer",
    "Brutal": "Brutal",
    "Insane": "Wahnsinn",
    "Level ": "Level ",

    // ── Truth or Drink ─────────────────────────────────────────────────────
    "🍻 Drinking mode (dodge by drinking)": "🍻 Trinkspiel (Trinken = Ausweichen)",
    "Answer honestly, or take a 🍺 drink to dodge.": "Ehrlich antworten oder 🍺 trinken.",
    "Answer honestly!": "Ehrlich antworten!",

    // ── Chooser ────────────────────────────────────────────────────────────
    "SPIN 🎯": "DREHEN 🎯",
    "SPIN AGAIN 🎯": "NOCHMAL DREHEN 🎯",
    "⚠ Add some players from the header (👥) to spin.": "⚠ Füge oben Spieler hinzu (👥).",

    // ── Reaction Duel ──────────────────────────────────────────────────────
    "Match length": "Spiel bis",
    "First to {n}": "Zuerst bei {n}",
    "🍻 Drinking mode (loser drinks)": "🍻 Trinkspiel (Verlierer trinkt)",
    "Start duel ▶️": "Duell starten ▶️",
    "Lay the phone flat between two players. Each owns one half of the screen.": "Handy flach zwischen zwei Spieler legen. Jeder hat eine Hälfte.",
    "tap to change": "tippen zum Wechseln",
    "Get ready…": "Bereit machen…",
    "Wait…": "Warten…",
    "Wait for 🟢 GREEN — then TAP!": "Warte auf 🟢 GRÜN — dann TIPPEN!",
    "TAP on GREEN — don't fall for the fakes! 🪤": "Tippe GRÜN — nicht reinfallen! 🪤",
    "TAP only when it turns 🟢 GREEN": "Nur tippen wenn es 🟢 GRÜN wird",
    "TAP only the 💣": "Nur die 💣 tippen",
    "jumped the gun! 🏁": "zu früh gedrückt! 🏁",
    "took the bait! 🪤": "reingefallen! 🪤",
    "tapped the wrong colour! 🎨": "falsche Farbe! 🎨",
    "tapped the wrong thing! ❌": "falsches Symbol! ❌",
    "too slow! 🐢": "zu langsam! 🐢",
    " wins the round!": " gewinnt die Runde!",
    "Next round ▶️": "Nächste Runde ▶️",
    "Change players": "Spieler wechseln",
    "🔀 Shuffle players": "🔀 Spieler mischen",
    "GO? 🤔": "LOS? 🤔",
    "✋ STOP": "✋ STOP",
    "almost…": "fast…",
    "NOW? 👀": "JETZT? 👀",

    // ── Rank It ────────────────────────────────────────────────────────────
    "Build your ranking in private — don't let the others copy.": "Bau dein Ranking heimlich — keiner darf abschauen.",
    "{name}'s ranking": "{name}s Ranking",
    "Tap the items in order — top of the list first.": "Tippe die Dinge der Reihe nach an — Platz 1 zuerst.",
    "Nothing picked yet.": "Noch nichts gewählt.",
    "↺ Reset": "↺ Zurücksetzen",
    "Players ({n}): {names}": "Spieler ({n}): {names}",
    "The group has spoken": "Der Schwarm hat entschieden",
    "A perfect match — the whole table agrees! 🤝": "Perfekte Übereinstimmung — der ganze Tisch ist sich einig! 🤝",
    "is the most in sync.": "liegt am nächsten am Schwarm.",
    "drifted furthest — drink!": "wich am weitesten ab — trinken!",
    "drifted furthest.": "wich am weitesten ab.",
    "Who drifted?": "Wer weicht ab?",
    "off by {n}": "{n} daneben",

    // ── Meme Maker ─────────────────────────────────────────────────────────
    "Write your caption in private — keep it secret.": "Schreib deinen Spruch heimlich — nicht zeigen.",
    "I'm {name} — write": "Ich bin {name} — schreiben",
    "{name}'s caption": "{name}s Spruch",
    "Your caption…": "Dein Spruch…",
    "Vote for the funniest 🏆": "Wählt den lustigsten 🏆",
    "Tap the caption the table loves most.": "Tippt den Spruch, den der Tisch am besten findet.",
    "{name} wins the round! 🏆": "{name} gewinnt die Runde! 🏆",
    "Scoreboard": "Punktestand",

    // ── In-game UI: raw strings localised across games ─────────────────────
    // Who Am I?
    "No sticky notes handy? Type a character for your mate, hand them the phone, and they hold it to their forehead while you give clues.": "Keine Zettel zur Hand? Tipp einen Begriff für deinen Kumpel ein, gib ihm das Handy, und er hält es sich an die Stirn, während du Tipps gibst.",
    "Type a character / thing…": "Tipp eine Person / Sache ein…",
    "Show on sticky note 🪧": "Auf Zettel zeigen 🪧",
    "Hold the phone to your forehead so you can't see it. The table shouts clues. Tap": "Halt dir das Handy an die Stirn, sodass du es nicht sehen kannst. Die Runde ruft Tipps. Tippe",
    "when you guess,": "wenn du es errätst,",
    "to pass.": "zum Überspringen.",
    "Forehead time! Others give clues.": "Stirn-Zeit! Die anderen geben Tipps.",
    // Imposter
    "them all": "alle",
    "them": "ihn/sie",
    "Go round the table. Each person says <strong>one word</strong> hinting at the secret. The imposter is faking it. After a round or two, <strong>vote</strong> on who the faker is.": "Geht reihum. Jeder sagt <strong>ein Wort</strong>, das auf das geheime Wort anspielt. Der Imposter tut nur so. Nach ein, zwei Runden <strong>stimmt ab</strong>, wer der Faker ist.",
    // The Bomb
    "⚠ The Bomb is best with {n}+ players. Add more from the header.": "⚠ Die Bombe ist am besten mit {n}+ Spielern. Oben (👥) mehr hinzufügen.",
    "Name something. Anything. Go!": "Nenn irgendwas. Egal was. Los!",
    // Wavelength
    "One player sees a hidden spot on the dial and gives a one-line clue between the two ends. Everyone else slides to their guess. Closest = glory, way off = drinks.": "Ein Spieler sieht einen versteckten Punkt auf dem Dial und gibt einen Ein-Satz-Tipp zwischen den beiden Enden. Alle anderen schieben den Regler zu ihrem Tipp. Volltreffer = Ruhm, voll daneben = saufen.",
    "Everyone else: look away! One person picks up the phone to see the secret target.": "Alle anderen: weggucken! Einer schnappt sich das Handy, um das geheime Ziel zu sehen.",
    "Think of a clue between the two ends that points right at the band — then hide and let the table guess.": "Überleg dir einen Tipp zwischen den beiden Enden, der genau auf das Band zeigt — dann versteck es und lass den Tisch raten.",
    // Princess Treatment
    "Each round flips between 👑 Princess (for the girls) and 🤴 King (for the guys). Read the prompt, then the table calls it.": "Jede Runde wechselt zwischen 👑 Prinzessin (für die Mädels) und 🤴 König (für die Jungs). Lest den Spruch vor, dann entscheidet der Tisch.",
    "Make one up!": "Denk dir was aus!",
    "👑 PRINCESS": "👑 PRINZESSIN",
    "🤴 KING": "🤴 KÖNIG",
    // Liar's Numbers
    "Lock your guess in private — don't let the others copy.": "Tippe deine Zahl heimlich ein — keiner darf abschauen.",
    "{name}'s guess": "{name}s Tipp",
    "(off {n})": "({n} daneben)",
    "Pick a number 1–100": "Wähle eine Zahl von 1–100",
    // Activity
    "VS": "VS",
    "Team A": "Team A",
    "Team B": "Team B",
    "No move": "Kein Zug",
    "{n} pts": "{n} Pkt.",
    // Quiz Out
    " 🍺 Drink!": " 🍺 Trinken!",
    "Game over": "Spiel vorbei",
    "🍻 drink": "🍻 Trinken",
    // Truth or Drink
    "Whoever drew it": "Wer sie gezogen hat",

    // ── Hochadel (English keys; German values) ─────────────────────────────
    "Choose Edition": "Edition wählen",
    "The Rapunzel Edition is coming soon. 👸": "Die Rapunzel-Edition ist bald verfügbar. 👸",
    "Seating Order": "Sitzordnung",
    "Players take turns drawing. Shuffle if you like.": "Reihum wird gezogen. Verschiebe per Zufall, wenn du magst.",
    "🔀 Shuffle order": "🔀 Reihenfolge mischen",
    "Continue ▶️": "Weiter ▶️",
    "← Choose Edition": "← Edition wählen",
    "The court needs at least 2 players. Add them using the roster (top right).": "Der Hof braucht mindestens 2 Anwesende. Tippe oben rechts auf die Spielerzahl.",
    "⚜️ Ground Rules": "⚜️ Grundgesetze des Hofes",
    "These rules apply for the whole game — independent of the deck.": "Diese zwei Regeln gelten die ganze Runde — unabhängig vom Deck.",
    "To the Table ▶️": "An die Tafel ▶️",
    "Current player": "Am Zug",
    "Draw card": "Karte ziehen",
    " in deck": " im Stapel",
    "📜 Standing Rules": "📜 Hofgesetze",
    "🪙 Active Cards": "🪙 Aktive Karten",
    "No standing rules yet.": "Noch keine Hofgesetze.",
    "No active cards. Gold cards stay face-up with their holder.": "Keine aktiven Karten. Gold-Karten liegen offen vor ihrem Halter.",
    "Tap to activate ⚡": "Tippen zum Auslösen ⚡",
    "↺ Reset game": "↺ Spiel zurücksetzen",
    "Instant Action": "Sofort-Aktion",
    "Passive / Rule": "Passiv / Regel",
    "Active Card": "Aktive Karte",
    "Mini-game": "Minispiel",
    "Crimson": "Karmesin",
    "Sapphire": "Saphir",
    "Gold": "Gold",
    "Purple": "Purpur",
    " draws …": " zieht …",
    "Done ✓": "Erledigt ✓",
    "Add as standing rule ✓": "Als Hofgesetz eintragen ✓",
    "Assign to {name} 👑": "An {name} vergeben 👑",
    "Loser drinks ✓": "Verlierer dient ✓",
    "Deck at Rest": "Das Deck ruht",
    "All cards are in play (Standing Rules & Active Cards). Reset for a fresh round.": "Alle Karten sind im Spiel (Hofgesetze & aktive Karten). Zurücksetzen für eine frische Runde.",
    "Back to Table": "Zur Tafel",
    "Reset game?": "Spiel zurücksetzen?",
    "Standing rules and active cards will be lost; the deck gets reshuffled. Edition and seating order stay.": "Hofgesetze und aktive Karten gehen verloren, das Deck wird neu gemischt. Edition und Sitzordnung bleiben.",
    "Yes, reset": "Ja, zurücksetzen",
    "Cancel": "Abbrechen",
    "⌛ The Timer": "⌛ Die Sanduhr",
    "Secretly set a time limit. When it runs out, whoever is speaking drinks. Don't let others watch.": "Setze heimlich eine Frist. Läuft sie ab, dient, wer gerade spricht. Die anderen sollen nicht zusehen.",
    "Custom time (sec.):": "Eigene Frist (Sek.):",
    "e.g. 90": "z. B. 90",
    "Start secretly 🤫": "Heimlich starten 🤫",
    "Time's up!": "Die Sanduhr ist abgelaufen!",
    "Whoever is speaking drinks!": "Wer gerade spricht, dient!",
    "Got it": "Verstanden",
    "the drawer": "den Zieher",
    "the holder": "den Halter",
  };

  function getLang() {
    return global.Spielecke.Store.appGet(LANG_KEY, DEFAULT_LANG) || DEFAULT_LANG;
  }

  function setLang(lang) {
    global.Spielecke.Store.appSet(LANG_KEY, lang === "en" ? "en" : "de");
  }

  function t(key) {
    var lang = getLang();
    if (lang === "en") return key;
    return (DE.hasOwnProperty(key) ? DE[key] : key);
  }

  // Pick the current language's subtree from a bilingual content bundle shaped
  // { de: <content>, en: <content> }. Games wrap their top-level content read in
  // L(...) and everything underneath stays plain strings, so module logic that
  // walks .label / .prompts / .items / .q etc. is unchanged. Falls back across
  // languages, and returns the value untouched if it isn't a bundle (so a plain
  // English content file keeps working until it's converted).
  function L(bundle) {
    if (!bundle || typeof bundle !== "object") return bundle;
    if (!bundle.de && !bundle.en) return bundle; // not a {de,en} bundle
    var lang = getLang();
    return bundle[lang] || bundle.en || bundle.de;
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.t = t;
  global.Spielecke.L = L;
  global.Spielecke.getLang = getLang;
  global.Spielecke.setLang = setLang;
})(window);
