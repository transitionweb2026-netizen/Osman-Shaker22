"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cx } from "@/lib/cx";
import type { RecordStatus } from "@/lib/cms/store/types";
import { AdminIcon, type AdminIconName } from "./AdminIcon";
import styles from "./ui.module.css";

// ---- Buttons ------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  icon?: AdminIconName;
  busy?: boolean;
};

export function Button({ variant = "secondary", size = "md", icon, busy, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(styles.button, styles[variant], size === "sm" && styles.small, className)}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...rest}
    >
      {busy ? <span className={styles.spinner} aria-hidden="true" /> : icon && <AdminIcon name={icon} size={size === "sm" ? 16 : 18} />}
      {children && <span>{children}</span>}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "secondary",
  size = "md",
  icon,
  children,
  external,
  className,
  onClick,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  icon?: AdminIconName;
  children: ReactNode;
  external?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const classes = cx(styles.button, styles[variant], size === "sm" && styles.small, className);
  const content = (
    <>
      {icon && <AdminIcon name={icon} size={size === "sm" ? 16 : 18} />}
      <span>{children}</span>
      {external && <AdminIcon name="external" size={14} />}
    </>
  );
  return external ? (
    <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <Link href={href} className={classes} onClick={onClick}>
      {content}
    </Link>
  );
}

export function IconButton({
  label,
  icon,
  className,
  size = 18,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: AdminIconName; size?: number }) {
  return (
    <button type="button" className={cx(styles.iconButton, className)} aria-label={label} title={label} {...rest}>
      <AdminIcon name={icon} size={size} />
    </button>
  );
}

// ---- Status and badges -----------------------------------------------------------

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

export function Badge({ tone = "neutral", children, icon }: { tone?: Tone; children: ReactNode; icon?: AdminIconName }) {
  return (
    <span className={cx(styles.badge, styles[`tone-${tone}`])}>
      {icon && <AdminIcon name={icon} size={13} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, labels }: { status: RecordStatus | "new"; labels: Record<RecordStatus | "new", string> }) {
  const tone: Record<RecordStatus | "new", Tone> = { draft: "warning", published: "success", changed: "info", new: "neutral" };
  return (
    <Badge tone={tone[status]}>
      <span className={styles.dot} aria-hidden="true" />
      {labels[status]}
    </Badge>
  );
}

// ---- Layout ---------------------------------------------------------------------

export function Card({
  title,
  description,
  actions,
  children,
  className,
  as: Tag = "section",
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag className={cx(styles.card, className)}>
      {(title || actions) && (
        <header className={styles.cardHeader}>
          <div>
            {title && <h2 className={styles.cardTitle}>{title}</h2>}
            {description && <p className={styles.cardDescription}>{description}</p>}
          </div>
          {actions && <div className={styles.cardActions}>{actions}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderText}>
        {eyebrow && <div className={styles.pageEyebrow}>{eyebrow}</div>}
        <h1 className={styles.pageTitle}>{title}</h1>
        {description && <p className={styles.pageDescription}>{description}</p>}
        {children}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </header>
  );
}

export function EmptyState({ icon = "info", title, children, action }: { icon?: AdminIconName; title: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>
        <AdminIcon name={icon} size={22} />
      </span>
      <p className={styles.emptyTitle}>{title}</p>
      {children && <div className={styles.emptyText}>{children}</div>}
      {action}
    </div>
  );
}

export function Notice({ tone = "info", children, icon }: { tone?: Tone; children: ReactNode; icon?: AdminIconName }) {
  const fallback: Record<Tone, AdminIconName> = {
    neutral: "info",
    info: "info",
    accent: "info",
    success: "check",
    warning: "warning",
    danger: "warning",
  };
  return (
    <div className={cx(styles.notice, styles[`tone-${tone}`])} role={tone === "danger" ? "alert" : undefined}>
      <AdminIcon name={icon ?? fallback[tone]} size={18} />
      <div>{children}</div>
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} style={{ inlineSize: `${90 - i * 12}%` }} />
      ))}
    </div>
  );
}

// ---- Form controls ---------------------------------------------------------------

