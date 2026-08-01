# Playground JSON Latin digits

## Goal

Keep localized calendar display while making the Docs Playground's serialized
JSON suitable for console and API use with Latin digits.

## Design

Normalize only the `date`, `time`, and derived `dateTime` strings produced by
`previewOutput`'s JSON serializer through the existing `toLatinDigits` helper.
Numeric JSON fields already serialize as Latin digits, so they need no change.
String output and all visual calendar/input formatting remain locale-aware.

## Validation

Add a focused test for a Jalali `fa-IR` JSON preview and run the Docs app's
typecheck and relevant test command.
