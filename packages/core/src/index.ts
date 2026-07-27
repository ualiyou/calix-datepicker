/**
 * @calix/core — framework-agnostic calendar engine.
 *
 * This package has zero runtime dependencies and knows nothing about any
 * concrete calendar system or UI framework.
 */

export * from "./types.js";
export {
  calendarDate,
  time,
  isCalendarDate,
  compareCalendarDate,
  isSameCalendarDay,
  isSameCalendarMonth,
  clampCalendarDate,
  minCalendarDate,
  maxCalendarDate,
  isWithinRange,
  dateKey,
} from "./date.js";
export { generateMonthGrid, weekdayOrder } from "./grid.js";
export {
  buildDisabledPredicate,
  monthHasEnabledDay,
  nearestEnabledDate,
} from "./validation.js";
export {
  getSelectionStrategy,
  registerSelectionStrategy,
  selectionStrategies,
} from "./selection.js";
export { toLocaleDigits, toLatinDigits, directionForLocale } from "./locale.js";
export { formatTokens, parseTokens } from "./format.js";
export type { FormatContext } from "./format.js";
export { weekdayNames, monthNamesFromDates, eraNames } from "./intl.js";

/** Library version, replaced at publish time by tooling. */
export const version = "0.0.0";
