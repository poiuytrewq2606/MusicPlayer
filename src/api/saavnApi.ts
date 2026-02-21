import {
    Song,
    SearchSongsResponse,
    SearchAlbumsResponse,
    SearchArtistsResponse,
    GlobalSearchResponse,
    ArtistDetail,
} from '../types';

const BASE_URL = 'https://saavn.sumit.co';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data as T;
}

// ─── Search APIs ───────────────────────────────────────────

/**
 * Global search across songs, albums, artists, playlists
 */
export async function globalSearch(query: string): Promise<GlobalSearchResponse> {
    return apiFetch<GlobalSearchResponse>(
        `/api/search?query=${encodeURIComponent(query)}`
    );
}

/**
 * Search for songs with pagination
 */
export async function searchSongs(
    query: string,
    page: number = 0,
    limit: number = 20
): Promise<SearchSongsResponse> {
    return apiFetch<SearchSongsResponse>(
        `/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
}

/**
 * Search for albums with pagination
 */
export async function searchAlbums(
    query: string,
    page: number = 0,
    limit: number = 20
): Promise<SearchAlbumsResponse> {
    return apiFetch<SearchAlbumsResponse>(
        `/api/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
}

/**
 * Search for artists with pagination
 */
export async function searchArtists(
    query: string,
    page: number = 0,
    limit: number = 20
): Promise<SearchArtistsResponse> {
    return apiFetch<SearchArtistsResponse>(
        `/api/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
}

// ─── Songs APIs ────────────────────────────────────────────

/**
 * Get song(s) by ID(s)
 */
export async function getSongsById(
    ids: string | string[]
): Promise<{ success: boolean; data: Song[] }> {
    const idStr = Array.isArray(ids) ? ids.join(',') : ids;
    return apiFetch<{ success: boolean; data: Song[] }>(
        `/api/songs/${idStr}`
    );
}

/**
 * Get song suggestions based on a song ID
 */
export async function getSongSuggestions(
    id: string,
    limit: number = 10
): Promise<{ success: boolean; data: Song[] }> {
    return apiFetch<{ success: boolean; data: Song[] }>(
        `/api/songs/${id}/suggestions?limit=${limit}`
    );
}

// ─── Artists APIs ──────────────────────────────────────────

/**
 * Get artist details by ID
 */
export async function getArtistById(
    id: string
): Promise<{ success: boolean; data: ArtistDetail }> {
    return apiFetch<{ success: boolean; data: ArtistDetail }>(
        `/api/artists/${id}`
    );
}

/**
 * Get an artist's songs
 */
export async function getArtistSongs(
    id: string,
    page: number = 0,
    sortBy: string = 'popularity',
    sortOrder: string = 'desc'
): Promise<{ success: boolean; data: { total: number; songs: Song[] } }> {
    return apiFetch(
        `/api/artists/${id}/songs?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
}

// ─── Trending/Discover ─────────────────────────────────────

/**
 * Get trending songs by searching popular queries
 */
export async function getTrendingSongs(): Promise<Song[]> {
    try {
        const response = await searchSongs('trending', 0, 20);
        return response.data?.results || [];
    } catch {
        return [];
    }
}

/**
 * Get recommended songs (using a popular query as seed)
 */
export async function getRecommendedSongs(): Promise<Song[]> {
    try {
        const response = await searchSongs('bollywood hits', 0, 15);
        return response.data?.results || [];
    } catch {
        return [];
    }
}

/**
 * Get popular artists
 */
export async function getPopularArtists(): Promise<ArtistDetail[]> {
    const artistIds = ['459320', '456323', '455926', '881158', '464656'];
    const results: ArtistDetail[] = [];
    for (const id of artistIds) {
        try {
            const response = await getArtistById(id);
            if (response.success) {
                results.push(response.data);
            }
        } catch {
            // Skip failed artist fetches
        }
    }
    return results;
}
