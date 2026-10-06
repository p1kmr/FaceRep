import { completeOnboarding, hydrateSettings, resetSettings, setGoal, setReminder } from '../actions';
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
    expect(s.settings.reminder).toEqual({ enabled: true, time: DEFAULT_SETTINGS.reminder.time });
  });

  it('hydrating nothing gives a fresh install', () => {
    expect(settingsReducer(initialSettingsState, hydrateSettings(null)).settings).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps the first onboarding date', () => {
    let s = settingsReducer(initialSettingsState, completeOnboarding('2026-10-01'));
    s = settingsReducer(s, completeOnboarding('2026-10-06'));
    expect(s.settings).toMatchObject({ onboardingDone: true, onboardedOn: '2026-10-01' });
  });

  it('ignores an invalid reminder time', () => {
    const s = settingsReducer(initialSettingsState, setReminder({ time: '7pm' }));
    expect(s).toBe(initialSettingsState);
    expect(settingsReducer(s, setReminder({ time: '07:30' })).settings.reminder.time).toBe('07:30');
  });

  it('reset keeps hydrated and restores defaults', () => {
    let s = settingsReducer(initialSettingsState, hydrateSettings(null));
    s = settingsReducer(settingsReducer(s, setGoal('eyes')), resetSettings());
    expect(s).toEqual({ hydrated: true, settings: DEFAULT_SETTINGS });
  });
});
