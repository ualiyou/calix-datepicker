# Editor prop documentation

## Goal

Make TypeScript editor tooltips state the accepted values, default, and relevant
conditions for Calix's public picker props.

## Scope

Add JSDoc to the shared calendar options and public `Calendar`, `DatePicker`,
and `TimeField` prop interfaces. Document defaults where the implementation
sets one, allowed ranges for numeric options, and mode-specific constraints.

The public TypeScript types remain unchanged. No runtime behavior, generated
code, or documentation site UI changes.

## Validation

Run the React package type-check and its existing component tests. The emitted
declaration types preserve the comments for editor IntelliSense.
