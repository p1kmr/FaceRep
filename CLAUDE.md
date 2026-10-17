# FaceRep: rules for AI coding assistants

Facial-fitness iOS app for men and women: **FaceRep** (App Store name "FaceRep: Face Yoga & Jawline", bundle ID `com.p1kmr.facerep`).
Expo (React Native) + Expo Router + TypeScript (strict). Same architecture as the owner's Elowa app.

## Behavior
- The owner is a **web developer** (React). Explain iOS / React Native differences when they matter. **Don't just agree**: if a request is wrong for iOS, a privacy risk or against App Store rules, say so and propose the right approach.
- Keep dependencies minimal. `npx expo install` for native modules; no global installs. Justify every new dependency.
- Never add analytics, ads or tracking SDKs. Never put secrets in the app (only `EXPO_PUBLIC_*` public values).

## Architecture (docs/architecture.md)
- `src/app/`: routes only, thin. Logic lives in hooks and services.
- `src/state/<domain>/`: `types.ts`, `actions.ts`, `reducer.ts` (pure), `selectors.ts`, `<Domain>Provider.tsx` with **separate state and dispatch contexts**.
- `src/hooks/`: the public API screens use (`useSettings`, `usePremium`, `useProgressSummary`, `useWorkout`, `useChat`, `useTheme`).
- `src/services/`: side effects (SQLite, purchases, AI, notifications) and pure engines (`workout/timer.ts`, `workout/routine.ts`, `progress/stats.ts`).
- `src/constants/`: all configuration (theme tokens, exercises, limits, links, config, storage keys).
- Only `services/purchases/purchases.ts` imports `react-native-purchases`. Only `services/db` and the repos talk SQL.
- Split a file when it passes ~200 lines or has more than one job.

## Hard rules
- **Theme:** no color literals outside `src/constants/theme/`. Use `useTheme()` / `makeStyles`. Light and dark must both work.
- **Text:** no hard-coded user-visible strings; `t('namespace:key')`. `{{app}}` = the app name (constants/config.ts). Six languages (en, es, pt-BR, de, fr, it; docs/i18n.md): a new or changed English text needs the same key in every `locales/<code>/`, and `npm run i18n:check` must pass. Never make a translation stronger than the English (health, subscription text).
- **Images:** pictures live in `app/assets/guides/<man|woman>/` by exercise ID (never by plan week or day; see docs/images.md). Add files and run `npm run images`; never edit `constants/guideImages.generated.ts` by hand. Components get pictures from `useGuideImages()`. The Man/Woman choice is display-only and never leaves the device.
  Exercise clips: `videos/` (README there), made only by `videos/tools/make.py` from these drawings; never AI video (it changes the face; docs/videos.md).
  In the app they are `clip.mp4` in the exercise folders, copied by `videos/tools/app.py`; `ExerciseClip` plays them (expo-video), the drawings stay the cover and the Reduce Motion fallback.
  The face map (`map/` per guide: grey face + one red layer per area) is made by `videos/tools/facemap.py` from the drawings; never by hand, never AI, and never from a photo of the user.
- **Dates:** `'YYYY-MM-DD'` strings, math via `utils/dates.ts`. Reducers never call `Date.now()`.
- **Health/safety claims:** never promise results, never claim bone/face-shape changes, never medical claims (App Store 1.4.1, 2.3.1). Keep the safety points (welcome line, Settings → Exercise safety) and the jaw caution (exercise page, and in the workout player before a jaw exercise starts). Onboarding has no blocking safety or reminder step.
- **AI:** no Coach question goes to the Worker before AI consent (guideline 5.1.2(i)). The model and its keys live only in `worker/`.
- **Face tracking** (the mirror's move check, docs/face-tracking.md): Apple's ARKit on the device only, through `services/faceTracking.ts` (the only import of `modules/face-tracking`). Face data is never stored or sent, and it measures movement, never face shape or a score. Jaw-caution and hands-on exercises stay unfollowed. Keep the privacy policy's "Face data" paragraph and the camera purpose string true.
- **Reminders:** at most 10, scheduled as repeating local notifications (≤ 60, iOS keeps 64). The Coach only *proposes* reminder changes; nothing changes until the user taps Confirm on the card.
- **Coach workouts:** the Coach only *proposes* saving a workout done without the app or a routine to start (`worker/src/lib/workouts.js`); the app works out what is saved (`services/progress/log.ts`), shows it on the card, and saves or starts nothing until Save / Start. A saved workout is that date's workout in the weeks (one per date).
- **Weeks** (docs/architecture.md "The weeks"): Today's workout goes on in weeks that never end, worked out on the iPhone from the saved workouts (`services/workout/weeks.ts`, `today.ts`; numbers in `constants/weeks.ts`) and never sent. Never show a total ("of 4", "28 days"), never promise new content or results for a week. Jaw-caution exercises stay out of week 1 and the easy day (day 7), and never go above their usual reps or hold. The weeks are free; Premium adds every exercise to them and to the library, and unlimited Coach answers. Never show how many exercises there are (Today, paywall, store text, screenshots): "every exercise". A new exercise also goes into `worker/src/lib/catalog.js` (the Coach may only name those; a test checks both).
- **SQLite schema:** never edit a shipped migration in `services/db/migrations.ts`; append a new one.
- **Tests:** every change to a reducer or a pure service needs tests.

## App Review (Apple's guidelines)
- Every change must pass Apple's App Review Guidelines. Before adding or changing a feature, text, permission, purchase,
  data sent off the iPhone, screenshot or store text, check the matching areas in **docs/app-review.md** (the
  `app-review` skill is the procedure). If a request would be rejected, say so with the guideline number and propose the
  allowed way.
- `npm test` includes `npm run review:check`: claim words in all six languages, the paywall's required parts, the free limit
  matching the Worker, the "unlimited" Coach staying true (a hidden fair-use ceiling of 100+ a day), no tracking SDKs. Never weaken it to make a change pass.

## Brand
- Headlines and big numbers use Anton (SIL OFL, `app/assets/fonts/`) via `AppText variant="brand"`; the main button is the brand gradient (`primary` → `primaryEnd`). docs/architecture.md "The look".
- The logo is the barbell smile. `brand/logo.mjs` makes every icon file (README there); never edit the PNGs in
  `app/assets/brand/` by hand. No text, Apple artwork or other apps' look in the icon. A new icon needs a new build.

## Store screenshots
- `store-screenshots/` (README there; the method, design recipe and checklist in **docs/screenshots.md**, the
  `facerep-screenshots` skill is the procedure): the App Store screenshots, captured from the real app (web capture or
  iOS Simulator) with demo data and laid out in the editor. Words in `capture/copy.js` follow the Text and Health rules; slides with Premium content say what is free.
  After changing a screen they show (Today, workout player, exercise page, Progress, Coach, onboarding), re-run the capture.

## Commands
```bash
cd app && npx expo start          # Expo Go / dev build; --tunnel on restrictive networks
npm run lint && npm run typecheck && npm test
cd ../worker && npm test
```
