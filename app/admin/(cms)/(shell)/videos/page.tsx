import type { Metadata } from "next";
import { CatalogScreen } from "@/components/admin/screens/CatalogScreen";

export const metadata: Metadata = { title: "Videos" };

export default function VideosAdminPage() {
  return <CatalogScreen primary="videos" />;
}
