import type { Time } from "@alydev/core";
import { useCallback, useMemo } from "react";
import { useControllableState } from "../utils/useControllableState.js";

export interface UseTimeOptions {
  value?: Time | undefined;
  defaultValue?: Time;
  onChange?: (value: Time) => void;
  /** 12- or 24-hour clock. Default: 24. */
  hourCycle?: 12 | 24;
  /** Minute step. Default: 1. */
  minuteStep?: number;
  /** Second step. Default: 1. */
  secondStep?: number;
  /** Whether seconds are editable. Default: false. */
  withSeconds?: boolean;
}

export interface UseTimeReturn {
  value: Time;
  /** Displayed hour honoring the hour cycle (1–12 or 0–23). */
  displayHour: number;
  meridiem: "am" | "pm";
  setHour: (hour: number) => void;
  setMinute: (minute: number) => void;
  setSecond: (second: number) => void;
  setMeridiem: (m: "am" | "pm") => void;
  incrementHour: (delta: number) => void;
  incrementMinute: (delta: number) => void;
  incrementSecond: (delta: number) => void;
}

const EMPTY: Time = { hour: 0, minute: 0, second: 0, millisecond: 0 };
const wrap = (n: number, max: number) => ((n % max) + max) % max;

/** Controlled/uncontrolled clock-time state with hour-cycle awareness. */
export function useTime(options: UseTimeOptions = {}): UseTimeReturn {
  const {
    hourCycle = 24,
    minuteStep = 1,
    secondStep = 1,
  } = options;

  const [value, setValue] = useControllableState<Time>({
    value: options.value,
    defaultValue: options.defaultValue ?? EMPTY,
    onChange: options.onChange,
  });

  const patch = useCallback(
    (part: Partial<Time>) => setValue((prev) => ({ ...prev, ...part })),
    [setValue],
  );

  const displayHour = useMemo(() => {
    if (hourCycle === 24) return value.hour;
    const h = value.hour % 12;
    return h === 0 ? 12 : h;
  }, [value.hour, hourCycle]);

  const meridiem: "am" | "pm" = value.hour < 12 ? "am" : "pm";

  const setHour = useCallback((hour: number) => patch({ hour: wrap(hour, 24) }), [patch]);
  const setMinute = useCallback((minute: number) => patch({ minute: wrap(minute, 60) }), [patch]);
  const setSecond = useCallback((second: number) => patch({ second: wrap(second, 60) }), [patch]);

  const setMeridiem = useCallback(
    (m: "am" | "pm") => {
      const base = value.hour % 12;
      patch({ hour: m === "pm" ? base + 12 : base });
    },
    [patch, value.hour],
  );

  const incrementHour = useCallback((d: number) => setHour(value.hour + d), [setHour, value.hour]);
  const incrementMinute = useCallback(
    (d: number) => setMinute(value.minute + d * minuteStep),
    [setMinute, value.minute, minuteStep],
  );
  const incrementSecond = useCallback(
    (d: number) => setSecond(value.second + d * secondStep),
    [setSecond, value.second, secondStep],
  );

  return {
    value,
    displayHour,
    meridiem,
    setHour,
    setMinute,
    setSecond,
    setMeridiem,
    incrementHour,
    incrementMinute,
    incrementSecond,
  };
}
