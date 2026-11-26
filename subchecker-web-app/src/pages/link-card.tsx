import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { RefreshButton } from "@/components/common/refresh-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { LinkRowProps } from "@/types/types";
import { Captions, CircleCheck, CircleX, Trash2 } from "lucide-react";
import { useState } from "react";

function SubtitleIndicator({
    isChecking,
    englishSubtitles,
}: Pick<LinkRowProps, "isChecking"> & {
    englishSubtitles: LinkRowProps["link"]["englishSubtitles"];
}) {
    if (isChecking) return <Spinner aria-label="Checking subtitles" className="size-4" />;

    if (englishSubtitles === true) {
        return (
            <span role="img" aria-label="English subtitles available" title="English subtitles available" className="text-emerald-600">
                <CircleCheck className="size-4" />
            </span>
        );
    }

    if (englishSubtitles === false) {
        return (
            <span role="img" aria-label="No English subtitles found" title="No English subtitles found" className="text-destructive">
                <CircleX className="size-4" />
            </span>
        );
    }

    return <span role="img" aria-label="Subtitle status not checked yet" title="Subtitle status not checked yet">-</span>;
}

function HighQualityThumbnail({ url, title }: { url: string; title: string }) {
    const highQualityUrl = url.replace(/\/hqdefault\.jpg(?=([?#]|$))/, "/maxresdefault.jpg");
    const [src, setSrc] = useState(highQualityUrl);

    if (!src) return null;

    return (
        <img
            src={src}
            alt={`Thumbnail for ${title}`}
            loading="lazy"
            decoding="async"
            className="aspect-video w-full object-cover"
            onError={() => setSrc((currentSrc) => currentSrc === url ? "" : url)}
        />
    );
}

export function LinkCardSkeleton() {
    return (
        <Card className="gap-0 overflow-hidden py-0" aria-hidden="true">
            <div className="space-y-2 p-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="size-4 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-2/3" />
            </div>

            <div className="mx-3 overflow-hidden rounded-xl">
                <Skeleton className="aspect-video w-full" />
            </div>

            <div className="flex flex-col items-start gap-1 p-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-28" />
            </div>
        </Card>
    );
}

export function LinkCard({ link, isChecking, isDeleting, onDelete, onCheck }: LinkRowProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [openLinkDialogOpen, setOpenLinkDialogOpen] = useState(false);
    const title = link.title || link.url;

    return (
        <Card data-testid={`link-card-${link.id}`} className="gap-0 overflow-hidden py-0">
            <div className="space-y-2 p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Captions aria-hidden="true" className="size-4 shrink-0" />
                    <span>Subtitles</span>
                    <SubtitleIndicator
                        isChecking={isChecking}
                        englishSubtitles={link.englishSubtitles}
                    />
                </div>

                {link.channelName && (
                    <p className="truncate text-sm font-medium">{link.channelName}</p>
                )}

                <Dialog open={openLinkDialogOpen} onOpenChange={setOpenLinkDialogOpen}>
                    <a
                        href={link.url}
                        className="block [overflow-wrap:anywhere] font-semibold leading-snug hover:underline"
                        onClick={(event) => {
                            event.preventDefault();
                            setOpenLinkDialogOpen(true);
                        }}
                    >
                        {title}
                    </a>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Open this link on YouTube?</DialogTitle>
                            <DialogDescription>
                                You are about to leave Subchecker and open this link on YouTube.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose
                                render={
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                }
                            />
                            <a
                                className={buttonVariants()}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setOpenLinkDialogOpen(false)}
                            >
                                Continue to YouTube
                            </a>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {link.thumbnailUrl && (
                <div className="mx-3 overflow-hidden rounded-xl">
                    <HighQualityThumbnail
                        key={link.thumbnailUrl}
                        url={link.thumbnailUrl}
                        title={title}
                    />
                </div>
            )}

            <div className="flex flex-col items-start gap-1 p-3">
                {link.englishSubtitles !== true && (
                    <RefreshButton
                        key={`${link.id}-${link.refreshRemainingMs}`}
                        disabled={isChecking}
                        hasEnglishSubtitles={false}
                        isRefreshing={isChecking}
                        refreshRemainingMs={link.refreshRemainingMs}
                        onRefresh={onCheck}
                    />
                )}

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                                aria-label="Delete link"
                                title="Delete link"
                                disabled={isDeleting}
                            >
                                <Trash2 className="size-4" />
                                Delete link
                            </Button>
                        }
                    />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete this link?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. The link will be removed from your list.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose
                                render={
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                }
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={isDeleting}
                                onClick={() => {
                                    onDelete();
                                    setDeleteDialogOpen(false);
                                }}
                            >
                                Delete link
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Card>
    );
}
