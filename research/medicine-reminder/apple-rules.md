# Apple rules for a medicine reminder

App Review Guidelines as last updated by Apple on **October 16, 2026**, read on 2026-10-25. Numbers are guideline
numbers. FaceRep's docs/app-review.md still applies to everything general (paywall parts, privacy policy, permissions,
ratings, hidden features); this file adds what a medicine app changes.

## 1. Guidelines this app touches

| Rule | What it says | What it means here |
|---|---|---|
| **1.4.1** Medical apps | Apps "that could provide inaccurate data or information… may be reviewed with greater scrutiny". Accuracy claims need data and methodology. "Apps should remind users to check with a doctor in addition to using the app and before making medical decisions." | A misread label is "inaccurate data": the check screen is mandatory. No accuracy claims ("99% accurate"). A "check with your doctor or pharmacist" line in onboarding and Settings, like FaceRep's safety points |
| **1.4.2** Drug dosage calculators | Only from "the drug manufacturer, a hospital, university, health insurance company, pharmacy or other approved entity", or with FDA (or equivalent) approval | **No dose math at all:** no mg-to-tablets conversion, no weight-based doses, no taper plans. The app copies what the label says and the person confirms |
| **2.3.1, 2.3.7** Metadata | No unverifiable claims; no "trademarked terms, popular app names, pricing information" in metadata | Say "helps you remember". No "improves your health", "clinically proven", drug brand names, other apps' names, or "free" in the keywords |
| **2.5.1** HealthKit | HealthKit "should be used for health and fitness purposes and integrate with the Health app" | Importing medicines from Health is fine; say so in the app and store text |
| **3.1.2(a)** Subscriptions | Must "provide ongoing value" and last at least seven days | A local reminder app's Premium is mostly fixed features: a one-time purchase may fit better than a subscription, or the subscription must keep adding things |
| **4.2, 4.3(b)** Minimum functionality, spam | Don't submit apps "indistinguishable from what's already widely available" | The review notes must say what is different (market.md §5) |
| **4.5.4** Notifications | Must "not be required for the app to function", "should not be used to send sensitive personal or confidential information", no marketing without opt-in | The app works without notification permission (Today screen, an explanation, never blocked). **Lock screen privacy:** the default text is "Time for your 8:00 medicines"; showing names is the person's choice |
| **5.1.1(iii)** Data minimization | Use the out-of-process picker instead of full Photos access | Pick label photos with the system photo picker: no Photos permission at all |
| **5.1.1(v)** Sign-in | No login when there are no significant account features | No account in version 1 |
| **5.1.1(ix)** Regulated fields | "Apps that provide services in highly regulated fields (such as … healthcare …) … should be submitted by a legal entity that provides the services, and not by an individual developer" | See README §3.2: individuals do publish reminder apps, but an organization account removes the risk |
| **5.1.2(i)** Sharing, third-party AI | "You must clearly disclose where personal data will be shared with third parties, including with third-party AI, and obtain explicit permission before doing so." Apps "may not require users to enable system functionalities (such as push notifications…)" | Read labels on the iPhone. Any cloud AI later needs a consent screen like FaceRep's Coach |
| **5.1.2(vi)** Camera and photo data | Never for marketing, advertising or data mining | The label photo is used only to read the text, then dropped |
| **5.1.3(i)** Health data | Never for "advertising, marketing, or other use-based data mining"; disclose the health data collected | No ads, no analytics |
| **5.1.3(ii)** Health data storage | "Apps must not write false or inaccurate data into HealthKit … and may not store personal health information in iCloud" | No CloudKit or iCloud Drive sync of the medicine list (open question below) |
| **2.5.19** Hidden features (new in October 2026) | Nothing hidden or dormant | Same as FaceRep: no debug menus, no server switches |

## 2. Questions to ask Apple before building
- **iCloud (5.1.3(ii)).** Version 1 has no CloudKit or iCloud Drive. Ask whether the normal device backup of the app's
  database is fine, and whether sync would ever be allowed. Some pill apps on the store advertise "iCloud sync" (PillMate,
  Pill Alert Pro, Pillu), but the guideline text is broad, and its origin (2014) was HealthKit data in iCloud.
