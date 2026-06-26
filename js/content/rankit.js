/*
 * content/rankit.js — content for Rank It (NSFW, adults only)
 *
 * EDIT ME. Pure content. Bilingual: the export is a { de, en } bundle and the
 * game reads the current language's subtree via Spielecke.L(...). Each language
 * holds the same pool keys; within a pool, each SET is one round: a `title`
 * stating the axis you rank along (best → worst, biggest → smallest, …) and an
 * `items` list (aim for 5) that everyone privately puts in order. Drift from the
 * group's consensus and you lose. Item count is flexible — the game adapts.
 *
 * The title MUST contain a "→": the game splits on it to label the top/bottom
 * poles of the rail. Keep the DE and EN pool keys
 * (general/party/videogames/nsfw) in sync so the category chips line
 * up in both languages.
 */
(function (global) {
  "use strict";

  var RANKIT = {
    de: {
      general: {
        label: "🎲 Allgemein",
        sets: [
          { title: "Beste → schlechteste Superkraft", items: ["Unsichtbarkeit", "Fliegen", "Zeitreise", "Gedankenlesen", "Teleportation"] },
          { title: "Bester → schlechtester Pizzabelag", items: ["Ananas", "Salami", "Pilze", "Extra Käse", "Sardellen"] },
          { title: "Wichtigste → unnötigste App", items: ["WhatsApp", "Instagram", "TikTok", "Google Maps", "Spotify"] },
          { title: "Traum- → Albtraum-Urlaub", items: ["Strandresort", "Städtetrip", "Camping", "Kreuzfahrt", "Skifahren"] },
          { title: "Bester → schlechtester Sonntag", items: ["Verkatert im Bett", "Großer Brunch", "Lange Wanderung", "Den ganzen Tag zocken", "Familienbesuch"] },
          { title: "Nützlichstes → nutzlosestes Schulfach", items: ["Mathe", "Sport", "Geschichte", "Kunst", "Religion"] },
        ],
      },
      party: {
        label: "🎉 Party",
        sets: [
          { title: "Akzeptabelstes → schlimmstes Besoffen-Verhalten", items: ["Auf dem Klo heulen", "Dem Ex schreiben", "Streit anfangen", "Einschlafen", "Zu viel erzählen"] },
          { title: "Stilvollster → peinlichster Drink", items: ["Champagner", "Craft Beer", "Tequila-Shots", "Tetrapack-Wein", "Jägerbombs"] },
          { title: "Größtes → kleinstes Party-Foul", items: ["Drinnen kotzen", "Was kaputt machen", "Drink verschütten", "Früh abhauen", "Die Musik kapern"] },
          { title: "Bestes → schlechtestes Kater-Mittel", items: ["Fettiges Essen", "Konterbier", "Bis mittags schlafen", "Wasser & Schmerztabletten", "Ab ins Gym"] },
          { title: "Fliegst am ehesten → am wenigsten raus", items: ["Schlägerei anfangen", "Nacktbaden", "Den Gastgeber beleidigen", "Crowdsurfen", "Einschlafen"] },
          { title: "Beste → schlimmste Sitznachbarschaft auf einer Party", items: ["Der Betrunkene", "Der Laberer", "Der DJ", "Der Ex", "Der Chef"] },
        ],
      },
      videogames: {
        label: "🎮 Videospiele",
        sets: [
          // ── Allgemein ──
          { title: "Nervigster → harmlosester Gamer-Typ", items: ["Der Rage-Quitter", "Der Mic-Spammer", "Der Smurf", "Der Try-Hard", "Der AFK-Farmer"] },
          { title: "Beste → schlechteste Ausrede nach einer Niederlage", items: ["Lag", "Team war schuld", "Maus hat gesponnen", "Sonne im Auge", "Controller-Drift"] },
          { title: "Beste → schlechteste Gaming-Plattform", items: ["PC", "PlayStation", "Xbox", "Switch", "Handy"] },
          { title: "Toxischste → chilligste Community", items: ["League of Legends", "Counter-Strike", "Overwatch", "Dark Souls", "Stardew Valley"] },
          { title: "Bester → schlechtester Gaming-Snack", items: ["Tiefkühlpizza", "Chips", "Energy Drink", "Schokoriegel", "Kalte Pommes von gestern"] },
          { title: "Größter → kleinster Flex beim Zocken", items: ["1v5-Clutch", "Ranked Top 500", "Seltener Skin", "Speedrun-Rekord", "Teurer Gaming-Stuhl"] },
          // ── Minecraft ──
          { title: "Gruseligster → harmlosester Mob", items: ["Der Warden", "Enderman", "Creeper", "Zombie", "Huhn"] },
          { title: "Beste → schlechteste Art in Minecraft zu sterben", items: ["Creeper von hinten", "In Lava gefallen", "Vom hohen Gerüst gefallen", "Im Wasser ertrunken", "Beim Bauen verhungert"] },
          { title: "Wertvollstes → wertlosestes Erz", items: ["Netherite", "Diamant", "Smaragd", "Redstone", "Kohle"] },
          { title: "Erste → letzte Priorität an Nacht 1", items: ["Holz farmen", "Werkzeug craften", "Essen suchen", "Haus bauen", "In ein Loch graben"] },
          { title: "Beeindruckendster → lahmster Minecraft-Bau", items: ["Riesiges Schloss", "Automatische Farm", "Pixel-Art", "Cobblestone-Turm in den Himmel", "Dirt House"] },
          // ── Overwatch ──
          { title: "Meist gehasste → am wenigsten gehasste Held:in", items: ["Widowmaker", "Mei", "Sombra", "Hanzo", "Genji"] },
          { title: "Nervigste → harmloseste Ult zum Gegnertreffen", items: ["Genji Blade", "Junkrat Tire", "Pharah Barrage", "Reaper Death Blossom", "Mei Blizzard"] },
          { title: "Bester → schlechtester Support", items: ["Ana", "Kiriko", "Mercy", "Lúcio", "Moira"] },
          { title: "Dankbarste → undankbarste Rolle", items: ["DPS", "Flex-Support", "Main Tank", "Off-Tank", "Main Support"] },
          { title: "Größter → kleinster Tilt-Moment", items: ["Kein Heiler im Team", "Gegnerische Bastion im Choke", "Mercy rezzt im falschen Moment", "DPS, die nichts treffen", "Niemand geht aufs Ziel"] },
          // ── Counter-Strike ──
          { title: "Beste → schlechteste Map", items: ["Mirage", "Inferno", "Dust 2", "Nuke", "Vertigo"] },
          { title: "Stylischster → uncoolster Kill", items: ["AWP No-Scope", "Messer von hinten", "Deagle-Headshot", "AK-Spray", "P90 zugespammt"] },
          { title: "Größter → kleinster Tilt-Moment (CS)", items: ["Teamkill in der ersten Sekunde", "16:14 verloren", "Ace vom Teammate geklaut", "Eco-Runde verloren", "Granate ins eigene Team"] },
          { title: "Nervigster → harmlosester Mitspieler (CS)", items: ["Ragequit nach Pistol", "Schreit dauernd Rush B", "Pickt AWP und whiffed alles", "Mic-Spammer mit Musik", "Wirft Flashes ins eigene Team"] },
          { title: "Beste → schlechteste Eco-Waffe", items: ["Deagle", "Tec-9", "P250", "Dual Berettas", "Glock-Spray"] },
        ],
      },
      nsfw: {
        label: "🔞 18+",
        sets: [
          // ── Soft entry ──
          { title: "Größter → verzeihlichster Ick", items: ["Schlechter Küsser", "Schreibt viel zu viel", "Wohnt noch bei den Eltern", "Null Ehrgeiz", "Quatscht im Kino"] },
          { title: "Bester → schlechtester Ort zum Rummachen", items: ["Ein echtes Bett (langweilig)", "Die Rückbank", "Ein Festivalzelt", "Bei den Eltern", "Im Büro"] },
          { title: "Größte → kleinste Red Flag", items: ["Schreibt noch dem Ex", "Hat keine Freunde", "Hasst Tiere", "Gibt mies Trinkgeld", "Liebt Comic Sans"] },
          { title: "Attraktivste → unwichtigste Eigenschaft", items: ["Selbstbewusstsein", "Geld", "Versauter Humor", "Sixpack", "Antwortet wirklich auf Nachrichten"] },
          { title: "Größter → kleinster Dealbreaker im Bett", items: ["Egoistisch", "Keine Mühe", "Hört nicht auf zu reden", "Lässt die Socken an", "Schläft danach sofort ein"] },
          { title: "Am meisten → am wenigsten überbewertet", items: ["Nacktbilder verschicken", "Sex unter der Dusche", "Knutschflecke", "Sexting", "Kuscheln am Morgen danach"] },
          // ── Härtere Sachen ──
          { title: "Heißeste → harmloseste Kink", items: ["Würgen", "Gefesselt werden", "Spanking", "Dirty Talk", "Augenbinde"] },
          { title: "Größtes → kleinstes Tabu, das dich trotzdem anmacht", items: ["Beim Sex beobachtet werden", "Ein Dreier", "Sex in der Öffentlichkeit", "Festgebunden werden", "Rollenspiel mit Kostüm"] },
          { title: "Am meisten → am wenigsten überbewertete Sexstellung", items: ["Doggy", "Reverse Cowgirl", "69", "Missionar", "Im Stehen"] },
          { title: "Versautestes → harmlosestes Sextoy", items: ["Strap-on", "Handschellen", "Vibrator", "Augenbinde", "Federpeitsche"] },
          { title: "Würde ich am ehesten → niemals ausprobieren", items: ["Ein Dreier", "Ein Sextape drehen", "Swingerparty", "BDSM-Dungeon", "Sex am FKK-Strand"] },
          { title: "Heißeste → unschuldigste Stelle zum Beißen", items: ["Innenschenkel", "Hals", "Nacken", "Ohrläppchen", "Bauch"] },
          { title: "Größter → kleinster Turn-on im Bett", items: ["Wird dominant", "Stöhnt deinen Namen", "Kratzt den Rücken auf", "Beißt in die Lippe", "Flüstert dreckig ins Ohr"] },
          { title: "Schmutzigster → harmlosester Ort, an dem du es getrieben hast", items: ["Auf der Arbeit", "Im Auto am Straßenrand", "Festival-Klo", "Im Hausflur", "Im Bett von Freunden"] },
          { title: "Bestes → schlimmstes Geräusch beim Sex", items: ["Lautes Stöhnen", "Deinen Namen stöhnen", "Dreckig reden", "Plötzliche Stille", "Aus Versehen lachen"] },
          { title: "Macht beim Sexting am meisten → am wenigsten an", items: ["Nacktbild ohne Vorwarnung", "Detaillierte Beschreibung", "Versaute Sprachnachricht", "Einfach 'komm vorbei'", "Emoji-Andeutungen"] },
          { title: "Heißester → langweiligster Dreier-Aufbau", items: ["Zwei Frauen", "Zwei Männer", "Paar plus eine:r", "Zwei Fremde aus der Bar", "Mit guten Freunden"] },
          { title: "Größte → harmloseste Bett-Sünde", items: ["An jemand anderen denken", "Den Namen verwechseln", "Mittendrin aufhören", "Heimlich filmen wollen", "Danach sofort einschlafen"] },
        ],
      },
    },

    en: {
      general: {
        label: "🎲 General",
        sets: [
          { title: "Best → worst superpower", items: ["Invisibility", "Flying", "Time travel", "Reading minds", "Teleportation"] },
          { title: "Best → worst pizza topping", items: ["Pineapple", "Pepperoni", "Mushroom", "Extra cheese", "Anchovies"] },
          { title: "Most → least essential app", items: ["WhatsApp", "Instagram", "TikTok", "Google Maps", "Spotify"] },
          { title: "Dream → nightmare holiday", items: ["Beach resort", "City trip", "Camping", "Cruise", "Skiing"] },
          { title: "Best → worst way to spend a Sunday", items: ["Hungover in bed", "Big brunch", "A long hike", "Gaming all day", "Family visit"] },
          { title: "Most → least useful school subject", items: ["Maths", "PE", "History", "Art", "Religion"] },
        ],
      },
      party: {
        label: "🎉 Party",
        sets: [
          { title: "Most → least acceptable drunk behaviour", items: ["Crying in the toilets", "Texting your ex", "Picking a fight", "Falling asleep", "Oversharing"] },
          { title: "Most → least classy drink", items: ["Champagne", "Craft beer", "Tequila shots", "Boxed wine", "Jägerbombs"] },
          { title: "Biggest → smallest party foul", items: ["Throwing up indoors", "Breaking something", "Spilling a drink", "Ghosting early", "Hogging the aux"] },
          { title: "Best → worst hangover cure", items: ["Greasy food", "Hair of the dog", "Sleeping till noon", "Water & painkillers", "The gym"] },
          { title: "Most → least likely to get you kicked out", items: ["Starting a fight", "Skinny dipping", "Insulting the host", "Crowd surfing", "Falling asleep"] },
          { title: "Best → worst person to be stuck next to at a party", items: ["The drunk", "The talker", "The DJ", "The ex", "The boss"] },
        ],
      },
      videogames: {
        label: "🎮 Video Games",
        sets: [
          // ── General ──
          { title: "Most → least annoying gamer type", items: ["The rage-quitter", "The mic spammer", "The smurf", "The try-hard", "The AFK farmer"] },
          { title: "Best → worst excuse after a loss", items: ["Lag", "The team's fault", "My mouse glitched", "Sun in my eyes", "Controller drift"] },
          { title: "Best → worst gaming platform", items: ["PC", "PlayStation", "Xbox", "Switch", "Phone"] },
          { title: "Most toxic → most chill community", items: ["League of Legends", "Counter-Strike", "Overwatch", "Dark Souls", "Stardew Valley"] },
          { title: "Best → worst gaming snack", items: ["Frozen pizza", "Crisps", "Energy drink", "Chocolate bar", "Yesterday's cold fries"] },
          { title: "Biggest → smallest gaming flex", items: ["1v5 clutch", "Ranked top 500", "A rare skin", "Speedrun record", "Expensive gaming chair"] },
          // ── Minecraft ──
          { title: "Scariest → most harmless mob", items: ["The Warden", "Enderman", "Creeper", "Zombie", "Chicken"] },
          { title: "Best → worst way to die in Minecraft", items: ["Creeper from behind", "Fell into lava", "Fell off the scaffolding", "Drowned", "Starved while building"] },
          { title: "Most → least valuable ore", items: ["Netherite", "Diamond", "Emerald", "Redstone", "Coal"] },
          { title: "First → last priority on night 1", items: ["Farm wood", "Craft tools", "Find food", "Build a house", "Dig a hole"] },
          { title: "Most impressive → lamest Minecraft build", items: ["Huge castle", "Automatic farm", "Pixel art", "Cobblestone tower to the sky", "Dirt house"] },
          // ── Overwatch ──
          { title: "Most → least hated hero", items: ["Widowmaker", "Mei", "Sombra", "Hanzo", "Genji"] },
          { title: "Most → least annoying ult to get hit by", items: ["Genji Blade", "Junkrat Tire", "Pharah Barrage", "Reaper Death Blossom", "Mei Blizzard"] },
          { title: "Best → worst support", items: ["Ana", "Kiriko", "Mercy", "Lúcio", "Moira"] },
          { title: "Most → least rewarding role", items: ["DPS", "Flex support", "Main tank", "Off-tank", "Main support"] },
          { title: "Biggest → smallest tilt moment", items: ["No healer on the team", "Enemy Bastion in the choke", "Mercy rezzes at the worst time", "DPS who hit nothing", "Nobody goes on the objective"] },
          // ── Counter-Strike ──
          { title: "Best → worst map", items: ["Mirage", "Inferno", "Dust 2", "Nuke", "Vertigo"] },
          { title: "Most → least stylish kill", items: ["AWP no-scope", "Knife from behind", "Deagle headshot", "AK spray", "P90 spam"] },
          { title: "Biggest → smallest tilt moment (CS)", items: ["Teamkill in the first second", "Lost 16:14", "Ace stolen by a teammate", "Lost the eco round", "Grenade into your own team"] },
          { title: "Most → least annoying teammate (CS)", items: ["Rage-quits after pistol", "Constantly yells Rush B", "Picks AWP and whiffs everything", "Mic spammer with music", "Throws flashes into your own team"] },
          { title: "Best → worst eco weapon", items: ["Deagle", "Tec-9", "P250", "Dual Berettas", "Glock spray"] },
        ],
      },
      nsfw: {
        label: "🔞 18+",
        sets: [
          // ── Soft entry ──
          { title: "Biggest → most forgivable ick", items: ["Bad kisser", "Texts way too much", "Still lives with parents", "Zero ambition", "Talks during the film"] },
          { title: "Best → worst place to hook up", items: ["A real bed (boring)", "The back seat", "A festival tent", "Parents' house", "The office"] },
          { title: "Biggest → smallest red flag", items: ["Still texts their ex", "Has no friends", "Hates animals", "Terrible tipper", "Loves Comic Sans"] },
          { title: "Most → least attractive trait", items: ["Confidence", "Money", "A filthy sense of humour", "Abs", "Actually replies to texts"] },
          { title: "Biggest → smallest dealbreaker in bed", items: ["Selfish", "No effort", "Won't stop talking", "Keeps socks on", "Falls asleep after"] },
          { title: "Most → least overrated", items: ["Sending nudes", "Shower sex", "Hickeys", "Sexting", "Morning after cuddles"] },
          // ── Harder stuff ──
          { title: "Hottest → most harmless kink", items: ["Choking", "Being tied up", "Spanking", "Dirty talk", "Blindfold"] },
          { title: "Biggest → smallest taboo that still turns you on", items: ["Being watched during sex", "A threesome", "Sex in public", "Being restrained", "Roleplay with a costume"] },
          { title: "Most → least overrated sex position", items: ["Doggy", "Reverse cowgirl", "69", "Missionary", "Standing up"] },
          { title: "Filthiest → most harmless sex toy", items: ["Strap-on", "Handcuffs", "Vibrator", "Blindfold", "Feather whip"] },
          { title: "Most → least likely to try", items: ["A threesome", "Filming a sextape", "Swingers' party", "BDSM dungeon", "Sex on a nude beach"] },
          { title: "Hottest → most innocent spot to bite", items: ["Inner thigh", "Throat", "Back of the neck", "Earlobe", "Stomach"] },
          { title: "Biggest → smallest turn-on in bed", items: ["Gets dominant", "Moans your name", "Scratches your back up", "Bites your lip", "Whispers something filthy"] },
          { title: "Filthiest → most harmless place you've done it", items: ["At work", "In a car on the roadside", "Festival toilet", "The stairwell", "In a friend's bed"] },
          { title: "Best → worst sound during sex", items: ["Loud moaning", "Moaning your name", "Talking dirty", "Sudden silence", "Accidental laughing"] },
          { title: "Turns you on most → least when sexting", items: ["A nude with no warning", "A detailed description", "A filthy voice note", "Just 'come over'", "Emoji hints"] },
          { title: "Hottest → most boring threesome setup", items: ["Two women", "Two men", "Couple plus one", "Two strangers from the bar", "With close friends"] },
          { title: "Biggest → most harmless sin in bed", items: ["Thinking of someone else", "Saying the wrong name", "Stopping halfway", "Wanting to film it secretly", "Falling asleep right after"] },
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.RankItSets = RANKIT;
})(window);
