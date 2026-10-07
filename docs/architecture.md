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
│   ├── workout.tsx          the guided player (full-screen modal): a plan day or single exercises
│   ├── plan-day.tsx         one day of the 28-day plan, opened from the grid (start it or practice it)
│   └── paywall, ai-consent, safety (modals)
├── components/     ui/ (AppText, Button, Card, Chip, Badge, IconButton, ProgressRing, Screen, Segmented…),
│                   exercise/, today/, progress/, coach/, paywall/, onboarding/, settings/
├── constants/      config.ts, theme/, exercises.ts, exerciseImages.ts, limits.ts, links.ts, storageKeys.ts…
├── state/          settings/, premium/, progress/, plan/, chat/  (+ AppProviders.tsx)
├── hooks/          useSettings, usePremium, usePaywall, useProgress*, usePlan, useWorkout, useChat, useTheme…
├── services/       db/ (SQLite), storage/kv.ts, progress/, chat/, purchases/, ai/, plan/, notifications/, workout/ (pure)
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
| `kv` | small JSON values: settings, app ID copy, AI usage, the cached Premium plan days (versioned envelope) | `services/storage/kv.ts` |
| `sessions` + `session_exercises` | finished workouts (`plan_level`, `plan_day`: which plan day it counted for) | `services/progress/sessionsRepo.ts` |
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

## The 28-day plan
Four weeks of seven days, each week harder (Learn 4 exercises at 70% reps → Build 5 at 85% → Strengthen 6 at 100% → Peak 6
with +2 s holds); days 7, 14 and 21 are short light days, day 28 is one exercise longer. Levels 2 and 3 add 10% reps and
1 s hold per level; later rounds repeat Level 3. A day is data (`{ day, kind, ids, repPct, holdPlusSec }`); the app turns
it into reps and holds with `services/plan/plan.ts` → `planItems()`.

- **One generator, on the server:** `worker/src/lib/plan.js`. Week 1 of Level 1 (free) is exported into
  `app/src/constants/planFreeWeek.json` by `cd worker && npm run plan:export`; a Worker test fails if the two differ.
- **Premium days never ship in the app.** `state/plan/PlanProvider.tsx` asks `POST /plan` (Worker) as soon as the user
  has Premium, keeps the answer in `kv` (`facerep.planCache`) for offline use and shows it only while Premium is active.
- **Where you are is derived, not stored:** `planProgress(sessions, today)` reads the plan day saved with each workout. A
  day moves on only when its workout is finished (a missed day waits), and at most one plan day counts per calendar day.
- `hooks/usePlan.ts` gives the Today screen everything: header, today's day (ready / locked / loading / error), the 4×7 grid,
  and `dayAt(n)` for any day. Tapping a grid day opens `plan-day` (locked → paywall). Only the next day counts for the plan
  (`countsFor`); any other day is practice. This also lets App Review see Weeks 2–4 right after a sandbox purchase.
- **Dates:** the plan counts days, not weekdays (install on a Thursday → Day 1 is Thursday; a missed day waits instead of
  being "missed"). `planDates()` puts a real date on every day: the date it was done, or the date it falls on if the user
  trains every day from now. The Today card shows it, the grid shows the weekday under each day, the day preview says
  "Done on …" or "Planned for …".

## Progress calendar (Week / Month / Year)
The Mon–Sun calendar lives on the Progress tab, separate from the plan: the plan says how far you are, the calendar says
when you trained. `services/progress/calendar.ts` (pure, tested) does the maths: week start from the iPhone's region
settings (`hooks/useFirstWeekday.ts`, expo-localization; Monday when unknown), month grids, per-day and per-period totals,
paging (never into the future). `hooks/useProgressCalendar.ts` feeds `components/progress/` (`WeekBars`, `MonthCalendar`,
`YearBars`, `PeriodHeader`). Month: tap a day to see its workouts. Year: tap a month to open it. No calendar library.

