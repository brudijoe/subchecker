import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { RefreshButton } from "@/components/common/refresh-button";
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
import { CircleCheck, CircleX, Trash } from "lucide-react";
import { useState } from "react";

function SubtitleIndicator({
    isChecking,
    englishSubtitles,
}: Pick<LinkRowProps, "isChecking"> & {
    englishSubtitles: LinkRowProps["link"]["englishSubtitles"];
}) {
    if (isChecking) return <Spinner aria-label="Checking subtitles" className="size-5" />;

    if (englishSubtitles === true) {
        return (
            <span role="img" aria-label="English subtitles available" className="text-emerald-600">
                <CircleCheck className="size-5" />
            </span>
        );
    }

    if (englishSubtitles === false) {
        return (
            <span role="img" aria-label="No English subtitles found" className="text-destructive">
                <CircleX className="size-5" />
            </span>
        );
    }

    return <span role="img" aria-label="Subtitle status not checked yet">-</span>;
}

export function MobileLinkCard({ link, isChecking, isDeleting, onDelete, onCheck }: LinkRowProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [openLinkDialogOpen, setOpenLinkDialogOpen] = useState(false);

    return (
        <Card data-testid={`mobile-link-card-${link.id}`} className="gap-0 py-0">
            <div className="flex min-w-0 items-center gap-2 p-3">
                <div className="flex size-8 shrink-0 items-center justify-center">
                    <SubtitleIndicator
                        isChecking={isChecking}
                        englishSubtitles={link.englishSubtitles}
                    />
                </div>

                <Dialog open={openLinkDialogOpen} onOpenChange={setOpenLinkDialogOpen}>
                    <a
                        href={link.url}
                        className="min-w-0 flex-1 [overflow-wrap:anywhere] hover:underline"
                        onClick={(event) => {
                            event.preventDefault();
                            setOpenLinkDialogOpen(true);
                        }}
                    >
                        {link.title || link.url}
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

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete link"
                                title="Delete link"
                                disabled={isDeleting}
                            >
                                <Trash className="size-4" />
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

                <RefreshButton
                    key={`${link.id}-${link.refreshRemainingMs}`}
                    disabled={isChecking || link.englishSubtitles === true}
                    hasEnglishSubtitles={link.englishSubtitles === true}
                    isRefreshing={isChecking}
                    refreshRemainingMs={link.refreshRemainingMs}
                    onRefresh={onCheck}
                />
            </div>

            {link.thumbnailUrl && (
                <img
                    src={link.thumbnailUrl}
                    alt={link.title ? `Thumbnail for ${link.title}` : "YouTube video thumbnail"}
                    loading="lazy"
                    decoding="async"
                    className="aspect-video w-full object-cover"
                />
            )}
            {link.channelName && (
                <p className="truncate px-3 py-2 text-sm font-medium">{link.channelName}</p>
            )}
        </Card>
    );
}
