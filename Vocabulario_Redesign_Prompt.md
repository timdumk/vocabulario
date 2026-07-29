# Redesign-Auftrag: Vocabulario App

Dieser Prompt ist für Claude (Code) gedacht. Kopier ihn komplett und lass ihn Schritt für Schritt abarbeiten.

---

## 0. Vor dem Start

Prüfe zuerst die bestehende Codebasis, bevor du irgendetwas änderst:

- Welches Framework wird verwendet (vermutlich SwiftUI, anhand der Optik)?
- Wie ist die Navigation aktuell aufgebaut (TabView? NavigationStack?)
- Wo sind Farben/Radien/Abstände aktuell definiert — zentral oder in jeder View einzeln hartkodiert?
- Wo liegt das bestehende Grün/Rot-Feedback-System (richtig/falsch) und die Haptik/Sound-Logik?

Bestätige kurz, was du vorfindest, bevor du mit Schritt 1 beginnst. Bei Unklarheiten nachfragen statt zu raten.

---

## 1. Kontext

Vocabulario ist eine private iOS-App zum Spanischlernen (Vokabeln + Verben, Übungsmodi: Auswahl/Schreiben/Karten, Fehler-Tracking, Statistik). Aktueller Zustand: funktional, aber gestalterisch flach — jedes Element (Tabs, Filter, Buttons, Karten) nutzt dieselbe Capsule-Form ohne Hierarchie oder Tiefe. Es gibt keinen eigenen Home-Screen, und der Übungsmodus ist nur ein Tab unter vielen statt eines eigenen fokussierten Erlebnisses.

**Bereits vorhanden und NICHT neu bauen:**
- Grün/Rot-Feedback bei richtig/falsch beantworteten Vokabeln
- Haptisches Feedback
- Soundeffekte

Diese Systeme sollen ins neue Design integriert, aber nicht ersetzt werden.

---

## 2. Design-Richtung

Ziel: Gamification-**Logik** wie Duolingo (Streak, Fortschrittsvisualisierung, Meilensteine), aber optische Umsetzung ruhig und hochwertig wie Revolut/Airbnb. Kein Maskottchen, keine verspielten/kindlichen Illustrationen, kein Vollbild-Konfetti.

Bestehende Farbpalette (Bordeaux/Weinrot, Rosa, Gold) bleibt erhalten — sie ist bereits untypisch genug für generisches KI-Design. Das Problem ist die flache Umsetzung, nicht die Farbwahl.

---

## 3. Design-System (Tokens) — als Erstes bauen

Bevor einzelne Screens verändert werden, ein zentrales Theme/Design-Tokens-File anlegen, aus dem alle Views ihre Werte ziehen. Keine hartkodierten Farben/Radien mehr in einzelnen Views danach.

**Farben:**
- Primärfarbe (Rosa), Sekundärfarbe (Gold), Hintergrundverlauf (Bordeaux/Weinrot dunkel)
- Success/Error (bestehend, nur ins System übernehmen)
- Oberflächen-Ebenen: Background, Surface, Surface-Elevated (für Tiefe zwischen Hintergrund und Karten)
- Text-Ebenen: Primary, Secondary, Tertiary (aktuell nur ein Grauton für alle Sekundärtexte — das differenzieren)

**Typografie-Skala:**
- Display (große Zahlen/Streak-Anzeige), Title (Screen-Titel), Headline (Karten-Fragen), Body (Antwortoptionen), Caption (Metadaten)
- Klare Größen- und Gewichtsstufen, nicht überall dieselbe Bold-Rounded-Gewichtung

**Spacing-Skala:** 4 / 8 / 12 / 16 / 24 / 32

**Radius-Skala:**
- Small (Listenzeilen, Vokabel-Einträge)
- Medium (Buttons, Filter-Chips)
- Large (Hauptkarten, Übungskarte)

Aktuell nutzt alles denselben großen Radius — das ist der Hauptgrund für die fehlende Hierarchie.

**Elevation/Schatten:** 2-3 Stufen für Tiefe (Karte schwebt sichtbar über dem Hintergrund, nicht nur hellere Fläche).

---

## 4. Screens im Detail — in dieser Reihenfolge umsetzen

### Schritt 1: Design-Tokens
Siehe Abschnitt 3. Diese Datei zuerst anlegen, alle folgenden Schritte darauf aufbauen.

