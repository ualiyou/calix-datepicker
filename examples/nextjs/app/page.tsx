"use client";
import { useState } from "react";
import { DatePicker } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import { jalali } from "@alydev/adapter-jalali";

export default function Page() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <main style={{ padding: 40, display: "grid", gap: 24 }}>
      <h1>Calix + Next.js (App Router)</h1>
      <section>
        <h2>Gregorian</h2>
        <DatePicker adapter={gregorian} locale="en-US" value={value} onChange={(v) => setValue(v as Date | null)} />
      </section>
      <section dir="rtl">
        <h2>Jalali</h2>
        <DatePicker adapter={jalali} locale="fa-IR" dir="rtl" />
      </section>
      <p>Selected: {value ? value.toDateString() : "none"}</p>
    </main>
  );
}
