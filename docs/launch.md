# Launch: name, ASO, App Store rules, trademarks

Research done 2026-10-06 (App Store lookup/search APIs, USPTO, Apple guidelines dated June 8, 2026). Signals, not legal advice.

## 1. Name: FaceRep (the working name "FaceKit" was taken)
- **"FaceKit: 3D Face Analysis"** (Kramer Ventures GmbH) is live in the same looksmax audience: 4.7★, ~1,500 ratings, about $21k MRR. App Store Connect blocks duplicate names and 4.1(c) / DPLA 3.2(f) forbid look-alike names.
- Also: Facekit AI (selfie editor), two other "FaceKit" apps, `facekit` SDKs on pub.dev/PyPI, and a live US mark **FACE-KIT** (class 3, skin care).
- "-Kit" next to "Face" reads like an Apple framework (HealthKit, ARKit…) and a developer SDK, not a premium fitness brand.

| Candidate | App Store | USPTO signal | Verdict |
|---|---|---|---|
| **FaceRep** | none | none | **Recommended** |
| **Facewerk** | none | old class 42 mark, abandoned 2012 | Strong #2 |
| Faceforge | none (a web "Face Forge" tool exists) | "FORGE FACE WRKS" class 3 pending | OK |
| JawRep / Jawset | none | none | Good if jaw-only |
| Chisl, Zygo, FaceFlex, FaceCraft, JawForge | conflicts | conflicts | Avoid |
| FaceGym | FaceGym is an established facial-fitness brand (studios, skincare, devices) | likely registered marks | Avoid (use "face gym" only as a description) |

**Chosen: FaceRep.** Still to do: search **IP India** (tmsearch.ipindia.gov.in), **TMview** (EU) and **WIPO Brand DB**, try the name in App Store Connect (creating the app record reserves it), and grab the domain and social handles.

## 2. GitHub repo and IDs
- Repo: **`p1kmr/FaceRep`** (private), monorepo with `app/` + `worker/` + `docs/` (this layout).
- Bundle ID: **`com.p1kmr.facerep`** (matches `com.p1kmr.elowa`). It can never change after the App Store Connect record exists, so decide the name first.
- Worker: `facerep-api`; RevenueCat project: "FaceRep" (separate from Elowa).

## 3. App Store metadata draft (FaceRep)
- **Name (28):** `FaceRep: Face Yoga & Jawline` (chosen by the owner, 2026-10-08). Was `FaceRep: Jawline Exercises`, which reads
  as men-only while women now see Lips first. The name is the strongest search field, so it now carries one term for each
  audience: "face yoga" (large, mostly women, crowded: Luvly, FaceYogi) and "jawline" (mostly men, where FaceRep started).
  Keeping the old name is also fine: then use the women-focused custom product page below for ads and search.
  The name can only change with a new app version, so decide before the first submission.
- **Subtitle (30):** `Lips, Cheeks & Mewing Workouts` (no word repeated from the name: Apple counts each word once
  across name, subtitle and keywords)
- **Keywords (100):** `double,chin,cheekbone,jaw,tongue,posture,facial,fitness,men,women,exercise,eye,massage,skincare,glow`
  (`looksmax` was dropped for `men,women`; it also kept distance from rating apps. `face`, `yoga`, `jawline`, `lips`,
  `cheeks`, `mewing`, `workouts` are already in the name and subtitle.)
- **Promotional text (158):** See the muscle you train. Voice-guided face workouts for jawline, cheekbones, lips and eyes, with a 28-day plan and an optional camera mirror. Week 1 is free.
- **Custom product page (women):** in App Store Connect → Custom Product Pages, same app, her screenshots (Woman pictures,
  Lips program first) and promotional text that leads with lips and eyes. Use its link for ads aimed at women.
- **Other languages:** name, subtitle, keywords, promotional text and description for Spanish, Portuguese (Brazil),
  German, French and Italian are in [store-listing.md](store-listing.md).
- **Category:** Health & Fitness (secondary: Lifestyle). **Age rating:** 13+.
- **Subscriptions:** group "FaceRep Premium": "Premium Weekly" $1.99 (no trial), "Premium Monthly" $3.99,
  "Premium Yearly" $29.99 with a 7-day free trial (pre-selected). Reasons and paywall rules in docs/premium.md §6.
- **Description:**

