# 005 · The 7-day bet

A story with a clock in it. Kayla bets Brody he can't keep a 7-day streak. Days 1 to 5 fly by. Day 6, game night at
Zach's, 11:54 pm: he forgot. He does Pout mid-game, headset on, blowing a kiss at nobody, and saves the streak at
11:59. Day 7 he wins, and the change is that he doesn't want to stop. About 22 s, 1080 x 1920, cut on the beat.
Cast: Brody + Kayla + Zach + Rep.

## Shots

| Time | Shot | On screen | Words (bubbles and voice) |
|---|---|---|---|
| 0–3 s | The bet | Kayla and Brody face to face, big words "THE 7-DAY BET" | Kayla: "Bet you can't do seven days in a row." · Brody: "Bet." |
| 3–6 s | Days 1–5 | A big day counter flips 1, 2, 3, 4, 5 on the beat; behind it Brody does a face exercise in a new place each time (gym bench, kitchen, car seat, couch, bathroom mirror) | — |
| 6–9 s | Day 6 | Game night at Zach's: dark room, screen glow, both with headsets, Zach shouting at the game. A clock "11:54 PM". Rep pops up | Rep: "5 minutes keeps your streak alive." · Brody: "No no no no." |
| 9–14 s | The save | Brody does Pout mid-game, lips pushed forward like a kiss, the hold ring counts 5 to 1; Zach turns and stares. The clock ticks to 11:59; a "6 DAY STREAK" badge pops | Zach: "Bro… are you kissing the screen?" · Brody: "Streak. Stuff." |
| 14–19 s | Day 7 | Morning, Kayla hands Brody an iced coffee (the prize). Confetti, Rep jumps | Kayla: "Okay. You win." · Brody: "…Day eight tomorrow?" · Kayla: "You're hooked." |
| 19–22 s | End card | The app icon, "FACEREP", "Face Yoga & Jawline", "ON THE APP STORE", "Follow for more" | — |

## Voice

Gemini: Brody Fenrir, Kayla Leda, Rep Schedar, Zach a new voice (a hyped young gamer). 4 requests, one per
character.

## Facts (checked in the FaceRep repo)

- Pout is free (`FREE_EXERCISE_IDS`), 10 reps, hold 5 s, relax 3 s (`app/src/constants/exercises.ts`).
- Its steps (`exercises.json`): "Keep your teeth apart and your face relaxed." / "Push your lips forward as far as is
  comfortable, as if blowing a kiss." / "Hold, then relax your lips." The on-screen card shows these words exactly.
- "5 minutes keeps your streak alive." is the app's reminder text; "6 day streak" is the app's own wording.
- Days 1–5 show only the free exercises (Fish Face, Cheek Lift, Brow Lift, Wide Eyes, Chin Lift).
- A free user can keep a streak: it counts every day with a saved workout (`services/progress/stats.ts`), and one
  free exercise from the library is saved as a workout (`app/workout.tsx`, kind "single").

## Rules kept

- What changes is the habit (from a bet to "day eight tomorrow?"), not his face. No result promised.
- No phone screen drawn: the reminder is Rep saying it; the game screen is a glow with no real game on it (no other
  company's game, logo or look).
- No drinks at game night, no insult (Zach is surprised, not mean), no looks rating, no harmful trend.

## New drawing needed

A flip-counter, five quick backgrounds (gym bench, kitchen, car, couch, mirror), a dark room with a screen glow,
headsets, a wall clock, the streak badge, an iced coffee, Pout poses for Brody.

## Post text

> He bet he could keep a 7-day streak 😭 Day 6 got close. Get FaceRep on the App Store.
> #faceworkout #gymbro #gamenight #streak #facerep
