// Verben für den Konjugations-Modus.
// Personen-Reihenfolge IMMER: yo, tú, él/ella, nosotros, vosotros, ellos
// Perfecto wird automatisch gebaut: haber (he/has/ha/hemos/habéis/han) + part.
// Neues Verb: inf, de, type, part (Partizip), presente[6], indefinido[6], condicional[6].
// Quelle: uni/spanisch/Verben-Konjugation.md

const PERSONS = ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"];
const HABER = ["he", "has", "ha", "hemos", "habéis", "han"];

const VERBS = [
  // --- Regelmäßig ---
  {
    inf: "hablar", de: "sprechen", type: "regular", part: "hablado",
    presente:   ["hablo", "hablas", "habla", "hablamos", "habláis", "hablan"],
    indefinido: ["hablé", "hablaste", "habló", "hablamos", "hablasteis", "hablaron"],
    condicional:["hablaría", "hablarías", "hablaría", "hablaríamos", "hablaríais", "hablarían"],
  },
  {
    inf: "comer", de: "essen", type: "regular", part: "comido",
    presente:   ["como", "comes", "come", "comemos", "coméis", "comen"],
    indefinido: ["comí", "comiste", "comió", "comimos", "comisteis", "comieron"],
    condicional:["comería", "comerías", "comería", "comeríamos", "comeríais", "comerían"],
  },
  {
    inf: "vivir", de: "leben / wohnen", type: "regular", part: "vivido",
    presente:   ["vivo", "vives", "vive", "vivimos", "vivís", "viven"],
    indefinido: ["viví", "viviste", "vivió", "vivimos", "vivisteis", "vivieron"],
    condicional:["viviría", "vivirías", "viviría", "viviríamos", "viviríais", "vivirían"],
  },

  // --- Unregelmäßig ---
  {
    inf: "ser", de: "sein (dauerhaft)", type: "irregular", part: "sido",
    presente:   ["soy", "eres", "es", "somos", "sois", "son"],
    indefinido: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
    condicional:["sería", "serías", "sería", "seríamos", "seríais", "serían"],
  },
  {
    inf: "estar", de: "sein (Zustand/Ort)", type: "irregular", part: "estado",
    presente:   ["estoy", "estás", "está", "estamos", "estáis", "están"],
    indefinido: ["estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron"],
    condicional:["estaría", "estarías", "estaría", "estaríamos", "estaríais", "estarían"],
  },
  {
    inf: "ir", de: "gehen / fahren", type: "irregular", part: "ido",
    presente:   ["voy", "vas", "va", "vamos", "vais", "van"],
    indefinido: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
    condicional:["iría", "irías", "iría", "iríamos", "iríais", "irían"],
  },
  {
    inf: "tener", de: "haben", type: "irregular", part: "tenido",
    presente:   ["tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen"],
    indefinido: ["tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis", "tuvieron"],
    condicional:["tendría", "tendrías", "tendría", "tendríamos", "tendríais", "tendrían"],
  },
  {
    inf: "hacer", de: "machen / tun", type: "irregular", part: "hecho",
    presente:   ["hago", "haces", "hace", "hacemos", "hacéis", "hacen"],
    indefinido: ["hice", "hiciste", "hizo", "hicimos", "hicisteis", "hicieron"],
    condicional:["haría", "harías", "haría", "haríamos", "haríais", "harían"],
  },
  {
    inf: "poder", de: "können", type: "irregular", part: "podido",
    presente:   ["puedo", "puedes", "puede", "podemos", "podéis", "pueden"],
    indefinido: ["pude", "pudiste", "pudo", "pudimos", "pudisteis", "pudieron"],
    condicional:["podría", "podrías", "podría", "podríamos", "podríais", "podrían"],
  },
  {
    inf: "querer", de: "wollen / mögen", type: "irregular", part: "querido",
    presente:   ["quiero", "quieres", "quiere", "queremos", "queréis", "quieren"],
    indefinido: ["quise", "quisiste", "quiso", "quisimos", "quisisteis", "quisieron"],
    condicional:["querría", "querrías", "querría", "querríamos", "querríais", "querrían"],
  },
  {
    inf: "decir", de: "sagen", type: "irregular", part: "dicho",
    presente:   ["digo", "dices", "dice", "decimos", "decís", "dicen"],
    indefinido: ["dije", "dijiste", "dijo", "dijimos", "dijisteis", "dijeron"],
    condicional:["diría", "dirías", "diría", "diríamos", "diríais", "dirían"],
  },
  {
    inf: "ver", de: "sehen", type: "irregular", part: "visto",
    presente:   ["veo", "ves", "ve", "vemos", "veis", "ven"],
    indefinido: ["vi", "viste", "vio", "vimos", "visteis", "vieron"],
    condicional:["vería", "verías", "vería", "veríamos", "veríais", "verían"],
  },
  {
    inf: "dar", de: "geben", type: "irregular", part: "dado",
    presente:   ["doy", "das", "da", "damos", "dais", "dan"],
    indefinido: ["di", "diste", "dio", "dimos", "disteis", "dieron"],
    condicional:["daría", "darías", "daría", "daríamos", "daríais", "darían"],
  },
  {
    inf: "saber", de: "wissen", type: "irregular", part: "sabido",
    presente:   ["sé", "sabes", "sabe", "sabemos", "sabéis", "saben"],
    indefinido: ["supe", "supiste", "supo", "supimos", "supisteis", "supieron"],
    condicional:["sabría", "sabrías", "sabría", "sabríamos", "sabríais", "sabrían"],
  },
  {
    inf: "venir", de: "kommen", type: "irregular", part: "venido",
    presente:   ["vengo", "vienes", "viene", "venimos", "venís", "vienen"],
    indefinido: ["vine", "viniste", "vino", "vinimos", "vinisteis", "vinieron"],
    condicional:["vendría", "vendrías", "vendría", "vendríamos", "vendríais", "vendrían"],
  },
  {
    inf: "poner", de: "stellen / legen", type: "irregular", part: "puesto",
    presente:   ["pongo", "pones", "pone", "ponemos", "ponéis", "ponen"],
    indefinido: ["puse", "pusiste", "puso", "pusimos", "pusisteis", "pusieron"],
    condicional:["pondría", "pondrías", "pondría", "pondríamos", "pondríais", "pondrían"],
  },
  {
    inf: "conocer", de: "kennen(lernen)", type: "irregular", part: "conocido",
    presente:   ["conozco", "conoces", "conoce", "conocemos", "conocéis", "conocen"],
    indefinido: ["conocí", "conociste", "conoció", "conocimos", "conocisteis", "conocieron"],
    condicional:["conocería", "conocerías", "conocería", "conoceríamos", "conoceríais", "conocerían"],
  },
  {
    inf: "salir", de: "hinausgehen", type: "irregular", part: "salido",
    presente:   ["salgo", "sales", "sale", "salimos", "salís", "salen"],
    indefinido: ["salí", "saliste", "salió", "salimos", "salisteis", "salieron"],
    condicional:["saldría", "saldrías", "saldría", "saldríamos", "saldríais", "saldrían"],
  },
];

