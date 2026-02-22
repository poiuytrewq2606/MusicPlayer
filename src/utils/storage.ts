import AsyncStorage from '@react-native-async-storage/async-storage';

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
 * Get a JSON value from AsyncStorage
 */
export async function getStorageItem<T>(key: string): Promise<T | null> {
    try {
        const value = await AsyncStorage.getItem(key);
        if (!value) return null;
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

/**
 * Set a JSON value in AsyncStorage
 */
export async function setStorageItem<T>(key: string, value: T): Promise<void> {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Silently fail for non-critical persistence
    }
}

/**
 * Remove an item from AsyncStorage
 */
export async function removeStorageItem(key: string): Promise<void> {
    try {
        await AsyncStorage.removeItem(key);
    } catch {
        // Silently fail
    }
}
