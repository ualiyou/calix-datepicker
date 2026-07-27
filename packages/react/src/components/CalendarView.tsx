import type { CalendarDate, CalendarGrid } from "@alydev/core";
import { useState, type ReactNode } from "react";
import type { CalendarClassNames } from "../types.js";
import type { UseCalendarReturn } from "../hooks/useCalendar.js";

export interface CalendarViewProps {
  calendar: UseCalendarReturn;
  classNames?: CalendarClassNames | undefined;
  /** Custom day content renderer. Receives the calendar date and default label. */
  renderDay?: ((date: CalendarDate, defaultLabel: string) => ReactNode) | undefined;
  /** Optional footer (e.g. Today/Clear buttons). */
  footer?: ReactNode;
  /** Optional header override. */
  header?: ReactNode;
}

const cx = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ") || undefined;

/**
 * Presentational, theme-agnostic renderer for one or more month grids driven by
 * a {@link useCalendar} result. Emits stable class names + `data-*` state so any
 * styling technology can target it.
 */
export function CalendarView({
  calendar,
  classNames,
  renderDay,
  footer,
  header,
}: CalendarViewProps) {
  const { grids, weekdays, getMonthLabel, dir } = calendar;
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className={cx("calix-calendar", classNames?.root)} dir={dir} data-calix-calendar="">
      {pickerOpen ? (
        <MonthYearPicker calendar={calendar} onDone={() => setPickerOpen(false)} />
      ) : header ?? (
        <div className={cx("calix-header", classNames?.header)}>
          <button
            {...calendar.getPrevButtonProps()}
            className={cx("calix-nav-button", classNames?.navButton)}
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            className={cx("calix-heading", "calix-heading-button", classNames?.heading)}
            aria-label="Choose month and year"
            onClick={() => setPickerOpen(true)}
          >
            {grids.map((g) => (
              <span key={`${g.view.year}-${g.view.month}`}>{getMonthLabel(g.view)}</span>
            ))}
          </button>
          <button
            {...calendar.getNextButtonProps()}
            className={cx("calix-nav-button", classNames?.navButton)}
          >
            <span aria-hidden>›</span>
          </button>
        </div>
      )}

      {!pickerOpen && (
        <div className="calix-months">
          {grids.map((grid) => (
            <MonthGrid
              key={`${grid.view.year}-${grid.view.month}`}
              grid={grid}
              weekdays={weekdays}
              calendar={calendar}
              classNames={classNames}
              renderDay={renderDay}
            />
          ))}
        </div>
      )}

      {footer}
    </div>
  );
}

function MonthYearPicker({ calendar, onDone }: { calendar: UseCalendarReturn; onDone: () => void }) {
  const [selectingYears, setSelectingYears] = useState(false);
  const current = calendar.grids[0]?.view ?? { year: calendar.adapter.today().year, month: 1 };
  const [yearStart, setYearStart] = useState(() => current.year - (current.year % 12));

  if (selectingYears) {
    const years = calendar.adapter.getYearRange(yearStart + 6, 12);
    return (
      <div className="calix-yeargrid" dir={calendar.dir}>
        <div className="calix-header">
          <button type="button" className="calix-nav-button" aria-label="Previous years" onClick={() => setYearStart((year) => year - 12)}>‹</button>
          <button type="button" className="calix-heading calix-heading-button" onClick={() => setSelectingYears(false)}>{years[0]} – {years[years.length - 1]}</button>
          <button type="button" className="calix-nav-button" aria-label="Next years" onClick={() => setYearStart((year) => year + 12)}>›</button>
        </div>
        <div className="calix-yeargrid-body">
          {years.map((year) => (
            <button key={year} type="button" className="calix-year" onClick={() => { calendar.goToMonth({ year, month: current.month }); setSelectingYears(false); }}>
              {calendar.adapter.format({ year, month: 1, day: 1 }, "yyyy", calendar.locale)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const months = calendar.adapter.getMonthNames(calendar.locale, "short");
  return (
    <div className="calix-monthgrid" dir={calendar.dir}>
      <div className="calix-header">
        <button type="button" className="calix-nav-button" aria-label="Previous year" onClick={() => calendar.goToMonth({ year: current.year - 1, month: current.month })}>‹</button>
        <button type="button" className="calix-heading calix-heading-button" aria-label="Choose year" onClick={() => setSelectingYears(true)}>
          {calendar.adapter.format({ year: current.year, month: 1, day: 1 }, "yyyy", calendar.locale)}
        </button>
        <button type="button" className="calix-nav-button" aria-label="Next year" onClick={() => calendar.goToMonth({ year: current.year + 1, month: current.month })}>›</button>
      </div>
      <div className="calix-monthgrid-body">
        {months.map((month, index) => (
          <button key={month} type="button" className="calix-month" onClick={() => { calendar.goToMonth({ year: current.year, month: index + 1 }); onDone(); }}>
            {month}
          </button>
        ))}
      </div>
    </div>
  );
}

function MonthGrid({
  grid,
  weekdays,
  calendar,
  classNames,
  renderDay,
}: {
  grid: CalendarGrid;
  weekdays: string[];
  calendar: UseCalendarReturn;
  classNames?: CalendarClassNames | undefined;
  renderDay?: ((date: CalendarDate, defaultLabel: string) => ReactNode) | undefined;
}) {
  return (
    <div {...calendar.getGridProps()} className={cx("calix-grid", classNames?.grid)}>
      <div className={cx("calix-weekdays", classNames?.weekdays)} role="row">
        {weekdays.map((name, i) => (
          <span
            key={i}
            role="columnheader"
            aria-label={name}
            className={cx("calix-weekday", classNames?.weekday)}
          >
            {name}
          </span>
        ))}
      </div>
      {grid.weeks.map((week, wi) => (
        <div key={wi} role="row" className={cx("calix-week", classNames?.week)}>
          {week.days.map((cell) => {
            const { children, ...dayProps } = calendar.getDayProps(cell.date);
            const label = String(cell.date.day);
            return (
              <button
                key={`${cell.date.year}-${cell.date.month}-${cell.date.day}`}
                {...dayProps}
                className={cx("calix-day", classNames?.day)}
              >
                {renderDay ? renderDay(cell.date, label) : (children ?? label)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
