# FaceRep: facial fitness for men (iOS)

Guided face workouts for jawline, cheekbones and eyes, with a realistic 3D anatomy figure whose working muscle lights up
red, a hold/relax timer, streaks, and a paid **AI Coach** for face-training and basic skincare questions.
Built with **Expo (React Native)**, the same architecture as Elowa.

App Store name: **FaceRep: Jawline Exercises** · bundle ID `com.p1kmr.facerep` (working name was FaceKit, which is taken; see `docs/launch.md`).
The name lives in `CONFIG.appName` (`app/src/constants/config.ts`), `app/app.json` and `APP_NAME` in `worker/wrangler.jsonc`.

- **No login.** A random ID in the Keychain identifies the user (docs/premium.md).
- **On-device data.** Workouts, chat history and settings live in SQLite on the iPhone (`expo-sqlite`).
- **Free exercises, paid AI.** Premium (RevenueCat) unlocks unlimited Coach answers; free users get 3 a month.
- **AI on Cloudflare.** The Coach runs through our Worker on Workers AI; no AI key in the app.

## Repository layout
```
facerep/
├── app/       ← Expo app (iOS)
│   ├── src/app/          routes (Expo Router)            ├── src/state/      Context + useReducer per domain
│   ├── src/components/   reusable UI (ui/, exercise/…)   ├── src/hooks/      public API for screens
│   ├── src/constants/    config, theme tokens, exercises ├── src/services/   SQLite, purchases, AI, notifications, pure engines
│   ├── assets/           exercise renders, hero photos   └── modules/device-check   local Swift module (Apple DeviceCheck)
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
Purchases, DeviceCheck and notifications need a **development build** (`npx eas-cli build --profile development --platform ios`).

## Checks
```bash
cd app && npm run lint && npm run typecheck && npm test     # 82 tests
cd ../worker && npm test                                     # 32 tests
```

## Before the first TestFlight build
- [ ] Trademark search for "FaceRep" in India (tmsearch.ipindia.gov.in) and the EU (TMview); then the App Store Connect app record with bundle ID `com.p1kmr.facerep` (reserves the name) and `npx eas-cli init` (adds `extra.eas.projectId`).
- [ ] Real app icon (`app/assets/images/icon.png` is a placeholder).
- [ ] Worker deployed: `cd worker && npx wrangler login && npm run deploy` (URL already in `app/eas.json` and `links.ts`; D1 already created). Support email in `links.ts` and `wrangler.jsonc`.
- [x] RevenueCat project "FaceRep" (entitlement `premium`, products `facerep_premium_monthly` / `facerep_premium_yearly`, offering with `$rc_monthly` and `$rc_annual`); public key in `app/eas.json`. Still: App Store Connect keys in RevenueCat, and the same product IDs in App Store Connect.
- [ ] Worker secrets: `REVENUECAT_SECRET_KEY` (without it Weeks 2–4 stay locked for everyone), `IP_HASH_SECRET`, then DeviceCheck.
- [ ] App Privacy answers, age rating, review notes (docs/launch.md).
