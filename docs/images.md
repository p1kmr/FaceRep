# Exercise pictures

Every picture belongs to a **guide** (who the pictures show: `man` or `woman`) and an **exercise**. Never to a plan
week or weekday: plan days only list exercise IDs, the same exercise comes back in many weeks, and the server can change
Weeks 2–4 without an app update.

```
app/assets/
  brand/                         icon.png, icon-dark.png, icon-tinted.png, splash-icon.png, favicon.png (all made by
                                 brand/logo.mjs, see brand/README.md), welcome.webp (first screen, before the choice)
  guides/
    man/
      hero/                      home.webp (1200×675), paywall.webp (762×1024)
      exercises/01-jaw-clench/   relaxed.webp, exercise.webp (≈757×1024), thumb.webp (240×240)
      …
    woman/                       same layout
```

## Adding or replacing pictures

1. Save the picture into its folder with the right name: `relaxed.png` / `exercise.png` (or `.jpg`, any size), or
   `hero/home.png` / `hero/paywall.png`. The folder name is the exercise ID from `src/constants/exercises.ts`.
2. `cd app && npm run images`. It:
   - converts PNG/JPG (or a WebP of the wrong size) to WebP at the app's size and deletes the PNG/JPG (keep your
     originals elsewhere, see "AI images" below);
   - cuts `thumb.webp` from `exercise.webp` (a full-width square starting 6% from the top: the face) when it's missing;
   - writes `src/constants/guideImages.generated.ts` (never edit it by hand). React Native's bundler only includes images
     loaded with a fixed `require('…')` path, so the list of files has to be written out.
3. `npm run images:check` (also part of `npm test`) fails when the default guide (man) is incomplete, a file has the
   wrong size or name, the relaxed and exercise frames differ in size, or the generated list is out of date.

A guide is in the app only when it's **complete** (both heroes, and all three files of every exercise). The
Man/Woman question in onboarding and the "Exercise pictures" row in Settings appear by themselves once two guides are
complete. A folder for an exercise that isn't in the catalog yet is fine: it's reported as a note and not bundled.

Components never `require` pictures themselves: `useGuideImages()` gives the chosen guide's `hero` and `exercises[id]`.

## How the woman set was made (repeat this for new exercises)

Figma AI (`generate_image`, model `gpt-image-2.5-sunburst`, 1536×1024). The image tool can't edit an existing picture,
so each exercise is **one image with both frames side by side** (left: relaxed, right: exercise): that keeps the face
and framing identical, so the player's crossfade lines up. The image is split down the middle; a check found 0 px
offset between the halves. The heroes are separate photorealistic images.

Decisions from the review with the owner: the neck must be smooth (no tendons or "skeleton" lines), nothing below the
neck is drawn (it fades to white, no clothing), and she should look pretty and friendly.

**Template** (fill in VIEW, LEFT and RIGHT):

```
Two portrait panels side by side on one pure white canvas, each panel exactly half the width. No border, no divider
line, no text, no labels.

Both panels show the SAME beautiful fictional young woman, about 25 years old, in an identical VIEW: same head size,
same position, same framing, same lighting, perfectly aligned so the panels could be overlaid. Only her expression and
the red highlight change.

Style: elegant, soft graphite pencil portrait on white, like a high-end beauty illustration. Smooth, flawless skin with
soft grey shading and gentle highlights everywhere: face, neck and shoulders. Absolutely no anatomy lines, no tendons,
no visible collarbones, no sternum, no chest or rib lines, nothing bony or skeletal anywhere. The ONLY anatomical detail
is the target muscle, drawn as a few fine translucent red muscle fibers on the skin.

Below the neck the drawing simply fades out: the smooth bare shoulders are only lightly sketched and dissolve softly
into the white paper just below the base of the neck, so no chest is drawn at all. No clothing.

The woman: very pretty, soft feminine features, oval face, high cheekbones, smooth youthful skin, full natural lips,
soft arched eyebrows, large bright almond eyes with long lashes, small refined nose. Glossy dark hair pulled back
neatly into a low bun with a few soft strands, so the forehead, both ears, the jawline and the neck are fully visible.
No jewelry. The top of her hair almost touches the top edge, her chin sits at about two thirds of the panel height,
the head is centered and symmetrical, facing the viewer straight on.

Left panel: LEFT
Right panel: RIGHT
```

