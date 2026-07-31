"use strict";

// --- State ---
let view = "home";                                  // home | liste | fehler | settings
let mode = localStorage.getItem("mode") || "vocab"; // vocab | verbs
let dir = localStorage.getItem("dir") || "es-de";   // es-de | de-es
// Wortliste = Basis (vocab.js) + eigene Vokabeln; zur Laufzeit zusammengesetzt.
let customVocab = JSON.parse(localStorage.getItem("customVocab") || "[]");
let WORDS = [];
let allCats = [];
function rebuildWords() {
  WORDS = VOCAB.concat(customVocab);
  allCats = [...new Set(WORDS.map((w) => w.cat))];
}
rebuildWords();
let selectedCat = localStorage.getItem("cat") || "Alle";   // Einzelauswahl: "Alle" oder ein Kategoriename
let listeQuery = "";
let tenseFilter = localStorage.getItem("tense") || "Alle";
let typeFilter = localStorage.getItem("type") || "Alle";
let stats = JSON.parse(localStorage.getItem("stats") || '{"right":0,"total":0,"streak":0}');
let theme = localStorage.getItem("theme") || "light";
let progress = JSON.parse(localStorage.getItem("progress") || "{}"); // { es: {right,wrong,box,due} }
let srs = localStorage.getItem("srs") !== "off";                     // Spaced Repetition an (default)
let autoSpeak = localStorage.getItem("autoSpeak") === "on";          // spanisches Wort autom. vorlesen
let practice = localStorage.getItem("practice") || "mc";             // mc | write | cards
let sfxOn = localStorage.getItem("sfx") === "on";                    // Soundeffekte (Standard aus)
let hapticsOn = localStorage.getItem("haptics") !== "off";           // Haptik (Standard an)
let accent = localStorage.getItem("accent") || "bordeaux";           // bordeaux | oceano | bosque | indigo
let fontSize = localStorage.getItem("fontSize") || "m";              // s | m | l

let marked = new Set(JSON.parse(localStorage.getItem("marked") || "[]"));
let errors = new Set(JSON.parse(localStorage.getItem("errors") || "[]"));
let focusMode = false;
let focusSet = new Set();

// Tagesfortschritt: Tagesziel + Tages-Streak (Tage in Folge mit erreichtem Ziel).
// Unabhängig von stats.streak — das zählt richtige Antworten in Folge.
let daily = Object.assign(
  { date: "", count: 0, goal: 20, streak: 0, lastGoalDate: "", best: 0, done: [] },
  JSON.parse(localStorage.getItem("daily") || "{}")
);

// Laufende Übungsrunde. null = keine Übung aktiv (Start-Sheet oder Home).
// { total, answered, right, endless }  — total 0 bedeutet Endlos-Modus.
let session = null;
let sessionLen = Number(localStorage.getItem("len") ?? 10);   // 0 = endlos
let shownMilestones = new Set(JSON.parse(localStorage.getItem("milestones") || "[]"));

let correctText = null;
let currentKey = null;      // es-Schlüssel der aktuellen Vokabel (nur vocab)
let currentSpanish = null;  // spanisches Wort zum Vorlesen (vocab: es, verben: Infinitiv)
let answered = false;

// --- DOM ---
const $ = (id) => document.getElementById(id);
const optionsEl = $("options");
const feedbackEl = $("feedback");
const promptLabel = $("promptLabel");
const wordEl = $("word");
const nextBtn = $("nextBtn");
const markBtn = $("markBtn");
const speakBtn = $("speakBtn");

// --- Helpers ---
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const rand = (a) => a[Math.floor(Math.random() * a.length)];
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

// --- Linien-Icons (SVG, stroke: currentColor) ---
const ICONS = {
  speaker: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a4 4 0 0 1 0 7"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3.6l2.5 5.1 5.6.8-4.05 3.95.96 5.55L12 16.9 6.03 19l.96-5.55L2.9 9.5l5.6-.8z"/></svg>',
  flame: '<svg viewBox="0 0 24 24"><path d="M12 3c.8 2.8-1.8 3.9-1.8 6.6a1.8 1.8 0 0 0 3.6.2c1.8 1.7 3 3.2 3 5.6a4.8 4.8 0 0 1-9.6 0C7.2 11 10.5 9.6 12 3z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4.8h6V7M6.5 7l.9 12.2h9.2L17.5 7"/></svg>',
  chevron: '<svg viewBox="0 0 24 24"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
  alert: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.4"/><line x1="12" y1="7.6" x2="12" y2="12.8"/><circle cx="12" cy="16.2" r=".9" fill="currentColor" stroke="none"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.6 4.5L19 7.5"/></svg>',
  cycle: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4.2V8h-3.8"/></svg>',
};

function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function saveSets() { save("marked", [...marked]); save("errors", [...errors]); }
function saveStats() { save("stats", stats); }
function updateStreakBadge() {
  const b = $("cardStreak");
  if (stats.streak > 0) { b.innerHTML = ICONS.flame + " " + stats.streak; b.hidden = false; }
  else b.hidden = true;
}
function applyTheme() {
  document.body.classList.toggle("dark", theme === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#16121a" : "#f4ecd9";
}
function vocabByKey(k) { return WORDS.find((v) => v.es === k); }

// ============================================================
//  Lernschlüssel
//  Vokabeln nutzen ihr spanisches Wort als Schlüssel. Verben brauchten einen
//  eigenen — bis hierher lief Konjugation ganz ohne Fortschritt, weil
//  currentKey null blieb und recordAnswer() dann sofort aussteigt.
//    verb:<infinitiv>:<zeit>   → 18 Verben × 4 Zeiten = 72 Einheiten
//    special:<infinitiv>       → gustar, haber
//  Verb×Zeit ist die Einheit, die man tatsächlich lernt; der Tabellen-Modus
//  prüft ohnehin alle sechs Personen einer Zeitform auf einmal.
// ============================================================
const verbKey = (inf, tense) => `verb:${inf}:${tense}`;
const specialKey = (inf) => `special:${inf}`;
const isVerbKey = (k) => typeof k === "string" && (k.startsWith("verb:") || k.startsWith("special:"));

// Alle lernbaren Konjugations-Einheiten — Nenner für die Statistik.
function allVerbKeys() {
  const out = VERBS.flatMap((v) => TENSES.map((t) => verbKey(v.inf, t)));
  return out.concat(SPECIALS.map((s) => specialKey(s.inf)));
}

// Löst jeden Schlüssel in etwas Anzeigbares auf. Ohne das verschwinden
// Verbfehler still, weil renderFehler() Unbekanntes per .filter(Boolean) wegwirft.
function itemByKey(key) {
  if (!isVerbKey(key)) return vocabByKey(key);
  const [art, inf, tense] = key.split(":");
  if (art === "special") {
    const s = SPECIALS.find((x) => x.inf === inf);
    return s ? { es: s.inf, de: `${s.de} · Sonderfall`, cat: "Konjugation", isVerb: true } : null;
  }
  const v = VERBS.find((x) => x.inf === inf);
  return v ? { es: v.inf, de: `${v.de} · ${tense}`, cat: "Konjugation", isVerb: true } : null;
}

// Systemeinstellung „Bewegung reduzieren" respektieren: dann Endwerte direkt setzen.
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Der Übungsblock ist vertikal zentriert. Sobald Inhalt dazukommt — Weiter-Button,
// aufgedeckte Lösungen, Bewertungsknöpfe — würde die Zentrierung alles nach oben
// ziehen (gemessen bis zu 78px). Deshalb einmal pro Frage die zentrierte
// Startposition messen und als festes margin-top einfrieren: der Block wächst
// dann nur noch nach unten und bleibt optisch stehen.
function anchorCard() {
  const wrap = document.querySelector(".practice-center");
  const body = $("practiceBody");
  if (!wrap || !body) return;
  wrap.style.marginTop = "";        // zurück auf auto → Browser zentriert neu
  wrap.style.marginBottom = "";
  requestAnimationFrame(() => {
    const abstand = wrap.getBoundingClientRect().top - body.getBoundingClientRect().top;
    wrap.style.marginTop = Math.max(0, Math.round(abstand)) + "px";
    wrap.style.marginBottom = "auto";
  });
}

// CSS-Animation neu starten. Nötig, weil eine abgelaufene Animation nicht
// erneut läuft, wenn ein Element nur per `hidden` aus- und wieder eingeblendet wird.
function replayAnim(node, cls = "anim-in") {
  node.classList.remove(cls);
  void node.offsetWidth;
  node.classList.add(cls);
}

// Endwert erst im nächsten Frame setzen, damit die CSS-Transition greift.
function growTo(setFinal, setStart) {
  if (reduceMotion()) { setFinal(); return; }
  setStart();
  requestAnimationFrame(() => requestAnimationFrame(setFinal));
}

// Akzentfarbe (Klasse auf <body>) und Schriftgröße (Klasse auf <html>, damit rem skaliert).
const ACCENTS = ["bordeaux", "oceano", "bosque", "indigo"];
const FONT_SIZES = ["s", "m", "l"];
function applyAccent() {
  ACCENTS.forEach((a) => document.body.classList.toggle("accent-" + a, a === accent && a !== "bordeaux"));
}
function applyFontSize() {
  FONT_SIZES.forEach((f) => document.documentElement.classList.toggle("fs-" + f, f === fontSize && f !== "m"));
}

// ============================================================
//  Haptisches Feedback
//  Zwei Wege, weil es keinen gibt, der überall funktioniert:
//   1. navigator.vibrate() — Android und Desktop-Chrome. iOS Safari kennt es NICHT.
//   2. iOS ab 17.4: <input type="checkbox" switch> ist ein nativer Schalter,
//      dessen Umlegen ein System-Haptik auslöst. Wir legen einen unsichtbaren
//      Schalter um. Das ist ein Umweg, kein API — Apple kann ihn jederzeit
//      schließen, und bei synthetischen Klicks ist er nicht garantiert.
//  Stärke lässt sich auf diesem Weg nicht steuern: iOS gibt immer dasselbe
//  leichte Tippen, deshalb sind die Muster unten nur für Weg 1 relevant.
// ============================================================
const VIBRATION = { ok: [12], bad: [22, 45, 22], done: [10, 35, 10, 35, 26], milestone: [14, 40, 22] };
const canVibrate = () => typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

function haptic(type) {
  if (!hapticsOn) return;
  try {
    if (canVibrate()) { navigator.vibrate(VIBRATION[type] || VIBRATION.ok); return; }
    // iOS-Umweg: nativen Schalter umlegen. Muss aus einem echten Tap heraus laufen.
    const sw = $("hapticSwitch");
    if (sw) sw.click();   // click() legt den Schalter um — genau das erzeugt das Tippen
  } catch (e) { /* Haptik nicht verfügbar — stillschweigend überspringen */ }
}

// --- Soundeffekte: kurze Töne per WebAudio, keine Audiodateien ---
let audioCtx = null;
function tone(freq, delay, dur = .18) {
  const t0 = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(.12, t0 + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + .02);
}
// „ok" steigend, „bad" fallend, „done" kurzer Dreiklang.
const SFX = { ok: [[660, 0], [880, .08]], bad: [[320, 0], [220, .1]], done: [[523, 0], [659, .1], [784, .2]] };
function sfx(type) {
  if (!sfxOn) return;
  try {
    // Wird aus einem Klick-Handler heraus gerufen — dadurch entsperrt iOS den Audio-Context.
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    (SFX[type] || []).forEach(([f, t]) => tone(f, t));
  } catch (e) { /* Audio nicht verfügbar — stillschweigend überspringen */ }
}

// ============================================================
//  Sicherung: Export / Import
//  Der gesamte Fortschritt liegt nur im localStorage EINES Geräts. Ohne
//  Backend ist das hier die einzige Absicherung gegen Gerätewechsel oder
//  gelöschte Website-Daten.
// ============================================================
const DATA_KEYS = [
  "progress", "marked", "errors", "customVocab", "stats", "daily", "milestones",
  "len", "sfx", "accent", "fontSize", "cat", "theme", "srs", "autoSpeak",
  "practice", "mode", "dir", "tense", "type",
];

function buildBackup() {
  const daten = {};
  DATA_KEYS.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v !== null) daten[k] = v;   // roh als String — genau so wie gespeichert
  });
  return JSON.stringify({ app: "vocabulario", version: 1, datum: new Date().toISOString(), daten }, null, 1);
}

