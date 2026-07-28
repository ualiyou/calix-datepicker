# Minimal Calix Mark

## Goal

Replace the generic header glyph with a compact Calix brand mark and remove the
"React date infrastructure" eyebrow from the homepage.

## Design

- Use an inline SVG rather than an asset or dependency.
- The mark is a rounded calendar outline with a single highlighted date cell;
  it remains legible at the 20px header size and inherits the violet landing
  accent.
- Keep the `Calix` wordmark beside the mark for immediate recognition.
- Keep the existing accessible `Calix home` label on the brand link and hide
  the decorative SVG from assistive technology.

## Scope

- Touch only the homepage brand markup and its landing styles.
- Do not change navigation, package APIs, or other documentation pages.

## Verification

- Run the docs lint and production build.
- Check the homepage at desktop and mobile widths for alignment and overflow.
