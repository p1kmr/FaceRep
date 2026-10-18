import { hydrateSettings, setScanPhotos } from '../actions';
import { initialSettingsState, settingsReducer } from '../reducer';

describe('settings: face scan photos', () => {
  it('starts unasked, keeps only a yes or no, and saves the answer', () => {
    expect(settingsReducer(initialSettingsState, hydrateSettings({})).settings.scanPhotos).toBeNull();
    expect(settingsReducer(initialSettingsState, hydrateSettings({ scanPhotos: 'yes' as unknown as boolean })).settings.scanPhotos).toBeNull();
    expect(settingsReducer(initialSettingsState, hydrateSettings({ scanPhotos: false })).settings.scanPhotos).toBe(false);
    const on = settingsReducer(settingsReducer(initialSettingsState, hydrateSettings({})), setScanPhotos(true));
    expect(on.settings.scanPhotos).toBe(true);
    expect(settingsReducer(on, setScanPhotos(false)).settings.scanPhotos).toBe(false);
  });
});
