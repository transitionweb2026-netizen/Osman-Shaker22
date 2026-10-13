import type { Metadata } from "next";
import { PagesScreen } from "@/components/admin/screens/PagesScreen";

export const metadata: Metadata = { title: "Pages" };

export default function PagesPage() {
  return <PagesScreen />;
}