// Gibt eine Fehlermeldung zurück oder null bei Erfolg. Schreibt erst,
// wenn die Struktur geprüft ist — kaputtes JSON darf den Bestand nicht zerstören.
function applyBackup(text) {
  let obj;
  try { obj = JSON.parse(text); }
  catch (e) { return "Das ist kein gültiges JSON."; }
  if (!obj || obj.app !== "vocabulario" || typeof obj.daten !== "object" || !obj.daten) {
    return "Die Datei stammt nicht aus Vocabulario.";
  }
  const bekannt = Object.keys(obj.daten).filter((k) => DATA_KEYS.includes(k));
  if (!bekannt.length) return "Die Sicherung enthält keine bekannten Daten.";
  bekannt.forEach((k) => localStorage.setItem(k, obj.daten[k]));
  return null;
}

// --- Tagesfortschritt ---
// Lokales Datum als YYYY-MM-DD (nicht UTC — sonst springt der Tag abends um).
function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
// Tageswechsel abfangen: Zähler zurücksetzen, Streak nur halten, wenn das Ziel
// heute oder gestern erreicht wurde.
function rollDay() {
  const today = dayKey();
  if (daily.date === today) return;
  daily.date = today;
  daily.count = 0;
  const yesterday = dayKey(new Date(Date.now() - 864e5));
  if (daily.lastGoalDate !== today && daily.lastGoalDate !== yesterday) daily.streak = 0;
  save("daily", daily);
}
// Eine beantwortete Frage zählen. Gibt true zurück, wenn das Tagesziel gerade
// erst erreicht wurde (für die Meilenstein-Meldung).
function touchDay() {
  rollDay();
  daily.count++;
  let reached = false;
  if (daily.count >= daily.goal && daily.lastGoalDate !== daily.date) {
    daily.streak++;
    daily.lastGoalDate = daily.date;
    if (daily.streak > daily.best) daily.best = daily.streak;
    // Historie fuer den Wochen-Kalender, auf 60 Tage begrenzt.
    if (!daily.done.includes(daily.date)) daily.done.push(daily.date);
    if (daily.done.length > 60) daily.done = daily.done.slice(-60);
    reached = true;
  }
  save("daily", daily);
  return reached;
}

// --- Fortschritt (Leitner-Boxen 0–5) ---
const BOX_MS = [0, 10 * 60e3, 24 * 3600e3, 3 * 24 * 3600e3, 7 * 24 * 3600e3, 30 * 24 * 3600e3];
function recordAnswer(key, ok) {
  if (!key) return;
  const p = progress[key] || { right: 0, wrong: 0, box: 0, due: 0 };
  if (ok) { p.right++; p.box = Math.min(5, p.box + 1); }
  else { p.wrong++; p.box = 0; }
  p.due = Date.now() + BOX_MS[p.box];
  progress[key] = p;
  save("progress", progress);
}
// SRS-Auswahl: fällige Wörter zuerst, niedrige Boxen (schwache Vokabeln) stärker gewichtet.
function pickWord(words) { return pickByKey(words, (w) => w.es); }

