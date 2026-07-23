# Vocabulario

Persönliche PWA zum Spanisch-Vokabeltraining (Multiple Choice). Läuft im Browser,
per „Zum Home-Bildschirm hinzufügen" wie eine iOS-App (Vollbild, Icon, offline).

## Features
- Multiple Choice, Richtung umschaltbar (🇪🇸→🇩🇪 / 🇩🇪→🇪🇸)
- Themen-Filter (Kategorien)
- Streak + Score, lokal gespeichert
- Offline nutzbar (Service Worker)

## Struktur
| Datei | Zweck |
|---|---|
| `index.html` | Aufbau |
| `style.css` | Design |
| `app.js` | Quiz-Logik |
| `vocab.js` | **Wortschatz (hier Vokabeln pflegen)** |
| `manifest.json`, `sw.js` | PWA (Icon, Offline) |
| `icon-*.png` | App-Icons |

## Lokal starten
```
python3 -m http.server 8123
```
→ http://localhost:8123

## Vokabel hinzufügen
In `vocab.js` eine Zeile ergänzen:
```js
{ es: "la cabeza", en: "the head", cat: "Körperteile" },
```

## Roadmap
- [ ] Kategorien ausbauen (Körperteile, Essen, …)
- [ ] Konjugations-Modus (Verben: Person × Zeitform, regelmäßig + unregelmäßig)
- [ ] Hosting (GitHub Pages / Netlify) für echte iPhone-URL
