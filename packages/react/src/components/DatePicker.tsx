"use client";
import { FloatingFocusManager, FloatingPortal } from "@floating-ui/react";
import type { CalendarDate } from "@alydev/core";
import {
  useMemo,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useDatePicker, type UseDatePickerOptions } from "../hooks/useDatePicker.js";
import { useDateInput } from "../hooks/useDateInput.js";
import type { CalendarClassNames } from "../types.js";
import { CalendarView } from "./CalendarView.js";
import { DatePickerContext, useDatePickerContext } from "./context.js";

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
}

/** A text input bound to the picker value (single-date mode). */
function Input({ pattern = "yyyy/MM/dd", ...rest }: DatePickerInputProps) {
  const { calendar, refs, getReferenceProps } = useDatePickerContext();
  const adapter = calendar.adapter;
  const current = (calendar.value as Date | null) ?? null;

  const { getInputProps } = useDateInput({
    adapter,
    locale: calendar.locale,
    pattern,
    value: current ? adapter.fromDate(current) : null,
    onCommit: (cd: CalendarDate | null) =>
      calendar.setValue(cd ? adapter.toDate(cd) : null),
  });

  return <input ref={refs.setReference} {...getInputProps()} {...getReferenceProps()} {...rest} />;
}

/* ---------------------------------------------------------------- Content */

export interface DatePickerContentProps {
  children?: ReactNode;
  classNames?: CalendarClassNames;
  /** Render into a portal at the document body. Default: true. */
  portal?: boolean;
}

/** The popover surface. Renders the calendar unless custom children are given. */
function Content({ children, classNames, portal = true }: DatePickerContentProps) {
  const { open, context, refs, floatingStyles, getFloatingProps, calendar } =
    useDatePickerContext();

  if (!open) return null;

  const surface = (
    <FloatingFocusManager context={context} modal={false}>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className="calix-popover"
        data-calix-popover=""
        {...getFloatingProps()}
      >
        {children ?? (
          <CalendarView calendar={calendar} {...(classNames ? { classNames } : {})} />
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
}

function formatTrigger(
  value: unknown,
  adapter: DatePickerProps["adapter"],
  locale: string,
  pattern: string,
  placeholder: string,
): string {
  if (value instanceof Date) return adapter.format(adapter.fromDate(value), pattern, locale);
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
  pattern = "yyyy/MM/dd",
  classNames,
  ...options
}: DatePickerProps) {
  const locale = options.locale ?? options.adapter.defaultLocale;
  return (
    <Root {...options}>
      <TriggerLabel
        placeholder={placeholder}
        pattern={pattern}
        adapter={options.adapter}
        locale={locale}
      />
      <Content {...(classNames ? { classNames } : {})} />
    </Root>
  );
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
    <Trigger className="calix-trigger" data-empty={calendar.value == null ? "" : undefined}>
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
