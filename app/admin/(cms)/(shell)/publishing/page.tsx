import type { Metadata } from "next";
import { PublishingScreen } from "@/components/admin/screens/PublishingScreen";

export const metadata: Metadata = { title: "Publishing" };

export default function PublishingAdminPage() {
  return <PublishingScreen />;
}
