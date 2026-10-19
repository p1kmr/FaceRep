# App Store screenshots: how to make them eye-catching

FaceRep's store screenshots are **real app screens** placed in a designed deck: a bold headline, a tilted iPhone,
and one detail lifted out of the screen. This page is the recipe, written so that an AI can follow it on its own:
- capture the screens from the **iOS Simulator** (§4, automated, no taps). The older **web capture** (§5) can't film
  the face scan, so the current deck needs the Simulator;
- lay them out with the **design rules** (§2) in the editor;
- **check** them (§7) and export.

Files and commands in detail: [store-screenshots/README.md](../store-screenshots/README.md). Apple's rules:
[app-review.md](app-review.md). A ready-to-paste instruction for an AI is in §11.

## 1. Principles
- **Show the real app** (App Store 2.3.3). Every phone on a slide is a screenshot of the current app. Never draw or
  fake a screen, and never show a feature the app doesn't have. Rebuild after any change to a screen a slide shows.
- **Demo data only** (2.3.9). A made-up person: 30 days of workouts (Progress), three weekly face scans, day 3 of
  Today's workout. No real names, no real health data. The people in the pictures are AI-generated and fictional, the
  same pictures the app uses (the camera's stand-in pictures are cut from the app's welcome picture, §4).
- **A free user** (2.3.2). Every screen shows what a free user gets: free exercises only (Cheek Lift, Chin Lift, Brow
  Lift; never a Premium one), the free face scans and Coach answers, and the app's own Premium buttons where a limit
  is reached. Never a hidden Premium or test switch in the app (2.3.1).
- **One idea per slide.** A short label line, then a headline of 2–3 short lines (about 12 letters a line) with
  **one** highlighted word. The phone is the proof of the headline.
- **The first three slides sell.** App Store search shows only slides 1–3, so their label lines carry the search
  words of each language ("FACE YOGA & JAWLINE", "FACE EXERCISES", "FACE SCAN").
- **Say what is free** (2.3.2). A slide that shows something with a free limit says what's free ("3 free scans",
  "Days 1–3 free", "3 free answers a month"). `npm run review:check` keeps the English scan and Coach labels equal to
  the app's limits.
- **The face scan measures movement** (1.4.1, docs/face-scan.md). Never looks, face shape, attractiveness or
  "symmetry" on a slide, and never a promise that the numbers rise: the demo scans go up and down a little.
- **No prices, claims or other apps** (2.3.7, 1.4.1, 2.3.1, 2.3.10, 2.3.8). No "$", no "#1", no before/after, no
  "sharper jawline", no Android, no competitor names, nothing unsuitable for 4+. `npm test` in `app/` checks the slide
  words.
- **Every language gets its own set.** The words around the phones are in `capture/copy.js`. The words inside the
  phones are the app's own translations. A translation is never stronger than the English.

