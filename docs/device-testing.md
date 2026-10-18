# Testing on a real iPhone

The web preview (`npx expo start --web`) is only a quick look. These things only really work on an iPhone, so test
them there before every App Store submission:

| Needs an iPhone | Why the browser can't show it |
|---|---|
| Purchases, Restore, Premium exercises unlocking | StoreKit and RevenueCat only run in an iOS build |
| Reminders (notifications) | Local notifications are an iOS service |
| Haptics, voice cues, keep-screen-on | The browser has no Taptic Engine; its voices and wake lock behave differently |
| Mirror (camera permission prompt) | The iOS prompt, "Don't Allow" and the Settings-app path only exist on iOS |
| Move check in the mirror (face tracking) | ARKit runs only on an iPhone with Face ID or an A12 chip and later; not in the Simulator (docs/face-tracking.md §5) |
| DeviceCheck, Keychain app ID | iOS-only APIs (`modules/device-check`, `expo-secure-store`) |
| Language (Settings → FaceRep → Language) | iOS lists the app's languages from the build |
| SF Symbols, native tab bar, Dynamic Type | iOS rendering |

**Web developer note:** Expo Go (the App Store app) only contains Expo's own native code. FaceRep has its own native
pieces (RevenueCat, the DeviceCheck module), so it needs its own **development build**: your app's native shell,
installed on your iPhone once, that loads the JavaScript from `npx expo start` like a dev server with hot reload. Any
change to native code or `app.json` (a new native package such as the camera, a permission text, a new language) needs
a **new build**; JavaScript changes don't.

## 1. Development build (daily testing)
You need the paid Apple Developer account (the same one as Elowa). Everything runs in Expo's cloud: no Mac or Xcode.

```bash
cd app
npx eas-cli@latest login
npx eas-cli@latest init                     # first time only: links the Expo project (adds extra.eas.projectId)
npx eas-cli@latest device:create            # first time only: open the link on the iPhone to register it
npx eas-cli@latest build --profile development --platform ios
```
When the build finishes (about 15 minutes), open its link on the iPhone and install it. iOS 16+: turn on
Settings → Privacy & Security → Developer Mode once. Then on your computer:

```bash
env -u EXPO_PUBLIC_AI_URL -u EXPO_PUBLIC_RC_IOS_KEY npx expo start --dev-client   # --tunnel if the phone can't reach your laptop
```
and scan the QR code with the iPhone camera. (`env -u …` keeps Elowa's keys, if they're in your shell, out of FaceRep;
the right FaceRep values are in `eas.json`.)

## 2. TestFlight (the build Apple will review)
```bash
npx eas-cli@latest build --profile production --platform ios
npx eas-cli@latest submit --platform ios --latest
```
In App Store Connect → TestFlight, add yourself as an internal tester and install with the TestFlight app. Purchases
there use the **sandbox** (Settings → App Store → Sandbox Account on the iPhone): nothing is charged, and a monthly
subscription renews every few minutes.

## 3. Checklist (about 20 minutes)
Delete the app first so onboarding and permissions start fresh.

- [ ] **Onboarding:** welcome shows both people; safety line under Get started; pick Woman → focus list starts with Lips; Continue opens Today (no safety or reminder step). Start a workout with a jaw exercise (jaw clench, jaw jut or lion face): the jaw warning shows during Get ready / rest.
- [ ] **Workout:** start Day 1. The screen stays on for the whole workout without touching it (Auto-Lock at 30 s:
      Settings → Display & Brightness → Auto-Lock). Haptics on every squeeze and release.
- [ ] **Voice cues:** "Get ready…", "Squeeze", "Relax", "Last one", "Next up: …", "Workout complete". Play music in
      another app first: it gets quieter for each cue and comes back (it must not stop). The speaker button mutes cues.
      Try with the ring/silent switch on silent and note whether you hear the cues.
- [ ] **Massage exercises:** the ring and the voice say "Massage" instead of "Squeeze".
- [ ] **Mirror:** tap the person button → iOS asks for the camera with our text → Allow → your face appears in the corner,
      mirrored. Leave the app and come back: the workout is paused and the camera restarts. Delete and reinstall, tap
      "Don't Allow", tap again → our alert offers Settings. Tap the small mirror: it swaps with the figure.
- [ ] **Move check:** the checklist in docs/face-tracking.md §5 (Brow Lift with the mirror on: the level fills and the
      count goes up once per hold).
- [ ] **Pause by leaving:** press the side button during a workout → it pauses; unlock → Resume works.
- [ ] **Languages:** Settings → Language opens FaceRep in the Settings app → Language → Español: the app restarts in
      Spanish (texts, voice, reminder notifications, Coach replies). Check long German words fit (Deutsch).
- [ ] **Reminders:** add one for 2 minutes from now; the notification arrives; turning it off cancels it.
- [ ] **Free days and Premium download (sandbox):** without Premium, days 1–3 work; the library shows the Premium
      exercises only as "Premium exercise" on the dark card with the app's mark and a lock (no names, no pictures).
      After day 3, Today shows Day 4 locked: one exercise named, the others as that card, "Unlock Day 4"; the week
      page shows days 4–7 the same way. Unlock →
      buy → Today shows "Getting your Premium exercises… %", then Start; every exercise opens in the library with its
      name, steps and video. Turn on Airplane Mode and force-quit: everything still works. Delete the app, reinstall,
      Restore: the Premium exercises download again. With the Worker unreachable (Wi-Fi off before buying), Today says
      they couldn't be downloaded, and Try again works once back online.
- [ ] **Weeks:** Today says "Week 1 · Day 1" with no jaw exercises; finish it → "Day 1 done. Day 2 is ready tomorrow.";
      the next day it says Day 2 (a missed day just waits). Day 7 is the easy day. Tap "Week 1 · Day 1": the week page
      lists day 1 to 7, today open with Start, a later day opens to its exercises, a done day is green with "Done" and
      opens to what you did that day. Start Today's workout, finish one exercise and End: the alert says the day counts
      once at least half is done, and Today still shows the same day; do at least half and End: the day is done.
- [ ] **Coach:** consent screen first; 3 free answers; a reminder proposal only applies after Confirm. Say "I did my jaw
      exercises this morning, about 5 minutes": a Save workout card shows today, the exercises and the minutes; Save → it
      appears in Progress with a "Logged" tag. Ask "a quick 5-minute jaw routine": Start opens the player with those
      exercises. The keyboard's mic button dictates into the Coach.
- [ ] **Videos:** an exercise page plays its clip in a loop (pause button works; your music keeps playing); in a workout
      the clip plays during "Get ready" and "Next up", then the drawings follow the counter. Settings → Accessibility →
      Motion → Reduce Motion: the drawings instead of the clips.
- [ ] **Face map:** Exercises tab: tap the jaw, eyes, forehead and neck on the face; each lights up with its
      note and exercises. On Today, tap a lit area of the face: the Exercises tab opens on it.
- [ ] **Dark mode and large text:** Control Center → Dark Mode; Settings → Accessibility → Larger Text at the largest
      size: nothing cut off on Today, the workout player and Settings.
- [ ] **VoiceOver:** the timer reads phase and seconds; the voice and mirror buttons read as switches with on/off.
- [ ] **iPad (if you have one):** install the TestFlight build on it. FaceRep is iPhone-only, but App Review often opens
      iPhone apps on an iPad, where they run in an iPhone-sized window (guideline 2.4.1). Check onboarding, the paywall
      (close, buy, Restore), a workout with the mirror, and the Coach.

Write down anything odd with the iPhone model and iOS version.
