import { workoutReminder } from '@/services/reminders/reminders';

import {
  completeOnboarding,
  deleteReminder,
  hydrateSettings,
  resetSettings,
  saveReminder,
  setAskButton,
  setGoal,
  setGuide,
  setMirror,
  setMoveCheck,
  setSoundCues,
  setTileSpot,
} from '../actions';
import { DEFAULT_SETTINGS, initialSettingsState, settingsReducer } from '../reducer';

describe('settingsReducer', () => {
  it('hydrates with defaults for missing or invalid values', () => {
    const s = settingsReducer(
      initialSettingsState,
      hydrateSettings({ goal: 'nose' as never, themeMode: 'dark', reminder: { enabled: true, time: '25:99' } }),
    );
    expect(s.hydrated).toBe(true);
    expect(s.settings.goal).toBe(DEFAULT_SETTINGS.goal);
    expect(s.settings.themeMode).toBe('dark');
    // An old save with one daily reminder becomes the workout reminder (bad time → default).
    expect(s.settings.reminders).toEqual([workoutReminder(true)]);
  });

  it('hydrating nothing gives a fresh install', () => {
    expect(settingsReducer(initialSettingsState, hydrateSettings(null)).settings).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps who the pictures show; an unknown or missing guide falls back to the default', () => {
    expect(DEFAULT_SETTINGS.guide).toBe('man');
    let s = settingsReducer(initialSettingsState, setGuide('woman'));
    expect(s.settings.guide).toBe('woman');
    expect(settingsReducer(s, setGuide('robot' as never))).toBe(s);
    s = settingsReducer(s, hydrateSettings({ guide: 'woman' }));
    expect(s.settings.guide).toBe('woman');
    expect(settingsReducer(s, hydrateSettings({ guide: 'female' as never })).settings.guide).toBe('man');
    expect(settingsReducer(s, hydrateSettings({ goal: 'eyes' })).settings.guide).toBe('man');
  });

  it('keeps the first onboarding date', () => {
    let s = settingsReducer(initialSettingsState, completeOnboarding('2026-10-01'));
    s = settingsReducer(s, completeOnboarding('2026-10-06'));
    expect(s.settings).toMatchObject({ onboardingDone: true, onboardedOn: '2026-10-01' });
  });

  it('adds, edits and deletes reminders, ignoring invalid ones and the limits', () => {
    const mewing = { id: 'm1', kind: 'mewing' as const, title: '', enabled: true, times: ['12:00', '10:00'], days: [5, 1] };
    let s = settingsReducer(initialSettingsState, saveReminder(mewing));
    expect(s.settings.reminders[1]).toEqual({ ...mewing, times: ['10:00', '12:00'], days: [1, 5] });
    s = settingsReducer(s, saveReminder({ ...mewing, title: 'Tongue up' }));
    expect(s.settings.reminders.map((r) => r.title)).toEqual(['', 'Tongue up']);
    expect(settingsReducer(s, saveReminder({ ...mewing, id: 'bad', times: ['7pm'] }))).toBe(s);
    s = settingsReducer(s, deleteReminder('m1'));
    expect(s.settings.reminders.map((r) => r.id)).toEqual(['workout']);
    for (let i = 0; i < 20; i++) s = settingsReducer(s, saveReminder({ ...mewing, id: `r${i}`, times: ['09:00'], days: [1] }));
    expect(s.settings.reminders).toHaveLength(10);
  });

  it('reset keeps hydrated and restores defaults', () => {
    let s = settingsReducer(initialSettingsState, hydrateSettings(null));
    s = settingsReducer(settingsReducer(s, setGoal('eyes')), resetSettings());
    expect(s).toEqual({ hydrated: true, settings: DEFAULT_SETTINGS });
  });

  it('remembers where the floating Coach button was dragged, within limits', () => {
    let s = settingsReducer(initialSettingsState, setAskButton({ side: 'left', y: 0.4 }));
    s = settingsReducer(s, setAskButton({ hintShows: 2 }));
    expect(s.settings.askButton).toEqual({ visible: true, side: 'left', y: 0.4, hintShows: 2 });
    s = settingsReducer(s, setAskButton({ y: 7, side: 'up' as never, hintShows: -1 }));
    expect(s.settings.askButton).toEqual({ visible: true, side: 'left', y: 1, hintShows: 2 });
    expect(settingsReducer(s, setAskButton({ visible: false })).settings.askButton.visible).toBe(false);
  });

  it('hydrates an old save without the button with the defaults', () => {
    const s = settingsReducer(initialSettingsState, hydrateSettings({ goal: 'eyes', askButton: { side: 'left', y: 'x' } as never }));
    expect(s.settings.askButton).toEqual({ ...DEFAULT_SETTINGS.askButton, side: 'left' });
  });

  it('sound cues start on the voice and the mirror off; both are remembered', () => {
    expect(DEFAULT_SETTINGS.soundCues).toBe('voice');
    expect(DEFAULT_SETTINGS.mirror).toBe(false);
    let s = settingsReducer(initialSettingsState, setSoundCues('beeps'));
    s = settingsReducer(s, setMirror(true));
    expect(s.settings).toMatchObject({ soundCues: 'beeps', mirror: true });
    expect(settingsReducer(s, setSoundCues('loud' as never))).toBe(s);
    // A save from before these settings existed gets the defaults; odd values don't switch anything on.
    expect(settingsReducer(s, hydrateSettings({ goal: 'eyes' })).settings).toMatchObject({ soundCues: 'voice', mirror: false });
    const odd = settingsReducer(s, hydrateSettings({ soundCues: 'loud' as never, mirror: 'yes' as never }));
    expect(odd.settings).toMatchObject({ soundCues: 'voice', mirror: false });
    expect(settingsReducer(s, hydrateSettings({ soundCues: 'off' })).settings.soundCues).toBe('off');
  });

  it('keeps voice cues turned off in a save from before beeps', () => {
    expect(settingsReducer(initialSettingsState, hydrateSettings({ voiceCues: false })).settings.soundCues).toBe('off');
    expect(settingsReducer(initialSettingsState, hydrateSettings({ voiceCues: true })).settings.soundCues).toBe('voice');
  });

  it('the move check starts on; off is remembered and only a clear off turns it off', () => {
    expect(DEFAULT_SETTINGS.moveCheck).toBe(true);
    const off = settingsReducer(initialSettingsState, setMoveCheck(false));
    expect(off.settings.moveCheck).toBe(false);
    expect(settingsReducer(off, setMoveCheck(true)).settings.moveCheck).toBe(true);
    expect(settingsReducer(off, hydrateSettings({ moveCheck: false })).settings.moveCheck).toBe(false);
    // Saves from before the move check existed, or odd values, keep it on (it does nothing without the mirror).
    expect(settingsReducer(off, hydrateSettings({ mirror: true })).settings).toMatchObject({ mirror: true, moveCheck: true });
    expect(settingsReducer(off, hydrateSettings({ moveCheck: 'no' as never })).settings.moveCheck).toBe(true);
  });

  it("remembers where the workout's small tile was dragged, within limits", () => {
    expect(DEFAULT_SETTINGS.tileSpot).toBeNull();
    let s = settingsReducer(initialSettingsState, setTileSpot({ x: 0.2, y: 0.7 }));
    expect(s.settings.tileSpot).toEqual({ x: 0.2, y: 0.7 });
    expect(settingsReducer(s, setTileSpot({ x: -3, y: 9 })).settings.tileSpot).toEqual({ x: 0, y: 1 });
    expect(settingsReducer(s, setTileSpot(null)).settings.tileSpot).toBeNull();
    // Saves from before it existed, or broken ones, put the tile back in its corner.
    s = settingsReducer(s, hydrateSettings({ goal: 'eyes' }));
    expect(s.settings.tileSpot).toBeNull();
    expect(settingsReducer(s, hydrateSettings({ tileSpot: { x: 0.5, y: 'top' } as never })).settings.tileSpot).toBeNull();
    expect(settingsReducer(s, hydrateSettings({ tileSpot: { x: 0.5, y: 0.1 } })).settings.tileSpot).toEqual({ x: 0.5, y: 0.1 });
  });
});
