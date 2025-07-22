"use client";

import type React from "react";
import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { TopNav } from "@/components/top-nav/top-nav";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  // Enhanced client-side protection for admin routes
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not logged in, redirect to login
        router.push("/login");
      } else if (!isAdmin) {
        // Logged in but not admin, redirect to dashboard
        router.push("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Don't render anything until we're sure user is authenticated and admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="bg-primary/10 mb-4 p-4 rounded-lg">
            <p className="text-sm font-medium">
              Admin Area - Restricted Access
            </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
