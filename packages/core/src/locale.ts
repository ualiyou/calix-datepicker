/** Digit-localization helpers shared by adapters and the React binding. */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const;
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

/** Locales whose default numbering system is Persian (Eastern Arabic) digits. */
const PERSIAN_DIGIT_LOCALES = /^fa\b/i;
const ARABIC_DIGIT_LOCALES = /^(ar|ps|ur)\b/i;

/** Replace Latin digits in `input` with the locale's native digits. */
export function toLocaleDigits(input: string, locale: string): string {
  const table = digitTableFor(locale);
  if (!table) return input;
  return input.replace(/[0-9]/g, (d) => table[Number(d)] ?? d);
}

/** Normalize any Persian/Arabic-Indic digits in `input` back to Latin `0-9`. */
export function toLatinDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (ch) => {
    const persian = PERSIAN_DIGITS.indexOf(ch as (typeof PERSIAN_DIGITS)[number]);
    if (persian !== -1) return String(persian);
    const arabic = ARABIC_DIGITS.indexOf(ch as (typeof ARABIC_DIGITS)[number]);
    return arabic !== -1 ? String(arabic) : ch;
  });
}

function digitTableFor(locale: string): readonly string[] | null {
  if (PERSIAN_DIGIT_LOCALES.test(locale)) return PERSIAN_DIGITS;
  if (ARABIC_DIGIT_LOCALES.test(locale)) return ARABIC_DIGITS;
  return null;
}

/** RTL base languages. */
const RTL_LANGUAGES = /^(fa|ar|he|ur|ps|dv|ug|yi)\b/i;

/** Best-effort text direction for a BCP-47 locale. */
export function directionForLocale(locale: string): "ltr" | "rtl" {
  return RTL_LANGUAGES.test(locale) ? "rtl" : "ltr";
}
