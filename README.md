# FaceRep: facial fitness for men and women (iOS)

Guided face workouts for jawline, cheekbones, lips, eyes and face massage, with an anatomy drawing (a man or a woman)
whose working muscle lights up red, a hold/relax timer with voice cues, an optional camera mirror, streaks, and a paid
**AI Coach** for face-training and basic skincare questions.
Built with **Expo (React Native)**, the same architecture as Elowa.

App Store name (draft): **FaceRep: Face Yoga & Jawline** · bundle ID `com.p1kmr.facerep` (working name was FaceKit, which is taken; see `docs/launch.md`).
The name lives in `CONFIG.appName` (`app/src/constants/config.ts`), `app/app.json` and `APP_NAME` in `worker/wrangler.jsonc`.

- **No login.** A random ID in the Keychain identifies the user (docs/premium.md).
- **On-device data.** Workouts, chat history and settings live in SQLite on the iPhone (`expo-sqlite`).
- **Free exercises, paid AI.** Premium (RevenueCat) unlocks unlimited Coach answers; free users get 3 a month.
- **AI on Cloudflare.** The Coach runs through our Worker on Workers AI; no AI key in the app.
- **Six languages.** English, Spanish, Portuguese (Brazil), German, French and Italian (docs/i18n.md); App Store text per language in docs/store-listing.md.

## Repository layout
```
facerep/
├── app/       ← Expo app (iOS)
│   ├── src/app/          routes (Expo Router)            ├── src/state/      Context + useReducer per domain
│   ├── src/components/   reusable UI (ui/, exercise/…)   ├── src/hooks/      public API for screens
│   ├── src/constants/    config, theme tokens, exercises ├── src/services/   SQLite, purchases, AI, notifications, pure engines
│   ├── assets/           exercise drawings, hero photos  └── modules/device-check   local Swift module (Apple DeviceCheck)
├── worker/    ← Cloudflare Worker: AI Coach API + privacy/terms/support pages
└── docs/      ← architecture, premium, launch (name, ASO, App Store rules, trademarks)
```

## Run it
```bash
cd app
npm install
npx expo start            # scan the QR code with the iPhone camera (Expo Go)
npx expo start --web      # quick look in a browser (SF Symbols and the native tab bar only show on iOS)
```
Purchases, DeviceCheck, notifications, the camera mirror and voice cues need a **development build**: steps and a test checklist in [docs/device-testing.md](docs/device-testing.md). This version added native packages (camera, speech, keep-awake) and languages, so an older development build must be rebuilt.

## Checks
```bash
cd app && npm run lint && npm run typecheck && npm test     # 106 tests (includes the picture and language checks)
cd ../worker && npm test                                     # 34 tests
```

## Before the first TestFlight build
- [ ] Trademark search for "FaceRep" in India (tmsearch.ipindia.gov.in) and the EU (TMview); then the App Store Connect app record with bundle ID `com.p1kmr.facerep` (reserves the name) and `npx eas-cli init` (adds `extra.eas.projectId`).
- [ ] Real app icon (`app/assets/brand/icon.png` is a placeholder).
- [ ] Decide the App Store name (draft `FaceRep: Face Yoga & Jawline`, docs/launch.md §3) and have a native speaker check the five translations and store texts (docs/store-listing.md).
- [ ] Worker deployed (always before an app release that adds exercises or focus areas): `cd worker && npx wrangler login && npm run deploy` (URL already in `app/eas.json` and `links.ts`; D1 already created). Support email `kindcodelabs@gmail.com` in `links.ts` and `wrangler.jsonc`.
- [x] RevenueCat project "FaceRep" (entitlement `premium`, products `facerep_premium_weekly` / `facerep_premium_monthly` / `facerep_premium_yearly`, offering with `$rc_weekly`, `$rc_monthly` and `$rc_annual`); public key in `app/eas.json`. App Store Connect keys are in RevenueCat, and the same three product IDs are in App Store Connect ($1.99 weekly, $3.99 monthly, $29.99 yearly with a 7-day trial; docs/premium.md §6).
- [ ] Worker secrets: `REVENUECAT_SECRET_KEY` (without it Weeks 2–4 stay locked for everyone), `IP_HASH_SECRET`, then DeviceCheck.
- [ ] App Privacy answers, age rating, review notes (docs/launch.md).
