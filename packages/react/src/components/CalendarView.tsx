import type { CalendarDate, CalendarGrid } from "@alydev/core";
import { useState, type ReactNode } from "react";
import type { CalendarClassNames, CalendarPreset } from "../types.js";
import type { CalixValue } from "../value.js";
import type { UseCalendarReturn } from "../hooks/useCalendar.js";

export interface CalendarViewProps {
  calendar: UseCalendarReturn;
  classNames?: CalendarClassNames | undefined;
  /** Custom day content renderer. Receives the calendar date and default label. */
  renderDay?: ((date: CalendarDate, defaultLabel: string) => ReactNode) | undefined;
  /** Optional footer (e.g. Today/Clear buttons). */
  footer?: ReactNode | ((calendar: UseCalendarReturn) => ReactNode);
  /** Optional header override. */
  header?: ReactNode | ((calendar: UseCalendarReturn) => ReactNode);
  /** Show built-in Today and Clear controls. */
  showToday?: boolean;
  showClear?: boolean;
  /** Optional cancel action, used by popover pickers to close without changing the value. */
  onCancel?: (() => void) | undefined;
  /** Navigate months with a swipe or mouse wheel. */
  infiniteScroll?: boolean;
  /** One-click shortcuts (e.g. Today, Last 7 days) rendered beside the footer. */
  presets?: CalendarPreset[] | undefined;
}

