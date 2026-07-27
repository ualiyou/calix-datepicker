"use client";
import { createContext, useContext } from "react";
import type { UseDatePickerReturn } from "../hooks/useDatePicker.js";

/** Shared context for the compound `DatePicker.*` components. */
export const DatePickerContext = createContext<UseDatePickerReturn | null>(null);

export function useDatePickerContext(): UseDatePickerReturn {
  const ctx = useContext(DatePickerContext);
  if (!ctx) {
    throw new Error("Calix: `DatePicker.*` components must be used within <DatePicker.Root>.");
  }
  return ctx;
}
