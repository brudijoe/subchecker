import { RefreshCw, RefreshCwOff } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

const COOLDOWN_MS = 5 * 60 * 1000

type RefreshButtonProps = {
    disabled?: boolean
    hasEnglishSubtitles: boolean
    refreshAvailableAt?: string | null
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
    refreshAvailableAt = null,
    onRefresh,
}: RefreshButtonProps) {
    const [optimisticCooldownUntil, setOptimisticCooldownUntil] = useState<number | null>(null)
    const [now, setNow] = useState(() => Date.now())
    const serverCooldownUntil = refreshAvailableAt ? Date.parse(refreshAvailableAt) : 0
    const cooldownUntil = Math.max(serverCooldownUntil, optimisticCooldownUntil ?? 0)
    const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000))
    const timeLabel = formatTime(remainingSeconds)

    useEffect(() => {
        if (cooldownUntil <= now) return

        const intervalId = window.setInterval(() => {
            setNow(Date.now())
        }, 1000)

        return () => window.clearInterval(intervalId)
    }, [cooldownUntil, now])

    function handleRefresh() {
        const currentTime = Date.now()
        // Refresh the displayed clock immediately instead of waiting for the first timeout.
        setNow(currentTime)
        setOptimisticCooldownUntil(currentTime + COOLDOWN_MS)
        onRefresh()
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            aria-label={remainingSeconds > 0
                ? `Refresh link. Available in ${timeLabel}`
                : "Refresh link"}
            title={remainingSeconds > 0 ? `Refresh available in ${timeLabel}` : "Refresh link"}
            disabled={disabled || remainingSeconds > 0}
            onClick={handleRefresh}
        >
            {remainingSeconds === 0 && (
                hasEnglishSubtitles
                    ? <RefreshCwOff className="size-4" />
                    : <RefreshCw className={`size-4 ${disabled ? "animate-spin" : ""}`} />
            )}
            {remainingSeconds > 0 && <span>{timeLabel}</span>}
        </Button>
    )
}
