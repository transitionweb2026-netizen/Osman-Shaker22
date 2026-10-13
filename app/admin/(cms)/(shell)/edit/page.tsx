import type { Metadata } from "next";
import { EditScreen } from "@/components/admin/screens/EditScreen";

export const metadata: Metadata = { title: "Edit" };

export default function EditPage() {
  return <EditScreen />;
}
