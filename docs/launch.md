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
- **Name (26):** `FaceRep: Jawline Exercises`
- **Subtitle (26):** `Face Yoga for Men & Mewing`
- **Keywords (96):** `double,chin,cheekbone,jaw,tongue,posture,glow,facial,fitness,looksmax,workout,eye,skincare,coach`
  (swap `looksmax` for `toning` or `neck` if you want distance from rating apps)
- **Promotional text (167):** See the exact muscle you're training. A 3D anatomy guide and hold-relax timer coach every rep for your jawline, cheekbones and eyes. Free exercises. No account needed.
- **Category:** Health & Fitness (secondary: Lifestyle). **Age rating:** 13+.
- **Subscriptions:** group "FaceRep Premium": "Premium Monthly" $3.99, "Premium Yearly" $29.99 with a 7-day free trial.
- **Description:**

```
FaceRep is facial fitness built for men: short, guided workouts for your jawline, cheekbones and eye area. A few minutes a day.

SEE THE MUSCLE YOU TRAIN
Every exercise shows a realistic 3D anatomy model with the working muscle lit up in red, moving from relaxed to squeeze in time with the timer.

THREE PROGRAMS
• Jawline: jaw clench, chin lift, jaw jut, mewing and neck stretch
• Cheekbones: cheek lift, fish face, cheek puff
• Eyes: brow lift, eye squeeze

BUILT FOR CONSISTENCY
• A daily routine for your focus area
• Hold and relax timer with haptics
• Streaks, weekly chart and workout history
• A daily reminder at your chosen time

ALL EXERCISES ARE FREE
No account, no ads. Your workouts stay on your iPhone.

AI COACH (PREMIUM)
Ask about technique, posture, mewing or a simple skincare routine. 3 free answers a month; Premium is unlimited. You're asked for permission before your first question.

SAFETY
Move gently and stop if anything hurts. If you have jaw pain or a jaw joint problem, ask a doctor or dentist before jaw exercises. FaceRep is a fitness and wellness app, not medical advice. Results vary.

SUBSCRIPTION
Premium is available monthly or yearly. Payment is charged to your Apple ID and renews automatically unless cancelled at least 24 hours before the period ends. Manage it in your App Store account settings.

The 3D figure and photos are AI-generated and show a fictional person.

Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacy Policy: https://<your-worker-url>/privacy
```

- **What's New (1.0):** First release: guided jawline, cheekbone and eye workouts with a 3D anatomy guide, streaks, and the AI Coach.

Alternative (Facewerk): `Facewerk: Face Workout for Men` / `Jawline, Mewing & Cheekbones`.

### Keyword map
- Strong, crowded: face yoga, face exercise(s), jawline exercises, mewing, looksmax, double chin (dominated by photo editors).
- **Gaps to own:** face yoga for men, cheekbone exercises, tongue posture, facial fitness, skincare for men, jawline workout.
- **Never use:** competitor names (Luvly, FaceYogi, Umax…), "#1/best", "lose double chin in 7 days", "reshape bone", "anti-aging", "guaranteed", TMJ/therapy/treat, "rate my face", "PSL", "attractiveness score".

## 4. Screenshots and preview
- Required size now: iPhone 6.3" Dynamic Island (1206×2622 or 1179×2556); up to 10 screenshots, first 3 matter most.
- Plan: (1) 3D figure, masseter glowing: "See the muscle you train" · (2) Jawline / Cheekbones / Eyes programs · (3) Hold-relax timer + streak · (4) AI Coach (labelled Premium) · (5) Progress · (6) "No login, no ads". One dark-mode shot. Captions 3–6 words.
- App Preview: 15–30 s, in-app footage only, muted autoplay. Open with the relaxed→squeeze glow in the first 2 seconds. No before/after faces.

## 5. What competitors get wrong (and FaceRep already does differently)
Reviews complain about: price jumps and web-checkout funnels, charges after cancelling, AI avatar demos, paywalls right after onboarding, ads mid-workout, login failures, "random scores", can't delete photos, repetitive programs, joint/ear pain.
FaceRep: free exercises, in-app pricing only, real anatomy visuals, no login, no ads, no scores, on-device data, safety + jaw caution.
Next ideas: progressive programs (level 2/3), sound/voice cue toggle, more exercises, a home-screen widget for the streak.

## 6. App Store rules: status
| Rule | What it needs | Status |
|---|---|---|
| 1.4.1 health | no medical claims; "check with a doctor" | Safety screen in onboarding + Settings, jaw caution, Coach prompt refuses diagnosis ✅ |
| 2.3 / 2.3.7 metadata | honest claims, no trademarks or competitor names | Draft above ✅ |
| 2.1 completeness | backend on during review | Deploy the Worker before submitting |
| 3.1.1 / 3.1.2 subscriptions | price, period, trial, auto-renew, Restore, Terms + Privacy links | PaywallView ✅ (+ links in the description) |
| 4.3 spam | clearly different from existing apps | 3D anatomy + timer + AI Coach; keep updating |
| 5.1.1 privacy | policy in app + ASC, deletion route | `/privacy` page, Settings → Delete all data ✅ |
| 5.1.2(i) third-party AI | disclose + explicit permission before sending | AI consent screen names Cloudflare Workers AI ✅ |
| 1.2 objectification | no "hot or not" | No ratings, Coach refuses to rate looks ✅ |
| Age rating | answer the new questionnaire | Suggest **13+** (wellness + occasional skin/medical info via AI) |

**App Privacy labels:** User ID (not linked to identity), Purchases (App Functionality), Other User Content (Coach questions, processed but not stored; declare to be safe). Workout history stays on device → not "collected". No tracking.

**Review notes:** describe the Coach (AI, Workers AI, consent screen, 3 free answers then paywall) and give the steps to reach it; mention DeviceCheck is on.

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
- **Figma AI:** you own the output; the policy forbids removing AI provenance metadata or claiming it's human-made. The app assets are cropped/compressed (which drops the C2PA "Content Credentials"), so **keep the original files** (`FaceKit-AI-originals.zip`) and **label the images as AI-generated** (Settings footer, privacy page, store description).
- **Google Flow / Veo:** carries SynthID; **a visible watermark is added automatically for users in India** even on paid plans, and it must not be cropped. Another reason to stay with the two-frame image animation.
- The model is fictional: don't prompt with real people's names, and reverse-image-search the final hero once.
