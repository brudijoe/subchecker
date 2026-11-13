import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { LinkDto } from "@/types/types"
import { TableLink } from "./table-link"

const mocks = vi.hoisted(() => ({
    useCheckLink: vi.fn(),
    useDeleteLink: vi.fn(),
    useLinks: vi.fn(),
    checkLink: vi.fn(),
    deleteLink: vi.fn(),
}))

vi.mock("@/hooks/useLinks", () => ({
    useCheckLink: mocks.useCheckLink,
    useDeleteLink: mocks.useDeleteLink,
    useLinks: mocks.useLinks,
}))

const firstLink: LinkDto = {
    id: 1,
    url: "https://youtube.com/watch?v=first",
    thumbnailUrl: "https://i.ytimg.com/vi/first/hqdefault.jpg",
    title: "First video",
    englishSubtitles: true,
    subtitleCheckedAt: null,
    notifiedAt: null,
}

const secondLink: LinkDto = {
    id: 2,
    url: "https://youtube.com/watch?v=second",
    thumbnailUrl: null,
    title: null,
    englishSubtitles: null,
    subtitleCheckedAt: null,
    notifiedAt: null,
}

function configureHooks(linksState: object, checkState = {}, deleteState = {}) {
    mocks.useLinks.mockReturnValue(linksState)
    mocks.useCheckLink.mockReturnValue({ mutate: mocks.checkLink, ...checkState })
    mocks.useDeleteLink.mockReturnValue({ mutate: mocks.deleteLink, ...deleteState })
}

beforeEach(() => {
    configureHooks({ data: [], isPending: false, isError: false })
})

