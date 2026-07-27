import type {
  CalendarAdapter,
  CalendarDate,
  Direction,
  SelectionMode,
  Weekday,
} from "@alydev/core";
import type { ButtonHTMLAttributes, HTMLAttributes, Ref } from "react";
import type { CalixValue } from "./value.js";

export type { CalixValue, RangeValue } from "./value.js";

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
  /** Fired after each selection with the next value and whether it is complete. */
  onSelect?: (value: CalixValue, complete: boolean) => void;
  locale?: string;
  dir?: Direction;
  /** 0 = Sunday … 6 = Saturday. Defaults to a locale-appropriate value. */
  weekStartsOn?: Weekday;
  /** The month shown first (uncontrolled default). */
  defaultMonth?: Date;
  /** Number of months rendered side by side. */
  numberOfMonths?: number;
  fixedWeeks?: boolean;
  /** Max selectable dates in `multiple` mode. */
  max?: number;
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
};

export type GridProps = HTMLAttributes<HTMLDivElement>;
export type NavButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

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
