# Publish FaceRep 1.0 to the App Store: TODO

State checked on 2026-10-09 (after commit `ca5b8f0`) with the asc CLI, the RevenueCat MCP, wrangler and the Expo MCP;
App Store Connect read again on 2026-10-18 (§1d). Store text, screenshots, review notes and the subscriptions' texts
written on 2026-10-19 (§1d Step 4): they describe the app at `3b3969b`, so the build to submit is the next one (§1d).
Re-check before acting: from the repo root run
`./.tools/asc validate --app 6820638812 --version-id 7edc84f2-a25e-4553-a918-45a254d06399`
(0 blocking issues on 2026-10-09; what is left is in §3b and can only be done by hand).

## Rules for whoever works on this
- **Never touch Elowa.** It is live and in App Review on the same Apple, Expo, RevenueCat and Cloudflare accounts.
  Every command must name FaceRep's own IDs (below). Never use ASC app 6816730331, `com.p1kmr.elowa` or the
  `elowa-api` Worker.
- Use the project ASC CLI: `./.tools/asc` (config in `.asc/config.json`, key "FaceRep"). Find commands with
  `./.tools/asc search "<task>"` and `--help`.
- Ask the owner before any write that touches money or goes public: app price and availability, subscription prices
  or offers, the review submission. Text, category, age rating, screenshots and privacy labels can be written directly,
  then shown to the owner.
