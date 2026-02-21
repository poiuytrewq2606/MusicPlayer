import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../types';
import { colors, spacing, borderRadius, typography } from '../theme';
import { getThumbnailUrl, getArtistNames, formatDuration, decodeHtml } from '../utils/formatters';

interface SongCardProps {
    song: Song;
    onPress: (song: Song) => void;
    onLongPress?: (song: Song) => void;
    index?: number;
    showDuration?: boolean;
    isPlaying?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({
    song,
    onPress,
    onLongPress,
    index,
    showDuration = true,
    isPlaying = false,
}) => {
    const thumbnail = getThumbnailUrl(song.image);
    const artistName = getArtistNames(song);

    return (
        <TouchableOpacity
            style={[styles.container, isPlaying && styles.containerActive]}
            onPress={() => onPress(song)}
            onLongPress={() => onLongPress?.(song)}
            activeOpacity={0.7}
        >
            {index !== undefined && (
                <Text style={styles.index}>{index + 1}</Text>
            )}

            <View style={styles.imageContainer}>
                {thumbnail ? (
                    <Image source={{ uri: thumbnail }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.placeholder]}>
                        <Ionicons name="musical-note" size={20} color={colors.textTertiary} />
                    </View>
                )}
                {isPlaying && (
                    <View style={styles.playingOverlay}>
                        <Ionicons name="volume-high" size={16} color={colors.primary} />
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <Text style={[styles.title, isPlaying && styles.titleActive]} numberOfLines={1}>
                    {decodeHtml(song.name)}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {artistName}
                </Text>
            </View>

            {showDuration && song.duration && (
                <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
            )}

            <TouchableOpacity
                style={styles.moreButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    containerActive: {
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
    },
    index: {
        width: 24,
        ...typography.bodyMedium,
        color: colors.textTertiary,
        textAlign: 'center',
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    playingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        justifyContent: 'center',
        gap: 2,
    },
    title: {
        ...typography.bodyMedium,
        color: colors.textPrimary,
    },
    titleActive: {
        color: colors.primary,
    },
    artist: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    duration: {
        ...typography.caption,
        color: colors.textTertiary,
        marginRight: spacing.xs,
    },
    moreButton: {
        padding: spacing.xs,
    },
});
