import { PreviewCard } from "@base-ui/react/preview-card";
import type { ReactNode } from "react";

import type { LinkDto } from "@/types/types";

type LinkPreviewProps = {
    link: LinkDto;
    children: ReactNode;
    className: string;
    onOpenLink: () => void;
};

export function LinkPreview({ link, children, className, onOpenLink }: LinkPreviewProps) {
    const subtitleStatus = link.englishSubtitles === true
        ? "English subtitles available"
        : link.englishSubtitles === false
            ? "No English subtitles found"
            : "Subtitle status not checked yet";

    return (
        <PreviewCard.Root>
            <PreviewCard.Trigger
                id={`link-title-${link.id}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                delay={300}
                closeDelay={150}
                onClick={(event) => {
                    event.preventDefault();
                    onOpenLink();
                }}
                className={className}
            >
                {children}
            </PreviewCard.Trigger>
            {link.thumbnailUrl && (
                <PreviewCard.Portal>
                    <PreviewCard.Positioner side="top" align="start" sideOffset={8}>
                        <PreviewCard.Popup className="hidden w-72 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg outline-none md:block">
                            <img
                                src={link.thumbnailUrl}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="aspect-video w-full object-cover"
                            />
                            <div className="space-y-2 p-3">
                                <p className="line-clamp-2 text-sm font-medium">
                                    {link.title || link.url}
                                </p>
                                <p className="text-xs text-muted-foreground">{subtitleStatus}</p>
                            </div>
                        </PreviewCard.Popup>
                    </PreviewCard.Positioner>
                </PreviewCard.Portal>
            )}
        </PreviewCard.Root>
    );
}
