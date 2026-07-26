"use strict";

// --- State ---
let view = "uben";                                  // uben | liste | fehler | settings
let mode = localStorage.getItem("mode") || "vocab"; // vocab | verbs
let dir = localStorage.getItem("dir") || "es-de";   // es-de | de-es
const allCats = [...new Set(VOCAB.map((v) => v.cat))];
let selectedCats = new Set(JSON.parse(localStorage.getItem("cats") || "null") || allCats);
// Neu hinzugekommene Kategorien automatisch aktivieren
const knownCats = new Set(JSON.parse(localStorage.getItem("knownCats") || "[]"));
allCats.forEach((c) => { if (!knownCats.has(c)) selectedCats.add(c); });
localStorage.setItem("knownCats", JSON.stringify(allCats));
localStorage.setItem("cats", JSON.stringify([...selectedCats]));
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

function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function saveSets() { save("marked", [...marked]); save("errors", [...errors]); }
function saveStats() { save("stats", stats); }
function updateStreakBadge() {
  const b = $("cardStreak");
  if (stats.streak > 0) { b.textContent = "🔥 " + stats.streak; b.hidden = false; }
  else b.hidden = true;
}
function applyTheme() {
  document.body.classList.toggle("dark", theme === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#1b1714" : "#f4ecd9";
}
function vocabByKey(k) { return VOCAB.find((v) => v.es === k); }

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
function render(labelText, wordText, choices, correct, showMark) {
  answered = false;
  correctText = correct;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.hidden = true;
  optionsEl.innerHTML = "";
  promptLabel.textContent = labelText;
  wordEl.textContent = wordText;

  markBtn.hidden = !showMark;
  if (showMark) markBtn.textContent = marked.has(currentKey) ? "★" : "☆";
  updateStreakBadge();

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
    const val = normalize(input.value);
    if (!val) return;
    answered = true;
    const accepted = correctText.split("/").map(normalize);
    const ok = accepted.includes(val);
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
    const p = VOCAB.filter((v) => focusSet.has(v.es));
    if (p.length) return p;
    exitFocus(); // Fokusliste leer geworden
  }
  const cats = selectedCats.size ? selectedCats : new Set(allCats);
  return VOCAB.filter((v) => cats.has(v.cat));
}

function vocabQuestion() {
  const words = vocabPool();
  const current = pickWord(words);
  currentKey = current.es;
  currentSpanish = current.es;
  const correct = vocabAns(current);
  const distractPool = (words.length >= 4 ? words : VOCAB)
    .filter((w) => vocabAns(w) !== correct)
    .map(vocabAns);
  const choices = [correct, ...pickDistractors(correct, distractPool)];
  const label = dir === "es-de" ? "Was bedeutet…" : "Wie heißt auf Spanisch…";
  render(label, vocabAsk(current), choices, correct, true);
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

  render(`${verb.inf} · ${verb.de}`, `${PERSONS[i]} · ${tense}`, choices, correct, false);
  maybeAutoSpeak();
}

function newQuestion() {
  if (mode === "verbs" && !focusMode) verbQuestion();
  else vocabQuestion();
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
    feedbackEl.textContent = "Richtig: " + correctText;
    feedbackEl.className = "feedback bad";
    if (currentKey) { errors.add(currentKey); saveSets(); }
  }
  recordAnswer(currentKey, ok);
  saveStats();
  updateStreakBadge();
  nextBtn.hidden = false;
}

// --- Vorlesen (Lautsprecher auf der Karte) ---
speakBtn.addEventListener("click", () => speak(currentSpanish));

// --- Markieren (Stern auf der Karte) ---
markBtn.addEventListener("click", () => {
  if (!currentKey) return;
  if (marked.has(currentKey)) marked.delete(currentKey); else marked.add(currentKey);
  saveSets();
  markBtn.textContent = marked.has(currentKey) ? "★" : "☆";
});

// --- Fokus-Üben (markierte + Fehler) ---
function startFocus() {
  const keys = [...new Set([...marked, ...errors])];
  if (!keys.length) return;
  focusSet = new Set(keys);
  focusMode = true;
  $("focusBanner").hidden = false;
  $("focusText").textContent = `Fokus: ${keys.length} markierte / Fehler`;
  switchView("uben");
  vocabQuestion();
}
function exitFocus() {
  focusMode = false;
  $("focusBanner").hidden = true;
}
$("focusExit").addEventListener("click", () => { exitFocus(); newQuestion(); });

// --- Modus-Umschalter ---
function setMode(m) {
  mode = m;
  localStorage.setItem("mode", mode);
  $("modeVocab").classList.toggle("active", mode === "vocab");
  $("modeVerbs").classList.toggle("active", mode === "verbs");
  $("vocabControls").hidden = mode !== "vocab";
  $("verbControls").hidden = mode !== "verbs";
  if (mode === "verbs" && focusMode) { exitFocus(); }
  newQuestion();
}
$("modeVocab").addEventListener("click", () => setMode("vocab"));
$("modeVerbs").addEventListener("click", () => setMode("verbs"));

