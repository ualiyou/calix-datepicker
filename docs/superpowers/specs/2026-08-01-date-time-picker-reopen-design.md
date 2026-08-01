# Date-time picker reopen behavior

## Goal

When a `DatePicker` with `withTime` is reopened, it starts on the date step even when its current value already has a date and time.

## Behavior

- Opening the popover always displays the calendar first.
- Choosing a date advances to the time step as it does today.
- The Back control still returns from time to date.
- Closing and reopening resets only the temporary step; it does not alter the selected value.

## Implementation

Keep the step state local to `DateTimeContent`. Observe the picker open state from the existing context and reset the state to `date` whenever the popover opens. Do not add a public prop or shared state.

## Verification

Add one component test: select a date, close the picker from the time step, reopen it, and assert the calendar is shown instead of the time controls.