- The owner runs anything that reads a private key file (`.p8`) and anything that needs Apple two-factor codes.
- Commands for the owner: one command per code block, no `#` comments (the owner's zsh passes them as arguments).
- npm/npx in `~/personal` must use the public npm registry (wrappers in `~/.config/personal-npm/bin`). Don't install
  new global tools.
- Health wording: no medical or result claims (App Store 1.4.1, 2.3.1). Never compare FaceRep with other apps in docs.

## IDs
| What | Value |
|---|---|
| ASC app / bundle ID | `6820638812` / `com.p1kmr.facerep` |
| ASC version 1.0 | `7edc84f2-a25e-4553-a918-45a254d06399` (PREPARE_FOR_SUBMISSION, phased release configured) |
| Version 1.0 localizations | en-US `07839324-ea48-4b9a-9229-0af73cccfde4`, es-MX `0a068905-8d81-473f-9453-bdf9c9d00b70`, es-ES `0a5145c4-eb36-4461-a655-3a0a4d662852`, pt-BR `20db9926-93f5-4fc8-9559-87e8847cc262`, de-DE `f3cbd978-3363-45c8-b877-110196d94a88`, fr-FR `c06b0f6f-9b5a-4fde-aa7e-3936b1a6b3b0`, it `73135207-7e51-4577-b8ba-21ff32ffb9e2` |
| App info | `124df349-ee60-4ba4-b8f6-7e1ad6e1f720` |
| Subscription group "FaceRep Premium" | `22455499`, group version `136d3d83-aafb-49ec-8cfd-de076058c98e` |
| Weekly $1.99 | sub `6820639146`, version `04e85350-7228-473c-9426-020cc318f5e2` |
| Monthly $3.99 | sub `6820639147`, version `1e936df0-5760-4914-a0a9-faf27acf4847` |
| Yearly $29.99 + 1-week trial | sub `6820639173`, version `c17a8546-ae99-4a38-99ff-9ddd96c08aff` |
| TestFlight internal group | "FaceRep Internal" `d5f868e2-03ee-4425-a73a-4164ab2e5a5b` |
| Expo project | `@p1kmr/facerep`, `b4548307-778f-43c8-bcaa-8ddb0df42673` |
| RevenueCat | project `proj88dfbdbb`, App Store app `appe9482ca317`, entitlement `premium`, offering `default` |
| Worker | `facerep-api`, https://facerep-api.elowa-app.workers.dev (`/privacy`, `/terms`, `/support`, `/chat`, `/content` from the next deploy; `/plan` only until then) |
| Apple team | `Z43K3DU9C9` |

## Already done (verified 2026-10-09)
- **Subscriptions:** all three are READY_TO_SUBMIT. Prices are set in all 175 territories (Apple's equalization), and the
  yearly 1-week free trial is in all 175. Names, descriptions and the group name are in seven locales (en-US, es-MX,
  es-ES, pt-BR, de-DE, fr-FR, it), with review notes and a review screenshot. Details are in docs/premium.md §6.
- **RevenueCat:** both Apple keys (App Store Connect and In-App Purchase) are **valid**. The 3 products are attached
  to `premium`, and offering `default` is current with `$rc_weekly`, `$rc_monthly` and `$rc_annual`. The public key
  matches `app/eas.json`.
- **Worker:** deployed. `/privacy`, `/terms` and `/support` return 200 and show kindcodelabs@gmail.com.
  `REVENUECAT_SECRET_KEY` and `IP_HASH_SECRET` are set.
- **Store listing in seven App Store locales** (en-US primary, es-MX, es-ES, pt-BR, de-DE, fr-FR, it), all from
  docs/store-listing.md (es-MX and es-ES share the Spanish text); description, promotional text and screenshots
  replaced on 2026-10-19 (§1d Step 4):
  - name, subtitle and privacy policy URL; the en-US name is `FaceRep: Face Yoga & Jawline`;
  - description, keywords, promotional text, and the support URL `https://facerep-api.elowa-app.workers.dev/support`.
    No What's New, because Apple doesn't allow it on a first version;
  - 9 screenshots each, 01→09, from `store-screenshots/export/<lang>/` at 1320 × 2868 (6.9" iPhone, API type
    APP_IPHONE_67). iPhone only, so the iPad notice in `asc validate` doesn't apply (`supportsTablet` is false).
  - Slide 7 shows both her and his camera mirror. A woman-only or man-only version is a quick rebuild; upload it with
    `--replace --confirm`.
  - The texts are AI translations, so a native speaker should check them. Promotional text can change at any time;
    everything else needs a new version after release.
- **App information:**
  - Copyright `2026 FaceRep` (the owner's choice: the app name, not a legal name).
  - Content rights: no third-party content.
  - Category: Health & Fitness, with Lifestyle as the secondary category.
- **Age rating:**
  - Answers: everything "none" or "no", except Health or wellness topics = yes and Medical or treatment information =
    infrequent/mild (the Coach).
  - Apple's result: 12+, which the new age system shows as 13+. Brazil: 12.
- **Price and availability:** Free (base territory US), available in 174 territories plus new ones; China mainland is
  excluded because it needs an ICP filing and generative-AI approval.
- **App config:** `app.json` already has `ios.config.usesNonExemptEncryption: false`, so builds don't wait on "Missing
  Compliance".
- **Build keys:** EAS has no server-side environment variables, so builds use `eas.json` only. That file has FaceRep's
  AI URL and FaceRep's RevenueCat key. The app code mentions Elowa only in comments.
- **Tests:** typecheck, 108 app tests and 34 Worker tests pass at `ca5b8f0`.
- **TestFlight:** build 1.0.0 (2) is VALID in the internal group, with no crashes or feedback. It was built from the old
  commit `a9f8761`, so build 7 (§1) replaces it.

## 0. Owner decisions still open
- **DeviceCheck at launch** (recommended: yes, see §2).
- **EU trader status (DSA): left undeclared on purpose for now.** Declaring as a trader shows the address, phone and email
  publicly on EU store pages. Until it is declared, App Store Connect marks the **27 EU countries "TRADER_STATUS_NOT_PROVIDED"**,
  and the app is not sold there (Spain, Germany, France, Italy and the rest of the EU). It is an account-wide setting
  (Business → Compliance), shared with Elowa. Don't change it without the owner.
- **Coach AI: Google Gemini API, decided by the owner on 2026-10-18** (`gemini-3.5-flash-lite`; Workers AI Gemma answers
  when Gemini fails; worker/README.md). Google's Gemini API terms say it isn't for apps "likely to be accessed by
  individuals under the age of 18" and FaceRep is rated 13+: the owner accepted that risk. Owner steps:
  - [x] `GEMINI_API_KEY` secret on `facerep-api` (2026-10-18).
  - [ ] **Billing on** for the key's Google project (Google AI Studio → the key's project → Billing). Required: the free
        tier lets Google use the questions to improve its products and isn't allowed for EEA, Swiss and UK users, and
        the consent screen and privacy page say Google doesn't use them.
  - [ ] Deploy the Worker (`npm --prefix worker run deploy`), then the AI checks the live Coach.
  - The consent screen and paywall texts naming Google ship with the next build (build 13).
- **Cloudflare Workers Paid ($5 a month)** (optional now). Workers AI is only the backup, so its 10,000 free neurons a
  day are plenty; Workers Paid still lifts the 100,000 requests a day (docs/premium.md).

## 1. Build 7 and device test (AI builds, owner tests)
Build 1.0.0 (7) is attached to version 1.0: built from `63d80f7`. It has the App Review fixes of 2026-10-09
(docs/app-review.md §3), the yearly "Save 37%" badge (was 38%: the store's rounded-down monthly price) and the workout
player's top buttons below the status bar (on notch iPhones they sat under it and couldn't be tapped). EAS build
`71b07554`, ASC build `e8f5b8d4`, VALID and in the internal TestFlight group. **Build 7 is the one to test and submit.**
Builds 3–6 must not be used.

- [x] Build 7 from `app/` with `npx eas-cli@latest build --profile production --platform ios --auto-submit
      --non-interactive` (credentials are stored, no questions).
- [x] Build 7 VALID, attached to 1.0 in place of build 6; `asc validate`: 0 blocking (2026-10-10).
- [ ] The owner tests build 7 with the checklist in docs/device-testing.md §3, including the sandbox purchases:
  - buy Weekly, Monthly, and Yearly with the trial;
  - every exercise opens right after buying (library and Today's workout), and the Coach keeps answering after the 3 free answers;
  - delete the app, reinstall, then Restore works;
  - the purchase shows in RevenueCat → Customers (sandbox).
- [ ] Compare each store screenshot with the same screen on build 7. The slides come from the web build made to look
      like the iPhone, so icons or layout could differ slightly. If a screen differs, re-run the capture
      (store-screenshots/README.md).
- [x] Subscription review screenshot (2026-10-19): the old one (the web build's paywall with the 28-day plan) is
      replaced on all three by the current paywall from the iPhone 17 Pro Max Simulator, same code as build 14: the
      three plans with App Store prices, Yearly selected with its free-trial line, Restore, Terms and Privacy
      (`./.tools/asc subscriptions review screenshots delete`, then `create --subscription-id <id> --file <jpg>`).
- [ ] Optional: delete the local branch `backup/weekly-local-29d96e7` if the owner agrees.

## 1b. Build 8: new look, face map, exercise videos, Coach that saves and starts workouts
Build 7 doesn't have these. The clips play with `expo-video`, a native module, so they need a new build (an over-the-air
update can't add native code). Build 8 replaces build 7 as the one to test and submit.
- [ ] **Owner: deploy the Worker** (the Coach's new tools and prompt, and the Mewing / Tongue Press text). In `worker/`:
      `npm run deploy`. An app before build 8 ignores the new proposals, so deploying first is safe.
- [ ] **Build 8** from `app/` the same way as build 7 (EAS production profile, auto-submit), when the owner says go.
- [ ] **Owner tests build 8** with docs/device-testing.md §3 (new lines: Coach save / routine, videos, face map), then
      attaches it to version 1.0 in place of build 7.
- [ ] **Move check in the mirror (face tracking, an experiment):** build 8 has it; test it with docs/face-tracking.md §5.
      Keep it: do §7 there before submitting (Worker deploy for the privacy policy, What's New, slide 5; the review
      notes in docs/launch.md already describe it). Drop it:
      revert its commit ("Mirror move check with Apple face tracking…"), deploy the Worker again and make a new build.
- [x] **Store text:** the description in docs/store-listing.md (face map, videos, the Coach's routines; all six
      languages) is on the 1.0 page since 2026-10-19. Version 1.0 has no What's New.
- [x] **Screenshots:** re-captured from the iOS Simulator on 2026-10-19 (Step 3 below).
- [x] **Review notes:** the text in docs/launch.md §6 is in App Store Connect since 2026-10-19. It describes the next
      build (§1d Step 4), not builds 7 or 13.
- [ ] Build 12 (from `ae2eb2a`) is the first with the move check; on an iPhone 11 its mirror stayed black (cause found
      2026-10-19: that iPhone's Face ID / TrueDepth camera is broken, so ARKit can't run; not an app bug). The next
      build adds the plain-camera fallback and its log lines, the draggable mirror tile with ×, the month under the week,
      the weeks that never end (no 28-day plan, no exercise counts) and the Anton fix: test the mirror again with
      docs/face-tracking.md §5, and the weeks with docs/device-testing.md.
- [ ] Deploy the Worker (it drops `/plan`) only once that build is on TestFlight: build 12 and older still load Weeks 2–4
      from `/plan`.

## 1c. Next build: days 1–3 free, Premium exercises only from the Worker
The next build (13) changes what's free and where the Premium exercises come from (docs/premium.md §2b): days 1 to 3
are free; from day 4 the weeks need Premium (a locked day names one free exercise, the others are locked); the Premium
exercises' texts, drawings and clips are no longer in the app, the Worker sends them after its RevenueCat check.
- [ ] **Owner: deploy the Worker as soon as build 13 is on TestFlight**, the same day: build 13 gets its Premium
      exercises only from `POST /content`, which the deployed Worker doesn't have yet. In `worker/`: `npm install`, then
      `npm run deploy` (it builds the Premium folder `.content/` first, about 18 MB, and uploads it with the Worker; the
      first upload takes a minute). No new secret: the download token's key comes from `REVENUECAT_SECRET_KEY`.
- [ ] Check after the deploy: `https://facerep-api.elowa-app.workers.dev/content/files/man/04-mewing/clip.mp4` in a
      browser must answer `{"error":"token"}` (the files are private), and `/privacy` shows the new "Premium download" row.
- [ ] **Owner tests build 13** with docs/device-testing.md (the "Free days and Premium download" lines): days 1–3 free,
      day 4 locked, buying in the sandbox downloads the Premium exercises, they work in airplane mode afterwards,
      Restore on another iPhone downloads them again.
- [x] **Store text, screenshots and review notes** (2026-10-19): "Days 1 to 3 free" (never "trial"), the What's free
      and Premium lists match the paywall, and the review notes say how a reviewer reaches a Premium day: Today → "Week 1
      · Day 1" shows Day 4 onward locked → Unlock Day 4 → sandbox purchase → the Premium exercises download right away
      and every day and exercise opens. A reviewer can't wait three days for Day 4.
- [ ] App Privacy needs no change: the download sends only the random app ID, already declared as User ID (App
      Functionality, not linked).

## 1e. Face scan (added 2026-10-19, goes into build 13; docs/face-scan.md)
Six guided moves with Apple's face tracking on the iPhone give Movement and Balance, saved on the iPhone with a chart in
Progress; 3 free scans, then Premium; an optional progress photo that stays on the iPhone (not in backups).
- [x] Code, tests (engine, scores, Simulator face, state), six languages, camera purpose string, privacy policy and
      Terms text, review-check (free scans = Terms; looks-rating words banned in all six languages), docs.
- [x] Tried in the iOS Simulator with the pretend face (2026-10-19, Release build, iPhone 17e): intro and photo
      question, a full run (ring, steps, photo chip), save, results (rings, change, moves, smallest move), Progress
      (numbers, chart, history), photos (first vs latest, grid, switch), Settings row, and after 3 scans the paywall.
- [ ] **Owner: Worker deploy** (`cd worker && npm run deploy`): the privacy policy's "Face data (face scan)" paragraph
      and the Terms' "3 face scans are free". Must be live before submitting (the app links to them).
- [ ] **Build 13 has native code for this** (the photo and the camera angle): it can't come as a JS-only update.
- [ ] **Owner device test** (docs/face-scan.md §5), including the left/right check (squint only the left eye).
      Best on a development build, so tuning (§6) needs no new build: `npx eas-cli@latest build --profile development
      --platform ios`, then `npx expo start --dev-client`.
- [ ] **Tune** `SCAN_MOVES[].full` after 2–3 people's scans (docs/face-scan.md §6). Before launch only: later changes
      re-score old scans.
- [x] **Store text** (2026-10-19, at the owner's request): the face scan is in the description, What's free (3 face
      scans) and Premium (unlimited face scans) in all locales; movement only, no looks words, "iPhone X and later".
- [x] **Screenshots:** slide 3 is the face scan and its results (a stand-in picture in the Simulator's camera), slide 4 Progress with
      the scan chart (2026-10-19, Step 3 below).
- [x] **Review notes:** the text in docs/launch.md §6 (the face scan and Apple's face-data questions), in App Store
      Connect since 2026-10-19.
- [ ] App Privacy: no change (scan numbers and photos never leave the iPhone, so they aren't "collected").

## 1d. Before submitting: App Review audit of 2026-10-18 (docs/app-review.md §3)
Read from App Store Connect with `./.tools/asc` (read-only) on 2026-10-18. `asc validate` shows 0 blocking issues, but
it can't see agreements, App Privacy or whether the text is out of date. **One build only:** finish everything that goes
inside the app first, then build 13, then the screenshots from that same code, then App Store Connect.

**Build 13 already exists (2026-10-18), made from `a838531`:** before the Gemini Coach (`3ff53f2`), the face scan
(`f3c972c`), the beeps (`94c4edc`, expo-audio is native code) and the Progress taps (`3b3969b`). The store page,
screenshots and review notes in App Store Connect show all of them (2026-10-19). Where this file says "build 13" for
those features, it means the next build (14) from `main`. Never submit with build 7 or 13 attached (2.1, 2.3.1).

**Any time, now (no build needed):**
- [x] **Account Holder: accept the updated Paid Applications Schedule.** The App Store Connect home page showed a banner
      (seen 2026-10-18): until it's accepted, Apple blocks app updates, new in-app purchases and offers, and submissions.
      Accepted by the owner: on 2026-10-19 `./.tools/asc web agreements status` shows no banner and nothing pending.
- [x] **Mac and Vision Pro: turned both off** on 2026-10-19, at the owner's request (re-read afterwards: both false).
      Before that, `./.tools/asc web apps compatibility view --app 6820638812` showed both on (Apple's default for
      iPhone apps). ARKit face tracking doesn't exist there, so the
      move check and the face scan would be missing and the mirror would be a plain camera (the Persona on Vision Pro),
      while Premium sells unlimited scans. Pricing and Availability on the website, or `./.tools/asc web apps compatibility
      edit --app 6820638812 --ios-app-on-mac false --ios-app-on-vision-pro false`. The iPhone-only build (iOS 16.4+)
      still runs on iPads, as Apple requires.
- [x] **Owner: Worker deploy** (§1c): live, checked 2026-10-19: `/content` answers only POST, a file without a token
      gets 401, and `/privacy` says "Last updated October 19, 2026" with the face scan and the Premium download row.

**Step 1: changes inside the app (all before build 13):**
- [x] Consent screen: a Privacy Policy link (5.1.2(i), 2026-10-18).
- [x] The "Every 2 hours" reminder button is gone; a new reminder starts with one time (2026-10-18).
- [x] **Simulator check before building (2026-10-18):** on iPad (A16), iPadOS 26.5, FaceRep opens in an iPhone-sized
      window, and onboarding and Today look right (2.4.1). At the largest Larger Text size, Today's text grows and wraps
      with nothing cut off, also when the size changes while the app is open. Every icon-only button has a VoiceOver
      label (`IconButton` requires one; the Coach button, streak, week strip and day cards have theirs). The owner hears
      VoiceOver for real on the iPhone in Step 2.
- [ ] `npm run lint && npm run typecheck && npm test` (app), `npm test` (worker): pass, committed as a838531. Push
      before build 13: it's made from `main`.

**Step 2: build 13 and the device test:**
- [ ] **Build 13** from `app/` (EAS production profile, auto-submit), when the owner says go.
- [ ] **Owner tests build 13** (§1c, docs/device-testing.md, docs/face-tracking.md §5): mirror on the iPhone 11 (black on
      build 12), days 1–3 free, Day 4 locked, sandbox purchase, Premium download, Restore, airplane mode, Dark Mode,
      VoiceOver on Today and in a workout.
      Only a failure here means another build.

**Step 3: screenshots (Simulator, same code as build 13; can run while EAS builds):**
- [x] 9 slides × 6 languages from the iOS Simulator (2026-10-19): a free user, free exercises only, the face scan
      and its chart, the camera mirror with stand-in pictures, the real Coach (cards, no technique text). In
      `store-screenshots/export/<lang>/01–09.jpg`; the old set is in `export/v1-web/`. Uploaded on 2026-10-19 at the
      owner's request (Step 4). Still compare them with the next build on the iPhone; re-capture and replace any slide
      that differs (es-ES and es-MX share the Spanish).

**Step 4: App Store Connect (after the agreement and build 13). The texts can be drafted in the docs earlier:**
- [x] **Build 14 from `main`, attached to 1.0** (2026-10-19) in place of build 7: VALID, in internal TestFlight, with
      the barbell-smile icon. The small icon beside the app's name in App Store Connect stays the old one until the
      version is submitted.
- [x] **Store text, all seven locales** (2026-10-19): description and promotional text from docs/store-listing.md
      (es-ES and es-MX share the Spanish): days 1 to 3 free (never "trial"); Premium = every exercise (mewing named,
      2.3.2), every day, unlimited Coach and face scans; the face scan and the beeps; no exercise count, no "28". Name,
      subtitle and keywords unchanged. Read back from App Store Connect: the same as the doc.
- [x] **Subscriptions** (2026-10-19): the description in seven locales on all three ("Every day and exercise, unlimited
      Coach and face scans.", at most 55 characters) and the three review notes (docs/launch.md). Names, prices and
      the trial unchanged. The review screenshot is the current paywall (2026-10-19, §1).
- [ ] **Free trial** (decided: 3 days on all three plans; money, so the owner's OK on the day): add a 3-day free trial
      to Weekly and Monthly, and change Yearly from 1 week to 3 days, in every territory. The paywall reads the trial
      from the App Store, so the app needs no change. Needs the agreement first.
- [x] **Screenshots** (2026-10-19): the 9 slides of Step 3 in all 7 locales (they replaced the 8 old ones; checksums
      and order 01–09 checked against `export/`).
- [x] **Review notes for 1.0** (2026-10-19): the text in docs/launch.md §6 (free and Premium with the way to a locked
      day, the Coach's AI, the mirror, the move check, the face scan with Apple's face-data answers, sound cues and the
      microphone string), 3,679 of 4,000 characters.
- [x] App Privacy: no change needed (the Coach's data is already declared, Not linked; the provider isn't part of the
      labels). Checked 2026-10-19: published, the same four labels.
- Optional: **App Accessibility** (Accessibility Nutrition Labels) is still voluntary. Fill it in from the Step 1 and
  Step 2 checks; claim only what really works.
- [ ] **Subscriptions on the 1.0 page** (§3b): select all three. Recheck the website's MISSING_METADATA after the new
      subscription texts, run `./.tools/asc validate`, then the owner submits (§5).

**Later:** **iPhone Duo screenshots**. Apple requires them from April 2027 for builds made with the iOS 27.1 SDK or
later. After launch, optional: Custom Product Pages, Product Page Optimization, Asset Library creative assets (2.3.14),
In-App Events, and a featuring nomination (App Store → Nominations).

## 2. Worker: DeviceCheck (owner runs, after build 7 is on TestFlight)
`DEVICECHECK_KEY_ID` and `DEVICECHECK_KEY` are not set. Free Coach answers are only rate-limited, not tied to a real
iPhone. Keys are per Apple team, so the existing team DeviceCheck key can be reused (FaceRep only validates tokens and
never writes DeviceCheck bits; see worker/README.md §D). Keep the `.p8` outside `~/Downloads`, because Terminal can't
read it there. Run these from `worker/`:

```
npx wrangler secret put DEVICECHECK_KEY_ID
```
```
npx wrangler secret put DEVICECHECK_KEY < /path/to/AuthKey_XXXXXXXXXX.p8
```
```
npm run deploy
```
- [ ] Then, on build 7 without Premium: the Coach asks for consent, gives 3 answers, then shows the paywall.
- [ ] If DeviceCheck is turned on, add a line to the review notes (§3): "Free Coach answers are tied to the device with
      Apple DeviceCheck."

## 3. App Store Connect: done by CLI on 2026-10-09
- App Review details: contact Pawan Kumar, phone set, email kindcodelabs@gmail.com, no sign-in needed, and review notes
  (about 2,100 characters, replaced on 2026-10-19 by the text in docs/launch.md §6; they explained Premium and the 28-day grid, the Coach and its consent screen, the camera
  mirror, the man/woman pictures, reminders, languages and safety. DeviceCheck is not mentioned because it is off).
- App Privacy is published with four labels, all App Functionality, not linked to you, no tracking: User ID,
  Purchase History, Other User Content and Fitness.
- Build 1.0.0 (7) is attached to version 1.0 (EAS build `71b07554`, ASC build `e8f5b8d4`, VALID, also in internal
  TestFlight). Builds 3–6 must not be used (§1).
- Release type: **MANUAL** (after approval, nothing goes live until the owner presses Release).
- `asc validate`: 0 blocking. The remaining warnings are subscription promotional images (optional) and the iPad
  notice (the app is iPhone-only).

**To redo after the App Review fixes of 2026-10-09** (docs/app-review.md §3; text and labels can be written directly,
then shown to the owner):
- [x] **Deploy the Worker (AI):** done 2026-10-09 (version `810fd0ee`); `/privacy` and `/terms` show "Last updated
      October 9, 2026". From `worker/`, `npm run deploy` (it deploys `facerep-api` only). The privacy
      policy (the providers' equal-protection sentence) and the terms (unlimited Coach for personal use, with fair use)
      changed, and the daily ceiling went from 40 to 100 per person (300 per IP), so Premium is really unlimited.
      The Coach's instructions now call skincare "face care".
      Check that `/privacy` and `/terms` show "Last updated October 9, 2026".
- [x] **German store description (AI, de-DE only):** uploaded 2026-10-09. the Premium line is now "Unbegrenzte Antworten vom KI-Coach"
      (it said "Unbegrenzt Antworten", a grammar mistake). Upload the German description from docs/store-listing.md.
      The other languages and the review notes ("with Premium it is unlimited") stay as they are.
- [x] **Screenshot 8 (AI), all seven locales:** done 2026-10-09 (each set re-uploaded 01→08 with `--replace
      --confirm`; 01–07 are the same files as before). the Coach now says "face care" instead of "skincare", so slide 8
      was rebuilt. Upload `store-screenshots/export/<lang>/08.jpg` in place of the current 08 for each locale (as for
      slide 5: `--replace --confirm`). Slides 1–7 didn't change.
- [x] **App Privacy (AI, asc web session):** done 2026-10-10, published with four labels. Added a fourth label, **Fitness** (App Functionality, not linked, no
      tracking), then publish again. The streak and the number of workouts this week go with every Coach question,
      the same "to be safe" reason as Other User Content, and the privacy manifest (since build 5) declares it.

## 3b. Must be done by hand (the API can't do these)
- [x] **Medical device declaration:** the owner declared "No" on 2026-10-10 (status COLLECTED). Was: App Store Connect → FaceRep → App Information
      → Regulations and Permits → "Is this app a regulated medical device?" → **No** (FaceRep is fitness and wellness,
      not medical). The asc web session can also set it: `./.tools/asc web apps medical-device set --app 6820638812
      --declared false`, but only with the owner's OK, because it is a legal declaration.
- [ ] **Subscriptions on the 1.0 page:** version 1.0 → "In-App Purchases and Subscriptions" → select Premium Weekly,
      Monthly and Yearly. Without them the reviewer can't buy Premium and the app is rejected.
      On 2026-10-10 `./.tools/asc web review subscriptions attach` refused all three: the website side reports them as
      MISSING_METADATA, while the public API and RevenueCat say READY_TO_SUBMIT, with every field filled in (7 languages,
      prices in 175 territories, review screenshot and notes, group names, and the promotional images uploaded the same day).
      The owner opens Subscriptions → FaceRep Premium → each one on the website to see what it flags.
      Still the same on 2026-10-19: the website side says MISSING_METADATA, while the public API says READY_TO_SUBMIT,
      each subscription's version 1 is READY_FOR_REVIEW and `./.tools/asc review doctor` finds no blockers. Selecting them
      on the 1.0 page is the real test.
- [x] **Screen recording for App Review** (owner, 2026-10-20: FaceRep-1.0-build14-review-under50.mp4, COMPLETE): build 1.0 (14) on the iPhone, attached under 1.0 → App Review
      Information → Attachment. Then a line in the review notes says what it shows. Nothing attached on 2026-10-19.
- [x] **Test build 14 on the iPhone** (TestFlight, attached to 1.0), including a sandbox purchase and Restore (§1).
      Done by the owner on 2026-10-19: RevenueCat shows Premium Weekly bought in the sandbox from the iPhone at 15:09 IST
      (Premium active; TestFlight renews it every day). The only other Premium is a 3-day promotional grant to a
      Simulator ID (ends 2026-10-21).
- [ ] **Submit:** only the owner presses "Add for Review" and then "Submit to App Review".

## 4. Account checks (owner, App Store Connect web)
- [x] **Paid Apps Agreement, tax and banking** are active in Business. They are needed for subscriptions. Apple updated
      the Paid Applications Schedule (banner on 2026-10-18), and the owner accepted it (§1d). On 2026-10-19 there was no
      agreement banner, and the sandbox purchase went through (products don't load without an active Paid Apps
      agreement).
- [ ] Optional (recommended): send App Store Server Notifications to RevenueCat, so renewals and cancellations reach
      it right away. Copy the URL from RevenueCat → FaceRep (App Store) app settings, and paste it into ASC → App
      Information → App Store Server Notifications, for both production and sandbox.

## 5. Submit (owner only, never an AI)
- [ ] After §3b: the owner checks the summary on the 1.0 page and submits. After approval: release (if manual), then watch RevenueCat and the
      Worker logs.

## Not needed for 1.0
- Product Page Optimization tests, Custom Product Pages (the women-focused page in docs/launch.md §3 can come later),
  In-App Events, promo codes, subscription promotional images (warnings only).
- The external TestFlight group "FaceRep Testers" (it needs beta review details and a phone number). The internal
  group is enough.
- Trademark searches (IP India, TMview, WIPO) and filing, for the name and the logo (image search in TMview and WIPO for
  the logo): recommended soon, but not a submission blocker.
