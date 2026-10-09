// Every word that is not the app's own: the slide headlines (deck.js writes them into
// ../app-store-screenshots.json) and the Coach's canned chat for the capture.
// Headlines: "\n" = new line, *word* = highlighted. Keep lines to about 12 letters: the headline font is big. Plain words, one idea per slide, no result or health claims,
// no prices, no "#1". Slides showing Premium content say what is free (App Store 2.3.2): slide 3 (Weeks 2–4
// are Premium) and slide 8 (3 free Coach answers a month; unlimited with Premium). Use the app's own words (app/src/i18n/locales/<lang>/*.json). The first three slides show
// in App Store search, so their labels carry the search words of each language's name and keywords.
// `asc`: the App Store Connect locales that get this language's screenshots.

const POSTURE = { type: 'create', kind: 'posture', title: '', times: ['15:00'], days: [1, 2, 3, 4, 5] };

export const COPY = {
  en: {
    asc: ['en-US'],
    slides: [
      ['FACE YOGA & JAWLINE', 'Train your\n*face* like\nyour body'],
      ['FACE EXERCISES', 'See the\n*muscle*\nyou train'],
      ['28-DAY PLAN · WEEK 1 FREE', 'A plan that\n*grows*\nwith you'],
      ['VOICE CUES', 'Just\n*listen*\nand follow'],
      ['CAMERA MIRROR · NOTHING RECORDED', 'Check your\nform in the\n*mirror*'],
      ['FOR MEN & WOMEN', 'For *him*.\nFor *her*.'],
      ['PROGRESS', 'Keep your\n*streak*\ngoing'],
      ['AI COACH · 3 FREE ANSWERS A MONTH', 'Questions?\nAsk the\n*Coach*'],
    ],
    chat: {
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
      ['PLAN DE 28 DÍAS · SEMANA 1 GRATIS', 'Un plan que\n*crece*\ncontigo'],
      ['GUÍA POR VOZ', 'Solo\n*escucha*\ny sigue'],
      ['ESPEJO · NO SE GRABA NADA', 'Mírate\nen el *espejo*'],
      ['HOMBRES Y MUJERES', 'Para *él*.\nPara *ella*.'],
      ['PROGRESO', 'Mantén\ntu *racha*'],
      ['COACH CON IA · 3 RESPUESTAS GRATIS AL MES', '¿Dudas?\nPregunta al\n*Coach*'],
    ],
    chat: {
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
      ['PLANO DE 28 DIAS · SEMANA 1 GRÁTIS', 'Um plano\nque *evolui*\ncom você'],
      ['GUIADO POR VOZ', 'É só *ouvir*\ne seguir'],
      ['ESPELHO · NADA É GRAVADO', 'Confira tudo\nno *espelho*'],
      ['HOMENS E MULHERES', 'Para *ele*.\nPara *ela*.'],
      ['PROGRESSO', 'Mantenha\nsua\n*sequência*'],
      ['COACH COM IA · 3 RESPOSTAS GRÁTIS POR MÊS', 'Dúvidas?\nPergunte ao\n*Coach*'],
    ],
    chat: {
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
      ['28-TAGE-PLAN · WOCHE 1 GRATIS', 'Ein Plan, der\nmit dir\n*wächst*'],
      ['SPRACHANSAGEN', 'Einfach\n*zuhören* und\nmitmachen'],
      ['SPIEGEL · NICHTS WIRD AUFGENOMMEN', 'Sieh dich\nim *Spiegel*'],
      ['FÜR MÄNNER & FRAUEN', 'Für *ihn*.\nFür *sie*.'],
      ['FORTSCHRITT', 'Bleib\n*dran*'],
      ['KI-COACH · 3 ANTWORTEN IM MONAT GRATIS', 'Fragen?\nFrag den\n*Coach*'],
    ],
    chat: {
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
      ['PLAN DE 28 JOURS · SEMAINE 1 GRATUITE', 'Un plan qui\n*progresse*\navec toi'],
      ['GUIDAGE VOCAL', 'Il suffit\nd’*écouter*'],
      ['MIROIR · RIEN N’EST ENREGISTRÉ', 'Vérifie-toi\ndans le\n*miroir*'],
      ['HOMMES ET FEMMES', 'Pour *lui*.\nPour *elle*.'],
      ['PROGRÈS', 'Garde\nta *série*'],
      ['COACH IA · 3 RÉPONSES GRATUITES PAR MOIS', 'Demande\nau *Coach*'],
    ],
    chat: {
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
      ['PIANO DI 28 GIORNI · SETTIMANA 1 GRATIS', 'Un piano che\n*cresce*\ncon te'],
      ['GUIDA VOCALE', 'Basta\n*ascoltare*'],
      ['SPECCHIO · NIENTE VIENE REGISTRATO', 'Guardati\nallo *specchio*'],
      ['UOMINI E DONNE', 'Per *lui*.\nPer *lei*.'],
      ['PROGRESSI', 'Non perdere\nla *serie*'],
      ['COACH IA · 3 RISPOSTE GRATIS AL MESE', 'Dubbi?\nChiedi al\n*Coach*'],
    ],
    chat: {
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
