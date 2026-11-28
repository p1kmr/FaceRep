# FaceRep reels

Short vertical videos (1080 x 1920) for Instagram Reels, TikTok and YouTube Shorts, drawn in code in Google Chrome
from the app's real screens. Nothing is installed and no ffmpeg is used: the page encodes the MP4 itself (Mediabunny
from jsdelivr, checked against its hash, as in Reel Studio).

| File | What it does |
|---|---|
| `plan.md` | the research, the formats, the character idea and the next step: read it first |
| `NNN-name/script.md` | the shots, the words and the post text, for the owner's OK |
| `NNN-name/reel.js` | the same reel as code: one function per shot, cut on the beat |
| `page/draw.js` | the phone, the lifted-out circle and card, the words, the icon and the button |
| `page/sound.js` | the beat and the sound effects, made in code |
| `page/encode.js`, `page/main.js`, `page/index.html` | the render page: draws each frame and writes the MP4 |
| `render.mjs` | serves the page and only the files it may read, starts Chrome, saves `out/` |
| `voice.mjs` | the characters' voices with Gemini (`lib/gemini.mjs`, copied from Reel Studio): one request per character, cut into one clip per line |
| `page/voice.js` | mixes the voice clips over the beat, the beat ducked under each line |
| `page/frames.js` | `--ffmpeg` (cloud sessions): sends the sound and every frame to render.mjs, which pipes them into ffmpeg |
| `page/cast/` | the cast drawn in code (`pen`, `face`, `body`, `sticker`, one file per character) `stage.js` for episodes, and 004-day-30's day-1/day-30 Brody, rooms and props (`brody-arc.js`, `room.js`, `arc-props.js`) |
| `page/bust/` | the bust style (head and shoulders, cel-shaded, from 004-day-30): `pen`, `head`, `features` (eyes, brows, nose, mouth, the exercise faces), `hair`, `clothes` (neck, tee, hoodie, zip top, hands), `people` (Brody with his day-1 to day-30 face, Kayla) |
| `screens.mjs` | copies FaceRep's store capture (real screens) into `reels/screens/`, optionally taking them first |
| `assets/` | the Anton font with its licence, and the app icon (copied from FaceRep's `app/assets/`) |

Make one, from the reels-studio folder:

    node reels/render.mjs reels/001-looksmax --stills
    node reels/render.mjs reels/001-looksmax

`--stills` saves only the still pictures (`out/still-<seconds>.jpg` and `out/sheet.jpg`), for a quick look.
In a Claude Code cloud session add `--ffmpeg`: jsdelivr (the page's encoder) is blocked there, so the page sends its
frames to the ffmpeg that is already installed (Reel Studio's rules allow that one in a cloud session). About 3 min
for 18 s.

The screens are the app's real screens in `reels/screens/` (1080-wide JPGs, kept out of git: no screenshots in git),
copied from the FaceRep repo's store capture (a free user with demo data; its Simulator shots are git-ignored there).
On the Mac, with the
app in an iPhone Simulator (FaceRep's docs/screenshots.md §4), from the reels-studio folder:

    node reels/screens.mjs --capture     takes the English screens (about 3 min), copies them to reels/screens/
    git add reels/screens && git commit -m "facerep: app screens" && git push

It looks for a FaceRep folder next to reels-studio; `--app <path>` points elsewhere. Run it again after an app change
that a reel's screen shows. The font (Anton, SIL OFL, with its licence) and the app icon are in `reels/assets/`.
`out/` is git-ignored.

Voices (the owner asked for them on 2026-11-25): `<reel>/voice.json` says who says what, in which Gemini voice and
style; `REEL.voice` in reel.js says when each clip starts (at its bubble). Each character costs one free Gemini request,
so make them once:

    node reels/voice.mjs reels/002-face-day                  in a cloud session (the key is a network secret)
    node --env-file=.env reels/voice.mjs reels/002-face-day  on the Mac

The clips go to `<reel>/voice/` (committed). The bubbles stay: most people watch with the sound off.

Rules:
- the store text's rules apply (FaceRep's docs/store-listing.md): no results promised, no before/after pictures, no prices,
  no other apps. The face scan is never shown as a rating of looks;
- voices only as the owner asked (Gemini, the voices in voice.json until the owner picks others); tick the platform's
  AI label when posting a reel with them;
- exercises only in a safe, still moment: a break, a desk, the couch, the bathroom mirror, the gym between sets.
  Never while driving (not even at a red light), biking, walking in traffic, cooking or anything that needs the eyes or
  hands (dropped 2026-11-28: the red-light idea). Same for the phone: nobody uses it while driving;
- never mention anything free; the end card sends people to the App Store ("ON THE APP STORE"); the app is iOS only,
  so never the Play Store;
- music made in code, or a track the owner adds in the app when posting (a trending sound helps reach).
