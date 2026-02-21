import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    PanResponder,
    Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';
import { formatDuration } from '../utils/formatters';

interface ProgressBarProps {
    position: number;
    duration: number;
    onSeek: (position: number) => void;
}

const THUMB_SIZE = 14;
const BAR_HEIGHT = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProgressBar: React.FC<ProgressBarProps> = ({
    position,
    duration,
    onSeek,
}) => {
    const barWidth = SCREEN_WIDTH - spacing.xxl * 2;
    const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            const x = evt.nativeEvent.locationX;
            const newPosition = Math.max(0, Math.min((x / barWidth) * duration, duration));
            onSeek(newPosition);
        },
        onPanResponderMove: (evt) => {
            const x = evt.nativeEvent.locationX;
            const newPosition = Math.max(0, Math.min((x / barWidth) * duration, duration));
            onSeek(newPosition);
        },
        onPanResponderRelease: (evt) => {
            const x = evt.nativeEvent.locationX;
            const newPosition = Math.max(0, Math.min((x / barWidth) * duration, duration));
            onSeek(newPosition);
        },
    });

    return (
        <View style={styles.container}>
            <View
                style={[styles.barContainer, { width: barWidth }]}
                {...panResponder.panHandlers}
            >
                {/* Background track */}
                <View style={styles.track} />

                {/* Progress fill */}
                <View
                    style={[
                        styles.progress,
                        { width: `${progress * 100}%` },
                    ]}
                />

                {/* Thumb */}
                <View
                    style={[
                        styles.thumb,
                        { left: progress * barWidth - THUMB_SIZE / 2 },
                    ]}
                />
            </View>

            <View style={styles.timeContainer}>
                <Text style={styles.time}>{formatDuration(position)}</Text>
                <Text style={styles.time}>{formatDuration(duration)}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: spacing.xxl,
    },
    barContainer: {
        height: THUMB_SIZE + 8,
        justifyContent: 'center',
        position: 'relative',
    },
    track: {
        height: BAR_HEIGHT,
        backgroundColor: colors.surfaceLight,
        borderRadius: BAR_HEIGHT / 2,
        width: '100%',
    },
    progress: {
        position: 'absolute',
        height: BAR_HEIGHT,
        backgroundColor: colors.primary,
        borderRadius: BAR_HEIGHT / 2,
    },
    thumb: {
        position: 'absolute',
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: colors.primary,
        top: (THUMB_SIZE + 8 - THUMB_SIZE) / 2 - BAR_HEIGHT / 2 + BAR_HEIGHT / 2,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    time: {
        ...typography.caption,
        color: colors.textSecondary,
    },
});
