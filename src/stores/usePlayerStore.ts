import { create } from 'zustand';
import { Song, RepeatMode } from '../types';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';

interface PlayerState {
    // Current playback state
    currentTrack: Song | null;
    isPlaying: boolean;
    position: number;
    duration: number;

    // Modes
    shuffleMode: boolean;
    repeatMode: RepeatMode;

    // Queue
    queue: Song[];
    currentIndex: number;
    originalQueue: Song[]; // Preserved queue order for un-shuffle

    // Recently played
    recentlyPlayed: Song[];

    // Actions
    setCurrentTrack: (track: Song) => void;
    setIsPlaying: (playing: boolean) => void;
    setPosition: (position: number) => void;
    setDuration: (duration: number) => void;
    toggleShuffle: () => void;
    cycleRepeatMode: () => void;
    setQueue: (songs: Song[], startIndex?: number) => void;
    addToQueue: (song: Song) => void;
    removeFromQueue: (index: number) => void;
    reorderQueue: (fromIndex: number, toIndex: number) => void;
    clearQueue: () => void;
    playNext: () => Song | null;
    playPrevious: () => Song | null;
    addToRecentlyPlayed: (song: Song) => void;
    loadPersistedState: () => void;
}

const MAX_RECENTLY_PLAYED = 20;

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentTrack: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    shuffleMode: false,
    repeatMode: 'off',
    queue: [],
    currentIndex: -1,
    originalQueue: [],
    recentlyPlayed: [],

    setCurrentTrack: (track: Song) => {
        set({ currentTrack: track });
        get().addToRecentlyPlayed(track);
    },

    setIsPlaying: (playing: boolean) => {
        set({ isPlaying: playing });
    },

    setPosition: (position: number) => {
        set({ position });
    },

    setDuration: (duration: number) => {
        set({ duration });
    },

    toggleShuffle: () => {
        const { shuffleMode, queue, originalQueue, currentIndex, currentTrack } = get();
        if (!shuffleMode) {
            // Enable shuffle: save original order, shuffle the rest
            const newOriginal = [...queue];
            const remaining = queue.filter((_, i) => i !== currentIndex);
            const shuffled = remaining.sort(() => Math.random() - 0.5);
            const newQueue = currentTrack ? [currentTrack, ...shuffled] : shuffled;
            set({
                shuffleMode: true,
                originalQueue: newOriginal,
                queue: newQueue,
                currentIndex: 0,
            });
        } else {
            // Disable shuffle: restore original order
            const currentId = currentTrack?.id;
            const restoredIndex = originalQueue.findIndex(s => s.id === currentId);
            set({
                shuffleMode: false,
                queue: originalQueue,
                currentIndex: restoredIndex >= 0 ? restoredIndex : 0,
            });
        }
        setStorageItem(STORAGE_KEYS.SHUFFLE_MODE, !shuffleMode);
        persistQueue(get());
    },

    cycleRepeatMode: () => {
        const { repeatMode } = get();
        const modes: RepeatMode[] = ['off', 'all', 'one'];
        const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
        const newMode = modes[nextIndex];
        set({ repeatMode: newMode });
        setStorageItem(STORAGE_KEYS.REPEAT_MODE, newMode);
    },

    setQueue: (songs: Song[], startIndex: number = 0) => {
        set({
            queue: songs,
            originalQueue: songs,
            currentIndex: startIndex,
            currentTrack: songs[startIndex] || null,
        });
        persistQueue(get());
    },

    addToQueue: (song: Song) => {
        const { queue } = get();
        // Avoid duplicates
        if (queue.some(s => s.id === song.id)) return;
        const newQueue = [...queue, song];
        set({ queue: newQueue });
        persistQueue(get());
    },

    removeFromQueue: (index: number) => {
        const { queue, currentIndex } = get();
        const newQueue = queue.filter((_, i) => i !== index);
        let newIndex = currentIndex;
        if (index < currentIndex) {
            newIndex = currentIndex - 1;
        } else if (index === currentIndex) {
            newIndex = Math.min(currentIndex, newQueue.length - 1);
        }
        set({ queue: newQueue, currentIndex: newIndex });
        persistQueue(get());
    },

    reorderQueue: (fromIndex: number, toIndex: number) => {
        const { queue, currentIndex } = get();
        const newQueue = [...queue];
        const [moved] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, moved);

        let newIndex = currentIndex;
        if (fromIndex === currentIndex) {
            newIndex = toIndex;
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
            newIndex = currentIndex - 1;
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
            newIndex = currentIndex + 1;
        }

        set({ queue: newQueue, currentIndex: newIndex });
        persistQueue(get());
    },

    clearQueue: () => {
        set({ queue: [], currentIndex: -1, originalQueue: [] });
        persistQueue(get());
    },

    playNext: () => {
        const { queue, currentIndex, repeatMode } = get();
        if (queue.length === 0) return null;

        let nextIndex: number;

        if (repeatMode === 'one') {
            nextIndex = currentIndex;
        } else if (currentIndex < queue.length - 1) {
            nextIndex = currentIndex + 1;
        } else if (repeatMode === 'all') {
            nextIndex = 0;
        } else {
            return null; // End of queue, no repeat
        }

        const nextTrack = queue[nextIndex];
        set({ currentIndex: nextIndex, currentTrack: nextTrack });
        get().addToRecentlyPlayed(nextTrack);
        persistQueue(get());
        return nextTrack;
    },

    playPrevious: () => {
        const { queue, currentIndex, position, repeatMode } = get();
        if (queue.length === 0) return null;

        // If more than 3 seconds in, restart current track
        if (position > 3) {
            set({ position: 0 });
            return queue[currentIndex];
        }

        let prevIndex: number;
        if (currentIndex > 0) {
            prevIndex = currentIndex - 1;
        } else if (repeatMode === 'all') {
            prevIndex = queue.length - 1;
        } else {
            prevIndex = 0;
        }

        const prevTrack = queue[prevIndex];
        set({ currentIndex: prevIndex, currentTrack: prevTrack });
        persistQueue(get());
        return prevTrack;
    },

    addToRecentlyPlayed: (song: Song) => {
        const { recentlyPlayed } = get();
        const filtered = recentlyPlayed.filter(s => s.id !== song.id);
        const updated = [song, ...filtered].slice(0, MAX_RECENTLY_PLAYED);
        set({ recentlyPlayed: updated });
        setStorageItem(STORAGE_KEYS.RECENTLY_PLAYED, updated);
    },

    loadPersistedState: () => {
        const queue = getStorageItem<Song[]>(STORAGE_KEYS.QUEUE) || [];
        const currentIndex = getStorageItem<number>(STORAGE_KEYS.QUEUE_INDEX) || 0;
        const recentlyPlayed = getStorageItem<Song[]>(STORAGE_KEYS.RECENTLY_PLAYED) || [];
        const shuffleMode = getStorageItem<boolean>(STORAGE_KEYS.SHUFFLE_MODE) || false;
        const repeatMode = getStorageItem<RepeatMode>(STORAGE_KEYS.REPEAT_MODE) || 'off';

        set({
            queue,
            originalQueue: queue,
            currentIndex,
            currentTrack: queue[currentIndex] || null,
            recentlyPlayed,
            shuffleMode,
            repeatMode,
        });
    },
}));

// Helper to persist queue state
function persistQueue(state: PlayerState) {
    setStorageItem(STORAGE_KEYS.QUEUE, state.queue);
    setStorageItem(STORAGE_KEYS.QUEUE_INDEX, state.currentIndex);
}
