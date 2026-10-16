"""
Hands that move (Frown Release: from between the brows to the temples). The face morph can't move a hand: it only
blends the two drawings, so both pairs of hands showed at once, see-through. Here the hands are cut out of both
drawings along outlines traced by hand (hands.json), the face is morphed without them, and each hand moves on top as
one solid piece: the relaxed drawing's hand turns and slides (fingertip first) to where the exercise drawing's hand
is, and on the last part of the way it turns into that hand, both lined up pixel by pixel so no line shows twice.

Behind a hand, each drawing is filled from the other one (the face moved into this face's shape, grey, with the
skin tone matched); where both drawings have a hand, nothing shows what is behind it, so that bit is filled in from
around it. The moving hand covers it almost all the time.
"""
import cv2
import numpy as np

# Room around the page for hands that reach past its edge (the arms).
PAD = 300
# A hand is lined up on its fingers: the part within this distance of the fingertip (px).
REACH = 260
# The relaxed drawing's hand turns into the exercise drawing's: start and length, as shares of the move.
SWAP = (0.55, 0.4)
# Behind a hand the face is filled this much wider than the hand (px): the drawings shade the skin right beside the
# fingers, and that shade outlined where the fingers had been. It fades as the hand leaves and comes back as the
# other hand arrives (FADE: share of the move), so the first and last frames are the drawings as they are.
RIM, FADE = 6, 0.12


def smooth(v):
    v = np.clip(v, 0, 1)
    return v * v * (3 - 2 * v)


def grow(m, r):
    return cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1)))


def densify(outline, step=2.0):
    outline = np.float32(outline)
    out = []
    for i in range(len(outline)):
        p, q = outline[i], outline[(i + 1) % len(outline)]
        n = max(1, int(np.ceil(np.linalg.norm(q - p) / step)))
        out += [p + (q - p) * k / n for k in range(n)]
    return np.float32(out)


def snap(img, outline, reach=4, far=16):
    # The traced outline is rough; each point moves onto the drawing's own edge along the outline's normal. Where white
    # page lies just outside, the hand ends where the white begins (up to `far` px out: the silhouette, not a crease
    # inside the hand; white means 12 px of it, not a gap between strands of hair); elsewhere (on the face) on the
    # darkest line within `reach`. Then smoothed along the outline.
    H, W = img.shape[:2]
    g = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 1.0)
    pts = densify(outline)
    n = len(pts)
    area = 0.5 * np.sum(pts[:, 0] * np.roll(pts[:, 1], -1) - np.roll(pts[:, 0], -1) * pts[:, 1])
    tang = np.roll(pts, -2, 0) - np.roll(pts, 2, 0)
    nrm = np.stack([tang[:, 1], -tang[:, 0]], 1) * (1 if area > 0 else -1)
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-6
    ks = np.arange(-far, far + 13, dtype=np.float32)
    near = np.abs(ks) <= reach
    off = np.full(n, np.nan, np.float32)
    for i, p in enumerate(pts):
        if p[0] < 1 or p[0] > W - 2:
            off[i] = 0
            continue
        q = p[None] + ks[:, None] * nrm[i][None]
        v = cv2.remap(g, q[:, 0:1], q[:, 1:2], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)[:, 0]
        for j in np.flatnonzero(ks >= -reach)[:-12]:
            if (v[j:j + 5] > 236).all() and (v[j:j + 12] > 225).mean() > 0.9:
                if ks[j] <= far:
                    off[i] = ks[j]
                break
        if np.isnan(off[i]):
            j = int(np.argmin(np.where(near, v, 1e9)))
            if v[j] < np.median(v[near]) - 10:
                off[i] = ks[j]
    idx = np.arange(n)
    good = ~np.isnan(off)
    off = np.interp(idx, idx[good], off[good], period=n).astype(np.float32)
    k = 7
    ring = np.concatenate([off[-k:], off, off[:k]])
    off = np.float32([np.median(ring[i:i + 2 * k + 1]) for i in range(n)])
    off = cv2.GaussianBlur(np.concatenate([off[-10:], off, off[:10]])[None], (0, 0), 2.0)[0, 10:-10]
    return pts + off[:, None] * nrm


def cutout(img, outline):
    # One hand as a soft mask (0-255). The snapped outline runs along the middle of the drawn line; the hand takes
    # the whole line.
    m = np.zeros(img.shape[:2], np.uint8)
    cv2.fillPoly(m, [np.int32(np.round(snap(img, outline) * 16))], 255, cv2.LINE_AA, 4)
    return cv2.GaussianBlur(grow(m, 2), (0, 0), 0.8)


def similarity(tip_a, tip_b, angle, scale):
    # Turn by `angle` and scale around tip_a, then move tip_a to tip_b.
    c, s = np.cos(angle) * scale, np.sin(angle) * scale
    R = np.float32([[c, -s], [s, c]])
    return np.hstack([R, (tip_b - R @ tip_a)[:, None]]).astype(np.float32)


