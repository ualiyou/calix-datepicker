import { describe, expect, it, vi } from "vitest";
import { composeEventHandlers, isBrowser } from "./dom.js";

describe("DOM helpers", () => {
  it("composes handlers and honors preventDefault by default", () => {
    const ours = vi.fn();
    const handler = composeEventHandlers((event) => event.preventDefault(), ours);
    handler({ preventDefault: vi.fn(), defaultPrevented: true } as never);
    expect(ours).not.toHaveBeenCalled();
  });

  it("can run the second handler after preventDefault", () => {
    const ours = vi.fn();
    const handler = composeEventHandlers(undefined, ours, { checkForDefaultPrevented: false });
    handler({ defaultPrevented: true } as never);
    expect(ours).toHaveBeenCalledOnce();
    expect(isBrowser).toBe(true);
  });
});