```
FaceRep is facial fitness for men and women: short, guided workouts for your jawline, cheekbones, lips and eye area, plus face massage. A few minutes a day.

SEE THE MUSCLE YOU TRAIN
Every exercise shows the working muscle lit up in red, moving from relaxed to squeeze in time with the timer. Choose whether the pictures show a man or a woman.

FOLLOW ALONG WITHOUT LOOKING
Voice cues tell you when to squeeze, relax and what comes next, so you can train with your eyes closed or your hands on your face. The screen stays on while you train. Turn on the mirror to see yourself next to the drawing and check your form: the camera picture is never recorded or saved.

FIVE PROGRAMS, 27 EXERCISES
• Jawline: jaw clench, chin lift, jaw jut, mewing, tongue press, chin tuck and neck stretch
• Cheekbones: cheek lift, fish face, smiling fish, cheek puff, O stretch and lion face
• Lips: lip press, pout, lip corner lift and smile-line press
• Eyes: brow lift, forehead press, wide eyes, lower lid lift, V eyes and eye squeeze
• Face massage: jaw release, jawline sweep, frown release and temple circles

A 28-DAY PLAN
• 4 weeks that get harder: more exercises, more reps, longer holds
• Light days to recover, and a day only moves on when you've done it
• Hold and relax timer with voice cues and haptics
• Streaks and a week, month and year calendar of your workouts
• Reminders for workouts, mewing checks and posture breaks, on your days and times (or ask the Coach to set them)

WHAT'S FREE
Week 1 of the plan and every exercise on its own, any time. No account, no ads. Your workouts stay on your iPhone.

PREMIUM
• Weeks 2 to 4 of the 28-day plan
• Level 2 and 3 when you finish, and new rounds after that
• Unlimited AI Coach answers (3 free answers a month without Premium). You're asked for permission before your first question.

SAFETY
Move gently and stop if anything hurts. If you have jaw pain or a jaw joint problem, ask a doctor or dentist before jaw exercises. FaceRep is a fitness and wellness app, not medical advice. Results vary.

SUBSCRIPTION
Premium is available weekly, monthly or yearly. Payment is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the period ends. Manage it in your App Store account settings.

The exercise drawings and photos are AI-generated and show fictional people.

Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacy Policy: https://facerep-api.elowa-app.workers.dev/privacy
```

- **What's New (1.0):** First release: a 28-day plan with five programs (jawline, cheekbones, lips, eyes and face massage), exercise drawings of a man or a woman, voice cues, a camera mirror, streaks and the AI Coach.

Alternative (Facewerk): `Facewerk: Face Workout for Men` / `Jawline, Mewing & Cheekbones`.

### Keyword map
- Strong, crowded: face yoga, face exercise(s), jawline exercises, mewing, looksmax, double chin (dominated by photo editors).
- **Gaps to own:** face yoga for men, cheekbone exercises, tongue posture, facial fitness, skincare for men, jawline workout, lip exercises, face massage.
- **Never use:** competitor names (Luvly, FaceYogi, Umax…), "#1/best", "lose double chin in 7 days", "reshape bone", "anti-aging", "guaranteed", TMJ/therapy/treat, "rate my face", "PSL", "attractiveness score".

## 4. Screenshots and preview
- **Done (2026-10-09):** 8 iPhone 6.9" screenshots (1320×2868) in all six languages, from the real app with demo data,
  in `store-screenshots/export/<App Store locale>/` (how they are made and rebuilt: `store-screenshots/README.md`).
  Red and black slides, Anton headlines with one highlighted word, tilted iPhones, magnified details, voice bubbles.
  Order: (1) Train your face like your body (player, mid-squeeze) · (2) See the muscle you train (masseter) ·
  (3) A plan that grows with you, "Week 1 free" · (4) Just listen and follow (voice cues) · (5) Check your form in
  the mirror (camera mirror, "Nothing recorded") · (6) For him. For her. · (7) Keep your streak going ·
  (8) Ask the Coach, "3 free answers a month".
- App Store Connect needs only the 6.9" set (it scales it down); up to 10 screenshots, the first 3 show in search.
- App Preview: 15–30 s, in-app footage only, muted autoplay. Open with the relaxed→squeeze glow in the first 2 seconds. No before/after faces.

## 5. What competitors get wrong (and FaceRep already does differently)
Reviews complain about: price jumps and web-checkout funnels, charges after cancelling, AI avatar demos, paywalls right after onboarding, ads mid-workout, login failures, "random scores", can't delete photos, repetitive programs, joint/ear pain.
FaceRep: free exercises, in-app pricing only, real anatomy visuals, no login, no ads, no scores, on-device data, safety + jaw caution.
Done since: voice cues, keep-screen-on, camera mirror, five languages. Next idea: a home-screen widget for the streak.

