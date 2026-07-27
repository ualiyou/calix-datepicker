# @alydev/icons

Tree-shakeable SVG icon components used by [Calix](https://github.com/calix-ui/calix-datepicker).
Bring your own icons or use these — each inherits `currentColor` and sizes to `1em`.

```tsx
import { ChevronLeftIcon, CalendarIcon } from "@alydev/icons";

<CalendarIcon size={20} aria-hidden />;
```

Create your own with the same conventions:

```tsx
import { createIcon } from "@alydev/icons";

export const MyIcon = createIcon("MyIcon", <path d="…" />);
```
