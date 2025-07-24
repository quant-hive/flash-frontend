"use client";

import type React from "react";
import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import ActionBar from "@/components/actionbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (prevents flash of dashboard content)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex flex-col h-screen p-[38px] w-full">
      <ActionBar />
      <div className="flex w-full h-full bg-background border-1">
        <Sidebar />
        {/* 
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div> */}
      </div>
    </main>
  );
}
