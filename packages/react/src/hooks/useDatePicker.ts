import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Close the popover after a (complete) selection. Default: true. */
  closeOnSelect?: boolean;
  placement?: DatePickerPlacement;
  /** Popover offset from the trigger, in px. Default: 8. */
  offset?: number;
}

export interface DatePickerRefs {
  reference: MutableRefObject<HTMLElement | null>;
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
  getReferenceProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  getFloatingProps: (props?: Record<string, unknown>) => Record<string, unknown>;
}

const VIEWPORT_PADDING = 8;
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function positionFor(
  reference: DOMRect,
  floating: DOMRect,
  placement: DatePickerPlacement,
  offset: number,
): CSSProperties {
  const [side, align = "center"] = placement.split("-");
  let left = reference.left;
  let top = reference.bottom + offset;

  if (side === "top") top = reference.top - floating.height - offset;
  if (side === "right") left = reference.right + offset;
  if (side === "left") left = reference.left - floating.width - offset;

  if (side === "top" || side === "bottom") {
    if (align === "end") left = reference.right - floating.width;
    else if (align === "center") left = reference.left + (reference.width - floating.width) / 2;
  } else {
    if (align === "end") top = reference.bottom - floating.height;
    else if (align === "center") top = reference.top + (reference.height - floating.height) / 2;
  }

  return {
    position: "fixed",
    left: Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - floating.width - VIEWPORT_PADDING),
    ),
    top: Math.max(
      VIEWPORT_PADDING,
      Math.min(top, window.innerHeight - floating.height - VIEWPORT_PADDING),
    ),
    maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
    maxHeight: `calc(100vh - ${VIEWPORT_PADDING * 2}px)`,
    overflow: "auto",
  };
}

/**
 * Composition root for a popover date picker. It keeps the public compound
 * component API lightweight while providing viewport-safe positioning, outside
 * dismissal, Escape handling, and focus restoration without a runtime dependency.
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
  const [floatingStyles, setFloatingStyles] = useState<CSSProperties>({ position: "fixed" });
  const reference = useRef<HTMLElement | null>(null);
  const floating = useRef<HTMLElement | null>(null);
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

  const calendar = useCalendar({
    ...calendarOptions,
    onSelect: (value, complete) => {
      calendarOptions.onSelect?.(value, complete);
      if (closeOnSelect && complete) setOpen(false);
    },
  });

  const updatePosition = useCallback(() => {
    if (!reference.current || !floating.current) return;
    setFloatingStyles(
      positionFor(
        reference.current.getBoundingClientRect(),
        floating.current.getBoundingClientRect(),
        placement,
        offsetValue,
      ),
    );
  }, [offsetValue, placement]);

  const setReference = useCallback((node: HTMLElement | null) => {
    reference.current = node;
  }, []);
  const setFloating = useCallback((node: HTMLElement | null) => {
    floating.current = node;
  }, []);
  const refs = useMemo<DatePickerRefs>(
    () => ({ reference, floating, setReference, setFloating }),
    [setFloating, setReference],
  );

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    const observer =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(updatePosition);
    if (reference.current) observer?.observe(reference.current);
    if (floating.current) observer?.observe(floating.current);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      observer?.disconnect();
    };
  }, [open, updatePosition]);

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
      floating.current
        ?.querySelector<HTMLElement>(
          '[role="gridcell"][tabindex="0"], button:not([disabled]), input:not([disabled])',
        )
        ?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !reference.current?.contains(target) && !floating.current?.contains(target))
        setOpen(false);
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
  }, [open, setOpen]);

  const getReferenceProps = useCallback(
    (props: Record<string, unknown> = {}) => {
      const { onClick, ...rest } = props as {
        onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
      };
      return {
        ...rest,
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
    () => ({ calendar, open, setOpen, refs, floatingStyles, getReferenceProps, getFloatingProps }),
    [calendar, floatingStyles, getFloatingProps, getReferenceProps, open, refs, setOpen],
  );
}