// Faellige zuerst, niedrige Boxen (schwache Eintraege) staerker gewichtet.
// Arbeitet ueber eine Schluesselfunktion, damit Vokabeln UND Konjugation
// dieselbe Wiederholungslogik nutzen.
function pickByKey(liste, keyOf) {
  if (!liste.length) return null;
  if (!srs) return rand(liste);
  const now = Date.now();
  let pool = liste.filter((x) => (progress[keyOf(x)]?.due || 0) <= now);
  if (!pool.length) pool = liste;
  const weights = pool.map((x) => 6 - (progress[keyOf(x)]?.box || 0));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

// Waehlt eine Verb-x-Zeit-Kombination nach denselben Regeln.
function pickVerbSlot(verbs, tenses) {
  const slots = verbs.flatMap((v) => tenses.map((t) => ({ verb: v, tense: t })));
  return pickByKey(slots, (s) => verbKey(s.verb.inf, s.tense));
}

// --- Vorlesen (gratis über Browser-Sprachausgabe) ---
// btn (optional) pulsiert, solange tatsächlich Ton läuft — bisher gab es beim
// Antippen gar keine Rückmeldung.
function clearSpeaking() {
  document.querySelectorAll(".speak.speaking").forEach((b) => b.classList.remove("speaking"));
}
function speak(text, btn) {
  if (!text || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  speechSynthesis.cancel();   // bricht eine laufende Ausgabe ab …
  clearSpeaking();            // … deren onend dann nicht mehr zuverlässig feuert
  if (btn) {
    u.onstart = () => btn.classList.add("speaking");
    // onend UND onerror: sonst bleibt der Puls hängen, wenn die Ausgabe abbricht.
    u.onend = () => btn.classList.remove("speaking");
    u.onerror = () => btn.classList.remove("speaking");
  }
  speechSynthesis.speak(u);
}
function maybeAutoSpeak() { if (autoSpeak) speak(currentSpanish, speakBtn); }

// Baut eine Einstellungs-Zeile mit Umschalter (wiederverwendet für Dark/SRS/Audio).
function toggleRow(label, isOn, onToggle) {
  const row = el("div", "setting-row");
  row.appendChild(el("span", null, label));
  const sw = el("div", "switch" + (isOn ? " on" : ""));
  sw.appendChild(el("div", "knob"));
  sw.addEventListener("click", () => onToggle(sw.classList.toggle("on")));
  row.appendChild(sw);
  return row;
}

// Einstellungs-Zeile mit mehreren Werten zur Auswahl (Tagesziel, Schriftgröße …).
// opts = [{ v, l }] — Wert und Beschriftung.
function choiceRow(label, opts, current, onPick) {
  const row = el("div", "setting-row choice-row");
  row.appendChild(el("span", null, label));
  const group = el("div", "choice-opts");
  opts.forEach((o) => {
    const b = el("button", o.v === current ? "on" : null, o.l);
    b.addEventListener("click", () => {
      group.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      onPick(o.v);
    });
    group.appendChild(b);
  });
  row.appendChild(group);
  return row;
}

// Bis zu 3 eindeutige Distraktoren aus priorisierten Listen (ohne `correct`).
function pickDistractors(correct, ...lists) {
  const out = [];
  const seen = new Set([correct]);
  for (const list of lists) {
    for (const c of shuffle(list)) {
      if (out.length >= 3) break;
      if (!seen.has(c)) { seen.add(c); out.push(c); }
    }
  }
  return out;
}

// --- Frageaufbau (generisch) ---
// meta = { sub, badges[] } → Untertitel (Bedeutung) + Badges (Person/Zeitform); null bei Vokabeln.
function renderMeta(meta) {
  const q = $("qmeta");
  q.innerHTML = "";
  if (!meta) { q.hidden = true; return; }
  q.hidden = false;
  if (meta.sub) q.appendChild(el("span", "q-sub", meta.sub));
  (meta.badges || []).forEach((b) => q.appendChild(el("span", "badge", b)));
}
function setHeader(labelText, wordText, showMark, meta) {
  answered = false;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.hidden = true;
  optionsEl.innerHTML = "";
  promptLabel.textContent = labelText;
  wordEl.textContent = wordText;
  renderMeta(meta);
  markBtn.hidden = !showMark;
  if (showMark) { markBtn.innerHTML = ICONS.star; markBtn.classList.toggle("on", marked.has(currentKey)); }
  updateStreakBadge();
  // Beispielsatz der VORHERIGEN Frage entfernen. Er haengt als Geschwister an
  // feedbackEl, nicht in optionsEl — ohne das bleibt er stehen und stapelt sich.
  $("card").querySelectorAll(".sentence").forEach((n) => n.remove());
  // Karte federnd einblenden (Slide + Fade); Animation neu starten erzwingen.
  const card = $("card");
  card.classList.remove("card-in");
  void card.offsetWidth;
  card.classList.add("card-in");
}
function render(labelText, wordText, choices, correct, showMark, meta) {
  correctText = correct;
  setHeader(labelText, wordText, showMark, meta);
  if (practice === "write") renderWrite();
  else if (practice === "cards") renderCards();
  else renderMC(choices);
  anchorCard();   // erst NACH dem Rendern der Optionen — sonst falsche Höhe
}

// Übungsart „Auswahl" (Multiple Choice)
function renderMC(choices) {
  shuffle(choices).forEach((choice) => {
    const btn = el("button", null, choice);
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const ok = choice === correctText;
      btn.classList.add(ok ? "correct" : "wrong");
      [...optionsEl.children].forEach((b) => {
        b.disabled = true;
        if (b.textContent === correctText) b.classList.add("correct");
      });
      score(ok);
    });
    optionsEl.appendChild(btn);
  });
}

// Vergleich tolerant: Kleinschreibung, Leerzeichen, Akzente egal.
const normalize = (s) => s.toLowerCase().trim().replace(/\s+/g, " ").normalize("NFD").replace(/[̀-ͯ]/g, "");
// Artikel (DE/ES) am Anfang + Klammern entfernen — für tolerante Vokabel-Prüfung.
const stripFluff = (s) => normalize(s)
  .replace(/\([^)]*\)/g, " ")
  .replace(/^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|el|la|los|las|un|una|unos|unas)\s+/i, "")
  .replace(/\s+/g, " ").trim();
// Editierdistanz (Levenshtein) für Tippfehler-Toleranz.
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[n];
}
// Prüft eine getippte Antwort tolerant. Vokabeln: Artikel/Klammern egal + Tippfehler erlaubt.
// Verben: streng (nur bei langen Formen 1 Abweichung), damit keine falsche Personform durchrutscht.
function writeCorrect(input, correct, isVerb) {
  const val = normalize(input).trim();
  if (!val) return false;
  const variants = correct.split("/").map((s) => s.trim());
  if (isVerb) {
    return variants.some((v) => {
      const nv = normalize(v);
      const tol = nv.replace(/\s/g, "").length >= 8 ? 1 : 0;
      return levenshtein(val, nv) <= tol;
    });
  }
  const valF = stripFluff(input);
  return variants.some((v) => {
    for (const target of [normalize(v), stripFluff(v)]) {
      const len = target.replace(/\s/g, "").length;
      const tol = len < 4 ? 0 : len < 8 ? 1 : 2;
      if (levenshtein(val, target) <= tol || levenshtein(valF, target) <= tol) return true;
    }
    return false;
  });
}

// Übungsart „Schreiben"
function renderWrite() {
  const form = el("form", "write");
  const input = el("input", "write-input");
  input.type = "text";
  input.autocapitalize = "off";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.placeholder = "Antwort eintippen…";
  const btn = el("button", "next", "Prüfen");
  btn.type = "submit";
  form.append(input, btn);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (answered) return;
    if (!input.value.trim()) return;
    answered = true;
    const ok = writeCorrect(input.value, correctText, mode === "verbs");
    input.disabled = true;
    input.classList.add(ok ? "correct" : "wrong");
    btn.hidden = true;
    score(ok);
  });
  optionsEl.appendChild(form);
  input.focus();
}

// Übungsart „Karten" (umdrehen + Selbstbewertung)
// ============================================================
//  Beispielsätze und Lückentext
// ============================================================
const sentenceFor = (key) => (typeof SENTENCES !== "undefined" ? SENTENCES[key] : null);

// Alle Eintraege des aktuellen Themas, zu denen es einen Satz gibt.
function gapPool() {
  if (mode === "verbs") {
    const pool = (typeFilter === "Alle" || typeFilter === "special")
      ? VERBS : VERBS.filter((v) => v.type === typeFilter);
    const zeiten = tenseFilter === "Alle" ? TENSES : [tenseFilter];
    return pool.flatMap((v) => zeiten.map((t) => verbKey(v.inf, t))).filter(sentenceFor);
  }
  return vocabPool().map((w) => w.es).filter(sentenceFor);
}

// Ersetzt das Zielwort im Satz durch eine Luecke. Artikel und Akzente werden
// ignoriert, damit auch gebeugte Formen im Satz getroffen werden.
function blankOut(satz, ziel) {
  const kern = ziel.replace(/^(el |la |los |las )/, "").split("/")[0].trim();
  const akz = { a: "aá", e: "eé", i: "ií", o: "oó", u: "uú" };
  const roh = kern.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const teile = roh.split(/\s+/).map((wort) =>
    wort.split("").map((c) => (akz[c] ? "[" + akz[c] + "]" : c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))).join(""));
  // Wortgrenze davor, sonst trifft z. B. „hora" die Mitte von „ahora".
  // Kein \b, weil das Muster mit Akzent-Zeichenklassen beginnt; stattdessen
  // Satzanfang oder ein Zeichen, das kein Buchstabe ist.
  const muster = new RegExp("(^|[^A-Za-zÀ-ÿ])(" + teile.join("\\s+") + "\\w*)", "i");
  return muster.test(satz) ? satz.replace(muster, "$1_____") : satz;
}

// Uebungsart „Luecke": Satz mit fehlendem Wort, Antwort wird getippt.
function gapQuestion() {
  const keys = gapPool();
  if (!keys.length) { setHeader("Keine Sätze vorhanden", "—", false, null); showGapHint(); return; }
  const key = pickByKey(keys, (k) => k);
  const eintrag = itemByKey(key);
  const satz = sentenceFor(key);
  currentKey = key;
  currentSpanish = eintrag.es;
  correctText = eintrag.es;
  setHeader("Ergänze den Satz", blankOut(satz.es, eintrag.es), false, { sub: satz.de });
  renderWrite();
  anchorCard();
}

// Kein Satz im gewaehlten Thema — Runde nicht leer laufen lassen.
function showGapHint() {
  optionsEl.innerHTML = "";
  optionsEl.appendChild(el("p", "gap-hint",
    "Zu diesem Thema gibt es noch keine Beispielsätze. Wähle ein anderes Thema oder eine andere Übungsart."));
  const b = el("button", "next", "Zurück");
  b.addEventListener("click", closePractice);
  optionsEl.appendChild(b);
  nextBtn.hidden = true;
  anchorCard();
}

// Beispielsatz NACH dem Antworten zeigen — vorher wuerde er die Loesung verraten.
function showSentence() {
  const satz = sentenceFor(currentKey);
  if (!satz || practice === "gap") return;
  $("card").querySelectorAll(".sentence").forEach((n) => n.remove());   // nie stapeln
  const box = el("div", "sentence");
  box.appendChild(el("span", "sentence-es", satz.es));
  box.appendChild(el("span", "sentence-de", satz.de));
  feedbackEl.insertAdjacentElement("afterend", box);
}

