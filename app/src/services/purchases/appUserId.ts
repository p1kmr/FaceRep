import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { load, save } from '@/services/storage/kv';

function randomId(): string {
  // RFC 4122-style v4 id from Math.random: good enough for an anonymous, non-secret id.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const ID = /^[0-9a-f-]{36}$/;
// The iOS Keychain keeps it when the app is deleted and installed again, so the same id (and
// its free AI count and purchases) comes back. Not synced to other devices.
const KEYCHAIN_KEY = 'facerep.appUserId';
const KEYCHAIN_OPTIONS = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY };

async function fromKeychain(): Promise<string | null> {
  try {
    const id = await SecureStore.getItemAsync(KEYCHAIN_KEY, KEYCHAIN_OPTIONS);
    return id && ID.test(id) ? id : null;
  } catch {
    return null; // web, or the Keychain is locked
  }
}

async function toKeychain(id: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEYCHAIN_KEY, id, KEYCHAIN_OPTIONS);
  } catch {
    // Still works for this install from app storage.
  }
}

/** A random id created on first launch (no personal data). Used by RevenueCat and the AI limits. */
export async function ensureAppUserId(): Promise<string> {
  const kept = await fromKeychain();
  if (kept) {
    await save(STORAGE_KEYS.appUserId, 1, kept);
    return kept;
  }
  const id = (await load<string>(STORAGE_KEYS.appUserId, 1)) ?? randomId();
  await save(STORAGE_KEYS.appUserId, 1, id);
  await toKeychain(id);
  return id;
}
