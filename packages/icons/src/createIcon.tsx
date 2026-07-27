import type { ReactNode, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  /** Convenience size prop applied to width and height. Default: `1em`. */
  size?: number | string;
  title?: string;
};

/**
 * Factory for consistent, accessible, tree-shakeable SVG icon components. Each
 * icon inherits `currentColor` and is `aria-hidden` unless given a `title`.
 */
export function createIcon(displayName: string, path: ReactNode) {
  function Icon({ size = "1em", title, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        {path}
      </svg>
    );
  }
  Icon.displayName = displayName;
  return Icon;
}
