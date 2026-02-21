import { create } from 'zustand';
import { Song, Artist, AlbumDetail, SearchTab } from '../types';
import { searchSongs, searchAlbums, searchArtists } from '../api/saavnApi';

interface SearchState {
    query: string;
    activeTab: SearchTab;

    // Results
    songs: Song[];
    artists: Artist[];
    albums: AlbumDetail[];

    // Pagination
    songPage: number;
    artistPage: number;
    albumPage: number;
    hasMoreSongs: boolean;
    hasMoreArtists: boolean;
    hasMoreAlbums: boolean;
    totalSongs: number;
    totalArtists: number;
    totalAlbums: number;

    // Loading states
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;

    // Actions
    setQuery: (query: string) => void;
    setActiveTab: (tab: SearchTab) => void;
    search: (query: string) => Promise<void>;
    loadMore: () => Promise<void>;
    clearSearch: () => void;
}

const PAGE_SIZE = 20;

export const useSearchStore = create<SearchState>((set, get) => ({
    query: '',
    activeTab: 'songs',
    songs: [],
    artists: [],
    albums: [],
    songPage: 0,
    artistPage: 0,
    albumPage: 0,
    hasMoreSongs: true,
    hasMoreArtists: true,
    hasMoreAlbums: true,
    totalSongs: 0,
    totalArtists: 0,
    totalAlbums: 0,
    isLoading: false,
    isLoadingMore: false,
    error: null,

    setQuery: (query: string) => {
        set({ query });
    },

    setActiveTab: (tab: SearchTab) => {
        set({ activeTab: tab });
    },

    search: async (query: string) => {
        if (!query.trim()) {
            get().clearSearch();
            return;
        }

        set({
            isLoading: true,
            error: null,
            query,
            songs: [],
            artists: [],
            albums: [],
            songPage: 0,
            artistPage: 0,
            albumPage: 0,
            hasMoreSongs: true,
            hasMoreArtists: true,
            hasMoreAlbums: true,
        });

        try {
            const { activeTab } = get();

            if (activeTab === 'songs') {
                const response = await searchSongs(query, 0, PAGE_SIZE);
                set({
                    songs: response.data.results,
                    totalSongs: response.data.total,
                    hasMoreSongs: response.data.results.length >= PAGE_SIZE,
                    songPage: 1,
                });
            } else if (activeTab === 'albums') {
                const response = await searchAlbums(query, 0, PAGE_SIZE);
                set({
                    albums: response.data.results,
                    totalAlbums: response.data.total,
                    hasMoreAlbums: response.data.results.length >= PAGE_SIZE,
                    albumPage: 1,
                });
            } else if (activeTab === 'artists') {
                const response = await searchArtists(query, 0, PAGE_SIZE);
                set({
                    artists: response.data.results,
                    totalArtists: response.data.total,
                    hasMoreArtists: response.data.results.length >= PAGE_SIZE,
                    artistPage: 1,
                });
            }
        } catch (error: any) {
            set({ error: error.message || 'Search failed' });
        } finally {
            set({ isLoading: false });
        }
    },

    loadMore: async () => {
        const { query, activeTab, isLoadingMore } = get();
        if (!query.trim() || isLoadingMore) return;

        set({ isLoadingMore: true });

        try {
            if (activeTab === 'songs') {
                const { songPage, hasMoreSongs, songs } = get();
                if (!hasMoreSongs) return;
                const response = await searchSongs(query, songPage, PAGE_SIZE);
                set({
                    songs: [...songs, ...response.data.results],
                    hasMoreSongs: response.data.results.length >= PAGE_SIZE,
                    songPage: songPage + 1,
                });
            } else if (activeTab === 'albums') {
                const { albumPage, hasMoreAlbums, albums } = get();
                if (!hasMoreAlbums) return;
                const response = await searchAlbums(query, albumPage, PAGE_SIZE);
                set({
                    albums: [...albums, ...response.data.results],
                    hasMoreAlbums: response.data.results.length >= PAGE_SIZE,
                    albumPage: albumPage + 1,
                });
            } else if (activeTab === 'artists') {
                const { artistPage, hasMoreArtists, artists } = get();
                if (!hasMoreArtists) return;
                const response = await searchArtists(query, artistPage, PAGE_SIZE);
                set({
                    artists: [...artists, ...response.data.results],
                    hasMoreArtists: response.data.results.length >= PAGE_SIZE,
                    artistPage: artistPage + 1,
                });
            }
        } catch (error: any) {
            set({ error: error.message || 'Failed to load more results' });
        } finally {
            set({ isLoadingMore: false });
        }
    },

    clearSearch: () => {
        set({
            query: '',
            songs: [],
            artists: [],
            albums: [],
            songPage: 0,
            artistPage: 0,
            albumPage: 0,
            hasMoreSongs: true,
            hasMoreArtists: true,
            hasMoreAlbums: true,
            totalSongs: 0,
            totalArtists: 0,
            totalAlbums: 0,
            isLoading: false,
            isLoadingMore: false,
            error: null,
        });
    },
}));
