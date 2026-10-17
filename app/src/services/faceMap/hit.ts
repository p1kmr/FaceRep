import { FACE_AREAS, type FaceArea, type FaceMapLayout } from '@/constants/faceMap';

/** How far (in the picture's pixels) a tap may miss an area's outline and still pick it. */
export const TAP_REACH_PX = 28;

function inside(shape: readonly [number, number][], x: number, y: number): boolean {
  let hit = false;
  for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
    const [xi, yi] = shape[i];
    const [xj, yj] = shape[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Distance from (x, y) to the segment a–b. */
function toSegment(x: number, y: number, [ax, ay]: [number, number], [bx, by]: [number, number]): number {
  const dx = bx - ax;
  const dy = by - ay;
  const t = dx || dy ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
}

/**
 * The area under a tap at (x, y), given as shares (0–1) of the picture's width and height. Inside an outline wins (the
 * smallest area when outlines overlap, e.g. the chin inside the neck's reach); otherwise the nearest outline within
 * TAP_REACH_PX; otherwise null.
 */
export function areaAt(layout: FaceMapLayout, x: number, y: number): FaceArea | null {
  const px = (p: [number, number]): [number, number] => [p[0] * layout.width, p[1] * layout.height];
  const [tx, ty] = px([x, y]);
  let best: { area: FaceArea; size: number } | null = null;
  let near: { area: FaceArea; distance: number } | null = null;
  for (const area of FACE_AREAS) {
    const { box, shapes } = layout.areas[area];
    for (const shape of shapes) {
      const points = shape.map(px);
      if (inside(points, tx, ty)) {
        const size = box[2] * box[3];
        if (!best || size < best.size) best = { area, size };
      }
      for (let i = 0; i < points.length; i++) {
        const distance = toSegment(tx, ty, points[i], points[(i + 1) % points.length]);
        if (!near || distance < near.distance) near = { area, distance };
      }
    }
  }
  if (best) return best.area;
  return near && near.distance <= TAP_REACH_PX ? near.area : null;
}