def compose(m2, m1):
    # m2 after m1.
    return (np.vstack([m2, [0, 0, 1]]) @ np.vstack([m1, [0, 0, 1]]))[:2].astype(np.float32)


def fit(ma, mb, tip_a, tip_b):
    # The turn and size that lay the relaxed hand best on the exercise hand (fingertip on fingertip), judged on the
    # fingers and the fist: overlap of the two masks near the fingertip.
    H, W = mb.shape[:2]
    xs, ys = np.meshgrid(np.arange(W), np.arange(H))
    near = np.hypot(xs - (tip_b[0] - PAD), ys - (tip_b[1] - PAD)) < REACH
    b = mb > 127
    best = (-1, 0.0, 1.0)
    for scale in np.arange(0.9, 1.0801, 0.02):
        for angle in np.radians(np.arange(-40, 40.1, 0.5)):
            a = cv2.warpAffine(ma, similarity(tip_a, tip_b, angle, scale), (W + 2 * PAD, H + 2 * PAD))
            a = a[PAD:PAD + H, PAD:PAD + W] > 127
            iou = (a & b & near).sum() / max(1, ((a | b) & near).sum())
            if iou > best[0]:
                best = (iou, angle, scale)
    return best[1], best[2]


def plate(img, hole, fill, others, face):
    # img without its hands (hole): filled with `fill` (the other drawing here), grey, its tone matched to the skin
    # around the hole (on the face only: beside it the page is white in both, and edges a few px apart smeared grey).
    # Where the other drawing has a hand too (others), filled in from around it.
    fill = cv2.cvtColor(cv2.cvtColor(np.clip(fill, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR)
    fill = fill.astype(np.float32)
    bad = grow((others > 20).astype(np.uint8) * 255, 8)
    valid = ((grow(hole, 3) == 0) & (bad == 0)).astype(np.float32)[..., None]
    diff = (img.astype(np.float32) - fill) * valid
    sig = 18
    near = cv2.GaussianBlur(valid, (0, 0), sig)[..., None]
    off = cv2.GaussianBlur(diff, (0, 0), sig) / np.maximum(near, 1e-3)
    far = cv2.GaussianBlur(diff, (0, 0), 3 * sig) / np.maximum(cv2.GaussianBlur(valid, (0, 0), 3 * sig)[..., None], 1e-3)
    w = np.clip(near * 4, 0, 1)
    fill = np.clip(fill + np.clip(w * off + (1 - w) * far, -40, 40) * face, 0, 255)
    soft = hole.astype(np.float32)[..., None] / 255
    out = (img * (1 - soft) + fill * soft).astype(np.uint8)
    both = ((hole > 127) & (bad > 0)).astype(np.uint8) * 255
    return cv2.inpaint(out, both, 7, cv2.INPAINT_TELEA)


def mover(A, B, find, spec, morpher, swap=SWAP):
    # spec: one entry per hand, {"relaxed": outline, "exercise": outline} in page pixels; each outline starts at the
    # fingertip. find(img, what): the face finder; morpher: make.morpher (the face morph). swap: see SWAP.
    H, W = A.shape[:2]
    P = PAD
    pad = lambda im: cv2.copyMakeBorder(im, P, P, P, P, cv2.BORDER_REPLICATE)
    gx, gy = np.meshgrid(np.arange(W + 2 * P, dtype=np.float32), np.arange(H + 2 * P, dtype=np.float32))
    size = (W + 2 * P, H + 2 * P)
    white = lambda im, m: (im * (m[..., None] / 255.0) + 255 * (1 - m[..., None] / 255.0)).astype(np.uint8)
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)

    hands = []
    for h in spec:
        ma, mb = cutout(A, h["relaxed"]), cutout(B, h["exercise"])
        tip_a, tip_b = np.float32(h["relaxed"][0]) + P, np.float32(h["exercise"][0]) + P
        angle, scale = fit(pad(ma), mb, tip_a, tip_b)
        T = similarity(tip_a, tip_b, angle, scale)
        # In the exercise drawing's place: the relaxed hand moved there (A2) and matched pixel by pixel to the
        # exercise hand (g: from the exercise hand into A2, f: the other way).
        A2 = cv2.warpAffine(pad(A), T, size, flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        mA2 = cv2.warpAffine(pad(ma), T, size, flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        Bp, mBp = pad(B), pad(mb)
        ga, gb = (cv2.cvtColor(white(im, m), cv2.COLOR_BGR2GRAY) for im, m in ((A2, mA2), (Bp, mBp)))
        f, g = np.nan_to_num(dis.calc(ga, gb, None)), np.nan_to_num(dis.calc(gb, ga, None))
        hands.append(dict(ma=ma, mb=mb, tip_a=tip_a, tip_b=tip_b, angle=angle, scale=scale, T=T, A2=A2, mA2=mA2,
                          Bp=Bp, mBp=mBp, f=f, g=g))

    # The face without hands, morphed as usual. The other drawing is moved into this face's shape on the face only
    # (beside it the page is the same in both drawings, and moving it there dragged the other hand's edge in). Under a
    # hand the face finder guesses (it put her brows on the fingers that cover them, so the brows showed twice); the
    # face points are found again on each drawing with its hands taken out and filled from the other drawing as it
    # lies on the page.
    ma_all = np.max([h["ma"] for h in hands], 0)
    mb_all = np.max([h["mb"] for h in hands], 0)

    def hull(p):
        m = np.zeros((H, W), np.uint8)
        cv2.fillConvexPoly(m, cv2.convexHull(np.int32(p[:468])), 255)
        return cv2.GaussianBlur(cv2.dilate(m, np.ones((15, 15), np.uint8)).astype(np.float32) / 255, (0, 0), 10)[..., None]

    def moved(to, img, others, face):
        on_face = face * np.clip(to(img.astype(np.float32)), 0, 255) + (1 - face) * img
        there = to(np.dstack([others] * 3))[..., 0]
        bad = np.maximum(np.where(face[..., 0] > 0.01, there, 0), np.where(face[..., 0] < 0.99, others, 0))
        return on_face, bad

    pa, pb = find(A, "relaxed"), find(B, "exercise")
    pa = find(plate(A, ma_all, B, mb_all, hull(pa)), "relaxed without hands")
    pb = find(plate(B, mb_all, A, ma_all, hull(pb)), "exercise without hands")
    face_a, face_b = hull(pa), hull(pb)
    fill_a, bad_a = moved(morpher(B, A, pb, pa, 1.0).to_b, B, mb_all, face_a)
    fill_b, bad_b = moved(morpher(A, B, pa, pb, 1.0).to_b, A, ma_all, face_b)
    hole_a, hole_b = (cv2.GaussianBlur(grow(m, RIM), (0, 0), 1.5) for m in (ma_all, mb_all))
    face = morpher(plate(A, hole_a, fill_a, bad_a, face_a), plate(B, hole_b, fill_b, bad_b, face_b), pa, pb, 1.0)
    rim_a, rim_b = (np.clip(h.astype(np.float32) - m, 0, 255)[..., None] / 255 for h, m in ((hole_a, ma_all), (hole_b, mb_all)))

    # Where the exercise hand runs off its page, its edge (moved inward on the way) shows the relaxed hand instead.
    page = np.zeros((H + 2 * P, W + 2 * P), np.float32)
    page[P:P + H, P:P + W] = 1
    page = cv2.GaussianBlur(cv2.erode(page, np.ones((9, 9), np.uint8)), (0, 0), 3)
    crop = np.float32([[1, 0, -P], [0, 1, -P]])

    def frame(t):
        out = face(t).astype(np.float32)
        for img, rim, k in ((A, rim_a, 1 - smooth(t / FADE)), (B, rim_b, 1 - smooth((1 - t) / FADE))):
            if k > 0:
                out = out * (1 - k * rim) + img * (k * rim)
        a = float(smooth((t - swap[0]) / swap[1]))
        for h in hands:
            # The pose at t: fingertip on the straight way between the two, turn and size in proportion; the hand
            # images are made in the exercise hand's place and moved from there.
            pose = similarity(h["tip_a"], h["tip_a"] + t * (h["tip_b"] - h["tip_a"]), t * h["angle"], 1 + t * (h["scale"] - 1))
            M = compose(crop, compose(pose, cv2.invertAffineTransform(h["T"])))
            layers = []
            if a < 1:
                fx, fy = gx + a * h["g"][..., 0], gy + a * h["g"][..., 1]
                layers.append([1 - a, cv2.remap(h["A2"], fx, fy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE),
                               cv2.remap(h["mA2"], fx, fy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)])
            if a > 0:
                fx, fy = gx + (1 - a) * h["f"][..., 0], gy + (1 - a) * h["f"][..., 1]
                layers.append([a, cv2.remap(h["Bp"], fx, fy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE),
                               cv2.remap(h["mBp"], fx, fy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)])
            for layer in layers:
                layer[1] = cv2.warpAffine(layer[1].astype(np.float32), M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
                layer[2] = cv2.warpAffine(layer[2].astype(np.float32) / 255, M, (W, H), flags=cv2.INTER_LINEAR,
                                          borderMode=cv2.BORDER_REPLICATE)[..., None]
            if len(layers) == 2:
                inside = cv2.warpAffine(page, M, (W, H), flags=cv2.INTER_LINEAR)[..., None]
                inside = inside + (1 - inside) * float(smooth((a - 0.85) / 0.15))
                layers[1][0] = a * inside
                layers[0][0] = 1 - layers[1][0]
            pre = sum(w * img * m for w, img, m in layers)
            alpha = sum(w * m for w, img, m in layers)
            out = out * (1 - alpha) + pre
        return np.clip(out, 0, 255).astype(np.uint8)
    return frame
