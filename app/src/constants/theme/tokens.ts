export const tokens = {
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 8, md: 12, lg: 20, xl: 28, pill: 999 },
  font: {
    size: { caption: 13, footnote: 15, body: 17, headline: 20, title: 28, display: 40 },
    weight: { regular: '400', medium: '500', semibold: '600', bold: '700', heavy: '800' },
  },
  /** Minimum touch target (Apple HIG). */
  hitSize: 44,
} as const;

export type Tokens = typeof tokens;
