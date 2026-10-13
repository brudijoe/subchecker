import { CardLink } from "./pages/card-link"
import { ItemLink } from "./pages/item-link"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div>Subchecker Web-App</div>
      <CardLink />
      <div>Subchecker Links</div>
      <ItemLink />
    </div>
  )
}

export default App
