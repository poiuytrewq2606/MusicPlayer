import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { RepeatMode } from '../types';

interface PlayerControlsProps {
    isPlaying: boolean;
    shuffleMode: boolean;
    repeatMode: RepeatMode;
    onPlayPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onToggleShuffle: () => void;
    onCycleRepeat: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
    isPlaying,
    shuffleMode,
    repeatMode,
    onPlayPause,
    onNext,
    onPrevious,
    onToggleShuffle,
    onCycleRepeat,
}) => {
    const getRepeatIcon = (): string => {
        if (repeatMode === 'one') return 'repeat';
        return 'repeat';
    };

    return (
        <View style={styles.container}>
            {/* Shuffle */}
            <TouchableOpacity
                onPress={onToggleShuffle}
                style={styles.sideButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons
                    name="shuffle"
                    size={24}
                    color={shuffleMode ? colors.primary : colors.textSecondary}
                />
            </TouchableOpacity>

            {/* Previous */}
            <TouchableOpacity
                onPress={onPrevious}
                style={styles.controlButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="play-skip-back" size={28} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity
                onPress={onPlayPause}
                style={styles.playButton}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={32}
                    color={colors.black}
                    style={!isPlaying ? { marginLeft: 3 } : undefined}
                />
            </TouchableOpacity>

            {/* Next */}
            <TouchableOpacity
                onPress={onNext}
                style={styles.controlButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="play-skip-forward" size={28} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Repeat */}
            <TouchableOpacity
                onPress={onCycleRepeat}
                style={styles.sideButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <View>
                    <Ionicons
                        name="repeat"
                        size={24}
                        color={repeatMode !== 'off' ? colors.primary : colors.textSecondary}
                    />
                    {repeatMode === 'one' && (
                        <View style={styles.repeatOneBadge}>
                            <Ionicons name="ellipse" size={6} color={colors.primary} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xl,
        paddingVertical: spacing.lg,
    },
    sideButton: {
        padding: spacing.sm,
    },
    controlButton: {
        padding: spacing.sm,
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    repeatOneBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
    },
});
