import { RefreshCw, RefreshCwOff } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

type RefreshButtonProps = {
    disabled?: boolean
    hasEnglishSubtitles: boolean
    isRefreshing?: boolean
    refreshRemainingMs?: number
    onRefresh: () => void
}

function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
}

export function RefreshButton({
    disabled = false,
    hasEnglishSubtitles,
    isRefreshing = false,
    refreshRemainingMs = 0,
    onRefresh,
}: RefreshButtonProps) {
    const [clock, setClock] = useState(() => {
        const now = Date.now()
        return {
            now,
            serverCooldownUntil: refreshRemainingMs > 0 ? now + refreshRemainingMs : 0,
        }
    })

    const cooldownUntil = clock.serverCooldownUntil
    const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - clock.now) / 1000))
    const timeLabel = formatTime(remainingSeconds)
    let buttonLabel = "Refresh link"
    let buttonTitle = "Refresh link"

    if (isRefreshing) {
        buttonLabel = "Refreshing link"
        buttonTitle = "Checking link"
    } else if (remainingSeconds > 0) {
        buttonLabel = `Refresh link. Available in ${timeLabel}`
        buttonTitle = `Refresh available in ${timeLabel}`
    }

    useEffect(() => {
        if (cooldownUntil <= clock.now) return

        const intervalId = window.setInterval(() => {
            setClock(current => ({ ...current, now: Date.now() }))
        }, 1000)

        return () => window.clearInterval(intervalId)
    }, [cooldownUntil, clock.now])

    function handleRefresh() {
        onRefresh()
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            aria-label={buttonLabel}
            title={buttonTitle}
            disabled={disabled || isRefreshing || remainingSeconds > 0}
            onClick={handleRefresh}
        >
            {isRefreshing && <RefreshCw className="size-4 animate-spin" />}
            {!isRefreshing && remainingSeconds === 0 && (
                hasEnglishSubtitles
                    ? <RefreshCwOff className="size-4" />
                    : <RefreshCw className={`size-4 ${disabled ? "animate-spin" : ""}`} />
            )}
            {!isRefreshing && remainingSeconds > 0 && <RefreshCwOff className="size-4" />}
            <span>Refresh</span>
            {!isRefreshing && remainingSeconds > 0 && <span>{timeLabel}</span>}
        </Button>
    )
}