const TENSES = ["Presente", "Indefinido", "Perfecto", "Condicional"];

// Liefert die Form eines Verbs für Zeitform + Person (0..5).
function verbForm(verb, tense, i) {
  if (tense === "Perfecto") return HABER[i] + " " + verb.part;
  if (tense === "Presente") return verb.presente[i];
  if (tense === "Indefinido") return verb.indefinido[i];
  if (tense === "Condicional") return verb.condicional[i];
  return "";
}

// Sonderfälle: gustar (über Pronomen) & haber (unpersönlich). Nicht Person×Zeit-Schema.
const SPECIALS = [
  {
    inf: "gustar", de: "gefallen",
    slots: [
      { ctx: "me · Presente", a: "me gusta" },
      { ctx: "te · Presente", a: "te gusta" },
      { ctx: "le · Presente", a: "le gusta" },
      { ctx: "nos · Presente", a: "nos gusta" },
      { ctx: "les · Presente", a: "les gusta" },
      { ctx: "me · Indefinido", a: "me gustó" },
      { ctx: "me · Perfecto", a: "me ha gustado" },
      { ctx: "me · Condicional", a: "me gustaría" },
    ],
  },
  {
    inf: "haber", de: "es gibt (unpersönlich)",
    slots: [
      { ctx: "Presente", a: "hay" },
      { ctx: "Indefinido", a: "hubo" },
      { ctx: "Perfecto", a: "ha habido" },
      { ctx: "Condicional", a: "habría" },
    ],
  },
];