## 6. App Store rules: status
| Rule | What it needs | Status |
|---|---|---|
| 1.4.1 health | no medical claims; "check with a doctor" | Safety line on the welcome screen, full list in Settings → Exercise safety, jaw caution on the exercise page and in the workout player before jaw exercises, Coach prompt refuses diagnosis ✅ |
| 2.3 / 2.3.7 metadata | honest claims, no trademarks or competitor names | Draft above ✅ |
| 2.1 completeness | backend on during review | Deploy the Worker (with `REVENUECAT_SECRET_KEY`) before submitting: without it the reviewer can buy but Weeks 2–4 won't load |
| 3.1.1 / 3.1.2 subscriptions | price, period, trial, auto-renew, Restore, Terms + Privacy links | PaywallView ✅ (+ links in the description) |
| 3.1.1 unlocking | paid content unlocked only by Apple IAP | Weeks 2–4 unlock only when RevenueCat (Apple receipts) says Premium; the Worker checks too ✅ |
| 3.1.2(a) ongoing value | a subscription must keep giving value | Levels 2–3 and new rounds after Day 28, plus the unlimited Coach ✅ (a single 28-day plan alone would be weak) |
| 2.3.2 in-app purchases in metadata | description and screenshots say what's paid | Description lists "What's free" and "Premium" ✅; label any screenshot of Weeks 2–4 as Premium |
| 4.5.4 notifications | not required to use the app, no ads in them, ask at a sensible time | Only user-made reminders; permission asked when one is turned on; "Not now" works; no Time Sensitive/Critical alerts ✅ |
| 2.5.2 self-contained | no downloaded code that changes features | `/plan` returns JSON data (days and exercise IDs), checked by the app; no code ✅ |
| Free trial wording | "free trial" means the StoreKit trial | Week 1 is called "Week 1 is free", never a "trial" ✅ |
| 4.3 spam | clearly different from existing apps | Anatomy drawings (man or woman) + voice-guided timer + mirror + AI Coach; keep updating |
| 5.1.1 privacy | policy in app + ASC, deletion route | `/privacy` page, Settings → Delete all data ✅ |
| 5.1.2(i) third-party AI | disclose + explicit permission before sending | AI consent screen names Cloudflare Workers AI ✅ |
| 1.2 objectification | no "hot or not" | No ratings, Coach refuses to rate looks ✅ |
| Age rating | answer the new questionnaire | Suggest **13+** (wellness + occasional skin/medical info via AI) |

**App Privacy labels:** User ID (not linked to identity), Purchases (App Functionality), Other User Content (Coach questions and the reminder names/times sent with them, processed but not stored; declare to be safe). Workout history and reminders stay on device → not "collected". The mirror's camera picture is shown live and never stored or sent → not "collected". No tracking.

**Review notes:** describe the Coach (AI, Workers AI, consent screen, 3 free answers then paywall) and give the steps to reach it; mention DeviceCheck is on. The app is in English, Spanish, Portuguese (Brazil), German, French and Italian (it follows the iPhone's language; Settings → Language opens the per-app language page). Mention the mirror: the person button in the workout player (or Settings → Mirror in workouts) shows the front camera next to the drawing; the camera permission is asked only then, and nothing is recorded, saved or sent. Mention the picture choice: onboarding asks whether the exercise pictures show a man or a woman (display only, stays on the device; Settings → Exercise pictures). Mention reminders: Settings → Reminders (local notifications the user sets up; permission is asked when one is turned on), and the Coach can propose reminder changes that only apply after the user taps Confirm. Explain the plan, because a reviewer can't wait 7 days to reach Week 2: "Week 1 is free. Weeks 2–4 are Premium. On Today, tap any locked day in the 28-day grid to open the paywall and buy with the sandbox account; the days load from our server right after purchase, and tapping any day (e.g. Day 15) then shows its exercises and lets you start it. Settings → Restore restores the purchase." 

## 7. Keeping the developer account safe
Accounts get terminated for: hidden features or server switches that change the app after review, fake reviews or rating manipulation, bait-and-switch or confusing subscriptions, copying other apps or names, misleading health claims.
Do: ship exactly what was reviewed, describe every feature in review notes, make the billed price the most prominent price, use only Apple's rating prompt (`expo-store-review`, done after 3 workouts), answer Apple's messages fast, keep one app per concept.

## 8. Trademark and copyright
| Asset | Protection | Action |
|---|---|---|
| App name | Trademark | **Register** once the name is final |
| Logo | Trademark + copyright | Register when the final logo exists |
| Code | Copyright (automatic) | Private repo; registration optional |
| AI images/videos | Little or none (no human author) | Keep the originals and prompts; protect the brand instead |
| Exercise routines | Not protectable as a method | Your wording and edited media are |

- **India (IP India e-filing, Form TM-A):** ₹4,500 per class (individual/startup), ₹9,000 others. Start with **class 9** (app) and **class 41** (fitness instruction); add 42 (SaaS/AI) and 44 (beauty info) later. Use ™ now, ® only after registration. Roughly 8–18 months.
- **USA:** $350 per class; a foreign applicant needs a US-licensed attorney.
- **Madrid Protocol** via IP India later (US designation ~$600/class).
- "Mewing" alone has no live US mark (use it descriptively, not as the brand); "Face Yoga Method" is a brand, avoid it.

## 9. AI-generated assets
- Purely AI-generated images have no US copyright (Copyright Office 2025; *Thaler* cert denied 2026). Others could copy them; the app and brand are what you protect.
- **Figma AI:** you own the output; the policy forbids removing AI provenance metadata or claiming it's human-made. The app assets are cropped/compressed (which drops the C2PA "Content Credentials"), so **keep the original files** (`FaceKit-AI-originals.zip`, and `FaceRep-woman-originals.zip` for the woman set made with Figma AI in October 2026, see docs/images.md) and **label the images as AI-generated** (Settings footer, privacy page, store description).
- **Google Flow / Veo:** carries SynthID; **a visible watermark is added automatically for users in India** even on paid plans, and it must not be cropped. Another reason to stay with the two-frame image animation.
- The model is fictional: don't prompt with real people's names, and reverse-image-search the final hero once.
