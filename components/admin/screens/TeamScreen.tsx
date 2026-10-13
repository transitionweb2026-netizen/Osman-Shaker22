"use client";

import { useCallback, useState } from "react";
import { formatDateTime } from "@/lib/cms/admin-i18n";
import { getSupabase } from "@/lib/cms/supabase";
import { useAdmin } from "../AdminProvider";
import { Badge, Button, Card, EmptyState, FieldWrap, IconButton, Notice, PageHeader, Select, Skeleton, TextInput } from "../ui";
import { useAsync } from "../useAsync";
import styles from "./screens.module.css";

type Row = { user_id: string; email: string; role: "admin" | "editor"; display_name: string | null; created_at: string };

/**
 * Roles are granted by security-definer database functions that check the
 * caller is an administrator; this screen only calls them.
 */
export function TeamScreen() {
  const { t, locale, mode, isAdmin, member, toast, confirm } = useAdmin();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Row["role"]>("editor");
  const [busy, setBusy] = useState(false);

  const fetchTeam = useCallback(async (): Promise<Row[]> => {
    if (mode !== "supabase" || !isAdmin) return [];
    const { data, error: rpcError } = await getSupabase().rpc("cms_team");
    if (rpcError) throw new Error(rpcError.message);
    return (data ?? []) as Row[];
  }, [mode, isAdmin]);

  const { data: rows, error, reload: load } = useAsync(fetchTeam);

  if (mode !== "supabase") {
    return (
      <div className={styles.stack}>
        <PageHeader title={t("teamTitle")} description={t("teamIntro")} />
        <Notice tone="info">{t("teamUnavailable")}</Notice>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className={styles.stack}>
        <PageHeader title={t("teamTitle")} />
        <Notice tone="warning" icon="lock">
          {t("teamOnlyAdmins")}
        </Notice>
      </div>
    );
  }

  const setMemberRole = async (targetEmail: string, nextRole: Row["role"]) => {
    setBusy(true);
    const { error: rpcError } = await getSupabase().rpc("cms_set_role", { p_email: targetEmail, p_role: nextRole });
    setBusy(false);
    if (rpcError) {
      toast(rpcError.message, "danger");
      return false;
    }
    toast(t("teamAdded"));
    load();
    return true;
  };

  const remove = async (row: Row) => {
    if (!(await confirm({ message: t("teamRemoveConfirm", { email: row.email }), confirmLabel: t("teamRemove"), danger: true }))) return;
    const { error: rpcError } = await getSupabase().rpc("cms_remove_member", { p_user: row.user_id });
    if (rpcError) toast(rpcError.message, "danger");
    else {
      toast(t("teamAdded"));
      load();
    }
  };

  return (
    <div className={styles.stack}>
      <PageHeader title={t("teamTitle")} description={t("teamIntro")} />

      <Card title={t("teamAdd")} description={t("teamRoleHelp")}>
        <form
          className={styles.inlineForm}
          onSubmit={async (event) => {
            event.preventDefault();
            if (email.trim() && (await setMemberRole(email.trim(), role))) setEmail("");
          }}
        >
          <FieldWrap label={t("teamEmail")} htmlFor="team-email">
            <TextInput id="team-email" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
          </FieldWrap>
          <FieldWrap label={t("teamRole")} htmlFor="team-role">
            <Select id="team-role" value={role} onChange={(e) => setRole(e.target.value as Row["role"])}>
              <option value="editor">{t("roleEditor")}</option>
              <option value="admin">{t("roleAdmin")}</option>
            </Select>
          </FieldWrap>
          <Button type="submit" variant="primary" icon="plus" busy={busy}>
            {t("teamAdd")}
          </Button>
        </form>
      </Card>

      <Card title={t("navTeam")}>
        {error && <Notice tone="danger">{error}</Notice>}
        {!rows && !error && <Skeleton lines={3} />}
        {rows && rows.length === 0 && <EmptyState icon="team" title={t("emptyCatalog")} />}
        {rows && rows.length > 0 && (
          <ul className={styles.team}>
            {rows.map((row) => (
              <li key={row.user_id}>
                <span className={styles.teamEmail} dir="ltr">
                  {row.email}
                </span>
                {row.user_id === member?.id && <Badge tone="info">{t("navAccount")}</Badge>}
                <Select
                  aria-label={`${t("teamRole")} — ${row.email}`}
                  value={row.role}
                  onChange={(e) => setMemberRole(row.email, e.target.value as Row["role"])}
                  disabled={busy}
                >
                  <option value="editor">{t("roleEditor")}</option>
                  <option value="admin">{t("roleAdmin")}</option>
                </Select>
                <span className={styles.muted}>{formatDateTime(locale, row.created_at)}</span>
                <IconButton label={t("teamRemove")} icon="trash" onClick={() => remove(row)} disabled={row.user_id === member?.id} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
