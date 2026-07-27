import { useState } from "react";
import {
  Calendar,
  DatePicker,
  TimeField,
  type CalixValue,
  type OutputFormat,
  type RangeValue,
} from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import { jalali } from "@alydev/adapter-jalali";
import { internationalHolidays } from "@alydev/holidays-international";
import { iranHolidays } from "@alydev/holidays-iran";
import type { Time } from "@alydev/core";

type Cal = "gregorian" | "jalali";
type HolidaySource = "none" | "iran" | "international";

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
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [range, setRange] = useState<RangeValue>({ start: null, end: null });
  const [time, setTime] = useState<Time>({ hour: 9, minute: 30, second: 0, millisecond: 0 });
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("string");
  const [singleOutput, setSingleOutput] = useState("");
  const [dateTimeOutput, setDateTimeOutput] = useState("");
  const [rangeOutput, setRangeOutput] = useState("");
  const [showHolidays, setShowHolidays] = useState(false);
  const [holidaysSelectable, setHolidaysSelectable] = useState(true);
  const [holidaySource, setHolidaySource] = useState<HolidaySource>("none");
  const holidayData = holidaySource === "iran" ? iranHolidays : internationalHolidays;
  const isJalali = cal === "jalali";

  return (
    <main className="playground" dir={isJalali ? "rtl" : "ltr"}>
      <header className="playground-header">
        <span className="eyebrow">Calix date picker</span>
        <h1>Calm dates, any calendar.</h1>
        <p>Switch calendars while preserving the same real-world date.</p>
        <div className="calendar-switch" role="group" aria-label="Calendar system">
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
        <div>
          <span className="switch-label">Output format</span>
          <div className="calendar-switch" role="group" aria-label="Output format">
            {(["string", "json"] as const).map((format) => (
              <button
                key={format}
                onClick={() => {
                  setOutputFormat(format);
                  setSingleOutput("");
                  setDateTimeOutput("");
                  setRangeOutput("");
                }}
                data-active={outputFormat === format ? "" : undefined}
                aria-pressed={outputFormat === format}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      </header>

      <Section title="Popup picker (single)">
        <DatePicker.Root
          adapter={adapter}
          locale={locale}
          value={single}
          onChange={(v: CalixValue) => setSingle(v as Date | null)}
          outputFormat={outputFormat}
          onOutputChange={setSingleOutput}
        >
          <DatePicker.Input
            className="calix-input"
            placeholder={isJalali ? "سال/ماه/روز" : "YYYY/MM/DD"}
          />
          <DatePicker.Content showToday />
        </DatePicker.Root>
        <output>{singleOutput || (isJalali ? "تاریخی انتخاب نشده" : "No date selected")}</output>
      </Section>

      <Section title="Date picker with optional time">
        <DatePicker
          adapter={adapter}
          locale={locale}
          value={dateTime}
          onChange={(v) => setDateTime(v as Date | null)}
          outputFormat={outputFormat}
          outputPattern="yyyy-MM-dd HH:mm"
          onOutputChange={setDateTimeOutput}
          withTime
          theme="light"
          labels={{
            weekdays:
              cal === "jalali"
                ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
                : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            previousMonth: cal === "jalali" ? "ماه قبل" : "Previous month",
            nextMonth: cal === "jalali" ? "ماه بعد" : "Next month",
            back: cal === "jalali" ? "بازگشت" : "Back",
            selectTime: cal === "jalali" ? "انتخاب ساعت" : "Select time",
            hour: cal === "jalali" ? "ساعت" : "Hour",
            minute: cal === "jalali" ? "دقیقه" : "Minute",
          }}
          timePickerProps={{ hourCycle: 12 }}
        />
        <output>
          {dateTimeOutput ||
            (isJalali ? "ابتدا تاریخ، سپس زمان را انتخاب کنید" : "Select a date, then a time")}
        </output>
      </Section>

      <Section title="Inline calendar (single)">
        <Calendar
          adapter={adapter}
          locale={locale}
          value={single}
          onChange={(v) => setSingle(v as Date | null)}
        />
      </Section>

      <Section title="Holiday data">
        <label>
          Source
          <select
            value={holidaySource}
            onChange={(event) => setHolidaySource(event.target.value as HolidaySource)}
          >
            <option value="none">None</option>
            <option value="iran">Iranian public holidays</option>
            <option value="international">International fixed holidays</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={showHolidays}
            disabled={holidaySource === "none"}
            onChange={(event) => setShowHolidays(event.target.checked)}
          />
          Show holidays
        </label>
        <label>
          <input
            type="checkbox"
            checked={holidaysSelectable}
            disabled={holidaySource === "none"}
            onChange={(event) => setHolidaysSelectable(event.target.checked)}
          />
          Holidays are selectable
        </label>
        <Calendar
          adapter={adapter}
          locale={locale}
          {...(holidaySource === "none" ? {} : { holidayData, showHolidays, holidaysSelectable })}
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
          outputFormat={outputFormat}
          onOutputChange={setRangeOutput}
        />
        <output>{rangeOutput || (isJalali ? "یک بازه انتخاب کنید" : "Select a range")}</output>
      </Section>

      <Section title="Business days only + time">
        <Calendar adapter={adapter} locale={locale} businessDaysOnly />
        <TimeField
          value={time}
          onChange={setTime}
          withSeconds
          hourCycle={12}
          theme="light"
          labels={{
            hour: cal === "jalali" ? "ساعت" : "Hour",
            minute: cal === "jalali" ? "دقیقه" : "Minute",
          }}
        />
      </Section>
    </main>
  );
}
