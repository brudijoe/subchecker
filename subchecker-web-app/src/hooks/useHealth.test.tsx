import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { PropsWithChildren } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useHealth } from "./useHealth"

afterEach(() => {
    vi.unstubAllGlobals()
})

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })

    return function Wrapper({ children }: PropsWithChildren) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }
}

describe("useHealth", () => {
    it("marks the service operational when API and database are healthy", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
            status: "operational",
            checks: { api: "ok", database: "ok" },
            timestamp: "2026-10-31T12:00:00.000Z",
        })))

        const { result } = renderHook(() => useHealth(), { wrapper: createWrapper() })
        await waitFor(() => expect(result.current.isOperational).toBe(true))

        expect(result.current.checks).toEqual({ api: "ok", database: "ok" })
    })

    it("treats HTTP 503 as a degraded status response", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
            status: "degraded",
            checks: { api: "ok", database: "error" },
            timestamp: "2026-10-31T12:00:00.000Z",
        }, { status: 503 })))

        const { result } = renderHook(() => useHealth(), { wrapper: createWrapper() })
        await waitFor(() => expect(result.current.data?.status).toBe("degraded"))

        expect(result.current.isError).toBe(false)
        expect(result.current.isOperational).toBe(false)
    })

    it("marks unexpected HTTP failures as errors", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })))

        const { result } = renderHook(() => useHealth(), { wrapper: createWrapper() })
        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.isOperational).toBe(false)
    })
})