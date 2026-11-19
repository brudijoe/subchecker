import { RefreshCw, RefreshCwOff } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

const COOLDOWN_MS = 5 * 60 * 1000

type RefreshButtonProps = {
    disabled?: boolean
    hasEnglishSubtitles: boolean
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
    onRefresh,
}: RefreshButtonProps) {
    const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
    const [now, setNow] = useState(() => Date.now())
    const remainingSeconds = cooldownUntil === null
        ? 0
        : Math.max(0, Math.ceil((cooldownUntil - now) / 1000))
    const timeLabel = formatTime(remainingSeconds)

    useEffect(() => {
        if (cooldownUntil === null) return

        const intervalId = window.setInterval(() => {
            const currentTime = Date.now()

            if (currentTime >= cooldownUntil) {
                setCooldownUntil(null)
                return
            }

            setNow(currentTime)
        }, 1000)

        return () => window.clearInterval(intervalId)
    }, [cooldownUntil])

    function handleRefresh() {
        const currentTime = Date.now()
        // Refresh the displayed clock immediately instead of waiting for the first timeout.
        setNow(currentTime)
        setCooldownUntil(currentTime + COOLDOWN_MS)
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
