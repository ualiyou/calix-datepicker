import type { Time } from "@alydev/core";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react-dom";
import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useTime, type UseTimeOptions } from "../hooks/useTime.js";
import { defaultPickerLabels, type ColorTheme, type PickerLabels } from "../types.js";
import { useControllableState } from "../utils/useControllableState.js";

export interface TimeFieldProps extends UseTimeOptions {
  /** Presentation style. Default: "field". */
  variant?: "field" | "wheel" | "analog";
  /** Replacements for built-in time-control labels. */
  labels?: PickerLabels;
  /** Locale used for labels and numeric clock values. Default: "en-US". */
  locale?: string;
  /** Commits the selected value from the analog picker. */
  onAccept?: (value: Time) => void;
  /** Applies the current local time. */
  onNow?: (value: Time) => void;
  /** Dismisses the analog picker without changing its value. */
  onCancel?: () => void;
  /** Show the action footer in the inline analog field. Default: true. */
  showActions?: boolean;
  /** Color scheme for the standalone field. Default: "dark". */
  theme?: ColorTheme;
  /** Class applied to the outer time-field element. */
  className?: string;
  /** Prevent time changes. Default: `false`. */
  disabled?: boolean | undefined;
  /** Accessible name. Default: localized `"Time"`. */
  "aria-label"?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const EMPTY_TIME: Time = { hour: 0, minute: 0, second: 0, millisecond: 0 };

/**
 * An accessible digital time field with stepper behavior. Arrow keys adjust the
 * focused segment; type to overwrite. Emits a {@link Time} on change.
 */
export function TimeField({
  className,
  disabled,
  variant = "field",
  labels,
  locale = "en-US",
  onAccept,
  onNow,
  onCancel,
  showActions = true,
  theme = "dark",
  ...options
}: TimeFieldProps) {
  const t = useTime(options);
  const withSeconds = options.withSeconds ?? false;
  const hourCycle = options.hourCycle ?? 24;
  const [analogPart, setAnalogPart] = useState<"hour" | "minute">("hour");
  const text = { ...defaultPickerLabels(locale), ...labels };

  const segmentKeyDown =
    (increment: (d: number) => void) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        increment(1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        increment(-1);
      }
    };

