import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SystemStatus } from "./system-status"

const mocks = vi.hoisted(() => ({
    useHealth: vi.fn(),
    refetch: vi.fn(),
}))

vi.mock("@/hooks/useHealth", () => ({
    useHealth: mocks.useHealth,
}))

function configureHealth(state = {}) {
    mocks.useHealth.mockReturnValue({
        isPending: false,
        isFetching: false,
        isOperational: true,
        isError: false,
        checks: { api: "ok", database: "ok" },
        refetch: mocks.refetch,
        ...state,
    })
}

beforeEach(() => {
    configureHealth()
})

describe("SystemStatus", () => {
    it("shows healthy API and database status", async () => {
        const user = userEvent.setup()
        render(<SystemStatus />)

        await user.click(screen.getByRole("button", { name: "Open system status" }))

        expect(screen.getByText("All systems operational")).toBeInTheDocument()
        const dialog = screen.getByRole("dialog")
        expect(within(dialog).getAllByText("Online")).toHaveLength(2)
    })

    it("shows a degraded database status", async () => {
        configureHealth({
            isOperational: false,
            checks: { api: "ok", database: "error" },
        })
        const user = userEvent.setup()
        render(<SystemStatus />)

        await user.click(screen.getByRole("button", { name: "Open system status" }))

        const dialog = screen.getByRole("dialog")
        expect(within(dialog).getByText("System partially unavailable")).toBeInTheDocument()
        expect(within(dialog).getByText("Offline")).toBeInTheDocument()
    })

    it("requests a refresh when the refresh control is activated", async () => {
        const user = userEvent.setup()
        render(<SystemStatus />)

        await user.click(screen.getByRole("button", { name: "Open system status" }))
        await user.click(screen.getByRole("button", { name: "Refresh system status" }))

        expect(mocks.refetch).toHaveBeenCalledOnce()
    })
})