# @calix/adapter-jalali

The Jalali (Persian/Shamsi) calendar adapter for
[Calix](https://github.com/calix-ui/calix-datepicker), backed by
[date-fns-jalali](https://github.com/date-fns-jalali/date-fns-jalali).

```bash
pnpm add @calix/react @calix/adapter-jalali
```

```tsx
import { DatePicker } from "@calix/react";
import { jalali } from "@calix/adapter-jalali";

<DatePicker adapter={jalali} locale="fa-IR" dir="rtl" />;
```

Handles Jalali leap years, correct month lengths, RTL, and Persian digits. The UI
is identical to the Gregorian one — only the adapter changes.
