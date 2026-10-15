import { useSelector } from "@tanstack/react-store";
import { CardLink } from "./pages/card-link"
import { TableLink } from "./pages/table-link";
import { linkStore } from "./stores/LinkStore";

function App() {
  const links = useSelector(linkStore, (state) => state.links);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Subchecker</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Keep track of your YouTube links at a glance.
          </p>
        </header>
        <section aria-label="Your YouTube links">
          <TableLink links={links} />
        </section>
        <CardLink />
      </main>
    </div>
  )
}

export default App
