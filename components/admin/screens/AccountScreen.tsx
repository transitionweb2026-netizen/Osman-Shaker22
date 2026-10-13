"use client";

import { useState } from "react";
import type { AdminLocale } from "@/lib/cms/admin-i18n";
import { useAdmin } from "../AdminProvider";
import { Button, Card, FieldWrap, Notice, PageHeader, Tabs, TextInput } from "../ui";
import styles from "./screens.module.css";

const MIN_PASSWORD = 10;

export function AccountScreen() {
  const { t, mode, member, locale, setLocale, setPassword, toast } = useAdmin();
  const [password, setPasswordValue] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (password.length < MIN_PASSWORD) return setError(t("accountPasswordShort"));
    if (password !== repeat) return setError(t("accountPasswordMismatch"));
    setBusy(true);
    const failure = await setPassword(password);
    setBusy(false);
    if (failure) setError(failure);
    else {
      setPasswordValue("");
      setRepeat("");
      toast(t("accountPasswordSaved"));
    }
  };

  return (
    <div className={styles.stack}>
      <PageHeader title={t("accountTitle")} />
      <div className={styles.columns}>
        <Card>
          <dl className={styles.facts}>
            <div>
              <dt>{t("accountEmail")}</dt>
              <dd dir="ltr">{mode === "local" ? t("roleDemo") : member?.email}</dd>
            </div>
            <div>
              <dt>{t("accountRole")}</dt>
              <dd>{t(member?.role === "admin" ? "roleAdmin" : "roleEditor")}</dd>
            </div>
          </dl>
        </Card>
        <Card title={t("language")}>
          <Tabs<AdminLocale>
            label={t("language")}
            value={locale}
            onChange={setLocale}
            items={[
              { value: "en", label: "English" },
              { value: "ar", label: "العربية" },
            ]}
          />
        </Card>
      </div>

      {mode === "supabase" && (
        <Card title={t("accountPasswordSave")}>
          <form
            className={styles.formGrid}
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <FieldWrap label={t("accountPassword")} htmlFor="account-password" help={t("accountPasswordShort")}>
              <TextInput
                id="account-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
                minLength={MIN_PASSWORD}
                required
              />
            </FieldWrap>
            <FieldWrap label={t("accountPasswordConfirm")} htmlFor="account-repeat">
              <TextInput
                id="account-repeat"
                type="password"
                autoComplete="new-password"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                required
              />
            </FieldWrap>
            {error && <Notice tone="danger">{error}</Notice>}
            <div>
              <Button type="submit" variant="primary" busy={busy}>
                {t("accountPasswordSave")}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