### Schritt 2: Neuer Home-Screen (erster Tab)
- Begrüßung/Datum oben, dezent, klein
- Streak-Kachel: große Zahl im Fokus (Display-Typografie), minimalistisches Icon statt Maskottchen
- Tagesziel-Fortschritt: Ring oder Balken mit Farbverlauf, aktuelle/Ziel-Zahl groß daneben
- Primäre CTA "Weiter lernen": visuell klar dominant (Elevation, Primärfarbe, größte Touch-Fläche auf dem Screen)
- Kurzüberblick letzte Fehler (max. 2-3 Einträge, Link zum Fehler-Tab)
- Kein "Vocabulario"-Header nötig — Home hat eigene Identität, keine Wiederholung des App-Namens auf jedem Screen

### Schritt 3: Übungsmodus als eigener immersiver Flow
- Beim Start einer Übung: kein TabView-Chrome mehr sichtbar (kein Tab-Bar, kein "Vocabulario"-Header)
- Oben stattdessen: schlanker Fortschrittsbalken (aktuelle Frage / Gesamtzahl) + X-Button zum Verlassen (mit Bestätigungsdialog, falls schon mehrere Fragen beantwortet wurden)
- Frage/Karte im Zentrum, Antwortoptionen darunter — bestehendes Richtig/Falsch-Feedback beibehalten, aber Übergang zur nächsten Frage mit Spring-Animation (leichtes Slide + Fade)
- Nach Abschluss der Übung: Zusammenfassungs-Screen (Trefferquote, Anzahl geübt, kurze Erfolgsmeldung), dann zurück zu Home

### Schritt 4: Vokabeln-Liste verfeinern
- Radius/Spacing an neues Token-System anpassen (Listenzeilen kompakter, kleinerer Radius als aktuell)
- Suchleiste optisch abheben (Elevation/Schatten statt reinem Outline-Look)
- Stern/Favoriten-Toggle mit kleiner Animation (Bounce + Fill-Transition statt hartem Umschalten)

### Schritt 5: Fehler-Tab verfeinern
- "Diese X üben"-Button stärker vom Rest abheben (Elevation, klar als primäre Aktion erkennbar)
- Fehlerkarten mit klarem Statusindikator statt reinem Text-Badge (z.B. kleines Icon + Farbe statt nur "Fehler"-Label)

### Schritt 6: Mehr/Einstellungen ausbauen
- Statistik-Kacheln: größere Zahlen (Display-Typografie), klarerer Kontrast
- Fortschrittsbalken pro Thema: deutlich dicker, mit Farbverlauf statt Volltonfarbe, Prozentzahl im Balken statt danebenstehend (aktuell kaum lesbar)
- Neue Personalisierungs-Optionen ergänzen:
  - Akzentfarbe wählen (3-4 Paletten zur Auswahl, inkl. der aktuellen Bordeaux/Rosa/Gold als Standard)
  - Sound an/aus (falls noch nicht als Toggle vorhanden)
  - Haptik an/aus (falls noch nicht als Toggle vorhanden)
  - Schriftgröße (klein/mittel/groß)

---

## 5. Animation & Interaktion (durchgehend über alle Screens)

- Tab-Wechsel: leichtes Fade/Slide, kein harter Cut
- Neue Frage/Karte: Scale + Fade beim Erscheinen
- Meilenstein-Feiern (z.B. 100 Vokabeln geübt, 7-Tage-Streak): kurze dezente Celebration — z.B. Badge-Pop mit Haptic-Success, KEIN Vollbild-Konfetti
- Alle Animationen spring-basiert, Dauer 0.2-0.4 Sekunden, kein übertriebenes Overshoot

---

## 6. Was ausdrücklich NICHT gemacht werden soll

- Bestehendes Grün/Rot-Feedback-System nicht neu bauen — nur ins neue Farb-/Elevation-System integrieren
- Keine Maskottchen, keine verspielten oder kindlichen Illustrationen
- Keine identischen Capsule-Formen mehr für alle Elemente (Tabs, Filter, Buttons, Karten müssen sich unterscheiden)
- Kein Vollbild-Konfetti oder übertriebene Gamification-Effekte
- Keine hartkodierten Farben/Radien/Abstände mehr außerhalb des zentralen Design-Tokens-Systems

---

## 7. Vorgehen

1. Schritte 1 bis 6 nacheinander abarbeiten, nicht parallel
2. Nach jedem Schritt: kurze Zusammenfassung, was geändert wurde und in welchen Dateien
3. Bei Unklarheiten zur bestehenden Codestruktur nachfragen statt zu raten
4. Am Ende: vollständige Liste aller neuen/geänderten Dateien
