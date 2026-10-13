"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/ui/BrandMark";
import { AdminIcon } from "../AdminIcon";
import { useAdmin } from "../AdminProvider";
import { Button, ButtonLink, FieldWrap, Notice, Spinner, TextInput } from "../ui";
import styles from "./login.module.css";

/** Only CMS paths are accepted as a destination after signing in (no open redirects). */
function safeNext(value: string | null): string {
  return value && /^\/admin\/[\w\-/?=&%.]*$/.test(value) && !value.startsWith("/admin/login") ? value : "/admin/";
}

export function LoginScreen() {
  const { t, locale, setLocale, mode, problems, auth, signIn, signOut, sendReset, setPassword } = useAdmin();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [view, setView] = useState<"signIn" | "reset">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPasswordValue] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === "signedIn" && mode === "supabase") router.replace(next);
  }, [auth.status, mode, next, router]);

  const secretKey = problems.includes("secretKey");

  const body = () => {
    if (secretKey) {
      return (
        <Notice tone="danger" icon="lock">
          {t("loginSecretKey")}
        </Notice>
      );
    }
    if (mode === "local") {
      return (
        <>
          <Notice tone="info">{t("loginNotConfigured")}</Notice>
          <ButtonLink href="/admin/" variant="primary" icon="dashboard">
            {t("loginOpenDemo")}
          </ButtonLink>
        </>
      );
    }
    if (auth.status === "loading" || auth.status === "signedIn") return <Spinner label={t("loading")} />;

    if (auth.status === "noAccess") {
      return (
        <>
          <Notice tone="warning">{t("loginNoAccess")}</Notice>
          <p className={styles.muted} dir="ltr">
            {auth.email}
          </p>
          <Button onClick={signOut} icon="logout">
            {t("signOut")}
          </Button>
        </>
      );
    }

    if (auth.status === "setPassword") {
      return (
        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            if (password.length < 10) return setError(t("accountPasswordShort"));
            if (password !== repeat) return setError(t("accountPasswordMismatch"));
            setBusy(true);
            const failure = await setPassword(password);
            setBusy(false);
            if (failure) setError(failure);
          }}
        >
          <h1 className={styles.title}>{t("loginSetPassword")}</h1>
          <p className={styles.muted}>{t("loginSetPasswordIntro")}</p>
          <p className={styles.muted} dir="ltr">
            {auth.email}
          </p>
          <FieldWrap label={t("accountPassword")} htmlFor="login-new" help={t("accountPasswordShort")}>
            <TextInput
              id="login-new"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPasswordValue(e.target.value)}
              required
            />
          </FieldWrap>
          <FieldWrap label={t("accountPasswordConfirm")} htmlFor="login-repeat">
            <TextInput id="login-repeat" type="password" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} required />
          </FieldWrap>
          {error && <Notice tone="danger">{error}</Notice>}
          <Button type="submit" variant="primary" busy={busy}>
            {t("accountPasswordSave")}
          </Button>
        </form>
      );
    }

    if (view === "reset") {
      return (
        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            const failure = await sendReset(email);
            setBusy(false);
            // The same message whether or not the account exists
            if (failure) setError(failure);
            else setNotice(t("loginResetSent"));
          }}
        >
          <h1 className={styles.title}>{t("loginForgot")}</h1>
          <FieldWrap label={t("loginEmail")} htmlFor="login-reset-email">
            <TextInput id="login-reset-email" type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FieldWrap>
          {notice && <Notice tone="success">{notice}</Notice>}
          {error && <Notice tone="danger">{error}</Notice>}
          <Button type="submit" variant="primary" busy={busy}>
            {t("loginResetSend")}
          </Button>
          <button type="button" className={styles.linkButton} onClick={() => (setView("signIn"), setNotice(null), setError(null))}>
            {t("loginBack")}
          </button>
        </form>
      );
    }

    return (
      <form
        className={styles.form}
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError(null);
          const failure = await signIn(email, password);
          setBusy(false);
          if (failure) setError(failure);
        }}
      >
        <h1 className={styles.title}>{t("loginTitle")}</h1>
        <p className={styles.muted}>{t("loginIntro")}</p>
        {params.get("next") && <Notice tone="neutral">{t("loginRequired")}</Notice>}
        <FieldWrap label={t("loginEmail")} htmlFor="login-email">
          <TextInput id="login-email" type="email" dir="ltr" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </FieldWrap>
        <FieldWrap label={t("loginPassword")} htmlFor="login-password">
          <TextInput
            id="login-password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            required
          />
        </FieldWrap>
        {error && <Notice tone="danger">{error}</Notice>}
        <Button type="submit" variant="primary" busy={busy}>
          {busy ? t("loginSigningIn") : t("loginSubmit")}
        </Button>
        <button type="button" className={styles.linkButton} onClick={() => (setView("reset"), setError(null))}>
          {t("loginForgot")}
        </button>
      </form>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <BrandMark idPrefix="cms-login-mark" size={40} />
          <div>
            <p className={styles.brandName}>{t("siteName")}</p>
            <p className={styles.muted}>{t("appName")}</p>
          </div>
          <button
            type="button"
            className={styles.language}
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            lang={locale === "en" ? "ar" : "en"}
            aria-label={`${t("language")}: ${locale === "en" ? "العربية" : "English"}`}
          >
            <AdminIcon name="globe" size={16} />
            {locale === "en" ? "العربية" : "English"}
          </button>
        </div>
        {body()}
      </div>
    </div>
  );
}
