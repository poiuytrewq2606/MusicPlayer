import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { usePlayerStore } from '../stores/usePlayerStore';
import { ProgressBar } from '../components/ProgressBar';
import { PlayerControls } from '../components/PlayerControls';
import { getImageUrl, getArtistNames, decodeHtml } from '../utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH - spacing.huge * 2;

export const PlayerScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const progress = useProgress(500);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const {
        currentTrack,
        isPlaying,
        shuffleMode,
        repeatMode,
        setPosition,
        setDuration,
        setIsPlaying,
        toggleShuffle,
        cycleRepeatMode,
        playNext,
        playPrevious,
    } = usePlayerStore();

    // Update store position/duration from TrackPlayer progress
    useEffect(() => {
        setPosition(progress.position);
        setDuration(progress.duration);
    }, [progress.position, progress.duration]);

    // Vinyl rotation animation
    useEffect(() => {
        let animation: Animated.CompositeAnimation;
        if (isPlaying) {
            animation = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 10000,
                    useNativeDriver: true,
                })
            );
            animation.start();
        } else {
            rotateAnim.stopAnimation();
        }
        return () => animation?.stop();
    }, [isPlaying]);

    if (!currentTrack) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="musical-notes" size={64} color={colors.surfaceLight} />
                    <Text style={styles.emptyText}>No song playing</Text>
                </View>
            </SafeAreaView>
        );
    }

    const artwork = getImageUrl(currentTrack.image);
    const artistName = getArtistNames(currentTrack);

    const handlePlayPause = async () => {
        if (isPlaying) {
            await TrackPlayer.pause();
            setIsPlaying(false);
        } else {
            await TrackPlayer.play();
            setIsPlaying(true);
        }
    };

    const handleNext = async () => {
        const nextTrack = playNext();
        if (nextTrack) {
            try {
                await TrackPlayer.skipToNext();
                setIsPlaying(true);
            } catch {
                // skip failed
            }
        }
    };

    const handlePrevious = async () => {
        const prevTrack = playPrevious();
        if (prevTrack) {
            try {
                if (progress.position > 3) {
                    await TrackPlayer.seekTo(0);
                } else {
                    await TrackPlayer.skipToPrevious();
                }
                setIsPlaying(true);
            } catch {
                await TrackPlayer.seekTo(0);
            }
        }
    };

    const handleSeek = async (position: number) => {
        await TrackPlayer.seekTo(position);
        setPosition(position);
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#2A1810', colors.background, colors.background]}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Now Playing</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Queue')}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="list" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Album Art */}
                <View style={styles.artworkContainer}>
                    <Animated.View style={[styles.artworkWrapper, { transform: [{ rotate: spin }] }]}>
                        {artwork ? (
                            <Image
                                source={{ uri: artwork }}
                                style={styles.artwork}
                            />
                        ) : (
                            <View style={[styles.artwork, styles.artworkPlaceholder]}>
                                <Ionicons name="musical-note" size={80} color={colors.textTertiary} />
                            </View>
                        )}
                    </Animated.View>
                </View>

                {/* Song Info */}
                <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>
                        {decodeHtml(currentTrack.name)}
                    </Text>
                    <Text style={styles.artistName} numberOfLines={1}>
                        {artistName}
                    </Text>
                </View>

                {/* Progress Bar */}
                <ProgressBar
                    position={progress.position}
                    duration={progress.duration}
                    onSeek={handleSeek}
                />

                {/* Player Controls */}
                <PlayerControls
                    isPlaying={isPlaying}
                    shuffleMode={shuffleMode}
                    repeatMode={repeatMode}
                    onPlayPause={handlePlayPause}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onToggleShuffle={toggleShuffle}
                    onCycleRepeat={cycleRepeatMode}
                />

                {/* Bottom Actions */}
                <View style={styles.bottomActions}>
                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="heart-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="share-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="download-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 12,
    },
    artworkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
        flex: 1,
    },
    artworkWrapper: {
        width: ARTWORK_SIZE,
        height: ARTWORK_SIZE,
        borderRadius: ARTWORK_SIZE / 2,
        overflow: 'hidden',
        ...shadows.elevated,
    },
    artwork: {
        width: ARTWORK_SIZE,
        height: ARTWORK_SIZE,
        borderRadius: ARTWORK_SIZE / 2,
        backgroundColor: colors.surfaceLight,
    },
    artworkPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    songInfo: {
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        marginBottom: spacing.xl,
        gap: spacing.xs,
    },
    songTitle: {
        ...typography.h2,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    artistName: {
        ...typography.subtitle,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    bottomActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.huge,
        paddingBottom: spacing.xxl,
        paddingTop: spacing.md,
    },
});
