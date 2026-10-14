import { CardLink } from "./pages/card-link"
import { ItemLink } from "./pages/item-link"
import { useState } from "react"

function App() {
  // TODO: Müsste später ein array sein und dann mappen
  const [links, setLinks] = useState(["https://www.youtube.com/watch?v=wfaL-baiNUo", "https://www.youtube.com/watch?v=Xuoir8g4SQ"]);
  const [youtubeLink, setYoutubeLink] = useState("https://www.youtube.com/watch?v=wfaL-baiNUo");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div>Subchecker Web-App</div>
      <CardLink />
      <div>Subchecker Links</div>
      <ItemLink link={youtubeLink} />
    </div>
  )
}

export default App
