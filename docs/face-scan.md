# Face scan

A 35-second guided scan in front of the camera, one move at a time. It gives two numbers, **Movement** and **Balance**,
plus a score for each move. Results are saved on the iPhone and shown as a chart over time. An optional progress photo
is taken at the start of each scan and stays on the iPhone. Everything runs on the iPhone with Apple's face tracking
(ARKit, the same module as the mirror's move check, docs/face-tracking.md). Nothing is sent anywhere.

Free users get **3 scans in all**; Premium has unlimited scans.

## 1. What it measures, and why these numbers

ARKit gives 52 "blend shapes" for a face, about 15 times a second: how far each part moves from neutral, 0–1
(`browInnerUp`, `mouthSmileLeft`, `jawOpen`…). They describe **movement, not shape**. That is exactly what facial
exercises can change, so the scan stays honest: no score of looks, face shape, symmetry of the face or age, and no
"exercises will raise your jawline score".

| Move (step) | Blend shapes read | Sides? |
|---|---|---|
| Relax your face | every shape below (the baseline) | – |
| Raise your eyebrows | `browOuterUpLeft/Right` + `browInnerUp` | yes |
| Squint your eyes | `eyeSquintLeft/Right` | yes |
| Big smile | `mouthSmileLeft/Right` | yes |
| Pucker your lips | `mouthPucker` | – |
| Open your mouth (as wide as is comfortable) | `jawOpen` | – |
| Puff your cheeks | `cheekPuff` | – |

- **Per move:** during the 2.5 s hold, the 80th percentile of the values (robust to a twitch and to the moment it
  takes to reach the pose), minus the user's own relaxed face. This gives a rise of 0–1 per side and for the middle.
- **Score of a move (0–100):** rise ÷ `full` × 100, capped at 100. `full` is a big, comfortable move
  (`constants/faceScan.ts`). The mouth's `full` is low on purpose, so a comfortable opening already scores 100 and
  nobody forces the jaw.
- **Movement:** the average of the moves read (at least 4 of 6, or the scan isn't saved).
- **Balance:** for the moves with two sides (brows, eyes, smile), the smaller side ÷ the bigger side × 100, each side
  capped at `full`, so it agrees with the "Left 72 · Right 65" shown. A move smaller than 0.12 on both sides has no
  balance (too small to judge). The headline Balance needs at least 2 of the 3.
- **Change:** each number against the scan before ("+5 since Oct 12").
- **Smallest move:** tagged on the results, with a link to the exercises for its face area.

ARKit's "Left" is the user's own left side, which is on the left of the mirrored picture.

**Only good samples count.** A sample is measured only when a face is tracked, points at the screen (within 20° of the
camera, computed in Swift from the camera and face transforms) and is 18–70 cm away. Otherwise the ring pauses and the
panel says why ("Look straight at the screen", "Move a little closer"). A move that can't get 2.5 s of good samples in
10 s is skipped.

**Raw readings are saved, not scores.** `face_scans.moves` holds the rises (0–1). Scores are computed when shown
(`services/faceScan/score.ts`), so tuning `full` re-scores every past scan the same way. Do that before launch, or
accept that history changes after an update.

## 2. The flow

```
Today card (none in 7 days) ┐
Progress → Face scan        ├─► /scan  intro: tips, the photo question (once), Start
Paywall when no free scan  ─┘          camera: find face → 3-2-1 → relax (photo) → 6 moves (prepare 1.2 s → hold 2.5 s → relax 1 s)
                                       → save → /scan-result (rings, change, moves, how it's measured)
Progress → Face scan: latest numbers, chart (last 12), New scan, Progress photos (/scan-photos), the scans
```

- Sound cues: the voice says each move, or with Beeps 3, 2, 1 before the first move and a beep at the start and end of
  each hold; a haptic marks the start and end of each hold either way.
- Leaving the app or closing the scan stops it. Nothing is saved, and a photo already taken is deleted. Only a real
  background counts: a system alert or Control Center ("inactive") just pauses the camera and the scan waits for the face.
- If ARKit stops, the camera view tries again twice by itself (`FaceTrackingView.swift`); after that "The camera
  stopped (Error N)" offers Try again (a new run with a fresh camera view) or Close. N is Apple's `ARError` code, also in
  the device log ("FaceRep face tracking failed"). 103 (no camera permission) shows the Settings prompt instead.
- Fewer than 4 moves read: "Not enough moves read". Nothing is saved, and it doesn't count as a used scan.

## 3. Privacy and storage

| What | Where | Leaves the iPhone? |
|---|---|---|
| Blend shapes, head angle, distance | read 15×/s, then discarded | never |
| Scan readings (date + a few numbers) | SQLite `face_scans` (migration 4) | never (it's in the user's own iPhone backup, like workouts) |
| Progress photo (only if the user said yes) | `Library/Application Support/FaceScanPhotos/<scan id>.jpg`, JPEG ≤ 1440 px | never: **excluded from iCloud and computer backups**, complete file protection, not in the photo library |
| Free scans used | kv `facerep.faceScans` | never |

- **Photo consent:** asked once on the intro with its own buttons (Save photos / No thanks). Nothing is taken until the
  user says yes. Settings → Training → "Face scan photos" and the photos screen turn it on (showing the same text first)
  or off. The photo is the camera picture as on screen (`ARSCNView.snapshot()`), without the app's buttons, taken
  halfway through the relaxed face. A "Photo saved on this iPhone" chip shows when it's taken (2.5.14).
- **Delete:** one photo or all photos (photos screen), one scan (results → trash), everything (Settings → Delete all
  data). Deleting the app deletes them. Because photos aren't in backups, they don't move to a new iPhone (support page
  says so).
- **App Privacy labels don't change:** data that never leaves the device isn't "collected". No new permission: the
  camera purpose string covers the scan and the photo in all six languages. No photo library access.
- The privacy policy has a "Face data (face scan)" paragraph and the Terms list the free scans (`worker/src/pages.js`,
  a Worker test keeps both). **They reach the public pages only after `cd worker && npm run deploy`.**

## 4. App Review (docs/app-review.md)

- **1.4.1 / 2.3.1:** movement only, never looks, face shape, attractiveness, age or "symmetry score". No promise that
  scores rise. "Not a medical test" on the intro and in "How it's measured", which also explains the method (Apple's
  face tracking, the relaxed-face baseline, what 100 means, that light, distance and effort change the numbers).
  `npm run review:check` now fails on looks-rating words in all six languages (attractive, golden ratio, beauty score…).
- **Safety:** the mouth move says "as wide as is comfortable. Don't force it." and its score tops out early. No jaw
  jut, no clench.
- **5.1.1, 5.1.2(vi):** face data is used only for the user's own scan, on the device; never for identification,
  advertising or data mining.
- **3.1.1 / 3.1.2:** 3 free scans in all, then the paywall (in-app purchase). The paywall lists "Unlimited face scans",
  the Terms list the free scans, and `review:check` keeps `FREE_LIMITS.scans` equal to `FREE_SCANS` in the Terms.
- **The free limit is kept in the app.** The scan runs only on the iPhone, so there is nothing the Worker could hold
  back. A patched app could skip the limit; accepted (it gives no Premium exercises or Coach answers).
- **2.1:** iPhones without face tracking (older than A12) don't show the scan at all. Every iPhone keeps the app.

## 5. Testing

**iOS Simulator (no camera).** The module tells the app it's a Simulator (`isSimulator`). The scan then plays a pretend
face (`services/faceScan/simulatedFace.ts`) that does whatever the scan asks, and the photo is a drawn stand-in, so
everything except the camera can be tried: intro, photo question, the run, saving, results, chart, history, photos,
deleting, the free limit and the paywall. Use a Release build (`npx expo run:ios --configuration Release`). For the store
screenshots a picture in the app's `Documents/SimulatorCamera/scan.jpg` shows behind the oval and becomes the photo
(`simulatorCamera`, Simulator only; docs/screenshots.md §4).

**iPhone (needs a new build: native code changed).** A development build is best for tuning, since a JavaScript
change then needs no new build. Otherwise use TestFlight.

- [ ] Progress → Face scan → Start your first scan. The intro asks about photos once. Choose Save photos, then Start.
      iOS asks for the camera if the mirror never did.
- [ ] Face in the oval: "Get ready", 3-2-1. Each move: the title, the ring fills only while you hold it, a haptic at the
      start and end. Turn your head away: "Look straight at the screen", and the ring pauses.
- [ ] The relaxed step shows "Photo saved on this iPhone". The photo (Progress → Progress photos) is your face as
      the mirror showed it, upright and mirrored, without buttons.
- [ ] **Left and right:** do the eye squint with only your left eye. The result should show Left higher than Right.
      If it's reversed, swap `left`/`right` in `SCAN_MOVES` (a JS change).
- [ ] Results: Movement and Balance, every move with a bar, "Smallest move" with its exercises link, How it's measured.
- [ ] A second scan: the change shows ("+3 since …"), the chart has two points, Today hides its card for 7 days.
- [ ] Free user: after 3 scans, New scan says "Unlimited scans with Premium" and opens the paywall.
- [ ] Leave the app mid-scan: back to the intro, nothing saved. Pull down Control Center mid-scan: the scan pauses and
      goes on after. Settings → Delete all data removes scans and photos.
- [ ] Never "The camera stopped". If it shows, note the error number: 102 = a sensor failed (does Face ID work on this
      iPhone?), 101 = sensor unavailable; the Console lines "FaceRep face tracking" say more (face-tracking.md §2).
      101 and 102 show "Face tracking isn't working" instead: on a Face ID iPhone ARKit needs the TrueDepth camera, so
      an iPhone whose Face ID is broken can't scan (its plain camera still works; the mirror falls back to it). Found
      on the owner's test iPhone (2026-10-19): test the scan on an iPhone where Face ID works.
- [ ] Dark room or far away: the panel says what's wrong; a scan with fewer than 4 moves read isn't saved.
- [ ] VoiceOver reads each move as it changes. Large text: the panel still fits.

## 6. Tuning (after the first iPhone scans)

The values in `constants/faceScan.ts` are first guesses: no published typical ARKit maxima exist. After a few scans by
two or three people:

- **`full` per move:** a big, comfortable effort should land around 85–100. If almost everyone hits 100 on a move,
  raise its `full` (the scale saturates and can't show change); if strong efforts sit at 50–60, lower it. Keep
  `mouthOpen` low.
- **`maxTurnDeg`, distances:** if the scan keeps saying "Look straight at the screen" while you do, raise
  `maxTurnDeg` a little (the camera sits above the screen, so looking at the screen is ~5–10° off the camera).
- **Repeatability:** two scans a minute apart should differ by only a few points. If they don't, lengthen `holdSec`.

These are JavaScript changes. Run `npm test` after.

## 7. Files

- `modules/face-tracking/ios/`: `FaceTrackingView.swift` (adds `turn`, `distance`, `snapshot`),
  `FaceRepFaceTrackingModule.swift` (`isSimulator`, `photosDirectory`, `takePhoto`, `deletePhoto`, `deleteAllPhotos`),
  `ScanPhotos.swift` (the folder, excluded from backups).
- `services/faceTracking.ts` (still the only import of the module: `faceScanMode`, photo functions).
- `constants/faceScan.ts`, `services/faceScan/` (engine, score, simulatedFace, scansRepo: all pure but the repo, with
  tests), `state/faceScan/`, `hooks/useFaceScans.ts`, `useScanRun.ts`, `useScanPhotosSetting.ts`.
- Screens: `app/scan.tsx`, `scan-result.tsx`, `scan-photos.tsx`; `components/scan/`; the Today card, the Progress
  section, Settings → Training → Face scan photos, the paywall benefit.
- Texts: `i18n/locales/<lang>/scan.json` (six languages), camera purpose string (`locales-native`, `app.json`).
