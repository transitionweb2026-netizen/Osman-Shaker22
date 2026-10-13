import type { Metadata } from "next";
import { CatalogScreen } from "@/components/admin/screens/CatalogScreen";

export const metadata: Metadata = { title: "Certificates" };

export default function CertificatesAdminPage() {
  return <CatalogScreen primary="certificates" />;
}
