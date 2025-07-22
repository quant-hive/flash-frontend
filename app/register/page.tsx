"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { LogoHeader } from "@/components/logo-header";
import { RegisterForm } from "@/components/register/register-form";

// Register page with authentication redirect and modular components
export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isAdmin, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12">
      {/* Logo/Header */}
      <div className="absolute top-4 left-4">
        <LogoHeader />
      </div>
      {/* Register Card */}
      <Card className="w-full max-w-md bg-gray-900 text-white border-gray-800">
        <RegisterForm />
      </Card>
    </div>
  );
} 
