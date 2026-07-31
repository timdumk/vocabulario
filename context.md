# Vocabulario — Spanisch-Vokabel-PWA

[[INDEX]] | [[uni/spanisch/context|Spanisch (Uni)]] | [[life/spanisch-ziel/context|Spanisch-Ziel]]

## Live
- **App:** https://timdumk.github.io/vocabulario/  (GitHub Pages, HTTPS, offline-fähig)
- **Repo:** https://github.com/timdumk/vocabulario  (public)
- Aufs iPhone: URL in Safari öffnen → Teilen → „Zum Home-Bildschirm".
- Deployen nach Änderung: `git -C ~/PersonalOS/projects/spanisch-app push` → Pages baut automatisch (~1 Min).

## Repo-Setup (wichtig)
Dieser Ordner ist ein **eigenes Git-Repo** (`.git` liegt hier), Branch `main`, Remote `origin` → GitHub.
Er liegt physisch im Vault (immer erreichbar), wird aber vom **Vault-Git ignoriert**
(`projects/spanisch-app/` steht in der PersonalOS-`.gitignore`) → kein „Repo-im-Repo"-Konflikt,
Obsidian-Backup fasst die App nicht an.

## Was es ist
Persönliche **PWA** zum Vokabeltraining per Multiple Choice, **Deutsch ↔ Spanisch**.
Läuft im Browser, per „Zum Home-Bildschirm hinzufügen" wie eine iOS-App (Vollbild, Icon, offline).
Stack: Vanilla HTML/CSS/JS, keine Frameworks.

## Stand (Redesign abgeschlossen — 2026-07-29)
- **Navigation:** 4 Tabs — **Home** · Vokabeln · Fehler · Mehr. Der frühere „Üben"-Tab ist weg.
- **Home:** Begrüßung + Datum, **Tages-Streak**-Kachel, **Tagesziel-Ring** (SVG, Verlauf),
  dominante CTA „Weiter lernen", Vorschau der letzten 3 Fehler.
- **Übung = Vollbild-Flow** ohne Tab-Bar: Start-Sheet (Modus/Übungsart/Filter/Länge) →
  Fortschrittsbalken + X mit Bestätigung → **Zusammenfassung** (Trefferquote, geübt/richtig/falsch).
  Rundenlänge **10 Fragen** oder **Endlos**.
