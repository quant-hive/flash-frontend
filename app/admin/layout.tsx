"use client";

import type React from "react";
import { Fragment } from "react";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from "next/navigation";
import ActionBar from "@/components/actionbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProtectedRoute } from "@/hooks/use-route-protection";
import { OctagonAlert } from "lucide-react";
import Breadcrumbs from "@/components/breadcrumbs";
import Link from "next/link";
import Footer from "@/components/footer";
import { DashboardContextProvider } from "@/context/dashboard";

export default function AdminLayout({
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

                <div className="flex flex-row items-center mt-4 gap-2 bg-card border border-yellow-500 px-4 py-2 rounded-lg">
                  <OctagonAlert className="text-yellow-500 size-5" />
                  <p className="text-sm font-medium text-yellow-500">
                    Admin Area - Restricted Access
                  </p>
                </div>

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
