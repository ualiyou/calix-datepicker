import {
  buildDisabledPredicate,
  dateKey,
  generateMonthGrid,
  getSelectionStrategy,
  weekdayOrder,
  type CalendarDate,
  type CalendarGrid,
  type DateConstraints,
  type Direction,
  type MonthView,
  type SelectionContext,
  type Weekday,
} from "@alydev/core";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import type { DayProps, GridProps, NavButtonProps, UseCalendarOptions } from "../types.js";
import { useControllableState } from "../utils/useControllableState.js";
import {
  emptyPublicValue,
  toInternalValue,
  toPublicValue,
  type CalixValue,
} from "../value.js";

export interface UseCalendarReturn {
  adapter: UseCalendarOptions["adapter"];
  locale: string;
  dir: Direction;
  weekStartsOn: Weekday;
  /** Visible month grids (one per `numberOfMonths`). */
  grids: CalendarGrid[];
  /** Ordered, localized short weekday names for the header. */
  weekdays: string[];
  /** Localized heading for a given month view. */
  getMonthLabel: (view: MonthView) => string;
  focusedDate: CalendarDate;
  value: CalixValue;
  setValue: (value: CalixValue) => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToNextYear: () => void;
  goToPrevYear: () => void;
  goToMonth: (view: MonthView) => void;
  goToToday: () => void;
  select: (date: CalendarDate) => void;
  clear: () => void;
  isSelected: (date: CalendarDate) => boolean;
  isRangeStart: (date: CalendarDate) => boolean;
  isRangeEnd: (date: CalendarDate) => boolean;
  isInRange: (date: CalendarDate) => boolean;
  isDisabled: (date: CalendarDate) => boolean;
  setPreview: (date: CalendarDate | null) => void;
  getDayProps: (date: CalendarDate) => DayProps;
  getGridProps: () => GridProps;
  getPrevButtonProps: () => NavButtonProps;
  getNextButtonProps: () => NavButtonProps;
}

function defaultWeekStart(locale: string): Weekday {
  return /^fa\b/i.test(locale) ? 6 : 0;
}

/**
 * The headless calendar engine as a React hook. Owns the visible month, the
 * roving focus, selection (via the core strategy for `mode`), and produces
 * accessible prop-getters. Rendering is entirely the caller's concern.
 */
