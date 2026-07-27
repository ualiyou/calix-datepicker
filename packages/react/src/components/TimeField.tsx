"use client";
import type { Time } from "@calix/core";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useTime, type UseTimeOptions } from "../hooks/useTime.js";

export interface TimeFieldProps extends UseTimeOptions {
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * An accessible digital time field with stepper behavior. Arrow keys adjust the
 * focused segment; type to overwrite. Emits a {@link Time} on change.
 */
export function TimeField({ className, disabled, ...options }: TimeFieldProps) {
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

  return (
    <div
      className={["calix-time", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={options["aria-label"] ?? "Time"}
      data-calix-time=""
    >
      {numberInput(
        "Hour",
        t.displayHour,
        hourCycle === 24 ? 23 : 12,
        (n) => t.setHour(hourCycle === 12 ? to24(n, t.meridiem) : n),
        segmentKeyDown(t.incrementHour),
      )}
      <span aria-hidden className="calix-time-separator">
        :
      </span>
      {numberInput("Minute", t.value.minute, 59, t.setMinute, segmentKeyDown(t.incrementMinute))}
      {withSeconds && (
        <>
          <span aria-hidden className="calix-time-separator">
            :
          </span>
          {numberInput("Second", t.value.second, 59, t.setSecond, segmentKeyDown(t.incrementSecond))}
        </>
      )}
      {hourCycle === 12 && (
        <button
          type="button"
          className="calix-time-meridiem"
          aria-label="Toggle AM/PM"
          disabled={disabled}
          onClick={() => t.setMeridiem(t.meridiem === "am" ? "pm" : "am")}
        >
          {t.meridiem.toUpperCase()}
        </button>
      )}
    </div>
  );
}

function to24(hour12: number, meridiem: "am" | "pm"): number {
  const base = hour12 % 12;
  return meridiem === "pm" ? base + 12 : base;
}

export type { Time };
