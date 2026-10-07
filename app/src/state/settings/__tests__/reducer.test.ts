import { workoutReminder } from '@/services/reminders/reminders';

import { completeOnboarding, deleteReminder, hydrateSettings, resetSettings, saveReminder, setAskButton, setGoal, setGuide } from '../actions';
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
});
