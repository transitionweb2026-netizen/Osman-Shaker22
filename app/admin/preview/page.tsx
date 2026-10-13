import type { Metadata } from "next";
import { PreviewRenderer } from "@/components/admin/preview/PreviewRenderer";

export const metadata: Metadata = { title: "Preview" };

/** Embedded by the CMS editors; renders drafts it receives with the website's components. */
export default function PreviewPage() {
  return <PreviewRenderer />;
}
