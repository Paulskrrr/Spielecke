/*
 * content/princess.js — content for Princess Treatment (NSFW-ish, adults)
 *
 * EDIT ME. Pure content. Each round shows a thing a partner does; the table
 * debates: is it Princess Treatment 👑 (going above and beyond) or just the
 * Bare Minimum 😐? The target alternates every round between Princess (aimed at
 * the women) and King (aimed at the men), so prompts are split by gender and
 * grouped by category.
 *
 * AUDIENCE: this is played by early-20s singles on dates / in the talking
 * stage, not by settled couples — so prompts lean dating-app era: first dates,
 * sleepovers, stories, read receipts, club nights. The best prompts are the
 * ones the table will actually FIGHT over (~70% split the room, ~30% are
 * clear-cut for rhythm and laughs).
 *
 * Bilingual: Spielecke.Princess = { de:{...}, en:{...} }. Both languages share
 * the SAME category keys and the same princess/king field names; the game reads
 * the current language's subtree via Spielecke.L(...).
 *
 * Structure: category -> { label, princess: [...], king: [...] }.
 *   - `princess` entries describe what's done FOR a woman.
 *   - `king` entries describe what's done FOR a man.
 */
(function (global) {
  "use strict";

  var PRINCESS = {
    de: {
      romance: {
        label: "💘 Romantik",
        princess: [
          "Er plant das ganze Date und zahlt",
          "Er schickt dir jeden Morgen eine Guten-Morgen-Nachricht",
          "Er merkt sich deinen halben Geburtstag",
          "Er schreibt dir einen handgeschriebenen Zettel",
          "Er gibt dir seine Jacke, wenn dir kalt ist",
          "Er fährt 40 Minuten, nur um dich 20 Minuten zu sehen",
          "Er merkt sich beim ersten Date deinen Lieblingsdrink — und bestellt ihn beim zweiten",
          "Er löscht seine Dating-Apps nach dem dritten Date von selbst",
          "Er stellt dich seinen Jungs schon nach zwei Wochen vor",
          "Er sagt dir nach dem ersten Kuss, dass er nur noch dich treffen will",
        ],
        king: [
          "Sie plant ein Überraschungs-Date am Abend",
          "Sie macht ihm vor seinen Freunden Komplimente",
          "Sie merkt sich den Namen seines besten Kumpels",
          "Sie stellt ihm eine Playlist zusammen",
          "Sie sagt Ja zum gemeinsamen Spiele-Schauen",
          "Sie schreibt dir nach dem Date zuerst, dass es schön war",
          "Sie löscht ihre Dating-Apps, ohne dass ihr drüber geredet habt",
          "Sie merkt sich, dass du eine Prüfung hattest, und fragt danach",
          "Sie stellt dich ihren Mädels schon nach dem dritten Date vor",
          "Sie zahlt beim zweiten Date wie selbstverständlich",
        ],
      },
      dailyLife: {
        label: "🏠 Alltag",
        princess: [
          "Er heizt dir das Auto vor",
          "Er schreibt innerhalb einer Stunde zurück",
          "Er spült ab, ohne dass du fragen musst",
          "Er trägt die schweren Tüten",
          "Er lässt dich das Restaurant aussuchen",
          "Er hat beim dritten Übernachten schon eine Zahnbürste für dich da",
          "Er bringt dir am Morgen danach Kaffee ans Bett",
          "Er leiht dir seinen Hoodie und sagt, du sollst ihn behalten",
          "Er bestellt dir Pommes mit, weil du „keinen Hunger“ hast",
          "Er bringt dich nachts nach Hause, obwohl er in die andere Richtung muss",
        ],
        king: [
          "Sie kocht unter der Woche Abendessen",
          "Sie lässt ihn einen Männerabend machen, ohne Fragen",
          "Sie tankt ihm das Auto voll",
          "Sie bringt ihm Kaffee ans Bett",
          "Sie schreibt nicht 20 Mal, wenn er unterwegs ist",
          "Sie macht dir am Morgen danach Frühstück",
          "Sie bringt zum Spontanbesuch was zu essen mit",
          "Sie gibt dir deinen Hoodie irgendwann freiwillig zurück",
          "Sie fragt, bevor sie sich aus deinem Kühlschrank bedient",
          "Sie lässt nicht nach zwei Übernachtungen schon Zeug bei dir liegen",
        ],
      },
      digital: {
        label: "📱 Digital",
        princess: [
          "Er antwortet auf deine Story, statt sie nur zu liken",
          "Er teilt seinen Live-Standort, ohne dass du fragen musst",
          "Er hat ein Foto von euch als Sperrbildschirm",
          "Er entfolgt seiner Ex, ohne dass du es ansprechen musst",
          "Er schreibt Absätze zurück, wenn du Absätze schreibst",
          "Er ruft an, statt nur zu texten",
          "Er antwortet dir auch, wenn er mit den Jungs unterwegs ist",
          "Er kommentiert öffentlich unter dein Bild, statt nur still zu liken",
          "Er schreibt „gut angekommen?“, ohne dass du es erwartest",
          "Er lässt dich nie auf „Gelesen“ hängen",
        ],
        king: [
          "Sie antwortet nicht erst nach drei Stunden mit „haha ja“",
          "Sie liket keine Bilder von anderen Typen mehr",
          "Sie postet dich in ihrer richtigen Story, nicht nur bei Close Friends",
          "Sie schickt dir Memes, die sie an dich erinnern",
          "Sie ruft dich betrunken an, weil sie an dich denken muss",
          "Sie schreibt dir zuerst „bist du noch wach?“",
          "Sie hat euren Chat oben angepinnt",
          "Sie nimmt deine FaceTime-Anrufe auch ungeschminkt an",
          "Sie hypet dein neues Bild in den Kommentaren",
          "Sie lässt dich nicht auf „Zugestellt“, während sie Storys postet",
        ],
      },
      goingOut: {
        label: "🎉 Ausgehen",
        princess: [
          "Er hält dir im Club die Hand, damit ihr euch nicht verliert",
          "Er sagt anderen Frauen von selbst, dass er hier mit dir ist",
          "Er holt dir zwischen den Drinks ungefragt ein Wasser",
          "Er hält dir die Haare, wenn der Abend zu lang war",
          "Er wartet, bis du sicher in deiner Wohnung bist, bevor er geht",
          "Er tanzt mit dir, obwohl er eigentlich nie tanzt",
          "Er verteidigt dich, wenn jemand blöd über dich redet",
          "Er zahlt deine Drinks den ganzen Abend",
          "Er lässt seine Jungs warten, um dich noch ins Taxi zu setzen",
          "Er merkt von allein, wenn dir ein Typ zu aufdringlich wird",
        ],
        king: [
          "Sie stellt dich nicht als „nur ein Freund“ vor",
          "Sie tanzt den ganzen Abend nur mit dir",
          "Sie bringt dir von der Raucherpause Pommes mit",
          "Sie teilt ihre Pommes mit dir",
          "Sie passt auf deinen Drink auf, wenn du aufs Klo gehst",
          "Sie schwärmt ihren Mädels von dir vor, während du danebenstehst",
          "Sie küsst dich vor allen Leuten, nicht nur heimlich",
          "Sie geht früher mit, weil du müde bist",
          "Sie flirtet nicht mit dem Barkeeper für Freigetränke",
          "Sie bleibt bei dir, statt die ganze Nacht mit ihren Mädels zu verschwinden",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        princess: [
          "Er sorgt immer dafür, dass du zuerst kommst",
          "Er schickt mitten im Arbeitstag eine versaute Nachricht",
          "Er weckt dich mit Morgensex",
          "Er lässt dir ein Bad ein und steigt mit rein",
          "Er geht gern runter, ohne etwas zurückzuerwarten",
          "Er sorgt auch beim One-Night-Stand dafür, dass du zuerst kommst",
          "Er holt dir danach ungefragt ein Glas Wasser",
          "Er bleibt danach zum Kuscheln, statt sich sofort anzuziehen",
          "Er schreibt dir am Morgen nach der ersten Nacht zuerst",
          "Er macht dir danach ein Kompliment, das nichts mit deinem Körper zu tun hat",
        ],
        king: [
          "Sie schickt ihm tagsüber ein freches Foto",
          "Sie ergreift mehr als die Hälfte der Zeit die Initiative",
          "Sie überrascht ihn mit einem Striptease",
          "Sie lässt ihn im Bett alles aussuchen",
          "Sie schreibt ihm zuerst was Versautes, während er unterwegs ist",
          "Sie sagt dir im Bett genau, was sie will, statt dich raten zu lassen",
          "Sie schreibt dir nach der ersten gemeinsamen Nacht zuerst",
          "Sie macht den ersten Schritt, wenn du zu lange zögerst",
          "Sie bleibt danach zum Kuscheln, statt sofort das Handy zu checken",
          "Sie erzählt ihren Mädels nur die guten Details",
        ],
      },
    },
    en: {
      romance: {
        label: "💘 Romance",
        princess: [
          "He plans the whole date and pays",
          "He sends good-morning texts every day",
          "He remembers your half-birthday",
          "He writes you a handwritten note",
          "He gives you his jacket when you're cold",
          "He drives 40 minutes just to see you for 20",
          "He remembers your favourite drink from the first date — and orders it on the second",
          "He deletes his dating apps after the third date, unprompted",
          "He introduces you to his boys after just two weeks",
          "He tells you after the first kiss that you're the only one he wants to see",
        ],
        king: [
          "She plans a surprise date night",
          "She compliments him in front of his friends",
          "She remembers his best mate's name",
          "She makes him a playlist",
          "She says yes to watching the game",
          "She texts you first after the date to say she had a great time",
          "She deletes her dating apps without you two ever talking about it",
          "She remembers you had an exam and asks how it went",
          "She introduces you to her girls by the third date",
          "She pays on the second date like it's nothing",
        ],
      },
      dailyLife: {
        label: "🏠 Daily Life",
        princess: [
          "He warms up the car for you",
          "He texts back within an hour",
          "He does the dishes without being asked",
          "He carries the heavy bags",
          "He lets you pick the restaurant",
          "He has a spare toothbrush ready by the third sleepover",
          "He brings you coffee in bed the morning after",
          "He lends you his hoodie and tells you to keep it",
          "He orders you fries too because you're \"not hungry\"",
          "He takes you home at night even though he lives the other way",
        ],
        king: [
          "She cooks dinner on a weeknight",
          "She lets him have a guys' night, no questions",
          "She fills up his car with petrol",
          "She brings him a coffee in bed",
          "She doesn't text 20 times when he's out",
          "She makes you breakfast the morning after",
          "She brings food when she comes over spontaneously",
          "She actually gives your hoodie back one day, unprompted",
          "She asks before raiding your fridge",
          "She doesn't start leaving her stuff at yours after two sleepovers",
        ],
      },
      digital: {
        label: "📱 Digital",
        princess: [
          "He replies to your story instead of just liking it",
          "He shares his live location without you having to ask",
          "He has a photo of you two as his lock screen",
          "He unfollows his ex without you having to bring it up",
          "He texts paragraphs back when you text paragraphs",
          "He calls instead of just texting",
          "He still replies when he's out with the boys",
          "He comments on your post publicly instead of just quietly liking it",
          "He texts \"home safe?\" without you having to expect it",
          "He never leaves you on read",
        ],
        king: [
          "She doesn't reply \"haha yeah\" three hours later",
          "She stops liking other guys' pictures",
          "She posts you on her main story, not just close friends",
          "She sends you memes that made her think of you",
          "She drunk-calls you because she can't stop thinking about you",
          "She texts you first asking \"you still up?\"",
          "She has your chat pinned to the top",
          "She answers your FaceTime calls without makeup on",
          "She hypes up your new picture in the comments",
          "She doesn't leave you on delivered while posting stories",
        ],
      },
      goingOut: {
        label: "🎉 Going Out",
        princess: [
          "He holds your hand in the club so you don't lose each other",
          "He tells other women himself that he's here with you",
          "He gets you a water between drinks without being asked",
          "He holds your hair back when the night got too long",
          "He waits until you're safely inside before leaving",
          "He dances with you even though he never dances",
          "He defends you when someone talks trash about you",
          "He pays for your drinks all night",
          "He keeps his boys waiting to put you in a taxi first",
          "He notices on his own when a guy won't leave you alone",
        ],
        king: [
          "She doesn't introduce you as \"just a friend\"",
          "She dances only with you all night",
          "She brings you fries back from the smoking break",
          "She shares her fries with you",
          "She watches your drink when you go to the bathroom",
          "She gushes about you to her girls while you're standing right there",
          "She kisses you in front of everyone, not just in secret",
          "She leaves early with you because you're tired",
          "She doesn't flirt with the bartender for free drinks",
          "She stays with you instead of vanishing with her girls all night",
        ],
      },
      nsfw: {
        label: "🔞 18+",
        princess: [
          "He always makes sure you finish first",
          "He sends a filthy text in the middle of your work day",
          "He wakes you up with morning sex",
          "He runs you a bath and gets in too",
          "He's happy to go down with nothing in return",
          "He makes sure you finish first, even on a one-night stand",
          "He gets you a glass of water after, unasked",
          "He stays to cuddle instead of getting dressed right away",
          "He texts you first the morning after your first night",
          "He compliments you after on something that isn't your body",
        ],
        king: [
          "She sends him a cheeky pic during the day",
          "She initiates more than half the time",
          "She surprises him with a striptease",
          "She lets him pick anything in the bedroom",
          "She sexts him first while he's out",
          "She tells you exactly what she wants in bed instead of making you guess",
          "She texts you first after your first night together",
          "She makes the first move when you hesitate too long",
          "She stays to cuddle instead of checking her phone right after",
          "She only tells her girls the good details",
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.Princess = PRINCESS;
})(window);
