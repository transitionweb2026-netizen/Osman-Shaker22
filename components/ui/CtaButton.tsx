import type { Cta } from "@/content/types";
import type { Site } from "@/lib/content";
import { ctaTarget } from "@/lib/cta";
import type { Locale } from "@/lib/i18n";
import type { Resolved } from "@/lib/localize";
import { ButtonLink } from "./Button";

type CtaButtonProps = {
  cta: Resolved<Cta>;
  locale: Locale;
  site: Site;
  variant?: "primary" | "glass" | "ghost";
  size?: "md" | "lg";
  className?: string;
};

/**
 * A content-managed button. Its action (page, section, WhatsApp, call or
 * external site) decides the link and icon; hidden buttons and buttons whose
 * destination is unavailable render nothing.
 */
export function CtaButton({ cta, locale, site, variant = "glass", size = "md", className }: CtaButtonProps) {
  if (cta.hidden) return null;
  const target = ctaTarget(cta.action, locale, site.contact);
  if (!target) return null;

  return (
    <ButtonLink
      href={target.href}
      variant={variant}
      size={size}
      icon={target.icon ?? undefined}
      arrow={!target.icon}
      newTabHint={target.newTab ? site.ui.opensInNewTab : undefined}
      ariaLabel={cta.ariaLabel}
      className={className}
    >
      {cta.label}
    </ButtonLink>
  );
}
