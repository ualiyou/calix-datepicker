# Documentation journey redesign

## Goal

Make Calix documentation easy to enter and safe to follow for React developers
at any experience level. A reader must be able to install Calix, choose an
adapter, load optional styles in the right application boundary, and render a
working picker without inferring missing steps.

## Scope

- Redesign the documentation information architecture around tasks rather than
  internal APIs.
- Create one default journey: install, choose a framework setup, add styles or
  explicitly remain unstyled, render a first picker, then select the relevant
  capability guide.
- Provide verified Vite, Next.js App Router, and Remix setup instructions. Each
  setup states the exact CSS import location and client-component boundary when
  applicable.
- Keep an unstyled path beside the themed path; explain that themes are optional
  and link to customization rather than implying that styles load automatically.
- Make the first example self-contained and intentionally small. It includes
  package imports, adapter, styles, and only the state needed for the example.
- Organize guides by user task: calendar and locale choice, selection and output,
  constraints and holidays, styling, and custom UI. Keep hooks and the API
  reference as advanced/reference material.
- Rewrite the root and package READMEs as concise entry points that contain one
  working setup and link to the relevant site pages. Do not maintain a second
  long-form tutorial in README files.
- Give every guide a clear intended audience, prerequisites, outcome, and
  context-aware next step.

## Information architecture

1. **Introduction** — what Calix is, the three rendering choices, and a direct
   link to installation.
2. **Installation** — package selection, requirements, and framework-specific
   style-loading locations.
3. **First picker** — a complete, copyable default DatePicker; links to inline
   calendar and unstyled/custom paths.
4. **Guides** — calendars and localization; selection, forms, and output;
   constraints and holidays; theming; custom UI and hooks.
5. **Reference** — complete component, hook, type, adapter, and styling contracts.

The site is English-only. Its navigation should expose the default journey first
and place advanced API material after the guides.

## Content rules

- Each fact has one canonical page. Other pages link to it instead of repeating
  divergent prose or snippets.
- Every code sample includes required imports and is valid in the named
  framework context.
- A CSS sample says both what it does and where it belongs. The default theme,
  minimal theme, and no-theme routes are mutually exclusive choices.
- Controlled and uncontrolled values are introduced only when their distinction
  matters, with the simplest viable default selected for the example.
- Pages lead readers to their next decision, not merely to a related topic.

## Non-goals

- No translation or bilingual documentation.
- No changes to Calix APIs, component behavior, package names, or theme assets.
- No new documentation framework, runtime dependency, or generated-doc system.
- No exhaustive framework guide beyond Vite, Next.js App Router, and Remix in
  this pass.

## Verification

- Build the documentation site.
- Validate internal documentation links.
- Confirm every quick-start import against the package exports and the Vite,
  Next.js, and Remix examples.
- Review the rendered navigation and the installation-to-first-picker journey
  manually, including the styles and unstyled branches.
