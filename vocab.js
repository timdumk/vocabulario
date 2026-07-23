// Vokabeln — einfach erweiterbar.
// Neues Wort: { es: "Spanisch", de: "Deutsch", cat: "Kategorie" } in die Liste einfügen.
// cat ist frei wählbar (dient zum Filtern nach Themen).

const VOCAB = [
  // --- Básico ---
  { es: "hola", de: "hallo", cat: "Básico" },
  { es: "adiós", de: "tschüss / auf Wiedersehen", cat: "Básico" },
  { es: "gracias", de: "danke", cat: "Básico" },
  { es: "por favor", de: "bitte", cat: "Básico" },
  { es: "sí", de: "ja", cat: "Básico" },
  { es: "no", de: "nein", cat: "Básico" },
  { es: "perdón", de: "Entschuldigung", cat: "Básico" },
  { es: "hoy", de: "heute", cat: "Básico" },
  { es: "mañana", de: "morgen / Vormittag", cat: "Básico" },
  { es: "ahora", de: "jetzt", cat: "Básico" },

  // --- Verbos ---
  { es: "ser", de: "sein (dauerhaft)", cat: "Verbos" },
  { es: "estar", de: "sein (Zustand/Ort)", cat: "Verbos" },
  { es: "tener", de: "haben", cat: "Verbos" },
  { es: "hacer", de: "machen / tun", cat: "Verbos" },
  { es: "ir", de: "gehen", cat: "Verbos" },
  { es: "poder", de: "können", cat: "Verbos" },
  { es: "querer", de: "wollen / lieben", cat: "Verbos" },
  { es: "hablar", de: "sprechen", cat: "Verbos" },
  { es: "comer", de: "essen", cat: "Verbos" },
  { es: "vivir", de: "leben / wohnen", cat: "Verbos" },
  { es: "saber", de: "wissen", cat: "Verbos" },
  { es: "conocer", de: "kennen", cat: "Verbos" },

  // --- Personas ---
  { es: "el hombre", de: "der Mann", cat: "Personas" },
  { es: "la mujer", de: "die Frau", cat: "Personas" },
  { es: "el amigo / la amiga", de: "der Freund / die Freundin", cat: "Personas" },
  { es: "el niño / la niña", de: "das Kind (Junge/Mädchen)", cat: "Personas" },
  { es: "la familia", de: "die Familie", cat: "Personas" },
  { es: "el padre", de: "der Vater", cat: "Personas" },
  { es: "la madre", de: "die Mutter", cat: "Personas" },

  // --- Tiempo ---
  { es: "el día", de: "der Tag", cat: "Tiempo" },
  { es: "la semana", de: "die Woche", cat: "Tiempo" },
  { es: "el mes", de: "der Monat", cat: "Tiempo" },
  { es: "el año", de: "das Jahr", cat: "Tiempo" },
  { es: "la hora", de: "die Stunde / Uhrzeit", cat: "Tiempo" },

  // --- Lugares ---
  { es: "la casa", de: "das Haus", cat: "Lugares" },
  { es: "la ciudad", de: "die Stadt", cat: "Lugares" },
  { es: "el trabajo", de: "die Arbeit", cat: "Lugares" },
  { es: "la escuela", de: "die Schule", cat: "Lugares" },
  { es: "la calle", de: "die Straße", cat: "Lugares" },

  // --- Comida ---
  { es: "el agua", de: "das Wasser", cat: "Comida" },
  { es: "el pan", de: "das Brot", cat: "Comida" },
  { es: "la comida", de: "das Essen / die Mahlzeit", cat: "Comida" },
  { es: "el café", de: "der Kaffee", cat: "Comida" },
];
