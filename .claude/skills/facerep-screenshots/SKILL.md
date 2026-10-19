---
name: facerep-screenshots
description: Make or update FaceRep's App Store screenshots, from the iOS Simulator or the automated web capture, in FaceRep's eye-catching deck style (bold headline, tilted iPhone, one detail lifted out). Use when asked to take store screenshots, redo a slide after an app change, add a language, or make screenshots "eye-catching like before".
---

# FaceRep store screenshots

Follow **docs/screenshots.md**. It is the full recipe; this is the order of work.

1. Read §1 (principles) and §2 (the design recipe) before touching anything. The look stays the same: the nine
   slides in §3, the words in `store-screenshots/capture/copy.js`.
2. Capture on a Mac with the **iOS Simulator**: §4. iPhone 17 Pro Max Release build, status bar 9:41, light mode,
   camera allowed; then `node camera.js` and `node sim-capture.js --device <udid>` in `store-screenshots/capture`
   (every screen in every language without a tap; files in `capture/sim/<lang>/`). The web capture (§5) can't film
   the face scan.
3. What the Simulator can't do (§4): the camera (stand-in pictures, Simulator-only), Premium (every screen shows a
   free user), and only 3 free Coach answers per ID (a new ID per language). Read every Coach answer the script
   prints. Never add a hidden Premium or test switch to the app (App Store 2.3.1).
4. Frame and cut with `node frame.js --sim` and `node art.js --sim` (no `--sim` for web captures). Then export as in
   §6.
5. Check every language with §7 and run `npm test` in `app/`.
6. Show the owner the strips (`store-screenshots/export/strip-<lang>.jpg`) and say which slide numbers changed.
   Upload only after the owner agrees, and only the changed slides.

Never put prices, result claims, before/after pictures or other apps on a slide. Never edit `export/` by hand.
Never touch Elowa.
