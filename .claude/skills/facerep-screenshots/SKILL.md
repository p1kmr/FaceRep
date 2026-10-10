---
name: facerep-screenshots
description: Make or update FaceRep's App Store screenshots, from the iOS Simulator or the automated web capture, in FaceRep's eye-catching deck style (bold headline, tilted iPhone, one detail lifted out). Use when asked to take store screenshots, redo a slide after an app change, add a language, or make screenshots "eye-catching like before".
---

# FaceRep store screenshots

Follow **docs/screenshots.md**. It is the full recipe; this is the order of work.

1. Read §1 (principles) and §2 (the design recipe) before touching anything. The look stays the same: the eight
   slides in §3, the words in `store-screenshots/capture/copy.js`.
2. Capture:
   - on a Mac with the **iOS Simulator**: §4. iPhone 17 Pro Max, status bar 9:41, light mode, demo data with
     `store-screenshots/capture/sim-seed.js`, each language with `-AppleLanguages`, files in
     `capture/sim/<lang>/<name>.png`, card boxes in `capture/sim/<lang>/regions.json`;
   - anywhere else: §5 (the web capture).
3. What the Simulator can't do (§4): the camera mirror (slide 5), Premium content, and only 3 free Coach answers
   per ID. Use the workarounds listed there. Never add a hidden Premium or test switch to the app (App Store 2.3.1).
4. Frame and cut with `node frame.js --sim` and `node art.js --sim` (no `--sim` for web captures). Then export as in
   §6.
5. Check every language with §7 and run `npm test` in `app/`.
6. Show the owner the strips (`store-screenshots/export/strip-<lang>.jpg`) and say which slide numbers changed.
   Upload only after the owner agrees, and only the changed slides.

Never put prices, result claims, before/after pictures or other apps on a slide. Never edit `export/` by hand.
Never touch Elowa.
