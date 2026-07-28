# @alydev/adapter-hijri

The Hijri (Umm al-Qura / Islamic civil) calendar adapter for
[Calix](https://github.com/calix-ui/calix-datepicker). Conversion is backed by
the platform's ICU `islamic-umalqura` calendar, so no lookup tables ship in the
bundle.

```bash
pnpm add @alydev/datepicker @alydev/adapter-hijri
```

```tsx
import { DatePicker } from "@alydev/datepicker";
import { hijri } from "@alydev/adapter-hijri";

<DatePicker adapter={hijri} locale="ar-SA" dir="rtl" />;
```

Stateless singleton — import once and share. Locale (`ar-SA`, `fa-IR`, `en-US`, …)
is always a parameter, so one adapter serves every Hijri locale.
