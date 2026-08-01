import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  type ReferenceType,
} from "@floating-ui/react-dom";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { UseCalendarOptions } from "../types.js";
import { useCalendar, type UseCalendarReturn } from "./useCalendar.js";

export type DatePickerPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface UseDatePickerOptions extends UseCalendarOptions {
  /** Controlled open state. */
  open?: boolean;
  /** Initial uncontrolled open state. Default: `false`. */
  defaultOpen?: boolean;
  /** Called after the popover requests an open-state change. */
  onOpenChange?: (open: boolean) => void;
  /** Close the popover after a (complete) selection. Default: true. */
  closeOnSelect?: boolean;
  /** Floating UI placement. Default: `"bottom-start"`. */
  placement?: DatePickerPlacement;
  /** Popover offset from the trigger, in px. Default: 8. */
  offset?: number;
}

export interface DatePickerRefs {
  reference: MutableRefObject<ReferenceType | null>;
  floating: MutableRefObject<HTMLElement | null>;
  setReference: (node: HTMLElement | null) => void;
  setFloating: (node: HTMLElement | null) => void;
}

export interface UseDatePickerReturn {
  calendar: UseCalendarReturn;
  open: boolean;
  setOpen: (open: boolean) => void;
  refs: DatePickerRefs;
  floatingStyles: CSSProperties;
  popoverId: string;
  getReferenceProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  getFloatingProps: (props?: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Composition root for a popover date picker. It keeps the public compound
 * component API lightweight while providing viewport-safe positioning, outside
 * dismissal, Escape handling, and focus restoration.
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
  const popoverId = useId();
  const returnFocus = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  const open = isControlled ? openProp : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const { refs: floatingRefs, floatingStyles } = useFloating({
    open,
    placement,
    strategy: "fixed",
    transform: false,
    middleware: [
      offset(offsetValue),
      flip({ padding: 8 }),
      shift({ padding: 8, mainAxis: false }),
      size({
        padding: 8,
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.max(0, availableHeight)}px`;
          elements.floating.style.overflow = "auto";
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const calendar = useCalendar({
    ...calendarOptions,
    onSelect: (value, complete) => {
      calendarOptions.onSelect?.(value, complete);
      if (closeOnSelect && complete) setOpen(false);
    },
  });

  const refs = useMemo<DatePickerRefs>(
    () => ({
      reference: floatingRefs.reference,
      floating: floatingRefs.floating,
      setReference: floatingRefs.setReference,
      setFloating: floatingRefs.setFloating,
    }),
    [floatingRefs],
  );

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) returnFocus.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    returnFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => {
      floatingRefs.floating.current
        ?.querySelector<HTMLElement>(
          '[role="gridcell"][tabindex="0"], button:not([disabled]), input:not([disabled])',
        )
        ?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [floatingRefs.floating, open]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const referenceTarget = target instanceof Element && target.closest("[data-calix-reference]");
      if (target && !referenceTarget && !floatingRefs.floating.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [floatingRefs.floating, open, setOpen]);

  const getReferenceProps = useCallback(
    (props: Record<string, unknown> = {}) => {
      const { onClick, ...rest } = props as {
        onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
      };
      return {
        ...rest,
        "data-calix-reference": "",
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) setOpen(!open);
        },
      };
    },
    [open, setOpen],
  );

  const getFloatingProps = useCallback(
    (props: Record<string, unknown> = {}) => ({ ...props, role: props.role ?? "dialog" }),
    [],
  );

  return useMemo(
    () => ({
      calendar,
      open,
      setOpen,
      refs,
      floatingStyles,
      popoverId,
      getReferenceProps,
      getFloatingProps,
    }),
    [calendar, floatingStyles, getFloatingProps, getReferenceProps, open, popoverId, refs, setOpen],
  );
}
