"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth";
import { Card } from "@/components/ui/card";
import { LogoHeader } from "@/components/logo-header";
import { LoginForm } from "@/components/login";

// Login page with authentication redirect and modular components
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      const redirectParam = searchParams.get("redirectTo");
      const target =
        (redirectParam && redirectParam.startsWith("/") && redirectParam) ||
        (isAdmin ? "/admin" : "/dashboard");
      router.replace(target);
    }
  }, [isAuthenticated, isAdmin, router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12">
      {/* Logo/Header */}
      <div className="absolute top-4 left-4">
        <LogoHeader />
      </div>
      {/* Login Card */}
      <Card className="w-full max-w-md bg-gray-900 text-white border-gray-800">
        <LoginForm />
      </Card>
    </div>
  );
}