- **Übungsarten:** Wahl (Multiple Choice) · Schreiben · Karten (Vokabeln) / **Tabelle** (Verben) · **Lücke** (Satz mit fehlendem Wort).
- **Verben lernen mit:** Konjugation nutzt seit v33 dieselbe Wiederholungslogik wie Vokabeln.
  Schlüssel `verb:<infinitiv>:<zeit>` (18 × 4 = 72) und `special:<infinitiv>` (gustar, haber).
  Verbfehler landen im Fehler-Tab, lassen sich markieren und zählen in der Statistik (Balken „Konjugation").
- **Nachdrill:** Falsch beantwortete Fragen kommen am Ende derselben Runde erneut — ohne die Trefferquote zu verändern.
- **Sicherung:** *Mehr → Daten* exportiert alles als JSON (Zwischenablage **oder** Datei) und spielt es zurück.
  Auf dem iPhone ist der Zwischenablage-Weg der verlässliche; Datei-Downloads sind in einer Standalone-PWA unzuverlässig.
- **Beispielsätze:** `sentences.js`, 160 Stück. **Selbst geschrieben auf A2-Niveau, NICHT aus dem Kursbuch** —
  für Klausurzitate ungeeignet. Erscheinen erst nach dem Antworten und speisen den Lückentext.
- **Spaced Repetition:** Leitner-Boxen je Wort (`progress`-Store), fällige/schwache Wörter bevorzugt. Abschaltbar.
- **Audio:** 🔊 vorlesen (SpeechSynthesis `es-ES`) + Auto-Vorlesen · **Soundeffekte** per WebAudio (Standard aus).
- **Vibration** (Standard an, abschaltbar unter *Mehr → Ton*): `navigator.vibrate()` auf Android/Desktop.
  **iOS Safari kennt navigator.vibrate() nicht** — dort legt die App einen unsichtbaren
  `<input type="checkbox" switch>` um (nativer Schalter ab iOS 17.4, sein Umlegen erzeugt ein
  System-Tippen). Das ist ein Umweg, kein API: Apple kann ihn schließen, und bei synthetischen
  Klicks ist er nicht garantiert. Stärke lässt sich auf diesem Weg nicht steuern.
- **Meilensteine:** dezenter Badge-Pop bei Tagesziel, 7/30/100 Tage Streak, 50/100/200 geübten Vokabeln. Je einmal.
- **Statistik** (in „Mehr"): geübt / gemeistert / Trefferquote + dicke Themen-Balken mit Prozent im Balken.
- **Personalisierung:** 4 **Akzentpaletten** (Bordeaux · Océano · Bosque · Índigo), **Schriftgröße** (klein/mittel/groß),
  Dunkelmodus, **Tagesziel** (10/20/30/50).
- **Eigene Vokabeln:** in-App hinzufügen/löschen (`customVocab`), Suche/Filter in der Liste.
- **Verben:** 18 Verben × Presente/Indefinido/Perfecto/**Condicional** + **Sonderfälle** gustar/haber.
- Basis: **779 Vokabeln (19 Kategorien)** + **74 Konjugations-Einheiten**, 🇪🇸↔🇩🇪, offline, Home-Screen-Icon.
  Themen: Básico · Verbos · Personas · Tiempo · Lugares · Comida · Frutas y verduras · La cocina ·
  La casa · Aprender idiomas · Biografía · Carácter · Saludos y estado · Ocio · Salud ·
  Antes y ahora · Fiestas · Ubicación · El cuerpo.
  Quellen: alle zehn Einheiten aus [[uni/spanisch/Vokabeln/Unit-1-El-espanol-y-tu|Aula Internacional Plus 2 (A2)]].
  Zeilen mit `// +` in `vocab.js` sind Alltagsergänzungen, die **nicht** im Kursglossar stehen.

## Design-System
Alle Farben, Radien, Abstände, Schriftgrößen und Schatten liegen als **Tokens** im `:root`-Block von `style.css`.
Regel: **außerhalb dieses Blocks keine hartkodierten Werte** — immer `var(--token)`.
- Radien: `--r-sm` (Listenzeilen) · `--r-md` (Buttons/Chips/Felder) · `--r-lg` (Panels/Kacheln) · `--r-xl` (Hauptkarten) · `--r-pill` (nur Segment-Umschalter/Badges)
- Typo: `--fs-display` / `-title` / `-headline` / `-lead` / `-body` / `-label` / `-caption` / `-micro` (alle in `rem`)
- Spacing `--sp-1`…`--sp-6` = 4/8/12/16/24/32 · Tiefe `--elev-1/2/3`
- Themes: `body.dark` · Akzente `body.accent-*` (dunkel gewinnt über `body.dark.accent-*`)
- **Fallstrick:** Tokens nie über andere Tokens aliasen (`--a: var(--b)`) — das wird schon auf `:root`
  aufgelöst und ignoriert spätere Theme-Overrides.

## Dateien
- `index.html` Struktur · `style.css` Design-Tokens + Design · `app.js` Logik
- `vocab.js` **Wortschatz** · `verbs.js` **Verben + Sonderfälle** · `sentences.js` **Beispielsätze**
- `manifest.json` / `sw.js` PWA-Setup (Cache-Version bei jedem Deploy hoch, `sentences.js` steht in `ASSETS`) · `icon-*.png` Icons

## Regeln für neue Vokabeln
- **Kein doppelter `es`-Schlüssel.** `progress` schlüsselt darauf, `vocabByKey()` findet nur den ersten
  Treffer — Dubletten teilen sich lautlos den Lernfortschritt. Zwei Bedeutungen → **ein** Eintrag
  (`la planta` = „die Etage / die Pflanze").
- **Keine zwei Wörter mit identischer deutscher Bedeutung**, sonst ist die Frage Richtung
  Deutsch→Spanisch nicht eindeutig lösbar. Synonyme in einen Eintrag mit `/`
  (`la nevera / el frigorífico`) — `writeCorrect()` akzeptiert beim Schreiben jede Variante.
  Ausnahme: echter Bedeutungsunterschied im Klammerzusatz (`ser` „sein (dauerhaft)" vs. `estar`).
- Substantive **immer mit Artikel**; `stripFluff()` ignoriert ihn beim Schreib-Vergleich.
- Reihenfolge der Themen = Reihenfolge des ersten Auftretens in `vocab.js` (`allCats`).
- **Neue Beispielsätze:** Der Satz muss das Zielwort **wörtlich** enthalten, sonst lässt sich keine Lücke
  bilden. Bei Verben heißt das: Infinitiv im Satz (`Tengo que estudiar…`), nicht die konjugierte Form.
- Prüfskript für beide Dateien siehe Verifikation im Plan — bei 779 Wörtern ist Handprüfung nicht mehr möglich.

## localStorage-Keys
`progress` (Leitner) · `customVocab` · `marked` · `errors` · `stats` (Antwort-Streak) ·
**`daily`** (Tagesziel/Tages-Streak: date/count/goal/streak/lastGoalDate/best) ·
**`milestones`** · **`len`** (Rundenlänge, 0 = endlos) · **`sfx`** · **`accent`** · **`fontSize`** ·
`cat` · `theme` · `srs` · `autoSpeak` · `practice` (mc/write/cards/table/**gap**) · `mode`/`dir`/`tense`/`type`

`daily` enthält seit v33 zusätzlich **`done`** — Liste der Tage mit erreichtem Ziel (Wochen-Kalender, max. 60).

## Rollback
Stand vor dem Redesign: Tag **`pre-redesign`** (`git checkout pre-redesign`).

## Lokal testen
```
cd ~/PersonalOS/projects/spanisch-app
python3 -m http.server 8123
```
→ http://localhost:8123

## Modi
- **Vokabeln:** Wort ↔ Bedeutung, 🇪🇸↔🇩🇪, Themenfilter.
- **Verben:** Konjugation abfragen (Person · Zeitform → Form). Filter: Zeit (Alle/Presente/Indefinido/Perfecto) + Typ (Alle/Regelmäßig/Unregelmäßig). Daten in `verbs.js`, Perfecto automatisch aus `haber + Partizip`. Quelle: [[uni/spanisch/Verben-Konjugation]].

## Roadmap
- [x] Konjugations-Modus + alle 18 Verben + Condicional + Sonderfälle
- [x] Vokabel-Kategorien ausgebaut (Ubicación, El cuerpo)
- [x] Hosting: GitHub Pages (https://timdumk.github.io/vocabulario/)
- [x] Feature-Ausbau Phasen 1–5 (SRS, Übungsarten, Statistik, eigene Vokabeln)
- [x] **Redesign 2026-07-29:** Design-Tokens, Home-Screen, immersiver Übungs-Flow,
  Tages-Streak + Tagesziel, Meilensteine, Akzentpaletten, Schriftgröße, Soundeffekte
- [x] **Ausbau 2026-07-31:** Verben im Lernalgorithmus · Export/Import · 8 Kurseinheiten (294 → 779 Wörter) ·
  160 Beispielsätze · Lückentext · Nachdrill · Wochen-Kalender
- [ ] **LATER — Backend-Meilenstein** (bewusst zurückgestellt): Login + Geräte-Sync + KI-Beispielsätze.
  Empfohlener Stack: Supabase (Auth + Postgres + Edge Functions). Beendet „gratis-statisch".
