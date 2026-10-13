import type { Metadata } from "next";
import { CatalogScreen } from "@/components/admin/screens/CatalogScreen";

export const metadata: Metadata = { title: "Services" };

export default function ServicesAdminPage() {
  return <CatalogScreen primary="services" secondary={{ catalog: "serviceGroups", tab: "groups" }} />;
}
