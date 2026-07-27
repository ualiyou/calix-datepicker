import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { DatePicker } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import "@alydev/themes/default.css";

function App() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Calix + Vite</h1>
      <DatePicker adapter={gregorian} locale="en-US" value={value} onChange={(v) => setValue(v as Date | null)} />
      <p>Selected: {value ? value.toDateString() : "none"}</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
