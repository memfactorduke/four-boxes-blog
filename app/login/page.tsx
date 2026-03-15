import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign In — Second Amendment Online" };

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gradient-to-b from-[#13151a] to-[#0d0f14]">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
