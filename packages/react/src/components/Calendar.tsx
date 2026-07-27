"use client";
import type { CalendarDate } from "@alydev/core";
import type { ReactNode } from "react";
import { useCalendar } from "../hooks/useCalendar.js";
import type { CalendarClassNames, UseCalendarOptions } from "../types.js";
import { CalendarView } from "./CalendarView.js";

export interface CalendarProps extends UseCalendarOptions {
  classNames?: CalendarClassNames;
  renderDay?: (date: CalendarDate, defaultLabel: string) => ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}

/**
 * An always-visible (inline) calendar. This is the simplest entry point and the
 * building block for the popover picker.
 */
export function Calendar({ classNames, renderDay, footer, header, ...options }: CalendarProps) {
  const calendar = useCalendar(options);
  return (
    <CalendarView
      calendar={calendar}
      {...(classNames ? { classNames } : {})}
      {...(renderDay ? { renderDay } : {})}
      {...(footer ? { footer } : {})}
      {...(header ? { header } : {})}
    />
  );
}
