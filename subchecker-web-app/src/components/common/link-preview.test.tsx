import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import type { LinkDto } from "@/types/types"
import { LinkPreview } from "./link-preview"

const link: LinkDto = {
    id: 1,
    url: "https://youtube.com/watch?v=first",
    thumbnailUrl: "https://i.ytimg.com/vi/first/hqdefault.jpg",
    title: "First video",
    channelName: "Example Channel",
    englishSubtitles: true,
    subtitleCheckedAt: null,
    refreshAvailableAt: null,
    notifiedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
}

describe("LinkPreview", () => {
    it("shows the thumbnail without title or subtitle status", async () => {
        const user = userEvent.setup()
        render(
            <LinkPreview
                link={link}
                className="hover:underline"
                onOpenLink={() => { }}
            >
                {link.title}
            </LinkPreview>,
        )

        await user.click(screen.getByRole("button", { name: "Show more" }))

        expect(document.querySelector("#link-preview-1 img")).toHaveAttribute(
            "src",
            link.thumbnailUrl,
        )
        expect(
            within(document.getElementById("link-preview-1")!).getByText("Example Channel"),
        ).toBeInTheDocument()
        expect(screen.queryByText("English subtitles available")).not.toBeInTheDocument()
        expect(screen.queryByText("No English subtitles found")).not.toBeInTheDocument()
        expect(screen.queryByText("Subtitle status not checked yet")).not.toBeInTheDocument()
    })

    it("shows the channel name below the desktop thumbnail", async () => {
        const user = userEvent.setup()
        render(
            <LinkPreview
                link={link}
                className="hover:underline"
                onOpenLink={() => { }}
            >
                {link.title}
            </LinkPreview>,
        )

        await user.hover(screen.getByRole("link", { name: "First video" }))

        const channelName = await screen.findByText("Example Channel")
        expect(channelName.previousElementSibling).toHaveAttribute("src", link.thumbnailUrl)
    })

    it("expands the title without showing a preview when no thumbnail exists", async () => {
        const user = userEvent.setup()
        render(
            <LinkPreview
                link={{ ...link, thumbnailUrl: null }}
                className="hover:underline"
                onOpenLink={() => { }}
            >
                {link.title}
            </LinkPreview>,
        )

        await user.click(screen.getByRole("button", { name: "Show more" }))

        expect(screen.getByRole("link", { name: "First video" })).toHaveClass("line-clamp-none")
        expect(document.getElementById("link-preview-1")).not.toBeInTheDocument()
    })
})
