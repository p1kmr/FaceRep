"""
Face map pictures: the app's face map (tap an area of the face to see its muscles and exercises; today's areas lit on
Today). Made from the app's own drawings, like the clips: no AI.

For each guide:
  base.webp     one relaxed front drawing (BASE), in grey.
  <area>.webp   that area's red muscle shading, taken from the exercise drawings that train it (SOURCES), moved onto
                the base face with the face points (the face finder of make.py) and drawn as a red tint of the base's
                own pencil lines, so only the base face shows. Cut to the area's box; transparent around the shading.
  areas.json    per area its box in the base and its outline for tapping, as shares of the base's width and height.

    .venv/bin/python facemap.py                       -> app/assets/guides/<man|woman>/map/
    .venv/bin/python facemap.py --preview /tmp/map    -> also a contact sheet per guide there (not in the repo)

Then `npm run images` in app/ (it lists the map pictures for the app).
"""
import argparse
import json
import os

import cv2
import numpy as np

from make import GUIDES, H, INNER, W, landmarker, page, reds

# Per guide: a relaxed front drawing, neutral, neck in the picture, with the least red of its own (every relaxed drawing
# shows its muscle faintly; here it is a thin line by the mouth or a tint on the lids, which pass for pencil in grey).
BASE = {"man": "20-lip-corner-lift", "woman": "16-wide-eyes"}
# Area -> the exercise drawings (front views) whose red shading shows it.
SOURCES = {
    "forehead": ["09-brow-lift"],
    "temples": ["27-temple-circles"],
    "eyes": ["10-eye-squeeze", "16-wide-eyes"],
    "cheeks": ["06-cheek-lift", "07-fish-face"],
    "lips": ["18-lip-press"],
    "jaw": ["01-jaw-clench"],
    "chin": ["19-pout"],
    "neck": ["15-lion-face"],
}
# MediaPipe's face outline and outer lip line (point indices).
FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176,
             149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
OUTER_LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185]
# Face points used for the warp: the 468 mesh points (the iris points move with the lids, see make.py).
MESH = 468


def drawing_rows(guide):
    # Where make.py's page() puts the base drawing: the rows of the 720 x 1280 page that hold it.
    folder = os.path.join(GUIDES, guide, "exercises", BASE[guide])
    img = cv2.imread(os.path.join(folder, "relaxed.webp"))
    h = round(img.shape[0] * W / img.shape[1])
    top = (H - h) // 2
    return top, top + h


def triangles(points, shape):
    # Delaunay triangles of the points (indices), covering the whole picture.
    h, w = shape
    sub = cv2.Subdiv2D((0, 0, w, h))
    index = {}
    for i, (x, y) in enumerate(points):
        x, y = float(np.clip(x, 0, w - 1)), float(np.clip(y, 0, h - 1))
        index.setdefault((round(x, 3), round(y, 3)), i)
        sub.insert((x, y))
    out = []
    for t in sub.getTriangleList():
        corners = [index.get((round(float(t[k]), 3), round(float(t[k + 1]), 3))) for k in (0, 2, 4)]
        if None not in corners and len(set(corners)) == 3:
            out.append(corners)
    return np.array(out, dtype=np.int32)


def warp_map(base_pts, src_pts, shape):
    # Backward map base -> source: piecewise affine over the face points, a similarity transform outside them (the
    # border points follow it, so every pixel is in a triangle).
    h, w = shape
    M, _ = cv2.estimateAffinePartial2D(base_pts, src_pts)
    xs, ys = np.linspace(0, w - 1, 6), np.linspace(0, h - 1, 9)
    border = np.float32([[x, y] for x in xs for y in ys if x in (xs[0], xs[-1]) or y in (ys[0], ys[-1])])
    bp = np.vstack([base_pts, border])
    sp = np.vstack([src_pts, cv2.transform(border[None], M)[0]])
    tris = triangles(bp, shape)
    label = np.full((h, w), -1, np.int32)
    affines = np.zeros((len(tris), 2, 3), np.float32)
    for k, (a, b, c) in enumerate(tris):
        affines[k] = cv2.getAffineTransform(bp[[a, b, c]].astype(np.float32), sp[[a, b, c]].astype(np.float32))
        cv2.fillConvexPoly(label, np.int32(np.round(bp[[a, b, c]])), k)
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    A = np.where((label >= 0)[..., None, None], affines[np.maximum(label, 0)], M.astype(np.float32))
    mx = A[..., 0, 0] * gx + A[..., 0, 1] * gy + A[..., 0, 2]
    my = A[..., 1, 0] * gx + A[..., 1, 1] * gy + A[..., 1, 2]
    return mx.astype(np.float32), my.astype(np.float32)


