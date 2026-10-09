# FaceRep logo

The **barbell smile**: two eyes, and the smile is a barbell bending under its weight. Face + rep, for women and men.
White on the brand red; built only from circles, rounded rectangles and one curve.

`logo.mjs` is the only source. Change the shape or colors there, then from the repo root:

```bash
npm --prefix store-screenshots install   # once: the script uses sharp from there
node brand/logo.mjs
```

It writes:

| File | Use |
|---|---|
| `app/assets/brand/icon.png` | App icon (1024², opaque). Also the App Store icon: Apple takes it from the build |
| `app/assets/brand/icon-dark.png` | iOS 18+ dark icon (`ios.icon.dark` in app.json) |
| `app/assets/brand/icon-tinted.png` | iOS 18+ tinted icon: grayscale, iOS adds the tint |
| `app/assets/brand/splash-icon.png` | Splash: the rounded tile, works on the light and dark splash background |
| `app/assets/brand/favicon.png` | Web favicon (48²) |
| `brand/svg/icon*.svg` | Vector versions of the three icons |
| `brand/svg/layer-background.svg`, `layer-glyph.svg` | Layers for Apple's Icon Composer (Liquid Glass) |
| `brand/svg/mark-red.svg` | The mark alone in brand red, for light backgrounds (web pages, documents) |

## Rules
- **A new icon needs a new build.** The App Store shows the icon from the binary; after Submit it can only change
  with a new version.
- **Apple:** 1024 × 1024 PNG, square, no transparency, no rounded corners (iOS masks it), no text. No Apple artwork:
  no SF Symbols (their license forbids them in app icons), Apple emoji or device pictures. Nothing that looks like
  another app's icon (guideline 4.1) and no health or result claims (no before/after, no medical symbols; 1.4.1).
- **Liquid Glass (iOS 26+):** iOS adds the glass effect to this flat icon itself. For full control, build an `.icon`
  file on a Mac in Icon Composer from the two layer SVGs, save it as `app/assets/app.icon`, and set
  `"ios": { "icon": "./assets/app.icon" }` (Expo SDK 54+). It then replaces the light/dark/tinted PNGs on iOS.
- **Trademark:** register the logo with the name (docs/launch.md §8); use ™ until it is registered. Keep it red and
  white, never a yellow round face: the classic yellow smiley is a registered mark in many countries.
