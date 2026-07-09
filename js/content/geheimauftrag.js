// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * content/geheimauftrag.js — content for Geheimauftrag / Secret Mission
 *
 * EDIT ME. Pure content, no game logic. A hidden-mission side game: each player
 * secretly draws a mission and tries to pull it off over the course of the
 * evening, quietly, ALONGSIDE whatever else is being played. No points, no
 * rounds — just sneaky little social objectives.
 *
 * QUALITY BAR (curated by hand — quality over quantity): a mission must be
 * clearly checkable ("did that happen or not"), not fulfillable by accident in
 * two seconds, and not so literal that you'd have to recite a fixed sentence
 * word for word. Missions that lean on the games being played around them
 * (guessing, ranking, debating, turn-taking) make for the best moments.
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
        "Sorge dafür, dass {target} dich einmal umarmt, ohne dass du danach fragst.",
        "Überzeuge {target} davon, dass ihr euch schon einmal irgendwo getroffen habt — auch wenn das gar nicht stimmt.",
        "Bring {target} dazu, dir zuzuprosten und dabei „Auf dich“ zu sagen.",
        "Sorge dafür, dass {target} dir verrät, was er oder sie zuletzt gegoogelt hat.",
        "Bring {target} dazu, dir einen Witz zu erzählen.",
        "Bring {target} dazu, das Wort „legendär“ in einem Satz zu benutzen.",
        "Sorge dafür, dass {target} dir sein oder ihr Lieblingslied empfiehlt oder vorspielt.",
        "Bring {target} dazu, mit dir für ein Foto zu posieren.",
        "Bring {target} dazu, dir seinen oder ihren Lieblingsdrink zu empfehlen.",
        "Bring {target} dazu, dir ein High Five zu geben, ohne dass du deine Hand zuerst hebst.",
        "Bring {target} dazu, dir von seinem oder ihrem peinlichsten Date zu erzählen.",
        "Bring {target} dazu, mit dir gemeinsam ein Glas auf ex zu leeren.",
        "Bring {target} dazu, dir mitten im Spiel die Regeln zu erklären — obwohl du sie längst kennst.",
        "Gib {target} im Laufe des Abends dreimal spielerisch die Schuld, wenn irgendetwas schiefläuft.",
        "Gib in einem Rate-Moment eine absurd falsche Antwort — und bring {target} dazu, sie ernsthaft zu diskutieren.",
      ],
      coop: [
        "Bringt {target} zusammen dazu, denselben Satz zweimal hintereinander zu sagen.",
        "Bringt {target} gemeinsam dazu, eine Wette mit euch einzugehen.",
        "Ihr beide: sorgt dafür, dass {target} einen Toast auf die ganze Runde ausspricht.",
        "Ihr beide: bringt {target} dazu, euch beim Tanzen zuzusehen und dann mitzumachen.",
        "Du und {partner}: sorgt dafür, dass {target} euch beiden ein Kompliment macht.",
        "Ihr beide: zettelt eine alberne Grundsatzdebatte an und bringt {target} dazu, sich lautstark eurer Seite anzuschließen.",
        "Du und {partner}: bringt {target} dazu, mit euch beiden gleichzeitig über Kreuz anzustoßen — Arme verschränkt, wie bei einer Hochzeit.",
        "Ihr beide: überzeugt {target} so gut, dass draußen gerade etwas Verrücktes passiert, dass sie oder er tatsächlich aufsteht und nachschauen geht.",
        "Du und {partner}: überzeugt {target} mitten im Spiel davon, dass sie oder er gerade dran ist — obwohl das nicht stimmt.",
        "Ihr beide: erfindet eine Hausregel und überzeugt {target} so von ihr, dass {target} sie später jemand anderem erklärt.",
      ],
    },
    en: {
      solo: [
        "Get {target} to tell you that you look good.",
        "Clink glasses with {target} three times over the evening without {target} noticing.",
        "Get {target} to say the word “legend”.",
        "Make sure {target} fetches you a drink.",
        "Get {target} to compliment your hair.",
        "Make sure {target} hugs you once without you asking for it.",
        "Convince {target} that the two of you have met somewhere before — even if you haven't.",
        "Get {target} to raise a glass to you and say “Here's to you”.",
        "Make sure {target} tells you the last thing they googled.",
        "Get {target} to tell you a joke.",
        "Get {target} to use the word “iconic” in a sentence.",
        "Make sure {target} recommends or plays you their favourite song.",
        "Get {target} to pose with you for a photo.",
        "Get {target} to recommend you their favourite drink.",
        "Get {target} to high-five you without you raising your hand first.",
        "Get {target} to tell you about their most embarrassing date.",
        "Get {target} to down a full glass with you in one go.",
        "Get {target} to explain the rules to you mid-game — even though you know them perfectly well.",
        "Playfully pin the blame on {target} three times tonight whenever something goes wrong.",
        "Give an absurdly wrong answer in a guessing moment — and get {target} to debate it seriously.",
      ],
      coop: [
        "Together, get {target} to say the same sentence twice in a row.",
        "Together, get {target} to make a bet with you.",
        "Both of you: make sure {target} gives a toast to the whole group.",
        "Both of you: get {target} to watch the two of you dance and then join in.",
        "You and {partner}: make sure {target} pays both of you a compliment.",
        "Both of you: spark a silly matter-of-principle debate and get {target} to loudly take your side.",
        "You and {partner}: get {target} to clink glasses with you both at once, arms crossed over — wedding style.",
        "Both of you: convince {target} so thoroughly that something crazy is happening outside that they actually get up to check.",
        "You and {partner}: convince {target} mid-game that it's their turn — even though it isn't.",
        "Both of you: invent a house rule and sell it to {target} so well that they later explain it to someone else.",
      ],
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Geheimauftrag = GEHEIMAUFTRAG;
})(window);
