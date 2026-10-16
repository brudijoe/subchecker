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
import { Badge } from "@/components/ui/badge";
import { Check, CircleCheck, CircleX, Copy, Trash } from "lucide-react";
import { useLink } from "@/hooks/useLink";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { removeLink } from "@/stores/LinkStore";

function TableLinkSkeletonRow() {
    return (
        <TableRow>
            {/* Status */}
            <TableCell className="w-[80px] text-center">
                <div className="flex items-center justify-center">
                    <Skeleton className="size-5 rounded-full" />
                </div>
            </TableCell>

            {/* Title */}
            <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                <Skeleton className="h-4 w-3/4" />
            </TableCell>

            {/* Copy */}
            <TableCell className="w-[80px] text-center">
                <Skeleton className="mx-auto size-8 rounded-md" />
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

type LinkProps = {
    link: string;
    index: number;
}

function TableLinkRow({ link, index }: LinkProps) {
    const { data, isPending, isError, isFetching, refetch } = useLink(link);

    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Copy failed", error);
        }
    }

    const handleDeleteLink = (index: number) => {
        removeLink(index);
    }

    return (
        <>
            {isPending ? (
                <TableLinkSkeletonRow />
            ) :
                <TableRow>
                    <TableCell className="w-[80px]">
                        <div className="flex items-center justify-center">
                            {isFetching ? (
                                <Spinner className="size-5" />
                            ) : isError ? (
                                <Badge variant="destructive">Error</Badge>
                            ) : data.hasSubs ? (
                                <CircleCheck className="size-5" />
                            ) : (
                                <CircleX className="size-5" />
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                        {data?.title}
                    </TableCell>
                    <TableCell className="w-[80px] text-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Copy link"
                            title="Copy link"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <Check className="size-5" />
                            ) : (
                                <Copy className="size-5" />
                            )}
                        </Button>
                    </TableCell>
                    <TableCell className="w-[80px] text-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Copy link"
                            title="Copy link"
                            onClick={() => handleDeleteLink(index)}
                        >
                            <Trash className="size-5" />
                        </Button>
                    </TableCell>
                    <TableCell className="w-[120px] text-center">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isFetching}
                            onClick={() => refetch()}
                        >
                            Check link
                        </Button>
                    </TableCell>
                </TableRow>
            }
        </>
    );
}

export function TableLink({ links }: { links: string[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px] text-center">Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-center">Copy</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                    <TableHead className="text-center">Refresh</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {links.map((link, index) => (
                    <TableLinkRow key={link} index={index} link={link} />
                ))}
            </TableBody>
        </Table>
    );
}