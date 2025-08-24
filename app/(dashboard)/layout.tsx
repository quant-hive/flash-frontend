"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import ActionBar from "@/components/actionbar";
import { ProtectedRoute } from "@/hooks/use-route-protection";
import Breadcrumbs from "@/components/breadcrumbs";
import Footer from "@/components/footer";
import { DashboardContextProvider } from "@/context/dashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={false}>
      <DashboardContextProvider>
        <div className="flex flex-col h-screen pt-8 px-4 pb-4 w-full">
          <ActionBar />
          <div className="flex flex-row h-full bg-background border-1 rounded-xl overflow-auto">
            <Sidebar />
            {/* Content area: children fills remaining height, footer at bottom */}
            <main className="flex flex-col flex-1 pl-4 pt-6 pr-4 pb-4">
              {/* Stretch area for page content */}
              <div className="flex-1 min-h-0 flex flex-col h-full">
                <Breadcrumbs />
                {children}
              </div>

              <Footer />
            </main>
          </div>
        </div>
      </DashboardContextProvider>
    </ProtectedRoute>
  );
}