- **5.1.1(ix)** if the account is an individual one.
- **Critical Alerts** (§4): apply early with a clear case.
- Where: App Review consultations ("Meet with Apple", developer.apple.com/events) or the App Review contact form.

## 3. App Store Connect steps that are new for this app
1. **Regulated medical device status.** Since 26 March 2026, new apps whose primary or secondary category is Health &
   Fitness or Medical (or that answer "frequent" for medical or treatment information in the age rating) must declare,
   for the EU/EEA, the UK and the US, whether they are a regulated medical device (App Information → App Store
   Regulations & Permits; Account Holder or Admin). Answer **No** for each region, which is only true while the design
   stays a non-device (laws-and-safety.md §1). A "Yes" would show regulatory details on the product page (EU SRN or FDA
   number, instructions for use, intended use, safety information). Existing apps have until early 2027.
2. **Category:** Medical as primary (Medisafe, MyTherapy and most pill apps are there).
3. **Age rating:** answer the medical/treatment information and health topics questions honestly. MyTherapy is 13+
   ("infrequent medical treatment information", "health or wellness topics"); Medisafe is 18+.
4. **App Privacy:**
   - StoreKit 2 checked on the iPhone, no server, no third-party SDKs: **"Data Not Collected"**. Apple: "collect" means
     transmitting data off the device, and "You are not responsible for disclosing data collected by Apple."
   - With RevenueCat: Purchases → Purchase History (App Functionality and Analytics), plus User ID if a custom app user
     ID is used.
   - Keep the privacy manifest true either way.
5. **Accessibility Nutrition Labels:** declare only what's really supported (VoiceOver, Larger Text, Dark Interface,
   Sufficient Contrast, Reduced Motion). For older users this is a store-page selling point.
6. **Permission texts** in all six languages: camera (scan), notifications, Health read (`NSHealthShareUsageDescription`,
   only with the import), AlarmKit (`NSAlarmKitUsageDescription`, only with alarm mode). The photo picker never asks for
   permission, but expo-image-picker's plugin still writes a Photos purpose string, so translate it too.
