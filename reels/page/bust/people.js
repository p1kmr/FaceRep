// The busts (reels/page/bust): Brody and Kayla from the head and shoulders up, in the semi-realistic style.
// Brody's day runs k 0 (day 1: a round, chubby face, a double chin, no neck showing) to 1 (day 30: an angled jaw,
// cheekbones, a thick neck), clean-shaven. Kayla, 21: honey-blonde high ponytail, pink scrunchie, green eyes, gold
// hoops, a lavender zip top. o: { x, y (the eye line on the canvas), s (scale), tilt (degrees), shake (pixels),
// t (seconds, for the shake), face: { lid, look, kind (eyes), brows, mouth, bags, exercise }, ... }.
// exercise: fish (Fish Face), cheek (Cheek Lift), chin (Chin Lift) set the face for the app's exercises.

import { BRODY_HEAD, KAYLA_HEAD, ears, head, skin } from './head.js';
import { brows, eye, mouth, nose } from './features.js';
import { bedHair, kaylaBack, kaylaFront, quiff } from './hair.js';
import { spikyHair } from './spiky-hair.js';
import { HOODIE, LAVENDER, TEE, chipsHand, hood, neck, phoneHand, shoulders, torso } from './clothes.js';
import { L, cl, sparkle, use } from './pen.js';

const BRODY = {
  skin: { base: '#F2C4A0', shade: '#DFA07C', deep: '#C7835F', light: '#FCE0C8' },
  hair: { base: '#E2B556', shade: '#B8862F', light: '#F8DC92', line: '#5E4018', fade: '#B08A52' },
  iris: '#3F8FE0', brow: '#9A6A2A',
};
const KAYLA = {
  skin: { base: '#F7D3BE', shade: '#E9B49A', deep: '#D4977B', light: '#FFE8DA' },
  hair: { base: '#DDA65F', shade: '#B98544', light: '#F0C98A', line: '#6B4A1C' },
  iris: '#4FAE7C', brow: '#A8763D', lip: '#E37C8E', upper: '#C9606F', scrunchie: '#F6A3BE', hoop: '#E3B54A',
};

const EXERCISES = {
  fish: { mouth: 'fish', kind: 'wide', brows: 'up', pinch: 1 },
  cheek: { mouth: 'big', kind: 'happy', brows: 'up', cheeks: 1 },
  chin: { mouth: 'pout', look: [0, -1], brows: 'up', chinUp: 1 },
};

export function place(c, o, draw) {
  use(c);
  c.save();
  const j = o.shake ?? 0, t = o.t ?? 0;
  c.translate(o.x + j * Math.sin(t * 97.3), o.y + j * 0.6 * Math.cos(t * 83.1));
  c.rotate(((o.tilt ?? 0) * Math.PI) / 180);
  c.scale(o.s ?? 2, (o.s ?? 2) * (o.sy ?? 1));
  draw();
  c.restore();
}

// The face's look: the exercise's settings over the mood's.
export const look = (face = {}) => ({ ...face, ...(EXERCISES[face.exercise] ?? {}) });

// Brody. o also: k, clothes (tee | hoodie), hair (left out: the spiky anime hair, the same on every day; bed | quiff:
// the earlier styles), shrug, hand (phone | chips), ting (a sparkle on the jaw).
export function brody(c, o) {
  place(c, o, () => {
    const k = o.k ?? 0, f = look(o.face), sk = BRODY.skin, up = f.chinUp ?? 0;
    const H = head(BRODY_HEAD, k, f.pinch ?? 0), sh = shoulders(k), wear = o.clothes === 'hoodie' ? HOODIE : TEE;
    if (o.clothes === 'hoodie') hood(sh.nb, sh.sh);
    neck(H, sk, { ...sh, drop: L(16, 26, k) - 8 * up, lines: k, strain: up });
    torso(o.clothes ?? 'tee', wear, { ...sh, shrug: o.shrug ?? 0, chest: 0.4 + 0.5 * k });
    const g = c;
    g.save();
    g.translate(0, -16 * up);
    g.scale(1, 1 - 0.1 * up);
    ears(L(100, 86, k), sk);
    skin(H, sk, { dc: cl(1 - k / 0.55), chad: k, round: 1 - k, blush: L(0.35, 0.06, k), pinch: f.pinch ?? 0, cheeks: f.cheeks ?? 0 });
    for (const s of [-1, 1]) eye(s, { shape: k, iris: BRODY.iris, lid: f.lid ?? 0, look: f.look, kind: f.kind, bags: f.bags, skin: sk.base });
    nose(sk, L(19, 15, k));
    mouth(f.mouth ?? 'flat');
    brows({ shape: k, mood: f.brows, color: BRODY.brow });
    if (o.hair === 'quiff') quiff(BRODY.hair);
    else if (o.hair === 'bed') bedHair(BRODY.hair);
    else spikyHair(BRODY.hair, H.d, sk.shade);
    if (o.ting) {
      sparkle(H.j2[0] + 10, H.j2[1] + 6, 16);
      sparkle(H.j2[0] + 30, H.j2[1] - 14, 7);
    }
    g.restore();
    const [hx, hy] = o.handAt ?? (o.hand === 'phone' ? [150, 280] : [-150, 270]);
    if (o.hand === 'phone') phoneHand(hx, hy, sk, wear);
    if (o.hand === 'chips') chipsHand(hx, hy, sk, wear);
  });
}

// Kayla. o also: swing (the ponytail's swing, in units).
export function kayla(c, o) {
  place(c, o, () => {
    const f = look(o.face), sk = KAYLA.skin, H = head(KAYLA_HEAD, 0, f.pinch ?? 0);
    const sh = { nw: 50, nb: 168, sh: 270 };
    kaylaBack(KAYLA.hair, o.swing ?? 0);
    neck(H, sk, { ...sh, drop: 16 });
    torso('zip', LAVENDER, { ...sh, sx: 270, shrug: o.shrug ?? 0 });
    ears(82, sk, KAYLA.hoop);
    skin(H, sk, { chad: 0.1, blush: 0.32, pinch: f.pinch ?? 0, cheeks: f.cheeks ?? 0 });
    for (const s of [-1, 1]) eye(s, { shape: 0.7, iris: KAYLA.iris, lid: f.lid ?? 0, look: f.look, kind: f.kind, lashes: true, skin: sk.base });
    nose(sk, 12);
    mouth(f.mouth ?? 'smile', { lip: KAYLA.lip, upper: KAYLA.upper, full: true });
    brows({ shape: 0.5, mood: f.brows, color: KAYLA.brow, thin: true });
    kaylaFront(KAYLA.hair, KAYLA.scrunchie);
  });
}
