/*
 * content/wettbuero.js — challenge deck for "Wettbüro" (adults only, 18+)
 *
 * EDIT ME. Pure content, no game logic. Wettbüro is a betting game: one player
 * (the candidate) draws a challenge and attempts it, while everyone else bets
 * drinks on whether they'll pull it off. So every challenge must be:
 *   - doable in any living room with NO props beyond drinks and phones,
 *   - JUDGEABLE by the table — a clear win or a clear fail, no grey zone.
 *
 * BILINGUAL: WETTBUERO is a { de, en } bundle with identical pool keys
 * (kopf, geschick, mut, nsfw). German is the source voice; English mirrors it.
 *
 * Each challenge is { text, timer? }. `timer` (seconds) is OPTIONAL — set it
 * only for challenges that are inherently timed/speed-based; leave it off for
 * ones judged purely on success/fail with no clock. Add a key and it shows up
 * automatically; `label` is what players see, the key is the internal id.
 */
(function (global) {
  "use strict";

  var WETTBUERO = {
    de: {
      kopf: {
        label: "🧠 Kopf",
        challenges: [
          { text: "Nenne in 20 Sekunden acht Biermarken", timer: 20 },
          { text: "Zähle von 30 in Dreierschritten rückwärts – ohne Fehler", timer: 15 },
          { text: "Sag das Alphabet rückwärts von Z bis A", timer: 30 },
          { text: "Nenne in 15 Sekunden fünf Länder, die mit B anfangen", timer: 15 },
          { text: "Nenne in 20 Sekunden zehn Automarken", timer: 20 },
          { text: "Zähle laut bis 20, ersetze aber jede Zahl mit einer 3 durch \"Prost\"", timer: 25 },
          { text: "Nenne rückwärts die Wochentage von Sonntag bis Montag", timer: 15 },
          { text: "Nenne in 20 Sekunden acht Dinge, die man im Kühlschrank findet", timer: 20 },
          { text: "Nenne in 15 Sekunden sieben gelbe Dinge", timer: 15 },
          { text: "Buchstabiere \"Schifffahrtsgesellschaft\" – ohne Fehler" },
          { text: "Rechne 17 mal 6 im Kopf – richtiges Ergebnis, sonst verloren" },
          { text: "Nenne in 20 Sekunden acht berühmte Persönlichkeiten", timer: 20 },
          { text: "Sag fünf Wörter, die sich auf \"Bier\" reimen" },
          { text: "Nenne die Hauptstädte von fünf Nachbarländern Deutschlands – ohne Handy" },
        ],
      },

      geschick: {
        label: "🎯 Geschick",
        challenges: [
          { text: "Balanciere 10 Sekunden lang einen Löffel auf deiner Nase", timer: 10 },
          { text: "Baue in 30 Sekunden einen Turm aus fünf leeren Gläsern oder Dosen", timer: 30 },
          { text: "Jongliere 10 Sekunden mit zwei Handys oder Bällen, ohne sie fallen zu lassen", timer: 10 },
          { text: "Halte 30 Sekunden die Plank-Position", timer: 30 },
          { text: "Balanciere 15 Sekunden auf einem Bein mit geschlossenen Augen", timer: 15 },
          { text: "Halte dein volles Glas 45 Sekunden mit ausgestrecktem Arm – ohne dass etwas überschwappt", timer: 45 },
          { text: "Dreh dich zehnmal im Kreis und lauf danach in 10 Sekunden zur Tür und zurück", timer: 10 },
          { text: "Fang in 20 Sekunden fünf Chips oder Erdnüsse mit dem Mund, die dir jemand zuwirft", timer: 20 },
          { text: "Wirf einen Kronkorken in ein Glas – 3 Versuche" },
          { text: "Balanciere ein volles Glas auf deinem Handrücken und trink daraus – ohne die andere Hand" },
          { text: "Schnipp eine Münze in die Luft und fang sie mit derselben Hand – 3 Versuche" },
          { text: "Wirf einen Kronkorken hoch und fang ihn hinter deinem Rücken – 3 Versuche" },
          { text: "Roll eine Münze einmal komplett über deine Fingerknöchel" },
          { text: "Reib dir mit einer Hand den Bauch und klopf dir gleichzeitig mit der anderen auf den Kopf – 15 Sekunden ohne Vertauschen", timer: 15 },
        ],
      },

      mut: {
        label: "🎭 Mut",
        challenges: [
          { text: "Überzeuge den Tisch in 20 Sekunden, warum DU der attraktivste Mensch hier bist – ohne zu lachen", timer: 20 },
          { text: "Sing 15 Sekunden lang ein Kinderlied, als wäre es ein Liebeslied", timer: 15 },
          { text: "Halte 30 Sekunden Blickkontakt mit der Person links von dir – ohne zu lachen", timer: 30 },
          { text: "Sprich 30 Sekunden lang in einem erfundenen Akzent, ohne rauszufallen", timer: 30 },
          { text: "Tanze 15 Sekunden ohne Musik, als wäre es die beste Party deines Lebens", timer: 15 },
          { text: "Erzähl 20 Sekunden lang begeistert von etwas völlig Langweiligem, zum Beispiel Steckdosen", timer: 20 },
          { text: "Halte eine 20-Sekunden-Dankesrede, als hättest du gerade einen Oscar gewonnen", timer: 20 },
          { text: "Schaff 10 Liegestütze in 20 Sekunden", timer: 20 },
          { text: "Erzähl in 20 Sekunden einen Witz – der Tisch muss mindestens einmal lachen", timer: 20 },
          { text: "Mach die beste Imitation von jemandem am Tisch – die anderen müssen erraten, wen du meinst" },
          { text: "Sing den Refrain deines Lieblingslieds so laut du kannst" },
          { text: "Mach 15 Sekunden lang eine Live-Sportreportage von dem, was gerade am Tisch passiert", timer: 15 },
          { text: "Halte 20 Sekunden eine flammende Rede, warum man dich zum Präsidenten wählen sollte", timer: 20 },
          { text: "Rede eine Minute lang mit deinem Getränk, als wäre es dein bester Freund – ohne Pause" },
        ],
      },

      nsfw: {
        label: "🔞 18+",
        challenges: [
          { text: "Erkläre eine Sexstellung nur mit Handgesten – der Tisch muss sie erraten", timer: 30 },
          { text: "Stöhne 10 Sekunden lang überzeugend wie in einem schlechten Porno", timer: 10 },
          { text: "Mach 20 Sekunden lang deinen besten Lapdance an einem Stuhl", timer: 20 },
          { text: "Flüster der Person rechts 10 Sekunden lang etwas Verführerisches ins Ohr – ohne zu lachen", timer: 10 },
          { text: "Nenne in 20 Sekunden acht Wörter für das männliche Geschlechtsteil", timer: 20 },
          { text: "Simuliere 10 Sekunden lang einen leidenschaftlichen Kuss mit deiner eigenen Hand", timer: 10 },
          { text: "Nenne in 20 Sekunden fünf Orte, an denen du schon mal Sex hattest oder haben würdest", timer: 20 },
          { text: "Verführe die Person gegenüber – nur mit einem Getränk und einem Blick, 15 Sekunden", timer: 15 },
          { text: "Beschreibe 15 Sekunden lang ein Butterbrot, als wäre es das erotischste der Welt", timer: 15 },
          { text: "Beschreibe dein erstes Mal in genau drei Worten" },
          { text: "Beschreibe die letzte Person, mit der du geschlafen hast, in einem Satz – ohne den Namen zu nennen" },
          { text: "Sag den schmutzigsten Satz, der dir einfällt, mit todernstem Gesicht" },
          { text: "Buchstabiere \"Orgasmus\" – aber stöhne jeden einzelnen Buchstaben" },
          { text: "Zeig dem Tisch dein bestes Sexgesicht – und halt es fünf Sekunden durch, ohne zu lachen" },
        ],
      },
    },

    en: {
      kopf: {
        label: "🧠 Brains",
        challenges: [
          { text: "Name eight beer brands in 20 seconds", timer: 20 },
          { text: "Count down from 30 in steps of three – no mistakes", timer: 15 },
          { text: "Say the alphabet backwards from Z to A", timer: 30 },
          { text: "Name five countries starting with B in 15 seconds", timer: 15 },
          { text: "Name ten car brands in 20 seconds", timer: 20 },
          { text: "Count aloud to 20, but replace every number containing a 3 with \"Cheers\"", timer: 25 },
          { text: "Name the days of the week backwards, from Sunday to Monday", timer: 15 },
          { text: "Name eight things you'd find in a fridge in 20 seconds", timer: 20 },
          { text: "Name seven yellow things in 15 seconds", timer: 15 },
          { text: "Spell \"onomatopoeia\" – no mistakes" },
          { text: "Work out 17 times 6 in your head – correct answer or you lose" },
          { text: "Name eight famous people in 20 seconds", timer: 20 },
          { text: "Say five words that rhyme with \"beer\"" },
          { text: "Name the capitals of five countries that border your own – no phone" },
        ],
      },

      geschick: {
        label: "🎯 Skill",
        challenges: [
          { text: "Balance a spoon on your nose for 10 seconds", timer: 10 },
          { text: "Build a tower of five empty glasses or cans in 30 seconds", timer: 30 },
          { text: "Juggle two phones or balls for 10 seconds without dropping them", timer: 10 },
          { text: "Hold a plank for 30 seconds", timer: 30 },
          { text: "Balance on one leg with your eyes closed for 15 seconds", timer: 15 },
          { text: "Hold your full glass at arm's length for 45 seconds — without spilling a drop", timer: 45 },
          { text: "Spin around ten times, then walk to the door and back in 10 seconds", timer: 10 },
          { text: "Catch five chips or peanuts in your mouth in 20 seconds as someone throws them", timer: 20 },
          { text: "Land a bottle cap in a glass – 3 attempts" },
          { text: "Balance a full glass on the back of your hand and drink from it – no other hand" },
          { text: "Flick a coin into the air and catch it with the same hand – 3 attempts" },
          { text: "Throw a bottle cap up and catch it behind your back – 3 attempts" },
          { text: "Roll a coin all the way across your knuckles once" },
          { text: "Rub your belly with one hand while patting your head with the other – 15 seconds without mixing them up", timer: 15 },
        ],
      },

      mut: {
        label: "🎭 Nerve",
        challenges: [
          { text: "Convince the table in 20 seconds why YOU are the most attractive person here – without laughing", timer: 20 },
          { text: "Sing a nursery rhyme for 15 seconds as if it were a love song", timer: 15 },
          { text: "Hold eye contact with the person on your left for 30 seconds – without laughing", timer: 30 },
          { text: "Speak in a made-up accent for 30 seconds without breaking it", timer: 30 },
          { text: "Dance for 15 seconds with no music, like it's the best party of your life", timer: 15 },
          { text: "Rave enthusiastically for 20 seconds about something utterly boring, like power sockets", timer: 20 },
          { text: "Give a 20-second acceptance speech as if you just won an Oscar", timer: 20 },
          { text: "Do 10 push-ups in 20 seconds", timer: 20 },
          { text: "Tell a joke in 20 seconds – the table has to laugh at least once", timer: 20 },
          { text: "Do your best impression of someone at the table – the others have to guess who" },
          { text: "Sing the chorus of your favourite song as loud as you can" },
          { text: "Do a 15-second live sports commentary of whatever's happening at the table", timer: 15 },
          { text: "Give a 20-second fiery speech on why they should elect you president", timer: 20 },
          { text: "Talk to your drink like it's your best friend for one minute – no pauses" },
        ],
      },

      nsfw: {
        label: "🔞 18+",
        challenges: [
          { text: "Explain a sex position using only hand gestures – the table has to guess it", timer: 30 },
          { text: "Moan convincingly for 10 seconds like it's a bad porno", timer: 10 },
          { text: "Give your best lap dance to a chair for 20 seconds", timer: 20 },
          { text: "Whisper something seductive in the ear of the person on your right for 10 seconds – without laughing", timer: 10 },
          { text: "Name eight words for the male genitals in 20 seconds", timer: 20 },
          { text: "Simulate a passionate kiss with your own hand for 10 seconds", timer: 10 },
          { text: "Name five places you've had sex or would have sex in 20 seconds", timer: 20 },
          { text: "Seduce the person across from you – using only a drink and a look, 15 seconds", timer: 15 },
          { text: "Describe a slice of bread for 15 seconds as if it were the most erotic thing in the world", timer: 15 },
          { text: "Describe your first time in exactly three words" },
          { text: "Describe the last person you slept with in one sentence – without saying their name" },
          { text: "Say the dirtiest sentence you can think of with a completely straight face" },
          { text: "Spell out \"orgasm\" – but moan every single letter" },
          { text: "Show the table your best sex face – and hold it for five seconds without laughing" },
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.WettbueroChallenges = WETTBUERO;
})(window);
