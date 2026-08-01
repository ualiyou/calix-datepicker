# Time picker input update

## Goal

Selecting a time in `TimePicker` updates its read-only trigger input immediately.

## Design

`TimePicker` remains the single owner of its uncontrolled time state and forwards it to `TimeField` as a controlled value. Selecting an hour or minute must call that shared setter, which re-renders the trigger input. Controlled consumers continue to receive the new value through `onChange`.

## Verification

Add one component test that opens the picker, selects an hour, and asserts the trigger input value changes. Run the React package test suite and typecheck.

## Scope

No new props, dependencies, or separate draft/commit state. Confirmation only closes the popover and invokes `onAccept`.
