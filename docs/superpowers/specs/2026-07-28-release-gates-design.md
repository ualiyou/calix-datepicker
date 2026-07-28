# Release-gate fixes

## Goal

Make the current Calix output releasable without removing or splitting its public
features.

## Scope

- Keep the current DatePicker, DateTime, calendar, and theme behavior and public
  API intact.
- Give every popover a stable, unique id. Its input and trigger expose
  `aria-haspopup`, `aria-expanded`, and `aria-controls`; keyboard Enter and
  Space open the input-anchored popover.
- Pass optional component props only when defined, so declaration generation has
  no `exactOptionalPropertyTypes` diagnostics; remove the redundant ref cast
  flagged by ESLint.
- Add focused unit and E2E coverage for the repaired interaction and accessibility
  contract. Coverage thresholds remain unchanged.
- Set the DatePicker size budget to 18 kB, which preserves the current 17.1 kB
  implementation while retaining a small regression margin.

## Non-goals

- No new product capability, dependency, abstraction, or code splitting.
- No lowering of lint, coverage, package-smoke, or accessibility gates.
- No changes to consumer-facing component props or behavior beyond repairing the
  documented keyboard/accessibility contract.

## Verification

Run `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build:release`,
`pnpm test:packages`, `pnpm size`, and `pnpm test:e2e`. All must pass.
