import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { CircleCheck, CircleX, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckLink, useDeleteLink, useLinks } from "@/hooks/useLinks";
import type { LinkRowProps } from "@/types/types";

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
    return (
        <TableRow>
            <TableCell className="w-[80px]">
                <div className="flex items-center justify-center">
                    {isChecking ? (
                        <Spinner className="size-4" />
                    ) : link.englishSubtitles === true ? (
                        <CircleCheck className="size-4" />
                    ) : link.englishSubtitles === false ? (
                        <CircleX className="size-4" />
                    ) : (
                        "-"
                    )}
                </div>
            </TableCell>
            <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                >
                    {link.title || link.url}
                </a>
            </TableCell>
            <TableCell className="w-[80px] text-center">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete link"
                    title="Delete link"
                    disabled={isDeleting}
                    onClick={onDelete}
                >
                    <Trash className="size-4" />
                </Button>
            </TableCell>
            <TableCell className="w-[120px] text-center">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isChecking}
                    onClick={onCheck}
                >
                    Check link
                </Button>
            </TableCell>
        </TableRow>
    );
}

export function TableLink() {
    const { data: links = [], isPending, isError } = useLinks();
    const checkMutation = useCheckLink();
    const deleteMutation = useDeleteLink();

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
                {isPending ? (
                    <TableLinkSkeletonRow />
                ) : isError ? (
                    <TableRow>
                        <TableCell colSpan={4}>
                            The links could not be loaded.
                        </TableCell>
                    </TableRow>
                ) : links.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4}>No links added yet.</TableCell>
                    </TableRow>
                ) : (
                    links.map((link) => (
                        <TableLinkRow
                            key={link.id}
                            link={link}
                            isChecking={checkMutation.isPending && checkMutation.variables === link.id}
                            isDeleting={deleteMutation.isPending}
                            onDelete={() => deleteMutation.mutate(link.id)}
                            onCheck={() => checkMutation.mutate(link.id)}
                        />
                    ))
                )}
            </TableBody>
        </Table>
    );
}