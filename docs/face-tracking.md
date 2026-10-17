# Face tracking: the mirror's move check

The workout mirror can show when it sees the exercise's move: a level on the edge of the mirror fills and turns green,
and a line counts the holds it saw ("Seen 3 of 10"). It uses Apple's face tracking (ARKit) on the iPhone. Nothing is
recorded, saved or sent. Tapping the small tile swaps the figure and the mirror, so the mirror can be big; it can be dragged anywhere and × closes the mirror.

Status: an experiment on `main` as one commit ("Mirror move check with Apple face tracking…", from the branch
`feat/openCV`), **not yet tried on an iPhone**. It needs a new build (build 8; an over-the-air update can't add native
code), §5. The numbers in `constants/moves.ts` are first guesses to tune on a device. If it doesn't work out, revert that
commit and deploy the Worker again, so the privacy policy loses the face data paragraph.

## 1. Why ARKit and not OpenCV

The fitness apps that count squats or push-ups from the camera (for example QuickPose's demos) use a machine-learning pose
model (Google's MediaPipe BlazePose) that finds body points, then count reps from the angles. For faces, iOS already has
the same thing built in: ARKit's face tracking gives 52 named face movements ("blend shapes", 0–1: `browInnerUp`,
`cheekPuff`, `mouthPucker`, `jawOpen`, `eyeBlinkLeft`…) and the head's rotation, 60 times a second, on the iPhone.
Those names are close to the exercise list, so FaceRep needs no image processing of its own.

| Option | What it gives for faces | What it costs FaceRep | Verdict |
|---|---|---|---|
| **ARKit face tracking** (Apple) | 52 blend shapes + head pose | One small local Swift module like `modules/device-check`; no download, no model file. Needs Face ID (TrueDepth) or an A12 chip and later | **Chosen** |
| Vision face landmarks (Apple) | 76 points in 2D | Camera frames (a frame-processor library) and our own maths to turn points into moves | Only if older iPhones ever matter |
| MediaPipe Face Landmarker (Google) | 478 points + the same 52 blend shapes | A third-party SDK, a ~4 MB model, a frame-processor library | The choice if FaceRep ever goes cross-platform |
| OpenCV | General image tools; face boxes. Face points need extra models | A large native library with no maintained Expo binding, frame plumbing, and we would still write the face logic | No |
| ML Kit face detection (Google) | Smiling and eyes-open probabilities, head angles | Too few signals, and it sends usage metrics to Google (against "no analytics or tracking", and the privacy labels would change) | No |
| Sending frames to a server or an AI | – | Breaks "never send camera frames" (docs/app-review.md, guidelines 2.5.14 and 5.1.2(vi)), slow, costs money | Never |

**Web developer note:** on the web you would use MediaPipe in the browser (WebAssembly). In an iOS app the system's
own frameworks are the better default: smaller app, no third party, and Apple reviews them as expected behaviour.

## 2. How it works

```
ARKit face anchor (60/s)
  └─ modules/face-tracking/ios/FaceTrackingView.swift   the mirror (camera on screen) + onFace event 15/s:
                                                        tracked, t, shapes {name: 0–1}, rotation (3×3)
       └─ services/faceTracking.ts                      the only import of the module; null on web, in Expo Go,
                                                        in the Simulator and on iPhones without face tracking
            └─ hooks/useMoveCheck.ts  ◄── workout phase (Get ready / Squeeze / Relax / Next up / paused)
                 └─ services/workout/moveCheck.ts       pure and tested: learn the relaxed face, smooth, in/out of
                 │                                      the pose, count holds
                 └─ components/exercise/MoveMeter.tsx   the level and the line on top of the mirror
```

- **Relaxed face, per person.** During Get ready, Relax and Next up (after 0.8 s, to let go of the last hold) the
  engine learns the user's relaxed values: quickly down, slowly up, so a blink or a word barely moves them. Each hold
  is measured against them, so nobody has to reach a fixed face. Nothing is measured until a relaxed face is learned.
- **In the pose** when the smoothed level reaches 0.8 of the move, out again below 0.5 (no flicker).
- **A hold counts** after 40% of it in the pose (at least 1 s, at most 2.5 s). Once per hold; pausing and resuming
  doesn't count it twice. The count belongs to the current exercise and lives only in memory.
- **Head moves** (Chin Lift, Neck Side Stretch) are measured as a turn from the relaxed head around the face's own axes,
  so it doesn't matter how the iPhone stands. Both sides count.
- **Wide Eyes** also watches the eyebrows (they should stay still) and says so.
- The camera stops in the background (the view's `active` prop) and when the mirror closes. When the move check is off
  or the iPhone can't track faces, the mirror is the plain camera (`expo-camera`) as before. Only one of them uses the
  camera at a time.
- **If ARKit stops** with an error, the mirror switches to the plain camera for the rest of that workout (no level),
  so it never stays black. After an interruption (a call, Control Center) tracking starts again. The device log has
  `FaceRep face tracking …` lines (started, first camera frame, interrupted, failed with Apple's error code; never
  anything about the face): Console app on a Mac with the iPhone connected, search "FaceRep face".

## 3. Which exercises

| Exercise | What the camera reads | Counts from |
|---|---|---|
| Chin Lift | head nod | 20° |
| Neck Side Stretch | head tilt (either side) | 15° |
| Cheek Lift | smile (both corners) | +0.4 |
| Lip Corner Lift | smile (both corners) | +0.2 |
| Fish Face, Pout | mouthPucker | +0.35 |
| Smiling Fish | mouthPucker | +0.3 |
| Cheek Puff | cheekPuff | +0.3 |
| O Stretch | jawOpen | +0.25 |
| Lip Press | lip press and roll (average) | +0.2 |
| Brow Lift | brows up (inner and outer) | +0.3 |
| Wide Eyes | eyeWide (brows should stay below +0.25) | +0.2 |
| Lower Lid Lift | eyeSquint | +0.2 |
| Eye Squeeze | eyeBlink | +0.5 |

Not followed, on purpose: Jaw Clench, Mewing and Tongue Press (inside the mouth), Chin Tuck (a glide the camera can't
measure well yet), **Jaw Jut and Lion Face** (jaw caution: a level to fill could tempt someone to push the jaw), and the
eight exercises done with the hands (they cover the face). A test keeps hands-on and jaw-caution exercises unfollowed.

## 4. Rules

- **Privacy (5.1.1, 5.1.2(vi)).** Face data stays on the iPhone: read, used for the level and dropped. No frames, images,
  face meshes or numbers are stored or sent; never used to identify anyone, for marketing or for data mining. App
  Privacy labels don't change (data that never leaves the device isn't "collected").
- **Say it where Apple looks.** App Review asks apps that use face tracking what face data they use, why, whether it is
  shared and where it is kept, and wants the privacy policy to say it. The policy has a "Face data (move check)"
  paragraph (`worker/src/pages.js`, a Worker test keeps it), and the camera purpose string mentions the move check in
  all six languages. Review notes for the release (paste into App Review details):
  > The workout mirror's optional move check uses ARKit face tracking on the device to show whether the camera sees the
  > exercise's movement (for example raised eyebrows) and how many holds it saw. Face data (blend shape values and head
  > rotation) is processed on the iPhone in real time and discarded: it is not stored, not sent to our server or any
  > third party, and not used for identification, advertising or data mining. To see it: Settings → Mirror in workouts
  > on, start Brow Lift from the Exercises tab. It can be turned off in Settings → Move check in the mirror.
