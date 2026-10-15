import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Check, CircleCheck, CircleX, Copy } from "lucide-react";
import { useLink } from "@/hooks/useLink";
import { useState } from "react";

function TableLinkRow({ link }: { link: string }) {
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

    return (
        <TableRow>
            <TableCell>
                {isPending || isFetching ? (
                    <Spinner />
                ) : isError ? (
                    <Badge variant="destructive">Error</Badge>
                ) : data.hasSubs ? (
                    <CircleCheck className="size-5" />
                ) : (
                    <CircleX className="size-5" />
                )}
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
                        <Check className="size-4" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                </Button>
            </TableCell>
            <TableCell className="w-[120px] text-right">
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
    );
}

export function TableLink({ links }: { links: string[] }) {
    return (
        <Table>
            <TableCaption>A list of your YouTube links.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[80px] text-center">Copy</TableHead>
                    <TableHead className="text-right">Refresh</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {links.map((link) => (
                    <TableLinkRow key={link} link={link} />
                ))}
            </TableBody>
        </Table>
    );
}