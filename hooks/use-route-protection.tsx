import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { validateToken } from "@/lib/axios";

interface UseRouteProtectionOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  skipRedirect?: boolean;
}

/**
 * Hook for protecting routes and handling authentication redirects
 * Ensures users are redirected to login when tokens expire or are invalid
 */
export function useRouteProtection(options: UseRouteProtectionOptions = {}) {
  const {
    requireAuth = true,
    requireAdmin = false,
    redirectTo = "/login",
    skipRedirect = false,
  } = options;
  
  const { isLoading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while still loading
    if (isLoading) return;

    const checkAuthAndRedirect = async () => {
      // If auth is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        if (!skipRedirect) {
          console.log("🚫 Route protection: User not authenticated, redirecting to login");
          router.push(redirectTo);
        }
        return;
      }

      // If admin is required but user is not admin
      if (requireAdmin && isAuthenticated && !isAdmin) {
        if (!skipRedirect) {
          console.log("🚫 Route protection: User not admin, redirecting to dashboard");
          router.push("/dashboard");
        }
        return;
      }

      // If user is authenticated, validate the token
      if (isAuthenticated) {
        try {
          const isTokenValid = await validateToken();
          if (!isTokenValid) {
            console.log("🚫 Route protection: Token validation failed, logging out");
            logout();
            return;
          }
        } catch (error) {
          console.log("🚫 Route protection: Token validation error, logging out");
          logout();
          return;
        }
      }
    };

    checkAuthAndRedirect();
  }, [isLoading, isAuthenticated, isAdmin, requireAuth, requireAdmin, redirectTo, skipRedirect, router, logout]);

  return {
    isLoading,
    isAuthenticated,
    isAdmin,
    canAccess: !isLoading && (
      !requireAuth || 
      (requireAuth && isAuthenticated && (!requireAdmin || isAdmin))
    )
  };
}

/**
 * Component wrapper for route protection
 * Renders loading state, handles redirects, and only shows children when access is allowed
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = "/login",
  loadingComponent,
  fallbackComponent
}: ProtectedRouteProps) {
  const { isLoading, canAccess } = useRouteProtection({
    requireAuth,
    requireAdmin,
    redirectTo,
  });

  // Show loading state
  if (isLoading) {
    return loadingComponent || (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Show fallback if access is denied
  if (!canAccess) {
    return fallbackComponent || null;
  }

  // Render children if access is allowed
  return <>{children}</>;
}
