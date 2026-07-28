---
"@alydev/core": minor
"@alydev/datepicker": minor
---

Add regional weekend support, range length limits, and month/focus callbacks.

- **`weekendDays`**: configure which weekdays are treated as the weekend for
  `data-weekend` and `businessDaysOnly`. Defaults are locale-aware — Persian
  locales default to `[5]` (Friday), everything else to `[0, 6]` (Sun/Sat).
- **`minRange` / `maxRange`**: constrain a `range` selection to a minimum and/or
  maximum number of inclusive days; the tentative endpoint (and hover preview)
  is clamped along the drag direction.
- **`onMonthChange(view)`** and **`onFocusChange(date)`** callbacks fire when the
  visible month or the roving focus changes.
