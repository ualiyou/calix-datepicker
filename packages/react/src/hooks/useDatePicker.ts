import {
  autoUpdate,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  type Placement,
} from "@floating-ui/react";
import { useCallback, useMemo, useState } from "react";
import type { UseCalendarOptions } from "../types.js";
import { useCalendar, type UseCalendarReturn } from "./useCalendar.js";

export interface UseDatePickerOptions extends UseCalendarOptions {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Close the popover after a (complete) selection. Default: true. */
  closeOnSelect?: boolean;
  placement?: Placement;
  /** Popover offset from the trigger, in px. Default: 8. */
  offset?: number;
}

export interface UseDatePickerReturn {
  calendar: UseCalendarReturn;
  open: boolean;
  setOpen: (open: boolean) => void;
  refs: ReturnType<typeof useFloating>["refs"];
  floatingStyles: ReturnType<typeof useFloating>["floatingStyles"];
  context: ReturnType<typeof useFloating>["context"];
  getReferenceProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  getFloatingProps: (props?: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Composition root for a popover date picker: wires {@link useCalendar} to a
 * Floating UI popover with click/dismiss/role interactions and open-state
 * management (controlled or uncontrolled).
 */
export function useDatePicker(options: UseDatePickerOptions): UseDatePickerReturn {
  const {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    closeOnSelect = true,
    placement = "bottom-start",
    offset: offsetValue = 8,
    ...calendarOptions
  } = options;

  const isControlled = openProp !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? openProp : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const calendar = useCalendar({
    ...calendarOptions,
    onSelect: (value, complete) => {
      calendarOptions.onSelect?.(value, complete);
      if (closeOnSelect && complete) setOpen(false);
    },
  });

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(offsetValue), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return useMemo(
    () => ({
      calendar,
      open,
      setOpen,
      refs,
      floatingStyles,
      context,
      getReferenceProps,
      getFloatingProps,
    }),
    [calendar, open, setOpen, refs, floatingStyles, context, getReferenceProps, getFloatingProps],
  );
}
