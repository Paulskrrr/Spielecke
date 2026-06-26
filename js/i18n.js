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
    // Liar's Numbers: name + tagline intentionally have NO German entry, so t()
    // falls back to the English key — this game always shows as "Liar's Numbers".
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

    // ── Common ─────────────────────────────────────────────────────────────
    "Back to shelf": "Zur Spielecke",
    "Change settings": "Einstellungen",
    "Next round 🔁": "Nächste Runde 🔁",
    "Next player ▶️": "Nächster Spieler ▶️",
    "New round 🔁": "Neue Runde 🔁",
    "Start ▶️": "Start ▶️",
    "Next ▶️": "Weiter ▶️",
    "👆 Tap for the next": "👆 Tippen für die nächste",
    "👆 Tap to spin": "👆 Tippen zum Drehen",
    "👆 Tap to spin again": "👆 Tippen zum erneut Drehen",
    "👆 Tap the card to continue": "👆 Karte tippen für weiter",
    "Category": "Kategorie",
    "Categories": "Kategorien",
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
    "Random": "Zufällig",
    "🎲 Random leans toward fewer imposters — big groups stay tense.": "🎲 Zufällig wählt eher wenige Imposter — auch große Runden bleiben spannend.",
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

    // ── Wavelength ─────────────────────────────────────────────────────────
    "Spectrum pool": "Spektrum-Kategorie",
    "Start round 🎯": "Runde starten 🎯",
    "Clue-giver only": "Nur für den Tipp-Geber",
    "Show me the target 🎯": "Zeig mir das Ziel 🎯",
    "{name} sets the wavelength": "{name} gibt die Wavelength vor",
    "I'm {name} — show the target 🎯": "Ich bin {name} — Ziel zeigen 🎯",
    "Read the clue, then place your line where you think the target is.": "Lies den Tipp und platzier deine Linie da, wo du das Ziel vermutest.",
    "Give a clue!": "Gib einen Tipp!",
    "Your clue…": "Dein Tipp…",
    "The clue": "Der Tipp",
    "{name}'s clue": "Tipp von {name}",
    "Hide & let them guess 🤐": "Verstecken & raten lassen 🤐",
    "Where is it?": "Wo ist es?",
    "On the wavelength": "Auf einer Wellenlänge",
    "landed closest!": "war am nächsten dran!",
    "Lock it in 🔒": "Festlegen 🔒",
    "BULLSEYE!": "VOLLTREFFER!",
    "So close!": "Fast!",
    "On the board!": "Auf dem Brett!",
    "Way off!": "Danebengegriffen!",
    "The clue-giver's a legend — ": "Der Tipgeber ist eine Legende — ",
    "Great read — ": "Starke Einschätzung — ",
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
    "Tap a player to pick their team": "Tippe einen Spieler an, um sein Team zu wählen",
    "Add players on the Players screen to set up teams.": "Füge auf dem Spieler-Bildschirm Spieler hinzu, um Teams zu bilden.",
    "no players yet": "noch keine Spieler",
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
    "Wait for 🟢, then TAP!": "Warte auf 🟢, dann TIPPEN!",
    "TAP 🟢 — ignore the fakes! 🪤": "Tippe 🟢 — ignorier die Fakes! 🪤",
    "TAP only on 🟢": "Nur auf 🟢 tippen",
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
    "Drag the items into order — the top is your #1.": "Zieh die Dinge in deine Reihenfolge — ganz oben ist dein Platz 1.",
    "🔀 Shuffle": "🔀 Mischen",
    "Top": "Oben",
    "Bottom": "Unten",
    "Players ({n}): {names}": "Spieler ({n}): {names}",
    "The group has spoken": "Der Schwarm hat entschieden",
    "A perfect match — the whole table agrees! 🤝": "Perfekte Übereinstimmung — der ganze Tisch ist sich einig! 🤝",
    "is the most in sync.": "liegt am nächsten am Schwarm.",
    "drifted furthest — drink!": "wich am weitesten ab — trinken!",
    "drifted furthest.": "wich am weitesten ab.",
    "Who drifted?": "Wer weicht ab?",
    "off by {n}": "{n} daneben",
    "🔍 Compare rankings": "🔍 Rankings vergleichen",
    "Group #{n}": "Schwarm #{n}",
    "← Back to results": "← Zurück zum Ergebnis",

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
    "One player is picked to set the wavelength and write a clue. Everyone else then places their line one by one. Closest to the hidden target wins the round.": "Ein Spieler wird ausgelost, gibt die Wavelength vor und schreibt einen Tipp. Alle anderen platzieren danach nacheinander ihre Linie. Wer am nächsten am versteckten Ziel ist, gewinnt die Runde.",
    "Pass the phone to {name}. Everyone else: look away while they peek at the target and write the clue.": "Gib das Handy an {name}. Alle anderen: wegschauen, während er/sie das Ziel ansieht und den Tipp schreibt.",
    "Everyone else: look away! One person picks up the phone to see the secret target.": "Alle anderen: weggucken! Einer schnappt sich das Handy, um das geheime Ziel zu sehen.",
    "Write a clue between the two ends that points right at the band — the others only see your clue, not the target.": "Schreib einen Tipp zwischen den beiden Enden, der genau auf das Band zeigt — die anderen sehen nur deinen Tipp, nicht das Ziel.",
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
    "Players take turns drawing. Drag the names to reorder, or shuffle.": "Reihum wird gezogen. Zieh die Namen in deine Reihenfolge oder mische.",
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
    "🪙 Trumps": "🪙 Trümpfe",
    "No standing rules yet.": "Noch keine Hofgesetze.",
    "No Trumps yet. Gold cards stay face-up with their holder.": "Noch keine Trümpfe. Gold-Karten liegen offen vor ihrem Halter.",
    "Tap to activate ⚡": "Tippen zum Auslösen ⚡",
    "↺ Reset game": "↺ Spiel zurücksetzen",
    "Instant Action": "Sofort-Aktion",
    "Passive / Rule": "Passiv / Regel",
    "Trump": "Trumpf",
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
    "All cards are in play (Standing Rules & Trumps). Reset for a fresh round.": "Alle Karten sind im Spiel (Hofgesetze & Trümpfe). Zurücksetzen für eine frische Runde.",
    "Back to Table": "Zur Tafel",
    "Reset game?": "Spiel zurücksetzen?",
    "Standing rules and Trumps will be lost; the deck gets reshuffled. Edition and seating order stay.": "Hofgesetze und Trümpfe gehen verloren, das Deck wird neu gemischt. Edition und Sitzordnung bleiben.",
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

    // ── Kartenklassiker: shared ────────────────────────────────────────────
    "trinkt": "trinkt",
    "sip": "Schluck",
    "sips": "Schlücke",

    // ── Ride the Bus (Busfahrt) ────────────────────────────────────────────
    "Ride the Bus": "Die Busfahrt",
    "Four guesses to escape. One slip and you're back on board.": "Vier Tipps zur Flucht. Ein Patzer und du sitzt wieder im Bus.",
    "the driver": "den Busfahrer",
    "Busfahrer": "Busfahrer",
    "No players yet — add some from the header (👥) to rotate the Busfahrer, or just pass the laptop.": "Noch keine Spieler — oben (👥) welche hinzufügen, um den Busfahrer reihum zu wechseln, oder einfach den Laptop weiterreichen.",
    "House rules": "Hausregeln",
    "Tie counts as wrong (steps 2 & 3)": "Gleichstand zählt als falsch (Stufen 2 & 3)",
    "On escape the driver hands out the sips": "Bei Flucht verteilt der Busfahrer die Schlücke",
    "Board the bus 🚌": "Einsteigen 🚌",
    "Step": "Stufe",
    "Step 1 — Farbe: Rot oder Schwarz?": "Stufe 1 — Farbe: Rot oder Schwarz?",
    "Step 2 — Höher oder Tiefer?": "Stufe 2 — Höher oder Tiefer?",
    "Step 3 — Innerhalb oder Außerhalb?": "Stufe 3 — Innerhalb oder Außerhalb?",
    "Step 4 — Welche Farbe genau?": "Stufe 4 — Welche Farbe genau?",
    "Wrong! ❌": "Falsch! ❌",
    "Back to the start of the row.": "Zurück zum Anfang der Reihe.",
    "New row 🔁": "Neue Reihe 🔁",
    "Escaped the bus!": "Dem Bus entkommen!",
    "cleared all four — hand out the sips you collected!": "alle vier geschafft — verteile die gesammelten Schlücke!",
    "cleared all four — no drinks. The bus rolls on.": "alle vier geschafft — keine Schlücke. Der Bus rollt weiter.",
    "Next Busfahrer ▶️": "Nächster Busfahrer ▶️",
    "Same driver, ride again 🔁": "Gleicher Fahrer, neue Fahrt 🔁",

    // ── Fuck the Dealer ────────────────────────────────────────────────────
    "Guess the card. Miss twice and you drink — nail it and the dealer does.": "Karte raten. Zweimal daneben und du trinkst — triffst du, trinkt der Dealer.",
    "the dealer": "den Dealer",
    "the guesser": "den Ratenden",
    "⚠ Add at least 2 players from the header (👥): one dealer, the rest guess.": "⚠ Oben (👥) mindestens 2 Spieler hinzufügen: einer ist Dealer, der Rest rät.",
    "Dealer": "Dealer",
    "Punishment for a double miss": "Strafe für zweimal daneben",
    "Rank gap = sips": "Rang-Differenz = Schlücke",
    "Flat": "Pauschal",
    "Right guess → dealer trinkt {n} sips.": "Richtig → Dealer trinkt {n} Schlücke.",
    "Dealer passes left after the deck empties twice.": "Der Dealer wechselt nach links, wenn das Deck zweimal leer ist.",
    "Deal 🃏": "Geben 🃏",
    "Deck emptied twice!": "Deck zweimal leer!",
    "The deck passes left. New dealer:": "Das Deck wandert nach links. Neuer Dealer:",
    "left": "übrig",
    "call a rank": "nenne einen Rang",
    "second guess!": "zweiter Versuch!",
    "Guesser:": "Ratender:",
    "Dealer says:": "Dealer sagt:",
    "⬆️ Höher!": "⬆️ Höher!",
    "⬇️ Tiefer!": "⬇️ Tiefer!",
    "than {r}": "als {r}",
    "Spot on!": "Volltreffer!",
    "It was": "Es war",
    "Next card ▶️": "Nächste Karte ▶️",
    "Cards drawn": "Gezogene Karten",
    "No cards drawn yet — the pile builds up here.": "Noch keine Karten gezogen — hier wächst der Stapel.",

    // ── Horse Race (Pferderennen) ──────────────────────────────────────────
    "Horse Race": "Das Pferderennen",
    "Bet on a suit. Cheer your horse. The losers drink.": "Wette auf eine Farbe. Feuer dein Pferd an. Die Verlierer trinken.",
    "No players — add some from the header (👥) to place bets, or just watch the race.": "Keine Spieler — oben (👥) welche hinzufügen, um zu wetten, oder einfach zuschauen.",
    "Place your bets": "Platziert eure Wetten",
    "Race speed": "Renntempo",
    "Slow": "Langsam",
    "Normal": "Normal",
    "Fast": "Schnell",
    "Loss penalty": "Verlierer-Strafe",
    "Lengths behind": "Längen zurück",
    "To the start line 🏁": "An die Startlinie 🏁",
    "They're at the gate… 🏁": "Sie stehen am Gatter… 🏁",
    "cards in the pile": "Karten im Stapel",
    "Pause": "Pause",
    "Skip to finish": "Zum Ziel springen",
    "And… they're off! 🏇": "Und… los geht's! 🏇",
    "Resume ▶️": "Weiter ▶️",
    "Hurdle! {s} stumbles and drops back!": "Hürde! {s} strauchelt und fällt zurück!",
    "{s} takes the lead!": "{s} übernimmt die Führung!",
    "Down the home stretch!": "Auf der Zielgeraden!",
    "And they're racing…": "Und sie galoppieren…",
    "verteilt Schlücke! 🎉": "verteilt Schlücke! 🎉",
    "No bets this race — just glory.": "Keine Wetten — nur Ehre.",
    "New bets 🎲": "Neue Wetten 🎲",

    // ── Mäxchen / Mia ──────────────────────────────────────────────────────
    "Mia": "Mäxchen",
    "Two dice under the hat. Talk it up or bluff — then someone lifts.":
      "Zwei Würfel unterm Hut. Ansagen oder bluffen — bis einer aufdeckt.",
    "How does it work?": "Wie geht's?",
    "Tap the hat to roll the two dice in secret, then announce a value out loud — HIGHER than the player before you, truth or bluff. Pass the phone on. The next player either rolls again, or lifts the hat to call the bluff. Once it's lifted the round is over — the table sees the dice and knows who lied. Ranking: 31…65, then doubles, then Mäxchen (21) on top.":
      "Tipp auf den Hut und würfle die zwei Würfel heimlich, dann sage einen Wert laut an — HÖHER als dein Vorgänger, wahr oder geblufft. Gib das Handy weiter. Der Nächste würfelt entweder erneut oder hebt den Hut zum Aufdecken. Sobald aufgedeckt ist, ist die Runde vorbei — alle sehen die Würfel und wissen, wer gelogen hat. Reihenfolge: 31…65, dann Päsche, dann Mäxchen (21) ganz oben.",
    "Let's go ▶️": "Los geht's ▶️",
    "Roll the dice": "Würfeln",
    "Tap the hat to roll — keep the screen to yourself": "Tipp auf den Hut — Bildschirm für dich behalten",
    "You open the round — roll the dice.": "Du eröffnest die Runde — würfle.",
    "Lift the hat 👀": "Aufdecken 👀",
    "Your roll (secret)": "Dein Wurf (geheim)",
    "Announce it out loud — then pass the hat on.": "Sag laut an — dann den Hut weitergeben.",
    "Pass it on 🎩": "Weitergeben 🎩",
    "Hat lifted!": "Aufgedeckt!",
    "Whoever was wrong drinks!": "Wer falsch lag, trinkt!",
    "Mäxchen": "Mäxchen",
    "Pasch": "Pasch",
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
