# Publish FaceRep 1.0 to the App Store: TODO

State checked on 2026-10-09 (after commit `ca5b8f0`) with the asc CLI, the RevenueCat MCP, wrangler and the Expo MCP.
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
  commit `a9f8761`, so build 4 (§1, with the new icon) replaces it.

## 0. Owner decisions still open
- **DeviceCheck at launch** (recommended: yes, see §2).
- **EU trader status (DSA): left undeclared on purpose for now.** Declaring as a trader shows the address, phone and email
  publicly on EU store pages. Until it is declared, App Store Connect marks the **27 EU countries "TRADER_STATUS_NOT_PROVIDED"**,
  and the app is not sold there (Spain, Germany, France, Italy and the rest of the EU). It is an account-wide setting
  (Business → Compliance), shared with Elowa. Don't change it without the owner.

## 1. Build 4 and device test (AI builds, owner tests)
The app icon changed after build 3 (new logo, brand/README.md). The App Store takes the icon from the build, so
**build 4 is the one to test and submit**. Build 3 has the old icon: fine for early tests, never attach it to 1.0.

- [ ] From `app/`, run `npx eas-cli@latest build --profile production --platform ios --auto-submit --non-interactive`,
      or use the Expo MCP `build_run`. Credentials are stored now, so it asks no questions. The build number becomes 4
      (or the next free number).
- [ ] Wait until App Store Connect shows build 4 as VALID and in the internal TestFlight group.
- [ ] The owner tests build 4 with the checklist in docs/device-testing.md §3, including the sandbox purchases:
  - buy Weekly, Monthly, and Yearly with the trial;
  - Weeks 2–4 load from the Worker's `/plan`, and the Coach is unlimited;
  - delete the app, reinstall, then Restore works;
  - the purchase shows in RevenueCat → Customers (sandbox).
- [ ] Compare each store screenshot with the same screen on build 4. The slides come from the web build made to look
      like the iPhone, so icons or layout could differ slightly. If a screen differs, re-run the capture
      (store-screenshots/README.md).
- [ ] Optional: replace the subscription review screenshot (a paywall rendered from the web build) with a real paywall
      screenshot from build 4: `./.tools/asc subscriptions review screenshots create --subscription-id <id> --file <png>`.
- [ ] Optional: delete the local branch `backup/weekly-local-29d96e7` if the owner agrees.

## 2. Worker: DeviceCheck (owner runs, after build 4 is on TestFlight)
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
- [ ] Then, on build 4 without Premium: the Coach asks for consent, gives 3 answers, then shows the paywall.
- [ ] If DeviceCheck is turned on, add a line to the review notes (§3): "Free Coach answers are tied to the device with
      Apple DeviceCheck."

## 3. App Store Connect: done by CLI on 2026-10-09
- App Review details: contact Pawan Kumar, phone set, email kindcodelabs@gmail.com, no sign-in needed, and review notes
  (about 2,100 characters; they explain Premium and the 28-day grid, the Coach and its consent screen, the camera
  mirror, the man/woman pictures, reminders, languages and safety. DeviceCheck is not mentioned because it is off).
- App Privacy is published with three labels, all App Functionality, not linked to you, no tracking: User ID,
  Purchase History and Other User Content.
- Build 1.0.0 (4), with the new icon, is attached to version 1.0 (EAS build `a7f413e0`, ASC build `e44c1b04`,
  VALID, also in internal TestFlight). Build 3 has the old icon and must not be used.
- Release type: **MANUAL** (after approval, nothing goes live until the owner presses Release).
- `asc validate`: 0 blocking. The remaining warnings are subscription promotional images (optional) and the iPad
  notice (the app is iPhone-only).

## 3b. Must be done by hand (the API can't do these)
- [ ] **Medical device declaration** (required, status PENDING_COLLECTION): App Store Connect → FaceRep → App Information
      → Regulations and Permits → "Is this app a regulated medical device?" → **No** (FaceRep is fitness and wellness,
      not medical). The asc web session can also set it: `./.tools/asc web apps medical-device set --app 6820638812
      --declared false`, but only with the owner's OK, because it is a legal declaration.
- [ ] **Subscriptions on the 1.0 page:** version 1.0 → "In-App Purchases and Subscriptions" → select Premium Weekly,
      Monthly and Yearly. First subscriptions can only be added to a review on the version page in the website, not
      through the API. Without them the reviewer can't buy Premium and the app is rejected.
- [ ] **Test build 3 on the iPhone** (TestFlight), including a sandbox purchase and Restore (§1).
- [ ] **Submit:** only the owner presses "Add for Review" and then "Submit to App Review".

## 4. Account checks (owner, App Store Connect web)
- [ ] **Paid Apps Agreement, tax and banking** are active in Business. They are needed for subscriptions, and are
      expected to be active already because Elowa sells subscriptions.
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
