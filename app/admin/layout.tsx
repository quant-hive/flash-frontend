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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={false}>
      <div className="flex flex-col h-screen p-[38px] w-full">
        <ActionBar />
        <div className="flex flex-row h-full bg-background border-1 rounded-xl overflow-auto">
          <Sidebar />
          {/* overflow-auto (for the below div); in case content overflows and scrolling is required */}
          <div className="flex-1 flex flex-col pl-4 pt-7 pr-4 pb-4 overflow-hidden">
            <main className="flex flex-col gap-4 flex-1">
              <Breadcrumbs />

              <div className="flex flex-row items-center gap-2 bg-card border border-yellow-500 px-4 py-2 rounded-lg">
                <OctagonAlert className="text-yellow-500 size-5" />
                <p className="text-sm font-medium text-yellow-500">
                  Admin Area - Restricted Access
                </p>
              </div>

              {children}
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
