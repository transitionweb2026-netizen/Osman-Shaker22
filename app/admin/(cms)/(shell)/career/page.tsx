import type { Metadata } from "next";
import { CatalogScreen } from "@/components/admin/screens/CatalogScreen";

export const metadata: Metadata = { title: "Career timeline" };

export default function CareerAdminPage() {
  return <CatalogScreen primary="careerMilestones" />;
}