function firstDateOf(value: CalixValue): Date | null {
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value[0] ?? null;
  if (value && typeof value === "object" && "start" in value) return value.start ?? null;
  return null;
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
  showToday = false,
  showClear = false,
  onCancel,
  infiniteScroll = false,
  presets,
}: CalendarViewProps) {
  const { grids, weekdays, getMonthLabel, dir } = calendar;
  const labels = calendar.labels;
  const weekdayLabels = labels?.weekdays?.length === 7 ? labels.weekdays : weekdays;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const customHeader = typeof header === "function" ? header(calendar) : header;
  const customFooter = typeof footer === "function" ? footer(calendar) : footer;
  const navigateByGesture = (delta: number) => {
    if (!infiniteScroll || Math.abs(delta) < 24) return;
    if (delta > 0) calendar.goToNextMonth();
    else calendar.goToPrevMonth();
  };

  return (
    <div
      className={cx("calix-calendar", classNames?.root)}
      dir={dir}
      data-theme={calendar.theme}
      data-calix-calendar=""
    >
      {pickerOpen ? (
        <MonthYearPicker
          calendar={calendar}
          classNames={classNames}
          labels={labels}
          onDone={() => setPickerOpen(false)}
        />
      ) : (
        (customHeader ?? (
          <div className={cx("calix-header", classNames?.header)}>
            <button
              {...calendar.getPrevButtonProps()}
              aria-label={labels?.previousMonth ?? "Previous month"}
              className={cx("calix-nav-button", classNames?.navButton)}
            >
              <span aria-hidden>‹</span>
            </button>
            <button
              type="button"
              className={cx("calix-heading", "calix-heading-button", classNames?.heading)}
              aria-label={labels?.chooseMonthAndYear ?? "Choose month and year"}
              onClick={() => setPickerOpen(true)}
            >
              <span aria-live="polite">
                {grids.map((g) => (
                  <span key={`${g.view.year}-${g.view.month}`}>{getMonthLabel(g.view)}</span>
                ))}
              </span>
            </button>
            <button
              {...calendar.getNextButtonProps()}
              aria-label={labels?.nextMonth ?? "Next month"}
              className={cx("calix-nav-button", classNames?.navButton)}
            >
              <span aria-hidden>›</span>
            </button>
          </div>
        ))
      )}

      {!pickerOpen && (
        <div
          className={cx(
            infiniteScroll ? "calix-months calix-months-scroll" : "calix-months",
            classNames?.months,
          )}
          onWheel={
            infiniteScroll
              ? (event) => {
                  event.preventDefault();
                  navigateByGesture(event.deltaY);
                }
              : undefined
          }
          onTouchStart={
            infiniteScroll ? (event) => setTouchStart(event.touches[0]?.clientX ?? null) : undefined
          }
          onTouchEnd={
            infiniteScroll
              ? (event) => {
                  const end = event.changedTouches[0]?.clientX;
                  if (touchStart != null && end != null) navigateByGesture(touchStart - end);
                  setTouchStart(null);
                }
              : undefined
          }
        >
          {grids.map((grid) => (
            <MonthGrid
              key={`${grid.view.year}-${grid.view.month}`}
              grid={grid}
              weekdays={weekdayLabels}
              calendar={calendar}
              classNames={classNames}
              renderDay={renderDay}
            />
          ))}
        </div>
      )}

      {presets && presets.length > 0 ? (
        <div className={cx("calix-presets", classNames?.presets)} role="group" aria-label="Presets">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={cx("calix-preset", classNames?.preset)}
              onClick={() => {
                calendar.setValue(preset.value);
                const first = firstDateOf(preset.value);
                if (first) {
                  const cd = calendar.adapter.fromDate(first);
                  calendar.goToMonth({ year: cd.year, month: cd.month });
                }
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : null}

      {customFooter ??
        (showToday || showClear || onCancel ? (
          <div className={cx("calix-footer", classNames?.footer)}>
            {showToday && (
              <button
                type="button"
                className={cx("calix-footer-button", classNames?.footerButton)}
                onClick={calendar.goToToday}
              >
                {labels.today}
              </button>
            )}
            {showClear && (
              <button
                type="button"
                className={cx("calix-footer-button", classNames?.footerButton)}
                onClick={calendar.clear}
              >
                {labels.clear}
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                className={cx("calix-footer-button", classNames?.footerButton)}
                onClick={onCancel}
              >
                {labels.cancel}
              </button>
            )}
          </div>
        ) : null)}
    </div>
  );
}

function MonthYearPicker({
  calendar,
  classNames,
  labels,
  onDone,
}: {
  calendar: UseCalendarReturn;
  classNames?: CalendarClassNames | undefined;
  labels: CalendarViewProps["calendar"]["labels"];
  onDone: () => void;
}) {
  const [selectingYears, setSelectingYears] = useState(false);
  const current = calendar.grids[0]?.view ?? { year: calendar.adapter.today().year, month: 1 };
  const [yearStart, setYearStart] = useState(() => current.year - (current.year % 12));

  if (selectingYears) {
    const years = calendar.adapter.getYearRange(yearStart + 6, 12);
    return (
      <div className={cx("calix-yeargrid", classNames?.picker)} dir={calendar.dir}>
        <div className={cx("calix-header", classNames?.header)}>
          <button
            type="button"
            className={cx("calix-nav-button", classNames?.navButton)}
            aria-label={labels?.previousYears ?? "Previous years"}
            onClick={() => setYearStart((year) => year - 12)}
          >
            ‹
          </button>
          <button
            type="button"
            className={cx("calix-heading", "calix-heading-button", classNames?.heading)}
            onClick={() => setSelectingYears(false)}
          >
            {years[0]} – {years[years.length - 1]}
          </button>
          <button
            type="button"
            className={cx("calix-nav-button", classNames?.navButton)}
            aria-label={labels?.nextYears ?? "Next years"}
            onClick={() => setYearStart((year) => year + 12)}
          >
            ›
          </button>
        </div>
        <div className={cx("calix-yeargrid-body", classNames?.pickerBody)}>
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={cx("calix-year", classNames?.year)}
              onClick={() => {
                calendar.goToMonth({ year, month: current.month });
                setSelectingYears(false);
              }}
            >
              {calendar.adapter.format({ year, month: 1, day: 1 }, "yyyy", calendar.locale)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const months = calendar.adapter.getMonthNames(calendar.locale, "short");
  return (
    <div className={cx("calix-monthgrid", classNames?.picker)} dir={calendar.dir}>
      <div className={cx("calix-header", classNames?.header)}>
        <button
          type="button"
          className={cx("calix-nav-button", classNames?.navButton)}
          aria-label={labels?.previousYear ?? "Previous year"}
          onClick={() => calendar.goToMonth({ year: current.year - 1, month: current.month })}
        >
          ‹
        </button>
        <button
          type="button"
          className={cx("calix-heading", "calix-heading-button", classNames?.heading)}
          aria-label={labels?.chooseYear ?? "Choose year"}
          onClick={() => setSelectingYears(true)}
        >
          {calendar.adapter.format(
            { year: current.year, month: 1, day: 1 },
            "yyyy",
            calendar.locale,
          )}
        </button>
        <button
          type="button"
          className={cx("calix-nav-button", classNames?.navButton)}
          aria-label={labels?.nextYear ?? "Next year"}
          onClick={() => calendar.goToMonth({ year: current.year + 1, month: current.month })}
        >
          ›
        </button>
      </div>
      <div className={cx("calix-monthgrid-body", classNames?.pickerBody)}>
        {months.map((month, index) => (
          <button
            key={month}
            type="button"
            className={cx("calix-month", classNames?.month)}
            onClick={() => {
              calendar.goToMonth({ year: current.year, month: index + 1 });
              onDone();
            }}
          >
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
  weekdays: readonly string[];
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
            const { children, ...dayProps } = calendar.getDayProps(cell.date, grid.view);
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
