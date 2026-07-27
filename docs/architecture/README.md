# Calix architecture

This directory documents the design decisions behind Calix and the trade-offs
considered. It is the reference for contributors and the rationale for reviewers.

- [`01-overview.md`](./01-overview.md) — layering and package boundaries.
- [`02-calendar-adapter.md`](./02-calendar-adapter.md) — the calendar abstraction.
- [`03-selection-engine.md`](./03-selection-engine.md) — pluggable selection.
- [`04-react-binding.md`](./04-react-binding.md) — hooks, context, components.
- [`05-styling.md`](./05-styling.md) — headless styling contract.
- [`06-accessibility.md`](./06-accessibility.md) — keyboard, ARIA, focus.

## First principles

1. **Business logic is framework-agnostic.** Everything that can live without
   React lives in `@calix/core`. React is a thin binding.
2. **The UI never knows the calendar.** All calendar math goes through a
   `CalendarAdapter`. Gregorian and Jalali are peers; neither is special-cased in UI.
3. **Headless-first.** Behavior and accessibility are the product; markup and
   styling are the consumer's. A default theme is opt-in.
4. **Composition over configuration.** Compound components + hooks + render props,
   not a mega-component with 60 boolean props.
5. **Correctness over cleverness.** Dates are stored as calendar-agnostic
   `{ year, month, day }` records, never JS `Date`, to avoid timezone/DST drift.
