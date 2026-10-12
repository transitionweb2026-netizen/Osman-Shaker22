import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { cx } from "@/lib/cx";
import { resolveRoute, type RouteKey } from "@/lib/routes";
import { Icon, type IconName } from "./Icon";
import styles from "./Button.module.css";

type Variant = "primary" | "glass" | "ghost";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  icon?: IconName;
  /** Shows a direction-aware arrow after the label. */
  arrow?: boolean;
  /** Opens in a new tab; pass the localized "(opens in a new tab)" hint. */
  newTabHint?: string;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  icon,
  arrow = false,
  newTabHint,
  className,
}: ButtonLinkProps) {
  const external = Boolean(newTabHint);
  return (
    <a
      href={href}
      className={cx(styles.button, styles[variant], size === "lg" && styles.large, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
      {external && <span className="sr-only">{newTabHint}</span>}
      {arrow && <Icon name="arrow" size={18} className={styles.arrowIcon} />}
    </a>
  );
}

type RouteButtonProps = {
  route: RouteKey;
  locale: Locale;
  children: ReactNode;
  /** Localized "Soon" label for destinations that are not built yet. */
  soonLabel: string;
  variant?: Variant;
  className?: string;
};

/**
 * Link to a registered route. Until the destination page exists it renders a
 * non-interactive "coming soon" control instead of a broken link.
 */
export function RouteButton({ route, locale, children, soonLabel, variant = "glass", className }: RouteButtonProps) {
  const href = resolveRoute(route, locale, { allowHomeAnchor: false });
  if (href) {
    return (
      <ButtonLink href={href} variant={variant} arrow className={className}>
        {children}
      </ButtonLink>
    );
  }
  return (
    <span className={cx(styles.button, styles.soon, className)}>
      <span>{children}</span>
      <span className={styles.soonTag}>{soonLabel}</span>
    </span>
  );
}
