# 011 · Midnight

11:55 PM. Leo's 29 day streak ends at midnight, and he forgot today's workout. A deadpan movie-trailer narrator plays
it like a bomb countdown: Fish Face, Chin Lift, Brow Lift, the last squeeze at 11:59:58, streak saved. Hand-painted
anime pictures of Leo (AI pictures from Figma, the same words for Leo as 010, never a named studio); code adds the
clock, the app's real reminder text and workout screen, Rep, the words and the end card. 29 s, 1080 x 1920, 120 bpm.
Cast: Leo + Rep. Narrator: the same voice as 010 (Charon). His take was cut by hand at its pauses (see reel.js);
n-10 is 010's "Download FaceRep" clip, because this take said "Face-Rap".

Why people keep watching: the clock is on screen from the first frame (will he make it?), the cuts get shorter as
the minutes run out, the beat drops out for the last squeeze (only a ticking clock and a heartbeat), and he makes it
with one second to spare.

## Shots

| Time | Shot | Picture | On screen | Narrator |
|---|---|---|---|---|
| 0–5 s | Hook | AI 01-couch: late night, Leo slumped on the couch, TV glow, cereal bowl (slow push in) | 11:55 PM; the app's real reminder drops in: "Time for your face workout / 5 minutes keeps your streak alive."; 29 DAY STREAK | "Eleven fifty-five PM. Leo is on a twenty-nine day streak…" |
| 5–7 s | He forgot | AI 02-shock: anime shock face, sweat drop, speed lines; a heartbeat | HE FORGOT. | "And he forgot." |
| 7–9.5 s | Go | AI 03-leap: Leo leaps off the couch, cereal flying | 11:56 PM · 5 MINUTES. ONE CHANCE. | "Five minutes. One chance." |
| 9.5–11.5 s | Fish Face | AI 04-fish-face: on his bed, phone propped on the lamp | 11:57 PM · FISH FACE | "Fish Face… eleven fifty-seven." |
| 11.5–13.5 s | Chin Lift | AI 05-chin-lift: low angle, moonlight, curtains blowing | 11:58 PM · CHIN LIFT | "Chin Lift… eleven fifty-eight." |
| 13.5–15.5 s | Brow Lift | AI 06-brow-lift: close-up, eyebrows as high as they go | 11:59 PM · BROW LIFT | "Brow Lift… eleven fifty-nine." |
| 15.5–19 s | Last squeeze | Code: his phone with the app's real workout screen (Brow Lift); the beat stops, a clock ticks, a heart beats; the ring "1 SQUEEZE" lifts out on "one" | HOLD IT… · 11:59:56 → 57 → 58 → 59 | "Hold it… three… two… one…" |
| 19–22.5 s | Saved | AI 07-saved: flat on his bed like a starfish, huge relieved grin; the beat is back; the clock turns 12:00 AM; Rep cheers | STREAK SAVED. · 30 DAY STREAK | "Streak saved. Thirty days." |
| 22.5–29 s | End card | Code: the app icon, Rep jumping | DON'T BREAK YOURS. · DOWNLOAD FACEREP · Face Yoga & Jawline · ON THE APP STORE · FOLLOW FOR MORE | "Don't break yours." "Download FaceRep. On the App Store." |

## Post text

11:55 PM. 29 day streak. He forgot. 😰 Download FaceRep on the App Store.
#faceyoga #faceworkout #jawline #anime

Instagram: turn the AI label on (AI pictures and an AI voice).

## Leo (the same words in every picture prompt, as in 010)

A youthful 22-year-old American guy with a soft, friendly, slightly boyish face, rounded cheeks, a small nose, light
warm skin, short messy fluffy dark-brown hair with one big curled cowlick sticking up at the crown and a few strands
falling over his forehead, thick straight dark eyebrows, big warm brown eyes, light freckles across his nose and
cheeks, clean-shaven, a mustard-yellow hoodie over a plain grey T-shirt. The AI never draws a phone screen or a clock:
code draws the app and the time on top.

## Facts (checked in the FaceRep repo)

- The reminder is the app's own text (`app/src/i18n/locales/en/notifications.json`, kind `workout`): "Time for your
  face workout" / "5 minutes keeps your streak alive." Reminders go off at the times the user picks.
- A streak lives until the end of the day: with no workout today it counts back from yesterday
  (`currentStreak`, `app/src/services/progress/stats.ts`). So at midnight his 29 days would drop to 0.
- The day counts once at least half of Today's workout is done (`countsAsDay`, `services/workout/weeks.ts`): Fish
  Face, Chin Lift and Brow Lift are 3 of his 5 exercises.
- "30 day streak" is the app's wording (`workout.json`, `complete.streak_other`).
- The workout screen (`reels/screens/workout-man.jpg`) is the app's real Brow Lift screen; its ring says
  "1 SQUEEZE", the last second of the hold, which is the narrator's "one".
- No result is shown or promised: Leo's face never changes, the payoff is the streak. Never say "free".
- Safe, still moments only: everything happens at home, sitting on his bed.
