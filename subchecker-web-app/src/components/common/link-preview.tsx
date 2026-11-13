import { PreviewCard } from "@base-ui/react/preview-card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { LinkDto } from "@/types/types";

type LinkPreviewProps = {
    link: LinkDto;
    children: ReactNode;
    className: string;
    onOpenLink: () => void;
};

export function LinkPreview({ link, children, className, onOpenLink }: LinkPreviewProps) {
    const [titleExpanded, setTitleExpanded] = useState(false);

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
                className={`${className} ${titleExpanded ? "line-clamp-none" : "line-clamp-2 md:line-clamp-none"}`}
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
                        </PreviewCard.Popup>
                    </PreviewCard.Positioner>
                </PreviewCard.Portal>
            )}
            <div className="mt-1 flex flex-col items-start">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto justify-start px-0 py-0 text-xs text-muted-foreground hover:bg-transparent md:hidden"
                    aria-expanded={titleExpanded}
                    aria-controls={`link-title-${link.id}`}
                    onClick={() => setTitleExpanded((expanded) => !expanded)}
                >
                    {titleExpanded ? (
                        <>
                            <ChevronUp aria-hidden="true" />
                            Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown aria-hidden="true" />
                            Show more
                        </>
                    )}
                </Button>
            </div>
            {link.thumbnailUrl && titleExpanded && (
                <div
                    id={`link-preview-${link.id}`}
                    className="mt-2 overflow-hidden rounded-xl border bg-card text-card-foreground md:hidden"
                >
                    <img
                        src={link.thumbnailUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="aspect-video w-full object-cover"
                    />
                </div>
            )}
        </PreviewCard.Root>
    );
}
