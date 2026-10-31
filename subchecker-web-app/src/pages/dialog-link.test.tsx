import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { DialogLink } from "./dialog-link"

const mocks = vi.hoisted(() => ({
    useCreateLink: vi.fn(),
    mutate: vi.fn(),
}))

vi.mock("@/hooks/useLinks", () => ({
    useCreateLink: mocks.useCreateLink,
}))

function configureMutation(state = {}) {
    mocks.useCreateLink.mockReturnValue({ mutate: mocks.mutate, ...state })
}

beforeEach(() => {
    configureMutation()
})

describe("DialogLink", () => {
    it("trims the URL, then clears and closes after success", async () => {
        const user = userEvent.setup()
        render(<DialogLink />)

        await user.click(screen.getByRole("button", { name: "Add link" }))
        await user.type(screen.getByLabelText("YouTube URL"), "  https://youtube.com/watch?v=abc  ")
        await user.click(screen.getByRole("button", { name: "Check link" }))

        expect(mocks.mutate).toHaveBeenCalledWith(
            "https://youtube.com/watch?v=abc",
            expect.objectContaining({ onSuccess: expect.any(Function) }),
        )

        const options = mocks.mutate.mock.calls[0][1] as { onSuccess: () => void }
        act(() => options.onSuccess())
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Add link" }))
        expect(screen.getByLabelText("YouTube URL")).toHaveValue("")
    })

    it("shows the create error and disables submission while pending", async () => {
        configureMutation({
            isError: true,
            error: new Error("Could not save this link"),
            isPending: true,
        })
        const user = userEvent.setup()
        render(<DialogLink />)

        await user.click(screen.getByRole("button", { name: "Add link" }))

        expect(screen.getByRole("alert")).toHaveTextContent("Could not save this link")
        expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled()
    })
})