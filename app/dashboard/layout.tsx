"use client";

import React from "react";
import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { useAuth } from "@/context/auth";
import { usePathname, useRouter } from "next/navigation";
import ActionBar from "@/components/actionbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const breadcrumbs = pathname
    .split("/")
    .slice(1)
    .map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: `/${segment}`,
    }));

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
      <div className="flex flex-row h-full bg-background border-1 rounded-xl overflow-auto">
        <Sidebar />
        {/* overflow-auto (for the belowd div); incase content overflows and scrolling is required */}
        <div className="flex flex-col flex-1 pl-4 pt-7 pr-4 pb-4 overflow-auto">
          <div className="flex flex-col flex-1">
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
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href={breadcrumb.href}
                        className={`${
                          index === breadcrumbs.length - 1 && "text-foreground"
                        }`}
                      >
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator>{"/"}</BreadcrumbSeparator>
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            {children}
          </div>

          <footer className="mt-4 mr-4">
            <nav className="flex flex-row justify-end">
              <ul className="flex flex-row gap-6 text-secondary text-[12px] font-light">
                <li className="inline-block">
                  <Link href="#" className="hover:text-primary">
                    Cookies Policy
                  </Link>
                </li>
                <li className="inline-block">
                  <Link href="#" className="hover:text-primary">
                    License
                  </Link>
                </li>
                <li className="inline-block">
                  <Link href="#" className="hover:text-primary">
                    Terms of Use
                  </Link>
                </li>
                <li className="inline-block">
                  <Link href="#" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </nav>
          </footer>
        </div>
      </div>
    </main>
  );
}
