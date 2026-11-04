// Parse common YouTube URL formats so checks and previews use the same video ID.
export function getYouTubeVideoId(link: string): string | null {
    try {
        const url = new URL(link);
        const hostname = url.hostname.replace(/^www\./, '');
        let videoId: string | null = null;

        if (hostname === 'youtu.be') {
            videoId = url.pathname.split('/').filter(Boolean)[0] ?? null;
        } else if (hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'youtube-nocookie.com') {
            if (url.pathname === '/watch') {
                videoId = url.searchParams.get('v');
            } else {
                videoId = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] ?? null;
            }
        }

        return videoId && /^[\w-]{11}$/.test(videoId) ? videoId : null;
    } catch {
        return null;
    }
}

// Derive the thumbnail URL from the link instead of storing a duplicate value.
export function getYouTubeThumbnailUrl(link: string): string | null {
    const videoId = getYouTubeVideoId(link);
    return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}
