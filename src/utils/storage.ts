// react-native-mmkv provides MMKV as a class
const { MMKV } = require('react-native-mmkv');

export const storage = new MMKV();

// Storage keys
export const STORAGE_KEYS = {
    QUEUE: 'player_queue',
    QUEUE_INDEX: 'player_queue_index',
    RECENTLY_PLAYED: 'recently_played',
    DOWNLOADED_SONGS: 'downloaded_songs',
    LAST_POSITION: 'last_position',
    SHUFFLE_MODE: 'shuffle_mode',
    REPEAT_MODE: 'repeat_mode',
} as const;

/**
 * Get a JSON value from MMKV storage
 */
export function getStorageItem<T>(key: string): T | null {
    const value = storage.getString(key);
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

/**
 * Set a JSON value in MMKV storage
 */
export function setStorageItem<T>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
}

/**
 * Remove an item from MMKV storage
 */
export function removeStorageItem(key: string): void {
    storage.delete(key);
}
