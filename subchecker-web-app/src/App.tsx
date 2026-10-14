import { CardLink } from "./pages/card-link"
import { useState } from "react"
import { TableLink } from "./pages/table-link";

function App() {
  // TODO store in local storage with tanstack plugin
  const [links, setLinks] = useState(["https://www.youtube.com/watch?v=wfaL-baiNUo", "https://www.youtube.com/watch?v=UXhV9FxxGbg"]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div>Subchecker Web-App</div>
      <TableLink links={links} />
      <CardLink />
    </div>
  )
}

export default App
