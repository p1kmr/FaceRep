# Exercise videos

Short silent loops that show one rep of each exercise. They live in **`videos/<man|woman>/<id>.mp4`** and are made by
`videos/tools/make.py` (how to run it, settings and status: `videos/README.md`).

## The method: face morph of the two app drawings

Every exercise already has two drawings per guide (docs/images.md): `relaxed.webp` and `exercise.webp`. They should
line up, but several of the man's exercise drawings sit up to 11 px to the side, and morphed as they were, his whole
figure slid sideways and back on every rep. So the tool first lines the exercise drawing up onto the relaxed one (the
strip it no longer covers at the page edge comes from the relaxed drawing). It then finds about 470 face points in both,
moves them smoothly from the relaxed to the exercise position and blends the two drawings on the way. Lines the face
points miss (face edge, ears, chin) are matched pixel by pixel (optical flow) before the blend, so nothing shows twice;
the neck and shoulder outline is paired row by row. Something only one drawing has can't be blended without looking
see-through: Lion Face's tongue is cut out (outline measured by hand)
and slides out of the mouth solid, and when the eyes close or open wider (Eye Squeeze, Wide Eyes) the more open eye stays still and the lid
moves over it instead of the other drawing's lid and lashes fading in over the iris; when the eyes look up (Lower Lid Lift) one
iris slides up instead of two irises blending; when the red highlight changes shape (V Eyes) it spreads from the eye outward
instead of two red patterns blending. A muscle that bulges as it works must show it: the man's Jaw Clench drawing has it
bulging out, but the woman's two drawings have the same jaw outline (only the red deepened), so her outline beside the
muscle is pushed out a little (`swell`, the drawing's own pixels) while it turns red, and goes back on the release. Hands that move (Frown Release, Jawline Sweep) are cut out along outlines traced by hand and
slide over the morphing face as solid pieces, so two pairs of hands never show at once. In the side views with a see-through
window (Mewing, Tongue Press) the head stays and one tongue rises to the palate, its outline changing from the one drawing's to
the other's. Because every frame is made of the approved drawings, the face, the pencil style and the
red muscle highlight stay exactly as in the app, and the face can't get slimmer or smoother (App Review 1.4.1 /
2.3.1, the Health rule in CLAUDE.md). It is free, runs offline and gives the same result every time.

It works best for front views where the expression changes. Side views use a short swap of the two drawings
(`sharp` in `SETTINGS`). When the whole head moves, the tool doesn't morph: it moves one drawing's head as one piece
while its muscle turns red, because morphing two drawings that don't line up made the head, ear and neck wobble.
`glide` slides the head straight back (Chin Tuck: eyes level, shoulders still); `tilt` turns it around the exercise
drawing's own pivot (near the chin) by a share of its angle, so the face tilts in place, and the neck follows the jaw
without leaning or sliding: one side gets longer, the other shorter (Neck Side Stretch, one rep to each side because
the exercise switches sides every rep). Chin Lift keeps the app's crossfade: the head tips back, a turn two flat drawings
can't show.

## Tried and dropped: AI video (Google Flow / Veo, Omni Flash)

Frames to Video with the two drawings as first and last frame, Oct 2026. Rejected: the face changed during the clip
(younger, smoother, a different man), the move went back and forth, the red patches smeared, and an 8 s clip has a
fixed timing that doesn't match each exercise's reps. Don't use AI video for exercise clips. The Flow prompt pack
artifact (https://claude.ai/artifact/Nbert5f5PApgezCxiMwWP2) still has the 9:16 frames the morph tool matches.

## Review list (every clip)

- The movement matches the exercise's steps in the app (`exercises.json`), including what must **not** move
  (eyebrows in 16, cheeks in 19, shoulders in 02/05/11). In 01 the jaw muscles fill out at the sides, not only turn red.
- Nothing slides sideways: the hair and shoulders stay where they are (only the head of 05 and 11 moves, on purpose).
- Same face from start to end; no double face in the middle frames, no smear.
- **No before/after look**: the face is not smoother, slimmer or "sharper" at the end. If in doubt, reject it.
- Jaw exercises (01, 03, 15) look gentle, never forced.
- Man and woman clips of the same exercise show the same move.

## In the app

`videos/tools/app.py` copies each clip into its exercise folder as `app/assets/guides/<guide>/exercises/<id>/clip.mp4`:
cut back to the drawing's shape (the white bands of the 9:16 page go, so the clip lines up with the drawing) and encoded
smaller (H.264, CRF 26, no sound, about 350 KB; 15 MB for all 52). `npm run images` lists them in the generated file
(`exercises[id].clip`) and its check rejects a clip that isn't an MP4 or is over 1.2 MB. Re-run `app.py` (and
`npm run images`) after re-making a clip with `make.py`.

`components/exercise/ExerciseClip.tsx` plays one with **`expo-video`** (the Expo SDK's own player: hardware H.264, one
small native module; an image sequence would have been 3–5 times bigger). It loops muted, mixes with the user's music
(`audioMixingMode: 'mixWithOthers'`), shows the relaxed drawing until its first frame is on screen, and stops when its
screen is covered, the app goes to the background or the user taps pause. No picture-in-picture, no background play
(`app.json`).

- **Exercise page:** the clip loops at the top, with a pause / play button.
- **Workout player:** a clip has a fixed timing, so it doesn't replace the rep-synced drawings. It plays before each
  exercise, during "Get ready" and "Next up" (the move once), and the two drawings take over in time with the counter
  when the reps start (`PlayerFigure.tsx`). The jaw caution still replaces the cue before jaw exercises.
- **Reduce Motion** (or no clip, 02 Chin Lift): the drawings, as before.
- Settings' note on the pictures says the videos are made from the AI-generated drawings (all six languages).
- The store text and screenshots must not show clips as results.

The web build (store screenshot capture) can't decode H.264 in the bundled Chromium; it shows the drawing (the cover),
which is also what the screenshots use.
