import type { Metadata } from "next";
import { AccountScreen } from "@/components/admin/screens/AccountScreen";

export const metadata: Metadata = { title: "My account" };

export default function AccountAdminPage() {
  return <AccountScreen />;
}