def polygon_mask(points, shape, grow=0):
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.int32(np.round(points))], 255)
    if grow:
        m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * grow + 1, 2 * grow + 1)))
    return m > 0


def redness(img, floor=10, full=55):
    # How red each pixel is, 0-1, rising slowly so the fibre strokes of the shading show (make.py's reds() is 1 for
    # any clear red). floor/full: the colour strength (LAB chroma) where it starts and where it is full.
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    chroma = np.hypot(lab[..., 1] - 128, lab[..., 2] - 128)
    return np.clip((chroma - floor) / (full - floor), 0, 1) ** 0.9 * (lab[..., 1] > 132)


def without_tongue(red, pts):
    # The neck comes from Lion Face, whose tongue is out and pinkish: the red patch that reaches into the open mouth goes.
    mouth = polygon_mask(pts[INNER], red.shape, grow=6)
    n, lab = cv2.connectedComponents((red > 0.05).astype(np.uint8))
    touching = set(np.unique(lab[mouth & (lab > 0)]).tolist())
    return red * ~np.isin(lab, list(touching))


def grey(img):
    return cv2.cvtColor(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR)


def tidy(mask, min_area=250):
    # Soft edges, no specks: small separate bits are dropped.
    mask = cv2.GaussianBlur(mask, (0, 0), 1.2)
    mask[mask < 0.06] = 0
    n, lab, stats, _ = cv2.connectedComponentsWithStats((mask > 0.2).astype(np.uint8))
    keep = np.zeros(mask.shape, bool)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            keep |= lab == i
    keep = cv2.dilate(keep.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    return mask * keep


def tint_colour(guide):
    # The drawings' red: the mean colour of strongly red pixels over the paper-white around them, per channel.
    samples = []
    for id in ("01-jaw-clench", "06-cheek-lift", "09-brow-lift", "18-lip-press"):
        img = cv2.imread(os.path.join(GUIDES, guide, "exercises", id, "exercise.webp"))
        r = reds(img)
        samples.append(img[r > 0.95].astype(np.float32))
    pixels = np.vstack(samples)
    tint = np.clip(np.median(pixels, axis=0) / 235.0, 0, 1)
    # A little deeper where the drawings' red is pale (hers), so a lit area reads on a small screen.
    tint[:2] = np.minimum(tint[:2], 0.4)
    return tint


def make_guide(guide, find, preview=None):
    folder = os.path.join(GUIDES, guide, "exercises")
    out_dir = os.path.join(GUIDES, guide, "map")
    os.makedirs(out_dir, exist_ok=True)
    y0, y1 = drawing_rows(guide)
    base_page = page(os.path.join(folder, BASE[guide], "relaxed.webp"))
    base_pts = find(base_page, f"{guide} base")
    shape = base_page.shape[:2]
    plain = grey(base_page)
    tint = tint_colour(guide)
    tinted = np.clip(plain.astype(np.float32) * tint, 0, 255)

    face = polygon_mask(base_pts[FACE_OVAL], shape)
    lips = polygon_mask(base_pts[OUTER_LIPS], shape, grow=7)
    below_lips = np.arange(shape[0])[:, None] > base_pts[OUTER_LIPS, 1].max() - 2

    layers = {}
    for area, ids in SOURCES.items():
        mask = np.zeros(shape, np.float32)
        for id in ids:
            src = page(os.path.join(folder, id, "exercise.webp"))
            pts = find(src, f"{guide} {id}")
            mx, my = warp_map(base_pts[:MESH], pts[:MESH], shape)
            red = redness(src)
            if area == "neck":
                red = without_tongue(red, pts)
            red = cv2.GaussianBlur(red.astype(np.float32), (0, 0), 0.6)
            mask = np.maximum(mask, cv2.remap(red, mx, my, cv2.INTER_LINEAR, borderValue=0))
        if area == "chin":
            mask *= ~lips & below_lips
        elif area == "neck":
            mask *= ~polygon_mask(base_pts[FACE_OVAL], shape, grow=4)
        elif area in ("lips",):
            mask *= polygon_mask(base_pts[OUTER_LIPS], shape, grow=14)
        elif area in ("cheeks", "jaw", "eyes", "forehead", "temples"):
            # Only on the head: stray red on the neck or the hands of a hands-on drawing doesn't belong to the area.
            mask *= polygon_mask(base_pts[FACE_OVAL], shape, grow=40)
        layers[area] = tidy(np.clip(mask, 0, 1)) * 0.95

    areas = {}
    w, h = shape[1], y1 - y0
    for area, mask in layers.items():
        mask = mask[y0:y1]
        ys, xs = np.nonzero(mask > 0.02)
        if not len(xs):
            raise SystemExit(f"{guide}: no red found for {area}")
        bx0, by0 = max(int(xs.min()) - 4, 0), max(int(ys.min()) - 4, 0)
        bx1, by1 = min(int(xs.max()) + 5, w), min(int(ys.max()) + 5, h)
        rgba = np.dstack([tinted[y0:y1][by0:by1, bx0:bx1], mask[by0:by1, bx0:bx1] * 255]).round().astype(np.uint8)
        cv2.imwrite(os.path.join(out_dir, f"{area}.webp"), rgba, [cv2.IMWRITE_WEBP_QUALITY, 88])
        contours, _ = cv2.findContours((mask > 0.25).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        shapes = []
        for c in sorted(contours, key=cv2.contourArea, reverse=True):
            if cv2.contourArea(c) < 300:
                continue
            hull = cv2.convexHull(cv2.approxPolyDP(c, 3, True))[:, 0]
            shapes.append([[round(float(x) / w, 4), round(float(y) / h, 4)] for x, y in hull])
        areas[area] = {"box": [round(bx0 / w, 4), round(by0 / h, 4), round((bx1 - bx0) / w, 4), round((by1 - by0) / h, 4)],
                       "shapes": shapes}
    cv2.imwrite(os.path.join(out_dir, "base.webp"), plain[y0:y1], [cv2.IMWRITE_WEBP_QUALITY, 86])
    with open(os.path.join(out_dir, "areas.json"), "w") as f:
        json.dump({"width": w, "height": h, "areas": areas}, f, indent=1)
        f.write("\n")
    print(f"{guide}: base {w}x{h}, " + ", ".join(f"{a} {os.path.getsize(os.path.join(out_dir, a + '.webp')) // 1024} KB" for a in layers))

    if preview:
        os.makedirs(preview, exist_ok=True)
        tiles = []
        for area, mask in layers.items():
            m = mask[y0:y1, ..., None]
            tiles.append((plain[y0:y1] * (1 - m) + tinted[y0:y1] * m).astype(np.uint8))
        all_m = np.max(np.stack(list(layers.values())), 0)[y0:y1, ..., None]
        tiles.append((plain[y0:y1] * (1 - all_m) + tinted[y0:y1] * all_m).astype(np.uint8))
        small = [cv2.resize(t, (240, round(240 * h / w))) for t in tiles]
        rows = [np.hstack(small[i:i + 5] + [np.full_like(small[0], 255)] * (5 - len(small[i:i + 5]))) for i in range(0, len(small), 5)]
        cv2.imwrite(os.path.join(preview, f"{guide}-map.jpg"), np.vstack(rows))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--guide", choices=["man", "woman"])
    ap.add_argument("--preview")
    args = ap.parse_args()
    find = landmarker()
    for guide in [args.guide] if args.guide else ["man", "woman"]:
        make_guide(guide, find, args.preview)
    find.close()


if __name__ == "__main__":
    main()
