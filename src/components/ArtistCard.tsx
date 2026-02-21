import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Artist, ArtistDetail } from '../types';
import { colors, spacing, borderRadius, typography } from '../theme';
import { getImageUrl } from '../utils/formatters';

interface ArtistCardProps {
    artist: Artist | ArtistDetail;
    onPress?: (artist: Artist | ArtistDetail) => void;
    size?: number;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
    artist,
    onPress,
    size = 80,
}) => {
    const imageUrl = getImageUrl(artist.image);

    return (
        <TouchableOpacity
            style={[styles.container, { width: size + 16 }]}
            onPress={() => onPress?.(artist)}
            activeOpacity={0.7}
        >
            <View style={[styles.imageContainer, { width: size, height: size, borderRadius: size / 2 }]}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
                    />
                ) : (
                    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
                        <Ionicons name="person" size={size * 0.4} color={colors.textTertiary} />
                    </View>
                )}
            </View>
            <Text style={styles.name} numberOfLines={1}>{artist.name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    imageContainer: {
        overflow: 'hidden',
        backgroundColor: colors.surfaceLight,
    },
    image: {
        backgroundColor: colors.surfaceLight,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
    },
    name: {
        ...typography.caption,
        color: colors.textPrimary,
        textAlign: 'center',
    },
});
