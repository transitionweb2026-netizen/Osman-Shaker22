import type { Metadata } from "next";
import { SeoScreen } from "@/components/admin/screens/SeoScreen";

export const metadata: Metadata = { title: "Search & sharing" };

export default function SeoAdminPage() {
  return <SeoScreen />;
}
