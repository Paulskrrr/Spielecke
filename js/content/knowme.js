// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * content/knowme.js — content for Kennst du mich? (Know Me)
 *
 * EDIT ME. Pure content, no logic. Each entry is ONE question ABOUT a player,
 * asked of somebody else — the guesser has to answer the way that person would.
 *
 * RULES FOR WRITING THESE:
 *  - `{name}` is replaced with the person the question is about. Phrase around
 *    it so German stays clean without a genitive-s ("Was isst {name} am
 *    liebsten?", not "Was ist {name}s Lieblingsessen?").
 *  - There must be ONE answer the person can confirm or deny out loud — no
 *    yes/no questions ("Mag {name} Pizza?" is a coin flip, not a test) and
 *    nothing the person themselves couldn't answer on the spot.
 *  - Questions about the group ("Wen aus dieser Runde …") are gold: they need
 *    3+ players, which the game enforces.
 *
 * Pools keep theme editable and language-switchable. Add a key and it shows up
 * as a selectable chip automatically. The `nsfw` and `date` keys are the two
 * Family Mode hides app-wide (pools.js), so grown-up material belongs there.
 * Keep de/en mirrored: same keys, same order, same count.
 */
(function (global) {
  "use strict";

  var DE = {
    general: {
      label: "🎲 Allgemein",
      questions: [
        "Was isst {name} am liebsten, wenn niemand zuschaut?",
        "Welche App öffnet {name} morgens als Erstes?",
        "Wie viele Wecker stellt sich {name}?",
        "Wie lange braucht {name} wirklich im Bad?",
        "Was hat {name} zuletzt online bestellt?",
        "Was bestellt {name} in einer neuen Bar?",
        "Was liegt bei {name} garantiert im Kühlschrank?",
        "Welche Serie hat {name} zuletzt durchgesuchtet?",
        "Wie viele ungelesene Nachrichten hat {name} gerade?",
        "Welchen Film kann {name} auswendig mitsprechen?",
        "Wofür gibt {name} eindeutig zu viel Geld aus?",
        "Welches Kleidungsstück würde {name} niemals tragen?",
        "Was ist der peinlichste Song in {name}s Playlist?",
        "Was würde {name} auf eine einsame Insel mitnehmen?",
        "Welches Essen rührt {name} nicht mal mit der Zange an?",
        "Wie sieht ein typischer Sonntagabend bei {name} aus?",
        "Welchen Tick hat {name}, den alle bemerken außer {name}?",
        "Wie viele Tabs hat {name} gerade offen?",
        "Was kocht {name}, wenn es schnell gehen muss?",
        "Welche Ausrede benutzt {name} am häufigsten?",
        "Was steht bei {name} seit Monaten auf der To-do-Liste?",
        "Wie kommt {name} normalerweise zur Arbeit oder Uni?",
        "Was macht {name} als Allererstes nach dem Aufwachen?",
        "Welchen Gegenstand sucht {name} ständig?",
        "Was würde {name} niemals mit jemandem teilen?",
        "Wie viele Stunden schläft {name} unter der Woche?"
      ]
    },
    deep: {
      label: "🧠 Tiefgang",
      questions: [
        "Worauf ist {name} insgeheim richtig stolz?",
        "Was ist {name}s größte Angst?",
        "Welchen Rat würde {name} dem eigenen 16-jährigen Ich geben?",
        "Was bringt {name} schneller auf die Palme als alles andere?",
        "Wofür würde {name} sofort alles stehen und liegen lassen?",
        "Was war {name}s beste Entscheidung der letzten Jahre?",
        "Welchen Traum hat {name} fast schon aufgegeben?",
        "Mit welchem einen Wort würde {name} sich selbst beschreiben?",
        "Was hält {name} für die eigene größte Schwäche?",
        "Wem aus dieser Runde vertraut {name} am meisten?",
        "Was würde {name} an sich sofort ändern, wenn es ginge?",
        "Wann hat {name} zuletzt geweint?",
        "Was macht {name} glücklicher, als {name} zugibt?",
        "Welche Kritik trifft {name} am härtesten?",
        "Worüber denkt {name} nachts nach, wenn alle schlafen?",
        "Was muss man tun, um {name}s Vertrauen für immer zu verlieren?",
        "Was schätzt {name} an einer Freundschaft am meisten?",
        "Wo sieht {name} sich in zehn Jahren?",
        "Was würde {name} tun, wenn Geld keine Rolle spielen würde?",
        "Welche Eigenschaft bewundert {name} an anderen am meisten?",
        "Was war der prägendste Moment in {name}s Leben?",
        "Was verzeiht {name} niemals?",
        "Wann fühlt {name} sich am wohlsten in der eigenen Haut?",
        "Welchen Fehler macht {name} immer wieder?",
        "Was gibt {name} Sicherheit, wenn alles drunter und drüber geht?",
        "Was würde {name} nie öffentlich zugeben?"
      ]
    },
    party: {
      label: "🎉 Party",
      questions: [
        "Wie endet eine Nacht mit {name} normalerweise?",
        "Was trinkt {name} auf einer Party als Erstes?",
        "Wie betrunken war {name} zuletzt — von 1 bis 10?",
        "Was macht {name} auf der Tanzfläche, das alle kennen?",
        "Wann geht {name} normalerweise nach Hause?",
        "Was bestellt {name} auf dem Heimweg zu essen?",
        "Wie schlimm ist {name}s Kater am nächsten Tag?",
        "Welcher Song holt {name} garantiert auf die Tanzfläche?",
        "Was ist {name}s Standard-Ausrede, um früher zu gehen?",
        "Wen ruft {name} betrunken als Erstes an?",
        "Wie oft im Monat geht {name} feiern?",
        "Wer aus dieser Runde würde {name} nach Hause bringen?",
        "Was war {name}s peinlichster Party-Moment?",
        "Bier, Wein oder Shots — was wählt {name}?",
        "Wie lange braucht {name}, um sich fertig zu machen?",
        "Was postet {name} nachts um drei?",
        "Wer ist {name}s Partner in Crime auf jeder Feier?",
        "Was macht {name} garantiert, sobald genug Drinks intus sind?",
        "Wie oft sagt {name} an einem Abend „nur noch einen“?",
        "Wo schläft {name} nach einer langen Nacht am liebsten?",
        "Was hält {name} ehrlich von Karaoke?",
        "Was ist das Erste, das {name} am Morgen danach sagt?",
        "Welches Trinkspiel gewinnt {name} immer?",
        "Wen aus dieser Runde muss {name} auf Partys am häufigsten retten?",
        "Was macht {name}, wenn eine Party langweilig wird?",
        "Wie viele Fotos macht {name} an einem Abend?"
      ]
    },
    hypothetical: {
      label: "🔮 Was wäre, wenn",
      questions: [
        "Was würde {name} mit einer Million machen?",
        "Welche Superkraft würde {name} wählen?",
        "In welchem Jahrzehnt würde {name} lieber leben?",
        "Was würde {name} tun, wenn morgen die Welt unterginge?",
        "Welchen Beruf hätte {name} in einem anderen Leben?",
        "Mit welcher berühmten Person würde {name} tauschen?",
        "Wohin würde {name} spontan auswandern?",
        "Was würde {name} als Erstes tun, unsichtbar für einen Tag?",
        "Welches Tier wäre {name}?",
        "Was würde {name} in einer Zombie-Apokalypse als Erstes holen?",
        "Wen aus dieser Runde würde {name} im Notfall anrufen?",
        "Welche Regel würde {name} sofort abschaffen?",
        "Was würde {name} mit 30 Stunden am Tag anfangen?",
        "In welchem Film würde {name} gern mitspielen?",
        "Was würde {name} niemals tun, egal für wie viel Geld?",
        "Ein Essen für den Rest des Lebens — welches wählt {name}?",
        "Wie sieht {name}s Traumhaus aus?",
        "Wen würde {name} zum Abendessen einladen — lebend oder tot?",
        "Was würde {name} mit einer Zeitmaschine tun?",
        "Welchen Namen würde {name} sich selbst geben?",
        "Was wäre {name}s erster Satz als Kanzler:in?",
        "Welche Erfindung fehlt {name} im Alltag?",
        "Was würde {name} tun, wenn es niemand je erfahren würde?",
        "Was steht auf {name}s Bucketlist ganz oben?",
        "Welchen Job würde {name} keine drei Tage durchhalten?",
        "Was würde {name} retten, wenn die Wohnung brennt?"
      ]
    },
    nsfw: {
      label: "🔞 18+",
      questions: [
        "Was ist {name}s größter Turn-off?",
        "Aussehen oder Humor — was zieht bei {name} mehr?",
        "Wie viele Menschen hat {name} schon geküsst, ungefähr?",
        "Was war {name}s peinlichstes Date?",
        "Wie lange war {name}s kürzeste Beziehung?",
        "Wen aus einem Film findet {name} unverschämt attraktiv?",
        "Was ist {name}s Lieblings-Anmachspruch?",
        "Wie oft denkt {name} noch an eine Ex-Person?",
        "Was macht jemanden für {name} sofort unwiderstehlich?",
        "Wie viele Dates braucht {name}, bis es ernst wird?",
        "Was ist {name}s heimliche Schwäche bei anderen Menschen?",
        "Wie reagiert {name}, wenn jemand offensiv flirtet?",
        "Wen aus dieser Runde würde {name} daten, wären alle Single?",
        "Was ist {name}s absolutes No-Go beim ersten Date?",
        "Wie oft öffnet {name} Dating-Apps?",
        "Was war {name}s schlimmster Beziehungsfehler?",
        "Welchen Typ Mensch datet {name} immer wieder, obwohl es nie klappt?",
        "Wie wichtig ist {name} das Aussehen wirklich — von 1 bis 10?",
        "Was antwortet {name} auf „Netflix und chillen“?",
        "Wo würde {name} garantiert niemals knutschen?",
        "Was hat {name} im Suchverlauf, das gelöscht gehört?",
        "Welches Kompliment wirkt bei {name} sofort?",
        "Wie lange hält {name} ohne Flirten aus?",
        "Was findet {name} heißer: der Anfang oder das Danach?",
        "Worüber redet {name} nach einem Date sofort mit Freunden?",
        "Was war {name}s dreisteste Lüge in einem Dating-Profil?"
      ]
    },
    date: {
      label: "🌹 Date",
      questions: [
        "Wie sieht {name}s perfektes Date aus?",
        "Was ist {name}s größter Dealbreaker in einer Beziehung?",
        "Wie zeigt {name} Zuneigung?",
        "Was braucht {name} in einer Beziehung am meisten?",
        "Wie schnell schreibt {name} nach einem guten Date zurück?",
        "Was macht {name} beim ersten Date immer?",
        "Wie lange dauert es, bis {name} sich verliebt?",
        "Was ist {name}s romantischste Geste?",
        "Wie geht {name} mit Streit um?",
        "Wie sieht {name}s Traumhochzeit aus?",
        "Wer entschuldigt sich in {name}s Beziehungen zuerst?",
        "Was würde {name} für die große Liebe aufgeben?",
        "Wie wichtig sind {name} gemeinsame Hobbys?",
        "Was macht {name} beim Daten sofort unsicher?",
        "Über welches Kompliment freut {name} sich am meisten?",
        "Was ist {name}s rotes Tuch beim Kennenlernen?",
        "Wie viele Kinder will {name}?",
        "Wie reagiert {name} auf ein überraschendes Geschenk?",
        "Was macht {name} an einem freien Sonntag zu zweit?",
        "Wie wichtig ist {name} die Meinung der Familie beim Partner?",
        "Wie lange hält {name} eine Fernbeziehung aus?",
        "Was ist für {name} Romantik an einem ganz normalen Dienstag?",
        "Woran merkt man, dass {name} verliebt ist?",
        "Was verschweigt {name} beim ersten Date grundsätzlich?",
        "Wie sieht {name}s idealer gemeinsamer Urlaub aus?",
        "Was ist der süßeste Moment, den {name} je erlebt hat?"
      ]
    }
  };

  var EN = {
    general: {
      label: "🎲 General",
      questions: [
        "What does {name} eat when nobody's watching?",
        "Which app does {name} open first in the morning?",
        "How many alarms does {name} set?",
        "How long does {name} really take in the bathroom?",
        "What did {name} order online most recently?",
        "What does {name} order at a new bar?",
        "What's guaranteed to be in {name}'s fridge?",
        "Which series did {name} binge most recently?",
        "How many unread messages does {name} have right now?",
        "Which film can {name} quote from memory?",
        "What does {name} clearly spend too much money on?",
        "Which item of clothing would {name} never wear?",
        "What's the most embarrassing song on {name}'s playlist?",
        "What would {name} take to a desert island?",
        "Which food won't {name} touch with a stick?",
        "What does a typical Sunday evening look like for {name}?",
        "Which habit does everyone notice about {name} except {name}?",
        "How many tabs does {name} have open right now?",
        "What does {name} cook when it has to be quick?",
        "Which excuse does {name} use most often?",
        "What's been on {name}'s to-do list for months?",
        "How does {name} usually get to work or class?",
        "What's the very first thing {name} does after waking up?",
        "Which object is {name} always looking for?",
        "What would {name} never share with anyone?",
        "How many hours does {name} sleep on a weeknight?"
      ]
    },
    deep: {
      label: "🧠 Deep",
      questions: [
        "What is {name} secretly really proud of?",
        "What is {name}'s biggest fear?",
        "What advice would {name} give their 16-year-old self?",
        "What winds {name} up faster than anything else?",
        "What would {name} drop everything for?",
        "What was {name}'s best decision of the last few years?",
        "Which dream has {name} almost given up on?",
        "In one word, how would {name} describe themselves?",
        "What does {name} consider their own biggest weakness?",
        "Who in this group does {name} trust most?",
        "What would {name} change about themselves right now if they could?",
        "When did {name} last cry?",
        "What makes {name} happier than they'd admit?",
        "Which kind of criticism hits {name} hardest?",
        "What does {name} think about at night when everyone's asleep?",
        "What would make {name} lose trust in someone forever?",
        "What does {name} value most in a friendship?",
        "Where does {name} see themselves in ten years?",
        "What would {name} do if money were no object?",
        "Which quality does {name} admire most in others?",
        "What was the most defining moment of {name}'s life?",
        "What will {name} never forgive?",
        "When does {name} feel most comfortable in their own skin?",
        "Which mistake does {name} keep making?",
        "What keeps {name} steady when everything goes sideways?",
        "What would {name} never admit in public?"
      ]
    },
    party: {
      label: "🎉 Party",
      questions: [
        "How does a night out with {name} usually end?",
        "What's {name}'s first drink at a party?",
        "How drunk was {name} last time — from 1 to 10?",
        "What does {name} do on the dance floor that everyone knows?",
        "When does {name} usually head home?",
        "What food does {name} order on the way home?",
        "How bad is {name}'s hangover the next day?",
        "Which song is guaranteed to get {name} dancing?",
        "What's {name}'s standard excuse for leaving early?",
        "Who does {name} drunk-call first?",
        "How many nights out does {name} have per month?",
        "Who in this group would walk {name} home?",
        "What was {name}'s most embarrassing party moment?",
        "Beer, wine or shots — what does {name} pick?",
        "How long does {name} take to get ready?",
        "What does {name} post at three in the morning?",
        "Who is {name}'s partner in crime at every party?",
        "What does {name} always do once the drinks kick in?",
        "How many times a night does {name} say \"just one more\"?",
        "Where does {name} prefer to sleep after a long night?",
        "What does {name} honestly think of karaoke?",
        "What's the first thing {name} says the morning after?",
        "Which drinking game does {name} always win?",
        "Who in this group does {name} rescue most often at parties?",
        "What does {name} do when a party gets boring?",
        "How many photos does {name} take in one night?"
      ]
    },
    hypothetical: {
      label: "🔮 What if",
      questions: [
        "What would {name} do with a million?",
        "Which superpower would {name} pick?",
        "Which decade would {name} rather live in?",
        "What would {name} do if the world ended tomorrow?",
        "What job would {name} have in another life?",
        "Which famous person would {name} swap with?",
        "Where would {name} emigrate to on a whim?",
        "What's the first thing {name} would do invisible for a day?",
        "Which animal would {name} be?",
        "What would {name} grab first in a zombie apocalypse?",
        "Who in this group would {name} call in an emergency?",
        "Which rule would {name} abolish immediately?",
        "What would {name} do with a 30-hour day?",
        "Which film would {name} love to be in?",
        "What would {name} never do, no matter the money?",
        "One food for the rest of their life — what does {name} pick?",
        "What does {name}'s dream house look like?",
        "Who would {name} invite to dinner — living or dead?",
        "What would {name} do with a time machine?",
        "What name would {name} give themselves?",
        "What would be {name}'s first sentence as head of state?",
        "Which invention is missing from {name}'s daily life?",
        "What would {name} do if nobody would ever find out?",
        "What's at the top of {name}'s bucket list?",
        "Which job would {name} not survive three days in?",
        "What would {name} save if the flat were on fire?"
      ]
    },
    nsfw: {
      label: "🔞 18+",
      questions: [
        "What is {name}'s biggest turn-off?",
        "Looks or humour — what works better on {name}?",
        "How many people has {name} kissed, roughly?",
        "What was {name}'s most embarrassing date?",
        "How short was {name}'s shortest relationship?",
        "Which film character does {name} find outrageously attractive?",
        "What's {name}'s favourite chat-up line?",
        "How often does {name} still think about an ex?",
        "What makes someone instantly irresistible to {name}?",
        "How many dates does {name} need before it gets serious?",
        "What's {name}'s secret weakness in other people?",
        "How does {name} react to someone flirting hard?",
        "Who in this group would {name} date if everyone were single?",
        "What's {name}'s absolute no-go on a first date?",
        "How often does {name} open dating apps?",
        "What was {name}'s worst relationship mistake?",
        "Which type does {name} keep dating even though it never works?",
        "How much do looks really matter to {name} — 1 to 10?",
        "What does {name} reply to \"Netflix and chill\"?",
        "Where would {name} absolutely never make out?",
        "What's in {name}'s search history that should be deleted?",
        "Which compliment works on {name} instantly?",
        "How long can {name} go without flirting?",
        "What does {name} find hotter: the beginning or the afterwards?",
        "What does {name} tell their friends first after a date?",
        "What was {name}'s boldest lie on a dating profile?"
      ]
    },
    date: {
      label: "🌹 Date",
      questions: [
        "What does {name}'s perfect date look like?",
        "What's {name}'s biggest relationship dealbreaker?",
        "How does {name} show affection?",
        "What does {name} need most in a relationship?",
        "How fast does {name} text back after a good date?",
        "What does {name} always do on a first date?",
        "How long does it take {name} to fall in love?",
        "What's {name}'s most romantic gesture?",
        "How does {name} handle an argument?",
        "What does {name}'s dream wedding look like?",
        "Who apologises first in {name}'s relationships?",
        "What would {name} give up for true love?",
        "How important are shared hobbies to {name}?",
        "What makes {name} insecure when dating?",
        "Which compliment makes {name} happiest?",
        "What's an instant red flag for {name} when meeting someone?",
        "How many kids does {name} want?",
        "How does {name} react to a surprise gift?",
        "What does {name} do on a free Sunday as a couple?",
        "How much does the family's opinion of a partner matter to {name}?",
        "How long could {name} handle a long-distance relationship?",
        "What counts as romance to {name} on an ordinary Tuesday?",
        "How can you tell {name} is in love?",
        "What does {name} always leave out on a first date?",
        "What does {name}'s ideal holiday as a couple look like?",
        "What's the sweetest moment {name} has ever had?"
      ]
    }
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.KnowMe = { de: DE, en: EN };
})(window);
