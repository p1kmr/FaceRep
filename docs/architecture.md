# Architecture

Same layout as Elowa: layer folders (`state`, `hooks`, `services`, `constants`, `components`) with a sub-folder per domain.

## Folder map
```
app/src/
├── app/            Routes (Expo Router). Thin: read hooks, render components. No business logic.
│   ├── _layout.tsx          providers, splash, Stack with onboarding guard
│   ├── onboarding/          welcome → guide → goal
│   ├── (tabs)/              Today · Exercises · Progress · Settings (native iOS tab bar)
│   ├── coach.tsx            the AI Coach, a sheet opened by the floating button; ?q= starts a question
│   ├── exercise/[id].tsx    exercise detail
│   ├── workout.tsx          the guided player (full-screen modal): a plan day or single exercises
│   ├── plan-day.tsx         one day of the 28-day plan, opened from the grid (start it or practice it)
│   └── paywall, ai-consent, safety (modals)
├── components/     ui/ (AppText, Button, Card, Chip, Badge, Gradient, IconButton, ProgressRing, Screen, Segmented…),
│                   exercise/, faceMap/, today/, progress/, coach/, paywall/, onboarding/, settings/
├── constants/      config.ts, theme/, exercises.ts, faceMap.ts, guides.ts, exerciseImages.ts (+ guideImages.generated.ts), limits.ts…
├── state/          settings/, premium/, progress/, plan/, chat/  (+ AppProviders.tsx)
├── hooks/          useSettings, usePremium, usePaywall, useProgress*, usePlan, useWorkout, useChat, useTheme…
├── services/       db/ (SQLite), storage/kv.ts, progress/, chat/, purchases/, ai/, plan/, notifications/, workout/ and faceMap/ (pure),
│                   faceTracking.ts (the only import of modules/face-tracking)
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
by `useWorkout()`. During the reps the figure is two still drawings (relaxed / exercise) crossfaded with Reanimated on
every phase change, so it stays in time with the counter. Before each exercise ("Get ready", "Next up") the exercise's
clip plays instead (`PlayerFigure.tsx`, `ExerciseClip.tsx`, `expo-video`; docs/videos.md). Leaving the app pauses the
workout.

While it runs, `useWorkout()` also:
- **keeps the screen on** (`expo-keep-awake`, only while running; paused or finished lets it sleep). Without it iOS
  Auto-Lock locks the phone after 30 s–5 min without a touch (always 30 s in Low Power Mode), the app goes to the
  background and the workout pauses. Hands-on exercises make that likely. This is the iOS version of the web's Screen
  Wake Lock API.
- **speaks cues** (Settings → Voice cues, on by default; also the speaker button in the player). `services/workout/cues.ts`
  is pure and tested: it turns each state change into "Get ready. Lip Press." / "Squeeze" ("Massage" for the massage
  program) / "Last one. Squeeze." / "Relax" / "Next up: …" / "Workout complete". `services/voice.ts` (the only
  `expo-speech` import) speaks them with the iPhone's built-in voice in the app's language: offline, no permission.
  `useApplicationAudioSession: false` gives speech its own iOS audio session, so the user's music is turned down for a
  cue and comes back instead of stopping.

**Mirror** (Settings → Mirror in workouts, or the person button in the player): `components/exercise/MirrorView.tsx`
shows the front camera (`expo-camera`) in a corner of the figure. `hooks/useMirror.ts` asks for the camera the first time
it's turned on; iOS asks only once, so after "Don't Allow" an alert offers the Settings app. Nothing is recorded or saved,
and the camera stops in the background. The microphone purpose string exists only because the camera library can record
video with sound (Apple rejects builds whose code can reach the microphone without one); FaceRep never asks for it.
Tapping the small tile swaps the figure and the mirror (only their boxes change, so the camera doesn't restart).

**Move check** (docs/face-tracking.md): on iPhones with Apple's face tracking (and Settings → Move check in the mirror
on), the mirror is the local module `modules/face-tracking` (ARKit) instead of `expo-camera`, and shows a level and
"Seen 3 of 10" for the exercises in `constants/moves.ts`. `services/workout/moveCheck.ts` is pure and tested: it learns
the relaxed face during Get ready / Relax / Next up and counts holds. Face data stays on the iPhone and is never stored.

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
| `import img from './a.png'` dynamic paths | `require()` with **static paths only**; `npm run images` writes them for every picture (docs/images.md) |
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
  trains every day from now. The Today card shows it; the grid's circles show the **date** (red when done, ring for
  today, lock for Premium) with the weekday under it, never the plan day number, which only appears in text ("Day 9
  of 28") so it can't be mistaken for a date. The day preview says "Done on …" or "Planned for …".
  How to read the grid is a one-time tip above it (`PlanGridTip`), closed by "Got it" or the first tap on a day
  (`settings.planGridTipSeen`), so the grid stays compact.

## Exercise catalog and programs
27 exercises in 5 programs (jawline, cheekbones, lips, eyes, massage) plus the "full face" goal; the order of
`EXERCISE_IDS` is the order a workout runs in (massage last). Everyone can use every program; `programsFor(guide)` only
changes the display order (the woman's pictures list lips, cheekbones, eyes and massage first). Exercises done with the
fingers have `handsOn` and show a clean-hands / recent-treatment note. Adding exercises: give them a new
`CATALOG_VERSION` in the app and in `worker/src/lib/plan.js` (the test checks both), add pictures for every guide, and
**deploy the Worker before releasing the app** (an older Worker rejects the new goals and doesn't know the new IDs).

## Exercise pictures (Man / Woman)
Pictures live in `assets/guides/<man|woman>/` (hero photos + `exercises/<id>/relaxed|exercise|thumb.webp`), never by plan
day. `scripts/guide-images.js` (`npm run images`) converts new files, cuts thumbnails and writes
`constants/guideImages.generated.ts`; only complete guides are in it, and a test fails when it's stale (docs/images.md).
`settings.guide` holds the choice; `useGuide()` falls back to the man when a set isn't in the build and
`useGuideImages()` gives the pictures. The onboarding step and the Settings row only appear with two complete guides.
The choice changes pictures and a few words (i18next `context`, e.g. the Coach's face care suggestion), never the plan,
and it isn't sent to the Worker. `POST /plan` sends `CATALOG_VERSION` instead, so the Worker never plans an exercise
the installed app doesn't have; the plan cache is dropped when the version changes.

## The look
Graphite and steel with the muscle red of the drawings (`constants/theme/themes/forge.ts`), plus the brand gradient
(`primary` → `primaryEnd`) on the main button, the timer ring and the week strip, soft card shadows (`boxShadow`,
`tokens.elevation`; a hairline edge in light, a border in dark) and **Anton** (SIL OFL, `assets/fonts/`, loaded before the
splash hides) for headlines and big numbers: `AppText variant="brand"`, in capitals, as in the store screenshots.
Gradients are drawn with react-native-svg (`components/ui/Gradient.tsx`): React Native has no CSS gradients. Text on a
drawing's white plate uses `onPlate` / `onPlateMuted` (the plate is white in both themes).

**Today** (`app/(tabs)/index.tsx`): greeting and streak, this week (`WeekStrip`, the region's first weekday), today's
plan day as the hero (`TodayCard`: the face map with the areas the day works lit and slowly breathing, cropped to frame
them; tap an area to open it in the library), three stat cards and the 28-day grid. The Coach stays the floating button
(`AskBubble`, now on the brand gradient): one way in, as before.

## The face map
`constants/faceMap.ts`: eight areas (forehead, temples, eyes, cheeks, lips, jaw, chin, neck), which muscle lies in
which (`MUSCLE_AREA`), and from that which exercises work each area. The pictures come from the drawings
(`videos/tools/facemap.py`, docs/images.md): per guide a grey face and one red layer per area, cut to its box, with each
area's outline in `areas.json`. `components/faceMap/FaceMap.tsx` stacks them (Reanimated fades; `mixBlendMode` doesn't
work on iOS, so the red is baked into each layer) and turns a tap into an area with `services/faceMap/hit.ts` (pure,
tested: inside an outline, the smallest wins; a near miss still counts). Used on Today (the day's areas) and in the
Exercises tab (Face map | Programs): tap an area or its chip to see its muscles, a short note and its exercises. No
photo of the user is taken or analysed: the face is the app's own drawing.

## Progress calendar (Week / Month / Year)
The Mon–Sun calendar lives on the Progress tab, separate from the plan: the plan says how far you are, the calendar says
when you trained. `services/progress/calendar.ts` (pure, tested) does the maths: week start from the iPhone's region
settings (`hooks/useFirstWeekday.ts`, expo-localization; Monday when unknown), month grids, per-day and per-period totals,
paging (never into the future, never before the first workout). `hooks/useProgressCalendar.ts` feeds
`components/progress/` (`WeekBars`, `MonthCalendar`, `YearMonths`, `PeriodHeader`). The calendar opens on Month: tap a day to see its workouts.
Year: 12 small months like Elowa's Year view, a red dot on every training day and the number of training days per month;
tap a month to open it. No calendar library (Elowa uses react-native-calendars for its scrolling month list; FaceRep's
calendar sits inside the scrolling Progress page, so it pages with ‹ › instead).

## Floating Coach button (same as Elowa's Ask button)
`components/coach/AskBubble.tsx`, rendered once in the root layout over every main screen (hidden on the Coach itself,
the workout player and the modals). Tap opens the Coach sheet; drag moves it, it snaps to the nearest side and the spot is
remembered (`settings.askButton`: visible, side, y as a 0–1 fraction so it fits any screen). On the first 3 app opens it
wiggles and shows `AskHint` with shortcuts that open the Coach with a question ready. Settings → Coach button hides it.
`Screen` keeps `ASK_BUTTON_ROOM` free at the bottom so it never covers the last row. There is no Coach tab: one way in, as in Elowa.

## Reminders
Up to 10 reminders (`settings.reminders`): type (workout, mewing, posture, custom), optional name, 1–6 times a day and
weekdays. `services/reminders/reminders.ts` (pure, tested) checks them and turns them into repeating iOS notifications
(daily, or weekly per weekday), capped at 60 because iOS keeps at most 64 per app; `useReminderSync` reschedules on any
change. Settings → Reminders (`app/reminders.tsx`, editor `app/reminder.tsx`); `hooks/useReminders` saves with the limits
and asks for notification permission when one is turned on. Old saves with one daily reminder become the workout reminder.

**The Coach can propose changes** (Elowa-style): each question sends the reminder list (id, name, type, times, days, on/off).
The Worker gives the main model three tools (`create_reminder`, `update_reminder`, `delete_reminder`, `worker/src/lib/reminders.js`),
checks every call against that list and returns them as `actions`; the fallback model gets no tools. The app checks them again
(`parseChatReply`) and shows `ReminderActionCard`s: nothing changes until the user taps Confirm. Cards live in memory only.

**The Coach can also save or start a workout.** Two more tools (`worker/src/lib/workouts.js`): `log_workout` (a workout the
user did without the app or forgot to save: 0–6 days back, today's plan day, the exercise ids they named, the minutes they
said) and `suggest_workout` (2–8 exercise ids to do now, with a short title). The Worker drops unknown ids and anything out
of range; no new data is sent for this (the question already carries what the user said). In the app,
`services/progress/log.ts` (pure, tested) turns a proposed log into what is saved, from the app's own data: today's plan
day counts for the plan only when it is the next day and ready (same as the Start button), an earlier day never counts,
otherwise the named exercises with their usual reps, and the minutes the user said win over the estimate.
`WorkoutActionCard` shows exactly that before Save, or the routine before Start (which opens the player with those
exercises). A saved workout is stored with kind `logged` (no migration) and shows a "Logged" tag in the history. Nothing is
saved or started until the user taps Save or Start. The iPhone keyboard's dictation mic works in the Coach's text field.


## Languages
Six languages, bundled in the app (no network loading): see [i18n.md](i18n.md). iOS's per-app language (Settings app →
FaceRep → Language) picks it; Settings → Language in the app opens that page. Voice cues, reminder notifications,
dates and Coach replies follow the same language. `npm run i18n:check` (also in `npm test`) keeps every language's keys
and `{{placeholders}}` in line with English.
