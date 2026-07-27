"use client";
/**
 * @calix/react — headless hooks and compound components for building date
 * pickers on top of `@calix/core`.
 */

// Hooks
export { useCalendar, type UseCalendarReturn } from "./hooks/useCalendar.js";
export {
  useDatePicker,
  type UseDatePickerOptions,
  type UseDatePickerReturn,
} from "./hooks/useDatePicker.js";
export {
  useDateInput,
  type UseDateInputOptions,
  type UseDateInputReturn,
} from "./hooks/useDateInput.js";
export { useTime, type UseTimeOptions, type UseTimeReturn } from "./hooks/useTime.js";

// Components
export { Calendar, type CalendarProps } from "./components/Calendar.js";
export { CalendarView, type CalendarViewProps } from "./components/CalendarView.js";
export {
  DatePicker,
  type DatePickerProps,
  type DatePickerRootProps,
  type DatePickerTriggerProps,
  type DatePickerInputProps,
  type DatePickerContentProps,
} from "./components/DatePicker.js";
export { DatePickerContext, useDatePickerContext } from "./components/context.js";
export { TimeField, type TimeFieldProps } from "./components/TimeField.js";
export {
  MonthPicker,
  YearPicker,
  type MonthPickerProps,
  type YearPickerProps,
} from "./components/PickerViews.js";

// Types & value helpers
export type {
  UseCalendarOptions,
  CalixConstraints,
  CalendarClassNames,
  DayProps,
  GridProps,
  NavButtonProps,
  CalixValue,
  RangeValue,
} from "./types.js";
export { emptyPublicValue, toInternalValue, toPublicValue } from "./value.js";
export { useControllableState } from "./utils/useControllableState.js";

// Re-export common core types for convenience.
export type {
  CalendarAdapter,
  CalendarDate,
  DateRange,
  SelectionMode,
  Weekday,
  Direction,
} from "@calix/core";
