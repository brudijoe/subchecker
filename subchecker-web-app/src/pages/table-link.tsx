import { Button, buttonVariants } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { CircleCheck, CircleX, Trash, RefreshCw, RefreshCwOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkPreview } from "@/components/common/link-preview";
import { useCheckLink, useDeleteLink, useLinks } from "@/hooks/useLinks";
import type { LinkRowProps } from "@/types/types";
import { useState, type ReactNode } from "react";
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

function getSubtitleIndicator(
    isChecking: boolean,
    englishSubtitles: LinkRowProps["link"]["englishSubtitles"],
) {
    if (isChecking) return <Spinner className="size-4" />;

    if (englishSubtitles === true) {
        return (
            <span className="rounded-full bg-emerald-500">
                <CircleCheck className="size-4" />
            </span>
        );
    }

    if (englishSubtitles === false) {
        return (
            <span className="rounded-full bg-destructive">
                <CircleX className="size-4" />
            </span>
        );
    }

    return "-";
}

function TableLinkSkeletonRow() {
    return (
        <TableRow>
            {/* Subtitles */}
            <TableCell className="w-[80px] text-center">
                <div className="flex items-center justify-center">
                    <Skeleton className="size-4 rounded-full" />
                </div>
            </TableCell>

            {/* Title */}
            <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                <Skeleton className="h-4 w-3/4" />
            </TableCell>

            {/* Delete */}
            <TableCell className="w-[80px] text-center">
                <Skeleton className="mx-auto size-8 rounded-md" />
            </TableCell>

            {/* Refresh */}
            <TableCell className="w-[120px] text-center">
                <Skeleton className="mx-auto h-8 w-24 rounded-md" />
            </TableCell>
        </TableRow>
    );
}

function TableLinkRow({ link, isChecking, isDeleting, onDelete, onCheck }: LinkRowProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [openLinkDialogOpen, setOpenLinkDialogOpen] = useState(false);

    return (
        <TableRow>
            {/* Subtitles */}
            <TableCell className="w-[80px]">
                <div className="flex items-center justify-center">
                    {getSubtitleIndicator(isChecking, link.englishSubtitles)}
                </div>
            </TableCell>

            {/* Title */}
            <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                <div>
                    <LinkPreview
                        link={link}
                        onOpenLink={() => setOpenLinkDialogOpen(true)}
                        className="hover:underline"
                    >
                        {link.title || link.url}
                    </LinkPreview>
                    <Dialog open={openLinkDialogOpen} onOpenChange={setOpenLinkDialogOpen}>
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
            </TableCell>

            {/* Delete */}
            <TableCell className="w-[80px] text-center">
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
            </TableCell>

            {/* Refresh */}
            <TableCell className="w-[120px] text-center">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Refresh link"
                    title="Refresh link"
                    disabled={isChecking || link.englishSubtitles === true}
                    onClick={onCheck}
                >
                    {link.englishSubtitles === true ?
                        <RefreshCwOff className="size-4" />
                        : <RefreshCw className={`size-4 ${isChecking ? "animate-spin" : ""}`} />
                    }
                </Button>
            </TableCell>
        </TableRow>
    );
}

function MessageRow({ children }: { children: ReactNode }) {
    return (
        <TableRow>
            <TableCell colSpan={4}>{children}</TableCell>
        </TableRow>
    );
}

function LinkRows() {
    const { data: links = [], isPending, isError } = useLinks();
    const checkMutation = useCheckLink();
    const deleteMutation = useDeleteLink();

    if (isPending) return <TableLinkSkeletonRow />;
    if (isError) return <MessageRow>The links could not be loaded.</MessageRow>;
    if (links.length === 0) return <MessageRow>No links added yet.</MessageRow>;

    return links
        // Keep subtitle links first and use IDs for stable ordering.
        .toSorted((leftLink, rightLink) =>
            Number(rightLink.englishSubtitles === true) - Number(leftLink.englishSubtitles === true)
            || leftLink.id - rightLink.id
        )
        .map((link) => (
            <TableLinkRow
                key={link.id}
                link={link}
                isChecking={checkMutation.isPending && checkMutation.variables === link.id}
                isDeleting={deleteMutation.isPending}
                onDelete={() => deleteMutation.mutate(link.id)}
                onCheck={() => checkMutation.mutate(link.id)}
            />
        ))
}

export function TableLink() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px] text-center">Subtitles</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                    <TableHead className="text-center">Refresh</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                <LinkRows />
            </TableBody>
        </Table>
    );
}