- **No claims (1.4.1, 2.3.1).** It reads movement now, never face shape, symmetry, "progress" or a score. No "AI face
  scan" wording, and no "beta" label in the app (2.2).
- **Safety.** No jaw-caution exercise is followed, and the level is full as soon as the move counts: it never asks for
  more. The jaw caution and the safety texts stay as they are.
- **Every iPhone keeps the app.** No `UIRequiredDeviceCapabilities` for ARKit: without face tracking the mirror is the
  plain camera and the Settings row is hidden.
- **Native code.** `services/faceTracking.ts` is the only import of the module. A change in `modules/face-tracking` needs
  a new build; changing `constants/moves.ts` doesn't. The mirror is an `ARSCNView` (SceneKit), which Apple
  soft-deprecated in 2025: it keeps working and builds for the Simulator too. If a later Xcode drops it, move the view to
  RealityKit's `ARView`; the events stay the same.

## 5. Testing on an iPhone

The web preview, Expo Go and the iOS Simulator have no face tracking (they show the plain mirror). Use build 8 from
TestFlight, or a development build (docs/device-testing.md §1), then:

- [ ] Settings shows "Move check in the mirror" (on). Turn the mirror on, start Brow Lift: "Looking for your face…",
      then the level and "Seen 0 of 10".
