# Vocabulario — Spanisch-Vokabel-PWA

[[INDEX]] | [[uni/spanisch/context|Spanisch (Uni)]] | [[life/spanisch-ziel/context|Spanisch-Ziel]]

## Repo-Setup (wichtig)
Dieser Ordner ist ein **eigenes Git-Repo** (`.git` liegt hier), Branch `main`.
Er liegt physisch im Vault (immer erreichbar), wird aber vom **Vault-Git ignoriert**
(`projects/spanisch-app/` steht in der PersonalOS-`.gitignore`) → kein „Repo-im-Repo"-Konflikt,
Obsidian-Backup fasst die App nicht an.

## Was es ist
Persönliche **PWA** zum Vokabeltraining per Multiple Choice, **Deutsch ↔ Spanisch**.
Läuft im Browser, per „Zum Home-Bildschirm hinzufügen" wie eine iOS-App (Vollbild, Icon, offline).
Stack: Vanilla HTML/CSS/JS, keine Frameworks.

## Stand
- Grundgerüst fertig: Multiple Choice, 🇪🇸→🇩🇪 / 🇩🇪→🇪🇸 umschaltbar, Themen-Filter, Streak + Score, offline (Service Worker), Home-Screen-Icon.
- Vokabeln: Starter-Set in `vocab.js` (Básico, Verbos, Personas, Tiempo, Lugares, Comida).

## Dateien
- `index.html` Struktur · `style.css` Design · `app.js` Logik · `vocab.js` **Wortschatz**
- `manifest.json` / `sw.js` PWA-Setup · `icon-*.png` Icons

## Lokal testen
```
cd ~/PersonalOS/projects/spanisch-app
python3 -m http.server 8123
```
→ http://localhost:8123

## Roadmap
- [ ] Kategorien schrittweise ausbauen (Körperteile, Essen, …)
- [ ] Konjugations-Modus: Verben × Person × 3 Zeitformen (Presente / Indefinido / Perfecto), regelmäßig + unregelmäßig. Quellen: [[uni/spanisch/Verben-Konjugation]], [[uni/spanisch/Grammatik/Vergangenheit-Perfecto-vs-Indefinido]]
- [ ] Hosting entscheiden (lokal vs. GitHub Pages) → echte iPhone-URL
- [ ] Ggf. GitHub-Remote (Repo aktuell nur lokal)
