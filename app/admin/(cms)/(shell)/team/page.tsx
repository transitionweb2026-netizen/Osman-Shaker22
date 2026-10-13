import type { Metadata } from "next";
import { TeamScreen } from "@/components/admin/screens/TeamScreen";

export const metadata: Metadata = { title: "Team" };

export default function TeamAdminPage() {
  return <TeamScreen />;
}
