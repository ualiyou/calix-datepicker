"use client";
import { FloatingFocusManager, FloatingPortal } from "@floating-ui/react";
import type { CalendarDate, Time } from "@alydev/core";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useDatePicker, type UseDatePickerOptions } from "../hooks/useDatePicker.js";
import { useDateInput } from "../hooks/useDateInput.js";
import type { CalixValue, CalendarClassNames, CalendarPreset } from "../types.js";
import { CalendarView } from "./CalendarView.js";
import { DatePickerContext, useDatePickerContext } from "./context.js";
import { TimeField, type TimeFieldProps } from "./TimeField.js";

/* ------------------------------------------------------------------- Root */

export interface DatePickerRootProps extends UseDatePickerOptions {
  children: ReactNode;
}

/** Provides picker state/behavior to the compound children. Renders no DOM. */
function Root({ children, ...options }: DatePickerRootProps) {
  const api = useDatePicker(options);
  return <DatePickerContext.Provider value={api}>{children}</DatePickerContext.Provider>;
}

/* ---------------------------------------------------------------- Trigger */

export interface DatePickerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

/** A button that toggles the popover, wired to Floating UI reference props. */
function Trigger({ children, ...rest }: DatePickerTriggerProps) {
  const { refs, getReferenceProps, open } = useDatePickerContext();
  return (
    <button
      ref={refs.setReference}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      {...getReferenceProps(rest)}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ Input */

export interface DatePickerInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Format/parse pattern, e.g. `"yyyy/MM/dd"`. */
  pattern?: string;
  mask?: boolean;
}

/** A text input bound to the picker value (single-date mode). */
function Input({ pattern = "yyyy/MM/dd", mask = false, ...rest }: DatePickerInputProps) {
  const { calendar, refs, getReferenceProps } = useDatePickerContext();
  const adapter = calendar.adapter;
  const current = (calendar.value as Date | null) ?? null;

  const { getInputProps } = useDateInput({
    adapter,
    locale: calendar.locale,
    pattern,
    value: current ? adapter.fromDate(current) : null,
    mask,
    onCommit: (cd: CalendarDate | null) => calendar.setValue(cd ? adapter.toDate(cd) : null),
  });

  return (
    <input
      ref={refs.setReference}
      data-theme={calendar.theme}
      {...getInputProps()}
      {...getReferenceProps()}
      {...rest}
    />
  );
}

/* ---------------------------------------------------------------- Content */

export interface DatePickerContentProps {
  children?: ReactNode;
  classNames?: CalendarClassNames;
  /** Show the Today control in the default calendar. Default: true. */
  showToday?: boolean;
  /** Render into a portal at the document body. Default: true. */
  portal?: boolean;
}

/** The popover surface. Renders the calendar unless custom children are given. */
function Content({
  children,
  classNames,
  showToday = true,
  portal = true,
}: DatePickerContentProps) {
  const { open, context, refs, floatingStyles, getFloatingProps, calendar } =
    useDatePickerContext();

  if (!open) return null;

  const surface = (
    <FloatingFocusManager context={context} modal={false}>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className="calix-popover"
        data-theme={calendar.theme}
        data-calix-popover=""
        {...getFloatingProps()}
      >
        {children ?? (
          <CalendarView
            calendar={calendar}
            {...(classNames ? { classNames } : {})}
            showToday={showToday}
          />
        )}
      </div>
    </FloatingFocusManager>
  );

  return portal ? <FloatingPortal>{surface}</FloatingPortal> : surface;
}

/* ------------------------------------------------------- default DatePicker */

export interface DatePickerProps extends UseDatePickerOptions {
  /** Placeholder shown in the trigger when no date is selected. */
  placeholder?: string;
  pattern?: string;
  classNames?: CalendarClassNames;
  /** Show a time field after selecting a date. Default: false. Single-date mode only. */
  withTime?: boolean;
  /** Options forwarded to the optional time field. */
  timePickerProps?: Omit<TimeFieldProps, "value" | "defaultValue" | "onChange">;
  showToday?: boolean;
  showClear?: boolean;
  infiniteScroll?: boolean;
  /** One-click shortcuts shown in the popover (e.g. Today, Last 7 days). */
  presets?: CalendarPreset[];
}

function formatTrigger(
  value: unknown,
  adapter: DatePickerProps["adapter"],
  locale: string,
  pattern: string,
  placeholder: string,
): string {
  if (value instanceof Date)
    return adapter.format(adapter.fromDate(value), pattern, locale, toTime(value));
  if (value && typeof value === "object" && "start" in value) {
    const r = value as { start: Date | null; end: Date | null };
    if (!r.start) return placeholder;
    const start = adapter.format(adapter.fromDate(r.start), pattern, locale);
    const end = r.end ? adapter.format(adapter.fromDate(r.end), pattern, locale) : "…";
    return `${start} – ${end}`;
  }
  return placeholder;
}

/**
 * The convenience popover date picker: a trigger button plus a calendar
 * popover, composed from the primitives. Use `DatePicker.Root` and friends for
 * full control.
 */
function DatePickerBase({
  placeholder = "Select date",
  pattern,
  classNames,
  withTime = false,
  timePickerProps,
  showToday = true,
  showClear = false,
  infiniteScroll = false,
  presets,
  ...options
}: DatePickerProps) {
  const locale = options.locale ?? options.adapter.defaultLocale;
  const displayPattern = pattern ?? (withTime ? "yyyy/MM/dd HH:mm" : "yyyy/MM/dd");
  return (
    <Root
      {...options}
      {...(withTime
        ? {
            closeOnSelect: false,
            outputPattern: options.outputPattern ?? "yyyy-MM-dd HH:mm",
          }
        : {})}
    >
      <TriggerLabel
        placeholder={placeholder}
        pattern={displayPattern}
        adapter={options.adapter}
        locale={locale}
      />
      <Content>
        {withTime ? (
          <DateTimeContent
            classNames={classNames}
            timePickerProps={timePickerProps}
            showToday={showToday}
            showClear={showClear}
            infiniteScroll={infiniteScroll}
            {...(presets ? { presets } : {})}
          />
        ) : (
          <DefaultContent
            classNames={classNames}
            showToday={showToday}
            showClear={showClear}
            infiniteScroll={infiniteScroll}
            {...(presets ? { presets } : {})}
          />
        )}
      </Content>
    </Root>
  );
}

function DefaultContent({
  classNames,
  showToday,
  showClear,
  infiniteScroll,
  presets,
}: {
  classNames?: CalendarClassNames | undefined;
  showToday: boolean;
  showClear: boolean;
  infiniteScroll: boolean;
  presets?: CalendarPreset[] | undefined;
}) {
  const { calendar } = useDatePickerContext();
  return (
    <CalendarView
      calendar={calendar}
      {...(classNames ? { classNames } : {})}
      showToday={showToday}
      showClear={showClear}
      infiniteScroll={infiniteScroll}
      {...(presets ? { presets } : {})}
    />
  );
}

function DateTimeContent({
  classNames,
  timePickerProps,
  showToday,
  showClear,
  infiniteScroll,
  presets,
}: {
  classNames?: CalendarClassNames | undefined;
  timePickerProps?: DatePickerProps["timePickerProps"] | undefined;
  showToday: boolean;
  showClear: boolean;
  infiniteScroll: boolean;
  presets?: CalendarPreset[] | undefined;
}) {
  const { calendar } = useDatePickerContext();
  const date = timeTarget(calendar.value);
  const [step, setStep] = useState<"date" | "time">(date ? "time" : "date");
  const lastDate = useRef(date?.getTime());

  useEffect(() => {
    const nextDate = date?.getTime();
    if (nextDate !== undefined && nextDate !== lastDate.current) setStep("time");
    lastDate.current = nextDate;
  }, [date]);

  return (
    <div className="calix-date-time-picker">
      {step === "date" || !date ? (
        <CalendarView
          calendar={calendar}
          {...(classNames ? { classNames } : {})}
          showToday={showToday}
          showClear={showClear}
          infiniteScroll={infiniteScroll}
          {...(presets ? { presets } : {})}
        />
      ) : (
        <div className="calix-time-step">
          <button type="button" className="calix-time-back" onClick={() => setStep("date")}>
            {calendar.labels?.back ?? "Back"}
          </button>
          <p className="calix-time-step-title">{calendar.labels?.selectTime ?? "Select time"}</p>
          <TimeField
            {...timePickerProps}
            labels={{ ...calendar.labels, ...timePickerProps?.labels }}
            theme={calendar.theme}
            variant={timePickerProps?.variant ?? "wheel"}
            value={toTime(date)}
            onChange={(time) => calendar.setValue(setTargetTime(calendar.value, date, time))}
          />
        </div>
      )}
    </div>
  );
}

function toTime(date: Date): Time {
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
  };
}

