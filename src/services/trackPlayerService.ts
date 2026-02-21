import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    Event,
    RepeatMode,
} from 'react-native-track-player';
import { usePlayerStore } from '../stores/usePlayerStore';
import { Song } from '../types';
import { getDownloadUrl, getImageUrl, getArtistNames, decodeHtml } from '../utils/formatters';

/**
 * Initialize Track Player with configuration and capabilities
 */
export async function setupPlayer(): Promise<boolean> {
    try {
        await TrackPlayer.setupPlayer({
            maxCacheSize: 1024 * 5, // 5MB cache
        });

        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior:
                    AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.SeekTo,
                Capability.Stop,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
            ],
            progressUpdateEventInterval: 1,
        });

        return true;
    } catch (error) {
        console.log('Player setup error:', error);
        return false;
    }
}

/**
 * Convert a Song object to a TrackPlayer track
 */
export function songToTrack(song: Song) {
    return {
        id: song.id,
        url: getDownloadUrl(song.downloadUrl),
        title: decodeHtml(song.name),
        artist: getArtistNames(song),
        artwork: getImageUrl(song.image),
        duration: song.duration || 0,
        album: song.album?.name ? decodeHtml(song.album.name) : undefined,
    };
}

/**
 * Play a song immediately (clears queue and starts fresh)
 */
export async function playSong(song: Song): Promise<void> {
    const track = songToTrack(song);
    await TrackPlayer.reset();
    await TrackPlayer.add(track);
    await TrackPlayer.play();

    const store = usePlayerStore.getState();
    store.setCurrentTrack(song);
    store.setIsPlaying(true);
}

/**
 * Play a list of songs starting from a specific index
 */
export async function playQueue(songs: Song[], startIndex: number = 0): Promise<void> {
    const tracks = songs.map(songToTrack);
    await TrackPlayer.reset();
    await TrackPlayer.add(tracks);
    if (startIndex > 0) {
        await TrackPlayer.skip(startIndex);
    }
    await TrackPlayer.play();

    const store = usePlayerStore.getState();
    store.setQueue(songs, startIndex);
    store.setIsPlaying(true);
}

/**
 * Add a song to the end of the TrackPlayer queue
 */
export async function addToTrackPlayerQueue(song: Song): Promise<void> {
    const track = songToTrack(song);
    await TrackPlayer.add(track);
}

/**
 * Playback service handler — runs in the background
 */
export async function PlaybackService() {
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        TrackPlayer.play();
        usePlayerStore.getState().setIsPlaying(true);
    });

    TrackPlayer.addEventListener(Event.RemotePause, () => {
        TrackPlayer.pause();
        usePlayerStore.getState().setIsPlaying(false);
    });

    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
        const store = usePlayerStore.getState();
        const nextTrack = store.playNext();
        if (nextTrack) {
            await TrackPlayer.skipToNext();
            store.setIsPlaying(true);
        }
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
        const store = usePlayerStore.getState();
        const prevTrack = store.playPrevious();
        if (prevTrack) {
            await TrackPlayer.skipToPrevious();
            store.setIsPlaying(true);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
        TrackPlayer.seekTo(event.position);
        usePlayerStore.getState().setPosition(event.position);
    });

    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
        if (event.track) {
            const store = usePlayerStore.getState();
            const { queue, currentIndex } = store;
            // Find the track in our queue by id
            const trackIndex = queue.findIndex(s => s.id === event.track?.id);
            if (trackIndex >= 0 && trackIndex !== currentIndex) {
                store.setCurrentTrack(queue[trackIndex]);
            }
        }
    });

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
        const store = usePlayerStore.getState();
        if (store.repeatMode === 'all') {
            await TrackPlayer.skip(0);
            await TrackPlayer.play();
        } else {
            store.setIsPlaying(false);
        }
    });
}
