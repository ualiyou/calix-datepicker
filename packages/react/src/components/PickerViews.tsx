"use client";
import type { CalendarDate } from "@alydev/core";
import { useMemo, useState } from "react";
import { useCalendar } from "../hooks/useCalendar.js";
import type { UseCalendarOptions } from "../types.js";

export interface MonthPickerProps extends UseCalendarOptions {
  className?: string;
}

const cx = (...p: (string | undefined)[]) => p.filter(Boolean).join(" ") || undefined;

/** A 12-cell month picker (mode is forced to `month`). */
export function MonthPicker({ className, ...options }: MonthPickerProps) {
  const calendar = useCalendar({ ...options, mode: "month" });
  const year = calendar.grids[0]?.view.year ?? calendar.adapter.today().year;
  const monthNames = useMemo(
    () => calendar.adapter.getMonthNames(calendar.locale, "short"),
    [calendar.adapter, calendar.locale],
  );

  return (
    <div className={cx("calix-monthgrid", className)} dir={calendar.dir} role="grid" data-calix-monthgrid="">
      <div className="calix-header">
        <button {...calendar.getPrevButtonProps()} aria-label="Previous year" onClick={calendar.goToPrevYear} className="calix-nav-button">
          ‹
        </button>
        <span className="calix-heading">{calendar.adapter.format({ year, month: 1, day: 1 }, "yyyy", calendar.locale)}</span>
        <button {...calendar.getNextButtonProps()} aria-label="Next year" onClick={calendar.goToNextYear} className="calix-nav-button">
          ›
        </button>
      </div>
      <div className="calix-monthgrid-body">
        {monthNames.map((name, i) => {
          const date: CalendarDate = { year, month: i + 1, day: 1 };
          const selected = calendar.isSelected(date);
          return (
            <button
              key={i}
              type="button"
              className="calix-month"
              data-selected={selected ? "" : undefined}
              disabled={calendar.isDisabled(date)}
              aria-selected={selected}
              onClick={() => calendar.select(date)}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface YearPickerProps extends UseCalendarOptions {
  className?: string;
  /** How many years to show per page. Default: 12. */
  pageSize?: number;
}

/** A paged year picker (mode is forced to `year`). */
export function YearPicker({ className, pageSize = 12, ...options }: YearPickerProps) {
  const calendar = useCalendar({ ...options, mode: "year" });
  const currentYear = calendar.grids[0]?.view.year ?? calendar.adapter.today().year;
  const [pageStart, setPageStart] = useState(() => currentYear - (currentYear % pageSize));
  const years = calendar.adapter.getYearRange(pageStart + Math.floor(pageSize / 2), pageSize);

  return (
    <div className={cx("calix-yeargrid", className)} dir={calendar.dir} role="grid" data-calix-yeargrid="">
      <div className="calix-header">
        <button type="button" aria-label="Previous years" className="calix-nav-button" onClick={() => setPageStart((s) => s - pageSize)}>
          ‹
        </button>
        <span className="calix-heading">
          {years[0]} – {years[years.length - 1]}
        </span>
        <button type="button" aria-label="Next years" className="calix-nav-button" onClick={() => setPageStart((s) => s + pageSize)}>
          ›
        </button>
      </div>
      <div className="calix-yeargrid-body">
        {years.map((year) => {
          const date: CalendarDate = { year, month: 1, day: 1 };
          const selected = calendar.isSelected(date);
          return (
            <button
              key={year}
              type="button"
              className="calix-year"
              data-selected={selected ? "" : undefined}
              aria-selected={selected}
              disabled={calendar.isDisabled(date)}
              onClick={() => calendar.select(date)}
            >
              {calendar.adapter.format(date, "yyyy", calendar.locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