describe("TableLink", () => {
    it("shows a loading row while links are pending", () => {
        configureHooks({ data: undefined, isPending: true, isError: false })

        render(<TableLink />)

        expect(screen.getAllByRole("row")).toHaveLength(2)
        expect(screen.queryByText("No links added yet.")).not.toBeInTheDocument()
    })

    it("shows an error when loading links fails", () => {
        configureHooks({ data: undefined, isPending: false, isError: true })

        render(<TableLink />)

        expect(screen.getByText("The links could not be loaded.")).toBeInTheDocument()
    })

    it("shows an empty state when no links exist", () => {
        render(<TableLink />)

        expect(screen.getByText("No links added yet.")).toBeInTheDocument()
    })

    it("renders titles and falls back to the URL", () => {
        configureHooks({ data: [firstLink, secondLink], isPending: false, isError: false })

        render(<TableLink />)

        expect(screen.getByRole("link", { name: "First video" })).toHaveAttribute("href", firstLink.url)
        expect(screen.getByRole("link", { name: secondLink.url })).toHaveAttribute("href", secondLink.url)
    })

    it("shows a YouTube thumbnail and subtitle status on hover", async () => {
        const user = userEvent.setup()
        const linkWithPreview = {
            ...firstLink,
            url: "https://www.youtube.com/watch?v=wfaL-baiNUo",
            thumbnailUrl: "https://i.ytimg.com/vi/wfaL-baiNUo/hqdefault.jpg",
            title: "Video with preview",
            englishSubtitles: false,
        }
        configureHooks({ data: [linkWithPreview], isPending: false, isError: false })

        render(<TableLink />)

        await user.hover(screen.getByRole("link", { name: "Video with preview" }))

        expect(await screen.findByText("No English subtitles found")).toBeInTheDocument()
        const thumbnail = document.querySelector("img")
        expect(thumbnail).toHaveAttribute(
            "src",
            linkWithPreview.thumbnailUrl,
        )
        expect(thumbnail?.parentElement).toHaveClass("hidden", "md:block")
    })

    it("sorts links with English subtitles to the top", () => {
        configureHooks({ data: [secondLink, firstLink], isPending: false, isError: false })

        render(<TableLink />)

        expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
            "First video",
            secondLink.url,
        ])
    })

    it("sorts links with the same subtitle status by ID", () => {
        const thirdLink: LinkDto = {
            id: 3,
            url: "https://youtube.com/watch?v=third",
            thumbnailUrl: null,
            title: "Third video",
            englishSubtitles: true,
            subtitleCheckedAt: null,
            notifiedAt: null,
        }
        configureHooks({ data: [thirdLink, secondLink, firstLink], isPending: false, isError: false })

        render(<TableLink />)

        expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
            "First video",
            "Third video",
            secondLink.url,
        ])
    })

    it("allows expanding and collapsing a title", async () => {
        const user = userEvent.setup()
        configureHooks({ data: [firstLink], isPending: false, isError: false })

        render(<TableLink />)

        const title = screen.getByRole("link", { name: "First video" })
        const expandButton = screen.getByRole("button", { name: "Show more" })

        expect(title).toHaveClass("line-clamp-2")
        expect(expandButton).toHaveAttribute("aria-expanded", "false")
        expect(document.getElementById("link-preview-1")).not.toBeInTheDocument()

        await user.click(expandButton)

        expect(title).toHaveClass("line-clamp-none")
        expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true")
        expect(document.getElementById("link-preview-1")).toHaveClass("md:hidden")
        expect(screen.getByText("English subtitles available")).toBeInTheDocument()
        expect(document.querySelector("#link-preview-1 img")).toHaveAttribute(
            "src",
            firstLink.thumbnailUrl,
        )

        await user.click(screen.getByRole("button", { name: "Show less" }))

        expect(document.getElementById("link-preview-1")).not.toBeInTheDocument()
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("asks for confirmation before opening a link on YouTube", async () => {
        const user = userEvent.setup()
        configureHooks({ data: [firstLink], isPending: false, isError: false })
        render(<TableLink />)

        await user.click(screen.getByRole("link", { name: "First video" }))

        const dialog = screen.getByRole("dialog")
        expect(within(dialog).getByText("Open this link on YouTube?")).toBeInTheDocument()
        expect(within(dialog).getByText(
            "You are about to leave Subchecker and open this link on YouTube.",
        )).toBeInTheDocument()

        const continueLink = within(dialog).getByRole("link", { name: "Continue to YouTube" })
        expect(continueLink).toHaveAttribute("href", firstLink.url)
        expect(continueLink).toHaveAttribute("target", "_blank")
    })

    it("does not open a link when the confirmation is cancelled", async () => {
        const user = userEvent.setup()
        configureHooks({ data: [firstLink], isPending: false, isError: false })
        render(<TableLink />)

        await user.click(screen.getByRole("link", { name: "First video" }))
        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }))

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("checks a link and deletes it only after confirmation", async () => {
        const user = userEvent.setup()
        configureHooks({ data: [firstLink, secondLink], isPending: false, isError: false })
        render(<TableLink />)

        const rows = screen.getAllByRole("row")
        await user.click(within(rows[2]).getByRole("button", { name: "Refresh link" }))
        await user.click(within(rows[2]).getByRole("button", { name: "Delete link" }))

        expect(mocks.checkLink).toHaveBeenCalledWith(secondLink.id)
        expect(mocks.deleteLink).not.toHaveBeenCalled()

        const dialog = screen.getByRole("dialog")
        expect(within(dialog).getByText("Delete this link?")).toBeInTheDocument()
        await user.click(within(dialog).getByRole("button", { name: "Delete link" }))

        expect(mocks.deleteLink).toHaveBeenCalledWith(secondLink.id)
    })

    it("does not delete a link when deletion is cancelled", async () => {
        const user = userEvent.setup()
        configureHooks({ data: [firstLink], isPending: false, isError: false })
        render(<TableLink />)

        const row = screen.getAllByRole("row")[1]
        await user.click(within(row).getByRole("button", { name: "Delete link" }))
        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }))

        expect(mocks.deleteLink).not.toHaveBeenCalled()
    })

    it("disables only the link currently being checked", () => {
        const uncheckedFirstLink = { ...firstLink, englishSubtitles: null }
        configureHooks(
            { data: [uncheckedFirstLink, secondLink], isPending: false, isError: false },
            { isPending: true, variables: uncheckedFirstLink.id },
        )

        render(<TableLink />)

        const rows = screen.getAllByRole("row")
        expect(within(rows[1]).getByRole("button", { name: "Refresh link" })).toBeDisabled()
        expect(within(rows[2]).getByRole("button", { name: "Refresh link" })).toBeEnabled()
    })

    it("disables refresh when English subtitles are available", () => {
        configureHooks({ data: [firstLink, secondLink], isPending: false, isError: false })

        render(<TableLink />)

        const rows = screen.getAllByRole("row")
        expect(within(rows[1]).getByRole("button", { name: "Refresh link" })).toBeDisabled()
        expect(within(rows[2]).getByRole("button", { name: "Refresh link" })).toBeEnabled()
    })
})