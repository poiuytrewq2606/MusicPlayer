import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song, AlbumDetail } from '../types';
import { colors, spacing, borderRadius, typography } from '../theme';
import { getImageUrl, decodeHtml } from '../utils/formatters';

interface AlbumCardProps {
    album?: AlbumDetail;
    song?: Song;
    onPress?: () => void;
    size?: number;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
    album,
    song,
    onPress,
    size = 140,
}) => {
    const imageUrl = album ? getImageUrl(album.image) : song ? getImageUrl(song.image) : '';
    const title = album ? album.name : song ? decodeHtml(song.name) : '';
    const subtitle = album
        ? album.artists?.primary?.map(a => a.name).join(', ') || ''
        : song
            ? song.artists?.primary?.map(a => a.name).join(', ') || ''
            : '';

    return (
        <TouchableOpacity
            style={[styles.container, { width: size }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.imageContainer, { width: size, height: size }]}>
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={[styles.image, { width: size, height: size }]} />
                ) : (
                    <View style={[styles.placeholder, { width: size, height: size }]}>
                        <Ionicons name="disc" size={size * 0.3} color={colors.textTertiary} />
                    </View>
                )}
            </View>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing.xs,
    },
    imageContainer: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        backgroundColor: colors.surfaceLight,
    },
    image: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surfaceLight,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.lg,
    },
    title: {
        ...typography.bodyMedium,
        color: colors.textPrimary,
    },
    subtitle: {
        ...typography.caption,
        color: colors.textSecondary,
    },
});
