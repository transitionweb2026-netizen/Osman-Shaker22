import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

/** Sidebar, top bar and the signed-in check. Screens read their state from the URL, hence Suspense. */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
