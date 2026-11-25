// The five cast options for the owner to choose from (all US, 18 to 24), with what each card says about them.
// his: HIS or HER (for the card); line: what they say in a bubble; pulls: who they bring in; idea: a first episode. bg: the card's two colours.

import { ava } from './ava.js';
import { brody } from './brody.js';
import { kayla } from './kayla.js';
import { maddie } from './maddie.js';
import { zach } from './zach.js';

export const CAST = [
  { spec: brody, his: 'HIS', who: '20 · the gym bro', line: 'LEG DAY? FACE DAY.', pulls: 'Pulls in: guys 18–24, gym + jawline crowd',
    idea: 'Episode: he maxxes everything, Rep makes him do it right.', bg: ['#FFE2D4', '#FF9E8A'] },
  { spec: kayla, his: 'HER', who: '21 · the "that girl"', line: '5 MIN. EVERY MORNING.', pulls: 'Pulls in: girls 18–24, routine + wellness crowd',
    idea: 'Episode: 6 am routine. Iced coffee, journal, face reps.', bg: ['#F1E8FF', '#FFC4D9'] },
  { spec: zach, his: 'HIS', who: '19 · the gamer', line: 'CHAT, IS IT WORKING?', pulls: 'Pulls in: guys 18–24, gaming + streaming crowd',
    idea: 'Episode: face reps between matches, live on stream.', bg: ['#DFE6FF', '#BDEFDF'] },
  { spec: maddie, his: 'HER', who: '20 · the cozy study girl', line: 'NOBODY SAW THAT… RIGHT?', pulls: 'Pulls in: girls 18–24, study + cozy crowd',
    idea: 'Episode: cheek lifts in the library. Everyone saw.', bg: ['#FFF5E2', '#CDE5C6'] },
  { spec: ava, his: 'HER', who: '19 · the theater kid', line: 'FACE WARM-UPS, DARLINGS!', pulls: 'Pulls in: girls + guys 18–24, comedy crowd',
    idea: 'Episode: every face rep is an audition.', bg: ['#FFF1BA', '#D8C7FF'] },
];
