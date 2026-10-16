"""
Exercise clips by face morph: the app's own two drawings (relaxed and exercise) are blended with a landmark morph,
so the face moves (smile, pout, brows) but every frame is made of the approved drawings: no new face, no AI video.

  python make.py 06-cheek-lift              -> videos/man/06-cheek-lift.mp4 and videos/woman/06-cheek-lift.mp4
  python make.py 06-cheek-lift --guide man  -> only the man
  python make.py 06-cheek-lift --preview /tmp/out   -> also a GIF and a contact sheet there (not in the repo)

Setup and the per-exercise settings: README.md in videos/.
"""
import argparse
import json
import os
import subprocess
import sys
import urllib.request

import cv2
import numpy as np

import hands

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
# glide / tilt: no morph; the relaxed drawing's head moves as one piece (shoulders still, neck follows) while its pale
# muscle deepens to the exercise drawing's red. For moves of the whole head (see glider() and tilter()).
# both: one rep to each side (the exercise switches sides every rep); the clip is twice as long.
SETTINGS = {
    "03-jaw-jut": {"sharp": 0.08},
    # gaze: the eyes look up in the exercise drawing; one iris slides there instead of two blending.
    "17-lower-lid-lift": {"gaze": True},
    "23-v-eyes": {"gaze": True},
    "11-chin-tuck": {"glide": 0.13},
    "05-neck-stretch": {"tilt": 0.85, "both": True},
    # hands: the hands move; each is cut out along its outline in hands.json and slides as one piece (see hands.py).
    # swap: when the relaxed hand turns into the exercise hand (start, length); her relaxed hand has two fingers curled
    # and the exercise hand none, so a slow swap showed both: it happens quickly at the end of the move.
    "26-frown-release": {"hands": True, "swap": {"woman": (0.8, 0.14)}},
    # tongue: on each exercise drawing, in page pixels (720x1280), the tongue's outline and the bottom of the chin
    # (the face finder takes the tongue for the chin); measure again if the drawing changes.
    "15-lion-face": {"tongue": {
        "man": {"chin": 800, "outline": [(298, 630), (305, 620), (330, 617), (350, 618), (357, 623), (365, 618), (390, 617), (410, 620), (418, 632),
                (420, 650), (418, 680), (416, 700), (410, 725), (400, 750), (385, 770), (365, 777), (345, 777), (332, 770),
                (316, 750), (306, 725), (301, 700), (298, 680), (296, 650)]},
        "woman": {"chin": 866, "outline": [(296, 712), (300, 703), (330, 701), (360, 702), (390, 701), (418, 703), (424, 712), (422, 740), (419, 770),
                  (411, 800), (398, 828), (380, 843), (362, 846), (343, 843), (322, 830), (309, 800), (301, 770), (298, 740)]},
    }},
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


def outline(img):
    # Leftmost and rightmost drawn pixel of each row (the page is white around the figure).
    ink = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (0, 0), 2) < 232
    rows = []
    for r in ink:
        xs = np.flatnonzero(r)
        rows.append((float(xs[0]), float(xs[-1])) if len(xs) else (None, None))
    return rows


# MediaPipe's inner lip outline: the mouth opening.
INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
# Inner lip points, upper and lower, in pairs.
LIPS = ((191, 95), (80, 88), (81, 178), (82, 87), (13, 14), (312, 317), (311, 402), (310, 318), (415, 324))
# MediaPipe's eye outlines (the opening between the lids), the person's right eye then left; points 0 and 8 are the
# corners.
EYES = ([33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
        [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249])


def closed(img, p):
    # The face finder sometimes sees an opening in closed lips and puts the lower inner lip on the middle of the lower
    # lip (the woman's Lip Press, her relaxed O Stretch); the mouth-opening rule then tore the lip line. A real opening is
    # dark inside, so without one the lower inner lip points go back onto the lip line.
    if cv2.contourArea(p[INNER].astype(np.float32)) <= 400:
        return p
    m = np.zeros(img.shape[:2], np.uint8)
    cv2.fillPoly(m, [np.int32(np.round(p[INNER]))], 255)
    if (cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)[m > 0] < 90).mean() >= 0.15:
        return p
    p = p.copy()
    for up, low in LIPS:
        p[low] = p[up] + [0, 1]
    return p


