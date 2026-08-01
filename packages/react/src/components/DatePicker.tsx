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
import { createPortal } from "react-dom";
import { useDatePicker, type UseDatePickerOptions } from "../hooks/useDatePicker.js";
import { useDateInput } from "../hooks/useDateInput.js";
import type {
  CalixValue,
  CalendarClassNames,
  CalendarPreset,
  DatePickerClassNames,
} from "../types.js";
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
  /** Use this element as the popover anchor. Default: true. */
  reference?: boolean;
}

/** A button that toggles the popover. */
function Trigger({ children, reference = true, ...rest }: DatePickerTriggerProps) {
  const { refs, getReferenceProps, open, popoverId } = useDatePickerContext();
  return (
    <button
      ref={reference ? refs.setReference : undefined}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={popoverId}
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
  /** Use this element as the popover anchor. Default: true. */
  reference?: boolean;
}

/** A text input bound to the picker value (single-date mode). */
function Input({
  pattern = "yyyy/MM/dd",
  mask = false,
  reference = true,
  ...rest
}: DatePickerInputProps) {
  const { calendar, refs, getReferenceProps, open, popoverId, setOpen } = useDatePickerContext();
  const adapter = calendar.adapter;
  const current = (calendar.value as Date | null) ?? null;

  const { getInputProps } = useDateInput({
    adapter,
    locale: calendar.locale,
    pattern,
    value: current ? adapter.fromDate(current) : null,
    time: current ? toTime(current) : undefined,
    mask,
    onCommit: (cd: CalendarDate | null) => calendar.setValue(cd ? adapter.toDate(cd) : null),
  });

  const inputProps = getInputProps();
  const { onKeyDown, ...inputRest } = rest;

  return (
    <input
      ref={reference ? refs.setReference : undefined}
      data-theme={calendar.theme}
      {...inputProps}
      {...getReferenceProps(inputRest)}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={popoverId}
      onKeyDown={(event) => {
        inputProps.onKeyDown?.(event);
        onKeyDown?.(event);
        if (event.key === "Enter" || event.key === " ") setOpen(true);
      }}
    />
  );
}

/* ---------------------------------------------------------------- Content */

export interface DatePickerContentProps {
  children?: ReactNode;
  classNames?: CalendarClassNames;
  className?: string;
  /** Show the Today control in the default calendar. Default: true. */
  showToday?: boolean;
  /** Show a Cancel control that closes the default calendar. Default: true. */
  showCancel?: boolean;
  /** Render into a portal at the document body. Default: true. */
  portal?: boolean;
}

/** The popover surface. Renders the calendar unless custom children are given. */
function Content({
  children,
  classNames,
  className,
  showToday = true,
  showCancel = true,
  portal = true,
}: DatePickerContentProps) {
  const { open, refs, floatingStyles, getFloatingProps, calendar, popoverId, setOpen } =
    useDatePickerContext();

  if (!open) return null;

  const surface = (
    <div
      ref={refs.setFloating}
      id={popoverId}
      style={floatingStyles}
      className={["calix-popover", className].filter(Boolean).join(" ")}
      data-theme={calendar.theme}
      data-calix-popover=""
      {...getFloatingProps()}
    >
      {children ?? (
        <CalendarView
          calendar={calendar}
          {...(classNames ? { classNames } : {})}
          showToday={showToday}
          {...(showCancel ? { onCancel: () => setOpen(false) } : {})}
        />
      )}
    </div>
  );

  return portal && typeof document !== "undefined" ? createPortal(surface, document.body) : surface;
}

/* ------------------------------------------------------- default DatePicker */

export interface DatePickerProps extends UseDatePickerOptions {
  /** Placeholder shown in the trigger when no date is selected. Default: `"Select date"`. */
  placeholder?: string;
  /** Display and input pattern. Default: `"yyyy/MM/dd"`, with `HH:mm` when `withTime` is true. */
  pattern?: string;
  /** CSS classes for the field, popover, calendar, and time-picker slots. */
  classNames?: DatePickerClassNames;
  /** Show a time field after selecting a date. Default: false. Single-date mode only. */
  withTime?: boolean;
  /** Options forwarded to the optional time field; value handlers are managed by DatePicker. */
  timePickerProps?: Omit<TimeFieldProps, "value" | "defaultValue" | "onChange">;
  /** Show the Today button. Default: `true`. */
  showToday?: boolean;
  /** Show the Clear button. Default: `false`. */
  showClear?: boolean;
  /** Show a Cancel control that closes the popover. Default: true. */
  showCancel?: boolean;
  /** Enable swipe and wheel month navigation. Default: `false`. */
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
  showCancel = true,
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
        {...(classNames ? { classNames } : {})}
      />
      <Content {...(classNames?.popover ? { className: classNames.popover } : {})} showCancel={false}>
        {withTime ? (
          <DateTimeContent
            {...(classNames ? { classNames } : {})}
            timePickerProps={timePickerProps}
            showToday={showToday}
            showClear={showClear}
            showCancel={showCancel}
            infiniteScroll={infiniteScroll}
            {...(presets ? { presets } : {})}
          />
        ) : (
          <DefaultContent
            {...(classNames ? { classNames } : {})}
            showToday={showToday}
            showClear={showClear}
            showCancel={showCancel}
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
  showCancel,
  infiniteScroll,
  presets,
}: {
  classNames?: DatePickerClassNames | undefined;
  showToday: boolean;
  showClear: boolean;
  showCancel: boolean;
  infiniteScroll: boolean;
  presets?: CalendarPreset[] | undefined;
}) {
  const { calendar, setOpen } = useDatePickerContext();
  return (
    <CalendarView
      calendar={calendar}
      {...(classNames ? { classNames } : {})}
      showToday={showToday}
      showClear={showClear}
      {...(showCancel ? { onCancel: () => setOpen(false) } : {})}
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
  showCancel,
  infiniteScroll,
  presets,
}: {
  classNames?: DatePickerClassNames | undefined;
  timePickerProps?: DatePickerProps["timePickerProps"] | undefined;
  showToday: boolean;
  showClear: boolean;
  showCancel: boolean;
  infiniteScroll: boolean;
  presets?: CalendarPreset[] | undefined;
}) {
  const { calendar, setOpen } = useDatePickerContext();
  const date = timeTarget(calendar.value);
  const [step, setStep] = useState<"date" | "time">("date");
  const lastDate = useRef(date?.getTime());

  useEffect(() => {
    const nextDate = date?.getTime();
    if (nextDate !== undefined && nextDate !== lastDate.current) setStep("time");
    lastDate.current = nextDate;
  }, [date]);

  return (
    <div className={["calix-date-time-picker", classNames?.dateTime].filter(Boolean).join(" ")}>
      {step === "date" || !date ? (
        <CalendarView
          calendar={calendar}
          {...(classNames ? { classNames } : {})}
          showToday={showToday}
          showClear={showClear}
          {...(showCancel ? { onCancel: () => setOpen(false) } : {})}
          infiniteScroll={infiniteScroll}
          {...(presets ? { presets } : {})}
        />
      ) : (
        <div className={["calix-time-step", classNames?.timeStep].filter(Boolean).join(" ")}>
          <button
            type="button"
            className={["calix-time-back", classNames?.timeBack].filter(Boolean).join(" ")}
            onClick={() => setStep("date")}
          >
            {calendar.labels?.back ?? "Back"}
          </button>
          <p className={["calix-time-step-title", classNames?.timeTitle].filter(Boolean).join(" ")}>
            {calendar.labels?.selectTime ?? "Select time"}
          </p>
          <TimeField
            {...timePickerProps}
            locale={calendar.locale}
            labels={{ ...calendar.labels, ...timePickerProps?.labels }}
            theme={calendar.theme}
            variant={timePickerProps?.variant ?? "wheel"}
            value={toTime(date)}
            onChange={(time) => calendar.setValue(setTargetTime(calendar.value, date, time))}
          />
          <div
            className={["calix-time-picker-actions", classNames?.timeActions]
              .filter(Boolean)
              .join(" ")}
          >
            <button type="button" onClick={() => setOpen(false)}>
              {calendar.labels?.confirm ?? "Confirm"}
            </button>
            <button
              type="button"
              onClick={() =>
                calendar.setValue(setTargetTime(calendar.value, date, toTime(new Date())))
              }
            >
              {calendar.labels?.now ?? "Now"}
            </button>
            <button type="button" onClick={() => setOpen(false)}>
              {calendar.labels?.cancel ?? "Cancel"}
            </button>
          </div>
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
  classNames,
}: {
  placeholder: string;
  pattern: string;
  adapter: DatePickerProps["adapter"];
  locale: string;
  classNames?: DatePickerClassNames | undefined;
}) {
  const { calendar } = useDatePickerContext();
  const hasValue =
    calendar.value != null && (!Array.isArray(calendar.value) || calendar.value.length > 0);
  const label = useMemo(
    () => formatTrigger(calendar.value, adapter, locale, pattern, placeholder),
    [calendar.value, adapter, locale, pattern, placeholder],
  );
  return (
    <div
      className={["calix-date-picker-field", classNames?.field].filter(Boolean).join(" ")}
      data-theme={calendar.theme}
      data-has-value={hasValue ? "" : undefined}
      dir={calendar.dir}
    >
      <Input
        className={["calix-input", classNames?.input].filter(Boolean).join(" ")}
        placeholder={placeholder}
        pattern={pattern}
        aria-label={label}
      />
      <Trigger
        reference={false}
        className={["calix-date-picker-toggle", classNames?.toggle].filter(Boolean).join(" ")}
        aria-label={label}
        title={label}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M8 2v4M16 2v4M3 10h18" />
        </svg>
      </Trigger>
      <button
        type="button"
        className={["calix-date-picker-clear", classNames?.clear].filter(Boolean).join(" ")}
        aria-label={calendar.labels?.clear ?? "Clear"}
        title={calendar.labels?.clear ?? "Clear"}
        disabled={!hasValue}
        onClick={calendar.clear}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m7 7 10 10M17 7 7 17" />
        </svg>
      </button>
    </div>
  );
}

/** Compound export: `DatePicker`, `DatePicker.Root`, `.Trigger`, `.Input`, `.Content`. */
export const DatePicker = Object.assign(DatePickerBase, {
  Root,
  Trigger,
  Input,
  Content,
});
