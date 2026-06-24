# Spielecke — Game Spec: „Hochadel"

A Klattschen-style drinking card game for Spielecke. Players draw action cards in turn;
the cards command who must **dienen** (the in-game word for *drink*). Theme is royal-court
etiquette: misbehaviour at court is punished by serving.

This is a new game module that plugs into the **existing Spielecke shell** (Game Module
Contract from `PARTY-APP-SPEC.md`). It reuses the shared roster, the namespaced store, and
`goHome()`. Don't rebuild shell infrastructure.

---

## 1 — Identity & Editions

- **Game name:** Hochadel
- **Active edition:** **Diener & Könige** (men's edition). Build this fully.
- **Future edition (STUB ONLY):** **Rapunzel-Edition**. Place a visible button/card on the
  Hochadel start screen labelled "Rapunzel-Edition", shown as **locked / coming soon**
  (disabled state, no game behind it yet). It must exist in the UI now so the structure is
  ready; tapping it does nothing or shows a "bald verfügbar" note.
- The architecture must allow a second edition to be a **swappable card set** later — same
  engine, different deck + flavour. Build the deck as data so an edition = a data file.

### The core verb: **dienen**
"dienen" replaces "trinken" everywhere in this game. A card that punishes someone makes them
*dienen*. It must work as a shouted accusation, e.g. "Spieker, dienen!!" Use it consistently
in all card text and UI.

---

## 2 — The Four Card Types & Colour Coding (royal heraldic palette)

Every card has a type that drives its colour and its mechanic. Colour must be obvious at a
glance, including on a phone. No green in the set (red-green-safe).

| Type | Name | Colour | Hex | Behaviour |
|------|------|--------|-----|-----------|
| 1 | **Sofort-Aktion** | Karmesin / crimson | `#9B1B30` | Execute once, then discard. The common card. |
| 2 | **Passiv / Regel** | Saphir / royal blue | `#1B3A6B` | Becomes a standing rule until game end. **Stacks** with other active rules. Stays visible in a rules area. |
| 3 | **Aktive Karte** | Gold / amber | `#C9A227` | Stays face-up in front of the drawer. Holds a latent power the player triggers themselves later. |
| 4 | **Minispiel** | Purpur / violet | `#5B2A86` | Starts a self-contained mini-game that runs until a loser is decided; that loser dient; then it's over. |

Engine implications:
- Type 2 cards must be added to a persistent, on-screen **„Hofgesetze"** (court-rules) list
  that grows as the game goes on. The list survives across turns until the game is reset.
- Type 3 cards must be tracked **per player** — the app shows who currently holds which
  face-up active card, since the player decides when to trigger it. Provide a way to mark an
  active card as "used/spent" (then it's discarded).
- Type 1 and Type 4 resolve and discard.

---

## 3 — Standing Ground Rules (always on, independent of the deck)

Two only. Display them permanently (e.g. a fixed strip / footer) so nobody forgets:

1. **Höfische Zunge** — Am Hofe wird nicht geflucht. Wer flucht, dient.
2. **Der rechte Ruf** — Es heißt nicht „trinken", es heißt *dienen*. Wer sich verspricht,
   dient. (Anklage: „Spieker, dienen!!")

These are not cards. They're rendered as fixed game rules visible the whole session.

---

## 4 — Turn Flow

1. From Spielecke shelf → Hochadel → edition select (Diener & Könige active; Rapunzel
   locked).
2. Roster already known from shell. Establish a turn order (use roster order; allow a
   shuffle).
3. **Reihum:** the active player taps **„Karte ziehen"**. A card is drawn from the deck,
   shown large, coloured by type.
4. Resolve by type:
   - **Karmesin:** do what it says, tap „Erledigt", pass turn.
   - **Saphir:** the rule is added to **Hofgesetze**; stays for the rest of the game. Pass.
   - **Gold:** card goes face-up to this player's area; the app records they hold it. Pass.
     Player may trigger it on any later moment via a „Auslösen" control; mark spent after.
   - **Purpur:** launch the mini-game UI; run it to a loser; loser dient; return to flow.
5. Deck handling: shuffle at start; when exhausted, reshuffle the discard (excluding still-
   active Gold cards in play and the standing Saphir rules). Keep it endless.
6. **Back to shelf** and **Spiel zurücksetzen** (clears Hofgesetze + active cards) always
   available.

---

## 5 — The Deck (Diener & Könige edition)

Cards stored as editable data so content/wording is trivial to tweak. Suggested shape:

```js
const HOCHADEL_DECK = [
  { id, type: "sofort"|"regel"|"aktiv"|"minispiel", title, text, /* optional */ data },
  // ...
];
```

Card text below is the agreed wording. Refine flavour later; logic is fixed by `type`.

### 5.1 Sofort-Aktionen (Karmesin)

1. **Mannen des Reichs** — Alle Männer dienen.
2. **Die Damen des Hofes** — Alle Frauen dienen. *(Königs-Edition meist gegenstandslos;
   bleibt für Rapunzel/gemischte Runden im Deck — könnte in der Königs-Edition deaktiviert
   oder als seltener Gag belassen werden. Default: im Deck lassen.)*
3. **Fingerzeig des Königs** — Bestimme einen Untertan. Er dient doppelt.
4. **Der linke Nachbar** — Dein Nachbar zur Linken dient.
5. **Eigene Schmach** — Du selbst dienst. Wie unköniglich.
9. **Der Jüngste im Reich** — Der Jüngste am Hofe dient.
10. **Der Greis** — Der Älteste am Hofe dient.
11. **Höfische Affären** — Wer schon einen am Tisch geküsst hat, dient.
12. **Das schwächste Glied** — Bestimmt das schwächste Glied der Tafel. Es dient.
13. **Der Wasserfall** — Du beginnst zu dienen; reihum darf erst enden, wer vor ihm endet.
    (Der König eröffnet, das Volk folgt.)
17. **Gunst des Königs** — Verteile zwei Dienste frei unter den Anwesenden.

### 5.2 Passiv / Regeln (Saphir — gelten bis Spielende, stapeln in „Hofgesetze")

18. **Adelsnamen** — Ab jetzt nur noch Nachnamen am Hofe. Vorname = dienen.
19. **Der Trinkspruch** — Vor jedem Dienst spricht man: „Zum Wohl, werte Herrschaften."
    Vergessen = dienen.
21. **Verbotene Zustimmung** — Das Wort „Ja" ist fortan verbannt. Verstoß = dienen.
22. **Höfische Anrede** — Ab jetzt siezt sich der gesamte Hof. Verstoß = dienen.
23. **Bund auf Lebenszeit** — Wähle einen Verbündeten. Dient einer, dient der andere mit.
    Bis Spielende. *(Engine: link two players so the rules list notes the pairing.)*

### 5.3 Aktive Karten (Gold — face-up, self-triggered, mostly einmalig)

27. **Das U-Boot** — Hebst du den Daumen, müssen alle folgen. Der Letzte dient. Jederzeit,
    einmalig.
30. **Das Schutzschild** — Einmal im Spiel wehrst du einen Dienst vollständig ab.
31. **Die Sanduhr** — Setze heimlich eine Frist (Handy/Timer). Läuft sie ab, dient, wer
    gerade spricht.
32. **Der Spiegel** — Einmal im Spiel lenkst du den nächsten Dienst, der dich träfe, auf den
    Absender zurück.

### 5.4 Minispiele (Purpur — laufen bis zum Verlierer, dann zurück in den Spielfluss)

4. **Die Fingerschlacht** — Alle legen die Faust zur Tafel und strecken heimlich den Daumen
   aus oder nicht. **Reihum nennt einer eine Zahl**; trifft die genannte Zahl die Anzahl der
   tatsächlich gehobenen Daumen, scheidet der Sprecher aus. Es geht reihum weiter, bis nur
   noch zwei übrig sind — **die letzten zwei dienen.**
   - Engine: needs a guided UI — pick caller order, reveal thumbs count, eliminate on match,
     loop until two remain.
7. **Reim oder Schmach** — Die Karte nennt einen **Vers** (eine Zeile). Reihum dichtet jeder
   in **fünf Sekunden** einen Reim/Folgevers darauf. Wer stockt oder die Frist reißt, dient.
   - Engine: display the given verse, run a visible 5-second timer per player, advance
     around the table; host taps "geschafft" / "gestockt".
   - **Content needed:** a pool of opening verses (Versvorrat) — Paul to fill. Store as data.
8. **Trommelfeuer** — Der Zieher ruft eine Kategorie. Reihum je ein Begriff im Takt. Wer
   patzt oder wiederholt, dient. *(Note: mechanically similar to the standalone „The Bomb"
   game already in Spielecke — kept deliberately at Paul's request as an in-deck card
   variant. Keep implementation light; no timer-bomb needed, just turn-policing.)*

---

## 6 — Content still to be filled by Paul

- **Versvorrat** for „Reim oder Schmach" (opening verses).
- Optional: more cards per type, inside-jokes, MMA/World-Cup-flavoured court cards.
- Final flavour pass on all card titles/texts (wording here is the working draft).
- Decide whether card 2 („Die Damen des Hofes") is disabled in the men's edition.

---

## 7 — Acceptance Criteria

- Four card types render in their correct heraldic colours and behave per §2.
- Saphir rules accumulate in a persistent, always-visible „Hofgesetze" list during a session.
- Gold active cards are tracked per player, shown face-up, and can be marked spent.
- The two standing ground rules are permanently visible.
- „Die Fingerschlacht" and „Reim oder Schmach" run as guided mini-games to a clear loser.
- Deck is endless (reshuffle), respecting still-active Gold cards and standing rules.
- Rapunzel-Edition button is present but locked.
- „dienen" is used consistently; no „trinken" leaks into the UI.
- Plugs into the existing shell via the Game Module Contract; reuses shared roster; cleans
  up timers (Sanduhr, Reim-timer) on unmount.
- Works on the MacBook on the table and on a phone passed around; relative asset paths so it
  runs under the GitHub Pages subpath.