def morpher(A, B, pa, pb, sharp, layer=None, gaze=False):
    # layer: optional (image, alpha, show) in B's shape, drawn on top and slid out from its top edge as show(t) goes
    # 0 -> 1 (the tongue in Lion Face, which only the exercise drawing has).
    # Below the chin the face points stop, so the outline of the neck and shoulders is paired row by row in both
    # drawings: a wider or narrower neck then moves smoothly instead of fading in as a grey smudge.
    # When an eye opens or closes by a fifth or more (Eye Squeeze, Wide Eyes, Brow Lift), the lid moves over a still
    # eyeball: warped, the iris was squashed into the opening and the other drawing's lid and lashes were blended over
    # it, so the iris showed through or the lid tore. Inside the opening the more open drawing's eye stays where it is
    # and the lid edge moves over it (see frame()). The iris points are left out there: where a lid covers the top of
    # the iris, the face finder puts that iris point on the lid, which pulled the lid into a notch.
    blinks = []
    for eye in EYES:
        ea, eb = cv2.contourArea(pa[eye]), cv2.contourArea(pb[eye])
        if min(ea, eb) < 0.8 * max(ea, eb):
            blinks.append((eye, ea > eb))
    # gaze: the eyes look elsewhere in the exercise drawing (Lower Lid Lift, V Eyes: up). Blended, each eye showed two
    # irises; instead one iris slides from the relaxed to the exercise position. The shift is measured by finding the
    # relaxed drawing's pupil and lower iris in the exercise drawing (the face finder's iris points are rough there).
    gazes = []
    for eye in EYES if gaze else []:
        if any(eye is e for e, _ in blinks):
            continue
        mid = pa[eye].mean(0)
        iris = min((468, 473), key=lambda i: np.linalg.norm(pa[i] - mid))
        r = float(np.ptp(pa[iris + 1:iris + 5, 0])) / 2
        cx, cy = int(round(pa[iris, 0])), int(round(pa[iris, 1]))
        shift = pb[[eye[0], eye[8]]].mean(0) - pa[[eye[0], eye[8]]].mean(0)
        R, reach = int(np.ceil(1.2 * r)), int(np.ceil(0.8 * r))
        tpl = cv2.cvtColor(A, cv2.COLOR_BGR2GRAY)[cy - R:cy + R + 1, cx - R:cx + R + 1]
        mask = np.zeros(A.shape[:2], np.uint8)
        cv2.fillPoly(mask, [np.int32(np.round(pa[eye]))], 255)
        mask = mask[cy - R:cy + R + 1, cx - R:cx + R + 1]
        disk = np.zeros_like(mask)
        cv2.circle(disk, (R, R), int(r), 255, -1)
        mask = cv2.bitwise_and(mask, disk)
        mask[:R - int(0.4 * r)] = 0
        bx, by = int(round(cx + shift[0])), int(round(cy + shift[1]))
        area = cv2.cvtColor(B, cv2.COLOR_BGR2GRAY)[by - R - reach:by + R + reach + 1, bx - R - reach:bx + R + reach + 1]
        _, _, (mx, my), _ = cv2.minMaxLoc(cv2.matchTemplate(area, tpl, cv2.TM_SQDIFF, mask=mask))
        d = np.float32([bx - reach + mx, by - reach + my]) - (np.float32([cx, cy]) + shift)
        gazes.append((eye, np.float32([cx, cy]), r, d, shift))
    if gazes:
        # The white catch light sits above the pupil in one drawing and below it in the other, so blended there were
        # two. It is lifted off both irises and one catch light glides from the one place to the other.
        clean = [A.copy(), B.copy()]
        for k, (eye, c, r, d, shift) in enumerate(gazes):
            spots = []
            for img, centre in ((clean[0], c), (clean[1], c + shift + d)):
                disk = np.zeros(img.shape[:2], np.uint8)
                cv2.circle(disk, (int(round(centre[0])), int(round(centre[1]))), int(0.8 * r), 255, -1)
                spot = ((cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) > 190) & (disk > 0)).astype(np.uint8) * 255
                spot = cv2.dilate(spot, np.ones((3, 3), np.uint8))
                ys, xs = np.nonzero(spot)
                alpha = cv2.GaussianBlur(spot.astype(np.float32) / 255, (0, 0), 0.8)[..., None]
                spots.append((img.astype(np.float32) * alpha, alpha, np.float32([xs.mean(), ys.mean()]) - centre))
                img[:] = cv2.inpaint(img, spot, 3, cv2.INPAINT_TELEA)
            gazes[k] = (eye, c, r, d, shift, spots)
    if blinks or gazes:
        pa, pb = pa[:468], pb[:468]
    pa, pb = closed(A, pa), closed(B, pb)
    sa, sb = outline(A), outline(B)
    extra_a, extra_b = [], []
    for y in range(int(max(pa[152, 1], pb[152, 1])) + 20, H - 20, 24):
        for side in (0, 1):
            xa, xb = sa[y][side], sb[y][side]
            if xa is not None and xb is not None and abs(xa - xb) < 100 and 2 < xa < W - 3 and 2 < xb < W - 3:
                extra_a.append([xa, y])
                extra_b.append([xb, y])
    if extra_a:
        pa, pb = np.vstack([pa, extra_a]), np.vstack([pb, extra_b])
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
            # Skip flat triangles (points on one line), which have no affine transform.
            if abs((s[1, 0] - s[0, 0]) * (s[2, 1] - s[0, 1]) - (s[1, 1] - s[0, 1]) * (s[2, 0] - s[0, 0])) < 1e-2:
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

    # When one drawing has the mouth open and the other closed, the opening is taken from the open one only: blending
    # the closed lips there stretches their line into streaks.
    opens = cv2.contourArea(pb[INNER]) - cv2.contourArea(pa[INNER])
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    grid = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    gray = lambda img: cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY)

    def opening(pts, eye):
        m = np.zeros((H, W), np.uint8)
        cv2.fillPoly(m, [np.int32(np.round(pts[eye] * 16))], 255, cv2.LINE_AA, 4)
        return m

    def soft(m):
        # A pixel inside the lid line, so the lid's own dark edge stays on top of the eye.
        return cv2.GaussianBlur(cv2.erode(m, np.ones((3, 3), np.uint8)).astype(np.float32) / 255, (0, 0), 1.0)[..., None]

    def frame(t):
        pts = (1 - t) * pa + t * pb
        a = t if sharp >= 1 else min(1.0, max(0.0, (t - 0.5) / sharp + 0.5))
        wa, wb = warp(A, pa, pts), warp(B, pb, pts)
        if 0 < a < 1:
            # The face points don't cover every line (face edge, ears, chin), so what is left over would show twice.
            # Match it pixel by pixel and move both drawings to meet, so each line shows once.
            ga, gb = gray(wa), gray(wb)
            f = np.nan_to_num(dis.calc(ga, gb, None))
            g = np.nan_to_num(dis.calc(gb, ga, None))
            # Blank page stays blank: no matching where neither drawing has ink (it smears grey into the white).
            ink = cv2.dilate(((ga < 245) | (gb < 245)).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
            f[~ink] = 0
            g[~ink] = 0
            # Around an eye that opens or closes, the face points already line the lids up; matching pixels there
            # tore the lid line (one drawing's lid covers the iris where the other's doesn't).
            if blinks or gazes:
                calm = np.zeros((H, W), np.uint8)
                for eye in [e for e, _ in blinks] + [e for e, *_ in gazes]:
                    cv2.fillPoly(calm, [np.int32(np.round(pts[eye]))], 255)
                calm = cv2.dilate(calm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
                keep = 1 - cv2.GaussianBlur(calm.astype(np.float32) / 255, (0, 0), 6)[..., None]
                f, g = f * keep, g * keep
            wa = cv2.remap(wa, grid[0] - a * f[..., 0], grid[1] - a * f[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            wb = cv2.remap(wb, grid[0] - (1 - a) * g[..., 0], grid[1] - (1 - a) * g[..., 1], cv2.INTER_LINEAR,
                           borderMode=cv2.BORDER_REPLICATE)
        a_map = np.float32(a)
        if abs(opens) > 400 and 0 < a < 1:
            m = np.zeros((H, W), np.float32)
            cv2.fillPoly(m, [np.int32(pts[INNER])], 1.0)
            m = cv2.GaussianBlur(m, (0, 0), 2)
            a_map = a + (1 - a) * m if opens > 0 else a * (1 - m)
            a_map = a_map[..., None]
        out = (1 - a_map) * wa + a_map * wb
        for eye, closing in blinks if 0 < a < 1 else []:
            src, img = (pa, A) if closing else (pb, B)
            corners = [eye[0], eye[8]]
            dx, dy = pts[corners].mean(0) - src[corners].mean(0)
            ball = cv2.warpAffine(img.astype(np.float32), np.float32([[1, 0, dx], [0, 1, dy]]), (W, H),
                                  flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            m = opening(pts, eye)
            shut = float(smooth(((a if closing else 1 - a) - 0.7) / 0.3))
            if closing:
                # Above the opening, the open eye's lashes and lid line stay dark until the eye shuts (blended, they
                # faded to nothing halfway and the lid edge went pale).
                reach = round(0.012 * H)
                band = cv2.dilate(m, np.ones((reach + 1, 5), np.uint8), anchor=(2, 0)).astype(np.float32) / 255
                band = cv2.GaussianBlur(band * (1 - m / 255), (0, 0), 2.0)
                dark = np.clip((gray(out).astype(np.float32) - gray(wa)) / 40, 0, 1)
                k = (band * dark * (1 - shut))[..., None]
                out = out * (1 - k) + wa * k
            m = soft(m)
            inside = (1 - shut) * ball + shut * (wb if closing else wa)
            out = out * (1 - m) + inside * m
        for eye, c, r, d, shift, spots in gazes if 0 < a < 1 else []:
            # Both drawings' irises are moved to the same place (the sclera around them gives way), then blended.
            corners = [eye[0], eye[8]]
            here = pts[corners].mean(0)
            ca, cb = here - pa[corners].mean(0), here - pb[corners].mean(0)
            centre = c + ca + t * d
            w = smooth((2.0 * r - np.hypot(grid[0] - centre[0], grid[1] - centre[1])) / (0.9 * r))
            ball_a = cv2.remap(clean[0].astype(np.float32), grid[0] - ca[0] - t * d[0] * w, grid[1] - ca[1] - t * d[1] * w,
                               cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            ball_b = cv2.remap(clean[1].astype(np.float32), grid[0] - cb[0] + (1 - t) * d[0] * w,
                               grid[1] - cb[1] + (1 - t) * d[1] * w, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            inside = (1 - a) * ball_a + a * ball_b
            spot = centre + (1 - t) * spots[0][2] + t * spots[1][2]
            light, alpha = 0, 0
            for (pre, al, rel), share, home in ((spots[0], 1 - a, c), (spots[1], a, c + shift + d)):
                move = np.float32([[1, 0, spot[0] - home[0] - rel[0]], [0, 1, spot[1] - home[1] - rel[1]]])
                light = light + share * cv2.warpAffine(pre, move, (W, H), flags=cv2.INTER_LINEAR)
                alpha = alpha + share * cv2.warpAffine(al, move, (W, H), flags=cv2.INTER_LINEAR)[..., None]
            inside = inside * (1 - alpha) + light
            m = soft(opening(pts, eye))
            out = out * (1 - m) + inside * m
        if layer is not None:
            img, alpha, show = layer
            s = show(t)
            if s > 0:
                li, la = warp(img, pb, pts), warp(np.dstack([alpha] * 3), pb, pts)[..., 0]
                inside = la > 0.5
                rows, cols = np.nonzero(inside.any(1))[0], np.nonzero(inside.any(0))[0]
                length, mid = float(rows[-1] - rows[0]), (cols[0] + cols[-1]) / 2
                # The mouth line the tongue comes out of: its own top edge, column by column, smoothed.
                edge = np.where(inside.any(0), inside.argmax(0), H).astype(np.float32)
                edge = np.minimum(edge, cv2.blur(edge[None], (15, 1))[0])
                # Slide out from behind the teeth, a little narrower at first (a tongue flattens as it comes out).
                width = 0.85 + 0.15 * s
                mx = (mid + (grid[0] - mid) / width).astype(np.float32)
                my = grid[1] + np.float32((1 - s) * length)
                li = cv2.remap(li, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
                la = cv2.remap(la, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
                # Soft exit line instead of a straight cut, shadow where it leaves the dark mouth, gentle fade-in.
                below = grid[1] - edge[None, :]
                la = la * smooth(below / 10) * smooth(s / 0.25)
                li = li * (1 - 0.5 * np.exp(-np.clip(below, 0, None) / 18))[..., None]
                # A little motion blur while it moves (most in the middle of the slide).
                k = int(0.06 * length * np.sin(np.pi * s))
                pre = li * la[..., None]
                if k > 1:
                    kernel = np.ones((k, 1), np.float32) / k
                    pre, la = cv2.filter2D(pre, -1, kernel), cv2.filter2D(la, -1, kernel)
                out = out * (1 - la[..., None]) + pre
        return np.clip(out, 0, 255).astype(np.uint8)
    frame.to_b = lambda img: warp(img, pa, pb)
    return frame


def tongue(A, B, pa, spec, find, label):
    # Lion Face: only the exercise drawing has the tongue, so a plain morph fades it in like a ghost over the chin,
    # and the face finder takes the tongue for the chin. The tongue (outline `poly`, traced on the exercise drawing's
    # page) is cut out and painted over, the face is found again and morphed to that tongue-free drawing (mouth
    # opens, eyes widen), and the solid tongue slides out of the mouth on top. The face finder still puts the chin too
    # high, so the points below the lower lip are stretched down to the measured chin.
    mask = np.zeros((H, W), np.uint8)
    cv2.fillPoly(mask, [np.int32(spec["outline"])], 255)
    pb = find(cv2.inpaint(B, cv2.dilate(mask, np.ones((7, 7), np.uint8)), 9, cv2.INPAINT_TELEA), f"{label} without tongue")
    lip = pb[17, 1]
    low = pb[:, 1] > lip
    pb[low, 1] = lip + (pb[low, 1] - lip) * (spec["chin"] - lip) / (pb[152, 1] - lip)
    soft = cv2.GaussianBlur(cv2.dilate(mask, np.ones((5, 5), np.uint8)).astype(np.float32) / 255, (0, 0), 2)[..., None]
    under = morpher(A, A, pa, pb, 1.0).to_b(A)
    Bn = B * (1 - soft) + under * soft
    # Behind the tongue, inside the open mouth, is the dark of the mouth (not stretched lips).
    mouth = np.zeros((H, W), np.uint8)
    cv2.fillPoly(mouth, [np.int32(pb[INNER])], 255)
    gray = cv2.cvtColor(B, cv2.COLOR_BGR2GRAY)
    dark_px = B[(mouth > 0) & (gray < 90)]
    dark = np.median(dark_px, 0) if len(dark_px) > 20 else np.float32([35, 30, 40])
    inner = cv2.GaussianBlur(((mouth > 0) & (mask > 0)).astype(np.float32), (0, 0), 2)[..., None]
    Bn = (Bn * (1 - inner) + dark * inner).astype(np.uint8)
    alpha = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), 1.2)
    show = lambda t: float(smooth((t - 0.3) / 0.7))
    return morpher(A, Bn, pa, pb, 1.0, layer=(B, alpha, show))


def smooth(v):
    v = np.clip(v, 0, 1)
    return v * v * (3 - 2 * v)


def muscle(A, B, pa, side=None):
    # The muscle is the coloured strip below the mouth of the relaxed drawing; colour(t) deepens it to the exercise
    # drawing's red, only inside `side` when given (the stretched side of a tilt).
    la = cv2.cvtColor(A, cv2.COLOR_BGR2LAB).astype(np.float32)
    lb = cv2.cvtColor(B, cv2.COLOR_BGR2LAB).astype(np.float32)
    ca, ha = np.hypot(la[..., 1] - 128, la[..., 2] - 128), np.arctan2(la[..., 2] - 128, la[..., 1] - 128)
    cb = np.hypot(lb[..., 1] - 128, lb[..., 2] - 128)
    red = cb > 15
    hb = np.arctan2(lb[..., 2][red].mean() - 128, lb[..., 1][red].mean() - 128)
    mask = np.clip((ca - 3) / 6, 0, 1)
    mask[:int(pa[14, 1])] = 0
    up = cv2.GaussianBlur(mask, (0, 0), 3) * (1 if side is None else side)
    gain = max(0.0, np.percentile(cb[cb > 6], 98) / max(np.percentile(ca[up > 0.5], 98), 1.0) - 1)
    turn = np.angle(np.exp(1j * (hb - ha)))

    def colour(t):
        lab = la.copy()
        c = ca * (1 + gain * t * up)
        h = ha + turn * t * up
        lab[..., 1] = 128 + c * np.cos(h)
        lab[..., 2] = 128 + c * np.sin(h)
        return cv2.cvtColor(lab.clip(0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
    return colour


def glider(A, B, pa, glide):
    # Chin tuck, one drawing so nothing can wobble: the head (down to the chin) slides straight back by `glide` of the
    # face height, eyes level; the neck shears smoothly down to the shoulders, which stay put.
    fh = pa[152, 1] - pa[10, 1]
    dx = (-1 if pa[1, 0] > pa[:, 0].mean() else 1) * glide * fh
    y1, y2 = pa[152, 1] - 0.1 * fh, pa[152, 1] + 0.75 * fh
    w = 1 - smooth((np.arange(H, dtype=np.float32) - y1) / (y2 - y1))
    xs, ys = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    colour = muscle(A, B, pa)

    def frame(t):
        return cv2.remap(colour(t), xs - dx * t * w[:, None], ys, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return frame


# MediaPipe's face outline from one angle of the jaw to the other, through the chin: the jawline. Beside it (ears,
# earlobes, hair) the head reaches down to the level of the jaw angles.
JAW = [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397]


def tilter(A, B, pa, pb, share):
    # Side tilt (ear toward shoulder) of one drawing. The head turns as one piece around the same point as in the
    # exercise drawing (found from the face points; it sits near the chin, where the head turns on the top of the
    # spine), by `share` of its angle, so the face tilts nearly in place instead of sliding. The neck doesn't lean or
    # slide: each point follows the jawline right above it, less and less down to the base of the neck, so the side
    # away from the tilt gets longer (the stretch) and the other side shorter. Only the neck column moves, so the
    # shoulders stay; the stretched side of the neck turns red. frame(-t) tilts the same drawing to the other side
    # (pivot and red side mirrored; the face itself is never flipped).
    fh = pa[152, 1] - pa[10, 1]
    nx, ny = pa[152, 0], pa[152, 1] + 0.45 * fh
    M, _ = cv2.estimateAffinePartial2D(pa, pb)
    theta = float(np.arctan2(M[1, 0], M[0, 0])) * share
    R = M[:, :2] / np.hypot(M[0, 0], M[1, 0])
    cx, cy = np.linalg.solve(np.eye(2) - R, M[:, 2])
    jaw = pa[JAW][np.argsort(pa[JAW][:, 0])]
    xs, ys = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    yj = np.interp(xs[0], jaw[:, 0], jaw[:, 1]).astype(np.float32)[None, :].repeat(H, 0)
    left, right = np.clip((nx - xs) / 40 + 0.5, 0, 1), np.clip((xs - nx) / 40 + 0.5, 0, 1)
    colours = (muscle(A, B, pa, left if theta > 0 else right), muscle(A, B, pa, right if theta > 0 else left))
    pivots = ((cx, cy), (2 * nx - cx, cy))

    def move(x, y, th, px, py):
        # Displacement of the head's rigid turn around (px, py) at (x, y).
        c, s_ = np.cos(th), np.sin(th)
        return (c - 1) * (x - px) - s_ * (y - py), s_ * (x - px) + (c - 1) * (y - py)

    def forward(x, y, th, pivot):
        jy = np.interp(x, xs[0], yj[0])
        below = y - jy
        g = smooth(1 - (np.abs(x - nx) - 0.4 * fh) / (0.25 * fh))
        w = g * (1 - smooth(below / (ny - jy))) + (1 - g) * (1 - smooth(below / (0.25 * fh)))
        w = np.where(below <= 0, 1, w)
        hx, hy = move(x, np.minimum(y, jy), th, *pivot)
        return x + w * hx, y + w * hy

    def frame(t):
        k = 0 if t >= 0 else 1
        sx, sy = xs, ys
        for _ in range(12):
            fx, fy = forward(sx, sy, theta * t, pivots[k])
            sx, sy = sx + 0.8 * (xs - fx), sy + 0.8 * (ys - fy)
        return cv2.remap(colours[k](abs(t)), sx.astype(np.float32), sy.astype(np.float32), cv2.INTER_CUBIC,
                         borderMode=cv2.BORDER_REPLICATE)
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
    settings = SETTINGS.get(args.id, {})
    find = landmarker()
    for guide in [args.guide] if args.guide else ["man", "woman"]:
        folder = os.path.join(GUIDES, guide, "exercises", args.id)
        A = page(os.path.join(folder, "relaxed.webp"))
        B = page(os.path.join(folder, "exercise.webp"))
        try:
            if "glide" in settings:
                frame = glider(A, B, find(A, f"{guide} relaxed"), settings["glide"])
            elif "tongue" in settings:
                frame = tongue(A, B, find(A, f"{guide} relaxed"), settings["tongue"][guide], find, f"{guide} exercise")
            elif "hands" in settings:
                with open(os.path.join(HERE, "hands.json")) as f:
                    spec = json.load(f)[args.id][guide]
                frame = hands.mover(A, B, lambda img, what: find(img, f"{guide} {what}"), spec, morpher,
                                    settings.get("swap", {}).get(guide, hands.SWAP))
            elif "tilt" in settings:
                frame = tilter(A, B, find(A, f"{guide} relaxed"), find(B, f"{guide} exercise"), settings["tilt"])
            else:
                frame = morpher(A, B, find(A, f"{guide} relaxed"), find(B, f"{guide} exercise"), settings.get("sharp", 1.0),
                                gaze=settings.get("gaze", False))
        except NoFace as e:
            print(e)
            stale = os.path.join(VIDEOS, guide, f"{args.id}.mp4")
            if os.path.exists(stale):
                os.remove(stale)
                print(f"removed the old {os.path.relpath(stale, VIDEOS)}")
            continue
        cache = {}
        frames = []
        for t in timeline() + ([-v for v in timeline()] if settings.get("both") else []):
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
