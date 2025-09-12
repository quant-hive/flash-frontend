# Route Protection System Documentation

This document provides comprehensive documentation for the route protection mechanisms in the Flash Frontend application, covering authentication guards, role-based access, and navigation management.

## Table of Contents

- [Route Protection System Documentation](#route-protection-system-documentation)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Route Protection Hook](#route-protection-hook)
  - [Protected Route Component](#protected-route-component)
  - [Authentication Guards](#authentication-guards)
  - [Role-Based Access Control](#role-based-access-control)
  - [Redirect Management](#redirect-management)
  - [Token Validation](#token-validation)
  - [Implementation Patterns](#implementation-patterns)
  - [Usage Examples](#usage-examples)

## Architecture Overview

The route protection system provides comprehensive access control with multiple layers:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Route Access  │────│  Auth Context   │────│  Token Validation│
│   Check         │    │  State          │    │  (Backend)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐               │
         │              │  Redux Store    │               │
         │              │  (User Data)    │               │
         │              └─────────────────┘               │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Next.js Router │
                    │  (Navigation)   │
                    └─────────────────┘
```

## Route Protection Hook

### Core Hook Implementation

**Location**: `hooks/use-route-protection.tsx`

The main hook that handles route protection logic:

```typescript
interface UseRouteProtectionOptions {
  requireAuth?: boolean; // Require authentication
  requireAdmin?: boolean; // Require admin role
  redirectTo?: string; // Redirect destination for unauthorized users
  skipRedirect?: boolean; // Skip automatic redirects
}

export function useRouteProtection(options: UseRouteProtectionOptions = {}) {
  const {
    requireAuth = true,
    requireAdmin = false,
    redirectTo = "/login",
    skipRedirect = false,
  } = options;

  const { isLoading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Don't check while still loading
      if (isLoading) return;

      // Get redirect parameter from URL
      const redirectParam = searchParams.get("redirectTo");

      // Check if authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        if (!skipRedirect) {
          console.log(
            "🚫 Route protection: User not authenticated, redirecting to login"
          );

          // Add current page as redirect parameter
          const current = `${pathname}${window.location.search}${window.location.hash}`;
          const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(
            current
          )}`;
          router.push(loginUrl);
        }
        return;
      }

      // Check if admin is required but user is not admin
      if (requireAdmin && isAuthenticated && !isAdmin) {
        if (!skipRedirect) {
          console.log(
            "🚫 Route protection: User not admin, redirecting to dashboard"
          );
          router.push("/dashboard");
        }
        return;
      }

      // If user is authenticated, validate the token
      if (isAuthenticated) {
        try {
          const isTokenValid = await validateToken();
          if (!isTokenValid) {
            console.log(
              "🚫 Route protection: Token validation failed, logging out"
            );
            logout();

            // Add current page as redirect parameter when token expires
            const current = `${pathname}${window.location.search}${window.location.hash}`;
            const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(
              current
            )}`;
            router.push(loginUrl);
            return;
          }
        } catch (error) {
          console.log(
            "🚫 Route protection: Token validation error, logging out"
          );
          logout();

          // Add current page as redirect parameter when token validation fails
          const current = `${pathname}${window.location.search}${window.location.hash}`;
          const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(
            current
          )}`;
          router.push(loginUrl);
          return;
        }
      }

      // Handle successful authentication - redirect to intended page
      const loginPath = redirectTo.split("?")[0];
      if (isAuthenticated && pathname === loginPath) {
        const targetRedirect =
          (redirectParam && redirectParam.startsWith("/") && redirectParam) ||
          (isAdmin ? "/admin" : "/dashboard");
        console.log(
          `✅ Route protection: User authenticated, redirecting to ${targetRedirect}`
        );
        router.replace(targetRedirect);
      }
    };

    checkAuthAndRedirect();
  }, [
    isLoading,
    isAuthenticated,
    isAdmin,
    requireAuth,
    requireAdmin,
    redirectTo,
    skipRedirect,
    router,
    logout,
    searchParams,
    pathname,
  ]);

  return {
    isLoading,
    isAuthenticated,
    isAdmin,
    canAccess:
      !isLoading &&
      (!requireAuth ||
        (requireAuth && isAuthenticated && (!requireAdmin || isAdmin))),
  };
}
```

## Protected Route Component

### Component Wrapper

Component-based route protection for easier usage:

```typescript
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
  fallbackComponent,
}: ProtectedRouteProps) {
  const { isLoading, canAccess } = useRouteProtection({
    requireAuth,
    requireAdmin,
    redirectTo,
  });

  // Show loading state
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    );
  }

  // Show fallback or redirect (redirect happens automatically in hook)
  if (!canAccess) {
    return fallbackComponent || null;
  }

  // Render protected content
  return <>{children}</>;
}
```

## Authentication Guards

### Page-Level Protection

Protecting entire pages using layout or page components:

```typescript
// In a Next.js page component
export default function AdminDashboard() {
  const { isLoading, canAccess } = useRouteProtection({
    requireAuth: true,
    requireAdmin: true,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!canAccess) {
    return null; // Will redirect automatically
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}
```

### Layout-Level Protection

Protecting entire sections using layout components:

```typescript
// In app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="dashboard-layout">
        <Sidebar />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
```

### Component-Level Protection

Protecting specific components within a page:

```typescript
function UserProfile() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent>
          <p>Please log in to view your profile.</p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome, {user.name}!</p>
      </CardContent>
    </Card>
  );
}
```

## Role-Based Access Control

### Admin-Only Routes

```typescript
// Admin dashboard with role checking
function AdminPanel() {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      // Redirect non-admin users
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoginRequired />;
  if (!isAdmin) return null; // Will redirect

  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin-specific content */}
    </div>
  );
}
```

### Feature-Based Access Control

```typescript
// Component with feature-based access
function AdvancedAnalytics() {
  const { user } = useAuth();
  const hasAdvancedAccess = user?.plan === "premium" || user?.role === "admin";

  if (!hasAdvancedAccess) {
    return (
      <Card>
        <CardContent>
          <p>Upgrade to Premium for advanced analytics.</p>
          <Button>Upgrade Now</Button>
        </CardContent>
      </Card>
    );
  }

  return <div>{/* Advanced analytics content */}</div>;
}
```

### Conditional Navigation

```typescript
// Navigation with role-based items
function NavigationMenu() {
  const { isAuthenticated, isAdmin } = useAuth();

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", requireAuth: true },
    { label: "Backtests", href: "/backtest", requireAuth: true },
    { label: "Analytics", href: "/analytics", requireAuth: true },
    { label: "Admin", href: "/admin", requireAuth: true, requireAdmin: true },
  ];

  const visibleItems = menuItems.filter((item) => {
    if (item.requireAuth && !isAuthenticated) return false;
    if (item.requireAdmin && !isAdmin) return false;
    return true;
  });

  return (
    <nav>
      {visibleItems.map((item) => (
        <NavLink key={item.href} href={item.href}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

## Redirect Management

### Preserving Intended Destination

The system automatically preserves the user's intended destination:

```typescript
// When redirecting to login, preserve the current page
const current = `${pathname}${window.location.search}${window.location.hash}`;
const loginUrl = `${redirectTo}?redirectTo=${encodeURIComponent(current)}`;
router.push(loginUrl);
```

### Post-Login Redirects

After successful authentication, redirect to the intended page:

```typescript
// In auth context login function
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await ApiService.login(credentials);
  dispatch(
    setCredentials({
      user: response.user,
      accessToken: response.access_token,
    })
  );

  // Handle redirect after login
  const redirectParam = searchParams?.get("redirectTo");
  const target =
    (redirectParam && redirectParam.startsWith("/") && redirectParam) ||
    (response.user?.role === "admin" ? "/admin" : "/dashboard");
  router.replace(target);

  return response;
};
```

### Conditional Redirects

Smart redirects based on user state:

```typescript
// In login page
export default function LoginPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = isAdmin ? "/admin" : "/dashboard";
      router.push(redirectTo);
    }
  }, [isAuthenticated, isAdmin, router]);

  return <LoginForm />;
}
```

## Token Validation

### Proactive Token Validation

Validate tokens before accessing protected resources:

```typescript
// Token validation function
export const validateToken = async (): Promise<boolean> => {
  const token = getAccessTokenFromCookie();
  if (!token) {
    console.log("🚫 No access token found");
    return false;
  }

  try {
    // Make a lightweight request to validate token
    const response = await axiosInstance.get("/api/auth/me");
    console.log("✅ Token is valid");
    return true;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log("🚫 Token validation failed - 401 Unauthorized");
      removeAccessTokenCookie();
      return false;
    }
    // For other errors, assume token might still be valid
    console.log(
      "⚠️ Token validation request failed, but token might still be valid"
    );
    return true;
  }
};
```

### Periodic Token Validation

Automatically validate tokens at regular intervals:

```typescript
// In auth context
useEffect(() => {
  if (!isAuthenticated || typeof window === "undefined") return;

  const validateTokenPeriodically = async () => {
    const { validateToken } = await import("@/lib/axios");
    const isValid = await validateToken();

    if (!isValid) {
      console.log("🚫 Periodic token validation failed - logging out");
      dispatch(logoutAction());
      router.push("/login");
    }
  };

  // Check immediately
  validateTokenPeriodically();

  // Set up periodic checks every 5 minutes
  const interval = setInterval(validateTokenPeriodically, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, [isAuthenticated, dispatch, router]);
```

## Implementation Patterns

### Higher-Order Component Pattern

```typescript
// HOC for route protection
function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: UseRouteProtectionOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isLoading, canAccess } = useRouteProtection(options);

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (!canAccess) {
      return null; // Will redirect automatically
    }

    return <Component {...props} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard, { requireAuth: true });
const AdminOnlyPanel = withAuth(AdminPanel, {
  requireAuth: true,
  requireAdmin: true,
});
```

### Compound Component Pattern

```typescript
// Compound component for flexible protection
function RouteGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

RouteGuard.RequireAuth = function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : null;
};

