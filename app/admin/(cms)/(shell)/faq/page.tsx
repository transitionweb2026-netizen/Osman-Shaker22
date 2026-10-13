import type { Metadata } from "next";
import { CatalogScreen } from "@/components/admin/screens/CatalogScreen";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqAdminPage() {
  return <CatalogScreen primary="faqs" secondary={{ catalog: "faqCategories", tab: "topics" }} />;
}