  const numberInput = (
    label: string,
    display: number,
    max: number,
    onCommit: (n: number) => void,
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void,
  ) => (
    <input
      className="calix-time-segment"
      type="text"
      inputMode="numeric"
      aria-label={label}
      role="spinbutton"
      aria-valuenow={display}
      aria-valuemin={0}
      aria-valuemax={max}
      disabled={disabled}
      value={pad(display)}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const n = Number(e.target.value.replace(/\D/g, ""));
        if (!Number.isNaN(n)) onCommit(n);
      }}
      onKeyDown={onKeyDown}
    />
  );

  if (variant === "wheel") {
    return (
      <div
        className={["calix-time", "calix-time-wheel", className].filter(Boolean).join(" ")}
        role="group"
        aria-label={options["aria-label"] ?? labels?.time ?? "Time"}
        data-theme={theme}
        data-calix-time=""
      >
        <WheelColumn
          label={labels?.hour ?? "Hour"}
          values={Array.from({ length: hourCycle === 12 ? 12 : 24 }, (_, i) =>
            hourCycle === 12 ? i + 1 : i,
          )}
          value={t.displayHour}
          disabled={disabled}
          onChange={(hour) => t.setHour(hourCycle === 12 ? to24(hour, t.meridiem) : hour)}
        />
        <WheelColumn
          label={labels?.minute ?? "Minute"}
          values={Array.from({ length: 60 }, (_, i) => i)}
          value={t.value.minute}
          disabled={disabled}
          onChange={t.setMinute}
        />
        {hourCycle === 12 && (
          <WheelColumn
            label={labels?.meridiem ?? "AM/PM"}
            values={["am", "pm"]}
            value={t.meridiem}
            disabled={disabled}
            onChange={t.setMeridiem}
          />
        )}
      </div>
    );
  }

  if (variant === "analog") {
    const hourLabel = text.hour;
    const minuteLabel = text.minute;
    const timeLabel = text.time;
    const format = (value: number) =>
      new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false }).format(value);
    const outerRadius = "var(--calix-clock-outer-radius, 6.75rem)";
    const innerRadius = "var(--calix-clock-inner-radius, 3.75rem)";
    const hours = Array.from({ length: 12 }, (_, index) =>
      hourCycle === 12
        ? [{ value: index + 1, radius: outerRadius }]
        : [
            { value: index, radius: innerRadius },
            { value: index + 12, radius: outerRadius },
          ],
    ).flat();
    const minutes = Array.from({ length: 12 }, (_, index) => index * 5);
    const selectedHour = hourCycle === 12 ? t.displayHour : t.value.hour;
    const activeLabel = analogPart === "hour" ? hourLabel : minuteLabel;
    return (
      <div
        className={["calix-time", "calix-time-analog", className].filter(Boolean).join(" ")}
        role="group"
        aria-label={options["aria-label"] ?? timeLabel}
        data-theme={theme}
        data-calix-time=""
      >
        <output className="calix-clock-value" aria-live="polite">
          {format(t.displayHour)}:{format(t.value.minute)}
        </output>
        <div className="calix-clock-tabs" role="tablist" aria-label={timeLabel}>
          <button
            type="button"
            role="tab"
            aria-selected={analogPart === "hour"}
            onClick={() => setAnalogPart("hour")}
          >
            {hourLabel}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={analogPart === "minute"}
            onClick={() => setAnalogPart("minute")}
          >
            {minuteLabel}
          </button>
        </div>
        <div
          className="calix-clock-face"
          role="listbox"
          aria-label={activeLabel}
          data-part={analogPart}
          style={
            {
              "--calix-clock-hour-angle": `${(t.displayHour % 12) * 30 + t.value.minute / 2}deg`,
              "--calix-clock-minute-angle": `${t.value.minute * 6}deg`,
            } as CSSProperties
          }
        >
          <span className="calix-clock-hand calix-clock-hour-hand" aria-hidden="true" />
          <span className="calix-clock-hand calix-clock-minute-hand" aria-hidden="true" />
          <span className="calix-clock-center" aria-hidden="true" />
          {(analogPart === "hour" ? hours : minutes).map((item) => {
            const hour = typeof item === "number" ? item : item.value;
            const radius = typeof item === "number" ? outerRadius : item.radius;
            const ring = typeof item === "number" || item.value >= 12 ? "outer" : "inner";
            const selected = analogPart === "hour" ? hour === selectedHour : hour === t.value.minute;
            return (
              <button
                key={`${analogPart}-${hour}`}
                type="button"
                role="option"
                aria-label={`${activeLabel} ${format(hour)}`}
                aria-selected={selected}
                data-ring={ring}
                disabled={disabled}
                style={
                  {
                    "--calix-clock-angle": `${analogPart === "minute" ? hour * 6 : (hour % 12) * 30}deg`,
                    "--calix-clock-radius": radius,
                  } as CSSProperties
                }
                onClick={() => {
                  if (analogPart === "hour") {
                    t.setHour(hourCycle === 12 ? to24(hour, t.meridiem) : hour);
                    setAnalogPart("minute");
                  } else {
                    t.setMinute(hour);
                  }
                }}
              >
                {format(hour)}
              </button>
            );
          })}
        </div>
        {hourCycle === 12 && (
          <button
            type="button"
            className="calix-time-meridiem"
            aria-label={labels?.toggleMeridiem ?? "Toggle AM/PM"}
            disabled={disabled}
            onClick={() => t.setMeridiem(t.meridiem === "am" ? "pm" : "am")}
          >
            {t.meridiem.toUpperCase()}
          </button>
        )}
        {showActions && (
          <TimePickerActions
            disabled={disabled}
            labels={text}
            onAccept={() => onAccept?.(t.value)}
            onNow={() => {
              const value = nowTime();
              t.setHour(value.hour);
              t.setMinute(value.minute);
              t.setSecond(value.second);
              onNow?.(value);
            }}
            onCancel={onCancel}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={["calix-time", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={options["aria-label"] ?? labels?.time ?? "Time"}
      data-theme={theme}
      data-calix-time=""
    >
      {numberInput(
        labels?.hour ?? "Hour",
        t.displayHour,
        hourCycle === 24 ? 23 : 12,
        (n) => t.setHour(hourCycle === 12 ? to24(n, t.meridiem) : n),
        segmentKeyDown(t.incrementHour),
      )}
      <span aria-hidden className="calix-time-separator">
        :
      </span>
      {numberInput(
        labels?.minute ?? "Minute",
        t.value.minute,
        59,
        t.setMinute,
        segmentKeyDown(t.incrementMinute),
      )}
      {withSeconds && (
        <>
          <span aria-hidden className="calix-time-separator">
            :
          </span>
          {numberInput(
            labels?.second ?? "Second",
            t.value.second,
            59,
            t.setSecond,
            segmentKeyDown(t.incrementSecond),
          )}
        </>
      )}
      {hourCycle === 12 && (
        <button
          type="button"
          className="calix-time-meridiem"
          aria-label={labels?.toggleMeridiem ?? "Toggle AM/PM"}
          disabled={disabled}
          onClick={() => t.setMeridiem(t.meridiem === "am" ? "pm" : "am")}
        >
          {t.meridiem.toUpperCase()}
        </button>
      )}
    </div>
  );
}

export interface TimePickerProps extends TimeFieldProps {
  /** Placeholder used only when the picker has no value. */
  placeholder?: string;
}

/** A time input with a popover picker. Use {@link TimeField} for an inline control. */
export function TimePicker({
  className,
  defaultValue,
  onAccept,
  onCancel,
  onNow,
  onChange,
  placeholder,
  value,
  ...props
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useControllableState<Time>({
    value,
    defaultValue: defaultValue ?? EMPTY_TIME,
    onChange,
  });
  const locale = props.locale ?? "en-US";
  const format = (part: number) =>
    new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false }).format(part);
  const text = { ...defaultPickerLabels(locale), ...props.labels };
  const hasValue = time.hour !== 0 || time.minute !== 0 || time.second !== 0 || time.millisecond !== 0;
  const { refs, floatingStyles } = useFloating({
    open,
    placement: "bottom-start",
    strategy: "fixed",
    transform: false,
    middleware: [
      offset(8),
      flip({ padding: 8, fallbackStrategy: "initialPlacement" }),
      shift({ padding: 8, mainAxis: false }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const reference = target instanceof Element && target.closest("[data-calix-time-reference]");
      if (target && !reference && !refs.floating.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, refs.floating]);

  const popover = open ? (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="calix-time-popover"
      data-calix-popover=""
      role="dialog"
      aria-label={text.time}
    >
      <TimeField
        {...props}
        variant={props.variant ?? "analog"}
        showActions={false}
        value={time}
        onChange={setTime}
      />
      <TimePickerActions
        disabled={props.disabled}
        labels={text}
        onAccept={() => {
          onAccept?.(time);
          setOpen(false);
        }}
        onNow={() => {
          const value = nowTime();
          setTime(value);
          onNow?.(value);
        }}
        onCancel={() => {
          onCancel?.();
          setOpen(false);
        }}
      />
    </div>
  ) : null;

  return (
    <div className={["calix-time-picker", className].filter(Boolean).join(" ")}>
      <span className="calix-time-picker-icon" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="13" r="7" />
          <path d="M12 9v4l2.5 1.5M9 2h6M12 2v3M4 4l1.5 1.5M20 4l-1.5 1.5" />
        </svg>
      </span>
      <input
        ref={refs.setReference}
        className="calix-input"
        data-calix-time-reference=""
        readOnly
        aria-label={props["aria-label"] ?? text.time}
        aria-haspopup="dialog"
        aria-expanded={open}
        placeholder={placeholder ?? text.time}
        value={`${format(props.hourCycle === 12 ? (time.hour % 12 || 12) : time.hour)}:${format(time.minute)}`}
        onClick={() => setOpen(true)}
      />
      <button
        type="button"
        className="calix-time-picker-toggle"
        data-calix-time-reference=""
        aria-label={text.time}
        aria-expanded={open}
        disabled={props.disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        className="calix-time-picker-clear"
        data-calix-time-reference=""
        aria-label={text.clear}
        title={text.clear}
        disabled={props.disabled || !hasValue}
        onClick={() => setTime(EMPTY_TIME)}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m7 7 10 10M17 7 7 17" />
        </svg>
      </button>
      {popover && (typeof document !== "undefined" ? createPortal(popover, document.body) : popover)}
    </div>
  );
}

function nowTime(): Time {
  const now = new Date();
  return {
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
    millisecond: now.getMilliseconds(),
  };
}

function TimePickerActions({
  disabled,
  labels,
  onAccept,
  onNow,
  onCancel,
}: {
  disabled?: boolean | undefined;
  labels: Required<PickerLabels>;
  onAccept: () => void;
  onNow: () => void;
  onCancel?: (() => void) | undefined;
}) {
  return (
    <div className="calix-time-picker-actions">
      <button type="button" disabled={disabled} onClick={onAccept}>
        {labels.confirm}
      </button>
      <button type="button" disabled={disabled} onClick={onNow}>
        {labels.now}
      </button>
      <button type="button" disabled={disabled} onClick={onCancel}>
        {labels.cancel}
      </button>
    </div>
  );
}

const WHEEL_ITEM_HEIGHT = 32;

function WheelColumn<T extends number | "am" | "pm">({
  label,
  values,
  value,
  disabled,
  onChange,
}: {
  label: string;
  values: T[];
  value: T;
  disabled?: boolean | undefined;
  onChange: (value: T) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrolling = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingIndex = useRef(0);
  const selected = values.indexOf(value);

  useEffect(() => {
    const target = Math.max(selected, 0) * WHEEL_ITEM_HEIGHT;
    if (ref.current && !scrolling.current && Math.abs(ref.current.scrollTop - target) > 1) {
      ref.current.scrollTop = target;
    }
  }, [selected]);

  useEffect(() => () => clearTimeout(scrollTimer.current), []);

  return (
    <div
      ref={ref}
      className="calix-time-wheel-column"
      role="listbox"
      aria-label={label}
      onScroll={(event) => {
        scrolling.current = true;
        pendingIndex.current = Math.round(event.currentTarget.scrollTop / WHEEL_ITEM_HEIGHT);
        clearTimeout(scrollTimer.current);
        scrollTimer.current = setTimeout(() => {
          scrolling.current = false;
          const next = values[pendingIndex.current];
          if (next !== undefined && next !== value) onChange(next);
        }, 80);
      }}
    >
      {values.map((item) => (
        <button
          key={item}
          type="button"
          role="option"
          aria-label={`${label} ${typeof item === "number" ? pad(item) : item.toUpperCase()}`}
          aria-selected={item === value}
          disabled={disabled}
          onClick={() => onChange(item)}
        >
          {typeof item === "number" ? pad(item) : item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function to24(hour12: number, meridiem: "am" | "pm"): number {
  const base = hour12 % 12;
  return meridiem === "pm" ? base + 12 : base;
}

export type { Time };
