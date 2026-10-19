# App Store listing text (ready to paste)

One section per App Store language: name (max 30), subtitle (max 30), keywords (max 100, comma-separated, no spaces),
promotional text (max 170, can change any time without a new version), the subscriptions' description (max 55, the
same for Weekly, Monthly and Yearly) and the description (max 4000, changes need a new version). Version 1.0 has no
What's New: Apple doesn't show it on a first version. English is the source; the reasoning behind it is in
[launch.md](launch.md) §3.

Rules followed:
- Only features in this version. Free and Premium are said exactly as the app says them (paywall, Today, face scan):
  days 1 to 3 of the weekly workouts, a set of exercises, 3 Coach answers a month and 3 face scans are free; Premium is
  every exercise, every day, unlimited Coach answers and unlimited face scans. "Days 1 to 3 are free", never a
  "trial" (that's the App Store's word). Never the number of exercises or a plan length.
- Mewing is in the subtitle and is a Premium exercise, so the Premium list names it (2.3.2).
- The subscription terms and the Terms of Use and Privacy Policy links are included (Apple requires them for
  auto-renewing subscriptions).
- No result or medical claims (no "fuller lips", "younger", "lose your double chin", "reshape"), no competitor names,
  no "#1/best". "Unlimited" Coach answers is true: the Worker's daily ceiling only stops abuse and is never named
  (docs/app-review.md). The safety paragraph and "Results vary" are in every language.
- The face scan reads movement only: never looks, face shape or a promise that the numbers rise; "not a medical test";
  it needs face tracking, so it works on iPhone X and later (the app runs from iOS 16.4, where iPhone 8 has none).
- Keywords never repeat a word from the name or subtitle (Apple counts each word once), and stay within 100 **bytes**:
  accented letters count twice, so `ç`, `í`, `ü` use up the limit faster.
- Same informal tone as the app (tú / você / du / tu / tu), and the app's own words for its features.
- The app says "face care" (cuidado facial, cuidados com o rosto, Gesichtspflege, soins du visage, cura del viso). The
  English keyword stays `skincare`, because that is what people search for; keywords are never shown.

⚠️ The translations were made with AI. Have a native speaker check each one before you submit it.

Use **English (US)** for English (UK), English (Australia) and English (India); **Spanish (Mexico)** text for Spanish
(Spain) too; **French** for French (Canada).

---

## English (US)
- **Name (28):** `FaceRep: Face Yoga & Jawline`
- **Subtitle (30):** `Lips, Cheeks & Mewing Workouts`
- **Keywords (100):** `double,chin,cheekbone,jaw,tongue,posture,facial,fitness,men,women,exercise,eye,massage,skincare,glow`
- **Promotional text (166):** See the muscle you train. Guided face workouts for jawline, cheekbones, lips and eyes, with voice or beep cues, a camera mirror and a face scan. Days 1 to 3 are free.
- **Subscription description (55):** Every day and exercise, unlimited Coach and face scans.

**Description**

