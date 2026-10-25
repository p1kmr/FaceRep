# The scan and the build

## 1. The flow
```
Photo (camera or system photo picker)          Code (EU DataMatrix, Medikationsplan, Japan QR)
        │                                                  │
        ▼                                                  ▼
Text read on the iPhone (Apple Vision)          Decoded by expo-camera's barcode scanner
        │                                                  │
        ▼                                                  │
Field finder: rules per language,                         │
plus Apple's on-device model where available               │
        └──────────────────────┬───────────────────────────┘
                               ▼
Check screen: the photo with highlights, every field editable
(name, strength, form, how many, when, how long, label notes, pills in the pack, expiry)
                               ▼  the person confirms and picks the times
Save → SQLite → Time Sensitive reminders → Today screen and widget
```
Nothing leaves the iPhone at any step. The photo is dropped after reading unless the person chooses to keep it.

## 2. Reading the text (on the iPhone)

| Option | iOS | Notes |
|---|---|---|
| Vision `VNRecognizeTextRequest` / `RecognizeTextRequest` | 13+ / 18+ | Accurate mode, language hints, a confidence and a box per line (for the highlights). Covers the six FaceRep languages plus Japanese and Korean; check `supportedRecognitionLanguages()` at runtime |
| Vision `RecognizeDocumentsRequest` | 26+ | Reads documents as structure (paragraphs, tables, lists); made for receipts and nutrition labels; 26 languages |
| VisionKit `DataScannerViewController` | 16+ | Live text in the camera view; "point at the box" |
| `@zhanziyang/expo-text-extractor` (community) | | Vision on iOS, Google ML Kit on Android; fine for a first prototype |

Long term, a small Swift Expo module like FaceRep's `modules/face-tracking` is better: Apple's frameworks only, no Google
ML Kit, no unknown maintainer. **Never** upload the photo or use cloud text reading in version 1 (5.1.2(i), GDPR
Article 9, and the privacy promise).

## 3. Finding the fields
- **Rules first** (same result on every iPhone, easy to test). Patterns per language:
  - strength and form: "500 mg", "5 mg/ml", tablet, capsule, Tablette, comprimé, compressa, comprimido;
  - English directions: "take 1 tablet by mouth twice daily", "every 8 hours", "at bedtime", and BID, TID, QID, QD,
    QHS, PRN;
  - German "1-0-1" and "1-0-0-1" (morning, noon, evening, night), "morgens", "abends", "täglich";
  - French "2 fois par jour", "matin et soir"; Spanish "cada 8 horas", "dos veces al día"; Italian "due volte al giorno";
    Portuguese "de 8 em 8 horas", "2 vezes ao dia";
  - India: "1-0-1", BD, TDS, OD, HS, and before or after food.
- **Apple Foundation Models** (iOS 26, Apple Intelligence iPhones only): guided generation (a `@Generable` struct) to pull
  fields out of messy text. Free, offline, private. It only suggests (apple-rules.md §6).
- **A drug-name list** to fix misreadings ("Metformln" → "Metformin"), shipped inside the app (looking names up online
  would tell a server what the person takes). Public sources per country, license to check for each: US RxNorm (NLM;
  the API needs no license and allows 20 requests a second, bulk files need a free UMLS license), UK dm+d (NHSBSA),
  France BDPM, Spain CIMA (AEMPS), Italy AIFA open data.
- **Measure, don't guess:** the label test set (README §4) decides how much of this is needed.

## 4. Codes that hold structured data

| Code | Where | What's in it | Use |
|---|---|---|---|
| EU pack DataMatrix (Falsified Medicines Directive) | Every prescription pack in the EU since 9 February 2019 | Product code (a GTIN; in Germany a PPN that contains the PZN), serial, batch, **expiry** | Expiry reminders; the product name from a national list; no dosage |
| German Medikationsplan (BMP) barcode | Printed plan; patients on 3+ systemic medicines for 28+ days have a right to one (§31a SGB V); also electronic now | The whole plan: medicines, strength, morning-noon-evening-night | **One scan, full schedule** (mediteo does it). Get the format spec (KBV) and check its terms |
| Japan e-okusuri techo QR (JAHIS format) | Printed by pharmacies on dispensing slips | Dispensing data: medicines, doses, days | Import like Japan's お薬手帳 apps; public spec; needs Japanese |
| US pharmacy label | No standard code for the directions; USP <17> recommends a patient-centered layout | | Read the text |
| UK dispensing label | NHS pharmacies print directions like "Take ONE tablet TWICE a day" | | Read the text (a good fit) |

