import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CircleCheck, CircleX } from "lucide-react";

const linkReponses = [
    {
        title: "요원 VS 스파이, 진짜 MVP는 누구?! | 배지전쟁4 외전 : WHO'S MVP｜tripleS(트리플에스)",
        hasSubs: false,
    },
    {
        title: "[ENG/JP] RESCENE(리센느) | Minami's Dream USJ Turns Into a Halloween Horror Marathon | 261012",
        hasSubs: true,
    }
];

export function TableLink() {
    return (
        <Table>
            <TableCaption>A list of your yotube links.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Refresh</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {linkReponses.map((linkReponse) => (
                    <TableRow key={linkReponse.title}>
                        <TableCell>{linkReponse.hasSubs ? <CircleCheck className="size-5" /> : <CircleX className="size-5" />}</TableCell>
                        <TableCell>{linkReponse.title}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                                Check link
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
