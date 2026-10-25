# Keywords and countries

## 1. How App Store search reads the metadata
- Per language: **name** (30 characters), **subtitle** (30), **keyword field** (100, comma-separated, no spaces). Apple
  combines words from all three ("pill" in the name plus "tracker" in the subtitle matches "pill tracker"), so never
  repeat a word. Include both singular and plural for the most important words in languages where they differ.
- **Never** in metadata (2.3.7): other apps' names, drug brand names (Wegovy, Ozempic), "NHS", pricing words ("free",
  "gratis", "kostenlos", "gratuit"; people search them a lot, but that's pricing information), "#1", "best".
- **Each storefront also searches other languages' metadata** (Apple's storefront table):

| Storefront | Searches |
|---|---|
| United States | English (U.S.), **Spanish (Mexico)**, plus Arabic, Chinese, French, Korean, Portuguese (Brazil), Russian, Vietnamese |
| UK | English (U.K.) |
| Canada | English (Canada), French (Canada) |
| Australia | English (Australia), English (U.K.) |
| India | English (U.K.), Hindi and 10 more Indian languages |
| Germany, France, Italy, Spain, Netherlands, Mexico, Brazil, South Korea | Their language plus **English (U.K.)** |
| Japan | Japanese, English (U.S.) |

  So English (U.K.) metadata is searched in a dozen countries: use it for different English words than English (U.S.).
  Spanish (Mexico) is searched in the US: fill it with real Spanish keywords for Spanish-speaking Americans.

## 2. What people type (App Store autocomplete, 2026-10-25)
In the order Apple suggested them (roughly most popular first). No volumes: check popularity in Apple Ads before
committing (README §4).

| Store | Main searches | Also seen |
|---|---|---|
| US | pill reminder, pill tracker, medication reminder, medication tracker, medicine reminder, medicine tracker, med reminder, pill alarm | medication list, medication log, medication timer; prescription scanner, pill scanner, medicine scanner; niches: pet medication, adhd medication tracker, birth control pill tracker, GLP-1, peptide tracker |
| UK | pill reminder, medication reminder, medicine reminder, **tablet reminder, tablet tracker**, med reminder, pill tracker | pill organiser, medication alarm, hrt medication tracker, contraceptive pill tracker |
| Canada, Australia | as US; pill reminder, medication tracker, medicine reminder, med reminder | medication list (AU), meds tracker (CA) |
| India | medicine reminder, pill reminder, tablet reminder, medicine alarm | prescription reader, "prescription reader ai"; dose calculator (not allowed, 1.4.2) |
| Germany | **Tabletten Erinnerung**, Medikamenten-Erinnerung, Medikamentenplan, Medikationsplan, Medikamente Erinnerung, Pillen Erinnerung | Tabletten Plan, Tabletten Tracker, Pillenwecker, Pillenalarm, Medikamenten Tagebuch |
| France | **rappel médicament**, pilulier, suivi médicaments, alarme médicaments | rappel pilule (contraception), ordonnance, suivi traitement |
| Spain, Mexico | **recordatorio medicamentos**, recordatorio pastillas, pastillero | control de pastillas, toma de pastillas, alarma para medicamentos |
| Italy | **promemoria farmaci**, promemoria pillole, promemoria medicine | ricorda pillole, app per pillole |
| Brazil | **lembrete de remédios**, lembrete medicamentos, meu remédio | remédios horário, lembrete remédio pet |
| Netherlands | herinneringen voor medicijnen, medicijnen wekker, mijn medicijnen | medicatie herinnering, pillen herinnering |
| Japan | **お薬手帳** (e-medication notebook), 服薬管理アプリ, 薬 飲み忘れ防止, お薬アラーム, 服薬リマインダー, 服薬記録 | 服薬カレンダー, 服薬通知 |
| South Korea | **약 알림**, 복약관리, 복약알림 | 영양제 알림 (supplements) |

**Easier long-tail words to start with:** medicine/pill/prescription scanner (few apps), tablet reminder (UK),
medication list, medication log, refill; Medikationsplan (DE, only two suggestions), pilulier (FR), pastillero
(ES/MX). The head terms (pill reminder, medication reminder) are held by apps with thousands of ratings.

## 3. First draft of the metadata
`<Brand>` is a placeholder. Every draft fits the limits; check the brand length.

| Locale | Name | Subtitle | Keywords |
|---|---|---|---|
| English (U.S.) | `<Brand>: Pill Reminder` | `Medication Tracker & Scanner` | `medicine,med,dose,alarm,refill,log,tablet,label,prescription,schedule,caregiver,vitamin,daily,list` |
| English (U.K.) | `<Brand>: Medicine Reminder` | `Tablet Tracker & Pill Alarm` | `medication,med,dose,refill,log,scan,label,prescription,organiser,schedule,carer,daily,list,vitamin` |
| Spanish (Mexico) | `<Brand>: Pastillero` | `Recordatorio de medicamentos` | `pastillas,alarma,medicinas,toma,dosis,control,receta,tratamiento,horario,recordar,pastilla,diario` |
| German | `<Brand>: Tabletten-Erinnerung` | `Medikamentenplan & Scanner` | `medikamente,pillen,wecker,alarm,medikationsplan,arznei,einnahme,tracker,tagebuch,dosis,rezept` |
| French | `<Brand> : Rappel Médicament` | `Pilulier & suivi de traitement` | `médicaments,alarme,comprimé,ordonnance,dose,oubli,prise,rappels,pilule,santé,horaire,stock` |
| Italian | `<Brand>: Promemoria Farmaci` | `Pillole, dosi e scorte` | `medicine,allarme,terapia,compresse,ricetta,orari,pillola,medicinali,assunzione,sveglia,diario` |
| Portuguese (Brazil) | `<Brand>: Lembrete de Remédio` | `Seus remédios em dia` | `medicamentos,alarme,horário,comprimidos,receita,dose,controle,pílula,tratamento,agenda,vitaminas` |

