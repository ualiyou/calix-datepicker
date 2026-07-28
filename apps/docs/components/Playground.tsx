"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Calendar,
  DatePicker,
  type CalixValue,
  type ColorTheme,
  type OutputFormat,
} from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import { hijri } from "@alydev/adapter-hijri";
import { jalali } from "@alydev/adapter-jalali";
import { buddhist } from "@alydev/adapter-buddhist";
import { CodeIcon, EyeIcon } from "@alydev/icons";
import { internationalHolidays } from "@alydev/holidays-international";
import { iranHolidays } from "@alydev/holidays-iran";
import type { CalendarAdapter, SelectionMode, Weekday } from "@alydev/core";

type CalendarKind = "gregorian" | "jalali" | "hijri" | "buddhist";
type View = "datepicker" | "calendar";
type HolidaySource = "none" | "iran" | "international";

const modes: SelectionMode[] = ["single", "multiple", "range", "week", "month", "year", "quarter"];
type Choice = string | number;

const calendarOptions: Record<CalendarKind, { adapter: CalendarAdapter; locale: string }> = {
  gregorian: { adapter: gregorian, locale: "en-US" },
  jalali: { adapter: jalali, locale: "fa-IR" },
  hijri: { adapter: hijri, locale: "ar-SA" },
  buddhist: { adapter: buddhist, locale: "th-TH" },
};

function highlightTsx(code: string): ReactNode[] {
  return code
    .split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:import|from)\b|<\/?[A-Z][\w.]*|\/?>|[{}])/g)
    .map((token, index) => {
      const className = /^['"]/.test(token)
        ? "text-amber-300"
        : /^(import|from)$/.test(token)
          ? "text-violet-300"
          : /^<\/?[A-Z]/.test(token)
            ? "text-sky-300"
            : /^[{}]|\/?>$/.test(token)
              ? "text-fd-muted-foreground"
              : undefined;
      return className ? (
        <span key={index} className={className}>
          {token}
        </span>
      ) : (
        token
      );
    });
}

function highlightJson(value: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of value.matchAll(
    /"(?:[^"\\]|\\.)*"|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?/g,
  )) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(value.slice(cursor, index));
    const token = match[0];
    const key =
      token.startsWith('"') &&
      value
        .slice(index + token.length)
        .trimStart()
        .startsWith(":");
    const className = key
      ? "text-sky-300"
      : token.startsWith('"')
        ? "text-emerald-300"
        : "text-amber-300";
    nodes.push(
      <span key={index} className={className}>
        {token}
      </span>,
    );
    cursor = index + token.length;
  }
  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="calix-playground__field">
      {label}
      {children}
    </label>
  );
}

function Choices<T extends Choice>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="calix-playground__choices" role="group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="calix-playground__toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function createCode(config: Config): string {
  const component = config.view === "calendar" ? "Calendar" : "DatePicker";
  const adapter = config.calendar;
  const holidayDataName =
    config.holidaySource === "iran" ? "iranHolidays" : "internationalHolidays";
  const holidayImport =
    config.holidaySource === "iran"
      ? 'import { iranHolidays } from "@alydev/holidays-iran";'
      : 'import { internationalHolidays } from "@alydev/holidays-international";';
  const usesHolidays =
    config.holidaySource !== "none" && (config.showHolidays || !config.holidaysSelectable);
  const props = [
    `adapter={${adapter}}`,
    `locale="${calendarOptions[config.calendar].locale}"`,
    config.mode !== "single" && `mode="${config.mode}"`,
    config.theme !== "dark" && `theme="light"`,
    config.numberOfMonths !== 1 && `numberOfMonths={${config.numberOfMonths}}`,
    config.weekStartsOn !== "auto" && `weekStartsOn={${config.weekStartsOn}}`,
    !config.fixedWeeks && "fixedWeeks={false}",
    config.businessDaysOnly && "businessDaysOnly",
    usesHolidays && `holidayData={${holidayDataName}}`,
    config.showHolidays && "showHolidays",
    !config.holidaysSelectable && "holidaysSelectable={false}",
    config.view === "calendar" && config.showToday && "showToday",
    config.view === "datepicker" && !config.showToday && "showToday={false}",
    config.mode === "multiple" && config.max > 0 && `max={${config.max}}`,
    config.labels &&
      `labels={{\n    weekdays: [${config.weekdays
        .split(",")
        .map((label) => `"${label.trim()}"`)
        .join(
          ", ",
        )}],\n    previousMonth: "${config.previousMonth}",\n    nextMonth: "${config.nextMonth}",\n  }}`,
    config.view === "datepicker" &&
      config.placeholder !== "Select date" &&
      `placeholder="${config.placeholder}"`,
    config.view === "datepicker" && config.mode === "single" && config.withTime && "withTime",
    config.view === "datepicker" &&
      config.mode === "single" &&
      config.withTime &&
      'outputPattern="yyyy-MM-dd HH:mm"',
    config.view === "datepicker" &&
      config.mode === "single" &&
      config.withTime &&
      `timePickerProps={{ variant: "${config.timeVariant}", hourCycle: ${config.hourCycle} }}`,
    config.outputFormat === "json" && 'outputFormat="json"',
    "onOutputChange={(output) => console.log(output)}",
  ].filter(Boolean);
  return `import { ${component} } from "@alydev/datepicker";\nimport { ${adapter} } from "@alydev/adapter-${adapter}";${usesHolidays ? `\n${holidayImport}` : ""}\nimport "@alydev/themes/default.css";\n\n<${component}\n  ${props.join("\n  ")}\n/>;`;
}