```
FaceRep is facial fitness for men and women: short, guided workouts for your jawline, cheekbones, lips and eye area, plus face massage. A few minutes a day.

SEE THE MUSCLE YOU TRAIN
Every exercise shows the working muscle lit up in red, moving from relaxed to squeeze in time with the timer. Choose whether the pictures show a man or a woman.

FOLLOW ALONG WITHOUT LOOKING
Voice cues tell you when to squeeze, when to relax and what comes next. Prefer beeps? A beep to squeeze, a tick for each second you hold and a lower beep to relax. Train with your eyes closed or your hands on your face: the screen stays on while you train.

CHECK YOUR FORM IN THE MIRROR
Turn on the mirror to see yourself next to the drawing. The camera picture is only shown live: it is never recorded or saved.

FACE SCAN
About 30 seconds, 6 guided moves: raise your eyebrows, squint, smile, pucker, open your mouth and puff your cheeks. Face tracking on your iPhone measures how far your face moves (Movement) and how evenly both sides move (Balance), compared with your own relaxed face. Scan again later and follow your numbers in a chart. It reads movement, not face shape or looks, and it isn't a medical test. Everything stays on your iPhone, including the optional progress photos. Works on iPhone X and later.

A WORKOUT EVERY DAY
• Focus on one area of the face, or do a bit of everything
• A new mix each day, in weeks that build up gently: fewer reps while you learn the moves, then full reps and longer holds
• Each week ends with a short, gentle day
• If you miss a day, it waits for you

KNOW YOUR FACE
Tap an area on the face map, from forehead to neck, to see its muscles and the exercises that work them. Most exercises also have a short video, made from the drawing.

TRACK YOUR PROGRESS
Streaks, a week, month and year calendar of your workouts, and your face scans in a chart.

REMINDERS AND AI COACH
• Reminders for workouts, mewing checks and posture breaks, on your days and times
• Ask the AI Coach about technique or for a quick routine, and start it with one tap. It can also suggest reminder changes: nothing changes until you confirm

WHAT'S FREE
A set of exercises, days 1 to 3 of the weekly workouts, 3 free answers a month from the AI Coach and 3 face scans. No account, no ads. Your workouts are saved on your iPhone.

PREMIUM
• Every exercise, for every area of the face, including mewing and the tongue press
• Every day of your weekly workouts
• Unlimited AI Coach answers. You're asked for permission before your first question
• Unlimited face scans

SAFETY
Move gently and stop if anything hurts. If you have jaw pain or a jaw joint problem, ask a doctor or dentist before jaw exercises. FaceRep is a fitness and wellness app, not medical advice. Results vary.

SUBSCRIPTION
Premium is available weekly, monthly or yearly. Payment is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the period ends. Manage it in your App Store account settings.

The exercise drawings and the app's portraits are AI-generated and show fictional people.

Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacy Policy: https://facerep-api.elowa-app.workers.dev/privacy
```

---

## Spanish (es)
- **Name (30):** `FaceRep: Yoga facial y jawline`
- **Subtitle (27):** `Mandíbula, pómulos y mewing`
- **Keywords (99):** `ejercicios,papada,gimnasia,rostro,cara,labios,mejillas,ojos,lengua,postura,masaje,hombre,mujer,piel`
- **Promotional text (168):** Mira el músculo que entrenas. Ejercicios faciales guiados para mandíbula, pómulos, labios y ojos, con voz o pitidos, espejo y escaneo facial. Los días 1 a 3 son gratis.
- **Subscription description (50):** Cada día y ejercicio, Coach y escaneos ilimitados.

**Description**