function withTime(date: Date, time: Time): Date {
  const next = new Date(date);
  next.setHours(time.hour, time.minute, time.second, time.millisecond);
  return next;
}

function timeTarget(value: CalixValue): Date | null {
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.at(-1) ?? null;
  if (value && typeof value === "object" && "start" in value) {
    return value.end;
  }
  return null;
}

function setTargetTime(value: CalixValue, target: Date, time: Time): CalixValue {
  const next = withTime(target, time);
  if (value instanceof Date) return next;
  if (Array.isArray(value)) return [...value.slice(0, -1), next];
  if (value && typeof value === "object" && "start" in value) return { ...value, end: next };
  return next;
}

function TriggerLabel({
  placeholder,
  pattern,
  adapter,
  locale,
}: {
  placeholder: string;
  pattern: string;
  adapter: DatePickerProps["adapter"];
  locale: string;
}) {
  const { calendar } = useDatePickerContext();
  const label = useMemo(
    () => formatTrigger(calendar.value, adapter, locale, pattern, placeholder),
    [calendar.value, adapter, locale, pattern, placeholder],
  );
  return (
    <Trigger
      className="calix-trigger"
      data-theme={calendar.theme}
      data-empty={calendar.value == null ? "" : undefined}
    >
      {label}
    </Trigger>
  );
}

/** Compound export: `DatePicker`, `DatePicker.Root`, `.Trigger`, `.Input`, `.Content`. */
export const DatePicker = Object.assign(DatePickerBase, {
  Root,
  Trigger,
  Input,
  Content,
});
