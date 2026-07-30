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

  // --- Comida --- Quelle: uni/spanisch/Vokabeln/Unit-7-Comes-de-todo (Aula Plus 2, Glosario S. 267–269)
  // „+" markiert Wörter, die NICHT im Kursglossar stehen, aber zum Alltagswortschatz gehören.
  { es: "el agua", de: "das Wasser", cat: "Comida" },
  { es: "el pan", de: "das Brot", cat: "Comida" },
  { es: "la comida", de: "das Essen / die Mahlzeit", cat: "Comida" },
  { es: "el café", de: "der Kaffee", cat: "Comida" },
  // Mahlzeiten
  { es: "el desayuno", de: "das Frühstück", cat: "Comida" },              // +
  { es: "desayunar", de: "frühstücken", cat: "Comida" },
  { es: "el almuerzo", de: "das Mittagessen", cat: "Comida" },            // +
  { es: "la merienda", de: "der Nachmittagssnack", cat: "Comida" },
  { es: "la cena", de: "das Abendessen", cat: "Comida" },
  // Frühstück & Milchprodukte
  { es: "la leche", de: "die Milch", cat: "Comida" },
  { es: "el yogur", de: "der Joghurt", cat: "Comida" },
  { es: "la mantequilla", de: "die Butter", cat: "Comida" },
  { es: "el queso", de: "der Käse", cat: "Comida" },
  { es: "los cereales", de: "die Cerealien / Müsli", cat: "Comida" },
  { es: "la galleta", de: "der Keks", cat: "Comida" },
  { es: "la tostada", de: "der Toast", cat: "Comida" },
  { es: "la magdalena", de: "der Muffin", cat: "Comida" },
  { es: "la mermelada", de: "die Marmelade", cat: "Comida" },             // +
  { es: "el zumo", de: "der Saft", cat: "Comida" },                       // +
  { es: "el té", de: "der Tee", cat: "Comida" },                          // +
  // Fleisch & Fisch
  { es: "la carne", de: "das Fleisch", cat: "Comida" },
  { es: "la ternera", de: "das Rindfleisch / Kalbfleisch", cat: "Comida" },
  { es: "el pollo", de: "das Hähnchen", cat: "Comida" },                  // +
  { es: "el cerdo", de: "das Schweinefleisch", cat: "Comida" },           // +
  { es: "el jamón", de: "der Schinken", cat: "Comida" },                  // +
  { es: "el embutido", de: "die Wurst / Wurstwaren", cat: "Comida" },
  { es: "el bistec", de: "das Steak", cat: "Comida" },
  { es: "el pescado", de: "der Fisch (als Speise)", cat: "Comida" },
  { es: "el marisco", de: "die Meeresfrüchte", cat: "Comida" },
  { es: "el atún", de: "der Thunfisch", cat: "Comida" },
  { es: "el huevo", de: "das Ei", cat: "Comida" },
  // Grundnahrungsmittel & Gewürze
  { es: "el arroz", de: "der Reis", cat: "Comida" },
  { es: "la pasta", de: "die Nudeln / Teigwaren", cat: "Comida" },
  { es: "los macarrones", de: "die Makkaroni", cat: "Comida" },
  { es: "la sal", de: "das Salz", cat: "Comida" },
  { es: "la pimienta", de: "der Pfeffer (Gewürz)", cat: "Comida" },
  { es: "el azúcar", de: "der Zucker", cat: "Comida" },                   // +
  { es: "el aceite de oliva", de: "das Olivenöl", cat: "Comida" },
  { es: "el vinagre", de: "der Essig", cat: "Comida" },
  { es: "la miel", de: "der Honig", cat: "Comida" },
  { es: "la harina", de: "das Mehl", cat: "Comida" },                     // +
  // Gerichte
  { es: "la ensalada", de: "der Salat (Gericht)", cat: "Comida" },
  { es: "la sopa", de: "die Suppe", cat: "Comida" },                      // +
  { es: "la crema", de: "die Cremesuppe", cat: "Comida" },
  { es: "la tortilla de patatas", de: "die spanische Kartoffeltortilla", cat: "Comida" },
  { es: "el gazpacho", de: "die kalte Gemüsesuppe (Gazpacho)", cat: "Comida" },
  { es: "la tarta", de: "die Torte / der Kuchen", cat: "Comida" },
  { es: "el postre", de: "die Nachspeise", cat: "Comida" },               // +
  { es: "la hamburguesa", de: "der Hamburger", cat: "Comida" },

  // --- Frutas y verduras --- Quelle: Unit 7 (+ ergänzte Grundfrüchte)
  { es: "la fruta", de: "das Obst / die Frucht", cat: "Frutas y verduras" },   // +
  { es: "la verdura", de: "das Gemüse", cat: "Frutas y verduras" },
  { es: "la manzana", de: "der Apfel", cat: "Frutas y verduras" },
  { es: "la naranja", de: "die Orange", cat: "Frutas y verduras" },            // +
  { es: "el plátano", de: "die Banane", cat: "Frutas y verduras" },            // +
  { es: "la fresa", de: "die Erdbeere", cat: "Frutas y verduras" },            // +
  { es: "la uva", de: "die Weintraube", cat: "Frutas y verduras" },            // +
  { es: "la pera", de: "die Birne", cat: "Frutas y verduras" },                // +
  { es: "el melocotón", de: "der Pfirsich", cat: "Frutas y verduras" },        // +
  { es: "la sandía", de: "die Wassermelone", cat: "Frutas y verduras" },       // +
  { es: "el melón", de: "die Melone", cat: "Frutas y verduras" },
  { es: "la cereza", de: "die Kirsche", cat: "Frutas y verduras" },
  { es: "el limón", de: "die Zitrone", cat: "Frutas y verduras" },
  { es: "la lechuga", de: "der Kopfsalat", cat: "Frutas y verduras" },
  { es: "la patata", de: "die Kartoffel", cat: "Frutas y verduras" },
  { es: "el tomate", de: "die Tomate", cat: "Frutas y verduras" },
  { es: "la cebolla", de: "die Zwiebel", cat: "Frutas y verduras" },
  { es: "el ajo", de: "der Knoblauch", cat: "Frutas y verduras" },
  { es: "la zanahoria", de: "die Karotte", cat: "Frutas y verduras" },
  { es: "los guisantes", de: "die Erbsen", cat: "Frutas y verduras" },
  { es: "el pepino", de: "die Gurke", cat: "Frutas y verduras" },
  { es: "el pimiento", de: "die Paprika (Gemüse)", cat: "Frutas y verduras" },
  { es: "la alcachofa", de: "die Artischocke", cat: "Frutas y verduras" },
  { es: "la col", de: "der Kohl", cat: "Frutas y verduras" },
  { es: "el aguacate", de: "die Avocado", cat: "Frutas y verduras" },
  { es: "las judías", de: "die Bohnen", cat: "Frutas y verduras" },
  { es: "los garbanzos", de: "die Kichererbsen", cat: "Frutas y verduras" },
  { es: "las legumbres", de: "die Hülsenfrüchte", cat: "Frutas y verduras" },
  { es: "la aceituna", de: "die Olive", cat: "Frutas y verduras" },
  { es: "el champiñón", de: "der Champignon", cat: "Frutas y verduras" },      // +
  { es: "el perejil", de: "die Petersilie", cat: "Frutas y verduras" },
  { es: "el cilantro", de: "der Koriander", cat: "Frutas y verduras" },
  { es: "la almendra", de: "die Mandel", cat: "Frutas y verduras" },
  { es: "los frutos secos", de: "die Nüsse / Trockenfrüchte", cat: "Frutas y verduras" },

  // --- La cocina (Besteck, Geschirr, Kochen) --- Quelle: Unit 7 Léxico (+ Tischgedeck ergänzt)
  { es: "el tenedor", de: "die Gabel", cat: "La cocina" },
  { es: "el cuchillo", de: "das Messer", cat: "La cocina" },
  { es: "la cuchara", de: "der Löffel", cat: "La cocina" },                    // +
  { es: "la cucharita", de: "der Teelöffel", cat: "La cocina" },               // +
  { es: "el cucharón", de: "die Schöpfkelle", cat: "La cocina" },
  { es: "el plato", de: "der Teller", cat: "La cocina" },                      // +
  { es: "el vaso", de: "das Glas (Trinkglas)", cat: "La cocina" },             // +
  { es: "la copa", de: "das Stielglas / Weinglas", cat: "La cocina" },         // +
  { es: "la taza", de: "die Tasse", cat: "La cocina" },                        // +
  { es: "el bol", de: "die Schüssel", cat: "La cocina" },
  { es: "la bandeja", de: "das Tablett", cat: "La cocina" },
  { es: "la servilleta", de: "die Serviette", cat: "La cocina" },              // +
  { es: "el mantel", de: "die Tischdecke", cat: "La cocina" },                 // +
  { es: "la sartén", de: "die Pfanne", cat: "La cocina" },
  { es: "la cazuela", de: "der Schmortopf", cat: "La cocina" },
  { es: "la olla", de: "der Topf", cat: "La cocina" },
  { es: "la tabla de cortar", de: "das Schneidebrett", cat: "La cocina" },
  { es: "el escurridor", de: "das Sieb / Abtropfsieb", cat: "La cocina" },
  { es: "la botella", de: "die Flasche", cat: "La cocina" },
  { es: "la lata", de: "die Dose", cat: "La cocina" },
  { es: "el bote", de: "das Glas / die Dose (Behälter)", cat: "La cocina" },
  { es: "la caja", de: "die Schachtel / Kiste", cat: "La cocina" },
  { es: "la receta", de: "das Rezept", cat: "La cocina" },                     // +
  { es: "cocinar", de: "kochen (zubereiten)", cat: "La cocina" },              // +
  { es: "pelar", de: "schälen", cat: "La cocina" },
  { es: "cortar", de: "schneiden", cat: "La cocina" },
  { es: "hervir", de: "kochen (sieden)", cat: "La cocina" },
  { es: "freír", de: "braten / frittieren", cat: "La cocina" },
  { es: "asar", de: "im Ofen braten", cat: "La cocina" },
  { es: "calentar", de: "aufwärmen", cat: "La cocina" },
  { es: "congelar", de: "einfrieren", cat: "La cocina" },
  { es: "mezclar", de: "mischen", cat: "La cocina" },
  { es: "añadir", de: "hinzufügen", cat: "La cocina" },
  { es: "batir", de: "schlagen (verquirlen)", cat: "La cocina" },
  { es: "lavar", de: "waschen", cat: "La cocina" },
  { es: "probar", de: "probieren", cat: "La cocina" },

  // --- La casa --- Quelle: uni/spanisch/Vokabeln/Unit-4-Hogar-dulce-hogar (Aula Plus 2, Glosario S. 263–265)
  // Räume
  { es: "la habitación", de: "das Zimmer", cat: "La casa" },
  { es: "la cocina", de: "die Küche", cat: "La casa" },
  { es: "el salón", de: "das Wohnzimmer", cat: "La casa" },
  { es: "el comedor", de: "das Esszimmer", cat: "La casa" },                   // +
  { es: "el dormitorio", de: "das Schlafzimmer", cat: "La casa" },             // +
  { es: "el despacho", de: "das Arbeitszimmer", cat: "La casa" },
  { es: "el baño", de: "das Badezimmer", cat: "La casa" },
  { es: "el lavadero", de: "die Waschküche", cat: "La casa" },
  { es: "el vestidor", de: "der Ankleideraum", cat: "La casa" },
  { es: "el pasillo", de: "der Flur", cat: "La casa" },                        // +
  { es: "el garaje", de: "die Garage", cat: "La casa" },
  { es: "la terraza", de: "die Terrasse", cat: "La casa" },
  { es: "el balcón", de: "der Balkon", cat: "La casa" },
  { es: "la planta baja", de: "das Erdgeschoss", cat: "La casa" },
  { es: "la planta", de: "die Etage / die Pflanze", cat: "La casa" },
  // Möbel
  { es: "el mueble", de: "das Möbelstück", cat: "La casa" },                   // +
  { es: "el sofá", de: "das Sofa", cat: "La casa" },
  { es: "el sillón", de: "der Sessel", cat: "La casa" },
  { es: "la mesa", de: "der Tisch", cat: "La casa" },                          // +
  { es: "la mesa de centro", de: "der Couchtisch", cat: "La casa" },
  { es: "la silla", de: "der Stuhl", cat: "La casa" },
  { es: "la estantería", de: "das Regal", cat: "La casa" },
  { es: "el armario", de: "der Schrank", cat: "La casa" },
  { es: "la cama", de: "das Bett", cat: "La casa" },
  { es: "la mesilla de noche", de: "der Nachttisch", cat: "La casa" },
  { es: "el espejo", de: "der Spiegel", cat: "La casa" },
  { es: "la alfombra", de: "der Teppich", cat: "La casa" },
  { es: "la lámpara", de: "die Lampe", cat: "La casa" },                       // +
  { es: "la lámpara de pie", de: "die Stehlampe", cat: "La casa" },
  { es: "el cojín", de: "das Kissen", cat: "La casa" },
  { es: "la cortina", de: "der Vorhang", cat: "La casa" },                     // +
  { es: "el jarrón", de: "die Vase", cat: "La casa" },
  { es: "la vela", de: "die Kerze", cat: "La casa" },
  { es: "el perchero", de: "die Garderobe", cat: "La casa" },
  { es: "el despertador", de: "der Wecker", cat: "La casa" },
  // Geräte
  // Beide Wörter bedeuten exakt dasselbe — als EIN Eintrag mit „/", sonst waere
  // die Frage Richtung Deutsch->Spanisch nicht eindeutig loesbar. writeCorrect()
  // in app.js akzeptiert beim Schreiben ohnehin jede Variante vor/nach dem „/".
  { es: "la nevera / el frigorífico", de: "der Kühlschrank", cat: "La casa" },
  { es: "la lavadora", de: "die Waschmaschine", cat: "La casa" },
  { es: "el lavavajillas", de: "die Spülmaschine", cat: "La casa" },           // +
  { es: "el horno", de: "der Backofen", cat: "La casa" },
  { es: "la calefacción", de: "die Heizung", cat: "La casa" },
  { es: "el aire acondicionado", de: "die Klimaanlage", cat: "La casa" },
  { es: "la televisión", de: "der Fernseher", cat: "La casa" },                // +
  // Bad
  { es: "la ducha", de: "die Dusche", cat: "La casa" },
  { es: "la bañera", de: "die Badewanne", cat: "La casa" },
  { es: "el wáter", de: "die Toilette", cat: "La casa" },
  { es: "la toalla", de: "das Handtuch", cat: "La casa" },                     // +
  // Bau & Struktur
  { es: "la ventana", de: "das Fenster", cat: "La casa" },
  { es: "la puerta", de: "die Tür", cat: "La casa" },                          // +
  { es: "la pared", de: "die Wand", cat: "La casa" },                          // +
  { es: "el techo", de: "die Decke / das Dach", cat: "La casa" },              // +
  { es: "el suelo", de: "der Boden", cat: "La casa" },
  { es: "la escalera", de: "die Treppe", cat: "La casa" },                     // +
  { es: "el ascensor", de: "der Aufzug", cat: "La casa" },
  { es: "la persiana", de: "der Rollladen", cat: "La casa" },
  { es: "la llave", de: "der Schlüssel", cat: "La casa" },                     // +
  { es: "la luz", de: "das Licht", cat: "La casa" },
  // Wohnformen & Umfeld
  { es: "el piso", de: "die Wohnung", cat: "La casa" },
  { es: "el apartamento", de: "das Apartment", cat: "La casa" },
  { es: "el chalé", de: "das Einfamilienhaus / die Villa", cat: "La casa" },
  { es: "la casa adosada", de: "das Reihenhaus", cat: "La casa" },
  { es: "la casa de campo", de: "das Landhaus", cat: "La casa" },
  { es: "el edificio", de: "das Gebäude", cat: "La casa" },
  { es: "el barrio", de: "das Viertel", cat: "La casa" },
  { es: "el alquiler", de: "die Miete", cat: "La casa" },
  { es: "alquilar", de: "mieten / vermieten", cat: "La casa" },
  { es: "el vecino", de: "der Nachbar", cat: "La casa" },                      // +
  // Garten
  { es: "el jardín", de: "der Garten", cat: "La casa" },
  { es: "la piscina", de: "der Swimmingpool", cat: "La casa" },
  { es: "el césped", de: "der Rasen", cat: "La casa" },                        // +
  { es: "el árbol", de: "der Baum", cat: "La casa" },                          // +
  { es: "la flor", de: "die Blume", cat: "La casa" },                          // +
  { es: "la valla", de: "der Zaun", cat: "La casa" },                          // +
  { es: "la maceta", de: "der Blumentopf", cat: "La casa" },                   // +
  // Beschreibung
  { es: "amueblado/a", de: "möbliert", cat: "La casa" },
  { es: "sin amueblar", de: "unmöbliert", cat: "La casa" },
  { es: "luminoso/a", de: "hell (lichtdurchflutet)", cat: "La casa" },
  { es: "acogedor/a", de: "gemütlich", cat: "La casa" },
  { es: "amplio/a", de: "geräumig", cat: "La casa" },
  { es: "ruidoso/a", de: "laut", cat: "La casa" },
  { es: "tranquilo/a", de: "ruhig", cat: "La casa" },                          // +
  { es: "antiguo/a", de: "alt", cat: "La casa" },
  { es: "cómodo/a", de: "bequem", cat: "La casa" },
  { es: "las vistas", de: "die Aussicht", cat: "La casa" },

  // --- Ubicación (Ortsangaben) --- Quelle: uni/spanisch/Grammatik/Ortsvokabeln + Ortsadverbien
  { es: "encima de / sobre", de: "auf", cat: "Ubicación" },
  { es: "debajo de", de: "unter", cat: "Ubicación" },
  { es: "al lado de / junto a", de: "neben", cat: "Ubicación" },
  { es: "a la izquierda de", de: "links von", cat: "Ubicación" },
  { es: "a la derecha de", de: "rechts von", cat: "Ubicación" },
  { es: "delante de", de: "vor", cat: "Ubicación" },
  { es: "detrás de", de: "hinter", cat: "Ubicación" },
  { es: "entre", de: "zwischen", cat: "Ubicación" },
  { es: "dentro de", de: "in / innerhalb", cat: "Ubicación" },
  { es: "cerca de", de: "nah bei / in der Nähe von", cat: "Ubicación" },
  { es: "lejos de", de: "weit von", cat: "Ubicación" },
  { es: "aquí", de: "hier (beim Sprecher)", cat: "Ubicación" },
  { es: "ahí", de: "da / dort (beim Hörer)", cat: "Ubicación" },
  { es: "allí", de: "dort (konkreter Ort)", cat: "Ubicación" },
  { es: "allá", de: "dort drüben (Richtung)", cat: "Ubicación" },

  // --- El cuerpo (Körper & Körperteile) ---
  { es: "la cabeza", de: "der Kopf", cat: "El cuerpo" },
  { es: "la cara", de: "das Gesicht", cat: "El cuerpo" },
  { es: "el pelo", de: "das Haar / die Haare", cat: "El cuerpo" },
  { es: "la frente", de: "die Stirn", cat: "El cuerpo" },
  { es: "el ojo", de: "das Auge", cat: "El cuerpo" },
  { es: "la ceja", de: "die Augenbraue", cat: "El cuerpo" },
  { es: "la pestaña", de: "die Wimper", cat: "El cuerpo" },
  { es: "la oreja", de: "das Ohr", cat: "El cuerpo" },
  { es: "la nariz", de: "die Nase", cat: "El cuerpo" },
  { es: "la mejilla", de: "die Wange", cat: "El cuerpo" },
  { es: "la boca", de: "der Mund", cat: "El cuerpo" },
  { es: "el labio", de: "die Lippe", cat: "El cuerpo" },
  { es: "el diente", de: "der Zahn", cat: "El cuerpo" },
  { es: "la lengua", de: "die Zunge", cat: "El cuerpo" },
  { es: "la barbilla", de: "das Kinn", cat: "El cuerpo" },
  { es: "el cuello", de: "der Hals", cat: "El cuerpo" },
  { es: "la garganta", de: "der Hals / Rachen (innen)", cat: "El cuerpo" },
  { es: "el hombro", de: "die Schulter", cat: "El cuerpo" },
  { es: "el brazo", de: "der Arm", cat: "El cuerpo" },
  { es: "el codo", de: "der Ellbogen", cat: "El cuerpo" },
  { es: "la muñeca", de: "das Handgelenk", cat: "El cuerpo" },
  { es: "la mano", de: "die Hand", cat: "El cuerpo" },
  { es: "el dedo", de: "der Finger", cat: "El cuerpo" },
  { es: "la uña", de: "der Fingernagel", cat: "El cuerpo" },
  { es: "el pecho", de: "die Brust", cat: "El cuerpo" },
  { es: "la espalda", de: "der Rücken", cat: "El cuerpo" },
  { es: "el estómago", de: "der Magen", cat: "El cuerpo" },
  { es: "la barriga", de: "der Bauch", cat: "El cuerpo" },
  { es: "la cadera", de: "die Hüfte", cat: "El cuerpo" },
  { es: "la pierna", de: "das Bein", cat: "El cuerpo" },
  { es: "la rodilla", de: "das Knie", cat: "El cuerpo" },
  { es: "el tobillo", de: "der Knöchel", cat: "El cuerpo" },
  { es: "el pie", de: "der Fuß", cat: "El cuerpo" },
  { es: "el dedo del pie", de: "der Zeh", cat: "El cuerpo" },
  { es: "el corazón", de: "das Herz", cat: "El cuerpo" },
  { es: "el hueso", de: "der Knochen", cat: "El cuerpo" },
  // In Unit 4 (Möbel/Materialien) steht „la piel" für Leder — daher beide Bedeutungen
  // in EINEM Eintrag statt eines zweiten mit gleichem Schlüssel.
  { es: "la piel", de: "die Haut / das Leder", cat: "El cuerpo" },
  { es: "la sangre", de: "das Blut", cat: "El cuerpo" },
];
