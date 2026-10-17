/**
 * The app's exercises as [id, program, loadsJaw, key, free], in its catalog order (app/src/constants/exercises.ts
 * EXERCISE_IDS, program, jawCaution, the i18n key and FREE_EXERCISE_IDS). The Coach may only name these
 * (lib/workouts.js), and only the free ones to someone without Premium. The Premium ones are what POST /content serves
 * (lib/content.js, scripts/content.js). A test fails when this and the app drift apart.
 */
export const CATALOG = [
  ['01-jaw-clench', 'jawline', true, 'jawClench', false],
  ['02-chin-lift', 'jawline', false, 'chinLift', true],
  ['03-jaw-jut', 'jawline', true, 'jawJut', false],
  ['04-mewing', 'jawline', false, 'mewing', false],
  ['12-tongue-press', 'jawline', false, 'tonguePress', false],
  ['11-chin-tuck', 'jawline', false, 'chinTuck', false],
  ['05-neck-stretch', 'jawline', false, 'neckStretch', false],
  ['06-cheek-lift', 'cheekbones', false, 'cheekLift', true],
  ['07-fish-face', 'cheekbones', false, 'fishFace', true],
  ['13-smiling-fish', 'cheekbones', false, 'smilingFish', false],
  ['08-cheek-puff', 'cheekbones', false, 'cheekPuff', false],
  ['14-o-stretch', 'cheekbones', false, 'oStretch', false],
  ['15-lion-face', 'cheekbones', true, 'lionFace', false],
  ['18-lip-press', 'lips', false, 'lipPress', false],
  ['19-pout', 'lips', false, 'pout', true],
  ['20-lip-corner-lift', 'lips', false, 'lipCornerLift', false],
  ['21-smile-line-press', 'lips', false, 'smileLinePress', false],
  ['09-brow-lift', 'eyes', false, 'browLift', true],
  ['22-forehead-press', 'eyes', false, 'foreheadPress', false],
  ['16-wide-eyes', 'eyes', false, 'wideEyes', true],
  ['17-lower-lid-lift', 'eyes', false, 'lowerLidLift', false],
  ['23-v-eyes', 'eyes', false, 'vEyes', false],
  ['10-eye-squeeze', 'eyes', false, 'eyeSqueeze', false],
  ['24-jaw-release', 'massage', false, 'jawRelease', false],
  ['25-jawline-sweep', 'massage', false, 'jawlineSweep', false],
  ['26-frown-release', 'massage', false, 'frownRelease', false],
  ['27-temple-circles', 'massage', false, 'templeCircles', true],
].map(([id, program, loadsJaw, key, free]) => ({ id, program, loadsJaw, key, free }));

/** Exercise ids someone may be told about: every one with Premium, the free ones without. */
export const idsFor = (premium) => CATALOG.filter((e) => premium || e.free).map((e) => e.id);
