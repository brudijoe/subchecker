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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Link2, Play } from "lucide-react"

export function CardLink() {
    return (
        <Card className="w-full max-w-xl border-border/70 shadow-xl shadow-black/10 ring-white/5">
            <CardHeader className="flex-row items-center justify-between gap-4 pb-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                        <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="text-lg font-semibold tracking-tight">
                            Check a YouTube link
                        </CardTitle>
                        <CardDescription>
                            Paste the link to see if English subtitles are available.
                        </CardDescription>
                    </div>
                </div>
                <CardAction>
                    <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
                        <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                        Ready to check
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardContent className="pb-5">
                <form>
                    <div className="grid gap-2.5">
                        <Label htmlFor="link">YouTube URL</Label>
                        <div className="relative">
                            <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <Input
                                id="link"
                                type="url"
                                className="h-11 bg-background/60 pl-10"
                                placeholder="https://www.youtube.com/watch?v=..."
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Supports YouTube video and channel links.
                        </p>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="border-border/70 bg-muted/20 p-5">
                <Button type="submit" size="lg" className="w-full gap-2 font-semibold">
                    Check link
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
            </CardFooter>
        </Card>
    )
}
