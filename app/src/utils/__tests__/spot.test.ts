import { pointToSpot, spotToPoint } from '../spot';

describe('spot', () => {
  const bounds = { minX: 12, maxX: 212, minY: 60, maxY: 460 };

  it('turns a saved spot into a corner within the bounds and back', () => {
    expect(spotToPoint({ x: 0, y: 0 }, bounds)).toEqual({ x: 12, y: 60 });
    expect(spotToPoint({ x: 1, y: 1 }, bounds)).toEqual({ x: 212, y: 460 });
    expect(spotToPoint({ x: 0.5, y: 0.25 }, bounds)).toEqual({ x: 112, y: 160 });
    expect(pointToSpot({ x: 112, y: 160 }, bounds)).toEqual({ x: 0.5, y: 0.25 });
  });

  it('keeps it on the screen', () => {
    expect(pointToSpot({ x: -50, y: 900 }, bounds)).toEqual({ x: 0, y: 1 });
    expect(spotToPoint({ x: 3, y: -1 }, bounds)).toEqual({ x: 212, y: 60 });
  });

  it('a screen with no room left puts it at the start', () => {
    const tight = { minX: 12, maxX: 4, minY: 60, maxY: 60 };
    expect(spotToPoint({ x: 0.5, y: 0.5 }, tight)).toEqual({ x: 12, y: 60 });
    expect(pointToSpot({ x: 12, y: 60 }, tight)).toEqual({ x: 1, y: 1 });
  });
});
