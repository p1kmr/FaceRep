# FaceRep reels: plan

State on 2026-11-25:
- Sample 001, an animated promo of 10 s, is made: `reels/001-looksmax/` (`script.md`, `reel.js`). The owner has not
  picked a format yet.
- The owner said both characters, named Flex and Rep. Sheet draft 1 (`reels/characters/`) was turned down: the owner
  wants white characters for a US audience, girls and boys both, and a more polished, aesthetic look.
- Now: 5 new options for the human cast (US, 18–24), drawn in code in `reels/page/cast/`, shown in
  `reels/cast-options/` (a lineup and one card each). Rep stays. The owner hasn't picked yet.
- 002-face-day and 003-morning are dropped (the owner, 2026-11-28): not posted, kept only as earlier designs. The
  reel is `004-day-30/` ("Looksmax arc", 33 s).
- Voices: Gemini (`voice.mjs`, mixed in `page/voice.js`): Brody Fenrir, Kayla Leda, Rep Schedar. The takes are kept
  (`voice/<who>-take.wav`): `--from` cuts them again at no cost.
- 2026-11-25: the owner asked for story reels where the face "is not in good shape", FaceRep fixes it and the face
  changes. Not done that way: a drawn face change is a before/after and a promised result (Meta rejects those in
  ads, the FTC treats a shown result as a claim needing proof, the app's own rules forbid it), and the evidence is
  thin (the best-known study: 16 women aged 40–65, no control group, Northwestern 2018). Written instead, as
  stories where something true changes: `004-day-30`, `005-the-bet` (a 7-day streak bet), `006-her-reason` (Kayla
  does it for herself, not to fix her face). The owner wants the looksmax arc itself (posting organically, so Meta's
  ad rule doesn't apply; Instagram's recommendation rules still do). `004-day-30` is now that arc: everything around
  his face changes (hair, clothes, posture, sleep, room, steady holds), his face's shape is drawn the same. Scripts
  only, waiting for the owner's go.
- 2026-11-25: the owner asked what viral looksmax reels and Shorts do. Findings in `reels/research.md` (the
  glow-up format, softmaxxing, the girlfriend-effect trend, a pushy mascot). New script from it: `007-rep-effect`.
  Suggested, not done: move `004-day-30`'s reveal to the beat drop at about 2 s.

## What the research found (2026-11-25)

- Faces help reach and recall. A creator's face gave +148% brand recall and a creator's voiceover +63% purchase
  intent ([TikTok and CreatorIQ](https://www.creatoriq.com/press/releases/tiktok-creatoriq-release-special-report-with-data-backed-keys-to-success-for-advertisers)).
  Creator ads got 70% more clicks than other ads ([TikTok](https://ads.tiktok.com/business/en-US/blog/tiktok-creator-advantage)).
  These are TikTok's own numbers. A face only talking about the app gets views but few buyers (a small 2026 study,
  low confidence), so the face should be doing something.
- For apps, video that looks like users' own posts raised installs per view by 152% on average
  ([IT Brief](https://itbrief.com.au/story/ugc-interactive-ads-drive-major-gains-for-mobile-app-installs)), and useful,
  feed-native videos now beat scripted testimonials ([RevenueCat](https://www.revenuecat.com/blog/growth/ugc-ads-apps)).
  Animation won only for games ([AppsFlyer](https://www.appsflyer.com/resources/reports/creative-optimization-report-2025/)).
- Umax, a looksmax app, passed 7 million downloads mainly through users showing its screens in their own videos
  ([Fortune](https://fortune.com/2024/07/01/looksmaxxing-apps-rate-teen-boys-faces-mental-health/)).
- Brand characters: campaigns with one were 37% more likely to grow market share (System1, who sell this measurement:
  [LBB](https://lbbonline.com/news/research-by-system1-shows-memorable-characters-in-ads-boost-chances-of-profit-by-30)).
  Duolingo's owl took its TikTok from about 50,000 to 16 million followers
  ([The Drum](https://www.thedrum.com/news/2022/10/18/the-drum-readers-favorite-brand-mascot-inside-the-duolingo-owl-s-tiktok-success)).
  No source links characters to downloads directly.
- Looksmaxxing content is under watchdog pressure for harming teen boys
  ([The Looks Trap](https://a.storyblok.com/f/295440642966683/x/df61be2bca/the-looks-trap.pdf)); no block on
  #looksmaxxing was found.

## The formats

| | What it is | Use |
|---|---|---|
| A. Animated promo (sample 001) | app screens, words, a beat | the pinned post, and a test for paid ads; it reads as an ad, so least reach |
| B. Follow-along, no face | the app's exercise clip and rep counter: "30-second jaw workout, do it with me" | daily posts, free to make in code |
| C. Follow-along with a real face | a person does the exercise beside the app's player, the app named at the end | the strongest proof the exercises are real; the owner (whole face or nose down) or a paid US creator |
| D. Characters | Flex and Rep below | the best choice without a real face: a series people follow, and the icon learned |

## Limits

- TikTok is banned in India ([Patrika, Feb 2026](https://www.patrika.com/en/national-news/tiktok-ban-in-india-not-lifted-says-modi-government-19886142)):
  post on Instagram Reels and YouTube Shorts; TikTok only through a US creator's own account.
- No AI people: an invented person shown as a real user is a fake testimonial under the US rule in force since
  October 2024 ([FTC](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials)).
- No before/after pictures (Meta rejects them in ads:
  [Meta](https://transparency.meta.com/policies/ad-standards/objectionable-content/personal-health-and-appearance);
  the store rules ban promised results), no rating of looks, no insults ("mid", "mog"), no harmful trends even as a
  joke (bone smashing), and no AI voice.
- Measure downloads with an App Store Connect campaign link (`ct=`) in the bio. Instagram's Trial Reels show a video
  to non-followers first, from 1,000 followers ([Meta](https://about.fb.com/news/2024/12/trial-reels-try-content-non-followers-first/)).

## The characters (waiting for the owner's OK)

Both are new and FaceRep's own: never in Reel Studio's channels, and none of Reel Studio's characters appear here.

1. **Flex, the user.** A 19-year-old gym bro who "maxxes" everything (sleep, gym, mewing); confident, loud, tries
   every trend. A big head on a small body so his face reads on a phone, thick eyebrows, a short fade, a red tank top
   and a sweatband. His face is built for the exercises: cheeks that puff like balloons, a fish-face pucker, eyebrows
   that shoot up, a chin lifted to the sky. Not named "Max": the biggest looksmax apps are Umax and LooksMax AI.
2. **Rep, the app come alive.** The FaceRep icon (red tile, two dot eyes, barbell smile) with tiny arms and legs. He
   lives in Flex's phone, pops out of the screen, is deadpan, says very little, counts "SQUEEZE. HOLD. RELAX." and
   sometimes lifts his own barbell smile. Every episode ends with Rep jumping back in and becoming the app icon, so
   viewers learn the icon they will look for in the App Store.

The phone, in every episode: Rep pops out of it, the camera pushes into the screen for about 1.5 s to show the real
exercise page (the red muscle), then pulls back to Flex copying it, with the phone in a corner counting reps in sync.
Real screenshots only, never redrawn.

An episode (15–20 s; words as speech bubbles, a beat and sound effects):
1. Flex doing something over the top.
2. Rep pops out: "bro."
3. The phone close-up with the exercise.
4. Flex does it with a funny face while Rep counts.
5. A punchline, then Rep becomes the icon: "FaceRep · on the App Store".

First episode ideas:
1. **Mewing 24/7:** Flex mews so hard he can't answer his mom at dinner. Rep shows the Chin Lift, Flex lifts his
   chin to the ceiling, and the whole family looks up too.
2. **Leg day? Face day:** Rep blocks the leg press. Four faces on the beat (puff, fish face, brows, chin). Flex: "my
   face is sore." Rep: "good."
3. **11:58 pm streak:** Rep shakes a sleeping Flex, his streak at 29. He does the workout half asleep; 30, and Rep
   throws confetti.

## Making them

- Everything is drawn in code on a 2D canvas, in `reels/` (`page/draw.js` has the phone, the lifted-out details and
  the words; `page/sound.js` the beat).
- Rendering works on the owner's Mac today: `node reels/render.mjs reels/NNN-name` (about 3 s for 10 s of video).
  In a Claude Code cloud session it needs two changes first: Chrome for Testing is at `/usr/bin/google-chrome` (the
  script looks only in `/Applications`), and it can't encode AAC sound itself (Reel Studio's page loads
  `@mediabunny/aac-encoder` there). The Simulator screens (FaceRep's `store-screenshots/capture/sim/en/*.png`) are
  git-ignored there: `node reels/screens.mjs --capture` on the Mac copies them into `reels/screens/` (kept out of git: no screenshots in git).
- 2026-11-25: the owner said go for `004-day-30`, a 10-second sample first, with the reveal moved to the beat drop.
  Sample made (`004-day-30/reel.js`, no voice yet); new drawings in `page/cast/brody-arc.js` (day-1 and day-30 Brody,
  same face) and `page/cast/room.js` (the rooms and props). Next: the owner's OK, then the full reel and voices.

## Next: a looksmax reel for women (owner, 2026-11-28)

The owner wants a "girls looksmax" reel too (the app has a woman's version of every guide). Reference:
`reels/refs/looksmax-girl.png` (the owner's screenshot, kept out of git): a painted woman's face twice, a red round jaw
line on a tired face on the left, a green sharp V jaw line on a glowing face on the right.

- Take its look and hook: a big, realistic painted face with the jaw line drawn over it, red vs green.
- Not its claim: no before/after, no "after" face, no sharper jaw or slimmer face promised, no "ugly" before (face
  exercises don't change bone or face shape; the reels never promise results; Meta's ad rules ban before-and-after
  pictures for looks). The allowed version: the line marks the jaw muscles a move works (like the app's face map),
  and the payoff is the habit or the streak, as in 010 to 012.
