# App Review: the rules for every change

Apple's [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (the numbers below), last
updated by Apple on **October 16, 2026**, checked against FaceRep on 2026-10-18. Not legal advice.

**How to use it.**
- Before adding or changing a feature, a text, a translation, a screenshot or store text, go through every area in §1
  that the change touches, then run `npm test` in `app/` (it includes the automatic check, §2).
- If a request breaks a rule, say so with the guideline number and propose the allowed way. Don't just do it.
- When Apple changes the date at the bottom of the guidelines page, read what changed and update this file.

## 1. If you change… check…

**Words: app text, notifications, Coach starter questions, store text, screenshots, web pages** (1.4.1, 2.3.1, 2.3.7, 2.3.8, 2.3.10)
- No result promises. Say what an exercise *works* ("works the muscles around your cheeks"), never what it will do to
  the face. Banned: sharper, slimmer, younger, fuller lips, "lose your double chin", reshape, face lift, anti-aging,
  "see results", timelines ("in 2 weeks"), before/after.
- The honest line stays: exercises can tone muscles and improve posture; they can't change bone structure; results vary.
- No medical claims: nothing cures, heals, relieves or treats a condition (TMJ, headaches, sleep apnea, eye strain).
  Keep the jaw caution and "ask a doctor or dentist".
- Starter questions and examples are app text too: no question that assumes a result ("How long until I see results?").
- Numbers must be true. Limits come from `constants/limits.ts` and match the Worker. Never "#1", "best", "clinically
  proven", "guaranteed".
- "Unlimited" only when no normal use can reach a limit. Premium Coach answers are unlimited: the Worker's daily
  ceiling (`LIMITS`, 100 a day per person) only stops abuse, the Terms explain fair use, and the number never appears
  in the app or store text. Don't lower it below 100 while the app says "unlimited".
- No other platforms (Android, Google Play) and no other app names, in the app or metadata (2.3.10, 4.1).
- No "for kids" / "for children" (2.3.8; FaceRep is rated 13+).
- A translation is never stronger than the English.

**Paywall and anything sold** (3.1.1, 3.1.2, 2.3.2, Schedule 2 of the Apple Developer Program License Agreement)
- Digital features unlock only with Apple in-app purchase (RevenueCat). No buttons or links to pay elsewhere, no
  unlock codes or QR codes, and no "cheaper on our website".
