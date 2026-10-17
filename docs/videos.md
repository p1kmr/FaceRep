# Exercise videos

Short silent loops that show one rep of each exercise. They live in **`videos/<man|woman>/<id>.mp4`** and are made by
`videos/tools/make.py` (how to run it, settings and status: `videos/README.md`).

## The method: face morph of the two app drawings

Every exercise already has two aligned drawings per guide (docs/images.md): `relaxed.webp` and `exercise.webp`. The
tool finds about 470 face points in both, moves them smoothly from the relaxed to the exercise position and blends
the two drawings on the way. Lines the face points miss (face edge, ears, chin) are matched pixel by pixel (optical flow)
before the blend, so nothing shows twice; the neck and shoulder outline is paired row by row. Something only one
drawing has can't be blended without looking see-through: Lion Face's tongue is cut out (outline measured by hand)
and slides out of the mouth solid, and when the eyes close or open wider (Eye Squeeze, Wide Eyes) the more open eye stays still and the lid
moves over it instead of the other drawing's lid and lashes fading in over the iris; when the eyes look up (Lower Lid Lift) one
iris slides up instead of two irises blending; when the red highlight changes shape (V Eyes) it spreads from the eye outward
instead of two red patterns blending. Hands that move (Frown Release, Jawline Sweep) are cut out along outlines traced by hand and
slide over the morphing face as solid pieces, so two pairs of hands never show at once. Because every frame is made of the approved drawings, the face, the pencil style and the
red muscle highlight stay exactly as in the app, and the face can't get slimmer or smoother (App Review 1.4.1 /
2.3.1, the Health rule in CLAUDE.md). It is free, runs offline and gives the same result every time.

It works best for front views where the expression changes. Side views use a short swap of the two drawings
(`sharp` in `SETTINGS`). When the whole head moves, the tool doesn't morph: it moves one drawing's head as one piece
while its muscle turns red, because morphing two drawings that don't line up made the head, ear and neck wobble.
`glide` slides the head straight back (Chin Tuck: eyes level, shoulders still); `tilt` turns it around the exercise
drawing's own pivot (near the chin) by a share of its angle, so the face tilts in place, and the neck follows the jaw
without leaning or sliding: one side gets longer, the other shorter (Neck Side Stretch, one rep to each side because
the exercise switches sides every rep). Chin Lift still keeps the
app's crossfade, and so may other hands-on exercises.

## Tried and dropped: AI video (Google Flow / Veo, Omni Flash)

Frames to Video with the two drawings as first and last frame, Oct 2026. Rejected: the face changed during the clip
(younger, smoother, a different man), the move went back and forth, the red patches smeared, and an 8 s clip has a
fixed timing that doesn't match each exercise's reps. Don't use AI video for exercise clips. The Flow prompt pack
artifact (https://claude.ai/artifact/Nbert5f5PApgezCxiMwWP2) still has the 9:16 frames the morph tool matches.

## Review list (every clip)

- The movement matches the exercise's steps in the app (`exercises.json`), including what must **not** move
  (eyebrows in 16, cheeks in 19, shoulders in 02/05/11).
- Same face from start to end; no double face in the middle frames, no smear.
- **No before/after look**: the face is not smoother, slimmer or "sharper" at the end. If in doubt, reject it.
- Jaw exercises (01, 03, 15) look gentle, never forced.
- Man and woman clips of the same exercise show the same move.

## Into the app (later, one change)

The workout player today crossfades the two drawings in time with the rep counter (`ExerciseFrames.tsx`): squeeze
shows the exercise drawing, release the relaxed one, for each exercise's own timing. A clip has a fixed timing, so it
must not replace that sync. Options when the set is ready: show the clip on the exercise page (it isn't timed), or
drive the morph frames from the rep counter in the player. Either way: `expo-video` or an image sequence (justify the
dependency), the drawings stay as the poster and the Reduce Motion fallback, the jaw caution stays before jaw
exercises, new labels in all six languages, the Settings footer says "pictures and videos", and a new build. Clips
go under `app/assets` only in that change (the images check rejects unknown files in the exercise folders). The
store text and screenshots must not show them as results.
