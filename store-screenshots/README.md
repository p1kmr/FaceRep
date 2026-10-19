# FaceRep App Store screenshots

Nine iPhone 6.9" screenshots (1320 × 2868) in all six app languages, made from the **real app in the iOS Simulator**
(a free user with demo data) and laid out in the
[app-store-screenshots](https://github.com/ParthJadhav/app-store-screenshots) editor by Parth Jadhav (MIT, see
`LICENSE`). The method, the rules and the checklist before uploading are in
[docs/screenshots.md](../docs/screenshots.md). The finished files are in `export/<lang>/01–09.jpg`, ready to upload
(`export/strip-<lang>.jpg` shows a language's set side by side). The earlier set (2026-10-09, eight slides from the web
capture) is kept in `export/v1-web/`, the earlier slide 3 (the scan without its results) in `export/v2-slide3-scan-only/`.

| # | Headline (English) | Screen |
|---|---|---|
| 1 | Train your *face* like your body | Workout player, her Cheek Lift mid-squeeze; timer ring magnified |
| 2 | See the *muscle* you train | His Chin Lift page; the neck muscle magnified |
| 3 | Scan. Measure. *Compare.* · "3 free scans" | The face scan, his face in the oval; the results' rings with the change since the last scan rising from the bottom; chip "The scan runs on this iPhone" |
| 4 | Track your *progress* | Progress: 30-day streak and the face scan chart, the chart lifted out |
| 5 | A workout *every* day · "Days 1–3 free" | Today on day 3 |
| 6 | Just *listen* and follow | His Brow Lift in the player, the voice cues as speech bubbles |
| 7 | Check your form in the *mirror* · "Nothing recorded" | Two workout players with the camera mirror on: hers in front, his behind |
| 8 | For *him*. For *her*. | "Who should the exercises show?" with both portraits |
| 9 | Questions? Ask the *Coach* · "3 free answers a month" | The Coach: a routine and a reminder it prepared, the reminder lifted out |

## How it is made

```
capture/
  copy.js      every word that isn't the app's own: headlines, labels, the Coach's demo chat (6 languages)
  seed.js      demo data: Thu 15 Oct 2026 9:41, Days 1–11 of the plan done (11-day streak), Premium on
  lib.js       opens the web build like the iPhone app (font, SF Symbol look-alikes, demo database, Premium,
               the Coach and /plan answered locally: no Worker, no AI, no RevenueCat)
  capture.js   the web capture (the 2026-10-09 set): films the web build → capture/raw/<lang>/ (the mirror's camera:
               camera/<woman|man>-jaw-clench.jpg, AI-generated front-camera pictures, played by Chromium)
  sim-seed.js  the demo person as SQL for the iOS Simulator's app database: workouts, face scans, settings
  camera.js    the Simulator's stand-in camera pictures, cut from the app's welcome picture → raw/camera/
  sim-capture.js  takes every Simulator screen in every language without a tap (docs/screenshots.md §4)
  sim/         Simulator screenshots, sim/<lang>/<screen>.png, and the lifted cards' boxes in sim/<lang>/regions.json
  frame.js     adds the iPhone parts (9:41 status bar, Dynamic Island, iOS 26 tab bar, back button, Coach sheet,
               home bar) → public/screenshots/apple/iphone/<lang>/; with --sim, Simulator shots get only the island
  art.js       portraits (the app's own hero photos), the per-language chips and voice bubbles, and the cards cut
               from the screens → public/art/ (--sim: where sim/<lang>/regions.json says)
  mockup.js    the dark titanium iPhone frame → public/mockup.png
  deck.js      writes app-store-screenshots.json (the 8 slides, positions, theme, font)
  export.js    clicks the editor's Export bundle and writes export/<lang>/NN.jpg + export/strip-<lang>.jpg
```

Changes to the editor template (all marked "FaceRep" in the code): `{locale}` in image paths (per-language chips),
`*word*` highlights in headlines, the FaceRep theme, an opaque back phone, the Anton font (SIL OFL, in
`public/fonts/imported/`), and no test harness.

## Rebuild after an app change

Build the app into an iPhone 17 Pro Max Simulator and follow docs/screenshots.md §4 (in short, from this folder):
```bash
npm install && npm --prefix capture install       # once
cd capture
node camera.js                                    # the stand-in camera pictures
node sim-capture.js --device <udid>               # every screen, every language (about 3 min each)
export CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
node frame.js --sim && node art.js --sim && node deck.js
cd .. && npm run dev                              # the editor, http://localhost:3000
node capture/export.js                            # in a second terminal, with the editor running
```
The framed screens (`public/screenshots/`), the chips and cut-outs (`public/art/`), the Simulator shots
(`capture/sim/**/*.png`) and the stand-in pictures (`capture/raw/`) are not committed: rebuild them. Always open
`export/strip-<lang>.jpg` and a few full slides before uploading. The images are made with sharp (no ImageMagick).

- **Words:** change `capture/copy.js`, then `node deck.js` (this rebuilds `app-store-screenshots.json` and replaces
  edits made in the editor). Small changes can also be made in the editor; it saves to the same file.
- **Layout:** drag things in the editor, or change `deck.js`. Coordinates are canvas pixels of one slide.
- **Look:** the scene in `deck.js` (glow behind the phones). `SCENE='{"glow":0}' node deck.js` tries another one.

## Rules for these screenshots

- Plain words, one idea per slide. No health or result claims, no before/after, no "#1", no prices, no other apps.
- Every phone shows a free user. Slides with a free limit say what is free (App Store 2.3.2): slide 3 "3 free scans",
  slide 5 "Days 1–3 free", slide 9 "3 free answers a month". Keep that if those slides change.
- Demo data only. The people are AI-generated and fictional: the app's pictures, and in the Simulator's camera (the
  scan, the mirror) pieces of the app's own welcome picture (`camera.js`). `MIRROR=woman|man|both node deck.js` picks
  who is on slide 7 (both by default).
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