function renderCards() {
  const flip = el("button", "next", "Karte umdrehen");
  flip.addEventListener("click", () => {
    feedbackEl.textContent = correctText;
    feedbackEl.className = "feedback reveal";
    optionsEl.innerHTML = "";
    const good = el("button", null, "Gewusst");
    const bad = el("button", null, "Nicht gewusst");
    const rate = (ok, btn) => {
      if (answered) return;
      answered = true;
      btn.classList.add(ok ? "correct" : "wrong");
      good.disabled = bad.disabled = true;
      score(ok);
    };
    good.addEventListener("click", () => rate(true, good));
    bad.addEventListener("click", () => rate(false, bad));
    optionsEl.append(good, bad);
  });
  optionsEl.appendChild(flip);
}

// --- Vokabel-Frage ---
const vocabAsk = (w) => (dir === "es-de" ? w.es : w.de);
const vocabAns = (w) => (dir === "es-de" ? w.de : w.es);

function vocabPool() {
  if (focusMode) {
    const p = WORDS.filter((v) => focusSet.has(v.es));
    if (p.length) return p;
    exitFocus(); // Fokusliste leer geworden
  }
  return selectedCat === "Alle" ? WORDS : WORDS.filter((v) => v.cat === selectedCat);
}

// vorgabe: erzwingt ein bestimmtes Wort (Nachdrill), sonst SRS-Auswahl.
function vocabQuestion(vorgabe) {
  const words = vocabPool();
  const current = vorgabe || pickWord(words);
  currentKey = current.es;
  currentSpanish = current.es;
  const correct = vocabAns(current);
  const distractPool = (words.length >= 4 ? words : WORDS)
    .filter((w) => vocabAns(w) !== correct)
    .map(vocabAns);
  const choices = [correct, ...pickDistractors(correct, distractPool)];
  const label = dir === "es-de" ? "Was bedeutet…" : "Wie heißt auf Spanisch…";
  render(label, vocabAsk(current), choices, correct, true, null);
  maybeAutoSpeak();
}

// --- Verben-Frage ---
function verbQuestion(vorgabe) {
  const pool = typeFilter === "Alle" ? VERBS : VERBS.filter((v) => v.type === typeFilter);
  const zeiten = tenseFilter === "Alle" ? TENSES : [tenseFilter];
  const slot = vorgabe || pickVerbSlot(pool, zeiten);
  const verb = slot.verb, tense = slot.tense;
  currentKey = verbKey(verb.inf, tense);
  currentSpanish = verb.inf;
  const i = Math.floor(Math.random() * PERSONS.length);
  const correct = verbForm(verb, tense, i);

  const sameTense = PERSONS.map((_, j) => verbForm(verb, tense, j));
  const otherTenses = TENSES.flatMap((t) => PERSONS.map((_, j) => verbForm(verb, t, j)));
  const otherVerbs = pool.flatMap((v) => PERSONS.map((_, j) => verbForm(v, tense, j)));
  const choices = [correct, ...pickDistractors(correct, sameTense, otherTenses, otherVerbs)];

  render("Konjugiere", verb.inf, choices, correct, false, { sub: verb.de, badges: [PERSONS[i], tense] });
  maybeAutoSpeak();
}

// --- Sonderfälle (gustar / haber) ---
function specialQuestion(vorgabe) {
  const sp = vorgabe || pickByKey(SPECIALS, (x) => specialKey(x.inf));
  currentKey = specialKey(sp.inf);
  currentSpanish = sp.inf;
  const slot = rand(sp.slots);
  const correct = slot.a;
  const distract = sp.slots.map((s) => s.a);
  const choices = [correct, ...pickDistractors(correct, distract)];
  render("Konjugiere", sp.inf, choices, correct, false, { sub: sp.de, badges: [slot.ctx] });
  maybeAutoSpeak();
}

// Filter im Start-Sheet umgestellt: nur neu zeichnen, wenn eine Runde läuft.
function refreshQuestion() { if (session) newQuestion(); }

function newQuestion() {
  if (practice === "gap" && !focusMode) { gapQuestion(); return; }
  if (focusMode) { focusQuestion(); return; }
  if (mode === "verbs") {
    if (typeFilter === "special") specialQuestion();
    else if (practice === "table") verbTableQuestion();
    else verbQuestion();
  } else {
    vocabQuestion();
  }
}

// Im Fokus-Modus entscheidet der Schluessel ueber die Fragenart — dadurch
// koennen Vokabeln und Konjugation in derselben Runde drankommen.
function focusQuestion() {
  const keys = [...focusSet].filter((k) => itemByKey(k));
  if (!keys.length) { exitFocus(); vocabQuestion(); return; }
  const key = pickByKey(keys, (k) => k);
  if (!isVerbKey(key)) { vocabQuestion(); return; }
  const [art, inf, tense] = key.split(":");
  if (art === "special") {
    const sp = SPECIALS.find((x) => x.inf === inf);
    if (sp) { specialQuestion(sp); return; }
  } else {
    const v = VERBS.find((x) => x.inf === inf);
    if (v) {
      if (practice === "table") verbTableQuestion({ verb: v, tense });
      else verbQuestion({ verb: v, tense });
      return;
    }
  }
  vocabQuestion();
}

// --- Verben-Tabelle: alle Personen konjugieren (Zeitform vorgegeben) ---
function verbTableQuestion(vorgabe) {
  correctText = null; // Tabelle hat keine einzelne „richtige Antwort" (Feld-Feedback stattdessen)
  const pool = (typeFilter === "Alle" || typeFilter === "special") ? VERBS : VERBS.filter((v) => v.type === typeFilter);
  const zeiten = tenseFilter === "Alle" ? TENSES : [tenseFilter];
  const slot = vorgabe || pickVerbSlot(pool, zeiten);
  const verb = slot.verb, tense = slot.tense;
  currentKey = verbKey(verb.inf, tense);
  currentSpanish = verb.inf;
  setHeader("Konjugiere alle Personen", verb.inf, false, { sub: verb.de, badges: [tense] });

  const form = el("form", "conj-table");
  const inputs = [];
  PERSONS.forEach((p) => {
    const row = el("div", "conj-row");
    row.appendChild(el("span", "conj-person", p));
    const inp = el("input", "conj-input");
    inp.type = "text"; inp.autocapitalize = "off"; inp.autocomplete = "off"; inp.spellcheck = false;
    row.appendChild(inp);
    form.appendChild(row);
    inputs.push(inp);
  });
  const btn = el("button", "next", "Prüfen");
  btn.type = "submit";
  form.appendChild(btn);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (answered) return;
    answered = true;
    let all = true;
    inputs.forEach((inp, i) => {
      const sol = verbForm(verb, tense, i);
      const ok = writeCorrect(inp.value, sol, true);
      inp.disabled = true;
      inp.classList.add(ok ? "correct" : "wrong");
      if (!ok) { all = false; inp.parentElement.appendChild(el("span", "conj-sol", sol)); }
    });
    btn.hidden = true;
    score(all);
  });
  optionsEl.appendChild(form);
  inputs[0].focus();
  anchorCard();   // Tabelle baut ohne render() auf, braucht den Aufruf separat
  maybeAutoSpeak();
}

// --- Antwort werten (gemeinsam für alle Übungsarten) ---
function score(ok) {
  stats.total++;
  if (ok) {
    stats.right++; stats.streak++;
    feedbackEl.textContent = "¡Correcto!";
    feedbackEl.className = "feedback ok";
    if (currentKey && errors.has(currentKey)) { errors.delete(currentKey); saveSets(); }
  } else {
    stats.streak = 0;
    feedbackEl.textContent = correctText ? ("Richtig: " + correctText) : "Nicht ganz — Lösungen stehen oben.";
    feedbackEl.className = "feedback bad";
    if (currentKey) { errors.add(currentKey); saveSets(); }
  }
  sfx(ok ? "ok" : "bad");
  haptic(ok ? "ok" : "bad");
  recordAnswer(currentKey, ok);
  const goalJustReached = touchDay();
  saveStats();
  updateStreakBadge();

  if (session) {
    // Nachdrill zaehlt NICHT in die Wertung — sonst verwaessert er die Trefferquote.
    if (!inRetry()) {
      session.answered++;
      if (ok) session.right++;
      if (!ok && currentKey && !session.retry.includes(currentKey)) session.retry.push(currentKey);
    } else {
      session.retryDone++;
    }
    updateProgress();
    const last = !session.endless && session.answered >= session.total && !session.retry.length && !inRetry();
    nextBtn.textContent = last ? "Ergebnis ansehen" : "Weiter →";
  }
  checkMilestones(goalJustReached);
  showSentence();
  nextBtn.hidden = false;
}

// --- Vorlesen (Lautsprecher auf der Karte) ---
speakBtn.addEventListener("click", () => speak(currentSpanish, speakBtn));

// --- Markieren (Stern auf der Karte) ---
markBtn.addEventListener("click", () => {
  if (!currentKey) return;
  if (marked.has(currentKey)) marked.delete(currentKey); else marked.add(currentKey);
  saveSets();
  markBtn.classList.toggle("on", marked.has(currentKey));
});

