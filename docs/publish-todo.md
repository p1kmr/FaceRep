# Publish FaceRep 1.0 to the App Store: TODO

State checked on 2026-10-09 (after commit `ca5b8f0`) with the asc CLI, the RevenueCat MCP, wrangler and the Expo MCP.
Re-check before acting: from the repo root run
`./.tools/asc validate --app 6820638812 --version-id 7edc84f2-a25e-4553-a918-45a254d06399`
(2 blocking issues on 2026-10-09: App Review details and the build, both in §3).

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
| Worker | `facerep-api`, https://facerep-api.elowa-app.workers.dev (`/privacy`, `/terms`, `/support`, `/chat`, `/plan`) |
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
  docs/store-listing.md (es-MX and es-ES share the Spanish text):
  - name, subtitle and privacy policy URL; the en-US name is `FaceRep: Face Yoga & Jawline`;
  - description, keywords, promotional text, and the support URL `https://facerep-api.elowa-app.workers.dev/support`.
    No What's New, because Apple doesn't allow it on a first version;
  - 8 screenshots each, 01→08, from `store-screenshots/export/<lang>/` at 1320 × 2868 (6.9" iPhone, API type
    APP_IPHONE_67). iPhone only, so the iPad notice in `asc validate` doesn't apply (`supportsTablet` is false).
  - Slide 5 shows both her and his camera mirror. A woman-only or man-only version is a quick rebuild; upload it with
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
  commit `a9f8761`, so build 3 (§1) replaces it.

## 0. Owner decisions still open
- **Release after approval:** manual (the owner presses Release) or automatic. Phased release is already on.
- **DeviceCheck at launch** (recommended: yes, see §2).
- **EU trader status (DSA): left undeclared on purpose for now.** Declaring as a trader shows the address, phone and email
  publicly on EU store pages. Until it is declared, App Store Connect marks the **27 EU countries "TRADER_STATUS_NOT_PROVIDED"**,
  and the app is not sold there (Spain, Germany, France, Italy and the rest of the EU). It is an account-wide setting
  (Business → Compliance), shared with Elowa. Don't change it without the owner.

## 1. Build 3 and device test (AI builds, owner tests)
- [ ] From `app/`, run `npx eas-cli@latest build --profile production --platform ios --auto-submit --non-interactive`,
      or use the Expo MCP `build_run`. Credentials are stored now, so it asks no questions. The build number becomes 3.
- [ ] Wait until App Store Connect shows build 3 as VALID and in the internal TestFlight group.
- [ ] The owner tests build 3 with the checklist in docs/device-testing.md §3, including the sandbox purchases:
  - buy Weekly, Monthly, and Yearly with the trial;
  - Weeks 2–4 load from the Worker's `/plan`, and the Coach is unlimited;
  - delete the app, reinstall, then Restore works;
  - the purchase shows in RevenueCat → Customers (sandbox).
- [ ] Compare each store screenshot with the same screen on build 3. The slides come from the web build made to look
      like the iPhone, so icons or layout could differ slightly. If a screen differs, re-run the capture
      (store-screenshots/README.md).
- [ ] Optional: replace the subscription review screenshot (a paywall rendered from the web build) with a real paywall
      screenshot from build 3: `./.tools/asc subscriptions review screenshots create --subscription-id <id> --file <png>`.
- [ ] Optional: delete the local branch `backup/weekly-local-29d96e7` if the owner agrees.

## 2. Worker: DeviceCheck (owner runs, after build 3 is on TestFlight)
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
- [ ] Then, on build 3 without Premium: the Coach asks for consent, gives 3 answers, then shows the paywall.
- [ ] If DeviceCheck is turned on, add a line to the review notes (§3): "Free Coach answers are tied to the device with
      Apple DeviceCheck."

## 3. App Store Connect (still to do)
- [ ] **App Review contact (owner, in the App Store Connect web page):** version 1.0 → App Review Information → first
      name, last name, phone, email; "Sign-in required" off. Apple requires the phone and email, but only App Review
      sees them (they are not shown on the store). The owner types them in directly, so they never go through an AI.
- [ ] **Review notes (AI, after the contact exists):** `./.tools/asc review details-update --id <detail id> --notes
      @file:<notes file>` with the text below, or the owner pastes it into the Notes box. It is about 2,100 characters
      (the limit is 4,000). DeviceCheck is not mentioned because it is off.

