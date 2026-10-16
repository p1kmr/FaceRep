# Exercise clips

One short loop per exercise and guide: relaxed, the move, hold, release (4 s, 720×1280, 30 fps, H.264, no sound).
Made by `tools/make.py` from the app's own two drawings in `app/assets/guides/<man|woman>/exercises/<id>/`
(`relaxed.webp` and `exercise.webp`) with a **face morph**: about 470 face points are found in both drawings and moved
smoothly from one to the other while the drawings blend. Every frame is made of the approved drawings, so the face
never changes and there is no before/after look (App Review 1.4.1 / 2.3.1). No AI video: Flow/Veo was tried and
changed the face, so it is not used (docs/videos.md).

Not in the app yet. These files are the source; playing them in the app is a separate change (docs/videos.md,
"Into the app").

## Status

| Exercise | Man | Woman | Note |
|---|---|---|---|
| 01-jaw-clench | ✓ | ✓ | small move by nature: the muscle builds up |
| 02-chin-lift | review | review | head tilt; `sharp` 0.25 keeps the blend short |
| 06-cheek-lift | ✓ | ✓ | |

Front-view exercises with an expression change morph well. Side views (03, 04, 11, 12), head tilts and hands-on
exercises (21–27) may not: if a clip shows two faces at once or the face can't be found, keep the app's crossfade
for that exercise.

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
- Per-exercise settings are in `SETTINGS` at the top of `make.py` (`sharp` for big pose changes).
- Timing is `TIMING` in `make.py`: hold 0.4 s, move 1.2 s, hold 1.0 s, release 1.0 s, rest 0.3 s.

## Check every clip

- The move matches the exercise and what must stay still stays still.
- Same face from start to end; no double face, smear or warped edges (look at the middle frames in the contact sheet).
- The face is not slimmer, smoother or sharper at the end.
- Jaw exercises look gentle.
