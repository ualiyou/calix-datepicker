import type { CalendarDate } from "@alydev/core";
import type { ReactNode } from "react";
import { useCalendar } from "../hooks/useCalendar.js";
import type { CalendarClassNames, UseCalendarOptions } from "../types.js";
import { CalendarView, type CalendarViewProps } from "./CalendarView.js";

export interface CalendarProps extends UseCalendarOptions {
  /** CSS classes for semantic calendar slots. */
  classNames?: CalendarClassNames;
  /** Replaces each day's visible label while retaining its behavior. */
  renderDay?: (date: CalendarDate, defaultLabel: string) => ReactNode;
  /** Content below the grid, or a callback with the calendar API. */
  footer?: CalendarViewProps["footer"];
  /** Content above the grid, or a callback with the calendar API. */
  header?: CalendarViewProps["header"];
  /** Show the built-in Today button. Default: `false`. */
  showToday?: boolean;
  /** Show the built-in Clear button. Default: `false`. */
  showClear?: boolean;
  /** Enable swipe and wheel month navigation. Default: `false`. */
  infiniteScroll?: boolean;
}

/**
 * An always-visible (inline) calendar. This is the simplest entry point and the
 * building block for the popover picker.
 */
export function Calendar({
  classNames,
  renderDay,
  footer,
  header,
  showToday,
  showClear,
  infiniteScroll,
  ...options
}: CalendarProps) {
  const calendar = useCalendar(options);
  return (
    <CalendarView
      calendar={calendar}
      {...(classNames ? { classNames } : {})}
      {...(renderDay ? { renderDay } : {})}
      {...(footer ? { footer } : {})}
      {...(header ? { header } : {})}
      {...(showToday ? { showToday } : {})}
      {...(showClear ? { showClear } : {})}
      {...(infiniteScroll ? { infiniteScroll } : {})}
    />
  );
}
