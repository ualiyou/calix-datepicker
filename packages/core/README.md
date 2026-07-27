# @calix/core

The framework-agnostic heart of [Calix](https://github.com/calix-ui/calix-datepicker):
calendar-agnostic date types, the `CalendarAdapter` interface, pluggable selection
strategies, validation, and format/parse orchestration. **Zero runtime dependencies.**

You usually don't install this directly — `@calix/react` and the adapter packages
depend on it. Install it when building your own binding or a custom adapter.

```bash
pnpm add @calix/core
```

See the [architecture docs](../../docs/architecture) for the design rationale.
