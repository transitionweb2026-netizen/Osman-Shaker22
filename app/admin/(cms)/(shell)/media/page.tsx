import type { Metadata } from "next";
import { MediaScreen } from "@/components/admin/screens/MediaScreen";

export const metadata: Metadata = { title: "Media library" };

export default function MediaAdminPage() {
  return <MediaScreen />;
}
