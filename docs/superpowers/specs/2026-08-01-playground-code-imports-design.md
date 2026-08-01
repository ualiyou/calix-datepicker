# Playground code imports

## Goal

Make the Docs Playground's Code tab produce a self-contained snippet whose
imports change with the selected component and options.

## Design

Keep the existing `createCode(config)` entry point. It will derive the import
block and JSX props from the same `Config` object so they cannot drift:

- Import the selected Calix component and the default theme.
- Import the selected calendar adapter when rendering `Calendar` or
  `DatePicker`.
- Import only the selected holiday data when that configuration actually uses
  it.
- Include React state and its import only if the generated snippet needs a
  controlled value.

The time-only picker remains adapter-free because it uses the configured locale
only. The generator will keep omitting default props, as it does today.

## Validation

Add focused assertions for representative configurations: default date picker,
non-Gregorian adapter, holiday data, and standalone time picker. Verify the
Docs app type-checks.
