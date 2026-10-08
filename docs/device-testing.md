# Testing on a real iPhone

The web preview (`npx expo start --web`) is only a quick look. These things only really work on an iPhone, so test
them there before every App Store submission:

| Needs an iPhone | Why the browser can't show it |
|---|---|
| Purchases, Restore, Weeks 2–4 loading | StoreKit and RevenueCat only run in an iOS build |
| Reminders (notifications) | Local notifications are an iOS service |
| Haptics, voice cues, keep-screen-on | The browser has no Taptic Engine; its voices and wake lock behave differently |
| Mirror (camera permission prompt) | The iOS prompt, "Don't Allow" and the Settings-app path only exist on iOS |
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

- [ ] **Onboarding:** welcome shows both people; pick Woman → focus list starts with Lips; safety screen; reminder step.
- [ ] **Workout:** start Day 1. The screen stays on for the whole workout without touching it (Auto-Lock at 30 s:
      Settings → Display & Brightness → Auto-Lock). Haptics on every squeeze and release.
- [ ] **Voice cues:** "Get ready…", "Squeeze", "Relax", "Last one", "Next up: …", "Workout complete". Play music in
      another app first: it gets quieter for each cue and comes back (it must not stop). The speaker button mutes cues.
      Try with the ring/silent switch on silent and note whether you hear the cues.
- [ ] **Massage exercises:** the ring and the voice say "Massage" instead of "Squeeze".
- [ ] **Mirror:** tap the person button → iOS asks for the camera with our text → Allow → your face appears in the corner,
      mirrored. Leave the app and come back: the workout is paused and the camera restarts. Delete and reinstall, tap
      "Don't Allow", tap again → our alert offers Settings.
- [ ] **Pause by leaving:** press the side button during a workout → it pauses; unlock → Resume works.
- [ ] **Languages:** Settings → Language opens FaceRep in the Settings app → Language → Español: the app restarts in
      Spanish (texts, voice, reminder notifications, Coach replies). Check long German words fit (Deutsch).
- [ ] **Reminders:** add one for 2 minutes from now; the notification arrives; turning it off cancels it.
- [ ] **Premium (sandbox):** tap a locked day → paywall → buy → Weeks 2–4 load; delete the app, reinstall, Restore.
- [ ] **Coach:** consent screen first; 3 free answers; a reminder proposal only applies after Confirm.
- [ ] **Dark mode and large text:** Control Center → Dark Mode; Settings → Accessibility → Larger Text at the largest
      size: nothing cut off on Today, the workout player and Settings.
- [ ] **VoiceOver:** the timer reads phase and seconds; the voice and mirror buttons read as switches with on/off.

Write down anything odd with the iPhone model and iOS version.