Room left for the brand in the name: 15 characters (U.S.), 11 (U.K.), 18 (Spanish), 8 (German), 10 (French and
Italian), 9 (Portuguese). **A brand of 8 characters or fewer fits every language.**

Category: **Medical** (primary). Screenshots: the scan and the check screen first (the difference), then Today, the
reminder on the Lock Screen and the privacy line. Generic medicine names only (metformin, not a brand), and the in-app
sample label rather than real patient labels.

## 4. Countries
"Ratings" = Medisafe and MyTherapy ratings in that country, a rough sign of how many people use reminder apps there.
iPhone share: StatCounter, September 2026. 65+: World Bank, 2025.

| Country | iPhone share | Aged 65+ | Medisafe / MyTherapy ratings | Apple Health scan | Sold today | Language ready | Scan fit | Tier |
|---|---|---|---|---|---|---|---|---|
| United Kingdom | 46.9% | 19.7% | 13,465 / 3,216 | No | Yes | English | Dispensing labels | **1** |
| Canada | 64.9% | 20.3% | 12,348 / 2,031 | No | Yes | English (French later) | Pharmacy labels | **1** |
| Australia | 62.6% | 18.1% | 6,911 / 641 | No | Yes | English | Dispensing labels | **1** |
| United States | 53.6% | 18.4% | 101,510 / 8,571 | **Yes, free** | Yes | English (+ Spanish) | Pharmacy labels | **1** (biggest, hardest) |
| Mexico | 28.0% | 8.5% | 15,624 / 3,346 | No | Yes | Spanish | Boxes | **1** (Medisafe users now pay) |
| Brazil | 21.2% | 11.5% | 16,194 / 6,541 | No | Yes | Portuguese | Boxes | **1** (same reason) |
| Germany | 27.6% | 23.7% | 3,675 / 15,423 (+ mediteo 20,333) | No | **No (EU)** | German | **Medikationsplan**, DataMatrix | 2 |
| Italy | 36.5% | 25.1% | 4,685 / 4,883 | No | No (EU) | Italian | DataMatrix | 2 |
| France | 34.6% | 22.5% | 4,902 / 4,042 | No | No (EU) | French | DataMatrix | 2 |
| Spain | 26.8% | 21.6% | 2,978 / 2,182 | No | No (EU) | Spanish | DataMatrix | 2 |
| Japan | 60.5% | 30.0% | not sold / 4,394 (+ pharmacy お薬手帳 apps) | No | Yes | Japanese needed | **JAHIS QR** | Later |
| South Korea | 37.8% | 20.3% | 859 / not sold (Max 4,037) | No | Yes | Korean needed | | Later |
| Netherlands | 31.8% | 20.9% | 3,211 / 2,366 | No | No (EU) | Dutch needed | DataMatrix | Later |
| India | 6.1% | 7.4% | 2,933 / 524 | No | Yes | English | Strips, handwritten prescriptions | Later |

**Recommended order:**
1. **Launch** everywhere the account already sells, in the six languages, but put the store-page work, keywords and any
   marketing into **UK, Canada, Australia** (many iPhones, no built-in scan, Medisafe now paid, English labels) and
   **Mexico, Brazil** (big Medisafe user bases that now have to pay, languages ready, lower prices). The US comes with
   English, but Apple Health's free scan makes it the hardest market to win.
2. **EU** once trader status is decided: **Germany first** (oldest population after Italy and Japan, people who care
   about privacy, and the Medikationsplan scan that few apps offer; mediteo does), then Italy (weak competition),
   France, Spain.
3. **Later:** Japan (many iPhones, the oldest population; needs Japanese and the JAHIS QR import, against strong
   pharmacy apps), South Korea, the Netherlands, India (few iPhones; handwritten prescriptions are hard to read and
   risky to guess).

Caveats: the ratings show where the incumbents grew, not the size of the market; the iPhone share is web traffic, not
phones owned.

## Sources
- App Store autocomplete (`search.itunes.apple.com/WebObjects/MZSearchHints.woa`) and the iTunes Search API, 2026-10-25.
- [App Store localizations (storefront table)](https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations/)
- [App Review Guidelines 2.3.7](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata)
- StatCounter, mobile OS share, September 2026: [US](https://gs.statcounter.com/os-market-share/mobile/united-states-of-america),
  [UK](https://gs.statcounter.com/os-market-share/mobile/united-kingdom), [Canada](https://gs.statcounter.com/os-market-share/mobile/canada),
  [Australia](https://gs.statcounter.com/os-market-share/mobile/australia), [Germany](https://gs.statcounter.com/os-market-share/mobile/germany),
  [France](https://gs.statcounter.com/os-market-share/mobile/france), [Italy](https://gs.statcounter.com/os-market-share/mobile/italy),
  [Spain](https://gs.statcounter.com/os-market-share/mobile/spain), [Mexico](https://gs.statcounter.com/os-market-share/mobile/mexico),
  [Brazil](https://gs.statcounter.com/os-market-share/mobile/brazil), [Japan](https://gs.statcounter.com/os-market-share/mobile/japan),
  [South Korea](https://gs.statcounter.com/os-market-share/mobile/south-korea), [Netherlands](https://gs.statcounter.com/os-market-share/mobile/netherlands),
  [India](https://gs.statcounter.com/os-market-share/mobile/india)
- World Bank, population ages 65 and above (% of total), indicator SP.POP.65UP.TO.ZS, 2025.
