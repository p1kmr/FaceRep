/** Where a dragged box may go on the screen: its top-left corner from min to max. */
export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** A spot saved as fractions of the free space (0–1), so it fits any screen size. */
export interface Spot {
  x: number;
  y: number;
}

const within = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/** The top-left corner for a saved spot. */
export function spotToPoint(spot: Spot, b: Bounds): Spot {
  return { x: within(b.minX + spot.x * (b.maxX - b.minX), b.minX, b.maxX), y: within(b.minY + spot.y * (b.maxY - b.minY), b.minY, b.maxY) };
}

/** The spot to save for a top-left corner (a screen with no room left counts as the far end). */
export function pointToSpot(point: Spot, b: Bounds): Spot {
  const share = (v: number, min: number, max: number) => (max > min ? within((v - min) / (max - min), 0, 1) : 1);
  return { x: share(point.x, b.minX, b.maxX), y: share(point.y, b.minY, b.maxY) };
}