## 2. What makes them eye-catching (the design recipe)
Each slide is **1320 × 2868 px** (iPhone 6.9"). Nine slides form one connected strip: elements may cross into the
next slide, so the set reads as one story when people swipe.

| Part | Rule |
|---|---|
| Background | Alternate **red** (`#E5322D`, a soft 160° gradient to slightly darker) and **black** (`#0B0D10`). FaceRep: 1, 3, 5, 7, 9 red; 2, 4, 6, 8 black. A glow behind each phone (scene `glow: 40`): red on black slides, a dark halo on red ones. No spotlight backdrop: it washes the red slides pink and the headline loses contrast |
| Text block | Top of the slide: x 96 px, y 150 px, width 1128 px (96 px side margins), left-aligned |
| Label | Anton, upper case, small (letters about 45 px tall), in the highlight colour: black on red slides, red (`#FF4B45`) on black slides. Carries the search words and the "free" note |
| Headline | **Anton**, upper case, white, letters about 165 px tall, lines about 195 px apart, at most 3 lines of about 12 letters. **One** highlighted word: black (`#111418`) on red slides, red on black slides |
| Phone | Dark titanium iPhone frame, about 1000 px wide (three quarters of the slide), top edge at y 900–1080, **tilted ±3°** (alternate the direction), cut off by the bottom edge so it feels close. Soft shadow |
| Two phones | The front one left, tilted −5°; the one behind right, tilted +6°, a little higher |
| The hook | **One** thing lifted out of the screen and overlapping the phone's edge (see below) |

The hook, one per slide (slide 3 keeps the scan's privacy chip as well):
- **Magnifier:** a circle 540–580 px across, zoomed 2.2–2.3×, on the thing that matters (the timer ring, the red
  muscle). It sits half over the phone, at the bottom-left or the right side.
- **Lifted card:** a card cut from the screenshot (the scan chart, the Coach's reminder card), laid back over the
  place it came from, 12–16% bigger and tilted a few degrees more than the phone, so it looks lifted out of the screen
  and nothing shows twice (`lifted()` in `deck.js`). It has 40 px rounded corners and a big soft shadow. A card whose
  place differs between languages by more than the extra size can't be lifted this way: use a chip instead.
- **Rising card:** a card from the screen that comes next (the scan's results: the two rings and the change since the
  last scan) over the lower part of the phone, running off the bottom of the slide like the sheet it comes from, tilted
  the other way. `art.js` makes it the same height in every language, the screen's own grey below the words.
- **Chips and bubbles:** white pills with the app's own words and an icon. Bold text about 54 px, a deep shadow, and
  a red variant for the key word. Use them for the voice cues ("Squeeze", "Relax") or the scan's privacy line
  ("The scan runs on this iPhone").
- **Portraits:** circles 640 px across with an 18 px white ring, one each side of the phone, tilted ±6°.

Don'ts: no second highlighted word, no paragraph of text, no emoji, no fake phones or devices other than an iPhone,
no text smaller than the label, and no screenshot without the frame.

## 3. The current deck
| # | Label · headline | Screen (file name) | Hook |
|---|---|---|---|
| 1 | Face yoga & jawline · Train your *face* like your body | Workout player, her Cheek Lift mid-squeeze (`workout`) | Timer ring magnified |
| 2 | Face exercises · See the *muscle* you train | Chin Lift page, man pictures (`exercise-man`) | Neck muscle magnified |
| 3 | Face scan · 3 free scans · Scan. Measure. *Compare.* | The face scan, his face in the oval while it's measured (`scan`) | The results' two rings with the change since the last scan rising from the bottom (`scan-result`); chip "The scan runs on this iPhone" over the screen's top buttons |
| 4 | Streak & scan chart · Track your *progress* | Progress: 30-day streak, totals, the face scan card (`progress`) | The scan chart lifted out |
| 5 | Daily workout · Days 1–3 free · A workout *every* day | Today on day 3 (`today`) | – |
| 6 | Voice cues · Just *listen* and follow | Workout player, his Brow Lift (`workout-man`) | Three speech bubbles |
| 7 | Camera mirror · Nothing recorded · Check your form in the *mirror* | Her and his player with the mirror on (`workout-mirror`, `workout-mirror-man`) | Two phones |
| 8 | For men & women · For *him*. For *her*. | "Who should the exercises show?" (`guide`) | Both portraits |
| 9 | AI Coach · 3 free answers a month · Questions? Ask the *Coach* | The Coach: a routine and a reminder it prepared (`coach`) | The reminder card lifted out |

The set of 2026-10-09 (eight slides from the web capture, with the 28-day plan and Premium exercises) is kept in
`store-screenshots/export/v1-web/`. The earlier slide 3 (the face scan without its results, "Scan how your face moves") is in
`export/v2-slide3-scan-only/`; never upload either.

## 4. Capture from the iOS Simulator (on a Mac)
The Simulator shows the real iOS look: SF Pro, SF Symbols, the real tab bar and sheets. `capture/sim-capture.js` takes
every screen in every language **without a tap**: it writes the demo data into the app's database (`sim-seed.js`),
opens each screen with a deep link, and uses two links that work only in a Simulator build: `scan?start=1` starts the
face scan, `coach?q=…&send=1` sends a Coach question. Run the commands from the repository root unless they say
otherwise.

**1. Build the app into the Simulator** (Release, so there are no developer overlays). It uses FaceRep's public
values from `app/eas.json`, so Elowa's values in your shell never get in.
```
cd app
```
```
EXPO_PUBLIC_AI_URL=$(node -p "require('./eas.json').build.production.env.EXPO_PUBLIC_AI_URL") EXPO_PUBLIC_RC_IOS_KEY=$(node -p "require('./eas.json').build.production.env.EXPO_PUBLIC_RC_IOS_KEY") npx expo run:ios --configuration Release --device "iPhone 17 Pro Max"
```
Use an **iPhone 17 Pro Max** (or 16 Pro Max) Simulator: its screenshots are exactly 1320 × 2868. The tools stop
with an error on any other size. Open the app once (it makes its database), then go back to the repository root:
```
cd ..
```

**2. Make the Simulator look like a store screenshot** and let the app use the camera (the mirror needs it):
```
xcrun simctl status_bar booted override --time "9:41" --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
```
```
xcrun simctl ui booted appearance light
```
```
xcrun simctl privacy booted grant camera com.p1kmr.facerep
```

**3. Install the tools once** (from the public npm registry; Playwright drives your installed Chrome, no download):
```
npm --prefix store-screenshots install
```
```
npm --prefix store-screenshots/capture install
```

**4. Make the camera's stand-in pictures, then capture.** The Simulator has no camera. `camera.js` cuts stand-ins
from the app's own welcome picture (`app/assets/brand/welcome.webp`, the app's AI-generated man and woman): his face
sized to the scan's oval, and a 3:4 selfie of each for the workout mirror (into `capture/raw/camera/`).
`sim-capture.js` copies the one a screen needs into the app's `Documents/SimulatorCamera/`, where only a Simulator
build looks for it (`services/faceTracking.ts` `simulatorCamera`; the scan's photo uses it too). On an iPhone the code
never runs.
```
cd store-screenshots/capture
```
```
node camera.js
```
```
node sim-capture.js --device <the Simulator's UDID>
```
About 3 minutes a language (`xcrun simctl list devices` shows the UDID; `booted` works when only one Simulator runs).
`node sim-capture.js de` takes one language, `--only coach,scan` some screens. It writes
`sim/<lang>/<screen>.png` and measures the cards to lift out into `sim/<lang>/regions.json` (in points;
`node sim-capture.js --regions` measures again from the saved screens).

| File name | What it shows | Slide |
|---|---|---|
| `workout` | Her Cheek Lift, the second squeeze (14.2 s after the link) | 1 |
| `exercise-man` | His Chin Lift page | 2 |
| `scan` | The face scan with his face, the relaxed face's hold about three quarters measured (6.9 s) | 3 |
| `scan-result` | The newest demo scan's results: its two rings and the change since the last scan (box measured in each language: a meaning on two lines pushes the green line down) | 3 |
| `progress` | 30-day streak, totals and the face scan card with three scans | 4 |
| `today` | Today on day 3 (a free day), the face scan card under it | 5 |
| `workout-man` | His Brow Lift, the second squeeze (10.3 s) | 6 |
| `workout-mirror`, `workout-mirror-man` | Her and his Cheek Lift with the mirror on (the stand-in selfies) | 7 |
| `guide` | Onboarding: "Who should the exercises show?" | 8 |
| `coach` | The real Coach: `routine` and `ask2` from `copy.js` in that language, each answered with a card | 9 |

**5. Read what you got.** Look at every screen, and at the Coach's answers the script prints: keep a Coach screen
only when its answers are honest in that language (§1). The script asks for cards (a routine, a reminder) rather than
technique: the Coach's own words vary from run to run. The timed screens (workouts, scan) can miss by half a second on
a slow Mac: run that screen again with `--only`.

**6. Frame and cut,** then continue with §6:
```
CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node frame.js --sim
```
```
CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node art.js --sim
```
`frame.js --sim` adds the Dynamic Island, which Simulator screenshots show only sometimes.

**How the Simulator stands in for what it can't do:**
- **The clock:** it's the real date. `sim-seed.js` builds the demo history backwards from today.
- **The camera:** the stand-in pictures above. Workouts are filmed during a squeeze, so the smiling selfie matches the
  Cheek Lift drawing; the scan during the relaxed face.
- **The face scan:** the Simulator's pretend face does the moves (docs/face-scan.md §5); behind the stand-in picture
  the "pretend face" caption is left out.
- **Premium:** none. Every screen shows a free user (§1). The script starts from a new app ID, so a Simulator that has
  Premium (a promotional entitlement for testing) loses it: write its old ID back into kv `facerep.appUserId` after
  `xcrun simctl keychain booted reset` to get it back.
- **The Coach's 3 free answers a month** belong to the app ID, and each language needs 2: the script gives each
  language a new ID (Keychain reset, `sim-seed.js --new-id`, which also clears the app's own count). If DeviceCheck is
  ever switched on in the Worker, the Simulator gets no answers at all (it has no DeviceCheck).

After the capture, `xcrun simctl status_bar booted clear` gives the Simulator its own clock back.

## 5. Capture on the web (the older way)
It made the set of 2026-10-09 and can't film the face scan or the Simulator's stand-in camera, so the current deck
needs §4. No Mac needed. The app runs in a browser at iPhone size with a fixed clock (Thursday 15 October 2026, 9:41), the demo
data, Premium on, a fake front camera for the mirror and fixed Coach answers. Two terminals:
```
cd app
```
```
EXPO_PUBLIC_AI_URL=https://demo.facerep.invalid/chat EXPO_PUBLIC_RC_IOS_KEY= npx expo start --web --port 8081
```
and
```
cd store-screenshots/capture
```
```
node capture.js
```
In a cloud session, put `CHROMIUM_PATH=/opt/pw-browsers/chromium` before each `node` command. On a laptop, run
`npx playwright install chromium` once. Faster runs:
- `node capture.js de`: one language;
- `--pops`: only Today and the Coach (slides 3 and 8);
- `--workout`: only the workout player (slides 1, 4 and 5);
- `--mirror`: only slide 5.

Then run `node frame.js` and `node art.js`, without `--sim`.

## 6. Lay out and export
```
cd store-screenshots
```
```
npm run dev
```
Keep it running, then in another terminal:
```
CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node store-screenshots/capture/export.js
```
Before it, `node deck.js` in `capture/` (it writes the deck from `copy.js` and `deck.js`). `SCENE='{"glow":0}' node
deck.js` tries another look without changing the file.
- The editor (http://localhost:3000) shows the deck. Small moves made there save to `app-store-screenshots.json`.
- **Words around the phones:** edit `capture/copy.js` in every language, then run `node deck.js` before exporting.
  This rebuilds the deck from code and replaces edits made in the editor.
- **Layout or a new slide:** change `capture/deck.js`. It uses canvas pixels of one slide; x below 0 or above 1320
  reaches into the neighbour slide.
- **A new language:** it must exist in the app first (docs/i18n.md). Add its block, with `asc` locales, to `copy.js`
  and capture again.
- **One language only:** put `LANGS=en` in front of any step.
- **Upload:** export writes `export/<lang>/01–09.jpg`. `git status store-screenshots/export` shows which slides
  changed: replace only those, in every App Store locale that uses that folder (Spanish goes to es-MX and es-ES).
  The `strip-<lang>.jpg` files are for looking at; never upload them.

## 7. Checklist before uploading
- [ ] `npm test` in `app/` passes (it reads the slide words).
- [ ] Open `export/strip-<lang>.jpg` for **every** language, then a few slides at full size.
- [ ] No text is cut off or overflowing, and long words aren't split badly (German).
- [ ] French has a no-break space before `? ! : ;`, so the mark never sits alone on a line.
- [ ] The text inside the phones matches the current app: placeholders, button labels, names.
- [ ] The status bar shows 9:41 with full signal and battery. There's no developer overlay, error, keyboard or
      half-loaded screen.
- [ ] Premium content is labelled, and there are no prices anywhere.
- [ ] Simulator Coach answers were read and are honest in every language.
- [ ] Only free exercises in the phones; the scan slide shows a face in the oval and no "pretend face" caption.
- [ ] A lifted card covers its place in the phone in every language (nothing shows twice).
- [ ] Web captures only: compare with the real app. They use look-alike icons and Inter instead of SF Pro, so small
      differences are fine, but different screens are not.

## 8. Lessons learned
- **Restart the web build after changing app text.** Started with `CI=1`, Expo doesn't watch files, so the capture
  keeps filming the old text. After `--clear`, the first bundle is slow: if the first capture fails, run it again.
- **Long UI text wraps badly on a slide.** "Ask about your face workout or face care" left "care" alone on a line.
  Fix it with shorter app text ("Ask about your workout or face care"), never by editing a screenshot.
- **Demo chat text follows the app's rules too:** the same honesty rules, and French no-break spaces.
- **Stopping servers:** `pkill -f "expo start"` also matches the shell running it and stops itself halfway. Use
  `kill $(pgrep -f "[e]xpo start")` and `kill $(pgrep -f "[n]ext dev")`.
- **The Coach's technique answers vary** and didn't always match the app's own steps (2026-10-19: "push your lower
  jaw forward" for the Chin Lift). The Coach slide shows cards instead; never put an answer on a slide unread.
- **Anton is wide:** "VOIS COMMENT" (12 letters) wrapped to a fourth line. Count wide letters (M, W, O) extra.
- **Anton's lines sit close:** the cedilla of "MEÇA." touched the highlighted line under it. Keep letters that reach
  below the line (Ç, Q, J) off a line above another.
- **A running app keeps its old data:** every screen showed the first seed. `sim-capture.js` stops the app before it
  writes the database and launches it with `--terminate-running-process`.
- **A missing icon** in a web capture means an SF Symbol has no look-alike yet. `capture.js` names it; add it to
  `capture/icons.js`.
- **The app icon is not on any slide,** so a new app icon doesn't need new screenshots.
- **Never edit files in `export/` by hand.** Rebuild them instead.

## 9. App Preview video (not made yet)
15–30 seconds, captures of the app only, muted autoplay in the store. Open with the relaxed → squeeze glow in the
first two seconds. No before/after faces, no claims (2.3.4). `xcrun simctl io booted recordVideo` records the
Simulator.

## 10. Another app
- **With this tooling:** copy `store-screenshots/` and change the app-specific parts:
  - `capture/lib.js`: the browser patches;
  - `capture/seed.js` and `sim-seed.js`: the demo data and the database path;
  - `capture/copy.js`: the words;
  - `capture/frame.js` (SCREENS): tab, pushed page, sheet or full screen;
  - `capture/deck.js` and the theme in `src/lib/constants.ts`.

  `export.js`, `mockup.js` and the editor stay.
- **Without it:** follow §1 and §2 with any tool (HTML pages rendered by a headless browser work well). A 1320 × 2868
  canvas, the headline rules, a framed and tilted phone, one hook per slide, a JPEG export without transparency.

## 11. Instruction for an AI (paste this)
```
Make FaceRep's App Store screenshots from the iOS Simulator, following docs/screenshots.md exactly.
- Capture: §4 (iPhone 17 Pro Max Simulator, Release build, status bar 9:41, light mode, camera allowed). In store-screenshots/capture run node camera.js, then node sim-capture.js --device <udid>: every screen in every language, the free user, the stand-in camera pictures and the real Coach. Read every screen and every Coach answer it prints.
- Design: §2 and the current deck in §3. Same nine slides, same words from store-screenshots/capture/copy.js.
- Frame, cut and export: node frame.js --sim, node art.js --sim, node deck.js, then §6 (CHROMIUM_PATH = the installed Chrome).
- Check every language with the §7 checklist and run npm test in app/. Show me the strips before anything is uploaded. Never put prices, result claims, looks or other apps on a slide, and never touch Elowa.
```
