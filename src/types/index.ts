// Core data types for the Music Player app

export interface ImageQuality {
  quality: string;
  url: string;
}

export interface DownloadUrl {
  quality: string;
  url: string;
}

export interface Artist {
  id: string;
  name: string;
  role?: string;
  type?: string;
  image: ImageQuality[];
  url?: string;
}

export interface Album {
  id: string | null;
  name: string | null;
  url?: string | null;
}

export interface Song {
  id: string;
  name: string;
  type?: string;
  year?: string | null;
  releaseDate?: string | null;
  duration: number | null;
  label?: string | null;
  explicitContent?: boolean;
  playCount?: number | null;
  language?: string;
  hasLyrics?: boolean;
  lyricsId?: string | null;
  url?: string;
  copyright?: string | null;
  album: Album;
  artists: {
    primary: Artist[];
    featured?: Artist[];
    all?: Artist[];
  };
  image: ImageQuality[];
  downloadUrl: DownloadUrl[];
}

export interface SearchSongsResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: Song[];
  };
}

export interface SearchArtistsResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: Artist[];
  };
}

export interface AlbumDetail {
  id: string;
  name: string;
  description?: string;
  year?: number | null;
  type?: string;
  playCount?: number | null;
  language?: string;
  explicitContent?: boolean;
  artists: {
    primary: Artist[];
    featured?: Artist[];
    all?: Artist[];
  };
  songCount?: number | null;
  url?: string;
  image: ImageQuality[];
  songs?: Song[] | null;
}

export interface SearchAlbumsResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: AlbumDetail[];
  };
}

export interface ArtistDetail {
  id: string;
  name: string;
  url?: string;
  type?: string;
  image: ImageQuality[];
  followerCount?: number | null;
  fanCount?: string | null;
  isVerified?: boolean | null;
  dominantLanguage?: string | null;
  topSongs?: Song[] | null;
  topAlbums?: AlbumDetail[] | null;
}

export interface GlobalSearchResponse {
  success: boolean;
  data: {
    albums: {
      results: Array<{
        id: string;
        title: string;
        image: ImageQuality[];
        artist: string;
        url: string;
        type: string;
        description: string;
        year: string;
        language: string;
      }>;
    };
    songs: {
      results: Array<{
        id: string;
        title: string;
        image: ImageQuality[];
        album: string;
        url: string;
        type: string;
        description: string;
        primaryArtists: string;
        singers: string;
        language: string;
      }>;
    };
    artists: {
      results: Array<{
        id: string;
        title: string;
        image: ImageQuality[];
        type: string;
        description: string;
      }>;
    };
    playlists: {
      results: Array<{
        id: string;
        title: string;
        image: ImageQuality[];
        url: string;
        language: string;
        type: string;
        description: string;
      }>;
    };
  };
}

export type RepeatMode = 'off' | 'one' | 'all';

export type SearchTab = 'songs' | 'artists' | 'albums';
