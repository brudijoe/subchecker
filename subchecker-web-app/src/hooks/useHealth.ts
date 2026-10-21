import { useQuery } from "@tanstack/react-query"

export type HealthResponse = {
    status: "operational" | "degraded"
    checks: {
        api: "ok"
        database: "ok" | "error"
    }
    timestamp: string
}

async function fetchHealth(): Promise<HealthResponse> {
    const response = await fetch("/health", {
        headers: { Accept: "application/json" },
    })

    if (response.status === 503) {
        return (await response.json()) as HealthResponse
    }

    if (!response.ok) {
        throw new Error(`Health check failed: HTTP ${response.status}`)
    }

    return (await response.json()) as HealthResponse
}

export function useHealth(enabled = true) {
    const query = useQuery({
        queryKey: ["health"],
        queryFn: fetchHealth,
        enabled,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: false,
    })

    const isOperational =
        !query.isError &&
        query.data?.status === "operational" &&
        query.data.checks.api === "ok" &&
        query.data.checks.database === "ok"

    return {
        ...query,
        isOperational,
        checks: query.data?.checks,
    }
}