```
FaceRep es fitness facial para hombres y mujeres: entrenamientos cortos y guiados para la mandíbula, los pómulos, los labios y la zona de los ojos, además de masaje facial. Unos minutos al día.

MIRA EL MÚSCULO QUE ENTRENAS
Cada ejercicio muestra en rojo el músculo que trabaja, que pasa de relajado a contraído al ritmo del temporizador. Elige si las imágenes muestran a un hombre o a una mujer.

SIGUE EL EJERCICIO SIN MIRAR
La guía por voz te dice cuándo apretar, cuándo relajar y qué viene después. ¿Prefieres pitidos? Un pitido para apretar, un tic por cada segundo que aguantas y un pitido más grave para relajar. Entrena con los ojos cerrados o con las manos en la cara: la pantalla se mantiene encendida mientras entrenas.

REVISA TU TÉCNICA EN EL ESPEJO
Activa el espejo para verte junto al dibujo. La imagen de la cámara solo se muestra en directo: nunca se graba ni se guarda.

ESCANEO FACIAL
Unos 30 segundos, 6 movimientos guiados: levanta las cejas, entrecierra los ojos, sonríe, frunce los labios, abre la boca e infla las mejillas. El seguimiento facial de tu iPhone mide cuánto se mueve tu cara (Movimiento) y si ambos lados se mueven por igual (Equilibrio), comparado con tu propia cara relajada. Vuelve a escanear más adelante y sigue tus números en un gráfico. Lee el movimiento, no la forma de la cara ni el aspecto, y no es una prueba médica. Todo se queda en tu iPhone, también las fotos de progreso opcionales. Funciona en el iPhone X y posteriores.

UN ENTRENAMIENTO CADA DÍA
• Enfócate en una zona de la cara o haz un poco de todo
• Una combinación nueva cada día, en semanas que suben poco a poco: menos repeticiones mientras aprendes los movimientos, luego repeticiones completas y contracciones más largas
• Cada semana termina con un día corto y suave
• Si te saltas un día, te espera

CONOCE TU CARA
Toca una zona del mapa facial, de la frente al cuello, para ver sus músculos y los ejercicios que los trabajan. La mayoría de los ejercicios tienen también un vídeo corto, hecho a partir del dibujo.

SIGUE TU PROGRESO
Rachas, un calendario semanal, mensual y anual de tus entrenamientos y tus escaneos faciales en un gráfico.

RECORDATORIOS Y COACH CON IA
• Recordatorios para entrenar, revisar tu mewing y hacer pausas para la postura, en los días y horas que elijas
• Pregúntale al Coach con IA sobre la técnica o pídele una rutina rápida, y empiézala con un toque. También puede proponerte cambios en los recordatorios: no cambia nada hasta que lo confirmas

QUÉ ES GRATIS
Una selección de ejercicios, los días 1 a 3 de los entrenamientos semanales, 3 respuestas gratis al mes del Coach con IA y 3 escaneos faciales. Sin cuenta y sin anuncios. Tus entrenamientos se guardan en tu iPhone.

PREMIUM
• Todos los ejercicios, para cada zona de la cara, incluidos el mewing y la presión de lengua
• Todos los días de tus entrenamientos semanales
• Respuestas ilimitadas del Coach con IA. Te pediremos permiso antes de tu primera pregunta
• Escaneos faciales ilimitados

SEGURIDAD
Muévete con suavidad y para si algo te duele. Si tienes dolor de mandíbula o un problema en la articulación de la mandíbula, consulta a un médico o dentista antes de hacer ejercicios de mandíbula. FaceRep es una app de fitness y bienestar y no ofrece consejo médico. Los resultados varían.

SUSCRIPCIÓN
Premium está disponible con pago semanal, mensual o anual. El pago se carga a tu Cuenta de Apple. La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes de que termine el periodo. Puedes gestionarla en los ajustes de tu cuenta del App Store.

Los dibujos de los ejercicios y los retratos de la app están generados con IA y muestran personas ficticias.

Términos de uso: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Política de privacidad: https://facerep-api.elowa-app.workers.dev/privacy
```

---

## Portuguese (Brazil)
- **Name (30):** `FaceRep: Yoga Facial e Maxilar`
- **Subtitle (26):** `Lábios, Bochechas e Mewing`
- **Keywords (97):** `mandíbula,papada,queixo,ginástica,exercício,rosto,maçã,língua,postura,massagem,homem,mulher`
- **Promotional text (166):** Veja o músculo que você treina. Treinos faciais guiados para mandíbula, bochechas, lábios e olhos, com voz ou bipes, espelho e escaneamento facial. Dias 1 a 3 grátis.
- **Subscription description (55):** Todo dia e exercício, Coach e escaneamentos ilimitados.

**Description**

