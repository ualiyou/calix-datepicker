import { toLatinDigits, type CalendarAdapter, type CalendarDate } from "@alydev/core";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";

export interface UseDateInputOptions {
  adapter: CalendarAdapter;
  locale?: string;
  /** Format/parse pattern, e.g. `"yyyy/MM/dd"`. */
  pattern?: string;
  /** Current value as calendar parts (or null). */
  value: CalendarDate | null;
  /** Called with a parsed date, or null when the field is cleared. */
  onCommit: (date: CalendarDate | null) => void;
  /** Called when the text cannot be parsed. */
  onInvalid?: (raw: string) => void;
  disabled?: boolean;
  /** Insert pattern separators while typing. */
  mask?: boolean;
}

export interface UseDateInputReturn {
  inputValue: string;
  setInputValue: (value: string) => void;
  getInputProps: () => InputHTMLAttributes<HTMLInputElement>;
}

/**
 * Controlled text input for a date: formats the value for display, parses user
 * input on blur/Enter (normalizing localized digits), and guards IME
 * composition so parsing doesn't fire mid-composition.
 */
export function useDateInput(options: UseDateInputOptions): UseDateInputReturn {
  const { adapter, locale = adapter.defaultLocale, pattern = "yyyy/MM/dd", value } = options;

  const format = useCallback(
    (date: CalendarDate | null) => (date ? adapter.format(date, pattern, locale) : ""),
    [adapter, pattern, locale],
  );

  const [inputValue, setInputValue] = useState<string>(() => format(value));
  const composingRef = useRef(false);

  // Reflect external value changes into the field (unless the user is typing).
  const focusedRef = useRef(false);
  useEffect(() => {
    if (!focusedRef.current) setInputValue(format(value));
  }, [value, format]);

  const commit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === "") {
        options.onCommit(null);
        return;
      }
      const parsed = adapter.parse(toLatinDigits(trimmed), pattern, locale);
      if (parsed) {
        options.onCommit(parsed);
        setInputValue(format(parsed));
      } else {
        options.onInvalid?.(raw);
        setInputValue(format(value)); // revert to last valid
      }
    },
    [adapter, pattern, locale, format, value, options],
  );

  const getInputProps = useCallback(
    (): InputHTMLAttributes<HTMLInputElement> => ({
      value: inputValue,
      disabled: options.disabled,
      inputMode: "numeric",
      autoComplete: "off",
      spellCheck: false,
      role: "combobox",
      "aria-label": "Date",
      onChange: (event: ChangeEvent<HTMLInputElement>) => setInputValue(options.mask ? maskDateInput(event.target.value, pattern) : event.target.value),
      onFocus: () => {
        focusedRef.current = true;
      },
      onBlur: (event: FocusEvent<HTMLInputElement>) => {
        focusedRef.current = false;
        commit(event.target.value);
      },
      onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !composingRef.current) {
          event.preventDefault();
          commit(event.currentTarget.value);
        }
      },
      onCompositionStart: () => {
        composingRef.current = true;
      },
      onCompositionEnd: () => {
        composingRef.current = false;
      },
    }),
    [inputValue, commit, options.disabled, options.mask, pattern],
  );

  return { inputValue, setInputValue, getInputProps };
}

function maskDateInput(raw: string, pattern: string): string {
  const digits = toLatinDigits(raw).replace(/\D/g, "");
  const parts = pattern.match(/[yMd]+|[^yMd]+/g) ?? [];
  let cursor = 0;
  let output = "";
  for (const part of parts) {
    if (/^[yMd]+$/.test(part)) {
      const value = digits.slice(cursor, cursor + part.length);
      output += value;
      cursor += value.length;
      if (value.length < part.length) break;
    } else if (cursor < digits.length) output += part;
  }
  return output;
}
