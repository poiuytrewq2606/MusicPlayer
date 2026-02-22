import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song } from '../types';
import { getDownloadUrl, getImageUrl, getArtistNames, decodeHtml } from '../utils/formatters';
import { usePlayerStore } from '../stores/usePlayerStore';

let sound: Audio.Sound | null = null;

/**
 * Initialize the audio system
 */
export async function setupPlayer(): Promise<boolean> {
    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });
        return true;
    } catch (error) {
        console.log('Audio setup error:', error);
        return false;
    }
}

/**
 * Playback status update handler
 */
function onPlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (!status.isLoaded) return;

    const store = usePlayerStore.getState();
    store.setPosition(status.positionMillis / 1000);
    store.setDuration((status.durationMillis || 0) / 1000);

    if (status.isPlaying !== store.isPlaying) {
        store.setIsPlaying(status.isPlaying);
    }

    // Track finished
    if (status.didJustFinish) {
        handleTrackEnd();
    }
}

/**
 * Handle track ending — auto-play next based on repeat mode
 */
async function handleTrackEnd() {
    const store = usePlayerStore.getState();

    if (store.repeatMode === 'one') {
        // Replay current track
        if (sound) {
            await sound.replayAsync();
        }
        return;
    }

    const nextTrack = store.playNext();
    if (nextTrack) {
        await loadAndPlay(nextTrack);
    } else if (store.repeatMode === 'all') {
        // Restart from beginning
        const firstTrack = store.queue[0];
        if (firstTrack) {
            store.setCurrentTrack(firstTrack);
            await loadAndPlay(firstTrack);
        }
    } else {
        store.setIsPlaying(false);
    }
}

/**
 * Load and play a song
 */
async function loadAndPlay(song: Song): Promise<void> {
    const url = getDownloadUrl(song.downloadUrl);
    if (!url) {
        console.log('No download URL for song:', song.name);
        return;
    }

    try {
        // Unload previous sound
        if (sound) {
            await sound.unloadAsync();
            sound = null;
        }

        // Create and play new sound
        const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: true, progressUpdateIntervalMillis: 500 },
            onPlaybackStatusUpdate
        );

        sound = newSound;
    } catch (error) {
        console.log('Failed to play song:', error);
    }
}

/**
 * Play a song immediately
 */
export async function playSong(song: Song): Promise<void> {
    const store = usePlayerStore.getState();
    store.setCurrentTrack(song);
    store.setIsPlaying(true);
    await loadAndPlay(song);
}

/**
 * Play a queue of songs starting from index
 */
export async function playQueue(songs: Song[], startIndex: number = 0): Promise<void> {
    const store = usePlayerStore.getState();
    store.setQueue(songs, startIndex);
    store.setIsPlaying(true);
    await loadAndPlay(songs[startIndex]);
}

/**
 * Add a song to the queue (no immediate playback)
 */
export async function addToTrackPlayerQueue(song: Song): Promise<void> {
    // Just adds to Zustand store — actual playback happens when track is reached
    usePlayerStore.getState().addToQueue(song);
}

/**
 * Toggle play/pause
 */
export async function togglePlayPause(): Promise<void> {
    if (!sound) return;

    const store = usePlayerStore.getState();
    if (store.isPlaying) {
        await sound.pauseAsync();
        store.setIsPlaying(false);
    } else {
        await sound.playAsync();
        store.setIsPlaying(true);
    }
}

/**
 * Seek to a position (in seconds)
 */
export async function seekTo(positionSeconds: number): Promise<void> {
    if (!sound) return;
    await sound.setPositionAsync(positionSeconds * 1000);
    usePlayerStore.getState().setPosition(positionSeconds);
}

/**
 * Skip to next track
 */
export async function skipToNext(): Promise<void> {
    const store = usePlayerStore.getState();
    const nextTrack = store.playNext();
    if (nextTrack) {
        await loadAndPlay(nextTrack);
        store.setIsPlaying(true);
    }
}

/**
 * Skip to previous track
 */
export async function skipToPrevious(): Promise<void> {
    const store = usePlayerStore.getState();
    const position = store.position;

    // If more than 3 seconds in, restart current track
    if (position > 3 && sound) {
        await sound.setPositionAsync(0);
        store.setPosition(0);
        return;
    }

    const prevTrack = store.playPrevious();
    if (prevTrack) {
        await loadAndPlay(prevTrack);
        store.setIsPlaying(true);
    }
}

// Background playback service — no-op for expo-av (handled by Audio.setAudioModeAsync)
export async function PlaybackService() { }
