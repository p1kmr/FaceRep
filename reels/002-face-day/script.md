# 002 · Face day (episode 1)

Brody (the gym bro) does Fish Face like a deadlift. Rep isn't impressed. Kayla shows the app's way, gently, with the
app's own steps and its 5-second hold. Brody tries it gently and likes it. 19 s, 1080 x 1920, 120 bpm, cut on the beat.
Cast: Brody + Kayla + Rep (my pick from the five options; swap if the owner picks others).

| Time | Shot | On screen | Bubbles |
|---|---|---|---|
| 0–3 s | Hook | "GYM BRO TRIES / FACE WORKOUTS", Brody flexing on the beat | Brody: "FACE DAY? I'LL MAX IT." |
| 3–7 s | Try-hard | "FISH FACE: BRODY'S WAY": double biceps, eyes squeezed shut, shaking, sweat; Rep walks in | Brody: "ONE. MORE. REP!!!" · Rep: "IT'S NOT A DEADLIFT." |
| 7–12 s | Done right | "FISH FACE: DONE RIGHT": Kayla calm with her iced coffee, the hold ring counting 5 to 1, the app's three steps | Kayla: "GENTLE. NO STRAIN." |
| 12–15 s | Again | "SAME EXERCISE. LESS DRAMA.": Brody gently, then happy; Kayla winks; Rep jumps, confetti | Brody: "OH… THAT'S ACTUALLY CHILL." · Kayla: "TOLD YA." |
| 15–18 s | End | The app icon, "FACEREP", "Face Yoga & Jawline", "Fish Face is free in the app", "ON THE APP STORE" | — |

Facts checked in the FaceRep repo: Fish Face is a free exercise; its steps are the app's English text word for word
(`app/src/i18n/locales/en/exercises.json`); it holds 5 s and relaxes 3 s (`constants/exercises`).

Rules kept: no result promised, no before/after, no price, no looks rating, no insult (the joke is trying too hard),
no harmful trend (no mewing or bone smashing), no phone screen (the real screens aren't in this repo yet).

Voices: Gemini (`voice.json`): Brody Fenrir, Kayla Leda, Rep Schedar, each line starting with its bubble (times in
`reel.js`); the bubbles stay. Tick the AI label when posting. The table's times are the first cut; `reel.js` has
the 19 s ones.

## Post text

Instagram Reels / YouTube Shorts:

> Gym bro vs Fish Face 🐟 Gentle wins. Fish Face is free in FaceRep (App Store).
> #faceyoga #faceworkout #gymbro #fishface #facerep

Pick a trending sound in the app only if it fits; the reel's own beat is made in code and free to use.
