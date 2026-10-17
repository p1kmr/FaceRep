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
│   ├── workout.tsx          the guided player (full-screen modal): today's workout or single exercises
│   └── paywall, ai-consent, safety (modals)
├── components/     ui/ (AppText, Button, Card, Chip, Badge, Gradient, IconButton, ProgressRing, Screen, Segmented…),
│                   exercise/, faceMap/, today/, progress/, coach/, paywall/, onboarding/, settings/
├── constants/      config.ts, theme/, exercises.ts, weeks.ts, faceMap.ts, guides.ts, exerciseImages.ts (+ guideImages.generated.ts), limits.ts…
├── state/          settings/, premium/, progress/, chat/  (+ AppProviders.tsx)
├── hooks/          useSettings, usePremium, usePaywall, useProgress*, useTodayWorkout, useWorkout, useChat, useTheme…
├── services/       db/ (SQLite), storage/kv.ts, progress/, chat/, purchases/, ai/, notifications/, workout/ and faceMap/ (pure),
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
| `kv` | small JSON values: settings, app ID copy, AI usage (versioned envelope) | `services/storage/kv.ts` |
| `sessions` + `session_exercises` | finished workouts; the weeks are counted from them (`plan_level`, `plan_day` are left from the old 28-day plan, unread) | `services/progress/sessionsRepo.ts` |
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

**Mirror** (the person button in the workout player; it stays on for the next workout): `components/exercise/MirrorView.tsx`
shows the front camera (`expo-camera`) as a small tile on the figure. `hooks/useMirror.ts` asks for the camera the first time
it's turned on; iOS asks only once, so after "Don't Allow" an alert offers the Settings app. Nothing is recorded or saved,
and the camera stops in the background. The microphone purpose string exists only because the camera library can record
video with sound (Apple rejects builds whose code can reach the microphone without one); FaceRep never asks for it.
`components/exercise/PlayerStage.tsx` draws the figure and the mirror in a layer over the whole player: tap the small
tile to swap them (only their boxes change, so the camera doesn't restart), drag it anywhere on the screen (the spot is
remembered as `tileSpot`, like the Coach button's), and × on the mirror closes it.

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

## The weeks
Today's workout goes on in weeks that never end (`services/workout/weeks.ts` and `today.ts`, pure and tested; the
numbers are in `constants/weeks.ts`). The exercises are the same every week; the step changes, gently at first, then
stays at a top:

| Week | Step (`note` on the Today card) |
|---|---|
| 1 | 70% of each exercise's usual reps, no jaw-caution exercises ("Learn the moves") |
| 2 | 85%; the jaw-caution exercises join |
| 3 | the usual reps |
| 4–7 | holds 1 s longer |
| 8 on | holds 2 s longer: the top, it stays |

- **Day 7 of every week is the easy day:** three gentle exercises (stretches, eyes and massage, `EASY_DAY_IDS`, topped up
  from the other allowed ones), at 70%, never a jaw-caution one, a different three each week.
- **Jaw-caution exercises never go above their usual reps or hold** (`dosedItem`), in any week.
- **Days 1–6:** five exercises of the focus area from a window that moves with every workout day, so each one comes up
  in turn (an area with fewer is topped up from the others; full face goes through all of them), in catalog order
  (massage last). Without Premium only the free exercises (`FREE_EXERCISE_IDS`, none loads the jaw).
- **Where you are is derived, not stored:** `daysDone(sessions, today)` counts the dates before today with a workout
  (`isDayWorkout`: a finished routine, or a workout saved through the Coach), one per date. A missed date waits and
  nothing is skipped; a week can't be done in one afternoon. A single exercise from the library doesn't count.
- The Today card says "Week 6 · Day 3" (never a total, never "of 4") with the step under the title, and when the day
  is done "Day 3 done. Day 4 is ready tomorrow.", "Week 6 done. …", or at weeks 4, 8, 12, 26 and 52 "12 weeks of
  practice. …". Nothing promises a result or new content: the week number only says how long someone has practiced.
- **Nothing is sent:** the weeks are worked out on the iPhone from the saved workouts. The Worker has no plan endpoint.
- **No exercise counts anywhere** (Today, paywall, store text, screenshots): "every exercise", never a number, so
  nobody reads the library as small.

