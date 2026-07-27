"use client";
import { useState } from "react";
import { Calendar, DatePicker, type CalixValue, type RangeValue } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import { jalali } from "@alydev/adapter-jalali";
import type { SelectionMode } from "@alydev/core";

type Cal = "gregorian" | "jalali";

/** Interactive, editable-by-props playground embedded in the docs via MDX. */
export function Playground({
  mode = "single",
  inline = false,
}: {
  mode?: SelectionMode;
  inline?: boolean;
}) {
  const [cal, setCal] = useState<Cal>("gregorian");
  const [value, setValue] = useState<CalixValue>(
    mode === "range" ? ({ start: null, end: null } satisfies RangeValue) : null,
  );
  const adapter = cal === "gregorian" ? gregorian : jalali;
  const locale = cal === "gregorian" ? "en-US" : "fa-IR";

  return (
    <div className="not-prose my-6 flex flex-col gap-4 rounded-xl border p-6">
      <div className="flex gap-2">
        {(["gregorian", "jalali"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCal(c)}
            data-active={cal === c ? "" : undefined}
            className="rounded-md border px-3 py-1 text-sm data-[active]:bg-fd-primary data-[active]:text-fd-primary-foreground"
          >
            {c}
          </button>
        ))}
      </div>
      <div>
        {inline ? (
          <Calendar adapter={adapter} locale={locale} mode={mode} value={value} onChange={setValue} numberOfMonths={mode === "range" ? 2 : 1} />
        ) : (
          <DatePicker adapter={adapter} locale={locale} mode={mode} value={value} onChange={setValue} />
        )}
      </div>
    </div>
  );
}
