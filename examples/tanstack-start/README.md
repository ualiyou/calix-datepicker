# Calix + TanStack Start

A minimal [TanStack Start](https://tanstack.com/start) example.

```bash
pnpm install
pnpm --filter example-tanstack-start dev
```

The `app/routes/index.tsx` route renders a `<DatePicker>` from `@calix/react`.
Because Calix is SSR/RSC-safe and side-effect free, it works with Start's
server rendering out of the box. Add `app.config.ts`, `app/router.tsx`, and
`app/ssr.tsx` from the TanStack Start starter to complete the scaffold — the
Calix usage above is unchanged regardless of framework wiring.
