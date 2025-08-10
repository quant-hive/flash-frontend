"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ApiService } from "@/lib/api-service";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "@/types/auth-service";
import { AuthContextType } from "@/types/auth-context";
import { useDispatch, useSelector } from "@/lib/store";
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsAdmin,
  selectAccessToken,
  initializeFromCookie,
} from "@/lib/store/slices/auth";

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component to wrap the app and provide authentication state
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectIsLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const accessToken = useSelector(selectAccessToken);
  const router = useRouter();

  // Initialize authentication state from Redux store or fetch user details
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only run in the browser
        if (typeof window === "undefined") {
          dispatch(setLoading(false));
          return;
        }

        // First, try to initialize access token from cookies
        dispatch(initializeFromCookie());

        // Small delay to ensure the token is set before checking
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Get the updated token after initialization
        const currentToken =
          accessToken ||
          (typeof window !== "undefined"
            ? require("@/lib/axios").getAccessTokenFromCookie()
            : null);

        // If we have a token but no user data, fetch user details
        if (currentToken && !user) {
          try {
            const userData = await ApiService.getCurrentUser();
            if (userData) {
              dispatch(
                setCredentials({ user: userData, accessToken: currentToken })
              );
            }
          } catch (error) {
            // Token might be invalid, clear it
            console.log("🚫 Failed to fetch user data - logging out");
            dispatch(logoutAction());
            router.push("/login");
          }
        } else if (!currentToken) {
          // No token found, user is not authenticated
          dispatch(setLoading(false));
        } else {
          // We have both token and user data
          dispatch(setLoading(false));
        }
      } catch (error) {
        // Ignore errors
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch, accessToken, user, router]);

  // Periodic token validation - check every 5 minutes if user is authenticated
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

  // Login function: calls ApiService and updates Redux state
  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const response = await ApiService.login(credentials);
    dispatch(
      setCredentials({
        user: response.user,
        accessToken: response.access_token,
      })
    );
    return response;
  };

  // Register function: calls ApiService and updates Redux state
  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await ApiService.register(data);
    dispatch(
      setCredentials({
        user: response.user,
        accessToken: response.access_token,
      })
    );
    return response;
  };

  // Logout function: clears Redux state and navigates to login
  const logout = () => {
    dispatch(logoutAction());
    router.push("/login");
  };

  // Auto-logout warning before token expires (at 13 minutes, 2 minutes before expiry)
  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;

    const EXPIRES_MINUTES = 15; // Cookie expiry time in minutes
    const warningTime = (EXPIRES_MINUTES - 2) * 60 * 1000; // 13 minutes in ms

    const timeoutId = setTimeout(() => {
      const shouldContinue = window.confirm(
        "Your session will expire in 2 minutes. Click OK to continue your session or Cancel to logout now."
      );

      if (!shouldContinue) {
        logout();
      }
    }, warningTime);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, logout]);

  // Value provided to context consumers
  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
