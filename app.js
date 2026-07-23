"use strict";

// --- State ---
let dir = localStorage.getItem("dir") || "es-en"; // "es-en" oder "en-es"
let cat = localStorage.getItem("cat") || "Alle";
let stats = JSON.parse(localStorage.getItem("stats") || '{"right":0,"total":0,"streak":0}');
let current = null;
let answered = false;

// --- DOM ---
const $ = (id) => document.getElementById(id);
const wordEl = $("word");
const optionsEl = $("options");
const feedbackEl = $("feedback");
const promptLabel = $("promptLabel");
const nextBtn = $("nextBtn");
const dirToggle = $("dirToggle");
const catToggle = $("catToggle");

// --- Helpers ---
const categories = ["Alle", ...new Set(VOCAB.map((v) => v.cat))];
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const pool = () => (cat === "Alle" ? VOCAB : VOCAB.filter((v) => v.cat === cat));

function ask(word) { return dir === "es-en" ? word.es : word.en; }
function answer(word) { return dir === "es-en" ? word.en : word.es; }

function saveStats() { localStorage.setItem("stats", JSON.stringify(stats)); }

function renderStats() {
  $("streak").textContent = "🔥 " + stats.streak;
  $("score").textContent = stats.right + " / " + stats.total;
}

function newQuestion() {
  answered = false;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.hidden = true;
  optionsEl.innerHTML = "";

  const words = pool();
  current = words[Math.floor(Math.random() * words.length)];

  // 3 falsche Antworten aus demselben Pool (Fallback: gesamter Wortschatz)
  const distractPool = (words.length >= 4 ? words : VOCAB).filter((w) => answer(w) !== answer(current));
  const wrong = shuffle(distractPool).slice(0, 3);
  const choices = shuffle([current, ...wrong]);

  promptLabel.textContent = dir === "es-en" ? "Was bedeutet…" : "Wie heißt auf Spanisch…";
  wordEl.textContent = ask(current);

  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = answer(choice);
    btn.addEventListener("click", () => choose(btn, choice));
    optionsEl.appendChild(btn);
  });
}

function choose(btn, choice) {
  if (answered) return;
  answered = true;

  const correct = answer(choice) === answer(current);
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
    feedbackEl.textContent = "Richtig: " + answer(current);
    feedbackEl.className = "feedback bad";
  }

  // richtige Antwort markieren + alle sperren
  [...optionsEl.children].forEach((b) => {
    b.disabled = true;
    if (b.textContent === answer(current)) b.classList.add("correct");
  });

  saveStats();
  renderStats();
  nextBtn.hidden = false;
}

// --- Controls ---
dirToggle.addEventListener("click", () => {
  dir = dir === "es-en" ? "en-es" : "es-en";
  localStorage.setItem("dir", dir);
  dirToggle.textContent = dir === "es-en" ? "🇪🇸 → 🇬🇧" : "🇬🇧 → 🇪🇸";
  newQuestion();
});

catToggle.addEventListener("click", () => {
  const i = categories.indexOf(cat);
  cat = categories[(i + 1) % categories.length];
  localStorage.setItem("cat", cat);
  catToggle.textContent = cat === "Alle" ? "Alle Themen" : cat;
  newQuestion();
});

nextBtn.addEventListener("click", newQuestion);

$("resetBtn").addEventListener("click", () => {
  stats = { right: 0, total: 0, streak: 0 };
  saveStats();
  renderStats();
});

// --- Init ---
dirToggle.textContent = dir === "es-en" ? "🇪🇸 → 🇬🇧" : "🇬🇧 → 🇪🇸";
catToggle.textContent = cat === "Alle" ? "Alle Themen" : cat;
renderStats();
newQuestion();

// --- Service Worker (offline) ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