RouteGuard.RequireAdmin = function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : null;
};

// Usage
<RouteGuard>
  <RouteGuard.RequireAuth>
    <Dashboard />
    <RouteGuard.RequireAdmin>
      <AdminPanel />
    </RouteGuard.RequireAdmin>
  </RouteGuard.RequireAuth>
</RouteGuard>;
```

### Custom Hook Patterns

```typescript
// Specialized hooks for common patterns
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

export function useRequireAdmin() {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [isAdmin, isAuthenticated, isLoading, router]);

  return { isAdmin, isAuthenticated, isLoading };
}
```

## Usage Examples

### Basic Page Protection

```typescript
// Protect a dashboard page
export default function DashboardPage() {
  useRouteProtection({ requireAuth: true });

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Admin-Only Page

```typescript
// Admin-only page
export default function AdminPage() {
  const { isLoading, canAccess } = useRouteProtection({
    requireAuth: true,
    requireAdmin: true,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!canAccess) {
    return null; // Will redirect automatically
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}
```

### Component Wrapper

```typescript
// Using ProtectedRoute component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
```

### Conditional Rendering

```typescript
// Conditional rendering based on auth state
function Navigation() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <nav>
      <Link href="/">Home</Link>
      {isAuthenticated ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/profile">Profile</Link>
          {isAdmin && <Link href="/admin">Admin</Link>}
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
```

This route protection system provides comprehensive security with excellent user experience, automatic redirect management, and flexible implementation patterns for various access control scenarios.