```
O FaceRep é fitness facial para homens e mulheres: treinos curtos e guiados para mandíbula, maçãs do rosto, lábios e região dos olhos, além de massagem facial. Poucos minutos por dia.

VEJA O MÚSCULO QUE VOCÊ TREINA
Cada exercício mostra o músculo trabalhado destacado em vermelho, passando de relaxado a contraído no ritmo do timer. Escolha se as imagens mostram um homem ou uma mulher.

ACOMPANHE SEM OLHAR
As instruções por voz avisam quando contrair, quando relaxar e o que vem a seguir. Prefere bipes? Um bipe para contrair, um tique a cada segundo que você segura e um bipe mais grave para relaxar. Treine de olhos fechados ou com as mãos no rosto: a tela fica ligada durante o treino.

CONFIRA SUA EXECUÇÃO NO ESPELHO
Ative o espelho para se ver ao lado do desenho. A imagem da câmera só aparece ao vivo: nunca é gravada nem salva.

ESCANEAMENTO FACIAL
Cerca de 30 segundos, 6 movimentos guiados: levante as sobrancelhas, aperte os olhos, sorria, faça biquinho, abra a boca e encha as bochechas. O rastreamento facial do seu iPhone mede o quanto seu rosto se move (Movimento) e se os dois lados se movem por igual (Equilíbrio), em comparação com o seu próprio rosto relaxado. Escaneie de novo mais tarde e acompanhe seus números em um gráfico. Ele lê o movimento, não o formato do rosto nem a aparência, e não é um exame médico. Tudo fica no seu iPhone, inclusive as fotos de progresso opcionais. Funciona no iPhone X ou mais recente.

UM TREINO TODO DIA
• Foque em uma área do rosto ou faça um pouco de tudo
• Uma combinação nova a cada dia, em semanas que avançam aos poucos: menos repetições enquanto você aprende os movimentos, depois repetições completas e contrações mais longas
• Cada semana termina com um dia curto e leve
• Se você pular um dia, ele espera por você

CONHEÇA SEU ROSTO
Toque em uma área do mapa do rosto, da testa ao pescoço, para ver os músculos e os exercícios que os trabalham. A maioria dos exercícios também tem um vídeo curto, feito a partir do desenho.

ACOMPANHE SEU PROGRESSO
Sequências, um calendário semanal, mensal e anual dos seus treinos e seus escaneamentos faciais em um gráfico.

LEMBRETES E COACH DE IA
• Lembretes de treino, checagens de mewing e pausas para a postura, nos seus dias e horários
• Pergunte ao Coach de IA sobre a técnica ou peça uma rotina rápida e comece com um toque. Ele também pode sugerir mudanças nos lembretes: nada muda até você confirmar

O QUE É GRÁTIS
Uma seleção de exercícios, os dias 1 a 3 dos treinos semanais, 3 respostas grátis por mês do Coach de IA e 3 escaneamentos faciais. Sem conta, sem anúncios. Seus treinos ficam salvos no seu iPhone.

PREMIUM
• Todos os exercícios, para cada área do rosto, incluindo mewing e a pressão da língua
• Todos os dias dos seus treinos semanais
• Respostas ilimitadas do Coach de IA. Pedimos sua permissão antes da primeira pergunta
• Escaneamentos faciais ilimitados

SEGURANÇA
Faça os movimentos com suavidade e pare se algo doer. Se você tem dor na mandíbula ou algum problema na articulação da mandíbula, consulte um médico ou dentista antes dos exercícios de mandíbula. O FaceRep é um app de fitness e bem-estar e não oferece aconselhamento médico. Os resultados variam.

ASSINATURA
O Premium está disponível nos planos semanal, mensal ou anual. O pagamento é cobrado na sua Conta Apple e a assinatura é renovada automaticamente, a menos que seja cancelada pelo menos 24 horas antes do fim do período. Gerencie a assinatura nos ajustes da sua conta da App Store.

Os desenhos dos exercícios e os retratos do app foram gerados por IA e mostram pessoas fictícias.

Termos de Uso: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Política de Privacidade: https://facerep-api.elowa-app.workers.dev/privacy
```

---

