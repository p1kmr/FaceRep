# Medicine reminder app: first research

Research for a **new app idea, not FaceRep** (checked 2026-10-25): people photograph a medicine box or pharmacy label,
the iPhone reads the text, the person checks it, and the app sets up dose reminders. Not legal advice. Move this folder
into the new app's repository once it exists.

| File | What's in it |
|---|---|
| [market.md](market.md) | Competitors with real App Store numbers, what users complain about, where the gap is |
| [apple-rules.md](apple-rules.md) | The App Review guidelines and App Store Connect steps this idea touches |
| [laws-and-safety.md](laws-and-safety.md) | Medical-device rules (US, EU, UK), health-data privacy laws, safety rules for the design |
| [scan-tech.md](scan-tech.md) | How the scan should work, label formats per country, the Expo build plan, what to reuse from FaceRep |
| [react-native.md](react-native.md) | Building it in React Native (Expo SDK 58): a package for each feature, what to test first, Android later |
| [keywords-countries.md](keywords-countries.md) | Keywords per language from App Store autocomplete, country ranking, launch order |

## 1. The short answer

- **It can pass App Review if it stays a reminder the person sets up.** The scan only fills in a form; the person checks
  every field and taps Save. The app never works out a dose, never checks interactions and never says what to do about
  a missed dose. That keeps it clear of guideline 1.4.2 (dosage calculators only from a manufacturer, hospital, pharmacy
  or with regulator approval) and inside the US FDA's own low-risk example: software that keeps "track of medications
  and provide[s] user-configured reminders".
- **"Scan the label, get reminders" is no longer new.** At least nine apps launched it in 2025–26 (SnapRx, MedSnap,
  DoseAlert, Pilly, RxScan, Medication Reminder+, Cadence, MedLedger, Pillar), and Apple's Health app does it for free
  in the US. Guideline 4.3(b) rejects apps "indistinguishable from what's already widely available", and people won't
  switch for a scan alone. The scan gets people in; it can't be the only reason the app exists.
- **The category is crowded and owned by old apps.** Medisafe has about 101,500 US ratings. In all 14 countries checked,
  a third to a half of the medication apps in search results came out in 2025–26, and together they hold under 2% of
  the ratings. The newcomers that grew have warmth and a character: Pill Buddy (a mascot that reacts to missed doses,
  about 1,950 US ratings since May 2025) and Max (a dog, strong in Japan and Korea).
- **There are real openings:**
  - Apple Health's camera scan and interaction check work **only in the US**. Everywhere else people type.
  - Medisafe, the leader, became **paid-only outside the US on 1 January 2026** ($4.99 a month or $39.99 a year). Its
    users' loudest complaint is paying "just to keep my reminders working", and "free" shows up in many autocomplete
    suggestions.
  - The big apps show ads or collect data (MyTherapy's privacy label: "Data Used to Track You"; Medisafe lists data for
    third-party advertising and health data for analytics). An app with no account, no ads, no analytics and photos
    that never leave the iPhone can show that on its store page.
  - Codes that add a whole plan or pack in one scan: Germany's Medikationsplan barcode, the EU DataMatrix on every
    prescription pack (product, batch, **expiry**), Japan's pharmacy QR codes.
- **Two account-level questions come first** (§3): this Apple account doesn't sell in the 27 EU countries yet (trader
  status, docs/publish-todo.md §0), and guideline 5.1.1(ix) prefers healthcare apps from a legal entity.

## 2. Recommended direction (to test, not final)

**Who it's for first:** people who take three or more medicines a day, and the family member who helps them.

**The promise (honest, no health claims):** add a medicine in seconds (snap the box, check, done) and get reminders
that stay on your iPhone.

**Version 1:**
1. **Add** by camera, photo or typing. Text is read on the iPhone (Apple Vision). A check screen shows every field next
   to the photo, marks the unsure ones, and nothing is saved until the person taps Save. Times are the person's choice
   ("twice a day" offers 08:00 and 20:00, editable). Barcodes: the EU pack DataMatrix and the German Medikationsplan.
2. **Reminders that get through:** Time Sensitive notifications with Taken / Snooze / Skip, a follow-up when nothing is
   marked, a dose log, as-needed medicines without reminders. Schedules: daily, chosen weekdays, every N days, every N
   hours, cycles (21 on / 7 off), start and end dates, half tablets.
3. **Supply and expiry:** pills left (counted from the schedule) with a refill nudge; the expiry date typed or read from
   the DataMatrix.
