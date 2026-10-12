import type { Metadata } from "next";
import { LanguageGate } from "@/components/layout/LanguageGate";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found | الصفحة غير موجودة",
};

/** Bilingual 404 for every unmatched URL (exported as `404.html`). */
export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body>
        <LanguageGate
          message={{
            en: "This page could not be found. Continue to the homepage:",
            ar: "تعذّر العثور على هذه الصفحة. تابع إلى الصفحة الرئيسية:",
          }}
        />
      </body>
    </html>
  );
}