VIEW is "front view" or "side profile facing RIGHT (she looks toward the right edge of the panel)" (then: "the ear
near the horizontal center of the panel"). When the head moves on purpose (chin lift, neck stretch, chin tuck), say
"the shoulders in exactly the same place in both panels" instead of "perfectly aligned".

| Exercise | View | Left (relaxed, faint pale pink) | Right (exercise, bold red) |
|---|---|---|---|
| 01 Jaw Clench | front | masseter (back of the cheek, in front of the ear) | clenches back teeth, lips closed, calm face |
| 02 Chin Lift | front | platysma (front of the neck) | head tilted back, looking up, lower lip over upper lip |
| 03 Jaw Jut | profile | under the chin and front of the neck | lower jaw pushed forward, chin slightly lifted |
| 04 Mewing | profile + soft see-through window showing only palate and tongue | tongue resting low | whole tongue flat against the roof of the mouth |
| 05 Neck Stretch | front | side-of-neck muscle on both sides | ear toward the shoulder on the image's right; red on the image's left |
| 06 Cheek Lift | front | zygomaticus (cheekbone to mouth corner) | wide closed-lip smile lifting the cheeks |
| 07 Fish Face | front | buccinator (hollow of the cheek) | cheeks sucked in, lips puckered |
| 08 Cheek Puff | front | cheeks around the mouth | cheeks full of air, lips sealed |
| 09 Brow Lift | front | frontalis (forehead) | eyebrows raised high, eyes wide, soft forehead lines |
| 10 Eye Squeeze | front | ring muscle around each eye | eyes squeezed shut; "nothing connects the two eyes, the bridge of the nose is clean" |
| 11 Chin Tuck | profile | deep front-of-neck muscles | head glided back, eyes level, small soft double chin |
| 12 Tongue Press | profile | small muscles under the chin | tongue pressed up, humming, under-chin firms |
| 13 Smiling Fish | front | cheekbone-to-mouth muscles | fish face plus smiling mouth corners |
| 14 O Stretch | front | ring muscle around the lips | long vertical O, lips over the teeth |
| 15 Lion Face | front | cheeks and front of the neck | mouth wide, tongue out and down, eyes wide |
| 16 Wide Eyes | front | upper eyelid arc | eyes wide WITHOUT raising the eyebrows |
| 17 Lower Lid Lift | front | lower eyelid arc | looks slightly up, lower lids lifted like squinting into the sun |
| 18 Lip Press | front | ring muscle around the lips | lips pressed and rolled slightly in |
| 19 Pout | front | lips and chin muscle | long pout like blowing a kiss, cheeks NOT sucked in |
| 20 Lip Corner Lift | front | small muscles at the mouth corners | lips closed, only the corners lift into a small smile |
| 21 Smile-Line Press | front + hands | cheeks beside the fingertips | index fingertips on the smile lines; wide closed-lip smile |
| 22 Forehead Press | front + hands | frontalis between the fingers | fingers flat across the forehead; tries to raise the brows |
| 23 V Eyes | front + hands | ring muscle around each eye | middle and index fingertips make a V around each eye; looks up and squints |
| 24 Jaw Release | front + hands | masseter under the fingertips | teeth apart, eyes half-closed, faint circular motion lines |
| 25 Jawline Sweep | front + hands | jawline | left: knuckles under the chin; right: knuckles below the ears, trail line along the jaw |
| 26 Frown Release | front + hands | between the brows | left: fingertips together between the brows; right: at the temples, trail line over the brows (say "the hands never cover the eyes") |
| 27 Temple Circles | front + hands | temples | eyes closed, faint circular motion lines |

For exercises with hands add: "Hands: … Natural, well-formed fingers, five per hand, drawn in the same pencil style."

**The man's new exercises (18–27)** use the same table with this description instead of the woman's (it matches
his first 17): "detailed graphite pencil anatomical illustration on pure white, like a premium anatomy atlas … fine
muscle-fiber striations lightly visible on the face, the muscular neck, the shoulders and the upper chest … The man:
athletic, symmetrical face; short thick dark-brown hair, textured and swept up and back at the front; strong straight
eyebrows; light eyes; straight nose; high cheekbones; strong square jaw; clean-shaven; muscular neck. No clothing;
head, neck, shoulders and the top of the chest, cropped across the upper chest."

**Heroes** (photorealistic, same features, plain black crew-neck t-shirt, near-black low-key studio background):
home 1536×1024, three-quarter view facing left, in the right third with the left two thirds empty for text (then cut to
1200×675 keeping the hair); paywall 1024×1536, three-quarter view facing right, head and shoulders.

## AI images
Purely AI-generated images have little or no copyright protection and must not imitate a real person (docs/launch.md §9).
The figures are fictional; the Settings footer says the figures and photos are AI-generated. Keep the full-size
originals outside the repo (Figma's links expire after 7 days).
