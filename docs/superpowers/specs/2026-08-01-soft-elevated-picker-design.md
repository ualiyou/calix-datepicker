# Soft-elevated date and time picker design

## Intent

Refresh Calix's default ready-made UI toward the supplied RTL picker reference:
compact, light, softly elevated, and clearly interactive. Keep Calix's existing
violet palette and all public component APIs and headless hooks.

## Visual system

- Default theme uses a warm off-white light surface, subtle visible borders, and
  one restrained soft shadow layer. Dark theme remains token-driven and is not
  re-themed around the reference.
- Interactive targets retain a minimum 44 px hit area. Reduced-motion, visible
  keyboard focus, contrast, and RTL ordering remain intact.
- The calendar uses a compact density: tighter padding and month spacing, a
  calm header, clear selected-day pill, and a fixed action row.

## Date picker

- The convenience DatePicker field is one rounded control: leading calendar
  icon, selected/placeholder text, and trailing chevron.
- The default popover has one surface (no competing nested-card appearance).
  Its header exposes month/year navigation; the footer places Today, Clear, and
  Confirm/Cancel actions consistently when enabled.
- Existing range, multi-month, locale, Jalali, keyboard, and custom-slot
  behavior is retained.

## Time picker

- Analog time is the visual primary: AM/PM segmented control, large clock face
  with a violet selection ring, readable hour/minute state, minute shortcuts,
  and a fixed action row.
- Wheel and field variants remain supported. Their spacing follows the compact
  density rather than adopting the analog clock layout.
- Confirming an embedded time picker commits the current value and closes its
  containing DatePicker popover.

## Responsive and validation

- At narrow widths, popovers fit the viewport without horizontal scrolling;
  multi-month calendars remain opt-in and can wrap/scroll only where already
  supported.
- Add component tests for confirm-to-close behavior and preserve existing
  keyboard/a11y coverage. Validate light and dark themes plus RTL at desktop
  and mobile widths with the existing Playwright suite.
