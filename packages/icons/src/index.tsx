import { createIcon } from "./createIcon.js";

export { createIcon, type IconProps } from "./createIcon.js";

export const ChevronLeftIcon = createIcon("ChevronLeftIcon", <path d="m15 18-6-6 6-6" />);
export const ChevronRightIcon = createIcon("ChevronRightIcon", <path d="m9 18 6-6-6-6" />);
export const ChevronsLeftIcon = createIcon(
  "ChevronsLeftIcon",
  <>
    <path d="m11 17-5-5 5-5" />
    <path d="m18 17-5-5 5-5" />
  </>,
);
export const ChevronsRightIcon = createIcon(
  "ChevronsRightIcon",
  <>
    <path d="m13 17 5-5-5-5" />
    <path d="m6 17 5-5-5-5" />
  </>,
);
export const CalendarIcon = createIcon(
  "CalendarIcon",
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </>,
);
export const ClockIcon = createIcon(
  "ClockIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
);
export const XIcon = createIcon("XIcon", <path d="M18 6 6 18M6 6l12 12" />);
