# App Store screenshots: how we make them

FaceRep's store screenshots are **real app screens**, not mockups. The app runs as a web build with demo data, a
script films each screen like an iPhone capture, and an editor lays the screens out as a deck of slides that are
exported in every app language. A change in the app is a re-run, not a redraw.

This page is the method and the rules. The commands and file details are in
[store-screenshots/README.md](../store-screenshots/README.md). The Apple rules behind it are in
[app-review.md](app-review.md).

## 1. Principles
- **Show the real app** (App Store 2.3.3). Every phone on a slide is a capture of the current app, so the store never
  promises a screen the app doesn't have. Rebuild after any change to a screen that a slide shows.
- **Demo data only** (2.3.9). A made-up person 11 days into the plan, on Thursday 15 October 2026 at 9:41. No real
  names, no real health data. The people are AI-generated and fictional, the same pictures the app uses.
- **One idea per slide.** A short label line on top, then a headline of 2–3 short lines (about 12 letters a line,
  because the font is big) with **one** highlighted word. The phone shows the proof.
- **The first three slides sell.** App Store search results show only slides 1–3, so they carry each language's
  search words in the label line ("FACE YOGA & JAWLINE", "FACE EXERCISES", "28-DAY PLAN").
- **Say what is free** (2.3.2). A slide that shows Premium content says what's free: slide 3 "Week 1 free", slide 8
  "3 free answers a month".
- **No prices, claims or other apps** (2.3.7, 1.4.1, 2.3.1, 2.3.10). No "$", no "#1", no before/after, no "sharper
  jawline", no Android, no competitor names. Everything must suit a 4+ audience (2.3.8). `npm test` checks the
  slide words (`npm run review:check`).
- **Every language gets its own set.** The words around the phones come from `capture/copy.js` (one entry per
  language). The words inside the phones are the app's own translations. Never stronger than the English.

## 2. The current deck
Eight iPhone 6.9" slides, 1320 × 2868 px, JPEG without transparency. App Store Connect scales them down for smaller
iPhones. The design:

