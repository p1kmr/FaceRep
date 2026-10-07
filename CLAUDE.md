# FaceRep: rules for AI coding assistants

Facial-fitness iOS app for men: **FaceRep** (App Store name "FaceRep: Jawline Exercises", bundle ID `com.p1kmr.facerep`).
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
- **Text:** no hard-coded user-visible strings; `t('namespace:key')`. `{{app}}` = the app name (constants/config.ts).
- **Images:** pictures live in `app/assets/guides/<man|woman>/` by exercise ID (never by plan week or day; see docs/images.md). Add files and run `npm run images`; never edit `constants/guideImages.generated.ts` by hand. Components get pictures from `useGuideImages()`. The Man/Woman choice is display-only and never leaves the device.
- **Dates:** `'YYYY-MM-DD'` strings, math via `utils/dates.ts`. Reducers never call `Date.now()`.
- **Health/safety claims:** never promise results, never claim bone/face-shape changes, never medical claims (App Store 1.4.1, 2.3.1). Keep the safety screen and jaw caution.
- **AI:** no Coach question goes to the Worker before AI consent (guideline 5.1.2(i)). The model and its keys live only in `worker/`.
- **Reminders:** at most 10, scheduled as repeating local notifications (≤ 60, iOS keeps 64). The Coach only *proposes* reminder changes; nothing changes until the user taps Confirm on the card.
- **Premium plan:** Weeks 2–4 and Levels 2+ are built only by `worker/src/lib/plan.js` and sent by `POST /plan` after the Worker checks RevenueCat. Never bundle them in the app. `POST /plan` sends only the random app ID, goal, level and the app's `CATALOG_VERSION` (no AI, no history). When exercises are added, bump `CATALOG_VERSION` in `constants/exercises.ts` and `worker/src/lib/plan.js` together and give the new catalog entries that version, so older apps are never planned exercises they don't have.
- **SQLite schema:** never edit a shipped migration in `services/db/migrations.ts`; append a new one.
- **Tests:** every change to a reducer or a pure service needs tests.

## Commands
```bash
cd app && npx expo start          # Expo Go / dev build; --tunnel on restrictive networks
npm run lint && npm run typecheck && npm test
cd ../worker && npm test
```
