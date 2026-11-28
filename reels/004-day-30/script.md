# 004 · Looksmax arc: day 1 to day 30

The owner's story: before FaceRep, Brody is a mess; he starts FaceRep and things change. Drawn in the bust style
(`page/bust/`, head and shoulders, cel-shaded): on day 1 his face is round and chubby with a double chin; each arc day
it is a little more defined; on day 30 he has an angled jaw and cheekbones, clean-shaven. His hair stays the same messy blond anime cut on every day (`page/bust/spiky-hair.js`), so he reads as one person. His sleep,
clothes and how steady he holds the exercises change too. About 33 s (the owner wants 30 s or more), 1080 x 1920,
120 bpm, cut on the beat. Cast: Brody + Kayla + Rep. Rep is on screen before 5 s, since fewer viewers reach the end card.

## Shots

The day-30 reveal comes first, on the beat drop (the glow-up format, `../research.md`), then how it went: the day
he quit, the arc, the day he almost quit, the payoff.

| Time | Shot | On screen | Words (bubbles and voice) |
|---|---|---|---|
| 0–3 s | Hook | 6:58 am, his dim room at sunrise, chip bags on the floor. Brody in a grey hoodie, his messy blond hair, a round face, bags under half-shut eyes, his phone in his hand lighting his face; the picture pushes in slowly. "DAY 1 OF MY LOOKSMAX ARC" | Brody: "Day one of my looksmax arc." |
| 3–3.4 s | The swipe | On the beat drop day 1 slides away and day 30 slides in, white streaks between | — |
| 3.4–6 s | Day 30 | Morning sun. Brody with the angled V jaw, the same hair, a navy tee, a smirk, a sparkle on his jaw. "DAY 30", the "30 DAY STREAK" badge, then Rep pops up | Brody: "Five minutes a day." |
| 6–9.5 s | How it started | "HOW IT STARTED": day 1 in the morning, Rep pops out of Brody's phone. Brody tries Chin Lift, shaking and sweating, the counter goes 1, 2, 3, then he flops: "QUIT AT REP 3" | Rep: "Bro." |
| 9.5–11.5 s | The arc | A day counter climbs on the beat, a checklist fills: DAY 4 Fish Face + water, DAY 9 Cheek Lift + lights out at 11 | Checklist: "FACE REPS, WATER, SLEEP, SKINCARE, FRESH CUT" |
| 11.5–14.5 s | Day 12 | "ALMOST QUIT": Brody sunk in the couch with chips. Rep holds up a "5:00" sign. Brody sighs and gets up | Brody: "Ugh. Fine." |
| 14.5–16.5 s | The arc | DAY 16 Chin Lift + face wash, DAY 23 face reps + fresh cut | — |
| 16.5–20 s | The hold | Day 30: Chin Lift, steady, the hold ring counts 5 to 1 (sped up), "REP 10/10", confetti | Brody: "Ten for ten. No shaking." |
| 20–29 s | The double take | Kayla walks past in front of Brody, stops, backs up, eyes wide. Brody shrugs. Rep pops up between them | Kayla: "Wait… did you glow up?" · Brody: "I sleep now. And I do my face reps." · Rep: "Day thirty-one." |
| 29–33 s | End card | "IT STARTED WITH 5 MINUTES A DAY", Rep jumping, "FACEREP", "Face Yoga & Jawline", "ON THE APP STORE", "Follow for more" | — |

`reel.js` has the exact times, set from the voice clips' lengths. `reel-chibi.js` is the same reel in the cast's
chibi style, kept as the earlier design (render it by copying it over `reel.js`).

## Voice

Gemini: Brody Fenrir, Kayla Leda, Rep Schedar, each line starting with its bubble. Brody
has two takes: `brody` (lines 1–2) and `brody2` (lines 3–5). 4 requests in all, one per take, made on 2026-11-25:
don't make them again unless the owner asks. A line that sounds off is re-cut from its saved take for free.

## Facts (checked in the FaceRep repo)

- Fish Face, Cheek Lift and Chin Lift are free (`FREE_EXERCISE_IDS`). Chin Lift is in the jawline program, 10 reps,
  hold 5 s, relax 3 s (`app/src/constants/exercises.ts`). Its steps (`exercises.json`): "Sit or stand with a straight
  back." / "Tilt your head back until you look at the ceiling." / "Push your lower lip up over your top lip and feel
  the front of your neck stretch."
- "30 day streak" is the app's own wording (`home.json`). A free user keeps a streak with free exercises
  (`services/progress/stats.ts` counts every day with a saved workout).
- "5 minutes" is the app's own wording too: its reminder says "5 minutes keeps your streak alive." (`notifications.json`).

## The face change (the owner's choice, 26 Nov)

The owner chose to show Brody's face changing from round to an angled jaw, an exception to the "no before/after"
rule in `../README.md` for this reel. What that means when posting:
- don't boost it as a Meta ad: Meta's ad rules don't allow before-and-after pictures for health or looks;
- Instagram may keep it out of recommendations to non-followers (posts that sell with health or looks claims);
- the words stay on habits and the reps: no "FaceRep changed my face", no results promised, no looks rating, no
  harmful trend (no mewing, no bone smashing), no price. No phone screen drawn: Rep pops out of the phone instead.

## Drawings

Brody and Kayla: `page/bust/` (people.js puts them together; Brody's day is `k`, 0 on day 1 to 1 on day 30). The
rooms and props: `page/cast/room.js`, `page/cast/arc-props.js` (couch, Rep's 5:00 sign, hold ring, checklist).

## Post text

> Day 1 of his looksmax arc vs day 30 👀 It started with 5 minutes a day. Get FaceRep on the App Store.
> #glowup #looksmax #gymbro #faceworkout #facerep

Tick the platform's AI label (the voices are Gemini).
