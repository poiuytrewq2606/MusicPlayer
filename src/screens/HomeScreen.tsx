import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    StyleSheet,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Song, ArtistDetail } from '../types';
import { colors, spacing, typography } from '../theme';
import { SongCard } from '../components/SongCard';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { usePlayerStore } from '../stores/usePlayerStore';
import { getTrendingSongs, getRecommendedSongs, getPopularArtists } from '../api/saavnApi';
import { playQueue, addToTrackPlayerQueue } from '../services/trackPlayerService';

export const HomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { currentTrack, recentlyPlayed } = usePlayerStore();

    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
    const [artists, setArtists] = useState<ArtistDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [trending, recommended, popularArtists] = await Promise.all([
                getTrendingSongs(),
                getRecommendedSongs(),
                getPopularArtists(),
            ]);
            setTrendingSongs(trending);
            setRecommendedSongs(recommended);
            setArtists(popularArtists);
        } catch (error) {
            console.log('Failed to load home data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleSongPress = async (song: Song, songList: Song[], index: number) => {
        await playQueue(songList, index);
        navigation.navigate('Player');
    };

    const handleAddToQueue = async (song: Song) => {
        usePlayerStore.getState().addToQueue(song);
        await addToTrackPlayerQueue(song);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                        progressBackgroundColor={colors.surface}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good Evening 🎵</Text>
                        <Text style={styles.appName}>Mume</Text>
                    </View>
                </View>

                {/* Recently Played */}
                {recentlyPlayed.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recently Played</Text>
                        <FlatList
                            data={recentlyPlayed.slice(0, 10)}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            keyExtractor={(item) => `recent-${item.id}`}
                            renderItem={({ item, index }) => (
                                <AlbumCard
                                    song={item}
                                    size={130}
                                    onPress={() => handleSongPress(item, recentlyPlayed, index)}
                                />
                            )}
                        />
                    </View>
                )}

                {/* Trending Songs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trending Now 🔥</Text>
                    <FlatList
                        data={trendingSongs.slice(0, 10)}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                        keyExtractor={(item) => `trending-${item.id}`}
                        renderItem={({ item, index }) => (
                            <AlbumCard
                                song={item}
                                size={140}
                                onPress={() => handleSongPress(item, trendingSongs, index)}
                            />
                        )}
                    />
                </View>

                {/* Artists */}
                {artists.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Popular Artists</Text>
                        <FlatList
                            data={artists}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            keyExtractor={(item) => `artist-${item.id}`}
                            renderItem={({ item }) => (
                                <ArtistCard artist={item} size={80} />
                            )}
                        />
                    </View>
                )}

                {/* Recommended Songs List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    {recommendedSongs.slice(0, 10).map((song, index) => (
                        <SongCard
                            key={`rec-${song.id}`}
                            song={song}
                            index={index}
                            onPress={() => handleSongPress(song, recommendedSongs, index)}
                            onLongPress={() => handleAddToQueue(song)}
                            isPlaying={currentTrack?.id === song.id}
                        />
                    ))}
                </View>

                {/* Bottom padding for mini player */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    greeting: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    appName: {
        ...typography.h1,
        color: colors.textPrimary,
    },
    section: {
        marginBottom: spacing.xxl,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    horizontalList: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
});
