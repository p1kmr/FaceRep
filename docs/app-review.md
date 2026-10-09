# App Review: the rules for every change

Apple's [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (the numbers below), last
updated by Apple on **June 8, 2026**, checked against FaceRep on 2026-10-09. Not legal advice.

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
- Numbers must be true. Limits come from `constants/limits.ts` and match the Worker. Never "unlimited", "#1", "best",
  "clinically proven", "guaranteed".
- No other platforms (Android, Google Play) and no other app names, in the app or metadata (2.3.10, 4.1).
- No "for kids" / "for children" (2.3.8; FaceRep is rated 13+).
- A translation is never stronger than the English.

**Paywall and anything sold** (3.1.1, 3.1.2, 2.3.2, Schedule 2 of the Apple Developer Program License Agreement)
- Digital features unlock only with Apple in-app purchase (RevenueCat). No buttons or links to pay elsewhere, no
  unlock codes or QR codes, and no "cheaper on our website".
- Before the buy button the paywall shows: plan name, length, billed price (the biggest price on the screen), trial
  length and what is charged after it, the auto-renew sentence, Restore, Terms (Apple's EULA), Privacy and a close
  button. `PaywallView` has all of them. Never remove one.
- Say exactly what Premium gives. If something is capped, say the cap ("up to 40 a day").
- Weekly shows only its billed price. "Save X%" compares yearly with monthly, never with weekly.
- "Free trial" means only the App Store's subscription trial. Week 1 is "free", never a "trial".
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
- Paid features don't depend on sharing data: the Premium plan works without AI consent (5.1.1(ii)).
- Never: ads, analytics, tracking SDKs, the tracking prompt (ATT), selling data. Never send camera frames or photos
  (2.5.14, 5.1.2(vi)).
- Health and fitness data is never used for ads or marketing and never stored in iCloud (5.1.3). HealthKit would need
  real Health app integration, its own purpose strings and new labels (2.5.1).

**Permissions: camera, microphone, photos, location, contacts, Health, notifications** (5.1.1(ii)/(iv), 2.5.14, 4.5.4, 5.1.2(i))
- Ask when the person starts the feature, never at launch. The purpose string says exactly why, in all six
  languages (`app/locales-native/*.json` and the plugin text in `app.json`).
- "Don't Allow" leaves the app usable. After that, offer the Settings app once. Never nag, never block the app.
- Never require notifications, location or tracking to use the app or to get something (5.1.2(i)).
- Recording anything (camera, microphone, screen) needs consent and a visible sign that it is on (2.5.14). The mirror
  is a live preview only.
- Prefer Apple's pickers to full access (the photo picker instead of the whole library, 5.1.1(iii)).

**Notifications** (4.5.3, 4.5.4, 2.5.16)
- Only reminders the person sets up. No promotions or marketing without an explicit in-app opt-in and a way to turn
  them off. Nothing sensitive in the text.

**AI Coach** (5.1.2(i), 1.4.1, 4.7, 1.2)
- No question leaves the iPhone before consent, and the consent screen names who processes it (Cloudflare Workers AI).
  A new AI provider means updating the consent screen, privacy policy and review notes.
- The system prompt (`worker/src/lib/prompt.js`) keeps the safety rules: no diagnosis, no result promises, no looks
  ratings, kind help and a pointer to support when someone sounds distressed.
- "AI answers can be wrong. Not medical advice." stays visible, and long-press → report stays.
- The Coach only proposes. Nothing changes until the person taps Confirm.
- If people could ever see each other's content (sharing, groups, public chats), that is user-generated content (1.2):
  filtering, report, block and published contact details first.

**Accounts and sign-in** (5.1.1(v), 4.8)
- FaceRep has no account. If one is added:
  - in-app account deletion is required;
  - Google or another social login also needs Sign in with Apple (or a login that meets 4.8);
  - the app keeps working without an account unless accounts are the core feature.

**What the server sends** (2.5.2, 2.3.1)
- The Worker sends data (plan days, exercise IDs), never code that changes features. No hidden switches that change
  the app after review. Every feature must be reachable by the reviewer and described in the review notes.

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

**Age rating** (2.3.6)
- 13+ (health and wellness topics, occasional mild medical information from the Coach). Answer the age questions
  again if a feature changes that: chat between people, open web access, or more medical content.

## 2. Automatic check (`npm test`, or `npm run review:check` in `app/`)
`app/scripts/review-check.js` reads every user-visible text and fails when it finds:
- claim words in all six languages (results, medical, proof, "unlimited", "for kids", other platforms). It reads the
  app strings, the iOS permission texts, docs/store-listing.md, the screenshot words and the web pages;
- prices in the screenshot words;
- a paywall that lost the price, renewal text, Restore, Terms, Privacy or close button;
- limits in the text that differ from the Worker (3 free answers a month, up to 40 a day);
- ad, analytics or tracking packages, or a privacy manifest that allows tracking.

A word list can't judge meaning, so §1 still applies. If the check flags an honest sentence, reword it first. If it
really can't be said another way, add the exact sentence to `ALLOWED` in the script, with a reason. Never weaken a rule
just to make a change pass. A new app language needs its own claim words: the test fails until it has them.

## 3. FaceRep 1.0 audit (2026-10-09)

**Fixed in this audit** (in the build that is submitted, and on the Worker after deploy):
- Exercises tab: "for a sharper-looking jawline" (a result claim, in all six languages) → "Jaw, chin and neck muscles,
  plus tongue and neck posture". "Lift and tone" (cheeks) → "Work and tone".
- Coach starter questions "How long until I see jawline results?" and "Which exercises help a double chin?" assumed
  results. They are now "What can jaw exercises change?" and "Can exercises help a double chin?".
- "Unlimited AI Coach answers" (paywall, Coach, store description, Terms), while the Worker allows 40 a day. It now says
  "up to 40 a day" everywhere, and the number comes from `PREMIUM_LIMITS` / `LIMITS.perUser` (3.1.2(c), 2.3.1).
- The privacy policy now confirms that service providers give the same or equal protection (5.1.1(i)).
- Privacy manifest: added Fitness (the streak and workouts-this-week sent with Coach questions). Other User Content is
  already declared on the same "to be safe" basis.

**Status by rule**
| Rule | What it needs | FaceRep |
|---|---|---|
| 1.4.1, 2.3.1 health and claims | no medical or result claims; "check with a doctor" | Safety line on welcome, Settings → Exercise safety, jaw caution on the exercise page and before jaw exercises; Coach refuses diagnosis; automatic word check ✅ |
| 1.2, 4.7 AI content | report path, filtering | Long-press → report; the prompt keeps to the topic, no looks ratings ✅ |
| 2.1 completeness | backend on during review, IAP reachable | Worker live; paywall from any locked day and Settings ✅ |
| 2.3.2 paid items in metadata | say what's paid | "What's free" and "Premium" in the description; slides 3 and 8 label it ✅ |
| 2.3.7 metadata | no prices in screenshots, no trademarks | "Week 1 free" and "3 free answers a month" say what is free (2.3.2), not a price ✅ |
| 2.3.9 rights | own the images | AI-generated, fictional people, labelled ✅ |
| 2.4.1 iPad | runs on iPad | iPhone-only; check in iPad compatibility mode (docs/device-testing.md) ⚠️ |
| 2.5.2 self-contained | no downloaded code | `/plan` returns JSON data that the app checks ✅ |
| 2.5.14 recording | consent + indicator | The mirror is preview only; iOS asks first and shows the camera dot ✅ |
| 3.1.1, 3.1.2 subscriptions | IAP only; price, period, trial, renewal, Restore, Terms, Privacy | `PaywallView`, the Worker re-checks RevenueCat ✅ |
| 3.1.2(a) ongoing value | keeps giving value | Levels 2–3, new rounds, and the Coach ✅ |
| 3.1.2(c) what you get | describe it exactly | "up to 40 Coach answers a day" ✅ (was "unlimited") |
| 4.3 spam | clearly different | Anatomy drawings (man or woman), voice-guided timer, mirror, AI Coach ✅ |
| 4.5.4 notifications | not required, no marketing | Only the person's reminders; asked when one is turned on ✅ |
| 5.1.1(i) privacy policy | in the app and in ASC; data, retention, deletion, third parties | `/privacy`, linked from Settings and the paywall ✅ (equal-protection sentence added) |
| 5.1.1(v) accounts | no login needed | No account ✅ |
| 5.1.2(i) third-party AI | disclose and get permission | Consent screen names Cloudflare Workers AI; Settings switch ✅ |
| 5.6.1 ratings | Apple's prompt only | `expo-store-review` after 3 workouts, at most every 120 days ✅ |
| 2.3.6 age | honest answers | 13+ ✅ |

**Judgment calls (kept, low risk):**
- The microphone purpose string exists only because the camera library can record sound. FaceRep never asks for the
  microphone (docs/architecture.md).
- The keywords "glow" and "skincare": the Coach gives basic skincare tips. Drop them if a reviewer objects.
- The privacy and support URLs are on the `elowa-app.workers.dev` subdomain. They work; a FaceRep domain would look
  more professional later (5.6.2).
- The EU trader status (DSA) is undeclared, so the app isn't sold in the EU. This is the owner's choice, not a
  guideline issue (docs/publish-todo.md §0).

**Still to do for 1.0** (docs/publish-todo.md §1 and §3):
- build 5 with these fixes, attached in place of build 4;
- deploy the Worker;
- in App Store Connect: the store description and the review notes ("up to 40 a day"), the subscription descriptions
  if they say "unlimited", and App Privacy with Fitness;
- the iPad check;
- the medical device declaration ("No": FaceRep is fitness and wellness, not a medical device).
