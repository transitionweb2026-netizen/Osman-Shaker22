import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";
import "./admin.css";

// The CMS is part of the static export but never indexed (see also robots.txt).
export const metadata: Metadata = {
  title: { default: "CMS — Dr. Othman Shaker", template: "%s — CMS" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#050b19",
  colorScheme: "dark",
};

// Applies the remembered interface language before the first paint.
const localeScript = `try{if(localStorage.getItem("cms-admin-locale")==="ar"){var h=document.documentElement;h.lang="ar";h.dir="rtl"}}catch(e){}`;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
