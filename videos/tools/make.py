"""
Exercise clips by face morph: the app's own two drawings (relaxed and exercise) are blended with a landmark morph,
so the face moves (smile, pout, brows) but every frame is made of the approved drawings: no new face, no AI video.

  python make.py 06-cheek-lift              -> videos/man/06-cheek-lift.mp4 and videos/woman/06-cheek-lift.mp4
  python make.py 06-cheek-lift --guide man  -> only the man
  python make.py 06-cheek-lift --preview /tmp/out   -> also a GIF and a contact sheet there (not in the repo)

Setup and the per-exercise settings: README.md in videos/.
"""
import argparse
import os
import subprocess
import sys
import urllib.request

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEOS = os.path.dirname(HERE)
GUIDES = os.path.join(VIDEOS, "..", "app", "assets", "guides")
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
MODEL = os.path.join(HERE, ".cache", "face_landmarker.task")

# Frame: the drawing scaled to 720 wide and centred on a 720x1280 (9:16) white page, like the Flow pack frames.
W, H = 720, 1280
FPS = 30
# Seconds: hold relaxed, squeeze, hold, release, rest. One rep, loops cleanly.
TIMING = (0.4, 1.2, 1.0, 1.0, 0.3)

# Per exercise. sharp < 1: the two drawings are blended only in a window of that width around the middle of the
# move, for big pose changes (head tilts) where a long blend shows two faces at once.
SETTINGS = {
    "03-jaw-jut": {"sharp": 0.08},
}


class NoFace(Exception):
    pass


def page(path):
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    if img is None:
        sys.exit(f"cannot read {path}")
    h = round(img.shape[0] * W / img.shape[1])
    img = cv2.resize(img, (W, h), interpolation=cv2.INTER_LANCZOS4)
    out = np.full((H, W, 3), 255, dtype=np.uint8)
    top = (H - h) // 2
    out[top:top + h] = img
    return out


def landmarker():
    if not os.path.exists(MODEL):
        os.makedirs(os.path.dirname(MODEL), exist_ok=True)
        urllib.request.urlretrieve(MODEL_URL, MODEL)
    import mediapipe as mp
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision
    det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=MODEL),
        num_faces=1, min_face_detection_confidence=0.2, min_face_presence_confidence=0.2))

    def find(img, label):
        res = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
        if not res.face_landmarks:
            raise NoFace(f"{label}: no face found, so this one keeps the app's crossfade")
        return np.array([[p.x * W, p.y * H] for p in res.face_landmarks[0]], dtype=np.float32)
    find.close = det.close
    return find