// --- Fokus-Üben (markierte + Fehler) ---
// Übt gezielt eine feste Wortliste. vocabPool() respektiert focusSet bereits.
function startFocusWith(keys, label) {
  keys = [...new Set(keys)].filter(itemByKey);
  if (!keys.length) return;
  focusSet = new Set(keys);
  focusMode = true;
  $("focusBanner").hidden = false;
  $("focusText").textContent = `Fokus: ${keys.length} ${label}`;
  startSession();
}
function startFocus() {
  startFocusWith([...marked, ...errors], "markierte / Fehler");
}
function exitFocus() {
  focusMode = false;
  $("focusBanner").hidden = true;
}
$("focusExit").addEventListener("click", () => { exitFocus(); refreshQuestion(); });

// --- Modus-Umschalter ---
function setMode(m) {
  mode = m;
  localStorage.setItem("mode", mode);
  $("modeVocab").classList.toggle("active", mode === "vocab");
  $("modeVerbs").classList.toggle("active", mode === "verbs");
  $("vocabControls").hidden = mode !== "vocab";
  $("verbControls").hidden = mode !== "verbs";
  if (mode === "verbs" && focusMode) { exitFocus(); }
  syncPractice();
  refreshQuestion();
}
$("modeVocab").addEventListener("click", () => setMode("vocab"));
$("modeVerbs").addEventListener("click", () => setMode("verbs"));

// Dritte Übungsart ist modusabhängig: Vokabeln → Karten, Verben → Tabelle.
function syncPractice() {
  const third = document.querySelectorAll("#practiceModes .mode")[2];
  if (mode === "verbs") {
    if (practice === "cards") practice = "table";
    third.dataset.practice = "table"; third.textContent = "Tabelle";
  } else {
    if (practice === "table") practice = "cards";
    third.dataset.practice = "cards"; third.textContent = "Karten";
  }
  localStorage.setItem("practice", practice);
  document.querySelectorAll("#practiceModes .mode").forEach((b) => b.classList.toggle("active", b.dataset.practice === practice));
}

// --- Übungsart-Umschalter (Auswahl/Schreiben/Karten|Tabelle) ---
function setPractice(p) {
  practice = p;
  localStorage.setItem("practice", p);
  document.querySelectorAll("#practiceModes .mode").forEach((b) => b.classList.toggle("active", b.dataset.practice === p));
  refreshQuestion();
}
document.querySelectorAll("#practiceModes .mode").forEach((b) => b.addEventListener("click", () => setPractice(b.dataset.practice)));

// --- View-Wechsel (Bottom Nav) ---
const VIEWS = ["home", "liste", "fehler", "settings"];

function switchView(name) {
  view = name;
  VIEWS.forEach((v) => { $("view-" + v).hidden = v !== name; });
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
  // Pille an die Position des aktiven Tabs schieben.
  const bar = document.querySelector(".tabbar");
  bar.style.setProperty("--tab-i", VIEWS.indexOf(name));
  bar.classList.toggle("on-fehler", name === "fehler");
  if (name === "home") renderHome();
  if (name === "liste") renderListe();
  if (name === "fehler") renderFehler();
  if (name === "settings") renderSettings();
  // Weicher Übergang statt hartem Schnitt; Animation neu starten erzwingen.
  const v = $("view-" + name);
  v.classList.remove("view-in");
  void v.offsetWidth;
  v.classList.add("view-in");
  document.querySelector("main").scrollTop = 0;
}
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => switchView(t.dataset.view)));

// ============================================================
//  Übung: eigener Vollbild-Flow (Tab-Bar ausgeblendet)
// ============================================================

// --- Start-Sheet: Modus, Übungsart, Filter und Rundenlänge wählen ---
function openStartSheet() {
  $("startSheet").hidden = false;
  $("catPanel").hidden = true;
  replayAnim($("startSheet"));
}
function closeStartSheet() { $("startSheet").hidden = true; }
$("sheetCancel").addEventListener("click", closeStartSheet);
$("sheetStart").addEventListener("click", () => { closeStartSheet(); startSession(); });
$("startSheet").addEventListener("click", (e) => { if (e.target === $("startSheet")) closeStartSheet(); });

document.querySelectorAll("#lengthModes .mode").forEach((b) => {
  b.classList.toggle("active", Number(b.dataset.len) === sessionLen);
  b.addEventListener("click", () => {
    sessionLen = Number(b.dataset.len);
    localStorage.setItem("len", sessionLen);
    document.querySelectorAll("#lengthModes .mode").forEach((x) => x.classList.toggle("active", x === b));
  });
});

// --- Runde starten / beenden ---
function startSession() {
  session = { total: sessionLen, answered: 0, right: 0, endless: sessionLen === 0, retry: [], retryDone: 0 };
  $("practice").hidden = false;
  $("summary").hidden = true;
  $("practiceBody").hidden = false;
  document.body.classList.add("in-practice");
  updateProgress();
  newQuestion();
}
function closePractice() {
  session = null;
  $("practice").hidden = true;
  $("summary").hidden = true;
  $("practiceBody").hidden = false;
  document.body.classList.remove("in-practice");
  if (focusMode) exitFocus();
  renderHome();
}
// Vor dem Verlassen nachfragen, sobald die Runde wirklich begonnen hat.
$("practiceExit").addEventListener("click", () => {
  if (session && !session.endless && session.answered >= 2 && session.answered < session.total) {
    askConfirm("Übung beenden?", "Der Fortschritt dieser Runde wird nicht gewertet.",
      "Weiter üben", "Beenden", closePractice);
  } else {
    closePractice();
  }
});
// Ein Dialog für alle Rückfragen — Text und Aktion werden beim Öffnen gesetzt.
let confirmCb = null;
function askConfirm(titel, text, neinLabel, jaLabel, beiJa) {
  $("confirmTitle").textContent = titel;
  $("confirmText").textContent = text;
  $("confirmNo").textContent = neinLabel;
  $("confirmYes").textContent = jaLabel;
  confirmCb = beiJa;
  $("confirmExit").hidden = false;
  replayAnim($("confirmExit"));
}
$("confirmNo").addEventListener("click", () => { $("confirmExit").hidden = true; confirmCb = null; });
$("confirmYes").addEventListener("click", () => {
  $("confirmExit").hidden = true;
  const cb = confirmCb; confirmCb = null;
  if (cb) cb();
});

// --- Fortschrittsanzeige oben ---
function updateProgress() {
  if (!session) return;
  const bar = $("progressBar"), fill = $("progressFill"), cnt = $("progressCount");
  if (session.endless) {
    bar.hidden = true;
    cnt.textContent = session.answered ? `${session.answered} geübt` : "Endlos";
  } else if (inRetry()) {
    bar.hidden = false;
    fill.style.width = "100%";
    const gesamt = session.retryDone + session.retry.length + 1;
    cnt.textContent = `Wdh. ${Math.min(session.retryDone + 1, gesamt)} / ${gesamt}`;
  } else {
    bar.hidden = false;
    const done = Math.min(session.answered, session.total);
    fill.style.width = (done / session.total) * 100 + "%";
    cnt.textContent = `${Math.min(done + 1, session.total)} / ${session.total}`;
  }
}

// Nächste Frage — oder Rundenende.
// Regulaere Fragen sind durch, aber es warten noch falsch beantwortete.
function inRetry() {
  return !!session && !session.endless && session.answered >= session.total;
}

function advance() {
  if (session && !session.endless && session.answered >= session.total) {
    if (session.retry.length) { retryQuestion(); updateProgress(); return; }
    showSummary(); return;
  }
  newQuestion();
  updateProgress();
}

// Stellt die naechste falsch beantwortete Frage erneut — jeden Schluessel einmal.
function retryQuestion() {
  const key = session.retry.shift();
  const w = itemByKey(key);
  if (!w) { advance(); return; }
  if (isVerbKey(key)) {
    const [art, inf, tense] = key.split(":");
    if (art === "special") {
      const sp = SPECIALS.find((x) => x.inf === inf);
      if (sp) specialQuestion(sp); else { advance(); return; }
    } else {
      const v = VERBS.find((x) => x.inf === inf);
      if (!v) { advance(); return; }
      if (practice === "table") verbTableQuestion({ verb: v, tense });
      else verbQuestion({ verb: v, tense });
    }
  } else {
    vocabQuestion(w);
  }
  markRetry();
}

// Dezenter Hinweis auf der Karte, dass es eine Wiederholung ist.
function markRetry() {
  promptLabel.textContent = "Wiederholung · " + promptLabel.textContent;
}

// --- Zusammenfassung nach Rundenende ---
function showSummary() {
  const s = session;
  const quote = s.answered ? Math.round((s.right / s.answered) * 100) : 0;
  const msg = quote >= 90 ? "¡Excelente!" : quote >= 70 ? "¡Muy bien!" : quote >= 50 ? "Solide Runde." : "Dranbleiben.";

  $("practiceBody").hidden = true;
  $("progressBar").hidden = false;
  $("progressFill").style.width = "100%";
  $("progressCount").textContent = `${s.total} / ${s.total}`;

  sfx("done");
  haptic("done");
  const box = $("summary");
  box.hidden = false;
  box.innerHTML = "";
  replayAnim(box);

  const card = el("div", "summary-card");
  card.appendChild(el("p", "summary-msg", msg));
  card.appendChild(el("div", "summary-quote", quote + "%"));
  card.appendChild(el("p", "summary-sub", "Trefferquote"));

  const grid = el("div", "summary-grid");
  grid.append(
    summaryStat(String(s.answered), "geübt"),
    summaryStat(String(s.right), "richtig"),
    summaryStat(String(s.answered - s.right), "falsch"),
  );
  card.appendChild(grid);
  box.appendChild(card);

  const again = el("button", "btn", "Nochmal");
  again.addEventListener("click", startSession);
  const done = el("button", "btn secondary", "Fertig");
  done.addEventListener("click", closePractice);
  box.append(again, done);
}
function summaryStat(val, lbl) {
  const c = el("div", "summary-stat");
  c.appendChild(el("div", "val", val));
  c.appendChild(el("div", "lbl", lbl));
  return c;
}

