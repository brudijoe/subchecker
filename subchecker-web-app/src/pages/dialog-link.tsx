import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Link2, Plus } from "lucide-react"
import { useState, type ChangeEvent } from "react"
import { useCreateLink } from "@/hooks/useLinks"

export function DialogLink() {
    const [open, setOpen] = useState(false)
    const [link, setLink] = useState("")
    const createMutation = useCreateLink()

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setLink(event.target.value)
    }

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        createMutation.mutate(link.trim(), {
            onSuccess: () => {
                setLink("")
                setOpen(false)
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
                <Button variant="outline">
                    Add link
                    <Plus className="size-4" aria-hidden="true" />
                </Button>} />
            <DialogContent className="sm:max-w-xl">
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>Check a YouTube link</DialogTitle>
                        <DialogDescription>
                            Paste the link to see if English subtitles are available.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="link">YouTube URL</Label>
                            <div className="relative">
                                <Link2
                                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <Input
                                    id="link"
                                    name="link"
                                    type="url"
                                    className="h-11 bg-background/60 pl-10"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    required
                                    value={link}
                                    onChange={handleChange}
                                />
                            </div>
                        </Field>
                    </FieldGroup>
                    {/* TODO */}
                    {createMutation.isError && (
                        <p role="alert" className="text-sm text-destructive">
                            {createMutation.error.message}
                        </p>
                    )}
                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
                        <Button type="submit" className="gap-2 font-semibold" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Saving…" : "Check link"}
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}