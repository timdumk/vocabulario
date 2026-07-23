// Vokabeln — einfach erweiterbar.
// Neues Wort: { es: "Spanisch", en: "English", cat: "Kategorie" } in die Liste einfügen.
// cat ist frei wählbar (dient später zum Filtern nach Themen).

const VOCAB = [
  // --- Básico ---
  { es: "hola", en: "hello", cat: "Básico" },
  { es: "adiós", en: "goodbye", cat: "Básico" },
  { es: "gracias", en: "thank you", cat: "Básico" },
  { es: "por favor", en: "please", cat: "Básico" },
  { es: "sí", en: "yes", cat: "Básico" },
  { es: "no", en: "no", cat: "Básico" },
  { es: "perdón", en: "sorry / excuse me", cat: "Básico" },
  { es: "hoy", en: "today", cat: "Básico" },
  { es: "mañana", en: "tomorrow / morning", cat: "Básico" },
  { es: "ahora", en: "now", cat: "Básico" },

  // --- Verbos ---
  { es: "ser", en: "to be (permanent)", cat: "Verbos" },
  { es: "estar", en: "to be (state/location)", cat: "Verbos" },
  { es: "tener", en: "to have", cat: "Verbos" },
  { es: "hacer", en: "to do / to make", cat: "Verbos" },
  { es: "ir", en: "to go", cat: "Verbos" },
  { es: "poder", en: "to be able to / can", cat: "Verbos" },
  { es: "querer", en: "to want / to love", cat: "Verbos" },
  { es: "hablar", en: "to speak", cat: "Verbos" },
  { es: "comer", en: "to eat", cat: "Verbos" },
  { es: "vivir", en: "to live", cat: "Verbos" },
  { es: "saber", en: "to know (facts)", cat: "Verbos" },
  { es: "conocer", en: "to know (people/places)", cat: "Verbos" },

  // --- Personas ---
  { es: "el hombre", en: "the man", cat: "Personas" },
  { es: "la mujer", en: "the woman", cat: "Personas" },
  { es: "el amigo / la amiga", en: "the friend", cat: "Personas" },
  { es: "el niño / la niña", en: "the child", cat: "Personas" },
  { es: "la familia", en: "the family", cat: "Personas" },
  { es: "el padre", en: "the father", cat: "Personas" },
  { es: "la madre", en: "the mother", cat: "Personas" },

  // --- Tiempo ---
  { es: "el día", en: "the day", cat: "Tiempo" },
  { es: "la semana", en: "the week", cat: "Tiempo" },
  { es: "el mes", en: "the month", cat: "Tiempo" },
  { es: "el año", en: "the year", cat: "Tiempo" },
  { es: "la hora", en: "the hour / time", cat: "Tiempo" },

  // --- Lugares ---
  { es: "la casa", en: "the house", cat: "Lugares" },
  { es: "la ciudad", en: "the city", cat: "Lugares" },
  { es: "el trabajo", en: "the work / job", cat: "Lugares" },
  { es: "la escuela", en: "the school", cat: "Lugares" },
  { es: "la calle", en: "the street", cat: "Lugares" },

  // --- Comida ---
  { es: "el agua", en: "the water", cat: "Comida" },
  { es: "el pan", en: "the bread", cat: "Comida" },
  { es: "la comida", en: "the food / meal", cat: "Comida" },
  { es: "el café", en: "the coffee", cat: "Comida" },
];
