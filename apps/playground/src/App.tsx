import { useState } from "react";
import { Calendar, DatePicker, TimeField, type CalixValue, type RangeValue } from "@alydev/react";
import { gregorian } from "@alydev/adapter-gregorian";
import { jalali } from "@alydev/adapter-jalali";
import type { Time } from "@alydev/core";

type Cal = "gregorian" | "jalali";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="demo-section">
      <h2>{title}</h2>
      <div className="demo-section-content">{children}</div>
    </section>
  );
}

export function App() {
  const [cal, setCal] = useState<Cal>("gregorian");
  const adapter = cal === "gregorian" ? gregorian : jalali;
  const locale = cal === "gregorian" ? "en-US" : "fa-IR";

  const [single, setSingle] = useState<Date | null>(null);
  const [range, setRange] = useState<RangeValue>({ start: null, end: null });
  const [time, setTime] = useState<Time>({ hour: 9, minute: 30, second: 0, millisecond: 0 });

  return (
    <main className="playground">
      <header className="playground-header">
        <span className="eyebrow">Calix date picker</span>
        <h1>Calm dates, any calendar.</h1>
        <p>Switch calendars while preserving the same real-world date.</p>
        <div className="calendar-switch" aria-label="Calendar system">
          {(["gregorian", "jalali"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCal(c)}
              data-active={cal === c ? "" : undefined}
              aria-pressed={cal === c}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <Section title="Popup picker (single)">
        <DatePicker.Root
          adapter={adapter}
          locale={locale}
          value={single}
          onChange={(v: CalixValue) => setSingle(v as Date | null)}
        >
          <DatePicker.Input className="calix-input" placeholder="YYYY/MM/DD" />
          <DatePicker.Content />
        </DatePicker.Root>
        <output>{single ? single.toLocaleDateString(locale) : "No date selected"}</output>
      </Section>

      <Section title="Inline calendar (single)">
        <Calendar
          adapter={adapter}
          locale={locale}
          value={single}
          onChange={(v) => setSingle(v as Date | null)}
        />
      </Section>

      <Section title="Range, dual month">
        <Calendar
          adapter={adapter}
          locale={locale}
          mode="range"
          numberOfMonths={2}
          value={range}
          onChange={(v) => setRange(v as RangeValue)}
        />
        <output>
          {range.start?.toLocaleDateString(locale) ?? "—"} → {range.end?.toLocaleDateString(locale) ?? "—"}
        </output>
      </Section>

      <Section title="Business days only + time">
        <Calendar adapter={adapter} locale={locale} businessDaysOnly />
        <TimeField value={time} onChange={setTime} withSeconds hourCycle={12} />
      </Section>
    </main>
  );
}
