import { Button } from "@/components/ui/button"
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { CircleCheck, CircleX } from "lucide-react"

type Link = {
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

function useLink(link: string) {
    return useQuery({
        queryKey: ["link", link],
        queryFn: () => hasEnglishSubtitles(link),
    });
}

export function ItemLink({ link }: { link: string }) {
    const { data, isPending, isError, isFetching, refetch } = useLink(link);

    if (isPending) return <Spinner />;
    if (isError) return <Badge variant="destructive">Error</Badge>;

    return (
        <div className="flex w-full max-w-md flex-col gap-6">
            <Item variant="outline">
                <ItemContent>
                    <ItemTitle>{data.title}</ItemTitle>
                    <ItemDescription>
                        {isFetching ?
                            <Spinner /> :
                            data.hasSubs ? <CircleCheck className="size-5" /> : <CircleX className="size-5" />}
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        Check link
                    </Button>
                </ItemActions>
            </Item>
        </div>
    );
}