"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { MessageKey } from "@/lib/cms/admin-i18n";
import { AdminIcon, type AdminIconName } from "./AdminIcon";
import { useAdmin } from "./AdminProvider";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button, Spinner } from "./ui";
import styles from "./shell.module.css";

type NavItem = { href: string; label: MessageKey; icon: AdminIconName; adminOnly?: boolean };

const navGroups: { label: MessageKey; items: NavItem[] }[] = [
  { label: "navOverview", items: [{ href: "/admin/", label: "navDashboard", icon: "dashboard" }] },
  {
    label: "navContent",
    items: [
      { href: "/admin/pages/", label: "navPages", icon: "pages" },
      { href: "/admin/pages/?page=home", label: "navHome", icon: "home" },
      { href: "/admin/pages/?page=about", label: "navAbout", icon: "user" },
      { href: "/admin/services/", label: "navServices", icon: "services" },
      { href: "/admin/videos/", label: "navVideos", icon: "video" },
      { href: "/admin/reviews/", label: "navReviews", icon: "star" },
      { href: "/admin/faq/", label: "navFaq", icon: "faq" },
      { href: "/admin/articles/", label: "navArticles", icon: "article" },
      { href: "/admin/career/", label: "navCareer", icon: "timeline" },
      { href: "/admin/certificates/", label: "navCertificates", icon: "certificate" },
    ],
  },
  { label: "navMediaGroup", items: [{ href: "/admin/media/", label: "navMedia", icon: "image" }] },
  {
    label: "navSite",
    items: [
      { href: "/admin/settings/", label: "navSettings", icon: "settings" },
      { href: "/admin/seo/", label: "navSeo", icon: "search" },
      { href: "/admin/publishing/", label: "navPublishing", icon: "publish" },
      { href: "/admin/team/", label: "navTeam", icon: "team", adminOnly: true },
    ],
  },
];

/** The nav item matching the current URL (most specific first). */
function useActiveHref(): string {
  const pathname = usePathname() ?? "/admin/";
  const params = useSearchParams();
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const page = params.get("page");
  if (path === "/admin/pages/" && (page === "home" || page === "about")) return `/admin/pages/?page=${page}`;
  if (path === "/admin/edit/") {
    const doc = params.get("doc") ?? "";
    if (doc.startsWith("home.")) return "/admin/pages/?page=home";
    if (doc.startsWith("about.")) return "/admin/pages/?page=about";
    if (doc.startsWith("settings.") || doc.startsWith("shared.")) return "/admin/settings/";
    return "/admin/pages/";
  }
  return path;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { auth, store, t, mode, member, isAdmin, locale, setLocale, signOut, confirmLeave, confirm, resetDemo } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const activeHref = useActiveHref();
  // The drawer belongs to the page it was opened on, so navigating closes it
  const [drawerFor, setDrawerFor] = useState<string | null>(null);
  const drawerOpen = drawerFor === activeHref;
  const setDrawerOpen = (open: boolean) => setDrawerFor(open ? activeHref : null);
  const [accountOpen, setAccountOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Signed-out visitors go to the sign-in page
  useEffect(() => {
    if (auth.status === "signedOut" || auth.status === "noAccess" || auth.status === "setPassword") {
      router.replace(`/admin/login/?next=${encodeURIComponent(pathname ?? "/admin/")}`);
    }
  }, [auth.status, pathname, router]);

  // Escape closes the drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setDrawerFor(null);
    window.addEventListener("keydown", onKey);
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setAccountOpen(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  if (auth.status !== "signedIn" || !store) {
    return (
      <div className={styles.fullPage}>
        <Spinner label={t("loading")} />
      </div>
    );
  }

  const activeItem = navGroups.flatMap((g) => g.items).find((item) => item.href === activeHref);
  const guard = (event: React.MouseEvent) => {
    if (!confirmLeave()) event.preventDefault();
  };

  const nav = (
    <nav aria-label={t("appName")}>
      {navGroups.map((group) => (
        <div key={group.label} className={styles.navGroup}>
          <p className={styles.navGroupLabel}>{t(group.label)}</p>
          <ul>
            {group.items
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.navLink}
                    aria-current={item.href === activeHref ? "page" : undefined}
                    onClick={guard}
                  >
                    <AdminIcon name={item.icon} />
                    <span>{t(item.label)}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className={styles.app}>
      <a href="#cms-main" className={styles.skip}>
        {t("skipToContent")}
      </a>

      <aside ref={drawerRef} className={cx(styles.sidebar, drawerOpen && styles.sidebarOpen)} aria-label={t("appName")}>
        <div className={styles.brand}>
          <BrandMark idPrefix="cms-mark" size={34} />
          <div>
            <p className={styles.brandName}>{t("siteName")}</p>
            <p className={styles.brandRole}>{t("appName")}</p>
          </div>
          <button type="button" className={styles.drawerClose} onClick={() => setDrawerOpen(false)} aria-label={t("closeMenu")}>
            <AdminIcon name="close" />
          </button>
        </div>
        {nav}
      </aside>
      {drawerOpen && <div className={styles.scrim} onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

      <div className={styles.main}>
        {mode === "local" && (
          <div className={styles.demoBanner} role="note">
            <AdminIcon name="info" />
            <p>{t("demoBanner")}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                if (await confirm({ message: t("demoResetConfirm"), confirmLabel: t("demoReset"), danger: true })) resetDemo();
              }}
            >
              {t("demoReset")}
            </Button>
          </div>
        )}
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setDrawerOpen(true)}
            aria-label={t("openMenu")}
            aria-expanded={drawerOpen}
          >
            <AdminIcon name="menu" />
          </button>
          <p className={styles.topTitle}>{activeItem ? t(activeItem.label) : t("appName")}</p>
          <div className={styles.topActions}>
            <a href={`/${locale}/`} target="_blank" rel="noopener noreferrer" className={styles.topLink}>
              <AdminIcon name="external" size={16} />
              <span>{t("viewSite")}</span>
            </a>
            <button
              type="button"
              className={styles.topLink}
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              aria-label={`${t("language")}: ${locale === "en" ? "العربية" : "English"}`}
              lang={locale === "en" ? "ar" : "en"}
            >
              <AdminIcon name="globe" size={16} />
              <span>{locale === "en" ? "العربية" : "English"}</span>
            </button>
            <div className={styles.account} ref={accountRef}>
              <button
                type="button"
                className={styles.accountButton}
                aria-expanded={accountOpen}
                aria-haspopup="true"
                onClick={() => setAccountOpen((open) => !open)}
              >
                <span className={styles.avatar} aria-hidden="true">
                  {(member?.email[0] ?? "?").toUpperCase()}
                </span>
                <span className={styles.accountText}>
                  <span className={styles.accountEmail}>{mode === "local" ? t("roleDemo") : member?.email}</span>
                  <span className={styles.accountRole}>{t(member?.role === "admin" ? "roleAdmin" : "roleEditor")}</span>
                </span>
              </button>
              {accountOpen && (
                <div className={styles.accountMenu}>
                  <Link href="/admin/account/" className={styles.menuItem} onClick={(e) => (guard(e), setAccountOpen(false))}>
                    <AdminIcon name="account" />
                    {t("navAccount")}
                  </Link>
                  {mode === "supabase" && (
                    <button type="button" className={styles.menuItem} onClick={() => confirmLeave() && signOut()}>
                      <AdminIcon name="logout" />
                      {t("signOut")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <main id="cms-main" tabIndex={-1} className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
