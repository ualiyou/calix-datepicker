import { useCallback, useRef, useState } from "react";

export interface UseControllableStateOptions<T> {
  /** Controlled value. When defined, the hook is in controlled mode. */
  value?: T | undefined;
  /** Initial value for uncontrolled mode. */
  defaultValue: T;
  /** Change callback fired in both modes. */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * A controlled/uncontrolled state primitive. When `value` is provided the hook
 * mirrors it (controlled); otherwise it manages its own state (uncontrolled).
 * `onChange` fires in both cases. The setter is referentially stable.
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>,
): [T, (next: T | ((prev: T) => T)) => void] {
  const { value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue);

  // Keep the latest onChange/value in refs so the setter identity is stable.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef<T>(value ?? uncontrolled);
  valueRef.current = value ?? uncontrolled;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(valueRef.current)
          : next;
      if (!isControlled) setUncontrolled(resolved);
      onChangeRef.current?.(resolved);
    },
    [isControlled],
  );

  return [value ?? uncontrolled, setValue];
}
