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
import { CircleCheck, CircleX } from "lucide-react";
import { useLink } from "@/hooks/useLink";

function TableLinkRow({ link }: { link: string }) {
    const { data, isPending, isError, isFetching, refetch } = useLink(link);

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
            <TableCell>{data?.title || link}</TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
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