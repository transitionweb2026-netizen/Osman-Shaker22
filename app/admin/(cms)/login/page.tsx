import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/components/admin/screens/LoginScreen";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}
