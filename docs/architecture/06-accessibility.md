# 06 — Accessibility

Accessibility is a core feature, not a layer. Targets: **WCAG 2.1 AA**, full
keyboard operability, and correct screen-reader semantics.

## Grid semantics

The calendar is a `role="grid"` with `role="row"` weeks and
`role="gridcell"` day buttons, labeled with the localized full date. The month
header uses `aria-live="polite"` so month changes are announced. Selected and
disabled states map to `aria-selected` and `aria-disabled`.

## Keyboard model

- Arrow keys move the focused day (roving `tabIndex`), wrapping across weeks and
  crossing month boundaries (which navigates the view).
- `Home`/`End` jump to start/end of the week; `PageUp`/`PageDown` change month;
  `Shift+PageUp`/`PageDown` change year.
- `Enter`/`Space` select the focused day; `Escape` closes the popup and restores
  focus to the trigger.
- In RTL locales, `ArrowLeft`/`ArrowRight` are mirrored so "next" always means
  chronologically later.

## Focus management

- Opening the popup moves focus to the selected day (or today).
- A focus trap keeps Tab within the popup while open.
- Closing restores focus to the trigger/input (**focus restoration**).

## Motion & contrast

- All animations respect `prefers-reduced-motion` — transitions collapse to
  instant when reduced motion is requested.
- Themes provide a high-contrast variant and never rely on color alone to convey
  state (selection also changes shape/weight).

## Verification

Accessibility is checked in CI with `axe` via Playwright, plus Storybook
interaction tests for the keyboard model.
