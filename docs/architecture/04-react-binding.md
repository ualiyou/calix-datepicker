# 04 — React binding

`@alydev/datepicker` turns the core into idiomatic React without leaking React into
the core.

## Split context

State is split into three contexts to minimize re-renders:

- **ConfigContext** — adapter, locale, dir, min/max, disabled predicates. Changes
  rarely; stable across interactions.
- **StateContext** — current value, focused date, open/closed, view month. The
  hot path.
- **DispatchContext** — stable action callbacks. Never changes identity, so
  components that only dispatch never re-render on state change.

A single mega-context would re-render every subscriber on any change. Splitting
means a day cell that only needs `dispatch` (to select) does not re-render when
the focused date moves.

## Hooks

- **`useCalendar`** — owns the visible month, navigation (prev/next month/year,
  go-to), and lazy grid generation (grids are computed per visible month and
  memoized by `adapter + view + locale + weekStartsOn`).
- **`useSelection`** — wraps a `SelectionStrategy`, bridges controlled and
  uncontrolled modes via a `useControllableState` helper, and exposes
  `select`/`clear` plus cell-state predicates.
- **`useDateInput`** — masked, auto-formatting text input: parsing, paste, IME
  composition guarding, and validation, all driven by the adapter's
  `format`/`parse`.
- **`useDatePicker`** — the composition root. Wires input + Floating UI popover +
  calendar + focus management and returns prop-getters
  (`getTriggerProps`, `getContentProps`, `getInputProps`).

## Prop getters + compound components

Low-level consumers use hooks and prop-getters for total control. Most consumers
use compound components (`DatePicker.Root/Input/Trigger/Content/Calendar`) that
call the hooks internally and expose `asChild`, slots, and render props for
customization. Convenience wrappers (`DatePicker`, `DatePicker.Range`, …)
pre-compose the common shapes.

## React 19 / RSC / Compiler notes

- Client components carry `"use client"`; nothing runs at import time, so tree is
  RSC-safe and SSR-safe (no `window` access during render; effects only).
- We rely on stable references and pure render logic rather than manual
  `useMemo`/`useCallback` micro-tuning, which keeps the code
  **React-Compiler-friendly** (the compiler can memoize freely because we never
  depend on referential identity for correctness).
