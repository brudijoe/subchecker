import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CardLink() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Paste a link</CardTitle>
                <CardDescription>
                    Enter a youtube link below
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="grid gap-2">
                        <Label htmlFor="link">Link</Label>
                        <Input
                            id="link"
                            type="link"
                            placeholder="https://www.youtube.com/watch?v=wfaL-baiNUo"
                            required
                        />
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                    Check link
                </Button>
            </CardFooter>
        </Card>
    )
}
