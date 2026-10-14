# Exercise videos (Google Flow)

Short, silent clips that show one rep of each exercise. They are made by hand in **Google Flow** (labs.google/flow)
with the owner's Google AI Pro plan, so nothing is paid per video and no API key is needed. Not in the app yet:
playing them needs `expo-video`, a video list like `guideImages.generated.ts`, and a new build (see "Into the app").

## The method: start and end frame from the guide pictures

Every exercise already has two aligned pictures per guide (docs/images.md):
`app/assets/guides/<man|woman>/exercises/<id>/relaxed.webp` and `exercise.webp`. Flow's **Frames to Video** takes a
first and a last frame, so Veo only has to animate the move between two pictures we already approved. That keeps the
pencil style, the face and the red muscle highlight the same as in the app.

1. In Flow: **New project → Frames to Video**. Model: Veo 3.1 **Fast** (fewer credits; use Quality only for a clip
   that keeps failing). Aspect ratio **9:16**. 1 output per prompt while testing.
2. **First frame:** `relaxed.webp`. **Last frame:** `exercise.webp` (same guide, same exercise). Flow may ask you to
   crop to 9:16: keep the whole head, the white paper fills the rest.
3. Prompt: the **shared style** text below, then a blank line, then the exercise's **movement** line from the table.
4. Generate, watch it 3 times, check it against the review list. Download the good one as MP4 (720p is enough).
5. Name it `<id>.mp4` (for example `06-cheek-lift.mp4`) and put it in
   `video-originals/<man|woman>/` **outside the repo**. Nothing goes into `app/assets` until the app can play it.

Start with two tests per guide: `06-cheek-lift` (easy) and `01-jaw-clench` (jaw). Only go on when both look right.
If Pro videos carry a visible watermark, stop and tell Claude before making more.

## Shared style (paste first, every time)

```
Animate this graphite pencil illustration on pure white paper. Keep the exact drawing style, the same person, the
same face, the same framing and lighting from the first frame to the last. The camera never moves. The background
stays plain white. No text, no logos, no sound.

The movement is slow, smooth and natural, like a calm instructor showing one repetition: about 1 second still, then
the movement over about 3 seconds, then the final pose held still. The skin, face shape, jaw and neck look exactly the
same at the end as at the start: no smoothing, slimming, lifting or any before/after change. Only the expression and
the red muscle highlight change, and the red muscle fibers slowly get brighter as the muscle works.
```

For exercises with hands (21–27) add:

```
The hands move slowly and stay natural and well-formed: five fingers per hand, drawn in the same pencil style. The
hands never cover the eyes.
```

## Movement line per exercise

| ID | Movement (paste after the shared style) |
|---|---|
| 01-jaw-clench | Lips stay closed and the face stays calm. The jaw muscle in front of the ear slowly tightens as the back teeth press together gently. |
| 02-chin-lift | The head tilts slowly back until the eyes look at the ceiling, then the lower lip pushes up over the top lip. The shoulders do not move. |
| 03-jaw-jut | Side view. The chin lifts a little, then the lower jaw slides slowly forward. The rest of the head stays still. |
| 04-mewing | Side view with the see-through window. The tongue rises slowly from resting low until the whole tongue lies flat against the roof of the mouth. Lips stay closed. |
| 05-neck-stretch | The head tilts slowly sideways, the ear moving toward the shoulder on the image's right. Both shoulders stay down and still. |
| 06-cheek-lift | Lips stay closed while the mouth widens slowly into a big closed-lip smile and the cheeks rise toward the eyes. |
| 07-fish-face | The cheeks slowly suck in between the teeth and the lips pucker forward like a fish. |
| 08-cheek-puff | The lips seal and both cheeks slowly fill with air until they are round. |
| 09-brow-lift | The eyebrows rise slowly as high as they can, the eyes open wide, soft lines appear on the forehead. |
| 10-eye-squeeze | The eyes slowly close and squeeze shut firmly. The forehead stays relaxed. |
| 11-chin-tuck | Side view. The head glides straight back without tilting, the eyes stay level, a small soft double chin forms. The shoulders do not move. |
| 12-tongue-press | Side view. Lips closed, the tongue presses up against the roof of the mouth and the small muscles under the chin firm up. |
| 13-smiling-fish | The cheeks suck in and the lips pucker like a fish, then the corners of the mouth lift into a smile. |
| 14-o-stretch | The mouth opens slowly into a tall vertical O with the lips pulled over the teeth. The forehead stays relaxed. |
| 15-lion-face | The mouth opens wide, the tongue stretches out and down toward the chin, the eyes open wide. Slow and comfortable, never forced. |
| 16-wide-eyes | The eyes open slowly as wide as possible while the eyebrows stay exactly where they are. |
| 17-lower-lid-lift | The eyes look slightly up and only the lower eyelids lift, like squinting into the sun. The forehead stays smooth. |
| 18-lip-press | The lips press together and roll slightly in over the teeth. The jaw stays relaxed. |
| 19-pout | The lips push slowly forward into a long pout, like blowing a kiss. The cheeks are not sucked in. |
| 20-lip-corner-lift | The lips stay closed and only the corners of the mouth lift into a small smile. |
| 21-smile-line-press | Both index fingertips rest on the lines from the nose to the mouth corners, then the face smiles wide with closed lips while the fingers hold still. |
| 22-forehead-press | The fingers lie flat across the forehead and stay still while the eyebrows try to rise against them. |
| 23-v-eyes | Middle and index fingertips form a V around each eye, then the eyes look up and the lower lids lift into a firm squint. |
| 24-jaw-release | The teeth part, the eyes half-close, the fingertips on the jaw muscle make two slow small circles. |
| 25-jawline-sweep | Soft fists, the knuckles start under the middle of the chin and glide slowly along the jawline to just below the ears. |
| 26-frown-release | The fingertips start together between the eyebrows and glide slowly outward over the brows to the temples. |
| 27-temple-circles | The eyes close, the fingertips on the temples make two slow gentle circles. |

## Review list (every clip)

- The movement matches the exercise's steps in the app (`exercises.json`), including what must **not** move
  (eyebrows in 16, cheeks in 19, shoulders in 02/05/11).
- Same person and same face from start to end; no warping, no extra teeth, fingers or eyes.
- **No before/after look**: the face is not smoother, slimmer or "sharper" at the end (App Review 1.4.1 / 2.3.1, the
  Health rule in CLAUDE.md). If in doubt, reject it.
- Jaw exercises (01, 03, 15) look gentle, never forced.
- No text, logo or watermark in the picture.
- Man and woman clips of the same exercise show the same move.

## Into the app (later, one change)

When both guides have all 27 clips: compress to H.264, muted, 720p (about 300–600 KB each, 25–50 MB in all), add them
under `assets/guides/<man|woman>/exercises/<id>/exercise.mp4`, extend `npm run images` and its check, play them with
`expo-video` in the exercise page and the workout player (still pictures stay as the poster and the Reduce Motion
fallback), keep the jaw caution before jaw exercises, and add any new label in all six languages. Then a new build.
The store text and screenshots must not show them as results. The Settings footer already says the figures are
AI-generated; extend it to "pictures and videos".