def morpher(A, B, pa, pb, sharp):
    # Corners and edge points stay put, so the whole page is covered by triangles.
    border = [[fx * (W - 1), y] for fx in np.linspace(0, 1, 7) for y in (0, H - 1)]
    border += [[x, fy * (H - 1)] for fy in np.linspace(0, 1, 9)[1:-1] for x in (0, W - 1)]
    pa = np.vstack([pa, border]).astype(np.float32)
    pb = np.vstack([pb, border]).astype(np.float32)
    for p in (pa, pb):
        np.clip(p[:, 0], 0, W - 1, out=p[:, 0])
        np.clip(p[:, 1], 0, H - 1, out=p[:, 1])

    # One triangulation on the mean shape, used for every frame.
    mean = (pa + pb) / 2
    sub = cv2.Subdiv2D((0, 0, W, H))
    for p in mean:
        sub.insert((float(p[0]), float(p[1])))
    nearest = lambda pt: int(np.argmin(np.sum((mean - np.float32(pt)) ** 2, axis=1)))
    tris = []
    for t in sub.getTriangleList():
        pts = [(t[0], t[1]), (t[2], t[3]), (t[4], t[5])]
        if all(0 <= x <= W and 0 <= y <= H for x, y in pts):
            tri = tuple(nearest(p) for p in pts)
            if len(set(tri)) == 3:
                tris.append(tri)

    def warp(img, src, dst):
        out = np.zeros(img.shape, dtype=np.float32)
        for tri in tris:
            s = np.float32([src[i] for i in tri])
            d = np.float32([dst[i] for i in tri])
            rs, rd = cv2.boundingRect(s), cv2.boundingRect(d)
            if rd[2] == 0 or rd[3] == 0 or rs[2] == 0 or rs[3] == 0:
                continue
            M = cv2.getAffineTransform((s - np.float32(rs[:2])).astype(np.float32), (d - np.float32(rd[:2])).astype(np.float32))
            patch = img[rs[1]:rs[1] + rs[3], rs[0]:rs[0] + rs[2]].astype(np.float32)
            warped = cv2.warpAffine(patch, M, (rd[2], rd[3]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
            mask = np.zeros((rd[3], rd[2], 3), dtype=np.float32)
            cv2.fillConvexPoly(mask, np.int32(d - np.float32(rd[:2])), (1, 1, 1), cv2.LINE_AA)
            region = out[rd[1]:rd[1] + rd[3], rd[0]:rd[0] + rd[2]]
            mh, mw = region.shape[:2]
            region[:] = region * (1 - mask[:mh, :mw]) + warped[:mh, :mw] * mask[:mh, :mw]
        return out

    def frame(t):
        pts = (1 - t) * pa + t * pb
        a = t if sharp >= 1 else min(1.0, max(0.0, (t - 0.5) / sharp + 0.5))
        return np.clip((1 - a) * warp(A, pa, pts) + a * warp(B, pb, pts), 0, 255).astype(np.uint8)
    return frame


def timeline():
    ease = lambda x: x * x * (3 - 2 * x)
    hold0, squeeze, hold1, release, rest = (round(s * FPS) for s in TIMING)
    return ([0.0] * hold0 + [ease(i / squeeze) for i in range(squeeze + 1)] + [1.0] * hold1
            + [ease(1 - i / release) for i in range(release + 1)] + [0.0] * rest)


def encode(frames, path, extra):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", *extra, path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in frames:
        p.stdin.write(f.tobytes())
    p.stdin.close()
    if p.wait() != 0:
        sys.exit(f"ffmpeg failed for {path}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("id")
    ap.add_argument("--guide", choices=["man", "woman"])
    ap.add_argument("--preview")
    args = ap.parse_args()
    sharp = SETTINGS.get(args.id, {}).get("sharp", 1.0)
    find = landmarker()
    for guide in [args.guide] if args.guide else ["man", "woman"]:
        folder = os.path.join(GUIDES, guide, "exercises", args.id)
        A = page(os.path.join(folder, "relaxed.webp"))
        B = page(os.path.join(folder, "exercise.webp"))
        try:
            frame = morpher(A, B, find(A, f"{guide} relaxed"), find(B, f"{guide} exercise"), sharp)
        except NoFace as e:
            print(e)
            stale = os.path.join(VIDEOS, guide, f"{args.id}.mp4")
            if os.path.exists(stale):
                os.remove(stale)
                print(f"removed the old {os.path.relpath(stale, VIDEOS)}")
            continue
        cache = {}
        frames = []
        for t in timeline():
            key = round(t, 4)
            if key not in cache:
                cache[key] = frame(t)
            frames.append(cache[key])
        out = os.path.join(VIDEOS, guide, f"{args.id}.mp4")
        encode(frames, out, ["-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-movflags", "+faststart", "-an"])
        print(f"{os.path.relpath(out, VIDEOS)}  {os.path.getsize(out) // 1024} KB")
        if args.preview:
            gif = os.path.join(args.preview, f"{guide}-{args.id}.gif")
            encode(frames, gif, ["-vf", "fps=20,scale=432:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4", "-loop", "0"])
            picks = [frames[i] for i in (0, 22, 28, 34, 48)]
            cv2.imwrite(os.path.join(args.preview, f"{guide}-{args.id}-sheet.jpg"),
                        cv2.resize(np.hstack(picks), (300 * len(picks), round(H * 300 / W))))
    find.close()


if __name__ == "__main__":
    main()