```
FaceRep is a facial-fitness app: guided face exercises with a hold/relax timer and a 28-day plan. There is no account or sign-in.

PREMIUM AND THE 28-DAY PLAN
Week 1 of the plan is free. Weeks 2–4 are Premium (auto-renewing subscription: weekly, monthly, or yearly with a 7-day free trial). You can't wait 7 days to reach Week 2, so: on Today, tap any locked day in the 28-day grid to open the paywall and buy with the sandbox account. The days load from our server right after the purchase; tap any day (for example Day 15) to see its exercises and start it. Settings → Restore purchases restores the purchase.

AI COACH
The floating button opens the Coach, which answers questions about the exercises. It runs on Cloudflare Workers AI through our own server. Before the first question, a consent screen explains what is sent and asks for permission; nothing is sent before that. Without Premium there are 3 free answers a month, then the paywall; with Premium it is unlimited. The Coach does not diagnose and does not rate looks. It can propose reminder changes, which only apply after the user taps Confirm.

CAMERA MIRROR
In the workout player, the person button (or Settings → Mirror in workouts) shows the front camera next to the exercise drawing so people can check their form. The camera permission is asked only then. The picture is only shown live: it is never recorded, saved or sent.

OTHER
• Onboarding asks whether the exercise pictures show a man or a woman (display only, stays on the device; Settings → Exercise pictures).
• Reminders: Settings → Reminders. Local notifications the user sets up; notification permission is asked when one is turned on.
• Languages: English, Spanish, Portuguese (Brazil), German, French and Italian. The app follows the iPhone's language; Settings → Language opens the app's language page in the Settings app.
• Safety: a safety line on the welcome screen, Settings → Exercise safety, and a jaw caution before jaw exercises. FaceRep is a fitness and wellness app, not medical advice.
• The exercise drawings and photos are AI-generated and show fictional people.
```

- [ ] **App Privacy** (empty and unpublished): the asc web session expired, so the owner logs in again first (Apple asks
      for a two-factor code):
      ```
      ./.tools/asc web auth login
      ```
      Then use `./.tools/asc web privacy catalog`, `plan`, `apply` and `publish`.
  - Declare per docs/launch.md §6: User ID (not linked to identity), Purchases, and Other User Content (Coach
    questions, processed but not stored). All are for App Functionality, and none is used for tracking.
  - Workout history, reminders and the camera picture stay on the device, so they are not collected.
  - Publish. `asc validate` can't see this, so confirm it on the App Privacy page.
- [ ] **Build:** attach build 3 to version 1.0.
- [ ] **Subscriptions on the 1.0 page:** under "In-App Purchases and Subscriptions", select the three subscriptions.
      The first subscriptions must be submitted with the first version; otherwise the reviewer can't buy Premium and
      the app is rejected.
- [ ] **Release option:** manual or automatic, per §0.
- [ ] Re-run `asc validate` until it shows 0 blocking errors. The subscription "promotional image" warnings can stay.

## 4. Account checks (owner, App Store Connect web)
- [ ] **Paid Apps Agreement, tax and banking** are active in Business. They are needed for subscriptions, and are
      expected to be active already because Elowa sells subscriptions.
- [ ] Optional (recommended): send App Store Server Notifications to RevenueCat, so renewals and cancellations reach
      it right away. Copy the URL from RevenueCat → FaceRep (App Store) app settings, and paste it into ASC → App
      Information → App Store Server Notifications, for both production and sandbox.

## 5. Submit (owner presses Submit)
- [ ] Create one review submission that holds version 1.0, the subscription group version `136d3d83-…`, and the
      three subscription versions (weekly `04e85350-…`, monthly `1e936df0-…`, yearly `c17a8546-…`). Use
      `asc review items add --item-type subscriptionGroupVersions` or `subscriptionVersions`. Selecting the subscriptions
      on the 1.0 page (§3) does the same thing in the web page.
- [ ] The owner checks the summary and submits. After approval: release (if manual), then watch RevenueCat and the
      Worker logs.

## Not needed for 1.0
- Product Page Optimization tests, Custom Product Pages (the women-focused page in docs/launch.md §3 can come later),
  In-App Events, promo codes, subscription promotional images (warnings only).
- The external TestFlight group "FaceRep Testers" (it needs beta review details and a phone number). The internal
  group is enough.
- Trademark searches (IP India, TMview, WIPO) and filing: recommended soon, but not a submission blocker.
