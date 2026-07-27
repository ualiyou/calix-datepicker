import type { SyntheticEvent } from "react";

/**
 * Compose multiple event handlers into one. Later handlers are skipped if an
 * earlier handler called `preventDefault`, unless `checkForDefaultPrevented` is
 * disabled.
 */
export function composeEventHandlers<E extends SyntheticEvent>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
  { checkForDefaultPrevented = true }: { checkForDefaultPrevented?: boolean } = {},
): (event: E) => void {
  return (event: E) => {
    theirs?.(event);
    if (checkForDefaultPrevented && event.defaultPrevented) return;
    ours(event);
  };
}

/** A no-SSR-crash `useLayoutEffect`: falls back to `useEffect` on the server. */
export const isBrowser = typeof document !== "undefined";