4. **Easy to read:** large text (Dynamic Type), VoiceOver, one big "Taken" button, a widget with the next dose.
5. **A list for the doctor or pharmacist:** a PDF the person shares themselves.
6. **Private by design:** no account, no ads, no analytics, the photo is not kept.

**Not in version 1, on purpose:** interaction or side-effect checks, any dose or missed-dose advice, cloud AI, a remote
caregiver link (needs a server and accounts), identifying a pill from a photo, children's doses.

**Money (to test):** everything needed to take medicines safely stays free, with no limit on medicines. Never put a
reminder behind a paywall: that's Medisafe's most hated change, and a safety problem. Premium: family profiles, PDF
reports and history, refill and expiry tracking, alarm mode, themes and sounds. Offer a one-time lifetime price next to
yearly (MyTherapy sells lifetime for $49.99; older users often dislike subscriptions, which the interviews should check).

## 3. Decisions for the owner
1. **EU sales.** Declaring trader status (DSA) puts an address, phone and email on EU store pages, and it's
   account-wide (shared with FaceRep and Elowa). Without it: no Germany, France, Italy, Spain or Netherlands. Either
   launch outside the EU first (keywords-countries.md §4), or decide this before building the German features.
2. **Developer account type.** Guideline 5.1.1(ix): apps in healthcare "should be submitted by a legal entity that
   provides the services, and not by an individual developer". Individuals do publish plain reminder apps (Pill Buddy,
   Pill Reminder – All in One), so it isn't always applied, but it can be. An organization account (a company with a
   D-U-N-S number; Apple enrolls sole proprietors as individuals) removes the risk and is needed anyway for pharmacy or
   clinic features later.
3. **Purchases: RevenueCat or StoreKit only.** With RevenueCat the privacy label must list Purchase History. Apple's own
   StoreKit 2 alone (no third party) allows "Data Not Collected", a strong point against Medisafe and MyTherapy.
4. **A new brand** (name, logo, trademark search as in docs/launch.md §8), not a FaceRep spin-off. Eight characters or
   fewer fits the store name in every language (keywords-countries.md §3).
5. **Minimum iOS.** iOS 18 keeps older iPhones in. The best parts (on-device AI reading, importing from Health, alarms,
   document reading) need iOS 26 and switch on only there.

## 4. What to research next (in this order)
1. **Real labels.** Collect 50–100 photos per launch country (own and family medicines, volunteers; cover the names) and
   measure how often Vision reads the name, strength and directions correctly. That decides whether the on-device AI
   step is needed. Include curved bottles, glare, small print, German boxes without a dosage label, Indian strips.
2. **10–15 interviews:** five people on 3+ medicines, five family helpers, two or three pharmacists. Ask how they add
   medicines today, what they missed last month, what a reminder must do to be trusted, what they'd pay, and whether a
   subscription or a one-time price feels fair.
3. **Low-star reviews** of Medisafe, MyTherapy, Pill Reminder – All in One, Max, Pill Buddy and two scan apps, read on the
   store pages (Apple's public reviews feed now returns nothing). First findings: market.md §4.
4. **Keyword popularity** for the lists in keywords-countries.md: Apple Ads shows a popularity score per keyword, or use
   a trial of Astro, Appfigures or AppTweak.
5. **Ask Apple early:** request the Critical Alerts entitlement (often refused for reminders, apple-rules.md §4), and
   book an App Review consultation ("Meet with Apple") about 5.1.1(ix) and iCloud (apple-rules.md §2).
6. **One-hour consult** with a medical-device regulatory adviser about the intended-purpose wording (EU MDR, UK MHRA),
   and a privacy lawyer before anything ever leaves the iPhone.
7. **Watch Apple Health.** The redesigned Health app is in the iOS 27.2 beta and ships "later this year"; no medication
   changes are reported yet. If label scanning leaves the US, the gap shrinks. Also check what iOS 27 changed in
   HealthKit, AlarmKit, Vision and Foundation Models: this research covers iOS 26 APIs.

## How the numbers were gathered (2026-10-25)
- **Competitors and ratings:** Apple's iTunes Search and Lookup API, 42 searches in 14 countries in each country's
  language. Ratings are per country. The API's order is close to App Store search, not identical.
- **Keywords:** App Store search autocomplete (`search.itunes.apple.com/WebObjects/MZSearchHints.woa`) per storefront,
  in the order Apple returned them (roughly most popular first). No search volumes.
- **iPhone share:** StatCounter mobile OS share, September 2026. **Age:** World Bank, population 65 and over, 2025.