// --- Übungsart-Umschalter (Auswahl/Schreiben/Karten) ---
function setPractice(p) {
  practice = p;
  localStorage.setItem("practice", p);
  document.querySelectorAll("#practiceModes .mode").forEach((b) => b.classList.toggle("active", b.dataset.practice === p));
  newQuestion();
}
document.querySelectorAll("#practiceModes .mode").forEach((b) => b.addEventListener("click", () => setPractice(b.dataset.practice)));

// --- View-Wechsel (Bottom Nav) ---
function switchView(name) {
  view = name;
  ["uben", "liste", "fehler", "settings"].forEach((v) => { $("view-" + v).hidden = v !== name; });
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
  if (name === "liste") renderListe();
  if (name === "fehler") renderFehler();
  if (name === "settings") renderSettings();
}
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => switchView(t.dataset.view)));

// --- Vokabel-Controls ---
$("dirToggle").addEventListener("click", () => {
  dir = dir === "es-de" ? "de-es" : "es-de";
  localStorage.setItem("dir", dir);
  $("dirToggle").textContent = dir === "es-de" ? "🇪🇸 → 🇩🇪" : "🇩🇪 → 🇪🇸";
  newQuestion();
});
function catLabel() {
  return selectedCats.size === 0 || selectedCats.size === allCats.length ? "Alle Themen" : `Themen · ${selectedCats.size}`;
}
function renderCatPanel() {
  const p = $("catPanel");
  p.innerHTML = "";
  allCats.forEach((c) => {
    const row = el("div", "panel-row" + (selectedCats.has(c) ? " on" : ""));
    row.appendChild(el("span", null, c));
    row.appendChild(el("span", "check", "✓"));
    row.addEventListener("click", () => {
      if (selectedCats.has(c)) selectedCats.delete(c); else selectedCats.add(c);
      save("cats", [...selectedCats]);
      row.classList.toggle("on");
      $("catBtn").textContent = catLabel();
      if (focusMode) exitFocus();
      newQuestion();
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
  newQuestion();
});
const typeOptions = ["Alle", "regular", "irregular"];
const typeLabel = { Alle: "Alle Verben", regular: "Regelmäßig", irregular: "Unregelmäßig" };
$("typeToggle").addEventListener("click", () => {
  typeFilter = typeOptions[(typeOptions.indexOf(typeFilter) + 1) % typeOptions.length];
  localStorage.setItem("type", typeFilter);
  $("typeToggle").textContent = typeLabel[typeFilter];
  newQuestion();
});

nextBtn.addEventListener("click", newQuestion);

// --- View: Alle Vokabeln ---
function vocabRow(w, opts = {}) {
  const row = el("div", "row");
  const txt = el("div", "txt");
  txt.appendChild(el("span", "es", w.es));
  txt.appendChild(el("span", "de", w.de));
  row.appendChild(txt);
  if (opts.tag === "err") row.appendChild(el("span", "tag err", "Fehler"));
  if (marked.has(w.es)) row.appendChild(el("span", "tag mark", "★"));
  const star = el("button", "row-star", marked.has(w.es) ? "★" : "☆");
  star.addEventListener("click", () => {
    if (marked.has(w.es)) marked.delete(w.es); else marked.add(w.es);
    saveSets();
    if (view === "liste") renderListe(); else renderFehler();
  });
  row.appendChild(star);
  return row;
}

function renderListe() {
  const box = $("listeContent");
  box.innerHTML = "";
  allCats.forEach((c) => {
    box.appendChild(el("div", "group-title", c));
    VOCAB.filter((w) => w.cat === c).forEach((w) => box.appendChild(vocabRow(w)));
  });
  box.appendChild(el("div", "group-title", "Verben"));
  VERBS.forEach((v) => {
    const row = el("div", "row");
    const txt = el("div", "txt");
    txt.appendChild(el("span", "es", v.inf));
    txt.appendChild(el("span", "de", v.de + (v.type === "irregular" ? " · unregelmäßig" : "")));
    row.appendChild(txt);
    box.appendChild(row);
  });
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
    statCard(`${geübt}/${VOCAB.length}`, "geübt"),
    statCard(gemeistert, "gemeistert"),
    statCard(quote + "%", "Trefferquote"),
  );
  box.appendChild(grid);

  box.appendChild(el("div", "stat-h", "Nach Thema"));
  allCats.forEach((c) => {
    const words = VOCAB.filter((w) => w.cat === c);
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
document.querySelectorAll("#practiceModes .mode").forEach((b) => b.classList.toggle("active", b.dataset.practice === practice));
newQuestion();

// --- Service Worker (offline) ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
