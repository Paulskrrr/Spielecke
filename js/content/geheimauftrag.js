/*
 * content/geheimauftrag.js — content for Geheimauftrag / Secret Mission
 *
 * EDIT ME. Pure content, no game logic. A hidden-mission side game: each player
 * secretly draws a mission and tries to pull it off over the course of the
 * evening, quietly, ALONGSIDE whatever else is being played. No points, no
 * rounds — just sneaky little social objectives.
 *
 * Every mission is bound to a specific other player via the {target} token; the
 * game substitutes a real name at draw time. Co-op missions are shared by two
 * players and may additionally reference {partner} (shown only in the
 * "known-partner" variant). Do NOT hard-code names — always use the tokens.
 *
 * Two arrays per language: `solo` (one player) and `coop` (two players). Same
 * structure/keys in both languages; keep de and en mirrored.
 */
(function (global) {
  "use strict";

  var GEHEIMAUFTRAG = {
    de: {
      solo: [
        "Bring {target} dazu, dir zu sagen, dass du gut aussiehst.",
        "Stoß im Laufe des Abends dreimal mit {target} an, ohne dass es {target} auffällt.",
        "Bring {target} dazu, das Wort „Ehrenmann“ zu sagen.",
        "Sorge dafür, dass {target} dir ein Getränk holt.",
        "Bring {target} dazu, dir ein Kompliment zu deiner Frisur zu machen.",
        "Bring {target} dazu, dir zu erzählen, wovor er oder sie am meisten Angst hat.",
        "Bring {target} dazu, mindestens fünf Minuten über ein Hobby zu reden, das dich eigentlich null interessiert.",
        "Sorge dafür, dass {target} dich einmal umarmt, ohne dass du danach fragst.",
        "Bring {target} dazu, dir freiwillig die Handynummer anzubieten.",
        "Bring {target} dazu, „Da hast du völlig recht“ zu dir zu sagen.",
        "Bring {target} dazu, eine peinliche Geschichte aus der Schulzeit zu erzählen.",
        "Überzeuge {target} davon, dass ihr euch schon einmal irgendwo getroffen habt — auch wenn das gar nicht stimmt.",
        "Bring {target} dazu, dir zuzuprosten und dabei „Auf dich“ zu sagen.",
        "Sorge dafür, dass {target} dir verrät, was er oder sie zuletzt gegoogelt hat.",
        "Bring {target} dazu, dir einen Witz zu erzählen.",
        "Bring {target} dazu, zuzugeben, dass er oder sie mal in jemanden aus dieser Runde verknallt war.",
        "Bring {target} dazu, dich um einen Rat zu fragen.",
        "Bring {target} dazu, das Wort „legendär“ in einem Satz zu benutzen.",
        "Sorge dafür, dass {target} dir sein oder ihr Lieblingslied empfiehlt oder vorspielt.",
        "Bring {target} dazu, seinen oder ihren peinlichsten Spitznamen zu verraten.",
        "Bring {target} dazu, mit dir für ein Foto zu posieren.",
        "Bring {target} dazu, laut zu schätzen, wie alt du bist.",
        "Bring {target} dazu, mit dir zehn Minuten über ein völlig belangloses Thema zu diskutieren.",
        "Bring {target} dazu, dir seinen oder ihren Lieblingsdrink zu empfehlen.",
        "Sorge dafür, dass {target} den Satz „Ich liebe diese Party“ sagt.",
        "Bring {target} dazu, zuzugeben, dass er oder sie heimlich eine Trash-Serie schaut.",
        "Bring {target} dazu, dir ein High Five zu geben, ohne dass du deine Hand zuerst hebst.",
        "Bring {target} dazu, dir von seinem oder ihrem peinlichsten Date zu erzählen.",
      ],
      coop: [
        "Ihr beide: bringt {target} dazu, aufzustehen und der Runde etwas vorzuführen.",
        "Bringt {target} gemeinsam dazu, über ein Thema abzustimmen, das ihr vorschlagt.",
        "Du und {partner}: sorgt dafür, dass {target} euch beiden gleichzeitig zuprostet.",
        "Bringt {target} zusammen dazu, denselben Satz zweimal hintereinander zu sagen.",
        "Ihr beide: überzeugt {target}, dass draußen gerade etwas Spannendes passiert.",
        "Du und {partner}: bringt {target} dazu, euch beide miteinander zu vergleichen.",
        "Bringt {target} gemeinsam dazu, eine Wette mit euch einzugehen.",
        "Ihr beide: sorgt dafür, dass {target} einen Toast auf die ganze Runde ausspricht.",
        "Du und {partner}: bringt {target} dazu, euch beiden ein Geheimnis zu verraten.",
        "Bringt {target} zusammen dazu, zwei Minuten lang das Gesprächsthema zu bestimmen — und lasst es dann fallen.",
        "Ihr beide: bringt {target} dazu, euch beim Tanzen zuzusehen und dann mitzumachen.",
        "Du und {partner}: sorgt dafür, dass {target} euch beiden ein Kompliment macht.",
        "Bringt {target} gemeinsam dazu, „Ihr zwei seid ein gutes Team“ zu sagen.",
        "Ihr beide: bringt {target} dazu, eine kleine Entscheidung ganz euch beiden zu überlassen.",
      ],
    },
    en: {
      solo: [
        "Get {target} to tell you that you look good.",
        "Clink glasses with {target} three times over the evening without {target} noticing.",
        "Get {target} to say the word “legend”.",
        "Make sure {target} fetches you a drink.",
        "Get {target} to compliment your hair.",
        "Get {target} to tell you what they're most afraid of.",
        "Get {target} to talk for at least five minutes about a hobby you honestly don't care about.",
        "Make sure {target} hugs you once without you asking for it.",
        "Get {target} to offer you their phone number unprompted.",
        "Get {target} to say “You're totally right” to you.",
        "Get {target} to tell an embarrassing story from their school days.",
        "Convince {target} that the two of you have met somewhere before — even if you haven't.",
        "Get {target} to raise a glass to you and say “Here's to you”.",
        "Make sure {target} tells you the last thing they googled.",
        "Get {target} to tell you a joke.",
        "Get {target} to admit they once had a crush on someone in this group.",
        "Get {target} to ask you for advice.",
        "Get {target} to use the word “iconic” in a sentence.",
        "Make sure {target} recommends or plays you their favourite song.",
        "Get {target} to reveal their most embarrassing nickname.",
        "Get {target} to pose with you for a photo.",
        "Get {target} to guess your age out loud.",
        "Get {target} to argue with you about something completely trivial for ten minutes.",
        "Get {target} to recommend you their favourite drink.",
        "Make sure {target} says the words “I love this party”.",
        "Get {target} to admit they secretly watch a trashy TV show.",
        "Get {target} to high-five you without you raising your hand first.",
        "Get {target} to tell you about their most embarrassing date.",
      ],
      coop: [
        "Both of you: get {target} to stand up and perform something for the group.",
        "Together, get {target} to vote on a topic that you two propose.",
        "You and {partner}: make sure {target} toasts both of you at the same time.",
        "Together, get {target} to say the same sentence twice in a row.",
        "Both of you: convince {target} that something exciting is happening outside.",
        "You and {partner}: get {target} to compare the two of you to each other.",
        "Together, get {target} to make a bet with you.",
        "Both of you: make sure {target} gives a toast to the whole group.",
        "You and {partner}: get {target} to tell the two of you a secret.",
        "Together, get {target} to steer the conversation for two minutes — then let it drop.",
        "Both of you: get {target} to watch the two of you dance and then join in.",
        "You and {partner}: make sure {target} pays both of you a compliment.",
        "Together, get {target} to say “You two make a good team”.",
        "Both of you: get {target} to leave a small decision entirely up to the two of you.",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Geheimauftrag = GEHEIMAUFTRAG;
})(window);
