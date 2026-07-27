import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DatePicker } from "@calix/react";
import { gregorian } from "@calix/adapter-gregorian";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <main style={{ padding: 40 }}>
      <h1>Calix + TanStack Start</h1>
      <DatePicker adapter={gregorian} locale="en-US" value={value} onChange={(v) => setValue(v as Date | null)} />
      <p>Selected: {value ? value.toDateString() : "none"}</p>
    </main>
  );
}