interface Config {
  calendar: CalendarKind;
  view: View;
  mode: SelectionMode;
  theme: ColorTheme;
  numberOfMonths: number;
  weekStartsOn: "auto" | Weekday;
  fixedWeeks: boolean;
  businessDaysOnly: boolean;
  holidaySource: HolidaySource;
  showHolidays: boolean;
  holidaysSelectable: boolean;
  showToday: boolean;
  max: number;
  withTime: boolean;
  timeVariant: "field" | "wheel";
  hourCycle: 12 | 24;
  outputFormat: OutputFormat;
  placeholder: string;
  labels: boolean;
  weekdays: string;
  previousMonth: string;
  nextMonth: string;
}

const initialConfig: Config = {
  calendar: "gregorian",
  view: "datepicker",
  mode: "single",
  theme: "dark",
  numberOfMonths: 1,
  weekStartsOn: "auto",
  fixedWeeks: true,
  businessDaysOnly: false,
  holidaySource: "none",
  showHolidays: false,
  holidaysSelectable: true,
  showToday: true,
  max: 0,
  withTime: false,
  timeVariant: "wheel",
  hourCycle: 24,
  outputFormat: "string",
  placeholder: "Select date",
  labels: false,
  weekdays: "Su, Mo, Tu, We, Th, Fr, Sa",
  previousMonth: "Previous month",
  nextMonth: "Next month",
};

function previewValue(mode: SelectionMode): CalixValue {
  const date = new Date(2026, 2, 21);
  if (mode === "single") return null;
  if (mode === "multiple") return [date];
  if (
    mode === "range" ||
    mode === "week" ||
    mode === "month" ||
    mode === "year" ||
    mode === "quarter"
  ) {
    return { start: date, end: date };
  }
  return date;
}

function previewOutput(
  value: CalixValue,
  adapter: CalendarAdapter,
  locale: string,
  outputFormat: OutputFormat,
  pattern: string,
): string {
  const parts = (date: Date) => {
    const calendarDate = adapter.fromDate(date);
    const time = {
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      millisecond: date.getMilliseconds(),
    };
    const dateText = adapter.format(calendarDate, "yyyy-MM-dd", locale);
    const timeText = adapter.format(calendarDate, "HH:mm:ss", locale, time);
    return { calendarDate, time, dateText, timeText };
  };
  const serializeString = (date: Date) => {
    const { calendarDate, time } = parts(date);
    return adapter.format(calendarDate, pattern, locale, time);
  };
  const serializeJson = (date: Date) => {
    const { calendarDate, dateText, timeText } = parts(date);
    return {
      dateTime: `${dateText} ${timeText}`,
      date: dateText,
      time: timeText,
      year: calendarDate.year,
      month: calendarDate.month,
      day: calendarDate.day,
    };
  };
  if (outputFormat === "json") {
    if (Array.isArray(value)) return JSON.stringify({ dates: value.map(serializeJson) }, null, 2);
    if (value && "start" in value)
      return JSON.stringify(
        {
          start: value.start ? serializeJson(value.start) : null,
          end: value.end ? serializeJson(value.end) : null,
        },
        null,
        2,
      );
    if (value) return JSON.stringify(serializeJson(value), null, 2);
    return JSON.stringify(
      { dateTime: null, date: null, time: null, year: null, month: null, day: null },
      null,
      2,
    );
  }
  if (Array.isArray(value)) return value.map(serializeString).join(", ");
  if (value && "start" in value) {
    const start = value.start ? serializeString(value.start) : "";
    const end = value.end ? serializeString(value.end) : "";
    return end ? `${start} – ${end}` : start;
  }
  return value ? serializeString(value) : "";
}

