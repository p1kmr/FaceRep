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
| `screens.mjs` | copies the store capture's real screens into `reels/screens/` (committed), optionally taking them first |

Make one, from the facerep folder:

    node reels/render.mjs reels/001-looksmax --stills
    node reels/render.mjs reels/001-looksmax

`--stills` saves only the still pictures (`out/still-<seconds>.jpg` and `out/sheet.jpg`), for a quick look.

The screens come from `store-screenshots/capture/sim/en/` (the store capture: a free user with demo data). Those are
git-ignored, so `reels/screens.mjs` keeps a committed copy in `reels/screens/` (1080-wide JPGs) for other computers
and Claude Code cloud sessions. On the Mac, with the app in an iPhone Simulator (docs/screenshots.md §4):

    node reels/screens.mjs --capture     takes the English screens (about 3 min), copies them to reels/screens/
    git add reels/screens && git commit -m "reels: app screens" && git push

Run it again after an app change that a reel's screen shows. The renderer uses a fresh Simulator shot when there is
one, else the copy. `out/` is git-ignored.

Rules:
- the store text's rules apply (docs/store-listing.md): no results promised, no before/after pictures, no prices,
  no other apps. The face scan is never shown as a rating of looks;
- no voice unless the owner asks for one, and then only the one the owner picks;
- music made in code, or a track the owner adds in the app when posting (a trending sound helps reach).
