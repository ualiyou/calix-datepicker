# Proof-first landing redesign

## Goal

Replace the current Next.js homepage with a release-ready developer landing page
that demonstrates Calix before asking visitors to read documentation.

## Layout

1. Compact navigation: Calix mark, Docs, Playground, GitHub, and an install CTA.
2. Hero: React 18/19, four-calendar, SSR/RTL/accessibility claim; primary Docs
   CTA; secondary Playground CTA; live `Calendar` preview.
3. Proof strip: Gregorian, Jalali, Hijri, Buddhist, plus TypeScript and SSR-safe
   capabilities.
4. Feature grid: real product benefits—accessible interactions, adapters, and
   headless or ready-made UI.
5. Install panel: the one-command package install and a minimal typed example.
6. Final Docs/npm/GitHub CTA.

## Visual and interaction rules

- Retain the existing dark-violet Calix visual language and CSS-only effects.
- Reuse the current calendar preview, links, and responsive CSS conventions; do
  not add dependencies or generated imagery.
- Preserve semantic headings, visible keyboard focus, descriptive links, and
  responsive single-column behavior on narrow screens.

## Release follow-up

After the redesign, update affected documentation and package release notes,
create one Changeset for the fixed `@alydev/*` release set (minor), verify the
workspace, then commit, push `main`, and let the configured release workflow
create the version PR or publish to npm.

## Verification

Build and lint the docs site; run the existing release verification and E2E
checks. Confirm the homepage at desktop and mobile widths without horizontal
overflow.
