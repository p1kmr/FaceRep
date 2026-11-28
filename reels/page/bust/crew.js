// The office crew for reel 009-lunch-break, in the bust style. Mia, 22: long dark hair with a centre part, brown
// eyes, warm tan skin, a sage blouse, gold studs. Greg, the boss, mid 40s: big, short brown hair going grey at the
// temples, a short full beard, a charcoal quarter-zip. o: the same as brody() and kayla() (people.js).

import { BRODY_HEAD, KAYLA_HEAD, ears, head, skin } from './head.js';
import { brows, eye, mouth, nose } from './features.js';
import { beard, gregHair, miaBack, miaFront } from './crew-hair.js';
import { neck, torso } from './clothes.js';
import { look, place } from './people.js';

const MIA = {
  skin: { base: '#E3B08A', shade: '#CB9069', deep: '#AE7352', light: '#F2CBA8' },
  hair: { base: '#3E2C23', shade: '#2A1C16', light: '#6A4E3E', line: '#1C120D' },
  iris: '#6B4A2E', brow: '#2E201A', lip: '#C9686E', upper: '#A8525A', top: { base: '#9CC5A1', shade: '#7FAA86', light: '#B9D9BD' },
};
const GREG = {
  skin: { base: '#EDBB98', shade: '#D69A76', deep: '#BC7F5C', light: '#F8D6BC' },
  hair: { base: '#5A4332', shade: '#3F2E22', light: '#7E6450', line: '#2A1C12', gray: '#A9A19A' },
  beard: { base: '#6A5040', shade: '#4E3A2E', line: '#2A1C12', gray: '#B0A69E' },
  iris: '#5A7FA0', brow: '#4A3628', top: { base: '#3E4652', shade: '#2C323B', light: '#56606E' },
};

export function mia(c, o) {
  place(c, o, () => {
    const f = look(o.face), sk = MIA.skin, H = head(KAYLA_HEAD, 0, f.pinch ?? 0);
    const sh = { nw: 50, nb: 168, sh: 270 };
    miaBack(MIA.hair);
    neck(H, sk, { ...sh, drop: 16 });
    torso('tee', MIA.top, { ...sh, sx: 270, shrug: o.shrug ?? 0 });
    ears(82, sk, '#E3B54A');
    skin(H, sk, { chad: 0.1, blush: 0.25, pinch: f.pinch ?? 0, cheeks: f.cheeks ?? 0 });
    for (const s of [-1, 1]) eye(s, { shape: 0.7, iris: MIA.iris, lid: f.lid ?? 0, look: f.look, kind: f.kind, lashes: true, skin: sk.base });
    nose(sk, 13);
    mouth(f.mouth ?? 'smile', { lip: MIA.lip, upper: MIA.upper, full: true });
    brows({ shape: 0.5, mood: f.brows, color: MIA.brow, thin: true });
    miaFront(MIA.hair);
  });
}

export function greg(c, o) {
  place(c, o, () => {
    const f = look(o.face), sk = GREG.skin, H = head(BRODY_HEAD, 0.3, f.pinch ?? 0);
    const sh = { nw: 92, nb: 168, sh: 278 };
    neck(H, sk, { ...sh, drop: 22 });
    torso('zip', GREG.top, { ...sh, sx: 370, shrug: o.shrug ?? 0, chest: 0.3 });
    ears(96, sk);
    skin(H, sk, { chad: 0.25, round: 0.4, blush: 0.25, pinch: f.pinch ?? 0, cheeks: f.cheeks ?? 0 });
    for (const s of [-1, 1]) eye(s, { shape: 0.4, iris: GREG.iris, lid: f.lid ?? 0.1, look: f.look, kind: f.kind, skin: sk.base });
    nose(sk, 18);
    beard(H, GREG.beard);
    mouth(f.mouth ?? 'flat');
    brows({ shape: 0.2, mood: f.brows, color: GREG.brow });
    gregHair(GREG.hair);
  });
}