## German
- **Name (30):** `FaceRep: Gesichtsyoga, Jawline`
- **Subtitle (25):** `Gesichtstraining & Mewing`
- **Keywords (98):** `doppelkinn,kieferlinie,wangenknochen,face,yoga,gesichtsgymnastik,gesicht,kinn,lippen,massage,zunge`
- **Promotional text (164):** Sieh den Muskel, den du trainierst: Gesichtstraining für Kiefer, Wangen, Lippen und Augen, mit Ansagen oder Pieptönen, Spiegel und Gesichtsscan. Tag 1 bis 3 gratis.
- **Subscription description (50):** Alle Tage und Übungen, Coach und Scans ohne Limit.

**Description**

```
FaceRep ist Gesichtsfitness für Männer und Frauen: kurze, geführte Workouts für Kieferlinie, Wangenknochen, Lippen und Augenpartie, dazu Gesichtsmassage. Nur ein paar Minuten am Tag.

SIEH DEN MUSKEL, DEN DU TRAINIERST
Jede Übung zeigt den arbeitenden Muskel rot hervorgehoben, im Takt des Timers von entspannt bis angespannt. Wähle, ob die Bilder einen Mann oder eine Frau zeigen.

MITMACHEN, OHNE HINZUSEHEN
Per Sprachansage erfährst du, wann du anspannst und lockerlässt und was als Nächstes kommt. Lieber Pieptöne? Ein Piepton zum Anspannen, ein Ticken für jede Sekunde, die du hältst, und ein tieferer Ton zum Lockerlassen. So kannst du mit geschlossenen Augen oder mit den Händen im Gesicht trainieren. Der Bildschirm bleibt beim Training an.

PRÜF DEINE AUSFÜHRUNG IM SPIEGEL
Schalte den Spiegel ein, um dich neben der Zeichnung zu sehen. Das Kamerabild wird nur live gezeigt: Es wird nie aufgenommen oder gespeichert.

GESICHTSSCAN
Etwa 30 Sekunden, 6 geführte Bewegungen: Augenbrauen hoch, Augen zusammenkneifen, lächeln, Lippen spitzen, Mund öffnen und Backen aufblasen. Das Face Tracking deines iPhone misst, wie weit sich dein Gesicht bewegt (Bewegung) und wie gleichmäßig beide Seiten mitgehen (Balance), im Vergleich zu deinem eigenen entspannten Gesicht. Scanne später erneut und verfolge deine Werte in einem Diagramm. Der Scan misst Bewegung, nicht Gesichtsform oder Aussehen, und ist kein medizinischer Test. Alles bleibt auf deinem iPhone, auch die optionalen Fortschrittsfotos. Funktioniert ab dem iPhone X.

JEDEN TAG EIN TRAINING
• Trainiere einen Bereich des Gesichts oder von allem etwas
• Jeden Tag neu gemischt, in Wochen, die sich sanft steigern: weniger Wiederholungen, während du die Übungen kennenlernst, dann volle Wiederholungen und längeres Halten
• Jede Woche endet mit einem kurzen, sanften Tag
• Lässt du einen Tag aus, wartet er auf dich

LERN DEIN GESICHT KENNEN
Tippe auf einen Bereich der Gesichtskarte, von der Stirn bis zum Hals, um seine Muskeln und die Übungen dafür zu sehen. Die meisten Übungen haben auch ein kurzes Video, gemacht aus der Zeichnung.

VERFOLGE DEINEN FORTSCHRITT
Serien, ein Wochen-, Monats- und Jahreskalender deiner Trainings und deine Gesichtsscans in einem Diagramm.

ERINNERUNGEN UND KI-COACH
• Erinnerungen für Training, Mewing-Checks und Haltungspausen an deinen Tagen und zu deinen Uhrzeiten
• Frag den KI-Coach zur Technik oder nach einer kurzen Routine und starte sie mit einem Tippen. Er kann auch Änderungen an deinen Erinnerungen vorschlagen: Es ändert sich nichts, bevor du bestätigst

DAS IST KOSTENLOS
Eine Auswahl an Übungen, Tag 1 bis 3 des Wochentrainings, 3 kostenlose Antworten pro Monat vom KI-Coach und 3 Gesichtsscans. Kein Konto, keine Werbung. Deine Trainings werden auf deinem iPhone gespeichert.

PREMIUM
• Alle Übungen, für jeden Bereich des Gesichts, auch Mewing und Zungendruck
• Jeder Tag deines Wochentrainings
• Unbegrenzte Antworten vom KI-Coach. Vor deiner ersten Frage wirst du um Erlaubnis gebeten
• Unbegrenzte Gesichtsscans

SICHERHEIT
Beweg dich sanft und hör auf, wenn etwas wehtut. Wenn du Kieferschmerzen oder Probleme mit dem Kiefergelenk hast, lass dich vor Kieferübungen ärztlich oder zahnärztlich beraten. FaceRep ist eine Fitness- und Wellness-App und keine medizinische Beratung. Die Ergebnisse sind individuell verschieden.

ABONNEMENT
Premium gibt es wöchentlich, monatlich oder jährlich. Die Zahlung wird über deinen Apple Account abgerechnet. Das Abo verlängert sich automatisch, wenn es nicht mindestens 24 Stunden vor Ende des Zeitraums gekündigt wird. Verwalten kannst du es in den Account-Einstellungen des App Store.

Die Übungszeichnungen und die Porträts in der App sind KI-generiert und zeigen fiktive Personen.

Nutzungsbedingungen: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Datenschutzerklärung: https://facerep-api.elowa-app.workers.dev/privacy
```

