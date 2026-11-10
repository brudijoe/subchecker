
import {
    Activity,
    CheckCircle2,
    CircleAlert,
    Database,
    LoaderCircle,
    Server,
    ShieldCheck,
    WifiOff,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useHealth } from "@/hooks/useHealth"

function getIndicatorColor(isChecking: boolean, isOperational: boolean) {
    if (isChecking) return "bg-muted-foreground"
    if (isOperational) return "bg-emerald-500"
    return "bg-destructive"
}

function getStatusTitle(isChecking: boolean, isOperational: boolean, isError: boolean) {
    if (isChecking) return "Checking systems"
    if (isOperational) return "All systems operational"
    if (isError) return "Connection unavailable"
    return "System partially unavailable"
}

function getStatusDescription(isChecking: boolean, isOperational: boolean, isError: boolean) {
    if (isChecking) return "Please wait while we verify the connection."
    if (isOperational) return "The backend API and PostgreSQL are online."
    if (isError) return "Unable to retrieve the system status. Check your backend connection."
    return "One or more systems are unavailable. Please try again."
}

function getSummaryColor(isChecking: boolean, isOperational: boolean) {
    if (isChecking) return "text-muted-foreground"
    if (isOperational) return "text-emerald-600 dark:text-emerald-400"
    return "text-destructive"
}

function getSummaryIcon(isChecking: boolean, isOperational: boolean) {
    if (isChecking) return <LoaderCircle className="size-5 animate-spin" />
    if (isOperational) return <ShieldCheck className="size-5" />
    return <CircleAlert className="size-5" />
}

function getApiStatus(health: ReturnType<typeof useHealth>, isChecking: boolean) {
    if (health.isError) {
        return (
            <>
                <WifiOff className="size-3.5 text-destructive" />
                Unavailable
            </>
        )
    }

    if (health.checks?.api === "ok") {
        return (
            <>
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                Online
            </>
        )
    }

    if (isChecking) return "Checking..."

    return (
        <>
            <CircleAlert className="size-3.5 text-destructive" />
            Unknown
        </>
    )
}

function getDatabaseStatus(health: ReturnType<typeof useHealth>, isChecking: boolean) {
    if (health.checks?.database === "ok" && !health.isError) {
        return (
            <>
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                Online
            </>
        )
    }

    if (health.checks?.database === "error") {
        return (
            <>
                <CircleAlert className="size-3.5 text-destructive" />
                Offline
            </>
        )
    }

    if (isChecking) return "Checking..."

    return (
        <>
            <WifiOff className="size-3.5 text-destructive" />
            Unknown
        </>
    )
}

export function SystemStatus() {
    const [open, setOpen] = useState(false)
    const health = useHealth()

    const isChecking =
        health.isPending || (health.isFetching && !health.data)

    const isOperational = health.isOperational

    const indicatorColor = getIndicatorColor(isChecking, isOperational)
    const statusTitle = getStatusTitle(isChecking, isOperational, health.isError)
    const statusDescription = getStatusDescription(isChecking, isOperational, health.isError)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={() => setOpen(true)}
                aria-label="Open system status"
                title="System status"
            >
                <span className="relative flex size-3">
                    <span
                        className={`relative inline-flex size-3 rounded-full ${indicatorColor}`}
                    />
                    {isOperational && (
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-40" />
                    )}
                </span>
            </Button>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="size-5" />
                        System status
                    </DialogTitle>
                    <DialogDescription>
                        Live overview of your application and database connection.
                    </DialogDescription>
                </DialogHeader>

                <div
                    role="status"
                    aria-live="polite"
                    className="overflow-hidden rounded-xl border bg-card"
                >
                    <div className="flex items-start gap-3 p-4">
                        <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted ${getSummaryColor(isChecking, isOperational)}`}
                        >
                            {getSummaryIcon(isChecking, isOperational)}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-semibold">{statusTitle}</p>
                            <p className="text-sm text-muted-foreground">
                                {statusDescription}
                            </p>
                            <p className="pt-1 text-xs text-muted-foreground">
                                Click refresh to check the system status again.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => void health.refetch()}
                            disabled={health.isFetching}
                            aria-label="Refresh system status"
                            title="Refresh status"
                        >
                            <Activity
                                className={`size-4 ${health.isFetching ? "animate-pulse" : ""
                                    }`}
                            />
                        </Button>
                    </div>


                    <div className="grid grid-cols-2 gap-px border-t bg-border">
                        <div className="flex items-center gap-2 bg-card px-4 py-3">
                            <Server
                                className="size-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Backend API</p>
                                <p className="flex items-center gap-1.5 text-sm font-medium">
                                    {getApiStatus(health, isChecking)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-card px-4 py-3">
                            <Database
                                className="size-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">PostgreSQL</p>
                                <p className="flex items-center gap-1.5 text-sm font-medium">
                                    {getDatabaseStatus(health, isChecking)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
