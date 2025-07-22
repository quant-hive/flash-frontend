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
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsAdmin,
  selectAccessToken,
} from "@/lib/store/slices/authSlice";

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component to wrap the app and provide authentication state
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isLoading = useAppSelector(selectIsLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const accessToken = useAppSelector(selectAccessToken);
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

        // If we have a token but no user data, fetch user details
        if (accessToken && !user) {
          try {
            const userData = await ApiService.getCurrentUser();
            if (userData) {
              dispatch(setCredentials({ user: userData, accessToken }));
            }
          } catch (error) {
            // Token might be invalid, clear it
            dispatch(logoutAction());
          }
        } else if (!accessToken) {
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
  }, [dispatch, accessToken, user]);

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
