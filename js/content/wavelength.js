// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * content/wavelength.js — content for Wavelength (NSFW, adults only)
 *
 * EDIT ME. Pure content, no logic. Each entry is a SPECTRUM: two opposite ends.
 * The clue-giver gets a hidden target somewhere between them and has to give a
 * clue that lands the rest of the table on the right spot. (Different shape from
 * the shared term database — these are opposite pairs — so they live here.)
 *
 * `left` is the 0 end, `right` is the 100 end. Add pairs freely.
 */
(function (global) {
  "use strict";

  var WAVELENGTH = {
    de: {
      general: {
        label: "🎲 Allgemein",
        pairs: [
          { left: "Kalt", right: "Heiß" },
          { left: "Unterschätzt", right: "Überschätzt" },
          { left: "Nutzlos", right: "Nützlich" },
          { left: "Billig", right: "Teuer" },
          { left: "Rund", right: "Spitz" },
          { left: "Schlechte Superkraft", right: "Gute Superkraft" },
          { left: "Leise", right: "Laut" },
          { left: "Leger", right: "Förmlich" },
          { left: "Gewöhnlich", right: "Selten" },
          { left: "Vergessenswert", right: "Ikonisch" },
        ],
      },
      spicy: {
        label: "🔞 18+",
        pairs: [
          { left: "Unschuldig", right: "Versaut" },
          { left: "Abturner", right: "Anturner" },
          { left: "Vanilla", right: "Kinky" },
          { left: "Mieses Date", right: "Geiles Date" },
          { left: "Ekelig", right: "Heiß" },
          { left: "Niemals", right: "Auf jeden Fall" },
          { left: "Prüde", right: "Totale Sau" },
          { left: "Zärtlich & sinnlich", right: "Hart & schmutzig" },
          { left: "Süßer One-Night-Stand", right: "Versauter One-Night-Stand" },
          { left: "Green Flag", right: "Red Flag im Bett" },
        ],
      },
      science: {
        label: "🔬 Wissenschaft & Technik",
        pairs: [
          { left: "Nutzlose Erfindung", right: "Geniale Erfindung" },
          { left: "Reine Science-Fiction", right: "Schon Realität" },
          { left: "Pseudowissenschaft", right: "Knallhart bewiesen" },
          { left: "Harmlose Technik", right: "Skynet lässt grüßen" },
          { left: "Überschätztes Gadget", right: "Unverzichtbar" },
          { left: "Datenschutz-Albtraum", right: "Völlig harmlos" },
          { left: "Von KI erzeugt", right: "Komplett menschgemacht" },
          { left: "Verschwörungstheorie", right: "Leider wahr" },
          { left: "Steinzeit-Technik", right: "Aus der Zukunft" },
          { left: "Sollte man nicht googeln", right: "Total jugendfrei" },
        ],
      },
      power: {
        label: "💰 Geld & Macht",
        pairs: [
          { left: "Pleite", right: "Stinkreich" },
          { left: "Ehrlich verdient", right: "Schmutziges Geld" },
          { left: "Kleiner Fisch", right: "Strippenzieher" },
          { left: "Niemals für Geld", right: "Sofort dabei" },
          { left: "Geldverschwendung", right: "Top-Investition" },
          { left: "Machtlos", right: "Weltherrscher" },
          { left: "Sparfuchs", right: "High-Roller" },
          { left: "Grundehrlich", right: "Korrupt bis ins Mark" },
          { left: "Träum weiter", right: "Realistischer Plan" },
          { left: "Lässt mich kalt", right: "Mein großer Traum" },
        ],
      },
      leisure: {
        label: "🏖️ Freizeit & Urlaub",
        pairs: [
          { left: "Stinklangweilig", right: "Trip des Lebens" },
          { left: "Pauschaltourist", right: "Echter Abenteurer" },
          { left: "Pure Entspannung", right: "Voller Stress" },
          { left: "Überschätztes Reiseziel", right: "Geheimtipp" },
          { left: "Couch-Hobby", right: "Adrenalin pur" },
          { left: "Geldverschwendung", right: "Jeden Cent wert" },
          { left: "Familienurlaub", right: "Party-Eskalation" },
          { left: "Instagram-Falle", right: "Echtes Erlebnis" },
          { left: "Daheim am schönsten", right: "Fernweh pur" },
          { left: "Verregnetes Zelt", right: "Luxus-Resort" },
        ],
      },
      history: {
        label: "🏛️ Politik & Geschichte",
        pairs: [
          { left: "Fußnote", right: "Wendepunkt" },
          { left: "Harmlos", right: "Tyrann" },
          { left: "Leeres Versprechen", right: "Echte Veränderung" },
          { left: "Verstaubt", right: "Brandaktuell" },
          { left: "Diplomatie", right: "Eskalation" },
          { left: "Überschätzte Figur", right: "Echte Legende" },
          { left: "Verschwörungstheorie", right: "Historisch belegt" },
          { left: "Langweiliger Schulstoff", right: "Pure Dramatik" },
          { left: "Besser vergessen", right: "Niemals vergessen" },
          { left: "Symbolpolitik", right: "Echte Macht" },
        ],
      },
      marvel: {
        label: "🦸 Marvel",
        pairs: [
          { left: "Astreiner Held", right: "Astreiner Schurke" },
          { left: "Nutzlose Superkraft", right: "Völlig OP" },
          { left: "Würde für mich sterben", right: "Verrät mich sofort" },
          { left: "Vergessene Randfigur", right: "Popkultur-Ikone" },
          { left: "Schwächster Avenger", right: "Stärkster Avenger" },
          { left: "Peinlicher Möchtegern-Bösewicht", right: "Kosmische Bedrohung" },
          { left: "Reiner Comic Relief", right: "Zum Heulen tragisch" },
          { left: "Vom MCU verhunzt", right: "Perfekt besetzt" },
          { left: "Verdient keinen eigenen Film", right: "Schreit nach Solofilm" },
          { left: "Marvel-Frau: absolut nicht", right: "Marvel-Frau: brandheiß" },
        ],
      },
      starwars: {
        label: "⭐ Star Wars",
        pairs: [
          { left: "Tief in der hellen Seite", right: "Tief in der dunklen Seite" },
          { left: "Nerviger Charakter", right: "Absoluter Fan-Liebling" },
          { left: "Reines Kanonenfutter", right: "Praktisch unaufhaltbar" },
          { left: "Prequel-Cringe", right: "Ikonischer Moment" },
          { left: "Sinnloser Tod", right: "Episches Opfer" },
          { left: "In der Cantina meiden", right: "Sofort anheuern" },
          { left: "Verrät dich sofort", right: "Loyal bis zum Tod" },
          { left: "Spürt die Macht kaum", right: "Meister der Macht" },
          { left: "Verhunztes Sequel-Chaos", right: "Perfekt erzählt" },
          { left: "Star-Wars-Frau: absolut nicht", right: "Star-Wars-Frau: brandheiß" },
        ],
      },
    },
    en: {
      general: {
        label: "🎲 General",
        pairs: [
          { left: "Cold", right: "Hot" },
          { left: "Underrated", right: "Overrated" },
          { left: "Useless", right: "Useful" },
          { left: "Cheap", right: "Expensive" },
          { left: "Round", right: "Pointy" },
          { left: "Bad superpower", right: "Good superpower" },
          { left: "Quiet", right: "Loud" },
          { left: "Casual", right: "Formal" },
          { left: "Common", right: "Rare" },
          { left: "Forgettable", right: "Iconic" },
        ],
      },
      spicy: {
        label: "🔞 18+",
        pairs: [
          { left: "Innocent", right: "Filthy" },
          { left: "Turn-off", right: "Turn-on" },
          { left: "Vanilla", right: "Kinky" },
          { left: "Bad date", right: "Great date" },
          { left: "Ick", right: "Hot" },
          { left: "Would never", right: "Absolutely would" },
          { left: "Prude", right: "Total freak" },
          { left: "Soft & sensual", right: "Rough & nasty" },
          { left: "Cute hookup", right: "Filthy hookup" },
          { left: "Green flag", right: "Red flag in bed" },
        ],
      },
      science: {
        label: "🔬 Science & Tech",
        pairs: [
          { left: "Useless invention", right: "Genius invention" },
          { left: "Pure sci-fi", right: "Already real" },
          { left: "Pseudoscience", right: "Rock-solid proven" },
          { left: "Harmless tech", right: "Skynet says hi" },
          { left: "Overrated gadget", right: "Can't live without it" },
          { left: "Privacy nightmare", right: "Totally harmless" },
          { left: "AI-generated", right: "Fully human-made" },
          { left: "Conspiracy theory", right: "Sadly true" },
          { left: "Stone-age tech", right: "From the future" },
          { left: "Don't google it", right: "Safe to google" },
        ],
      },
      power: {
        label: "💰 Money & Power",
        pairs: [
          { left: "Broke", right: "Filthy rich" },
          { left: "Honestly earned", right: "Dirty money" },
          { left: "Small fish", right: "Puppet master" },
          { left: "Never for money", right: "Instantly in" },
          { left: "Waste of money", right: "Top investment" },
          { left: "Powerless", right: "Rules the world" },
          { left: "Penny-pincher", right: "High roller" },
          { left: "Squeaky clean", right: "Corrupt to the core" },
          { left: "Keep dreaming", right: "Realistic plan" },
          { left: "Leaves me cold", right: "My big dream" },
        ],
      },
      leisure: {
        label: "🏖️ Leisure & Travel",
        pairs: [
          { left: "Dead boring", right: "Trip of a lifetime" },
          { left: "Package tourist", right: "True adventurer" },
          { left: "Pure relaxation", right: "Total stress" },
          { left: "Overrated spot", right: "Hidden gem" },
          { left: "Couch hobby", right: "Pure adrenaline" },
          { left: "Waste of money", right: "Worth every cent" },
          { left: "Family holiday", right: "Party blowout" },
          { left: "Instagram trap", right: "Real experience" },
          { left: "Best at home", right: "Pure wanderlust" },
          { left: "Rainy tent", right: "Luxury resort" },
        ],
      },
      history: {
        label: "🏛️ Politics & History",
        pairs: [
          { left: "Footnote", right: "Turning point" },
          { left: "Harmless", right: "Tyrant" },
          { left: "Empty promise", right: "Real change" },
          { left: "Dusty", right: "Red-hot topical" },
          { left: "Diplomacy", right: "Escalation" },
          { left: "Overrated figure", right: "Genuine legend" },
          { left: "Conspiracy theory", right: "Documented fact" },
          { left: "Boring school stuff", right: "Pure drama" },
          { left: "Best forgotten", right: "Never forget" },
          { left: "Symbolic gesture", right: "Real power" },
        ],
      },
      marvel: {
        label: "🦸 Marvel",
        pairs: [
          { left: "Pure hero", right: "Pure villain" },
          { left: "Useless power", right: "Totally OP" },
          { left: "Would die for me", right: "Betrays me instantly" },
          { left: "Forgotten side character", right: "Pop-culture icon" },
          { left: "Weakest Avenger", right: "Strongest Avenger" },
          { left: "Cringe wannabe villain", right: "Cosmic-level threat" },
          { left: "Pure comic relief", right: "Tragic to the bone" },
          { left: "Butchered by the MCU", right: "Perfectly cast" },
          { left: "Needs no solo film", right: "Begging for a solo film" },
          { left: "Marvel woman: absolutely not", right: "Marvel woman: red hot" },
        ],
      },
      starwars: {
        label: "⭐ Star Wars",
        pairs: [
          { left: "Deep light side", right: "Deep dark side" },
          { left: "Annoying character", right: "Total fan favourite" },
          { left: "Pure cannon fodder", right: "Basically unstoppable" },
          { left: "Prequel cringe", right: "Iconic moment" },
          { left: "Pointless death", right: "Epic sacrifice" },
          { left: "Avoid in the cantina", right: "Recruit on sight" },
          { left: "Betrays you instantly", right: "Loyal to the death" },
          { left: "Barely Force-sensitive", right: "Master of the Force" },
          { left: "Butchered sequel mess", right: "Perfectly told" },
          { left: "Star Wars woman: absolutely not", right: "Star Wars woman: red hot" },
        ],
      },
    },
  };

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.WavelengthSpectrums = WAVELENGTH;
})(window);
