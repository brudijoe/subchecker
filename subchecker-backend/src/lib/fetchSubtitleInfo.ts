type SubtitleInfo = {
    title: string;
    hasEnglishSubtitles: boolean;
};

function getVideoId(link: string): string {
    const url = new URL(link);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const videoId = url.searchParams.get('v') ?? pathParts[pathParts.length - 1];

    if (!videoId) throw new Error('Missing YouTube video ID');
    return videoId;
}

export async function fetchSubtitleInfo(link: string): Promise<SubtitleInfo> {
    const videoId = getVideoId(link);
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`);

    if (!response.ok) throw new Error('Could not load the YouTube video');

    const html = await response.text();
    const marker = 'ytInitialPlayerResponse = ';
    const markerIndex = html.indexOf(marker);
    if (markerIndex === -1) throw new Error('YouTube video data was not found');

    // Read the embedded player data from the YouTube page.
    const jsonStart = markerIndex + marker.length;
    const jsonEnd = html.indexOf('};', jsonStart);
    if (jsonEnd === -1) throw new Error('YouTube player data was incomplete');

    const player = JSON.parse(html.slice(jsonStart, jsonEnd + 1));
    const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

    return {
        title: player.videoDetails?.title ?? '',
        hasEnglishSubtitles: tracks.some((track: { languageCode?: string; vssId?: string }) =>
            track.languageCode?.startsWith('en')
            && track.vssId
            && !track.vssId.startsWith('a.'),
        ),
    };
}