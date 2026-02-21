import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../stores/usePlayerStore';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { getThumbnailUrl, getArtistNames, decodeHtml } from '../utils/formatters';
import TrackPlayer from 'react-native-track-player';

interface MiniPlayerProps {
    onPress: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onPress }) => {
    const { currentTrack, isPlaying, position, duration } = usePlayerStore();

    if (!currentTrack) return null;

    const thumbnail = getThumbnailUrl(currentTrack.image);
    const artistName = getArtistNames(currentTrack);
    const progress = duration > 0 ? position / duration : 0;

    const handlePlayPause = async () => {
        if (isPlaying) {
            await TrackPlayer.pause();
            usePlayerStore.getState().setIsPlaying(false);
        } else {
            await TrackPlayer.play();
            usePlayerStore.getState().setIsPlaying(true);
        }
    };

    const handleNext = async () => {
        const store = usePlayerStore.getState();
        const nextTrack = store.playNext();
        if (nextTrack) {
            try {
                await TrackPlayer.skipToNext();
                store.setIsPlaying(true);
            } catch {
                // If skip fails, just continue
            }
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Progress bar at top */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>

            <View style={styles.content}>
                {/* Album art */}
                <View style={styles.imageContainer}>
                    {thumbnail ? (
                        <Image source={{ uri: thumbnail }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, styles.placeholder]}>
                            <Ionicons name="musical-note" size={16} color={colors.textTertiary} />
                        </View>
                    )}
                </View>

                {/* Song info */}
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                        {decodeHtml(currentTrack.name)}
                    </Text>
                    <Text style={styles.artist} numberOfLines={1}>
                        {artistName}
                    </Text>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        onPress={handlePlayPause}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.controlButton}
                    >
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={24}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleNext}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.controlButton}
                    >
                        <Ionicons name="play-skip-forward" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.elevated,
    },
    progressContainer: {
        height: 2,
        backgroundColor: colors.surfaceLight,
        width: '100%',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.md,
    },
    imageContainer: {
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    image: {
        width: 42,
        height: 42,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.surfaceLight,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        gap: 1,
    },
    title: {
        ...typography.bodyMedium,
        color: colors.textPrimary,
        fontSize: 13,
    },
    artist: {
        ...typography.caption,
        color: colors.textSecondary,
        fontSize: 11,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    controlButton: {
        padding: spacing.xs,
    },
});
