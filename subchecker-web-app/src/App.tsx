import { TableLink } from "./pages/table-link"
import { Play } from "lucide-react"
import { DialogLink } from "./pages/dialog-link"
import { SystemStatus } from "@/components/system-status"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-foreground">
              <Play
                className="ml-0.5 size-4 fill-current"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold tracking-tight">
                  Subchecker
                </div>
                <SystemStatus />
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground sm:text-base">
            Keep track of your YouTube links and see if English subtitles
            are available.
          </p>
        </header>

        <TableLink />
        <DialogLink />
      </main>
    </div>
  )
}

export default App
