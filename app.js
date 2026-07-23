"use strict";

// --- State ---
let mode = localStorage.getItem("mode") || "vocab"; // "vocab" | "verbs"
let dir = localStorage.getItem("dir") || "es-de";   // "es-de" | "de-es"
let cat = localStorage.getItem("cat") || "Alle";
let tenseFilter = localStorage.getItem("tense") || "Alle"; // "Alle" | Presente | Indefinido | Perfecto
let typeFilter = localStorage.getItem("type") || "Alle";   // "Alle" | regular | irregular
let stats = JSON.parse(localStorage.getItem("stats") || '{"right":0,"total":0,"streak":0}');
let correctText = null;
let answered = false;

// --- DOM ---
const $ = (id) => document.getElementById(id);
const wordEl = $("word");
const optionsEl = $("options");
const feedbackEl = $("feedback");
const promptLabel = $("promptLabel");
const nextBtn = $("nextBtn");

// --- Helpers ---
const categories = ["Alle", ...new Set(VOCAB.map((v) => v.cat))];
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const rand = (a) => a[Math.floor(Math.random() * a.length)];

function saveStats() { localStorage.setItem("stats", JSON.stringify(stats)); }
function renderStats() {
  $("streak").textContent = "🔥 " + stats.streak;
  $("score").textContent = stats.right + " / " + stats.total;
}

// Baut aus priorisierten Kandidatenlisten bis zu 3 eindeutige Distraktoren (ohne `correct`).
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
function render(labelText, wordText, choices, correct) {
  answered = false;
  correctText = correct;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.hidden = true;
  optionsEl.innerHTML = "";
  promptLabel.textContent = labelText;
  wordEl.textContent = wordText;

  shuffle(choices).forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.addEventListener("click", () => choose(btn));
    optionsEl.appendChild(btn);
  });
}

// --- Vokabel-Frage ---
function vocabAsk(w) { return dir === "es-de" ? w.es : w.de; }
function vocabAns(w) { return dir === "es-de" ? w.de : w.es; }

function vocabQuestion() {
  const words = cat === "Alle" ? VOCAB : VOCAB.filter((v) => v.cat === cat);
  const current = rand(words);
  const correct = vocabAns(current);
  const distractPool = (words.length >= 4 ? words : VOCAB)
    .filter((w) => vocabAns(w) !== correct)
    .map(vocabAns);
  const choices = [correct, ...pickDistractors(correct, distractPool)];
  const label = dir === "es-de" ? "Was bedeutet…" : "Wie heißt auf Spanisch…";
  render(label, vocabAsk(current), choices, correct);
}

// --- Verben-Frage ---
function verbQuestion() {
  const pool = typeFilter === "Alle" ? VERBS : VERBS.filter((v) => v.type === typeFilter);
  const verb = rand(pool);
  const tense = tenseFilter === "Alle" ? rand(TENSES) : tenseFilter;
  const i = Math.floor(Math.random() * PERSONS.length);
  const correct = verbForm(verb, tense, i);

  // Distraktoren priorisiert: andere Personen gleiche Zeit > gleiches Verb andere Zeiten > andere Verben
  const sameTense = PERSONS.map((_, j) => verbForm(verb, tense, j));
  const otherTenses = TENSES.flatMap((t) => PERSONS.map((_, j) => verbForm(verb, t, j)));
  const otherVerbs = pool.flatMap((v) => PERSONS.map((_, j) => verbForm(v, tense, j)));
  const choices = [correct, ...pickDistractors(correct, sameTense, otherTenses, otherVerbs)];

  render(`${verb.inf} · ${verb.de}`, `${PERSONS[i]} · ${tense}`, choices, correct);
}

function newQuestion() {
  if (mode === "verbs") verbQuestion();
  else vocabQuestion();
}

// --- Antwort werten ---
function choose(btn) {
  if (answered) return;
  answered = true;

  const correct = btn.textContent === correctText;
  stats.total++;
  if (correct) {
    stats.right++;
    stats.streak++;
    btn.classList.add("correct");
    feedbackEl.textContent = "¡Correcto!";
    feedbackEl.className = "feedback ok";
  } else {
    stats.streak = 0;
    btn.classList.add("wrong");
    feedbackEl.textContent = "Richtig: " + correctText;
    feedbackEl.className = "feedback bad";
  }

  [...optionsEl.children].forEach((b) => {
    b.disabled = true;
    if (b.textContent === correctText) b.classList.add("correct");
  });

  saveStats();
  renderStats();
  nextBtn.hidden = false;
}

// --- Modus-Umschalter ---
function setMode(m) {
  mode = m;
  localStorage.setItem("mode", mode);
  $("modeVocab").classList.toggle("active", mode === "vocab");
  $("modeVerbs").classList.toggle("active", mode === "verbs");
  $("vocabControls").hidden = mode !== "vocab";
  $("verbControls").hidden = mode !== "verbs";
  newQuestion();
}
$("modeVocab").addEventListener("click", () => setMode("vocab"));
$("modeVerbs").addEventListener("click", () => setMode("verbs"));

// --- Vokabel-Controls ---
$("dirToggle").addEventListener("click", () => {
  dir = dir === "es-de" ? "de-es" : "es-de";
  localStorage.setItem("dir", dir);
  $("dirToggle").textContent = dir === "es-de" ? "🇪🇸 → 🇩🇪" : "🇩🇪 → 🇪🇸";
  newQuestion();
});
$("catToggle").addEventListener("click", () => {
  cat = categories[(categories.indexOf(cat) + 1) % categories.length];
  localStorage.setItem("cat", cat);
  $("catToggle").textContent = cat === "Alle" ? "Alle Themen" : cat;
  newQuestion();
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
$("resetBtn").addEventListener("click", () => {
  stats = { right: 0, total: 0, streak: 0 };
  saveStats();
  renderStats();
});

// --- Init ---
$("dirToggle").textContent = dir === "es-de" ? "🇪🇸 → 🇩🇪" : "🇩🇪 → 🇪🇸";
$("catToggle").textContent = cat === "Alle" ? "Alle Themen" : cat;
$("tenseToggle").textContent = tenseFilter === "Alle" ? "Alle Zeiten" : tenseFilter;
$("typeToggle").textContent = typeLabel[typeFilter];
renderStats();
setMode(mode); // setzt Controls-Sichtbarkeit + erste Frage

// --- Service Worker (offline) ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
