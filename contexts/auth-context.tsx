"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  authService,
} from "@/lib/auth-service";
import { LoginCredentials, RegisterData, AuthResponse } from "@/types/auth-service";
import { AuthContextType } from "@/types/auth-context";

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component to wrap the app and provide authentication state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize authentication state from localStorage or fetch user details
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only run in the browser
        if (typeof window === "undefined") {
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem("accessToken");
        if (!token) {
          // No token found, user is not authenticated
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Try to get user data from localStorage
        let userData = null;
        const userJson = localStorage.getItem("user");

        if (userJson) {
          try {
            userData = JSON.parse(userJson);
          } catch (e) {
            // Ignore JSON parse errors
          }
        }

        // If no valid user data in localStorage, fetch from API
        if (!userData) {
          try {
            userData = await authService.getUserDetails();
            if (userData) {
              localStorage.setItem("user", JSON.stringify(userData));
            }
          } catch (error) {
            // Token might be invalid, clear it
            authService.logout();
          }
        }

        setUser(userData);
      } catch (error) {
        // Ignore errors
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function: calls authService and updates user state
  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  };

  // Register function: calls authService and updates user state
  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await authService.register(data);
    setUser(response.user);
    return response;
  };

  // Logout function: clears user state and navigates to login
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push("/login");
  };

  // Value provided to context consumers
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
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
