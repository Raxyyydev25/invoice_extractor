import React, { useState } from "react";
import Landing from "./Landing";
import InvoiceExtractor from "./InvoiceExtractor";

function App() {
  const [showLanding, setShowLanding] = useState(true);

  return showLanding ? (
    <Landing onFinish={() => setShowLanding(false)} />
  ) : (
    <InvoiceExtractor />
  );
}

export default App;