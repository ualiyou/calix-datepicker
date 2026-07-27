"use client";
import type { Time } from "@alydev/core";
import { useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { useTime, type UseTimeOptions } from "../hooks/useTime.js";
import type { ColorTheme, PickerLabels } from "../types.js";

export interface TimeFieldProps extends UseTimeOptions {
  /** Presentation style. Default: "field". */
  variant?: "field" | "wheel" | "analog";
  labels?: PickerLabels;
  /** Color scheme for the standalone field. Default: "dark". */
  theme?: ColorTheme;
  className?: string;
  disabled?: boolean | undefined;
  "aria-label"?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * An accessible digital time field with stepper behavior. Arrow keys adjust the
 * focused segment; type to overwrite. Emits a {@link Time} on change.
 */
export function TimeField({ className, disabled, variant = "field", labels, theme = "dark", ...options }: TimeFieldProps) {
  const t = useTime(options);
  const withSeconds = options.withSeconds ?? false;
  const hourCycle = options.hourCycle ?? 24;

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
          values={Array.from({ length: hourCycle === 12 ? 12 : 24 }, (_, i) => hourCycle === 12 ? i + 1 : i)}
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
    const hours = Array.from({ length: hourCycle === 12 ? 12 : 24 }, (_, index) => hourCycle === 12 ? index + 1 : index);
    return (
      <div className={["calix-time", "calix-time-analog", className].filter(Boolean).join(" ")} role="group" aria-label={options["aria-label"] ?? labels?.time} data-theme={theme} data-calix-time="">
        <div className="calix-clock-face" role="listbox" aria-label={labels?.hour}>
          {hours.map((hour) => (
            <button key={hour} type="button" role="option" aria-selected={hour === t.displayHour} onClick={() => t.setHour(hourCycle === 12 ? to24(hour, t.meridiem) : hour)}>{pad(hour)}</button>
          ))}
        </div>
        <label className="calix-clock-minute">{labels?.minute}<input type="range" min="0" max="59" step={options.minuteStep ?? 1} value={t.value.minute} onChange={(event) => t.setMinute(Number(event.target.value))} /></label>
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
      {numberInput(labels?.minute ?? "Minute", t.value.minute, 59, t.setMinute, segmentKeyDown(t.incrementMinute))}
      {withSeconds && (
        <>
          <span aria-hidden className="calix-time-separator">
            :
          </span>
          {numberInput(labels?.second ?? "Second", t.value.second, 59, t.setSecond, segmentKeyDown(t.incrementSecond))}
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

const WHEEL_ITEM_HEIGHT = 40;

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
