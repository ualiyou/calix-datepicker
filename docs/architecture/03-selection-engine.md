# 03 — Selection engine

Selection is a **strategy**. The picker mode (`single`, `range`, `multiple`,
`week`, `month`, `year`, `quarter`) chooses a `SelectionStrategy`; the rest of
the system is unaware of which is active.

```ts
interface SelectionStrategy<TValue> {
  readonly mode: SelectionMode;
  /** Compute the next value when `date` is chosen. Pure. */
  select(current: TValue, date: CalendarDate, ctx: SelectionContext): TValue;
  /** Cell-state queries the grid uses for rendering. */
  isSelected(value: TValue, date: CalendarDate, ctx: SelectionContext): boolean;
  isRangeStart?(value: TValue, date: CalendarDate): boolean;
  isRangeEnd?(value: TValue, date: CalendarDate): boolean;
  isInRange?(value: TValue, date: CalendarDate): boolean;
  /** Normalize/clear. */
  empty(): TValue;
}
```

- **`select` is pure** — `(current, date) -> next`. No mutation, no side effects.
  This makes selection unit-testable and time-travel friendly, and keeps React
  state updates predictable.
- **Range** tracks an anchor and resolves start/end ordering, with hover preview
  supplied via `ctx.preview` so the grid can show a tentative range on mouseover
  without committing state.
- **Multiple** toggles membership; **week/month/quarter** expand a single click
  into the appropriate span using the adapter.

## Why a strategy, not a `switch`

A `switch (mode)` scattered through hooks and components would violate
open/closed and duplicate logic. A strategy object localizes each mode's rules,
lets consumers **register custom strategies**, and keeps `useSelection` tiny — it
just delegates.

## Trade-off

Strategies must share one value shape per family (e.g. range = `{start, end}`).
We model the public value as a discriminated union keyed by mode so TypeScript
narrows correctly at the API boundary, at the cost of a small mapping layer
between the internal strategy value and the public `value` prop.
