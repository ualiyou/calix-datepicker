# Benchmarks

This directory holds performance comparisons between Calix and other pickers.

## What we measure

1. **Bundle size** — via `size-limit` (`pnpm size` at the repo root). Budgets are
   defined in `.size-limit.json`.
2. **Render counts** — how many React commits a typical interaction triggers
   (open → navigate a month → select). Fewer is better.
3. **Grid generation throughput** — pure engine benchmark of `generateMonthGrid`
   across many months, run with Vitest bench.

## Competitors

- [`react-day-picker`](https://react-day-picker.js.org/)
- [`react-aria` DatePicker](https://react-spectrum.adobe.com/react-aria/)
- [`@mui/x-date-pickers`](https://mui.com/x/react-date-pickers/)
- [`@mantine/dates`](https://mantine.dev/dates/getting-started/)
- [`antd` DatePicker](https://ant.design/components/date-picker/)

## Running

```bash
pnpm build            # build packages first
pnpm size             # bundle-size budgets
pnpm --filter @calix/core bench   # engine micro-benchmarks
```

> Render-count harnesses live in `bench/render/` and use React's Profiler to
> count commits per scripted interaction. Results are recorded in
> `bench/RESULTS.md` per release so regressions are visible in review.
