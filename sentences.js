// Beispielsätze — Kontext zu einzelnen Einträgen.
//
// WICHTIG: Diese Sätze stammen NICHT aus dem Kursbuch. Sie sind auf A2-Niveau
// selbst formuliert. Für Klausurzitate taugen sie nicht — die Vokabeln selbst
// kommen aus dem Glossar (siehe vocab.js), die Sätze drumherum nicht.
//
// Schlüssel = spanisches Wort aus vocab.js ODER Verbschlüssel aus app.js
// (verb:<infinitiv>:<zeit>, special:<infinitiv>).
// Jeder Satz MUSS das Zielwort wörtlich enthalten — sonst lässt sich daraus
// keine Lücke bilden (siehe Lückentext-Modus).

const SENTENCES = {
  // ============ Verben: alle Zeitformen ============
  "verb:hablar:Presente":     { es: "Yo hablo español con mis amigos.", de: "Ich spreche Spanisch mit meinen Freunden." },
  "verb:hablar:Indefinido":   { es: "Ayer hablé con mi profesora.", de: "Gestern sprach ich mit meiner Lehrerin." },
  "verb:hablar:Perfecto":     { es: "Hoy he hablado con mi madre.", de: "Heute habe ich mit meiner Mutter gesprochen." },
  "verb:hablar:Condicional":  { es: "Yo hablaría más si tuviera tiempo.", de: "Ich würde mehr sprechen, wenn ich Zeit hätte." },

  "verb:comer:Presente":      { es: "Nosotros comemos a las dos.", de: "Wir essen um zwei." },
  "verb:comer:Indefinido":    { es: "Anoche comí en un restaurante.", de: "Gestern Abend aß ich in einem Restaurant." },
  "verb:comer:Perfecto":      { es: "Ya he comido, gracias.", de: "Ich habe schon gegessen, danke." },
  "verb:comer:Condicional":   { es: "Yo comería menos azúcar.", de: "Ich würde weniger Zucker essen." },

  "verb:vivir:Presente":      { es: "Ella vive en Madrid desde enero.", de: "Sie wohnt seit Januar in Madrid." },
  "verb:vivir:Indefinido":    { es: "Viví dos años en Alemania.", de: "Ich lebte zwei Jahre in Deutschland." },
  "verb:vivir:Perfecto":      { es: "Siempre he vivido en el campo.", de: "Ich habe immer auf dem Land gelebt." },
  "verb:vivir:Condicional":   { es: "Yo viviría cerca del mar.", de: "Ich würde gern in der Nähe des Meeres wohnen." },

  "verb:ser:Presente":        { es: "Mi hermana es muy simpática.", de: "Meine Schwester ist sehr sympathisch." },
  "verb:ser:Indefinido":      { es: "La fiesta fue un éxito.", de: "Das Fest war ein Erfolg." },
  "verb:ser:Perfecto":        { es: "Este año ha sido difícil.", de: "Dieses Jahr ist schwierig gewesen." },
  "verb:ser:Condicional":     { es: "Sería mejor salir temprano.", de: "Es wäre besser, früh loszugehen." },

  "verb:estar:Presente":      { es: "El libro está en la mesa.", de: "Das Buch liegt auf dem Tisch." },
  "verb:estar:Indefinido":    { es: "Ayer estuve en el museo.", de: "Gestern war ich im Museum." },
  "verb:estar:Perfecto":      { es: "Hoy he estado muy cansado.", de: "Heute bin ich sehr müde gewesen." },
  "verb:estar:Condicional":   { es: "Estaría mejor con un café.", de: "Mit einem Kaffee ginge es mir besser." },

  "verb:tener:Presente":      { es: "Tengo dos hermanos mayores.", de: "Ich habe zwei ältere Brüder." },
  "verb:tener:Indefinido":    { es: "Tuve mucha suerte en el examen.", de: "Ich hatte viel Glück bei der Prüfung." },
  "verb:tener:Perfecto":      { es: "Nunca he tenido un coche.", de: "Ich habe nie ein Auto gehabt." },
  "verb:tener:Condicional":   { es: "Tendría más tiempo sin el trabajo.", de: "Ohne die Arbeit hätte ich mehr Zeit." },

  "verb:hacer:Presente":      { es: "Hago deporte tres veces por semana.", de: "Ich treibe dreimal pro Woche Sport." },
  "verb:hacer:Indefinido":    { es: "Hice la comida para todos.", de: "Ich machte das Essen für alle." },
  "verb:hacer:Perfecto":      { es: "¿Has hecho los ejercicios?", de: "Hast du die Übungen gemacht?" },
  "verb:hacer:Condicional":   { es: "Yo haría las cosas de otra manera.", de: "Ich würde die Dinge anders machen." },

  "verb:ir:Presente":         { es: "Voy al gimnasio por la tarde.", de: "Ich gehe nachmittags ins Fitnessstudio." },
  "verb:ir:Indefinido":       { es: "El verano pasado fui a España.", de: "Letzten Sommer fuhr ich nach Spanien." },
  "verb:ir:Perfecto":         { es: "Nunca he ido a Cuba.", de: "Ich bin nie nach Kuba gefahren." },
  "verb:ir:Condicional":      { es: "Iría contigo, pero no puedo.", de: "Ich würde mitkommen, aber ich kann nicht." },

  "verb:poder:Presente":      { es: "No puedo salir esta noche.", de: "Ich kann heute Abend nicht ausgehen." },
  "verb:poder:Indefinido":    { es: "No pude terminar el trabajo.", de: "Ich konnte die Arbeit nicht beenden." },
  "verb:poder:Perfecto":      { es: "Hoy no he podido dormir bien.", de: "Heute habe ich nicht gut schlafen können." },
  "verb:poder:Condicional":   { es: "¿Podrías ayudarme un momento?", de: "Könntest du mir kurz helfen?" },

  "verb:querer:Presente":     { es: "Quiero aprender más vocabulario.", de: "Ich will mehr Wortschatz lernen." },
  "verb:querer:Indefinido":   { es: "Quise llamarte, pero era tarde.", de: "Ich wollte dich anrufen, aber es war spät." },
  "verb:querer:Perfecto":     { es: "Siempre he querido viajar a Perú.", de: "Ich wollte schon immer nach Peru reisen." },
  "verb:querer:Condicional":  { es: "Querría un café con leche.", de: "Ich hätte gern einen Milchkaffee." },

  "verb:saber:Presente":      { es: "No sé dónde está la llave.", de: "Ich weiß nicht, wo der Schlüssel ist." },
  "verb:saber:Indefinido":    { es: "Lo supe ayer por la tarde.", de: "Ich erfuhr es gestern Nachmittag." },
  "verb:saber:Perfecto":      { es: "Nunca he sabido cocinar bien.", de: "Ich habe nie gut kochen können." },
  "verb:saber:Condicional":   { es: "Sabría la respuesta con más tiempo.", de: "Mit mehr Zeit wüsste ich die Antwort." },

  "verb:conocer:Presente":    { es: "Conozco un restaurante muy bueno.", de: "Ich kenne ein sehr gutes Restaurant." },
  "verb:conocer:Indefinido":  { es: "Conocí a mi novia en la universidad.", de: "Ich lernte meine Freundin an der Uni kennen." },
  "verb:conocer:Perfecto":    { es: "He conocido a mucha gente aquí.", de: "Ich habe hier viele Leute kennengelernt." },
  "verb:conocer:Condicional": { es: "Conocería la ciudad mejor viviendo allí.", de: "Ich würde die Stadt besser kennen, wenn ich dort wohnte." },

  "special:gustar": { es: "A mí me gusta mucho el chocolate.", de: "Mir gefällt Schokolade sehr / Ich mag Schokolade sehr." },
  "special:haber":  { es: "En la nevera hay leche y queso.", de: "Im Kühlschrank gibt es Milch und Käse." },

  // ============ Haus & Wohnen ============
  "la habitación":   { es: "Mi habitación es pequeña pero luminosa.", de: "Mein Zimmer ist klein, aber hell." },
  "la cocina":       { es: "Preparamos la cena en la cocina.", de: "Wir bereiten das Abendessen in der Küche zu." },
  "el salón":        { es: "Vemos la televisión en el salón.", de: "Wir sehen im Wohnzimmer fern." },
  "el baño":         { es: "El baño está al final del pasillo.", de: "Das Badezimmer ist am Ende des Flurs." },
  "la ventana":      { es: "Abre la ventana, hace calor.", de: "Mach das Fenster auf, es ist heiß." },
  "la cama":         { es: "Me acuesto en la cama a las once.", de: "Ich lege mich um elf ins Bett." },
  "el armario":      { es: "La ropa está en el armario.", de: "Die Kleidung ist im Schrank." },
  "la mesa":         { es: "Ponemos los platos en la mesa.", de: "Wir stellen die Teller auf den Tisch." },
  "la silla":        { es: "Esta silla es muy cómoda.", de: "Dieser Stuhl ist sehr bequem." },
  "el sofá":         { es: "Me siento en el sofá para leer.", de: "Ich setze mich zum Lesen aufs Sofa." },
  "el jardín":       { es: "En el jardín hay muchas flores.", de: "Im Garten gibt es viele Blumen." },
  "el piso":         { es: "Vivo en un piso con dos amigos.", de: "Ich wohne in einer Wohnung mit zwei Freunden." },
  "el vecino":       { es: "Mi vecino es muy amable.", de: "Mein Nachbar ist sehr freundlich." },
  "luminoso/a":      { es: "El salón es muy luminoso por la mañana.", de: "Das Wohnzimmer ist morgens sehr hell." },
  "acogedor/a":      { es: "Su casa es pequeña pero acogedor.", de: "Ihr Haus ist klein, aber gemütlich." },
  "amueblado/a":     { es: "Busco un piso amueblado.", de: "Ich suche eine möblierte Wohnung." },

  // ============ Essen & Küche ============
  "el desayuno":     { es: "El desayuno es la comida más importante.", de: "Das Frühstück ist die wichtigste Mahlzeit." },
  "la cena":         { es: "La cena es a las nueve.", de: "Das Abendessen ist um neun." },
  "la leche":        { es: "Tomo café con leche por la mañana.", de: "Morgens trinke ich Milchkaffee." },
  "el queso":        { es: "Me gusta el queso manchego.", de: "Ich mag Manchego-Käse." },
  "la carne":        { es: "No como carne los lunes.", de: "Montags esse ich kein Fleisch." },
  "el pescado":      { es: "El pescado está muy fresco hoy.", de: "Der Fisch ist heute sehr frisch." },
  "el huevo":        { es: "Para la tortilla necesito un huevo más.", de: "Für die Tortilla brauche ich noch ein Ei." },
  "el arroz":        { es: "Cocino el arroz con verduras.", de: "Ich koche den Reis mit Gemüse." },
  "la sal":          { es: "Falta un poco de sal.", de: "Es fehlt etwas Salz." },
  "el azúcar":       { es: "No pongo azúcar en el café.", de: "Ich tue keinen Zucker in den Kaffee." },
  "la ensalada":     { es: "De primero quiero una ensalada.", de: "Als Vorspeise möchte ich einen Salat." },
  "el plato":        { es: "Pon el plato en la mesa, por favor.", de: "Stell den Teller bitte auf den Tisch." },
  "el vaso":         { es: "¿Me traes un vaso de agua?", de: "Bringst du mir ein Glas Wasser?" },
  "el cuchillo":     { es: "Corto el pan con el cuchillo.", de: "Ich schneide das Brot mit dem Messer." },
  "el tenedor":      { es: "Se come la pasta con tenedor.", de: "Nudeln isst man mit der Gabel." },
  "la servilleta":   { es: "Necesito una servilleta, por favor.", de: "Ich brauche bitte eine Serviette." },
  "la sartén":       { es: "Frío el huevo en la sartén.", de: "Ich brate das Ei in der Pfanne." },
  "la manzana":      { es: "Como una manzana cada día.", de: "Ich esse jeden Tag einen Apfel." },
  "el tomate":       { es: "La ensalada lleva tomate y cebolla.", de: "Der Salat enthält Tomate und Zwiebel." },
  "la cebolla":      { es: "Primero corto la cebolla en trozos.", de: "Zuerst schneide ich die Zwiebel in Stücke." },
  "el ajo":          { es: "Añade un diente de ajo.", de: "Gib eine Knoblauchzehe dazu." },
  "la patata":       { es: "La tortilla de patata es típica de España.", de: "Die Kartoffeltortilla ist typisch für Spanien." },

  // ============ Charakter & Aussehen ============
  "simpático/a":     { es: "Tu hermano es muy simpático.", de: "Dein Bruder ist sehr sympathisch." },
  "alegre":          { es: "Siempre está alegre por las mañanas.", de: "Morgens ist er immer fröhlich." },
  "tímido/a":        { es: "De pequeño era muy tímido.", de: "Als Kind war ich sehr schüchtern." },
  "trabajador/a":    { es: "Mi compañera es muy trabajador.", de: "Meine Kollegin ist sehr fleißig." },
  "divertido/a":     { es: "El profesor es muy divertido.", de: "Der Lehrer ist sehr lustig." },
  "alto/a":          { es: "Mi padre es muy alto.", de: "Mein Vater ist sehr groß." },
  "rubio/a":         { es: "Su hija es rubio y tiene los ojos azules.", de: "Ihre Tochter ist blond und hat blaue Augen." },
  "la barba":        { es: "Lleva barba desde el invierno.", de: "Er trägt seit dem Winter einen Bart." },
  "las gafas":       { es: "No veo nada sin las gafas.", de: "Ohne die Brille sehe ich nichts." },
  "la ropa":         { es: "Guardo la ropa en el armario.", de: "Ich bewahre die Kleidung im Schrank auf." },
  "la camiseta":     { es: "Llevo una camiseta blanca.", de: "Ich trage ein weißes T-Shirt." },
  "los pantalones":  { es: "Estos pantalones me quedan grandes.", de: "Diese Hose ist mir zu groß." },
  "el coche":        { es: "Vamos en coche a la playa.", de: "Wir fahren mit dem Auto an den Strand." },
  "llevarse bien":   { es: "Es importante llevarse bien con los vecinos.", de: "Es ist wichtig, sich gut mit den Nachbarn zu verstehen." },

  // ============ Alltag, Höflichkeit, Gefühle ============
  "saludar":         { es: "Es de buena educación saludar al entrar.", de: "Es gehört sich, beim Eintreten zu grüßen." },
  "prestar":         { es: "¿Me puedes prestar un bolígrafo?", de: "Kannst du mir einen Kugelschreiber leihen?" },
  "devolver":        { es: "Tengo que devolver el libro mañana.", de: "Ich muss das Buch morgen zurückgeben." },
  "pagar":           { es: "Prefiero pagar con tarjeta.", de: "Ich zahle lieber mit Karte." },
  "comprar":         { es: "Tengo que comprar pan y leche.", de: "Ich muss Brot und Milch kaufen." },
  "el regalo":       { es: "Le compré un regalo por su cumpleaños.", de: "Ich kaufte ihm ein Geschenk zum Geburtstag." },
  "la cuenta":       { es: "Camarero, la cuenta, por favor.", de: "Herr Ober, die Rechnung bitte." },
  "tener prisa":     { es: "No me gusta tener prisa por la mañana.", de: "Ich mag es nicht, morgens in Eile zu sein." },
  "llegar tarde":    { es: "Siento llegar tarde a la reunión.", de: "Tut mir leid, dass ich zu spät zum Treffen komme." },
  "amable":          { es: "El dependiente fue muy amable.", de: "Der Verkäufer war sehr freundlich." },
  "cansado/a":       { es: "Estoy muy cansado después del trabajo.", de: "Nach der Arbeit bin ich sehr müde." },
  "contento/a":      { es: "Estoy contento con el resultado.", de: "Ich bin mit dem Ergebnis zufrieden." },
  "enfadado/a":      { es: "Está enfadado porque llegamos tarde.", de: "Er ist verärgert, weil wir zu spät kamen." },
  "preocupado/a":    { es: "Mi madre está preocupado por el examen.", de: "Meine Mutter ist wegen der Prüfung besorgt." },

  // ============ Gesundheit ============
  "la salud":        { es: "Cuidar la salud es lo más importante.", de: "Auf die Gesundheit zu achten ist das Wichtigste." },
  "doler":           { es: "Después del deporte puede doler la espalda.", de: "Nach dem Sport kann der Rücken wehtun." },
  "la fiebre":       { es: "Tengo fiebre y no voy a clase.", de: "Ich habe Fieber und gehe nicht zum Unterricht." },
  "la gripe":        { es: "Estoy en casa con la gripe.", de: "Ich bin mit Grippe zu Hause." },
  "enfermo/a":       { es: "Mi hermano está enfermo esta semana.", de: "Mein Bruder ist diese Woche krank." },
  "el médico / la médica": { es: "Voy al médico esta tarde.", de: "Ich gehe heute Nachmittag zum Arzt." },
  "la farmacia":     { es: "La farmacia cierra a las ocho.", de: "Die Apotheke schließt um acht." },
  "dormir":          { es: "Necesito dormir ocho horas.", de: "Ich muss acht Stunden schlafen." },
  "hacer deporte":   { es: "Me gusta hacer deporte por la mañana.", de: "Ich mache gern morgens Sport." },
  "estar en forma":  { es: "Corro para estar en forma.", de: "Ich laufe, um fit zu sein." },

  // ============ Lernen & Uni ============
  "el idioma":       { es: "El español es un idioma muy útil.", de: "Spanisch ist eine sehr nützliche Sprache." },
  "aprender":        { es: "Quiero aprender a hablar con fluidez.", de: "Ich will fließend sprechen lernen." },
  "estudiar":        { es: "Tengo que estudiar dos horas cada día.", de: "Ich muss jeden Tag zwei Stunden lernen." },
  "el examen":       { es: "El examen es el lunes por la mañana.", de: "Die Prüfung ist am Montagmorgen." },
  "entender":        { es: "Es difícil entender esta palabra.", de: "Es ist schwierig, dieses Wort zu verstehen." },
  "la palabra":      { es: "Busco la palabra en el diccionario.", de: "Ich suche das Wort im Wörterbuch." },
  "la frase":        { es: "Escribe una frase con este verbo.", de: "Schreib einen Satz mit diesem Verb." },
  "el error":        { es: "Cometí un error en la última pregunta.", de: "Ich machte einen Fehler bei der letzten Frage." },
  "el libro":        { es: "Este libro es muy interesante.", de: "Dieses Buch ist sehr interessant." },
  "escribir":        { es: "Voy a escribir un correo a mi profesora.", de: "Ich werde eine E-Mail an meine Lehrerin schreiben." },
  "leer":            { es: "Me gusta leer el periódico por la mañana.", de: "Ich lese morgens gern die Zeitung." },
  "difícil":         { es: "La gramática española no es difícil.", de: "Die spanische Grammatik ist nicht schwierig." },

  // ============ Freizeit ============
  "el ocio":         { es: "El fin de semana es tiempo de ocio.", de: "Das Wochenende ist Freizeit." },
  "el concierto":    { es: "El concierto empieza a las diez.", de: "Das Konzert beginnt um zehn." },
  "la entrada":      { es: "Compré la entrada por internet.", de: "Ich kaufte die Eintrittskarte im Internet." },
  "la música":       { es: "Escucho música mientras estudio.", de: "Ich höre Musik, während ich lerne." },
  "la película":     { es: "La película dura dos horas.", de: "Der Film dauert zwei Stunden." },
  "correr":          { es: "Salgo a correr por el parque.", de: "Ich gehe im Park laufen." },
  "nadar":           { es: "Aprendí a nadar de pequeño.", de: "Ich lernte als Kind schwimmen." },
  "bailar":          { es: "Nos gusta bailar los sábados.", de: "Wir tanzen gern samstags." },
  "viajar":          { es: "Quiero viajar por Latinoamérica.", de: "Ich möchte durch Lateinamerika reisen." },
  "la bicicleta":    { es: "Voy al trabajo en bicicleta.", de: "Ich fahre mit dem Fahrrad zur Arbeit." },

  // ============ Biografie & Zeit ============
  "nacer":           { es: "Nacer en un pueblo pequeño tiene ventajas.", de: "In einem kleinen Dorf geboren zu werden hat Vorteile." },
  "casarse":         { es: "Mis padres quieren casarse en mayo.", de: "Meine Eltern wollen im Mai heiraten." },
  "mudarse":         { es: "Mudarse a otra ciudad no es fácil.", de: "In eine andere Stadt umzuziehen ist nicht einfach." },
  "el dinero":       { es: "No tengo dinero en efectivo.", de: "Ich habe kein Bargeld." },
  "el trabajo":      { es: "Busco trabajo para el verano.", de: "Ich suche Arbeit für den Sommer." },
  "la vida":         { es: "La vida en la ciudad es más cara.", de: "Das Leben in der Stadt ist teurer." },
  "antes":           { es: "Antes vivíamos en un piso más pequeño.", de: "Früher wohnten wir in einer kleineren Wohnung." },
  "todavía":         { es: "Todavía no he terminado el trabajo.", de: "Ich habe die Arbeit noch nicht beendet." },
  "el cumpleaños":   { es: "Mi cumpleaños es en agosto.", de: "Mein Geburtstag ist im August." },
  "la fiesta":       { es: "La fiesta terminó muy tarde.", de: "Das Fest endete sehr spät." },
  "invitar":         { es: "Quiero invitar a mis amigos el sábado.", de: "Ich möchte am Samstag meine Freunde einladen." },
  "de repente":      { es: "De repente empezó a llover.", de: "Plötzlich fing es an zu regnen." },
};
