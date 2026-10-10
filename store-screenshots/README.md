# FaceRep App Store screenshots

Eight iPhone 6.9" screenshots (1320 × 2868) in all six app languages, made from the **real app** (web build with demo
data, made to look like an iPhone capture) and laid out in the
[app-store-screenshots](https://github.com/ParthJadhav/app-store-screenshots) editor by Parth Jadhav (MIT, see
`LICENSE`). The method, the rules and the checklist before uploading are in
[docs/screenshots.md](../docs/screenshots.md). The finished files are in `export/<lang>/01–08.jpg`, ready to upload
(`export/strip-<lang>.jpg` shows a language's set side by side).

| # | Headline (English) | Screen |
|---|---|---|
| 1 | Train your *face* like your body | Workout player, Jaw Clench mid-squeeze; timer ring magnified |
| 2 | See the *muscle* you train | Jaw Clench page (man pictures); the masseter magnified |
| 3 | A plan that *grows* with you · "Week 1 free" | Today, Week 2 · Day 12 of 28; weeks 1–2 of the grid lifted out |
| 4 | Just *listen* and follow | Workout player (man) with the voice cues as speech bubbles |
| 5 | Check your form in the *mirror* · "Nothing recorded" | Two workout players with the camera mirror on: hers in front, his behind |
| 6 | For *him*. For *her*. | "Who should the exercises show?" with both portraits |
| 7 | Keep your *streak* going | Progress: 11-day streak, October calendar |
| 8 | Questions? Ask the *Coach* · "3 free answers a month" | The Coach: a technique answer and the reminder card it prepared |

## How it is made

```
capture/
  copy.js      every word that isn't the app's own: headlines, labels, the Coach's demo chat (6 languages)
  seed.js      demo data: Thu 15 Oct 2026 9:41, Days 1–11 of the plan done (11-day streak), Premium on
  lib.js       opens the web build like the iPhone app (font, SF Symbol look-alikes, demo database, Premium,
               the Coach and /plan answered locally: no Worker, no AI, no RevenueCat)
  capture.js   films the screens → capture/raw/<lang>/ (the mirror's camera: camera/<woman|man>-jaw-clench.jpg,
               AI-generated front-camera pictures, played by Chromium as a fake camera)
  sim-seed.js  the same demo person as SQL for the iOS Simulator's app database (docs/screenshots.md §4)
  sim/         Simulator screenshots, sim/<lang>/<screen>.png, and the card boxes in sim/<lang>/regions.json
  frame.js     adds the iPhone parts (9:41 status bar, Dynamic Island, iOS 26 tab bar, back button, Coach sheet,
               home bar) → public/screenshots/apple/iphone/<lang>/; with --sim, Simulator shots get only the island
  art.js       portraits (the app's own hero photos) and the per-language chips and voice bubbles → public/art/
               (--sim: cards are cut from Simulator shots where sim/<lang>/regions.json says)
  mockup.js    the dark titanium iPhone frame → public/mockup.png
  deck.js      writes app-store-screenshots.json (the 8 slides, positions, theme, font)
  export.js    clicks the editor's Export bundle and writes export/<lang>/0N.jpg + export/strip-<lang>.jpg
```

Changes to the editor template (all marked "FaceRep" in the code): `{locale}` in image paths (per-language chips),
`*word*` highlights in headlines, the FaceRep theme, an opaque back phone, the Anton font (SIL OFL, in
`public/fonts/imported/`), and no test harness.

## Rebuild after an app change

```bash
cd app
EXPO_PUBLIC_AI_URL=https://demo.facerep.invalid/chat EXPO_PUBLIC_RC_IOS_KEY= npx expo start --web --port 8081
```
Keep it running. The demo address is never called: the capture answers it inside the browser. In a second terminal:
```bash
cd store-screenshots/capture
npm install
npx playwright install chromium   # once, on a laptop (cloud sessions: CHROMIUM_PATH=/opt/pw-browsers/chromium)
node capture.js                   # all languages, ~4 min each (or: node capture.js de)
node frame.js
node art.js
cd .. && npm install && npm run dev     # the editor, http://localhost:3000
```
The framed screens (`public/screenshots/`) and the chips, portraits and cut-outs (`public/art/`) are not committed:
rebuild them with the steps above before opening the editor on a new machine. Then `node capture/export.js` (with the editor running) writes `export/`. Always open `export/strip-<lang>.jpg` and a
few full slides before uploading.

- **Words:** change `capture/copy.js`, then `node deck.js` (this rebuilds `app-store-screenshots.json` and replaces
  edits made in the editor). Small changes can also be made in the editor; it saves to the same file.
- **Layout:** drag things in the editor, or change `deck.js`. Coordinates are canvas pixels of one slide.
- App changes that the capture depends on (button texts, routes, the bundle code patched in `lib.js`) stop it with a
  clear error. Check the output anyway.

## Rules for these screenshots

- Plain words, one idea per slide. No health or result claims, no before/after, no "#1", no prices, no other apps.
- Slides with Premium content say what is free (App Store 2.3.2): slide 3 "Week 1 free", slide 8 "3 free answers a
  month". Keep that if those slides change.
- Demo data only. The people are AI-generated and fictional: the app's pictures, and in the camera mirror two
  front-camera pictures made with Figma AI (`capture/camera/`). `MIRROR=woman|man|both node deck.js` picks who is on
  slide 5 (both by default).
- `LANGS=en node …` runs any step for one language (a quick sample) without touching the others.
- The first three slides show in search results: their labels carry each language's search words.

## Upload

App Store Connect needs only the 6.9" set; it scales it for smaller iPhones. iPhone only (`supportsTablet` is false).

| Folder | App Store Connect locales |
|---|---|
| `export/en` | en-US |
| `export/es` | es-MX and es-ES (same set) |
| `export/pt-BR` | pt-BR |
| `export/de` | de-DE |
| `export/fr` | fr-FR |
| `export/it` | it |

Upload with the project's asc CLI from the repo root, one locale at a time (check the exact flags first with
`./.tools/asc screenshots upload --help`), or drag the files into App Store Connect → 1.0 → each language → iPhone.

## Subscription promotional images

`export/subscriptions/premium-weekly.png`, `premium-monthly.png` and `premium-yearly.png` (1024 × 1024 PNG) are the
subscriptions' promotional images in App Store Connect (uploaded 2026-10-10; App Store Connect calls them
"recommended"). They are crops of the paywall portraits in
`app/assets/guides/<woman|man>/hero/paywall.webp` (weekly: the woman, monthly: the man, yearly: both, facing each
other). Apple's rules: a different image for each subscription, no screenshot, nothing like the app icon, no text, and
nothing important in the lower-left corner (Apple puts the app icon there). Upload:
`./.tools/asc subscriptions versions images upload --version-id <subscription version ID> --file <png>`.
