# @alydev/datepicker

Headless hooks and compound components for building date pickers with
[Calix](https://github.com/calix-ui/calix-datepicker).

```bash
pnpm add @alydev/datepicker @alydev/adapter-gregorian @alydev/themes
```

```tsx
import { DatePicker } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import "@alydev/themes/default.css";

<DatePicker adapter={gregorian} locale="en-US" />;
```

## Hooks

`useCalendar`, `useDatePicker`, `useDateInput`, `useTime`, `useControllableState`.

## Components

`Calendar`, `CalendarView`, `DatePicker` (+ `Root`/`Trigger`/`Input`/`Content`),
`TimeField`, `MonthPicker`, `YearPicker`.

See the [full documentation](https://calix.dev) for guides and the API reference.
