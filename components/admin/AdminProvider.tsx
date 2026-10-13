"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { messages, translate, type AdminLocale, type MessageKey } from "@/lib/cms/admin-i18n";
import { ADMIN_LOCALE_KEY, configProblems, isSupabaseConfigured, type ConfigProblem } from "@/lib/cms/config";
import type { Label } from "@/lib/cms/schema";
import { LocalStore } from "@/lib/cms/store/local-store";
import { SupabaseStore } from "@/lib/cms/store/supabase-store";
import type { CmsStore } from "@/lib/cms/store/types";
import { getSupabase } from "@/lib/cms/supabase";
import { Button, Dialog, ToastRegion, type Tone, type ToastMessage } from "./ui";

export type Member = { id: string; email: string; role: "admin" | "editor" };

export type AuthState =
  | { status: "loading" }
  | { status: "signedOut" }
  /** Signed in through an invitation or reset link: a password must be chosen. */
  | { status: "setPassword"; email: string }
  | { status: "noAccess"; email: string }
  | { status: "signedIn"; member: Member };

type ConfirmOptions = { message: string; detail?: string; confirmLabel?: string; danger?: boolean };

type AdminContextValue = {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  /** A bilingual label in the interface language. */
  tl: (label: Label | undefined) => string;
  mode: "supabase" | "local";
  problems: ConfigProblem[];
  store: CmsStore | null;
  auth: AuthState;
  member: Member | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  sendReset: (email: string) => Promise<string | null>;
  setPassword: (password: string) => Promise<string | null>;
  toast: (message: string, tone?: Tone) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
  /** Navigates inside the CMS, asking first when there are unsaved changes. */
  navigate: (href: string) => void;
  confirmLeave: () => boolean;
  resetDemo: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside AdminProvider");
  return value;
}

/** The store, once available (it is created in the browser only). */
export function useStore(): CmsStore {
  const { store } = useAdmin();
  if (!store) throw new Error("The CMS store is not ready yet.");
  return store;
}

// ---- interface language: remembered in localStorage (in memory when storage is blocked) ----
let memoryLocale: AdminLocale = "en";
const localeListeners = new Set<() => void>();

function readLocale(): AdminLocale {
  try {
    const stored = window.localStorage.getItem(ADMIN_LOCALE_KEY);
    return stored === "ar" || stored === "en" ? stored : memoryLocale;
  } catch {
    return memoryLocale;
  }
}

