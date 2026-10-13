import type { Metadata } from "next";
import { CatalogScreen } from "@/components/admin/screens/CatalogScreen";

export const metadata: Metadata = { title: "Reviews" };

export default function ReviewsAdminPage() {
  return <CatalogScreen primary="reviews" />;
}
