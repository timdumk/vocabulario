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

let marked = new Set(JSON.parse(localStorage.getItem("marked") || "[]"));
let errors = new Set(JSON.parse(localStorage.getItem("errors") || "[]"));
let focusMode = false;
let focusSet = new Set();

let correctText = null;
let currentKey = null;   // es-Schlüssel der aktuellen Vokabel (nur vocab)
let answered = false;

// --- DOM ---
const $ = (id) => document.getElementById(id);
const optionsEl = $("options");
const feedbackEl = $("feedback");
const promptLabel = $("promptLabel");
const wordEl = $("word");
const nextBtn = $("nextBtn");
const markBtn = $("markBtn");

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
function vocabByKey(k) { return VOCAB.find((v) => v.es === k); }

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

  shuffle(choices).forEach((choice) => {
    const btn = el("button", null, choice);
    btn.addEventListener("click", () => choose(btn));
    optionsEl.appendChild(btn);
  });
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
  const current = rand(words);
  currentKey = current.es;
  const correct = vocabAns(current);
  const distractPool = (words.length >= 4 ? words : VOCAB)
    .filter((w) => vocabAns(w) !== correct)
    .map(vocabAns);
  const choices = [correct, ...pickDistractors(correct, distractPool)];
  const label = dir === "es-de" ? "Was bedeutet…" : "Wie heißt auf Spanisch…";
  render(label, vocabAsk(current), choices, correct, true);
}

// --- Verben-Frage ---
function verbQuestion() {
  currentKey = null;
  const pool = typeFilter === "Alle" ? VERBS : VERBS.filter((v) => v.type === typeFilter);
  const verb = rand(pool);
  const tense = tenseFilter === "Alle" ? rand(TENSES) : tenseFilter;
  const i = Math.floor(Math.random() * PERSONS.length);
  const correct = verbForm(verb, tense, i);

  const sameTense = PERSONS.map((_, j) => verbForm(verb, tense, j));
  const otherTenses = TENSES.flatMap((t) => PERSONS.map((_, j) => verbForm(verb, t, j)));
  const otherVerbs = pool.flatMap((v) => PERSONS.map((_, j) => verbForm(v, tense, j)));
  const choices = [correct, ...pickDistractors(correct, sameTense, otherTenses, otherVerbs)];

  render(`${verb.inf} · ${verb.de}`, `${PERSONS[i]} · ${tense}`, choices, correct, false);
}

function newQuestion() {
  if (mode === "verbs" && !focusMode) verbQuestion();
  else vocabQuestion();
}

// --- Antwort werten ---
function choose(btn) {
  if (answered) return;
  answered = true;

  const correct = btn.textContent === correctText;
  stats.total++;
  if (correct) {
    stats.right++; stats.streak++;
    btn.classList.add("correct");
    feedbackEl.textContent = "¡Correcto!";
    feedbackEl.className = "feedback ok";
    if (currentKey && errors.has(currentKey)) { errors.delete(currentKey); saveSets(); } // gemeistert
  } else {
    stats.streak = 0;
    btn.classList.add("wrong");
    feedbackEl.textContent = "Richtig: " + correctText;
    feedbackEl.className = "feedback bad";
    if (currentKey) { errors.add(currentKey); saveSets(); }
  }

  [...optionsEl.children].forEach((b) => {
    b.disabled = true;
    if (b.textContent === correctText) b.classList.add("correct");
  });

  saveStats();
  updateStreakBadge();
  nextBtn.hidden = false;
}

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

// --- View: Einstellungen ---
function renderSettings() {
  const box = $("settingsContent");
  box.innerHTML = "";

  const bStats = el("button", "btn secondary", "Statistik zurücksetzen");
  bStats.addEventListener("click", () => { stats = { right: 0, total: 0, streak: 0 }; saveStats(); updateStreakBadge(); renderSettings(); });
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
$("dirToggle").textContent = dir === "es-de" ? "🇪🇸 → 🇩🇪" : "🇩🇪 → 🇪🇸";
$("catBtn").textContent = catLabel();
renderCatPanel();
$("tenseToggle").textContent = tenseFilter === "Alle" ? "Alle Zeiten" : tenseFilter;
$("typeToggle").textContent = typeLabel[typeFilter];
$("modeVocab").classList.toggle("active", mode === "vocab");
$("modeVerbs").classList.toggle("active", mode === "verbs");
$("vocabControls").hidden = mode !== "vocab";
$("verbControls").hidden = mode !== "verbs";
newQuestion();

// --- Service Worker (offline) ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
