import * as SecureStore from 'expo-secure-store';

import { ensureAppUserId } from '../appUserId';

const mockKeychain = new Map<string, string>();
const mockStorage = new Map<string, unknown>();

jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1,
  getItemAsync: jest.fn(async (k: string) => mockKeychain.get(k) ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => void mockKeychain.set(k, v)),
}));
jest.mock('@/services/storage/kv', () => ({
  load: jest.fn(async (k: string) => mockStorage.get(k) ?? null),
  save: jest.fn(async (k: string, _v: number, value: unknown) => void mockStorage.set(k, value)),
}));

beforeEach(() => {
  mockKeychain.clear();
  mockStorage.clear();
});

it('creates one id and keeps it in the Keychain', async () => {
  const id = await ensureAppUserId();
  expect(id).toMatch(/^[0-9a-f-]{36}$/);
  expect(await ensureAppUserId()).toBe(id);
  expect([...mockKeychain.values()]).toEqual([id]);
});

it('a reinstall (app storage wiped) gets the same id back from the Keychain', async () => {
  const id = await ensureAppUserId();
  mockStorage.clear();
  expect(await ensureAppUserId()).toBe(id);
});

it('moves an existing id from older versions into the Keychain', async () => {
  mockStorage.set('facerep.appUserId', '0f8fad5b-d9cb-469f-a165-70867728950e');
  expect(await ensureAppUserId()).toBe('0f8fad5b-d9cb-469f-a165-70867728950e');
  expect(mockKeychain.get('facerep.appUserId')).toBe('0f8fad5b-d9cb-469f-a165-70867728950e');
});

it('still works when the Keychain is unavailable', async () => {
  (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('locked'));
  (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('locked'));
  expect(await ensureAppUserId()).toMatch(/^[0-9a-f-]{36}$/);
});