// --- Meilensteine: kurzer Badge-Pop, kein Vollbild-Konfetti ---
let milestoneTimer = null;
function showMilestone(text) {
  haptic("milestone");
  const m = $("milestone");
  m.innerHTML = "";
  m.insertAdjacentHTML("beforeend", ICONS.check);
  m.appendChild(el("span", null, text));
  m.hidden = false;
  m.classList.remove("show");
  void m.offsetWidth;              // Neustart der Animation erzwingen
  m.classList.add("show");
  clearTimeout(milestoneTimer);
  milestoneTimer = setTimeout(() => {
    m.classList.remove("show");
    setTimeout(() => { m.hidden = true; }, 300);
  }, 2400);
}
// Jeder Meilenstein wird genau einmal gefeiert.
function markMilestone(id) {
  if (shownMilestones.has(id)) return false;
  shownMilestones.add(id);
  save("milestones", [...shownMilestones]);
  return true;
}
function checkMilestones(goalJustReached) {
  if (goalJustReached) {
    showMilestone(markMilestone("goal-first") ? "Erstes Tagesziel geschafft" : "Tagesziel erreicht");
    return;
  }
  for (const n of [7, 30, 100]) {
    if (daily.streak >= n && markMilestone("streak-" + n)) { showMilestone(`${n} Tage in Folge`); return; }
  }
  const learned = Object.keys(progress).length;
  for (const n of [50, 100, 200]) {
    if (learned >= n && markMilestone("words-" + n)) { showMilestone(`${n} Vokabeln geübt`); return; }
  }
}

// --- Vokabel-Controls ---
$("dirToggle").addEventListener("click", () => {
  dir = dir === "es-de" ? "de-es" : "es-de";
  localStorage.setItem("dir", dir);
  $("dirToggle").textContent = dir === "es-de" ? "🇪🇸 → 🇩🇪" : "🇩🇪 → 🇪🇸";
  refreshQuestion();
});
function catLabel() {
  return selectedCat === "Alle" ? "Alle Themen" : selectedCat;
}
function renderCatPanel() {
  const p = $("catPanel");
  p.innerHTML = "";
  ["Alle", ...allCats].forEach((c) => {
    const row = el("div", "panel-row" + (selectedCat === c ? " on" : ""));
    row.appendChild(el("span", null, c === "Alle" ? "Alle Themen" : c));
    row.appendChild(el("span", "check", "✓"));
    row.addEventListener("click", () => {
      selectedCat = c;
      localStorage.setItem("cat", c);
      renderCatPanel();
      $("catBtn").textContent = catLabel();
      $("catPanel").hidden = true;
      if (focusMode) exitFocus();
      refreshQuestion();
    });
    p.appendChild(row);
  });
}
$("catBtn").addEventListener("click", () => {
  const p = $("catPanel");
  p.hidden = !p.hidden;
});

// --- Verben-Controls ---
const tenseOptions = ["Alle", ...TENSES];
$("tenseToggle").addEventListener("click", () => {
  tenseFilter = tenseOptions[(tenseOptions.indexOf(tenseFilter) + 1) % tenseOptions.length];
  localStorage.setItem("tense", tenseFilter);
  $("tenseToggle").textContent = tenseFilter === "Alle" ? "Alle Zeiten" : tenseFilter;
  refreshQuestion();
});
const typeOptions = ["Alle", "regular", "irregular", "special"];
const typeLabel = { Alle: "Alle Verben", regular: "Regelmäßig", irregular: "Unregelmäßig", special: "Sonderfälle" };
$("typeToggle").addEventListener("click", () => {
  typeFilter = typeOptions[(typeOptions.indexOf(typeFilter) + 1) % typeOptions.length];
  localStorage.setItem("type", typeFilter);
  $("typeToggle").textContent = typeLabel[typeFilter];
  refreshQuestion();
});

nextBtn.addEventListener("click", advance);

// --- Liste: Suche + eigene Vokabeln ---
$("listeSearch").addEventListener("input", (e) => { listeQuery = e.target.value; renderListe(); });
$("addBtn").addEventListener("click", () => {
  if (addCustom($("addEs").value, $("addDe").value, $("addCat").value)) {
    $("addEs").value = ""; $("addDe").value = ""; $("addCat").value = "";
    listeQuery = ""; $("listeSearch").value = "";
    renderListe();
  }
});

// ============================================================
//  View: Home
// ============================================================
function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}
const PRACTICE_LABEL = { mc: "Auswahl", write: "Schreiben", cards: "Karten", table: "Tabelle" };
function ctaSubLabel() {
  const what = mode === "verbs" ? "Verben" : (selectedCat === "Alle" ? "Vokabeln" : selectedCat);
  return `${what} · ${PRACTICE_LABEL[practice] || ""}`;
}

// Fällige Wiederholungen: NUR bereits geübte Wörter, deren Leitner-Frist abgelaufen ist.
// Wichtig: pickWord() behandelt Wörter ohne progress-Eintrag ebenfalls als fällig
// (`progress[w.es]?.due || 0`). Für die Kachel wäre das sinnlos — das wären immer alle.
function dueKeys() {
  const now = Date.now();
  return Object.entries(progress)
    .filter(([key, p]) => p.due <= now && itemByKey(key))
    .map(([key]) => key);
}

// Wort des Tages: aus dem Datum bestimmt, damit es den ganzen Tag stabil bleibt.
function wordOfDay() {
  if (!WORDS.length) return null;
  const key = dayKey();
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100000;
  return WORDS[h % WORDS.length];
}

// Fortschrittsring: SVG-Kreis, Füllstand über stroke-dashoffset.
function goalRing(pct) {
  const R = 34, C = 2 * Math.PI * R;
  const wrap = el("div", "ring" + (pct >= 1 ? " done" : ""));
  wrap.innerHTML = `
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="1" x2="1" y2="0">
          <stop class="ring-a" offset="0"></stop>
          <stop class="ring-b" offset="1"></stop>
        </linearGradient>
      </defs>
      <circle class="ring-track" cx="40" cy="40" r="${R}"></circle>
      <circle class="ring-fill" cx="40" cy="40" r="${R}"
              stroke-dasharray="${C.toFixed(1)}"
              stroke-dashoffset="${C.toFixed(1)}"></circle>
    </svg>`;
  // Ring füllt sich sichtbar von leer auf den Tagesstand.
  const fill = wrap.querySelector(".ring-fill");
  growTo(
    () => { fill.style.strokeDashoffset = (C * (1 - pct)).toFixed(1); },
    () => { fill.style.strokeDashoffset = C.toFixed(1); },
  );
  return wrap;
}

// Sieben Punkte Mo–So: erledigt = Tagesziel an dem Tag erreicht.
// Die Historie beginnt mit dem Einbau — rueckwirkend gibt es keine Daten.
function weekDots() {
  const wrap = el("div", "week");
  const heute = new Date();
  const montagsOffset = (heute.getDay() + 6) % 7;   // Mo=0 … So=6
  for (let i = 0; i < 7; i++) {
    const d = new Date(heute);
    d.setDate(heute.getDate() - montagsOffset + i);
    const key = dayKey(d);
    const punkt = el("span", "week-dot"
      + (daily.done.includes(key) ? " on" : "")
      + (key === dayKey() ? " today" : "")
      + (d > heute ? " future" : ""));
    punkt.title = key;
    wrap.appendChild(punkt);
  }
  return wrap;
}

