"""
Side views with a see-through window into the mouth (Mewing, Tongue Press): the face finder finds no face there, and
morphing the window bent everything inside it, while a plain blend showed two tongues at once. The head is the same
in both drawings (the exercise drawing is only lined up onto the relaxed one), and what moves is the tongue: it rises
from the floor of the mouth to press against the palate.

The tongue is cut out of both drawings (its reddish pixels inside a rough outline traced by hand in window.json), and
the window is filled where it was, from the other drawing, so what lies behind the tongue shows once. Points along
the two tongue outlines are paired from the tip (upper surface with upper surface, underside with underside), and one
tongue changes from the one outline to the other (a smooth spline bends the inside along), the exercise tongue's red
spreading from the tip back. Everything else is lined up pixel by pixel and blended (it mostly changes colour: the
muscles turn red).
"""
import cv2
import numpy as np

# Points along each tongue outline; fill and cut-out margins (px); share of the move over which the first and last
# frames turn into the drawings as they are.
POINTS, MARGIN, EDGE, ENDS = 64, 6, 3, 0.08


def smooth(v):
    v = np.clip(v, 0, 1)
    return v * v * (3 - 2 * v)


def grow(m, r):
    return cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1)))


def tongue(img, rough, back, exact=False):
    # The tongue: reddish pixels inside the rough outline, holes and gaps closed. Returns its outline and its filled
    # mask. The outline runs from the tip (the point nearest the rough outline's first point) to the back end (nearest
    # `back`) one way and back the other, POINTS / 2 points evenly along each half, always turning the same way: so
    # the upper surface of one tongue is paired with the upper surface of the other, and the underside (on the floor
    # of the mouth) with the underside.
    H, W = img.shape[:2]
    inside = np.zeros((H, W), np.uint8)
    cv2.fillPoly(inside, [np.int32(rough)], 255)
    if exact:
        # The whole window is pinkish (her Tongue Press): the outline is traced exactly and used as it is.
        m = cv2.GaussianBlur(inside, (0, 0), 2)
        m = (m > 127).astype(np.uint8) * 255
    else:
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
        red = (lab[..., 1] - 128 > 4).astype(np.uint8) * 255
        m = cv2.morphologyEx(red & grow(inside, 4), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17)))
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    c = max(cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], key=cv2.contourArea)[:, 0].astype(np.float32)
    if cv2.contourArea(c, oriented=True) < 0:
        c = c[::-1]
    c = np.roll(c, -int(np.argmin(np.linalg.norm(c - np.float32(rough[0]), axis=1))), 0)
    k = int(np.argmin(np.linalg.norm(c - np.float32(back), axis=1)))
    halves = []
    for part in (c[:k + 1], np.vstack([c[k:], c[:1]])):
        s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(part, axis=0), axis=1))])
        u = np.linspace(0, s[-1], POINTS // 2, endpoint=False)
        halves.append(np.stack([np.interp(u, s, part[:, 0]), np.interp(u, s, part[:, 1])], 1))
    mask = np.zeros((H, W), np.uint8)
    cv2.fillPoly(mask, [np.int32(np.round(c))], 255)
    return np.vstack(halves), mask


def spline(src, dst, box):
    # Thin-plate spline through the point pairs, as a backward map over box (x0, y0, x1, y1): for each pixel near the
    # dst outline, where it comes from near the src outline.
    n = len(src)
    kernel = lambda r: np.where(r > 0, r * r * np.log(r + 1e-9), 0)
    L = np.zeros((n + 3, n + 3))
    L[:n, :n] = kernel(np.linalg.norm(dst[:, None] - dst[None], axis=2)) + 1e-3 * np.eye(n)
    L[:n, n:] = np.hstack([np.ones((n, 1)), dst])
    L[n:, :n] = L[:n, n:].T
    sol = np.linalg.solve(L, np.vstack([src, np.zeros((3, 2))]))
    x0, y0, x1, y1 = box
    gx, gy = np.meshgrid(np.arange(x0, x1, dtype=np.float64), np.arange(y0, y1, dtype=np.float64))
    q = np.stack([gx.ravel(), gy.ravel()], 1)
    m = kernel(np.linalg.norm(q[:, None] - dst[None], axis=2)) @ sol[:n] + sol[n] + q @ sol[n + 1:]
    return m[:, 0].reshape(gx.shape).astype(np.float32), m[:, 1].reshape(gx.shape).astype(np.float32)


def plate(img, mine, other, theirs):
    # img without its tongue: filled from the other drawing. Where the other drawing has its tongue too (the back of
    # the tongue, resting on the floor of the mouth in both), nothing shows what is behind it, so img keeps its own
    # tongue there (filled in from around, it showed as a grey smudge where the moving tongue left a strip open).
    hole = grow(mine, MARGIN)
    both = cv2.GaussianBlur(((hole > 0) & (grow(theirs, MARGIN) > 0)).astype(np.float32), (0, 0), 3)[..., None]
    out = img.copy()
    out[hole > 0] = other[hole > 0]
    return (out * (1 - both) + img * both).astype(np.uint8)


def mover(A, B, spec):
    # B: the exercise drawing as lined up onto the relaxed one (make.lineup; the man's head sits about 10 px to the
    # side). spec: the tongue, or {"pieces": [...]} for several parts that move (his Tongue Press: the muscle band under
    # the tongue turns from flat to slanting, and blended in place it showed twice), drawn in that order. Each:
    # {"relaxed": rough outline, "exercise": rough outline, "back": [back end in relaxed, in exercise]} in page pixels,
    # tip first (the exercise drawing as lined up); "exact": true when the outlines are traced exactly and used as they
    # are, not refined by colour.
    H, W = A.shape[:2]
    gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    soft = lambda m: cv2.GaussianBlur(grow(m, EDGE).astype(np.float32) / 255, (0, 0), 1.2)
    pieces = []
    for p in spec.get("pieces", [spec]):
        exact = p.get("exact", False)
        ta, ma = tongue(A, p["relaxed"], p["back"][0], exact)
        tb, mb = tongue(B, p["exercise"], p["back"][1], exact)
        ys, xs = np.nonzero(grow(np.maximum(ma, mb), 30))
        # How far each pixel of the relaxed piece is from its tip, as a share of its length: the exercise piece's
        # look (its red and its fibres) takes over from the tip back, so the two never show at once (blended, the
        # fibre lines of both showed).
        along = np.hypot(gx - ta[0, 0], gy - ta[0, 1])
        along /= max(float(along[ma > 0].max()), 1.0)
        pieces.append(dict(ta=ta, tb=tb, ma=ma, mb=mb, aa=soft(ma), ab=soft(mb), along=along,
                           box=(int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)))
    ma = np.max([p["ma"] for p in pieces], 0)
    mb = np.max([p["mb"] for p in pieces], 0)
    pa, pb = plate(A, ma, B, mb), plate(B, mb, A, ma)
    hold = cv2.GaussianBlur(grow(np.maximum(ma, mb), 10).astype(np.float32) / 255, (0, 0), 3)[..., None]
    # The rest of the two drawings is lined up pixel by pixel and both move to meet (the teeth are drawn from a
    # slightly different angle in her exercise drawing; blended in place, they showed twice).
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    g1, g2 = (cv2.cvtColor(p, cv2.COLOR_BGR2GRAY) for p in (pa, pb))
    f, g = np.nan_to_num(dis.calc(g1, g2, None)), np.nan_to_num(dis.calc(g2, g1, None))

    def frame(t):
        wa = cv2.remap(pa, gx + t * g[..., 0], gy + t * g[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        wb = cv2.remap(pb, gx + (1 - t) * f[..., 0], gy + (1 - t) * f[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        out = (1 - t) * wa.astype(np.float32) + t * wb.astype(np.float32)
        for p in pieces:
            x0, y0, x1, y1 = p["box"]
            pts = (1 - t) * p["ta"] + t * p["tb"]
            layers = []
            for img, alpha, src in ((A, p["aa"], p["ta"]), (B, p["ab"], p["tb"])):
                mx, my = spline(src, pts, p["box"])
                layers.append((cv2.remap(img.astype(np.float32), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE),
                               cv2.remap(alpha, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)[..., None], mx, my))
            pos = cv2.remap(p["along"], layers[0][2], layers[0][3], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)[..., None]
            wipe = smooth((1.3 * t - pos) / 0.3)
            (ia, la, _, _), (ib, lb, _, _) = layers
            cover = np.clip((1 - wipe) * la + wipe * lb, 0, 1)
            colour = ((1 - wipe) * ia * la + wipe * ib * lb) / np.maximum(cover, 1e-3)
            out[y0:y1, x0:x1] = out[y0:y1, x0:x1] * (1 - cover) + colour * cover
        for img, k in ((A, 1 - smooth(t / ENDS)), (B, 1 - smooth((1 - t) / ENDS))):
            if k > 0:
                out = out * (1 - k * hold) + img.astype(np.float32) * (k * hold)
        return np.clip(out, 0, 255).astype(np.uint8)
    return frame
