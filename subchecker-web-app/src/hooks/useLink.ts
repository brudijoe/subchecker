import { useQuery } from "@tanstack/react-query"

export type Link = {
    title: string,
    hasSubs: boolean,
}

async function hasEnglishSubtitles(link: string): Promise<Link> {
    const url = new URL(link);
    const proxyPath = `/yt${url.pathname}${url.search}`;

    // http://localhost:5173/yt/watch?v=wfaL-baiNUo
    const response = await fetch(proxyPath);
    if (!response.ok) {
        throw new Error("Unable to fetch data");
    }

    // 1. Read text from HTML
    const html = await response.text();

    // 2. Parse HTML into virutal document
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 3. Get title from meta data
    const videoTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");

    const startMarker = "ytInitialPlayerResponse = ";
    const startIndex = html.indexOf(startMarker);
    if (startIndex === -1) return {
        title: "",
        hasSubs: false,
    };

    const jsonStart = html.substring(startIndex + startMarker.length);
    const endIndex = jsonStart.indexOf("};");
    const playerResponse = JSON.parse(jsonStart.substring(0, endIndex + 1));

    const captionTracks =
        playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captionTracks?.length) return {
        title: "",
        hasSubs: false,
    };

    return {
        title: videoTitle ?? "", hasSubs: captionTracks.some(
            (track: { languageCode: string; vssId?: string }) =>
                track.languageCode === "en" && track.vssId && !track.vssId.startsWith("a.")
        )
    };
}

export function useLink(link: string) {
    return useQuery({
        queryKey: ["link", link],
        queryFn: () => hasEnglishSubtitles(link),
    });
}