7. **Review notes:** it's a reminder the person sets up, not a medical device; labels are read on the iPhone and
   confirmed; steps to reach every feature. Ship a **sample label** in the app ("Try with a sample"): reviewers may have
   no medicines at hand, and the Simulator screenshots can use it (like FaceRep's stand-in camera).

## 4. Which kind of alert for a dose

| Kind | Breaks through Silent or Focus? | Needs | Apple's intent | Use |
|---|---|---|---|---|
| Normal local notification | No | Notification permission | | Fallback |
| **Time Sensitive** (`interruptionLevel: 'timeSensitive'` in expo-notifications) | Gets through Focus and notification summaries if the person allows; makes a sound only when not on silent | The Time Sensitive capability (`com.apple.developer.usernotifications.time-sensitive`), no approval | For things "requiring immediate attention"; the person can turn it off per app | **Default for every dose** |
| Critical Alert | Yes, plays a sound even on silent | An entitlement Apple must grant, plus the person's permission | Urgent health and safety | Apply; if granted, only for medicines the person marks as critical. One medication app was refused in 2025 ("Apps that can't enforce that usage are not likely candidates for this API"), while Pill Reminder – All in One lists Critical Alerts |
| AlarmKit alarm (iOS 26) | Yes: full alarm on the Lock Screen, Dynamic Island, StandBy, Apple Watch | `NSAlarmKitUsageDescription`, the person's permission | Apple: "Best to use for things like a cooking timer or wake up alarm" and "Not a replacement for critical alerts or time-sensitive notifications" | An opt-in "alarm mode" per medicine, never the default. Expo: `react-native-nitro-ios-alarm-kit` or our own Swift module. A developer reported alarms stopping after an iOS 26.2 beta: test every iOS update |

- **Actions:** `setNotificationCategoryAsync` with Taken / Snooze / Skip; a follow-up when nothing is marked (Apple Health
  waits 30 minutes).
- **The 64 limit:** iOS keeps only the next 64 scheduled local notifications per app. Use repeating triggers where
  possible and a rolling window for the rest (FaceRep keeps at most 60).

## 5. HealthKit Medications API (iOS 26)
- Apps can read the medicines (`HKUserAnnotatedMedication`) and dose events (`HKMedicationDoseEvent`) a person chooses to
  share. Authorization is per medicine: the person switches on the ones to share, and new medicines get a share switch.
- Apple's session shows reading only, no writing of medicines or doses. A forum thread reports a crash when asking for
  write access.
- Use: "You have 4 medicines in Health. Import them?" Data read from HealthKit never goes to iCloud and never feeds ads or
  analytics (5.1.3). HealthKit needs its own purpose string and a native module (Swift, like FaceRep's
  `modules/face-tracking`).

## 6. Apple's on-device AI (Foundation Models) rules
- It may pull fields out of messy label text, but Apple's acceptable-use rules forbid uses that provide "inaccurate or
  dangerous outputs, or [make] decisions without human supervision that have a material impact on individual rights, in
  high-risk domains, including … medical". So the model only suggests; the person confirms every field; it never
  answers health questions and never fills in what it couldn't read.
- Only on Apple Intelligence iPhones (iPhone 15 Pro and newer) with Apple Intelligence turned on and a supported language.
  The non-AI path must always work.

## Sources
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (October 16, 2026)
- [Declare regulated medical device status](https://developer.apple.com/help/app-store-connect/manage-app-information/declare-regulated-medical-device-status),
  [9to5Mac on the new requirement](https://9to5mac.com/2026/03/26/new-app-store-policy-requires-medical-device-disclosures-for-some-health-apps/),
  [MDDI Online: deadline early 2027](https://www.mddionline.com/digital-health/apple-mandates-medical-device-status-for-health-apps-by-2027)
- [WWDC25: Meet the HealthKit Medications API](https://developer.apple.com/videos/play/wwdc2025/321/),
  [HKUserAnnotatedMedication](https://developer.apple.com/documentation/healthkit/hkuserannotatedmedication),
  [forum: medication data insert from a third-party app](https://developer.apple.com/forums/thread/803954)
- [WWDC25: Wake up to the AlarmKit API](https://developer.apple.com/videos/play/wwdc2025/230/),
  [WWDC Notes summary](https://wwdcnotes.com/documentation/wwdc25-230-wake-up-to-the-alarmkit-api/),
  [AlarmKit](https://developer.apple.com/documentation/alarmkit),
  [react-native-nitro-ios-alarm-kit](https://github.com/Gautham495/react-native-nitro-ios-alarm-kit),
  [forum: alarms stop after iOS 26.2 beta](https://origin-devforums.apple.com/forums/thread/809398)
- [WWDC21: Send communication and Time Sensitive notifications](https://developer.apple.com/videos/play/wwdc2021/10091/)
- [A medication app's Critical Alerts refusal (2025)](https://jhan.bearblog.dev/i-cant-understand-apples-critical-alert-policy/),
  [Apple forum: timing of Critical Alerts approval](https://developer.apple.com/forums/thread/794822)
- [Expo Notifications (interruptionLevel, categories)](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Foundation Models acceptable use requirements](https://developer.apple.com/apple-intelligence/acceptable-use-requirements-for-the-foundation-models-framework/)
- [RevenueCat: Apple App Privacy](https://www.revenuecat.com/docs/platform-resources/apple-platform-resources/apple-app-privacy),
  [Apple: App privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- iCloud-sync pill apps: [PillMate](https://apps.apple.com/us/app/pillmate-medicine-tracker/id6743670524),
  [Pill Alert Pro](https://apps.apple.com/app/id889581369),
  [iMore on the 2014 HealthKit iCloud rule](https://imore.com/apple-updates-developer-guidelines-ios-8-apps-disallows-healthkit-data-icloud-iap-extensions)