---

## French
- **Name (30):** `FaceRep: Yoga visage, mâchoire`
- **Subtitle (27):** `Pommettes, lèvres et mewing`
- **Keywords (98):** `double,menton,exercices,joues,yeux,gym,faciale,jawline,massage,langue,posture,cou,homme,femme,face`
- **Promotional text (165):** Vois le muscle que tu travailles. Séances guidées pour mâchoire, pommettes, lèvres et yeux, avec voix ou bips, miroir caméra et scan du visage. Jours 1 à 3 gratuits.
- **Subscription description (50):** Chaque jour et exercice, Coach et scans illimités.

**Description**

```
FaceRep, c'est le fitness du visage pour les hommes et les femmes : des séances courtes et guidées pour ta mâchoire, tes pommettes, tes lèvres et le contour des yeux, plus des massages du visage. Quelques minutes par jour.

VOIS LE MUSCLE QUE TU TRAVAILLES
Chaque exercice montre le muscle sollicité en rouge, qui passe du relâchement à la contraction au rythme du minuteur. Choisis si les illustrations montrent un homme ou une femme.

SUIS LA SÉANCE SANS REGARDER
Le guidage vocal t'indique quand contracter, quand relâcher et ce qui vient ensuite. Tu préfères des bips ? Un bip pour contracter, un tic à chaque seconde de maintien et un bip plus grave pour relâcher. Entraîne-toi les yeux fermés ou les mains sur le visage : l'écran reste allumé pendant la séance.

VÉRIFIE TA TECHNIQUE DANS LE MIROIR
Active le miroir pour te voir à côté de l'illustration. L'image de la caméra s'affiche seulement en direct : elle n'est jamais enregistrée ni sauvegardée.

SCAN DU VISAGE
Environ 30 secondes, 6 mouvements guidés : lève les sourcils, plisse les yeux, souris, fais la moue, ouvre la bouche et gonfle les joues. Le suivi du visage de ton iPhone mesure jusqu'où ton visage bouge (Mouvement) et si les deux côtés bougent autant (Équilibre), par rapport à ton propre visage détendu. Refais un scan plus tard et suis tes chiffres dans un graphique. Il lit le mouvement, pas la forme du visage ni l'apparence, et ce n'est pas un test médical. Tout reste sur ton iPhone, y compris les photos de progrès facultatives. Fonctionne à partir de l'iPhone X.

UNE SÉANCE CHAQUE JOUR
• Concentre-toi sur une zone du visage ou fais un peu de tout
• Un nouveau mélange chaque jour, dans des semaines qui progressent en douceur : moins de répétitions le temps d'apprendre les mouvements, puis toutes les répétitions et des maintiens plus longs
• Chaque semaine se termine par une journée courte et douce
• Si tu sautes un jour, il t'attend

CONNAIS TON VISAGE
Touche une zone de la carte du visage, du front au cou, pour voir ses muscles et les exercices qui les font travailler. La plupart des exercices ont aussi une courte vidéo, faite à partir de l'illustration.

SUIS TES PROGRÈS
Séries, calendrier de tes séances par semaine, mois et année, et tes scans du visage dans un graphique.

RAPPELS ET COACH IA
• Rappels pour tes séances, ton mewing et ta posture, aux jours et heures de ton choix
• Pose tes questions de technique au Coach IA ou demande-lui une routine rapide, puis lance-la d'un toucher. Il peut aussi te proposer de modifier tes rappels : rien ne change tant que tu n'as pas confirmé

CE QUI EST GRATUIT
Une sélection d'exercices, les jours 1 à 3 des séances hebdomadaires, 3 réponses gratuites par mois du Coach IA et 3 scans du visage. Pas de compte, pas de pub. Tes séances sont enregistrées sur ton iPhone.

PREMIUM
• Tous les exercices, pour chaque zone du visage, y compris le mewing et la pression de la langue
• Toutes tes séances hebdomadaires
• Réponses illimitées du Coach IA. Ton accord t'est demandé avant ta première question
• Scans du visage illimités

SÉCURITÉ
Vas-y en douceur et arrête si quelque chose fait mal. Si tu as mal à la mâchoire ou un problème d'articulation de la mâchoire, demande l'avis d'un médecin ou d'un dentiste avant les exercices de la mâchoire. FaceRep est une app de fitness et de bien-être, pas un avis médical. Les résultats varient.

ABONNEMENT
Premium est disponible en abonnement hebdomadaire, mensuel ou annuel. Le paiement est débité sur ton compte Apple, et l'abonnement se renouvelle automatiquement, sauf s'il est annulé au moins 24 heures avant la fin de la période en cours. Gère-le dans les réglages de ton compte App Store.

Les illustrations des exercices et les portraits de l'app sont générés par IA et montrent des personnes fictives.

Conditions d’utilisation : https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Politique de confidentialité : https://facerep-api.elowa-app.workers.dev/privacy
```

