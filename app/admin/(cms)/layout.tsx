import { AdminProvider } from "@/components/admin/AdminProvider";

/** Session, data store and interface language for every CMS screen. */
export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>;
}
