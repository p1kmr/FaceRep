# Building it in React Native

The same stack as FaceRep: React Native through Expo, Expo Router, strict TypeScript. Checked on npm on 2026-10-25.

- **Start on Expo SDK 58** (stable since 29 September 2026; FaceRep is on 57).
- **Development builds, not Expo Go:** HealthKit, alarms, widgets and purchases are native modules (same as FaceRep).
- **Almost everything has a maintained package.** The one piece of Swift worth writing is a small Vision module for the
  check screen's highlights (below).

## 1. Feature → package

| Feature | Package | Own native code? | Notes |
|---|---|---|---|
| Screens, languages, database, reminders | expo-router, i18next + expo-localization, expo-sqlite, expo-notifications | No | As in FaceRep |
| Camera scan and barcodes (EU DataMatrix, Medikationsplan, Japan QR) | expo-camera | No | `barcodeScannerSettings={{ barcodeTypes: ['datamatrix', 'qr'] }}` |
| Pick a label photo | expo-image-picker | No | "No permissions request is necessary for launching the image library." Its config plugin still writes a Photos purpose string by default, so translate it |
| Read the text on the iPhone | expo-text-extractor 2.0 (Apple Vision on iOS, Google ML Kit on Android) | No, for the prototype | Returns plain lines (`Promise<string[]>`): no positions, no confidence |
| Highlight each field on the photo, mark unsure ones | Own Expo module (Swift, Vision `VNRecognizeTextRequest`) | **Yes, small** | Vision gives a box and a confidence per line. Same pattern as FaceRep's `modules/face-tracking` |
| On-device AI field extraction (iOS 26, Apple Intelligence iPhones) | @react-native-ai/apple 0.12 (Vercel AI SDK provider, structured output, New Architecture) or react-native-apple-llm 1.0.16 | No | Check availability first and fall back to the rules (apple-rules.md §6) |
| Time Sensitive reminders with Taken / Snooze / Skip | expo-notifications | No | `interruptionLevel: 'timeSensitive'`; the entitlement goes in `app.json` (`ios.entitlements`) |
| Refresh the rolling reminder window | expo-background-task | No | iOS decides when it runs, so also refresh on every app open |
| Alarm mode (iOS 26) | react-native-nitro-ios-alarm-kit 1.0.41 | No | Needs react-native-nitro-modules |
| Import from the Health app (iOS 26 medications) | @kingstinct/react-native-healthkit 16.2 | No | `requestMedicationsAuthorization`, `queryMedications`, dose events; read-only, like Apple's API |
| Next-dose widget, Lock Screen widget, Live Activity | expo-widgets (SDK 58) | No (SwiftUI through `@expo/ui`) | Widgets run in an isolated runtime: no hooks, state or async; interactive buttons need iOS 17. Alternative: @bacons/apple-targets 5.0 and plain Swift |
| Purchases | expo-iap 6.3 (StoreKit 2) or react-native-purchases (RevenueCat, as in FaceRep) | No | StoreKit only keeps "Data Not Collected" (README §3.3) |
| A PDF list for the doctor | expo-print + expo-sharing | No | |
| Apple Watch app | Nothing good in React Native | Yes (SwiftUI) | Not needed at first: reminders already show on the Watch |

## 2. Test these first, on a real iPhone
React Native can't hide how iOS runs apps in the background, so the first prototype should be: scan → check screen →
one Time Sensitive reminder with Taken / Snooze.
- **Tapping Taken on the Lock Screen without opening the app.** iOS wakes the app in the background for a short time;
  the JavaScript has to start, save the dose and cancel the follow-up in time. If it's unreliable, that part moves to a
  few lines of native code.
- Focus modes, silent mode, the Apple Watch, a restart, a time zone change, daylight saving.
- How well expo-text-extractor reads the label test set (README §4) before writing the Vision module.

## 3. Android later
React Native also gives an Android app from the same code, and for this app that matters: Android is 72% of phones in
Germany and Mexico, 79% in Brazil and 94% in India (StatCounter, September 2026). What changes on Android: text reading
uses Google ML Kit (check what it sends to Google for Play's Data safety form), exact-time reminders need Android's
exact-alarm permission and careful handling of phone makers' battery savers, and Google Play has its own rules for
health apps. Research those before starting; ship iOS first.

## Sources
- npm registry, 2026-10-25: [expo](https://www.npmjs.com/package/expo) (58.0.19),
  [expo-text-extractor](https://www.npmjs.com/package/expo-text-extractor),
  [@react-native-ai/apple](https://www.npmjs.com/package/@react-native-ai/apple),
  [react-native-apple-llm](https://www.npmjs.com/package/react-native-apple-llm),
  [@kingstinct/react-native-healthkit](https://www.npmjs.com/package/@kingstinct/react-native-healthkit),
  [react-native-nitro-ios-alarm-kit](https://www.npmjs.com/package/react-native-nitro-ios-alarm-kit),
  [expo-iap](https://www.npmjs.com/package/expo-iap),
  [@bacons/apple-targets](https://www.npmjs.com/package/@bacons/apple-targets)
- Expo docs: [Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/),
  [ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/),
  [Widgets](https://docs.expo.dev/versions/latest/sdk/widgets/)
