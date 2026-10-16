# Exercise clips

One short loop per exercise and guide: relaxed, the move, hold, release (4 s, 720×1280, 30 fps, H.264, no sound).
Made by `tools/make.py` from the app's own two drawings in `app/assets/guides/<man|woman>/exercises/<id>/`
(`relaxed.webp` and `exercise.webp`) with a **face morph**: about 470 face points are found in both drawings and moved
smoothly from one to the other while the drawings blend. What the face points miss (face edge, ears, chin) is matched pixel by
pixel (optical flow) before the blend, so every line shows once and there is no ghost outline; below the chin the
outline of the neck and shoulders is paired row by row, and the blank page is never matched (no grey smudges). When the mouth
opens or closes, the opening comes from the open-mouth drawing only (blending the closed lips there makes streaks). When an
eye closes or opens wider, the more open eye stays still and the lid moves over it (a closing lid keeps its lashes), and the
other drawing takes over only at the narrow end (blended, the iris showed through the closing lashes). The face finder's iris
points are left out there: where a lid covers the top of the iris it puts that point on the lid, which tore a notch into it. Every frame is made of the approved drawings, so the face
never changes and there is no before/after look (App Review 1.4.1 / 2.3.1). No AI video: Flow/Veo was tried and
changed the face, so it is not used (docs/videos.md).

Not in the app yet. These files are the source; playing them in the app is a separate change (docs/videos.md,
"Into the app").

## Status

| Exercise | Man | Woman | Note |
|---|---|---|---|
| 01-jaw-clench | ✓ | ✓ | small move by nature: the muscle builds up |
| 02-chin-lift | — | — | front view, head tips back (a 3D turn): the morph shows two faces and `tilt` can't turn a flat drawing that way; keeps the app's crossfade |
| 03-jaw-jut | ✓ | ✓ | side view; `sharp` 0.08 swaps the drawings in a few frames (no double outline) |
| 04-mewing | — | — | see-through side view: no face found; keeps the app's crossfade |
| 12-tongue-press | — | — | see-through window shows the tongue: the morph bends the inside of the window; keeps the app's crossfade |
| 05-neck-stretch | ✓ | ✓ | `tilt` 0.85, `both`: one rep to each side (8 s; the exercise switches sides every rep, the face is never flipped). The head turns around the exercise drawing's own pivot (near the chin), so the face tilts in place; the neck stays upright and follows the jaw above it, so the far side gets longer (the stretch, in red) and the near side shorter; shoulders still. Tilting from the base of the neck slid the head sideways, and bending the neck made it stretch like rubber |
| 11-chin-tuck | ✓ | ✓ | `glide`: the morph wobbled (the two drawings don't line up), so one drawing's head slides straight back, eyes level, shoulders still, and the neck muscle turns red |
| 06-cheek-lift | ✓ | ✓ | |
| 07-fish-face | ✓ | ✓ | |
| 13-smiling-fish | ✓ | ✓ | |
| 08-cheek-puff | ✓ | ✓ | |
| 14-o-stretch | ✓ | ✓ | the opening is taken from the open-mouth drawing (dark), not from stretched closed lips |
| 15-lion-face | ✓ | ✓ | `tongue`: only the exercise drawing has the tongue, so a plain morph faded it in like a ghost and the face finder took it for the chin. The tongue's outline and the chin are measured by hand in `SETTINGS`; the face morphs to the drawing without the tongue and the solid tongue slides out of the mouth, from behind the teeth with a soft edge, a shadow, a slight motion blur and a fade-in |
| 09-brow-lift | ✓ | ✓ | |
| 10-eye-squeeze | ✓ | ✓ | the lid comes down over a still eye (the eye rule above: eyes that open or close by a fifth or more; also in 06 man, 09, 15) |
| 16-wide-eyes | ✓ | ✓ | the lid rises off a still eye (eye rule) |

Front-view exercises with an expression change morph well. Head tilts (02), see-through windows (04, 12) and hands-on exercises (21–27) may not, and
side views need a short swap (`sharp`): if a clip shows two faces at once or the face can't be found, keep the app's crossfade
for that exercise. When the whole head moves, use `glide` (slides, Chin Tuck) or `tilt` (tilts, Neck Stretch) instead of the
morph: one drawing, so nothing wobbles.

## Make one

```bash
cd videos/tools
python3 -m venv .venv
.venv/bin/pip install opencv-python-headless mediapipe numpy
.venv/bin/python make.py 06-cheek-lift
.venv/bin/python make.py 06-cheek-lift --preview /tmp/clips
```

- Needs `ffmpeg`. On Linux MediaPipe also needs `libegl1` and `libgles2`.
- The face model downloads once into `tools/.cache/` (ignored by git).
- `--guide man` makes only one guide. `--preview <dir>` also writes a GIF and a 5-frame contact sheet there.
- Per-exercise settings are in `SETTINGS` at the top of `make.py` (`sharp` for big pose changes, `glide` / `tilt` for a
  head that slides or tilts, `both` for one rep to each side, `tongue` for a tongue that comes out).
- Timing is `TIMING` in `make.py`: hold 0.4 s, move 1.2 s, hold 1.0 s, release 1.0 s, rest 0.3 s.

## Check every clip

- The move matches the exercise and what must stay still stays still.
- Same face from start to end; no double face, smear or warped edges (look at the middle frames in the contact sheet).
- The face is not slimmer, smoother or sharper at the end.
- Jaw exercises look gentle.
