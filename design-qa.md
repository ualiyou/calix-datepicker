**Comparison Target**

- Source visual truth: `/Users/alyu/.codex/generated_images/019fa296-07fa-7462-a9d3-2aac9c9a94cd/exec-3bca2e40-45d2-40f3-9764-c799e249a57d.png`
- Implementation: `http://localhost:3001/` captured in the in-app browser.
- Viewport: 1440 × 1024 CSS px, DPR 1. The reference is a 1440-wide landing-page concept; comparison used the same desktop composition and Gregorian/Jalali picker states.

**Findings**

- No actionable P0/P1/P2 differences for the requested landing-page direction.
- Typography: the implementation keeps the oversized, tight display headline and monospaced technical eyebrow; Fumadocs supplies the navigation font rather than duplicating a visual-only header.
- Spacing and layout rhythm: a two-column desktop hero collapses to one column below 800 px; the real calendar remains fully reachable rather than being a static mock.
- Colors and tokens: dark ink, warm paper, violet action, and explicit light calendar tokens are preserved even when the system browser is in dark mode.
- Image quality and assets: the source concept has no required raster assets. Existing Calix icons are used for the calendar and CTA; no placeholder imagery was introduced.
- Copy: the hero, actions, calendar system toggle, and product facts match the intended product story.

**Interaction Evidence**

- `Gregorian` and `Jalali` controls each resolve to one button; switching to Jalali rendered Persian calendar content.
- The calendar initially selected July 27, 2026 and allows selecting another date.
- Browser console errors: none.

**Focused Region Comparison**

The hero and calendar preview are the only meaningful above-the-fold regions; the implementation retains the source’s left-aligned hierarchy and right-side bright calendar panel. No separate focused crop was needed.

**Follow-up Polish**

- [P3] Add a dedicated custom display font only if the project later adopts one globally; the current system stack is deliberate to avoid a new asset and request cost.

**Implementation Checklist**

- [x] Responsive landing hero
- [x] Working CTAs
- [x] Interactive Gregorian/Jalali DatePicker preview
- [x] Typecheck and browser-console check

final result: passed