| Element | Look |
|---|---|
| Background | Red slides (the app's `#E5322D`) alternating with black ones (`#0B0D10`) |
| Label | Small, red or light, upper case, above the headline |
| Headline | Anton, upper case, white; the highlighted word is black on red slides and red on black slides |
| Phone | Dark titanium iPhone 17 Pro Max, slightly tilted (±3–6°), cut off by the bottom edge |
| Detail | One thing lifted out of the screen: a magnified circle (timer ring, muscle) or a card that overlaps the frame (plan grid, streak, reminder card), or speech bubbles for the voice cues |

| # | Label · headline | Screen (capture name) | Detail |
|---|---|---|---|
| 1 | Face yoga & jawline · Train your *face* like your body | Workout player, Jaw Clench mid-squeeze (`workout`) | Timer ring magnified |
| 2 | Face exercises · See the *muscle* you train | Jaw Clench page, man pictures (`exercise-man`) | Masseter magnified |
| 3 | 28-day plan · Week 1 free · A plan that *grows* with you | Today, Day 12 of 28 (`today`) | Weeks 1–2 of the grid lifted out |
| 4 | Voice cues · Just *listen* and follow | Workout player, man (`workout-man`) | Three speech bubbles |
| 5 | Camera mirror · Nothing recorded · Check your form in the *mirror* | Her and his player with the mirror on (`workout-mirror`, `workout-mirror-man`) | Two phones |
| 6 | For men & women · For *him*. For *her*. | "Who should the exercises show?" (`guide`) | Both portraits |
| 7 | Progress · Keep your *streak* going | Progress, 11-day streak (`progress`) | Streak card lifted out |
| 8 | AI Coach · 3 free answers a month · Questions? Ask the *Coach* | Coach sheet over Today (`coach`) | The reminder card it prepared |

## 3. How it works
```
app (web build, fake AI address)
  └─ capture.js   Playwright opens the app at 440 × 894 pt @3x: fixed clock, demo data seeded into the app's own
  │               SQLite, Premium on, Inter instead of SF Pro, SF Symbol look-alikes, the Coach and /plan answered
  │               inside the browser (no Worker, no AI, no RevenueCat), Chromium's fake camera for the mirror
  │               → capture/raw/<lang>/<screen>.png
  └─ frame.js     adds the iPhone around each capture: 9:41 status bar, Dynamic Island, iOS 26 tab bar or back
  │               button, the Coach as a sheet over Today, the home bar → public/screenshots/apple/iphone/<lang>/
  └─ art.js       portraits, per-language chips and voice bubbles (words from the app's translations), cards cut
  │               out of the framed screens → public/art/ + art-manifest.json
  └─ deck.js      copy.js + positions → app-store-screenshots.json (8 slides × 6 languages)
  └─ editor       npm run dev (Parth Jadhav's app-store-screenshots, MIT): look, drag, fine-tune
  └─ export.js    the editor's "Export bundle" → export/<lang>/01–08.jpg + export/strip-<lang>.jpg
```
Nothing here changes the app. The browser-only patches in `capture/lib.js` (demo data, Premium, icons) find exact
pieces of the app's bundle and stop with a clear error if the app code moved.

## 4. Recipes

**Start (every time).** Two terminals:
```
cd app && EXPO_PUBLIC_AI_URL=https://demo.facerep.invalid/chat EXPO_PUBLIC_RC_IOS_KEY= npx expo start --web --port 8081
```
```
cd store-screenshots/capture && npm install
```
In a cloud session, add `CHROMIUM_PATH=/opt/pw-browsers/chromium` before each `node` command. On a laptop, run
`npx playwright install chromium` once.

**A screen changed in the app** (new text, layout, button). Find the slides that show it in §2, then:
```
node capture.js                 all screens, all languages (~4 min a language)
node capture.js de              one language
node capture.js --pops          only Today and the Coach (slides 3 and 8)
node capture.js --workout       only the workout player (slides 1, 4, 5)
node capture.js --mirror        only the mirror (slide 5)
node frame.js && node art.js
cd .. && npm run dev            keep it running, then in another terminal:
node capture/export.js
```
`git status store-screenshots/export` shows which slides really changed. Upload only those.

**Words around the phones changed.** Edit `capture/copy.js` in every language, run `node deck.js`, then export. This
replaces any hand edits made in the editor, so move those into `deck.js` first.

**Layout or a new slide.** Edit `deck.js` (canvas pixels of one slide; x below 0 or above 1320 crosses into the
neighbour slide), or drag things in the editor, which saves to the same JSON file.

**A new language.** It must exist in the app first (docs/i18n.md). Then add its block to `copy.js`, including `asc`
(the App Store Connect locales that get it), run everything, and add the folder to the upload table in the README.

**One language as a quick sample.** `LANGS=en` in front of any step works on that language only.

**Upload** (the local AI with the asc CLI, or by hand in App Store Connect → 1.0 → language → iPhone). Replace only
the changed slide numbers, in every App Store locale that uses that folder (Spanish goes to es-MX and es-ES). The
strips are for looking at only; never upload them.

## 5. Checklist before uploading
- [ ] `npm test` in `app/` passes (the review check reads the slide words).
- [ ] Open `export/strip-<lang>.jpg` for **every** language, then a few slides at full size.
- [ ] No text cut off or overflowing, and no badly split long words (German).
- [ ] French: a no-break space before `? ! : ;` so the mark never sits alone on a line.
- [ ] The text inside the phones matches the current app, including placeholders and button labels.
- [ ] The status bar shows 9:41 with full signal and battery. No debug overlay, no error toast, no empty states
      that weren't meant to be there.
- [ ] Premium content is labelled, and there are no prices anywhere.
- [ ] Compare with the real app on an iPhone: the web capture uses look-alike icons and Inter instead of SF Pro, so
      small differences are expected, but no screen may look different in substance.

## 6. Lessons learned
- **Restart the web build after changing app text.** Started with `CI=1`, Expo doesn't watch files, so the capture
  keeps filming the old text. With `--clear` the first bundle takes a while: if the first capture fails, run it again.
- **Long UI text wraps badly on a slide.** "Ask about your face workout or face care" left "care" alone on a line.
  The fix is shorter app text ("Ask about your workout or face care"), never editing the screenshot.
- **Demo chat text follows the app's rules too:** the same honesty rules, and French no-break spaces.
- **Stopping servers:** `pkill -f "expo start"` also matches the shell that runs it (its own command line contains
  the words), so it stops itself halfway. Use the bracket trick, which can't match its own text:
  `kill $(pgrep -f "[e]xpo start")` and `kill $(pgrep -f "[n]ext dev")`.
- **A missing icon** on a captured screen means an SF Symbol has no look-alike yet. `capture.js` names it; add it to
  `capture/icons.js`.
- **The app icon is not on any slide** (`appIcon` is empty), so a new app icon doesn't need new screenshots.
- **The editor's own exports are the truth.** Never edit files in `export/` by hand. Rebuild instead.

## 7. App Preview video (not made yet)
15–30 seconds, captures of the app only, muted autoplay in the store. Open with the relaxed → squeeze glow in the
first two seconds. No before/after faces, no claims, the same honesty rules as the slides (2.3.4).

## 8. Reusing this for another app
Copy `store-screenshots/` and change the app-specific parts:
- `lib.js`: the browser patches (how to seed data, switch Premium on, answer network calls);
- `seed.js`: the demo person;
- `copy.js`: the words;
- `frame.js`: which screen is a tab, a pushed page, a sheet or full screen;
- `deck.js` and the theme in `src/lib/constants.ts`.

`export.js`, `mockup.js` and the editor stay as they are. Keep the principles in §1. Elowa uses its own variant of
this method (the connected "strip" style, its `app-store-screenshots` skill).