- [ ] Raise the brows on "Squeeze": the level fills and turns green, the count goes up once per hold.
- [ ] The picture is mirrored like the plain mirror (raise your right hand: it shows on the right). If not, flip the
      view in `FaceTrackingView.swift` (`sceneView.transform = CGAffineTransform(scaleX: -1, y: 1)`).
- [ ] Neck Side Stretch counts both sides; Chin Lift counts a nod up. Wide Eyes says "Keep your eyebrows still" when
      the brows rise.
- [ ] Tap the small mirror: it becomes big and the count goes on (no restart). Tap the small figure to swap back.
- [ ] Drag the small tile over the buttons and back: the count goes on; the next workout opens it in the same spot. × closes the mirror.
- [ ] Cover the camera: "Face not in view". Leave the app and come back: the camera restarts, the count stays.
- [ ] The mirror shows your face, not black. If it's black with "Face not in view", read the `FaceRep face tracking`
      lines in Console (§2): no "first camera frame" means ARKit got no camera (the error code says why).
- [ ] Settings → Move check off: the plain mirror, no level. Jaw Jut, Lion Face and the hands-on exercises: no level.
- [ ] A 10-minute workout with the mirror big: note battery and warmth.
- [ ] If you can, an iPhone without Face ID but with A12 or later (iPhone SE 2nd or 3rd generation): tracking works
      there too, with the plain front camera.

## 6. Tuning

The rises in `constants/moves.ts` (`MOVES`) and the engine's settings (`MOVE_CHECK`) are guesses. If a move is too hard
to count, lower its `rise`; if it counts without doing it, raise it. Keep jaw-related moves gentle. These are JavaScript
changes: no new build. Run `npm test` after a change (the catalog test checks the ranges).

## 7. Before it ships

- [ ] Device test (§5) on at least one Face ID iPhone, then tune §6.
- [ ] Deploy the Worker first: the privacy policy's face data paragraph (`cd worker && npm run deploy`).
- [x] Review notes: the notes in docs/launch.md describe it (the paragraph in §4, shortened).
- [ ] What's New (docs/store-listing.md, six languages): describe it plainly ("The mirror can show when it sees the
      move"), no result words.
- [ ] Store slide 5 shows the mirror: the small tile now has a swap button. Re-capture it (store-screenshots/README.md).
      A slide that shows the level would need a real iPhone screenshot (no face tracking in the web capture).
- [ ] A native speaker checks the new texts (Settings row and hint, mirror lines, camera purpose string).

## 8. Ideas for later

- Self-paced reps: the hold starts when the camera sees the move (a change to `services/workout/timer.ts`).
- Chin Tuck from the face's distance to the camera.
- A light haptic when a hold counts, for exercises done with the eyes closed.
- A line on the workout summary ("The camera saw 42 of 50 holds"), shown once and not saved.
