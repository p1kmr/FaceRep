import { THEMES } from '@/constants/theme';

import { splitAlpha } from '../color';

describe('splitAlpha', () => {
  it("moves an rgba() color's alpha out of the color", () => {
    expect(splitAlpha('rgba(253, 253, 253, 0)')).toEqual({ color: 'rgb(253, 253, 253)', opacity: 0 });
    expect(splitAlpha('rgba(229,50,45,0.3)')).toEqual({ color: 'rgb(229, 50, 45)', opacity: 0.3 });
  });

  it('reads the alpha of an 8-digit hex color', () => {
    expect(splitAlpha('#E5322D80')).toEqual({ color: '#E5322D', opacity: 128 / 255 });
  });

  it('keeps opaque colors as they are', () => {
    expect(splitAlpha('#FDFDFD')).toEqual({ color: '#FDFDFD', opacity: 1 });
    expect(splitAlpha('rgb(1, 2, 3)')).toEqual({ color: 'rgb(1, 2, 3)', opacity: 1 });
  });

  it("splits every see-through color of the themes, and plateFade is the plate's color, clear", () => {
    for (const theme of Object.values(THEMES)) {
      for (const palette of [theme.light, theme.dark]) {
        for (const value of Object.values(palette)) {
          if (typeof value !== 'string' || !value.startsWith('rgba')) continue;
          const { color, opacity } = splitAlpha(value);
          expect(color.startsWith('rgb(')).toBe(true);
          expect(opacity).toBeGreaterThanOrEqual(0);
          expect(opacity).toBeLessThanOrEqual(1);
        }
        const plate = palette.plate.slice(1).match(/../g)!.map((h) => parseInt(h, 16));
        expect(splitAlpha(palette.plateFade)).toEqual({ color: `rgb(${plate.join(', ')})`, opacity: 0 });
      }
    }
  });
});
