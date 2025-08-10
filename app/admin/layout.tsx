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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const breadcrumbs = pathname
    .split("/")
    .slice(1)
    .map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: `/${segment}`,
    }));

  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <main className="flex flex-col h-screen p-[38px] w-full">
        <ActionBar />
        <div className="flex flex-row h-full bg-background border-1 rounded-xl overflow-auto">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex flex-col gap-4 flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
              <Breadcrumb>
                <BreadcrumbList className="gap-1 sm:gap-1 font-light text-muted-text">
                  <BreadcrumbItem>
                    <BreadcrumbLink href={"https://www.quanthive.in/"}>
                      QuantHive
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>{"/"}</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Flash</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>{"/"}</BreadcrumbSeparator>
                  {breadcrumbs.map((breadcrumb, index) => (
                    <Fragment key={index}>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          href={breadcrumb.href}
                          className={`${
                            index === breadcrumbs.length - 1 &&
                            "text-foreground"
                          }`}
                        >
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator>{"/"}</BreadcrumbSeparator>
                      )}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>

              <div className="bg-card border border-card-border mb-4 p-4 rounded-lg">
                <p className="text-sm font-medium">
                  Admin Area - Restricted Access
                </p>
              </div>
              {children}
            </main>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
