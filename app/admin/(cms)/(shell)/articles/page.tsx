import type { Metadata } from "next";
import { CatalogScreen } from "@/components/admin/screens/CatalogScreen";

export const metadata: Metadata = { title: "Articles" };

export default function ArticlesAdminPage() {
  return <CatalogScreen primary="articles" />;
}
