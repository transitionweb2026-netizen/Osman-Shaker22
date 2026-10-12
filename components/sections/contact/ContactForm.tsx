"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import buttonStyles from "@/components/ui/Button.module.css";
import type { ContactTopic } from "@/content/types";
import type { ContactPage } from "@/lib/content";
import { whatsappHref } from "@/lib/contact";
import { cx } from "@/lib/cx";
import styles from "./ContactForm.module.css";

type Field = "name" | "phone" | "email" | "message" | "consent";
type Errors = Partial<Record<Field, string>>;

type ContactFormProps = {
  form: ContactPage["form"];
  /** WhatsApp number used when no form endpoint is configured. */
  whatsapp: { e164: string } | null;
  /** NEXT_PUBLIC_CONTACT_FORM_ENDPOINT; `null` hands the message to WhatsApp. */
  endpoint: string | null;
  locale: string;
};

const topics: ContactTopic[] = ["consultation", "secondOpinion", "question", "other"];
const fieldOrder: Field[] = ["name", "phone", "email", "message", "consent"];

function validate(data: FormData, errors: ContactPage["form"]["errors"]): Errors {
  const result: Errors = {};
  const text = (key: string) => String(data.get(key) ?? "").trim();
  if (text("name").length < 2) result.name = errors.required;
  const phone = text("phone");
  if (!phone) result.phone = errors.required;
  else if (!/^\+?[\d\s\-().]{7,20}$/.test(phone) || phone.replace(/\D/g, "").length < 7) result.phone = errors.phone;
  const email = text("email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) result.email = errors.email;
  if (!text("message")) result.message = errors.required;
  if (!data.get("consent")) result.consent = errors.consent;
  return result;
}

/**
 * Static-site contact form. Without an endpoint it opens WhatsApp with the
 * message ready to send (and says so); with an endpoint it posts JSON and
 * reports success only after the service confirms receipt.
 */
export function ContactForm({ form, whatsapp, endpoint, locale }: ContactFormProps) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);
  const mode = endpoint ? form.endpointMode : form.whatsappMode;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const data = new FormData(element);
    if (data.get("company")) return; // honeypot: ignore automated submissions

    const found = validate(data, form.errors);
    setErrors(found);
    const firstInvalid = fieldOrder.find((field) => found[field]);
    if (firstInvalid) {
      setStatus("idle");
      element.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    const entry = {
      name: String(data.get("name")).trim(),
      phone: String(data.get("phone")).trim(),
      email: String(data.get("email") ?? "").trim(),
      topic: form.topics[data.get("topic") as ContactTopic] ?? "",
      message: String(data.get("message")).trim(),
    };

    if (!endpoint) {
      if (!whatsapp) return;
      const { fields } = form;
      const lines = [form.whatsappMode.heading, "", `${fields.name}: ${entry.name}`, `${fields.phone}: ${entry.phone}`];
      if (entry.email) lines.push(`${fields.email}: ${entry.email}`);
      lines.push(`${fields.topic}: ${entry.topic}`, "", entry.message);
      const url = whatsappHref(whatsapp, lines.join("\n"));
      setHandoffUrl(url);
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...entry, locale }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
      element.reset();
    } catch {
      setStatus("failed");
    }
  };

  const describedBy = (field: Field, hint?: boolean) =>
    [hint && `${field}-hint`, errors[field] && `${field}-error`].filter(Boolean).join(" ") || undefined;

  const error = (field: Field) =>
    errors[field] && (
      <p id={`${field}-error`} className={styles.error}>
        {errors[field]}
      </p>
    );

  const requiredMark = (
    <span className={styles.required} aria-hidden="true">
      *
    </span>
  );

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.summary} role="alert">
        {hasErrors && <p>{form.errors.summary}</p>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="contact-name">
            {form.fields.name} {requiredMark}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
          />
          {error("name")}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-phone">
            {form.fields.phone} {requiredMark}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            inputMode="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone", true)}
          />
          <p id="phone-hint" className={styles.hint}>
            {form.fields.phoneHint}
          </p>
          {error("phone")}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="contact-email">{form.fields.email}</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
          />
          {error("email")}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-topic">{form.fields.topic}</label>
          <div className={styles.select}>
            <select id="contact-topic" name="topic" defaultValue="consultation">
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {form.topics[topic]}
                </option>
              ))}
            </select>
            <Icon name="chevron" size={16} className={styles.selectIcon} />
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message">
          {form.fields.message} {requiredMark}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message", true)}
        />
        <p id="message-hint" className={styles.hint}>
          {form.fields.messageHint}
        </p>
        {error("message")}
      </div>

      {/* Honeypot for automated submissions; hidden from people and assistive technology */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.field}>
        <label className={styles.consent}>
          <input
            name="consent"
            type="checkbox"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={describedBy("consent")}
          />
          <span>
            {form.fields.consent} {requiredMark}
          </span>
        </label>
        {error("consent")}
      </div>

      <div className={styles.submitRow}>
        <button
          type="submit"
          className={cx(buttonStyles.button, buttonStyles.primary, buttonStyles.large)}
          disabled={status === "sending"}
        >
          {!endpoint && <Icon name="whatsapp" size={20} />}
          <span>{status === "sending" ? form.endpointMode.sending : mode.submit}</span>
        </button>
        <p className={styles.modeNote}>{mode.note}</p>
      </div>

      <div className={styles.status} role="status">
        {status === "sent" && (
          <p className={styles.success}>
            {mode.success}{" "}
            {handoffUrl && (
              <a href={handoffUrl} target="_blank" rel="noopener noreferrer">
                {form.whatsappMode.submit}
              </a>
            )}
          </p>
        )}
        {status === "failed" && <p className={styles.failure}>{form.errors.failed}</p>}
      </div>
    </form>
  );
}
