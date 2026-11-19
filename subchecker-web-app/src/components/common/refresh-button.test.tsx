import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { RefreshButton } from "./refresh-button"

afterEach(() => {
    vi.useRealTimers()
})

describe("RefreshButton", () => {
    it("counts down to zero and enables refresh again when it expires", () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-01-01T00:00:00.750Z"))
        const onRefresh = vi.fn()

        const { container } = render(
            <RefreshButton
                hasEnglishSubtitles={false}
                refreshRemainingMs={5 * 60 * 1000}
                onRefresh={onRefresh}
            />,
        )

        const button = screen.getByRole("button", { name: "Refresh link. Available in 05:00" })
        expect(button).toBeDisabled()
        expect(screen.getByText("05:00")).toBeInTheDocument()
        expect(container.querySelector(".lucide-refresh-cw")).not.toBeInTheDocument()

        act(() => {
            vi.advanceTimersByTime(999)
        })

        expect(screen.getByText("05:00")).toBeInTheDocument()

        act(() => {
            vi.advanceTimersByTime(1)
        })

        expect(screen.getByText("04:59")).toBeInTheDocument()

        act(() => {
            vi.advanceTimersByTime(299_000)
        })

        expect(screen.queryByText("00:00")).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Refresh link" })).toBeEnabled()
        expect(container.querySelector(".lucide-refresh-cw")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Refresh link" }))

        expect(onRefresh).toHaveBeenCalledOnce()
        expect(screen.queryByText("05:00")).not.toBeInTheDocument()
    })

    it("keeps refresh disabled when the parent disables it", () => {
        render(
            <RefreshButton
                disabled
                hasEnglishSubtitles
                onRefresh={vi.fn()}
            />,
        )

        expect(screen.getByRole("button", { name: "Refresh link" })).toBeDisabled()
    })

    it("restores the countdown from the server-provided remaining duration", () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"))

        render(
            <RefreshButton
                hasEnglishSubtitles={false}
                refreshRemainingMs={5 * 60 * 1000}
                onRefresh={vi.fn()}
            />,
        )

        expect(screen.getByText("05:00")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Refresh link. Available in 05:00" })).toBeDisabled()
    })

    it("shows a spinner while refreshing, then reveals the cooldown", () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"))
        const onRefresh = vi.fn()

        const { container, rerender } = render(
            <RefreshButton
                hasEnglishSubtitles={false}
                onRefresh={onRefresh}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Refresh link" }))
        expect(onRefresh).toHaveBeenCalledOnce()
        expect(screen.queryByText("05:00")).not.toBeInTheDocument()

        rerender(
            <RefreshButton
                hasEnglishSubtitles={false}
                isRefreshing
                onRefresh={onRefresh}
            />,
        )

        expect(container.querySelector(".lucide-refresh-cw.animate-spin")).toBeInTheDocument()
        expect(screen.queryByText("05:00")).not.toBeInTheDocument()

        rerender(
            <RefreshButton
                key="server-response"
                hasEnglishSubtitles={false}
                refreshRemainingMs={5 * 60 * 1000}
                onRefresh={onRefresh}
            />,
        )

        expect(container.querySelector(".lucide-refresh-cw.animate-spin")).not.toBeInTheDocument()
        expect(screen.getByText("05:00")).toBeInTheDocument()
    })
})
