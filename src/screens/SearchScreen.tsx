import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme';
import { SearchBar } from '../components/SearchBar';
import { SongCard } from '../components/SongCard';
import { ArtistCard } from '../components/ArtistCard';
import { AlbumCard } from '../components/AlbumCard';
import { useSearchStore } from '../stores/useSearchStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useDebounce } from '../hooks/useDebounce';
import { playQueue, addToTrackPlayerQueue } from '../services/trackPlayerService';
import { SearchTab, Song } from '../types';
import { Ionicons } from '@expo/vector-icons';

const TABS: { key: SearchTab; label: string }[] = [
    { key: 'songs', label: 'Songs' },
    { key: 'artists', label: 'Artists' },
    { key: 'albums', label: 'Albums' },
];

export const SearchScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const {
        query,
        activeTab,
        songs,
        artists,
        albums,
        isLoading,
        isLoadingMore,
        setQuery,
        setActiveTab,
        search,
        loadMore,
        clearSearch,
    } = useSearchStore();

    const currentTrack = usePlayerStore(s => s.currentTrack);
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        if (debouncedQuery.trim()) {
            search(debouncedQuery);
        }
    }, [debouncedQuery, activeTab]);

    const handleSongPress = useCallback(async (song: Song, index: number) => {
        await playQueue(songs, index);
        navigation.navigate('Player');
    }, [songs, navigation]);

    const handleAddToQueue = useCallback(async (song: Song) => {
        usePlayerStore.getState().addToQueue(song);
        await addToTrackPlayerQueue(song);
    }, []);

    const handleTabChange = (tab: SearchTab) => {
        setActiveTab(tab);
    };

    const renderEmpty = () => {
        if (isLoading) return null;
        if (!query.trim()) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={64} color={colors.surfaceLight} />
                    <Text style={styles.emptyTitle}>Search for Music</Text>
                    <Text style={styles.emptySubtitle}>
                        Find your favorite songs, artists, and albums
                    </Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="musical-notes-outline" size={64} color={colors.surfaceLight} />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtitle}>
                    Try a different search term
                </Text>
            </View>
        );
    };

    const renderSongsList = () => (
        <FlatList
            data={songs}
            keyExtractor={(item) => `search-song-${item.id}`}
            renderItem={({ item, index }) => (
                <SongCard
                    song={item}
                    onPress={() => handleSongPress(item, index)}
                    onLongPress={() => handleAddToQueue(item)}
                    isPlaying={currentTrack?.id === item.id}
                />
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                isLoadingMore ? (
                    <ActivityIndicator color={colors.primary} style={styles.loadingMore} />
                ) : null
            }
            ListEmptyComponent={renderEmpty()}
            contentContainerStyle={songs.length === 0 ? styles.emptyList : styles.list}
            showsVerticalScrollIndicator={false}
        />
    );

    const renderArtistsList = () => (
        <FlatList
            data={artists}
            numColumns={3}
            keyExtractor={(item) => `search-artist-${item.id}`}
            renderItem={({ item }) => (
                <View style={styles.artistItem}>
                    <ArtistCard artist={item} size={90} />
                </View>
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmpty()}
            contentContainerStyle={artists.length === 0 ? styles.emptyList : styles.gridList}
            showsVerticalScrollIndicator={false}
        />
    );

    const renderAlbumsList = () => (
        <FlatList
            data={albums}
            numColumns={2}
            keyExtractor={(item) => `search-album-${item.id}`}
            renderItem={({ item }) => (
                <View style={styles.albumItem}>
                    <AlbumCard album={item} size={160} />
                </View>
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmpty()}
            contentContainerStyle={albums.length === 0 ? styles.emptyList : styles.gridList}
            showsVerticalScrollIndicator={false}
        />
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search</Text>
            </View>

            {/* Search Bar */}
            <SearchBar
                value={query}
                onChangeText={setQuery}
                onClear={clearSearch}
            />

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => handleTabChange(tab.key)}
                    >
                        <Text
                            style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Loading */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <View style={styles.results}>
                    {activeTab === 'songs' && renderSongsList()}
                    {activeTab === 'artists' && renderArtistsList()}
                    {activeTab === 'albums' && renderAlbumsList()}
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    headerTitle: {
        ...typography.h1,
        color: colors.textPrimary,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        gap: spacing.sm,
    },
    tab: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        backgroundColor: colors.surfaceLight,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        ...typography.bodyMedium,
        color: colors.textSecondary,
    },
    tabTextActive: {
        color: colors.black,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    results: {
        flex: 1,
        marginTop: spacing.md,
    },
    list: {
        paddingBottom: 100,
    },
    gridList: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100,
    },
    emptyList: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxxl,
        gap: spacing.md,
    },
    emptyTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    artistItem: {
        flex: 1 / 3,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    albumItem: {
        flex: 1 / 2,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    loadingMore: {
        paddingVertical: spacing.lg,
    },
});