function renderHome() {
  rollDay();
  const box = $("homeContent");
  box.innerHTML = "";

  const head = el("div", "home-head");
  head.appendChild(el("span", "home-hello", greeting()));
  head.appendChild(el("span", "home-date",
    new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })));
  box.appendChild(head);

  const grid = el("div", "home-grid");

  const streakTile = el("div", "tile");
  streakTile.appendChild(el("div", "tile-num", String(daily.streak)));
  const sl = el("div", "tile-lbl streak-lbl" + (daily.streak > 0 ? " live" : ""));
  sl.innerHTML = ICONS.flame;
  sl.appendChild(el("span", null, daily.streak === 1 ? "Tag in Folge" : "Tage in Folge"));
  streakTile.appendChild(sl);
  streakTile.appendChild(weekDots());
  grid.appendChild(streakTile);

  const pct = daily.goal ? Math.min(1, daily.count / daily.goal) : 0;
  const goalTile = el("div", "tile");
  const ring = goalRing(pct);
  const center = el("div", "ring-center");
  center.appendChild(el("span", "ring-num", String(daily.count)));
  center.appendChild(el("span", "ring-goal", "/ " + daily.goal));
  ring.appendChild(center);
  goalTile.append(ring, el("div", "tile-lbl", "Tagesziel"));
  grid.appendChild(goalTile);
  box.appendChild(grid);

  if (daily.best > 0) {
    box.appendChild(el("p", "record", `Rekord: ${daily.best} ${daily.best === 1 ? "Tag" : "Tage"} in Folge`));
  }

  const cta = el("button", "cta");
  cta.appendChild(el("span", "cta-main", daily.count ? "Weiter lernen" : "Lernen starten"));
  cta.appendChild(el("span", "cta-sub", ctaSubLabel()));
  cta.addEventListener("click", openStartSheet);
  box.appendChild(cta);

  // Fällige Wiederholungen — ruhiger als die Haupt-CTA, damit die Hierarchie stimmt.
  const due = dueKeys();
  if (due.length) {
    const card = el("button", "action-card");
    const icon = el("span", "action-icon");
    icon.innerHTML = ICONS.cycle;
    const txt = el("div", "action-txt");
    txt.appendChild(el("span", "action-main", `${due.length} ${due.length === 1 ? "Eintrag" : "Einträge"} fällig`));
    txt.appendChild(el("span", "action-sub", "Wiederholung nach Plan"));
    const chev = el("span", "action-chev");
    chev.innerHTML = ICONS.chevron;
    card.append(icon, txt, chev);
    card.addEventListener("click", () => startFocusWith(due, "fällige Einträge"));
    box.appendChild(card);
  }

  // Wort des Tages
  const wod = wordOfDay();
  if (wod) {
    box.appendChild(el("div", "home-sec", "Wort des Tages"));
    const row = el("div", "mini-row");
    const txt = el("div", "txt");
    txt.appendChild(el("span", "es", wod.es));
    txt.appendChild(el("span", "de", wod.de));
    const say = el("button", "speak");
    say.setAttribute("aria-label", "Wort vorlesen");
    say.innerHTML = ICONS.speaker;
    say.addEventListener("click", () => speak(wod.es, say));
    row.append(txt, say);
    box.appendChild(row);
  }

  // Kurzüberblick: die zuletzt falsch beantworteten Vokabeln
  const recent = [...errors].slice(-3).reverse().map((k) => ({ key: k, w: itemByKey(k) })).filter((x) => x.w);
  if (recent.length) {
    const sec = el("div", "home-sec");
    sec.appendChild(el("span", null, "Zuletzt falsch"));
    const more = el("button", "home-more");
    more.append(el("span", null, "Alle"));
    more.insertAdjacentHTML("beforeend", ICONS.chevron);
    more.addEventListener("click", () => switchView("fehler"));
    sec.appendChild(more);
    box.appendChild(sec);

    recent.forEach(({ w }) => {
      const row = el("div", "mini-row");
      const dot = el("span", "status-dot bad");
      dot.innerHTML = ICONS.alert;
      const txt = el("div", "txt");
      txt.appendChild(el("span", "es", w.es));
      txt.appendChild(el("span", "de", w.de));
      row.append(dot, txt);
      box.appendChild(row);
    });
  }
}

// --- View: Alle Vokabeln ---
// opts.key: Lernschluessel, falls er vom spanischen Wort abweicht (Verben).
function vocabRow(w, opts = {}) {
  const key = opts.key || w.es;
  const row = el("div", "row");
  const txt = el("div", "txt");
  txt.appendChild(el("span", "es", w.es));
  txt.appendChild(el("span", "de", w.de));
  row.appendChild(txt);
  // Statusindikator statt Text-Badge: Icon + Farbe unterscheiden Fehler und Markierung.
  if (opts.status) {
    const dot = el("span", "status-dot " + (opts.status === "err" ? "bad" : "mark"));
    dot.innerHTML = opts.status === "err" ? ICONS.alert : ICONS.star;
    row.insertBefore(dot, txt);
  }
  // Der gefüllte Stern zeigt „markiert" bereits an — kein zusätzliches Badge nötig.
  const star = el("button", "row-star" + (marked.has(key) ? " on" : ""));
  star.innerHTML = ICONS.star;
  star.addEventListener("click", () => {
    const on = !marked.has(key);
    if (on) marked.add(key); else marked.delete(key);
    saveSets();
    // Im Fehler-Tab ändert sich die Liste selbst → neu zeichnen.
    if (view === "fehler") { renderFehler(); return; }
    // Sonst nur diese Zeile umschalten, damit die Animation sichtbar bleibt.
    star.classList.toggle("on", on);
    star.classList.remove("pop");
    void star.offsetWidth;
    star.classList.add("pop");
  });
  row.appendChild(star);
  if (opts.onDelete) {
    const del = el("button", "row-del");
    del.innerHTML = ICONS.trash;
    del.addEventListener("click", opts.onDelete);
    row.appendChild(del);
  }
  return row;
}

// Eigene Vokabeln verwalten
function addCustom(es, de, cat) {
  es = es.trim(); de = de.trim(); cat = (cat || "").trim() || "Eigene";
  if (!es || !de) return false;
  customVocab.push({ es, de, cat });
  save("customVocab", customVocab);
  rebuildWords();
  renderCatPanel();
  return true;
}
function deleteCustom(es) {
  customVocab = customVocab.filter((c) => c.es !== es);
  save("customVocab", customVocab);
  rebuildWords();
  renderListe();
}

function renderListe() {
  const box = $("listeContent");
  box.innerHTML = "";
  const q = listeQuery.trim().toLowerCase();
  const match = (a, b) => !q || a.toLowerCase().includes(q) || b.toLowerCase().includes(q);
  const isCustom = (w) => customVocab.some((c) => c.es === w.es);

  allCats.forEach((c) => {
    const words = WORDS.filter((w) => w.cat === c && match(w.es, w.de));
    if (!words.length) return;
    box.appendChild(el("div", "group-title", c));
    words.forEach((w) => box.appendChild(vocabRow(w, isCustom(w) ? { onDelete: () => deleteCustom(w.es) } : {})));
  });

  const verbs = VERBS.filter((v) => match(v.inf, v.de));
  if (verbs.length) {
    box.appendChild(el("div", "group-title", "Verben"));
    verbs.forEach((v) => {
      const row = el("div", "row");
      const txt = el("div", "txt");
      txt.appendChild(el("span", "es", v.inf));
      txt.appendChild(el("span", "de", v.de + (v.type === "irregular" ? " · unregelmäßig" : "")));
      row.appendChild(txt);
      box.appendChild(row);
    });
  }
}

// --- View: Markiert & Fehler ---
function renderFehler() {
  const box = $("fehlerContent");
  box.innerHTML = "";
  const keys = [...new Set([...marked, ...errors])];
  if (!keys.length) {
    box.appendChild(el("div", "empty", "Noch nichts markiert. Tippe beim Üben auf den Stern ☆ oder mach einen Fehler – dann taucht die Vokabel hier auf."));
    return;
  }
  // Primäre Aktion: gleiche Behandlung wie die Home-CTA, damit sie klar dominiert.
  const cta = el("button", "cta");
  cta.appendChild(el("span", "cta-main", `Diese ${keys.length} üben`));
  cta.appendChild(el("span", "cta-sub", `${errors.size} Fehler · ${marked.size} markiert`));
  cta.addEventListener("click", startFocus);
  box.appendChild(cta);

  box.appendChild(el("div", "group-title", "Vokabeln"));
  keys.forEach((key) => {
    const w = itemByKey(key);
    if (!w) return;
    box.appendChild(vocabRow(w, { key, status: errors.has(key) ? "err" : "mark" }));
  });
}

// --- Statistik (liest den progress-Store) ---
function statCard(val, lbl, sub) {
  const c = el("div", "stat-card");
  c.appendChild(el("div", "val", String(val)));
  c.appendChild(el("div", "lbl", lbl));
  if (sub) c.appendChild(el("div", "sub", sub));
  return c;
}
function catBar(name, pct, index = 0) {
  const row = el("div", "cat-bar");
  row.appendChild(el("span", "name", name));
  const track = el("div", "track");
  const fill = el("div", "fill");
  track.appendChild(fill);
  track.appendChild(el("span", "pct", pct + "%"));
  row.appendChild(track);
  // Balken wachsen von links, leicht versetzt nacheinander.
  fill.style.transitionDelay = Math.min(index, 8) * 40 + "ms";
  growTo(
    () => { fill.style.width = pct + "%"; },
    () => { fill.style.width = "0%"; },
  );
  return row;
}
function renderStatsInto(box) {
  const entries = Object.entries(progress);
  const geübt = entries.length;
  const gemeistert = entries.filter(([, p]) => p.box >= 5).length;
  const tr = entries.reduce((a, [, p]) => a + p.right, 0);
  const tw = entries.reduce((a, [, p]) => a + p.wrong, 0);
  const quote = tr + tw ? Math.round((tr / (tr + tw)) * 100) : 0;

  const grid = el("div", "stat-grid");
  grid.append(
    statCard(geübt, "geübt", "von " + (WORDS.length + allVerbKeys().length)),
    statCard(gemeistert, "gemeistert", "Box 5"),
    statCard(quote + "%", "Treffer", "gesamt"),
  );
  box.appendChild(grid);

  box.appendChild(el("div", "stat-h", "Nach Thema"));
  allCats.forEach((c, i) => {
    const words = WORDS.filter((w) => w.cat === c);
    const sumBox = words.reduce((a, w) => a + ((progress[w.es]?.box) || 0), 0);
    const pct = words.length ? Math.round((sumBox / (5 * words.length)) * 100) : 0;
    box.appendChild(catBar(c, pct, i));
  });
  // Konjugation getrennt: das Vokabelthema „Verbos" enthaelt nur die
  // Infinitive als Woerter, hier geht es um die Formen.
  const vk = allVerbKeys();
  const vSum = vk.reduce((a, k) => a + ((progress[k]?.box) || 0), 0);
  box.appendChild(catBar("Konjugation", Math.round((vSum / (5 * vk.length)) * 100), allCats.length));
}

