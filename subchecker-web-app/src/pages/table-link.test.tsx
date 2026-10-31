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
    title: "First video",
    englishSubtitles: true,
    subtitleCheckedAt: null,
    notifiedAt: null,
}

const secondLink: LinkDto = {
    id: 2,
    url: "https://youtube.com/watch?v=second",
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

    it("checks a link and deletes it only after confirmation", async () => {
        const user = userEvent.setup()
        configureHooks({ data: [firstLink, secondLink], isPending: false, isError: false })
        render(<TableLink />)

        const rows = screen.getAllByRole("row")
        await user.click(within(rows[1]).getByRole("button", { name: "Check link" }))
        await user.click(within(rows[2]).getByRole("button", { name: "Delete link" }))

        expect(mocks.checkLink).toHaveBeenCalledWith(firstLink.id)
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
        configureHooks(
            { data: [firstLink, secondLink], isPending: false, isError: false },
            { isPending: true, variables: firstLink.id },
        )

        render(<TableLink />)

        const rows = screen.getAllByRole("row")
        expect(within(rows[1]).getByRole("button", { name: "Check link" })).toBeDisabled()
        expect(within(rows[2]).getByRole("button", { name: "Check link" })).toBeEnabled()
    })
})