function subscribeLocale(listener: () => void) {
  localeListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    localeListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// ---- data store: created once, in the browser only --------------------------------------
let storeInstance: CmsStore | null = null;

function browserStore(): CmsStore {
  storeInstance ??= isSupabaseConfigured ? new SupabaseStore(getSupabase()) : new LocalStore();
  return storeInstance;
}

const noSubscription = () => () => {};
const DEMO_MEMBER: Member = { id: "local-demo", email: "demo@localhost", role: "admin" };

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  // The server render (static export) has no locale or store; the browser fills them in after hydration
  const locale = useSyncExternalStore<AdminLocale>(subscribeLocale, readLocale, () => "en");
  const store = useSyncExternalStore<CmsStore | null>(noSubscription, browserStore, () => null);
  const [remoteAuth, setAuth] = useState<AuthState>({ status: "loading" });
  const auth: AuthState = isSupabaseConfigured ? remoteAuth : store ? { status: "signedIn", member: DEMO_MEMBER } : { status: "loading" };
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);
  const problems = useMemo(() => configProblems(), []);
  const mode = isSupabaseConfigured ? "supabase" : "local";

  // ---- language ----------------------------------------------------------------------
  const setLocale = useCallback((next: AdminLocale) => {
    memoryLocale = next;
    try {
      window.localStorage.setItem(ADMIN_LOCALE_KEY, next);
    } catch {
      /* the choice just isn't remembered */
    }
    localeListeners.forEach((listener) => listener());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const t = useCallback((key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars), [locale]);
  const tl = useCallback((label: Label | undefined) => (label ? (locale === "ar" ? label.ar || label.en : label.en || label.ar) : ""), [locale]);

  // ---- store and session ---------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // Invitation / recovery links carry `type=…` in the URL hash; read it before the client consumes it
    const linkType = new URLSearchParams(window.location.hash.slice(1)).get("type");
    const supabase = getSupabase();
    let needsPassword = linkType === "invite" || linkType === "recovery";

    const resolve = async (user: { id: string; email?: string } | null) => {
      if (!user) return setAuth({ status: "signedOut" });
      const email = user.email ?? "";
      if (needsPassword) return setAuth({ status: "setPassword", email });
      const { data } = await supabase.from("cms_profiles").select("role").eq("user_id", user.id).maybeSingle();
      if (!data?.role) return setAuth({ status: "noAccess", email });
      setAuth({ status: "signedIn", member: { id: user.id, email, role: data.role as Member["role"] } });
    };

    supabase.auth.getSession().then(({ data }) => resolve(data.session?.user ?? null));
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") needsPassword = true;
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "PASSWORD_RECOVERY" || event === "USER_UPDATED") {
        // Defer: Supabase recommends not awaiting other calls inside this callback
        setTimeout(() => resolve(session?.user ?? null), 0);
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured) return null;
      const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
      return error ? translate(locale, "loginFailed") : null;
    },
    [locale],
  );

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) await getSupabase().auth.signOut();
    router.push("/admin/login/");
  }, [router]);

  const sendReset = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) return null;
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/login/`,
    });
    return error ? error.message : null;
  }, []);

  const setPassword = useCallback(async (password: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) return error.message;
    window.history.replaceState(null, "", window.location.pathname);
    const user = data.user;
    const { data: profile } = await supabase.from("cms_profiles").select("role").eq("user_id", user.id).maybeSingle();
    setAuth(
      profile?.role
        ? { status: "signedIn", member: { id: user.id, email: user.email ?? "", role: profile.role as Member["role"] } }
        : { status: "noAccess", email: user.email ?? "" },
    );
    return null;
  }, []);

  // ---- feedback ------------------------------------------------------------------------
  const toast = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-3), { id, message, tone }]);
    window.setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), tone === "danger" ? 9000 : 5000);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => setConfirmState({ ...options, resolve })), []);

  const closeConfirm = (ok: boolean) => {
    confirmState?.resolve(ok);
    setConfirmState(null);
  };

  // ---- unsaved changes ---------------------------------------------------------------
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const confirmLeave = useCallback(() => {
    if (!dirtyRef.current) return true;
    const ok = window.confirm(translate(locale, "unsavedLeave"));
    if (ok) setDirty(false);
    return ok;
  }, [locale]);

  const navigate = useCallback(
    (href: string) => {
      if (confirmLeave()) router.push(href);
    },
    [confirmLeave, router],
  );

  const resetDemo = useCallback(() => {
    if (store instanceof LocalStore) {
      store.reset();
      window.location.reload();
    }
  }, [store]);

  const member = auth.status === "signedIn" ? auth.member : null;

  const value: AdminContextValue = {
    locale,
    setLocale,
    t,
    tl,
    mode,
    problems,
    store,
    auth,
    member,
    isAdmin: member?.role === "admin",
    signIn,
    signOut,
    sendReset,
    setPassword,
    toast,
    confirm,
    dirty,
    setDirty,
    navigate,
    confirmLeave,
    resetDemo,
  };

  return (
    <AdminContext.Provider value={value}>
      <div className="cms">
        {children}
        <ToastRegion toasts={toasts} onDismiss={(id) => setToasts((list) => list.filter((item) => item.id !== id))} dismissLabel={messages[locale].close} />
        <Dialog
          open={Boolean(confirmState)}
          onClose={() => closeConfirm(false)}
          title={confirmState?.message ?? ""}
          size="sm"
          closeLabel={messages[locale].close}
          footer={
            <>
              <Button variant="ghost" onClick={() => closeConfirm(false)}>
                {messages[locale].cancel}
              </Button>
              <Button variant={confirmState?.danger ? "danger" : "primary"} onClick={() => closeConfirm(true)}>
                {confirmState?.confirmLabel ?? messages[locale].confirm}
              </Button>
            </>
          }
        >
          {confirmState?.detail && <p>{confirmState.detail}</p>}
        </Dialog>
      </div>
    </AdminContext.Provider>
  );
}
