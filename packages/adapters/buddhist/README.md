# @alydev/adapter-buddhist

The Thai Buddhist calendar adapter for
[Calix](https://github.com/calix-ui/calix-datepicker). Shares the Gregorian
month/day structure but numbers years in the Buddhist Era (BE = CE + 543).

```bash
pnpm add @alydev/datepicker @alydev/adapter-buddhist
```

```tsx
import { DatePicker } from "@alydev/datepicker";
import { buddhist } from "@alydev/adapter-buddhist";

<DatePicker adapter={buddhist} locale="th-TH" />;
```

Stateless singleton — import once and share. Locale (`th-TH`, `en-US`, …) is
always a parameter.
