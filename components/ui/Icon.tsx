import type { ReactNode } from "react";
import type { JourneyIcon, SocialPlatform } from "@/content/types";
import { cx } from "@/lib/cx";

export type IconName =
  | SocialPlatform
  | JourneyIcon
  | "whatsapp"
  | "phone"
  | "arrow"
  | "arrowUp"
  | "chevron"
  | "play"
  | "plus"
  | "menu"
  | "close"
  | "quote"
  | "certificate"
  | "expand"
  | "clock";

/** Icons that point along the reading direction and must mirror in Arabic. */
const directional = new Set<IconName>(["arrow", "chevron", "menu", "quote"]);

const paths: Record<IconName, ReactNode> = {
  facebook: <path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2H7z" />,
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.8" cy="7.2" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.2 9.4 15 12l-4.8 2.6z" fill="currentColor" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.6 20.4 4.9 16A8.6 8.6 0 1 1 8.2 19.2z" />
      <path
        d="M9.1 8.5c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .5.6 1 1.4 1.8 2.4 2.4.2.1.4.1.5 0l.6-.5c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .6-.5.8-.6.3-1.6.5-2.9-.1a9.6 9.6 0 0 1-4.3-4.3c-.6-1.3-.4-2.3-.1-2.9z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  play: (
    <path
      d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.3-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z"
      fill="currentColor"
      stroke="none"
    />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  quote: (
    <path
      d="M4 18.5v-4.2C4 10 6 7.2 9.6 5.5l.9 1.6C8.4 8.3 7.4 9.8 7.3 12H10v6.5zm9.5 0v-4.2c0-4.3 2-7.1 5.6-8.8l.9 1.6c-2.1 1.2-3.1 2.7-3.2 4.9h2.7v6.5z"
      fill="currentColor"
      stroke="none"
    />
  ),
  certificate: (
    <>
      <rect x="3.5" y="4" width="17" height="12.5" rx="2" />
      <path d="M7 8h10M7 11h6" />
      <circle cx="16" cy="16.5" r="2.6" />
      <path d="m14.6 18.6-.9 3 2.3-1.1 2.3 1.1-.9-3" />
    </>
  ),
  expand: <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  consultation: (
    <>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.6L4 20" />
      <path d="M8.5 10.5h7M8.5 13.5h4.5" />
    </>
  ),
  evaluation: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2.5" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="M8 13.5h2l1.5-3 2 6 1.5-3H16" />
    </>
  ),
  discussion: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M15.5 6a3 3 0 0 1 0 5.6M17.5 14.2a5.5 5.5 0 0 1 3 4.8" />
    </>
  ),
  plan: (
    <>
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8" />
    </>
  ),
  followUp: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="m12 17.4-2.1-2a1.3 1.3 0 0 1 1.9-1.9l.2.2.2-.2a1.3 1.3 0 0 1 1.9 1.9z" />
    </>
  ),
};

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

/** Decorative inline icon. Give the surrounding control an accessible name. */
export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cx(directional.has(name) && "flip-rtl", className)}
    >
      {paths[name]}
    </svg>
  );
}
