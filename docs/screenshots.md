# App Store screenshots: how to make them eye-catching

FaceRep's store screenshots are **real app screens** placed in a designed deck: a bold headline, a tilted iPhone,
and one detail lifted out of the screen. This page is the recipe, written so that an AI can follow it on its own:
- capture the screens, either from the **iOS Simulator** (§4) or with the automated **web capture** (§5);
- lay them out with the **design rules** (§2) in the editor;
- **check** them (§7) and export.

Files and commands in detail: [store-screenshots/README.md](../store-screenshots/README.md). Apple's rules:
[app-review.md](app-review.md). A ready-to-paste instruction for an AI is in §11.

## 1. Principles
- **Show the real app** (App Store 2.3.3). Every phone on a slide is a screenshot of the current app. Never draw or
  fake a screen, and never show a feature the app doesn't have. Rebuild after any change to a screen a slide shows.
- **Demo data only** (2.3.9). A made-up person 11 days into the 28-day plan. No real names, no real health data. The
  people in the pictures are AI-generated and fictional, the same pictures the app uses.
- **One idea per slide.** A short label line, then a headline of 2–3 short lines (about 12 letters a line) with
  **one** highlighted word. The phone is the proof of the headline.
- **The first three slides sell.** App Store search shows only slides 1–3, so their label lines carry the search
  words of each language ("FACE YOGA & JAWLINE", "FACE EXERCISES", "28-DAY PLAN").
- **Say what is free** (2.3.2). A slide that shows Premium content says what's free ("Week 1 free", "3 free answers a
  month").
- **No prices, claims or other apps** (2.3.7, 1.4.1, 2.3.1, 2.3.10, 2.3.8). No "$", no "#1", no before/after, no
  "sharper jawline", no Android, no competitor names, nothing unsuitable for 4+. `npm test` in `app/` checks the slide
  words.
- **Every language gets its own set.** The words around the phones are in `capture/copy.js`. The words inside the
  phones are the app's own translations. A translation is never stronger than the English.