---

## Italian
- **Name (22):** `FaceRep: Yoga Facciale`
- **Subtitle (26):** `Esercizi Mascella e Mewing`
- **Keywords (97):** `viso,doppio,mento,zigomi,guance,labbra,occhi,jawline,ginnastica,massaggio,postura,uomo,donna,face`
- **Promotional text (161):** Vedi il muscolo che alleni. Allenamenti viso guidati per mascella, zigomi, labbra e occhi, con voce o bip, specchio e scansione del viso. Giorni da 1 a 3 gratis.
- **Subscription description (55):** Ogni giorno ed esercizio, Coach e scansioni illimitati.

**Description**

```
FaceRep è il fitness facciale per uomini e donne: allenamenti brevi e guidati per mascella, zigomi, labbra e zona occhi, più il massaggio viso. Pochi minuti al giorno.

VEDI IL MUSCOLO CHE ALLENI
Ogni esercizio mostra in rosso il muscolo che lavora, che passa da rilassato a contratto a tempo con il timer. Scegli se le immagini mostrano un uomo o una donna.

SEGUI SENZA GUARDARE
Le indicazioni vocali ti dicono quando contrarre, quando rilassarti e cosa viene dopo. Preferisci i bip? Un bip per contrarre, un tic per ogni secondo di tenuta e un bip più grave per rilassarti. Allenati a occhi chiusi o con le mani sul viso: lo schermo resta acceso mentre ti alleni.

CONTROLLA L'ESECUZIONE ALLO SPECCHIO
Attiva lo specchio per vederti accanto al disegno. L'immagine della fotocamera viene solo mostrata dal vivo: non viene mai registrata né salvata.

SCANSIONE DEL VISO
Circa 30 secondi, 6 movimenti guidati: alza le sopracciglia, stringi gli occhi, sorridi, arriccia le labbra, apri la bocca e gonfia le guance. Il tracciamento del viso del tuo iPhone misura quanto si muove il tuo viso (Movimento) e se i due lati si muovono allo stesso modo (Equilibrio), rispetto al tuo viso rilassato. Ripeti la scansione più avanti e segui i tuoi numeri in un grafico. Legge il movimento, non la forma del viso né l'aspetto, e non è un test medico. Tutto resta sul tuo iPhone, comprese le foto dei progressi facoltative. Funziona da iPhone X in poi.

UN ALLENAMENTO OGNI GIORNO
• Concentrati su una zona del viso o fai un po' di tutto
• Un mix nuovo ogni giorno, in settimane che crescono con gradualità: meno ripetizioni mentre impari i movimenti, poi ripetizioni complete e tenute più lunghe
• Ogni settimana finisce con una giornata breve e leggera
• Se salti un giorno, ti aspetta

CONOSCI IL TUO VISO
Tocca una zona della mappa del viso, dalla fronte al collo, per vedere i suoi muscoli e gli esercizi che li allenano. La maggior parte degli esercizi ha anche un breve video, ricavato dal disegno.

SEGUI I TUOI PROGRESSI
Serie, un calendario settimanale, mensile e annuale dei tuoi allenamenti e le tue scansioni del viso in un grafico.

PROMEMORIA E COACH IA
• Promemoria per allenamenti, controlli del mewing e pause per la postura, nei giorni e agli orari che scegli tu
• Chiedi al Coach IA consigli sulla tecnica o una routine veloce e avviala con un tocco. Può anche proporti modifiche ai promemoria: non cambia nulla finché non confermi

COSA È GRATIS
Una selezione di esercizi, i giorni da 1 a 3 degli allenamenti settimanali, 3 risposte gratuite al mese del Coach IA e 3 scansioni del viso. Nessun account, nessuna pubblicità. I tuoi allenamenti vengono salvati sul tuo iPhone.

PREMIUM
• Tutti gli esercizi, per ogni zona del viso, compresi il mewing e la pressione della lingua
• Tutti i giorni dei tuoi allenamenti settimanali
• Risposte illimitate del Coach IA. Ti chiediamo il permesso prima della tua prima domanda
• Scansioni del viso illimitate

SICUREZZA
Muoviti con delicatezza e fermati se senti dolore. Se hai dolore alla mascella o un problema all'articolazione temporo-mandibolare, chiedi a un medico o a un dentista prima di fare gli esercizi per la mascella. FaceRep è un'app di fitness e benessere e non fornisce consigli medici. I risultati variano.

ABBONAMENTO
Premium è disponibile con abbonamento settimanale, mensile o annuale. Il pagamento viene addebitato sul tuo Account Apple e l'abbonamento si rinnova automaticamente a meno che non venga annullato almeno 24 ore prima della fine del periodo in corso. Puoi gestirlo nelle impostazioni del tuo account App Store.

I disegni degli esercizi e i ritratti nell'app sono generati con l'IA e mostrano persone di fantasia.

Termini d’uso: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Informativa sulla privacy: https://facerep-api.elowa-app.workers.dev/privacy
```