/** Interactive configurator embedded on the dedicated Playground page. */
export function Playground({ builder = false }: { builder?: boolean }) {
  const [config, setConfig] = useState(initialConfig);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [output, setOutput] = useState("");
  const [selectedValue, setSelectedValue] = useState<CalixValue>(() =>
    previewValue(initialConfig.mode),
  );
  const update = <K extends keyof Config>(key: K, value: Config[K]) =>
    setConfig((current) => ({ ...current, [key]: value }));
  const selectMode = (mode: SelectionMode) => {
    setConfig((current) => ({ ...current, mode, withTime: mode === "single" && current.withTime }));
    setSelectedValue(previewValue(mode));
  };
  const { adapter, locale } = calendarOptions[config.calendar];
  const holidayData =
    config.holidaySource === "iran" ? iranHolidays : internationalHolidays;
  const includesTime = config.view === "datepicker" && config.mode === "single" && config.withTime;
  const labels = config.labels
    ? {
        weekdays: config.weekdays.split(",").map((label) => label.trim()),
        previousMonth: config.previousMonth,
        nextMonth: config.nextMonth,
      }
    : undefined;
  const code = useMemo(() => createCode(config), [config]);

  useEffect(() => {
    setOutput(
      previewOutput(
        selectedValue,
        adapter,
        locale,
        config.outputFormat,
        includesTime ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd",
      ),
    );
  }, [adapter, config.outputFormat, includesTime, locale, selectedValue]);

  if (!builder) return <Calendar adapter={adapter} locale={locale} mode="single" />;

  const previewProps = {
    adapter,
    locale,
    mode: config.mode,
    theme: config.theme,
    numberOfMonths: config.numberOfMonths,
    fixedWeeks: config.fixedWeeks,
    businessDaysOnly: config.businessDaysOnly,
    ...(config.holidaySource !== "none" && (config.showHolidays || !config.holidaysSelectable)
      ? {
          holidayData,
          showHolidays: config.showHolidays,
          holidaysSelectable: config.holidaysSelectable,
        }
      : {}),
    showToday: config.showToday,
    ...(config.weekStartsOn === "auto" ? {} : { weekStartsOn: config.weekStartsOn }),
    ...(config.mode === "multiple" && config.max ? { max: config.max } : {}),
    ...(labels ? { labels } : {}),
    value: selectedValue,
    onChange: setSelectedValue,
    outputFormat: config.outputFormat,
    ...(includesTime ? { outputPattern: "yyyy-MM-dd HH:mm" } : {}),
  };
  return (
    <div className="calix-playground not-prose my-6 grid gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="calix-playground__controls">
        <div>
          <p className="font-semibold">Configure</p>
          <p className="text-sm text-fd-muted-foreground">
            Changes update the preview and final code.
          </p>
        </div>
        <Field label="Component">
          <Choices
            value={config.view}
            options={[
              { value: "datepicker", label: "Date picker" },
              { value: "calendar", label: "Inline calendar" },
            ]}
            onChange={(value) => update("view", value)}
          />
        </Field>
        <Field label="Calendar">
          <Choices
            value={config.calendar}
            options={[
              { value: "gregorian", label: "Gregorian" },
              { value: "jalali", label: "Jalali" },
              { value: "hijri", label: "Hijri" },
              { value: "buddhist", label: "Buddhist" },
            ]}
            onChange={(value) => update("calendar", value)}
          />
        </Field>
        <Field label="Selection">
          <Choices
            value={config.mode}
            options={modes.map((value) => ({ value, label: value }))}
            onChange={selectMode}
          />
        </Field>
        <Field label="Theme">
          <Choices
            value={config.theme}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
            onChange={(value) => update("theme", value)}
          />
        </Field>
        <Field label="Output">
          <Choices
            value={config.outputFormat}
            options={[
              { value: "string", label: "String" },
              { value: "json", label: "JSON" },
            ]}
            onChange={(value) => update("outputFormat", value)}
          />
        </Field>
        <Field label="Months">
          <input
            type="number"
            min="1"
            max="3"
            value={config.numberOfMonths}
            onChange={(event) => update("numberOfMonths", Number(event.target.value))}
          />
        </Field>
        <Field label="Week starts on">
          <Choices
            value={config.weekStartsOn}
            options={[
              { value: "auto", label: "Locale" },
              ...[0, 1, 2, 3, 4, 5, 6].map((value) => ({
                value: value as Weekday,
                label: String(value),
              })),
            ]}
            onChange={(value) => update("weekStartsOn", value)}
          />
        </Field>
        <Toggle
          label="Fixed weeks"
          checked={config.fixedWeeks}
          onChange={(value) => update("fixedWeeks", value)}
        />
        <Toggle
          label="Business days only"
          checked={config.businessDaysOnly}
          onChange={(value) => update("businessDaysOnly", value)}
        />
        <Field label="Holiday data">
          <Choices
            value={config.holidaySource}
            options={[
              { value: "none", label: "None" },
              { value: "iran", label: "Iran" },
              { value: "international", label: "International" },
            ]}
            onChange={(value) => update("holidaySource", value)}
          />
        </Field>
        <Toggle
          label="Show holidays"
          checked={config.showHolidays}
          onChange={(value) => update("showHolidays", value)}
          disabled={config.holidaySource === "none"}
        />
        <Toggle
          label="Holidays are selectable"
          checked={config.holidaysSelectable}
          onChange={(value) => update("holidaysSelectable", value)}
          disabled={config.holidaySource === "none"}
        />
        <Toggle
          label="Show Today button"
          checked={config.showToday}
          onChange={(value) => update("showToday", value)}
        />
        {config.mode === "multiple" && (
          <Field label="Maximum selections (0 = unlimited)">
            <input
              type="number"
              min="0"
              value={config.max}
              onChange={(event) => update("max", Number(event.target.value))}
            />
          </Field>
        )}
        {config.view === "datepicker" && (
          <>
            <Field label="Placeholder">
              <input
                value={config.placeholder}
                onChange={(event) => update("placeholder", event.target.value)}
              />
            </Field>
            <Toggle
              label="Include time"
              checked={config.withTime}
              onChange={(value) => {
                if (value) selectMode("single");
                update("withTime", value);
              }}
            />
            {config.withTime && config.mode === "single" && (
              <>
                <Field label="Time style">
                  <Choices
                    value={config.timeVariant}
                    options={[
                      { value: "wheel", label: "Wheel" },
                      { value: "field", label: "Field" },
                    ]}
                    onChange={(value) => update("timeVariant", value)}
                  />
                </Field>
                <Field label="Clock">
                  <Choices
                    value={config.hourCycle}
                    options={[
                      { value: 24, label: "24-hour" },
                      { value: 12, label: "12-hour" },
                    ]}
                    onChange={(value) => update("hourCycle", value)}
                  />
                </Field>
              </>
            )}
          </>
        )}
        <Toggle
          label="Custom labels"
          checked={config.labels}
          onChange={(value) => update("labels", value)}
        />
        {config.labels && (
          <>
            <Field label="Weekdays (comma separated)">
              <input
                value={config.weekdays}
                onChange={(event) => update("weekdays", event.target.value)}
              />
            </Field>
            <Field label="Previous month">
              <input
                value={config.previousMonth}
                onChange={(event) => update("previousMonth", event.target.value)}
              />
            </Field>
            <Field label="Next month">
              <input
                value={config.nextMonth}
                onChange={(event) => update("nextMonth", event.target.value)}
              />
            </Field>
          </>
        )}
      </aside>
      <section className="calix-playground__workspace min-w-0">
        <div className="calix-playground__tabs">
          <button
            type="button"
            aria-label="Show preview"
            title="Show preview"
            aria-pressed={tab === "preview"}
            onClick={() => setTab("preview")}
            className="grid size-9 place-items-center rounded-md border aria-pressed:border-fd-primary aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground"
          >
            <EyeIcon aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Show code"
            title="Show code"
            aria-pressed={tab === "code"}
            onClick={() => setTab("code")}
            className="grid size-9 place-items-center rounded-md border aria-pressed:border-fd-primary aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground"
          >
            <CodeIcon aria-hidden />
          </button>
        </div>
        {tab === "preview" ? (
          <div className="grid min-h-96 place-items-center p-6">
            <div className="grid place-items-center gap-4">
              {config.view === "calendar" ? (
                <Calendar key={code} {...previewProps} />
              ) : (
                <DatePicker
                  key={code}
                  {...previewProps}
                  placeholder={config.placeholder}
                  {...(config.mode === "single" && config.withTime
                    ? {
                        withTime: true,
                        timePickerProps: {
                          variant: config.timeVariant,
                          hourCycle: config.hourCycle,
                        },
                      }
                    : {})}
                />
              )}
              <div className="max-w-full">
                <p className="mb-1 text-xs text-fd-muted-foreground">
                  Output ({config.outputFormat})
                </p>
                <output
                  data-output-format={config.outputFormat}
                  className="block max-w-full overflow-x-auto whitespace-pre-wrap rounded border bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100"
                >
                  {output
                    ? config.outputFormat === "json"
                      ? highlightJson(output)
                      : output
                    : "Select a date to see the output"}
                </output>
              </div>
            </div>
          </div>
        ) : (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-5 text-sm leading-6 text-slate-100">
            <code>{highlightTsx(code)}</code>
          </pre>
        )}
      </section>
    </div>
  );
}