## 2. What makes them eye-catching (the design recipe)
Each slide is **1320 × 2868 px** (iPhone 6.9"). Eight slides form one connected strip: elements may cross into the
next slide, so the set reads as one story when people swipe.

| Part | Rule |
|---|---|
| Background | Alternate **red** (`#E5322D`, a soft 160° gradient to slightly darker) and **black** (`#0B0D10`). FaceRep: 1, 3, 5, 7 red; 2, 4, 6, 8 black |
| Text block | Top of the slide: x 96 px, y 150 px, width 1128 px (96 px side margins), left-aligned |
| Label | Anton, upper case, small (letters about 45 px tall), in the highlight colour: black on red slides, red (`#FF4B45`) on black slides. Carries the search words and the "free" note |
| Headline | **Anton**, upper case, white, letters about 165 px tall, lines about 195 px apart, at most 3 lines of about 12 letters. **One** highlighted word: black (`#111418`) on red slides, red on black slides |
| Phone | Dark titanium iPhone frame, about 1000 px wide (three quarters of the slide), top edge at y 900–1080, **tilted ±3°** (alternate the direction), cut off by the bottom edge so it feels close. Soft shadow |
| Two phones | The front one left, tilted −5°; the one behind right, tilted +6°, a little higher |
| The hook | **One** thing lifted out of the screen and overlapping the phone's edge (see below) |

The hook, pick one per slide:
- **Magnifier:** a circle 540–580 px across, zoomed 2.2–2.3×, on the thing that matters (the timer ring, the red
  muscle). It sits half over the phone, at the bottom-left or the right side.
- **Lifted card:** a card cut from the screenshot (the plan grid, the reminder card), shown a bit larger than in the
  phone (2.3 px per point). It has 40 px rounded corners, a big soft shadow and a −3 to +5° tilt, and it overlaps the
  phone toward the slide's edge.
- **Chips and bubbles:** white pills with the app's own words and an icon. Bold text about 54 px, a deep shadow, and
  a red variant for the key word. Use them for the voice cues ("Squeeze", "Relax") or the streak ("11 day streak").
- **Portraits:** circles 640 px across with an 18 px white ring, one each side of the phone, tilted ±6°.

Don'ts: no second highlighted word, no paragraph of text, no emoji, no fake phones or devices other than an iPhone,
no text smaller than the label, and no screenshot without the frame.

## 3. The current deck
| # | Label · headline | Screen (file name) | Hook |
|---|---|---|---|
| 1 | Face yoga & jawline · Train your *face* like your body | Workout player, Jaw Clench mid-squeeze (`workout`) | Timer ring magnified |
| 2 | Face exercises · See the *muscle* you train | Jaw Clench page, man pictures (`exercise-man`) | Masseter magnified |
| 3 | 28-day plan · Week 1 free · A plan that *grows* with you | Today (`today`) | The plan grid lifted out |
| 4 | Voice cues · Just *listen* and follow | Workout player, man (`workout-man`) | Three speech bubbles |
| 5 | Camera mirror · Nothing recorded · Check your form in the *mirror* | Her and his player with the mirror on (`workout-mirror`, `workout-mirror-man`) | Two phones |
| 6 | For men & women · For *him*. For *her*. | "Who should the exercises show?" (`guide`) | Both portraits |
| 7 | Progress · Keep your *streak* going | Progress, 11-day streak (`progress`) | Streak chip |
| 8 | AI Coach · 3 free answers a month · Questions? Ask the *Coach* | The Coach (`coach`) | The reminder card it prepared |

## 4. Capture from the iOS Simulator (on a Mac)
The Simulator shows the real iOS look: SF Pro, SF Symbols, the real tab bar and sheets. It can't fake the clock,
Premium or the camera, so a few slides need a workaround (end of this section). Run every command from the repository
root unless it says otherwise.

**1. Build the app into the Simulator** (Release, so there are no developer overlays). It uses FaceRep's public
values from `app/eas.json`, so Elowa's values in your shell never get in.
```
cd app
```
```
EXPO_PUBLIC_AI_URL=$(node -p "require('./eas.json').build.production.env.EXPO_PUBLIC_AI_URL") EXPO_PUBLIC_RC_IOS_KEY=$(node -p "require('./eas.json').build.production.env.EXPO_PUBLIC_RC_IOS_KEY") npx expo run:ios --configuration Release --device "iPhone 17 Pro Max"
```
Use an **iPhone 17 Pro Max** (or 16 Pro Max) Simulator: its screenshots are exactly 1320 × 2868. The tools stop
with an error on any other size. When the build is installed, go back to the repository root:
```
cd ..
```

**2. Make the Simulator look like a store screenshot:**
```
xcrun simctl status_bar booted override --time "9:41" --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100
```
```
xcrun simctl ui booted appearance light
```

**3. Load the demo person.** Open the app once, so it creates its database. Then quit it, write the demo data, and
open it again:
```
xcrun simctl terminate booted com.p1kmr.facerep
```
```
node store-screenshots/capture/sim-seed.js --guide woman > /tmp/facerep-seed.sql
```
```
sqlite3 "$(xcrun simctl get_app_container booted com.p1kmr.facerep data)/Documents/SQLite/facerep.db" < /tmp/facerep-seed.sql
```
The demo days end yesterday, so today is the next plan day.
- `--guide man` gives the man's pictures.
- `--done 4` stops the demo after 4 days.
- `--onboarding` gives a fresh start that shows onboarding.

Each run first clears the earlier demo workouts and the Coach chat, so seeding again is safe. The demo turns the
floating Coach button and the tips off and gives AI consent. It never writes an app ID: the app keeps its own random
one.

**4. Choose the language**, then launch the app:
```
xcrun simctl launch booted com.p1kmr.facerep -AppleLanguages "(de)" -AppleLocale "de_DE"
```
Use `(en)` en_US, `(es)` es_ES, `(pt-BR)` pt_BR, `(de)` de_DE, `(fr)` fr_FR or `(it)` it_IT. Terminate the app
before switching languages.

**5. Go to each screen.** Deep links skip the tapping, for example:
```
xcrun simctl openurl booted "facerep://exercise/01-jaw-clench"
```

| File name | How to get there | Slide |
|---|---|---|
| `today` | Launch (the Today tab) | 3 |
| `exercise-man` | Seed `--guide man`, then `facerep://exercise/01-jaw-clench` | 2 |
| `workout` | Tap "Start Day N"; take a screenshot every half second during the 3rd squeeze of Jaw Clench and keep the one where the muscle is red and the ring is part-way | 1 |
| `workout-man` | The same with `--guide man` | 4 |
| `guide` | Seed `--onboarding`, launch, tap Get started | 6 |
| `progress` | The Progress tab | 7 |
| `coach` | `facerep://coach`, then ask `ask1` and `ask2` from `copy.js` in that language | 8 |

**6. Take each screenshot** into `store-screenshots/capture/sim/<lang>/<file name>.png`. Make the language's folder
once, then save each screen:
```
mkdir -p store-screenshots/capture/sim/en
```
```
xcrun simctl io booted screenshot --type=png store-screenshots/capture/sim/en/today.png
```

**7. Measure the lifted cards.** For a Simulator `today` or `coach`, write where the card is in
`store-screenshots/capture/sim/<lang>/regions.json`. Use **points**: the pixel position in the screenshot divided by
3, as `[x, y, width, height]` from the top-left of the screen. The web capture's values are a sanity check:
```
{"grid":[16,641,408,124],"card":[16,540,408,176]}
```
`grid` is weeks 1–2 of the 28-day grid, including the card's rounded edges. `card` is the Coach's "New reminder"
card.

**8. Frame and cut,** then continue with §6:
```
cd store-screenshots/capture
```
```
node frame.js --sim
```
```
node art.js --sim
```
`frame.js --sim` adds the Dynamic Island, which Simulator screenshots leave out. Screens without a Simulator file
still come from the web capture in `raw/`, so the two kinds can be mixed.

**What the Simulator can't do, and the way around it:**
- **The clock:** it's the real date. `sim-seed.js` builds the demo history backwards from today, so this just works.
- **Premium:** a Simulator build has no Premium without a purchase. The app has no test switch on purpose, because a
  hidden switch would break guideline 2.3.1. Without Premium, Day 8+ is locked, and the Coach shows "3 free answers
  left · Unlimited answers with Premium" (which is honest). For slide 3, either seed `--done 4`, so today is a Week 1
  day and the grid shows Weeks 2–4 locked (that fits the "Week 1 free" label), or keep the web capture of `today`.
- **The camera:** the Simulator has none. Slide 5 (the mirror) stays from the web capture, or from a real iPhone.
- **The Coach:** answers come from the real AI, not the fixed text the web capture uses. Read every answer in every
  language against §1 before you keep it, and ask again if it's long, odd or makes a claim. The reminder card appears
  only when the AI proposes one.
- **The 3 free Coach answers a month** belong to the app's random ID, and each language needs 2. Before each language,
  get a new ID: `xcrun simctl keychain booted reset`, then seed with `--new-id`. If DeviceCheck is ever switched on
  in the Worker, the Simulator gets no free answers at all (it has no DeviceCheck), so use the web capture for
  slide 8.

## 5. Capture on the web (automated)
No Mac needed. The app runs in a browser at iPhone size with a fixed clock (Thursday 15 October 2026, 9:41), the demo
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
node store-screenshots/capture/export.js
```
- The editor (http://localhost:3000) shows the deck. Small moves made there save to `app-store-screenshots.json`.
- **Words around the phones:** edit `capture/copy.js` in every language, then run `node deck.js` before exporting.
  This rebuilds the deck from code and replaces edits made in the editor.
- **Layout or a new slide:** change `capture/deck.js`. It uses canvas pixels of one slide; x below 0 or above 1320
  reaches into the neighbour slide.
- **A new language:** it must exist in the app first (docs/i18n.md). Add its block, with `asc` locales, to `copy.js`
  and capture again.
- **One language only:** put `LANGS=en` in front of any step.
- **Upload:** export writes `export/<lang>/01–08.jpg`. `git status store-screenshots/export` shows which slides
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
- Capture: §4 (iPhone 17 Pro Max Simulator, status bar 9:41, light mode, demo data with store-screenshots/capture/sim-seed.js, each language with -AppleLanguages). Save to store-screenshots/capture/sim/<lang>/<name>.png with the file names in the §4 table, and measure the card boxes into sim/<lang>/regions.json.
- Slide 5 (camera mirror) and anything that needs Premium: keep the web capture (§4, "What the Simulator can't do").
- Design: §2 and the current deck in §3. Same eight slides, same words from store-screenshots/capture/copy.js.
- Frame, cut and export: node frame.js --sim, node art.js --sim, then §6.
- Check every language with the §7 checklist and run npm test in app/. Show me the strips before anything is uploaded. Never put prices, result claims or other apps on a slide, and never touch Elowa.
```