FaceRep already uses expo-camera, whose barcode scanner reads DataMatrix and QR codes.

## 5. The reminder engine
- **Start from FaceRep's** `services/reminders` (a pure model) and `services/notifications/reminder.ts` (repeating daily
  and weekly local notifications, at most 60 scheduled).
- **New:** schedules per medicine (every N hours or days, cycles, end dates) produce the next doses in a rolling window
  (for example 7 days, never more than 60 notifications) that is refreshed on every open and by background refresh; one
  notification per time ("8:00, 3 medicines"); Taken / Snooze / Skip through `setNotificationCategoryAsync`; a follow-up
  that is cancelled when Taken is tapped; `interruptionLevel: 'timeSensitive'` plus the entitlement.
- **Test on a real iPhone:** marking Taken from the notification without opening the app, Focus modes, Apple Watch,
  after a restart, a time zone change, daylight saving.
- **Dose log** in SQLite (only added to, never rewritten); the history view shows facts without judgment.

## 6. What to reuse from FaceRep (same architecture)

| FaceRep | In the medicine app |
|---|---|
| Expo SDK 57, Expo Router, strict TypeScript, the state / hooks / services split (docs/architecture.md) | The same |
| `services/db` (SQLite and migrations) | Medicines, schedules, dose log |
| `services/reminders`, `services/notifications` | The base of the engine (§5) |
| `modules/face-tracking` (a Swift Expo module) | The pattern for the Vision, Foundation Models and HealthKit module |
| `services/purchases` (RevenueCat) | Or StoreKit 2 directly, for "Data Not Collected" (README §3.3) |
| The i18n pipeline (six languages, `i18n:check`) | The same languages fit the first countries |
| `scripts/review-check.js` | A new word list: cure, treat, prevent, "never miss", "clinically proven", "doctor approved", dose advice |
| store-screenshots with a stand-in camera in the Simulator | The sample label for screenshots and App Review |
| The theme system and `brand/logo.mjs` approach | A new brand |

## 7. Data and storage
- SQLite on the iPhone. No account and no server in version 1.
- Photos: not kept by default. If the person keeps one (to recognize the box later): Application Support, excluded
  from backups (FaceRep's face-scan pattern).
- No CloudKit and no iCloud Drive (5.1.3(ii)). Moving to a new iPhone: the device backup (open question with Apple,
  apple-rules.md §2) plus an export file the person controls.

## Sources
- [RecognizeDocumentsRequest](https://developer.apple.com/documentation/vision/recognizedocumentsrequest),
  [VNRecognizeTextRequest recognitionLanguages](https://developer.apple.com/documentation/vision/vnrecognizetextrequest/recognitionlanguages),
  [@zhanziyang/expo-text-extractor](https://www.jsdelivr.com/package/npm/@zhanziyang/expo-text-extractor)
- [Foundation Models overview (Cult of Mac)](https://www.cultofmac.com/news/apple-foundation-models-framework),
  [guided generation guide](https://www.atelier-socle.com/en/articles/foundation-models-api-guide)
- [RxNav terms of service](https://lhncbc.nlm.nih.gov/RxNav/TermsofService.html),
  [RxNav FAQ (license)](https://lhncbc.nlm.nih.gov/RxNav/information/FAQs.html)
- [EU FMD and the DataMatrix (GS1 recommendations)](https://www.gs1.org/sites/default/files/docs/healthcare/position-papers/final_recommendations_harmonised_implementation_fmd_using_gs1_dec2016.pdf),
  [FMD guide](https://intuitionlabs.ai/articles/pharma-serialization-fmd-guide)
- [KBV: Medikationsplan](https://www.kbv.de/html/medikationsplan.php),
  [DAV FAQ: the plan's 2D barcode](https://www.ABDA.de/fileadmin/user_upload/assets/Medikationsmanagement/DAV_FAQ_BMP_20160629.pdf),
  [mediteo: what is the BMP](https://www.mediteo.com/en/faq/what-is-the-bundeseinheitliche-medikationsplan-bmp)
- [MHLW material on electronic medication notebooks](https://www.mhlw.go.jp/content/001199646.pdf),
  [Yakuji Nippo on the JAHIS QR format](https://www.yakuji.co.jp/entry26074.html)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
