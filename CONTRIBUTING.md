# Contributing to Calix

Thanks for your interest in improving Calix! This guide covers the essentials.

## Prerequisites

- Node.js `>=20` (see `.nvmrc`)
- pnpm `10.x` (`corepack enable` then `corepack use pnpm@10`)

## Getting started

```bash
git clone https://github.com/calix-ui/calix-datepicker.git
cd calix-datepicker
pnpm install
pnpm build
pnpm test
```

## Repository layout

- `packages/*` — publishable `@alydev/*` libraries.
- `packages/adapters/*` — calendar adapters.
- `apps/*` — docs site, Storybook, playground (not published).
- `examples/*` — framework integration examples (not published).
- `tooling/` — shared build config.
- `docs/architecture/` — design decisions and rationale.

## Development workflow

1. Create a branch off `main`.
2. Make your change. Keep business logic in `@alydev/core`; keep React-specific
   concerns in `@alydev/datepicker`. UI code must never depend on a concrete calendar.
3. Add or update tests. New behavior needs unit tests; user-facing behavior needs
   integration/e2e coverage.
4. Run the full check locally:
   ```bash
   pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```
5. Add a changeset describing your change:
   ```bash
   pnpm changeset
   ```
6. Open a pull request using the template.

## Coding standards

- **TypeScript strict.** No `any`. Prefer precise types and discriminated unions.
- **No duplicated logic**, no giant components, separate engine from rendering.
- **Tree-shakeable & side-effect free.** Packages declare `"sideEffects": false`.
- **Accessible by default.** Keyboard, ARIA, focus, and announcements are not optional.
- Formatting is enforced by Prettier; linting by ESLint. Run `pnpm format`.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/) for clarity,
e.g. `feat(core): add quarter selection strategy`. Releases are driven by
Changesets, not commit messages, but conventional commits keep history readable.

## Reporting bugs & requesting features

Use the issue templates. Include a minimal reproduction (a StackBlitz/CodeSandbox
link or a failing test is ideal).

## Code of Conduct

Participation is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md).
