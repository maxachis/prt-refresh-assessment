import { describe, it, expect } from 'vitest';
import { NOTICE_DISMISSED_KEY, dismissNotice, shouldShowNotice } from './notice';

function memoryStorage(seed: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(seed));
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => { m.set(k, v); },
    removeItem: (k: string) => { m.delete(k); },
    clear: () => m.clear(),
    key: () => null,
    get length() { return m.size; },
  };
}

function throwingStorage(): Storage {
  const boom = () => { throw new Error('SecurityError'); };
  return {
    getItem: boom, setItem: boom, removeItem: boom, clear: boom, key: boom, length: 0,
  };
}

describe('shouldShowNotice', () => {
  it('shows on a first visit', () => {
    expect(shouldShowNotice({ embedded: false, storage: memoryStorage() })).toBe(true);
  });

  it('stays dismissed in the same browser once it has been dismissed', () => {
    const storage = memoryStorage();
    dismissNotice(storage);
    expect(shouldShowNotice({ embedded: false, storage })).toBe(false);
  });

  it('never shows in an embed, where there is no room for a card over the map', () => {
    expect(shouldShowNotice({ embedded: true, storage: memoryStorage() })).toBe(false);
  });

  // Private windows and blocked site data make the accessor itself throw.
  // The notice must then show rather than break the page -- and dismissing
  // must not throw either, even though it will not stick.
  it('shows, and does not throw, when storage is unavailable', () => {
    expect(shouldShowNotice({ embedded: false, storage: throwingStorage() })).toBe(true);
    expect(() => dismissNotice(throwingStorage())).not.toThrow();
  });

  it('treats a storage accessor that is itself missing as unavailable', () => {
    expect(shouldShowNotice({ embedded: false, storage: null })).toBe(true);
    expect(() => dismissNotice(null)).not.toThrow();
  });

  it('keys the dismissal so the notice can be re-shown by renaming the key', () => {
    const storage = memoryStorage();
    dismissNotice(storage);
    expect(storage.getItem(NOTICE_DISMISSED_KEY)).not.toBeNull();
  });
});
