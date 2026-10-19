// Every word that is not the app's own: the slide headlines (deck.js writes them into
// ../app-store-screenshots.json), the questions the Simulator capture asks the Coach (`routine`, then `ask2`; the real
// Coach answers, sim-capture.js) and the web capture's canned chat (ask1, reply1, ask2, reply2).
// Headlines: "\n" = new line, *word* = highlighted. Keep lines to about 12 letters: the headline font is big. Plain words,
// one idea per slide, no result or health claims, no prices, no "#1", never looks or "symmetry" (the scan measures
// movement). Slides showing something with a free limit say what is free (App Store 2.3.2): slide 3 (3 free face scans),
// slide 5 (Days 1–3 free; the days after them are Premium) and slide 9 (3 free Coach answers a month; unlimited with
// Premium). Use the app's own words (app/src/i18n/locales/<lang>/*.json). The first three slides show in App Store
// search, so their labels carry the search words of each language's name and keywords.
// `asc`: the App Store Connect locales that get this language's screenshots.

const POSTURE = { type: 'create', kind: 'posture', title: '', times: ['15:00'], days: [1, 2, 3, 4, 5] };

export const COPY = {
  en: {
    asc: ['en-US'],
    slides: [
      ['FACE YOGA & JAWLINE', 'Train your\n*face* like\nyour body'],
      ['FACE EXERCISES', 'See the\n*muscle*\nyou train'],
      ['FACE SCAN · 3 FREE SCANS', 'Scan.\nMeasure.\n*Compare.*'],
      ['STREAK & SCAN CHART', 'Track your\n*progress*'],
      ['DAILY WORKOUT · DAYS 1–3 FREE', 'A workout\n*every* day'],
      ['VOICE CUES', 'Just\n*listen*\nand follow'],
      ['CAMERA MIRROR · NOTHING RECORDED', 'Check your\nform in the\n*mirror*'],
      ['FOR MEN & WOMEN', 'For *him*.\nFor *her*.'],
      ['AI COACH · 3 FREE ANSWERS A MONTH', 'Questions?\nAsk the\n*Coach*'],
    ],
    chat: {
      routine: 'Give me a quick face routine',
      ask1: 'How do I do the Jaw Clench right?',
      reply1: 'Bite down gently with your back teeth and hold for the count. Keep your lips soft and your shoulders down. You should feel the muscle in front of your ears tighten, never pain. If your jaw clicks or hurts, skip it and do the Jaw Release instead.',
      ask2: 'Remind me to check my posture at 3 PM on weekdays',
      reply2: 'Good idea. Here is a posture reminder for weekdays at 3 PM.',
    },
  },
  es: {
    asc: ['es-MX', 'es-ES'],
    slides: [
      ['YOGA FACIAL Y MANDÍBULA', 'Entrena tu\n*cara* como\ntu cuerpo'],
      ['EJERCICIOS FACIALES', 'Mira el\n*músculo*\nque entrenas'],
      ['ESCANEO FACIAL · 3 ESCANEOS GRATIS', 'Escanea.\nMide.\n*Compara.*'],
      ['RACHA Y GRÁFICO DE ESCANEOS', 'Sigue tu\n*progreso*'],
      ['ENTRENAMIENTO DIARIO · DÍAS 1–3 GRATIS', 'Tu rutina,\n*cada* día'],
      ['GUÍA POR VOZ', 'Solo\n*escucha*\ny sigue'],
      ['ESPEJO · NO SE GRABA NADA', 'Mírate\nen el *espejo*'],
      ['HOMBRES Y MUJERES', 'Para *él*.\nPara *ella*.'],
      ['COACH CON IA · 3 RESPUESTAS GRATIS AL MES', '¿Dudas?\nPregunta al\n*Coach*'],
    ],
    chat: {
      routine: 'Dame una rutina facial rápida',
      ask1: '¿Cómo hago bien el Apretón de mandíbula?',
      reply1: 'Aprieta suavemente con las muelas y mantén durante la cuenta. Deja los labios relajados y los hombros abajo. Debes notar que se tensa el músculo delante de las orejas, nunca dolor. Si la mandíbula te cruje o te duele, sáltalo y haz la Relajación de mandíbula.',
      ask2: 'Recuérdame revisar mi postura a las 15:00 entre semana',
      reply2: 'Buena idea. Aquí tienes un recordatorio de postura de lunes a viernes a las 15:00.',
    },
  },
  'pt-BR': {
    asc: ['pt-BR'],
    slides: [
      ['YOGA FACIAL E MAXILAR', 'Treine seu\n*rosto* como\no corpo'],
      ['EXERCÍCIOS FACIAIS', 'Veja o\n*músculo* que\nvocê treina'],
      ['ESCANEAMENTO FACIAL · 3 GRÁTIS', 'Escanear.\nMedir.\n*Comparar.*'],
      ['SEQUÊNCIA E ESCANEAMENTOS', 'Acompanhe\nseu\n*progresso*'],
      ['TREINO DIÁRIO · DIAS 1–3 GRÁTIS', 'Um treino\n*todo* dia'],
      ['GUIADO POR VOZ', 'É só *ouvir*\ne seguir'],
      ['ESPELHO · NADA É GRAVADO', 'Confira tudo\nno *espelho*'],
      ['HOMENS E MULHERES', 'Para *ele*.\nPara *ela*.'],
      ['COACH COM IA · 3 RESPOSTAS GRÁTIS POR MÊS', 'Dúvidas?\nPergunte ao\n*Coach*'],
    ],
    chat: {
      routine: 'Monte uma rotina facial rápida',
      ask1: 'Como faço a Contração da mandíbula do jeito certo?',
      reply1: 'Aperte de leve com os dentes de trás e segure durante a contagem. Deixe os lábios soltos e os ombros baixos. Você deve sentir o músculo na frente das orelhas firmar, nunca dor. Se a mandíbula estalar ou doer, pule e faça o Relaxamento da mandíbula.',
      ask2: 'Me lembre de checar minha postura às 15h nos dias úteis',
      reply2: 'Boa ideia. Aqui está um lembrete de postura de segunda a sexta às 15h.',
    },
  },
  de: {
    asc: ['de-DE'],
    slides: [
      ['GESICHTSYOGA & JAWLINE', 'Trainiere\ndein *Gesicht*'],
      ['GESICHTSÜBUNGEN', 'Sieh deinen\n*Muskel*\narbeiten'],
      ['GESICHTSSCAN · 3 SCANS GRATIS', 'Scannen.\nMessen.\n*Vergleichen.*'],
      ['SERIE & SCAN-VERLAUF', 'Verfolge\ndeinen\n*Fortschritt*'],
      ['TÄGLICHES TRAINING · TAG 1–3 GRATIS', 'Dein\nTraining für\n*jeden* Tag'],
      ['SPRACHANSAGEN', 'Einfach\n*zuhören* und\nmitmachen'],
      ['SPIEGEL · NICHTS WIRD AUFGENOMMEN', 'Sieh dich\nim *Spiegel*'],
      ['FÜR MÄNNER & FRAUEN', 'Für *ihn*.\nFür *sie*.'],
      ['KI-COACH · 3 ANTWORTEN IM MONAT GRATIS', 'Fragen?\nFrag den\n*Coach*'],
    ],
    chat: {
      routine: 'Stell mir eine kurze Routine fürs Gesicht zusammen',
      ask1: 'Wie mache ich „Kiefer anspannen“ richtig?',
      reply1: 'Beiß sanft mit den Backenzähnen zusammen und halte, solange gezählt wird. Lippen locker, Schultern unten. Du solltest spüren, wie sich der Muskel vor den Ohren anspannt, aber nie Schmerz. Wenn dein Kiefer knackt oder wehtut, lass die Übung aus und mach stattdessen „Kiefer lockern“.',
      ask2: 'Erinnere mich werktags um 15 Uhr an meine Haltung',
      reply2: 'Gute Idee. Hier ist eine Haltungs-Erinnerung für Montag bis Freitag um 15 Uhr.',
    },
  },
  fr: {
    asc: ['fr-FR'],
    slides: [
      ['YOGA DU VISAGE & MÂCHOIRE', 'Entraîne\nton *visage*'],
      ['EXERCICES DU VISAGE', 'Vois ton\n*muscle*\ntravailler'],
      ['SCAN DU VISAGE · 3 SCANS GRATUITS', 'Scanne.\nMesure.\n*Compare.*'],
      ['SÉRIE & COURBE DES SCANS', 'Suis tes\n*progrès*'],
      ['SÉANCE DU JOUR · JOURS 1 À 3 GRATUITS', 'Une séance\n*chaque*\njour'],
      ['GUIDAGE VOCAL', 'Il suffit\nd’*écouter*'],
      ['MIROIR · RIEN N’EST ENREGISTRÉ', 'Vérifie-toi\ndans le\n*miroir*'],
      ['HOMMES ET FEMMES', 'Pour *lui*.\nPour *elle*.'],
      ['COACH IA · 3 RÉPONSES GRATUITES PAR MOIS', 'Demande\nau *Coach*'],
    ],
    chat: {
      routine: 'Prépare-moi une routine visage rapide',
      ask1: 'Comment bien faire la Mâchoire serrée ?',
      reply1: 'Serre doucement les molaires et tiens pendant le décompte. Garde les lèvres détendues et les épaules basses. Tu dois sentir le muscle devant les oreilles se contracter, jamais de douleur. Si ta mâchoire craque ou fait mal, passe cet exercice et fais plutôt la Détente de la mâchoire.',
      ask2: 'Rappelle-moi de vérifier ma posture à 15 h en semaine',
      reply2: 'Bonne idée. Voici un rappel posture du lundi au vendredi à 15 h.',
    },
  },
  it: {
    asc: ['it'],
    slides: [
      ['YOGA FACCIALE & MASCELLA', 'Allena il\n*viso* come\nil corpo'],
      ['ESERCIZI PER IL VISO', 'Vedi il\n*muscolo*\nche alleni'],
      ['SCANSIONE DEL VISO · 3 GRATIS', 'Scansiona.\nMisura.\n*Confronta.*'],
      ['SERIE E GRAFICO DELLE SCANSIONI', 'Segui i tuoi\n*progressi*'],
      ['ALLENAMENTO DEL GIORNO · GIORNI 1–3 GRATIS', 'Il tuo\n*allenamento*\nogni giorno'],
      ['GUIDA VOCALE', 'Basta\n*ascoltare*'],
      ['SPECCHIO · NIENTE VIENE REGISTRATO', 'Guardati\nallo *specchio*'],
      ['UOMINI E DONNE', 'Per *lui*.\nPer *lei*.'],
      ['COACH IA · 3 RISPOSTE GRATIS AL MESE', 'Dubbi?\nChiedi al\n*Coach*'],
    ],
    chat: {
      routine: 'Preparami una routine veloce per il viso',
      ask1: 'Come faccio bene la Mascella serrata?',
      reply1: 'Stringi piano i molari e tieni per tutto il conteggio. Labbra morbide e spalle basse. Devi sentire il muscolo davanti alle orecchie che si contrae, mai dolore. Se la mascella scrocchia o fa male, salta l’esercizio e fai il Rilascio della mascella.',
      ask2: 'Ricordami di controllare la postura alle 15 nei giorni feriali',
      reply2: 'Buona idea. Ecco un promemoria per la postura dal lunedì al venerdì alle 15.',
    },
  },
};

// LANGS=en node … works on one language (a sample) without touching the others' files.
export const LANGS = process.env.LANGS ? process.env.LANGS.split(',') : Object.keys(COPY);
export const CHAT_ACTION = POSTURE;
