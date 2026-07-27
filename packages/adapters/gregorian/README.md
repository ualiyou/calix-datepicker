# @alydev/adapter-gregorian

The Gregorian calendar adapter for [Calix](https://github.com/calix-ui/calix-datepicker),
backed by [date-fns](https://date-fns.org/).

```bash
pnpm add @alydev/datepicker @alydev/adapter-gregorian
```

```tsx
import { DatePicker } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";

<DatePicker adapter={gregorian} locale="en-US" />;
```

Stateless singleton — import once and share. Locale (`en-US`, `en-GB`, `fr-FR`, …)
is always a parameter, so one adapter serves every Gregorian locale.
