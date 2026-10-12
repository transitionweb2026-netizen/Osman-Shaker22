"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./SiteHeader.module.css";

export type HeaderNavItem = {
  key: string;
  label: string;
  /** `null` while the destination page is not built yet. */
  href: string | null;
};

const withTrailingSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);

type SiteHeaderProps = {
  locale: Locale;
  brandName: string;
  brandRole: string;
  homeHref: string;
  homeLabel: string;
  navigation: HeaderNavItem[];
  book: { href: string; label: string } | null;
  ui: {
    mainNavigation: string;
    openMenu: string;
    closeMenu: string;
    chooseLanguage: string;
    comingSoon: string;
    opensInNewTab: string;
  };
};

const DESKTOP_QUERY = "(min-width: 1180px)";

export function SiteHeader({ locale, brandName, brandRole, homeHref, homeLabel, navigation, book, ui }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const pathname = withTrailingSlash(usePathname() ?? homeHref);
  // In-page anchors (used while a page is not built yet) are never the current page.
  const isCurrent = (href: string | null) => href !== null && !href.includes("#") && href === pathname;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const background = ["main", "site-footer"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    background.forEach((el) => (el.inert = true));
    document.documentElement.style.overflow = "hidden";
    sheetRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      background.forEach((el) => (el.inert = false));
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={cx(styles.header, scrolled && styles.scrolled, open && styles.open)}>
      <div className={cx("container-wide", styles.bar)}>
        <a href={homeHref} className={styles.brand} aria-label={homeLabel}>
          <BrandMark idPrefix="header-mark" size={42} />
          <span className={styles.brandText}>
            <span className={styles.brandName}>{brandName}</span>
            <span className={styles.brandRole}>{brandRole}</span>
          </span>
        </a>

        <nav aria-label={ui.mainNavigation} className={styles.desktopNav}>
          <ul className={styles.navList}>
            {navigation.map((item) => (
              <li key={item.key}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={styles.navLink}
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className={cx(styles.navLink, styles.navSoon)}>
                    {item.label}
                    <span className={styles.soonTag}>{ui.comingSoon}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher locale={locale} label={ui.chooseLanguage} />
          {book && (
            <ButtonLink href={book.href} icon="whatsapp" newTabHint={ui.opensInNewTab} className={styles.book}>
              {book.label}
            </ButtonLink>
          )}
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? "close" : "menu"} size={22} />
            <span className="sr-only">{open ? ui.closeMenu : ui.openMenu}</span>
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={sheetRef} className={styles.sheet} inert={!open}>
        <nav aria-label={ui.mainNavigation}>
          <ul className={styles.sheetList}>
            {navigation.map((item, index) => (
              <li key={item.key} style={{ "--i": index } as CSSProperties}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={styles.sheetLink}
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                    onClick={close}
                  >
                    {item.label}
                    <Icon name="arrow" size={22} />
                  </a>
                ) : (
                  <span className={cx(styles.sheetLink, styles.sheetSoon)}>
                    {item.label}
                    <span className={styles.soonTag}>{ui.comingSoon}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {book && (
          <div className={styles.sheetFooter}>
            <ButtonLink href={book.href} icon="whatsapp" size="lg" newTabHint={ui.opensInNewTab}>
              {book.label}
            </ButtonLink>
          </div>
        )}
      </div>
    </header>
  );
}