export function useCalendar(options: UseCalendarOptions): UseCalendarReturn {
  const {
    adapter,
    mode = "single",
    locale = adapter.defaultLocale,
    numberOfMonths = 1,
    fixedWeeks = true,
    max,
  } = options;

  const dir: Direction = options.dir ?? (adapter.isRTL(locale) ? "rtl" : "ltr");
  const weekStartsOn = options.weekStartsOn ?? defaultWeekStart(locale);

  const [value, setValue] = useControllableState<CalixValue>({
    value: options.value,
    defaultValue: options.defaultValue ?? emptyPublicValue(mode),
    onChange: options.onChange,
  });

  const strategy = useMemo(() => getSelectionStrategy(mode), [mode]);
  const internalValue = useMemo(
    () => toInternalValue(mode, value, adapter),
    [mode, value, adapter],
  );

  // Compile declarative constraints into a fast predicate.
  const isDisabled = useMemo(() => {
    const c: DateConstraints = {
      ...(options.minDate ? { min: adapter.fromDate(options.minDate) } : {}),
      ...(options.maxDate ? { max: adapter.fromDate(options.maxDate) } : {}),
      ...(options.disabledDates
        ? { disabledDates: options.disabledDates.map((d) => adapter.fromDate(d)) }
        : {}),
      ...(options.enabledDates
        ? { enabledDates: options.enabledDates.map((d) => adapter.fromDate(d)) }
        : {}),
      ...(options.disabledWeekdays ? { disabledWeekdays: options.disabledWeekdays } : {}),
      ...(options.disabledMonths ? { disabledMonths: options.disabledMonths } : {}),
      ...(options.disabledYears ? { disabledYears: options.disabledYears } : {}),
      ...(options.businessDaysOnly ? { businessDaysOnly: true } : {}),
      ...(options.holidays ? { holidays: options.holidays.map((d) => adapter.fromDate(d)) } : {}),
      ...(options.isDateDisabled ? { isDateDisabled: options.isDateDisabled } : {}),
    };
    return buildDisabledPredicate(c, adapter);
  }, [adapter, options]);

  const initialAnchor = useMemo<CalendarDate>(() => {
    if (options.defaultMonth) return adapter.startOfMonth(adapter.fromDate(options.defaultMonth));
    const firstSelected = firstSelectedDate(internalValue);
    return adapter.startOfMonth(firstSelected ?? adapter.today());
  }, []);

  const [viewDate, setViewDate] = useState<CalendarDate>(initialAnchor);
  const [focusedDate, setFocusedDate] = useState<CalendarDate>(
    () => firstSelectedDate(internalValue) ?? adapter.today(),
  );
  const [preview, setPreview] = useState<CalendarDate | null>(null);
  const previousAdapterId = useRef(adapter.id);

  useEffect(() => {
    if (previousAdapterId.current === adapter.id) return;
    previousAdapterId.current = adapter.id;

    const selected = firstSelectedDate(internalValue);
    const anchor = options.defaultMonth
      ? adapter.fromDate(options.defaultMonth)
      : (selected ?? adapter.today());
    setViewDate(adapter.startOfMonth(anchor));
    setFocusedDate(selected ?? adapter.today());
    setPreview(null);
  }, [adapter, internalValue, options.defaultMonth]);

  const selectionCtx: SelectionContext = useMemo(
    () => ({ adapter, weekStartsOn, preview, ...(max != null ? { max } : {}) }),
    [adapter, weekStartsOn, preview, max],
  );

  const grids = useMemo(
    () =>
      Array.from({ length: numberOfMonths }, (_, i) => {
        const anchor = adapter.addMonths(viewDate, i);
        const view: MonthView = { year: anchor.year, month: anchor.month };
        return generateMonthGrid(adapter, view, { weekStartsOn, fixedWeeks });
      }),
    [adapter, viewDate, numberOfMonths, weekStartsOn, fixedWeeks],
  );

  const weekdays = useMemo(() => {
    const names = adapter.getWeekdayNames(locale, "short");
    return weekdayOrder(weekStartsOn).map((wd) => names[wd] ?? "");
  }, [adapter, locale, weekStartsOn]);

  const getMonthLabel = useCallback(
    (view: MonthView) =>
      adapter.format({ year: view.year, month: view.month, day: 1 }, "MMMM yyyy", locale),
    [adapter, locale],
  );

  // Roving focus: move the DOM focus to the focused day after keyboard nav.
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const shouldFocusRef = useRef(false);
  useEffect(() => {
    if (!shouldFocusRef.current) return;
    shouldFocusRef.current = false;
    dayRefs.current.get(dateKey(focusedDate))?.focus();
  }, [focusedDate]);

  const moveFocus = useCallback(
    (next: CalendarDate) => {
      shouldFocusRef.current = true;
      setFocusedDate(next);
      // Bring the focused date into view if it left the visible span.
      setViewDate((current) => {
        const first = current;
        const lastMonth = adapter.addMonths(current, numberOfMonths - 1);
        const before = adapter.compare(next, first) < 0;
        const after =
          adapter.compare(next, { year: lastMonth.year, month: lastMonth.month, day: 1 }) >= 0 &&
          !adapter.isSameMonth(next, lastMonth);
        if (before) return adapter.startOfMonth(next);
        if (after) return adapter.startOfMonth(adapter.addMonths(next, -(numberOfMonths - 1)));
        return current;
      });
    },
    [adapter, numberOfMonths],
  );

  const select = useCallback(
    (date: CalendarDate) => {
      if (isDisabled(date)) return;
      const next = strategy.select(internalValue, date, selectionCtx);
      const publicNext = toPublicValue(mode, next, adapter);
      setValue(publicNext);
      setPreview(null);
      // A range/span selection is "complete" once it has an end.
      const complete =
        mode === "range"
          ? next != null && (next as { end: CalendarDate | null }).end != null
          : true;
      options.onSelect?.(publicNext, complete);
    },
    [isDisabled, strategy, internalValue, selectionCtx, mode, adapter, setValue, options],
  );

  const clear = useCallback(() => setValue(emptyPublicValue(mode)), [mode, setValue]);

  const goToMonth = useCallback(
    (view: MonthView) => setViewDate({ year: view.year, month: view.month, day: 1 }),
    [],
  );
  const goToNextMonth = useCallback(
    () => setViewDate((v) => adapter.addMonths(v, 1)),
    [adapter],
  );
  const goToPrevMonth = useCallback(
    () => setViewDate((v) => adapter.addMonths(v, -1)),
    [adapter],
  );
  const goToNextYear = useCallback(() => setViewDate((v) => adapter.addYears(v, 1)), [adapter]);
  const goToPrevYear = useCallback(() => setViewDate((v) => adapter.addYears(v, -1)), [adapter]);
  const goToToday = useCallback(() => {
    const today = adapter.today();
    setViewDate(adapter.startOfMonth(today));
    moveFocus(today);
  }, [adapter, moveFocus]);

  const handleDayKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, date: CalendarDate) => {
      // In RTL, horizontal arrows are mirrored so "next" is always later in time.
      const rtl = dir === "rtl";
      let handled = true;
      switch (event.key) {
        case "ArrowRight":
          moveFocus(adapter.addDays(date, rtl ? -1 : 1));
          break;
        case "ArrowLeft":
          moveFocus(adapter.addDays(date, rtl ? 1 : -1));
          break;
        case "ArrowDown":
          moveFocus(adapter.addDays(date, 7));
          break;
        case "ArrowUp":
          moveFocus(adapter.addDays(date, -7));
          break;
        case "Home":
          moveFocus(adapter.addDays(date, -((adapter.getWeekday(date) - weekStartsOn + 7) % 7)));
          break;
        case "End":
          moveFocus(adapter.addDays(date, 6 - ((adapter.getWeekday(date) - weekStartsOn + 7) % 7)));
          break;
        case "PageUp":
          moveFocus(adapter.addMonths(date, event.shiftKey ? -12 : -1));
          break;
        case "PageDown":
          moveFocus(adapter.addMonths(date, event.shiftKey ? 12 : 1));
          break;
        case "Enter":
        case " ":
          select(date);
          break;
        default:
          handled = false;
      }
      if (handled) event.preventDefault();
    },
    [adapter, dir, weekStartsOn, moveFocus, select],
  );

  const isSelected = useCallback(
    (d: CalendarDate) => strategy.isSelected(internalValue, d, selectionCtx),
    [strategy, internalValue, selectionCtx],
  );
  const isRangeStart = useCallback(
    (d: CalendarDate) => strategy.isRangeStart?.(internalValue, d, selectionCtx) ?? false,
    [strategy, internalValue, selectionCtx],
  );
  const isRangeEnd = useCallback(
    (d: CalendarDate) => strategy.isRangeEnd?.(internalValue, d, selectionCtx) ?? false,
    [strategy, internalValue, selectionCtx],
  );
  const isInRange = useCallback(
    (d: CalendarDate) => strategy.isInRange?.(internalValue, d, selectionCtx) ?? false,
    [strategy, internalValue, selectionCtx],
  );

  const getDayProps = useCallback(
    (date: CalendarDate): DayProps => {
      const disabled = isDisabled(date);
      const selected = isSelected(date);
      const focused = adapter.isSameDay(date, focusedDate);
      const today = adapter.isSameDay(date, adapter.today());
      const outside = !adapter.isSameMonth(date, viewDate) && numberOfMonths === 1;
      const weekday = adapter.getWeekday(date);
      const weekend = weekday === 0 || weekday === 6;
      const flag = (on: boolean) => (on ? ("" as const) : undefined);

      return {
        type: "button",
        role: "gridcell",
        tabIndex: focused ? 0 : -1,
        disabled,
        "aria-selected": selected,
        "aria-disabled": disabled || undefined,
        "aria-current": today ? "date" : undefined,
        "aria-label": adapter.format(date, "EEEE d MMMM yyyy", locale),
        "data-selected": flag(selected),
        "data-today": flag(today),
        "data-disabled": flag(disabled),
        "data-outside-month": flag(outside),
        "data-range-start": flag(isRangeStart(date)),
        "data-range-end": flag(isRangeEnd(date)),
        "data-in-range": flag(isInRange(date)),
        "data-focused": flag(focused),
        "data-weekend": flag(weekend),
        ref: (node: HTMLButtonElement | null) => {
          const key = dateKey(date);
          if (node) dayRefs.current.set(key, node);
          else dayRefs.current.delete(key);
        },
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          select(date);
        },
        onKeyDown: (event) => handleDayKeyDown(event, date),
        onPointerEnter: mode === "range" ? () => setPreview(date) : undefined,
        children: String(date.day),
      };
    },
    [
      adapter,
      locale,
      focusedDate,
      viewDate,
      numberOfMonths,
      mode,
      isDisabled,
      isSelected,
      isRangeStart,
      isRangeEnd,
      isInRange,
      select,
      handleDayKeyDown,
    ],
  );

  const getGridProps = useCallback(
    (): GridProps => ({ role: "grid", dir }),
    [dir],
  );
  const getPrevButtonProps = useCallback(
    (): NavButtonProps => ({
      type: "button",
      "aria-label": "Previous month",
      onClick: goToPrevMonth,
    }),
    [goToPrevMonth],
  );
  const getNextButtonProps = useCallback(
    (): NavButtonProps => ({
      type: "button",
      "aria-label": "Next month",
      onClick: goToNextMonth,
    }),
    [goToNextMonth],
  );

  return {
    adapter,
    locale,
    dir,
    weekStartsOn,
    grids,
    weekdays,
    getMonthLabel,
    focusedDate,
    value,
    setValue,
    goToNextMonth,
    goToPrevMonth,
    goToNextYear,
    goToPrevYear,
    goToMonth,
    goToToday,
    select,
    clear,
    isSelected,
    isRangeStart,
    isRangeEnd,
    isInRange,
    isDisabled,
    setPreview,
    getDayProps,
    getGridProps,
    getPrevButtonProps,
    getNextButtonProps,
  };
}

function firstSelectedDate(value: unknown): CalendarDate | null {
  if (value == null) return null;
  if (Array.isArray(value)) return (value[0] as CalendarDate) ?? null;
  if (typeof value === "object" && "start" in value) {
    return (value as { start: CalendarDate }).start;
  }
  return value as CalendarDate;
}