export function FieldWrap({
  label,
  help,
  error,
  required,
  htmlFor,
  children,
  aside,
  requiredLabel,
  className,
}: {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  aside?: ReactNode;
  requiredLabel?: string;
  className?: string;
}) {
  return (
    <div className={cx(styles.field, className)}>
      <div className={styles.fieldTop}>
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required && (
            <span className={styles.requiredMark} aria-label={requiredLabel} title={requiredLabel}>
              *
            </span>
          )}
        </label>
        {aside}
      </div>
      {children}
      {help && <p className={styles.help}>{help}</p>}
      {error && (
        <p className={styles.error} role="alert">
          <AdminIcon name="warning" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ invalid, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={cx(styles.input, invalid && styles.invalid, className)} aria-invalid={invalid || undefined} {...rest} />;
}

export function TextArea({ invalid, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea className={cx(styles.input, styles.textarea, invalid && styles.invalid, className)} aria-invalid={invalid || undefined} {...rest} />
  );
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={styles.selectWrap}>
      <select className={cx(styles.input, styles.select, className)} {...rest}>
        {children}
      </select>
    </span>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className={styles.switchRow}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={styles.switch}
        onClick={() => onChange(!checked)}
        disabled={disabled}
      >
        <span className={styles.switchThumb} />
      </button>
      <label htmlFor={id} className={styles.switchLabel}>
        {label}
        {description && <span className={styles.switchDescription}>{description}</span>}
      </label>
    </div>
  );
}

export function Checkbox({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; disabled?: boolean }) {
  return (
    <label className={styles.checkbox}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      <span>{label}</span>
    </label>
  );
}

// ---- Navigation helpers ----------------------------------------------------------

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { value: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          className={styles.tab}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          {item.count !== undefined && <span className={styles.tabCount}>{item.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  pages,
  onPage,
  labels,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
  labels: { previous: string; next: string; pageOf: string };
}) {
  if (pages <= 1) return null;
  return (
    <nav className={styles.pagination} aria-label={labels.pageOf}>
      <Button size="sm" variant="ghost" onClick={() => onPage(page - 1)} disabled={page <= 1}>
        {labels.previous}
      </Button>
      <span aria-live="polite">{labels.pageOf}</span>
      <Button size="sm" variant="ghost" onClick={() => onPage(page + 1)} disabled={page >= pages}>
        {labels.next}
      </Button>
    </nav>
  );
}

export function SearchInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div className={styles.search}>
      <AdminIcon name="search" size={16} />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label} />
    </div>
  );
}

// ---- Dialog ---------------------------------------------------------------------

/** Native modal dialog: focus moves in, Escape closes, focus returns to the opener. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeLabel: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      if (opener.current instanceof HTMLElement) opener.current.focus({ preventScroll: true });
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  return (
    <dialog
      ref={ref}
      className={cx(styles.dialog, styles[`dialog-${size}`])}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open && (
        <div className={styles.dialogInner}>
          <header className={styles.dialogHeader}>
            <div>
              <h2 id={titleId} className={styles.dialogTitle}>
                {title}
              </h2>
              {description && <p className={styles.cardDescription}>{description}</p>}
            </div>
            <IconButton label={closeLabel} icon="close" onClick={onClose} />
          </header>
          <div className={styles.dialogBody}>{children}</div>
          {footer && <footer className={styles.dialogFooter}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

// ---- Toasts -----------------------------------------------------------------------

export type ToastMessage = { id: number; message: string; tone: Tone };

export function ToastRegion({ toasts, onDismiss, dismissLabel }: { toasts: ToastMessage[]; onDismiss: (id: number) => void; dismissLabel: string }) {
  return (
    <div className={styles.toasts} aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div key={toast.id} className={cx(styles.toast, styles[`tone-${toast.tone}`])} role={toast.tone === "danger" ? "alert" : "status"}>
          <AdminIcon name={toast.tone === "danger" ? "warning" : toast.tone === "success" ? "check" : "info"} size={18} />
          <span>{toast.message}</span>
          <IconButton label={dismissLabel} icon="close" size={16} onClick={() => onDismiss(toast.id)} />
        </div>
      ))}
    </div>
  );
}
