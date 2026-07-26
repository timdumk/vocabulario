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

## Stand (Feature-Ausbau abgeschlossen, Client-Seite)
- **Übungsarten:** Auswahl (Multiple Choice) · Schreiben (Textfeld, tolerant) · Karten (umdrehen + Selbstbewertung).
- **Spaced Repetition:** Leitner-Boxen je Wort (`progress`-Store), fällige/schwache Wörter bevorzugt. Abschaltbar.
- **Audio:** 🔊 vorlesen (SpeechSynthesis `es-ES`) + Auto-Vorlesen-Toggle.
- **Statistik** (in „Mehr"): geübt / gemeistert / Trefferquote + Themen-Balken.
- **Eigene Vokabeln:** in-App hinzufügen/löschen (`customVocab`), Suche/Filter in der Liste.
- **Verben:** 18 Verben × Presente/Indefinido/Perfecto/**Condicional** + **Sonderfälle** gustar/haber.
- Basis: 96 Vokabeln (8 Kategorien), 🇪🇸↔🇩🇪, Themen-Mehrfachauswahl, Dark/Light, Streak, offline, Home-Screen-Icon.

## Dateien
- `index.html` Struktur · `style.css` Design · `app.js` Logik · `vocab.js` **Wortschatz** · `verbs.js` **Verben + Sonderfälle**
- `manifest.json` / `sw.js` PWA-Setup (Cache-Version bei jedem Deploy hoch) · `icon-*.png` Icons

## localStorage-Keys
`progress` (Leitner) · `customVocab` · `marked` · `errors` · `stats` · `cats`/`knownCats` · `theme` · `srs` · `autoSpeak` · `practice` · `mode`/`dir`/`tense`/`type`

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
- [ ] **LATER — Backend-Meilenstein** (bewusst zurückgestellt): Login + Geräte-Sync + KI-Beispielsätze.
  Empfohlener Stack: Supabase (Auth + Postgres + Edge Functions). Beendet „gratis-statisch".
