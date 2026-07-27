import type { NameWidth } from "./types.js";

/** Map our `NameWidth` to the corresponding `Intl` option value. */
function intlWidth(width: NameWidth): "narrow" | "short" | "long" {
  return width;
}

const REF_SUNDAY = new Date(2023, 0, 1); // 2023-01-01 was a Sunday (Gregorian).

/**
 * Localized weekday names, index 0 = Sunday … 6 = Saturday. Weekday names are
 * calendar-independent, so this is shared by every adapter.
 */
export function weekdayNames(
  locale: string,
  width: NameWidth = "long",
  calendar?: string,
): string[] {
  const fmt = new Intl.DateTimeFormat(locale, {
    weekday: intlWidth(width),
    ...(calendar ? { calendar } : {}),
  });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(REF_SUNDAY);
    d.setDate(REF_SUNDAY.getDate() + i);
    return fmt.format(d);
  });
}

/**
 * Localized month names for the given calendar. Callers pass one representative
 * JS `Date` per month (mid-month is safest), in month order, since the mapping
 * from month index to a `Date` is calendar-specific.
 */
export function monthNamesFromDates(
  representativeDates: readonly Date[],
  locale: string,
  width: NameWidth = "long",
  calendar?: string,
): string[] {
  const fmt = new Intl.DateTimeFormat(locale, {
    month: intlWidth(width),
    ...(calendar ? { calendar } : {}),
  });
  return representativeDates.map((d) => fmt.format(d));
}

/** Localized era names for a calendar (e.g. ["BC", "AD"] or ["ق.م", "ب.م"]). */
export function eraNames(locale: string, calendar?: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, {
    era: "short",
    year: "numeric",
    ...(calendar ? { calendar } : {}),
  });
  const bc = fmt.formatToParts(new Date(-1, 0, 1)).find((p) => p.type === "era")?.value ?? "";
  const ad = fmt.formatToParts(new Date(2020, 0, 1)).find((p) => p.type === "era")?.value ?? "";
  return [bc, ad];
}