// --- View: Mehr (Statistik + Einstellungen) ---
function renderSettings() {
  const box = $("settingsContent");
  box.innerHTML = "";

  box.appendChild(el("div", "stat-h", "Statistik"));
  renderStatsInto(box);

  box.appendChild(el("div", "stat-h", "Üben"));
  box.appendChild(choiceRow("Tagesziel",
    [10, 20, 30, 50].map((n) => ({ v: n, l: String(n) })), daily.goal, (v) => {
      daily.goal = v;
      save("daily", daily);
    }));
  box.appendChild(toggleRow("Spaced Repetition", srs, (on) => {
    srs = on;
    localStorage.setItem("srs", on ? "on" : "off");
  }));

  box.appendChild(el("div", "stat-h", "Darstellung"));
  box.appendChild(toggleRow("Dunkelmodus", theme === "dark", (on) => {
    theme = on ? "dark" : "light";
    localStorage.setItem("theme", theme);
    applyTheme();
  }));

  const accRow = el("div", "setting-row choice-row");
  accRow.appendChild(el("span", null, "Akzentfarbe"));
  const sw = el("div", "swatches");
  ACCENTS.forEach((a) => {
    const b = el("button", "swatch sw-" + a + (a === accent ? " on" : ""));
    b.setAttribute("aria-label", a);
    b.addEventListener("click", () => {
      accent = a;
      localStorage.setItem("accent", a);
      applyAccent();
      sw.querySelectorAll(".swatch").forEach((x) => x.classList.toggle("on", x === b));
    });
    sw.appendChild(b);
  });
  accRow.appendChild(sw);
  box.appendChild(accRow);

  box.appendChild(choiceRow("Schriftgröße",
    [{ v: "s", l: "Klein" }, { v: "m", l: "Mittel" }, { v: "l", l: "Groß" }], fontSize, (v) => {
      fontSize = v;
      localStorage.setItem("fontSize", v);
      applyFontSize();
    }));

  box.appendChild(el("div", "stat-h", "Ton"));
  box.appendChild(toggleRow("Automatisch vorlesen", autoSpeak, (on) => {
    autoSpeak = on;
    localStorage.setItem("autoSpeak", on ? "on" : "off");
  }));
  box.appendChild(toggleRow("Soundeffekte", sfxOn, (on) => {
    sfxOn = on;
    localStorage.setItem("sfx", on ? "on" : "off");
    if (on) sfx("ok");   // kurze Hörprobe, entsperrt zugleich den Audio-Context
  }));
  box.appendChild(toggleRow("Vibration", hapticsOn, (on) => {
    hapticsOn = on;
    localStorage.setItem("haptics", on ? "on" : "off");
    if (on) haptic("ok");   // kurze Probe direkt aus dem Tap heraus
  }));
  box.appendChild(el("p", "data-note", canVibrate()
    ? "Kurzes Vibrieren bei richtig und falsch."
    : "Kurzes Vibrieren bei richtig und falsch. Auf dem iPhone nutzt die App einen Umweg über einen versteckten Systemschalter — ob das Tippen ankommt, siehst du nur auf dem Gerät selbst."));

  // --- Sicherung ---
  box.appendChild(el("div", "stat-h", "Daten"));
  const hinweis = el("p", "data-note",
    "Dein Fortschritt liegt nur auf diesem Gerät. Sichere ihn regelmäßig — sonst ist er bei einem Gerätewechsel weg.");
  box.appendChild(hinweis);

  const meldung = el("p", "data-msg");
  meldung.hidden = true;
  const sag = (text, gut) => {
    meldung.textContent = text;
    meldung.className = "data-msg " + (gut ? "ok" : "bad");
    meldung.hidden = false;
  };

  const bKopie = el("button", "btn secondary", "Sicherung in die Zwischenablage");
  bKopie.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(buildBackup()); sag("Sicherung kopiert. Irgendwo einfügen und aufbewahren.", true); }
    catch (e) { sag("Kopieren nicht möglich — nutze „Als Datei sichern“.", false); }
  });
  box.appendChild(bKopie);

  const bDatei = el("button", "btn secondary", "Als Datei sichern");
  bDatei.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([buildBackup()], { type: "application/json" }));
    a.download = `vocabulario-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    sag("Datei erzeugt. Auf dem iPhone landet sie in „Downloads“.", true);
  });
  box.appendChild(bDatei);

  // Einspielen: Textfeld ODER Datei — auf dem iPhone ist Einfügen der sichere Weg.
  const kasten = el("details", "addbox");
  kasten.appendChild(el("summary", null, "Sicherung einspielen"));
  const feld = el("textarea", "add-input restore-input");
  feld.placeholder = "Gesicherten Text hier einfügen…";
  feld.rows = 3;
  const datei = el("input", "add-input");
  datei.type = "file";
  datei.accept = "application/json,.json";
  datei.addEventListener("change", () => {
    const f = datei.files && datei.files[0];
    if (!f) return;
    f.text().then((t) => { feld.value = t; sag("Datei gelesen. Jetzt auf „Einspielen“ tippen.", true); });
  });
  const bRein = el("button", "btn", "Einspielen");
  bRein.addEventListener("click", () => {
    const text = feld.value.trim();
    if (!text) { sag("Erst Text einfügen oder Datei wählen.", false); return; }
    // Erst prüfen, dann fragen, dann schreiben.
    let vorschau;
    try { vorschau = JSON.parse(text); } catch (e) { sag("Das ist kein gültiges JSON.", false); return; }
    if (!vorschau || vorschau.app !== "vocabulario") { sag("Die Sicherung stammt nicht aus Vocabulario.", false); return; }
    askConfirm("Sicherung einspielen?",
      `Alle aktuellen Daten werden durch die Sicherung vom ${(vorschau.datum || "").slice(0, 10)} ersetzt.`,
      "Abbrechen", "Einspielen", () => {
        const fehler = applyBackup(text);
        if (fehler) { sag(fehler, false); return; }
        location.reload();
      });
  });
  kasten.append(feld, datei, bRein);
  box.appendChild(kasten);
  box.appendChild(meldung);

  box.appendChild(el("div", "stat-h", "Zurücksetzen"));
  const bStats = el("button", "btn secondary", "Statistik & Fortschritt zurücksetzen");
  bStats.style.marginTop = "10px";
  bStats.addEventListener("click", () => {
    stats = { right: 0, total: 0, streak: 0 }; saveStats();
    progress = {}; save("progress", progress);
    daily = { date: dayKey(), count: 0, goal: daily.goal, streak: 0, lastGoalDate: "", best: 0 };
    save("daily", daily);
    shownMilestones = new Set(); save("milestones", []);
    updateStreakBadge(); renderSettings();
  });
  box.appendChild(bStats);

  const bErr = el("button", "btn secondary", "Fehlervokabeln zurücksetzen");
  bErr.style.marginTop = "10px";
  bErr.addEventListener("click", () => { errors.clear(); saveSets(); renderSettings(); });
  box.appendChild(bErr);

  const bMark = el("button", "btn secondary", "Markierungen löschen");
  bMark.style.marginTop = "10px";
  bMark.addEventListener("click", () => { marked.clear(); saveSets(); renderSettings(); });
  box.appendChild(bMark);
}

// --- Init ---
applyTheme();
applyAccent();
applyFontSize();
$("dirToggle").textContent = dir === "es-de" ? "🇪🇸 → 🇩🇪" : "🇩🇪 → 🇪🇸";
$("catBtn").textContent = catLabel();
renderCatPanel();
$("tenseToggle").textContent = tenseFilter === "Alle" ? "Alle Zeiten" : tenseFilter;
$("typeToggle").textContent = typeLabel[typeFilter];
$("modeVocab").classList.toggle("active", mode === "vocab");
$("modeVerbs").classList.toggle("active", mode === "verbs");
$("vocabControls").hidden = mode !== "vocab";
$("verbControls").hidden = mode !== "verbs";
syncPractice();
rollDay();
renderHome();

// iOS: aktiviert :active-Drück-Effekte beim Antippen (sonst ignoriert Safari sie bei Touch)
document.addEventListener("touchstart", () => {}, { passive: true });

// --- Service Worker (offline) ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
