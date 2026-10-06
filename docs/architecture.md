# Architecture

Same layout as Elowa: layer folders (`state`, `hooks`, `services`, `constants`, `components`) with a sub-folder per domain.

## Folder map
```
app/src/
├── app/            Routes (Expo Router). Thin: read hooks, render components. No business logic.
│   ├── _layout.tsx          providers, splash, Stack with onboarding guard
│   ├── onboarding/          welcome → goal → safety → reminder
│   ├── (tabs)/              Today · Exercises · Coach · Progress · Settings (native iOS tab bar)
│   ├── exercise/[id].tsx    exercise detail
│   ├── workout.tsx          the guided player (full-screen modal)
│   └── paywall, ai-consent, safety (modals)
├── components/     ui/ (AppText, Button, Card, Chip, Badge, IconButton, ProgressRing, Screen, Segmented…),
│                   exercise/, today/, progress/, coach/, paywall/, onboarding/, settings/
├── constants/      config.ts, theme/, exercises.ts, exerciseImages.ts, limits.ts, links.ts, storageKeys.ts…
├── state/          settings/, premium/, progress/, chat/  (+ AppProviders.tsx)
├── hooks/          useSettings, usePremium, usePaywall, useProgress*, useWorkout, useRoutine, useChat, useTheme…
├── services/       db/ (SQLite), storage/kv.ts, progress/, chat/, purchases/, ai/, notifications/, workout/ (pure)
├── theme/          ThemeProvider + makeStyles
├── i18n/           i18next + locales/en/*.json
└── utils/          dates, format, ids
```

## How data flows
```
Screen (app/) ──uses──► hook (useProgressSummary) ──reads──► Context (state/progress)
     │                                                              ▲
     └──calls──► hook action (useSaveWorkout) ──► SQLite insert ──► dispatch(sessionAdded) ──► reducer (pure)
```
Screens never import services with side effects directly; they go through hooks.

## One domain = one folder (same shape everywhere)
```
state/progress/
├── types.ts             ProgressState
├── actions.ts           'progress/sessionAdded' constants + typed action creators
├── reducer.ts           pure (state, action) => state. No async, no SQL, no Date.now()
├── selectors.ts         derived data (streak, this week, totals)
├── ProgressProvider.tsx useReducer + hydrate from SQLite + TWO contexts (state, dispatch)
└── __tests__/reducer.test.ts
```
1. **Two contexts per domain** (`…StateContext`, `…DispatchContext`): components that only dispatch don't re-render on state changes.
2. **Reducers are pure.** Dates and ids come in the action payload.
3. **Persistence lives in the Provider or the hook action**, never in the reducer.
4. **Hydration:** Providers load from SQLite, then dispatch `HYDRATE`. `useHydration()` keeps the splash up until settings and progress are loaded.

## Storage: SQLite (`expo-sqlite`)
| Table | What | Who writes |
|---|---|---|
| `kv` | small JSON values: settings, app ID copy, AI usage (versioned envelope) | `services/storage/kv.ts` |
| `sessions` + `session_exercises` | finished workouts | `services/progress/sessionsRepo.ts` |
| `chat_messages` | Coach history (last 200) | `services/chat/chatRepo.ts` |

Schema changes: append to `services/db/migrations.ts` (tracked with `PRAGMA user_version`); never edit a shipped entry.

## The workout player
`services/workout/timer.ts` is a pure state machine (`ready → hold → relax → … → rest → … → done`), ticked once a second
by `useWorkout()`. The 3D figure is two still renders (relaxed / exercise) crossfaded with Reanimated on every phase
change, so the face is identical and the app stays small (no video). Leaving the app pauses the workout.

## React (web) → React Native: what changes
| You know (React web) | In this app |
|---|---|
| `div`, `span`, `p` | `View`, `AppText` (all text must be inside `<Text>`) |
| CSS files, Tailwind, cascade | `makeStyles((theme) => ({…}))` → `StyleSheet`; no cascade, no `px` (points) |
| Flexbox default `row` | default is **`column`** |
| `onClick`, hover | `onPress` (`Pressable`), pressed states + haptics; no hover |
| React Router | **Expo Router**: files in `src/app/` are routes, `_layout.tsx` = navigator |
| Context + `useReducer` + custom hooks | **identical** (that's the whole state layer here) |
| `localStorage` / IndexedDB | **SQLite** (`expo-sqlite`, async) and the Keychain (`expo-secure-store`) |
| `.env` | `EXPO_PUBLIC_*` only (public, bundled); secrets live in the Worker |
| CSS dark mode | `useColorScheme()` + `ThemeProvider` tokens (`constants/theme`) |
| `import img from './a.png'` dynamic paths | `require()` with **static paths only** (see `constants/exerciseImages.ts`) |
| Framer Motion | **Reanimated** (`useSharedValue`, `withTiming`) |
| Page scroll | wrap in `ScrollView`/`FlatList`; safe areas via `react-native-safe-area-context` |
| `fetch` to your API | same `fetch`, but only to **our** Worker (keys never in the app) |
| Vercel/Netlify deploy | **EAS Build** (cloud iOS build, no Mac needed) + `eas submit` to App Store Connect |
