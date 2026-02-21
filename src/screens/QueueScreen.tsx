import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { usePlayerStore } from '../stores/usePlayerStore';
import {
    getThumbnailUrl,
    getArtistNames,
    formatDuration,
    decodeHtml,
} from '../utils/formatters';
import { playQueue } from '../services/trackPlayerService';
import { Song } from '../types';

export const QueueScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const {
        queue,
        currentIndex,
        currentTrack,
        removeFromQueue,
        clearQueue,
        setQueue,
    } = usePlayerStore();

    const handleSongPress = async (index: number) => {
        if (queue.length > 0) {
            await playQueue(queue, index);
            navigation.navigate('Player');
        }
    };

    const handleRemove = (index: number) => {
        removeFromQueue(index);
    };

    const renderItem = ({ item, index }: { item: Song; index: number }) => {
        const isCurrentlyPlaying = index === currentIndex;
        const thumbnail = getThumbnailUrl(item.image);
        const artistName = getArtistNames(item);

        return (
            <TouchableOpacity
                style={[
                    styles.songItem,
                    isCurrentlyPlaying && styles.songItemActive,
                ]}
                onPress={() => handleSongPress(index)}
                activeOpacity={0.7}
            >
                {/* Drag handle */}
                <View style={styles.dragHandle}>
                    <Ionicons name="menu" size={20} color={colors.textTertiary} />
                </View>

                {/* Thumbnail */}
                <View style={styles.imageContainer}>
                    {thumbnail ? (
                        <Image source={{ uri: thumbnail }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, styles.placeholder]}>
                            <Ionicons name="musical-note" size={16} color={colors.textTertiary} />
                        </View>
                    )}
                    {isCurrentlyPlaying && (
                        <View style={styles.playingOverlay}>
                            <Ionicons name="volume-high" size={14} color={colors.primary} />
                        </View>
                    )}
                </View>

                {/* Song info */}
                <View style={styles.songInfo}>
                    <Text
                        style={[styles.songTitle, isCurrentlyPlaying && styles.songTitleActive]}
                        numberOfLines={1}
                    >
                        {decodeHtml(item.name)}
                    </Text>
                    <Text style={styles.artistName} numberOfLines={1}>
                        {artistName}
                    </Text>
                </View>

                {/* Duration */}
                <Text style={styles.duration}>{formatDuration(item.duration)}</Text>

                {/* Delete button */}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemove(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderCurrentlyPlaying = () => {
        if (!currentTrack) return null;
        const artwork = getThumbnailUrl(currentTrack.image);
        const artistName = getArtistNames(currentTrack);

        return (
            <TouchableOpacity
                style={styles.nowPlaying}
                onPress={() => navigation.navigate('Player')}
                activeOpacity={0.8}
            >
                <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
                <View style={styles.nowPlayingContent}>
                    {artwork ? (
                        <Image source={{ uri: artwork }} style={styles.nowPlayingImage} />
                    ) : (
                        <View style={[styles.nowPlayingImage, styles.placeholder]}>
                            <Ionicons name="musical-note" size={20} color={colors.textTertiary} />
                        </View>
                    )}
                    <View style={styles.nowPlayingInfo}>
                        <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                            {decodeHtml(currentTrack.name)}
                        </Text>
                        <Text style={styles.nowPlayingArtist} numberOfLines={1}>
                            {artistName}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Queue</Text>
                {queue.length > 0 ? (
                    <TouchableOpacity onPress={clearQueue}>
                        <Text style={styles.clearButton}>Clear</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            {/* Currently Playing */}
            {renderCurrentlyPlaying()}

            {/* Queue list */}
            {queue.length > 0 ? (
                <>
                    <View style={styles.queueHeader}>
                        <Text style={styles.queueTitle}>Up Next</Text>
                        <Text style={styles.queueCount}>{queue.length} songs</Text>
                    </View>
                    <FlatList
                        data={queue}
                        keyExtractor={(item, index) => `queue-${item.id}-${index}`}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="list" size={64} color={colors.surfaceLight} />
                    <Text style={styles.emptyTitle}>Queue is empty</Text>
                    <Text style={styles.emptySubtitle}>
                        Add songs to your queue from the home or search screen
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    clearButton: {
        ...typography.bodyMedium,
        color: colors.primary,
    },
    nowPlaying: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    nowPlayingLabel: {
        ...typography.small,
        color: colors.primary,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    nowPlayingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    nowPlayingImage: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
    },
    nowPlayingInfo: {
        flex: 1,
        gap: 2,
    },
    nowPlayingTitle: {
        ...typography.subtitle,
        color: colors.textPrimary,
    },
    nowPlayingArtist: {
        ...typography.body,
        color: colors.textSecondary,
    },
    queueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    queueTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    queueCount: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    listContent: {
        paddingBottom: 100,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    songItemActive: {
        backgroundColor: colors.surfaceLight,
        marginHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
    },
    dragHandle: {
        padding: spacing.xs,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.surfaceLight,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    playingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    songInfo: {
        flex: 1,
        gap: 2,
    },
    songTitle: {
        ...typography.bodyMedium,
        color: colors.textPrimary,
        fontSize: 13,
    },
    songTitleActive: {
        color: colors.primary,
    },
    artistName: {
        ...typography.caption,
        color: colors.textSecondary,
        fontSize: 11,
    },
    duration: {
        ...typography.caption,
        color: colors.textTertiary,
    },
    deleteButton: {
        padding: spacing.xs,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.xxxl,
    },
    emptyTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    emptySubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
