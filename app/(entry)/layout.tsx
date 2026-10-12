import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { siteUrl } from "@/lib/site-url";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export const viewport: Viewport = {
  themeColor: "#040d1f",
  colorScheme: "dark",
};

/** Root layout for the language-neutral `/` entry page. */
export default function EntryLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
