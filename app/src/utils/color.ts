/**
 * A theme color split into the opaque color and its alpha (0–1), for gradient stops: react-native-svg on iOS and
 * Android ignores the alpha inside `stopColor` and only reads `stopOpacity` (components/ui/Gradient.tsx).
 * Reads the forms the theme uses: '#RRGGBB', '#RRGGBBAA' and 'rgba(r, g, b, a)'. Anything else is kept, opaque.
 */
export function splitAlpha(color: string): { color: string; opacity: number } {
  const rgba = /^rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i.exec(color.trim());
  if (rgba) return { color: `rgb(${rgba[1]}, ${rgba[2]}, ${rgba[3]})`, opacity: Math.min(Number(rgba[4]), 1) };
  const hex = /^#([0-9a-f]{6})([0-9a-f]{2})$/i.exec(color.trim());
  if (hex) return { color: `#${hex[1]}`, opacity: parseInt(hex[2], 16) / 255 };
  return { color, opacity: 1 };
}
