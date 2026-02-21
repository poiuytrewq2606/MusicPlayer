import { ImageQuality, DownloadUrl, Song } from '../types';

/**
 * Format seconds to mm:ss display
 */
export const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get the best quality image URL (500x500 preferred)
 */
export const getImageUrl = (images: ImageQuality[] | undefined): string => {
    if (!images || images.length === 0) return '';
    // Prefer 500x500, fallback to last (highest quality), then first
    const preferred = images.find(img => img.quality === '500x500' || img.url?.includes('500x500'));
    if (preferred) return preferred.url;
    return images[images.length - 1]?.url || images[0]?.url || '';
};

/**
 * Get a smaller thumbnail image (150x150)
 */
export const getThumbnailUrl = (images: ImageQuality[] | undefined): string => {
    if (!images || images.length === 0) return '';
    const preferred = images.find(img => img.quality === '150x150' || img.url?.includes('150x150'));
    if (preferred) return preferred.url;
    return images[0]?.url || '';
};

/**
 * Get the best quality download URL (320kbps preferred)
 */
export const getDownloadUrl = (urls: DownloadUrl[] | undefined): string => {
    if (!urls || urls.length === 0) return '';
    const preferred = urls.find(u => u.quality === '320kbps');
    if (preferred) return preferred.url;
    // Fallback to 160kbps, then 96kbps, then any
    const fallback = urls.find(u => u.quality === '160kbps') ||
        urls.find(u => u.quality === '96kbps') ||
        urls[urls.length - 1];
    return fallback?.url || '';
};

/**
 * Get primary artist names as a comma-separated string
 */
export const getArtistNames = (song: Song): string => {
    if (!song.artists?.primary || song.artists.primary.length === 0) return 'Unknown Artist';
    return song.artists.primary.map(a => a.name).join(', ');
};

/**
 * Format play count for display (e.g., 1.5M, 200K)
 */
export const formatPlayCount = (count: number | null | undefined): string => {
    if (!count) return '';
    if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
};

/**
 * Decode HTML entities in song/album names
 */
export const decodeHtml = (text: string): string => {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ');
};
