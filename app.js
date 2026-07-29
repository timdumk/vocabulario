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

let marked = new Set(JSON.parse(localStorage.getItem("marked") || "[]"));
let errors = new Set(JSON.parse(localStorage.getItem("errors") || "[]"));
let focusMode = false;
let focusSet = new Set();

// Tagesfortschritt: Tagesziel + Tages-Streak (Tage in Folge mit erreichtem Ziel).
// Unabhängig von stats.streak — das zählt richtige Antworten in Folge.
let daily = Object.assign(
  { date: "", count: 0, goal: 20, streak: 0, lastGoalDate: "", best: 0 },
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
function pickWord(words) {
  if (!srs) return rand(words);
  const now = Date.now();
  let pool = words.filter((w) => (progress[w.es]?.due || 0) <= now);
  if (!pool.length) pool = words;
  const weights = pool.map((w) => 6 - (progress[w.es]?.box || 0));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

// --- Vorlesen (gratis über Browser-Sprachausgabe) ---
function speak(text) {
  if (!text || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
function maybeAutoSpeak() { if (autoSpeak) speak(currentSpanish); }

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

function vocabQuestion() {
  const words = vocabPool();
  const current = pickWord(words);
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
function verbQuestion() {
  currentKey = null;
  const pool = typeFilter === "Alle" ? VERBS : VERBS.filter((v) => v.type === typeFilter);
  const verb = rand(pool);
  currentSpanish = verb.inf;
  const tense = tenseFilter === "Alle" ? rand(TENSES) : tenseFilter;
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
function specialQuestion() {
  currentKey = null;
  const sp = rand(SPECIALS);
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
  if (mode === "verbs" && !focusMode) {
    if (typeFilter === "special") specialQuestion();
    else if (practice === "table") verbTableQuestion();
    else verbQuestion();
  } else {
    vocabQuestion();
  }
}

// --- Verben-Tabelle: alle Personen konjugieren (Zeitform vorgegeben) ---
function verbTableQuestion() {
  currentKey = null;
  correctText = null; // Tabelle hat keine einzelne „richtige Antwort" (Feld-Feedback stattdessen)
  const pool = (typeFilter === "Alle" || typeFilter === "special") ? VERBS : VERBS.filter((v) => v.type === typeFilter);
  const verb = rand(pool);
  currentSpanish = verb.inf;
  const tense = tenseFilter === "Alle" ? rand(TENSES) : tenseFilter;
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
  recordAnswer(currentKey, ok);
  const goalJustReached = touchDay();
  saveStats();
  updateStreakBadge();

  if (session) {
    session.answered++;
    if (ok) session.right++;
    updateProgress();
    const last = !session.endless && session.answered >= session.total;
    nextBtn.textContent = last ? "Ergebnis ansehen" : "Weiter →";
  }
  checkMilestones(goalJustReached);
  nextBtn.hidden = false;
}

// --- Vorlesen (Lautsprecher auf der Karte) ---
speakBtn.addEventListener("click", () => speak(currentSpanish));

// --- Markieren (Stern auf der Karte) ---
markBtn.addEventListener("click", () => {
  if (!currentKey) return;
  if (marked.has(currentKey)) marked.delete(currentKey); else marked.add(currentKey);
  saveSets();
  markBtn.classList.toggle("on", marked.has(currentKey));
});

// --- Fokus-Üben (markierte + Fehler) ---
function startFocus() {
  const keys = [...new Set([...marked, ...errors])];
  if (!keys.length) return;
  focusSet = new Set(keys);
  focusMode = true;
  $("focusBanner").hidden = false;
  $("focusText").textContent = `Fokus: ${keys.length} markierte / Fehler`;
  startSession();
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
function switchView(name) {
  view = name;
  ["home", "liste", "fehler", "settings"].forEach((v) => { $("view-" + v).hidden = v !== name; });
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
  if (name === "home") renderHome();
  if (name === "liste") renderListe();
  if (name === "fehler") renderFehler();
  if (name === "settings") renderSettings();
}
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => switchView(t.dataset.view)));

// ============================================================
//  Übung: eigener Vollbild-Flow (Tab-Bar ausgeblendet)
// ============================================================

// --- Start-Sheet: Modus, Übungsart, Filter und Rundenlänge wählen ---
function openStartSheet() {
  $("startSheet").hidden = false;
  $("catPanel").hidden = true;
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
  session = { total: sessionLen, answered: 0, right: 0, endless: sessionLen === 0 };
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
    $("confirmExit").hidden = false;
  } else {
    closePractice();
  }
});
$("confirmNo").addEventListener("click", () => { $("confirmExit").hidden = true; });
$("confirmYes").addEventListener("click", () => { $("confirmExit").hidden = true; closePractice(); });

// --- Fortschrittsanzeige oben ---
function updateProgress() {
  if (!session) return;
  const bar = $("progressBar"), fill = $("progressFill"), cnt = $("progressCount");
  if (session.endless) {
    bar.hidden = true;
    cnt.textContent = session.answered ? `${session.answered} geübt` : "Endlos";
  } else {
    bar.hidden = false;
    const done = Math.min(session.answered, session.total);
    fill.style.width = (done / session.total) * 100 + "%";
    cnt.textContent = `${Math.min(done + 1, session.total)} / ${session.total}`;
  }
}

// Nächste Frage — oder Rundenende.
function advance() {
  if (session && !session.endless && session.answered >= session.total) { showSummary(); return; }
  newQuestion();
  updateProgress();
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

  const box = $("summary");
  box.hidden = false;
  box.innerHTML = "";

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

// Fortschrittsring: SVG-Kreis, Füllstand über stroke-dashoffset.
function goalRing(pct) {
  const R = 34, C = 2 * Math.PI * R;
  const wrap = el("div", "ring");
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
              stroke-dashoffset="${(C * (1 - pct)).toFixed(1)}"></circle>
    </svg>`;
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
  const sl = el("div", "tile-lbl streak-lbl");
  sl.innerHTML = ICONS.flame;
  sl.appendChild(el("span", null, daily.streak === 1 ? "Tag in Folge" : "Tage in Folge"));
  streakTile.appendChild(sl);
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

  const cta = el("button", "cta");
  cta.appendChild(el("span", "cta-main", daily.count ? "Weiter lernen" : "Lernen starten"));
  cta.appendChild(el("span", "cta-sub", ctaSubLabel()));
  cta.addEventListener("click", openStartSheet);
  box.appendChild(cta);

  // Kurzüberblick: die zuletzt falsch beantworteten Vokabeln
  const recent = [...errors].slice(-3).reverse().map(vocabByKey).filter(Boolean);
  if (recent.length) {
    const sec = el("div", "home-sec");
    sec.appendChild(el("span", null, "Zuletzt falsch"));
    const more = el("button", "home-more");
    more.append(el("span", null, "Alle"));
    more.insertAdjacentHTML("beforeend", ICONS.chevron);
    more.addEventListener("click", () => switchView("fehler"));
    sec.appendChild(more);
    box.appendChild(sec);

    recent.forEach((w) => {
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
function vocabRow(w, opts = {}) {
  const row = el("div", "row");
  const txt = el("div", "txt");
  txt.appendChild(el("span", "es", w.es));
  txt.appendChild(el("span", "de", w.de));
  row.appendChild(txt);
  if (opts.tag === "err") row.appendChild(el("span", "tag err", "Fehler"));
  // Der gefüllte Stern zeigt „markiert" bereits an — kein zusätzliches Badge nötig.
  const star = el("button", "row-star" + (marked.has(w.es) ? " on" : ""));
  star.innerHTML = ICONS.star;
  star.addEventListener("click", () => {
    const on = !marked.has(w.es);
    if (on) marked.add(w.es); else marked.delete(w.es);
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
  const btn = el("button", "btn", `Diese ${keys.length} üben`);
  btn.addEventListener("click", startFocus);
  box.appendChild(btn);
  box.appendChild(el("div", "group-title", "Vokabeln"));
  keys.map(vocabByKey).filter(Boolean).forEach((w) => {
    box.appendChild(vocabRow(w, { tag: errors.has(w.es) ? "err" : null }));
  });
}

// --- Statistik (liest den progress-Store) ---
function statCard(val, lbl) {
  const c = el("div", "stat-card");
  c.appendChild(el("div", "val", String(val)));
  c.appendChild(el("div", "lbl", lbl));
  return c;
}
function catBar(name, pct) {
  const row = el("div", "cat-bar");
  row.appendChild(el("span", "name", name));
  const track = el("div", "track");
  const fill = el("div", "fill");
  fill.style.width = pct + "%";
  track.appendChild(fill);
  row.appendChild(track);
  row.appendChild(el("span", "pct", pct + "%"));
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
    statCard(`${geübt}/${WORDS.length}`, "geübt"),
    statCard(gemeistert, "gemeistert"),
    statCard(quote + "%", "Trefferquote"),
  );
  box.appendChild(grid);

  box.appendChild(el("div", "stat-h", "Nach Thema"));
  allCats.forEach((c) => {
    const words = WORDS.filter((w) => w.cat === c);
    const sumBox = words.reduce((a, w) => a + ((progress[w.es]?.box) || 0), 0);
    const pct = words.length ? Math.round((sumBox / (5 * words.length)) * 100) : 0;
    box.appendChild(catBar(c, pct));
  });
}

// --- View: Mehr (Statistik + Einstellungen) ---
function renderSettings() {
  const box = $("settingsContent");
  box.innerHTML = "";

  box.appendChild(el("div", "stat-h", "Statistik"));
  renderStatsInto(box);

  box.appendChild(el("div", "stat-h", "Einstellungen"));
  box.appendChild(toggleRow("Dunkelmodus", theme === "dark", (on) => {
    theme = on ? "dark" : "light";
    localStorage.setItem("theme", theme);
    applyTheme();
  }));
  box.appendChild(toggleRow("Spaced Repetition", srs, (on) => {
    srs = on;
    localStorage.setItem("srs", on ? "on" : "off");
  }));
  box.appendChild(toggleRow("Automatisch vorlesen", autoSpeak, (on) => {
    autoSpeak = on;
    localStorage.setItem("autoSpeak", on ? "on" : "off");
  }));

  const bStats = el("button", "btn secondary", "Statistik & Fortschritt zurücksetzen");
  bStats.style.marginTop = "10px";
  bStats.addEventListener("click", () => {
    stats = { right: 0, total: 0, streak: 0 }; saveStats();
    progress = {}; save("progress", progress);
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
