import type {
  CalendarAdapter,
  CalendarDate,
  Direction,
  Holiday,
  MonthView,
  SelectionMode,
  Weekday,
} from "@alydev/core";
import type { ButtonHTMLAttributes, HTMLAttributes, Ref } from "react";
import type { CalixValue } from "./value.js";

export type { CalixValue, RangeValue } from "./value.js";

export type ColorTheme = "dark" | "light";
export type OutputFormat = "string" | "json";

/** Text shown by the built-in calendar and time picker controls. */
export interface PickerLabels {
  /** Replaces the seven localized weekday headers; must contain exactly seven labels. */
  weekdays?: readonly string[];
  previousMonth?: string;
  nextMonth?: string;
  chooseMonthAndYear?: string;
  previousYear?: string;
  nextYear?: string;
  chooseYear?: string;
  previousYears?: string;
  nextYears?: string;
  back?: string;
  selectTime?: string;
  time?: string;
  hour?: string;
  minute?: string;
  second?: string;
  meridiem?: string;
  toggleMeridiem?: string;
  today?: string;
  clear?: string;
}

/** Built-in UI text. Persian is selected automatically for a Persian locale. */
export function defaultPickerLabels(locale: string): Required<PickerLabels> {
  if (locale.toLowerCase().startsWith("fa")) {
    return {
      weekdays: [],
      previousMonth: "ماه قبل",
      nextMonth: "ماه بعد",
      chooseMonthAndYear: "انتخاب ماه و سال",
      previousYear: "سال قبل",
      nextYear: "سال بعد",
      chooseYear: "انتخاب سال",
      previousYears: "سال‌های قبل",
      nextYears: "سال‌های بعد",
      back: "بازگشت",
      selectTime: "انتخاب زمان",
      time: "زمان",
      hour: "ساعت",
      minute: "دقیقه",
      second: "ثانیه",
      meridiem: "قبل از ظهر/بعد از ظهر",
      toggleMeridiem: "تغییر قبل از ظهر/بعد از ظهر",
      today: "امروز",
      clear: "پاک کردن",
    };
  }
  return {
    weekdays: [],
    previousMonth: "Previous month",
    nextMonth: "Next month",
    chooseMonthAndYear: "Choose month and year",
    previousYear: "Previous year",
    nextYear: "Next year",
    chooseYear: "Choose year",
    previousYears: "Previous years",
    nextYears: "Next years",
    back: "Back",
    selectTime: "Select time",
    time: "Time",
    hour: "Hour",
    minute: "Minute",
    second: "Second",
    meridiem: "AM/PM",
    toggleMeridiem: "Toggle AM/PM",
    today: "Today",
    clear: "Clear",
  };
}

/** Date-based selection constraints supplied by consumers. */
export interface CalixConstraints {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  enabledDates?: Date[];
  disabledWeekdays?: Weekday[];
  disabledMonths?: number[];
  disabledYears?: number[];
  businessDaysOnly?: boolean;
  holidays?: Date[];
  /** Named holidays to decorate without making the day unavailable. */
  holidayData?: readonly Holiday[];
  /** Show names and visual markers from `holidayData`. Default: `false`. */
  showHolidays?: boolean;
  /** Whether dates in `holidayData` can be selected. Default: `true`. */
  holidaysSelectable?: boolean;
  /** Return `true` to disable the given date. Receives calendar-agnostic parts. */
  isDateDisabled?: (date: CalendarDate, adapter: CalendarAdapter) => boolean;
}

/** Options shared by the calendar hook and components. */
export interface UseCalendarOptions extends CalixConstraints {
  adapter: CalendarAdapter;
  mode?: SelectionMode;
  value?: CalixValue;
  defaultValue?: CalixValue;
  onChange?: (value: CalixValue) => void;
  /** Receives the selected value serialized as text or JSON. `onChange` always receives `Date` values. */
  onOutputChange?: (value: string) => void;
  /** Serialization used by `onOutputChange`. Default: `"string"`. */
  outputFormat?: OutputFormat;
  /** Date pattern used for string output. Default: `"yyyy-MM-dd"`. */
  outputPattern?: string;
  /** Fired after each selection with the next value and whether it is complete. */
  onSelect?: (value: CalixValue, complete: boolean) => void;
  locale?: string;
  dir?: Direction;
  /** Built-in control text. Weekday names still come from the adapter unless overridden. */
  labels?: PickerLabels;
  /** Color scheme for the built-in components. Default: "dark". */
  theme?: ColorTheme;
  /** 0 = Sunday … 6 = Saturday. Defaults to a locale-appropriate value. */
  weekStartsOn?: Weekday;
  /** The month shown first (uncontrolled default). */
  defaultMonth?: Date;
  /** Number of months rendered side by side. */
  numberOfMonths?: number;
  fixedWeeks?: boolean;
  /** Max selectable dates in `multiple` mode. */
  max?: number;
  /** Minimum length of a `range` selection, in inclusive days. */
  minRange?: number;
  /** Maximum length of a `range` selection, in inclusive days. */
  maxRange?: number;
  /**
   * Weekdays rendered with `data-weekend` and treated as the weekend for
   * `businessDaysOnly` (0 = Sun … 6 = Sat). Defaults by locale — Persian
   * locales default to `[5]` (Friday); everything else to `[0, 6]`.
   */
  weekendDays?: Weekday[];
  /** Fired when the visible (leading) month changes. */
  onMonthChange?: (view: MonthView) => void;
  /** Fired when the focused (roving) date changes. */
  onFocusChange?: (date: CalendarDate) => void;
}

/** Props returned for a single day cell button. */
export type DayProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  "data-selected"?: "" | undefined;
  "data-today"?: "" | undefined;
  "data-disabled"?: "" | undefined;
  "data-outside-month"?: "" | undefined;
  "data-range-start"?: "" | undefined;
  "data-range-end"?: "" | undefined;
  "data-in-range"?: "" | undefined;
  "data-focused"?: "" | undefined;
  "data-weekend"?: "" | undefined;
  "data-holiday"?: "" | undefined;
  "data-holiday-name"?: string | undefined;
};

export type GridProps = HTMLAttributes<HTMLDivElement>;
export type NavButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** A one-click shortcut that applies a predefined value (e.g. "Last 7 days"). */
export interface CalendarPreset {
  /** Button text. */
  label: string;
  /** Value applied when chosen; its shape follows the picker `mode`. */
  value: CalixValue;
}

/** Per-slot class names accepted by the styled components. */
export interface CalendarClassNames {
  root?: string;
  header?: string;
  heading?: string;
  nav?: string;
  navButton?: string;
  grid?: string;
  weekdays?: string;
  weekday?: string;
  week?: string;
  day?: string;
}