## Exercise catalog and programs
27 exercises in 5 programs (jawline, cheekbones, lips, eyes, massage) plus the "full face" goal; the order of
`EXERCISE_IDS` is the order a workout runs in (massage last). Everyone can use every program; `programsFor(guide)` only
changes the display order (the woman's pictures list lips, cheekbones, eyes and massage first). Exercises done with the
fingers have `handsOn` and show a clean-hands / recent-treatment note. Adding exercises: add them to
`worker/src/lib/catalog.js` too (the Coach may only name the exercises in it; a test checks it against the app), add
pictures for every guide, and **deploy the Worker before releasing the app** (an older Worker drops the new IDs from the
Coach's answers). A new exercise simply joins its area's mix in the weeks.

## Exercise pictures (Man / Woman)
Pictures live in `assets/guides/<man|woman>/` (hero photos + `exercises/<id>/relaxed|exercise|thumb.webp`), never by week
or day. `scripts/guide-images.js` (`npm run images`) converts new files, cuts thumbnails and writes
`constants/guideImages.generated.ts`; only complete guides are in it, and a test fails when it's stale (docs/images.md).
`settings.guide` holds the choice; `useGuide()` falls back to the man when a set isn't in the build and
`useGuideImages()` gives the pictures. The onboarding step and the Settings row only appear with two complete guides.
The choice changes pictures and a few words (i18next `context`, e.g. the Coach's face care suggestion), never the
workouts, and it isn't sent to the Worker.

## The look
Graphite and steel with the muscle red of the drawings (`constants/theme/themes/forge.ts`), plus the brand gradient
(`primary` → `primaryEnd`) on the main button, the timer ring and the week strip, soft card shadows (`boxShadow`,
`tokens.elevation`; a hairline edge in light, a border in dark) and **Anton** (SIL OFL, `assets/fonts/`, loaded before the
splash hides) for headlines and big numbers: `AppText variant="brand"`, in capitals, as in the store screenshots.
Anton is taller than the `lineHeight` we give it (fontSize + 6) and iOS cuts the top of a short line, so `AppText` adds
the missing room on top as padding and takes it back as a negative margin: set fontSize and lineHeight as designed.
Gradients are drawn with react-native-svg (`components/ui/Gradient.tsx`): React Native has no CSS gradients. A fade
uses a see-through theme color (`plateFade`); `Gradient` moves its alpha into `stopOpacity`, because on the iPhone the
alpha inside a stop color is ignored. The web preview draws both right, so check a new fade in the Simulator. Text on a
drawing's white plate uses `onPlate` / `onPlateMuted` (the plate is white in both themes).

**Today** (`app/(tabs)/index.tsx`): greeting and streak, this week (`WeekStrip`, the region's first weekday) with this
month folded under it (`MonthToggle` "October 2026 ⌄" opens `MonthCard`: the Progress month, days with a workout
filled; a day opens Progress), today's workout as the hero (`TodayCard`: "Week 6 · Day 3" and the week's step, the face
map with the areas the day works lit and slowly breathing, cropped to frame them; tap an area to open it in the library)
and three stat cards. The Coach stays the floating button
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
The Mon–Sun calendar lives on the Progress tab, separate from the weeks: the weeks say how far you are, the calendar
says when you trained. `services/progress/calendar.ts` (pure, tested) does the maths: week start from the iPhone's region
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
user did without the app or forgot to save: 0–6 days back, the exercise ids they named, the minutes they said) and `suggest_workout` (2–8 exercise ids to do now, with a short title). The Worker drops unknown ids and anything out
of range; no new data is sent for this (the question already carries what the user said). In the app,
`services/progress/log.ts` (pure, tested) turns a proposed log into what is saved, from the app's own data: the named
exercises with their usual reps, and the minutes the user said win over the estimate. A saved workout is that date's
workout in the weeks (one per date, like any other).
`WorkoutActionCard` shows exactly that before Save, or the routine before Start (which opens the player with those
exercises). A saved workout is stored with kind `logged` (no migration) and shows a "Logged" tag in the history. Nothing is
saved or started until the user taps Save or Start. The iPhone keyboard's dictation mic works in the Coach's text field.


## Languages
Six languages, bundled in the app (no network loading): see [i18n.md](i18n.md). iOS's per-app language (Settings app →
FaceRep → Language) picks it; Settings → Language in the app opens that page. Voice cues, reminder notifications,
dates and Coach replies follow the same language. `npm run i18n:check` (also in `npm test`) keeps every language's keys
and `{{placeholders}}` in line with English.
