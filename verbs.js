// Verben für den Konjugations-Modus.
// Personen-Reihenfolge IMMER: yo, tú, él/ella, nosotros, vosotros, ellos
// Perfecto wird automatisch gebaut: haber (he/has/ha/hemos/habéis/han) + part.
// Neues Verb: Objekt mit inf, de, type ("regular"/"irregular"), part (Partizip),
// presente[6], indefinido[6] ergänzen. Quelle: uni/spanisch/Verben-Konjugation.md

const PERSONS = ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"];
const HABER = ["he", "has", "ha", "hemos", "habéis", "han"];

const VERBS = [
  // --- Regelmäßig ---
  {
    inf: "hablar", de: "sprechen", type: "regular", part: "hablado",
    presente:   ["hablo", "hablas", "habla", "hablamos", "habláis", "hablan"],
    indefinido: ["hablé", "hablaste", "habló", "hablamos", "hablasteis", "hablaron"],
  },
  {
    inf: "comer", de: "essen", type: "regular", part: "comido",
    presente:   ["como", "comes", "come", "comemos", "coméis", "comen"],
    indefinido: ["comí", "comiste", "comió", "comimos", "comisteis", "comieron"],
  },
  {
    inf: "vivir", de: "leben / wohnen", type: "regular", part: "vivido",
    presente:   ["vivo", "vives", "vive", "vivimos", "vivís", "viven"],
    indefinido: ["viví", "viviste", "vivió", "vivimos", "vivisteis", "vivieron"],
  },

  // --- Unregelmäßig ---
  {
    inf: "ser", de: "sein (dauerhaft)", type: "irregular", part: "sido",
    presente:   ["soy", "eres", "es", "somos", "sois", "son"],
    indefinido: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
  },
  {
    inf: "ir", de: "gehen / fahren", type: "irregular", part: "ido",
    presente:   ["voy", "vas", "va", "vamos", "vais", "van"],
    indefinido: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
  },
  {
    inf: "tener", de: "haben", type: "irregular", part: "tenido",
    presente:   ["tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen"],
    indefinido: ["tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis", "tuvieron"],
  },
  {
    inf: "hacer", de: "machen / tun", type: "irregular", part: "hecho",
    presente:   ["hago", "haces", "hace", "hacemos", "hacéis", "hacen"],
    indefinido: ["hice", "hiciste", "hizo", "hicimos", "hicisteis", "hicieron"],
  },
];

const TENSES = ["Presente", "Indefinido", "Perfecto"];

// Liefert die Form eines Verbs für Zeitform + Person (0..5).
function verbForm(verb, tense, i) {
  if (tense === "Perfecto") return HABER[i] + " " + verb.part;
  if (tense === "Presente") return verb.presente[i];
  if (tense === "Indefinido") return verb.indefinido[i];
  return "";
}