- Before the buy button the paywall shows: plan name, length, billed price (the biggest price on the screen), trial
  length and what is charged after it, the auto-renew sentence, Restore, Terms (Apple's EULA), Privacy and a close
  button. `PaywallView` has all of them. Never remove one.
- Say exactly what Premium gives. A limit people can really reach must be stated; a fair-use ceiling nobody reaches
  goes in the Terms only.
- Weekly shows only its billed price. "Save X%" compares yearly with monthly, never with weekly.
- "Free trial" means only the App Store's subscription trial. Days 1 to 3 are "free", never a "trial".
- A new paid feature means:
  - list it under PREMIUM in docs/store-listing.md;
  - describe it in the review notes, with steps to reach it;
  - label any screenshot that shows it as Premium (2.3.2).
- Subscriptions last at least 7 days and keep adding value (3.1.2(a)). Nothing a person paid for expires early.
- Don't reward ratings or reviews, and don't make people rate the app to use it (3.2.2(x)). Ask for a rating only
  with `requestReview()` in `services/review.ts` (5.6.1).

**Data that leaves the iPhone** (5.1.1, 5.1.2, 5.1.3)
- If you send a new field to the Worker, add an endpoint, or add a third party (AI model, SDK, API), update all of these
  in the same change:
  - the AI consent screen, when the data goes with Coach questions (5.1.2(i): explicit permission for third-party AI);
  - the privacy policy in `worker/src/pages.js` (data table, service providers), then deploy the Worker;
  - the App Privacy labels in App Store Connect and `privacyManifests` in `app.json`;
  - the review notes.
- Send only what the feature needs (5.1.1(iii)). Anything that needs consent can be turned off in Settings (5.1.1(ii)).
- Paid features don't depend on sharing data: Premium exercises work without AI consent (5.1.1(ii)).
- Never: ads, analytics, tracking SDKs, the tracking prompt (ATT), selling data. Never send camera frames or photos
  (2.5.14, 5.1.2(vi)). The face scan's progress photos are taken only after a yes, stay in the app on the iPhone and are
  excluded from backups (docs/face-scan.md).
- Health and fitness data is never used for ads or marketing and never stored in iCloud (5.1.3). HealthKit would need
  real Health app integration, its own purpose strings and new labels (2.5.1).

**Permissions: camera, microphone, photos, location, contacts, Health, notifications** (5.1.1(ii)/(iv), 2.5.14, 4.5.4, 5.1.2(i))
- Ask when the person starts the feature, never at launch. The purpose string says exactly why, in all six
  languages (`app/locales-native/*.json` and the plugin text in `app.json`).
- "Don't Allow" leaves the app usable. After that, offer the Settings app once. Never nag, never block the app.
- Never require notifications, location or tracking to use the app or to get something (5.1.2(i)).
- Recording anything (camera, microphone, screen) needs consent and a visible sign that it is on (2.5.14). The mirror
  is a live preview only.
- Face tracking (ARKit: the mirror's move check, docs/face-tracking.md, and the face scan, docs/face-scan.md) (5.1.1,
  5.1.2(vi)): face data stays on the iPhone and is never sent, used to identify anyone, or used for marketing or data
  mining. The move check stores nothing. The face scan stores only its readings (how far each move went, per side) and,
  after a yes, a progress photo, both on the iPhone. The privacy policy's two "Face data" paragraphs, the camera purpose
  string and the review notes say so; keep all of them true when a feature changes.
- Face tracking reads movement only (1.4.1, 2.3.1): how far each part moves and how evenly the two sides move. Never
  face shape, looks, attractiveness, age, a "symmetry score" or a promise that the numbers rise (`review:check` has
  the looks words in all six languages). "Not a medical test", and the method is explained in the app ("How it's
  measured"). No jaw-caution exercise is followed, and the scan's mouth move never asks for more than comfortable.
- Prefer Apple's pickers to full access (the photo picker instead of the whole library, 5.1.1(iii)).

**Notifications** (4.5.3, 4.5.4, 2.5.16)
- Only reminders the person sets up. No promotions or marketing without an explicit in-app opt-in and a way to turn
  them off. Nothing sensitive in the text.

**AI Coach** (5.1.2(i), 1.4.1, 4.7, 1.2)
- No question leaves the iPhone before consent, and the consent screen names who processes it (Google Gemini, with
  Cloudflare Workers AI as a backup), and that Google keeps questions only for a limited time against abuse.
  A new AI provider means updating the consent screen, privacy policy and review notes.
- The system prompt (`worker/src/lib/prompt.js`) keeps the safety rules: no diagnosis, no result promises, no looks
  ratings, kind help and a pointer to support when someone sounds distressed.
- "AI answers can be wrong. Not medical advice." stays visible, and long-press → report stays.
- The Coach only proposes: reminder changes (create, change, pause, delete) and a routine to start. Nothing is changed or
  started until the person taps Confirm or Start on its card, and the card shows what will happen.
- If people could ever see each other's content (sharing, groups, public chats), that is user-generated content (1.2):
  filtering, report, block and published contact details first.
- Since October 2026, 1.2 also names "AI content creation apps", and 4.7 counts chatbots that aren't in the binary. The
  Coach writes text answers only, so it keeps what both ask for: the prompt's topic filter, long-press → report (a mail
  to support) and the support page's email. AI pictures, video or voice of people would need more first: nothing that
  makes intimate or sexual images of real people, and a way to report and remove them.

**Accounts and sign-in** (5.1.1(v), 4.8)
- FaceRep has no account. If one is added:
  - in-app account deletion is required;
  - Google or another social login also needs Sign in with Apple (or a login that meets 4.8);
  - the app keeps working without an account unless accounts are the core feature.

**What the server sends** (2.5.2, 2.5.19, 2.3.1)
- The Worker sends data (Coach answers, exercise IDs) and, after a purchase, the Premium exercises (texts, drawings,
  short videos: media the app shows, never code), never code that changes features. No hidden switches that change
  the app after review. Every feature must be reachable by the reviewer and described in the review notes.
- 2.5.19 (new in October 2026): no hidden, dormant or undocumented features, and nothing hidden in the binary by
  obfuscation. That means no secret gestures, no debug menus in release builds, and no feature flags the Worker could
  turn on after review.
- The app works on first launch without any download (the free part is bundled). Premium content downloads only after a
  purchase or restore, with its progress on the Today card (4.2.3). The Worker must be live during review: a reviewer's
  sandbox purchase is checked with RevenueCat like any other.

**New screens and features** (2.1, 2.3.1, 2.3.12, 2.4.1, 2.4.4, 2.5.9, 2.5.16, 4.2)
- No crashes, no placeholder text, and the backend is live during review.
- Describe the feature in the review notes with steps to reach it, and in What's New.
- FaceRep is iPhone-only, but reviewers often open it on an iPad, where it runs in an iPhone-sized window. Check it there.
- Widgets, Live Activities and extensions must relate to the app and show no ads.
- Never ask people to change unrelated system settings, and never override the system buttons.

**Icon, images, screenshots, store text** (2.3.3, 2.3.7, 2.3.8, 2.3.9, 4.1, 4.5.6, 5.2)
- Screenshots show the app in use: Premium is labelled, no prices, suitable for 4+, with fictional data. Rebuild them
  after a screen they show changes (store-screenshots/README.md).
- Icon: no text, no Apple artwork, no other app's look. A new icon needs a new build (brand/README.md).
- Use only images we own or license. The people in our images are AI-generated and fictional, and the AI label stays.
- SF Symbols are fine in the app's UI. They are never allowed in the icon or in marketing. Apple emoji only as
  Unicode text, never as images.
- Never imply Apple endorses FaceRep (5.2.4). Write "iPhone" only as Apple's product name.
- Name and subtitle: at most 30 characters each. Keywords: no other apps, no trademarks, no prices (2.3.7).
- Store text, review notes and the subscriptions' descriptions say what is free and what is Premium exactly as the app
  does (2.3.1(a), 2.3.2, 3.1.2(c)). When the free part changes, all of them change before the build is submitted.
- Creative assets (Asset Library: product page header, search results; 2.3.14, new in October 2026) follow the same
  rules: about FaceRep, no prices or discounts, no unverifiable claims, fine for 4+.

**Age rating** (2.3.6)
- 13+ (health and wellness topics, occasional mild medical information from the Coach). Answer the age questions
  again if a feature changes that: chat between people, open web access, or more medical content.
- The social-media questions (required for every submission since September 2026) are answered "no": no social media,
  no chat between people, no user-generated content anyone else sees, no age check. The Coach is a chat with an AI, not
  between people. Check them with `./.tools/asc age-rating audit --app 6820638812`.

## 2. Automatic check (`npm test`, or `npm run review:check` in `app/`)
`app/scripts/review-check.js` reads every user-visible text and fails when it finds:
- claim words in all six languages (results, medical, proof, "unlimited", "for kids", other platforms). It reads the
  app strings, the iOS permission texts, docs/store-listing.md, the screenshot words and the web pages;
- prices in the screenshot words;
- a paywall that lost the price, renewal text, Restore, Terms, Privacy or close button;
- a free limit in the text that differs from the Worker (3 answers a month), a Worker ceiling below 100 a day while
  the Coach is sold as unlimited, or any text that names that ceiling;
- ad, analytics or tracking packages, or a privacy manifest that allows tracking.

A word list can't judge meaning, so §1 still applies. If the check flags an honest sentence, reword it first. If it
really can't be said another way, add the exact sentence to `ALLOWED` in the script, with a reason. Never weaken a rule
just to make a change pass. A new app language needs its own claim words: the test fails until it has them.

## 3. FaceRep 1.0 audit (2026-10-18)

Checked against the guidelines of October 16, 2026, at commit `a11b5ca` plus the two fixes below. App Store Connect was
read with `./.tools/asc` in read-only mode. What the owner still has to do, in order: docs/publish-todo.md §1d.

**Fixed in this audit:**
- The privacy policy's summary said only two things ever leave the iPhone. Since the Premium download, the random app
  ID also goes to our server, so it now says three (5.1.1(i)). The change is live after the next Worker deploy.
- The AI consent screen now links the privacy policy under its text, for the full details. Guideline 5.1.2(i) asks for
  access to information about how and where the data will be used.

**Status by rule**
| Rule | What it needs | FaceRep |
|---|---|---|
| 1.2, 4.7 AI content | topic filter, report path, contact | The Coach keeps to the topic and never rates looks; long-press → report; the support page has the email ✅ |
| 1.4.1, 2.3.1 health and claims | no medical or result claims; "check with a doctor" | Safety line on the welcome screen, Settings → Exercise safety, jaw caution; the word check passes in all six languages ✅. The face scan reads movement only, says "Not a medical test" and explains its method ✅ |
| 2.1 completeness | final build, backend live, IAP reachable | ❌ Version 1.0 still has build 7, which has the 28-day plan; build 13 is needed. The live Worker has no `/content` yet, so a reviewer's Premium download would fail |
| 2.3.1(a), 2.3.2, 3.1.2(c) metadata | store text, review notes and subscription texts match the app | ❌ All seven locales still describe the 28-day plan ("27 exercises", "Week 1 free", every exercise free). The review notes point to the removed grid and Settings row, and the subscription descriptions say "Weeks 2 to 4" |
| 2.3.3, 2.3.7 screenshots | the current app, no prices | New set of 9 from the Simulator (2026-10-19): a free user, free exercises only, limits labelled ✅. Not uploaded yet: App Store Connect still has the old 8 ❌ |
| 2.3.6 age rating | honest answers, including the social-media questions | Answered; 13+ ✅ |
| 2.3.14 creative assets | Asset Library rules | None used ✅ |
| 2.4.1 iPad | works in an iPhone window | iPhone-only; still to check on an iPad ⚠️ |
| 2.5.2, 2.5.19 downloads, hidden features | media only, nothing hidden | The Premium download is texts, drawings and clips; there are no debug menus or server switches ✅ |
| 2.5.14 recording | consent and an indicator | The mirror is a preview only; iOS asks first and shows the camera dot ✅. The scan's photo needs a yes first and shows "Photo saved on this iPhone" when taken ✅ |
| 3.1.1, 3.1.2 subscriptions | in-app purchase; price, period, trial, renewal, Restore, Terms, Privacy | `PaywallView`. Its trial line comes from the App Store offer, so it follows App Store Connect ✅ |
| 3.1.2(a) ongoing value | keeps giving value | Every day and exercise, the unlimited Coach and unlimited face scans ✅ |
| 4.2.1 ARKit | rich AR, not a model in a view | ARKit only reads movement, for the move check and the face scan; FaceRep isn't an AR app. Say so in the review notes ✅ |
| 4.2.3 downloads | nothing required at first launch | The free part is in the app; the Premium download (about 9 MB) comes after purchase ✅ |
| 4.10 built-in capabilities | the camera isn't sold | The mirror is free for everyone. Premium sells unlimited face scans (the guided moves, the numbers and their history), not camera access; 3 scans are free ✅ |
| 5.1.1(i) privacy policy | in the app and in App Store Connect; data, retention, deletion | `/privacy` from Settings, the paywall and the consent screen ✅ |
| 5.1.2(i) third-party AI | say who gets the data, ask first | The consent screen and paywall name Google Gemini (backup Cloudflare Workers AI); switch in Settings ✅ |
| 5.1.2(vi) face data | never for marketing; explain its use | "Face data" paragraphs (move check, face scan), camera purpose string, Settings → Move check in the mirror and Face scan photos ✅. The review notes must answer Apple's face-data questions (docs/launch.md) |
| 5.6.1 ratings | Apple's prompt only | `expo-store-review` ✅ |

**Judgment calls (kept, low risk):**
- The microphone purpose string exists only because the camera library can record sound. FaceRep never asks for the
  microphone (docs/architecture.md).
- The keywords "glow" and "skincare": the app calls the topic "face care", but people search for "skincare", and the
  Coach does give basic face care tips. Drop them if a reviewer objects.
- The English keywords "double" and "chin": the chin and neck exercises work that area, and the Coach answers a double
  chin question honestly (mostly body fat, genetics and posture). It isn't one of the Coach's suggested questions, and
  nothing promises a result. Drop them if a reviewer objects.
- The privacy and support URLs are on the `elowa-app.workers.dev` subdomain. They work; a FaceRep domain would look
  more professional later (5.6.2).
- The EU trader status (DSA) is undeclared, so the app isn't sold in the EU. This is the owner's choice, not a
  guideline issue (docs/publish-todo.md §0).
